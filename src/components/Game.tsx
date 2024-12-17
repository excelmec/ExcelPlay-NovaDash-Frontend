"use client";

import StartPage from "./StartPage";
import ShipSelector from "./ShipSelector";

import React, { useRef, useEffect, useState, useCallback } from "react";
import p5 from "p5";

const Game: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = () => {
    setIsGameStarted(true);
  };

  const [selectedShip, setSelectedShip] = useState<{
    src: string;
    alt: string;
  }>({
    src: "/ship1.gif",
    alt: "Default Ship",
  });

  const handleShipSelect = (ship: { src: string; alt: string }) => {
    setSelectedShip(ship);
  };

  const gameRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const spaceshipRef = useRef<p5.Image | null>(null);

  const sketch = useCallback(
    (p: p5) => {
      p5Ref.current = p;
      let spaceshipLaneIndex = 1; // Start in the center lane
      const lanes = [100, 200, 300, 400]; // X positions for 3 lanes
      const baseSpeed = 2; // Initial speed of obstacles and enemies
      let speedMultiplier = 1; // Speed multiplier for increasing difficulty
      const MAX_BULLET_SPEED = 20; // Maximum speed for bullets
      const BASE_ENEMY_SHOOT_INTERVAL = 120; // Base interval for enemy shooting (in frames)
      const MIN_ENEMY_SHOOT_INTERVAL = 60; // Minimum interval for enemy shooting (in frames)
      let obstacles: { x: number; y: number; type: string }[] = [];
      let bullets: { x: number; y: number; isEnemy: boolean }[] = [];
      let enemySpaceships: { x: number; y: number; lane: number }[] = [];
      let explosions: { x: number; y: number; frame: number; size: number }[] = [];
      spaceshipRef.current = null;
      let enemySpaceshipImg: p5.Image;
      let explosionImg: p5.Image;
      let asteroidImg: p5.Image;
      let retroFont: p5.Font;
      let points = 0;
      let gameOver = false;
      let level = 1;
      let shootCooldown = 0;
      let stars: { x: number; y: number; speed: number }[] = [];
      let lastSpeedIncreaseScore = 0;
      let touchStartX = 0;

      p.preload = () => {
        enemySpaceshipImg = p.loadImage("/enemy.gif");
        explosionImg = p.loadImage("/explosion.png");
        asteroidImg = p.loadImage("/asteroid.png");
        retroFont = p.loadFont("/PressStart2P.ttf");
      };

      p.setup = () => {
        spaceshipRef.current = p.loadImage(`${selectedShip.src}`);
        p.createCanvas(500, p.windowHeight);
        p.imageMode(p.CENTER);
        p.textFont(retroFont);
        createStars();
      };

      const createStars = () => {
        for (let i = 0; i < 100; i++) {
          stars.push({
            x: p.random(p.width),
            y: p.random(p.height),
            speed: p.random(1, 3),
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
        p.fill(255);
        p.noStroke();
        stars.forEach((star) => {
          p.ellipse(star.x, star.y, 2, 2);
        });
      };

      const checkAndUpdateGameSpeed = () => {
        const scoreThresholds = [100, 200, 500, 1000,2500,   4000];
        const currentThreshold = scoreThresholds.find(
          (threshold) =>
            points >= threshold && threshold > lastSpeedIncreaseScore
        );

        if (currentThreshold) {
          speedMultiplier *= 1.5;
          lastSpeedIncreaseScore = currentThreshold;
          console.log(
            `Speed increased at score ${currentThreshold}. New multiplier: ${speedMultiplier}`
          );
        }
      };

      p.draw = () => {
        drawBackground();
        updateStars();
        drawStars();
        drawSpaceship();
        handleObstacles();
        handleEnemySpaceships();
        handleBullets();
        handleExplosions();
        updateAndDrawHUD();

        // Increase difficulty over time
        if (p.frameCount % 600 === 0) {
          level++;
          speedMultiplier += 0.1;
        }

        // Gradually increase score over time
        points += 0.01 * speedMultiplier;

        // Check and update game speed based on score
        checkAndUpdateGameSpeed();
      };

      const drawBackground = () => {
        p.background(0);
      };

      const drawSpaceship = () => {
        if (spaceshipRef.current) {
          p.image(spaceshipRef.current, lanes[spaceshipLaneIndex], p.height - 50, 60, 60);
        }
      };

      const checkCollision = (
        obj1: { x: number; y: number },
        obj2: { x: number; y: number },
        distance: number
      ): boolean => {
        return p.dist(obj1.x, obj1.y, obj2.x, obj2.y) < distance;
      };

      const handleObstacles = () => {
        // Generate asteroids
        if (p.frameCount % 90 === 0) {
          const laneIndex = p.floor(p.random(0, lanes.length));
          const newAsteroid = {
            x: lanes[laneIndex],
            y: 0,
            type: "asteroid" as const,
          };

          // Check if the new asteroid overlaps with existing obstacles or enemy spaceships
          const isOverlapping = [...obstacles, ...enemySpaceships].some((obj) =>
            checkCollision(newAsteroid, obj, 80)
          );

          if (!isOverlapping) {
            obstacles.push(newAsteroid);
          }
        }

        // Move and draw obstacles
        obstacles.forEach((obstacle, index) => {
          if (obstacle.type === "asteroid") {
            p.image(asteroidImg, obstacle.x, obstacle.y, 30, 30);
          }
          obstacle.y += baseSpeed * speedMultiplier * 0.5;

          // Collision detection
          if (
            obstacle.y > p.height - 70 &&
            obstacle.y < p.height - 30 &&
            obstacle.x === lanes[spaceshipLaneIndex]
          ) {
            if (obstacle.type === "asteroid") {
              createExplosion(obstacle.x, p.height - 50); // Create explosion at collision point
              gameOver = true;
              p.noLoop();
            }
          }
        });

        // Remove obstacles that are out of view
        obstacles = obstacles.filter((obstacle) => obstacle.y < p.height);
      };

      const handleEnemySpaceships = () => {
        // Generate enemy spaceships
        if (p.frameCount % 120 === 0 && enemySpaceships.length === 0) {
          const availableLanes = [0, 1, 2].filter(
            (lane) => !enemySpaceships.some((enemy) => enemy.lane === lane)
          );

          if (availableLanes.length > 0) {
            const laneIndex =
              availableLanes[Math.floor(p.random(0, availableLanes.length))];
            const newEnemy = { x: lanes[laneIndex], y: 0, lane: laneIndex };

            // Check if the new enemy overlaps with existing obstacles
            const isOverlapping = obstacles.some((obj) =>
              checkCollision(newEnemy, obj, 80)
            );

            if (!isOverlapping) {
              enemySpaceships.push(newEnemy);
            }
          }
        }

        enemySpaceships.forEach((enemy, index) => {
          p.image(enemySpaceshipImg, enemy.x, enemy.y, 60, 60);
          enemy.y += baseSpeed * speedMultiplier * 0.5;

          // Enemy shooting
          if (p.frameCount % BASE_ENEMY_SHOOT_INTERVAL === 0) {
            bullets.push({ x: enemy.x, y: enemy.y + 20, isEnemy: true });
          }

          // Collision detection with player
          if (
            enemy.y > p.height - 70 &&
            enemy.y < p.height - 30 &&
            enemy.x === lanes[spaceshipLaneIndex]
          ) {
            createExplosion(enemy.x, enemy.y);
            enemySpaceships.splice(index, 1);
            gameOver = true;
            p.noLoop();
          }
        });

        // Remove enemy spaceships that are out of view
        enemySpaceships = enemySpaceships.filter((enemy) => enemy.y < p.height);
      };

      const handleBullets = () => {
        bullets.forEach((bullet, index) => {
          p.fill(bullet.isEnemy ? 255 : 0, bullet.isEnemy ? 0 : 255, 0);
          p.rect(bullet.x - 2, bullet.y, 4, 10);
          const bulletSpeed = Math.min((bullet.isEnemy ? 5 : -10) * Math.sqrt(speedMultiplier), MAX_BULLET_SPEED);
          bullet.y += bulletSpeed;

          if (!bullet.isEnemy) {
            // Check for collision with enemy spaceships
            enemySpaceships.forEach((enemy, enemyIndex) => {
              if (p.dist(bullet.x, bullet.y, enemy.x, enemy.y) < 30) {
                createExplosion(enemy.x, enemy.y);
                enemySpaceships.splice(enemyIndex, 1);
                bullets.splice(index, 1);
                points += 20; // Increase score only when destroying an enemy spaceship
              }
            });

            // Check for collision with asteroids
            obstacles.forEach((obstacle) => {
              if (
                obstacle.type === "asteroid" &&
                p.dist(bullet.x, bullet.y, obstacle.x, obstacle.y) < 15
              ) {
                bullets.splice(index, 1);
              }
            });
          } else {
            // Check for collision with player
            if (
              bullet.y > p.height - 70 &&
              bullet.y < p.height - 30 &&
              bullet.x === lanes[spaceshipLaneIndex]
            ) {
              createExplosion(bullet.x, p.height - 50);
              bullets.splice(index, 1);
              gameOver = true;
              p.noLoop();
            }
          }
        });

        // Remove bullets that are out of view
        bullets = bullets.filter(
          (bullet) => bullet.y > 0 && bullet.y < p.height
        );

        // Decrease shoot cooldown
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

      const updateAndDrawHUD = () => {
        p.fill(255);
        p.textSize(16);
        p.text(`SCORE: ${Math.floor(points)}`, 10, 20);
        p.text(`LEVEL: ${level}`, 10, 40);
      };

      const changeLane = (direction: number) => {
        spaceshipLaneIndex = p.constrain(
          spaceshipLaneIndex + direction,
          0,
          lanes.length - 1
        );
      };

      const shoot = () => {
        if (shootCooldown === 0) {
          bullets.push({
            x: lanes[spaceshipLaneIndex],
            y: p.height - 70,
            isEnemy: false,
          });
          shootCooldown = 15; // Set cooldown to prevent rapid firing
        }
      };

      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft") changeLane(-1);
        if (event.key === "ArrowRight") changeLane(1);
        if (event.key === " ") {
          if (gameOver) {
            // Restart game
            resetGame();
          } else {
            shoot();
          }
        }
      };

      const resetGame = () => {
        spaceshipLaneIndex = 1;
        speedMultiplier = 1;
        obstacles = [];
        bullets = [];
        enemySpaceships = [];
        explosions = [];
        points = 0;
        gameOver = false;
        level = 1;
        shootCooldown = 0;
        lastSpeedIncreaseScore = 0;
        p.loop();
      };

      // Touch events for mobile swipe gestures
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
            changeLane(1); // Move spaceship to the right
          } else if (swipeDistance < -50) {
            changeLane(-1); // Move spaceship to the left
          } else {
            shoot(); // Tap to shoot
          }
        }
        return false;
      };

      // Attach event listener for keyboard controls
      window.addEventListener("keydown", handleKeyPress);

      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    },
    [selectedShip]
  );

  useEffect(() => {
    if (spaceshipRef.current && p5Ref.current) {
      spaceshipRef.current = p5Ref.current.loadImage(selectedShip.src);
    }
  }, [selectedShip, p5Ref]);

  useEffect(() => {
    if (isGameStarted) {
      new p5(sketch, gameRef.current!); // Initialize p5 with the sketch
    }
  }, [isGameStarted, sketch]);

  if (!isGameStarted) {
    return <StartPage onStart={startGame} />;
  }

  return (
    <div
      ref={gameRef}
      className="w-full h-screen flex items-center justify-center"
    ></div>
  );
};

export default Game;

