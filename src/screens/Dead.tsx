import { Box, Text } from 'ink'
import React from 'react'
import FullSizeBox from '../components/FullSizeBox.js'
import { GAME_OVER_FROG_ART } from '../constants.js'

type DeadProperties = {
  readonly livesRemaining: number
}

function Dead({ livesRemaining }: DeadProperties) {
  return (
    <FullSizeBox>
      <>
        <Text bold color="yellow">
          {GAME_OVER_FROG_ART}
        </Text>
        <Text bold>Dead</Text>
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text italic>You have {livesRemaining} lives remaining.</Text>
        </Box>
      </>
    </FullSizeBox>
  )
}

export default Dead
