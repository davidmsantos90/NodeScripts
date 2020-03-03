import { IView } from 'scripts-api'

export default class SetupView extends IView {
  constructor () {
    super({
      input: process.stdin,
      output: process.stdout
    })
  }

  /** @override */
  _onComponentUpdate ({ id, force = false }) {
    const component = this.get(id)

    if (force || !component._throttle()) {
      this._clearLine(component.row)
      this.output.write(component.draw())
    }
  }
}
