'use client'

import { useState, useEffect, useCallback } from 'react'

const GRID_SIZE = 25
const CELL_SIZE = 24
const INITIAL_SNAKE = [{ x: 12, y: 12 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const INITIAL_FOOD = { x: 5, y: 5 }
const GAME_SPEED = 120

type Position = { x: number; y: number }

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake]
      const head = { ...newSnake[0] }
      head.x += direction.x
      head.y += direction.y

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        return prevSnake
      }

      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return prevSnake
      }

      newSnake.unshift(head)

      if (head.x === food.x && head.y === food.y) {
        setScore((prevScore) => prevScore + 1)
        generateFood(newSnake)
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameOver, isPaused])

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
      }
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    setFood(newFood)
  }, [])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === ' ' && !gameOver) {
        setIsPaused(prev => !prev)
        return
      }

      if (isPaused || gameOver) return

      switch (event.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 })
          break
      }
    },
    [direction, isPaused, gameOver]
  )

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED)
    window.addEventListener('keydown', handleKeyPress)

    return () => {
      clearInterval(gameLoop)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [moveSnake, handleKeyPress])

  const resetGame = () => {
    const newSnake = INITIAL_SNAKE
    setSnake(newSnake)
    setDirection(INITIAL_DIRECTION)
    generateFood(newSnake)
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  useEffect(() => {
    generateFood(INITIAL_SNAKE)
  }, [])

  const togglePause = () => {
    if (!gameOver) {
      setIsPaused(prev => !prev)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <h1 className="text-4xl font-bold mb-6 animate-pulse">SNAKE GAME</h1>
      <div className="relative">
        <div
          className="border-4 border-green-500 overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.5)]"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                boxShadow: '0 0 5px rgba(0,255,0,0.5)',
              }}
            />
          ))}
          <div
            className="absolute bg-red-500"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              boxShadow: '0 0 5px rgba(255,0,0,0.5)',
            }}
          />
        </div>
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              {gameOver ? (
                <>
                  <p className="text-3xl font-bold mb-3 text-red-500">GAME OVER</p>
                  <p className="text-2xl mb-6">Score: {score}</p>
                  <button
                    className="px-6 py-3 bg-green-500 text-black text-lg font-semibold hover:bg-green-400 transition-colors"
                    onClick={resetGame}
                  >
                    PLAY AGAIN
                  </button>
                </>
              ) : (
                <p className="text-3xl font-bold mb-3 text-yellow-500">PAUSED</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 text-2xl">Score: {score}</div>
      <button
        className={`mt-4 px-6 py-3 text-lg font-semibold transition-colors w-40 ${
          gameOver
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-green-500 text-black hover:bg-green-400'
        }`}
        onClick={togglePause}
        disabled={gameOver}
      >
        {isPaused ? 'RESUME' : 'PAUSE'}
      </button>
    </div>
  )
}