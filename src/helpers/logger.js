import chalk from 'chalk'
import terminal from './terminal'

terminal.init()

const logger = {
  __count: 0,

  log(message = '') {
    return this.__write({ message })
  },

  _infoTag: chalk.bold('[INFO] '),
  info(message = '') {
    return this.__write({ message: chalk.blue(`${ this._infoTag + chalk.cyan(message) }`) })
  },

  debug(message = '') {
    const tag = chalk.bold('[DEBUG] ')

    return this.__write({ message: chalk.blue(`${ tag + message }`) })
  },

  warn(message = '') {
    const tag = chalk.bold('[WARN] ')

    return this.__write({ message: chalk.yellow(`${ tag + message }`) })
  },

  _errorTag: chalk.bold('[ERROR] '),
  error(message = '') {
    return this.__write({ message: chalk.red(`${ this._errorTag + message }`) })
  },

  __write({ id, message = '', type = 'draw' }) {
    id = id || `logger_${ this.__count++ }`

    let element = terminal.get(id)
    if (element == null) {
      element =  {
        draw: () => terminal.__write(message),
        end: () => terminal.__write(chalk.green(chalk.reset(`${ message } - completed`).replace(/^\[\w+\] /, this._infoTag))),
        error: () => terminal.__write(chalk.red(chalk.reset(message).replace(/^\[\w+\] /, this._errorTag))),
      }

      terminal.register(id, element)
    }

    terminal.draw(id, type)

    return id
  }
}

export default logger
