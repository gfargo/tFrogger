import { Box, Text } from 'ink'
import React from 'react'
import { TILES } from '../constants.js'
import { LevelConfig } from '../levelConfig.js'
import { type Obstacle, type Position } from '../types.js'

export const renderBoard = (
  frogPosition: Position,
  obstacles: Obstacle[],
  score: number,
  config: LevelConfig,
  currentLives: number,
  timeElapsed: number
) => {
  const board = []
  for (let y = 0; y < config.height; y++) {
    let row = ''
    for (let x = 0; x < config.width; x++) {
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
          switch (obstacle.type) {
            case 'car':
              row += TILES.CAR
              break
            case 'log':
              row += TILES.LOG
              break
            case 'alligator':
              row += TILES.ALLIGATOR
              break
            case 'lilypad':
              row += TILES.LILYPAD
              break
            default:
              row += TILES.EMPTY
          }
        } else if (y > 0 && y <= config.riverWidth) {
          row += TILES.RIVER
        } else if (
          y > config.height - (config.height - config.riverWidth - 1) - 1 &&
          y < config.height - 1
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

  return (
    <Box flexDirection="column">
      {board}
      <Box>
        <Text>
          Level: {config.name} | Score: {score} | Lives: {currentLives}/
          {config.livesCount} | Time Left:{' '}
          {Math.floor((config.timeLimit || 0) - timeElapsed)}
        </Text>
      </Box>
    </Box>
  )
}
