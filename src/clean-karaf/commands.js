import { existsSync } from 'fs'
import { mkdir, mv, rm, echo } from 'shelljs'

import cleanKarafUtils from './utils'

export { clearCache, restore, store }

const clearCache = () => {
  if (cleanKarafUtils.isKarafCacheCreated) {
    rm('-rf', cleanKarafUtils.karafCacheFolder)

    return echo('[INFO] Karaf cache was deleted!\n')
  }

  echo('[INFO] Karaf cache already deleted!\n')
}

const restore = () => {
  const bundleList = cleanKarafUtils.bundleList

  if (!bundleList.length) {
    return
  }

  echo('[INFO] Preparing to restore services:')

  const bundlesToRestore = bundleList.filter((bundleID) => {
    const isStored = cleanKarafUtils.isBundleStored(bundleID)
    if (!isStored) {
      echo(`[WARNING]  - '${ bundleID }' can not be restored!`)
    }

    return isStored
  })

  for (let bundleID of bundlesToRestore) {
    __restore(bundleID)
  }

  echo('')
}

const store = () => {
  const bundleList = cleanKarafUtils.bundleList

  if (!bundleList.length) {
    return
  }

  echo('[INFO] Preparing to store services:')

  const bundlesToStore = bundleList.filter((bundleID) => {
    const isRestored = cleanKarafUtils.isBundleRestored(bundleID)
    if (!isRestored) {
      echo(`[WARNING]  - '${ bundleID }' can not be stored!`)
    }

    return isRestored
  })

  for (let bundleID of bundlesToStore) {
    __store(bundleID)
  }

  echo('')
}

const __restore = (bundleID) => {
  if (cleanKarafUtils.isBundleRestored(bundleID)) {
    return echo(`[WARNING]  - '${ bundleID }' already restored!`)
  }

  let originFolders = cleanKarafUtils.getBundleStoreFolder(bundleID)
  let destFolders = cleanKarafUtils.getBundleKarafFolder(bundleID, '..')

  const originLength = originFolders.length
  const destLength = destFolders.length

  if (originLength !== destLength) return

  for (let index = 0; index < originLength; index++) {
    let origin = originFolders[index]
    let dest = destFolders[index]

    mkdir('-p', dest)
    mv(origin, dest)
  }

  echo(`[INFO]     - '${ bundleID }' was restored!`)
}

const __store = (bundleID) => {
  if (cleanKarafUtils.isBundleStored(bundleID)) {
    return echo(`[WARNING]  - '${ bundleID }' already stored!`)
  }

  const originFolders = cleanKarafUtils.getBundleKarafFolder(bundleID)
  const destFolders = cleanKarafUtils.getBundleStoreFolder(bundleID, '..')

  const originLength = originFolders.length
  const destLength = destFolders.length

  if (originLength !== destLength) return

  for (let index = 0; index < originLength; index++) {
    let origin = originFolders[index]
    let dest = destFolders[index]

    mkdir('-p', dest)
    mv(origin, dest)
  }

  echo(`[INFO]     - '${ bundleID }' was stored!`)
}
