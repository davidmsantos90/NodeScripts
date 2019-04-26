import { spawn } from 'child_process'

import chalk from 'chalk'
import { exec } from 'shelljs'

const INFO_REGX = /(.*?)(\[INFO\]|INFO:?)(.+)/
const INFO_TAG = chalk.blue(chalk.bold('[INFO]  ')) + chalk.reset()

const WARN_REGX = /(.*?)(\[(?:WARNING|WARN)\]|(?:WARNING|WARN):?)(.+)/
const WARN_TAG = chalk.yellow(chalk.bold('[WARN]  ')) + chalk.reset()

const ERROR_REGX = /(.*?)(\[(?:ERROR|SEVERE)\]|(?:ERROR|SEVERE):?)(.+)/
const ERROR_TAG = chalk.red(chalk.bold('[ERROR] ')) + chalk.reset()

const DEBUG_REGX = /(.*?)(\[DEBUG\]|DEBUG:?)(.+)/
const DEBUG_TAG = chalk.cyan(chalk.bold('[DEBUG] ')) + chalk.reset()

const __colorLine = (data) => {
  return data.toString().split('\n').map((line = '') => {
    line = line.trim()

    if (/^\s*$/.test(line)) return null

    if (ERROR_REGX.test(line)) {
      return line.replace(ERROR_REGX, __tagLine(ERROR_TAG))
    }

    if (WARN_REGX.test(line)) {
      return line.replace(WARN_REGX, __tagLine(WARN_TAG))
    }

    if (DEBUG_REGX.test(line)) {
      return line.replace(DEBUG_REGX, __tagLine(DEBUG_TAG))
    }

    if (INFO_REGX.test(line)) {
      return line.replace(INFO_REGX, __tagLine(INFO_TAG))
    }

    return `${INFO_TAG + line.replace(/\s+/, ' ')}`
  }).filter((line) => line != null || !/^\s*$/.test(line)).join('\n' + chalk.reset())
}

const __tagLine = (tag) => {
  return (match, prefix = '', type, suffix) => {
    const message = `${prefix.trim()} ${suffix.trim()}`.replace(/\s+/, ' ')

    return `${tag + message}`.trim()
  }
}

const __buildCommand = (spec = {}, { silent = false, dataProcessor }) => {
  const options = Array.isArray(spec.options) ? spec.options : spec.options.split(' ')

  const command = spawn(spec.name, options, spec.spawn)

  let output = ''
  command.stdout.on('data', (data) => {
    output += data
    if (!silent) {
      if (dataProcessor != null) {
        data = dataProcessor(data)
      }

      process.stdout.write(data)
    }
  })

  let error = ''
  command.stderr.on('data', (data) => {
    error += data
    if (!silent) {
      process.stdout.write(`[ERROR] ${data}`)
    }
  })

  return new Promise((resolve, reject) => {
    command.on('exit', (code) => {
      const isErrorCode = code !== 0
      if (isErrorCode) return reject(error)

      resolve(output)
    })
  })
}

export default {
  tail (options = [], config = {}) {
    // for await (let data of tail.stdout) process.stdout.write(__colorLine(data))

    return __buildCommand({
      name: 'tail', options, spawn: { silent: true }
    }, Object.assign(config, { dataProcessor: __colorLine }))
  },

  mkdir (options = [], config = {}) {
    return __buildCommand({
      name: 'mkdir', options
    }, config)
  },

  mv (options = [], config = {}) {
    return __buildCommand({
      name: 'mv', options
    }, config)
  },

  cp (options = [], config = {}) {
    return __buildCommand({
      name: 'cp', options
    }, config)
  },

  rm (options = [], config = {}) {
    return __buildCommand({
      name: 'rm', options
    }, config)
  },

  echo (options = '', config = {}) {
    return __buildCommand({
      name: 'echo', options: [options]
    }, config)
  },

  pwd (options = [], config = {}) {
    return __buildCommand({
      name: 'pwd', options, spawn: { silent: true }
    }, Object.assign(config, { silent: true }))
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
  }
}

// const persistence = (number) => {
//   let steps = 0
//
//   while (true) {
//     const digits = `${number}`.split('').map((d) => Number(d))
//
//     if (digits.length === 1) {
//       console.log('')
//       return `Total steps: ${steps}`
//     }
//
//     let result = 1
//     for (let d of digits) {
//       result *= d
//     }
//
//     console.log(`${++steps}: ${result}`)
//
//     number = result
//   }
// }
