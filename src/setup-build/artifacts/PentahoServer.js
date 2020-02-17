import { join } from 'path'

import shell from '../../helpers/shell'
// import terminal from '../../helpers/visual/terminal'

import Artifact, {
  SERVER_FOLDER,
  SERVER_KARAF_ETC_FOLDER,
  JAAS_MODULES_LIB,
  enableKarafFeatures,
  enableKarafLocalDependencies,
  markAsCleanedUp
} from './Artifact'

export const SERVER_CE_NAME = 'pentaho-server-ce'
export const SERVER_EE_NAME = 'pentaho-server-ee'

export const SERVER_EXTRA_FEATURES = ['ssh', 'pentaho-marketplace']

// Server Cleanups

export const enableServerKarafFeatures = async (source) => enableKarafFeatures(source, SERVER_KARAF_ETC_FOLDER, SERVER_EXTRA_FEATURES)

export const enableServerKarafLocalDependencies = async (source) => enableKarafLocalDependencies(source, SERVER_KARAF_ETC_FOLDER)

export const disableServerStartPrompt = async (source) => {
  const promptUserFiles = join(source, SERVER_FOLDER, 'promptuser.*')

  return shell.rm(`-rf ${promptUserFiles}`)
}

export const enableServerSshConsoleBrige = async (source) => {
  const pentahoWebInfFolder = join(source, SERVER_FOLDER, 'tomcat', 'webapps', 'pentaho', 'WEB-INF', 'lib')
  const karafJaasModuleJar = join(__dirname, '../../libs', JAAS_MODULES_LIB)

  return shell.cp(`-n ${karafJaasModuleJar} ${pentahoWebInfFolder}`)
}

// Server Artifact

export default class PentahoServer extends Artifact {
  constructor ({ enterprise = true, ...props }) {
    super({ ...props, name: enterprise ? SERVER_EE_NAME : SERVER_CE_NAME })

    this.__cleanups = [
      ...this.__cleanups,

      disableServerStartPrompt,
      // enableServerSshConsoleBrige,
      enableServerKarafFeatures,
      enableServerKarafLocalDependencies,

      markAsCleanedUp
    ]
  }
}

export class PentahoServeCE extends PentahoServer {
  constructor (props) {
    super({ ...props, enterprise: false })
  }
}

export class PentahoServeEE extends PentahoServer {
  constructor (props) {
    super({ ...props, enterprise: true })
  }
}
