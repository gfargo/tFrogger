import { useApp, useInput } from 'ink'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { type FrogState, type Obstacle } from './types.js'

interface GameState {
  frogState: FrogState
  obstacles: Obstacle[]
  gameStatus: 'menu' | 'playing' | 'gameOver' | 'dead'
  score: number
  currentLevel: number
  livesRemaining: number
  crossingsCompleted: number
  timeElapsed: number
}

function Game() {
  const { exit } = useApp()
  const [gameState, setGameState] = useState<GameState>(() => {
    return {
      frogState: {
        position: {
          x: levelConfigs[0]!.width / 2,
          y: levelConfigs[0]!.height - 1,
        },
        onLogId: undefined,
      },
      obstacles: initializeObstacles(levelConfigs[0] as LevelConfig),
      gameStatus: 'menu',
      score: 0,
      currentLevel: 1,
      livesRemaining: (levelConfigs[0] as LevelConfig).livesCount,
      crossingsCompleted: 0,
      timeElapsed: 0,
    }
  })
  const [highScores, setHighScores] = useState(loadHighScores())

  const gameStateRef = useRef(gameState)

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const getCurrentLevelConfig = useCallback(() => {
    return levelConfigs[gameState.currentLevel - 1] as LevelConfig
  }, [gameState.currentLevel])

  const getFrogStartingState = useCallback(() => {
    const currentLevel = getCurrentLevelConfig()
    const x = currentLevel.width / 2
    const y = currentLevel.height - 1
    return {
      position: { x, y },
      onLogId: undefined,
    }
  }, [])

  const checkCollisions = useCallback(() => {
    const { frogState, obstacles } = gameStateRef.current
    const { x, y } = frogState.position
    const currentLevelConfig = getCurrentLevelConfig()

    if (y === 0) {
      setGameState((prevState) => ({
        ...prevState,
        score: prevState.score + currentLevelConfig.pointMultiplier,
        crossingsCompleted: prevState.crossingsCompleted + 1,
        frogState: {
          ...prevState.frogState,
          position: {
            x: currentLevelConfig.width / 2,
            y: currentLevelConfig.height - 1,
          },
          onLogId: undefined,
        },
      }))
      return
    }

    if (isInRiver({ x, y }, currentLevelConfig)) {
      const logCollision = checkLogCollision(
        { x, y },
        obstacles,
        currentLevelConfig
      )
      if (logCollision) {
        setGameState((prevState) => ({
          ...prevState,
          frogState: { ...prevState.frogState, onLogId: logCollision.id },
        }))
      } else {
        handleCollision()
      }
      return
    }

    setGameState((prevState) => ({
      ...prevState,
      frogState: { ...prevState.frogState, onLogId: undefined },
    }))

    if (checkCarCollision({ x, y }, obstacles, currentLevelConfig)) {
      handleCollision()
    }
  }, [getCurrentLevelConfig])

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
          frogState: getFrogStartingState(),
        }
      })
    }, 3000)
  }, [])

  const moveObstacles = useCallback(() => {
    const currentLevelConfig = getCurrentLevelConfig()
    setGameState((prevState) => ({
      ...prevState,
      obstacles: prevState.obstacles.map((obstacle) => {
        const newX =
          obstacle.direction === 'left'
            ? (obstacle.position.x -
                currentLevelConfig.obstacleSpeed +
                currentLevelConfig.width) %
              currentLevelConfig.width
            : (obstacle.position.x + currentLevelConfig.obstacleSpeed) %
              currentLevelConfig.width

        return {
          ...obstacle,
          position: {
            x: newX,
            y: obstacle.position.y,
          },
        }
      }),
    }))
  }, [getCurrentLevelConfig])

  const gameLoop = useCallback(() => {
    if (gameState.gameStatus === 'playing') {
      moveObstacles()
      checkCollisions()
      setGameState((prevState) => ({
        ...prevState,
        timeElapsed: prevState.timeElapsed + GAME_SPEED / 1000,
      }))
    }
  }, [gameState.gameStatus, moveObstacles, checkCollisions])

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
          frogState: getFrogStartingState(),
        }))
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
      frogState: getFrogStartingState(),
      obstacles: initializeObstacles(levelConfigs[0] as LevelConfig),
      gameStatus: 'playing',
      score: 0,
      currentLevel: 1,
      livesRemaining: (levelConfigs[0] as LevelConfig).livesCount,
      crossingsCompleted: 0,
      timeElapsed: 0,
    })
  }, [])

  useInput((_input, key) => {
    if (gameState.gameStatus !== 'playing') return

    const currentLevelConfig = getCurrentLevelConfig()
    const { position, onLogId } = gameState.frogState
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
        gameState.obstacles,
        currentLevelConfig
      )
    ) {
      handleCollision()
      return
    }

    const logCollision = gameState.obstacles.find(
      (obstacle) =>
        obstacle.type === 'log' &&
        newPosition.x >= obstacle.position.x &&
        newPosition.x < obstacle.position.x + obstacle.length &&
        obstacle.position.y === newPosition.y
    )
    if (logCollision) {
      setGameState((prevState) => ({
        ...prevState,
        frogState: {
          position: newPosition,
          onLogId: logCollision.id,
        },
      }))
      return
    }

    if (newPosition.y > 0 && newPosition.y <= currentLevelConfig.riverWidth) {
      handleCollision()
      return
    }

    setGameState((prevState) => ({
      ...prevState,
      frogState: {
        ...prevState.frogState,
        position: newPosition,
      },
    }))
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

  return renderBoard(
    gameState.frogState.position,
    gameState.obstacles,
    gameState.score,
    getCurrentLevelConfig(),
    gameState.livesRemaining
  )
}

export default Game
