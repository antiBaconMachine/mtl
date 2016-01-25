var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var request = require("request");
var PATTERNS = require("./patterns");
var EXTENSIONS = require("./extensions");

var SPLIT_WORDS_REGEX = /\W+/g;
var regexes = {};
var matchTitles = {};

var getRegex = function (title) {
    var r = regexes[title];
    if (!r) {
        r = new RegExp("^" + title.split(SPLIT_WORDS_REGEX).join("\\W") + ".*", "i");
        regexes[title] = r;
    }
    return r;
};
var getMatchTitle = function (title) {
    var m = matchTitles[title];
    if (!m) {
        m = title.split(SPLIT_WORDS_REGEX).join(" ");
        matchTitles[title] = m;
    }
    return m;
};
/**
 *Get a nice clean name your grandma would be happy to use as a directory name.
 *allows ()
 *converts 'foo, the' to 'the foo'
 */
var getCleanTitle = function (inp) {
    var title = inp.split(/[^a-zA-Z0-9\(\),]+/g).join(" ").trim();
    if (title.substr(title.length - 5).match(/, the/i)) {
        title = title.replace(/([^,]+),\W?(the)/i, '$2 $1');
    }
    return title;
};
var mtl = {
    getOps: function (source, target, recursive) {

        return mtl.identifyDestinations(
            mtl.identifyVideos(mtl.getFiles(source, recursive)),
            mtl.getDirs(target));
    },
    doMoves: function (source, target, operations, args) {
        if (!operations)
            throw "no ops provided";
        var newDirs = [];
        for (var dir in operations) {
            var dirPath = path.join(target, dir);
            newDirs.push(dirPath);
            if (!args.n && !fs.existsSync(dirPath)) {
                //console.info("Creating directory: %s", dirPath);
                fs.mkdirSync(dirPath);
            }
            var files = operations[dir];
            //console.info("file: %j from ops %j with key %s", files, ops, dir);
            files.forEach(function (file) {
                var sourcePath = file;
                var destPath = path.join(dirPath, path.basename(file));
                if (fs.existsSync(destPath)) {
                    //console.warn("%s exists, skipping", destPath);
                } else {
                    if (!args.n) {
                        if (args.l) {
                            fs.linkSync(sourcePath, destPath);
                        } else {
                            fs.renameSync(sourcePath, destPath);
                        }
                    }
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
    identifyVideos: function (files) {
        var output = {};
        files = typeof files === "object" ? files : [files];
        //console.info("identifying files %j",files);
        files.forEach(function (f) {
            var baseName = path.basename(f);
            //TODO filter filetype here
            PATTERNS.forEach(function (p) {
                var match = p.exec(baseName);
                if (match != null && _.indexOf(EXTENSIONS, _.last(match).toLowerCase()) != -1) {
                    output[f] = {
                        title: getCleanTitle(match[1]),
                        season: match[2],
                        episode: match[3],
                        format: match[4]
                    };
                    return false;
                }
            });
        });
        //console.info("identified videos: %j", output);
        return output;
    },
    /**
     *
     * @param {Array} videos - output from identify videos
     * @param {type} target - list of target folders filename (no paths)
     * @returns {mtl.identifyDestinations.Anonym$1}
     */
    identifyDestinations: function (videos, target) {
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
                dirName = meta.title;
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
    refreshXBMC: function (url, cb) {
        //TODO more tolerant url handling
        url += "/jsonrpc";
        var payload = {"jsonrpc": "2.0", "method": "VideoLibrary.Scan", "id": 1};
        request.post({
                url: url,
                body: JSON.stringify(payload)
            },
            function (error, response, body) {
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
    refreshPlex: function (base_url, cb) {
        url = base_url + "/library/sections";
        request.get({
            url: url,
            headers: {
                'Accept': 'application/json',
            }
        }).on('response', function (response) {
                response.on('data', function (data) {
                        var sections = JSON.parse(data)._children;
                        var sections_count = 0;
                        var count = 0;
                        _.each(sections, function (section) {
                            if (section.type == 'show') {
                                sections_count++;
                                scan_url = base_url + '/library/sections/' + section.key + '/refresh';
                                request.get({
                                    url: scan_url,
                                }).on('response', function (response) {
                                    count++;
                                    if(count == sections_count && cb){
                                            cb();
                                    }
                                }).on('error', function (err) {
                                    console.error("Plex update failed with error %s", err);
                                    console.error(err);
                                    count++;
                                    if(count == sections_count && cb){
                                        cb();
                                    }
                                });
                            }
                        });
                    }
                )
            }
        ).on('error', function (err){
                console.error("Plex update failed with error %s", err);
                console.error(err);
            });
    },
    getDirs: function (target) {
        return _.filter(fs.readdirSync(target), function (f) {
            try {
                return fs.statSync(path.join(target, f)).isDirectory();
            } catch (e) {
                console.warn(e);
                return false;
            }
        });
    },
    getFiles: function (source, recursive, acc) {
        acc = acc || [];
        if (fs.statSync(source).isFile()) {
            acc.push(source);
        } else {
            _.each(fs.readdirSync(source), function (f) {
                try {
                    var filePath = path.join(source, f);
                    var p = fs.statSync(filePath);
                    if (p.isFile()) {
                        acc.push(filePath);
                    } else if (recursive && p.isDirectory()) {
                        acc = mtl.getFiles(filePath, recursive, acc);
                    }
                } catch (e) {
                    console.warn(e);
                }
            });
        }
        //console.log('get files %j', acc);
        return acc;
    }
};
module.exports = mtl;