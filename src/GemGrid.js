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

exports = Class(ui.View, function(supr) {
    this.init = function(opts) {
        opts = merge(opts, {

        });

        this.opts = opts;
        this._gridWidth = opts.width; // opts.superview.style.width;
        this._gridHeight = opts.height; // opts.superview.style.height - opts.y;
        this._gems = this.addGems;
        this._gemWidth = opts.width/COLUMN;
        this._gemHeight = opts.height/ROW;
        this.name= "sad";
        console.log(this.test);
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
            width: this._gemWidth ,
            height: this._gemHeight,
            gemType: params.gemType,
            x:params.x,
            y:params.y
        });
        return gem;

    };

    this.addGems = function() {
        var gems = [];
        var cnt = 1;
        for (var i = 0; i < ROW; i++) {
            var gemRows = [];
            for (var j = 0; j < COLUMN; j++) {
                var params = {
                    id: cnt++,
                    row: i,
                    column: j,
                    gemType: 1,
                    x:this._gemWidth*j,
                    y:this._gemHeight*i
                };
                gemRows.push(this.addGem(params));
            }
            gems.push(gemRows);
        }
        return gems;
    };
    this.test = "g";
    this.on('InputSelect', function (event, point) {
        console.log(point.x);
        console.log(this);
        console.log(this.test);
        console.log(point.y/this._gemHeight);
    });
});
