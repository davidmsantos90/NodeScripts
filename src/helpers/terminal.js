import '@babel/polyfill'

import { sync as getCursorPosition } from 'get-cursor-position'
import readline from 'readline'

export default {
  _input: process.stdin,
  _output: process.stdout,

  _size: null,
  set size ([width, height]) {
    this._size = { width, height }
  },
  get size () {
    return this._size
  },

  _iPosition: null,
  set iPosition ({ row: y, col: x }) {
    this._iPosition = { x, y }
  },
  get iPosition () {
    return this._iPosition
  },

  _deltaY: -1,
  get deltaY () {
    return this._deltaY
  },

  _registry: {},
  register (key, element) {
    this._registry[key] = { element, deltaY: this._deltaY++ }
  },

  get (key) {
    return (this._registry[key] || {}).element
  },

  elements: function * () {
    for (let key of Object.keys(this._registry)) {
      yield (this._registry[key].element)
    }
  },

  _ready: false,
  get isReady () {
    return this._ready
  },

  init () {
    if (this.isReady) return true

    const isInputTTY = this._input.isTTY
    const isOutputTTY = this._output.isTTY
    if (!isInputTTY || !isOutputTTY) throw new Error(`streams must be TTY`)

    this.size = this._output.getWindowSize()
    this.iPosition = getCursorPosition()

    this._registerResizeEvent()
    this._registerKeypressEvent()

    // this._startLoading()

    this._ready = true
  },

  __write (value = '') {
    this._output.write(value)
    this.cursorToEnd()
  },

  resetLine (key) {
    const { [key]: { deltaY } } = this._registry

    this._output.cursorTo(0, this.iPosition.y + deltaY)
    this._output.clearLine()
  },

  cursorToEnd (x = 1) {
    this._output.cursorTo(x, this.iPosition.y + this.deltaY)
  },

  _loader: null,
  _startLoading () {
    var h = ['|', '/', '-', '\\']
    var i = 0

    this._loader = setInterval(() => {
      i = (i > 3) ? 0 : i
      this.cursorToEnd(0)
      this._output.clearLine()

      this.__write(h[i])
      i++
    }, 250)
  },

  _stopLoading () {
    // clearInterval(this._loader)

    this.cursorToEnd(0)
    this._output.clearLine()
  },

  _registerKeypressEvent () {
    readline.emitKeypressEvents(this._input)
    this._input.setRawMode(true)

    this._input.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        this._exit()
        process.exit()
      }

      if (key.name === 'return') {
        this._output.cursorTo(0, this.iPosition.y)

        for (let element of this.elements()) {
          element.draw()
        }

        this.cursorToEnd()
      }

      // console.log(`Pressed: ${ key.name }`)
    })
  },

  _unregisterKeypressEvent () {
    this._input.setRawMode(false)
    this._input.off('keypress', () => {})
  },

  _registerResizeEvent () {
    this._output.on('resize', () => {
      const beforePos = this.iPosition

      this.size = this._output.getWindowSize()
      this.iPosition = getCursorPosition() || beforePos
    })
  },

  _exit () {
    this._unregisterKeypressEvent()
    this._stopLoading()
  }
}