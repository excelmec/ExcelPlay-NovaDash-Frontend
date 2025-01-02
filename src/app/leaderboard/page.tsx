"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_BASE } from "@/utils";
import { refreshTheAccessToken } from "../../utils/authUtils";

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
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
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
    const fetchData = async () => {
      try {
        // Refresh the access token
        const accessToken = await refreshTheAccessToken();
        if (!accessToken) throw new Error("Failed to fetch access token");

        // Fetch the logged-in user's details
        const userResponse = await fetch(`${BACKEND_BASE}/doodle/score`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userData = await userResponse.json();
        setCurrentUser(userData);

        // Fetch the leaderboard
        const leaderboardResponse = await fetch(
          `${BACKEND_BASE}/doodle/ranklist`
        );
        const leaderboardData = await leaderboardResponse.json();
        setPlayers(leaderboardData.ranklist || []);
      } catch (error) {
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

          {players.map((player) => {
            const isCurrentUser = currentUser && player.name === currentUser.name;
            return (
              <React.Fragment key={player.rank}>
                <div
                  className={`text-center ${getRankColor(player.rank)} ${
                    isCurrentUser ? "bg-[#2F4F4F]" : ""
                  }`}
                >
                  {player.rank}
                  {player.rank === 1
                    ? "ST"
                    : player.rank === 2
                    ? "ND"
                    : player.rank === 3
                    ? "RD"
                    : "TH"}
                </div>
                <div
                  className={`text-center ${getRankColor(player.rank)} ${
                    isCurrentUser ? "bg-[#2F4F4F]" : ""
                  }`}
                >
                  {player.name}
                </div>
                <div
                  className={`text-center ${getRankColor(player.rank)} ${
                    isCurrentUser ? "bg-[#2F4F4F]" : ""
                  }`}
                >
                  {player.score}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
