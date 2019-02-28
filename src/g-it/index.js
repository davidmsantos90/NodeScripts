#! /usr/bin/env node

// import { echo } from 'shelljs'

import gitUtils from './util/index'
import { listAllRepositories } from './commands'

listAllRepositories().then(gitUtils.printRepositories)
