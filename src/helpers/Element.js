import EventEmitter from 'events'

import chalk from 'chalk'

import terminal from './terminal'

const DISCOUNT_LENGTH = 80

const MINIMUM_LENGTH = 20

export default class Element extends EventEmitter {
  constructor ({
    id, type
  }) {
    super()

    this._id = id
    this._type = type

    this.__isDone = false
    this.__isRejected = false

    this.__length = Math.max(MINIMUM_LENGTH, terminal.size.width - DISCOUNT_LENGTH)

    this.__registerEvents()

    terminal.register(id, this)
  }

  __registerEvents () {
    this.on('resize', () => {
      this.__length = Math.max(MINIMUM_LENGTH, terminal.size.width - DISCOUNT_LENGTH)

      this.draw()
    })

    this.on('newline', () => {
      this.draw()
    })
  }

  // -----

  get id () {
    return this._id
  }

  get isDone () {
    return this.__isDone
  }

  end (options = {}) {
    this.__isDone = true

    this.update(options)

    return Promise.resolve()
  }

  get isRejected () {
    return this.__isRejected
  }

  reject (options = {}) {
    this.__isRejected = true

    this.update(options)

    return Promise.reject(this.__error)
  }

  get __error () {
    const message = `Element ${this.id} was rejected!`

    return new Error(message)
  }

  update ({ message, type }) {
    if (message != null) this._message = message
    if (type != null) this._type = type

    this.draw()
  }

  draw () {
    if (this.isRejected || this._type === 'error') return this._error()
    if (this.isDone) return this._done()

    let message = this._message

    if (this._type === 'debug') message = this._debug()
    if (this._type === 'info') message = this._info()
    if (this._type === 'warn') message = this._warn()

    terminal.write(message, this.id)
  }

  _debug () {
    const tag = chalk.bold('[DEBUG] ')

    return chalk.blue(`${tag + chalk.cyan(this._message)}`)
  }

  _info () {
    const tag = chalk.bold('[INFO]  ')

    return chalk.blue(`${tag + chalk.cyan(this._message)}`)
  }

  _done () {
    const tag = chalk.bold('[DONE]  ')

    return chalk.green(tag + this._message)
  }

  _warn () {
    const tag = chalk.bold('[WARN]  ')

    return chalk.yellow(tag + this._message)
  }

  _error () {
    const tag = chalk.bold('[ERROR] ')

    return chalk.red(tag + this._message)
  }

  _padL (value, pad = '0', target = 2) {
    const valueLength = String(value).length
    const padding = valueLength < target ? pad.repeat(target - valueLength) : ''

    return `${padding + value}`
  }

  _padR (value, pad = '0', target = 2) {
    const valueLength = String(value).length
    const padding = valueLength < target ? pad.repeat(target - valueLength) : ''

    return `${value + padding}`
  }
}
