import { done, error, info, log, warn, debug } from './visual/Logger'

const ensureNewline = (message = '') => message.endsWith('\n') ? message : `${message}\n`

export default {
  log (message = '') {
    return this.__write(message)
  },

  info (message = '') {
    return this.__write(message, info)
  },

  debug (message = '') {
    return this.__write(message, debug)
  },

  warn (message = '') {
    return this.__write(message, warn)
  },

  error (message = '') {
    return this.__write(message, error)
  },

  done (message = '') {
    return this.__write(message, done)
  },

  __write (message = '', type = log) {
    const logMessage = ensureNewline(type(message))

    process.stdout.write(logMessage)
  }
}
