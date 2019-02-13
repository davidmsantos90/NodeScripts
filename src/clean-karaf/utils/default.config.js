import { pwd } from 'shelljs'

const DEFAULT_ROOT = pwd().toString()
const DEFAULT_BUNDLES = []
const DEFAULT_DEBUG = false
const DEFAULT_ACTIVATE = false
const DEFAULT_OUTPUT =  '.store'

const _getLocalConfiguration = () => {
  const filename = 'local.config'

  let localConfiguration = null
  try {
    localConfiguration = require(`../${ filename }`)
  } catch(ex) {
    // does nothing
  }

  if (localConfiguration == null) {
    localConfiguration = {}
  }

  return localConfiguration
}

const {
  root, activate, output, bundles, debug, karafBundles
} = _getLocalConfiguration()

export const defaults = {
  root: root != null ? root : DEFAULT_ROOT,
  output: output != null ? output : DEFAULT_OUTPUT,
  bundles: bundles != null ? bundles : DEFAULT_BUNDLES,
  karafBundles: karafBundles != null ? karafBundles : {},
  activate: Boolean(activate != null ? activate : DEFAULT_ACTIVATE),
  debug: Boolean(debug != null ? debug : DEFAULT_DEBUG)
}
