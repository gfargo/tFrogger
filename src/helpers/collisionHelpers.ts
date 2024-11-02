import { RIVER_HEIGHT } from '../constants.js'
import { type Obstacle, type Position } from '../types.js'

export const checkCarCollision = (
  position: Position,
  obstacles: Obstacle[]
): boolean => {
  return obstacles.some(
    (obstacle) =>
      obstacle.type === 'car' &&
      position.x >= obstacle.position.x &&
      position.x < obstacle.position.x + obstacle.length &&
      obstacle.position.y === position.y
  )
}

export const checkLogCollision = (
  position: Position,
  obstacles: Obstacle[]
): Obstacle | undefined => {
  return obstacles.find(
    (obstacle) =>
      obstacle.type === 'log' &&
      position.x >= obstacle.position.x &&
      position.x < obstacle.position.x + obstacle.length &&
      obstacle.position.y === position.y
  )
}

export const isInRiver = (position: Position): boolean => {
  return position.y > 0 && position.y <= RIVER_HEIGHT
}

export const isFrogOnLog = (
  position: Position,
  logId: string | undefined,
  obstacles: Obstacle[]
): boolean => {
  if (!logId) return false
  const log = obstacles.find((o) => o.id === logId)
  return (
    Boolean(log) &&
    position.x >= log.position.x &&
    position.x < log.position.x + log.length
  )
}
