'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import p5 from 'p5'

const DodgeBlast: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [selectedShip, setSelectedShip] = useState(0)

  const sketch = useCallback((p: p5) => {
    // Game variables
    let spaceshipLaneIndex = 1
    const lanes = [100, 200, 300]
    const baseSpeed = 2
    let speedMultiplier = 1
    let obstacles: { x: number; y: number; type: string }[] = []
    let bullets: { x: number; y: number; isEnemy: boolean }[] = []
    let enemySpaceships: { x: number; y: number; lane: number }[] = []
    let explosions: { x: number; y: number; frame: number; size: number }[] = []
    let ships: p5.Image[] = []
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

    let debugLog: string[] = []

    const logDebug = (message: string) => {
      console.log(message)
      debugLog.push(message)
      if (debugLog.length > 10) debugLog.shift()
    }

    p.preload = () => {
      ships[0] = p.loadImage('/ship1.gif')
      ships[1] = p.loadImage('/ship2.gif')
      ships[2] = p.loadImage('/ship3.gif')
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
        star.y += star.speed * (gameState === 'playing' ? speedMultiplier : 1)
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
      const scoreThresholds = [100, 200, 500, 1000, 2000, 2500, 3000, 4000]
      const currentThreshold = scoreThresholds.find(threshold => points >= threshold && threshold > lastSpeedIncreaseScore)
      
      if (currentThreshold) {
        speedMultiplier *= 1.5
        lastSpeedIncreaseScore = currentThreshold
      }
    }

    p.draw = () => {
      try {
        p.background(0)
        updateStars()
        drawStars()

        if (gameState === 'menu') {
          drawMenu()
        } else if (gameState === 'playing') {
          updateGame()
        } else if (gameState === 'gameOver') {
          drawGameOver()
        }

        // Draw debug log
        p.fill(255)
        p.textSize(10)
        p.textAlign(p.LEFT, p.TOP)
        debugLog.forEach((log, index) => {
          p.text(log, 10, p.height - 20 - (index * 15))
        })
      } catch (error) {
        console.error('Error in draw function:', error)
        logDebug(`Error: ${error.message}`)
      }
    }

    const drawMenu = () => {
      // Title with better 3D effect
      p.textSize(30)
      p.textAlign(p.CENTER, p.CENTER)
    
      // Stronger pink shadow for "DODGE BLAST"
      p.fill(255, 20, 147)
      for (let i = 1; i <= 4; i++) {
        p.text('DODGE BLAST', p.width / 2 + i, 100 + i)
      }
      p.fill(255, 255, 0)
      p.text('DODGE BLAST', p.width / 2, 100)
    
      p.textSize(20)
      p.fill(255)
      p.text('SELECT SHIP', p.width / 2, 220)
    
      p.textSize(16)
      p.fill(0, 191, 255)
      p.text(`SHIP ${selectedShip + 101}`, p.width / 2, 270)
    
      if (ships[selectedShip]) {
        p.image(ships[selectedShip], p.width / 2, 350, 80, 80)
      }
    
      p.textSize(30)
      if (selectedShip > 0) {
        const leftArrowX = 80
        const isHoveringLeft =
          p.mouseX > leftArrowX - 20 &&
          p.mouseX < leftArrowX + 20 &&
          p.mouseY > 340 &&
          p.mouseY < 360
        p.fill(isHoveringLeft ? 200 : 255)
        p.text('←', leftArrowX, 350)
      }
      if (selectedShip < ships.length - 1) {
        const rightArrowX = p.width - 80
        const isHoveringRight =
          p.mouseX > rightArrowX - 20 &&
          p.mouseX < rightArrowX + 20 &&
          p.mouseY > 340 &&
          p.mouseY < 360
        p.fill(isHoveringRight ? 200 : 255)
        p.text('→', rightArrowX, 350)
      }
    
      p.noStroke()
      const buttonY = 500
      const buttonHeight = 60
      const isHoveringStart =
        p.mouseX > p.width / 2 - 100 &&
        p.mouseX < p.width / 2 + 100 &&
        p.mouseY > buttonY &&
        p.mouseY < buttonY + buttonHeight
    
      p.fill(0, 0, 0, isHoveringStart ? 230 : 200)
      p.rect(p.width / 2 - 100, buttonY, 200, buttonHeight, 15)
    
      p.textSize(24)
      p.fill(isHoveringStart ? 255 : 220)
      p.text('START GAME', p.width / 2, buttonY + buttonHeight / 2)
    }

    const updateGame = () => {
      drawSpaceship()
      handleObstacles()
      handleEnemySpaceships()
      handleBullets()
      handleExplosions()
      handlePowerup()
      updateAndDrawHUD()

      if (p.frameCount % 600 === 0) {
        level++
        speedMultiplier += 0.1
      }

      points += 0.01 * speedMultiplier

      checkAndUpdateGameSpeed()
    }

    const drawSpaceship = () => {
      p.image(ships[selectedShip], lanes[spaceshipLaneIndex], p.height - 50, 60, 60)
    }

    const checkCollision = (obj1: { x: number; y: number }, obj2: { x: number; y: number }, distance: number): boolean => {
      return p.dist(obj1.x, obj1.y, obj2.x, obj2.y) < distance
    }

    const handleObstacles = () => {
      if (p.frameCount % 90 === 0) {
        const laneIndex = p.floor(p.random(0, lanes.length))
        const newAsteroid = { x: lanes[laneIndex], y: 0, type: 'asteroid' as const }

        const isOverlapping = [...obstacles, ...enemySpaceships].some(obj =>
          checkCollision(newAsteroid, obj, 80)
        )

        if (!isOverlapping) {
          obstacles.push(newAsteroid)
        }
      }

      if (p.frameCount - lastPowerupTime >= 7200) {
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
        obstacle.y += baseSpeed * speedMultiplier * 0.5

        if (
          obstacle.y > p.height - 70 &&
          obstacle.y < p.height - 30 &&
          obstacle.x === lanes[spaceshipLaneIndex]
        ) {
          if (obstacle.type === 'powerup-slow') {
            activatePowerup(obstacle.type)
            obstacles.splice(index, 1)
          } else if (obstacle.type === 'asteroid') {
            createExplosion(obstacle.x, p.height - 50)
            setGameState('gameOver')
          }
        }
      })

      obstacles = obstacles.filter((obstacle) => obstacle.y < p.height)
    }

    const handleEnemySpaceships = () => {
      if (p.frameCount % 120 === 0 && enemySpaceships.length === 0) {
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
        enemy.y += baseSpeed * speedMultiplier * 0.5

        if (p.frameCount % 120 === 0) {
          bullets.push({ x: enemy.x, y: enemy.y + 20, isEnemy: true })
        }

        if (
          enemy.y > p.height - 70 &&
          enemy.y < p.height - 30 &&
          enemy.x === lanes[spaceshipLaneIndex]
        ) {
          createExplosion(enemy.x, enemy.y)
          enemySpaceships.splice(index, 1)
          setGameState('gameOver')
        }
      })

      enemySpaceships = enemySpaceships.filter((enemy) => enemy.y < p.height)
    }

    const handleBullets = () => {
      bullets.forEach((bullet, index) => {
        p.fill(bullet.isEnemy ? 255 : 0, bullet.isEnemy ? 0 : 255, 0)
        p.rect(bullet.x - 2, bullet.y, 4, 10)
        bullet.y += bullet.isEnemy ? 5 : -10

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
            bullet.y > p.height - 70 &&
            bullet.y < p.height - 30 &&
            bullet.x === lanes[spaceshipLaneIndex]
          ) {
            createExplosion(bullet.x, p.height - 50)
            bullets.splice(index, 1)
            setGameState('gameOver')
          }
        }
      })

      bullets = bullets.filter((bullet) => bullet.y > 0 && bullet.y < p.height)

      if (shootCooldown > 0) shootCooldown--
    }

    const createExplosion = (x: number, y: number) => {
      explosions.push({ 
        x: x,
        y: y,
        frame: 0,
        size: 60
      })
    }

    const handleExplosions = () => {
      explosions.forEach((explosion, index) => {
        const alpha = p.map(explosion.frame, 0, 30, 255, 0)
        p.tint(255, alpha)
        p.image(explosionImg, explosion.x, explosion.y, explosion.size, explosion.size)
        p.noTint()
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
      powerupTimer = 300 // 5 seconds at 60 fps
      if (type === 'powerup-slow') {
        speedMultiplier = 0.5 // Slow down obstacles and enemies
      }
    }

    const updateAndDrawHUD = () => {
      p.fill(255)
      p.textSize(16)
      p.text(`SCORE: ${Math.floor(points)}`, 10, 20)
      p.text(`LEVEL: ${level}`, 10, 40)

      if (powerupActive) {
        p.fill(0, 255, 0)
        p.text('SLOW-DOWN ACTIVE!', p.width / 2 - 80, 20)
      }
    }

    const drawGameOver = () => {
      p.background(0)
      drawStars()
      p.fill(255)
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(32)
      p.text('GAME OVER', p.width / 2, p.height / 2 - 40)
      p.textSize(16)
      p.text(`FINAL SCORE: ${Math.floor(points)}`, p.width / 2, p.height / 2)
      p.text(`LEVEL REACHED: ${level}`, p.width / 2, p.height / 2 + 30)
      p.text('PRESS SPACE TO RESTART', p.width / 2, p.height / 2 + 60)
      p.text('PRESS ENTER TO RETURN TO MENU', p.width / 2, p.height / 2 + 90)
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
      if (gameState === 'playing') {
        if (event.key === 'ArrowLeft') changeLane(-1)
        if (event.key === 'ArrowRight') changeLane(1)
        if (event.key === ' ') shoot()
      } else if (gameState === 'gameOver') {
        if (event.key === ' ') resetGame()
        if (event.key === 'Enter') setGameState('menu')
      } else if (gameState === 'menu') {
        if (event.key === 'ArrowLeft' && selectedShip > 0) {
          setSelectedShip(prev => prev - 1)
        }
        if (event.key === 'ArrowRight' && selectedShip < ships.length - 1) {
          setSelectedShip(prev => prev + 1)
        }
        if (event.key === 'Enter') {
          setGameState('playing')
        }
      }
    }

    const resetGame = () => {
      spaceshipLaneIndex = 1
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
      setGameState('playing')
      logDebug('Game reset')
    }

    // Touch events for mobile swipe gestures
    p.touchStarted = (event: TouchEvent) => {
      if (event.touches && event.touches[0]) {
        touchStartX = event.touches[0].clientX
      }
      return false
    }

    p.touchEnded = (event: TouchEvent) => {
      if (event.changedTouches && event.changedTouches[0]) {
        const touchEndX = event.changedTouches[0].clientX
        const touchEndY = event.changedTouches[0].clientY
        const swipeDistance = touchEndX - touchStartX

        if (gameState === 'playing') {
          if (swipeDistance > 50) {
            changeLane(1) // Move spaceship to the right
          } else if (swipeDistance < -50) {
            changeLane(-1) // Move spaceship to the left
          } else {
            shoot() // Tap to shoot
          }
        } else if (gameState === 'gameOver') {
          // Check if "RETURN TO MENU" button is tapped
          if (touchEndY > p.height / 2 + 70 && touchEndY < p.height / 2 + 110) {
            setGameState('menu')
          } else {
            resetGame()
          }
        } else if (gameState === 'menu') {
          // Check if ship selection arrows are tapped - wider touch areas
          if (touchEndY > 320 && touchEndY < 380) {
            if (touchEndX < p.width/3 && selectedShip > 0) {
              setSelectedShip(prev => prev - 1)
            } else if (touchEndX > (p.width/3 * 2) && selectedShip < ships.length - 1) {
              setSelectedShip(prev => prev + 1)
            }
          }
          // Check if "START GAME" button is tapped - larger touch area
          if (touchEndY > 480 && touchEndY < 560 && 
              touchEndX > p.width/2 - 120 && touchEndX < p.width/2 + 120) {
            setGameState('playing')
          }
        }
      }
      return false
    }

    p.mousePressed = () => {
      if (gameState === 'menu') {
        // Left arrow click - wider click area
        if (p.mouseX < p.width/3 && p.mouseY > 320 && p.mouseY < 380 && selectedShip > 0) {
          setSelectedShip(prev => prev - 1)
          return false
        }
        // Right arrow click - wider click area
        if (p.mouseX > (p.width/3 * 2) && p.mouseY > 320 && p.mouseY < 380 && 
            selectedShip < ships.length - 1) {
          setSelectedShip(prev => prev + 1)
          return false
        }
        // Start game button click - larger click area
        if (p.mouseY > 480 && p.mouseY < 560 && 
            p.mouseX > p.width/2 - 120 && p.mouseX < p.width/2 + 120) {
          setGameState('playing')
          return false
        }
      }
      return false
    }

    // Attach event listener for keyboard controls
    window.addEventListener('keydown', handleKeyPress)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedShip, gameState, setGameState, setSelectedShip])

  useEffect(() => {
    // Attach p5 instance to the div
    const p5Instance = new p5(sketch, gameRef.current!)

    // Cleanup p5 instance on unmount
    return () => {
      p5Instance.remove()
    }
  }, [sketch])

  return (
    <div
      ref={gameRef}
      className="w-full h-screen flex items-center justify-center bg-black"
    />
  )
}

export default DodgeBlast

