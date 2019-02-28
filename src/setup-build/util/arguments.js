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
    defaultValue: defaults.debug,
    description: 'Debug mode, only logs information'
  }, {
    name: 'execution',
    alias: 'e',
    defaultValue: defaults.execution,
    description: 'Which execution to run: [server, pdi]'
  }, {
    name: 'type',
    alias: 't',
    defaultValue: defaults.type,
    description: 'Build type to setup: [snapshot, qat, release]'
  }, {
    name: 'version',
    alias: 'v',
    defaultValue: defaults.version,
    description: 'Build version to setup: [8.2.0.0, 9.0.0.0, ...]'
  }, {
    name: 'build',
    alias: 'b',
    defaultValue: defaults.build,
    description: 'Build number to setup: [1, 2, ..., 30, ...]'
  }, {
    name: 'path',
    alias: 'p',
    defaultValue: defaults.path,
    description: 'Full path to the directory where to setup all builds.'
  }, {
    name: 'link',
    alias: 'l',
    defaultValue: defaults.link,
    description: 'Base url to download builds to setup.'
  }
]

const helpConfiguration = [
  { header: 'Download, extract and cleanup your Pentaho build!' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help }
