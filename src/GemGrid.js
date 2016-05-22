/*
manages bubbles added or removed from hex grid and both hex & bubbles canvases
Bubbles are Views and the hex grid is underlying canvas serving as a spacial map
*/
import animate;
import src.Gem as Gem;
import ui.View;
import device;

const COLUMN = 10;
const ROW = 8;
const GWIDTH = 300; // opts.superview.style.width;
const GHEIGHT = 250; // opts.superview.style.height - opts.y;
const GX = 11;
const GY = 149;

exports = Class(ui.View, function(supr) {
    var _gemHeight = 1;

    this.init = function(opts) {
        opts = merge(opts, {

        });
        supr(this, 'init', [opts]);
        this.build();
    };
    this.build = function() {
        this.addGems();
    };
    this.addGem = function(params) {
        var gem = new Gem({
            superview: this,
            id: params.id,
            row: params.row,
            col: params.column,
            width: GWIDTH / COLUMN,
            height: GHEIGHT / ROW,
            gemType: params.gemType,
            x: params.x,
            y: params.y
        });
        return gem;

    };
    var gems = [];
    this.addGems = function() {
        var cnt = 1;
        for (var i = 0; i < ROW; i++) {
            var gemRows = [];
            for (var j = 0; j < COLUMN; j++) {
                var params = {
                    id: cnt++,
                    row: i,
                    column: j,
                    gemType: 1,
                    x: GWIDTH / COLUMN * j,
                    y: GHEIGHT / ROW * i
                };
                gemRows.push(this.addGem(params));
            }
            gems.push(gemRows);
        }
        return gems;
    };
    this.getXY = function(point) {

        console.log(point.y / GHEIGHT * ROW);
        console.log(gems);
    }
    this.on('InputSelect', function(event, point) {
        this.getXY(point);
    });
});
