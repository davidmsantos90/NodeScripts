import '@babel/polyfill'

import { rm } from 'shelljs'
import ProgressBar from './ProgressBar'

import {
  get as httpGet,
  STATUS_CODES
} from 'http'
import { get as httpsGet } from 'https'

// import logger from './logger'
import generic from './generic'

const isSuccessfulStatus = (status) => {
  const okStatus = STATUS_CODES[200]

  return STATUS_CODES[status] === okStatus
}

const todayBuild = () => {
  const today = new Date()

  const day = `${today.getDate()}`
  const month = `${today.getMonth() + 1}`

  return `${(day.length < 2 ? '0' : '') + day}-${(month.length < 2 ? '0' : '') + month}`
}

const parseDate = (modified = '') => {
  let date = null

  try {
    date = new Date(Date.parse(modified))
  } catch (ex) {
    // does nothing
  }

  return isNaN(date) ? null : date
}

const isTodayBuild = (modified = '') => {
  const modifiedDate = parseDate(modified)
  if (modifiedDate == null) return false

  const day = `${modifiedDate.getDate()}`
  const month = `${modifiedDate.getMonth() + 1}`

  const latestBuild = `${(day.length < 2 ? '0' : '') + day}-${(month.length < 2 ? '0' : '') + month}`

  return latestBuild === todayBuild()
}

const responseHandler = ({
  resolve, reject, downloadPath
} = {}) => (response) => {
  const {
    headers: {
      date,
      'content-encoding': encoding,
      'content-length': total
    },
    statusCode
  } = response

  const responseSuccess = isTodayBuild(date) && isSuccessfulStatus(statusCode)

  const progressBar = new ProgressBar({
    id: downloadPath.replace(/.+\/(.+)/, '$1'),
    total: responseSuccess ? total : 0
  })

  if (!responseSuccess) {
    const error = progressBar.reject()

    return reject(error)
  }

  const downloadStream = generic.createDownloadStream({ path: downloadPath, encoding })

  let downloaded = 0
  response.on('data', (chunk) => {
    downloadStream.write(chunk, encoding)
    downloaded += chunk.length

    progressBar.update({ downloaded })
  })

  response.on('error', () => {
    downloadStream.destroy()

    throw new Error(progressBar.reject({ downloaded }))
  })

  response.on('end', () => {
    downloadStream.end()

    progressBar.end({ downloaded: total })

    resolve()
  })
}

export default {
  get (url, { downloadPath = '' } = {}) {
    if (typeof url === 'object') {
      downloadPath = url.downloadPath
      url = url.url
    }

    if (url == null || url === '') {
      const error = `'url' parameter must be defined to make a 'get' request`

      return Promise.reject(error)
    }

    // console.log('Request: ' + url + '; To: ' + downloadPath)

    return new Promise((resolve, reject) => {
      try {
        const isSecureUrl = url.startsWith('https')
        const getMethod = isSecureUrl ? httpsGet : httpGet

        const getMethodCallback = responseHandler({
          resolve, reject, downloadPath
        })

        const getOptions = {
          headers: { 'accept-encoding': 'gzip,deflate' }
        }

        getMethod(url, getOptions, getMethodCallback)
      } catch (exception) {
        return reject(exception)
      }
    }).catch((/* error */) => {
      rm('-rf', downloadPath)
    }).then((a) => {
      return a
    })
  }
}
