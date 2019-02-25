#! /usr/bin/env node

import '@babel/polyfill'
import { echo } from 'shelljs'

import setupBuildUtils from './utils'
import { server, pdi } from './executions'

import logger from '../helpers/logger'
import terminal from '../helpers/terminal'

// ---

if (setupBuildUtils.isHelp) {
  logger.log(setupBuildUtils.help)

} else if (!setupBuildUtils.isBaseFolderDefined) {
  logger.warn(`Define 'path' in the './local.config.json' or by using the '-p' option!`)

} else {
  const endProcess = () => {
    terminal._exit()
    process.exit()
  }

  if (setupBuildUtils.isServerMode) server().then(endProcess).catch(endProcess)

  if (setupBuildUtils.isPdiMode) pdi().then(endProcess).catch(endProcess)
}
