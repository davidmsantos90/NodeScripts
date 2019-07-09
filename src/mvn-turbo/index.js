#! /usr/bin/env node

import shell from '../helpers/shell'

const SKIP_TESTS = '-DskipTests=true'
const SKIP_OPTIMIZE = '-Drequirejs.optimize.skip=true'

const [,, ...args] = process.argv

const mvnOptions = [...args, SKIP_TESTS, SKIP_OPTIMIZE]

shell.spawn(`mvn clean install ${mvnOptions.join(' ')}`).then(() => undefined).catch(() => undefined)
