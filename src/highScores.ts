import fs from 'node:fs'
import path from 'node:path'
import { MAX_HIGH_SCORES } from './constants.js'
import { getSaveDirectory } from './helpers/getSaveDirectory.js'

type HighScore = {
  name: string
  score: number
}

const SAVE_DIR = getSaveDirectory()
const HIGH_SCORES_FILE = path.join(SAVE_DIR, 'saves.json')

const isHighScoreEntry = (value: unknown): value is HighScore => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { name?: unknown; score?: unknown }
  return (
    typeof candidate.name === 'string' && typeof candidate.score === 'number'
  )
}

export function saveHighScore(name: string, score: number): void {
  let highScores: HighScore[] = loadHighScores()

  highScores.push({ name, score })
  highScores.sort((a, b) => b.score - a.score)
  highScores = highScores.slice(0, MAX_HIGH_SCORES)

  fs.writeFileSync(HIGH_SCORES_FILE, JSON.stringify(highScores, null, 2))
}

export function loadHighScores(): HighScore[] {
  if (!fs.existsSync(HIGH_SCORES_FILE)) {
    return []
  }

  const data = fs.readFileSync(HIGH_SCORES_FILE, 'utf8')
  const highScores = JSON.parse(data) as unknown

  if (!Array.isArray(highScores)) {
    return []
  }

  return highScores.filter((candidate): candidate is HighScore =>
    isHighScoreEntry(candidate)
  )
}

export function isHighScore(score: number): boolean {
  const highScores = loadHighScores()

  if (highScores.length === 0) {
    return true
  }

  if (highScores.length < MAX_HIGH_SCORES) {
    return true
  }

  // eslint-disable-next-line unicorn/prefer-at -- Node 16 requirement prevents usage of Array.prototype.at
  const lowestScore = highScores[highScores.length - 1]!
  return score > lowestScore.score
}
