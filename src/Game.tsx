import { Box, Text, useInput } from 'ink'
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
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
  id: string
  position: Position
  direction: 'left' | 'right'
  type: 'car' | 'log'
  length: number
}

interface FrogState {
  position: Position
  onLogId: string | null
}

type FrogAction =
  | { type: 'MOVE'; newPosition: Position }
  | { type: 'SET_LOG_ID'; logId: string | null }
  | {
      type: 'SET_LOG_ID_AND_POSITION'
      logId: string | null
      newPosition: Position
    }
  | { type: 'RESET' }

const frogReducer = (state: FrogState, action: FrogAction): FrogState => {
  switch (action.type) {
    case 'MOVE':
      return { ...state, position: action.newPosition }
    case 'SET_LOG_ID':
      return { ...state, onLogId: action.logId }
    case 'SET_LOG_ID_AND_POSITION':
      return { position: action.newPosition, onLogId: action.logId }
    case 'RESET':
      return {
        position: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 },
        onLogId: null,
      }
    default:
      return state
  }
}

const Game = () => {
  const [frogState, dispatchFrog] = useReducer(frogReducer, {
    position: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 },
    onLogId: null,
  })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  const frogStateRef = useRef(frogState)
  const obstaclesRef = useRef(obstacles)

  useEffect(() => {
    frogStateRef.current = frogState
    obstaclesRef.current = obstacles
  }, [frogState, obstacles])

  const initializeObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = []
    for (let y = BOARD_HEIGHT - ROAD_HEIGHT - 1; y < BOARD_HEIGHT - 1; y++) {
      for (let i = 0; i < 3; i++) {
        newObstacles.push({
          id: `car-${y}-${i}`,
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
          id: `log-${y}-${i}`,
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

      if (frogStateRef.current.onLogId) {
        const updatedLog = newObstacles.find(
          (o) => o.id === frogStateRef.current.onLogId
        )
        if (updatedLog) {
          const currentLog = prevObstacles.find(
            (o) => o.id === frogStateRef.current.onLogId
          )
          if (currentLog) {
            const relativePosition =
              frogStateRef.current.position.x - currentLog.position.x
            const newFrogPosition = {
              x:
                updatedLog.direction === 'left'
                  ? (updatedLog.position.x + relativePosition + BOARD_WIDTH) %
                    BOARD_WIDTH
                  : (updatedLog.position.x + relativePosition) % BOARD_WIDTH,
              y: frogStateRef.current.position.y,
            }

            dispatchFrog({
              type: 'SET_LOG_ID_AND_POSITION',
              logId: updatedLog.id,
              newPosition: newFrogPosition,
            })
          }
        } else {
          dispatchFrog({ type: 'SET_LOG_ID', logId: null })
        }
      }

      return newObstacles
    })
  }, [])

  const checkCollisions = useCallback(() => {
    const {
      position: { x, y },
    } = frogStateRef.current

    // Check if frog reached the top
    if (y === 0) {
      setScore((prevScore) => prevScore + 1)
      dispatchFrog({ type: 'RESET' })
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
        dispatchFrog({ type: 'SET_LOG_ID', logId: logCollision.id })
      } else {
        setGameOver(true)
        dispatchFrog({ type: 'SET_LOG_ID', logId: null })
      }
      return
    } else {
      dispatchFrog({ type: 'SET_LOG_ID', logId: null })
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
      dispatchFrog({ type: 'SET_LOG_ID', logId: null })
    }
  }, [])

  const gameLoop = useCallback(() => {
    if (!gameOver) {
      moveObstacles()
      checkCollisions()
    }
  }, [gameOver])

  useEffect(() => {
    initializeObstacles()
    const timer = setInterval(gameLoop, GAME_SPEED)
    return () => clearInterval(timer)
  }, [gameLoop])

  useEffect(() => {
    checkCollisions()
  }, [obstacles, frogState.position])

  const restartGame = useCallback(() => {
    dispatchFrog({ type: 'RESET' })
    setGameOver(false)
    setScore(0)
    initializeObstacles()
  }, [initializeObstacles])

  useInput((input, key) => {
    if (gameOver) {
      if (input.toLowerCase() === 'r') {
        restartGame()
      }
      return
    }

    const { position, onLogId } = frogStateRef.current
    let newPosition = { ...position }

    if (key.leftArrow) {
      newPosition.x = Math.max(0, newPosition.x - 1)
    } else if (key.rightArrow) {
      newPosition.x = Math.min(BOARD_WIDTH - 1, newPosition.x + 1)
    } else if (key.upArrow) {
      newPosition.y = Math.max(0, newPosition.y - 1)
    } else if (key.downArrow) {
      newPosition.y = Math.min(BOARD_HEIGHT - 1, newPosition.y + 1)
    }

    // Check if frog is on a log
    if (onLogId && (key.leftArrow || key.rightArrow)) {
      const updatedLog = obstacles.find((o) => o.id === onLogId)
      if (updatedLog) {
        // Check if frog is moving off the log
        if (
          newPosition.x < updatedLog.position.x ||
          newPosition.x >= updatedLog.position.x + updatedLog.length
        ) {
          setGameOver(true)
          return
        }
      }
    }

    // Check if frog collided with a log
    const logCollision = obstacles.find(
      (obstacle) =>
        obstacle.type === 'log' &&
        newPosition.x >= obstacle.position.x &&
        newPosition.x < obstacle.position.x + obstacle.length &&
        obstacle.position.y === newPosition.y
    )
    if (logCollision) {
      dispatchFrog({
        type: 'SET_LOG_ID_AND_POSITION',
        logId: logCollision.id,
        newPosition,
      })
      return
    } else if (newPosition.y > 0 && newPosition.y <= RIVER_HEIGHT) {
      setGameOver(true)
      return
    }

    dispatchFrog({ type: 'MOVE', newPosition })
  })

  const renderBoard = () => {
    const board = []
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let row = ''
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x === frogState.position.x && y === frogState.position.y) {
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
      <Text>Score: {score}</Text>
      <Box flexDirection="column">{renderBoard()}</Box>
      <Text>Use arrow keys to move. Reach the top to score!</Text>
      {gameOver && <Text color="red">Game Over! Press 'r' to restart.</Text>}
    </Box>
  )
}

export default Game
