import { bold, italic } from 'chalk'
import { dirname } from 'path'

import generic from '../../helpers/generic'
import terminal from '../../helpers/visual/terminal'

import zip from '../../helpers/zip'

const extract = async ({
  id,
  isPlugin,
  extractSource: source,
  extractOutput: destination
}, options) => {
  let error = null

  try {
    const isExtracted = await generic.exists(destination)
    if (isExtracted) {
      terminal.warn(` - ${id}.zip already extracted!`)
    } else {
      if (isPlugin) destination = dirname(destination)

      await zip.extract({ id, source, destination, ...options })
    }
  } catch (ex) {
    error = ex
  }

  return { error }
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    const { version, type, _build } = options

    terminal.log()
    terminal.info(bold(`2. Extracting to ${italic('.../' + type + '/' + version + '/' + _build)}`))

    await executeAll({
      builds, action: (artifact) => extract(artifact, options) // .catch((ex) => (error = ex))
    })
  } catch (ex) {
    error = ex
  }

  return { error }
}

const executeAll = async ({
  builds = [], action = () => {}
}) => {
  const results = await Promise.all(builds.map(action))

  for (let { error } of results) {
    if (error != null) throw error
  }
}
