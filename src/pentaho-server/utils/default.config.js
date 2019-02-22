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

const DEFAULT_ACTION = 'restart'
const DEFAULT_DEBUG = false
const DEFAULT_HELP = false
const DEFAULT_TAIL = false

const {
  action, debug, tail, help
} = _getLocalConfiguration()

export const defaults = {
  help: help != null ? help : DEFAULT_HELP,
  action: action != null ? action : DEFAULT_ACTION,
  tail: tail != null ? tail : DEFAULT_TAIL,
  debug: debug != null ? Boolean(debug) : DEFAULT_DEBUG
}
