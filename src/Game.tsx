import { Box, Text, useInput } from 'ink'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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

  const frogPositionRef = useRef(frogPosition)
  const frogOnLogRef = useRef(frogOnLog)
  const obstaclesRef = useRef(obstacles)

  useEffect(() => {
    frogPositionRef.current = frogPosition
    frogOnLogRef.current = frogOnLog
    obstaclesRef.current = obstacles
  }, [frogPosition, frogOnLog, obstacles])

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

  const moveObstacles = useCallback(() => {
    console.log('moveObstacles', {
      frogPosition: frogPositionRef.current,
      frogOnLog: frogOnLogRef.current,
      obstaclesCount: obstaclesRef.current.length,
    })

    setObstacles((prevObstacles) => {
      const newObstacles = prevObstacles.map((obstacle) => {
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

      if (frogOnLogRef.current) {
        const updatedLog = newObstacles.find(
          (o) =>
            o.type === 'log' &&
            o.position.y === frogOnLogRef.current!.position.y
        )
        if (updatedLog) {
          const relativePosition =
            frogPositionRef.current.x - frogOnLogRef.current.position.x

          const newFrogPosition = {
            x:
              updatedLog.direction === 'left'
                ? (updatedLog.position.x + relativePosition - 1 + BOARD_WIDTH) %
                  BOARD_WIDTH
                : (updatedLog.position.x + relativePosition + 1) % BOARD_WIDTH,
            y: frogPositionRef.current.y,
          }
          console.log('Frog moved with log', {
            oldPosition: frogPositionRef.current,
            newPosition: newFrogPosition,
            oldLogPosition: frogOnLogRef.current.position,
            newLogPosition: updatedLog.position,
            relativePosition,
            logDirection: updatedLog.direction,
          })
          setFrogPosition(newFrogPosition)
          setFrogOnLog(updatedLog)
        } else {
          console.log('Frog lost its log!', {
            frogPosition: frogPositionRef.current,
            lostLog: frogOnLogRef.current,
          })
          setFrogOnLog(null)
        }
      }

      return newObstacles
    })

    // if (frogOnLogRef.current) {
    //   const updatedLog = obstaclesRef.current.find(
    //     (o) =>
    //       o.type === 'log' && o.position.y === frogOnLogRef.current!.position.y
    //   )
    //   if (updatedLog) {
    //     const newFrogPosition = {
    //       x:
    //         (updatedLog.position.x +
    //           (frogPositionRef.current.x - frogOnLogRef.current.position.x) +
    //           BOARD_WIDTH) %
    //         BOARD_WIDTH,
    //       y: frogPositionRef.current.y,
    //     }
    //     console.log('Frog moved with log', {
    //       oldPosition: frogPositionRef.current,
    //       newPosition: newFrogPosition,
    //       oldLogPosition: frogOnLogRef.current.position,
    //       newLogPosition: updatedLog.position,
    //     })
    //     setFrogPosition(newFrogPosition)
    //     setFrogOnLog(updatedLog)
    //   } else {
    //     console.log('Frog lost its log!', {
    //       frogPosition: frogPositionRef.current,

    //       lostLog: frogOnLogRef.current,
    //     })
    //     setFrogOnLog(null)
    //   }
    // }
  }, [])

  const checkCollisions = useCallback(() => {
    const { x, y } = frogPositionRef.current
    console.log('checkCollisions', {
      frogPosition: { x, y },
      frogOnLog: frogOnLogRef.current,
      obstaclesCount: obstaclesRef.current.length,
    })

    // Check if frog reached the top
    if (y === 0) {
      setScore((prevScore) => prevScore + 1)
      setFrogPosition({ x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 })
      setFrogOnLog(null)
      return
    }

    // Check if frog is in the river
    if (y > 0 && y <= RIVER_HEIGHT) {
      const logCollision = obstaclesRef.current.find(
        (obstacle) =>
          obstacle.type === 'log' &&
          x >= obstacle.position.x &&
          x < obstacle.position.x + obstacle.length &&
          obstacle.position.y === y
      )
      if (logCollision) {
        setFrogOnLog(logCollision)
      } else {
        setGameOver(true)
        setFrogOnLog(null)
      }
      return
    } else {
      setFrogOnLog(null)
    }

    // Check for car collisions
    const carCollision = obstaclesRef.current.some(
      (obstacle) =>
        obstacle.type === 'car' &&
        x >= obstacle.position.x &&
        x < obstacle.position.x + obstacle.length &&
        obstacle.position.y === y
    )

    if (carCollision) {
      setGameOver(true)
      setFrogOnLog(null)
    }
  }, [])

  const gameLoop = useCallback(() => {
    if (!gameOver) {
      moveObstacles()
      checkCollisions()
    }
  }, [gameOver, moveObstacles, checkCollisions])

  useEffect(() => {
    initializeObstacles()
    const timer = setInterval(gameLoop, GAME_SPEED)
    return () => clearInterval(timer)
  }, [gameLoop])

  useEffect(() => {
    checkCollisions()
  }, [obstacles, frogPosition])

  // Add a new effect to log game state changes
  useEffect(() => {
    console.log('Game state updated', {
      frogPosition,
      frogOnLog,
      obstaclesCount: obstacles.length,
      gameOver,
      score,
    })
  }, [frogPosition, frogOnLog, obstacles, gameOver, score])

  const restartGame = useCallback(() => {
    setFrogPosition({ x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 })
    setGameOver(false)
    setScore(0)
    setFrogOnLog(null)
    initializeObstacles()
  }, [])

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

    console.log('User input', {
      oldPosition: frogPosition,
      newPosition,
      frogOnLog,
    })

    if (frogOnLog && (key.leftArrow || key.rightArrow)) {
      const updatedLogPosition = obstacles.find(
        (o) => o.type === 'log' && o.position.y === frogOnLog.position.y
      )?.position
      if (updatedLogPosition) {
        if (
          newPosition.x < updatedLogPosition.x ||
          newPosition.x >= updatedLogPosition.x + frogOnLog.length
        ) {
          console.log('Frog fell off the log!', {
            newPosition,
            updatedLogPosition,
            logLength: frogOnLog.length,
          })
          setGameOver(true)
          return
        }
      }
    }

    setFrogPosition(newPosition)

    const logCollision = obstacles.find(
      (obstacle) =>
        obstacle.type === 'log' &&
        newPosition.x >= obstacle.position.x &&
        newPosition.x < obstacle.position.x + obstacle.length &&
        obstacle.position.y === newPosition.y
    )
    if (logCollision) {
      console.log('hit log in userInput logCollision', logCollision)
      setFrogOnLog(logCollision)
    } else if (newPosition.y > 0 && newPosition.y <= RIVER_HEIGHT) {
      setGameOver(true)
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
