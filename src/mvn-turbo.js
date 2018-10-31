#! /usr/bin/env node

import { exec } from 'shelljs'

const [/*first*/, /*second*/, ...args] = process.argv

exec(`mvn ${args.join(' ')} -DskipTests=true -Drequirejs.optimize.skip=true clean install`)
