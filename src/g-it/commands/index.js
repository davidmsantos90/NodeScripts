import logger from '../../helpers/logger'

import {
  options
} from '../util/index'

import { clone, cloneAll } from './clone'
import remotes from './remotes'

export const execute = async () => {
  try {
    const { command, organization, project } = options
    switch (command) {
      case 'clone':
        return await clone().then((folder) => logger.done(`Cloned ${project} to ${folder}`))
      case 'clone-all':
        return await cloneAll().then(() => logger.done(`Cloned all ${organization}'s repositories'`))
      case 'remotes':
        return await remotes().then(() => logger.done(`Remotes updated`))
      default:
        throw new Error('Invalid command!')
    }
  } catch (ex) {
    logger.error(ex.message)
  }
}

export default {
  execute, clone, cloneAll, remotes
}
