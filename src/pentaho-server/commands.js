
import { exec, echo, rm } from 'shelljs'
import { access, watch, constants } from 'fs'

import pentahoServerUtils from './utils'

const CATALINA_LOG = 'tomcat/logs/catalina.out'
const START_SCRIPT = 'start-pentaho-server.sh'

const STATUS_ON = 'online'
const STATUS_OFF = 'offline'

const silentExec = { silent: true }

const __promiseExec = (command, settings) => new Promise((resolve, reject) => {
  exec(command, settings, (code, output, error) => {
    const isErrorCode = code !== 0

    return isErrorCode ? reject(error) : resolve(output)
  })
})

export { start, stop, restart }

const start = () => {
  return _serverStatus()
    .then(({ status, pid }) => {
      const isOnlineStatus = status === STATUS_ON
      if (isOnlineStatus) {
        return `[WARNING] Pentaho Server already running!  PID: ${ pid }`
      }

      rm('-f', 'promptuser.*')

      return __promiseExec('clean-karaf -r ./pentaho-solutions/')
        .then(() => __promiseExec('./start-pentaho-debug.sh', silentExec))
        .then(() => {
          if (pentahoServerUtils.isTailMode) {
            return _tail()
          }

          return '[INFO] Pentaho Server is starting...'
        })
    })
    .then((message) => echo(message))
}

const stop = () => {
  return _serverStatus()
    .then(({ status, pid }) => {
      const isOfflineStatus = status === STATUS_OFF
      if (isOfflineStatus) {
        return `[WARNING] No Pentaho Server process to shutdown!`
      }

      return __promiseExec(`kill -9 ${ pid }`)
        .then(() => `[INFO] Force shutdown of Pentaho Server. PID: ${ pid }`)
    })
    .then((message) => echo(message))
}

const restart = () => {
  return stop().then(() => __wait()).then(() => start())
}

const _serverStatus = () => {
  return __pentahoServerPID().then((pid) => {
    return {
      status: pid != null ? STATUS_ON : STATUS_OFF,
      pid
    }
  })
}

const _tail = (filename  = CATALINA_LOG) => {
  return __waitForFile(filename).then(() => __promiseExec(`tail -f ${ filename }`))
}

const __pentahoServerPID = () => {
  return __promiseExec('ps T', silentExec).then((output) => {
    const [/* ignore first element */, ...lines] = output.split('\n')

    const [ java_PID ] = lines
  		.filter(info => info.includes('java'))
  		.map(java => java.trim())
  		.map(trimmed => trimmed.split(/\s+/).shift())

    return java_PID
  })
}

const __wait = (timeout = 500) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(), timeout)
})

const __waitForFile = (filename, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const watcher = watch(filename, (eventType, target) => {
      if (eventType === 'rename' && filename === target) {
        clearTimeout(timer)
        watcher.close()
        resolve()
      }
    })

    const timer = setTimeout(() => {
      watcher.close();
      reject(new Error('File did not exists and was not created during the timeout.'));
    }, timeout);

    access(filename, constants.R_OK, (error) => {
      if (!error) {
        clearTimeout(timer)
        watcher.close()
        resolve()
      }
    })
  })
}
