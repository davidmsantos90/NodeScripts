import { mkdir, mv, echo } from 'shelljs'
import { existsSync } from 'fs'
import { join, parse } from 'path'

const mapToPath = (array, path) => array.map((folder) => join(path, folder))

export default function Bundle ({
  id = 'undefined',
  karafPath = '/',
  storePath = '.store',
  folders = []
}) {
  const karafFolders = mapToPath(folders, karafPath)
  const storeFolders = mapToPath(folders, storePath)

  // -----

  Object.assign(this, {
    get id () {
      return id
    },

    get isActive () {
      for (let folder of karafFolders) {
        if (!existsSync(folder)) return false
      }

      return true
    },

    get isStored () {
      for (let folder of storeFolders) {
        if (!existsSync(folder)) return false
      }

      return true
    },

    __move (origin = [], destination = []) {
      // assert arrays with same length

      for (let index = 0, L = origin.length; index < L; index++) {
        const { [index]: originFolder } = origin
        const { [index]: destinationFolder } = destination

        // console.log('From:', originFolder)
        // console.log('To:', destinationFolder)
        const { dir: parentFolder } = parse(destinationFolder)

        mkdir('-p', parentFolder)
        mv(originFolder, parentFolder)
      }
    },

    activate () {
      this.__move(storeFolders, karafFolders)

      echo(`[INFO]  - '${this.id}' was activated!`)
    },

    store () {
      this.__move(karafFolders, storeFolders)

      echo(`[INFO]  - '${this.id}' was stored!`)
    }
  })
}
