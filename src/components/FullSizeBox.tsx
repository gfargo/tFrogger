import { Box, type BoxProps } from 'ink'
import React from 'react'
import { useStdoutDimensions } from '../hooks/useStdOutDimensions.js'

type FullSizeBoxProperties = {
  readonly children: React.ReactNode
} & BoxProps

function FullSizeBox({ children, ...rest }: FullSizeBoxProperties) {
  const [rows, columns] = useStdoutDimensions()

  return (
    <Box
      minHeight={columns}
      minWidth={rows}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      {...rest}
    >
      {children}
    </Box>
  )
}

export default FullSizeBox
