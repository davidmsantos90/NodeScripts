import '@babel/polyfill'

import shell from './shell'
import ProgressBar from './ProgressBar'

import {
  get as httpGet,
  STATUS_CODES
} from 'http'
import { get as httpsGet } from 'https'

import generic from './generic'

const isSuccessfulStatus = (status) => {
  const okStatus = STATUS_CODES[200]

  return STATUS_CODES[status] === okStatus
}

const responseHandler = ({
  resolve, reject, destination, responseSuccessCheck = () => true
} = {}) => (response) => {
  const {
    headers: {
      date,
      'content-encoding': encoding,
      'content-length': total
    },
    statusCode
  } = response

  const responseSuccess = isSuccessfulStatus(statusCode) && responseSuccessCheck(date)

  const progressBar = new ProgressBar({
    id: destination.replace(/.+\/(.+)/, '$1'),
    total: responseSuccess ? total : 0
  })

  if (!responseSuccess) {
    const error = progressBar.reject({ error: 'response not successfull' })

    return reject(error)
  }

  const downloadStream = generic.createDownloadStream({ path: destination, encoding })

  let downloaded = 0
  response.on('data', (chunk) => {
    downloadStream.write(chunk, encoding)
    downloaded += chunk.length

    progressBar.update({ downloaded })
  })

  response.on('error', (error) => {
    downloadStream.destroy()

    reject(progressBar.reject({ error: 'download stream error! ' + error }))
  })

  response.on('end', () => {
    downloadStream.end()

    progressBar.end({ downloaded: total })

    resolve()
  })
}

export default {
  get ({ url = '', destination = '', responseSuccessCheck }) {
    if (url === '') {
      const error = `'url' parameter must be defined to make a 'get' request`

      return Promise.reject(error)
    }

    return new Promise((resolve, reject) => {
      try {
        const isSecureUrl = url.startsWith('https')
        const getMethod = isSecureUrl ? httpsGet : httpGet

        getMethod(url, {
          headers: { 'accept-encoding': 'gzip,deflate' }
        }, responseHandler({
          resolve, reject, destination, responseSuccessCheck
        }))
      } catch (exception) {
        return reject(exception)
      }
    }).catch((error) => {
      shell.rm(`-rf ${destination}`)

      return error
    })
  }
}
