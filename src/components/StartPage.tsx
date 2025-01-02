"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import TITLE from "@/assets/images/title.webp";
import Navbar from "./SpecialNavbar";
import ShipSelector from "./ShipSelector";
import { ShipDetails } from "@/constants";
import ParticlesComponent from "./ParticlesBackground";
import Controls_Guide from "@/assets/images/controls_guide.webp";
import { checkRefreshFromUrl, refreshTheAccessToken } from "../utils/authUtils";
import { BACKEND_BASE } from "@/utils";

const Game = dynamic(() => import("./Game"), { ssr: false });
const Loading = dynamic(() => import("./Loading"), { ssr: false });

const StartPage = () => {
  const [selectedShip, setSelectedShip] = useState(ShipDetails[0]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highScore, setHighScore] = useState<number | string | null>(null);
  const [rank, setRank] = useState<number | string | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refreshTheAccessToken();
      } catch (error) {
        console.error("Periodic token refresh failed:", error);
      }
    }, 300000); 

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Extract refresh token from URL
      checkRefreshFromUrl();

      // Attempt to refresh access token
      const accessToken = await refreshTheAccessToken();
      if (accessToken) {
        setIsLoggedIn(true);
      } else {
        console.log("No access token found. User not logged in.");
        setIsLoggedIn(false);
      }

      setLoading(false);
    };

    init();
  }, []);
  // Use refs to store audio objects to avoid unnecessary re-renders
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const startClickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects
    clickSoundRef.current = new Audio("/audio/click.mp3");
    startClickSoundRef.current = new Audio("/audio/startclick.mp3");

    // Cleanup audio objects
    return () => {
      clickSoundRef.current?.pause();
      startClickSoundRef.current?.pause();
      clickSoundRef.current = null;
      startClickSoundRef.current = null;
    };
  }, []);



  useEffect(() => {
    const fetchScoreAndRank = async () => {
      const token = await refreshTheAccessToken();
      if (!token) {
        console.error("Failed to refresh token.");
        return;
      }
  
      try {
        const response = await fetch(
          `${BACKEND_BASE}/doodle/score`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch score and rank.");
        }
  
        const data = await response.json();
  
        // Update state with fetched data or 'N/A' if missing
        setHighScore(data.highscore ?? "N/A");
        setRank(data.rank ?? "N/A");
      } catch (error) {
        console.error("Error fetching score and rank:", error);
        setHighScore("N/A");
        setRank("N/A");
      }
    };
  
    fetchScoreAndRank();
  }, []);


  // Reusable function to play audio
  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset the audio to start
      audioRef.current.play().catch((error) => {
        if (error.name === "NotAllowedError") {
          console.warn(
            "Audio playback failed due to autoplay restrictions. User interaction is required."
          );
        } else {
          console.error("Audio playback failed:", error);
        }
      });
    }
  }, []);

  const handleShipSelect = (ship: { src: string; alt: string; name: string }) => {
    setSelectedShip(ship);
    playSound(clickSoundRef); // Play sound when selecting a ship
  };

  const startGame = () => {
    playSound(startClickSoundRef); // Play the Start Game sound
    setIsLoading(true);
    setTimeout(() => {
      setIsGameStarted(true);
      setIsLoading(false);
    }, 9000); // 9 seconds loading time
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isGameStarted) {
    return <Game selectedShip={selectedShip} />;
  }

  return (
    <div className="w-full h-full bg-black max-w-[480px] mx-auto">
      <div className="flex relative bg-black max-w-md mx-auto max-h-screen pb-[16px] overflow-x-hidden flex-col items-center h-screen font-pixeboy border-smaller">
        <ParticlesComponent />
        <Navbar />
        <div className="flex relative items-center flex-col justify-between f-full">
          <Image
            src={TITLE}
            alt="DOODLE BLAST"
            className="max-w-[258px] mt-[148px] mb-[5px]"
          />

          <div className="flex flex-col gap-[15px] scale-90">
            <div className="flex flex-col justify-center items-center gap-0">
              <p className="text-[30px] text-white mt-[6px]">Select Ship</p>
              <p className="text-skyblue_btn text-[18px] mt-[-7px]">
                {selectedShip.name || "No Ship Selected"}
              </p>
            </div>

            <div>
              <ShipSelector
                onShipSelect={handleShipSelect}
                ships={ShipDetails}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[27px] mt-[-8px]">
            <div className="flex justify-center gap-[6px] items-center flex-col text-[19px]">
              <div className="text-center flex flex-col text-cherryPink_text">
                <p>YOUR RANK : {rank}</p>
                <p className="mt-[-8px]">YOUR HIGH SCORE : {highScore}</p>
              </div>

              <div className="text-center flex flex-col text-[17px]">
                <a
                  href="/leaderboard"
                  className="text-skyblue_btn underline underline-offset-2 text-[17px]"
                >
                  VISIT LEADERBOARD
                </a>
                <a
                  href="https://play.excelmec.org"
                  className="text-coralRed_btn cursor-pointer underline underline-offset-2 mt-[-4px]"
                >
                  GO BACK
                </a>
              </div>
            </div>

            <div className="borderGradient scale-95 mt-[-16px]">
              <button onClick={startGame} className="specialBg">
                <p className="pt-[3.5px]">Start Game</p>
              </button>
            </div>
          </div>

          <Image src={Controls_Guide} alt="swipe/ ← → to move & tap / space to shoot" className="max-w-[160px] mt-[40px] mb-[5px]" />
        </div>
      </div>
    </div>
  );
};

export default StartPage;