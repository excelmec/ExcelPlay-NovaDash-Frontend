"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import TITLE from "@/assets/images/title.webp";
import Navbar from "./SpecialNavbar";
import ShipSelector from "./ShipSelector";
import { ShipDetails } from "@/constants";
import ParticlesComponent from "./ParticlesBackground";

const Game = dynamic(() => import("./Game"), { ssr: false });
const Loading = dynamic(() => import("./Loading"), { ssr: false });

const StartPage = () => {
  const [selectedShip, setSelectedShip] = useState(ShipDetails[0]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const startClickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickSoundRef.current = new Audio("/audio/click.mp3");
    startClickSoundRef.current = new Audio("/audio/startclick.mp3");

    return () => {
      clickSoundRef.current?.pause();
      startClickSoundRef.current?.pause();
      clickSoundRef.current = null;
      startClickSoundRef.current = null;
    };
  }, []);

  const playSound = useCallback(
    (audioRef: React.RefObject<HTMLAudioElement>) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
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
    },
    []
  );

  const handleShipSelect = (ship: {
    src: string;
    alt: string;
    name: string;
  }) => {
    setSelectedShip(ship);
    playSound(clickSoundRef);
  };

  const startGame = () => {
    playSound(startClickSoundRef);
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
            <div className="flex justify-center gap-[6px] items-center flex-col text-[18px]">
              <div className="text-center flex flex-col text-cherryPink_text">
                <p>YOUR RANK : 20XX</p>
                <p className="mt-[-8px]">YOUR HIGH SCORE : 43XX</p>
              </div>

              <div className="text-center flex flex-col text-[16px]">
                <a
                  href="/leaderboard"
                  className="text-skyblue_btn underline underline-offset-2"
                >
                  VISIT LEADERBOARD
                </a>
                <a
                  href="/"
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
        </div>
      </div>
    </div>
  );
};

export default StartPage;
