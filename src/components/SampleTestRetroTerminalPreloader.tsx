import React, { useState, useEffect } from 'react';

const messages = [
  "Calculating trajectory...",
  "Fueling spaceship...",
  "Initializing weapon systems...",
  "Calibrating navigation...",
  "Loading mission parameters...",
];

const RetroTerminalPreloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const newProgress = Math.min(oldProgress + Math.random() * 10, 100);
        return Math.round(newProgress);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      if (messageIndex < messages.length) {
        setCurrentMessage((prev) => prev + messages[messageIndex][prev.length]);
        if (currentMessage.length === messages[messageIndex].length) {
          setMessageIndex((prevIndex) => prevIndex + 1);
          setCurrentMessage('');
        }
      } else {
        clearInterval(messageTimer);
      }
    }, 50);

    return () => clearInterval(messageTimer);
  }, [messageIndex, currentMessage]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-green-500 font-mono">
      <div className="w-96 h-64 border-2 border-green-500 p-4 overflow-hidden">
        <div className="mb-4">
          {messages.slice(0, messageIndex).map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
          <div>{currentMessage}</div>
        </div>
        <div className="mt-4">
          Loading progress: {progress}%
          <div className="w-full bg-green-900 h-2 mt-2">
            <div
              className="bg-green-500 h-2"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroTerminalPreloader;

