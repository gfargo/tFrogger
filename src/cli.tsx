#!/usr/bin/env node
import { render } from 'ink'
import meow from 'meow'
import React from 'react'
import Game from './Game.js'

const cli = meow(
  `
	Usage
	  $ tFrogger

  Options
    --debug Show debug information

	Examples
	  $ tFrogger
    $ tFrogger --debug
`,
  {
    importMeta: import.meta,
    flags: {
      debug: {
        type: 'boolean',
        default: false,
      },
    },
  }
)

render(<Game isDebugMode={cli.flags.debug} />)
