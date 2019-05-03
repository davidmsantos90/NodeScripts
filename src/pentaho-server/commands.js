import { access, watch, constants } from 'fs'

import shell from '../helpers/shell'
import generic from '../helpers/generic'
import logger from '../helpers/logger'

import pentahoServerUtils from './util/index'

const CLEAN_KARAF_CMD = `clean-karaf -r ./pentaho-solutions/`

const PENTAHO_START_SH = `start-pentaho-debug.sh`
const CATALINA_LOG = 'tomcat/logs/catalina.out'

const STATUS_ON = 'online'
const STATUS_OFF = 'offline'

// mvn $@ | sed -e "s/\(\[INFO\]\ \-.*\)/${TEXT_BLUE}${BOLD}\1/g" \
//                -e "s/\(\[INFO\]\ \[.*\)/${RESET_FORMATTING}${BOLD}\1${RESET_FORMATTING}/g" \
//                -e "s/\(\[INFO\]\ BUILD SUCCESSFUL\)/${BOLD}${TEXT_GREEN}\1${RESET_FORMATTING}/g" \
//                -e "s/\(\[WARNING\].*\)/${BOLD}${TEXT_YELLOW}\1${RESET_FORMATTING}/g" \
//                -e "s/\(\[ERROR\].*\)/${BOLD}${TEXT_RED}\1${RESET_FORMATTING}/g" \
//                -e "s/Tests run: \([^,]*\), Failures: \([^,]*\), Errors: \([^,]*\), Skipped: \([^,]*\)/${BOLD}${TEXT_GREEN}Tests run: \1${RESET_FORMATTING}, Failures: ${BOLD}${TEXT_RED}\2${RESET_FORMATTING}, Errors: ${BOLD}${TEXT_RED}\3${RESET_FORMATTING}, Skipped: ${BOLD}${TEXT_YELLOW}\4${RESET_FORMATTING}/g"
//
//   # Make sure formatting is reset
//   echo -ne ${RESET_FORMATTING}
// }

export default {
  async start () {
    let error = null

    const { status, pid } = await _serverStatus()

    try {
      const isOnlineStatus = status === STATUS_ON
      if (isOnlineStatus) {
        throw new Error(`Pentaho Server already running!  PID: ${pid}`)
      }

      await shell.rm(`-f promptuser.*`)
      await generic.execP(CLEAN_KARAF_CMD, { silent: false })
      await generic.execP(`./${PENTAHO_START_SH}`)

      if (pentahoServerUtils.isTailMode) {
        return _tail()
      }
    } catch (ex) {
      error = ex
    }

    if (error == null) logger.log(`Pentaho Server is starting... PID: ${pid}`)

    return { error }
  },

  async stop () {
    let error = null

    const { status, pid } = await _serverStatus()

    try {
      const isOfflineStatus = status === STATUS_OFF
      if (isOfflineStatus) {
        throw new Error(`No Pentaho Server process to shutdown!`)
      }

      await generic.execP(`kill -9 ${pid}`, { silent: false })
    } catch (ex) {
      error = ex
    }

    if (error == null) logger.log(`Force shutdown of Pentaho Server. PID: ${pid}`)

    return { error }
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
  return __waitForFile(filename).then(() => {
    shell.tail(`-f ./${filename}`)
  })
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
