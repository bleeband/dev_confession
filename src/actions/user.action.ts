"use server";

import prisma from "@/app/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Utilisateur non authentifié");
    }

    const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
        return existingUser;
    }

    return await prisma.user.create({
        data: {
            clerkId: clerkUser.id,
            username:
                clerkUser.username ||
                clerkUser.firstName ||
                "Anonymous",
            imageUrl: clerkUser.imageUrl || null,
        },
    });
}

export async function getCurrentUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Utilisateur non authentifié");
    }

    return await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
    });
}

export async function getLeaderboard() {
    // Top utilisateurs ayant publié le plus de confessions
    const confessor = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            imageUrl: true,
            _count: {
                select: {
                    confessions: true,
                },
            },
        },
        orderBy: {
            confessions: {
                _count: "desc",
            },
        },
        take: 5,
    });

    // Confessions ayant reçu le plus de réactions
    const topConfession = await prisma.confession.findMany({
        select: {
            id: true,
            content: true,
            category: true,
            isAnonymous: true,

            author: {
                select: {
                    username: true,
                    imageUrl: true,
                },
            },

            _count: {
                select: {
                    reactions: true,
                },
            },
        },

        orderBy: {
            reactions: {
                _count: "desc",
            },
        },

        take: 5,
    });

    // Utilisateurs ayant envoyé le plus de réactions
    const topReactor = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            imageUrl: true,
            _count: {
                select: {
                    reactions: true,
                },
            },
        },

        orderBy: {
            reactions: {
                _count: "desc",
            },
        },

        take: 10,
    });

    return {
        confessor: confessor.filter(
            (user:any) => user._count.confessions > 0
        ),

        topConfession: topConfession.filter(
            (confession:any) => confession._count.reactions > 0
        ),

        topReactor: topReactor.filter(
            (user:any) => user._count.reactions > 0
        ),
    };
}