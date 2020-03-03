import EventEmitter from 'events'

export default class IAction extends EventEmitter {
  constructor ({
    target,
    controller,
    type
  }) {
    super()

    this.__target = { ...target, id: `${type}-${target.id}` }
    this.__type = type

    this.__controller = controller
  }

  get target () {
    return this.__target
  }

  get type () {
    return this.__type
  }

  get component () {
    const { id } = this.target

    return this.__controller.view.get(id)
  }

  /** @abstract */
  async act () {
    // implement
  }

  __cancel (reason = '') {
    const error = new ActionCancel(this, reason)

    this.__controller.logger.warn(error.message)

    this.emit('cancel', { error })

    return error
  }

  __error (reason = '') {
    const error = new ActionError(this, reason)

    this.__controller.logger.error(error.message)

    this.emit('error', { error })

    return error
  }

  __update (data = {}) {
    this.emit('update', data)

    this.__controller.logger.info(`[UPDATE] ${this.target.id} - ${JSON.stringify(data)}`)

    return data
  }

  __done ({ result = null }) {
    this.__controller.logger.info(`[DONE] ${this.target.id} - finished executing successfully!`)

    this.emit('done', { result })

    return result
  }
}

class ActionError extends Error {
  constructor (action, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionError)
    }

    this.name = 'ActionError'
    this.message = `[ActionError] ${action.target.id} - ${this.message}`
  }
}

class ActionCancel extends Error {
  constructor (action, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionCancel)
    }

    this.name = 'ActionCancel'
    this.message = `[ActionCancel] ${action.target.id} - ${this.message}`
  }
}
