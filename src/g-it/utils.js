const GitUtils = () => {
  const GIT_API = 'https://api.github.com/'
  const TOKEN = '35b3bd4bca424a1c601c32cb2883d721285f9c36'

  const _buildGitApiCurlRequest = (endpoint, params = '') => {
    const authenticationHeader = `-H 'Authorization: token ${ TOKEN }'`
    const requestParams = `?per_page=100${ params != '' ? '&' + params : '' }`

    return `curl ${ authenticationHeader } '${ GIT_API + endpoint + requestParams }'`
  }

  const _lessThanFilter = (months) => {
    return ({ name, updatedAt }) => {
      const lastUpdateDate = new Date(updatedAt)
      const currentDate = new Date()

      const yearGap = currentDate.getFullYear() - lastUpdateDate.getFullYear()
      const monthGap = currentDate.getMonth() - lastUpdateDate.getMonth()

      const monthsSinceLastUpdate = monthGap + 12*yearGap

      return monthsSinceLastUpdate < months
    }
  }

  const _sortRepositoryByName = (repo1, repo2) => {
    const name1 = repo1.name.toLowerCase()
    const name2 = repo2.name.toLowerCase()

    return name1 < name2 ? -1 : name1 > name2 ? 1 : 0
  }

  return {
    listPublicRepositories(organization = 'pentaho') {
      const endpoint = `orgs/${ organization }/repos`

      return _buildGitApiCurlRequest(endpoint, 'type=public')
    },

    listPrivateRepositories(organization = 'pentaho') {
      const endpoint = `orgs/${ organization }/repos`

      return _buildGitApiCurlRequest(endpoint, 'type=private')
    },

    printRepositories(repositories) {
      const filteredRepositories = repositories
        .filter(_lessThanFilter(12))
        .filter(({ isFork, isArchived }) => !isFork && !isArchived)
        .sort(_sortRepositoryByName)

      const count = filteredRepositories.length

      console.log('')
      console.log(`+--------------+----------------------+------------------------------`)
      console.log(`|              |     Organization     |     Repository               `)
      console.log(`+--------------+----------------------+------------------------------`)

      for(let index = 0; index < count; index++) {
        const { name, fullName, isPrivate } = filteredRepositories[index]

        const [ organization, repo ] = fullName.split('/')
        const isPentaho = organization === 'pentaho'

        var customRepoName = repo
          .replace(/^pentaho-platform-plugin-/, 'ppp-')
          .replace(/^pentaho-platform-(?!ee)/, 'pp-')
          .replace(/^pentaho-/, 'p-')

        console.log(`|${ isPrivate ? '  Private' : '  Public ' }     |       ${ isPentaho ? 'Pentaho   ' : 'Webdetails' }     |  ${ customRepoName }`)
      }

      console.log(`+--------------+----------------------+------------------------------`)

      console.log(`\n> Found ${ count } Repositories in Total <`)
    }
  }
}

export default GitUtils()
