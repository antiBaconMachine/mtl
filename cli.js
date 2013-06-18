#! /usr/bin/env node
var cmd = "./mtl-" + (process.argv[2] || "move");
try {
    require(cmd);
} catch (e) {
    console.error("could not complete command %s",cmd);
    throw e;
}
