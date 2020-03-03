import readline from 'readline'

import { getSync as cursorPosition } from 'node-cursor-position'

const initialRow = () => {
  let row = 0

  try {
    const position = cursorPosition()

    row = position.row // y
  } catch (ex) {
    // only working for linux
  }

  return row
}

const windowSize = (stdout) => {
  const [width, height] = stdout.getWindowSize()

  return { width, height }
}

export default class IView {
  constructor ({
    input = process.stdin,
    output = process.stdout
  }) {
    this._size = windowSize(output)
    this._irow = initialRow()

    // 2. Register input stream event handlers
    readline.emitKeypressEvents(input)
    input.setRawMode(true)
    input.on('keypress', this.keypressHandler.bind(this))

    // 3. Register ouput stream event handlers
    output.on('resize', this.resizeHandler.bind(this))

    this._input = input
    this._output = output

    this._componentMap = {}
  }

  get input () {
    return this._input
  }

  get output () {
    return this._output
  }

  get nextRow () {
    return this._irow + Object.values(this._componentMap).length
  }

  get (id) {
    const { [id]: component } = this._componentMap

    return component
  }

  dispose () {
    this._clearLine(this.nextRow)

    this.output.end()
  }

  register (component) {
    const { id } = component

    component._row = this.nextRow
    component._width = this._size.width

    component.on('resize', (data = {}) => this.get(id).update(data))
    component.on('update', (data = {}) => this._onComponentUpdate({ ...data, id }))

    this._componentMap[id] = component
  }

  /** @abstract */
  _onComponentUpdate () {
    // impl
  }

  _clearLine (row = 0) {
    this.output.cursorTo(0, row)
    this.output.clearLine()
  }

  // ----------------------
  //  ------ Events ------
  // ----------------------

  broadcast (event = '', data = {}) {
    Object.values(this._componentMap).forEach((component) => {
      component.emit(event, data)
    })
  }

  keypressHandler (str, key) {
    if (key.ctrl && key.name === 'c') {
      this.dispose()
      process.exit()
    }
  }

  resizeHandler () {
    this._size = windowSize(this.output)

    this.output.cursorTo(0, 0)
    this.output.clearScreenDown()

    this.broadcast('resize', this._size)
  }
}
