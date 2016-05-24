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

const COLUMN = 10;
const ROW = 8;
const GWIDTH = 300;
const GHEIGHT = 250;
const GX = 11;
const GY = 149;
const MOVETIME = 100; // the time for move one gem height;


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
        this.on('app:start', bind(this, function() {
            this.gameStart();
        }));

    };

    var gemGrid;

    this.gameStart = function() {
        this.startMessage.setText('Tap to PLAY!');
        gemGrid = new GemGrid({
            superview: this,
        });

        this.once('InputSelect', () => {
            this.startMessage.hide();
            this.initizeGrid();
            this.getAllPossibleMove();
            gemGrid.on('InputSelect', bind(this, function(event, point) {
                this.onSelectGem(gemGrid.getSelectGem(point));
            }));
        });

    }
    var _gemsType = [];

    this.initizeGrid = function() {
        do {
            this.possibleMove = {};
            for (var i = 0; i < ROW; i++) {
                var rows = [];
                for (var j = 0; j < COLUMN; j++) {
                    var randomType;
                    do {
                        randomType = Math.floor((Math.random() * 5));
                    }
                    while ((j > 1 && rows[j - 1] == randomType && rows[j - 2] == randomType) ||
                        (i > 1 && _gemsType[i - 1][j] == randomType && _gemsType[i - 2][j] == randomType));
                    rows.push(randomType);
                }
                _gemsType.push(rows);
            }
            this.getAllPossibleMove();
        } while (this.possibleMove.length == 0);
        gemGrid.createInitalGems(_gemsType);
    };




    this.possibleMove = {};

    this.getAllPossibleMove = function() {
        for (var i = 0; i < ROW; i++) {
            for (var j = 0; j < COLUMN; j++) {
                // -1: no chain , 0 : horizontal ,1: veritical , 2 : both
                var chain = -1;
                if (j + 1 < COLUMN) {
                    _gemsTypeSwap(i, j, i, j + 1);
                    if (checkHaveChain(i, j) || checkHaveChain(i, j + 1)) {
                        chain = 0;
                    }
                    _gemsTypeSwap(i, j, i, j + 1);
                }
                if (i + 1 < ROW) {
                    _gemsTypeSwap(i, j, i + 1, j);
                    if (checkHaveChain(i, j) || checkHaveChain(i + 1, j)) {
                        chain = (chain == -1) ? 1 : 2;
                    }
                    _gemsTypeSwap(i, j, i + 1, j);
                }
                if (chain >= 0) {
                    this.possibleMove[i + "," + j] = chain;
                }
            }
        }

    }

    function _gemsTypeSwap(rol0, col0, rol1, col1) {
        var temp = _gemsType[rol0][col0];
        _gemsType[rol0][col0] = _gemsType[rol1][col1];
        _gemsType[rol1][col1] = temp;
    }

    function checkHaveChain(row, col) {
        var gemType = _gemsType[row][col];
        var vertLength = 1;
        for (var i = row - 1; i >= 0 && _gemsType[i][col] == gemType; i--, vertLength++);
        for (var i = row + 1; i < ROW && _gemsType[i][col] == gemType; i++, vertLength++);
        if (vertLength >= 3) return true;
        horzLength = 1;
        for (var i = col - 1; i >= 0 && _gemsType[row][i] == gemType; i--, horzLength++);
        for (var i = col + 1; i < ROW && _gemsType[row][i] == gemType; i++, horzLength++);
        return (horzLength >= 3);
    }


    var selectedGem = [];

    this.onSelectGem = function(gem) {
        if (selectedGem.length == 0) {
            selectedGem.push(gem);
            highlightGem(gem);
        } else if (selectedGem.length == 1) {
            var sGem0 = selectedGem[0];
            if (sGem0.row == gem.row || sGem0.col == gem.col) {
                if (Math.abs(sGem0.row - gem.row) == 1 || Math.abs(sGem0.col - gem.col) == 1) {
                    var lRow = Math.min(sGem0.row, gem.row);
                    var lCol = Math.min(sGem0.col, gem.col);
                    if (this.possibleMove.hasOwnProperty(lRow + "," + lCol)) {
                        _gemsTypeSwap(sGem0.row, sGem0.col, gem.row, gem.col);
                        gemGrid.gemSwap(sGem0, gem);
                        gemGrid.gemSwapAnimate(sGem0, gem, function() {
                            getAllChain();
                            gemGrid.removeAllChain(allChain);
                        });
                    } else {
                        gemGrid.gemSwap(sGem0, gem);
                        gemGrid.gemSwapAnimate(sGem0, gem, function() {
                            gemGrid.gemSwap(sGem0, gem);
                            gemGrid.gemSwapAnimate(sGem0, gem);
                        });
                    }
                } else {
                    selectedGem.pop();
                }
            } else {
                selectedGem.pop();
            }
            selectedGem.pop();
            deHighlightGem(sGem0);
        }
    }
    var allChain = [];

    function getAllChain() {
        allChain = [];
        var destroyList = {};
        //Get all horizontal chain
        for (var i = 0; i < ROW; i++) {
            for (var j = 0; j < COLUMN - 2;) {
                var type = _gemsType[i][j];
                if (_gemsType[i][j + 1] == type && _gemsType[i][j + 2] == type) {
                    var chainSet = [];
                    while (_gemsType[i][j] == type) {
                        destroyList[i + "," + j] = allChain.length;
                        chainSet.push(i + "," + j);
                        j++;
                    }
                    allChain.push(chainSet);
                } else {
                    j++
                }
            }
        }
        //Get all vertical chain
        for (var j = 0; j < COLUMN; j++) {
            for (var i = 0; i < ROW - 2;) {
                var type = _gemsType[i][j];
                if (_gemsType[i + 1][j] == type && _gemsType[i + 2][j] == type) {
                    var chainSet = [];
                    var chainIndex = -1;
                    while (_gemsType[i][j] == type) {
                        if (destroyList.hasOwnProperty(i + "," + j)) {
                            chainIndex = destroyList[i + "," + j];
                        }
                        chainSet.push(i + "," + j);
                        i++;
                    }
                    if (chainIndex == -1) {
                        allChain.push(chainSet);
                    } else {
                        for(var a = 0;i<chainSet.length;a++)
                        {
                            for(var b=0; j<allChain[chainIndex];b++)
                            {
                                if(chainSet[a] == allChain[chainIndex][b])
                                {
                                    continue;
                                }
                                 allChain[chainIndex].push(chainSet[a]);
                            }
                        }
                    }
                } else {
                    i++;
                }
            }
        }
    }



});

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
