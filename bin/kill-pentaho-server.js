#! /usr/bin/env node

const shell = require("shelljs");
const silent = true;

shell.exec("ps T", { silent }, (code, output) => {
	const [/* ignore first element */, ...lines] = output.split("\n");

	const [ java_PID ] = lines
		.filter(info => info.includes("java"))
		.map(java => java.trim())
		.map(trimmed => trimmed.split(/\s+/).shift());

	if(java_PID != null) {
		
		console.log(`Kill pentaho-server process: #${java_PID}`);
		shell.exec(`kill -9 ${java_PID}`);

	} else {

		console.log(`No pentaho-server process to kill`);

	}

});
