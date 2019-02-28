import { rm, echo } from 'shelljs'

import cleanKarafUtils from './util/index'

export default {
  clearCache () {
    if (cleanKarafUtils.isDebug) echo(`[DEBUG] About to clean karaf cache...`)

    if (cleanKarafUtils.cacheExists) {
      rm('-rf', cleanKarafUtils.cachePath)

      return echo('[INFO] Karaf cache was deleted!')
    }

    echo('[INFO] Karaf cache already deleted!')
  },

  activate () {
    if (cleanKarafUtils.isDebug) echo(`[DEBUG] About to activate some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToActivate
    if (!bundleList.length) return

    echo('\n[INFO] Preparing to activate karaf bundles:')

    for (let bundle of bundleList) {
      bundle.activate()
    }

    echo('')
  },

  store () {
    if (cleanKarafUtils.isDebug) echo(`[DEBUG] About to store some karaf bundles...`)

    const bundleList = cleanKarafUtils.bundlesToStore
    if (!bundleList.length) return

    echo('\n[INFO] Preparing to store karaf bundles:')

    for (let bundle of bundleList) {
      bundle.store()
    }

    echo('')
  }
}
