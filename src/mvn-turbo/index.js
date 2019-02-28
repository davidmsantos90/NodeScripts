#! /usr/bin/env node

import { exec } from 'shelljs'

const SKIP_TESTS = '-DskipTests=true'
const SKIP_OPTIMIZE = '-Drequirejs.optimize.skip=true'

const [,, ...args] = process.argv

const mvnOptions = [...args, SKIP_TESTS, SKIP_OPTIMIZE]

exec(`mvn clean install ${mvnOptions.join(' ')}`)
