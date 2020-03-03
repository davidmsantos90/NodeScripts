import { createWriteStream } from 'fs'
import { join } from 'path'

import Logger from 'node-log'

const logFile = join(__dirname, 'setup.log')

export default new Logger({
  output: createWriteStream(logFile),
  tag: 'time'
})
