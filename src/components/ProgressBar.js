import { blue, bold } from 'chalk'

import { IComponent } from 'scripts-api'

const DISCOUNT_LENGTH = 94

const MINIMUM_LENGTH = 20

export default class ProgressBar extends IComponent {
  constructor ({
    id, downloadOutput = ''
  }) {
    super({ id, throttle: true })

    this._file = downloadOutput.replace(/.+\/(.+)/, '$1')
    this._timer = buildTimer()

    this._total = 0
    this._progress = 0
  }

  _init ({ total = 0 }) {
    if (total === 0) {
      return this.reject({ reason: 'Trying to download empty file' })
    }

    this._total = total
  }

  get progress () {
    return this._progress
  }

  _update ({ downloaded }) {
    const total = this._total
    const progress = this._progress = downloaded / this._total

    if (progress === 1) this.state.end()

    this._caption = buildCaptionElement({ text: this._file })
    this._bar = buildBarElement({ progress, width: this.width })
    this._clock = this._timer.clock
    this._percentage = buildPercentageElement({ progress })
    this._size = buildSizeElement({ downloaded, total })
  }

  _draw () {
    const separator = bold(' | ')

    return this.__addStateStyle(this._caption) +
      separator + this._bar +
      separator + this.__addStateStyle(this._clock) +
      separator + this.__addStateStyle(this._size) +
      separator + this.__addStateStyle(this._percentage)
  }
}

// -----

const buildTimer = () => ({
  __finished: false,

  __start: Date.now(),
  __current: Date.now(),

  stop () {
    this.__finished = true
  },

  _update () {
    if (!this.__finished) this.__current = Date.now()
  },

  get clock () {
    this._update()

    const delta = new Date(this.__current - this.__start)

    const hours = `${delta.getHours() - 1}`.padStart(2, '0')
    const minutes = `${delta.getMinutes()}`.padStart(2, '0')
    const seconds = `${delta.getSeconds()}`.padStart(2, '0')

    return `${hours}:${minutes}:${seconds}`
  }
})

const buildCaptionElement = ({ text = '', pad = 55 }) => ` - ${text}`.padEnd(pad, ' ')

const buildBarElement = ({ progress = 0, width = 0 }) => {
  let bar = ''

  const barWidth = Math.max(MINIMUM_LENGTH, width - DISCOUNT_LENGTH)

  const progressSize = Math.ceil(progress * barWidth)

  bar += `${progressSize > 0 ? '='.repeat(progressSize - 1) : ''}`

  const isDone = progress === 1
  bar += `${isDone ? '=' : '>'}`

  const emptyFiller = ' '
  const emptySize = Math.floor(barWidth - (progress * barWidth))

  const size = emptySize + progressSize

  return bold(`${blue('[')}${bar.padEnd(size, emptyFiller)}${blue(']')}`)
}

const buildSizeElement = ({ downloaded = 0, total = 1, pad = 6 }) => {
  const isBigSize = (total / (1024 * 1024)) > 999
  const factor = (1024 * 1024 * (isBigSize ? 1024 : 1))

  return `${(downloaded / factor).toFixed(2)}`.padStart(pad, ' ') +
    `${isBigSize ? 'G' : 'M'}bs`
}

const buildPercentageElement = ({ progress = 0 }) => `${(progress * 100).toFixed(2)}%`
