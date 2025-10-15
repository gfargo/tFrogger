import { useApp, useInput, useStderr } from 'ink'
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import FullSizeBox from './components/FullSizeBox.js'
import { GAME_SPEED } from './constants.js'
import {
  checkCarCollision,
  checkLogCollision,
  isFrogOnLog,
  isInRiver,
} from './helpers/collisionHelpers.js'
import { initializeObstacles } from './helpers/obstacleHelpers.js'
import { renderBoard } from './helpers/renderHelpers.js'
import { isHighScore, loadHighScores, saveHighScore } from './highScores.js'
import { levelConfigs } from './levelConfig.js'
import Dead from './screens/Dead.js'
import GameOver from './screens/GameOver.js'
import MainMenu from './screens/MainMenu.js'
import { type FrogAction, type FrogState, type Obstacle } from './types.js'

type GameState = {
  obstacles: Obstacle[]
  gameStatus: 'menu' | 'playing' | 'gameOver' | 'dead'
  score: number
  currentLevel: number
  livesRemaining: number
  crossingsCompleted: number
  timeElapsed: number
}

const assertNever = (value: never): never => {
  throw new Error(`Unhandled action: ${String(value)}`)
}

const frogReducer = (state: FrogState, action: FrogAction): FrogState => {
  switch (action.type) {
    case 'MOVE': {
      return {
        ...state,
        position: {
          x: Math.round(action.newPosition.x),
          y: Math.round(action.newPosition.y),
        },
      }
    }

    case 'SET_LOG_ID': {
      return { ...state, onLogId: action.logId }
    }

    case 'SET_LOG_ID_AND_POSITION': {
      return {
        position: {
          x: Math.round(action.newPosition.x),
          y: Math.round(action.newPosition.y),
        },
        onLogId: action.logId,
      }
    }

    case 'RESET': {
      return {
        position: {
          x: Math.floor(action.width / 2),
          y: action.height - 1,
        },
        onLogId: undefined,
      }
    }
  }

  return assertNever(action)
}

function Game({ isDebugMode }: { readonly isDebugMode?: boolean }) {
  const { exit } = useApp()
  const { write } = useStderr()

  const [frogState, dispatchFrog] = useReducer(frogReducer, {
    position: {
      x: levelConfigs[0]!.width / 2,
      y: levelConfigs[0]!.height - 1,
    },
    onLogId: undefined,
  })
  const [gameState, setGameState] = useState<GameState>(() => ({
    obstacles: initializeObstacles(levelConfigs[0]!),
    gameStatus: 'menu',
    score: 0,
    currentLevel: 1,
    livesRemaining: levelConfigs[0]!.livesCount,
    crossingsCompleted: 0,
    timeElapsed: 0,
  }))
  const [highScores, setHighScores] = useState(loadHighScores())

  const frogStateReference = useRef(frogState)
  const gameStateReference = useRef(gameState)

  useEffect(() => {
    frogStateReference.current = frogState
    gameStateReference.current = gameState
  }, [frogState, gameState])

  const debugLog = useCallback(
    (message: string, data?: unknown) => {
      if (isDebugMode) {
        write(`[DEBUG] ${message} ${data ? JSON.stringify(data) : ''}\n`)
      }
    },
    [isDebugMode, write]
  )

  useEffect(() => {
    debugLog('Game state updated', { frogState, gameState })
  }, [frogState, gameState, debugLog])

  const getCurrentLevelConfig = useCallback(() => {
    return levelConfigs[gameState.currentLevel - 1]!
  }, [gameState.currentLevel])

  const handleCollision = useCallback(() => {
    setGameState((previousState) => {
      const newLivesRemaining = previousState.livesRemaining - 1
      return {
        ...previousState,
        livesRemaining: newLivesRemaining,
        gameStatus: 'dead',
      }
    })

    setTimeout(() => {
      setGameState((previousState) => {
        if (previousState.livesRemaining <= 0) {
          return { ...previousState, gameStatus: 'gameOver' }
        }

        return {
          ...previousState,
          gameStatus: 'playing',
        }
      })
      const currentLevelConfig = getCurrentLevelConfig()
      dispatchFrog({
        type: 'RESET',
        width: currentLevelConfig.width,
        height: currentLevelConfig.height,
      })
    }, 3000)
  }, [getCurrentLevelConfig])

  const checkCollisions = useCallback(() => {
    const { position, onLogId } = frogStateReference.current
    const { obstacles } = gameStateReference.current
    const currentLevelConfig = getCurrentLevelConfig()
    const { x, y } = position
    const COLLISION_TOLERANCE = 0.1 // Tolerance value for collision detection

    debugLog('Checking collisions', {
      position,
      onLogId,
      obstacles: obstacles.length,
    })

    // Check for lilypad collision before win condition
    if (y === 0) {
      const lilypadCollision = obstacles.find(
        (obstacle) =>
          obstacle.type === 'lilypad' &&
          x + COLLISION_TOLERANCE >= Math.round(obstacle.position.x) &&
          x - COLLISION_TOLERANCE <
            Math.round(obstacle.position.x) + obstacle.length &&
          y === obstacle.position.y
      )
      debugLog('Lilypad collision check', { lilypadCollision })
      if (!lilypadCollision) {
        debugLog('Frog reached lilypad', { lilypadCollision })
        setGameState((previousState) => ({
          ...previousState,
          score: previousState.score + currentLevelConfig.pointMultiplier,
          crossingsCompleted: previousState.crossingsCompleted + 1,
        }))
        dispatchFrog({
          type: 'RESET',
          width: currentLevelConfig.width,
          height: currentLevelConfig.height,
        })
        return
      }

      debugLog('Frog missed lilypad')
      handleCollision()
      return
    }

    if (isInRiver({ x, y }, currentLevelConfig)) {
      debugLog('Frog in river')
      const logCollision = checkLogCollision(
        { x, y },
        obstacles.map((o) => ({
          ...o,
          position: { x: Math.round(o.position.x), y: o.position.y },
        })),
        currentLevelConfig,
        COLLISION_TOLERANCE
      )
      debugLog('Log collision check', { logCollision })
      if (logCollision) {
        dispatchFrog({ type: 'SET_LOG_ID', logId: logCollision.id })
      } else {
        debugLog('Frog in water')
        handleCollision()
      }

      return
    }

    if (onLogId) {
      debugLog('Frog leaving log')
      dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })
    }

    const carCollision = checkCarCollision(
      { x, y },
      obstacles.map((o) => ({
        ...o,
        position: { x: Math.round(o.position.x), y: o.position.y },
      })),
      currentLevelConfig,
      COLLISION_TOLERANCE
    )
    debugLog('Car collision check', { carCollision })
    if (carCollision) {
      debugLog('Frog hit by car')
      handleCollision()
    }
  }, [getCurrentLevelConfig, handleCollision, debugLog])

  const moveObstacles = useCallback(() => {
    const currentLevelConfig = getCurrentLevelConfig()
    debugLog('Moving obstacles', { currentLevel: currentLevelConfig })
    setGameState((previousState) => {
      const newObstacles = previousState.obstacles.map((obstacle) => {
        let newX = obstacle.position.x
        const speed =
          obstacle.type === 'lilypad' && currentLevelConfig.hasMovingLilypads
            ? currentLevelConfig.obstacleSpeed / 2
            : currentLevelConfig.obstacleSpeed

        if (
          obstacle.type === 'car' ||
          obstacle.type === 'log' ||
          obstacle.type === 'alligator' ||
          (obstacle.type === 'lilypad' && currentLevelConfig.hasMovingLilypads)
        ) {
          newX =
            obstacle.direction === 'left'
              ? Math.round(
                  (obstacle.position.x - speed + currentLevelConfig.width) %
                    currentLevelConfig.width
                )
              : Math.round(
                  (obstacle.position.x + speed) % currentLevelConfig.width
                )
        }

        return {
          ...obstacle,
          position: {
            x: newX,
            y: obstacle.position.y,
          },
        }
      })

      const newFrogState = { ...frogStateReference.current }

      if (newFrogState.onLogId) {
        debugLog('Frog on log', { logId: newFrogState.onLogId })
        const updatedLog = newObstacles.find(
          (o) => o.id === newFrogState.onLogId
        )
        if (updatedLog) {
          const currentLog = previousState.obstacles.find(
            (o) => o.id === newFrogState.onLogId
          )
          if (currentLog) {
            const relativePosition =
              newFrogState.position.x - Math.round(currentLog.position.x)
            newFrogState.position = {
              x:
                updatedLog.direction === 'left'
                  ? Math.round(
                      (updatedLog.position.x +
                        relativePosition +
                        currentLevelConfig.width) %
                        currentLevelConfig.width
                    )
                  : Math.round(
                      (updatedLog.position.x + relativePosition) %
                        currentLevelConfig.width
                    ),
              y: newFrogState.position.y,
            }
            debugLog('Updated frog position on log', {
              newPosition: newFrogState.position,
            })
          }
        } else {
          debugLog('Frog log not found', { logId: newFrogState.onLogId })
          newFrogState.onLogId = undefined
        }
      }

      dispatchFrog({
        type: 'SET_LOG_ID_AND_POSITION',
        logId: newFrogState.onLogId,
        newPosition: newFrogState.position,
      })

      return { ...previousState, obstacles: newObstacles }
    })
  }, [getCurrentLevelConfig, debugLog])

  const gameLoop = useCallback(() => {
    if (gameStateReference.current.gameStatus === 'playing') {
      moveObstacles()
      checkCollisions()
      setGameState((previousState) => ({
        ...previousState,
        timeElapsed: previousState.timeElapsed + GAME_SPEED / 1000,
      }))
    }
  }, [moveObstacles, checkCollisions])

  useEffect(() => {
    const timer = setInterval(gameLoop, GAME_SPEED)
    return () => {
      clearInterval(timer)
    }
  }, [gameLoop])

  useEffect(() => {
    const currentLevelConfig = getCurrentLevelConfig()
    if (gameState.crossingsCompleted >= currentLevelConfig.crossingsToWin) {
      if (gameState.currentLevel < levelConfigs.length) {
        setGameState((previousState) => ({
          ...previousState,
          currentLevel: previousState.currentLevel + 1,
          crossingsCompleted: 0,
          obstacles: initializeObstacles(
            levelConfigs[previousState.currentLevel]!
          ),
        }))
        dispatchFrog({
          type: 'RESET',
          width: levelConfigs[gameState.currentLevel]!.width,
          height: levelConfigs[gameState.currentLevel]!.height,
        })
      } else {
        setGameState((previousState) => ({
          ...previousState,
          gameStatus: 'gameOver',
        }))
      }
    }
  }, [
    gameState.crossingsCompleted,
    gameState.currentLevel,
    getCurrentLevelConfig,
  ])

  const restartGame = useCallback(() => {
    setGameState({
      obstacles: initializeObstacles(levelConfigs[0]!),
      gameStatus: 'playing',
      score: 0,
      currentLevel: 1,
      livesRemaining: levelConfigs[0]!.livesCount,
      crossingsCompleted: 0,
      timeElapsed: 0,
    })
    dispatchFrog({
      type: 'RESET',
      width: levelConfigs[0]!.width,
      height: levelConfigs[0]!.height,
    })
  }, [])

  useInput((_input, key) => {
    if (gameStateReference.current.gameStatus !== 'playing') return

    const currentLevelConfig = getCurrentLevelConfig()
    const { position, onLogId } = frogStateReference.current
    const newPosition = {
      x: Math.round(position.x),
      y: Math.round(position.y),
    }

    debugLog('Input received', { key, currentPosition: position })

    if (key.leftArrow) {
      newPosition.x = Math.max(0, newPosition.x - 1)
    } else if (key.rightArrow) {
      newPosition.x = Math.min(currentLevelConfig.width - 1, newPosition.x + 1)
    } else if (key.upArrow) {
      newPosition.y = Math.max(0, newPosition.y - 1)
    } else if (key.downArrow) {
      newPosition.y = Math.min(currentLevelConfig.height - 1, newPosition.y + 1)
    }

    debugLog('New position calculated', { newPosition })

    if (
      onLogId &&
      (key.leftArrow || key.rightArrow) &&
      !isFrogOnLog(
        newPosition,
        onLogId,
        gameStateReference.current.obstacles.map((o) => ({
          ...o,
          position: {
            x: Math.round(o.position.x),
            y: o.position.y,
          },
        })),
        currentLevelConfig
      )
    ) {
      debugLog('Frog fell off log', { onLogId, newPosition })
      handleCollision()
      return
    }

    const logCollision = gameStateReference.current.obstacles.find(
      (obstacle) =>
        obstacle.type === 'log' &&
        newPosition.x >= Math.round(obstacle.position.x) &&
        newPosition.x < Math.round(obstacle.position.x) + obstacle.length &&
        obstacle.position.y === newPosition.y
    )
    if (logCollision) {
      debugLog('Frog landed on log', { logId: logCollision.id, newPosition })
      dispatchFrog({
        type: 'SET_LOG_ID_AND_POSITION',
        logId: logCollision.id,
        newPosition,
      })
      return
    }

    if (newPosition.y > 0 && newPosition.y <= currentLevelConfig.riverWidth) {
      debugLog('Frog entered river', {
        newPosition,
        riverWidth: currentLevelConfig.riverWidth,
      })
      handleCollision()
      return
    }

    debugLog('Frog moved', { newPosition })
    dispatchFrog({ type: 'MOVE', newPosition })
  })

  useEffect(() => {
    if (gameState.gameStatus === 'gameOver' && isHighScore(gameState.score)) {
      const playerName = new Date().toLocaleString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: undefined,
      })
      saveHighScore(playerName, gameState.score)
      setHighScores(loadHighScores())
    }
  }, [gameState.gameStatus, gameState.score])

  if (gameState.gameStatus === 'menu') {
    return (
      <MainMenu
        onStart={() => {
          setGameState((previousState) => ({
            ...previousState,
            gameStatus: 'playing',
          }))
        }}
        onExit={() => {
          exit()
        }}
      />
    )
  }

  if (gameState.gameStatus === 'gameOver') {
    return (
      <GameOver
        score={gameState.score}
        highScores={highScores}
        onRestart={restartGame}
        onExit={() => {
          exit()
        }}
      />
    )
  }

  if (gameState.gameStatus === 'dead') {
    return <Dead livesRemaining={gameState.livesRemaining} />
  }

  return (
    <FullSizeBox>
      {renderBoard({
        frogPosition: frogState.position,
        obstacles: gameState.obstacles,
        score: gameState.score,
        config: getCurrentLevelConfig(),
        currentLives: gameState.livesRemaining,
        timeElapsed: gameState.timeElapsed,
      })}
    </FullSizeBox>
  )
}

export default Game
