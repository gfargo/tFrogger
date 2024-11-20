import { BOARD_HEIGHT, BOARD_WIDTH } from './constants.js'

export interface LevelConfig {
  name?: string | number
  width: number
  height: number
  obstacleSpeed: number
  carCount: number
  logCount: number
  minLogLength: number
  maxLogLength: number
  riverWidth: number
  lilypadDensity: number
  timeLimit: number | null
  pointMultiplier: number
  livesCount: number
  hasAlligators: boolean
  alligatorCount: number
  crossingsToWin: number
  hasMovingLilypads: boolean
  windEffect: number
}

export const levelConfigs: LevelConfig[] = [
  {
    name: 1,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    obstacleSpeed: 1,
    carCount: 8,
    logCount: 5,
    minLogLength: 2,
    maxLogLength: 4,
    riverWidth: 3,
    timeLimit: 60,
    pointMultiplier: 1,
    livesCount: 3,
    hasAlligators: false,
    alligatorCount: 5,
    crossingsToWin: 3,
    hasMovingLilypads: false,
    lilypadDensity: 1,
    windEffect: 0,
  },
  {
    name: 2,
    width: BOARD_WIDTH - 12,
    height: BOARD_HEIGHT + 2,
    obstacleSpeed: 1.2,
    carCount: 16,
    logCount: 6,
    minLogLength: 2,
    maxLogLength: 4,
    riverWidth: 6,
    lilypadDensity: 0.35,
    timeLimit: 55,
    pointMultiplier: 1.5,
    livesCount: 3,
    hasAlligators: true,
    alligatorCount: 12,
    crossingsToWin: 4,
    hasMovingLilypads: true,
    windEffect: 0.5,
  },
  {
    name: 3,
    width: BOARD_WIDTH - 18,
    height: BOARD_HEIGHT + 2,
    obstacleSpeed: 1.4,
    carCount: 10,
    logCount: 4,
    minLogLength: 2,
    maxLogLength: 2,
    riverWidth: 7,
    lilypadDensity: 0.85,
    timeLimit: 50,
    pointMultiplier: 2.5,
    livesCount: 3,
    hasAlligators: true,
    alligatorCount: 26,
    crossingsToWin: 5,
    hasMovingLilypads: true,
    windEffect: -1,
  },
  {
    name: 4,
    width: BOARD_WIDTH - 28,
    height: BOARD_HEIGHT + 2,
    obstacleSpeed: 2,
    carCount: 8,
    logCount: 2,
    minLogLength: 2,
    maxLogLength: 2,
    riverWidth: 7,
    timeLimit: 90,
    pointMultiplier: 5,
    livesCount: 9,
    hasAlligators: true,
    alligatorCount: 32,
    crossingsToWin: 5,
    hasMovingLilypads: true,
    lilypadDensity: 0.9,
    windEffect: -1,
  },
]
