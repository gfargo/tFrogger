import { Box, Text, useInput } from 'ink'
import React from 'react'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants.js'

const GameOver: React.FC<{
  score: number
  onRestart: () => void
  onExit: () => void
}> = ({ score, onRestart, onExit }) => {
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
      height={BOARD_HEIGHT}
      width={BOARD_WIDTH}
      justifyContent="center"
    >
      <Text bold>Game Over</Text>
      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text italic>Final Score: {score}</Text>
      </Box>
      <Box marginTop={2} flexDirection="column" alignItems="center">
        <Text dimColor>Press 'R' to restart or 'Q' to quit</Text>
      </Box>
    </Box>
  )
}

export default GameOver
