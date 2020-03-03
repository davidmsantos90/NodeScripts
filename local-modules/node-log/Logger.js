import logTypeFactory from './log-types'

export const LEVELS = {
  log: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  all: 5
}

const buildLogText = ({ message, type, noColor }) => {
  const { tag, color } = type

  const text = color(`${tag} ${message}`)

  return text.endsWith('\n') ? text : `${text}\n`
}

const log = ({ message, type, output, noColor }) => output.write(buildLogText({
  message, type: { ...type, color: noColor ? (i) => i : type.color }
}))

export default class Logger {
  constructor ({
    level = LEVELS.all,
    output = process.stdout,
    noColor = false,
    tag
  }) {
    this._output = output

    this._type = logTypeFactory(tag)
    this._level = level
    this._noColor = noColor
  }

  set level (level) {
    this._level = level
  }

  get level () {
    return this._level
  }

  dispose () {
    this._output.end()
  }

  log (message = '') {
    return this.__log({ message, type: 'log' })
  }

  debug (message = '') {
    return this.__log({ message, type: 'debug' })
  }

  info (message = '') {
    return this.__log({ message, type: 'info' })
  }

  warn (message = '') {
    return this.__log({ message, type: 'warn' })
  }

  error (message = '') {
    return this.__log({ message, type: 'error' })
  }

  __log ({ message, type }) {
    const { [type]: logLevel } = LEVELS
    if (logLevel > this.level) return

    const { [type]: logType } = this._type

    return log({ message, type: logType, output: this._output, noColor: this._noColor })
  }
}
