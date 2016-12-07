#! /usr/bin/env node

const shell = require("shelljs");
const args = process.argv.slice(2);

shell.exec(`mvn ${args.join(' ')} -DskipTests=true -Drequirejs.optimize.skip=true clean install`)
