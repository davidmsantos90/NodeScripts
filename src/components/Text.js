import { IComponent } from 'scripts-api'

export default class Text extends IComponent {
  constructor ({
    id, text = '', autoStyle = true
  }) {
    super({ id })

    this._text = text
    this._autoStyle = autoStyle
  }

  _init ({ text = null, autoStyle = null }) {
    if (text != null) this._text = text
    if (autoStyle != null) this._autoStyle = autoStyle
  }

  _update ({ error, text }) {
    if (error != null) this._text = error.message
    if (text != null) this._text = text
  }

  _draw () {
    return this._autoStyle ? this.__addStateStyle(this._text) : this._text
  }
}
