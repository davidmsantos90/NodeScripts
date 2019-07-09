import shell from '../helpers/shell'

import logger from '../helpers/logger'

import cleanKarafUtils from './util/index'

export default {
  async clearCache () {
    if (cleanKarafUtils.isDebug) logger.debug(`About to clean karaf cache...`)

    if (cleanKarafUtils.cacheExists) {
      await shell.rm(`-rf ${cleanKarafUtils.cachePath}`)

      return logger.info('Karaf cache was deleted!')
    }

    return logger.warn('Karaf cache already deleted!')
  },

  async activate () {
    if (cleanKarafUtils.isDebug) logger.debug(`About to activate some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToActivate
    if (!bundleList.length) return logger.warn('No bundles to activate!')

    logger.info('Preparing to activate karaf bundles:')

    for (let bundle of bundleList) {
      await bundle.activate()
    }

    return logger.log()
  },

  async store () {
    if (cleanKarafUtils.isDebug) logger.debug(`About to store some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToStore
    if (!bundleList.length) return logger.warn('No bundles to store!')

    logger.info('Preparing to store karaf bundles:')

    for (let bundle of bundleList) {
      await bundle.store()
    }

    return logger.log()
  }
}
