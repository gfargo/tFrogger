import { BOARD_HEIGHT, BOARD_WIDTH } from './constants.js';

export interface LevelConfig {
  name?: string | number;
  width: number;
  height: number;
  obstacleSpeed: number;
  carCount: number;
  logCount: number;
  minLogLength: number;
  maxLogLength: number;
  riverWidth: number;
  lilypadDensity: number;
  timeLimit: number | null;
  pointMultiplier: number;
  livesCount: number;
  hasAlligators: boolean;
  alligatorCount: number;
  musicTrack: string;
  crossingsToWin: number;
  hasMovingLilypads: boolean;
  windEffect: number;
}

export const levelConfigs: LevelConfig[] = [
  {
    name: 1,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    obstacleSpeed: 1,
    carCount: 2,
    logCount: 5,
    minLogLength: 2,
    maxLogLength: 4,
    riverWidth: 3,
    lilypadDensity: 1,
    timeLimit: 60,
    pointMultiplier: 1,
    livesCount: 3,
    hasAlligators: true,
    alligatorCount: 5,
    musicTrack: 'level1.mp3',
    crossingsToWin: 3,
    hasMovingLilypads: true,
    windEffect: 0
  },
  {
    name: 2,
    width: BOARD_WIDTH + 5,
    height: BOARD_HEIGHT,
    obstacleSpeed: 1.2,
    carCount: 6,
    logCount: 6,
    minLogLength: 2,
    maxLogLength: 4,
    riverWidth: 6,
    lilypadDensity: 0.7,
    timeLimit: 55,
    pointMultiplier: 1.5,
    livesCount: 3,
    hasAlligators: false,
    alligatorCount: 0,
    musicTrack: 'level2.mp3',
    crossingsToWin: 4,
    hasMovingLilypads: false,
    windEffect: 0.5
  },
  {
    name: 3,
    width: BOARD_WIDTH + 10,
    height: BOARD_HEIGHT + 3,
    obstacleSpeed: 1.4,
    carCount: 7,
    logCount: 7,
    minLogLength: 2,
    maxLogLength: 4,
    riverWidth: 7,
    lilypadDensity: 0.6,
    timeLimit: 50,
    pointMultiplier: 2,
    livesCount: 2,
    hasAlligators: true,
    alligatorCount: 2,
    musicTrack: 'level3.mp3',
    crossingsToWin: 5,
    hasMovingLilypads: true,
    windEffect: -1
  }
];