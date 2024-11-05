"use client"
import { useEffect } from "react";
import Game from "../app/components/Game";
import { useStore } from "../app/store";

export default function HomePage() {
  const { setLane, incrementScore } = useStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setLane(-1);
      if (e.key === "ArrowRight") setLane(1);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setLane]);

  useEffect(() => {
    const interval = setInterval(() => {
      incrementScore();
    }, 1000);

    return () => clearInterval(interval);
  }, [incrementScore]);

  return <Game />;
}
