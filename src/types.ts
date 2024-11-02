export type Position = {
  x: number
  y: number
}

export type Obstacle = {
  id: string
  position: Position
  direction: 'left' | 'right'
  type: 'car' | 'log'
  length: number
}

export type LogId = string | undefined

export type FrogState = {
  position: Position
  onLogId: LogId
}

export type FrogAction =
  | { type: 'MOVE'; newPosition: Position }
  | { type: 'SET_LOG_ID'; logId: LogId }
  | {
      type: 'SET_LOG_ID_AND_POSITION'
      logId: LogId
      newPosition: Position
    }
  | { type: 'RESET' }
