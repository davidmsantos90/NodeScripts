import { echo, rm } from 'shelljs'
import { join } from 'path'

import { options } from './arguments'

import utils from './utils'
import { download, extract } from './commands'

const setupUtils = utils(options)

const newline = () => echo('')

export const pdiDownload = () => {
  const downloadPdi = () => download({
    link: setupUtils.pdiDownloadLink,
    destination: setupUtils.pdiDownloadLocation
  })

  return Promise.all([
    downloadPdi()
  ]).then(() => newline())
}

export const serverDownload = () => {
  const downloadServer = () => download({
    link: setupUtils.serverDownloadLink,
    destination: setupUtils.serverDownloadLocation
  })

  const downloadAnalyzer = () => download({
    link: setupUtils.analyzerDownloadLink,
    destination: setupUtils.analyzerDownloadLocation
  })

  return Promise.all([
    downloadServer(),
    downloadAnalyzer()
  ]).then(() => newline())
}

export const pdiExtract = () => {
  const extractPdi = () => extract({
    source: setupUtils.pdiDownloadLocation,
    destination: setupUtils.pdiExtractLocation
  })

  return Promise.all([
    extractPdi()
  ]).then(() => {
    newline()

    echo(`[INFO] Cleaning up '${ setupUtils.pdiExtractLocation }' folder.`)
    // enable debug, ssh, karaf config? to user local maven repo, more...

  }).then(() => newline())
}

export const serverExtract = () => {
  const extractServer = () => extract({
    source: setupUtils.serverDownloadLocation,
    destination: setupUtils.serverExtractLocation
  })

  const extractAnalyzer = () => extract({
    source: setupUtils.analyzerDownloadLocation,
    destination: setupUtils.serverPluginExtractLocation,
    pluginName: 'analyzer'
  })

  return Promise.all([
    extractServer(),
    extractAnalyzer()
  ]).then(() => {
    newline()

    echo(`[INFO] Cleaning up '${ setupUtils.serverExtractLocation }' folder.`)

    rm('-f', join(setupUtils.serverExtractLocation, 'pentaho-server', 'promptuser.*'))
    // enable marketplace and ssh (need to download an extra dependency, check iwiki)

  }).then(() => newline())
}
