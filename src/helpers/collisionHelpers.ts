import { type LevelConfig } from '../levelConfig.js'
import { type Obstacle, type Position } from '../types.js'

export const checkCarCollision = (
  position: Position,
  obstacles: Obstacle[],
  _config: LevelConfig,
  tolerance = 0
): boolean => {
  return obstacles.some(
    (obstacle) =>
      obstacle.type === 'car' &&
      position.x + tolerance >= obstacle.position.x &&
      position.x - tolerance < obstacle.position.x + obstacle.length &&
      obstacle.position.y === position.y
  )
}

export const checkLogCollision = (
  position: Position,
  obstacles: Obstacle[],
  config: LevelConfig,
  tolerance = 0
): Obstacle | undefined => {
  return obstacles.find(
    (obstacle) =>
      (obstacle.type === 'log' ||
        (config.hasAlligators && obstacle.type === 'alligator')) &&
      position.x + tolerance >= obstacle.position.x &&
      position.x - tolerance < obstacle.position.x + obstacle.length &&
      obstacle.position.y === position.y
  )
}

export const isInRiver = (position: Position, config: LevelConfig): boolean => {
  return position.y > 0 && position.y <= config.riverWidth
}

export const isFrogOnLog = (
  position: Position,
  logId: string | undefined,
  obstacles: Obstacle[],
  config: LevelConfig
): boolean => {
  if (!logId) {
    return false
  }

  const log = obstacles.find((o) => o.id === logId)
  if (!log) {
    return false
  }

  if (config.hasAlligators && log.type === 'alligator') {
    // Implement alligator behavior here
    // For example, the frog dies if it's on the alligator's head or tail
    const isOnAlligatorHead = position.x === log.position.x
    const isOnAlligatorTail = position.x === log.position.x + log.length - 1
    return !(isOnAlligatorHead || isOnAlligatorTail)
  }

  return (
    position.x >= log.position.x && position.x < log.position.x + log.length
  )
}

export const checkWinCondition = (
  position: Position,
  config: LevelConfig
): boolean => {
  return (
    position.y === 0 &&
    position.x % Math.floor(config.width / (config.lilypadDensity * 10)) === 0
  )
}
