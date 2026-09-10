import { getConfessions } from "@/actions/confession.action";
import { getCurrentUser } from "@/actions/user.action";
import ConfessionCard from "@/components/ConfessionCard";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const [{ confessions }, { userId }] = await Promise.all([
    getConfessions(1, 5),
    auth(),
  ]);

  const currentUser = userId ? await getCurrentUser() : null;

  return (
    <div >
      <main className="mx-auto w-full max-w-5xl px-4 py-2">
          <h1 className="text-3xl font-bold mb-4 text-center">Bienvenue sur Dev Confession</h1>
          <p className="text-gray-500 text-center">Une application de confession anonyme pour les développeurs</p>


        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {confessions.map((conf) => (
            <div key={conf.id}>
              <ConfessionCard confession={conf} currUserId={currentUser?.id ?? ""} />
            </div>
          ))}

        </div> 
      </main>
    </div>
  );
}
