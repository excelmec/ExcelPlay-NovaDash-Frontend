'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import p5 from 'p5'

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)

  const sketch = useCallback((p: p5) => {
    let gameState = 'menu' // 'menu', 'playing', 'paused', 'gameOver'
    let spaceshipLaneIndex = 1
    let spaceshipY = 0
    const lanes = [100, 200, 300]
    const baseSpeed = 2
    let speedMultiplier = 1
    let obstacles: { x: number; y: number; type: string }[] = []
    let bullets: { x: number; y: number; isEnemy: boolean }[] = []
    let enemySpaceships: { x: number; y: number; lane: number }[] = []
    let explosions: { x: number; y: number; frame: number }[] = []
    let spaceship: p5.Image
    let enemySpaceshipImg: p5.Image
    let powerupSlowImg: p5.Image
    let explosionImg: p5.Image
    let asteroidImg: p5.Image
    let retroFont: p5.Font
    let points = 0
    let level = 1
    let shootCooldown = 0
    let powerupActive = false
    let powerupTimer = 0
    let lastPowerupTime = 0
    let stars: { x: number; y: number; speed: number }[] = []
    let lastSpeedIncreaseScore = 0
    let touchStartX = 0
    let touchStartY = 0

    p.preload = () => {
      spaceship = p.loadImage('/spaceship.png')
      enemySpaceshipImg = p.loadImage('/enemy-spaceship.png')
      powerupSlowImg = p.loadImage('/powerup.png')
      explosionImg = p.loadImage('/explosion.png')
      asteroidImg = p.loadImage('/asteroid.png')
      retroFont = p.loadFont('/PressStart2P.ttf')
    }

    p.setup = () => {
      p.createCanvas(400, 600)
      p.imageMode(p.CENTER)
      p.textFont(retroFont)
      createStars()
    }

    const createStars = () => {
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: p.random(p.width),
          y: p.random(p.height),
          speed: p.random(1, 3)
        })
      }
    }

    const updateStars = () => {
      stars.forEach(star => {
        star.y += star.speed * speedMultiplier
        if (star.y > p.height) {
          star.y = 0
          star.x = p.random(p.width)
        }
      })
    }

    const drawStars = () => {
      p.fill(255)
      p.noStroke()
      stars.forEach(star => {
        p.ellipse(star.x, star.y, 2, 2)
      })
    }

    const checkAndUpdateGameSpeed = () => {
      const scoreThresholds = [500, 1000, 2000, 2500, 3000, 4000]
      const currentThreshold = scoreThresholds.find(threshold => points >= threshold && threshold > lastSpeedIncreaseScore)
      
      if (currentThreshold) {
        speedMultiplier *= 1.5
        lastSpeedIncreaseScore = currentThreshold
        console.log(`Speed increased at score ${currentThreshold}. New multiplier: ${speedMultiplier}`)
      }
    }

    p.draw = () => {
      drawBackground()
      updateStars()
      drawStars()

      switch (gameState) {
        case 'menu':
          drawMenu()
          break
        case 'playing':
          drawGame()
          break
        case 'paused':
          drawGame()
          drawPauseOverlay()
          break
        case 'gameOver':
          drawGame()
          drawGameOverOverlay()
          break
      }
    }

    const drawMenu = () => {
      drawTextWithStroke('SPACE GAME', p.width / 2, p.height / 3, 32)
      drawTextWithStroke('Press SPACE to start', p.width / 2, p.height / 2, 16)
      drawTextWithStroke('Press H for instructions', p.width / 2, p.height / 2 + 40, 16)
    }

    const drawGame = () => {
      handleObstacles()
      handleEnemySpaceships()
      handleBullets()
      handleExplosions()
      handlePowerup()
      drawSpaceship()
      updateAndDrawHUD()

      if (gameState === 'playing') {
        if (p.frameCount % 600 === 0) {
          level++
          speedMultiplier += 0.1
        }

        points += 0.01 * speedMultiplier
        checkAndUpdateGameSpeed()
      }
    }

    const drawBackground = () => {
      p.background(0)
    }

    const drawSpaceship = () => {
      p.image(spaceship, lanes[spaceshipLaneIndex], p.height - 50 - spaceshipY, 40, 40)
    }

    const handleObstacles = () => {
      if (p.frameCount % 90 === 0 && gameState === 'playing') {
        const laneIndex = p.floor(p.random(0, lanes.length))
        const newAsteroid = { x: lanes[laneIndex], y: 0, type: 'asteroid' as const }

        const isOverlapping = [...obstacles, ...enemySpaceships].some(obj =>
          checkCollision(newAsteroid, obj, 80)
        )

        if (!isOverlapping) {
          obstacles.push(newAsteroid)
        }
      }

      if (p.frameCount - lastPowerupTime >= 7200 && gameState === 'playing') {
        const laneIndex = p.floor(p.random(0, lanes.length))
        obstacles.push({ x: lanes[laneIndex], y: 0, type: 'powerup-slow' })
        lastPowerupTime = p.frameCount
      }

      obstacles.forEach((obstacle, index) => {
        if (obstacle.type === 'powerup-slow') {
          p.image(powerupSlowImg, obstacle.x, obstacle.y, 30, 30)
        } else if (obstacle.type === 'asteroid') {
          p.image(asteroidImg, obstacle.x, obstacle.y, 30, 30)
        }
        if (gameState === 'playing') {
          obstacle.y += baseSpeed * speedMultiplier * 0.5
        }

        if (
          obstacle.y > p.height - 70 - spaceshipY &&
          obstacle.y < p.height - 30 - spaceshipY &&
          obstacle.x === lanes[spaceshipLaneIndex]
        ) {
          if (obstacle.type === 'powerup-slow') {
            activatePowerup(obstacle.type)
            obstacles.splice(index, 1)
          } else if (obstacle.type === 'asteroid') {
            gameState = 'gameOver'
          }
        }
      })

      obstacles = obstacles.filter((obstacle) => obstacle.y < p.height)
    }

    const handleEnemySpaceships = () => {
      if (p.frameCount % 120 === 0 && enemySpaceships.length === 0 && gameState === 'playing') {
        const availableLanes = [0, 1, 2].filter(lane => 
          !enemySpaceships.some(enemy => enemy.lane === lane)
        )
        
        if (availableLanes.length > 0) {
          const laneIndex = availableLanes[Math.floor(p.random(0, availableLanes.length))]
          const newEnemy = { x: lanes[laneIndex], y: 0, lane: laneIndex }

          const isOverlapping = obstacles.some(obj =>
            checkCollision(newEnemy, obj, 80)
          )

          if (!isOverlapping) {
            enemySpaceships.push(newEnemy)
          }
        }
      }

      enemySpaceships.forEach((enemy, index) => {
        p.image(enemySpaceshipImg, enemy.x, enemy.y, 40, 40)
        if (gameState === 'playing') {
          enemy.y += baseSpeed * speedMultiplier * 0.5
        }

        if (p.frameCount % 60 === 0 && p.random() > 0.7 && gameState === 'playing') {
          bullets.push({ x: enemy.x, y: enemy.y + 20, isEnemy: true })
        }

        if (
          enemy.y > p.height - 70 - spaceshipY &&
          enemy.y < p.height - 30 - spaceshipY &&
          enemy.x === lanes[spaceshipLaneIndex]
        ) {
          createExplosion(enemy.x, enemy.y)
          enemySpaceships.splice(index, 1)
          gameState = 'gameOver'
        }
      })

      enemySpaceships = enemySpaceships.filter((enemy) => enemy.y < p.height)
    }

    const handleBullets = () => {
      bullets.forEach((bullet, index) => {
        p.fill(bullet.isEnemy ? 255 : 0, bullet.isEnemy ? 0 : 255, 0)
        p.rect(bullet.x - 2, bullet.y, 4, 10)
        if (gameState === 'playing') {
          bullet.y += bullet.isEnemy ? 5 : -10
        }

        if (!bullet.isEnemy) {
          enemySpaceships.forEach((enemy, enemyIndex) => {
            if (p.dist(bullet.x, bullet.y, enemy.x, enemy.y) < 20) {
              createExplosion(enemy.x, enemy.y)
              enemySpaceships.splice(enemyIndex, 1)
              bullets.splice(index, 1)
              points += 20
            }
          })

          obstacles.forEach((obstacle) => {
            if (obstacle.type === 'asteroid' && p.dist(bullet.x, bullet.y, obstacle.x, obstacle.y) < 15) {
              bullets.splice(index, 1)
            }
          })
        } else {
          if (
            bullet.y > p.height - 70 - spaceshipY &&
            bullet.y < p.height - 30 - spaceshipY &&
            bullet.x === lanes[spaceshipLaneIndex]
          ) {
            createExplosion(bullet.x, p.height - 50 - spaceshipY)
            bullets.splice(index, 1)
            gameState = 'gameOver'
          }
        }
      })

      bullets = bullets.filter((bullet) => bullet.y > 0 && bullet.y < p.height)

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
          speedMultiplier = 1
        }
      }
    }

    const activatePowerup = (type: string) => {
      powerupActive = true
      powerupTimer = 300
      if (type === 'powerup-slow') {
        speedMultiplier = 0.5
      }
    }

    const updateAndDrawHUD = () => {
      drawTextWithStroke(`SCORE: ${Math.floor(points)}`, 10, 20, 16, 'left')
      drawTextWithStroke(`LEVEL: ${level}`, 10, 40, 16, 'left')

      if (powerupActive) {
        drawTextWithStroke('SLOW-DOWN ACTIVE!', p.width / 2, 20, 16)
      }
    }

    const drawTextWithStroke = (text: string, x: number, y: number, size: number, align: p5.HORIZ_ALIGN = 'center') => {
      p.textAlign(align, p.CENTER)
      p.textSize(size)
      p.fill(0)
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          p.text(text, x + i, y + j)
        }
      }
      p.fill(255)
      p.text(text, x, y)
    }

    const drawPauseOverlay = () => {
      p.fill(0, 128)
      p.rect(0, 0, p.width, p.height)
      drawTextWithStroke('PAUSED', p.width / 2, p.height / 2, 32)
      drawTextWithStroke('Press P to resume', p.width / 2, p.height / 2 + 40, 16)
    }

    const drawGameOverOverlay = () => {
      p.fill(0, 128)
      p.rect(0, 0, p.width, p.height)
      drawTextWithStroke('GAME OVER', p.width / 2, p.height / 2 - 40, 32)
      drawTextWithStroke(`FINAL SCORE: ${Math.floor(points)}`, p.width / 2, p.height / 2, 16)
      drawTextWithStroke(`LEVEL REACHED: ${level}`, p.width / 2, p.height / 2 + 30, 16)
      drawTextWithStroke('Press R to restart', p.width / 2, p.height / 2 + 60, 16)
    }

    const changeLane = (direction: number) => {
      spaceshipLaneIndex = p.constrain(spaceshipLaneIndex + direction, 0, lanes.length - 1)
    }

    const moveVertical = (direction: number) => {
      spaceshipY = p.constrain(spaceshipY - direction * 10, 0, p.height / 2 - 50)
    }

    const shoot = () => {
      if (shootCooldown === 0) {
        bullets.push({ x: lanes[spaceshipLaneIndex], y: p.height - 70 - spaceshipY, isEnemy: false })
        shootCooldown = 15
      }
    }

    const resetGame = () => {
      spaceshipLaneIndex = 1
      spaceshipY = 0
      speedMultiplier = 1
      obstacles = []
      bullets = []
      enemySpaceships = []
      explosions = []
      points = 0
      level = 1
      shootCooldown = 0
      powerupActive = false
      powerupTimer = 0
      lastPowerupTime = 0
      lastSpeedIncreaseScore = 0
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (gameState) {
        case 'menu':
          if (event.key === ' ') {
            gameState = 'playing'
            resetGame()
          } else if (event.key === 'h' || event.key === 'H') {
            console.log('Show instructions')
          }
          break
        case 'playing':
          if (event.key === 'ArrowLeft') changeLane(-1)
          if (event.key === 'ArrowRight') changeLane(1)
          if (event.key === 'ArrowUp') moveVertical(1)
          if (event.key === 'ArrowDown') moveVertical(-1)
          if (event.key === ' ') shoot()
          if (event.key === 'p' || event.key === 'P') gameState = 'paused'
          break
        case 'paused':
          if (event.key === 'p' || event.key === 'P') gameState = 'playing'
          break
        case 'gameOver':
          if (event.key === 'r' || event.key === 'R') {
            gameState = 'playing'
            resetGame()
          }
          break
      }
    }

    p.touchStarted = (event: TouchEvent) => {
      if (gameState === 'playing') {
        if (event.touches && event.touches[0]) {
          touchStartX = event.touches[0].clientX
          touchStartY = event.touches[0].clientY
        }
      }
      return false
    }

    p.touchEnded = (event: TouchEvent) => {
      if (gameState === 'playing') {
        if (event.changedTouches && event.changedTouches[0]) {
          const touchEndX = event.changedTouches[0].clientX
          const touchEndY = event.changedTouches[0].clientY
          const swipeDistanceX = touchEndX - touchStartX
          const swipeDistanceY = touchEndY - touchStartY

          if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
            if (swipeDistanceX > 50) {
              changeLane(1)
            } else if (swipeDistanceX < -50) {
              changeLane(-1)
            }
          } else {
            if (swipeDistanceY > 50) {
              moveVertical(-1)
            } else if (swipeDistanceY < -50) {
              moveVertical(1)
            }
          }
        } else {
          shoot()
        }
      }
      return false
    }

    const checkCollision = (obj1: { x: number; y: number }, obj2: { x: number; y: number }, distance: number): boolean => {
      return p.dist(obj1.x, obj1.y, obj2.x, obj2.y) < distance
    }

    p.keyPressed = handleKeyPress
  }, [])

  useEffect(() => {
    const p5Instance = new p5(sketch, gameRef.current!)

    return () => {
      p5Instance.remove()
    }
  }, [sketch])

  return (
    <div
      ref={gameRef}
      className="w-full h-screen flex items-center justify-center"
    />
  )
}

export default Game

