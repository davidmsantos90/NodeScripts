import '@babel/polyfill'

import npmUnzip from 'decompress'
import { rm, mkdir, which } from 'shelljs'

import { parse } from 'path'

import Element from './Element'
import generic from './generic'

const extractImpl = ({ source, destination }) => {
  const unzipInstalled = which('unzip') != null
  if (unzipInstalled) {
    mkdir('-p', destination)

    const command = `unzip -q ${source} -d ${destination}`

    return generic.execP(command)
  }

  return npmUnzip(source, destination).then(() => undefined)
}

const createExtractElement = ({ zipFile }) => new Element({ id: `extract_${zipFile}` })

export default {
  extract ({ source, destination, output }) {
    const { base: zipFile } = parse(source)
    const extractElement = createExtractElement({ zipFile })

    extractElement.update({ message: ` > ${zipFile} to ${destination}/`, type: 'info' })

    return extractImpl({ source, destination })
      .then(() => extractElement.end())
      .catch(() => {
        const error = extractElement.reject()

        rm('-rf', output)

        return error
      })
  }
}
