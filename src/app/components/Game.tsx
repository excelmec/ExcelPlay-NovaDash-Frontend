"use client"

import React, { useRef, useEffect, useState } from 'react'

// Game constants
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 30
const OBSTACLE_WIDTH = 30
const OBSTACLE_HEIGHT = 30
const ENEMY_WIDTH = 40
const ENEMY_HEIGHT = 30
const BULLET_SIZE = 5
const INITIAL_SPEED = 2
const SPEED_INCREMENT = 0.0001
const SPAWN_INTERVAL = 2000
const ENEMY_SPAWN_CHANCE = 0.3

// Game objects
interface GameObject {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Bullet extends GameObject {
  isPlayerBullet: boolean
}

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  life: number
  color: string
}

// Main game component
export default function SpaceRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let animationFrameId: number
    let lastTime = 0
    let gameSpeed = INITIAL_SPEED
    let spawnTimer = 0

    const player: GameObject = {
      x: 50,
      y: CANVAS_HEIGHT / 2 - PLAYER_HEIGHT / 2,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: 5,
    }

    let obstacles: GameObject[] = []
    let enemies: GameObject[] = []
    let bullets: Bullet[] = []
    let particles: Particle[] = []
    let stars: { x: number; y: number; size: number }[] = []

    // Generate initial stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
      })
    }

    // Game loop
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Clear canvas
      ctx.fillStyle = '#000033'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw stars
      ctx.fillStyle = '#FFFFFF'
      stars.forEach((star) => {
        ctx.fillRect(star.x, star.y, star.size, star.size)
        star.x -= gameSpeed * 0.5
        if (star.x < 0) {
          star.x = CANVAS_WIDTH
          star.y = Math.random() * CANVAS_HEIGHT
        }
      })

      // Move and draw player
      ctx.fillStyle = '#00FF00'
      ctx.fillRect(player.x, player.y, player.width, player.height)

      // Move and draw obstacles
      obstacles = obstacles.filter((obstacle) => {
        obstacle.x -= gameSpeed
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        return obstacle.x + obstacle.width > 0
      })

      // Move and draw enemies
      enemies = enemies.filter((enemy) => {
        enemy.x -= gameSpeed
        ctx.fillStyle = '#FF00FF'
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        return enemy.x + enemy.width > 0
      })

      // Move and draw bullets
      bullets = bullets.filter((bullet) => {
        bullet.x += bullet.isPlayerBullet ? 10 : -10
        ctx.fillStyle = bullet.isPlayerBullet ? '#00FFFF' : '#FFFF00'
        ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE)
        return bullet.x > 0 && bullet.x < CANVAS_WIDTH
      })

      // Draw particles
      particles = particles.filter((particle) => {
        particle.x += Math.cos(particle.speed) * 3
        particle.y += Math.sin(particle.speed) * 3
        particle.life--
        ctx.fillStyle = particle.color
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        return particle.life > 0
      })

      // Spawn obstacles and enemies
      spawnTimer += deltaTime
      if (spawnTimer > SPAWN_INTERVAL) {
        spawnTimer = 0
        const y = Math.random() * (CANVAS_HEIGHT - OBSTACLE_HEIGHT)
        if (Math.random() < ENEMY_SPAWN_CHANCE) {
          enemies.push({
            x: CANVAS_WIDTH,
            y,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            speed: gameSpeed,
          })
        } else {
          obstacles.push({
            x: CANVAS_WIDTH,
            y,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            speed: gameSpeed,
          })
        }
      }

      // Enemy shooting
      enemies.forEach((enemy) => {
        if (Math.random() < 0.01) {
          bullets.push({
            x: enemy.x,
            y: enemy.y + enemy.height / 2,
            width: BULLET_SIZE,
            height: BULLET_SIZE,
            speed: gameSpeed,
            isPlayerBullet: false,
          })
        }
      })

      // Collision detection
      const checkCollision = (obj1: GameObject, obj2: GameObject) => {
        return (
          obj1.x < obj2.x + obj2.width &&
          obj1.x + obj1.width > obj2.x &&
          obj1.y < obj2.y + obj2.height &&
          obj1.y + obj1.height > obj2.y
        )
      }

      // Check player collision with obstacles and enemies
      if (
        obstacles.some((obstacle) => checkCollision(player, obstacle)) ||
        enemies.some((enemy) => checkCollision(player, enemy)) ||
        bullets.some((bullet) => !bullet.isPlayerBullet && checkCollision(player, bullet))
      ) {
        createExplosion(player.x + player.width / 2, player.y + player.height / 2)
        setGameOver(true)
        return
      }

      // Check bullet collisions
      bullets = bullets.filter((bullet) => {
        if (bullet.isPlayerBullet) {
          const hitEnemy = enemies.find((enemy) => checkCollision(bullet, enemy))
          if (hitEnemy) {
            createExplosion(hitEnemy.x + hitEnemy.width / 2, hitEnemy.y + hitEnemy.height / 2)
            enemies = enemies.filter((e) => e !== hitEnemy)
            setScore((prevScore) => prevScore + 100)
            return false
          }
        }
        return true
      })

      // Update score and game speed
      setScore((prevScore) => prevScore + 1)
      gameSpeed += SPEED_INCREMENT

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop)

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          player.y = Math.max(0, player.y - player.speed)
          break
        case 'ArrowDown':
          player.y = Math.min(CANVAS_HEIGHT - player.height, player.y + player.speed)
          break
        case ' ':
          bullets.push({
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: BULLET_SIZE,
            height: BULLET_SIZE,
            speed: gameSpeed,
            isPlayerBullet: true,
          })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Touch controls
    let touchStartY = 0
    canvas.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY
    })

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touchEndY = e.touches[0].clientY
      const deltaY = touchEndY - touchStartY
      player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y + deltaY))
      touchStartY = touchEndY
    })

    canvas.addEventListener('touchend', () => {
      bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        speed: gameSpeed,
        isPlayerBullet: true,
      })
    })

    // Create explosion effect
    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x,
          y,
          size: Math.random() * 3 + 1,
          speed: Math.random() * Math.PI * 2,
          life: Math.random() * 20 + 10,
          color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`,
        })
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameStarted])

  const handleStartGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Space Runner</h1>
      {!gameStarted || gameOver ? (
        <div className="text-center">
          {gameOver && <p className="text-2xl mb-4">Game Over! Score: {score}</p>}
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleStartGame}
          >
            {gameOver ? 'Play Again' : 'Start Game'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xl mb-2">Score: {score}</p>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-white"
          />
          <p className="mt-2 text-sm">
            Use arrow keys to move, spacebar to shoot. On mobile, swipe to move and tap to shoot.
          </p>
        </div>
      )}
    </div>
  )
}