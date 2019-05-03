import { underline, reset, bold } from 'chalk'
import { parse } from 'path'

import generic from '../../helpers/generic'
import logger from '../../helpers/logger'
import request from '../../helpers/request'

import { isLatestBuild } from '../util/index'

const download = async ({ downloadURL: url, downloadOutput: destination }, options) => {
  const isDownloaded = await generic.exists(destination)
  if (isDownloaded) {
    const { base: file } = parse(destination)

    return logger.warn(` > ${file} already downloaded!`)
  }

  const responseSuccessCheck = (date) => options.type !== 'snapshot' || isLatestBuild(date)

  return request.get({ url, destination, responseSuccessCheck })
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    const { version, type, _build } = options

    logger.info(underline(`1. Downloading to ->`) + reset() + bold(` .../downloads/${type}/${version}/${_build}/`))

    await Promise.all(builds.map((artifact) => {
      return download(artifact, options).catch((ex) => (error = ex))
    }))
  } catch (ex) {
    error = ex
  }

  return { error }
}
