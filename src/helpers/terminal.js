import { sync as getCursorPosition } from 'get-cursor-position'
import readline from 'readline'

export default {
  _input: process.stdin,
  _output: process.stdout,

  _iPosition: null,
  set iPosition({ row: y, col: x }) {
    this._iPosition = { x, y }
  },
  get iPosition() {
    return this._iPosition
  },

  _deltaY: -1,
  get deltaY() {
    return this._deltaY
  },

  _registry: {},
  register(key, element) {
    this._registry[key] = { element, deltaY: this._deltaY++ }
  },

  get(key) {
    return (this._registry[key] || {}).element
  },

  elements: function*() {
    for(let key of Object.keys(this._registry)) {
      yield(this._registry[key].element)
    }
  },

  _ready: false,
  get isReady() {
    return this._ready
  },

  init() {
    if (this.isReady) return true

    this.iPosition = getCursorPosition()
    this._registerKeypressEvent()

    this._ready = true
  },

  __write(value = '') {
    this._output.write(value)
    this.cursorToEnd()
  },

  draw(key, type = 'draw') {
    this.cursorTo(key)
    this.clearLine()

    const { [key]: { element } } = this._registry

    element[type]()
  },

  cursorTo(key) {
    const { [key]: { deltaY } } = this._registry

    this._output.cursorTo(0, this.iPosition.y + deltaY)
  },

  cursorToEnd() {
    this._output.cursorTo(0, this.iPosition.y + this.deltaY)
  },

  clearLine() {
    this._output.clearLine()
  },

  _registerKeypressEvent() {
    readline.emitKeypressEvents(this._input)
    this._input.setRawMode(true)

    this._input.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        process.exit()
      }

      if (key.name === 'return') {
        this._output.cursorTo(0, this.iPosition.y)

        for (let element of this.elements()) {
          element.draw()
        }

        this.cursorToEnd()
      }
    })
  },

  _unregisterKeypressEvent() {
    this._input.setRawMode(false)
    this._input.off('keypress', () => {

    })
  }
}
