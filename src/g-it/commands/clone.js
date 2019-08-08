import { join } from 'path'

import logger from '../../helpers/logger'
import shell from '../../helpers/shell'
import generic from '../../helpers/generic'

import {
  toAlias,
  buildSshLink,
  listReposEndpoint,
  options
} from '../util/index'

export const clone = async () => {
  const { project = '', members = [] } = options

  let origin = ''
  const remotes = members.map(({ name, user }) => {
    const remote = buildSshLink({ user, project })

    if (name === 'origin') origin = remote

    return { name, remote }
  })

  const alias = toAlias(project)

  logger.info(`Clone ${origin} to ${alias}`)
  await shell.spawn(`git clone ${origin} ${alias}`, { silent: true })

  const projectLocation = join(process.env.PWD, alias)
  process.chdir(projectLocation)

  logger.info(`Setup project remotes`)
  for (let { name, remote } of remotes) {
    try {
      await shell.spawn(`git remote add ${name} ${remote}`, { silent: true })
    } catch (ex) {
      logger.error(ex.message)
    }
  }

  return alias
}

export const cloneAll = async () => {
  const organizationFolder = process.env.PWD

  try {
    const repositories = await listReposEndpoint().then((data) => data
      .filter((repo) => !repo.archived)
      .map((repo) => ({ project: repo.name, upstream: repo.ssh_url })))

    for (let { upstream, project } of repositories) {
      const alias = toAlias(project)
      const projectFolder = join(organizationFolder, alias)

      const alreadyCloned = await generic.exists(projectFolder)
      if (!alreadyCloned) {
        const origin = buildSshLink({ user: 'davidmsantos90', project })

        logger.info(`Clone ${upstream} to ${alias}`)
        await shell.spawn(`git clone ${upstream} ${alias}`, { silent: true })

        process.chdir(projectFolder)

        await shell.spawn(`git remote add upstream ${upstream}`, { silent: true })
        await shell.spawn(`git remote set-url origin ${origin}`, { silent: true })

        process.chdir(organizationFolder)
      }
    }
  } catch (ex) {
    logger.error(ex.message)
  }
}

export default clone
