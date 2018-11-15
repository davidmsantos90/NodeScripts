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
    echo(`[INFO] Force shutdown of Pentaho Server process: #${ java_PID }\n`)

    exec(`kill -9 ${ java_PID }`)
  } else {
    echo(`[WARNING] No Pentaho Server process to shutdown!\n`)
  }
})
