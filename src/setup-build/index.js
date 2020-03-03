#! /usr/bin/env node

import '@babel/polyfill'

import logger from './setup-logger'

import SetupController from './controller'

logger.info('Creating application controller')

const controller = new SetupController({ logger })

controller.execute()
