#! /usr/bin/env node

import { echo } from 'shelljs'

import { start, stop, restart, tail } from './commands'
import pentahoServerUtils from './utils'

if (pentahoServerUtils.isHelp) {
  echo(pentahoServerUtils.help)
} else {
  if (pentahoServerUtils.isRestart) restart().catch((error) => echo(error))

  if (pentahoServerUtils.isStop) stop().catch((error) => echo(error))

  if (pentahoServerUtils.isStart) start().catch((error) => echo(error))

}
