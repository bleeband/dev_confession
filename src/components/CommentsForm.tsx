"use client";

import { useState } from "react";
import { createComment } from "@/actions/comments.action";

type Props = {
    confessionId: string;
    parentId?: string;
    onSuccess?: () => void | Promise<void>;
};

const MAX_LENGTH = 300;

export function CommentForm({ confessionId, parentId, onSuccess }: Props) {
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.set("confessionId", confessionId);
        formData.set("content", content);
        formData.set("isAnonymous", String(isAnonymous));
        if (parentId) formData.set("parentId", parentId);

        setIsSubmitting(true);
        try {
            await createComment(formData);
            setContent("");
            setIsAnonymous(true);
            await onSuccess?.();
        } catch {
            setError("Impossible de publier le commentaire. Réessaie.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
            <textarea
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={MAX_LENGTH}
                minLength={2}
                required
                disabled={isSubmitting}
                placeholder="Écris ton commentaire..."
                aria-label="Votre commentaire"
                className="min-h-20 w-full rounded border border-slate-600 bg-slate-800 p-2 text-slate-100"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsAnonymous((value) => !value)}
                    disabled={isSubmitting}
                    className="rounded border border-slate-600 px-2 py-1 text-sm text-slate-200"
                >
                    {isAnonymous ? "Anonyme" : "Avec mon pseudo"}
                </button>
                <span className="text-sm text-slate-300">
                    {content.length}/{MAX_LENGTH}
                </span>
                <button
                    type="submit"
                    disabled={isSubmitting || content.trim().length < 2}
                    className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                    {isSubmitting ? "Publication..." : "Publier"}
                </button>
            </div>
        </form>
    );
}
