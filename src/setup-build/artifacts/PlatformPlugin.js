import { join } from 'path'

import Artifact, { SERVER_SYSTEM_FOLDER, extractOutput } from './Artifact'
import { SERVER_EE_NAME } from './PentahoServer'

export const ANALYZER_SERVER_FOLDER = join(SERVER_SYSTEM_FOLDER, 'analyzer')
export const DASHBOARD_DESIGNER_FOLDER = join(SERVER_SYSTEM_FOLDER, 'dashboards')

export default class PlaftformPlugin extends Artifact {
  constructor ({ pluginFolder, ...props }) {
    super(props)

    this.__pluginFolder = pluginFolder
  }

  /** @Override */
  get id () {
    const { name } = this.__properties

    return `server/.../${name}`
  }

  /** @Override */
  get isPlugin () {
    return true
  }

  /** @Override */
  _extractOutput () {
    return extractOutput({
      ...this.__properties, name: SERVER_EE_NAME, subFolder: this.__pluginFolder
    })
  }
}

export class AnalyzerPlugin extends PlaftformPlugin {
  constructor (props) {
    super({
      ...props, name: 'paz-plugin-ee', pluginFolder: ANALYZER_SERVER_FOLDER
    })
  }
}

export class DashboardDesignerPlugin extends PlaftformPlugin {
  constructor (props) {
    super({
      ...props, name: 'pdd-plugin-ee', pluginFolder: DASHBOARD_DESIGNER_FOLDER
    })
  }
}
