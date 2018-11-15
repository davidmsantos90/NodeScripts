#! /usr/bin/env node

import { echo } from 'shelljs'

import { clearCache, store, restore } from './commands'
import cleanKarafUtils from './utils'

if (cleanKarafUtils.isHelp) {
  echo(cleanKarafUtils.help)
} else {
  clearCache()

  if (cleanKarafUtils.isStoreMode) store()

  if (cleanKarafUtils.isRestoreMode) restore()
}
