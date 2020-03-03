import { join } from 'path'
import { readFile, readFileSync } from 'fs'

import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

export const SERVER_FOLDER = 'pentaho-server'
export const SERVER_SYSTEM_FOLDER = join(SERVER_FOLDER, 'pentaho-solutions', 'system')
export const SERVER_KARAF_ETC_FOLDER = join(SERVER_SYSTEM_FOLDER, 'karaf', 'etc')

export const SERVER_CE = 'pentaho-server-ce'
export const SERVER_EE = 'pentaho-server-ee'

export const PDI_FOLDER = 'data-integration'
export const PDI_SYSTEM_FOLDER = join(PDI_FOLDER, 'system')
export const PDI_KARAF_ETC_FOLDER = join(PDI_SYSTEM_FOLDER, 'karaf', 'etc')

export const PDI_CE = 'pdi-ce'
export const PDI_EE = 'pdi-ee-client'

const parseConfigFileSync = (path = '') => {
  try {
    const data = readFileSync(join(__dirname, path), { encoding: 'utf8' })

    return JSON.parse(data)
  } catch (ex) {
    return {}
  }
}

const getBaseConfigurationSync = () => {
  const {
    link = 'http://build.pentaho.com/hosted',
    execution = 'all',
    path = '',
    type = '',
    version = '',
    build = '',
    plugins = [],
    help = false
  } = parseConfigFileSync('../config.json')

  return {
    link, execution, path, type, version, build, plugins, help
  }
}

export default () => {
  const defaultConfig = getBaseConfigurationSync()

  const optionsConfiguration = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Help'
    }, {
      name: 'execution',
      alias: 'e',
      defaultOption: true,
      defaultValue: defaultConfig.execution,
      description: 'Which execution to run:\n - server, pdi'
    }, {
      name: 'type',
      alias: 't',
      defaultValue: defaultConfig.type,
      description: 'Build type to setup:\n - snapshot, qat, release'
    }, {
      name: 'version',
      alias: 'v',
      defaultValue: defaultConfig.version,
      description: 'Build version to setup: [8.2.0.0, 9.0.0.0, ...]'
    }, {
      name: 'build',
      alias: 'b',
      defaultValue: defaultConfig.build,
      description: 'Build number to setup: [1, 2, ..., 30, ...]'
    }, {
      name: 'plugins',
      alias: 'x',
      defaultValue: defaultConfig.plugins,
      description: 'Server plugins!'
    }, {
      name: 'path',
      alias: 'p',
      defaultValue: defaultConfig.path,
      description: 'Base path where to setup all builds.\n(must be an absolute path)'
    }, {
      name: 'link',
      alias: 'l',
      defaultValue: defaultConfig.link,
      description: 'Builds base download url'
    }
  ]

  const helpConfiguration = [
    { header: 'Download, extract and cleanup your Pentaho build!' },
    { header: 'Options:', optionList: optionsConfiguration }
  ]

  return {
    ...commandLineArgs(optionsConfiguration),
    helpText: commandLineUsage(helpConfiguration)
  }
}

// ---- Async ----

const parseConfigFile = async (path = '') => {
  const read = new Promise((resolve, reject) => readFile(path, (err, data) => {
    if (err != null) reject(err)

    resolve(data)
  }))

  try {
    return JSON.parse(await read)
  } catch (ex) {
    return {}
  }
}

const getBaseConfiguration = async () => {
  const {
    link = 'http://build.pentaho.com/hosted',
    execution = 'all',
    path = '',
    type = '',
    version = '',
    build = '',
    plugins = [],
    help = false
  } = await parseConfigFile('./local.config')

  return {
    link, execution, path, type, version, build, plugins, help
  }
}

export const buildAppConfiguration = async () => {
  const defaultConfig = await getBaseConfiguration()

  const optionsConfiguration = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Help'
    }, {
      name: 'execution',
      alias: 'e',
      defaultOption: true,
      defaultValue: defaultConfig.execution,
      description: 'Which execution to run:\n - server, pdi'
    }, {
      name: 'type',
      alias: 't',
      defaultValue: defaultConfig.type,
      description: 'Build type to setup:\n - snapshot, qat, release'
    }, {
      name: 'version',
      alias: 'v',
      defaultValue: defaultConfig.version,
      description: 'Build version to setup: [8.2.0.0, 9.0.0.0, ...]'
    }, {
      name: 'build',
      alias: 'b',
      defaultValue: defaultConfig.build,
      description: 'Build number to setup: [1, 2, ..., 30, ...]'
    }, {
      name: 'plugins',
      alias: 'x',
      defaultValue: defaultConfig.plugins,
      description: 'Server plugins!'
    }, {
      name: 'path',
      alias: 'p',
      defaultValue: defaultConfig.path,
      description: 'Base path where to setup all builds.\n(must be an absolute path)'
    }, {
      name: 'link',
      alias: 'l',
      defaultValue: defaultConfig.link,
      description: 'Builds base download url'
    }
  ]

  const helpConfiguration = [
    { header: 'Download, extract and cleanup your Pentaho build!' },
    { header: 'Options:', optionList: optionsConfiguration }
  ]

  return {
    ...commandLineArgs(optionsConfiguration),
    helpText: commandLineUsage(helpConfiguration)
  }
}
