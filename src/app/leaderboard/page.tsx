'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { pixelFont } from "../../utils/fonts";

interface Player {
  rank: number;
  name: string;
  score: number;
}

const players: Player[] = [
  { rank: 1, name: 'HDN', score: 95924417 },
  { rank: 2, name: 'CSI', score: 94735741 },
  { rank: 3, name: 'JGV', score: 93911381 },
  { rank: 4, name: 'AAA', score: 90662103 },
  { rank: 5, name: 'AWC', score: 87815810 },
  { rank: 6, name: 'IXV', score: 85040399 },
  { rank: 7, name: 'OGX', score: 82362865 },
  { rank: 8, name: 'DQE', score: 80294738 },
  { rank: 9, name: 'VUS', score: 79436407 },
  { rank: 10, name: 'KTB', score: 69358487 },
  { rank: 11, name: 'HDV', score: 69135253 },
];

export default function Leaderboard() {
  const router = useRouter();

  const playSound = () => {
    const audio = new Audio('/audio/click.mp3'); // Ensure the path is correct
    audio.play();
  };

  const handleBackClick = () => {
    playSound();
    router.push('/');
  };

  return (
    <div className={`min-h-screen bg-black flex flex-col items-center p-6 ${pixelFont.variable}`}>
      <div className="w-full max-w-2xl">
        <button
          onClick={handleBackClick}
          className="mb-8 px-4 py-2 text-white font-pixel text-sm hover:text-yellow-400 transition-colors"
        >
          {'<'} BACK
        </button>
        
        <h1 className="text-white font-pixel text-center text-4xl mb-12">
          HIGH SCORES
        </h1>

        <div className="w-full grid grid-cols-[1fr_1fr_1.5fr] gap-4 text-white font-pixel">
          <div className="text-center mb-6">RANK</div>
          <div className="text-center mb-6">NAME</div>
          <div className="text-center mb-6">SCORE</div>

          {players.map((player) => (
            <React.Fragment key={player.rank}>
              <div className={`text-center ${player.rank === 1 ? 'text-yellow-400' : ''}`}>
                {player.rank}
                {player.rank === 1 ? 'ST' : 
                  player.rank === 2 ? 'ND' : 
                  player.rank === 3 ? 'RD' : 'TH'}
              </div>
              <div className={`text-center ${player.rank === 1 ? 'text-yellow-400' : ''}`}>
                {player.name}
              </div>
              <div className={`text-center ${player.rank === 1 ? 'text-yellow-400' : ''}`}>
                {player.score}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
