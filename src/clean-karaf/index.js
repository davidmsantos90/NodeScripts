#! /usr/bin/env node

import '@babel/polyfill'
import { echo } from 'shelljs'

import { clearCache, store, activate } from './commands'
import cleanKarafUtils from './utils/index'

if (cleanKarafUtils.isHelp) {
  echo(cleanKarafUtils.help)
} else {
  if (cleanKarafUtils.isDebug) echo(`[DEBUG] Starting execution of clean-karaf...`)

  clearCache()

  if (cleanKarafUtils.isActivateMode) activate()
  else store()

}
