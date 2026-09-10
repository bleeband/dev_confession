"use client";

import { useCallback, useEffect, useState } from "react";
import { getComments } from "@/actions/comments.action";
import { CommentForm } from "@/components/CommentsForm";
import { CommentsItem } from "@/components/CommentsItem";
import type { CommentCorrect } from "@/app/lib/types";

type Props = {
    confessionId: string;
    currUserId: string;
    nombreCommentaires: (counts:number) => void;
};

export default function CommentsSection({ confessionId, currUserId, nombreCommentaires }: Props) {
    const [comments, setComments] = useState<CommentCorrect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshComments = useCallback(async () => {
        if (!currUserId) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            const fetchedComments = await getComments(confessionId);
            setComments(fetchedComments);
            nombreCommentaires(fetchedComments.length);
        } catch {
            setError("Impossible de charger les commentaires.");
        } finally {
            setIsLoading(false);
        }
    }, [confessionId, currUserId, nombreCommentaires]);

    useEffect(() => {
        void refreshComments();
    }, [refreshComments]);

    return (
        <section className="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-lg font-semibold text-slate-100">
                Commentaires {comments.length > 0 && `(${comments.length})`}
            </h2>

            {currUserId ? (
                <CommentForm confessionId={confessionId} onSuccess={refreshComments} />
            ) : (
                <p className="mb-4 text-sm text-slate-400">
                    Connectez-vous pour laisser un commentaire.
                </p>
            )}

            {isLoading ? (
                <p className="text-sm text-slate-400">Chargement...</p>
            ) : error ? (
                <p className="text-sm text-red-400">{error}</p>
            ) : comments.length === 0 ? (
                <p className="text-sm text-slate-400">Aucun commentaire pour le moment.</p>
            ) : (
                <div className="divide-y divide-slate-700">
                    {comments.map((comment) => (
                        <div key={comment.id}>
                            <CommentsItem
                                comment={comment}
                                confessionId={confessionId}
                                currentUserId={currUserId}
                            />
                            {comment.replies?.map((reply) => (
                                <div className="ml-6" key={reply.id}>
                                    <CommentsItem
                                        comment={reply}
                                        confessionId={confessionId}
                                        currentUserId={currUserId}
                                        isReply
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
