"use client";

import StartPage from "@/components/StartPage";
import Image from "next/image";
import Grain from "@/assets/images/grain.png";

export default function HomePage() {
  return (
    <>
      <div className="">
        <div className="absolute w-full h-full z-0">
          <Image src={Grain} alt="grain" className="h-full" />
        </div>

        <StartPage />
      </div>
    </>
  );
}
