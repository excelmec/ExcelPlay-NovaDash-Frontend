"use client";

import dynamic from 'next/dynamic';

const StartPage = dynamic(() => import('@/components/StartPage'), {
  ssr: false,
});

export default function HomePage() {
  return <StartPage />;
}
