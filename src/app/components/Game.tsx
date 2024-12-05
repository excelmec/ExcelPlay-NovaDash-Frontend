'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import p5 from 'p5'

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)

  const sketch = useCallback((p: p5) => {
    let spaceshipLaneIndex = 1 // Start in the center lane
    const lanes = [50, 150, 250] // X positions for 3 lanes
    let baseSpeed = 3 // Initial speed of obstacles
    let speedMultiplier = 1 // Speed multiplier for increasing difficulty
    let obstacles: { x: number; y: number; type: 'asteroid' | 'powerup' }[] = []
    let bullets: { x: number; y: number }[] = []
    let spaceship: p5.Image
    let asteroidImg: p5.Image
    let powerupImg: p5.Image
    let explosionImg: p5.Image
    let retroFont: p5.Font
    let points = 0
    let lives = 3
    let gameOver = false
    let level = 1
    let shootCooldown = 0
    let powerupActive = false
    let powerupTimer = 0

    p.preload = () => {
      spaceship = p.loadImage('/spaceship.png')
      asteroidImg = p.loadImage('/asteroid.png')
      powerupImg = p.loadImage('/powerup.png')
      explosionImg = p.loadImage('/explosion.png')
      retroFont = p.loadFont('/PressStart2P.ttf')
    }

    p.setup = () => {
      p.createCanvas(400, 600)
      p.imageMode(p.CENTER)
      p.textFont(retroFont)
    }

    p.draw = () => {
      if (gameOver) {
        drawGameOver()
        return
      }

      drawBackground()
      drawLanes()
      drawSpaceship()
      handleObstacles()
      handleBullets()
      handlePowerup()
      updateAndDrawHUD()

      // Increase difficulty over time
      if (p.frameCount % 600 === 0) {
        level++
        speedMultiplier += 0.1
      }
    }

    const drawBackground = () => {
      p.background(0)
      // Draw stars
      for (let i = 0; i < 50; i++) {
        p.fill(255)
        p.ellipse(p.random(p.width), p.random(p.height), 2, 2)
      }
    }

    const drawLanes = () => {
      p.stroke(100)
      lanes.forEach((x) => p.line(x, 0, x, p.height))
    }

    const drawSpaceship = () => {
      p.image(spaceship, lanes[spaceshipLaneIndex], p.height - 50, 40, 40)
    }

    const handleObstacles = () => {
      // Generate obstacles
      if (p.frameCount % 60 === 0) {
        const laneIndex = p.floor(p.random(0, lanes.length))
        const type = p.random() > 0.9 ? 'powerup' : 'asteroid'
        obstacles.push({ x: lanes[laneIndex], y: 0, type })
      }

      // Move and draw obstacles
      obstacles.forEach((obstacle, index) => {
        const img = obstacle.type === 'asteroid' ? asteroidImg : powerupImg
        p.image(img, obstacle.x, obstacle.y, 30, 30)
        obstacle.y += baseSpeed * speedMultiplier

        // Collision detection
        if (
          obstacle.y > p.height - 70 &&
          obstacle.y < p.height - 30 &&
          obstacle.x === lanes[spaceshipLaneIndex]
        ) {
          if (obstacle.type === 'asteroid') {
            lives--
            if (lives <= 0) {
              gameOver = true
              p.noLoop()
            }
          } else {
            activatePowerup()
          }
          obstacles.splice(index, 1)
        }
      })

      // Remove obstacles that are out of view
      obstacles = obstacles.filter((obstacle) => obstacle.y < p.height)
    }

    const handleBullets = () => {
      bullets.forEach((bullet, index) => {
        p.fill(0, 255, 0)
        p.rect(bullet.x - 2, bullet.y, 4, 10)
        bullet.y -= 10

        // Check for collision with asteroids
        obstacles.forEach((obstacle, obstacleIndex) => {
          if (
            obstacle.type === 'asteroid' &&
            p.dist(bullet.x, bullet.y, obstacle.x, obstacle.y) < 20
          ) {
            // Show explosion
            p.image(explosionImg, obstacle.x, obstacle.y, 40, 40)
            obstacles.splice(obstacleIndex, 1)
            bullets.splice(index, 1)
            points += 10
          }
        })
      })

      // Remove bullets that are out of view
      bullets = bullets.filter((bullet) => bullet.y > 0)

      // Decrease shoot cooldown
      if (shootCooldown > 0) shootCooldown--
    }

    const handlePowerup = () => {
      if (powerupActive) {
        powerupTimer--
        if (powerupTimer <= 0) {
          powerupActive = false
          baseSpeed = 3
        }
      }
    }

    const activatePowerup = () => {
      powerupActive = true
      powerupTimer = 300 // 5 seconds at 60 fps
      baseSpeed = 1 // Slow down obstacles
    }

    const updateAndDrawHUD = () => {
      p.fill(255)
      p.textSize(16)
      p.text(`SCORE: ${points}`, 10, 20)
      p.text(`LIVES: ${lives}`, 10, 40)
      p.text(`LEVEL: ${level}`, 10, 60)

      if (powerupActive) {
        p.fill(0, 255, 0)
        p.text('POWER-UP ACTIVE!', p.width / 2 - 60, 20)
      }
    }

    const drawGameOver = () => {
      p.background(0)
      p.fill(255)
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(32)
      p.text('GAME OVER', p.width / 2, p.height / 2 - 40)
      p.textSize(16)
      p.text(`FINAL SCORE: ${points}`, p.width / 2, p.height / 2)
      p.text(`LEVEL REACHED: ${level}`, p.width / 2, p.height / 2 + 30)
      p.text('PRESS SPACE TO RESTART', p.width / 2, p.height / 2 + 60)
    }

    const changeLane = (direction: number) => {
      spaceshipLaneIndex = p.constrain(spaceshipLaneIndex + direction, 0, lanes.length - 1)
    }

    const shoot = () => {
      if (shootCooldown === 0) {
        bullets.push({ x: lanes[spaceshipLaneIndex], y: p.height - 70 })
        shootCooldown = 15 // Set cooldown to prevent rapid firing
      }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') changeLane(-1)
      if (event.key === 'ArrowRight') changeLane(1)
      if (event.key === ' ') {
        if (gameOver) {
          // Restart game
          resetGame()
        } else {
          shoot()
        }
      }
    }

    const resetGame = () => {
      spaceshipLaneIndex = 1
      baseSpeed = 3
      speedMultiplier = 1
      obstacles = []
      bullets = []
      points = 0
      lives = 3
      gameOver = false
      level = 1
      shootCooldown = 0
      powerupActive = false
      powerupTimer = 0
      p.loop()
    }

    // Touch events for mobile swipe gestures
    let touchStartX = 0
    p.touchStarted = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX
      return false
    }

    p.touchEnded = (event: TouchEvent) => {
      const touchEndX = event.changedTouches[0].clientX
      const swipeDistance = touchEndX - touchStartX

      if (swipeDistance > 50) {
        changeLane(1) // Move spaceship to the right
      } else if (swipeDistance < -50) {
        changeLane(-1) // Move spaceship to the left
      } else {
        shoot() // Tap to shoot
      }
      return false
    }

    // Attach event listener for keyboard controls
    window.addEventListener('keydown', handleKeyPress)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  useEffect(() => {
    // Attach p5 instance to the div
    const p5Instance = new p5(sketch, gameRef.current!)

    // Cleanup p5 instance on unmount
    return () => {
      p5Instance.remove()
    }
  }, [sketch])

  return <div ref={gameRef} className="w-full h-full"></div>
}

export default Game

