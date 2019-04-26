import shell from '../helpers/shell'

import cleanKarafUtils from './util/index'

export default {
  async clearCache () {
    if (cleanKarafUtils.isDebug) await shell.echo(`[DEBUG] About to clean karaf cache...`)

    if (cleanKarafUtils.cacheExists) {
      await shell.rm(`-rf ${cleanKarafUtils.cachePath}`)

      return shell.echo('[INFO] Karaf cache was deleted!')
    }

    return shell.echo('[INFO] Karaf cache already deleted!')
  },

  async activate () {
    if (cleanKarafUtils.isDebug) await shell.echo(`[DEBUG] About to activate some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToActivate
    if (!bundleList.length) return shell.echo('[WARN] No bundles to activate!')

    await shell.echo('\n[INFO] Preparing to activate karaf bundles:')

    for (let bundle of bundleList) {
      await bundle.activate()
    }

    return shell.echo('')
  },

  async store () {
    if (cleanKarafUtils.isDebug) await shell.echo(`[DEBUG] About to store some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToStore
    if (!bundleList.length) return shell.echo('[WARN] No bundles to store!')

    await shell.echo('\n[INFO] Preparing to store karaf bundles:')

    for (let bundle of bundleList) {
      await bundle.store()
    }

    return shell.echo('')
  }
}
