import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import Game from '../Game.js'

test('basic snapshot test on last frame rendered', (t) => {
  const { lastFrame } = render(<Game />)
  const appLastFrame = lastFrame()
  t.snapshot(appLastFrame)
})
