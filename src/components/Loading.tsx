import Image from "next/image";
import Stars from "@/assets/images/stars.png";

export default function BlinkingLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen max-w-md bg-black mx-auto">
      <Image
        src={Stars}
        alt="stars"
        className="absolute bg-cover h-full w-fit z-0"
      />
      <h1 className="text-5xl text-[#FEFB32] font-pixeboy animate-blink">
        LOADING
      </h1>
    </div>
  );
}
