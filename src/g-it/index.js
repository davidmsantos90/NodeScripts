#! /usr/bin/env node

import { echo } from 'shelljs'

import gitUtils from './utils'
import { listAllRepositories } from './commands'

listAllRepositories().then(gitUtils.printRepositories)
