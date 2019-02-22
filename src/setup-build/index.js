#! /usr/bin/env node

import '@babel/polyfill'
import { echo } from 'shelljs'

import setupBuildUtils from './utils'
import { server, pdi } from './executions'

import logger from '../helpers/logger'

// ---

if (setupBuildUtils.isHelp) {
  logger.log(setupBuildUtils.help)

} else if (!setupBuildUtils.isBaseFolderDefined) {
  logger.warn(`Define 'path' in the './local.config.json' or by using the '-p' option!`)

} else {
  if (setupBuildUtils.isServerMode) server().then(() => process.exit())

  if (setupBuildUtils.isPdiMode) pdi().then(() => process.exit())
}
