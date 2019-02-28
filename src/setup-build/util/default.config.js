const _getLocalConfiguration = () => {
  const filename = 'local.config'

  let localConfiguration = null
  try {
    localConfiguration = require(`../${filename}`)
  } catch (ex) {
    // does nothing
  }

  if (localConfiguration == null) {
    localConfiguration = {}
  }

  return localConfiguration
}

const DEFAULT_LINK = 'http://build.pentaho.com/hosted'

const {
  execution, path, link = DEFAULT_LINK, type, version, build, debug, help
} = _getLocalConfiguration()

export default {
  execution, path, link, type, version, build, debug, help
}
