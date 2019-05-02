import { join } from 'path'

import Artifact, {
  RELEASE, SERVER_FOLDER, SERVER_SYSTEM_FOLDER, SERVER_KARAF_ETC_FOLDER
} from './Artifact'

import Element from '../../helpers/Element'
import shell from '../../helpers/shell'
import generic from '../../helpers/generic'
import request from '../../helpers/request'
import zip from '../../helpers/zip'

export const SERVER_ARTIFACT = 'pentaho-server-ee'
export const JAAS_MODULES_LIB = 'org.apache.karaf.jaas.modules-3.0.9.jar'

class AnalyzerPlugin extends Artifact {
  constructor (props) {
    super({ ...props, name: 'paz-plugin-ee', subFolder: 'analyzer' })
  }

  _extractDestination () {
    const extractBase = join(this.__root, this.__type, this.__build)

    const isRelease = this.__type === RELEASE
    const extractName = `${this.__parent}-${this.__version + (!isRelease ? '-' + this.__tag : '')}`

    return join(extractBase, extractName, SERVER_SYSTEM_FOLDER)
  }
}

const disableFirstBootPrompt = (pentahoServerFolder) => {
  const promptUserFiles = join(pentahoServerFolder, 'promptuser.*')

  return shell.rm(`-f ${promptUserFiles}`)
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

const enablePentahoSshBrige = (pentahoServerFolder) => {
  const pentahoWebInfFolder = join(pentahoServerFolder, 'tomcat', 'webapps', 'pentaho', 'WEB-INF', 'lib')
  const karafJaasModuleJar = join(__dirname, '../../libs', JAAS_MODULES_LIB)

  return shell.cp(`-n ${karafJaasModuleJar} ${pentahoWebInfFolder}`)
}

export default class PentahoServer extends Artifact {
  constructor (props) {
    super({ ...props, name: SERVER_ARTIFACT })

    this.__plugins = [
      new AnalyzerPlugin({ ...props, parent: SERVER_ARTIFACT })
    ]
  }

  get scriptsFolder () {
    return join(this.extractDestination, SERVER_FOLDER)
  }

  get systemFolder () {
    return join(this.extractDestination, SERVER_SYSTEM_FOLDER)
  }

  get karafEtcFolder () {
    return join(this.extractDestination, SERVER_KARAF_ETC_FOLDER)
  }

  _download () {
    const requests = [ this, ...this.__plugins ]

    try {
      return requests.map((item) => request.get({
        url: item.downloadURL,
        downloadPath: item.downloadOutput
      }))
    } catch (ex) {
      console.log(ex.message)

      return []
    }
  }

  _extract () {
    const extracts = [ this, ...this.__plugins ]

    try {
      return extracts.map((item) => zip.extract({
        source: item.extractSource,
        destination: item.extractDestination,
        output: item.extractOutput
      }))
    } catch (ex) {
      console.log(ex.message)

      return []
    }
  }

  _cleanup () {
    const source = this.extractDestination

    const cleanupElement = new Element({ id: `cleanup_${source}` })

    cleanupElement.update({
      type: 'info', message: ` > ${source}/ folder`
    })

    return Promise.all([
      disableFirstBootPrompt(this.scriptsFolder),
      enableKarafFeatures(this.karafEtcFolder),
      enableLocalDevDependencies(this.karafEtcFolder),
      enablePentahoSshBrige(this.scriptsFolder)
    ])
      .then(() => cleanupElement.end())
      .catch(() => cleanupElement.reject())
  }
}
