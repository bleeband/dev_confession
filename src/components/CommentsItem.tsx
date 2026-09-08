"use client"

import { CommentCorrect } from "@/app/lib/types";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
    comment: CommentCorrect;
    confessionId: string;
    currentUserId: string;
    isReply?: boolean;
}

export function CommentsItem({comment, confessionId, currentUserId, isReply}: Props) {
    if(comment.isHidden) {
        return <div>Ce commentaire est masqué suite à sa modération</div>;
    }
    
    return (
        <div className="p-4 border-b border-gray-300">
            <div>{comment.author?.imageUrl ?(
                <img src={comment.author.imageUrl} alt="Author" className="w-10 h-10 rounded-full" />) : (<div className="w-10 h-10 rounded-full bg-gray-300">{comment.author?.username?.charAt(0).toUpperCase() ?? "?"} </div> )}
                <time>
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                </time>
            </div>
            <p className="text-gray-800">{comment.content}</p>
            <p className="text-gray-500 text-sm">
                {comment.isAnonymous ? "Anonyme" : "Avec mon Pseudo"} - {new Date(comment.createdAt).toLocaleString()}
            </p>
            {isReply && (
                <p className="text-gray-400 text-xs">
                    Réponse à un commentaire
                </p>
            )}
            {!isReply && (
                <p className="text-gray-400 text-xs">
                    Commentaire principal
                </p>
            )}

        </div>
    );
}