#! /usr/bin/env node

import { echo } from 'shelljs'

import { serverDownload, serverExtract } from './executions'
import { options, help } from './arguments'

// ---

if (options.help) {
  echo(help)
} else {
  if (options.path == null) {
    echo(`[WARNING] Define 'path' in the './local.config.json' or by using the '-p' option!`)
  } else {
    serverDownload()
      .then(() => serverExtract())
      .catch((error) => echo(error))
  }
}
