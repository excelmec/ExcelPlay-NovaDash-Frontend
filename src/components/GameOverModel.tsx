import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  onPlayAgain,
  onGoHome,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="borderGradient flex transition-all overflow-hidden w-full max-w-[300px] h-full min-h-[224px]">
                <div className="specialBg flex justify-center items-center flex-col w-full h-full min-h-[228px] mt-[-4px]">
                  <Dialog.Title
                    as="h3"
                    className="text-[45px] font-medium font-pixeboy text-white w-full"
                  >
                    Game Over
                  </Dialog.Title>

                  <div className="flex justify-center items-center flex-col gap-[4px]">
                    <div className="flex justify-center items-center flex-col">
                      <p className="text-[18px] text-cherryPink_text font-normal font-pixeboy">
                        You scored: {score}
                      </p>
                      <p className="text-[18px] text-cherryPink_text font-normal font-pixeboy mt-[-5px]">
                        Your rank: 20XX
                      </p>
                      <p className="text-[18px] text-cherryPink_text font-normal font-pixeboy mt-[-5px]">
                        Your high score: 43XX
                      </p>
                    </div>

                    <div className="flex justify-center items-center flex-col gap-0">
                      <button
                        type="button"
                        className="text-[16px] text-[#3094CF] font-normal font-pixeboy underline underline-offset-2"
                        onClick={onPlayAgain}
                      >
                        Play Again
                      </button>
                      <button
                        type="button"
                        className="text-[16px] text-[#3094CF] font-normal font-pixeboy underline underline-offset-2 mt-[-2px]"
                        onClick={onGoHome}
                      >
                        Go Home
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
