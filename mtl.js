var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var request = require("request");
var PATTERNS = require("./patterns");

var SPLIT_WORDS_REGEX = /\W+/g;
var regexes = {};
var matchTitles = {};

var getRegex = function(title) {
    var r = regexes[title];
    if (!r) {
        r = new RegExp("^" + title.split(SPLIT_WORDS_REGEX).join("\\W") + ".*", "i");
        regexes[title] = r;
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
    getOps: function(source, target) {
        
        return mtl.identifyDestinations(
                mtl.identifyVideos(mtl.getFiles(source)),
                mtl.getDirs(target));
    },
    doMoves: function(source, target, ops, dry) {
        if (!ops)
            throw "no ops provided";
        var newDirs = [];
        for (var dir in ops) {
            var dirPath = path.join(target, dir);
            newDirs.push(dirPath);
            if (!dry && !fs.existsSync(dirPath)) {
                //console.info("Creating directory: %s", dirPath);
                fs.mkdirSync(dirPath);
            }
            var files = ops[dir];
            //console.info("file: %j from ops %j with key %s", files, ops, dir);
            files.forEach(function(file) {
                var sourcePath = path.join(source, file);
                var destPath = path.join(dirPath, file);
                if (fs.existsSync(destPath)) {
                    //console.warn("%s exists, skipping", destPath);
                } else {
                    if (!dry) fs.renameSync(sourcePath, destPath);
                }
            });
        }
        return newDirs;
    },
    /**
     * 
     * @param {Array || string} files - absolute paths to file(s) to process
     * @returns {unresolved}
     */
    identifyVideos: function(files) {
        var output = {};
        files = typeof files === "object" ? files : [files];
        //console.info("identifying files %j",files);
        files.forEach(function(f) {
            //TODO filter filetype here
            PATTERNS.forEach(function(p) {
                var match = p.exec(f);
                if (match != null) {
                    output[f] = {
                        title: match[1],
                        season: match[2],
                        episode: match[3],
                        format: match[4]
                    };
                    return false;
                }
            });
        });
        //console.info(output);
        return output;
    },
    /**
     * 
     * @param {Array} videos - output from identify videos 
     * @param {type} target - list of target folders filename (no paths)
     * @returns {mtl.identifyDestinations.Anonym$1}
     */
    identifyDestinations: function(videos, target) {
        //console.info("identifying destination for vids %j in %j", videos, target);
        var moves = {};
        var createDirs = [];
        for (var filename in videos) {
            var meta = videos[filename];
            //console.info("metadata for %s : %j", filename, meta);
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
            if (!dirName) {
                dirName = getDirTitle(meta.title);
                if (createDirs.indexOf(dirName) < 0) {
                    createDirs.push(dirName);
                }
            }
            moves[dirName] = moves[dirName] || [];
            moves[dirName].push(filename);
        }
        return {
            move: moves,
            create: createDirs
        }
    },
    refreshXBMC: function(url, cb) {
        //TODO more tolerant url handling
        url += "/jsonrpc";
        var payload = {"jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1};
        request.post({
            url: url,
            body: JSON.stringify(payload)
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log("Triggered XBMC update");
                //console.log(body);
            } else {
                console.error("XBMC update failed with error %s", error);
                console.error(response);
            }
            if (cb)
                cb();
        });
    },
    getDirs: function(target) {
        return  _.filter(fs.readdirSync(target), function(f) {
            return fs.statSync(path.join(target, f)).isDirectory();
        });
    },
    getFiles: function(source, recursive, acc) {
        acc = acc || [];
        if (fs.statSync(source).isFile()) {
            console.log('got file');
            acc.push(source);
        } else {
            _.each(fs.readdirSync(source), function (f) {
                var filePath = path.join(source, f);
                var p = fs.statSync(filePath);
                if (p.isFile()) {
                    acc.push(filePath);
                } else if (recursive && p.isDirectory()) {
                    acc = mtl.getFiles(filePath, recursive, acc);
                }
            });
        }
        return acc;
    }
};
module.exports = mtl;

