import { join } from 'path'

import Artifact, {
  SERVER_SYSTEM_FOLDER, SERVER_KARAF_ETC_FOLDER, extractOutput
} from './Artifact'

import {
  disableServerStartPrompt,
  enableServerSshConsoleBrige,
  enableKarafFeatures,
  enableKarafLocalDependencies
} from '../commands/cleanup'

export const ANALYZER_SERVER_FOLDER = join(SERVER_SYSTEM_FOLDER, 'analyzer')
export const SERVER_ARTIFACT = 'pentaho-server-ee'

export class AnalyzerPlugin extends Artifact {
  constructor (props) {
    super({ ...props, name: 'paz-plugin-ee' })
  }

  /** @Override */
  _extractOutput () {
    return extractOutput({
      ...this.__properties, name: SERVER_ARTIFACT, subFolder: ANALYZER_SERVER_FOLDER
    })
  }
}

export default class PentahoServer extends Artifact {
  constructor (props) {
    super({ ...props, name: SERVER_ARTIFACT })

    this.__cleanups = [
      ...this.__cleanups,

      disableServerStartPrompt,
      enableServerSshConsoleBrige,
      (server) => enableKarafFeatures(server, SERVER_KARAF_ETC_FOLDER),
      (server) => enableKarafLocalDependencies(server, SERVER_KARAF_ETC_FOLDER)
    ]
  }
}
