"use client";
 
import {useState } from "react";
import React from "react";
import { createComment } from "@/actions/comments.action";

type Props = {
    confessionId : string;
    parentId?: string;
}
 
const MAX_LENGTH = 300;
 
export function CommentForm({confessionId, parentId}: Props){
    const [charCount, setCharCount] = useState(0);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        // Handle form submission logic here
        setIsSubmitting(true);
        try {
            formData.set("confessionId", confessionId);
            formData.set("isAnonymous", isAnonymous.toString());
            if (parentId) {
                formData.set("parentId", parentId || "");
            }
            await createComment(formData);
            setCharCount(0); // Reset character count after successful submission
            formData.delete("content"); // Clear the content field after successful submission
        } catch (error) {
            console.error("Error submitting comment:", error);
            setError("Failed to submit comment. Please try again.");
        }
        finally {
            setIsSubmitting(false);
            setError(null); // Clear error after handling submission
            setCharCount(0); // Reset character count after handling submission
            setIsAnonymous(true); // Reset anonymity to default after handling submission
        }
    }

    return (
        <form action={handleSubmit}>
            <textarea
            name="content"
            maxLength={MAX_LENGTH}
            onChange={(e) => setCharCount(e.target.value.length)}
            value={charCount > 0 ? undefined : ""}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
 
            <div className='flex items-center gap-3'>
                <button
                    type='button'
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${isAnonymous ? "bg-purple-600" : "bg-gray-700"}`}>
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnonymous ? "left-8" : "left-1"}`} />
                </button>
                <span className='text-gray-300'>
                    {isAnonymous ? "Anonyme" : "Avec mon Pseudo"}
                </span>
                <span className={`text-xs ${charCount > MAX_LENGTH - 50 ? "text-red-400" : "text-gray-500"}`}>
                    {charCount}/{MAX_LENGTH}
                </span>
 
                <button type="submit" >
                    Publier
                </button>
            </div>
        </form>
    )
}