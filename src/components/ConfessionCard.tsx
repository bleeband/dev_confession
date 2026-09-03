"use client";

import { reagir } from "@/actions/reaction.action";
import { CATEGORY_MAP, ConfessionWithReactions, EMOJI_MAP } from "@/app/lib/types";
import { Emoji } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type ConfessionCardProps = {
    confession: ConfessionWithReactions,
    currUserId: string
};

export default function ConfessionCard({ confession,currUserId }: ConfessionCardProps) {

    const categoryInfo = CATEGORY_MAP[confession.category];
    
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
        const maxLength = 200; // Maximum length for a tweet
        const truncatedContent = confession.content.length > maxLength ? confession.content.substring(0, maxLength) + "..." : confession.content;
        const textTweet = ` Confession Dev : \n\n${truncatedContent}\n\n${categoryInfo.icon} #DevConfession #ServiceWeb`;
        const tweetIntentUrl = `https://twitter.com/intent/tweet`;
        const encodeUrl = encodeURIComponent(textTweet);
        const url = `${tweetIntentUrl}?text=${encodeUrl}`;
        window.open(url, "_blank");
    }

    return (
        <>
            <div className="m-4 p-4 border rounded-md shadow-md hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                <div>
                    <p className="text-gray-300">{categoryInfo.icon}</p>
                    <p className="text-gray-300">{categoryInfo.label}</p>
                </div>
                <div>
                    <time dateTime={confession.createdAt.toISOString()} className="text-xs text-gray-500">

                        {formatDistanceToNow(new Date(confession.createdAt), { addSuffix: true, locale: fr })}

                    </time>
                    <p className="text-gray-200 text-sm leading-relaxed mb-4 break-words">{confession.content}</p>
                </div>
                <div className="mt-4 flex space-x-2 gap-2 mb-4">
                    {confession.isAnonymous ?
                    (    <>
                            <p className="text-gray-500">Anonyme</p>
                        </>
                    )
                    : (
                        <>
                            {confession.author.imageUrl && (
                                <img src={confession.author.imageUrl} alt="Author" className="w-10 h-10 rounded-full" />
                            )}
                        </>

                    )                
                    }
                </div>
                
                <div className="flex items-center space-x-2 gap-2 mb-4 flex-wrap">
                    {(Object.keys(EMOJI_MAP) as Emoji[]).map((emoji) => {
                        const count = reactionCounts[emoji] || 0;
                        const hasReacted = userReaction.includes(emoji);
                        return (
                        <button className={`flex items-center space-x-1 px-2 py-2 rounded-full text-sm ${
                            hasReacted ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                        }`} onClick={() => handleReaction(emoji)} key={emoji}>
                            <span className="flex items-center space-x-1">
                                {EMOJI_MAP[emoji]} {count}
                            </span>

                        </button>
                        )
                    })}

                    <button onClick={() => partagerSurX()} className="flex items-center gap-1 px-3 py-2 rounded-full text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors duration-200 ml-auto" title="Partager sur X">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                        </svg>
                        <span>Partager</span>
                    </button>

                </div>




            </div>
        </>
    );      
}
