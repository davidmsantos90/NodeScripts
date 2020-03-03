// import '@babel/polyfill'

import { dirname } from 'path'
import npmUnzip from 'decompress'

import shell from 'node-shell'
import { IAction } from 'scripts-api'

export default class Extract extends IAction {
  static _type () {
    return 'extract'
  }

  constructor (target, controller) {
    super({ target, controller, type: Extract._type() })
  }

  async act () {
    const { id, extractOutput } = this.target

    try {
      const isExtracted = await this.__controller.exists(extractOutput)
      if (isExtracted) {
        return this.__cancel(`${id}.zip already extracted!`)
      }

      const result = await this.__extract()

      return this.__done({ result })
    } catch (exception) {
      await shell.rm(`-rf ${extractOutput}`)

      return { error: this.__error(exception.message) }
    }
  }

  __extract () {
    const { id, isPlugin, downloadOutput: source, extractOutput } = this.target

    // const total = await zipSize(source)
    // await shell.mkdir(`-p ${destination}`)
    // const progressBar = new ProgressBar({ id, total })
    // watch(destination, { recursive: true }, () => {
    //   zipSize(destination).then((size) => progressBar.update({ total: size }))
    // })

    this.component.init({ text: ` - ${id}` })

    return extract({
      source, destination: isPlugin ? dirname(extractOutput) : extractOutput
    })
  }
}

/** @private */
const extract = async ({ source, destination }) => {
  const unzipInstalled = await shell.which('unzip') != null
  if (unzipInstalled) {
    await shell.mkdir(`-p ${destination}`)

    return shell.spawn(`unzip -q ${source} -d ${destination}`, { silent: true })
  }

  return npmUnzip(source, destination).then(() => undefined)
}
