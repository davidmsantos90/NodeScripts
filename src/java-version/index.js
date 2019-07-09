#! /usr/bin/env node

import shell from '../helpers/shell'
import logger from '../helpers/logger'

shell.exec('java -version 2>&1').then((output) => {
  const isOpenJDK = output.includes('OpenJDK')

  const [versionLine] = output.split('\n')
  const [,, javaVersion] = versionLine.split(' ')

  if (isOpenJDK) {
    logger.info(`You are using OpenJDK. Version: ${javaVersion}`)
  } else {
    logger.info(`You are using OracleJDK. Version: ${javaVersion}`)
  }
}).catch((error) => {
  logger.error(error)
})
