"use client";

import { reagir } from "@/actions/reaction.action";
import { CATEGORY_MAP, ConfessionWithReactions, EMOJI_MAP } from "@/app/lib/types";
import { Emoji } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import CommentsSection from "./CommentsSection";

type ConfessionCardProps = {
    confession: ConfessionWithReactions,
    currUserId: string
};

export default function ConfessionCard({ confession,currUserId }: ConfessionCardProps) {

    const categoryInfo = CATEGORY_MAP[confession.category];
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(confession._count.comments);
    
    // Calculate the reaction counts for each type of reaction // liste [{emoji:"LAUGH"}, {emoji:"LOVE"}, {emoji:"SAD"}, ...]
    const reactionCounts = confession.reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
    }, {} as Record<Emoji, number>);

    const userReaction = confession.reactions
                                        .filter((u)=> u.userId === currUserId)
                                        .map((u) => u.emoji);

    async function handleReaction(emoji: Emoji) {
        if(!currUserId){
            alert("Connectez-vous pour réagir");
            return; 
        }

        try {
            await reagir(confession.id, emoji);
        } catch (error) {
            alert("Une erreur est survenue lors de la réaction");
        }finally {
            return;
        }
    }

    function partagerSurX() {
        const maxLength = 200;
        const truncatedContent = confession.content.length > maxLength ? confession.content.substring(0, maxLength) + "..." : confession.content;
        const textTweet = ` Confession Dev : \n\n${truncatedContent}\n\n${categoryInfo.icon} #DevConfession #ServiceWeb`;
        const tweetIntentUrl = `https://twitter.com/intent/tweet`;
        const encodeUrl = encodeURIComponent(textTweet);
        const url = `${tweetIntentUrl}?text=${encodeUrl}`;
        window.open(url, "_blank");
    }

    return (
        <>
            <div className="confession-card">
                
                <div>
                    <p className="text-2xl">{categoryInfo.icon}</p>
                    <p className="mt-2 text-lg text-slate-200">{categoryInfo.label}</p>
                </div>
                
                <div className="mt-3">
                    <time dateTime={confession.createdAt.toISOString()} className="text-sm text-slate-400">

                        {formatDistanceToNow(new Date(confession.createdAt), { addSuffix: true, locale: fr })}

                    </time>
                    <p className="mt-2 break-words text-base leading-relaxed text-slate-100">{confession.content}</p>
                </div>

                <div className="mt-6 flex min-h-10 items-center gap-2">
                    {confession.isAnonymous ?
                    (    <>
                            <p className="text-slate-400">Anonyme</p>
                        </>
                    )
                    : (
                        <>
                            {confession.author.imageUrl && (
                                <img src={confession.author.imageUrl} alt="Avatar de l’auteur" className="w-10 h-10 rounded-full" />
                            )}
                        </>

                    )                
                    }
                </div>
                
                <div className="confession-card__reactions">
                    {(Object.keys(EMOJI_MAP) as Emoji[]).map((emoji) => {
                        const count = reactionCounts[emoji] || 0;
                        const hasReacted = userReaction.includes(emoji);
                        return (
                        <button aria-label={`Réagir avec ${EMOJI_MAP[emoji]}`} className="reaction-button" data-reacted={hasReacted} onClick={() => handleReaction(emoji)} key={emoji}>
                            <span>
                                {EMOJI_MAP[emoji]} {count}
                            </span>

                        </button>
                        )
                    })}

                    <button onClick={() => setShowComments((v) => !v)} className="share-button" title={showComments ? "Masquer les commentaires" : "Afficher les commentaires"}>
                        <span>{showComments ? "Masquer les commentaires" : "Afficher les commentaires"}</span>
                        <span>{commentCount > 0 ? commentCount : ""}</span>
                    </button>

                    <button onClick={() => partagerSurX()} className="share-button" title="Partager sur X">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                        </svg>
                        <span>Partager</span>
                    </button>
                </div>
                
                {showComments && (
                    <CommentsSection confessionId={confession.id} currUserId={currUserId} nombreCommentaires={setCommentCount} />
                )}

            </div>
        </>
    );      
}
