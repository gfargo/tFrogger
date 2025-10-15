import { Box, Text } from 'ink'
import React from 'react'
import { TILES } from '../constants.js'
import { type LevelConfig } from '../levelConfig.js'
import { type Obstacle, type Position } from '../types.js'

type RenderBoardOptions = {
  frogPosition: Position
  obstacles: Obstacle[]
  score: number
  config: LevelConfig
  currentLives: number
  timeElapsed: number
}

const obstacleTile: Record<Obstacle['type'], string> = {
  alligator: TILES.ALLIGATOR,
  car: TILES.CAR,
  lilypad: TILES.LILYPAD,
  log: TILES.LOG,
}

export const renderBoard = ({
  frogPosition,
  obstacles,
  score,
  config,
  currentLives,
  timeElapsed,
}: RenderBoardOptions): JSX.Element => {
  const board: JSX.Element[] = []
  for (let y = 0; y < config.height; y++) {
    let row = ''
    for (let x = 0; x < config.width; x++) {
      if (x === frogPosition.x && y === frogPosition.y) {
        row += TILES.FROG
        continue
      }

      const obstacle = obstacles.find(
        (currentObstacle) =>
          currentObstacle.position.x <= x &&
          x < currentObstacle.position.x + currentObstacle.length &&
          currentObstacle.position.y === y
      )

      if (obstacle) {
        row += obstacleTile[obstacle.type]
        continue
      }

      if (y > 0 && y <= config.riverWidth) {
        row += TILES.RIVER
        continue
      }

      if (
        y > config.height - (config.height - config.riverWidth - 1) - 1 &&
        y < config.height - 1
      ) {
        row += TILES.ROAD
        continue
      }

      if (y === 0) {
        row += TILES.GOAL
        continue
      }

      row += TILES.EMPTY
    }

    board.push(<Text key={y}>{row}</Text>)
  }

  return (
    <Box flexDirection="column">
      {board}
      <Box>
        <Text>
          Level: {config.name} | Score: {score} | Lives: {currentLives}/
          {config.livesCount} | Time Left:{' '}
          {Math.floor((config.timeLimit ?? 0) - timeElapsed)}
        </Text>
      </Box>
    </Box>
  )
}
