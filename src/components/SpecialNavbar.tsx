"use client";

import React from "react";
import Image from "next/image";

import EXCEL_LOGO from "@/assets/images/excel.png";

export default function NavbarProfileLogo() {
  return (
    <div className="w-full navBorder max-h-[82px] h-full absolute z-10 top-0">
      <div className="flex items-center justify-between px-[25px] py-2 backdrop-blur-[12px] w-full max-h-[96px] h-full navStyle">
        <a href="./" className="flex shrink-0 items-center">
          <Image alt="Excel '24" src={EXCEL_LOGO} className="h-[42px] w-auto" />
        </a>

        <div className="relative flex rounded-full bg-gray-800 text-sm border-2 border-gray-700">
          <img
            alt=""
            src="https://i.pinimg.com/736x/21/7e/99/217e9997e6c7c580e871696c03a0aaa9.jpg"
            className="size-9 rounded-full"
          />
          {/* CHANGE THE PROFILE PICTURE CODE */}
        </div>
      </div>
    </div>
  );
}