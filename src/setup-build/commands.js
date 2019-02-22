import { join, parse, dirname, basename } from 'path'
import { exec, echo, which, rm, mkdir } from 'shelljs'
import { exists } from 'fs'

import { underline } from 'chalk'

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
      logger.warn(`  > ${ downloadName } already downloaded!`)

      return resolve()
    }

    return get(link, { downloadTo: destination })
      .then(() => resolve()) // handled in get
      .catch(() => reject()) // handled in get
  })

}).catch((message) => rm('-rf', destination))

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
    logger.debug(`Cleanup Folder: ${ source }`)

    return Promise.resolve()
  }

  const cleanupElementId = logger.info(`  > ${ source }/ folder`)

  return Promise.all(actions())
    .then(() => {
      logger.__write( { id: cleanupElementId, type: 'end' })

      return Promise.resolve()
    }).catch(() => {
      logger.__write( { id: cleanupElementId, type: 'error' })

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
  if (setupBuildUtils.isDebug) {
    logger.debug(`Extract Source: ${ source }`)
    logger.debug(`Extract Destination: ${ destination }`)

    return resolve()
  }

  const location = join(destination, pluginName != null ? pluginName : '')

  exists(location, (isExtracted) => {
    const { dir: zipFolder, base: zipFile } = parse(source)

    if (isExtracted) {
      logger.warn(`  > ${ zipFile } already extracted!`)

      return reject()
    }

    const extractElementId = logger.info(`  > ${ zipFile } to ${ destination }/`)

    return extractImpl()
      .then(() => {
        logger.__write( { id: extractElementId, type: 'end' })

        return resolve()
      }).catch(() => {
        logger.__write( { id: extractElementId, type: 'error' })

        return reject()
      })
  })

 }).catch((message) => {
   const location = join(destination, pluginName != null ? pluginName : '')

   rm('-rf', location)
 })
