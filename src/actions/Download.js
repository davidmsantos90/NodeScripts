import { join, sep, dirname } from 'path'
import { createWriteStream } from 'fs'

import { get as httpGet, STATUS_CODES } from 'http'
import { get as httpsGet } from 'https'

import shell from 'node-shell'
import { IAction } from 'scripts-api'

const isOkStatus = (status) => STATUS_CODES[status] === STATUS_CODES[200]

export default class Download extends IAction {
  static _type () {
    return 'download'
  }

  constructor (target, controller) {
    super({ target, controller, type: Download._type() })
  }

  async act () {
    const { id, downloadOutput } = this.target

    try {
      const isDownloaded = await this.__controller.exists(downloadOutput)
      if (isDownloaded) {
        return this.__cancel(` - ${id} already downloaded!`)
      }

      const result = await this.__download()

      return this.__done({ result })
    } catch (exception) {
      await shell.rm(`-rf ${downloadOutput}`)

      return { error: this.__error(exception.message) }
    }
  }

  __download () {
    const action = this

    return new Promise((resolve, reject) => {
      const { downloadURL, downloadOutput } = action.target

      const getRequest = downloadURL.startsWith('https') ? httpsGet : httpGet

      getRequest(downloadURL, (response) => {
        const { headers, statusCode } = response
        const {
          date,
          'content-encoding': encoding,
          'content-length': total
        } = headers

        const responseSuccess = isOkStatus(statusCode) && action.__controller.isValid(date)

        if (!responseSuccess) {
          const error = action.__cancel('request has not successfull!')

          return reject(error)
        }

        try {
          action.component.init({ total })

          const downloadStream = createDownloadStream({ path: downloadOutput, encoding })

          let downloaded = 0
          response.on('data', (chunk) => {
            downloadStream.write(chunk, encoding)
            downloaded += chunk.length

            action.__update({ downloaded })
          })

          response.on('error', (data = '') => {
            downloadStream.destroy()

            const reason = data instanceof Error ? data.message : data
            const error = action.__error(`download stream error! ${reason}`)

            reject(error)
          })

          response.on('end', () => {
            downloadStream.end()

            const result = action.__done({ downloaded: total })

            resolve(result)
          })
        } catch (ex) {
          const error = action.__error(`response handler error! ${ex.message}`)

          reject(error)
        }
      })
    })
  }
}

const DOWNLOAD_FOLDER = join(sep, 'home', 'dams', 'Downloads')

const createDownloadStream = ({
  path = DOWNLOAD_FOLDER,
  encoding
}) => {
  const { error } = shell.spawnSync(`mkdir -p ${dirname(path)}`)

  if (error != null) {
    // return logger.error(error.message)
  }

  return createWriteStream(path, { encoding })
}
