var mtl = require("./mtl");

var argv = require("optimist").
        usage("Issue commands to xbmc instance, for the moment just supports update library \n\ Usage: mtl xbmc update -options -h=url").
        options({
    'h': {
        alias: 'host',
        describe: 'url of xbmc remote interface to tirgger update of lib',
        demand: true
    }
}).argv;

var cmd = (argv._[1]).toUpperCase();
switch (cmd) {
    case "UPDATE" :
        mtl.refreshXBMC(argv.x, process.exit);
        break;
    default :
        console.warn("unreconised command %s", cmd);
        process.exit();
}