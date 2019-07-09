#! /usr/bin/env node

import '@babel/polyfill'

import { setup, helpText, isHelpEnabled } from './util/index'

import logger from '../helpers/logger'
import terminal from '../helpers/visual/terminal'

// ---

const endProcess = ({ error }) => {
  if (error != null) terminal.error(error.message)

  terminal._exit()
  process.exit()
}

if (isHelpEnabled()) {
  logger.log(helpText())

  endProcess()
}

terminal.init()

setup().then(endProcess).catch(endProcess)
