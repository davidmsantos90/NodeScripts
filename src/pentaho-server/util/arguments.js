import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import defaults from './default.config'

const optionsConfiguration = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Shows help information.'
  }, {
    name: 'debug',
    alias: 'd',
    type: Boolean,
    description: 'Enables debug logging.'
  }, {
    name: 'action',
    alias: 'a',
    defaultOption: true,
    defaultValue: defaults.action,
    description: 'Select an `action` to execute:\n - start, stop, restart.'
  }, {
    name: 'tail',
    alias: 't',
    type: Boolean,
    defaultValue: defaults.tail,
    description: 'Tail `cataliga.out` log file.'
  }
]

const helpConfiguration = [
  { header: 'Start, Stop and Restart your Pentaho Server' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help, defaults }
