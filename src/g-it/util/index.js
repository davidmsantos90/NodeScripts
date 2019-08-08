import { get } from '../../helpers/request'
import logger from '../../helpers/logger'

import args from './arguments'

const PPP_PROJECT_PREFIX = 'pentaho-platform-plugin-'
const PPP_ALIAS_PREFIX = 'ppp-'

const PP_PROJECT_PREFIX = 'pentaho-platform-'
const PP_ALIAS_PREFIX = 'pp-'

const P_PROJECT_PREFIX = 'pentaho-'
const P_ALIAS_PREFIX = 'p-'

const GIT_API_URL = 'https://api.github.com'
const GIT_API_ACCEPT_HEADER = 'application/vnd.github.v3+json'
const GIT_API_USER_AGENT_HEADER = 'davidmsantos90'

export const options = args.options
export const requestGitApi = async (url, { headers, ...props } = {}) => {
  let result = null

  try {
    result = await get(url, {
      ...props,

      headers: {
        ...headers,

        authorization: `token ${options.token}`,
        accept: GIT_API_ACCEPT_HEADER,

        'user-agent': GIT_API_USER_AGENT_HEADER
      }
    })

    return JSON.parse(result)
  } catch (ex) {
    logger.error(ex.message)
  }

  return result
}

export const listReposEndpoint = () => requestGitApi(`${GIT_API_URL}/orgs/${options.organization}/repos`)

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

export const printRepositories = (repositories) => {
  const filteredRepositories = repositories
    // .filter(({ name, updatedAt }) => {
    //   const months = 12
    //
    //   const lastUpdateDate = new Date(updatedAt)
    //   const currentDate = new Date()
    //
    //   const yearGap = currentDate.getFullYear() - lastUpdateDate.getFullYear()
    //   const monthGap = currentDate.getMonth() - lastUpdateDate.getMonth()
    //
    //   const monthsSinceLastUpdate = monthGap + 12 * yearGap
    //
    //   return monthsSinceLastUpdate < months
    // })
    .filter(({ isFork, isArchived }) => !isFork && !isArchived)
    .sort(({ name: name1 }, { name: name2 }) => {
      name1 = name1.toLowerCase()
      name2 = name2.toLowerCase()

      return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
    })

  const count = filteredRepositories.length

  logger.log('')
  logger.log(`+--------------+----------------------+------------------------------`)
  logger.log(`|              |     Organization     |     Repository               `)
  logger.log(`+--------------+----------------------+------------------------------`)

  for (let index = 0; index < count; index++) {
    const { fullName, isPrivate } = filteredRepositories[index]

    const [ organization, repo ] = fullName.split('/')
    const isPentaho = organization === 'pentaho'

    const alias = toAlias(repo)

    logger.log(`|${isPrivate ? '  Private' : '  Public '}     |       ${isPentaho ? 'Pentaho   ' : 'Webdetails'}     |  ${alias}`)
  }

  logger.log(`+--------------+----------------------+------------------------------`)

  logger.log(`\n> Found ${count} Repositories in Total <`)
}

export default {
  listReposEndpoint,
  printRepositories
}
