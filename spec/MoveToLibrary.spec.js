describe("Move to library", function() {

	var inputDir =  [
					"Chuck 3x7.wmv",
	            	"Chuck 03 x 20.wmv",
				    "Chuck 03x17.mpg",
					"Chuck 3e15.mkv",
					"Chuck S03 E08.wmv",
					"Chuck S03.E09.wmv",
					"Chuck S03E10.wmv",
					"Chuck S03xE11.wmv",
					"Chuck S3E12.wmv",
					"Chuck 02x17x18x19.wmv",
					"Chuck 2e12e13e14.wmv",
					"Chuck 2x7x8x9.wmv",
					"Chuck S02 E05E06E07.wmv",
					"Chuck S02E10E11E12.wmv",
					"Chuck S02.E01E02E03.wmv",
					"Chuck S02xE11E12E13.wmv",
					"Community.S04E12.HDTV.x264-LOL.mp4",
					"Mad.Men.S06E08.HDTV.x264-EVOLVE.mp4",
					"Game.of.Thrones.S03E08.PROPER.HDTV.x264-2HD.mp4",
					"Doctor.Who.2005.7x12.Nightmare.In.Silver.HDTV.x264-FoV.mp4",
					"NotAvideo.txt",
					"video_wthout_tags.mp4"]

	var outputDir = ["Chuck", "Community", "Mad Men", "Doctor Who (2005)"];

	var validVideos = inputDir.slice(0, inputDir.length-3);

	var operations = {
		"Chuck" : [
					"Chuck 3x7.wmv",
	            	"Chuck 03 x 20.wmv",
				    "Chuck 03x17.mpg",
					"Chuck 3e15.mkv",
					"Chuck S03 E08.wmv",
					"Chuck S03.E09.wmv",
					"Chuck S03E10.wmv",
					"Chuck S03xE11.wmv",
					"Chuck S3E12.wmv",
					"Chuck 02x17x18x19.wmv",
					"Chuck 2e12e13e14.wmv",
					"Chuck 2x7x8x9.wmv",
					"Chuck S02 E05E06E07.wmv",
					"Chuck S02E10E11E12.wmv",
					"Chuck S02.E01E02E03.wmv",
					"Chuck S02xE11E12E13.wmv",
		],
		"Community" : [
					"Community.S04E12.HDTV.x264-LOL.mp4",
		],
		"Mad Men" : [
					"Mad.Men.S06E08.HDTV.x264-EVOLVE.mp4",
		],
		"Doctor Who (2005)" : [
					"Doctor.Who.2005.7x12.Nightmare.In.Silver.HDTV.x264-FoV.mp4",
		]
	};

	var Mtl = require("MoveToLibrary");
	var instance;

	beforeEach(function() {
		instance = new Mtl();
	});


	it("should correctly identify tagged videos", function() {
		expect(Mtl.identifyVideos(inputDir).join()).toBe(validVideos.join());
	});

});
