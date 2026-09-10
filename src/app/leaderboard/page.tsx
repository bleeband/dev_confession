// page de classement de confessions par utilisateurs

import { getLeaderboard } from "@/actions/user.action";

export default async function LeaderboardPage() {
  const { topReactor } = await getLeaderboard();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">
        Utilisateurs les plus réactifs
      </h1>

      <div className="mt-6 space-y-4">
        <ul className="space-y-3">
          {topReactor.map((user, index) => (
            <li
              key={user.id}
              className="card border-l-4 border-l-blue-500 p-4 hover:border-l-yellow-400"
            >
              <span className="font-bold">#{index + 1}</span>
              {" "}
              {user.username} — {user._count.reactions} réactions
            </li>
          ))}
        </ul>

        {topReactor.length === 0 && (
          <p className="text-gray-400">
            Aucune réaction enregistrée.
          </p>
        )}

        <p className="mt-6 text-sm text-gray-400">
          Total : {topReactor.length} utilisateurs
        </p>
      </div>
    </main>
  );
}
