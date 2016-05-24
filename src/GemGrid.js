import animate;
import src.Gem as Gem;
import ui.View;
import device;
import ui.ViewPool as ViewPool;

const COLUMN = 10;
const ROW = 8;
const GWIDTH = 300;
const GHEIGHT = 250;
const GX = 11;
const GY = 149;
const MOVETIME = 100; // the time for move one gem height;
const GEMWIDTH = GWIDTH / COLUMN;
const GEMHEIGHT = GHEIGHT / ROW;

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
        this.gemViewPool = new ViewPool({
            ctor: Gem,
            initCount: COLUMN*ROW*1.2,
            initOpts: {
                superview: this,
                width: GEMWIDTH,
                height: GEMHEIGHT
            }
        });


    };
    this.addGem = function(params) {
        var gem = this.gemViewPool.obtainView();
        gem.updateOpts({x:params.x,y:params.y});
        gem.updateParams({
            id: params.id,
            row: params.row,
            col: params.column,
            gemType: params.gemType,
            moveCount: params.moveCount
        });
        return gem;

    };

    this.gems = [];

    this.allGemMove = function() {
        for (var i = 0; i < this.gems.length; i++) {
            for (var j = 0; j < this.gems[i].length; j++) {
                if (this.gems[i][j].moveCount != 0) {
                    this.gemMove(this.gems[i][j]);
                }
            }
        }
        resetGems(this.gems);
    }

    this.createInitalGems = function(_gemsType) {
        for (var i = 0; i < ROW; i++) {
            var gemRows = [];
            for (var j = 0; j < COLUMN; j++) {
                var params = {
                    row: i,
                    column: j,
                    gemType: _gemsType[i][j],
                    x: GWIDTH / COLUMN * j,
                    y: GHEIGHT / ROW * (i - ROW - 1),
                    moveCount: ROW + 1
                };
                gemRows.push(this.addGem(params));
            }
            this.gems.push(gemRows);
        }
        this.allGemMove();
    };


    this.gemMove = function(gem) {
        var animator = animate(gem).now(getCoord(gem.row, gem.col),
            MOVETIME * gem.moveCount);
        return animator;
    }

    this.removeAllChain = function(allChain) {
        for (var i = 0; i < allChain.length; i++) {
            for (var j = 0; j < allChain[i].length; j++) {
                var coord = allChain[i][j].split(",");
                var gemsToRemove = this.gems[coord[0]][coord[1]];
                this.gems[coord[0]][coord[1]] = null;
                this.gemViewPool.releaseView(gemsToRemove);
            }
        }
    }

    this.selectedGem = [];

    this.onSelectGem = function(gem) {
        if (gem == null) {
            if (this.selectedGem.length != 0) {
                deHighlightGem(this.selectedGem[0]);
                this.selectedGem.pop();
            }
            return;
        }
        if (this.selectedGem.length == 0) {
            this.selectedGem.push(gem);
            highlightGem(gem);
        } else if (this.selectedGem.length == 1) {
            var sGem0 = this.selectedGem[0];
            if (sGem0.row == gem.row || sGem0.col == gem.col) {

                if (Math.abs(sGem0.row - gem.row) == 1 || Math.abs(sGem0.col - gem.col) == 1) {
                    var lRow = Math.min(sGem0.row, gem.row);
                    var lCol = Math.min(sGem0.col, gem.col);
                    if (this.possibleMove.hasOwnProperty(lRow + "," + lCol)) {
                        this._gemsTypeSwap(sGem0.row, sGem0.col, gem.row, gem.col);
                        this.gemSwap(sGem0, gem);
                        this.gemSwapAnimate(sGem0, gem, bind(this, function() {
                            this.getAllChain();
                            this.removeAllChain();
                        }));
                        console.log("good");
                    } else {
                        this.gemSwap(sGem0, gem);
                        this.gemSwapAnimate(sGem0, gem, bind(this, function() {
                            this.gemSwap(sGem0, gem);
                            this.gemSwapAnimate(sGem0, gem);
                        }));
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
            resetGems({
                gem0,
                gem1
            });
            if (callback) {
                callback();
            }
        }));
    }

    this.gemSwap = function(gem0, gem1) {
        gem0.moveCount = 1;
        gem1.moveCount = 1;
        swap(gem0, gem1, "row");
        swap(gem0, gem1, "col");
        this.resetGemPosinList(gem0);
        this.resetGemPosinList(gem1);
    }

    this.resetGemPosinList = function(gem) {
        this.gems[gem.row][gem.col] = gem;
    }

    this.getSelectGem = function(point) {
        var col = Math.floor(point.x / GWIDTH * COLUMN);
        var rol = Math.floor(point.y / GHEIGHT * ROW);
        return this.gems[rol][col];
    }
});

function getCoord(row, col) {
    return {
        x: GWIDTH / COLUMN * col,
        y: GHEIGHT / ROW * row
    };
}

function swap(obj1, obj2, key) {
    var temp = obj1[key];
    obj1[key] = obj2[key];
    obj2[key] = temp;
}

function resetGems(gems) {
    for (var i = 0; i < gems.length; i++) {
        gems[i].moveCount = 0;
    }
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
