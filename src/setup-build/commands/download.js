import { bold, italic } from 'chalk'
import { parse } from 'path'

import terminal from '../../helpers/visual/terminal'

import shell from '../../helpers/shell'
import generic from '../../helpers/generic'
import { get, progressBarHandler } from '../../helpers/request'

import { isLatestBuild } from '../util/index'

const downloadFailure = (destination) => (error) => {
  shell.rm(`-rf ${destination}`)

  // TODO log error?

  return error
}

const download = async ({
  downloadURL: url,
  downloadOutput: destination
}, options) => {
  let result = null
  let error = null

  try {
    const isDownloaded = await generic.exists(destination)
    if (isDownloaded) {
      const { base: file } = parse(destination)

      terminal.warn(`${file} already downloaded!`)
    } else {
      const { type } = options

      result = await get({
        url,
        destination,

        headers: {
          'accept-encoding': 'gzip,deflate'
        },

        responseHandler: progressBarHandler,
        failure: downloadFailure(destination),
        validate: (date) => type !== 'snapshot' || isLatestBuild(date)
      })
    }
  } catch (ex) {
    error = ex
  }

  return { result, error }
}

export default async ({ builds = [], ...options }) => {
  let error = null

  try {
    const { version, type, _build } = options

    terminal.info(bold(`1. Downloading to ${italic('.../' + type + '/' + version + '/' + _build)}`))

    await executeAll({
      builds, action: (artifact) => download(artifact, options) // .catch((ex) => (error = ex))
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
