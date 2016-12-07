#! /usr/bin/env node

const shell = require("shelljs");
const path  = require("path");
const fs    = require("fs");

const cache    = "system/karaf/caches";
const common_ui = "system/karaf/system/pentaho/common-ui";
const pCom      = "system/karaf/system/com/pentaho";
const pOrg      = "system/karaf/system/org/pentaho";

const groups = {
	"cache": [
		`${cache}/`
	],

	"common-ui": [
		`${common_ui}/`
	],

	"det-ce": [
		`${pOrg}/pentaho-det-api-core/`,
		`${pOrg}/pentaho-det-impl-core/`
	],

	"det-flat-table": [
		`${pOrg}/pentaho-flat-table-viz-core/`,
		`${pOrg}/pentaho-flat-table-viz-impl/`
	],

	"pentaho-det-data": [
		`${pOrg}/pentaho-det-data-client/`,
		`${pOrg}/pentaho-det-data-impl-client/`
	],

	"pentaho-det-data-access": [
		`${pOrg}/pentaho-det-api-data-access-rest/`,
		`${pOrg}/pentaho-det-api-data-access/`,
		`${pOrg}/pentaho-det-data-access-client/`,
		`${pOrg}/pentaho-det-data-access-server/`,
		`${pOrg}/pentaho-det-impl-data-access-rest/`,
		`${pOrg}/pentaho-det-impl-data-access-client/`,
		`${pOrg}/pentaho-det-impl-data-access-standard-registry/`
	],

	"det-ee": [
		`${pCom}/pentaho-det-ee-api-pdi/`,
		`${pCom}/pentaho-det-ee-impl-pdi/`,
		`${pCom}/pentaho-det-ee-pdi/`
	],

	"pentaho-det-data-access-ee": [
		`${pCom}/pentaho-det-ee-api-data-access-jdbc/`,
		`${pCom}/pentaho-det-ee-impl-data-access-jdbc/`,
		`${pCom}/pentaho-det-ee-data-access-jdbc/`
	]

	// "data-refinery":  "system/karaf/system/pentaho/data-refinery-pdi-plugin",
	// "pivot-table":    "system/karaf/system/pentaho/pentaho-pivot-table*",
	// "dataservice"     "system/karaf/system/pentaho/pdi-dataservice-server-plugin"

}

const args = process.argv.slice(2);
const [ mode = "cache", rootDir = "." ] = args;

// 1. which groups will be deleted
let keys;
switch(mode) {
	case "cache":
		keys = ["cache"]; break;
	case "common-ui":
		keys = ["cache", "common-ui"]; break;
	case "det":
		keys = ["cache", "det-ce", "det-ee", "det-flat-table", "pentaho-det-data", "pentaho-det-data-access", "pentaho-det-data-access-ee"]; break;
	case "det-ce":
		keys = ["cache", "det-ce", "det-flat-table", "pentaho-det-data", "pentaho-det-data-access"]; break;
	case "det-ee":
		keys = ["cache", "det-ee", "pentaho-det-data-access-ee"]; break;
	case "all":
		keys = Object.keys(groups); break;
}

// 2. Get only the ones that exist
let final = [];
keys.map(groupID => {
	const group = groups[groupID];

	group.map(folder => {
		try {
			const completePath = path.join(rootDir, folder);

			const stats = fs.statSync(completePath);
			// if fs.statSync doesn't throw, the folder exists
			final.push(completePath);
		} catch(e) {
			// Does nothing
		}
	});

});

// 3. Check what it has to delete
if(final == null || !final.length) {
	return console.log("### Nothing To Burn ###");
}

console.log("### Burn It With Fire Before It Lay Eggs ###\n");

final.map(folder => {
	console.log(`Burning ${folder} ...`);
	shell.rm("-rf", folder);
});
