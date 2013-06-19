var mtl = require("./mtl");
var _ = require("underscore");
var fs = require("fs");
var path = require("path");

var argv = require("optimist").
        usage("Locate or create target folder for a file Usage: mtl target -s=filename -d=path/to/destination/folder ").
        options({
    'd': {
        alias: 'destination',
        demand: true,
        describe: "Library directory"
    },
    'f': {
        alias: 'default',
        describe: "Default destination if no target could be found"
    },
    's': {
        alias: "source",
        demand: true,
        describe: "Source filename"
    }
}).
        argv;

var source = argv.source;
var dest = argv.destination;
var ops = mtl.getOps(source, dest);
//console.info("video array: %j",vids);
var outp = path.dirName(source);
if (!_.isEmpty(ops.move)) {
    outp = mtl.doMoves(path.dirname(source), dest, ops.move)[0];
}
console.log(outp);