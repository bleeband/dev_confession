"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, syncUser } from "./user.action";
import prisma from "@/app/lib/prisma";
import { CommentCorrect } from "@/app/lib/types";
import { ReportReason } from "@/generated/prisma/client";

export async function createComment(formData: FormData) {
    let user = await getCurrentUser();

    if (!user) {
        user = await syncUser();
    }

    if (!user) {
        throw new Error("Utilisateur non authentifié");
    }

    const confessionIdValue = formData.get("confessionId");
    const contentValue = formData.get("content");
    const parentIdValue = formData.get("parentId");
    const isAnonymous = formData.get("isAnonymous") === "true";

    if (typeof confessionIdValue !== "string" || !confessionIdValue.trim()) {
        throw new Error("Confession ID obligatoire");
    }
    if (typeof contentValue !== "string") {
        throw new Error("Contenu du commentaire obligatoire");
    }

    const confessionId = confessionIdValue.trim();
    const content = contentValue.trim();
    const parentId = typeof parentIdValue === "string" && parentIdValue.trim()
        ? parentIdValue.trim()
        : null;

    if (content.length < 2) {
        throw new Error("Le contenu doit contenir au moins 2 caractères");
    }
    if (content.length > 500) {
        throw new Error("Le contenu ne doit pas dépasser 500 caractères");
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
            select: { parentId: true, confessionId: true },
        });
        if (!parentComment) {
            throw new Error("Commentaire parent introuvable");
        }
        if (parentComment.confessionId !== confessionId) {
            throw new Error("Le commentaire parent n'appartient pas à cette confession");
        }
        if (parentComment.parentId) {
            throw new Error("Les réponses imbriquées ne sont pas autorisées");
        }
    }

    await prisma.comment.create({
        data: {
            content,
            confessionId,
            parentId,
            isAnonymous,
            authorId: user.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/comments");
    revalidatePath("/confessions");
}

export async function getComments(confessionId: string): Promise<CommentCorrect[]> {
    if (!confessionId?.trim()) {
        throw new Error("Confession ID obligatoire");
    }

    const viewer = await getCurrentUser();
    const confession = await prisma.confession.findUnique({
        where: { id: confessionId },
        select: { authorId: true },
    });
    if (!confession) {
        throw new Error("Confession introuvable");
    }

    const confessionAuthorId = confession.authorId;
    const comments = await prisma.comment.findMany({
        where: { confessionId, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { username: true, imageUrl: true } },
            _count: { select: { reports: true } },
            replies: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: { select: { username: true, imageUrl: true } },
                    _count: { select: { reports: true } },
                },
            },
        },
    });

    function mapComment(comment: {
        id: string;
        content: string;
        isAnonymous: boolean;
        createdAt: Date;
        updatedAt: Date;
        authorId: string;
        author: { username: string | null; imageUrl: string | null } | null;
        _count: { reports: number };
    }): CommentCorrect {
        const isAuthor = viewer?.id === comment.authorId;
        const isConfessionAuthor = viewer?.id === confessionAuthorId;

        return {
            id: comment.id,
            content: comment.content,
            isAnonymous: comment.isAnonymous,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.author
                ? { username: comment.author.username, imageUrl: comment.author.imageUrl }
                : null,
            isHidden: comment._count.reports > 3,
            canDelete: Boolean(isAuthor || isConfessionAuthor),
        };
    }

    return comments.map((comment) => ({
        ...mapComment(comment),
        replies: comment.replies.map((reply) => mapComment(reply)),
    }));
}


export async function deleteComment(commentId: string) {
    const user = await getCurrentUser();
    if(!user) {
        throw new Error("Utilisateur non authentifié");
    }

    const commentaire = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true,
            confession: { select: { authorId: true } }
         },
    })

    if(!commentaire) {
        throw new Error("Commentaire introuvable");
    }

    const commentAuthor = commentaire.authorId === user.id;
    const isConfessionAuthor = commentaire.confession.authorId === user.id;

    if(!commentAuthor && !isConfessionAuthor) {
        throw new Error("Utilisateur non autorisé à supprimer ce commentaire");
    }

    await prisma.comment.delete({
        where: { id: commentId },
    });

    revalidatePath("/");
    revalidatePath("/comments");
    revalidatePath("/confessions");

}

export async function reportComment(commentId: string, reason: ReportReason) {
    const user = await getCurrentUser();
    if(!user) {
        throw new Error("Utilisateur non authentifié");
    }

    const commentaire = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
    });

    if(!commentaire) {
        throw new Error("Commentaire introuvable");
    }

    if(commentaire.authorId === user.id) {
        throw new Error("Vous ne pouvez pas signaler votre propre commentaire");
    }

    try {
        await prisma.commentReport.create({
            data: {
                commentId,
                reporterId: user.id,
                reason,
            },
        });
        // P2002: Unique constraint failed on the fields: (`commentId`, `reporterId`)
    } catch (error: any) {
        const code = (error as { code?: string })?.code;
        if (code === "P2002") {
            throw new Error("Vous avez déjà signalé ce commentaire");
        }
        throw new Error("Erreur lors du signalement du commentaire");
    }

    revalidatePath("/");
    revalidatePath("/comments");
    revalidatePath("/confessions");
}