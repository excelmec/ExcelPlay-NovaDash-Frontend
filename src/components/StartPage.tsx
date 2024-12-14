import React from "react";
import Image from "next/image";

import TITLE from "@/assets/images/title.png";

import Navbar from "./SpecialNavbar";

const StartPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="flex relative bg-darkIndigo_bg max-w-sm mx-auto max-h-screen pb-[10px] overflow-x-hidden flex-col gap-[27px] items-center h-screen font-pixeboy justify-between">
      <Navbar />

      <Image
        src={TITLE}
        alt="DOODLE BLAST"
        className="max-w-[264px] mt-[170px]"
      />

      <div className="flex flex-col gap-[27px]">
        <div className="flex justify-center gap-[6px] items-center flex-col text-[18px]">
          <div className="text-center flex flex-col text-cherryPink_text">
            <p>YOUR RANK : </p>
            <p className="mt-[-6px]">YOUR HIGH SCORE : </p>
          </div>

          <div className="text-center flex flex-col text-[16px]">
            <p className="text-skyblue_btn underline underline-offset-2 ">
              VISIT LEADERBOARD
            </p>
            <p className="text-coralRed_btn underline underline-offset-2 mt-[-5px]">
              GO BACK
            </p>
          </div>
        </div>

        <div className="borderGradient mb-[20px]">
          <button onClick={onStart} className="specialBg">
            <p className="pt-[3.5px]">Start Game</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
