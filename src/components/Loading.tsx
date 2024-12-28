import { useEffect, useState, useCallback } from "react";

const loadingTexts = [
  "Refueling the starship...",
  "Calibrating asteroid radars...",
  "Powering up photon blasters...",
  "Engaging thrusters...",
];

export default function SpaceShooterLoading() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const typewriterEffect = useCallback((text: string) => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStep >= loadingTexts.length) {
      return; // Stop when we've displayed all texts
    }

    const text = loadingTexts[currentStep];
    const clearTypewriter = typewriterEffect(text);

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 2000); // 2 seconds duration

    return () => {
      clearTimeout(timeout);
      clearTypewriter();
    };
  }, [currentStep, typewriterEffect]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-pixeboy text-center min-h-[3rem] text-[#FEFB32]">
        {displayedText}
      </h1>
    </div>
  );
}
