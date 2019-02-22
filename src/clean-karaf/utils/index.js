import { existsSync } from 'fs'
import { echo } from 'shelljs'
import { join } from 'path'

import Bundle from '../Bundle'
import { options, help, defaults } from './arguments'

const SYSTEM_FOLDER = 'system'
const KARAF_FOLDER = 'karaf'
const KARAF_CACHES_FOLDER = 'caches'

const createBundleMap = () => Object.create({
  [Symbol.iterator]: function*() {
    for(let key of this.__keys) {
      yield([key, this.__map[key]])
    }
  },

  __keys: [],
  __map: {},

  put(key, value) {
    const alreadyDefined = this.__keys.includes(key)
    if (this.__keys.includes(key)) throw new Error('BundleMap: key already defined')

    this.__keys.push(key)
    this.__map[key] = value

    return this
  },

  remove(key) {
    this.__keys = this.__keys.filter(iKey => iKey !== key)

    delete this.__map[key]

    return this
  }
})

const UtilsFactory = ({
  root = '/',
  output = '.store',
  bundles: bundleList = [],
  activate: isActivate = false,
  help: isHelp = false,
  debug: isDebug = false
}) => {
  if (isDebug) {
    echo(`[DEBUG] "root": ${ root }`)
    echo(`[DEBUG] "output": ${ output }`)
    echo(`[DEBUG] "bundle list": ${ bundleList }`)
    echo(`[DEBUG] "activate mode": ${ isActivate }`)
  }

  const karafPath = join(root, SYSTEM_FOLDER, KARAF_FOLDER) // .../data-integration/system/karaf/

  const karafSystemPath = join(karafPath, SYSTEM_FOLDER)
  const storePath = join(karafPath, SYSTEM_FOLDER, output)    // .../karaf/system/.store/
  const cachePath = join(karafPath, KARAF_CACHES_FOLDER)      // .../karaf/caches/

  if (isDebug) {
    echo(`\n[DEBUG] "karafPath": ${ karafPath }`)
    echo(`[DEBUG] "storePath": ${ storePath }`)
    echo(`[DEBUG] "cachePath": ${ cachePath }`)
  }


  const bundleMap = createBundleMap()
  for (let id of bundleList) {
    const {
      karafBundles: { [id]: { folders = [] } = {} } = {}
    } = defaults

    if (isDebug) echo(`[DEBUG] Creating Bundle: ${ id }`)

    bundleMap.put(id, new Bundle({ id, karafPath: karafSystemPath, storePath, folders }))
  }

  // ---

  return {
    get isActivateMode() {
      return isActivate
    },

    get isDebug() {
      return isDebug
    },

    get isHelp() {
      return isHelp
    },

    get help() {
      return help
    },

    /**
     * Gets the list of karaf bundles to activate.
     *
     * @type {Array.<Bundle>}
     * @readOnly
     */
    get bundlesToActivate() {
      const canActivateBundle = (bundle) => bundle.isStored

      let bundlesToActivate = []
      for (let [, bundle] of bundleMap) {
        if (this.isDebug) {
          console.log(`\n[${ bundle.id.toUpperCase() }] - to activate`)
          console.log(`isStored: ${ bundle.isStored }`)
          console.log(`isActive: ${ bundle.isActive }`)
        }

        if (canActivateBundle(bundle)) {
          bundlesToActivate.push(bundle)
        }
      }

      return bundlesToActivate
    },

    /**
     * Gets the list of karaf bundles to store.
     *
     * @type {Array.<Bundle>}
     * @readOnly
     */
    get bundlesToStore() {
      const canStoreBundle = (bundle) => bundle.isActive

      let bundlesToStore = []
      for (let [, bundle] of bundleMap) {
        if (this.isDebug) {
          console.log(`\n[${ bundle.id.toUpperCase() }] - to store`)
          console.log(`isStored: ${ bundle.isStored }`)
          console.log(`isActive: ${ bundle.isActive }`)
        }

        if (canStoreBundle(bundle)) {
          bundlesToStore.push(bundle)
        }
      }

      return bundlesToStore
    },

    /**
     * Determines if karaf's cache exists
     *
     * @type {boolean}
     * @readOnly
     */
    get cacheExists() {
      return existsSync(cachePath)
    },

    get cachePath() {
      return cachePath
    }
  }
}

export default UtilsFactory(options)
