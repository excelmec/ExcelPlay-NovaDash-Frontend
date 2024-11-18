"use client"

import React, { useRef, useEffect, useState } from 'react'
import p5 from 'p5'

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

export default function SpaceRunner() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!gameStarted || !sketchRef.current) return

    let sketch = new p5((p: p5) => {
      let player: GameObject
      let obstacles: GameObject[] = []
      let enemies: GameObject[] = []
      let bullets: Bullet[] = []
      let particles: Particle[] = []
      let stars: { x: number; y: number; size: number }[] = []
      let gameSpeed = INITIAL_SPEED
      let spawnTimer = 0
      let spaceship: p5.Image

      p.preload = () => {
        spaceship = p.loadImage('/spaceship.png')
      }

      p.setup = () => {
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
        player = {
          x: 50,
          y: CANVAS_HEIGHT / 2 - PLAYER_HEIGHT / 2,
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT,
          speed: 5,
        }

        // Generate initial stars
        for (let i = 0; i < 100; i++) {
          stars.push({
            x: p.random(CANVAS_WIDTH),
            y: p.random(CANVAS_HEIGHT),
            size: p.random(1, 3),
          })
        }
      }

      p.draw = () => {
        p.background(0, 0, 51)

        // Draw stars
        p.fill(255)
        stars.forEach((star) => {
          p.rect(star.x, star.y, star.size, star.size)
          star.x -= gameSpeed * 0.5
          if (star.x < 0) {
            star.x = CANVAS_WIDTH
            star.y = p.random(CANVAS_HEIGHT)
          }
        })

        // Draw player
        p.image(spaceship, player.x, player.y, player.width, player.height)

        // Move and draw obstacles
        obstacles = obstacles.filter((obstacle) => {
          obstacle.x -= gameSpeed
          p.fill(255, 0, 0)
          p.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
          return obstacle.x + obstacle.width > 0
        })

        // Move and draw enemies
        enemies = enemies.filter((enemy) => {
          enemy.x -= gameSpeed
          p.fill(255, 0, 255)
          p.rect(enemy.x, enemy.y, enemy.width, enemy.height)
          return enemy.x + enemy.width > 0
        })

        // Move and draw bullets
        bullets = bullets.filter((bullet) => {
          bullet.x += bullet.isPlayerBullet ? 10 : -10
          p.fill(bullet.isPlayerBullet ? 0 : 255, 255, bullet.isPlayerBullet ? 255 : 0)
          p.rect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE)
          return bullet.x > 0 && bullet.x < CANVAS_WIDTH
        })

        // Draw particles
        particles = particles.filter((particle) => {
          particle.x += Math.cos(particle.speed) * 3
          particle.y += Math.sin(particle.speed) * 3
          particle.life--
          p.fill(particle.color)
          p.rect(particle.x, particle.y, particle.size, particle.size)
          return particle.life > 0
        })

        // Spawn obstacles and enemies
        spawnTimer += p.deltaTime
        if (spawnTimer > SPAWN_INTERVAL) {
          spawnTimer = 0
          const y = p.random(CANVAS_HEIGHT - OBSTACLE_HEIGHT)
          if (p.random() < ENEMY_SPAWN_CHANCE) {
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
          if (p.random() < 0.01) {
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
          p.noLoop()
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

        // Display score
        p.fill(255)
        p.textSize(16)
        p.text(`Score: ${score}`, CANVAS_WIDTH - 100, 30)
      }

      p.keyPressed = () => {
        if (p.keyCode === p.UP_ARROW) {
          player.y = Math.max(0, player.y - player.speed)
        } else if (p.keyCode === p.DOWN_ARROW) {
          player.y = Math.min(CANVAS_HEIGHT - player.height, player.y + player.speed)
        } else if (p.keyCode === 32) { // Spacebar
          bullets.push({
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: BULLET_SIZE,
            height: BULLET_SIZE,
            speed: gameSpeed,
            isPlayerBullet: true,
          })
        }
      }

      p.touchStarted = () => {
        bullets.push({
          x: player.x + player.width,
          y: player.y + player.height / 2,
          width: BULLET_SIZE,
          height: BULLET_SIZE,
          speed: gameSpeed,
          isPlayerBullet: true,
        })
        return false
      }

      p.touchMoved = () => {
        const touch = p.touches[0]
        if (touch) {
          player.y = p.constrain(touch.y - player.height / 2, 0, CANVAS_HEIGHT - player.height)
        }
        return false
      }

      const createExplosion = (x: number, y: number) => {
        for (let i = 0; i < 20; i++) {
          particles.push({
            x,
            y,
            size: p.random(1, 4),
            speed: p.random(p.TWO_PI),
            life: p.random(10, 30),
            color: p.color(p.random(200, 255), p.random(100, 150), 0).toString(),
          })
        }
      }
    }, sketchRef.current)

    return () => {
      sketch.remove()
    }
  }, [gameStarted, score])

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
          <div ref={sketchRef} />
          <p className="mt-2 text-sm">
            Use arrow keys to move, spacebar to shoot. On mobile, swipe to move and tap to shoot.
          </p>
        </div>
      )}
    </div>
  )
}