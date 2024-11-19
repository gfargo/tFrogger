import fs from 'fs'
import path from 'path'
import { MAX_HIGH_SCORES } from './constants.js'
import { getSaveDirectory } from './helpers/getSaveDirectory.js'

interface HighScore {
  name: string
  score: number
}

const SAVE_DIR = getSaveDirectory()
const HIGH_SCORES_FILE = path.join(SAVE_DIR, 'saves.json')

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

  const data = fs.readFileSync(HIGH_SCORES_FILE, 'utf-8')
  const highScores = JSON.parse(data)

  if (!Array.isArray(highScores)) {
    return []
  }

  return highScores
}

export function isHighScore(score: number): boolean {
  const highScores = loadHighScores()

  if (highScores.length < 1 || highScores === undefined) {
    return true
  }

  return (
    highScores.length < MAX_HIGH_SCORES ||
    score > highScores[highScores.length - 1]!.score
  )
}
