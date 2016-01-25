/**
 * These are the regexes used to identify TV shows. They are tried in order, first match wins
 */
module.exports = [
    //SnnEnn
    /(.*)\W+S?([0-9]{1,2})X?\W*?E([0-9]{1,2}).*\.(.+$)/i,
    //nXn
    /(.*)\W+([0-9]{1,2})\W*?x\W*?([0-9]{1,2}).*\.(.+$)/i,
    //Date 2012.12.01
    /(.*)\W+S?(19|20)[0-9]{2}\.(0?[1-9]|1[012])\.(0?[1-9]|[12][0-9]|3[01]).*\.(.+$)/i
];

