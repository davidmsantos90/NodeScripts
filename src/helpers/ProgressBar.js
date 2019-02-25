import Element from './Element'

import terminal from './terminal'

import {
  green, red, blue, cyan,
  bold, underline, italic
} from 'chalk'

const blueBold = (value) => blue(bold(value))
const redBold = (value) => red(bold(value))
const greenBold = (value) => green(bold(value))

export default class ProgressBar extends Element {
  constructor({
    id = 'download.zip',
    total = 0
  }) {
    super({ id })

    this.__time = { start: Date.now() }

    this.__inThrottle = false

    this.__progress = 0
    this.__total = total

    this.__length = terminal._output.columns - 80
  }

  init({ total }) {
    this.__total = total
  }

  get elapsedTime() {
    const { start, end = Date.now() } = this.__time

    return new Date(end - start)
  }

  set progress(downloaded) {
    const progress = downloaded / this.__total

    this.__isDone = progress === 1
    this.__progress = progress
  }
  get progress() {
    return this.__progress
  }

  update({ downloaded = 0 }) {
    this.progress = downloaded

    if ((this.isDone || this.isRejected) && this.__time.end == null) {
      this.__time.end = Date.now()
    }

    if (this.__inThrottle && !this.isDone) return

    try {

      this.draw()

    } catch(ex) {
      this.__isRejected = true
    }
  }

  draw() {
    terminal.resetLine(this.id)

    const separator = bold(' | ')

    let output = this._drawCaption()
    output += separator + this._drawBar()
    output += separator + this._drawClock()
    output += separator + this._drawProgressPercentage()

    terminal.__write(output)

    this._throttle()
  }

  _throttle() {
    this.__inThrottle = true

    setTimeout(() => this.__inThrottle = false, 100)
  }

  _drawCaption() {
    const filename = this._padR(` > ${ this.id }`, ' ', 45)

    if (this.isDone) return greenBold('[DONE]  ') + green(filename)

    if (this.isRejected) return redBold('[ERROR] ') + red(filename)

    return blueBold('[INFO]  ') + cyan(filename)
  }

  _drawProgressPercentage() {
    const percentage = `${ (this.progress * 100).toFixed(2) }%`

    if (this.isDone) return greenBold(percentage)

    if (this.isRejected) return redBold(percentage)

    return blueBold(percentage)
  }

  _drawClock() {
    const elapsedTime = this.elapsedTime
    const clock = `${ this._padL(elapsedTime.getMinutes()) }:${ this._padL(elapsedTime.getSeconds()) }`

    if (this.isDone) return greenBold(clock)

    if (this.isRejected) return redBold(clock)

    return blueBold(clock)
  }

  _drawBar() {
    const emptyBar = this.__getEmptyBar()
    const filledBar = this.__getFilledBar()

    return bold(`${ blue('[') }${ filledBar + emptyBar }${ blue(']') }`)
  }

  __getEmptyBar() {
    const filler = ' '
    const size = Math.floor(this.__length - (this.progress * this.__length))

    return `${ filler.repeat(size) }`
  }

  __getFilledBar() {
    const filler = '='
    const headFiller = '>'

    const size = Math.ceil(this.progress * this.__length) - 1

    return `${ size > -1 ? filler.repeat(size) : '' }${ this.isDone ? filler : headFiller }`
  }
}
