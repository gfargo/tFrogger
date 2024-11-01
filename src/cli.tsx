#!/usr/bin/env node
import { render } from 'ink'
import React from 'react'
import App from './app.js'

// For CLI Options and Arguments.., use meow
// import meow from 'meow';

// const cli = meow(
// 	`
// 	Usage
// 	  $ tFrogger

// 	b
// 	Examples
// 	  $ tFrogger
// `,
// 	{
// 		importMeta: import.meta,
// 		flags: {
// 			// name: {
// 			// 	type: 'string',
// 			// },
// 		},
// 	},
// );

render(<App />)
