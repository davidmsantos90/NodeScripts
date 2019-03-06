import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import { defaults } from './default.config'

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
    name: 'bundles',
    alias: 'b',
    defaultOption: true,
    multiple: true,
    defaultValue: defaults.bundles,
    description: 'List of karaf bundles to:\n - activate, store.'
  }, {
    name: 'root',
    alias: 'r',
    defaultValue: defaults.root,
    description: 'Define a different root path for script.\n (can be relative to current directory)'
  }, {
    name: 'activate',
    alias: 'a',
    type: Boolean,
    defaultValue: defaults.activate,
    description: 'Switch execution to activate instead of storing bundles.'
  }, {
    name: 'output',
    alias: 'o',
    defaultValue: defaults.output,
    description: 'Location to store karaf bundles.'
  }
]

const helpConfiguration = [
  { header: 'Manage Karaf Bundles' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help, defaults }
