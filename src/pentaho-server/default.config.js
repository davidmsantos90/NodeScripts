import { pwd } from 'shelljs'
import { join } from 'path'
import { existsSync } from 'fs'

const localConfigurationFile = 'local.config'

const configLocation = `${ join(__dirname, localConfigurationFile) }.json`
const hasLocalConfig = existsSync(configLocation)

const DEFAULT_ACTION = 'restart'
const DEFAULT_DEBUG = false
const DEFAULT_HELP = false
const DEFAULT_TAIL = false

const {
  action, debug, tail, help
} = hasLocalConfig ? require(`./${ localConfigurationFile }`) : {}

export const defaults = {
  help: help != null ? help : DEFAULT_HELP,
  action: action != null ? action : DEFAULT_ACTION,
  tail: tail != null ? tail : DEFAULT_TAIL,
  debug: debug != null ? Boolean(debug) : DEFAULT_DEBUG
}
