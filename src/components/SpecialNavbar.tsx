"use client";

import React, { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation"; // For programmatic navigation
import { refreshTheAccessToken } from "@/utils/authUtils";
import EXCEL_LOGO from "@/assets/images/excel.webp";

export default function NavbarProfileLogo() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const router = useRouter();

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

  const handleLogout = () => {
    try {
      // Clear access token from local storage
      localStorage.removeItem("accessToken");

      // Redirect to the base URL
      window.location.href = "https://playtest.excelmec.org";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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
                  <button
                    className="h-[40px] flex items-center px-8 text-md text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
