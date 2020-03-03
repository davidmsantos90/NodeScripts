import { join } from 'path'

import { IAction } from 'scripts-api'

export default class Cleanup extends IAction {
  static _type () {
    return 'cleanup'
  }

  constructor (target, controller) {
    super({ target, controller, type: Cleanup._type() })
  }

  async act () {
    const { id, extractOutput, cleanups = [] } = this.target

    try {
      const isCleanedUp = await this.__controller.exists(join(extractOutput, '.clean'))
      if (isCleanedUp) {
        return this.__cancel(` - ${id} already cleaned up!`)
      }

      if (!cleanups.length) {
        return this.__cancel(` - ${id} no cleanups to perform!`)
      }

      this.component.init({ text: ` - ${id}` })

      const result = await Promise.all(cleanups.map((cleanup) => cleanup(extractOutput)))

      return this.__done({ result })
    } catch (exception) {
      return { error: this.__error(exception.message) }
    }
  }
}
