import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import { defaults } from './default.config'

const optionsConfiguration = [
  {
    name: 'help', alias: 'h', type: Boolean,
    description: 'Help'
  }, {
    name: 'debug', alias: 'd', type: Boolean,
    description: 'Debug mode, only logs information'
  }, {
    name: 'bundles', alias: 'b', defaultOption: true,
    multiple: true, defaultValue: defaults.bundles,
    description: 'Select karaf bundles to manage.'
  }, {
    name: 'root', alias: 'r', defaultValue: defaults.root,
    description: 'Define different root path for script.'
  }, {
    name: 'activate', alias: 'a', type: Boolean,
    defaultValue: defaults.activate,
    description: 'Switch execution to activate instead of storing bundles.'
  }, {
    name: 'output', alias: 'o', defaultValue: defaults.output,
    description: 'Where bundles will be stored.'
  }
]

const helpConfiguration = [
  { header: 'Manage Karaf Bundles' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help, defaults }
