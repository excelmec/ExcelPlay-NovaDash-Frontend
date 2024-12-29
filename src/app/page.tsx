"use client";

import StartPage from "@/components/StartPage";
import { useEffect, useState } from "react";

import PlayVideo from "@/assets/videos/excelplay.gif";
import Image from "next/image";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Image src={PlayVideo} alt="ExcelPlay Loading" className="max-w-[140px]" />
      </div>
    );
  } else {
    return <StartPage />;
  }
}
