import { Category, Emoji, ReportReason } from "@/generated/prisma/client";

export const EMOJI_MAP : Record<Emoji, string> = { // un record c'est comme pour map le nom
    LAUGH : "😂",
    HEART : "❤️",
    FIRE : "🔥",
    SALUTE : "🫡",
    SKULL : "💀",
    FACEPALM : "🤦‍♂️",
    THUMBS_UP : "👍",
}

export const CATEGORY_MAP : Record<Category, {label: string, icon: string}> ={
    BUG :               {label: "Bug", icon: "🐛"},
    GIT_DISASTER :      {label: "Catastrophe Git", icon: "💥"},
    PRODUCTION_FAIL :   {label: "Panne en production", icon: "🟥"},
    COFFEE_NEEDED :     {label: "Besoin de café", icon: "☕"},
    UPDATE_PROBLEM :    {label: "Problème de mise à jour", icon: "😰"},
    VERSION_PROBLEM :   {label: "Problème de version", icon: "🆚"},
}

export const REPORT_REASON_MAP : Record<ReportReason, {label: string, icon: string}> = {
    SPAM: {label: "Pourriel", icon: "📧"},
    INAPPROPRIATE: {label: "Contenu inapproprié", icon: "🚫"},
    FRAUD: {label: "Fraude", icon: "💳"},
    HARASSMENT: {label: "Propos offensants", icon: "😡"},
    DISCRIMINATION: {label: "Discrimination", icon: "⚖️"},
    OTHER: {label: "Autre", icon: "❓"},
};

// jointure de confession et de reaction pour avoir la confession avec le nombre de reaction et les reaction
export type ConfessionWithReactions = {
    id: string;
    content: string;
    isAnonymous: boolean;
    category: Category;
    createdAt: Date;
    author: {
        username: string | null;
        imageUrl: string | null;
    };
    reactions:{
        emoji: Emoji;
        userId: string;
    }[];
    _count: {
        reactions: number;
        comments: number;
    };
}

export type CommentCorrect = {
    id: string;
    content: string;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: {username: string | null; imageUrl: string | null;} | null;
    isHidden?: boolean;
    canDelete?: boolean;
    
    replies?: CommentCorrect[];
};

export const CREDIT_PACK = [
    {id: "pack_10", credits: 10, price: 0.99, label:"10 crédits", popular: false},
    {id: "pack_50", credits: 50, price: 3.99, label:"50 crédits", popular: true},
    {id: "pack_100", credits: 100, price: 6.99, label:"100 crédits", popular: false},
    {id: "pack_500", credits: 500, price: 29.99, label:"500 crédits", popular: false},
] as const;

export type packId = typeof CREDIT_PACK[number]["id"];
