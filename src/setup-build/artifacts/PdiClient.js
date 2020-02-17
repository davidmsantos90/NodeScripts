import { join } from 'path'

import generic from '../../helpers/generic'

import Artifact, {
  PDI_FOLDER,
  PDI_KARAF_ETC_FOLDER,
  enableKarafFeatures,
  enableKarafLocalDependencies,
  markAsCleanedUp
} from './Artifact'

export const PDI_CE_NAME = 'pdi-ce'
export const PDI_EE_NAME = 'pdi-ee-client'

export const PDI_EXTRA_FEATURES = ['ssh']

// Pdi Cleanups

export const enablePdiKarafFeatures = (source) => enableKarafFeatures(source, PDI_KARAF_ETC_FOLDER, PDI_EXTRA_FEATURES)

export const enablePdiKarafLocalDependencies = (source) => enableKarafLocalDependencies(source, PDI_KARAF_ETC_FOLDER)

export const enablePdiDebug = (source) => {
  const file = join(source, PDI_FOLDER, 'spoon.sh')

  const placeholder = '# optional line for attaching a debugger'

  const debugSpoon = 'OPT="$OPT -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"'
  const valueToReplace = `${placeholder}\n${debugSpoon}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

// Pdi Artifact

export default class PdiClient extends Artifact {
  constructor ({ enterprise = true, ...props }) {
    super({ ...props, name: enterprise ? PDI_EE_NAME : PDI_CE_NAME })

    this.__cleanups = [
      ...this.__cleanups,

      enablePdiDebug,
      enablePdiKarafFeatures,
      enablePdiKarafLocalDependencies,

      markAsCleanedUp
    ]
  }
}

export class PdiCE extends PdiClient {
  constructor (props) {
    super({ ...props, enterprise: false })
  }
}

export class PdiEE extends PdiClient {
  constructor (props) {
    super({ ...props, enterprise: true })
  }
}
