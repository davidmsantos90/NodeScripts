import { join, parse, dirname, basename } from 'path'
import { exec, echo, which, rm, mkdir } from 'shelljs'
import { exists } from 'fs'

import npmDownload from 'download'
import npmUnzip from 'decompress'

import setupBuildUtils from './utils'

export { download, extract, cleanup }

const download = ({ link, destination }) => {
  let downloadImpl = null
  const downloadFolder = dirname(destination)

  const wgetInstalled = which('wget') != null
  if (wgetInstalled) {
    downloadImpl = () => {
      const command = `wget -q -O ${ destination } ${ link }`

      mkdir('-p', downloadFolder)

      return __promiseExec(command)
    }
  } else {
    downloadImpl = () => npmDownload(link, downloadFolder)
  }

  return __downloadWrap(link, destination, downloadImpl)
}

const extract = ({ source, destination, pluginName }) => {
  const unzipInstalled = which('unzip') != null

  let extractImpl = null
  if (unzipInstalled) {
    extractImpl = () => {
      mkdir('-p', destination)

      const command = `unzip -q ${ source } -d ${ destination }`

      return __promiseExec(command)
    }
  } else {
    extractImpl = () => npmUnzip(source, destination)
      .then(() => undefined/* silent npmUnzip execution */)
  }

  return __extractWrap(source, destination, pluginName, extractImpl)
}

const cleanup = ({ source, actions }) => {
  if (setupBuildUtils.isDebug) {
    const debugMessage =`[DEBUG] Cleanup Folder: ${ source }`

    return Promise.resolve(debugMessage)
  }

  echo(`[INFO] Cleaning up '${ source }' folder.`)

  return Promise.all(actions())
    .then(() => Promise.resolve(`[INFO] Cleanup to '${ source }' complete.`))
    .catch(() => Promise.reject(`[ERROR] Something went wrong cleaning up '${ source }!`))
}

const __promiseExec = (command, settings = { silent: true }) => new Promise((resolve, reject) => {
  exec(command, settings, (code/*, output, error*/) => {
    const isErrorCode = code !== 0

    return isErrorCode ? reject() : resolve()
  })
})

const __downloadWrap = (link, destination, downloadImpl) => new Promise((resolve, reject) => {
  if (setupBuildUtils.isDebug) {
    const debugMessage =`[DEBUG] Download Link: ${ link }\n[DEBUG] Download Destination: ${ destination }`

    return resolve(debugMessage)
  }

  exists(destination, (isDownloaded) => {
    const downloadName = basename(destination)

    if (isDownloaded) {
      return resolve(`[WARNING] File '${ downloadName }' already downloaded!`)
    }

    echo(`[INFO] Downloading '${ link }'`)

    return downloadImpl()
      .then((success) => {
        const message = success == null
          ? `[INFO] Downloaded to '${ destination }'`
          : success

        return resolve(message)
      }).catch((error) => {
        const message = error == null
          ? `[ERROR] Something went wrong downloading '${ link }!`
          : error

        return reject(message)
      })
  })

}).then((success) => echo(success)).catch((error) => {
  echo(error)

  rm('-rf', destination)
})

const __extractWrap = (source, destination, pluginName, extractImpl) => new Promise((resolve, reject) => {
  if (setupBuildUtils.isDebug) {
    const debugMessage = `[DEBUG] Extract Source: ${ source }\n[DEBUG] Extract Destination: ${ destination }`

    return resolve(debugMessage)
  }

  const location = join(destination, pluginName != null ? pluginName : '')

  exists(location, (isExtracted) => {
    const { dir: zipFolder, base: zipFile } = parse(source)

    if (isExtracted) {
      return resolve(`[WARNING] File '${ zipFile }' already extracted!`)
    }

    echo(`[INFO] Extracting '${ zipFile }'`)

    return extractImpl()
      .then((success) => {
        const message = success == null
          ? `[INFO] Extracted '${ zipFile }' to '${ destination }'`
          : success

        return resolve(message)
      }).catch((error) => {
        const message = error == null
          ? `[ERROR] Something went wrong extracting '${ zipFile }!`
          : error

        return reject(message)
      })
  })

}).then((message) => echo(message)).catch((error) => {
  echo(error)

  const location = join(destination, pluginName != null ? pluginName : '')

  rm('-rf', location)
})
