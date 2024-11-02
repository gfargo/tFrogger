import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  RIVER_HEIGHT,
  ROAD_HEIGHT,
} from '../constants.js'
import { type Obstacle } from '../types.js'

export const initializeObstacles = (): Obstacle[] => {
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

  return newObstacles
}

export const moveObstacles = (obstacles: Obstacle[]): Obstacle[] => {
  return obstacles.map((obstacle) => {
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
}
