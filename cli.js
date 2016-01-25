#! /usr/bin/env node
var AVAILABLE_SCRIPTS = ["move", "update-xbmc", "update-plex", "target"];

var argv = require("optimist").
    usage("mtl cmd").
    options({
        version: {
            alias: 'v'
        }
    }).argv;

if (argv.version) {
    var package = require("./package");
    console.info(package.version);
    process.exit();
}
var script = argv._[0];
if (AVAILABLE_SCRIPTS.indexOf(script) < 0) {
    console.log("Supply a valid command %j", AVAILABLE_SCRIPTS);
    process.exit(1);
}
var cmd = "./mtl-" + script;

try {
    require(cmd);
} catch (e) {
    console.error("could not complete command %s", cmd);
    throw e;
}
