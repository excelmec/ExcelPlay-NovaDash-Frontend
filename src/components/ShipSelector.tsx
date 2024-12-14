import { useState, useEffect } from "react";

import Ship_1 from "@/assets/ships/ship_1.gif";
import Ship_2 from "@/assets/ships/ship_1.gif";

import Image from "next/image";

import Arrow_Left from "@/assets/icons/arrow_left.svg";
import Arrow_Right from "@/assets/icons/arrow_right.svg";

const slides = [
  { src: Ship_1.src, alt: "Ship 1" },
  { src: Ship_2.src, alt: "Ship 2" },
];

export default function ShipSelector({ onShipSelect }: { onShipSelect: (ship: { src: string; alt: string }) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    onShipSelect(slides[currentIndex]); // Passing the selected ship to the parent
  }, [currentIndex, onShipSelect]);

  return (
    <div className="relative w-full">
      <div className="relative h-[110px] overflow-hidden rounded-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="block w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="absolute top-0 left-[-12px] z-30 flex items-center justify-center h-full px-100 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-10 h-10">
          <Image className="size-7 opacity-80" src={Arrow_Left} alt="<" />
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button
        onClick={handleNext}
        className="absolute top-0 right-[-12px] z-30 flex items-center justify-center h-full px-100 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-10 h-10">
          <Image className="size-7 opacity-80" src={Arrow_Right} alt=">" />
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}
