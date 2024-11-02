import { Box, Text, useInput } from 'ink'
import React, { useEffect, useState } from 'react'
import { BOARD_HEIGHT, BOARD_WIDTH, GAME_SPEED } from '../constants.js'
import { initializeObstacles, moveObstacles } from '../helpers/obstacleHelpers.js'
import { renderBoard } from '../helpers/renderHelpers.js'

const MainMenu: React.FC<{ onStart: () => void; onExit: () => void }> = ({ onStart, onExit }) => {
  const [selectedOption, setSelectedOption] = useState(0)
  const [obstacles, setObstacles] = useState(initializeObstacles())
  const [frogPosition] = useState({ x: Math.floor(BOARD_WIDTH / 2), y: BOARD_HEIGHT - 1 })

  useEffect(() => {
    const timer = setInterval(() => {
      setObstacles(moveObstacles)
    }, GAME_SPEED)

    return () => clearInterval(timer)
  }, [])

  useInput((_, key) => {
    if (key.upArrow || key.downArrow) {
      setSelectedOption((prev) => (prev === 0 ? 1 : 0))
    } else if (key.return) {
      selectedOption === 0 ? onStart() : onExit()
    }
  })

  return (
    <Box flexDirection="column">
      {renderBoard(frogPosition, obstacles, 0)}
      <Box flexDirection="column" alignItems="center" marginTop={1}>
        <Text bold>tFrogger</Text>
        <Text color={selectedOption === 0 ? 'green' : 'white'}>Start Game</Text>
        <Text color={selectedOption === 1 ? 'green' : 'white'}>Exit</Text>
      </Box>
    </Box>
  )
}

export default MainMenu
