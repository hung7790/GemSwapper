// entry point

import device;
import ui.TextView as TextView;
import ui.StackView as StackView;
import src.GameScreen as GameScreen;
exports = Class(GC.Application, function() {
    this.initUI = function() {
        var gamescreen = new GameScreen();

        this.view.style.backgroundColor = '#000000';
        // Create a stackview of size 320x480, then scale it to fit horizontally
        var rootView = new StackView({
            superview: this,
            // x: device.width / 2 - 160,
            // y: device.height / 2 - 240,
            x: 0,
            y: 0,
            width: 320,
            height: 480,
            clip: true,
            scale: device.width / 320
        });
        rootView.push(gamescreen);
		gamescreen.emit('app:start');
    };

    this.launchUI = function() {

    };

});
