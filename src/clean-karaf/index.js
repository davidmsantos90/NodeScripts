#! /usr/bin/env node

import '@babel/polyfill'

import shell from '../helpers/shell'

import cleanKarafCmds from './commands'
import cleanKarafUtils from './util/index'

if (cleanKarafUtils.isHelp) shell.echo(cleanKarafUtils.help)

else {
  cleanKarafCmds.clearCache().then(() => {
    if (cleanKarafUtils.isActivateMode) cleanKarafCmds.activate()

    else cleanKarafCmds.store()
  })
}
