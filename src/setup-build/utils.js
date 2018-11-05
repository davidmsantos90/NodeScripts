import { join } from 'path'

const SNAPSHOT = 'SNAPSHOT'
const QAT = 'QAT'

const DOWNLOAD_BASE_URL = 'http://lisbon-build.pentaho.com/hosted/'

const BASE_FOLDER = '/home/dams/builds/'
const BACKUP_FOLDER = 'builds-backup/'

const PENTAHO_SERVER_SYSTEM_FOLDER = 'pentaho-server/pentaho-solutions/system/'

const downloadUtils = {
  link({ artifact, buildVersion, buildType, buildNumber }) {
    const isSnapshot = buildType === SNAPSHOT
    const isQat = buildType === QAT

    const shortBuildVersion = buildVersion.replace(/\.[0-9]\.[0-9]$/, '')
    const zipName = this.zipName({ artifact, buildVersion, buildType, buildNumber })

    return `${ DOWNLOAD_BASE_URL }${ isQat ? shortBuildVersion : buildVersion }${ isSnapshot || isQat ? '-' + buildType : '' }/${ buildNumber }/${ zipName }`
  },

  zipName({ artifact, buildVersion, buildType, buildNumber }) {
    const isSnapshot = buildType === SNAPSHOT

    return `${ artifact }-${ buildVersion }-${ isSnapshot ? buildType : buildNumber }.zip`
  }
}

const systemUtils = {
  backup({ buildType, buildNumber }) {
    const buildFolder = `${ buildType.toLowerCase() }/${ buildNumber }/`

    return join(BASE_FOLDER, BACKUP_FOLDER, buildFolder)
  },

  destination({ artifact, buildType, buildVersion, buildNumber }) {
    const buildFolder = `${ buildType.toLowerCase() }/${ buildNumber }/`
    const zipName = this.zipName({ artifact, buildType, buildVersion, buildNumber })

    return join(BASE_FOLDER, buildFolder, zipName, '/')
  },

  server({ artifact, buildType, buildVersion, buildNumber }) {
    return this.destination({ artifact, buildType, buildVersion, buildNumber })
  },

  analyzer({ artifact, buildType, buildVersion, buildNumber }) {
    return join(this.server({ artifact, buildType, buildVersion, buildNumber }), PENTAHO_SERVER_SYSTEM_FOLDER)
  },

  zipName({ artifact, buildType, buildVersion, buildNumber }) {
    const isSnapshot = buildType === SNAPSHOT

    const buildSuffix = `-${ buildVersion + (isSnapshot ? '-' + buildType : '') }-${ buildNumber }`

    return `${ artifact + buildSuffix }`
  }
}

export { systemUtils, downloadUtils }
