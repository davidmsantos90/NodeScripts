import EventEmitter from 'events'
import { green, red, blue, yellow, bold } from 'chalk'

const blueBold = (value) => blue(bold(value))
const redBold = (value) => red(bold(value))
const greenBold = (value) => green(bold(value))
const yellowBold = (value) => yellow(bold(value))

const buildComponentState = () => ({
  _done: false,
  get done () {
    return this._done
  },

  _cancelled: false,
  get cancelled () {
    return this._cancelled
  },

  _error: null,
  get rejected () {
    return this._error != null
  },
  get error () {
    return this._error
  },

  get ended () {
    return this._done || this._rejected || this._cancelled
  },

  end ({ error, cancelled } = {}) {
    if (!this.done && cancelled != null) this._cancelled = cancelled
    if (!this.done && error != null) this._error = error

    if (!this.rejected && !this.cancelled) this._done = true
  }
})

export default class IComponent extends EventEmitter {
  constructor ({ id, row = null, throttle, width = 0 }) {
    super()

    this._id = id
    this._row = row
    this._width = width

    this._ready = false
    this.__throttle = throttle

    this._state = buildComponentState()
  }

  // -----

  get id () {
    return this._id
  }

  get row () {
    return this._row
  }

  get width () {
    return this._width
  }

  get state () {
    return this._state
  }

  init (props = {}) {
    this._ready = true

    this._init(props)

    this.update({ ...props, force: true })

    this.emit('init')
  }

  update ({ error = null, ended = false, cancelled = null, ...props } = {}) {
    if (!this.state.ended) {
      this._update({ error, ...props })

      if (error != null || ended) this.state.end({ cancelled, error })
    }

    this.emit('update', props)
  }

  draw () {
    if (!this._ready) return ''

    return this._draw()
  }

  done ({ ...props } = {}) {
    this.update({ ...props, ended: true, force: true })

    this.emit('done')
  }

  cancel ({ reason = `Component ${this.id} was cancelled!`, ...props } = {}) {
    const error = new Error(reason)

    this.update({ ...props, cancelled: true, error, force: true })

    this.emit('cancel', { error })
  }

  reject ({ reason = `Component ${this.id} was rejected!`, ...props } = {}) {
    const error = new Error(reason)

    this.update({ ...props, error, force: true })

    this.emit('rejected', { error })
  }

  /** @abstract */
  _update () {}

  /** @abstract */
  _draw () {}

  _throttle () {
    if (!this._throttle) return false

    const inThrottle = this.__inThrottle
    if (!inThrottle) {
      this.__inThrottle = true

      setTimeout(() => {
        this.__inThrottle = false
      }, 100)
    }

    return inThrottle
  }

  __addStateStyle (element) {
    if (this.state.done) return greenBold(element)
    if (this.state.cancelled) return yellowBold(element)
    if (this.state.rejected) return redBold(element)

    return blueBold(element)
  }
}
