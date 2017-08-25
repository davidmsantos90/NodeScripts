#! /usr/bin/env node

const shell = require("shelljs");

shell.exec("echo \n")
shell.exec("clean-karaf -r ./pentaho-solutions/")

shell.exec("rm -f promptuser.sh")
shell.exec("rm -f promptuser.js")

shell.exec("echo \n")
shell.exec("kill-pentaho-server")

shell.exec("echo \n")
shell.exec("./start-pentaho-debug.sh")

shell.exec("echo \n")

//shell.exec("read -rp $'Press any key to continue...\n' -n1 key")
