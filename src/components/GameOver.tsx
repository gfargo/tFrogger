import { Box, Text, useInput } from 'ink';
import React from 'react';

const GameOver: React.FC<{ score: number; onRestart: () => void; onExit: () => void }> = ({ score, onRestart, onExit }) => {
  useInput((input, key) => {
    if (input.toLowerCase() === 'r') {
      onRestart()
    } else if (input.toLowerCase() === 'q' || (key.ctrl && input === 'c') || key.escape) {
      onExit()
    }
  })

  return (
    <Box flexDirection="column" alignItems="center">
      <Text bold>Game Over</Text>
      <Text>Final Score: {score}</Text>
      <Text>Press 'R' to restart or 'Q' to quit</Text>
    </Box>
  )
}

export default GameOver
