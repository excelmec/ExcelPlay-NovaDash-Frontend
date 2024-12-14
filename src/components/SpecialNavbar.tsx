"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React from "react";

import Image from "next/image";

import EXCEL_LOGO from "@/assets/images/excel.png";

export default function NavbarProfileLogo() {
  return (
    <div className="w-full navBorder max-h-[96px] h-full absolute top-0">
      <div className="flex items-center justify-between px-[25px] py-2 backdrop-blur-[12px] w-full max-h-[96px] h-full navStyle">
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Image alt="Excel '24" src={EXCEL_LOGO} className="h-[44px] w-auto" />
        </div>

        {/* Profile dropdown */}
        <Menu as="div" className="relative">
          <div>
            <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img
                alt=""
                src="https://i.pinimg.com/736x/21/7e/99/217e9997e6c7c580e871696c03a0aaa9.jpg"
                className="size-10 rounded-full"
              />
            </MenuButton>
          </div>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <MenuItem>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
              >
                Sign out
              </a>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
