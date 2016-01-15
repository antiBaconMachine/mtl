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
        },
        'c': {
            alias: 'create',
            default: false,
            describe: 'Automatically create missing directories'
        }

    }).argv;

var source = argv.source;
var dest = argv.destination;
var ops = mtl.getOps(source, dest);
if (argv.create && !_.isEmpty(ops.create)) {
    fs.mkdirSync(path.resolve(dest, ops.create[0]));
}
var keys = _.keys(ops.move);
if (keys.length) {
    var filePath = path.resolve(dest, keys[0]);
    if (fs.existsSync(filePath)) {
        console.log(filePath);
    }
}