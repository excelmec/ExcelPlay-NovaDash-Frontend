"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_BASE } from "@/utils";

interface Player {
  rank: number;
  name: string;
  score: number;
  profilePicUrl: string;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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
    if (rank === 1) return "text-[#FFD700]"; // Gold
    if (rank === 2) return "text-[#00FFFF]"; // Cyan
    if (rank === 3) return "text-[#FF00AA]"; // Pink
    return ""; // Default color for others
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(
          `${BACKEND_BASE}/doodle/ranklist`
        );
        const data = await response.json();
        setPlayers(data.ranklist || []); // Extract the ranklist
      } catch (error) {
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-[#FEFB32] font-pixeboy animate-blink text-3xl">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
    );

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
