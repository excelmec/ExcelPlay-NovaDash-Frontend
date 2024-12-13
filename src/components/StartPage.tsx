import React from 'react';
import Image from 'next/image';

import TITLE from '@/assets/images/title.png'

const StartPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="flex max-w-sm mx-auto max-h-[93vh] overflow-hidden flex-col gap-[27px] justify-center items-center h-screen font-pixeboy"> 
      <nav className='h-[96px]'></nav>

      <Image src={TITLE} alt="DOODLE BLAST" className='max-w-[264px]' />

      <div className="h-[195px]">
      </div>

      <div className="flex justify-center gap-[8px] items-center flex-col text-[18px]">
        <div className="text-center flex flex-col text-cherryPink_text">
          <p>YOUR RANK : </p>
          <p className='mt-[-4px]'>YOUR HIGH SCORE : </p>
        </div>

        <div className="text-center flex flex-col text-[16px]">
          <p className='text-skyblue_btn underline underline-offset-2 '>VISIT LEADERBOARD</p>
          <p className='text-coralRed_btn underline underline-offset-2 mt-[-4px]'>GO BACK</p>
        </div>
      </div>

      <div className="borderGradient mb-[20px]">
        <button onClick={onStart} className="specialBg">
          <p className='pt-[3.5px]'>Start Game</p>
        </button>
      </div>
    </div>
  );
};

export default StartPage;