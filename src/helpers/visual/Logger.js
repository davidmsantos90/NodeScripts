import chalk from 'chalk'

import Element from './Element'

const ensureNewline = (message = '') => message // .endsWith('\n') ? message : `${message}\n`

const bold = (message, color = chalk.white) => color(chalk.bold(message))
const logTag = (color, useTag = true) => useTag ? bold('> ', color) : ''

export const log = (message = '') => {
  const useTag = message !== '' && message !== '\n'

  return `${logTag(chalk.white, useTag) + ensureNewline(message)}`
}

export const DEBUG_TAG = logTag(chalk.magenta)
export const debug = (message) => `${DEBUG_TAG + chalk.magenta(ensureNewline(message))}`

export const INFO_TAG = logTag(chalk.cyan)
export const info = (message) => `${INFO_TAG + chalk.cyan(ensureNewline(message))}`

export const ERROR_TAG = logTag(chalk.red)
export const error = (message) => `${ERROR_TAG + chalk.red(ensureNewline(message))}`

export const WARN_TAG = logTag(chalk.yellow)
export const warn = (message) => `${WARN_TAG + chalk.yellow(ensureNewline(message))}`

export const DONE_TAG = logTag(chalk.green)
export const done = (message) => `${DONE_TAG + chalk.green(ensureNewline(message))}`

let counter = 0

export default class Logger extends Element {
  constructor ({ id = `logger-${counter++}`, type = 'info', message = '' } = {}) {
    super({ id })

    this._message = message
    this._type = type
  }

  _update ({ message, type }) {
    if (message != null) this._message = message
    if (type != null) this._type = type

    this.draw()
  }

  _draw () {
    const message = this._message

    if (this.rejected) return error(message)
    if (this.done) return done(message)

    switch (this._type) {
      case 'info':
        return info(message)

      case 'debug':
        return debug(message)

      case 'warn':
        return warn(message)

      case 'error':
        return error(message)
    }

    return log(message)
  }
}
