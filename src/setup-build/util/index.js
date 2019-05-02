import { underline } from 'chalk'

import { options, help } from './arguments'

import artifacts from '../artifacts/index'
import logger from '../../helpers/logger'

export const SERVER_EXEC = 'server'
export const PDI_EXEC = 'pdi'
export const ALL_EXEC = 'all'

const SetupBuildUtils = ({
  version, type, path, link, build = 'latest', execution: _execution, help: _isHelp, debug: _isDebug
}) => ({
  get pentahoServerBuild () {
    return this.__createSetupBuild(this._pentahoServerBuild)
  },

  get _pentahoServerBuild () {
    const { PentahoServer } = artifacts

    return new PentahoServer({
      build, type, version, link, root: path
    })
  },

  get pdiClientBuild () {
    return this.__createSetupBuild(this._pdiClientBuild)
  },

  get _pdiClientBuild () {
    const { PdiClient } = artifacts

    return new PdiClient({
      build, type, version, link, root: path
    })
  },

  get allBuilds () {
    return this.__createSetupBuild(this._pdiClientBuild, this._pentahoServerBuild)
  },

  __createSetupBuild (...artifacts) {
    const executeAll = async (method) => {
      let executions = []

      for (let build of artifacts) {
        const exec = await build[method]()

        if (Array.isArray(exec)) executions = [ ...executions, ...exec ]
        else executions.push(exec)
      }

      return executions
    }

    return {
      async setup () {
        logger.info(underline(`1. Download:`))
        await Promise.all([
          ...await executeAll('download')
        ]).catch(() => { /* do nothing */ })

        logger.log()
        logger.info(underline(`2. Extract:`))
        await Promise.all([
          ...await executeAll('extract')
        ]).catch(() => { /* do nothing */ })

        logger.log()
        logger.info(underline(`3. Cleanup:`))
        await Promise.all([
          ...await executeAll('_cleanup')
        ]).catch(() => { /* do nothing */ })
      }
    }
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
  },

  get isAllMode () {
    return _execution === ALL_EXEC
  }
})

export default SetupBuildUtils(options)
