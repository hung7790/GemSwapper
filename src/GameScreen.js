/*
 * The title screen consists of a background image and a
 * start button. When this button is pressed, and event is
 * emitted to itself, which is listened for in the top-level
 * application. When that happens, the title screen is removed,
 * and the game screen shown.
 */
import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import src.GemGrid as GemGrid;
/* The title screen is added to the scene graph when it becomes
 * a child of the main application. When this class is instantiated,
 * it adds the start button as a child.
 */
exports = Class(ui.ImageView, function(supr) {
    this.init = function(opts) {
        opts = merge(opts, {
            x: 0,
            y: 0,
            image: "resources/images/ui/background.png"
        });
        supr(this, 'init', [opts]);
        this.build();
    };

    this.build = function() {
	this.startMessage = new ui.TextView({
			superview: this,
			x: 60,
			y: 40,
			width: 200,
			height: 36,
			autoFontSize: true,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			strokeWidth: '3',
			strokeColor: '#fff',
			color: '#F9912E',
			shadowColor: '#3A96CF'
		});
		this.on('app:start', bind(this,function(){
			this.gameStart();
		}));

    };
	this.gameStart = function(){
		this.startMessage.setText('Tap to PLAY!');
		this.gemGrid = new GemGrid({
            superview: this,
        });
		this.once('InputSelect', ()=>{
			this.startMessage.hide();
			this.gemGrid.emit('GemGrid:gameStart');
			});
		
	}
});
