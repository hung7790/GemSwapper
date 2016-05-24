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

/* Represented by collision circle */
exports = Class(ui.View, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
		});
		this.opts = opts;
		supr(this, 'init', [opts]);
		this.build();
	};
	this.updateParams = function(params){
		this.id = params.id;
		this.gemType = params.gemType;
		this.row = params.row;
		this.col = params.col;
		this.moveCount = params.moveCount;
		this.gemImg.updateOpts({image: gemsImgs[this.gemType]});
	}
	this.build = function () {
		// image
		this.gemImg = new ImageView({
			superview: this,
			image: gemsImgs[this.gemType],
			x:this.opts.width*0.05,
			y:this.opts.width*0.05,
			width: this.opts.width*0.9,
			height: this.opts.height*0.9,
		});
		// init
		//this.setBubType(this.bubType);
	};
	this.updateImg = function (){

	}
  this.setBubType = function (type) {
		this.gemImg.setImage(gemsImgs[type]);
		this.gemType = type;
	};

	this.getCenterP = function () {
		return {
			x: this.style.x + (this.style.width / 2),
			y: this.style.y + (this.style.width / 2)
		};
	};
});
