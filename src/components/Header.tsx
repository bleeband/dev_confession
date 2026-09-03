import { Show, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 border-gray-800">
            <div className="flex container mx-auto px-4 py-4 justify-between items-center">   

                <a href="/" className="flex items-center gap-2">
                    <span className="text-3xl">🎭</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 bg-clip-text text-transparent">Dev Confession</span>
                </a>

                <nav className="flex gap-4 items-center text-gray-300">
                    <a href="/confessions" className="text-gray-300 hover:text-white transition-colors">Confessions</a>
                    <a href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</a>

                    <Show when="signed-in">
                        <a href="/new" className="text-gray-300 hover:text-white transition-colors">Nouvelle confession</a>
                        <UserButton afterSwitchSessionUrl="/" />
                    </Show>

                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <button className="text-gray-300 hover:text-white transition-colors rounded-md px-4 py-2">Se connecter</button>
                        </SignInButton>
                    </Show>

                </nav>

            </div>  

        </header>
    );
}
