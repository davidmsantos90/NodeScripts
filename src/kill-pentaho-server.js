#! /usr/bin/env node

import { exec, echo } from 'shelljs'
const silent = true

exec('ps T', { silent }, (code, output) => {
  const [/* ignore first element */, ...lines] = output.split('\n')

  const [ java_PID ] = lines
		.filter(info => info.includes('java'))
		.map(java => java.trim())
		.map(trimmed => trimmed.split(/\s+/).shift())

  if (java_PID != null) {
    echo(`Kill pentaho-server process: #${java_PID}`)
    exec(`kill -9 ${java_PID}`)
  } else {
    echo(`No pentaho-server process to kill`)
  }
})
