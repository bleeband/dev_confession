"use server"

import prisma from "@/app/lib/prisma";
import { getCurrentUser, syncUser } from "./user.action";
import { Category } from "@/generated/prisma/browser";
import { revalidatePath } from "next/cache";

export async function createConfession(formData: FormData) {

    const user = await getCurrentUser();

    if (!user) {
        await syncUser();
        const newUser = await getCurrentUser();
        if (!newUser) {
            throw new Error("Utilisateur non authentifié");
        }
    }

    const currentUser = user || (await getCurrentUser());

    const content = formData.get("content") as string;
    const isAnonymous = formData.get("isAnonymous") === "true";
    const category = formData.get("category") as Category;

    if (!content || content.trim().length < 10 ) {
        throw new Error("Le contenu de la confession est trop court. Il doit contenir au moins 10 caractères.");
    }

    if (content.length > 500) {
        throw new Error("Le contenu de la confession est trop long. Il ne doit pas dépasser 500 caractères.");
    }

    await prisma.confession.create({
        data: {
            content : content,
            isAnonymous : isAnonymous,
            category : category,
            authorId : currentUser!.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/confessions");

}

// localhost:3000/confessions?page=1&limit=5&category=LOVE
export async function getConfessions(page: number = 1, limit: number = 5, category?: Category) {
    const skip = (page - 1) * limit;

    const whereClause = category ? { category } : {};

    const [confessions, totalConfessions] = await Promise.all(
        [
            prisma.confession.findMany({
                where: whereClause,
                include : { // Jointure pour récupérer les informations de l'auteur et des réactions
                    author : {
                        select : {
                           username : true,
                           imageUrl : true,
                        },
                    },
                    reactions : {
                        select : {
                            emoji : true,
                            userId : true,
                        },
                    },
                    _count : {
                        select : {
                            reactions : true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: skip,
                take: limit,
            }),

            prisma.confession.count({
                where: whereClause,
            }),
        ]
    );

    return {

        confessions,
        totalConfessions,
        totalPages: Math.ceil(totalConfessions / limit),
        currentPage: page,
    };
}