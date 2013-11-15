var fs = require("fs");
var mtl = require("./mtl");
var _ = require("underscore");
var path = require("path");

var argv = require("optimist").
			usage("File TV shows in appropriate folders\n Usage: mtl move -options -s=path/to/source/folder -d=path/to/destination/folder").
			options({
				'destination' : {
					alias : 'd',
					demand : true,
					describe : "Library directory"
				},
				'dry-run' : {
					alias : 'n',
					describe : 'print the operations that would be performed and exit',
					default : false
				},
				'prompt' : {
					alias : 'p',
					boolean : true,
					default : true,
					describe : "perform required ops without prompting"
				},
                                'quiet' : {
                                    alias : 'q',
                                    describe : "less output",
                                    default : false
                                },
                                'rtorrent' : {
                                    alias : 'r',
                                    describe : 'echo the new dir of a  moved file to stdout. Only makes sense with a single file and no prompt. implies quiet and no prompt',
                                    default : false
                                },
				'source' : {
					alias : "s",
					demand : true,
					describe : "source dir"
				},
				'update-xbmc' : {
					alias : 'x',
					describe : 'url of xbmc remote interface to tirgger update of lib'
				}
                                
			}).
			argv;
                
if (argv.rtorrent) {
    argv.quiet = argv.q = true;
    argv.prompt = argv.p = false;
}

//Source may be a directory or a single file
var source = argv.source;
var dest = argv.destination;
var ops = mtl.getOps(source, dest);
if (!argv.quiet) console.info(ops);
if (!argv.n && argv.p) {
	ask("proceed?", /(y|n)/i, function(resp) {
		if (resp.toLowerCase() === "y") {
			complete();
		} else {
			process.exit();
		}
	});
} else {
	complete();
}

function complete() {
        var srcDir = source;
        if(!fs.statSync(source).isDirectory()){
             srcDir = path.dirname(source);
         }
        //If there are no moves then just return the source directory 
        //TODO at some point we may want to make a configurable default dir
        var outp = [srcDir];
        if (!_.isEmpty(ops.move)) {
            outp = mtl.doMoves(srcDir, dest, ops.move, argv.n);
        }
        if (argv.rtorrent) {
            console.log(outp.length >1 ? outp : outp[0]);
        }
	if(!argv.n && argv.x) {
		mtl.refreshXBMC(argv.x, process.exit);
	 } else {
		process.exit();
	 }
}

function ask(question, format, callback) {
 var stdin = process.stdin, stdout = process.stdout;
  
   stdin.resume();
   stdout.write(question + ": ");
 
  stdin.once('data', function(data) {
     data = data.toString().trim();
	  
    if (format.test(data)) {
	     callback(data);
     } else {
    	  stdout.write("It should match: "+ format +"\n");
		  ask(question, format, callback);
	 }
	 });
}