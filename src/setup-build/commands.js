import { join, parse } from 'path'

import Element from '../helpers/Element'
import logger from '../helpers/logger'

import generic from '../helpers/generic'
import request from '../helpers/request'
import zip from '../helpers/zip'

const download = ({ link, destination }) => {
  const { base: file } = parse(destination)

  return generic.exists(destination)
    .then((isDownloaded) => {
      if (isDownloaded) {
        return logger.warn(` > ${file} already downloaded!`)
      }

      return request.get(link, {
        downloadPath: destination
      }).catch(() => {
        // do nothing
      })
    })
}

const extract = ({ source, destination, pluginName = '' }) => {
  const extractedFolder = join(destination, pluginName)

  return generic.exists(extractedFolder)
    .then((isExtracted) => {
      if (isExtracted) {
        const { base: zipFile } = parse(source)

        return logger.warn(` > ${zipFile} already extracted!`)
      }

      return zip.extract({
        source, destination, extractedFolder
      }).catch(() => {
        // do nothing
      })
    })
}

const cleanup = ({ source, actions }) => {
  const cleanupElement = new Element({ id: `cleanup_${source}` })

  cleanupElement.update({
    type: 'info',
    message: ` > ${source}/ folder`
  })

  return Promise.all(actions())
    .then(() => cleanupElement.end())
    .catch(() => cleanupElement.reject())
}

export { download, extract, cleanup }
