import { join, sep, dirname } from 'path'
import {
  readFile, writeFile, stat, access, constants, createWriteStream
} from 'fs'

import shell from './shell'
import logger from './logger'

const DOWNLOAD_FOLDER = join(sep, 'home', 'dams', 'Downloads')

export default {
  createDownloadStream ({
    path = DOWNLOAD_FOLDER,
    encoding
  } = {}) {
    const { error } = shell.spawnSync(`mkdir -p ${dirname(path)}`)

    if (error != null) {
      return logger.error(error.message)
    }

    return createWriteStream(path, { encoding })
  },

  exists (path) {
    return new Promise((resolve) => {
      access(path, constants.F_OK, (error) => {
        const exists = error == null

        return resolve(exists)
      })
    })
  },

  stat (path) {
    return new Promise((resolve, reject) => {
      stat(path, (error, fileStats) => {
        if (error != null && error > 0) reject(error)
        else resolve(fileStats)
      })
    })
  },

  readWriteFile ({ file, placeholder, valueToReplace }) {
    return new Promise((resolve, reject) => {
      const fileSettings = { encoding: 'utf8' }

      const updateData = (data) => {
        if (!data.includes(valueToReplace)) {
          data = data.replace(placeholder, valueToReplace)
        }

        return data
      }

      readFile(file, fileSettings, (error, data) => {
        if (error) return reject(error)

        const newData = updateData(data)
        if (newData === data) return resolve()

        writeFile(file, newData, fileSettings, (error) => error ? reject(error) : resolve())
      })
    })
  }
}
