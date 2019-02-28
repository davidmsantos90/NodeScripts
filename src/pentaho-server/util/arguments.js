import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import defaults from './default.config'

const optionsConfiguration = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Help'
  }, {
    name: 'debug',
    alias: 'd',
    type: Boolean,
    description: 'Debug mode'
  }, {
    name: 'action',
    alias: 'a',
    defaultOption: true,
    defaultValue: defaults.action,
    description: 'Select pentaho-server action to execute.'
  }, {
    name: 'tail',
    alias: 't',
    type: Boolean,
    defaultValue: defaults.tail,
    description: 'Tail pentaho-server cataliga.out log file.'
  }
]

const helpConfiguration = [
  { header: 'Start, Stop and Restart your Pentaho Server' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help, defaults }
