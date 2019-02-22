import terminal from './terminal'
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
  const { headers: { ['content-encoding']: encoding } } = response

  const filename = downloadTo.replace(/.+\/(.+)/, '$1')
  const downloadStream = createDownloadStream({ downloadTo, encoding })

  const progressBar = new ProgressBar({ id: filename, response })

  let downloaded = 0
  response.on('data', (chunk) => {
    downloadStream.write(chunk, encoding)
    downloaded += chunk.length

    progressBar.update({ downloaded })
  })

  response.on('error', (error) => {
    downloadStream.destroy()

    return reject(error.message)
  })

  response.on('end', () => {
    downloadStream.end()
    progressBar.end()

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
  }).then(() => {
    for (let element of terminal.elements()) {
      if (element instanceof ProgressBar && !element.isComplete) return
    }

    terminal._unregisterKeypressEvent()
  })
}
