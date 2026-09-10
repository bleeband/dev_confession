import { getConfessions } from "@/actions/confession.action";
import { getCurrentUser } from "@/actions/user.action";
import ConfessionCard from "@/components/ConfessionCard";
import { auth } from "@clerk/nextjs/server";

export default async function ConfessionsPage() {
    const [{ confessions}, { userId }] = await Promise.all([
        getConfessions(1, 5),
        auth(),
    ]);
    const currentUser = userId ? await getCurrentUser() : null;

    return (
        <main className="mx-auto w-full max-w-3xl px-4 py-8">
            <h1 className="text-3xl font-bold">Confessions</h1>

            <div className="mt-6 space-y-4">
                {confessions.length === 0 ? (
                    <p className="text-gray-500">Aucune confession pour le moment.</p>
                ) : (
                    confessions.map((confession) => (
                        <div key={confession.id}>
                            <ConfessionCard
                                confession={confession}
                                currUserId={currentUser?.id ?? ""}
                            />
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
