#! /usr/bin/env node

import { exec, echo, rm } from 'shelljs'

const __promiseExec = (command, settings) => new Promise((resolve, reject) => {
  exec(command, settings, (code/*, output, error*/) => {
    const isErrorCode = code !== 0

    return isErrorCode ? reject() : resolve()
  })
})

Promise.all([
  __promiseExec('clean-karaf -p ./pentaho-solutions/'),
  __promiseExec('kill-pentaho-server')
])
.then(() => rm('-f', 'promptuser.*'))
.then(() => setTimeout(() => {
  __promiseExec('./start-pentaho-debug.sh', { silent: true })
     .then(() => echo('[INFO] Pentaho Server is starting...'))
}, 500))
// .then(() => exec('multitail -cSI apache tomcat/logs/catalina.out'))
