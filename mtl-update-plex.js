var mtl = require("./mtl");

var argv = require("optimist").
    usage("Issue http request to Plex instance to update library \n\ Usage: mtl update-plex -h=url").
    options({
        'host': {
            alias: 'h',
            describe: 'url of Plex remote interface to trigger update of all show libraries.',
            demand: true
        }
    }).argv;
mtl.refreshPlex(argv.host, process.exit);