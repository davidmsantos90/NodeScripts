#! /usr/bin/env node

import { exec, echo, rm } from 'shelljs'

echo('\n')

exec('clean-karaf -r ./pentaho-solutions/')

// rm('-f', 'promptuser.*')

echo('\n')

exec('kill-pentaho-server')

echo('\n')

exec('./start-pentaho-debug.sh')

echo('\n')

// shell.exec("read -rp $'Press any key to continue...\n' -n1 key")
