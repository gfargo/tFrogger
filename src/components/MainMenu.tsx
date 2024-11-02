import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants.js'

function MainMenu({
  onStart,
  onExit,
}: {
  readonly onStart: () => void
  readonly onExit: () => void
}) {
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
      height={BOARD_HEIGHT}
      width={BOARD_WIDTH}
      justifyContent="center"
    >
      <Box flexDirection="column" alignSelf="center" alignItems="center">
        <Text bold color="green">
          tFrogger 🐸
        </Text>

        <Box flexDirection="column" marginTop={1} alignItems="flex-start">
          <Text color={selectedOption === 0 ? 'green' : 'white'}>
            {selectedOption === 0 ? ' 🛣️  ' : '   '}
            Start Game
          </Text>
          <Text color={selectedOption === 1 ? 'red' : 'white'}>
            {selectedOption === 1 ? '💣 ' : '    '}
            Exit
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default MainMenu
