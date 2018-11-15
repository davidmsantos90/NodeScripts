import { pwd } from 'shelljs'
import { join } from 'path'
import { existsSync } from 'fs'

const localConfigurationFile = 'local.config'

const configLocation = `${ join(__dirname, localConfigurationFile) }.json`
const hasLocalConfig = existsSync(configLocation)

const DEFAULT_PATH = pwd().toString()
const DEFAULT_BUNDLES = []
const DEFAULT_DEBUG = false
const DEFAULT_MODE = 'store'
const DEFAULT_OUTPUT =  '.store'

const {
  path, mode, output, bundles, debug, karafBundles
} = hasLocalConfig ? require(`./${ localConfigurationFile }`) : {}

export const defaults = {
  path: path != null ? path : DEFAULT_PATH,
  bundles: bundles != null ? bundles : DEFAULT_BUNDLES,
  karafBundles: karafBundles != null ? karafBundles : {},
  mode: mode != null ? mode : DEFAULT_MODE,
  output: output != null ? output : DEFAULT_OUTPUT,
  debug: debug != null ? Boolean(debug) : DEFAULT_DEBUG
}
