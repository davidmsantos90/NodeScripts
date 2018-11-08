#! /usr/bin/env node

import { echo } from 'shelljs'

import setupBuildUtils from './utils'
import { server, pdi } from './executions'


// ---

if (setupBuildUtils.isHelp) {
  echo(setupBuildUtils.help)

} else if (!setupBuildUtils.isBaseFolderDefined) {
  echo(`[WARNING] Define 'path' in the './local.config.json' or by using the '-p' option!`)

} else {
  if (setupBuildUtils.isServerMode) server()

  if (setupBuildUtils.isPdiMode) pdi()
}
