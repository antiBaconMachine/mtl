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
var vids = mtl.identifyVideos([path.basename(source)]);
//console.info("video array: %j",vids);
var outp = argv["default"];
if (vids) {
    var ops = mtl.identifyDestinations(vids, mtl.getDirs(dest));
    //console.info("target ops : %j",ops);
    if (!_.isEmpty(ops.create)) {
        outp = path.join(dest, _.keys(ops.create)[0]);
        fs.mkdirSync(outp);
    } else if (!_.isEmpty(ops.move)) {
        outp = path.join(dest, _.keys(ops.move)[0]);
    }
}
console.log(outp);

