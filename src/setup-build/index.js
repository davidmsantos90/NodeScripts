#! /usr/bin/env node

import '@babel/polyfill'

import setupBuildUtils from './util/index'

import logger from '../helpers/logger'
import terminal from '../helpers/terminal'

// ---

const execution = () => {
  if (!setupBuildUtils.isBaseFolderDefined) {
    const pathUndefinedWarn = `Define 'path' in the './local.config.json' or by using the '-p' option!`
    logger.warn(pathUndefinedWarn)

    return Promise.reject(pathUndefinedWarn)
  }

  if (!setupBuildUtils.isBaseLinkDefined) {
    const linkUndefinedWarn = `Define 'link' in the './local.config.json' or by using the '-p' option!`
    logger.warn(linkUndefinedWarn)

    return Promise.reject(linkUndefinedWarn)
  }

  if (setupBuildUtils.isServerMode) return setupBuildUtils.createPentahoServer().setup().catch(() => {})

  if (setupBuildUtils.isPdiMode) return setupBuildUtils.createPdiClient().setup().catch(() => {})

  return Promise.resolve()
}

const endProcess = () => {
  terminal._exit()
  process.exit()
}

if (setupBuildUtils.isHelp) {
  logger.log(setupBuildUtils.help)

  endProcess()
}

execution()
  .then(endProcess)
  .catch(endProcess)
