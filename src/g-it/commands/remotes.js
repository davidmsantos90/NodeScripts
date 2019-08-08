import { basename } from 'path'

import logger from '../../helpers/logger'
import shell from '../../helpers/shell'

import {
  toProject,
  buildSshLink,
  options
} from '../util/index'

export const remotes = async () => {
  const { members = [] } = options

  const project = toProject(basename(process.env.PWD))

  const remotes = members.map(({ name, user }) => {
    const remote = buildSshLink({ user, project })

    return { name, remote }
  })

  for (let { name, remote } of remotes) {
    try {
      await shell.spawn(`git remote add ${name} ${remote}`, { silent: true })
    } catch (ex) {
      logger.error(ex.message)
    }
  }
}

export default remotes
