import '@babel/polyfill'

import { spawn, spawnSync, exec } from 'child_process'

import Logger from 'node-log'

const logger = new Logger({})

const INFO_REGX = /(.*?)(\[INFO\]|INFO:?)(.+)/

const WARN_REGX = /(.*?)(\[(?:WARNING|WARN)\]|(?:WARNING|WARN):?)(.+)/

const ERROR_REGX = /(.*?)(\[(?:ERROR|SEVERE)\]|(?:ERROR|SEVERE):?)(.+)/

const DEBUG_REGX = /(.*?)(\[DEBUG\]|DEBUG:?)(.+)/

const colorWrite = (data = '') => {
  const lines = data.toString().split('\n').filter((line) => line != null && line !== '')

  for (const line of lines) {
    if (/^\s*$/.test(line)) logger.log()

    else if (INFO_REGX.test(line)) logger.info(line)

    else if (WARN_REGX.test(line)) logger.warn(line)

    else if (ERROR_REGX.test(line)) logger.error(line)

    else if (DEBUG_REGX.test(line)) logger.debug(line)

    else logger.log(line)
  }
}

const buildCommand = ({ cmd = '', args = '' }) => `${cmd}${args !== '' ? ' ' : ''}${args}`

const execCommand = (command = '', options = {}) => new Promise((resolve, reject) => {
  exec(command, { ...options, maxBuffer: 1024 * 1024 }, (error, stdout/* , stderr */) => {
    if (error != null) reject(error)
    else resolve(stdout)
  })
})

const spawnCommand = async (command = '', { silent = false, color = true, ...options } = {}) => {
  if (command === '') throw new Error('spawn: command needs to be defined!')

  const spawedProcess = spawn(command, [], { silent, shell: true, ...options })

  let output = ''
  spawedProcess.stdout.on('data', (data) => {
    output += data

    if (!silent) {
      if (color) colorWrite(data)
      else process.stdout.write(data)
    }
  })

  let error = ''
  spawedProcess.stderr.on('data', (data) => {
    error += data

    if (!silent) {
      process.stdout.write(`[ERROR] ${data}`)
    }
  })

  return new Promise((resolve, reject) => {
    spawedProcess.on('exit', (code) => {
      const isErrorCode = code !== 0 || error !== ''
      if (isErrorCode) return reject(error)

      resolve(output)
    })
  }).catch((ex) => {
    // terminal.error(ex.message)
  })
}

const spawnCommandSync = (command = '') => {
  try {
    const { output, error } = spawnSync(command, [], { shell: true })

    if (error != null) throw error

    return { output }
  } catch (error) {
    return { error }
  }
}

export default {
  exec: execCommand,
  spawn: spawnCommand,
  spawnSync: spawnCommandSync,

  tail: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'tail', args }), { ...options }
  ),

  mkdir: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'mkdir', args }), { ...options }
  ),

  mv: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'mv', args }), { ...options }
  ),

  cp: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'cp', args }), { ...options }
  ),

  rm: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'rm', args }), { ...options }
  ),

  echo: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'echo', args }), { ...options }
  ),

  kill: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'kill', args }), { ...options, silent: true }
  ),

  pwd: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'pwd', args }), { ...options, silent: true }
  ),

  ps: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'ps', args }), { ...options, silent: true }
  ),

  which: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'which', args }), { ...options, silent: true }
  ),

  touch: (args = '', options = {}) => spawnCommand(
    buildCommand({ cmd: 'touch', args }), { ...options, silent: true }
  )
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
