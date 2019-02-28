import { join } from 'path'

import { options, help } from './arguments'

const DOWNLOAD_FOLDER = 'downloads'

const SERVER_EXEC = 'server'
const PDI_EXEC = 'pdi'

const PENTAHO_SERVER_FOLDER = 'pentaho-server'
const PENTAHO_SOLUTIONS_FOLDER = 'pentaho-solutions'

const DATA_INTEGRATION_FOLDER = 'data-integration'

const SYSTEM_FOLDER = 'system'
const KARAF_FOLDER = 'karaf'
const KARAF_ETC_FOLDER = 'etc'

const RELEASE = 'RELEASE'
const SNAPSHOT = 'SNAPSHOT'
const QAT = 'QAT'

const SetupBuildUtils = ({
  version, type, path, link, build = '?', execution: _execution, help: _isHelp, debug: _isDebug
}) => {
  const typeFolder = type.toLowerCase()
  const typeTag = type.toUpperCase()

  const isSnapshot = typeTag === SNAPSHOT
  const isQat = typeTag === QAT
  const isRelease = typeTag === RELEASE

  const artifactSuffix = `-${version}${!isRelease ? '-' + typeTag : ''}-${build}`
  const downloadArtifactSuffix = `-${version}-${isSnapshot ? typeTag : build}`

  const linkVersion = isQat ? version.replace(/\.[0-9]\.[0-9]$/, '') : version
  const urlVersionTag = `${linkVersion}${!isRelease ? '-' + typeTag : ''}`
  const downloadLink = `${link}/${urlVersionTag}/${build}`

  // ---

  const downloadPath = join(path, DOWNLOAD_FOLDER, typeFolder, build)
  const extractPath = join(path, typeFolder, build)

  const serverSystemFolder = join(PENTAHO_SERVER_FOLDER, PENTAHO_SOLUTIONS_FOLDER, SYSTEM_FOLDER)
  const serverKarafEtcFolder = join(serverSystemFolder, KARAF_FOLDER, KARAF_ETC_FOLDER)

  const pdiSystemFolder = join(DATA_INTEGRATION_FOLDER, SYSTEM_FOLDER)
  const pdiKarafEtcFolder = join(pdiSystemFolder, KARAF_FOLDER, KARAF_ETC_FOLDER)

  return {
    serverFolders (artifact) {
      return {
        base: this.extractOutput(artifact),
        scripts: this.extractOutput(artifact, PENTAHO_SERVER_FOLDER),
        system: this.extractOutput(artifact, serverSystemFolder),
        karafEtc: this.extractOutput(artifact, serverKarafEtcFolder)
      }
    },

    pdiFolders (artifact) {
      return {
        base: this.extractOutput(artifact),
        scripts: this.extractOutput(artifact, DATA_INTEGRATION_FOLDER),
        system: this.extractOutput(artifact, pdiSystemFolder),
        karafEtc: this.extractOutput(artifact, pdiKarafEtcFolder)
      }
    },

    join (...paths) {
      return join(...paths)
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

    _downloadBuildName (artifact) {
      return `${artifact + downloadArtifactSuffix}.zip`
    },

    _artifactBuildFolder (artifact) {
      return `${artifact + artifactSuffix}`
    },

    _artifactBuildZip (artifact) {
      return `${this._artifactBuildFolder(artifact)}.zip`
    },

    downloadLink (artifact) {
      return `${downloadLink}/${this._downloadBuildName(artifact)}`
    },

    downloadOutput (artifact) {
      return this.join(downloadPath, this._artifactBuildZip(artifact))
    },

    /* alias */
    extractSource (artifact) {
      return this.downloadOutput(artifact)
    },

    extractOutput (artifact, subFolder = '') {
      return this.join(extractPath, this._artifactBuildFolder(artifact), subFolder)
    }
  }
}

export default SetupBuildUtils(options)
