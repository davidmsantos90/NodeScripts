import Element from './Element'
import terminal from './terminal'

terminal.init()

const logger = {
  __count: 0,

  log (message = '') {
    return this.__write({ message })
  },

  info (message = '') {
    return this.__write({ message, type: 'info' })
  },

  debug (message = '') {
    return this.__write({ message, type: 'debug' })
  },

  warn (message = '') {
    return this.__write({ message, type: 'warn' })
  },

  error (message = '') {
    return this.__write({ message, type: 'error' })
  },

  __write ({ message = '', type = 'log' }) {
    const element = new Element({ id: `logger_${this.__count++}`, type })

    element.update({ message })
  }
}

export default logger
