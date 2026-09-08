"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser, syncUser } from "./user.action";
import prisma from "@/app/lib/prisma";
import { CommentCorrect } from "@/app/lib/types";

export async function createComment(formData: FormData) {
    let user = await getCurrentUser();

    if (!user) {
        await syncUser();
        user = await getCurrentUser();
        
        throw new Error("Utilisateur non authentifié");
    }

    const confessionId = formData.get("confessionId") as string;
    const content = formData.get("content") as string;
    const parentId = (formData.get("parentId") as string) || null;
    const isAnonymous = (formData.get("isAnonymous") as string) === "true";

    const contentTrim = content.trim();
    if(contentTrim.length < 2) {
        throw new Error("Le contenu doit contenir au moins 2 caractères");
    }
    if(contentTrim.length > 500) {
        throw new Error("Le contenu ne doit pas dépasser 500 caractères");
    }

    if (!confessionId) {
        throw new Error("Confession ID obligatoire");
    }

    const confession = await prisma.confession.findUnique({
        where: { id: confessionId }, 
        select: { id: true },
    });
    if (!confession) {
        throw new Error("Confession introuvable");
    }
    if (parentId) {
        const parentComment = await prisma.comment.findUnique({
            where: { id: parentId },
            select: { id: true },
        });
        if (!parentComment) {
            throw new Error("Commentaire parent introuvable");
        }

        if (parentComment.parentId) {
            throw new Error("Les réponses aux commentaires de niveau supérieur ne sont pas autorisées");
        }
    }

    await prisma.comment.create({
        data: {
            content: contentTrim,
            confessionId,
            parentId,
            isAnonymous,
            authorId: user.id,
        },
    });

    // Optionally, revalidate the path to update the UI
    revalidatePath("/")
    revalidatePath("/comments");
    revalidatePath("/confessions");
}

export async function getComments(confessionId: string): Promise<CommentCorrect[]> {
    const viewers = await getCurrentUser();

    const confession = await prisma.confession.findUnique({
        where: { id: confessionId },
        select: { authorId: true },
    });
    if (!confession) {
        throw new Error("Confession introuvable");
        return [];
    }
    
    if (!confessionId) {
        throw new Error("Confession ID obligatoire");
    }

    const comments = await prisma.comment.findMany({
        where: { confessionId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: { 
            author: { select: { id: true, name: true, imageUrl: true } }, 
            _count: { select: { reports: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: { author: { select: { id: true, name: true, imageUrl: true } }, _count: { select: { reports: true } } }
            }
        }
    });

    type CommentParent = (typeof comments)[number];
    type CommentEnfant = (typeof comments[number]["replies"])[number];

    function chaqueCommentaire(comment: CommentParent | CommentEnfant ): CommentCorrect {
        const authComment = viewers?.id === comment.authorId;
        const authConfession = viewers?.id === confession?.authorId;


        return {
            id: comment.id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.author ? { username: comment.author.name, imageUrl: comment.author.imageUrl } : null,
            isHidden: comment._count.reports > 3,
            canDelete: Boolean(authComment || authConfession),
            }
        }

        return comments.map(c => ({
            ...chaqueCommentaire(c),
            replies: c.replies.map(r => chaqueCommentaire(r))
        }));


    }