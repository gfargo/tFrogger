import { LevelConfig } from '../levelConfig.js'
import { type Obstacle } from '../types.js'

export const initializeObstacles = (config: LevelConfig): Obstacle[] => {
  const newObstacles: Obstacle[] = []
  const roadHeight = config.height - config.riverWidth - 1

  // Initialize cars
  for (let y = config.height - roadHeight +1; y < config.height - 1; y++) {
    for (let i = 1; i < config.carCount; i++) {
      newObstacles.push({
        id: `car-${y}-${i}`,
        position: { x: Math.floor(Math.random() * config.width), y },
        direction: y % 2 === 0 ? 'left' : 'right',
        type: 'car',
        length: 1,
      })
    }
  }

  // Initialize logs
  for (let y = 1; y <= config.riverWidth; y++) {
    for (let i = 0; i < config.logCount; i++) {
      const logLength =
        Math.floor(
          Math.random() * (config.maxLogLength - config.minLogLength + 1)
        ) + config.minLogLength
      newObstacles.push({
        id: `log-${y}-${i}`,
        position: { x: Math.floor(Math.random() * config.width), y },
        direction: y % 2 === 0 ? 'left' : 'right',
        type: 'log',
        length: logLength,
      })
    }
  }

  // Initialize alligators if enabled
  if (config.hasAlligators) {
    for (let i = 0; i < config.alligatorCount; i++) {
      const y = Math.floor(Math.random() * config.riverWidth) + 1
      newObstacles.push({
        id: `alligator-${i}`,
        position: { x: Math.floor(Math.random() * config.width), y },
        direction: y % 2 === 0 ? 'left' : 'right',
        type: 'alligator',
        length: 2, // Alligators are 2 units long
      })
    }
  }

  return newObstacles
}
