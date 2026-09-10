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
            await createConfession(formData);

        } catch (error) {
            alert(error instanceof Error ? error.message : "Une erreur est survenue");
        }
        finally {
            setIsSubmitted(false);
        }
    }


  return(
        <form action={handleSubmit} className='space-y-6'>

            <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Catégorie de votre fail</label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {Object.entries(CATEGORY_MAP).map(([key, {label, icon}]) => (
                        <label key={key} 
                        className='flex items-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer.
                        hover:bg-gray-700 transition border border-gray-700 has-[:checked]:border-blue-500
                        text-white'>
                            <input name='category' value={key} type='radio' defaultChecked={key === "BUG"}/>
                            <span className='text-xl'>{icon}</span>
                            <span className='text-sm'>{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Votre confession</label>
                <textarea 
                name="content" 
                maxLength={500} 
                rows={5}
                placeholder="J'avoue que j'ai ..."  
                onChange={(e) => setCharCount(e.target.value.length)}
                
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"

                required
                />
                <div className='flex justify-between mt-1'>
                    <span>Minimum 10 caractères</span>
                    <span className={`text-xs ${charCount > 450 ? "text-red-400" : "text-gray-500"}`}>{charCount}/500</span>
                </div>

            </div>

            <div className='flex items-center gap-3'>
                <button 
                    type='button' 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    aria-label={isAnonymous ? "Publier anonymement" : "Afficher mon pseudo"}
                    className={`relative w-14 h-7 rounded-full transition-colors ${isAnonymous ? "bg-blue-600" : "bg-gray-700"}`}>
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnonymous ? "left-8" : "left-1"}`} />
                </button>
                <span className='text-gray-300'>
                    {isAnonymous ? "Anonyme" : "Avec mon pseudo"}
                </span>
            </div>

            <button 
                type='submit' 
                disabled={isSubmitted}
                className='w-full bg-gradient-to-r from-blue-400 to-yellow-500 hover:from-blue-500 hover:to-yellow-600 
                disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition'>
                    {isSubmitted ? "Publication..." : "Publier"}
            </button>
            
        </form>
    )
}

