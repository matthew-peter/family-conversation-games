import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50">
      {/* Simple Header */}
      <div className="px-6 pt-10 pb-6 text-center safe-area-inset-top">
        <h1 className="text-3xl font-black text-gray-800 mb-1">
          Family Game Night
        </h1>
        <p className="text-gray-500">Pick a game, gather round!</p>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-12 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game, index) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              className={`group bg-white rounded-2xl p-4 shadow-sm border border-amber-100 active:scale-95 transition-transform ${
                index === GAMES.length - 1 && GAMES.length % 2 === 1 ? 'col-span-2' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${game.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <game.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-0.5">{game.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{game.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}