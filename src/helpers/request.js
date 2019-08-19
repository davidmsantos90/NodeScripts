import '@babel/polyfill'

import generic from './generic'
// import terminal from './visual/terminal'
import ProgressBar from './visual/ProgressBar'

import { get as httpGet, STATUS_CODES } from 'http'
import { get as httpsGet } from 'https'

const EMPTY_FUNC = () => {}
const HTTP_OK = STATUS_CODES[200]

const isOkStatus = (status) => STATUS_CODES[status] === HTTP_OK
const isHttps = (url = '') => url.startsWith('https')
const invalidArgError = (name = '') => new Error((`Invalid argument '${name}'`))

export const simpleHandler = ({
  response, resolve, reject
}) => {
  let data = ''

  try {
    response.on('data', (chunk) => (data += chunk))

    response.on('error', (error) => reject(error))

    response.on('end', () => resolve(data))
  } catch (ex) {
    reject(ex)
  }
}

export const progressBarHandler = ({
  response,
  resolve,
  reject,
  destination,
  validate = () => true
}) => {
  const { headers, statusCode } = response
  const {
    date,
    'content-encoding': encoding,
    'content-length': total
  } = headers

  const responseSuccess = isOkStatus(statusCode) && validate(date)

  const progressBar = new ProgressBar({
    id: destination.replace(/.+\/(.+)/, '$1'),
    total: responseSuccess ? total : 0
  })

  if (!responseSuccess) {
    return reject(progressBar.reject({
      reason: 'response handler not successfull'
    }))
  }

  try {
    const downloadStream = generic.createDownloadStream({ path: destination, encoding })

    let downloaded = 0
    response.on('data', (chunk) => {
      downloadStream.write(chunk, encoding)
      downloaded += chunk.length

      progressBar.update({ downloaded })
    })

    response.on('error', (data) => {
      downloadStream.destroy()

      reject(progressBar.reject({
        reason: 'download stream error! ' + data
      }))
    })

    response.on('end', () => {
      downloadStream.end()

      progressBar.end({ downloaded: total })

      resolve()
    })
  } catch (ex) {
    reject(progressBar.reject({
      reason: 'response handler error! ' + ex.message
    }))
  }
}

export const get = ({
  url,
  headers = {},
  responseHandler,
  success = EMPTY_FUNC,
  failure = EMPTY_FUNC,
  ...options
}) => new Promise((resolve, reject) => {
  if (url == null) return reject(invalidArgError('url'))
  if (responseHandler == null) return reject(invalidArgError('responseHandler'))

  const getRequest = isHttps(url) ? httpsGet : httpGet

  try {
    getRequest(url, {
      headers
    }, (response) => responseHandler({ response, resolve, reject, ...options }))
  } catch (ex) {
    reject(ex)
  }
}).then(success).catch(failure)

export default {
  get
}
