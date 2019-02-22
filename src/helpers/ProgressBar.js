import terminal from './terminal'

import {
  green, blue, cyan,
  bold, underline, italic
} from 'chalk'

const blueBold = (value) => blue(bold(value))

export default class ProgressBar {
  constructor({
    id = 'download.zip',
    response = {}
  }) {
    this.__startTime = Date.now()
    this.__finalTime = null

    this.__total = response.headers["content-length"]

    this._id = id

    this._inThrottle = false
    this._progress = 0
    this._length = Math.floor(terminal._output.columns / 2)

    terminal.register(id, this)
  }

  get id() {
    return this._id
  }

  get deltaT() {
    const nowTime = this.__finalTime != null
      ? this.__finalTime
      : Date.now()

    return new Date(nowTime - this.__startTime)
  }

  get inThrottle() {
    return this._inThrottle
  }

  set progress(downloaded) {
    this._progress = downloaded / this.__total
  }

  get progress() {
    return this._progress
  }

  get isComplete() {
    return this.progress === 1
  }

  get length() {
    return this._length
  }

  end() {
    this.update({ downloaded: this.__total })

    this.__finalTime = Date.now()

    terminal.cursorToEnd()
  }

  update({ downloaded = 0 }) {
    this.progress = downloaded

    if (this.inThrottle && !this.isComplete) return;

    try {
      terminal.draw(this.id)
      this.throttle()
    } catch(ex) {
      throw new Error(ex.message)
    }
  }

  draw() {
    const separator = bold(' | ')

    let output = this._getCaption()
    output += separator + this._getBar()
    output += separator + this._getClock()
    output += separator + this._getProgressPercentage()

    terminal.__write(output)
  }

  throttle() {
    this._inThrottle = true

    setTimeout(() => this._inThrottle = false, 100)
  }

  _getCaption() {
    const filename = this._padR(`> ${ this.id }`, ' ', 50)

    return blueBold('[INFO]  ') + cyan(filename)
  }

  _getProgressPercentage() {
    return blueBold(`${ (this.progress * 100).toFixed(2) }%`)
  }

  _getClock() {
    const deltaT = this.deltaT

    const minutes = this._padL(deltaT.getMinutes())
    const seconds = this._padL(deltaT.getSeconds())

    return blueBold(`${ minutes }:${ seconds }`)
  }

  _getBar() {
    const emptyBar = this._getEmptyBar()
    const filledBar = this._getFilledBar()

    return bold(`${ blue('[') }${ filledBar + emptyBar }${ blue(']') }`)
  }

  _getEmptyBar() {
    const filler = ' '
    const size = Math.floor(this.length - (this.progress * this.length))

    return `${ filler.repeat(size) }`
  }

  _getFilledBar() {
    const filler = '='
    const headFiller = '>'

    const size = Math.ceil(this.progress * this.length) - 1

    return `${ size > -1 ? filler.repeat(size) : '' }${ this.isComplete ? filler : headFiller }`
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
