import '@babel/polyfill'

import { rm } from 'shelljs'
import ProgressBar from './ProgressBar'

import { get as httpGet } from 'http'
import { get as httpsGet } from 'https'

// import logger from './logger'
import generic from './generic'

const responseHandler = ({
  resolve, reject, downloadPath
} = {}) => (response) => {
  const {
    headers: {
      'content-encoding': encoding,
      'content-length': contentLength
    }
  } = response

  const progressBar = new ProgressBar({
    id: downloadPath.replace(/.+\/(.+)/, '$1'),
    total: contentLength
  })

  const downloadStream = generic.createDownloadStream({ path: downloadPath, encoding })

  let downloaded = 0
  response.on('data', (chunk) => {
    downloadStream.write(chunk, encoding)
    downloaded += chunk.length

    progressBar.update({ downloaded })
  })

  response.on('error', () => {
    downloadStream.destroy()

    const error = progressBar.reject({ downloaded })

    return reject(error)
  })

  response.on('end', () => {
    downloadStream.end()

    progressBar.end({ downloaded: contentLength })

    return resolve()
  })
}

export default {
  get (url, { downloadPath = '' }) {
    if (url == null || url === '') return Promise.resolve()

    return new Promise((resolve, reject) => {
      try {
        const isSecureUrl = url.startsWith('https')
        const getMethod = isSecureUrl ? httpsGet : httpGet

        const getMethodCallback = responseHandler({
          resolve, reject, downloadPath
        })

        getMethod(url, getMethodCallback)
      } catch (exception) {
        return reject(exception)
      }
    })
      .then((a) => a)
      .catch((/* error */) => {
        rm('-rf', downloadPath)
      })
  }
}
