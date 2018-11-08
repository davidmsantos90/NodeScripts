import { join } from 'path'
import { existsSync } from 'fs'

const localConfigurationFile = 'local.config'

const configLocation = `${ join(__dirname, localConfigurationFile) }.json`
const hasLocalConfig = existsSync(configLocation)

const DEFAULT_EXECUTION = null
const DEFAULT_PATH = null
const DEFAULT_VERSION = '9.0.0.0'
const DEFAULT_TYPE = 'SNAPSHOT'
const DEFAULT_BUILD_NUMBER = '?'
const DEFAULT_DEBUG = false

const {
  execution, path, debug, type, version, build
} = hasLocalConfig ? require(`./${ localConfigurationFile }`) : {}

export const defaults = {
  execution: execution != null ? execution : DEFAULT_EXECUTION,
  path: path != null ? path : DEFAULT_PATH,
  debug: debug != null ? Boolean(debug) : DEFAULT_DEBUG,
  type: type != null ? type : DEFAULT_TYPE,
  version: version != null ? version : DEFAULT_VERSION,
  build: build != null ? build : DEFAULT_BUILD_NUMBER
}
