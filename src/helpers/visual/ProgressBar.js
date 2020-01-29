// import terminal from './terminal'

import Element from './Element'
import { done, error, info } from './Logger'
import {
  green, red, blue, bold
} from 'chalk'

const blueBold = (value) => blue(bold(value))
const redBold = (value) => red(bold(value))
const greenBold = (value) => green(bold(value))

export default class ProgressBar extends Element {
  constructor ({
    id = 'download.zip',
    total = 0
  }) {
    super({ id })

    this.__time = { start: Date.now(), current: Date.now() }

    this.__inThrottle = false

    this.__progress = 0
    this.__total = total
  }

  init ({ total }) {
    this.__total = total
  }

  set time ({ current, end }) {
    if (current != null) this.__time.current = current

    if (this.__time.end == null && end != null) this.__time.end = end
  }
  get time () {
    return this.__time
  }

  get elapsedTime () {
    const { start, current, end } = this.time

    return new Date((end == null ? current : end) - start)
  }

  set progress (downloaded) {
    this.__downloaded = downloaded

    const total = this.__total
    if (!total) this.__rejected = true

    const progress = this.__progress = total ? downloaded / total : 0
    if (progress === 1) this.__done = true

    if (!total || progress === 1) this.time = { end: Date.now() }
    else this.time = { current: Date.now() }
  }
  get progress () {
    return this.__progress
  }

  _update ({ downloaded = 0 }) {
    this.progress = downloaded

    if (this.__inThrottle && !this.done) return

    this.draw()
  }

  _draw () {
    const separator = bold(' | ')

    const output = this._drawCaption() +
      separator + this._drawBar() +
      separator + this._drawClock() +
      separator + this._drawSize() +
      separator + this._drawProgressPercentage()

    this._throttle()

    return output
  }

  _throttle () {
    if (this.__inThrottle) return

    this.__inThrottle = true

    setTimeout(() => {
      this.__inThrottle = false
    }, 100)
  }

  _drawSize () {
    const total = this.__total / (1024 * 1024)
    const isBigSize = total > 999

    const downloaded = this.__downloaded / (1024 * 1024 * (isBigSize ? 1024 : 1))
    const size = `${this._padL(downloaded.toFixed(2), ' ', 6)} ${isBigSize ? 'G' : 'M'}bs`

    if (this.done) return greenBold(size)

    if (this.rejected) return redBold(size)

    return blueBold(size)
  }

  _drawCaption () {
    const filename = this._padR(` - ${this.id}`, ' ', 55)

    if (this.done) return done(filename)

    if (this.rejected) return error(filename)

    return info(filename)
  }

  _drawProgressPercentage () {
    const percentage = `${(this.progress * 100).toFixed(2)}%`

    if (this.done) return greenBold(percentage)

    if (this.rejected) return redBold(percentage)

    return blueBold(percentage)
  }

  _drawClock () {
    const elapsedTime = this.elapsedTime

    const hours = this._padL(elapsedTime.getHours() - 1)
    const minutes = this._padL(elapsedTime.getMinutes())
    const seconds = this._padL(elapsedTime.getSeconds())

    const clock = `${hours}:${minutes}:${seconds}`

    if (this.done) return greenBold(clock)

    if (this.rejected) return redBold(clock)

    return blueBold(clock)
  }

  _drawBar () {
    const emptyBar = this.__getEmptyBar()
    const filledBar = this.__getFilledBar()

    return bold(`${blue('[')}${filledBar + emptyBar}${blue(']')}`)
  }

  __getEmptyBar () {
    const filler = ' '
    const size = Math.floor(this.__length - (this.progress * this.__length))

    return `${filler.repeat(size)}`
  }

  __getFilledBar () {
    const filler = '='
    const headFiller = '>'

    const size = Math.ceil(this.progress * this.__length) - 1

    return `${size > -1 ? filler.repeat(size) : ''}${this.done ? filler : headFiller}`
  }
}
