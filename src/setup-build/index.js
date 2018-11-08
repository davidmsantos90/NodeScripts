#! /usr/bin/env node

import { echo } from 'shelljs'

import { options, help } from './arguments'

import {
  serverDownload, serverExtract,
  pdiDownload, pdiExtract
} from './executions'


// ---

if (options.help) {
  echo(help)
} else if (options.path == null) {
  echo(`[WARNING] Define 'path' in the './local.config.json' or by using the '-p' option!`)
} else {
  if (options.execution === 'server') serverDownload().then(() => serverExtract())

  if (options.execution === 'pdi' ) pdiDownload().then(() => pdiExtract())
}
