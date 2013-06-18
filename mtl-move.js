var fs = require("fs");
var mtl = require("./mtl");
var _ = require("underscore");

var argv = require("optimist").
			usage("File TV shows in appropriate folders\n Usage: mtl move -options -s=path/to/source/folder -d=path/to/destination/folder").
			options({
				'd' : {
					alias : 'destination',
					demand : true,
					describe : "Library directory"
				},
				'n' : {
					alias : 'dry-run',
					describe : 'print the operations that would be performed and exit',
					default : false
				},
				'p' : {
					alias : 'prompt',
					default : true,
					describe : "perform required ops without prompting"
				},
				's' : {
					alias : "source",
					demand : true,
					describe : "source dir"
				},
				'x' : {
					alias : 'update-xbmc',
					describe : 'url of xbmc remote interface to tirgger update of lib'
				}
			}).
			argv;

var source = argv.source;
var dest = argv.destination;
var ops = mtl.getOps(source, dest);
console.info(ops);
if (argv.n) process.exit();

if (argv.p) {
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
	mtl.doOps(source, dest, ops);
	if(argv.x) {
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