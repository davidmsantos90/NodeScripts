const _getLocalConfiguration = () => {
  const filename = 'local.config'

  let localConfiguration = null
  try {
    localConfiguration = require(`../${filename}`)
  } catch (ex) {
    // does nothing
  }

  if (localConfiguration == null) {
    localConfiguration = {}
  }

  return localConfiguration
}

const DEFAULT_ORG = 'pentaho'

const {
  command, organization = DEFAULT_ORG, project, members
} = _getLocalConfiguration()

export default {
  command,
  organization,
  project,
  members: [ ...members, { name: 'upstream', user: organization } ]
}
