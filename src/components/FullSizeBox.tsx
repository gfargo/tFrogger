import { Box, BoxProps } from 'ink'
import React from 'react'
import { useStdoutDimensions } from '../hooks/useStdOutDimensions.js'

interface FullSizeBoxProps extends BoxProps {
  children: React.ReactNode
}

function FullSizeBox({ children, ...rest }: FullSizeBoxProps) {
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
