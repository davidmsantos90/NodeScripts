import { underline } from 'chalk'
import { join } from 'path'

import shell from '../../helpers/shell'
import logger from '../../helpers/logger'
import generic from '../../helpers/generic'
import Element from '../../helpers/Element'

import { SERVER_FOLDER, PDI_FOLDER } from '../artifacts/Artifact'

export const JAAS_MODULES_LIB = 'org.apache.karaf.jaas.modules-3.0.9.jar'

// ----- Generic -----

export const enableKarafFeatures = (base, karafEtcFolder) => {
  const file = join(base, karafEtcFolder, 'org.apache.karaf.features.cfg')

  const placeholder = 'featuresBoot='

  const featuresToAdd = 'ssh,pentaho-marketplace,'
  const valueToReplace = `${placeholder + featuresToAdd}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

export const enableKarafLocalDependencies = (base, karafEtcFolder) => {
  const file = join(base, karafEtcFolder, 'org.ops4j.pax.url.mvn.cfg')

  const placeholder = 'org.ops4j.pax.url.mvn.localRepository='

  const commentToEnable = '# '
  const valueToReplace = `${commentToEnable + placeholder}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

// ----- Server -----

export const disableServerStartPrompt = (server) => {
  const promptUserFiles = join(server, SERVER_FOLDER, 'promptuser.*')

  return shell.rm(`-f ${promptUserFiles}`)
}

export const enableServerSshConsoleBrige = (server) => {
  const pentahoWebInfFolder = join(server, SERVER_FOLDER, 'tomcat', 'webapps', 'pentaho', 'WEB-INF', 'lib')
  const karafJaasModuleJar = join(__dirname, '../../libs', JAAS_MODULES_LIB)

  return shell.cp(`-n ${karafJaasModuleJar} ${pentahoWebInfFolder}`)
}

// ----- Pdi -----

export const enablePdiDebug = (pdi) => {
  const file = join(pdi, PDI_FOLDER, 'spoon.sh')

  const placeholder = '# optional line for attaching a debugger'

  const debugSpoon = 'OPT="$OPT -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"'
  const valueToReplace = `${placeholder}\n${debugSpoon}`

  return generic.readWriteFile({ file, placeholder, valueToReplace })
}

// ----- Command -----

const cleanup = ({ extractOutput: source, cleanups = [] }, options) => {
  if (!cleanups.length) return Promise.resolve()

  const cleanupElement = new Element({ id: `cleanup_${source}` })
  cleanupElement.update({
    type: 'info', message: ` > ${source}`
  })

  return Promise.all(cleanups.map((action) => action(source)))
    .then(() => cleanupElement.end())
    .catch((error) => cleanupElement.reject({ error }))
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    logger.log()
    logger.info(underline(`3. Cleanup:`))

    await Promise.all(builds.map((artifacts) => cleanup(artifacts, options)))
  } catch (ex) {
    error = ex
  }

  return { error }
}
