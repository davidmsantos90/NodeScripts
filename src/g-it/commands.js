import generic from '../helpers/generic'
import gitUtils from './util/index'

// Pentaho Millennuium Falcon - 1858852

// List org teams - https://api.github.com/orgs/pentaho/teams

// List team members - https://api.github.com/teams/1858852/members

export { listAllRepositories }

// List org repos - https://api.github.com/orgs/pentaho/repos
const listAllRepositories = () => {
  const repositories = []

  const _parseRepositories = (url) => generic.execP(url).then((output) => {
    const repos = JSON.parse(output)

    for (let index = 0, R = repos.length; index < R; index++) {
      const {
        id, name, full_name: fullName,
        fork: isFork, archived: isArchived, private: isPrivate,
        url: apiUrl, ssh_url: sshUrl, updated_at: updatedAt,
        owner: { id: organizationID, login: organizationName, url: organizationApiUrl }
      } = repos[index]

      repositories.push({
        id, name, fullName, isFork, isPrivate, isArchived,
        updatedAt, apiUrl, sshUrl,
        organizationID, organizationName, organizationApiUrl
      })
    }
  })

  return Promise.all([
    _parseRepositories(gitUtils.listPublicRepositories('pentaho')),
    _parseRepositories(gitUtils.listPublicRepositories('webdetails')),
    _parseRepositories(gitUtils.listPrivateRepositories('pentaho')),
    _parseRepositories(gitUtils.listPrivateRepositories('webdetails'))
  ]).then(() => repositories)
}
