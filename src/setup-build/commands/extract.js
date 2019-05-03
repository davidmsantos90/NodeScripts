import { underline, reset, bold } from 'chalk'
import { parse } from 'path'

import generic from '../../helpers/generic'
import logger from '../../helpers/logger'

import zip from '../../helpers/zip'

const extract = async ({ extractSource: source, extractOutput: destination }, options) => {
  const isExtracted = await generic.exists(destination)
  if (isExtracted) {
    const { base: zipFile } = parse(source)

    return logger.warn(` > ${zipFile} already extracted!`)
  }

  return zip.extract({ source, destination, ...options })
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    const { version, type, _build } = options

    logger.log()
    logger.info(underline(`1. Extracting to ->`) + reset() + bold(` .../${type}/${version}/${_build}/`))

    await Promise.all(builds.map((artifact) => {
      return extract(artifact, options).catch((ex) => (error = ex))
    }))
  } catch (ex) {
    error = ex
  }

  return { error }
}
