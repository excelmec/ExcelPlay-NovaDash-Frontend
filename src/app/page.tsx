"use client";

import dynamic from 'next/dynamic';

// Dynamically import the Game component with SSR disabled
const Game = dynamic(() => import("../app/components/Game"), { ssr: false });

export default function HomePage() {
  return <Game />;
}
