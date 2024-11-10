import { Box, Text, useInput } from 'ink'
import React from 'react'
import { GAME_OVER_FROG_ART } from '../constants.js'
import { useStdoutDimensions } from '../hooks/useStdOutDimensions.js'

function GameOver({
  score,
  onRestart,
  onExit,
}: {
  readonly score: number
  readonly onRestart: () => void
  readonly onExit: () => void
}) {
  const [rows, columns] = useStdoutDimensions()
  useInput((input, key) => {
    if (input.toLowerCase() === 'r') {
      onRestart()
    } else if (
      input.toLowerCase() === 'q' ||
      (key.ctrl && input === 'c') ||
      key.escape
    ) {
      onExit()
    }
  })

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      // minHeight={BOARD_HEIGHT}
      // minWidth={BOARD_WIDTH}
      minHeight={columns}
      minWidth={rows}
      justifyContent="center"
    >
      <Text bold color="green" dimColor>
        {GAME_OVER_FROG_ART}
      </Text>
      <Text bold>Game Over</Text>
      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text italic>Final Score: {score}</Text>
      </Box>
      <Box marginTop={2} flexDirection="column" alignItems="center">
        <Text dimColor>
          Press &apos;R&apos; to restart or &apos;Q&apos; to quit
        </Text>
      </Box>
    </Box>
  )
}

export default GameOver
