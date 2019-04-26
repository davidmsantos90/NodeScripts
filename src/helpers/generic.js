import { join, sep, dirname } from 'path'
import { readFile, writeFile, access, constants, createWriteStream } from 'fs'

import { exec, mkdir } from 'shelljs'

const DOWNLOAD_FOLDER = join(sep, 'home', 'dams', 'Downloads')

export default {
  createDownloadStream ({
    path = DOWNLOAD_FOLDER,
    encoding
  } = {}) {
    mkdir('-p', dirname(path))

    return createWriteStream(path, { encoding })
  },

  execP (command, settings = { silent: true }) {
    return new Promise((resolve, reject) => {
      exec(command, settings, (code, output/*, error */) => {
        const isErrorCode = code !== 0
        if (isErrorCode) {
          const error = Error(`Failed to execute: ${command}`)

          return reject(error)
        }

        return resolve(output)
      })
    })
  },

  exists (path) {
    return new Promise(function (resolve) {
      access(path, constants.F_OK, (error) => {
        const exists = error == null

        return resolve(exists)
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
