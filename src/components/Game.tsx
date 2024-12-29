"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import p5 from "p5";
import gsap from "gsap";
import Image from "next/image";
import SoundOn from "@/assets/icons/sound_on.svg";
import SoundOff from "@/assets/icons/sound_off.svg";
import { GameOverModal } from "@/components/GameOverModel";

interface GameProps {
  selectedShip: { src: string; alt: string };
}

const Game: React.FC<GameProps> = ({ selectedShip }) => {
  const router = useRouter();
  const gameRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<ExtendedP5 | null>(null);
  const spaceshipRef = useRef<p5.Image | null>(null);
  const [backgroundMusic, setBackgroundMusic] =
    useState<HTMLAudioElement | null>(null);
  const [shootSound, setShootSound] = useState<HTMLAudioElement | null>(null);
  const [gameOverSound, setGameOverSound] = useState<HTMLAudioElement | null>(
    null
  );
  const [powerUpSound, setPowerUpSound] = useState<HTMLAudioElement | null>(null);
  const isSoundOnRef = useRef(true);
  const [score, setScore] = useState("0000000000");
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const toggleSoundWithoutRestart = useCallback(() => {
    isSoundOnRef.current = !isSoundOnRef.current;
    if (backgroundMusic) {
      if (isSoundOnRef.current) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    }
  }, [backgroundMusic]);

  const fadeOutBackgroundMusic = useCallback(() => {
    if (backgroundMusic) {
      const fadeInterval = setInterval(() => {
        if (backgroundMusic.volume > 0.1) {
          backgroundMusic.volume -= 0.1;
        } else {
          backgroundMusic.pause();
          backgroundMusic.volume = 1;
          clearInterval(fadeInterval);
        }
      }, 100);
    }
  }, [backgroundMusic]);

  const resetGame = useCallback(() => {
    setShowGameOverModal(false);
    setScore("0000000000");
    setFinalScore(0);
    if (p5Ref.current) {
      const p = p5Ref.current;
      p.resetGameState();
      p.clear();
      p.setup();
      p.loop();
    }
    if (backgroundMusic && isSoundOnRef.current) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.volume = 1;
      backgroundMusic.play();
    }
  }, [backgroundMusic, isSoundOnRef]);

  interface ExtendedP5 extends p5 {
    resetGameState: () => void;
  }

  const sketch = useCallback(
    (p: ExtendedP5) => {
      p5Ref.current = p;
      const isClient = typeof window !== "undefined";
      let spaceshipLaneIndex = 1;
      const lanes = [100, 200, 300, 400];
      const baseSpeed = 2;
      let speedMultiplier = 1;
      const MAX_BULLET_SPEED = 20;
      const BASE_ENEMY_SHOOT_INTERVAL = Math.floor(120 / Math.sqrt(speedMultiplier));
      const MIN_ENEMY_SHOOT_INTERVAL = 60;
      let obstacles: { x: number; y: number; type: string }[] = [];
      let bullets: { x: number; y: number; isEnemy: boolean }[] = [];
      let enemySpaceships: { x: number; y: number; lane: number }[] = [];
      let explosions: { x: number; y: number; frame: number; size: number }[] = [];
      let enemySpaceshipImg: p5.Image;
      let explosionImg: p5.Image;
      let asteroidImg: p5.Image;
      let powerUpImg: p5.Image;
      let retroFont: p5.Font;
      let points = 0;
      let gameOver = false;
      let shootCooldown = 0;
      let stars: { x: number; y: number; speed: number }[] = [];
      let lastSpeedIncreaseScore = 0;
      let touchStartX = 0;
      let powerUps: { x: number; y: number; type: string }[] = [];
      let activePowerUp: string | null = null;
      let powerUpDuration = 0;
      let collisionState = false;
      let collisionTimer = 0;
      const COLLISION_DURATION = 30; // 1 second at 60 fps
      let powerUpMessage: string | null = null;
      let powerUpMessageTimer = 0;
      

      p.resetGameState = () => {
        spaceshipLaneIndex = 1;
        speedMultiplier = 1;
        obstacles = [];
        bullets = [];
        enemySpaceships = [];
        explosions = [];
        points = 0;
        gameOver = false;
        shootCooldown = 0;
        lastSpeedIncreaseScore = 0;
        powerUps = [];
        activePowerUp = null;
        powerUpDuration = 0;
        stars = [];
        collisionState = false;
        collisionTimer = 0;
        powerUpMessage = null;
        powerUpMessageTimer = 0;
        createStars();
      };

      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") changeLane(-1);
        if (event.key === "ArrowRight") changeLane(1);
        if (event.key === " ") {
          if (!gameOver) {
            shoot();
          }
        }
      };

      if (isClient) {
        window.addEventListener("keydown", handleKeyPress);
      }

      p.preload = () => {
        spaceshipRef.current = p.loadImage(selectedShip.src);
        enemySpaceshipImg = p.loadImage("/enemy.gif");
        explosionImg = p.loadImage("/explosion.png");
        asteroidImg = p.loadImage("/asteroid.png");
        powerUpImg = p.loadImage("/powerup.gif");
        retroFont = p.loadFont("/Pixeboy.ttf");
      };

      p.setup = () => {
        p.createCanvas(500, p.windowHeight);
        p.imageMode(p.CENTER);
        p.textFont(retroFont);
        createStars();
        gsap.set(spaceshipRef.current, { x: lanes[spaceshipLaneIndex] });
      };

      const createStars = () => {
        p.stroke(255, 0, 0);
        for (let i = 0; i < 100; i++) {
          stars.push({
            x: p.random(p.width),
            y: p.random(p.height),
            speed: p.random(1, 3),
          });
        }
      };

      const createPowerUp = () => {
        if (p.random(1) < 0.05) {
          const laneIndex = p.floor(p.random(0, lanes.length));
          const powerUpType = p.random(["slow", "multiplier", "shield"]);
          powerUps.push({
            x: lanes[laneIndex],
            y: 0,
            type: powerUpType,
          });
        }
      };

      const updateStars = () => {
        stars.forEach((star) => {
          star.y += star.speed * speedMultiplier;
          if (star.y > p.height) {
            star.y = 0;
            star.x = p.random(p.width);
          }
        });
      };

      const drawStars = () => {
        p.fill(255, 255, 255, 128);
        p.noStroke();
        stars.forEach((star) => {
          const size = star.speed * 0.8;
          p.ellipse(star.x, star.y, size, size);
        });
      };

      const checkAndUpdateGameSpeed = () => {
        const scoreThresholds = [100, 200, 400, 800, 1000, 2500, 9000];
        const currentThreshold = scoreThresholds.find(
          (threshold) =>
            points >= threshold && threshold > lastSpeedIncreaseScore
        );

        if (currentThreshold) {
          speedMultiplier *= 1.5;
          lastSpeedIncreaseScore = currentThreshold;
        }
      };

      p.draw = () => {
        drawBackground();
        updateStars();
        drawStars();
        drawSpaceship();
        handleObstacles();
        handlePowerUps();
        handleEnemySpaceships();
        handleBullets();
        handleExplosions();
        updateAndDrawHUD();
        drawPowerUpMessage();

        if (collisionState) {
          collisionTimer--;
          if (collisionTimer <= 0) {
            collisionState = false;
            gameOver = true;
            fadeOutBackgroundMusic();
            if (gameOverSound && isSoundOnRef.current) {
              gameOverSound.play();
            }
            p.noLoop();
            setFinalScore(Math.floor(points));
            setShowGameOverModal(true);
          }
        }

        if (!gameOver) {
          points += 0.01 * speedMultiplier;
          checkAndUpdateGameSpeed();
        }
      };

      const drawBackground = () => {
        p.background(0, 0, 0);
      };

      const drawSpaceship = () => {
        if (spaceshipRef.current) {
          const x =
            (gsap.getProperty(spaceshipRef.current, "x") as number) ||
            lanes[spaceshipLaneIndex];
          
          if (collisionState && p.frameCount % 10 < 5) {
            p.tint(255, 0, 0); // Red tint
          }
          p.image(spaceshipRef.current, x, p.height - 50, 80, 100);
          p.noTint(); // Reset tint
        }
      };

      const checkCollision = (
        obj1: { x: number; y: number },
        obj2: { x: number; y: number },
        distance: number
      ): boolean => {
        const spaceshipWidth = 80; // Width of the spaceship
        const xDist = Math.abs(obj1.x - obj2.x);
        const yDist = Math.abs(obj1.y - obj2.y);
        return xDist < spaceshipWidth / 2 + distance / 2 && yDist < distance;
      };

      const handleObstacles = () => {
        if (p.frameCount % 90 === 0) {
          const laneIndex = p.floor(p.random(0, lanes.length));
          const newAsteroid = {
            x: lanes[laneIndex],
            y: 0,
            type: "asteroid" as const,
          };

          const isOverlapping = [...obstacles, ...enemySpaceships].some((obj) =>
            checkCollision(newAsteroid, obj, 80)
          );

          if (!isOverlapping) {
            obstacles.push(newAsteroid);
          }
        }

        obstacles.forEach((obstacle, index) => {
          if (obstacle.type === "asteroid") {
            p.image(asteroidImg, obstacle.x, obstacle.y, 30, 30);
          }
          obstacle.y += baseSpeed * speedMultiplier * 0.5;

          if (checkCollision(
            { x: lanes[spaceshipLaneIndex], y: p.height - 50 },
            { x: obstacle.x, y: obstacle.y },
            30
          )) {
            if (obstacle.type === "asteroid") {
              if (activePowerUp === "shield") {
                createExplosion(obstacle.x, obstacle.y);
                obstacles.splice(index, 1);
                deactivatePowerUp();
              } else if (!collisionState) {
                collisionState = true;
                collisionTimer = COLLISION_DURATION;
                createExplosion(lanes[spaceshipLaneIndex], p.height - 50);
              }
            }
          }
        });

        obstacles = obstacles.filter((obstacle) => obstacle.y < p.height);
      };

      const handlePowerUps = () => {
        if (p.frameCount % 300 === 0) {
          createPowerUp();
        }

        powerUps.forEach((powerUp, index) => {
          p.image(powerUpImg, powerUp.x, powerUp.y, 30, 30);
          powerUp.y += baseSpeed * speedMultiplier * 0.5;

          if (
            powerUp.y > p.height - 70 &&
            powerUp.y < p.height - 30 &&
            powerUp.x === lanes[spaceshipLaneIndex]
          ) {
            activatePowerUp(powerUp.type);
            powerUps.splice(index, 1);
          }
        });

        powerUps = powerUps.filter((powerUp) => powerUp.y < p.height);

        if (activePowerUp) {
          powerUpDuration--;
          if (powerUpDuration <= 0) {
            deactivatePowerUp();
          }
        }
      };

      const handleEnemySpaceships = () => {
        if (p.frameCount % 120 === 0 && enemySpaceships.length === 0) {
          const availableLanes = [0, 1, 2].filter(
            (lane) => !enemySpaceships.some((enemy) => enemy.lane === lane)
          );

          if (availableLanes.length > 0) {
            const laneIndex =
              availableLanes[Math.floor(p.random(0, availableLanes.length))];
            const newEnemy = { x: lanes[laneIndex], y: 0, lane: laneIndex };

            const isOverlapping = obstacles.some((obj) =>
              checkCollision(newEnemy, obj, 80)
            );

            if (!isOverlapping) {
              enemySpaceships.push(newEnemy);
            }
          }
        }

        enemySpaceships.forEach((enemy, index) => {
          p.image(enemySpaceshipImg, enemy.x, enemy.y, 90, 90);
          enemy.y += baseSpeed * speedMultiplier * 0.5;

          if (p.frameCount % BASE_ENEMY_SHOOT_INTERVAL === 0) {
            const adjustedInterval = Math.max(BASE_ENEMY_SHOOT_INTERVAL, MIN_ENEMY_SHOOT_INTERVAL);
            if (p.random(1) < (BASE_ENEMY_SHOOT_INTERVAL / adjustedInterval)) {
              bullets.push({ x: enemy.x, y: enemy.y + 20, isEnemy: true });
            }
          }

          if (checkCollision(
            { x: lanes[spaceshipLaneIndex], y: p.height - 50 },
            { x:enemy.x, y: enemy.y },
            45
          ) && !collisionState) {
            collisionState = true;
            collisionTimer = COLLISION_DURATION;
            createExplosion(lanes[spaceshipLaneIndex], p.height - 50);
            enemySpaceships.splice(index, 1);
          }
        });

        enemySpaceships = enemySpaceships.filter((enemy) => enemy.y < p.height);
      };

      const handleBullets = () => {
        bullets.forEach((bullet, index) => {
          p.fill(bullet.isEnemy ? 255 : 0, bullet.isEnemy ? 0 : 255, 0);
          p.rect(bullet.x - 2, bullet.y, 4, 10);
          const bulletSpeed = Math.min(
            (bullet.isEnemy ? 5 * Math.sqrt(speedMultiplier) : -10 * Math.sqrt(speedMultiplier)),
            MAX_BULLET_SPEED
          );
          bullet.y += bulletSpeed;

          if (!bullet.isEnemy) {
            enemySpaceships.forEach((enemy, enemyIndex) => {
              if (p.dist(bullet.x, bullet.y, enemy.x, enemy.y) < 30) {
                createExplosion(enemy.x, enemy.y);
                enemySpaceships.splice(enemyIndex, 1);
                bullets.splice(index, 1);
                points += 50;
              }
            });

            obstacles.forEach((obstacle) => {
              if (
                obstacle.type === "asteroid" &&
                p.dist(bullet.x, bullet.y, obstacle.x, obstacle.y) < 15
              ) {
                bullets.splice(index, 1);
              }
            });
          } else {
            if (bullet.isEnemy && checkCollision(
              { x: lanes[spaceshipLaneIndex], y: p.height - 50 },
              { x: bullet.x, y: bullet.y },
              20
            ) && !collisionState) {
              collisionState = true;
              collisionTimer = COLLISION_DURATION;
              createExplosion(lanes[spaceshipLaneIndex], p.height - 50);
              bullets.splice(index, 1);
            }
          }
        });

        bullets = bullets.filter(
          (bullet) => bullet.y > 0 && bullet.y < p.height
        );

        if (shootCooldown > 0) shootCooldown--;
      };

      const createExplosion = (x: number, y: number) => {
        explosions.push({
          x: x,
          y: y,
          frame: 0,
          size: 60,
        });
      };

      const handleExplosions = () => {
        explosions.forEach((explosion, index) => {
          const alpha = p.map(explosion.frame, 0, 30, 255, 0);
          p.tint(255, alpha);
          p.image(
            explosionImg,
            explosion.x,
            explosion.y,
            explosion.size,
            explosion.size
          );
          p.noTint();
          explosion.frame++;
          if (explosion.frame > 30) {
            explosions.splice(index, 1);
          }
        });
      };

      const activatePowerUp = (type: string) => {
        activePowerUp = type;
        powerUpDuration = 600;
        if (powerUpSound && isSoundOnRef.current) {
          powerUpSound.currentTime = 0;
          powerUpSound.play();
        }
        powerUpMessage = getPowerUpDisplayText(type);
        powerUpMessageTimer = 180; // 3 seconds at 60 fps
        switch (type) {
          case "slow":
            speedMultiplier *= 0.5;
            break;
          case "multiplier":
            break;
          case "shield":
            break;
        }
      };

      const deactivatePowerUp = () => {
        switch (activePowerUp) {
          case "slow":
            speedMultiplier *= 2;
            break;
        }
        activePowerUp = null;
      };

      const getPowerUpDisplayText = (powerUp: string | null): string => {
        switch (powerUp) {
          case "slow":
            return "SLOW TIME";
          case "multiplier":
            return "2X SCORE";
          case "shield":
            return "SHIELD";
          default:
            return "";
        }
      };

    

const showPowerUpMessage = (message: string) => {
  powerUpMessage = message;
  powerUpMessageTimer = 120; // 3 seconds at 60 FPS
};

const drawPowerUpMessage = () => {
  if (powerUpMessage && powerUpMessageTimer > 0) {
    const isBlinking = Math.floor(powerUpMessageTimer / 10) % 2 === 0; // Alternate blinking
    if (isBlinking) {
      p.fill(255, 255, 0); // Yellow color
      p.textSize(28);
      p.textAlign(p.CENTER, p.TOP);
      p.text(powerUpMessage, p.width / 2, 100);
    }
    powerUpMessageTimer--;
    if (powerUpMessageTimer <= 0) {
      powerUpMessage = ""; // Clear the message after 3 seconds
    }
  }
};


      const updateAndDrawHUD = () => {
        const scoreMultiplier = activePowerUp === "multiplier" ? 2 : 1;
        const newScore = Math.floor(points * scoreMultiplier)
          .toString()
          .padStart(10, "0");
        setScore(newScore);
        return newScore;
      };

      p.mousePressed = () => {
        handleSoundToggle();
        return false;
      };

      p.touchStarted = () => {
        handleSoundToggle();
        return false;
      };

      const handleSoundToggle = () => {
        const iconSize = 30;
        const iconX = p.width - iconSize - 10;
        const iconY = 10;
        if (
          (p.mouseX > iconX && p.mouseX < iconX + iconSize && p.mouseY > iconY && p.mouseY < iconY + iconSize) ||
          (p.touches && p.touches[0] && (p.touches[0] as Touch).clientX > iconX && (p.touches[0] as Touch).clientX < iconX + iconSize && (p.touches[0] as Touch).clientY > iconY && (p.touches[0] as Touch).clientY < iconY + iconSize)
        ) {
          toggleSoundWithoutRestart();
        }
      };

      const changeLane = (direction: number) => {
        const newLaneIndex = p.constrain(
          spaceshipLaneIndex + direction,
          0,
          lanes.length - 1
        );
        if (newLaneIndex !== spaceshipLaneIndex) {
          const currentX = lanes[spaceshipLaneIndex];
          const targetX = lanes[newLaneIndex];
          gsap.to(spaceshipRef.current, {
            x: targetX,
            duration: 0.3,
            ease: "power2.out",
          });
          spaceshipLaneIndex = newLaneIndex;
        }
      };

      const shoot = () => {
        if (shootCooldown === 0) {
          bullets.push({
            x: lanes[spaceshipLaneIndex],
            y: p.height - 70,
            isEnemy: false,
          });
          shootCooldown = 15;
          if (shootSound && isSoundOnRef.current) {
            shootSound.currentTime = 0;
            shootSound.play();
          }
        }
      };

      p.touchStarted = (event: TouchEvent) => {
        if (event.touches && event.touches[0]) {
          touchStartX = event.touches[0].clientX;
        }
        return false;
      };

      p.touchEnded = (event: TouchEvent) => {
        if (event.changedTouches && event.changedTouches[0]) {
          const touchEndX = event.changedTouches[0].clientX;
          const swipeDistance = touchEndX - touchStartX;

          if (swipeDistance > 50) {
            changeLane(1);
          } else if (swipeDistance < -50) {
            changeLane(-1);
          } else {
            shoot();
          }
        }
        return false;
      };

      return () => {
        if (isClient) {
          window.removeEventListener("keydown", handleKeyPress);
        }
      };
    },
    [
      selectedShip,
      isSoundOnRef,
      fadeOutBackgroundMusic,
      backgroundMusic,
      gameOverSound,
      shootSound,
      powerUpSound,
      resetGame,
    ]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/background-track.mp3");
      audio.loop = true;
      setBackgroundMusic(audio);
    }
  }, []);

  useEffect(() => {
    if (backgroundMusic) {
      if (isSoundOnRef.current) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    }
  }, [isSoundOnRef, backgroundMusic]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShootSound(new Audio("/shoot.mp3"));
      setGameOverSound(new Audio("/game-over.mp3"));
      setPowerUpSound(new Audio("/powerup.mp3"));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p5Instance = new p5(sketch, gameRef.current!);

      return () => {
        p5Instance.remove();
      };
    }
  }, [sketch, resetGame]);

  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      <div ref={gameRef} className="relative max-w-[500px] h-full w-full">
        <div className="w-full navBorder max-h-[82px] h-full absolute z-10 top-0">
          <div className="flex items-center justify-between px-[21px] py-2 backdrop-blur-[12px] w-full max-h-[96px] h-full navStyle ">
            <div className="font-pixeboy text-[36px] text-white pt-[6px]">
              {score}
            </div>
            <button
              onClick={toggleSoundWithoutRestart}
              onTouchStart={toggleSoundWithoutRestart}
              className="p-2 rounded-lg touch-action-none"
            >
              {isSoundOnRef.current ? (
                <Image src={SoundOn} alt="On" />
              ) : (
                <Image src={SoundOff} alt="Off" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <GameOverModal
          isOpen={showGameOverModal}
          score={finalScore}
          onPlayAgain={resetGame}
          onGoHome={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default Game;

