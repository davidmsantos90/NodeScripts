import '@babel/polyfill'

import npmUnzip from 'decompress'

// import ProgressBar from './visual/ProgressBar'
import terminal from './visual/terminal'

import shell from './shell'

// const zipSize = async (source) => {
//   const stat = await generic.stat(source)
//
//   // console.log(stat)
//
//   return stat.size
// }

const extractImpl = async ({ source, destination }) => {
  const unzipInstalled = await shell.which('unzip') != null
  if (unzipInstalled) {
    await shell.mkdir(`-p ${destination}`)

    return shell.spawn(`unzip -q ${source} -d ${destination}`, { silent: true })
  }

  return npmUnzip(source, destination).then(() => undefined)
}

export default {
  async extract ({ id, source, destination }) {
    const extractElement = terminal.__log({
      id: `extract_${id}`, type: 'info', message: ` - ${id}`
    })

    let error = null

    try {
      // const total = await zipSize(source)
      // await shell.mkdir(`-p ${destination}`)
      // const progressBar = new ProgressBar({ id, total })
      // watch(destination, { recursive: true }, () => {
      //   zipSize(destination).then((size) => progressBar.update({ total: size }))
      // })

      await extractImpl({ source, destination })

      extractElement.end()
    } catch (ex) {
      await shell.rm(`-rf ${destination}`)

      error = extractElement.reject({ error: ex })
    }

    return { error }
  }
}
