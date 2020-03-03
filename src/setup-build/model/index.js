import { readFile, writeFile } from 'fs'
import { join } from 'path'

import shell from 'node-shell'

import {
  isEnterprise,
  isServer,
  isPdi
} from './execution-types'

import {
  isSnapshot,
  isRelease,
  isQat
} from './build-types'

import buildAppConfigurationSync, {
  SERVER_CE,
  SERVER_EE,

  SERVER_FOLDER,
  SERVER_SYSTEM_FOLDER,
  SERVER_KARAF_ETC_FOLDER,

  PDI_CE,
  PDI_EE,

  PDI_FOLDER,
  PDI_KARAF_ETC_FOLDER

} from './config'

export default class SetupModel {
  constructor () {
    const config = buildAppConfigurationSync()

    const { execution, build, type, version } = config

    this.__config = {
      ...config,

      isSnapshot: isSnapshot(type),
      enterprise: isEnterprise(execution),

      buildNumber: build === 'latest' ? latestBuild() : build,
      shortVersion: version.replace(/\.[0-9]\.[0-9]$/, ''),

      buildType: type.toLowerCase(),
      typeTag: type.toUpperCase()
    }

    // buildAppConfiguration().then((config) => {
    //   ...
    // })
  }

  get config () {
    if (this.__config == null) throw new Error()

    return this.__config
  }

  get artifactList () {
    const list = []

    const serverArtifact = this._pentahoServer
    if (serverArtifact != null) list.push(serverArtifact)

    const pdiArtifact = this._pdiClient
    if (pdiArtifact != null) list.push(pdiArtifact)

    return [...list, ...this._serverPlugins]
  }

  get _pentahoServer () {
    const { execution, enterprise } = this.config

    const isServerExec = isServer(execution)
    if (!isServerExec) return null

    return this.__buildArtifact({
      name: enterprise ? SERVER_EE : SERVER_CE,
      cleanups: [
        async (source) => shell.rm(`-rf ${join(source, SERVER_FOLDER, 'promptuser.*')}`),
        async (source) => enableKarafFeatures(source, SERVER_KARAF_ETC_FOLDER, ['ssh', 'pentaho-marketplace']),
        async (source) => enableKarafLocalDependencies(source, SERVER_KARAF_ETC_FOLDER),

        markAsCleanedUp
      ]
    })
  }

  get _pdiClient () {
    const { execution, enterprise } = this.config

    const isPdiExec = isPdi(execution)
    if (!isPdiExec) return null

    return this.__buildArtifact({
      name: enterprise ? PDI_EE : PDI_CE,
      cleanups: [
        async (source) => {
          const file = join(source, PDI_FOLDER, 'spoon.sh')

          const placeholder = '# optional line for attaching a debugger'

          const debugSpoon = 'OPT="$OPT -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"'
          const valueToReplace = `${placeholder}\n${debugSpoon}`

          return readWriteFile({ file, placeholder, valueToReplace })
        },
        async (source) => enableKarafFeatures(source, PDI_KARAF_ETC_FOLDER, ['ssh']),
        async (source) => enableKarafLocalDependencies(source, PDI_KARAF_ETC_FOLDER),

        markAsCleanedUp
      ]
    })
  }

  get _serverPlugins () {
    const { execution, enterprise, plugins } = this.config
    const isServerExec = isServer(execution)

    if (!enterprise || !isServerExec) return []

    return plugins.map((props = {}) => this.__buildServerPlugin(props))
  }

  get caption () {
    const { buildType, version, buildNumber } = this.config

    return `.../${buildType}/${version}/${buildNumber}`
  }

  get isLatestBuild () {
    return isLatestBuild
  }

  get _downloadFolder () {
    const { path, buildType, version, buildNumber } = this.config

    return join(path, 'downloads', buildType, version, buildNumber)
  }

  get _extractFolder () {
    const { path, buildType, version, buildNumber } = this.config

    return join(path, buildType, version, buildNumber)
  }

  get _downloadUrl () {
    const { link, version, shortVersion, buildType, typeTag, build } = this.config

    const linkVersion = isQat(buildType) ? shortVersion : version
    const linkVersionTag = !isRelease(buildType) ? '-' + typeTag : ''

    return `${link}/${linkVersion + linkVersionTag}/${build}`
  }

  // --- private ---

  __buildArtifact ({ name, cleanups = [] }) {
    return {
      id: name,

      downloadURL: this.__getDownloadUrl(name),
      downloadOutput: this.__getDownloadOutput(name),
      extractOutput: this.__getExtractOutput(name),

      cleanups
    }
  }

  __buildServerPlugin ({ name, folder }) {
    const pluginFolder = join(SERVER_SYSTEM_FOLDER, folder)

    return {
      id: name,

      isPlugin: true,

      downloadURL: this.__getDownloadUrl(name),
      downloadOutput: this.__getDownloadOutput(name),
      extractOutput: this.__getExtractOutput(SERVER_EE, pluginFolder)
    }
  }

  __getDownloadUrl (name) {
    const { version, buildType, typeTag, buildNumber } = this.config

    const suffix = `${version}-${isSnapshot(buildType) ? typeTag : buildNumber}`

    return `${this._downloadUrl}/${name}-${suffix}.zip`
  }

  __getDownloadOutput (name) {
    return join(this._downloadFolder, `${name}.zip`)
  }

  __getExtractOutput (name, subFolder = '') {
    return join(this._extractFolder, name, subFolder)
  }
}

/** @private */
const latestBuild = () => stringMonthAndDay(new Date())

/** @private */
const stringMonthAndDay = (date) => {
  const day = `${date.getDate()}`.padStart(2, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')

  return `${month}-${day}`
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

export const isLatestBuild = (value = '') => {
  const date = parseDate(value)
  if (date == null) return false

  return stringMonthAndDay(date) === stringMonthAndDay(new Date())
}

const readWriteFile = ({ file, placeholder, valueToReplace }) => {
  return new Promise((resolve, reject) => {
    const fileSettings = { encoding: 'utf8' }

    const updateData = (data) => {
      if (!data.includes(valueToReplace)) {
        data = data.replace(placeholder, valueToReplace)
      }

      return data
    }

    readFile(file, fileSettings, (error, data) => {
      if (error) return reject(error)

      const newData = updateData(data)
      if (newData === data) return resolve()

      writeFile(file, newData, fileSettings, (error) => error ? reject(error) : resolve())
    })
  })
}

const CLEANED_UP = '.clean'

export const markAsCleanedUp = async (base) => {
  const file = join(base, CLEANED_UP)

  return shell.touch(file)
}

export const enableKarafFeatures = async (base, karafEtcFolder, features = []) => {
  const FEATURE_SEP = '\\\n  '

  const file = join(base, karafEtcFolder, 'org.apache.karaf.features.cfg')

  const placeholder = `featuresBoot=${FEATURE_SEP}(http,${FEATURE_SEP}kar),${FEATURE_SEP}`

  const featuresToAdd = features.join(`,${FEATURE_SEP}`)
  const valueToReplace = `${placeholder + featuresToAdd},${FEATURE_SEP}`

  return readWriteFile({ file, placeholder, valueToReplace })
}

export const enableKarafLocalDependencies = async (base, karafEtcFolder) => {
  const file = join(base, karafEtcFolder, 'org.ops4j.pax.url.mvn.cfg')

  const placeholder = 'org.ops4j.pax.url.mvn.localRepository='

  const commentToEnable = '# '
  const valueToReplace = `${commentToEnable + placeholder}`

  return readWriteFile({ file, placeholder, valueToReplace })
}
