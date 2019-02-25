import terminal from './terminal'
import logger from './logger'

import ProgressBar from './ProgressBar'

import { mkdir } from 'shelljs'

import { join, sep, dirname } from 'path'
import { createWriteStream } from 'fs'
import { get as httpGet } from 'http'
import { get as httpsGet } from 'https'

const DOWNLOAD_FOLDER = join(sep, 'home', 'dams', 'Downloads')

const createDownloadStream = ({
  downloadTo, encoding
} = {}) => {
  mkdir('-p', dirname(downloadTo))

  return createWriteStream(downloadTo, { encoding })
}

const responseHandler = ({
  resolve, reject,
  downloadTo = join(DOWNLOAD_FOLDER, 'download.zip')
} = {}) => (response) => {
  let downloaded = 0

  const downloadStream = createDownloadStream({ downloadTo, encoding })
  const {
    headers: {
      ['content-encoding']: encoding,
      ['content-length']: contentLength
    }
  } = response


  const progressBar = new ProgressBar({
    id: downloadTo.replace(/.+\/(.+)/, '$1'),
    total: contentLength
  })

  response.on('data', (chunk) => {
    downloadStream.write(chunk, encoding)
    downloaded += chunk.length

    progressBar.update({ downloaded })
  })

  response.on('error', (error) => {
    downloadStream.destroy()

    progressBar.reject({ downloaded })

    return reject()
  })

  response.on('end', () => {
    downloadStream.end()

    progressBar.end({ downloaded: contentLength })

    return resolve()
  })
}

export const get = (url, { downloadTo = '' }) => {
  if (url == null || url === '') return Promise.resolve()

  return new Promise((resolve, reject) => {
    try {
      const isSecureUrl = url.startsWith('https')
      const getMethod = isSecureUrl ? httpsGet : httpGet

      const getMethodCallback = responseHandler({
        resolve, reject, downloadTo
      })

      getMethod(url, getMethodCallback)
    } catch(ex) {
      return reject(ex.message)
    }
  }).catch((message) => logger.error(message))
}
