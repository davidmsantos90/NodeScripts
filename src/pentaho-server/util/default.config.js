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

const {
  action, tail, debug, help
} = _getLocalConfiguration()

export default {
  action, tail, debug, help
}
