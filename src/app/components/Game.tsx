import React, { useRef, useEffect, useCallback } from 'react';
import p5 from 'p5';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  const sketch = useCallback((p: p5) => {
    let spaceshipLaneIndex = 1; // Start in the center lane
    const lanes = [50, 150, 250]; // X positions for 3 lanes
    let baseSpeed = 5; // Initial speed of obstacles
    let speedMultiplier = 1; // Speed multiplier for increasing difficulty
    let obstacles: { x: number; y: number }[] = [];
    let spaceship: p5.Image;
    let points = 0;
    let gameOver = false;

    p.preload = () => {
      spaceship = p.loadImage('/spaceship.png'); // Ensure a pixel-style spaceship image is available
    };

    p.setup = () => {
      p.createCanvas(400, 600);
      p.imageMode(p.CENTER);
    };

    p.draw = () => {
      if (gameOver) {
        p.background(0);
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(32);
        p.text('Game Over', p.width / 2, p.height / 2 - 20);
        p.textSize(16);
        p.text(`Points: ${points}`, p.width / 2, p.height / 2 + 20);
        return;
      }

      p.background(0);

      // Draw lanes
      p.stroke(255);
      lanes.forEach((x) => p.line(x, 0, x, p.height));

      // Draw spaceship
      p.image(spaceship, lanes[spaceshipLaneIndex], p.height - 100, 40, 40);

      // Generate obstacles
      if (p.frameCount % 60 === 0) {
        const laneIndex = p.floor(p.random(0, lanes.length));
        obstacles.push({ x: lanes[laneIndex], y: 0 });
      }

      // Move and draw obstacles
      obstacles.forEach((obstacle) => {
        p.fill(255, 0, 0);
        p.rect(obstacle.x - 20, obstacle.y, 40, 40);
        obstacle.y += baseSpeed * speedMultiplier;

        // Collision detection
        if (
          obstacle.y > p.height - 120 &&
          obstacle.y < p.height - 80 &&
          obstacle.x === lanes[spaceshipLaneIndex]
        ) {
          gameOver = true;
          p.noLoop();
        }
      });

      // Remove obstacles that are out of view
      obstacles = obstacles.filter((obstacle) => obstacle.y < p.height);

      // Increase difficulty and points over time
      points++;
      if (p.frameCount % 600 === 0) {
        // Every 10 seconds (60 fps)
        speedMultiplier += 0.1; // Increase speed multiplier
      }

      // Display points
      p.fill(255);
      p.textSize(16);
      p.text(`Points: ${points}`, p.width - 80, 30);
    };

    // Handle lane change
    const changeLane = (direction: number) => {
      spaceshipLaneIndex = p.constrain(spaceshipLaneIndex + direction, 0, lanes.length - 1);
    };

    // Keyboard controls for lane changing
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') changeLane(-1);
      if (event.key === 'ArrowRight') changeLane(1);
    };

    // Attach event listener for keyboard controls
    window.addEventListener('keydown', handleKeyPress);

    // Touch events for mobile swipe gestures
    let touchStartX = 0;
    p.touchStarted = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX;
      return false;
    };

    p.touchEnded = (event: TouchEvent) => {
      const touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (swipeDistance > 50) {
        // Swipe right
        changeLane(1); // Move spaceship to the right
      } else if (swipeDistance < -50) {
        // Swipe left
        changeLane(-1); // Move spaceship to the left
      }
      return false;
    };

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    // Attach p5 instance to the div
    const p5Instance = new p5(sketch, gameRef.current!);

    // Cleanup p5 instance on unmount
    return () => {
      p5Instance.remove();
    };
  }, [sketch]);

  return <div ref={gameRef} className="w-full h-full"></div>;
};

export default Game;
