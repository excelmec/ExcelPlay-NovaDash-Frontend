'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import p5 from 'p5'

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)

  const sketch = useCallback((p: p5) => {
    let spaceshipLaneIndex = 1 // Start in the center lane
    const lanes = [50, 150, 250, 350] // X positions for 4 lanes
    let baseSpeed = 3 // Initial speed of obstacles
    let speedMultiplier = 1 // Speed multiplier for increasing difficulty
    let obstacles: { x: number; y: number; type: string }[] = []
    let bullets: { x: number; y: number; isEnemy: boolean }[] = []
    let enemySpaceships: { x: number; y: number; lane: number }[] = []
    let explosions: { x: number; y: number; frame: number }[] = []
    let spaceship: p5.Image
    let enemySpaceshipImg: p5.Image
    let powerupSlowImg: p5.Image
    let powerupShootImg: p5.Image
    let explosionImg: p5.Image
    let retroFont: p5.Font
    let points = 0
    let gameOver = false
    let level = 1
    let shootCooldown = 0
    let powerupActive = false
    let powerupTimer = 0

    p.preload = () => {
      spaceship = p.loadImage('/spaceship.png')
      enemySpaceshipImg = p.loadImage('/enemy-spaceship.png')
      powerupSlowImg = p.loadImage('/powerup.png')
      powerupShootImg = p.loadImage('/powerup.png')
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
      handleEnemySpaceships()
      handleBullets()
      handleExplosions()
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
      if (p.frameCount % 120 === 0) {
        const laneIndex = p.floor(p.random(0, lanes.length))
        if (p.random() > 0.7) {
          enemySpaceships.push({ x: lanes[laneIndex], y: 0, lane: laneIndex })
        } else {
          const type = p.random() > 0.5 ? 'powerup-slow' : 'powerup-shoot'
          obstacles.push({ x: lanes[laneIndex], y: 0, type })
        }
      }

      // Move and draw obstacles
      obstacles.forEach((obstacle, index) => {
        const img = obstacle.type === 'powerup-slow' ? powerupSlowImg : powerupShootImg
        p.image(img, obstacle.x, obstacle.y, 30, 30)
        obstacle.y += baseSpeed * speedMultiplier

        // Collision detection
        if (
          obstacle.y > p.height - 70 &&
          obstacle.y < p.height - 30 &&
          obstacle.x === lanes[spaceshipLaneIndex]
        ) {
          activatePowerup(obstacle.type)
          obstacles.splice(index, 1)
        }
      })

      // Remove obstacles that are out of view
      obstacles = obstacles.filter((obstacle) => obstacle.y < p.height)
    }

    const handleEnemySpaceships = () => {
      enemySpaceships.forEach((enemy, index) => {
        p.image(enemySpaceshipImg, enemy.x, enemy.y, 40, 40)
        enemy.y += baseSpeed * speedMultiplier * 0.5

        // Enemy shooting
        if (p.frameCount % 60 === 0 && p.random() > 0.7) {
          bullets.push({ x: enemy.x, y: enemy.y + 20, isEnemy: true })
        }

        // Enemy changing lanes
        if (p.frameCount % 180 === 0 && p.random() > 0.5) {
          const newLane = p.floor(p.random(0, lanes.length))
          enemy.lane = newLane
          enemy.x = lanes[newLane]
        }

        // Collision detection with player
        if (
          enemy.y > p.height - 70 &&
          enemy.y < p.height - 30 &&
          enemy.x === lanes[spaceshipLaneIndex]
        ) {
          createExplosion(enemy.x, enemy.y)
          enemySpaceships.splice(index, 1)
          gameOver = true
          p.noLoop()
        }
      })

      // Remove enemy spaceships that are out of view
      enemySpaceships = enemySpaceships.filter((enemy) => enemy.y < p.height)
    }

    const handleBullets = () => {
      bullets.forEach((bullet, index) => {
        p.fill(bullet.isEnemy ? 255 : 0, bullet.isEnemy ? 0 : 255, 0)
        p.rect(bullet.x - 2, bullet.y, 4, 10)
        bullet.y += bullet.isEnemy ? 5 : -10

        if (!bullet.isEnemy) {
          // Check for collision with enemy spaceships
          enemySpaceships.forEach((enemy, enemyIndex) => {
            if (p.dist(bullet.x, bullet.y, enemy.x, enemy.y) < 20) {
              createExplosion(enemy.x, enemy.y)
              enemySpaceships.splice(enemyIndex, 1)
              bullets.splice(index, 1)
              points += 20
            }
          })
        } else {
          // Check for collision with player
          if (
            bullet.y > p.height - 70 &&
            bullet.y < p.height - 30 &&
            bullet.x === lanes[spaceshipLaneIndex]
          ) {
            createExplosion(bullet.x, p.height - 50)
            bullets.splice(index, 1)
            gameOver = true
            p.noLoop()
          }
        }
      })

      // Remove bullets that are out of view
      bullets = bullets.filter((bullet) => bullet.y > 0 && bullet.y < p.height)

      // Decrease shoot cooldown
      if (shootCooldown > 0) shootCooldown--
    }

    const createExplosion = (x: number, y: number) => {
      explosions.push({ x, y, frame: 0 })
    }

    const handleExplosions = () => {
      explosions.forEach((explosion, index) => {
        p.image(explosionImg, explosion.x, explosion.y, 60, 60)
        explosion.frame++
        if (explosion.frame > 30) {
          explosions.splice(index, 1)
        }
      })
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

    const activatePowerup = (type: string) => {
      powerupActive = true
      powerupTimer = 300 // 5 seconds at 60 fps
      if (type === 'powerup-slow') {
        baseSpeed = 1 // Slow down obstacles
      } else if (type === 'powerup-shoot') {
        shootCooldown = 0 // Allow rapid firing
      }
    }

    const updateAndDrawHUD = () => {
      p.fill(255)
      p.textSize(16)
      p.text(`SCORE: ${points}`, 10, 20)
      p.text(`LEVEL: ${level}`, 10, 40)

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
        bullets.push({ x: lanes[spaceshipLaneIndex], y: p.height - 70, isEnemy: false })
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
      enemySpaceships = []
      explosions = []
      points = 0
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

