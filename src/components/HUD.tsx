import React from 'react';

interface HUDProps {
  score: number;
  activePowerUp: string | null;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

const HUD: React.FC<HUDProps> = ({ score, activePowerUp, isSoundOn, onToggleSound }) => {
  const getPowerUpDisplayText = (powerUp: string | null): string => {
    switch (powerUp) {
      case 'slow':
        return 'SLOW TIME';
      case 'multiplier':
        return '2X SCORE';
      case 'shield':
        return 'SHIELD';
      default:
        return '';
    }
  };

  return (
    <div className="absolute z-50 top-0 left-0 w-full p-4">
      <div className="flex justify-between items-start">
        <div className="text-white text-2xl font-bold">
          {score.toString().padStart(10, '0')}
        </div>
        {activePowerUp && (
          <div className="text-yellow-300 text-lg font-bold">
            {getPowerUpDisplayText(activePowerUp)}
          </div>
        )}
        <button onClick={onToggleSound} className="text-white">
          {isSoundOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default HUD;

