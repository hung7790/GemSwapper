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
        this.gemGrid = new GemGrid({
            x : 11,
            y:149,
            width: 300,
            height: 250,
            superview: this,
        });


    };
});
