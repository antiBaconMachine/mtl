var mtl = require("./mtl");

var argv = require("optimist").
    usage("Issue jsonrpc commaand to xbmc instance to update library \n\ Usage: mtl update-xbmc -h=url").
    options({
        'host': {
            alias: 'h',
            describe: 'url of xbmc remote interface to trigger update of lib',
            demand: true
        }
    }).argv;
mtl.refreshXBMC(argv.host, process.exit);
process.exit();