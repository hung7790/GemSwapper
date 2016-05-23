import animate;
import src.Gem as Gem;
import ui.View;
import device;

const COLUMN = 10;
const ROW = 8;
const GWIDTH = 300;
const GHEIGHT = 250;
const GX = 11;
const GY = 149;
const MOVETIME = 100; // the time for move one gem height;

exports = Class(ui.View, function(supr) {
    this.init = function(opts) {
        opts = merge(opts, {
            x: GX,
            y: GY,
            width: GWIDTH,
            height: GHEIGHT
        });
        supr(this, 'init', [opts]);
        this.build();
    };
    this.build = function() {
        this.on('GemGrid:gameStart', bind(this, function() {
            console.log("receive");
            this.createInitalGems();
            this.on('InputSelect', bind(this, function(event, point) {
                this.onSelectGem(getSelectGem.call(this, point));
            }));
        }));


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
            ty: params.ty,
            y: params.sy,
            moveCount: params.moveCount
        });
        return gem;

    };
    this.gems = [];
    this.createInitalGems = function() {
        for (var i = 0; i < ROW; i++) {
            var gemRows = [];
            for (var j = 0; j < COLUMN; j++) {
                var randomType;
                do {
                    randomType = Math.floor((Math.random() * 5));
                }
                while ((j > 2 && gemRows[j - 1].gemType == randomType && gemRows[j - 2].gemType == randomType) || (i > 2 && this.gems[i - 1][j].gemType == randomType && this.gems[i - 2][j].gemType == randomType));

                var params = {
                    row: i,
                    column: j,
                    gemType: randomType,
                    x: GWIDTH / COLUMN * j,
                    sy: GHEIGHT / ROW * (i - ROW - 1),
                    ty: GHEIGHT / ROW * i,
                    moveCount: ROW + 1
                };
                gemRows.push(this.addGem(params));
            }
            this.gems.push(gemRows);
        }
        this.allGemMove();
    };
    this.allGemMove = function() {
        for (var i = 0; i < this.gems.length; i++) {
            for (var j = 0; j < this.gems[i].length; j++) {
                if (this.gems[i][j].moveCount != 0) {
                    this.gemMove(this.gems[i][j]);
                    resetGem(this.gems[i][j]);
                    // var animator = animate(this.gems[i][j]).now({
                    //         x: this.gems[i][j].tx,
                    //         y: this.gems[i][j].ty
                    //     },
                    //     MOVETIME * this.gems[i][j].moveCount).then(function()
                    //     {
                    //         resetGemAfterAnimate(this.gems[i][j]);
                    //     });
                    // //this.gems[i][j].moveCount = 0;
                }
            }
        }
    }
    this.gemMove = function(gem) {
        var animator = animate(gem).now({
                x: gem.tx,
                y: gem.ty
            },
            MOVETIME * gem.moveCount);
        return animator;
    }
    this.selectedGem = [];
    this.onSelectGem = function(gem) {
        if (this.selectedGem.length == 0) {
            this.selectedGem.push(gem);
            highlightGem(gem);
        } else if (this.selectedGem.length == 1) {
            var sGem0 = this.selectedGem[0];
            if (sGem0.row == gem.row || sGem0.col == gem.col) {

                if (Math.abs(sGem0.row - gem.row) == 1 || Math.abs(sGem0.col - gem.col) == 1) {
                    // sGem0.tx = gem.x;
                    // sGem0.ty = gem.y;
                    // sGem0.moveCount = 1;
                    // gem.tx = sGem0.x;
                    // gem.ty = sGem0.y;
                    // gem.moveCount = 1;
                    // this.gemMove(sGem0);
                    // this.gemMove(gem);
                    console.log(sGem0.row);
                    console.log(sGem0.col);
                    console.log(gem.row);
                    console.log(gem.col);
                    this.gemSwap(sGem0, gem);
                    console.log(sGem0.row);
                    console.log(sGem0.col);
                    console.log(gem.row);
                    console.log(gem.col);
                    if (haveChain.call(this, sGem0.row, sGem0.col) || haveChain.call(this, gem.row, gem.col)) {
                            this.gemSwapAnimate(sGem0, gem);
                    } else {
                        this.gemSwapAnimate(sGem0, gem, bind(this, function() {
                            this.gemSwap(sGem0, gem);
                            this.gemSwapAnimate(sGem0, gem);
                        }));
                        // this.gemMove(sGem0);
                        // this.gemMove(gem).then(bind(this, function() {
                        //     resetGem(sGem0);
                        //     resetGem(gem);
                        //     this.gemSwap(sGem0, gem);
                        //     this.gemMove(sGem0);
                        //     this.gemMove(gem).then(bind(this, function() {
                        //         resetGem(sGem0);
                        //         resetGem(gem);
                        //     }));;
                        // }));
                    }
                } else {
                    this.selectedGem.pop();
                }
            } else {
                this.selectedGem.pop();
            }
            this.selectedGem.pop();
            deHighlightGem(sGem0);
        }
    }
    this.gemSwapAnimate = function(gem0, gem1, callback) {
        this.gemMove(gem0);
        this.gemMove(gem1).then(bind(this, function() {
            resetGem(gem0);
            resetGem(gem1);
            if (callback) {
                callback();
            }
        }));
    }

    this.gemSwap = function(gem0, gem1) {
        gem0.tx = gem1.x;
        gem0.ty = gem1.y;
        gem0.moveCount = 1;
        gem1.tx = gem0.x;
        gem1.ty = gem0.y;
        gem1.moveCount = 1;
        swap(gem0, gem1, "row");
        swap(gem0, gem1, "col");
        this.resetGemPosinList(gem0);
        this.resetGemPosinList(gem1);
    }
    this.resetGemPosinList = function(gem){
        this.gems[gem.row][gem.col] = gem;
    }
});

function swap(obj1, obj2, key) {
    var temp = obj1[key];
    obj1[key] = obj2[key];
    obj2[key] = temp;
}

function resetGem(gem) {
    gem.moveCount = 0;
    gem.x = gem.tx;
    gem.y = gem.ty;
}

function getSelectGem(point) {
    var that = this;
    var col = Math.floor(point.x / GWIDTH * COLUMN);
    var rol = Math.floor(point.y / GHEIGHT * ROW);
    return that.gems[rol][col];
}

function haveChain(row, col) {
    var that = this;
    var gemType = that.gems[row][col].gemType;
    var vertLength = 1;
    for (var i = row - 1; i >= 0 && that.gems[i][col].gemType == gemType; i--, vertLength++);
    for (var i = row + 1; i < ROW && that.gems[i][col].gemType == gemType; i++, vertLength++);
    if (vertLength >= 3) return true;
    horzLength = 1;
    for (var i = col - 1; i >= 0 && that.gems[row][i].gemType == gemType; i--, horzLength++);
    for (var i = col + 1; i < ROW && that.gems[row][i].gemType == gemType; i++, horzLength++);
    return (horzLength >= 3);
}


function highlightGem(gem) {
    gem.updateOpts({
        backgroundColor: '#0000ff'
    });
}

function deHighlightGem(gem) {
    gem.updateOpts({
        backgroundColor: ''
    });
}
