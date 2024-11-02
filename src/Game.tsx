import { useInput } from 'ink'
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import GameOver from './components/GameOver.js'
import MainMenu from './components/MainMenu.js'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  GAME_SPEED,
  RIVER_HEIGHT
} from './constants.js'
import { checkCarCollision, checkLogCollision, isFrogOnLog, isInRiver } from './helpers/collisionHelpers.js'
import { initializeObstacles, moveObstacles } from './helpers/obstacleHelpers.js'
import { renderBoard } from './helpers/renderHelpers.js'
import { FrogAction, FrogState, Obstacle } from './types.js'

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
        onLogId: undefined,
      }
  }
}

function Game() {
  const [frogState, dispatchFrog] = useReducer(frogReducer, {
    position: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 1 },
    onLogId: undefined,
  })
  const [obstacles, setObstacles] = useState<Obstacle[]>(initializeObstacles())
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [score, setScore] = useState(0)

  const frogStateReference = useRef(frogState)
  const obstaclesReference = useRef(obstacles)

  useEffect(() => {
    frogStateReference.current = frogState
    obstaclesReference.current = obstacles
  }, [frogState, obstacles])

  // const initializeObstacles = useCallback(() => {
  //   const newObstacles: Obstacle[] = []
  //   for (let y = BOARD_HEIGHT - ROAD_HEIGHT - 1; y < BOARD_HEIGHT - 1; y++) {
  //     for (let i = 0; i < 3; i++) {
  //       newObstacles.push({
  //         id: `car-${y}-${i}`,
  //         position: { x: Math.floor(Math.random() * BOARD_WIDTH), y },
  //         direction: y % 2 === 0 ? 'left' : 'right',
  //         type: 'car',
  //         length: 1,
  //       })
  //     }
  //   }

  //   for (let y = 1; y <= RIVER_HEIGHT; y++) {
  //     for (let i = 0; i < 2; i++) {
  //       const logLength = Math.floor(Math.random() * 3) + 1 // Random length between 1 and 3
  //       newObstacles.push({
  //         id: `log-${y}-${i}`,
  //         position: { x: Math.floor(Math.random() * BOARD_WIDTH), y },
  //         direction: y % 2 === 0 ? 'left' : 'right',
  //         type: 'log',
  //         length: logLength,
  //       })
  //     }
  //   }

  //   return newObstacles
  // }, [])

  // const moveObstacles = useCallback((previousObstacles) => {
  //   const newObstacles = previousObstacles.map((obstacle) => {
  //     const newX =
  //       obstacle.direction === 'left'
  //         ? (obstacle.position.x - 1 + BOARD_WIDTH) % BOARD_WIDTH
  //         : (obstacle.position.x + 1) % BOARD_WIDTH

  //     return {
  //       ...obstacle,
  //       position: {
  //         x: newX,
  //         y: obstacle.position.y,
  //       },
  //     }
  //   })

  //   if (frogStateReference.current.onLogId) {
  //     const updatedLog = newObstacles.find(
  //       (o) => o.id === frogStateReference.current.onLogId
  //     )
  //     if (updatedLog) {
  //       const currentLog = previousObstacles.find(
  //         (o) => o.id === frogStateReference.current.onLogId
  //       )
  //       if (currentLog) {
  //         const relativePosition =
  //           frogStateReference.current.position.x - currentLog.position.x
  //         const newFrogPosition = {
  //           x:
  //             updatedLog.direction === 'left'
  //               ? (updatedLog.position.x + relativePosition + BOARD_WIDTH) %
  //                 BOARD_WIDTH
  //               : (updatedLog.position.x + relativePosition) % BOARD_WIDTH,
  //           y: frogStateReference.current.position.y,
  //         }

  //         dispatchFrog({
  //           type: 'SET_LOG_ID_AND_POSITION',
  //           logId: updatedLog.id,
  //           newPosition: newFrogPosition,
  //         })
  //       }
  //     } else {
  //       dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })
  //     }
  //   }

  //   return newObstacles
  // }, [])

  const checkCollisions = useCallback(() => {
    const { position: { x, y } } = frogStateReference.current

    if (y === 0) {
      setScore((previousScore) => previousScore + 1)
      dispatchFrog({ type: 'RESET' })
      return
    }

    if (isInRiver({ x, y })) {
      const logCollision = checkLogCollision({ x, y }, obstaclesReference.current)
      if (logCollision) {
        dispatchFrog({ type: 'SET_LOG_ID', logId: logCollision.id })
      } else {
        setGameState('gameOver')
        dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })
      }
      return
    }

    dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })

    if (checkCarCollision({ x, y }, obstaclesReference.current)) {
      setGameState('gameOver')
      dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })
    }
  }, [])

  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      setObstacles(moveObstacles)
      checkCollisions()
    }
  }, [gameState, checkCollisions, moveObstacles])

  useEffect(() => {
    setObstacles(initializeObstacles())
    const timer = setInterval(gameLoop, GAME_SPEED)
    return () => clearInterval(timer)
  }, [gameLoop, initializeObstacles])

  useEffect(() => {
    checkCollisions()
  }, [obstacles, frogState.position, checkCollisions])

  const restartGame = useCallback(() => {
    dispatchFrog({ type: 'RESET' })
    setGameState('playing')
    setScore(0)
    setObstacles(initializeObstacles())
  }, [initializeObstacles])

  useInput((_, key) => {
    if (gameState !== 'playing') return

    const { position, onLogId } = frogStateReference.current
    const newPosition = { ...position }

    if (key.leftArrow) {
      newPosition.x = Math.max(0, newPosition.x - 1)
    } else if (key.rightArrow) {
      newPosition.x = Math.min(BOARD_WIDTH - 1, newPosition.x + 1)
    } else if (key.upArrow) {
      newPosition.y = Math.max(0, newPosition.y - 1)
    } else if (key.downArrow) {
      newPosition.y = Math.min(BOARD_HEIGHT - 1, newPosition.y + 1)
    }

    if (onLogId && (key.leftArrow || key.rightArrow)) {
      if (!isFrogOnLog(newPosition, onLogId, obstacles)) {
        setGameState('gameOver')
        return
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
    }

    if (newPosition.y > 0 && newPosition.y <= RIVER_HEIGHT) {
      setGameState('gameOver')
      return
    }

    dispatchFrog({ type: 'MOVE', newPosition })
  })
 
  if (gameState === 'menu') {
    return (
      <MainMenu
        onStart={() => setGameState('playing')}
        onExit={() => process.exit()}
      />
    )
  }

  if (gameState === 'gameOver') {
    return (
      <GameOver
        score={score}
        onRestart={restartGame}
        onExit={() => process.exit()}
      />
    )
  }

  return renderBoard(frogState.position, obstacles, score)
}

export default Game
