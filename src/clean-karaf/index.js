#! /usr/bin/env node

import '@babel/polyfill'

import logger from '../helpers/logger'

import cleanKarafCmds from './commands'
import cleanKarafUtils from './util/index'

if (cleanKarafUtils.isHelp) logger.log(cleanKarafUtils.help)

else {
  cleanKarafCmds.clearCache().then(() => {
    if (cleanKarafUtils.isActivateMode) cleanKarafCmds.activate()

    else cleanKarafCmds.store()
  })
}
