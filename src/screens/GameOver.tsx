import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'
import FullSizeBox from '../components/FullSizeBox.js'
import { GAME_OVER_FROG_ART } from '../constants.js'

type HighScore = {
  name: string
  score: number
}

function GameOver({
  score,
  highScores,
  onRestart,
  onExit,
}: {
  readonly score: number
  readonly highScores: HighScore[]
  readonly onRestart: () => void
  readonly onExit: () => void
}) {
  const [displayHighScores, setDisplayHighScores] = useState(false)

  useInput((input, key) => {
    if (input.toLowerCase() === 'r') {
      onRestart()
    } else if (
      input.toLowerCase() === 'q' ||
      (key.ctrl && input === 'c') ||
      key.escape
    ) {
      onExit()
    } else if (input.toLowerCase() === 's') {
      setDisplayHighScores((previous) => !previous)
    }
  })

  return (
    <FullSizeBox>
      {displayHighScores ? (
        <Box
          borderDimColor
          marginTop={1}
          flexDirection="column"
          alignItems="center"
          borderStyle="single"
          paddingX={1}
        >
          <Text bold>High Scores:</Text>
          <Box marginTop={1} flexDirection="column">
            {highScores.slice(0, 5).map((highScore, index) => (
              <Box
                key={index}
                flexDirection="row"
                width={24}
                gap={3}
                justifyContent="space-between"
              >
                <Text dimColor color="green">
                  {highScore.name}
                </Text>
                <Text>{highScore.score}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <>
          <Text bold dimColor color="green">
            {GAME_OVER_FROG_ART}
          </Text>
          <Text bold>Game Over</Text>
          <Box flexDirection="column" alignItems="center">
            <Text italic>Final Score: {score}</Text>
          </Box>
        </>
      )}
      <Box marginTop={2} flexDirection="column" alignItems="center">
        <Text dimColor>
          Press &apos;R&apos; to restart, &apos;S&apos; view high scores,
          &apos;Q&apos; quit
        </Text>
      </Box>
    </FullSizeBox>
  )
}

export default GameOver
