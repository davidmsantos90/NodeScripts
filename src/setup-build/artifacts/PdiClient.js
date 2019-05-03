import Artifact, {
  PDI_KARAF_ETC_FOLDER
} from './Artifact'

import {
  enablePdiDebug,
  enableKarafFeatures,
  enableKarafLocalDependencies
} from '../commands/cleanup'

export const PDI_ARTIFACT = 'pdi-ee-client'

export default class PdiClient extends Artifact {
  constructor (props) {
    super({ ...props, name: PDI_ARTIFACT })

    this.__cleanups = [
      ...this.__cleanups,

      enablePdiDebug,
      (pdi) => enableKarafFeatures(pdi, PDI_KARAF_ETC_FOLDER),
      (pdi) => enableKarafLocalDependencies(pdi, PDI_KARAF_ETC_FOLDER)
    ]
  }
}
