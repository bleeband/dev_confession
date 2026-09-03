// nouvelle confession

import { syncUser } from "@/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/dist/client/components/navigation";
import ConfessionForm from "@/components/ConfessionForm";

export default async function NewConfessionPage() {

    const { userId } = await auth();
    if (!userId) {
        redirect("/sign-in");
    }
    
    await syncUser();

  return (
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
            <h1 className="text-6xl font-bold">
                Nouvelle Confession
            </h1>

            <p className="mt-3 text-2xl">
                Créez une nouvelle confession pour partager vos pensées et sentiments.
            </p>

            <div className="mt-6">
                <ConfessionForm />
            </div>
        </main>
  );
}