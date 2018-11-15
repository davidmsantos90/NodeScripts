import { existsSync } from 'fs'
import { join } from 'path'

import { defaults } from './default.config'
import { options, help } from './arguments'

const SYSTEM_FOLDER = 'system'
const KARAF_FOLDER = 'karaf'
const KARAF_CACHES_FOLDER = 'caches'

const STORE_MODE = 'store'
const RESTORE_MODE = 'restore'

const CleanKarafUtils = ({
  path: _baseFolder, output: _outputFolder, mode: _mode, bundles: _bundleList, help: _isHelp, debug: _isDebug
}) => {
  const _karafFolder = join(_baseFolder, SYSTEM_FOLDER, KARAF_FOLDER)
  const _karafCacheFolder = join(_karafFolder, KARAF_CACHES_FOLDER)

  const _karafSystemFolder = join(_karafFolder, SYSTEM_FOLDER)
  const _karafStoreFolder = join(_karafSystemFolder, _outputFolder)

  const { karafBundles } = defaults

  const _getBundleInformation = (bundleID) => {
    const { [bundleID]: bundleInformation = {} } = karafBundles

    return bundleInformation
  }

  const _getBundleKarafFolder = (bundleID, path = '') => {
    const { path: bundleFolders = [] } = _getBundleInformation(bundleID)
    if (!bundleFolders.length) {
      return ['']
    }

    return bundleFolders.map((folder) => join(_karafSystemFolder, folder, path))
  }

  const _getBundleStoreFolder = (bundleID, path = '') => {
    const { path: bundleFolders = [] } = _getBundleInformation(bundleID)
    if (!bundleFolders.length) {
      return ['']
    }

    return bundleFolders.map((folder) => join(_karafStoreFolder, folder, path))
  }

  const _isBundleRestored = (bundleID) => {
    const bundleKarafFolders = _getBundleKarafFolder(bundleID)

    return bundleKarafFolders.reduce((isStored, folder) => isStored && existsSync(folder), true)
  }

  const _isBundleStored = (bundleID) => {
    const bundleOutputFolders = _getBundleStoreFolder(bundleID)

    return bundleOutputFolders.reduce((isStored, folder) => isStored && existsSync(folder), true)
  }

  const _isKarafCacheCreated = () => {
    return existsSync(_karafCacheFolder)
  }

  return {
    get isStoreMode() {
      return _mode === STORE_MODE
    },

    get isRestoreMode() {
      return _mode === RESTORE_MODE
    },

    get mode() {
      return _mode
    },

    get isHelp() {
      return _isHelp
    },

    get isDebug() {
      return _isDebug
    },

    get bundleList() {
      return _bundleList
    },

    get help() {
      return help
    },

    isBundleRestored: _isBundleRestored,

    isBundleStored: _isBundleStored,

    isKarafCacheCreated: _isKarafCacheCreated,

    get karafCacheFolder() {
      return _karafCacheFolder
    },

    getBundleKarafFolder: _getBundleKarafFolder,

    getBundleStoreFolder: _getBundleStoreFolder
  }
}

export default CleanKarafUtils(options)
