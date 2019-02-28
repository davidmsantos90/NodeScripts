#! /usr/bin/env node

import { exec, echo } from 'shelljs'

exec('java -version 2>&1', { silent: true }, (code, output) => {
  const isErrorCode = code !== 0
  if (isErrorCode) {
    return echo(`[ERROR] ${output}`)
  }

  const isOpenJDK = output.includes('OpenJDK')

  const [versionLine] = output.split('\n')
  const [,, javaVersion] = versionLine.split(' ')

  if (isOpenJDK) {
    echo(`[INFO] You are using OpenJDK. Version: ${javaVersion}`)
  } else {
    echo(`[INFO] You are using OracleJDK. Version: ${javaVersion}`)
  }
})
