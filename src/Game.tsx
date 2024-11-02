import { Box, Text, useInput } from 'ink'
import React, { useCallback, useEffect, useState } from 'react'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  GAME_SPEED,
  RIVER_HEIGHT,
  ROAD_HEIGHT,
  TILES,
} from './constants.js'

interface Position {
  x: number
  y: number
}

interface Obstacle {
  position: Position
  direction: 'left' | 'right'
  type: 'car' | 'log'
  length: number
}

const Game: React.FC = () => {
  const [frogPosition, setFrogPosition] = useState<Position>({
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT - 1,
  })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [frogOnLog, setFrogOnLog] = useState<Obstacle | null>(null)

  const initializeObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = []
    for (let y = BOARD_HEIGHT - ROAD_HEIGHT - 1; y < BOARD_HEIGHT - 1; y++) {
      for (let i = 0; i < 3; i++) {
        newObstacles.push({
          position: { x: Math.floor(Math.random() * BOARD_WIDTH), y },
          direction: y % 2 === 0 ? 'left' : 'right',
          type: 'car',
          length: 1,
        })
      }
    }
    for (let y = 1; y <= RIVER_HEIGHT; y++) {
      for (let i = 0; i < 2; i++) {
        const logLength = Math.floor(Math.random() * 3) + 1 // Random length between 1 and 3
        newObstacles.push({
          position: { x: Math.floor(Math.random() * BOARD_WIDTH), y },
          direction: y % 2 === 0 ? 'left' : 'right',
          type: 'log',
          length: logLength,
        })
      }
    }
    setObstacles(newObstacles)
  }, [])

  const moveObstacles = () => {
    console.log('moveObstacles', { frogOnLog })

    setObstacles((prevObstacles) =>
      prevObstacles.map((obstacle) => {
        const newX =
          obstacle.direction === 'left'
            ? (obstacle.position.x - 1 + BOARD_WIDTH) % BOARD_WIDTH
            : (obstacle.position.x + 1) % BOARD_WIDTH

        return {
          ...obstacle,
          position: {
            x: newX,
            y: obstacle.position.y,
          },
        }
      })
    )

    if (frogOnLog) {
      console.log('frogOnLog', frogOnLog)

      setFrogPosition((prev) => ({
        x:
          frogOnLog.direction === 'left'
            ? (prev.x - 1 + BOARD_WIDTH) % BOARD_WIDTH
            : (prev.x + 1) % BOARD_WIDTH,
        y: prev.y,
      }))
    }
  }

  const checkCollisions = () => {
    const { x, y } = frogPosition

    // Check if frog reached the top
    if (y === 0) {
      setScore((prevScore) => prevScore + 1)
      setFrogPosition({ x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 })
      setFrogOnLog(null)
      return
    }

    // Check if frog is in the river
    if (y > 0 && y <= RIVER_HEIGHT) {
      const logCollision = obstacles.find(
        (obstacle) =>
          obstacle.type === 'log' &&
          x >= obstacle.position.x &&
          x < obstacle.position.x + obstacle.length &&
          obstacle.position.y === y
      )
      if (logCollision) {
        setFrogOnLog(logCollision)
        return
      } else {
        setGameOver(true)
        setFrogOnLog(null)
        return
      }
    } else {
      setFrogOnLog(null)
    }

    // Check for car collisions
    const carCollision = obstacles.some(
      (obstacle) =>
        obstacle.type === 'car' &&
        obstacle.position.x === x &&
        obstacle.position.y === y
    )
    if (carCollision) {
      setGameOver(true)
      setFrogOnLog(null)
    }
  }

  const gameLoop = () => {
    if (!gameOver) {
      moveObstacles()
      checkCollisions()
    }
  }

  useEffect(() => {
    initializeObstacles()
    const timer = setInterval(gameLoop, GAME_SPEED)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    checkCollisions()
  }, [obstacles, frogPosition, checkCollisions])

  const restartGame = useCallback(() => {
    setFrogPosition({ x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 })
    setGameOver(false)
    setScore(0)
    setFrogOnLog(null)
    initializeObstacles()
  }, [initializeObstacles])

  useInput((input, key) => {
    if (gameOver) {
      if (input.toLowerCase() === 'r') {
        restartGame()
      }
      return
    }

    let newPosition = { ...frogPosition }

    if (key.leftArrow) {
      newPosition.x = Math.max(0, newPosition.x - 1)
    } else if (key.rightArrow) {
      newPosition.x = Math.min(BOARD_WIDTH - 1, newPosition.x + 1)
    } else if (key.upArrow) {
      newPosition.y = Math.max(0, newPosition.y - 1)
    } else if (key.downArrow) {
      newPosition.y = Math.min(BOARD_HEIGHT - 1, newPosition.y + 1)
    }

    console.log('newPosition', newPosition)

    setFrogPosition(newPosition)

    const logCollision = obstacles.find(
      (obstacle) =>
        obstacle.type === 'log' &&
        newPosition.x >= obstacle.position.x &&
        newPosition.x < obstacle.position.x + obstacle.length &&
        obstacle.position.y === newPosition.y
    )
    if (logCollision) {
      console.log('hit log in userInpput logCollision', logCollision)
      setFrogOnLog(logCollision)
    }
  })

  const renderBoard = () => {
    const board = []
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let row = ''
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x === frogPosition.x && y === frogPosition.y) {
          row += TILES.FROG
        } else {
          const obstacle = obstacles.find(
            (o) =>
              o.position.x <= x &&
              x < o.position.x + o.length &&
              o.position.y === y
          )
          if (obstacle) {
            row += obstacle.type === 'car' ? TILES.CAR : TILES.LOG
          } else if (y > 0 && y <= RIVER_HEIGHT) {
            row += TILES.RIVER
          } else if (
            y > BOARD_HEIGHT - ROAD_HEIGHT - 1 &&
            y < BOARD_HEIGHT - 1
          ) {
            row += TILES.ROAD
          } else if (y === 0) {
            row += TILES.GOAL
          } else {
            row += TILES.EMPTY
          }
        }
      }
      board.push(<Text key={y}>{row}</Text>)
    }
    return board
  }

  return (
    <Box flexDirection="column" borderStyle="single" paddingX={1}>
      <Text>Frogger {frogOnLog?.type}</Text>
      <Text>Score: {score}</Text>
      <Box flexDirection="column">{renderBoard()}</Box>
      <Text>Use arrow keys to move. Reach the top to score!</Text>
      {gameOver && <Text color="red">Game Over! Press 'r' to restart.</Text>}
    </Box>
  )
}

export default Game
