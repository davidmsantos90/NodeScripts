import { join, parse } from 'path'

import { underline } from 'chalk'

import generic from '../../helpers/generic'
import logger from '../../helpers/logger'

export const RELEASE = 'release'
export const SNAPSHOT = 'snapshot'
export const QAT = 'qat'

export const DOWNLOAD_FOLDER = 'downloads'

export const SERVER_FOLDER = 'pentaho-server'
export const SERVER_SYSTEM_FOLDER = join(SERVER_FOLDER, 'pentaho-solutions', 'system')
export const SERVER_KARAF_ETC_FOLDER = join(SERVER_SYSTEM_FOLDER, 'karaf', 'etc')

export const PDI_FOLDER = 'data-integration'
export const PDI_SYSTEM_FOLDER = join(PDI_FOLDER, 'system')
export const PDI_KARAF_ETC_FOLDER = join(PDI_SYSTEM_FOLDER, 'karaf', 'etc')

const normalize = (value = '', size = 2) => {
  const valueSize = `${value}`.trim().length
  if (valueSize >= size) return value

  return `${'0'.repeat(size - valueSize) + value}`
}

const latestBuild = () => {
  const today = new Date()

  const day = normalize(today.getDate())
  const month = normalize(today.getMonth() + 1)

  return `${day}-${month}`
}

// ----- Download -----

const downloadLink = ({ link, type, tag, version, build }) => {
  const isQat = type === QAT
  const isRelease = type === RELEASE

  const linkVersion = isQat ? version.replace(/\.[0-9]\.[0-9]$/, '') : version

  return `${link}/${linkVersion}${!isRelease ? '-' + tag : ''}/${build}`
}

const downloadName = ({ name, build, version, type, tag }) => {
  const isSnapshot = type === SNAPSHOT

  return `${name}-${version}-${isSnapshot ? tag : build}.zip`
}

const downloadFolder = ({ root, build, type }) => {
  return join(root, DOWNLOAD_FOLDER, type, build) // join(downloadPath, this._extractName())
}

// ----- Extract -----

const extractNameZip = (properties) => {
  return `${extractName(properties)}.zip`
}
const extractName = ({ name, version, type, tag }) => {
  const isRelease = type === RELEASE

  return `${name}-${version + (!isRelease ? '-' + tag : '')}` // -${latestBuild}
}

export default class Artifact {
  constructor ({ name, build, type = '', version, link, root, parent, subFolder = '' }) {
    this.__name = name

    this.__type = type.toLowerCase()
    this.__tag = type.toUpperCase()

    this.__build = build === 'latest' ? latestBuild() : build
    this.__version = version

    this.__link = downloadLink({ link, build, version, type: this.__type, tag: this.__tag })
    this.__root = root

    this.__parent = parent
    this.__subFolder = subFolder
  }

  get properties () {
    return {
      name: this.__name,

      build: this.__build,
      version: this.__version,

      type: this.__type,
      tag: this.__tag,

      link: this.__link,
      root: this.__root
    }
  }

  async setup () {
    logger.info(underline(`1. Download:`))
    await this.download()

    logger.log()
    logger.info(underline(`2. Extract:`))
    await this.extract()

    logger.log()
    logger.info(underline(`3. Cleanup:`))
    await this._cleanup()
  }

  async download () {
    const isDownloaded = await generic.exists(this.downloadOutput)
    if (isDownloaded) {
      const { base: file } = parse(this.downloadOutput)

      return logger.warn(` > ${file} already downloaded!`)
    }

    return this._download().catch(() => { /* do nothing */ })
  }

  async extract () {
    const isExtracted = await generic.exists(this.extractOutput)
    if (isExtracted) {
      const { base: zipFile } = parse(this.extractSource)

      return logger.warn(` > ${zipFile} already extracted!`)
    }

    return this._extract().catch(() => { /* do nothing */ })
  }

  get downloadURL () {
    return this._downloadURL()
  }

  _downloadURL () {
    return `${this.__link}/${downloadName(this.properties)}`
  }

  get downloadOutput () {
    return this._downloadOutput()
  }

  /**
   * Gets the zip file's location.
   *
   * @type {string}
   * @readonly
   */
  get extractSource () {
    return this._downloadOutput()
  }

  /**
   * Gets the extraction output location.
   *
   * @type {string}
   * @readonly
   */
  get extractOutput () {
    return this._extractOutput()
  }

  /**
   * Gets the extract output destination.
   *
   * @type {string}
   * @readonly
   */
  get extractDestination () {
    return this._extractDestination()
  }

  _downloadOutput () {
    return join(downloadFolder(this.properties), extractNameZip(this.properties))
  }

  _extractDestination () {
    const extractBase = join(this.__root, this.__type, this.__build)

    return join(extractBase, extractName(this.properties))
  }

  _extractOutput () {
    return join(this._extractDestination(), this.__subFolder)
  }
}
