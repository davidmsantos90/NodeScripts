#! /usr/bin/env node

const shell = require("shelljs");

shell.exec("ant clean resolve resolve-js package publish-local js.install-nojar");
