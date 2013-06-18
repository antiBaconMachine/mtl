var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var request = require("request"); 
var PATTERNS = require("./patterns");

var SPLIT_WORDS_REGEX = /\W+/g;
var regexes = {};
var matchTitles = {};

var getRegex = function(title) {
	var r  = regexes[title];
	if (!r) {
		r = new RegExp("^" + title.split(SPLIT_WORDS_REGEX).join("\\W") + ".*", "i");
		regexes[title]=r;
	}
	return r;
}
var getMatchTitle = function(title) {
	var m = matchTitles[title];
	if (!m) {
		m = title.split(SPLIT_WORDS_REGEX).join(" "); 
		matchTitles[title] = m;
	}
	return m;
}
/**
 *Get a nice clean name your grandma would be happy to use as a directory name.
 *allows ()
 */
var getDirTitle = function(title) {
	return title.split(/[^a-zA-Z0-9\(\)]+/g).join(" ");
}

var mtl = {
getOps : function(source, target, options) {
	
	var files = _.filter(fs.readdirSync(source), function(f) {
		return fs.statSync(path.join(source,f)).isFile();
	});
	var videos = mtl.identifyVideos(files);
	var targets = _.filter(fs.readdirSync(target), function(f) {
		return fs.statSync(path.join(target,f)).isDirectory();
	});
	return mtl.identifyDestinations(videos, targets);
},
doMoves : function(source, target, ops) {
	if (!ops) throw "no ops provided";
	for (var dir in ops) {
		var dirPath = path.join(target,dir);
		if (!fs.existsSync(dirPath)) {
			console.info("Creating directory: %s", dirPath);
			fs.mkdirSync(dirPath);
		}
		var files = ops[dir];
		files.forEach(function(file) {
			var sourcePath = path.join(source, file);
			var destPath = path.join(dirPath, file);
			if (fs.existsSync(destPath)) {
				console.warn("%s exists, skipping", destPath);
			} else {
				fs.renameSync(sourcePath, destPath);
			}
		});
	}
},
identifyVideos : function(files) {
	var output = {};
	for (var i in files) {
		var f = files[i];
		for (var p in PATTERNS) {
			var match =  PATTERNS[p].exec(f);
			if (match != null) {
				output[f] = {
					title : match[1],
					season : match[2],
					episode : match[3],
					format : match[4]
				};
				break;
			}
		}
	}
	//console.info(output);
	return output;
},
identifyDestinations : function(videos, target) {
	var moves = {};
	var createDirs = {};
	for (var filename in videos) {
		var meta = videos[filename];
		var regex = getRegex(meta.title);
		var dirName = null;
		for (var i in target) {
			var t = target[i];
			var matchTitle = getMatchTitle(t);
			var test = regex.test(matchTitle);
			//console.info("matching %s with pattern -%s- against -%s- with result %s",filename, matchTitle,regex,test);
			if (test) {
				dirName = t;
				break;
			}
		}
		//dirName = dirName || getDirTitle(meta.title);
		if (dirName) {
			moves[dirName] = moves[dirName] || [];
			moves[dirName].push(filename);
		} else {
			dirName = getDirTitle(meta.title);
			createDirs[dirName] = createDirs[dirName] || [];
			createDirs[dirName].push(filename);
		}
	}
	return {
		move : moves,
		create : createDirs
	}
},
refreshXBMC : function(url, cb) {
	//TODO more tolerant url handling
	url += "/jsonrpc";
	var payload = { "jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1 };	
	request.post({
		url : url,
		body : JSON.stringify(payload)
	}, 
	function(error, response, body) {
		if (!error && response.statusCode == 200) {
		  console.log("Triggered XBMC update");
		  console.log(body);
		} else {
		  console.log("XBMC update failed with error %s", error);
		  console.log(response);
		}
		if (cb) cb();
	});
}
};
module.exports = mtl;

