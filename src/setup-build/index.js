#! /usr/bin/env node

import { exec, echo, rm, mkdir } from 'shelljs'
import { join } from 'path'
import { systemUtils, downloadUtils } from './utils'

const PENTAHO_SERVER = 'pentaho-server-ee'
const PDI_CLIENT = 'pdi-client-ee'
const ANALYZER_PLUGIN = 'paz-plugin-ee'

let isDebug = false

const download = ({ link, destination, outputZipName }) => new Promise((resolve, reject) => {
  const silent = true
  const outputLocation = join(destination, outputZipName)

  const command = `wget -q -O ${ outputLocation } ${ link }`

  if (isDebug) {
    echo(`\n[INFO] Output: ${ outputLocation }`)
    echo(`[INFO] Link: ${ link }`)

    return resolve()
  }

  mkdir('-p', destination)

  echo(`[INFO] Downloading '${ link }'`)

  exec(command, { silent }, (code, output, error) => {
    const hasError = error != null && error !== ""
    if (hasError) {
      return reject(error)
    }

    echo(`[Info] Downloaded to '${ outputLocation }'`)

    resolve()
  })
})

const extract = ({ source, destination, zipName }) => new Promise((resolve, reject) => {
  const silent = true
  const command = `unzip -q ${ join(source, zipName) } -d ${ destination }`

  if (isDebug) {
    echo(`\n[INFO] Source: ${ source }`)
    echo(`[INFO] Destination: ${ destination }`)
    echo(`[INFO] ZipName: ${ zipName }`)

    return resolve()
  }

  mkdir('-p', destination)

  echo(`[INFO] Extracting '${ zipName }'`)

  exec(command, { silent }, (code, output, error) => {
    const hasError = error != null && error !== ""
    if (hasError) {
      return reject(error)
    }

    echo(`[Info] Done extracting to '${ destination }'`)

    resolve()
  })
})

// ---

const serverDownloadFlow = ({ buildVersion, buildType, buildNumber = '?' }) => {
  const analyzerLink = downloadUtils.link({ artifact: ANALYZER_PLUGIN, buildVersion, buildType, buildNumber })
  const pentahoServerLink = downloadUtils.link({ artifact: PENTAHO_SERVER, buildVersion, buildType, buildNumber })

  const destination = systemUtils.backup({ buildType, buildNumber })

  const serverOutput = `${ systemUtils.zipName({ artifact: PENTAHO_SERVER, buildType, buildVersion, buildNumber }) }.zip`
  const analyzerOutput = `${ systemUtils.zipName({ artifact: ANALYZER_PLUGIN, buildType, buildVersion, buildNumber }) }.zip`

  return Promise.all([
    download({ link: pentahoServerLink, destination, outputZipName: serverOutput }),
    download({ link: analyzerLink, destination, outputZipName: analyzerOutput })
  ])
}

const serverExtractFlow = ({ buildVersion, buildType, buildNumber = '?' }) => {
  const source = systemUtils.backup({ buildType, buildNumber })

  const serverDestination = systemUtils.server({ artifact: PENTAHO_SERVER, buildType, buildVersion, buildNumber })
  const serverZipName = systemUtils.zipName({ artifact: PENTAHO_SERVER, buildType, buildVersion, buildNumber })

  const analyzerDestination = systemUtils.analyzer({ artifact: PENTAHO_SERVER, buildType, buildVersion, buildNumber })
  const analyzerZipName = systemUtils.zipName({ artifact: ANALYZER_PLUGIN, buildType, buildVersion, buildNumber })

  return extract({
    source, destination: serverDestination, zipName: `${ serverZipName }.zip`
  }).then(() => extract({
    source, destination: analyzerDestination, zipName: `${ analyzerZipName }.zip`
  })).then(() => {
    rm('-f', join(serverDestination, 'pentaho-server/promptuser.*'))
  })
}

let [/*first*/, /*second*/, buildVersion, buildType, buildNumber, ...others] = process.argv

serverDownloadFlow({ buildVersion, buildType: buildType.toUpperCase(), buildNumber })
  .then(() => serverExtractFlow({ buildVersion, buildType: buildType.toUpperCase(), buildNumber }))
  .catch((error) => echo(error))

// download all bellow
// then
// extract pentaho-server, then analyzer, then change files

// on Server -> remove prompt files, enable ssh (needs a dependency, check iwiki) and pentaho-marketplace


// extract pdi-client, then change files
