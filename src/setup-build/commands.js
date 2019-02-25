import { join, parse, dirname, basename } from 'path'
import { exec, echo, which, rm, mkdir } from 'shelljs'
import { exists } from 'fs'

import { underline } from 'chalk'

import Element from '../helpers/Element'
import { get } from '../helpers/Request'
import logger from '../helpers/logger'

import npmUnzip from 'decompress'

import setupBuildUtils from './utils'

export { download, extract, cleanup }

const download = ({ link, destination }) => new Promise((resolve, reject) => {
  if (setupBuildUtils.isDebug) {
    logger.debug(`Download Link: ${ link }`)
    logger.debug(`Download Destination: ${ destination }`)

    return resolve()
  }

  exists(destination, (isDownloaded) => {
    const downloadName = basename(destination)

    if (isDownloaded) {
      logger.warn(` > ${ downloadName } already downloaded!`)

      return resolve()
    }

    return get(link, { downloadTo: destination })
      .then(() => resolve()) // handled in get
      .catch(() => {
        rm('-rf', destination)

        return reject()
      })
  })
})

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
  const cleanupElement = new Element({ id: `cleanup_${ source }`})

  if (setupBuildUtils.isDebug) {
    cleanupElement.update({ message: `Cleanup Folder: ${ source }`, type: 'debug' })

    return Promise.resolve()
  }

  cleanupElement.update({ message: ` > ${ source }/ folder`, type: 'info' })

  return Promise.all(actions())
    .then(() => {
      cleanupElement.end()

      return Promise.resolve()
    }).catch(() => {
      cleanupElement.reject()

      return Promise.reject()
    })
}

const __promiseExec = (command, settings = { silent: true }) => new Promise((resolve, reject) => {
  exec(command, settings, (code/*, output, error*/) => {
    const isErrorCode = code !== 0

    return isErrorCode ? reject() : resolve()
  })
})

const __extractWrap = (source, destination, pluginName, extractImpl) => new Promise((resolve, reject) => {
  const extractElement = new Element({ id: `extract_${ source }`})

  if (setupBuildUtils.isDebug) {
    logger.debug(`Extract Source: ${ source }`)
    logger.debug(`Extract Destination: ${ destination }`)

    return resolve()
  }

  const location = join(destination, pluginName != null ? pluginName : '')

  exists(location, (isExtracted) => {
    const { dir: zipFolder, base: zipFile } = parse(source)

    if (isExtracted) {
      extractElement.update({ message: ` > ${ zipFile } already extracted!`, type: 'warn' })

      return reject()
    }

    extractElement.update({ message: ` > ${ zipFile } to ${ destination }/`, type: 'info' })

    return extractImpl()
      .then(() => {
        extractElement.end()

        return resolve()
      }).catch((error) => {
        logger.debug(error && error.message)
        extractElement.reject()

        const location = join(destination, pluginName != null ? pluginName : '')
        rm('-rf', location)

        return reject()
      })
  })
 })
