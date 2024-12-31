"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import EXCEL_LOGO from "@/assets/images/excel.webp";

export default function NavbarProfileLogo() {
  return (
    <div className="w-full navBorder max-h-[82px] h-full fixed z-10 top-0 max-w-[444.8px]">
      <div className="flex items-center justify-between px-[25px] py-2 backdrop-blur-[12px] w-full max-h-[96px] h-full navStyle">
        <a href="./" className="flex shrink-0 items-center">
          <Image alt="Excel '24" src={EXCEL_LOGO} className="h-[42px] w-auto" />
        </a>

        <Menu as="div" className="relative">
          <Menu.Button className="flex rounded-full text-sm border-2 border-white/[0.1]">
            <span className="sr-only">Open user menu</span>
            <img
              alt="User profile"
              src="https://i.pinimg.com/736x/7c/79/b9/7c79b9224d459263a4113ef293597fc8.jpg"
              className="size-9 rounded-full"
            />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-fit origin-top-right rounded-2xl bg-black py-1 border-[1px]">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className="h-[40px] flex items-center px-8 text-md text-white"
                    onClick={() => {
                      // Add logout functionality here
                      console.log("Logout clicked");
                    }}
                  >
                    Logout
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

