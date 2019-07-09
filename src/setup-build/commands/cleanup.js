import { bold, italic } from 'chalk'
import { join } from 'path'

import terminal from '../../helpers/visual/terminal'
import generic from '../../helpers/generic'

// ----- Command -----

const cleanup = async ({ id, extractOutput: source, __cleanups: cleanups = [] }, options) => {
  let error = null

  const isCleanedUp = await generic.exists(join(source, '.clean'))
  if (isCleanedUp) terminal.warn(`${id} already cleaned up!`)

  if (!cleanups.length || isCleanedUp) return { error }

  const cleanupElement = terminal.__log({
    id: `cleanup_${id}`, type: 'info', message: ` - ${id}`
  })

  try {
    await executeAll({
      array: cleanups,
      action: (clean) => clean(source)
    })

    cleanupElement.end()
  } catch (ex) {
    terminal.debug(ex)

    error = cleanupElement.reject({ error: ex })
  }

  return { error }
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    const { version, type, _build } = options

    terminal.log()
    terminal.info(bold(`3. Cleaning up ${italic('.../' + type + '/' + version + '/' + _build)}`))

    await executeAll({
      array: builds, action: (artifact) => cleanup(artifact, options) // .catch((ex) => (error = ex))
    })
  } catch (ex) {
    error = ex
  }

  return { error }
}

const executeAll = async ({
  array = [], action = () => {}
}) => {
  const results = await Promise.all(array.map((target) => action(target)))

  // for (let { error } of results) {
  //   if (error != null) throw error
  // }

  return results
}
