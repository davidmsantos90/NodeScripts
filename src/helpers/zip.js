import '@babel/polyfill'

import npmUnzip from 'decompress'
import { which } from 'shelljs'

import { parse } from 'path'

import Element from './Element'
import generic from './generic'
import shell from './shell'

const extractImpl = ({ source, destination }) => {
  const unzipInstalled = which('unzip') != null
  if (unzipInstalled) {
    shell.mkdir(`-p ${destination}`)

    return generic.execP(`unzip -q ${source} -d ${destination}`)
  }

  return npmUnzip(source, destination).then(() => undefined)
}

const createExtractElement = ({ zipFile }) => new Element({ id: `extract_${zipFile}` })

export default {
  extract ({ source, destination }) {
    const { base: zipFile } = parse(source)

    const extractElement = createExtractElement({ zipFile })
    extractElement.update({ message: ` > ${zipFile}`, type: 'info' })

    return extractImpl({ source, destination })
      .then(() => extractElement.end())
      .catch((error) => {
        shell.rm(`-rf ${destination}`)

        return extractElement.reject({ error })
      })
  }
}
