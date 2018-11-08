import { join, parse, dirname, basename } from 'path'
import { exec, echo, rm, mkdir } from 'shelljs'
import { exists } from 'fs'

import { options } from './arguments'

const execSettings = {
  silent: true
}

const isDebug = options.debug

export const download = ({ link, destination }) => new Promise((resolve, reject) => {
  if (isDebug) {
    const debugMessage =`[DEBUG] Download Link: ${ link }\n[DEBUG] Download Destination: ${ destination }`

    return resolve(debugMessage)
  }

  exists(destination, (exists) => {
    const { dir: downloadFolder, base: downloadName } = parse(destination)

    if (exists) {
      return resolve(`[WARNING] File '${ downloadName }' already downloaded!`)
    }

    mkdir('-p', downloadFolder)

    echo(`[INFO] Downloading '${ link }'`)

    const command = `wget -q -O ${ destination } ${ link }`
    exec(command, execSettings, (code/*, output, error*/) => {
      const isErrorCode = code !== 0
      if (isErrorCode) {
        return reject(`[ERROR] Something went wrong downloading '${ link }!`)
      }

      resolve(`[INFO] Downloaded to '${ destination }'`)
    })
  })

}).then((message) => echo(message)).catch((error) => {
  echo(error)

  rm('-rf', destination)
})

export const extract = ({ source, destination, pluginName }) => new Promise((resolve, reject) => {
  if (isDebug) {
    const debugMessage = `[DEBUG] Extract Source: ${ source }\n[DEBUG] Extract Destination: ${ destination }`

    return resolve(debugMessage)
  }

  const location = join(destination, pluginName != null ? pluginName : '')
  exists(location, (exists) => {
    const { dir: zipFolder, base: zipFile } = parse(source)

    if (exists) {
      return resolve(`[WARNING] File '${ zipFile }' already extracted!`)
    }

    mkdir('-p', destination)

    echo(`[INFO] Extracting '${ zipFile }'`)

    const command = `unzip -q ${ source } -d ${ destination }`
    exec(command, execSettings, (code/*, output, error*/) => {
      const isErrorCode = code !== 0
      if (isErrorCode) {
        return reject(`[ERROR] Something went wrong extracting '${ zipFile }!`)
      }

      resolve(`[INFO] Extracted '${ zipFile }' to '${ destination }'`)
    })
  })

}).then((message) => echo(message)).catch((error) => {
  echo(error)

  const location = join(destination, pluginName != null ? pluginName : '')

  rm('-rf', location)
})
