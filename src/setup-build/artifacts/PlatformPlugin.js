import { join } from 'path'

import Artifact, { SERVER_SYSTEM_FOLDER, extractOutput } from './Artifact'
import { SERVER_EE_NAME } from './PentahoServer'

export const ANALYZER_NAME = 'paz-plugin-ee'
export const DASHBOARD_DESIGNER_NAME = 'pdd-plugin-ee'
export const INTERACTIVE_REPORTING_NAME = 'pir-plugin-ee'

export const ANALYZER_FOLDER = join(SERVER_SYSTEM_FOLDER, 'analyzer')
export const DASHBOARD_DESIGNER_FOLDER = join(SERVER_SYSTEM_FOLDER, 'dashboards')
export const INTERACTIVE_REPORTING_FOLDER = join(SERVER_SYSTEM_FOLDER, 'pentaho-interactive-reporting')

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
      ...props,

      name: ANALYZER_NAME,
      pluginFolder: ANALYZER_FOLDER
    })
  }
}

export class DashboardDesignerPlugin extends PlaftformPlugin {
  constructor (props) {
    super({
      ...props,

      name: DASHBOARD_DESIGNER_NAME,
      pluginFolder: DASHBOARD_DESIGNER_FOLDER
    })
  }
}

export class InteractiveReportingPlugin extends PlaftformPlugin {
  constructor (props) {
    super({
      ...props,

      name: INTERACTIVE_REPORTING_NAME,
      pluginFolder: INTERACTIVE_REPORTING_FOLDER
    })
  }
}

export const createPlugin = (name, options = {}) => {
  switch (name) {
    case ANALYZER_NAME:
      return new AnalyzerPlugin(options)

    case DASHBOARD_DESIGNER_NAME:
      return new DashboardDesignerPlugin(options)

    case INTERACTIVE_REPORTING_NAME:
      return new InteractiveReportingPlugin(options)
  }

  return null
}
