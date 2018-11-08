import { join } from 'path'

const BASE_BUILDS_URL = 'http://lisbon-build.pentaho.com/hosted'

const DOWNLOAD_FOLDER = 'downloads'

const RELEASE = 'RELEASE'
const SNAPSHOT = 'SNAPSHOT'
const QAT = 'QAT'

const SERVER_ARTIFACT = 'pentaho-server-ee'
const PDI_ARTIFACT = 'pdi-ee-client'
const ANALYZER_ARTIFACT = 'paz-plugin-ee'


const utils = ({ version, type, path, build = '?' }) => {
  const SERVER_PLUGINS_FOLDER = join('pentaho-server', 'pentaho-solutions', 'system')

  const BASE_BUILDS_FOLDER = path

  return {
    __version: version,
    get _version() {
      return this.__version
    },
    get _shortVersion() {
      return this.__version.replace(/\.[0-9]\.[0-9]$/, '')
    },

    __build: build,
    get _buildNumber() {
      return this.__build
    },

    __type: type,
    get _typeFolder() {
      return this.__type.toLowerCase()
    },
    get _typeTag() {
      return this.__type.toUpperCase()
    },

    get isSnapshot() {
      return this._typeTag === SNAPSHOT
    },
    get isQat() {
      return this._typeTag === QAT
    },
    get isRelease() {
      return this._typeTag === RELEASE
    },

    /*
      SNAPSHOT | QAT: -version-type-build
      RELEASE: -version-build
    */
    __artifactSuffix: null,
    get _artifactSuffix() {
      if (this.__artifactSuffix == null) {
        this.__artifactSuffix = `-${ this._version }${ !this.isRelease ? '-' + this._typeTag : '' }-${ this._buildNumber }`
      }

      return this.__artifactSuffix
    },

    __downloadArtifactSuffix: null,
    get _downloadArtifaxSuffix() {
      if (this.__downloadArtifactSuffix == null) {
        this.__downloadArtifactSuffix = `-${ this._version }-${ this.isSnapshot ? this._typeTag : this._buildNumber }`
      }

      return this.__downloadArtifactSuffix
    },

    __downloadUrl: null,
    get _downloadUrl() {
      if (this.__downloadUrl == null) {
        const urlVersionTag = `${ this.isQat ? this._shortVersion : this._version }${ !this.isRelease ? '-' + this._typeTag : '' }`

        this.__downloadUrl = `${ BASE_BUILDS_URL }/${ urlVersionTag }/${ this._buildNumber }`
      }

      return this.__downloadUrl
    },
    _downloadBuildName(artifact) {
      return `${ artifact + this._downloadArtifaxSuffix }.zip`
    },

    _genericDownloadLink(artifact) {
      return `${ this._downloadUrl }/${ this._downloadBuildName(artifact) }`
    },
    get pdiDownloadLink() {
      return this._genericDownloadLink(PDI_ARTIFACT)
    },
    get serverDownloadLink() {
      return this._genericDownloadLink(SERVER_ARTIFACT)
    },
    get analyzerDownloadLink() {
      return this._genericDownloadLink(ANALYZER_ARTIFACT)
    },

    _downloadOverrideName(artifact) {
      return `${ artifact + this._artifactSuffix }.zip`
    },

    __buildDownloadPath: null,
    get _buildDownloadPath() {
      if (this.__buildDownloadPath == null ) {
        this.__buildDownloadPath = join(BASE_BUILDS_FOLDER, DOWNLOAD_FOLDER, this._typeFolder, this._buildNumber)
      }

      return this.__buildDownloadPath
    },

    _genericDownloadPath(artifact) {
      return join(this._buildDownloadPath, this._downloadOverrideName(artifact))
    },
    get pdiDownloadLocation() {
      return this._genericDownloadPath(PDI_ARTIFACT)
    },
    get serverDownloadLocation() {
      return this._genericDownloadPath(SERVER_ARTIFACT)
    },
    get analyzerDownloadLocation() {
      return this._genericDownloadPath(ANALYZER_ARTIFACT)
    },

    __buildExtractPath: null,
    get _buildExtractPath() {
      if (this.__buildExtractPath == null ) {
        this.__buildExtractPath = join(BASE_BUILDS_FOLDER, this._typeFolder, this._buildNumber)
      }

      return this.__buildExtractPath
    },

    _genericExtractPath(artifact) {
      const extractFolder = `${ artifact + this._artifactSuffix }`

      return join(this._buildExtractPath, extractFolder)
    },
    get pdiExtractLocation() {
      return this._genericExtractPath(PDI_ARTIFACT)
    },
    get serverExtractLocation() {
      return this._genericExtractPath(SERVER_ARTIFACT)
    },
    get serverPluginExtractLocation() {
      return join(this._genericExtractPath(SERVER_ARTIFACT), SERVER_PLUGINS_FOLDER)
    },
  }

}

export default utils
