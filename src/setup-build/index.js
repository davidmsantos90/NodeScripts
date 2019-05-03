#! /usr/bin/env node

import '@babel/polyfill'

import { setup, helpText, isHelpEnabled } from './util/index'

import logger from '../helpers/logger'
import terminal from '../helpers/terminal'

// ---

const endProcess = ({ error }) => {
  if (error != null) logger.error(error)

  terminal._exit()
  process.exit()
}

if (isHelpEnabled()) {
  logger.log(helpText())

  endProcess()
}

setup().then(endProcess).catch(endProcess)
