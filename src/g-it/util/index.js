import { get, simpleHandler } from '../../helpers/request'
import logger from '../../helpers/logger'

import args from './arguments'

export const options = args.options

const PPP_PROJECT_PREFIX = 'pentaho-platform-plugin-'
const PP_PROJECT_PREFIX = 'pentaho-platform-'
const P_PROJECT_PREFIX = 'pentaho-'

const PPP_ALIAS_PREFIX = 'ppp-'
const PP_ALIAS_PREFIX = 'pp-'
const P_ALIAS_PREFIX = 'p-'

const GIT_API_URL = 'https://api.github.com'
const GIT_API_USER_AGENT_HEADER = 'davidmsantos90'

const requestGitApi = async ({
  url, headers = {}, ...props
}) => {
  headers = {
    ...headers,

    authorization: `token ${options.token}`,
    accept: `application/vnd.github.v3+json`,

    'user-agent': GIT_API_USER_AGENT_HEADER
  }

  try {
    const result = await get({
      ...props, url, headers, responseHandler: simpleHandler
    })

    return JSON.parse(result)
  } catch (ex) {
    logger.error(ex.message)
  }
}

export const listReposEndpoint = () => requestGitApi({
  url: `${GIT_API_URL}/orgs/${options.organization}/repos`
})

export const buildSshLink = ({
  user, project
}) => `git@github.com:${user}/${project}.git`

export const toAlias = (project = '') => {
  if (project.startsWith(PPP_PROJECT_PREFIX)) {
    return project.replace(PPP_PROJECT_PREFIX, PPP_ALIAS_PREFIX)
  }

  if (project.startsWith(PP_PROJECT_PREFIX) && !project.endsWith('platform-ee')) {
    return project.replace(PP_PROJECT_PREFIX, PP_ALIAS_PREFIX)
  }

  if (project.startsWith(P_PROJECT_PREFIX)) {
    return project.replace(P_PROJECT_PREFIX, P_ALIAS_PREFIX)
  }

  return project
}

export const toProject = (alias = '') => {
  if (alias.startsWith(PPP_ALIAS_PREFIX)) {
    return alias.replace(PPP_ALIAS_PREFIX, PPP_PROJECT_PREFIX)
  }

  if (alias.startsWith(PP_ALIAS_PREFIX)) {
    return alias.replace(PP_ALIAS_PREFIX, PP_PROJECT_PREFIX)
  }

  if (alias.startsWith(P_ALIAS_PREFIX)) {
    return alias.replace(P_ALIAS_PREFIX, P_PROJECT_PREFIX)
  }

  return alias
}

export default {
  listReposEndpoint,
  buildSshLink,
  toAlias,
  toProject
}
