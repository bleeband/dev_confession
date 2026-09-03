
import { getConfessions } from "@/actions/confession.action";
import { getCurrentUser } from "@/actions/user.action";
import ConfessionCard from "@/components/ConfessionCard";


export default async function Home() {
  const { confessions } = await getConfessions(1, 5);
  const currentUser = await getCurrentUser();

  return (
    <div >
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 mb-4 text-center">Bienvenue sur Dev Confession</h1>
          <p className="text-gray-500 text-center">Une application de confession anonyme pour les développeurs</p>


        <div className="grid md:grid-cols-2 gap-4 mt-6 space-y-4 rounded-md bg-gray-700 p-4">
          {confessions.map((conf) => (
            <ConfessionCard key={conf.id} confession={conf} currUserId={currentUser?.id ?? ""} />
          ))}

        </div> 
      </main>
    </div>
  );
}
