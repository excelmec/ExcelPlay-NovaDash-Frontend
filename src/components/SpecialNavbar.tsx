"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { refreshTheAccessToken } from "@/utils/authUtils";
import EXCEL_LOGO from "@/assets/images/excel.webp";

export default function NavbarProfileLogo() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken") || (await refreshTheAccessToken());
        if (accessToken) {
          const payload = JSON.parse(atob(accessToken.split(".")[1])); // Decode JWT payload
          setProfilePicture(payload.picture); // Assuming 'picture' contains the URL
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, []);

  return (
    <div className="w-full navBorder max-h-[82px] h-full fixed z-10 top-0 max-w-[444.8px]">
      <div className="flex items-center justify-between px-[25px] py-2 backdrop-blur-[12px] w-full max-h-[96px] h-full navStyle">
        <a href="./" className="flex shrink-0 items-center">
          <Image alt="Excel '24" src={EXCEL_LOGO} className="h-[42px] w-auto" />
        </a>

        <Menu as="div" className="relative">
          <Menu.Button className="flex rounded-full text-sm border-2 border-white/[0.1]">
            <span className="sr-only">Open user menu</span>
            {profilePicture ? (
              <img
                alt="User profile"
                src={profilePicture}
                className="size-9 rounded-full"
              />
            ) : (
              <div className="size-9 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm text-white">?</span> {/* Placeholder */}
              </div>
            )}
          </Menu.Button>
        </Menu>
      </div>
    </div>
  );
}