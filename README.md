#mtl (move to library)

This is a utility I use for filing TV show downloads from a common download folder into a sorted library.

It's very much desinged around my personal use case which is that I want it to work well with xbmc. There is also therefore an option to have it auto trigger a libary scan of an xbmc instance after filing. Pull requests welcome, if you think it should do more.

##Install
Clone the repo then run `npm install -g` from the repo root. You now have the mtl command on your $PATH

##usage

Only required arguments are a source dir to scan and a dest dir to file videos under. 
	mtl -s Downloads -d ~/Videos/TV

by default mtl will print a list of identified files and the folders it intends to move them to and prompt for further action. If no suitable folder exists one will be created. If you are happy with what it intends to do then hiy `y`y and you're done.

You can pass `-p false` to stop it prompting or `-n` to just print the ops without doing anything.

To trigger an xbmc library scan after moving pass `-x http://yourxbmcurl:port`. You'll need jsonrpc enabled on your xbmc instance for this to work.

##Show identification

This based on a simple and limited set of regexes to match a few files I had lying around plus some sample names which are detailed in the spec. It is by no means comprehensive but will hopefully grow over time. I welcome helpful contributions.

