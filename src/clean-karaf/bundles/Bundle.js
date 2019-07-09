import { existsSync } from 'fs'
import { join, parse } from 'path'

import shell from '../../helpers/shell'
import logger from '../../helpers/logger'

const mapToPath = (array, path) => array.map((folder) => join(path, folder))

export default class Bundle {
  constructor ({
    id = 'undefined',
    folders = [],

    karafPath = '/',
    storePath = '.store'
  }) {
    this.__id = id

    this.__karafFolders = mapToPath(folders, karafPath)
    this.__storeFolders = mapToPath(folders, storePath)
  }

  get id () {
    return this.__id
  }

  get isActive () {
    for (let folder of this.__karafFolders) {
      if (!existsSync(folder)) return false
    }

    return true
  }

  get isStored () {
    for (let folder of this.__storeFolders) {
      if (!existsSync(folder)) return false
    }

    return true
  }

  async __move (origin = [], destination = []) {
    // assert arrays with same length

    for (let index = 0, L = origin.length; index < L; index++) {
      const { [index]: originFolder } = origin
      const { [index]: destinationFolder } = destination

      const { dir: parentFolder } = parse(destinationFolder)

      await shell.mkdir(`-p ${parentFolder}`).then(() => shell.mv(`${originFolder} ${parentFolder}`))
    }
  }

  async activate () {
    await this.__move(this.__storeFolders, this.__karafFolders)

    logger.info(`- '${this.id}' was activated!`)
  }

  async store () {
    await this.__move(this.__karafFolders, this.__storeFolders)

    logger.info(`- '${this.id}' was stored!`)
  }
}
