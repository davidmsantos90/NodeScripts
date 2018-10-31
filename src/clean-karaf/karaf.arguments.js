import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

const optionsConfiguration = [
  {
    name: 'help', alias: 'h', type: Boolean,
    description: 'Help'
  }, {
    name: 'all', alias: 'A', type: Boolean,
    description: 'Select all available karaf packages.'
  }, {
    name: 'packages', alias: 'p', defaultOption: true, multiple: true,
    description: 'Select karaf packages to manipulate.'
  }, {
    name: 'root', alias: 'r',
    description: 'Define different root path for script.'
  }, {
    name: 'mode', alias: 'm', defaultValue: 'store',
    description: 'Choose between moving or restoring packages.'
  }, {
    name: 'output', alias: 'o', defaultValue: '.store/',
    description: 'Where packages will be stored.'
  }
]

const helpConfiguration = [
  { header: 'Manage karaf resources' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help }
