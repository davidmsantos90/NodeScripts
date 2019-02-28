#! /usr/bin/env node

import '@babel/polyfill'
import { echo } from 'shelljs'

import cleanKarafCmds from './commands'
import cleanKarafUtils from './util/index'

if (cleanKarafUtils.isHelp) {
  echo(cleanKarafUtils.help)
} else {
  if (cleanKarafUtils.isDebug) echo(`[DEBUG] Starting execution of clean-karaf...`)

  cleanKarafCmds.clearCache()

  if (cleanKarafUtils.isActivateMode) cleanKarafCmds.activate()
  else cleanKarafCmds.store()
}
