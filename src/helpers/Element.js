import chalk from 'chalk'

import terminal from './terminal'

export default class Element {
  constructor({
    id, type
  }) {
    this._id = id
    this._type = type

    this.__isDone = false
    this.__isRejected = false

    terminal.register(id, this)
  }

  // -----

  get id() {
    return this._id
  }

  get isDone() {
    return this.__isDone
  }

  end(options = {}) {
    this.__isDone = true

    this.update(options)
  }

  get isRejected() {
    return this.__isRejected
  }

  reject(options = {}) {
    this.__isRejected = true

    this.update(options)
  }

  update({ message, type }) {
    if (message != null) this._message = message
    if (type != null ) this._type = type

    this.draw()
  }

  draw() {
    terminal.resetLine(this.id)

    if (this.isRejected || this._type === 'error') return this._error()
    if (this.isDone) return this._done()

    if (this._type === 'debug') return this._debug()
    if (this._type === 'info') return this._info()
    if (this._type === 'warn') return this._warn()

    terminal.__write(this._message)
  }

  _debug() {
    const tag = chalk.bold('[DEBUG] ')

    terminal.__write(chalk.blue(`${ tag + chalk.cyan(this._message) }`))
  }

  _info() {
    const tag = chalk.bold('[INFO]  ')

    terminal.__write(chalk.blue(`${ tag + chalk.cyan(this._message) }`))
  }

  _done() {
    const tag = chalk.bold('[DONE]  ')

    terminal.__write(chalk.green(tag + this._message))
  }

  _warn() {
    const tag = chalk.bold('[WARN]  ')

    terminal.__write(chalk.yellow(tag + this._message))
  }

  _error() {
    const tag = chalk.bold('[ERROR] ')

    terminal.__write(chalk.red(tag + this._message))
  }

  _padL(value, pad = '0', target = 2) {
    const valueLength = String(value).length
    const padding = valueLength < target ? pad.repeat(target - valueLength) : ''

    return `${ padding + value }`
  }

  _padR(value, pad = '0', target = 2) {
    const valueLength = String(value).length
    const padding = valueLength < target ? pad.repeat(target - valueLength) : ''

    return `${ value + padding }`
  }
}
