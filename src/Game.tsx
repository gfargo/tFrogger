import { Box, Text, useApp, useInput } from 'ink'
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
import { LevelConfig, levelConfigs } from './levelConfig.js'
import Dead from './screens/Dead.js'
import GameOver from './screens/GameOver.js'
import MainMenu from './screens/MainMenu.js'
import { type FrogAction, type FrogState, type Obstacle } from './types.js'

interface GameState {
  obstacles: Obstacle[]
  gameStatus: 'menu' | 'playing' | 'gameOver' | 'dead'
  score: number
  currentLevel: number
  livesRemaining: number
  crossingsCompleted: number
  timeElapsed: number
}

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
        position: { x: action.width / 2, y: action.height - 1 },
        onLogId: undefined,
      }
    default:
      return state
  }
}

function Game() {
  const { exit } = useApp()
  const [frogState, dispatchFrog] = useReducer(frogReducer, {
    position: {
      x: levelConfigs[0]!.width / 2,
      y: levelConfigs[0]!.height - 1,
    },
    onLogId: undefined,
  })
  const [gameState, setGameState] = useState<GameState>(() => ({
    obstacles: initializeObstacles(levelConfigs[0] as LevelConfig),
    gameStatus: 'menu',
    score: 0,
    currentLevel: 1,
    livesRemaining: (levelConfigs[0] as LevelConfig).livesCount,
    crossingsCompleted: 0,
    timeElapsed: 0,
  }))
  const [highScores, setHighScores] = useState(loadHighScores())

  const frogStateRef = useRef(frogState)
  const gameStateRef = useRef(gameState)

  useEffect(() => {
    frogStateRef.current = frogState
    gameStateRef.current = gameState
  }, [frogState, gameState])

  const getCurrentLevelConfig = useCallback(() => {
    return levelConfigs[gameState.currentLevel - 1] as LevelConfig
  }, [gameState.currentLevel])

  const handleCollision = useCallback(() => {
    setGameState((prevState) => {
      const newLivesRemaining = prevState.livesRemaining - 1
      return {
        ...prevState,
        livesRemaining: newLivesRemaining,
        gameStatus: 'dead',
      }
    })

    setTimeout(() => {
      setGameState((prevState) => {
        if (prevState.livesRemaining <= 0) {
          return { ...prevState, gameStatus: 'gameOver' }
        }
        return {
          ...prevState,
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
    const { position, onLogId } = frogStateRef.current
    const { obstacles } = gameStateRef.current
    const currentLevelConfig = getCurrentLevelConfig()
    const { x, y } = position

    // Check for lilypad collision before win condition
    if (y === 0) {
      const lilypadCollision = obstacles.find(
        (obstacle) =>
          obstacle.type === 'lilypad' &&
          x >= Math.floor(obstacle.position.x) &&
          x < Math.floor(obstacle.position.x) + obstacle.length &&
          y === obstacle.position.y
      )
      if (!lilypadCollision) {
        setGameState((prevState) => ({
          ...prevState,
          score: prevState.score + currentLevelConfig.pointMultiplier,
          crossingsCompleted: prevState.crossingsCompleted + 1,
        }))
        dispatchFrog({
          type: 'RESET',
          width: currentLevelConfig.width,
          height: currentLevelConfig.height,
        })
        return
      } else {
        handleCollision()
        return
      }
    }

    if (isInRiver({ x, y }, currentLevelConfig)) {
      const logCollision = checkLogCollision(
        { x, y },
        obstacles,
        currentLevelConfig
      )
      if (logCollision) {
        dispatchFrog({ type: 'SET_LOG_ID', logId: logCollision.id })
      } else {
        handleCollision()
      }
      return
    }

    if (onLogId) {
      dispatchFrog({ type: 'SET_LOG_ID', logId: undefined })
    }

    if (checkCarCollision({ x, y }, obstacles, currentLevelConfig)) {
      handleCollision()
    }
  }, [getCurrentLevelConfig, handleCollision])

  const moveObstacles = useCallback(() => {
    const currentLevelConfig = getCurrentLevelConfig()
    setGameState((prevState) => {
      const newObstacles = prevState.obstacles.map((obstacle) => {
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
              ? (obstacle.position.x - speed + currentLevelConfig.width) %
                currentLevelConfig.width
              : (obstacle.position.x + speed) % currentLevelConfig.width
        }

        return {
          ...obstacle,
          position: {
            x: newX,
            y: obstacle.position.y,
          },
        }
      })

      let newFrogState = { ...frogStateRef.current }

      if (newFrogState.onLogId) {
        const updatedLog = newObstacles.find(
          (o) => o.id === newFrogState.onLogId
        )
        if (updatedLog) {
          const currentLog = prevState.obstacles.find(
            (o) => o.id === newFrogState.onLogId
          )
          if (currentLog) {
            const relativePosition =
              newFrogState.position.x - currentLog.position.x
            newFrogState.position = {
              x:
                updatedLog.direction === 'left'
                  ? Math.floor(
                      updatedLog.position.x +
                        relativePosition +
                        currentLevelConfig.width
                    ) % currentLevelConfig.width
                  : Math.ceil(
                      (updatedLog.position.x + relativePosition) %
                        currentLevelConfig.width
                    ),
              y: newFrogState.position.y,
            }
          }
        } else {
          newFrogState.onLogId = undefined
        }
      }

      dispatchFrog({
        type: 'SET_LOG_ID_AND_POSITION',
        logId: newFrogState.onLogId,
        newPosition: newFrogState.position,
      })

      return { ...prevState, obstacles: newObstacles }
    })
  }, [getCurrentLevelConfig])

  const gameLoop = useCallback(() => {
    if (gameStateRef.current.gameStatus === 'playing') {
      moveObstacles()
      checkCollisions()
      setGameState((prevState) => ({
        ...prevState,
        timeElapsed: prevState.timeElapsed + GAME_SPEED / 1000,
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
        setGameState((prevState) => ({
          ...prevState,
          currentLevel: prevState.currentLevel + 1,
          crossingsCompleted: 0,
          obstacles: initializeObstacles(
            levelConfigs[prevState.currentLevel] as LevelConfig
          ),
        }))
        dispatchFrog({
          type: 'RESET',
          width: levelConfigs[gameState.currentLevel]!.width,
          height: levelConfigs[gameState.currentLevel]!.height,
        })
      } else {
        setGameState((prevState) => ({ ...prevState, gameStatus: 'gameOver' }))
      }
    }
  }, [
    gameState.crossingsCompleted,
    gameState.currentLevel,
    getCurrentLevelConfig,
  ])

  const restartGame = useCallback(() => {
    setGameState({
      obstacles: initializeObstacles(levelConfigs[0] as LevelConfig),
      gameStatus: 'playing',
      score: 0,
      currentLevel: 1,
      livesRemaining: (levelConfigs[0] as LevelConfig).livesCount,
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
    if (gameStateRef.current.gameStatus !== 'playing') return

    const currentLevelConfig = getCurrentLevelConfig()
    const { position, onLogId } = frogStateRef.current
    const newPosition = { ...position }

    if (key.leftArrow) {
      newPosition.x = Math.max(0, newPosition.x - 1)
    } else if (key.rightArrow) {
      newPosition.x = Math.min(currentLevelConfig.width - 1, newPosition.x + 1)
    } else if (key.upArrow) {
      newPosition.y = Math.max(0, newPosition.y - 1)
    } else if (key.downArrow) {
      newPosition.y = Math.min(currentLevelConfig.height - 1, newPosition.y + 1)
    }

    if (
      onLogId &&
      (key.leftArrow || key.rightArrow) &&
      !isFrogOnLog(
        newPosition,
        onLogId,
        gameStateRef.current.obstacles,
        currentLevelConfig
      )
    ) {
      handleCollision()
      return
    }

    const logCollision = gameStateRef.current.obstacles.find(
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

    if (newPosition.y > 0 && newPosition.y <= currentLevelConfig.riverWidth) {
      handleCollision()
      return
    }

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
          setGameState((prevState) => ({ ...prevState, gameStatus: 'playing' }))
        }}
        onExit={() => exit()}
      />
    )
  }

  if (gameState.gameStatus === 'gameOver') {
    return (
      <GameOver
        score={gameState.score}
        highScores={highScores}
        onRestart={restartGame}
        onExit={() => exit()}
      />
    )
  }

  if (gameState.gameStatus === 'dead') {
    return <Dead livesRemaining={gameState.livesRemaining} />
  }

  return (
    <FullSizeBox>
      {renderBoard(
        frogState.position,
        gameState.obstacles,
        gameState.score,
        getCurrentLevelConfig(),
        gameState.livesRemaining,
        gameState.timeElapsed
      )}
      <Box gap={2} minHeight={1}>
        <Text>{frogStateRef.current.onLogId}</Text>
        <Text>
          {frogStateRef.current.position.x} / {frogStateRef.current.position.y}
        </Text>
      </Box>
    </FullSizeBox>
  )
}

export default Game
