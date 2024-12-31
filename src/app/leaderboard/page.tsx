"use client"
// app/leaderboard/page.tsx
import { useRouter } from 'next/navigation';

interface Player {
  rank: number;
  name: string;
  score: number;
}

const players: Player[] = [
  { rank: 1, name: 'Alice', score: 1200 },
  { rank: 2, name: 'Bob', score: 1150 },
  { rank: 3, name: 'Charlie', score: 1100 },
  { rank: 4, name: 'Dave', score: 1050 },
  { rank: 5, name: 'Eve', score: 1000 },
];

export default function Leaderboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-black text-white rounded "
      >
        Back to Home
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leaderboard</h1>
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-6">Player Name</th>
              <th className="py-3 px-6">Score</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {players.map((player) => (
              <tr key={player.rank} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6">{player.rank}</td>
                <td className="py-3 px-6">{player.name}</td>
                <td className="py-3 px-6">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
