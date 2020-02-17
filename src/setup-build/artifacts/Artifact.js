import { join } from 'path'

import generic from '../../helpers/generic'
import shell from '../../helpers/shell'

export const RELEASE = 'release'
export const SNAPSHOT = 'snapshot'
export const QAT = 'qat'

export const JAAS_MODULES_LIB = 'org.apache.karaf.jaas.modules-3.0.9.jar'
export const DOWNLOAD_FOLDER = 'downloads'

export const CLEANED_UP = '.clean'

export const SERVER_FOLDER = 'pentaho-server'
export const SERVER_SYSTEM_FOLDER = join(SERVER_FOLDER, 'pentaho-solutions', 'system')
export const SERVER_KARAF_ETC_FOLDER = join(SERVER_SYSTEM_FOLDER, 'karaf', 'etc')

export const PDI_FOLDER = 'data-integration'
export const PDI_SYSTEM_FOLDER = join(PDI_FOLDER, 'system')
export const PDI_KARAF_ETC_FOLDER = join(PDI_SYSTEM_FOLDER, 'karaf', 'etc')

// Artifact cleanups

export const markAsCleanedUp = async (base) => {
  const file = join(base, CLEANED_UP)

  return shell.touch(file)
}

export const enableKarafFeatures = async (base, karafEtcFolder, features = []) => {
  if (!features.length) return

  const FEATURE_SEP = '\\\n  '

  const file = join(base, karafEtcFolder, 'org.apache.karaf.features.cfg')

  const placeholder = `featuresBoot=${FEATURE_SEP}(http,${FEATURE_SEP}kar),${FEATURE_SEP}`

  const featuresToAdd = features.join(`,${FEATURE_SEP}`)
  const valueToReplace = `${placeholder + featuresToAdd},${FEATURE_SEP}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

export const enableKarafLocalDependencies = async (base, karafEtcFolder) => {
  const file = join(base, karafEtcFolder, 'org.ops4j.pax.url.mvn.cfg')

  const placeholder = 'org.ops4j.pax.url.mvn.localRepository='

  const commentToEnable = '# '
  const valueToReplace = `${commentToEnable + placeholder}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

// Artifact Aux Methods

export const downloadLink = ({ link, type, tag, version, build }) => {
  const isQat = type === QAT
  const isRelease = type === RELEASE

  const linkVersion = isQat ? version.replace(/\.[0-9]\.[0-9]$/, '') : version

  return `${link}/${linkVersion}${!isRelease ? '-' + tag : ''}/${build}`
}

export const downloadName = ({ name, _build, version, type, tag }) => {
  const isSnapshot = type === SNAPSHOT

  return `${name}-${version}-${isSnapshot ? tag : _build}.zip`
}

export const downloadOuput = ({ root, name, _build, type, version }) => {
  const zipFile = `${name}.zip`

  return join(root, DOWNLOAD_FOLDER, type, version, _build, zipFile)
}

export const extractOutput = ({ root, _build, type, version, name, subFolder = '' }) => {
  return join(root, type, version, _build, name, subFolder)
}

// ----- Artifact -----

export default class Artifact {
  constructor (props = {}) {
    this.__cleanups = []

    this.__properties = props
  }

  get id () {
    const { name } = this.__properties

    return name
  }

  get isPlugin () {
    return false
  }

  get cleanups () {
    return this.__cleanups
  }

  get downloadURL () {
    return `${downloadLink(this.__properties)}/${downloadName(this.__properties)}`
  }

  get downloadOutput () {
    return downloadOuput(this.__properties)
  }

  /**
   * Gets the zip file's location.
   *
   * @type {string}
   * @readonly
   */
  get extractSource () {
    return this.downloadOutput
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

  _extractOutput () {
    return extractOutput(this.__properties)
  }
}
