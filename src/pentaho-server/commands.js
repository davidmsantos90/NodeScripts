import { echo, rm } from 'shelljs'

import { access, watch, constants } from 'fs'

import generic from '../helpers/generic'
import pentahoServerUtils from './util/index'

const CLEAN_KARAF_CMD = `clean-karaf -r ./pentaho-solutions/`

const PENTAHO_START_SH = `start-pentaho-debug.sh`
const CATALINA_LOG = 'tomcat/logs/catalina.out'

const STATUS_ON = 'online'
const STATUS_OFF = 'offline'

export default {
  start () {
    return _serverStatus()
      .then(({ status, pid }) => {
        const isOnlineStatus = status === STATUS_ON
        if (isOnlineStatus) {
          return `[WARNING] Pentaho Server already running!  PID: ${pid}`
        }

        rm('-f', 'promptuser.*')

        return generic.execP(CLEAN_KARAF_CMD, { silent: false })
          .then(() => generic.execP(`./${PENTAHO_START_SH}`))
          .then(() => {
            if (pentahoServerUtils.isTailMode) {
              return _tail()
            }

            return '[INFO] Pentaho Server is starting...'
          })
      })
      .then((message) => echo(message))
  },

  stop () {
    return _serverStatus()
      .then(({ status, pid }) => {
        const isOfflineStatus = status === STATUS_OFF
        if (isOfflineStatus) {
          return `[WARNING] No Pentaho Server process to shutdown!`
        }

        return generic.execP(`kill -9 ${pid}`, { silent: false })
          .then(() => `[INFO] Force shutdown of Pentaho Server. PID: ${pid}`)
      })
      .then((message) => echo(message))
  },

  restart () {
    return this.stop()
      .then(() => __wait())
      .then(() => this.start())
  }
}

// --- Private ---

const _serverStatus = () => {
  return __pentahoServerPID().then((pid) => {
    return {
      status: pid != null ? STATUS_ON : STATUS_OFF,
      pid
    }
  })
}

const _tail = (filename = CATALINA_LOG) => {
  return __waitForFile(filename).then(() => generic.execP(`tail -f ${filename}`, { silent: false }))
}

const __pentahoServerPID = () => {
  return generic.execP('ps T').then((output) => {
    const [, ...lines] = output.split('\n')

    const [javaPId] = lines
      .filter(info => info.includes('java'))
      .map(java => java.trim())
      .map(trimmed => trimmed.split(/\s+/).shift())

    return javaPId
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
      watcher.close()
      reject(new Error('File did not exists and was not created during the timeout.'))
    }, timeout)

    access(filename, constants.R_OK, (error) => {
      if (!error) {
        clearTimeout(timer)
        watcher.close()
        resolve()
      }
    })
  })
}
