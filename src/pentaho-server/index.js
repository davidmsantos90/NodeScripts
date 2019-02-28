#! /usr/bin/env node

import { echo } from 'shelljs'

import pentahoServerCmds from './commands'
import pentahoServerUtils from './util/index'

const command = () => {
  if (pentahoServerUtils.isRestart) return pentahoServerCmds.restart()

  if (pentahoServerUtils.isStop) return pentahoServerCmds.stop()

  if (pentahoServerUtils.isStart) return pentahoServerCmds.start()

  return Promise.resolve()
}

if (pentahoServerUtils.isHelp) {
  echo(pentahoServerUtils.help)
} else {
  command()
    .catch((error) => echo(error))
}
