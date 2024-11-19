import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'
import { FROG_ART } from '../constants.js'
import { useStdoutDimensions } from '../hooks/useStdOutDimensions.js'

function MainMenu({
  onStart,
  onExit,
}: {
  readonly onStart: () => void
  readonly onExit: () => void
}) {
  const [rows, columns] = useStdoutDimensions()
  const [selectedOption, setSelectedOption] = useState(0)

  useInput((_, key) => {
    if (key.upArrow || key.downArrow) {
      setSelectedOption((previous) => (previous === 0 ? 1 : 0))
    } else if (key.return) {
      if (selectedOption === 0) {
        onStart()
      } else {
        onExit()
      }
    }
  })

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      minHeight={columns}
      minWidth={rows}
      justifyContent="center"
    >
      <Box flexDirection="column" alignSelf="center" alignItems="center">
        <Text bold color="green">
          {FROG_ART}
        </Text>
        <Text bold>tFrogger</Text>

        <Box flexDirection="column" marginTop={1} alignItems="flex-start">
          <Text color={selectedOption === 0 ? 'green' : 'white'}>
            {selectedOption === 0 ? '🏁  ' : '    '}
            Start Game
          </Text>
          <Text color={selectedOption === 1 ? 'red' : 'white'}>
            {selectedOption === 1 ? '👋  ' : '    '}
            Exit
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default MainMenu
