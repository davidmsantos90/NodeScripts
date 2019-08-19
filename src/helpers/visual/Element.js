import EventEmitter from 'events'

import terminal from './terminal'

const DISCOUNT_LENGTH = 95

const MINIMUM_LENGTH = 20

export default class Element extends EventEmitter {
  constructor ({
    id, type
  }) {
    super()

    this._id = id

    this.__done = false
    this.__rejected = false

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

  get done () {
    return this.__done
  }

  get rejected () {
    return this.__rejected
  }

  end (options = {}) {
    return this.update(options)
  }

  reject ({ reason, ...options } = {}) {
    this.__rejected = true

    if (reason == null) reason = `Element ${this.id} was rejected!`
    const error = this.__error = new Error(reason)

    this.update(options)

    return error
  }

  update (options = {}) {
    let error = this.__error

    try {
      this._update(options)
    } catch (ex) {
      error = ex
    }

    return { error }
  }

  draw () {
    terminal.write(this._draw(), this.id)
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
