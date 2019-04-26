import { options, help } from './arguments'

import artifacts from '../artifacts/index'

export const SERVER_EXEC = 'server'
export const PDI_EXEC = 'pdi'

const SetupBuildUtils = ({
  version, type, path, link, build = 'latest', execution: _execution, help: _isHelp, debug: _isDebug
}) => ({
  createPentahoServer () {
    const { PentahoServer } = artifacts

    return new PentahoServer({
      build, type, version, link, root: path
    })
  },

  createPdiClient () {
    const { PdiClient } = artifacts

    return new PdiClient({
      build, type, version, link, root: path
    })
  },

  get isHelp () {
    return _isHelp
  },

  get isDebug () {
    return _isDebug
  },

  get isBaseFolderDefined () {
    return path != null
  },

  get isBaseLinkDefined () {
    return link != null
  },

  get help () {
    return help
  },

  get isServerMode () {
    return _execution === SERVER_EXEC
  },

  get isPdiMode () {
    return _execution === PDI_EXEC
  }
})

export default SetupBuildUtils(options)
