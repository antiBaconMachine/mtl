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
var vid = path.basename(source);
var vids = mtl.identifyVideos(vid);
//console.info("video array: %j",vids);
var outp = argv["default"];
if (vids) {
    var ops = mtl.identifyDestinations(vids, mtl.getDirs(dest));
    //console.info("target ops : %j",ops);
    var obj, create;
    if (!_.isEmpty(ops.create)) {
        obj = ops.create;
        create = true;
    } else if (!_.isEmpty(ops.move)) {
        obj = ops.move;
        create = false;
    }
    outp = move(source, vid, dest, _.keys(obj)[0], create);
}
console.log(outp);

function move(sourceFile, baseName, destPath, destName, booCreate) {
    var outp = path.join(destPath, destName);
    if (booCreate) {
        fs.mkdirSync(outp);
    }
    //console.log("moving from %s to %s",source, path.join(outp,baseName));
    fs.renameSync(source, path.join(outp,baseName));
    return outp;
} 

