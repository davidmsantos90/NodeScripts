import { options, help } from './arguments'

// import terminal from '../../helpers/visual/terminal'
import commands from '../commands/index'

import {
  PentahoServer,
  PdiClient,
  createPlugin
} from '../artifacts/index'

export const SERVER_EXEC = 'server'
export const PDI_EXEC = 'pdi'
export const ALL_EXEC = 'all'

/** @private */
const normalize = (value = '', size = 2) => {
  const valueSize = `${value}`.trim().length
  if (valueSize >= size) return value

  return `${'0'.repeat(size - valueSize) + value}`
}

/** @private */
const parseDate = (modified = '') => {
  let date = null

  try {
    date = new Date(Date.parse(modified))
  } catch (ex) {
    // does nothing
  }

  return isNaN(date) ? null : date
}

/** @private */
const stringDate = (date) => {
  const day = normalize(`${date.getDate()}`)
  const month = normalize(`${date.getMonth() + 1}`)

  return `${month}-${day}`
}

export const latestBuild = () => stringDate(new Date())

export const isLatestBuild = (modified = '') => {
  const modifiedDate = parseDate(modified)
  if (modifiedDate == null) return false

  return stringDate(modifiedDate) === latestBuild()
}

export const isHelpEnabled = () => options.help
export const helpText = () => help

export const setup = async () => {
  const { execution, build, type, path: root, link, plugins = [] } = options

  const isEnterprise = !execution.endsWith('-ce')

  const setupOptions = {
    ...options,
    root,

    _build: build === 'latest' ? latestBuild() : build,
    enterprise: isEnterprise,

    type: type.toLowerCase(),
    tag: type.toUpperCase()
  }

  const isAllMode = execution.startsWith(ALL_EXEC)

  let builds = []
  if (isAllMode || execution.startsWith(SERVER_EXEC)) {
    const server = new PentahoServer(setupOptions)
    const serverPlugins = isEnterprise
      ? plugins.map((name) => createPlugin(name, setupOptions))
      : []

    builds = [ server, ...serverPlugins ]
  }

  if (isAllMode || execution.startsWith(PDI_EXEC)) {
    const pdi = new PdiClient(setupOptions)

    builds = [ pdi, ...builds ]
  }

  let error = null

  try {
    if (root == null) {
      throw new Error(`Define 'path' in the './local.config.json' or by using the '-p' option!`)
    }

    if (link == null) {
      throw new Error(`Define 'link' in the './local.config.json' or by using the '-p' option!`)
    }

    builds = builds.filter((build) => build != null)

    let { error: downEx } = await commands.download({ builds, ...setupOptions })
    if (downEx != null) throw downEx

    let { error: extrEx } = await commands.extract({ builds, ...setupOptions })
    if (extrEx != null) throw extrEx

    let { error: cleanEx } = await commands.cleanup({ builds, ...setupOptions })
    if (cleanEx != null) throw cleanEx
  } catch (ex) {
    error = ex
  }

  return { error }
}
