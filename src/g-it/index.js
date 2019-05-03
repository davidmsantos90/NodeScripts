#! /usr/bin/env node

import gitUtils from './util/index'
import { listAllRepositories } from './commands'

listAllRepositories().then(gitUtils.printRepositories)
