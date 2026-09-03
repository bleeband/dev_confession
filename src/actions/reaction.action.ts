"use server"

import prisma from "@/app/lib/prisma";
import { Emoji } from "@/generated/prisma/enums";
import { getCurrentUser } from "./user.action";
import { revalidatePath } from "next/cache";

export async function reagir(confessionId: string, emoji: Emoji) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Vous devez être connecté pour réagir");
    }

    // $transaction s'assure que la suppression et la création de réactions sont atomiques
    const result = await prisma.$transaction(async (tx) => {

        const existingReaction = await tx.reaction.findUnique({
            where:{
                confessionId_emoji_userId: {
                    userId: user.id,
                    confessionId,
                    emoji,
                }
            }
        });

        if (existingReaction) {
            await tx.reaction.delete({
                where: {
                    id: existingReaction.id
                }   
            });
            throw new Error("Vous avez déjà réagi à cette confession");    
            return { action: "Supprimer la réaction" };
        }

        if (!existingReaction) {
            await tx.reaction.create({
                data: {
                    confessionId,
                    emoji,
                    userId: user.id,
                },
            });
            return { action: "Ajouter la réaction" };
        }
    });
    
    revalidatePath("/");
    revalidatePath("/confessions");

    return result;
}

export async function getReactionCounts(confessionId: string) {
    const counts = await prisma.reaction.groupBy({
        by: ["emoji"],
        where: {
            confessionId,
        },
        _count: {
            emoji: true,
        },
    });

    return counts.reduce((acc, curr) => {
        acc[curr.emoji] = curr._count.emoji;
        return acc;
    }, {} as Record<string, number>);
}