import { join } from 'path'

import Artifact, {
  PDI_FOLDER, PDI_SYSTEM_FOLDER, PDI_KARAF_ETC_FOLDER
} from './Artifact'

import Element from '../../helpers/Element'
// import shell from '../../helpers/shell'
import generic from '../../helpers/generic'
import request from '../../helpers/request'
import zip from '../../helpers/zip'

export const PDI_ARTIFACT = 'pdi-ee-client'

const enableSpoonDebug = (dataIntegrationFolder) => {
  const file = join(dataIntegrationFolder, 'spoon.sh')

  const placeholder = '# optional line for attaching a debugger'

  const debugSpoon = 'OPT="$OPT -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"'
  const valueToReplace = `${placeholder}\n${debugSpoon}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

const enableKarafFeatures = (karafEtcFolder) => {
  const file = join(karafEtcFolder, 'org.apache.karaf.features.cfg')

  const placeholder = 'featuresBoot='

  const featuresToAdd = 'ssh,pentaho-marketplace,'
  const valueToReplace = `${placeholder + featuresToAdd}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

const enableLocalDevDependencies = (karafEtcFolder) => {
  const file = join(karafEtcFolder, 'org.ops4j.pax.url.mvn.cfg')

  const placeholder = 'org.ops4j.pax.url.mvn.localRepository='

  const commentToEnable = '# '
  const valueToReplace = `${commentToEnable + placeholder}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

export default class PdiClient extends Artifact {
  constructor (props) {
    super({ ...props, name: PDI_ARTIFACT })
  }

  get scriptsFolder () {
    return join(this.extractDestination, PDI_FOLDER)
  }

  get systemFolder () {
    return join(this.extractDestination, PDI_SYSTEM_FOLDER)
  }

  get karafEtcFolder () {
    return join(this.extractDestination, PDI_KARAF_ETC_FOLDER)
  }

  _download () {
    const requests = [ this ]

    return Promise.all(requests.map((item) => request.get({
      url: item.downloadURL,
      downloadPath: item.downloadOutput
    })))
  }

  _extract () {
    const extracts = [ this ]

    return Promise.all(extracts.map((item) => zip.extract({
      source: item.extractSource,
      destination: item.extractDestination,
      output: item.extractOutput
    })))
  }

  _cleanup () {
    const source = this.extractDestination

    const cleanupElement = new Element({ id: `cleanup_${source}` })

    cleanupElement.update({
      type: 'info', message: ` > ${source}/ folder`
    })

    return Promise.all([
      enableSpoonDebug(this.scriptsFolder),
      enableKarafFeatures(this.karafEtcFolder),
      enableLocalDevDependencies(this.karafEtcFolder)
    ])
      .then(() => cleanupElement.end())
      .catch(() => cleanupElement.reject())
  }
}
