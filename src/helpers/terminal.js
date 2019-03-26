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
  set iPosition ({ row: y = 0, col: x = 0 } = {}) {
    this._iPosition = { x, y }
  },
  get iPosition () {
    return this._iPosition
  },

  get deltaY () {
    return this._registryList.length
  },

  _registry: {},
  _registryList: [],
  register (key, element) {
    this._registry[key] = { element, deltaY: this.deltaY }

    this._registryList.push(key)
  },

  get (key) {
    return (this._registry[key] || {}).element
  },

  elements: function * () {
    for (let key of this._registryList) {
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

    // 1. Calculate initial size and cursor position
    this.size = this._output.getWindowSize()
    this.iPosition = getCursorPosition()

    // 2. Register input stream event handlers
    readline.emitKeypressEvents(this._input)
    this._input.setRawMode(true)
    this._input.on('keypress', (str, key) => this._onKeypress(str, key))

    // 3. Register ouput stream event handlers
    this._output.on('resize', () => this._onResize())

    // 4. Terminal is ready to be used
    this._ready = true
  },

  write (message = '', key) {
    return this._write({ message, key })
  },

  _write ({ key, x, y, message = '' }) {
    this._cursorTo({ key, x, y })._clearLine()

    this._output.write(`${message}`)

    return this
  },

  cursorTo (x, y) {
    return this._cursorTo({ x, y })
  },

  cursorToStart () {
    const y = this.iPosition.y

    return this._cursorTo({ x: 0, y })
  },

  cursorToEnd () {
    const y = this.iPosition.y + this.deltaY

    return this._cursorTo({ x: 0, y })
  },

  _cursorTo ({ x = 0, y = 0, key }) {
    if (key != null) {
      const position = this._elementPosition(key)

      x = position.x
      y = position.y
    }

    this._output.cursorTo(x, y)

    return this
  },

  moveCursor (x, y) {
    return this._moveCursor({ x, y })
  },

  _moveCursor ({ x = 0, y, key }) {
    if (key != null) {
      const position = this._elementPosition(key)

      x = position.x
      y = position.y
    }

    this._output.moveCursor(x, y)

    return this
  },

  _clearLine () {
    this._output.clearLine()

    return this
  },

  _clearScreenDown () {
    this._output.clearScreenDown()

    return this
  },

  _elementPosition (key) {
    const { [key]: { deltaY } } = this._registry

    return {
      x: 0, y: this.iPosition.y + deltaY
    }
  },

  _onKeypress (str, key) {
    if (key.ctrl && key.name === 'c') {
      this._exit()
      process.exit()
    }
  },

  _onResize () {
    // 1. calculate new size
    this.size = this._output.getWindowSize()

    // 2. clean output stream
    this.cursorToStart()
      .moveCursor(0, -this.deltaY)
      ._clearScreenDown()

    // 3. trigger all elements' resize events
    for (let element of this.elements()) {
      element.emit('resize')
    }
  },

  _exit () {
    this._input.setRawMode(false)
    this._input.off('keypress', (str = '', key = {}) => this._onKeypress(str, key))

    this._output.off('resize', () => this._onResize())

    this.cursorToEnd()._clearLine()

    return this
  }
}
