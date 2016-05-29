//This is the Gem object in the game
//This will instantiated in GemGrid

import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import ui.View;

var path = 'resources/images/gems';
var gemsImgs = [
	new Image({url: path + '/gem_01.png'}),
	new Image({url: path + '/gem_02.png'}),
	new Image({url: path + '/gem_03.png'}),
	new Image({url: path + '/gem_04.png'}),
	new Image({url: path + '/gem_05.png'})
];


exports = Class(ui.View, function (supr) {
	// this.init = function (opts) {
	// 	opts = merge(opts, {
	// 	});
	// 	this.opts = opts;
	// 	supr(this, 'init', [opts]);
	// 	this.build();
	// };
	this.init = function (opts) {
	opts = merge(opts, {
	});
	this.opts = opts;
	this.id = opts.id;
	this.gemType = opts.gemType;
	this.row = opts.row;
	this.col = opts.col;
	this.moveCount = opts.moveCount;
	this.x = opts.x;
	this.y = opts.y;
	supr(this, 'init', [opts]);
	this.build();
};
	// this.updateParams = function(params){
	// 	this.id = params.id;
	// 	this.gemType = params.gemType;
	// 	this.row = params.row;
	// 	this.col = params.col;
	// 	this.moveCount = params.moveCount;
	// 	this.gemImg.updateOpts({image: gemsImgs[this.gemType]});
	// }
	this.build = function () {
		// The gem image
		this.gemImg = new ImageView({
			superview: this,
			image: gemsImgs[this.gemType],
			x:this.opts.width*0.05,
			y:this.opts.width*0.05,
			width: this.opts.width*0.9,
			height: this.opts.height*0.9,
		});

	};

});
