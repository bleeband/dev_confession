import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link"

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 border-b border-gray-800">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-3xl">🎭</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-yellow-500 bg-clip-text text-transparent">DevConfession</span>
                </Link>
            

                <nav className="flex items-center gap-6">
                    <Link href="/confessions" className="text-gray-300 hover:text-white transition">
                    Confessions
                    </Link>
                    <Link href="/leaderboard" className="text-gray-300 hover:text-white transition">
                    Classement
                    </Link>
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                            Se connecter
                            </button>
                        </SignInButton>
                    </Show>

                    <Show when="signed-in">
                        <Link href="/new" className="bg-gradient-to-r from-blue-600 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 text-white px-4 py-2 rounded-lg transition">
                        + Publier
                        </Link>
                        <UserButton afterSwitchSessionUrl="/" />
                    </Show>
                </nav>
            </div>
        </header>
    );
}
