// page de classement de confessions par utilisateurs

import { getLeaderboard } from "@/actions/user.action";

export default async function LeaderboardPage() {
  const { topReactor } = await getLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 p-6 text-white">
      <h1 className="mb-4 text-2xl font-bold">
        Utilisateurs les plus réactifs
      </h1>

      <ul className="space-y-3">
        {topReactor.map((user, index) => (
          <li
            key={user.id}
            className="rounded-lg bg-white/10 p-4"
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
  );
}