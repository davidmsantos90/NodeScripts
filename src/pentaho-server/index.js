#! /usr/bin/env node

import pentahoServerCmds from './commands'
import pentahoServerUtils from './util/index'

import logger from './server-logger'

const command = async () => {
  if (pentahoServerUtils.isRestart) return pentahoServerCmds.restart()

  if (pentahoServerUtils.isStop) return pentahoServerCmds.stop()

  if (pentahoServerUtils.isStart) return pentahoServerCmds.start()
}

const endProcess = ({ error } = {}) => {
  if (error != null) logger.error(error)

  process.exit()
}

if (pentahoServerUtils.isHelp) {
  logger.log(pentahoServerUtils.help)
} else {
  command().then(endProcess).catch(endProcess)
}
