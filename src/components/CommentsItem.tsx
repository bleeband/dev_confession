"use client";

import { CommentCorrect, REPORT_REASON_MAP } from "@/app/lib/types";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { deleteComment, reportComment } from "@/actions/comments.action";
import { ReportReason } from "@/generated/prisma/client";
import { CommentForm } from "./CommentsForm";

type Props = {
    comment: CommentCorrect;
    confessionId: string;
    currentUserId: string;
    isReply?: boolean;
};

export function CommentsItem({ comment, confessionId, currentUserId, isReply }: Props) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReason, setShowReason] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    if (comment.isHidden) {
        return <div className="py-3 text-sm text-slate-400">Ce commentaire est masqué suite à sa modération.</div>;
    }

    async function handleDelete() {
        if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
        try {
            await deleteComment(comment.id);
        } catch {
            setNotice("Impossible de supprimer le commentaire.");
        }
    }

    async function handleReport(reason: ReportReason) {
        try {
            await reportComment(comment.id, reason);
            setNotice("Le commentaire a été signalé.");
            setShowReason(false);
        } catch (error) {
            setNotice(error instanceof Error ? error.message : "Erreur lors du signalement.");
        }
    }

    return (
        <div className="border-b border-slate-700 px-2 py-4 text-slate-200">
            <div className="flex items-center gap-3">
                {comment.author?.imageUrl ? (
                    <img src={comment.author.imageUrl} alt="Auteur" className="h-10 w-10 rounded-full" />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-800">
                        {comment.author?.username?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                )}
                <time className="text-sm text-slate-300">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                </time>
            </div>

            <p className="mt-3 break-words text-base leading-relaxed text-slate-100">{comment.content}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                {currentUserId && (
                    <button
                        type="button"
                        onClick={() => setShowReplyForm((value) => !value)}
                        className="rounded-md border border-sky-500/50 px-2.5 py-1 text-xs font-medium text-sky-300 transition hover:bg-sky-500/15 hover:text-sky-200"
                    >
                        {showReplyForm ? "Annuler" : "Répondre"}
                    </button>
                )}

                {comment.canDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-md border border-red-500/50 px-2.5 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
                    >
                        Supprimer
                    </button>
                )}

                {currentUserId && (
                    <button
                        type="button"
                        onClick={() => setShowReason((value) => !value)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                    >
                        Signaler
                    </button>
                )}
            </div>

            {showReason && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {(Object.keys(REPORT_REASON_MAP) as ReportReason[]).map((reason) => (
                        <button
                            key={reason}
                            type="button"
                            className="rounded bg-slate-800 px-2 py-1 text-xs text-sky-300 hover:bg-slate-700"
                            onClick={() => handleReport(reason)}
                        >
                            {REPORT_REASON_MAP[reason].icon} {REPORT_REASON_MAP[reason].label}
                        </button>
                    ))}
                </div>
            )}

            {notice && <p className="mt-2 text-xs text-emerald-400">{notice}</p>}

            {showReplyForm && (
                <div className="mt-3">
                    <CommentForm confessionId={confessionId} parentId={comment.id} />
                </div>
            )}

            {!isReply && <p className="mt-3 text-xs text-slate-400">Commentaire principal</p>}
        </div>
    );
}
