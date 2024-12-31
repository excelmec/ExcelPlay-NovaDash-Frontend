"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface Player {
  rank: number;
  name: string;
  score: number;
}

const players: Player[] = [
  { rank: 1, name: "Benjamin Franklin", score: 95924417 },
  { rank: 2, name: "Isaac Newton", score: 94735741 },
  { rank: 3, name: "Albert Einstein", score: 93911381 },
  { rank: 4, name: "Nikola Tesla", score: 90662103 },
  { rank: 5, name: "Marie Curie", score: 87815810 },
  { rank: 6, name: "Galileo Galilei", score: 85040399 },
  { rank: 7, name: "Ada Lovelace", score: 82362865 },
  { rank: 8, name: "Leonardo da Vinci", score: 80294738 },
  { rank: 9, name: "Charles Darwin", score: 79436407 },
  { rank: 10, name: "Alan Turing", score: 69358487 },
  { rank: 11, name: "Stephen Hawking", score: 69135253 },
  { rank: 476, name: "AADITHYA MADHAV VALLATHERIL SIDHAN", score: 4536344 },
];

export default function Leaderboard() {
  const router = useRouter();

  const playSound = () => {
    const audio = new Audio("/audio/click.mp3");
    audio.play();
  };

  const handleBackClick = () => {
    playSound();
    router.push("/");
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-[#FFD700]"; // 1st
    if (rank === 2) return "text-[#00FFFF]"; // 2nd
    if (rank === 3) return "text-[#FF00AA]"; // 3rd
    return ""; // Default color for others
  };

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center p-6 font-pixeboy max-w-[444.8px] mx-auto border-smaller`}
    >
      <div className="w-full max-w-2xl">
        <button
          onClick={handleBackClick}
          className="mb-8 py-2 font-pixel text-skyblue_btn transition-colors text-lg text-[16px]"
        >
          {"<<"} BACK TO GAME
        </button>

        <h1 className="text-white font-pixel text-center text-5xl mb-14 mt-16">
          HIGH SCORES
        </h1>

        <div className="w-full grid grid-cols-[1fr_5fr_2fr] gap-4 text-white font-pixel">
          <div className="text-center mb-5 text-[18px]">RANK</div>
          <div className="text-center mb-5 text-[18px]">PLAYER</div>
          <div className="text-center mb-5 text-[18px]">SCORE</div>

          {players.map((player) => (
            <React.Fragment key={player.rank}>
              <div className={`text-center ${getRankColor(player.rank)}`}>
                {player.rank}
                {player.rank === 1
                  ? "ST"
                  : player.rank === 2
                  ? "ND"
                  : player.rank === 3
                  ? "RD"
                  : "TH"}
              </div>
              <div className={`text-center ${getRankColor(player.rank)}`}>
                {player.name}
              </div>
              <div className={`text-center ${getRankColor(player.rank)}`}>
                {player.score}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
