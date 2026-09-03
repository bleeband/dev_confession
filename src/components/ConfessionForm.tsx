"use client";

import { createConfession } from "@/actions/confession.action";
import { CATEGORY_MAP } from "@/app/lib/types";
import { useState } from "react";

export default function ConfessionForm() {
    const [charCount, setCharCount] = useState(0);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitted(true);
        try {
            formData.set("isAnonymous", isAnonymous.toString());
            // Submit the form data to the server
            await createConfession(formData);

        } catch (error) {
            alert(error instanceof Error ? error.message : "Une erreur est survenue");
        }
        finally {
            setIsSubmitted(false);
        }
    }


    return (


        <form className="flex flex-col items-center w-full max-w-md" action={handleSubmit} method="POST">

            <div className="mb-4 w-full">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Catégorie de votre confession
                </label>
                <div className="text-sm text-gray-500">
                    {Object.entries(CATEGORY_MAP).map(([key, {label, icon}]) => (
                        <label key={key} className="flex items-center space-x-2">
                            <input type="radio" name="category" value={key} className="form-radio" />
                            <span>{icon}</span>
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </div>


            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 ">
                    Votre confession
                </label>           
                <textarea
                className="w-full h-40 p-2 border border-gray-300 rounded-md resize-none"
                placeholder="Écrivez votre confession ici..."
                name="content" maxLength={500}
                onChange={(e) => setCharCount(e.target.value.length)}
                
                required
                />

                <div className="text-sm text-gray-500">
                    {charCount}/500
                </div>
            </div>

            <div className="mb-4 w-full">
                <button
                    type="button"
                    className={`mt-2 px-4 py-2 rounded-md transition-colors ${isAnonymous ? "bg-gray-200 text-gray-700" : "bg-blue-500 text-white"}`}
                    onClick={() => setIsAnonymous(!isAnonymous)}>
                    {isAnonymous ? "Confession Anonyme" : "Confession Publique"}
                    <span className={`absolute top-1 rounded-full transition-transform ${isAnonymous ? "rotate-0" : "rotate-180"} ml-2`}>{isAnonymous ? "🔒" : "🌐"}</span>
                </button>
                <span className={`${isAnonymous ? "text-gray-500" : "text-blue-500"}`}>
                    {isAnonymous ? "Anonyme" : "Avec mon Pseudo"}
                </span>

            </div>

            <button
                type="submit"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">
                Confesser
            </button>

        </form>
    );
}

