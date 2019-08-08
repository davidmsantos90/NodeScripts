import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import defaults from './default.config'

const optionsConfiguration = [
  {
    name: 'command',
    alias: 'c',
    defaultOption: true,
    defaultValue: defaults.execution,
    description: 'choose a git command'
  }, {
    name: 'organization',
    alias: 'o',
    defaultValue: defaults.organization,
    description: 'Target Github Organization'
  }, {
    name: 'project',
    alias: 'p',
    defaultValue: defaults.project,
    description: 'Target Github Project'
  }, {
    name: 'token',
    alias: 't',
    defaultValue: defaults.token,
    description: 'Token for Github API'
  }
]

const helpConfiguration = [
  { header: 'Download, extract and cleanup your Pentaho build!' },
  { header: 'Options:', optionList: optionsConfiguration }
]

const options = commandLineArgs(optionsConfiguration)
const help = commandLineUsage(helpConfiguration)

export { options, help, defaults }

export default { options, help, defaults }
