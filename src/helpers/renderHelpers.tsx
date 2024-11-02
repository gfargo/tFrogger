import { Box, Text } from 'ink'
import React from 'react'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  RIVER_HEIGHT,
  ROAD_HEIGHT,
  TILES,
} from '../constants.js'
import { Obstacle, Position } from '../types.js'

export const renderBoard = (
  frogPosition: Position,
  obstacles: Obstacle[],
  score: number
) => {
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
        } else if (y > BOARD_HEIGHT - ROAD_HEIGHT - 1 && y < BOARD_HEIGHT - 1) {
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
        <Text>Score: {score}</Text>
      </Box>
    </Box>
  )
}
