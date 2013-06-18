var mtl = require("./mtl");
var _ = require("underscore");
var fs = require("fs");
var argv = require("optimist").
			usage("Locate or create target folder for a file Usage: mtl target -s=filename -d=path/to/destination/folder ").
			options({
				'd' : {
					alias : 'destination',
					demand : true,
					describe : "Library directory"
				},
                                'f' : {
                                        alias : 'default',
                                        describe : "Default destination if no target could be found"
                                },
				's' : {
					alias : "source",
					demand : true,
					describe : "Source filename"
				}
			}).
			argv;
                
var source = argv.source;
var dest = argv.destination;
var vids = [mtl.identifyVideos(source)];
var outp = argv["default"];
if (vids.length) {
    var ops = mtl.identifyDestinations(vids, [dest]);
    if (ops.create.length) {
        outp = _.keys(ops.create)[0];
        fs.mkdirSync(outp);
    } else if (ops.move.length) {
        outp = _.keys(ops.move)[0];
    } 
}
process.stout.write(outp);

