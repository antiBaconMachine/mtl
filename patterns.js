/**
 * These are the regexes used to identify TV shows. They are tried in order, first match wins
 */
module.exports = [
	//SnnEnn
	/(.*)\W+S?([0-9]{1,2})X?\W*?E([0-9]{1,2}).*\.(.+$)/i,
	//nXn
	/(.*)\W+([0-9]{1,2})\W*?x\W*?([0-9]{1,2}).*\.(.+$)/i
];
