// This is the class for the game screen. Main game logic would happen here.
//
import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import animate;
import src.GemGrid as GemGrid;
import src.Global as Global;
import src.Particles as Particles;
import src.SoundController as SoundController;

var Setting = Global.Setting;


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
    var sound;
    this.build = function() {
        // The start and game finish text locating in the middle of screen
        this.startTxt = new ui.TextView({
            superview: this,
            x: 60,
            y: 200,
            width: 200,
            height: 36,
            autoFontSize: true,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            wrap: true,
            strokeWidth: '3',
            strokeColor: '#fff',
            color: '#F9912E',
            shadowColor: '#3A96CF'
        });
        // This text for showing available move
        this.moveTxt = new ui.TextView({
            superview: this,
            x: 210,
            y: 40,
            zIndex: 1,
            width: 100,
            height: 30,
            autoFontSize: true,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            wrap: false,
            strokeWidth: '3',
            strokeColor: '#fff',
            color: '#F9912E',
            shadowColor: '#3A96CF'
        });
        // This text for showing total score
        this.scoreTxt = new ui.TextView({
            superview: this,
            x: 20,
            y: 40,
            zIndex: 1,
            width: 250,
            height: 30,
            autoFontSize: true,
            verticalAlign: 'middle',
            horizontalAlign: 'left',
            wrap: false,
            strokeWidth: '3',
            strokeColor: '#fff',
            color: '#F9912E',
            shadowColor: '#3A96CF'
        });
        // This text for showing the remaining score to next round
        this.targetScoreTxt = new ui.TextView({
            superview: this,
            x: 20,
            y: 70,
            zIndex: 1,
            width: 250,
            height: 20,
            autoFontSize: true,
            verticalAlign: 'middle',
            horizontalAlign: 'left',
            wrap: false,
            strokeWidth: '3',
            strokeColor: '#fff',
            color: '#F9912E',
            shadowColor: '#3A96CF'
        });
        // Initialize sound controller
        sound = SoundController.getSound();
        this.on('app:start', bind(this, function() {
            sound.play("levelmusic");
            this.gameStart();
            this.startTxt.setText("Tap to Start!");
        }));
        pEngine = new Particles({
            superview: this
        });

    };
    // This is the Gem Grid object reference in this class
    var gemGrid;

    // This list store the gem type in the game
    // Used for computing and pass to GemGrid for animate and UI
    var _gemsType = [];

    // Used to control accept user input or not
    var allowInput = false;

    // Used to store current level
    this.currentLevel = 0;

    // Used to store total score.
    // Only reset when game win or lose
    this.totalScore = 0;

    // This is the start function for game play
    // This function will called when game start or pass a stage
    this.gameStart = function() {
        gemGrid = new GemGrid({
            superview: this,
        });
        this.once('InputSelect', () => {
            this.startTxt.hide();
            pEngine.showParticle = false;
            this.availableMove = Global.Move[this.currentLevel];
            this.targetScore = Global.Target[this.currentLevel];
            this.moveTxt.setText("Move:" + this.availableMove);
            this.scoreTxt.setText("Score:" + this.totalScore);
            this.targetScoreTxt.setText("Target:" + this.targetScore)
            this.initizeGrid();
            this.getAllPossibleMove();
            gemGrid.on('InputSelect', bind(this, function(event, point) {
                if (allowInput) {
                    this.onSelectGem(gemGrid.getSelectGem(point));
                }
            }));
        });
        this.once("GemGrid:MoveFinish", allowInput = true);
    }

    // This function is used to check the game status - win / lose / normal
    // This function will be called after player move and gem stop falling
    this.checkGameStatus = function() {
            if (this.targetScore == 0) {
                if (Global.Target.length == this.currentLevel + 1) {
                    this.startTxt.setText("Congradulation!!!\nYou beat the game!");
                    this.totalScore = 0;
                    this.currentLevel = 0;
                } else {
                    this.startTxt.setText("You beat level " + (this.currentLevel + 1) + "!");
                    this.currentLevel++;
                }
                this.resetGame();
                pEngine.showParticle = true;
                this.gameStart();
            } else if (this.availableMove == 0) {
                this.startTxt.setText("You lose!");
                this.currentLevel = 0;
                this.totalScore = 0;
                this.resetGame();
                this.gameStart();
            }

        }

    // This function is used to reset the game
    // This will be called after checkGameStatus() only
    this.resetGame = function() {
        _gemsType = [];
        selectedGem = [];
        this.removeSubview(gemGrid);
        gemGrid = null;
        this.startTxt.show();
    }

    //This function is used to inital the _gemsType list accoring the setting
    this.initizeGrid = function() {
        do {
            this.possibleMove = {};
            for (var i = 0; i < Setting.row; i++) {
                var rows = [];
                for (var j = 0; j < Setting.column; j++) {
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

    // This object store all the possible move currently
    this.possibleMove = {};

    // This function calculate all the possible move and store to this.possibleMove
    this.getAllPossibleMove = function() {
        this.possibleMove = {};
        for (var i = 0; i < Setting.row; i++) {
            for (var j = 0; j < Setting.column; j++) {
                // -1: no chain , 0 : horizontal ,1: veritical , 2 : both
                var chain = -1;
                if (j + 1 < Setting.column) {
                    _gemsTypeSwap(i, j, i, j + 1);
                    if (checkHaveChain(i, j) || checkHaveChain(i, j + 1)) {
                        chain = 0;
                    }
                    _gemsTypeSwap(i, j, i, j + 1);
                }
                if (i + 1 < Setting.row) {
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

    //This function is used to swap gem type in _gemsType
    function _gemsTypeSwap(rol0, col0, rol1, col1) {
        var temp = _gemsType[rol0][col0];
        _gemsType[rol0][col0] = _gemsType[rol1][col1];
        _gemsType[rol1][col1] = temp;
    }

    //This function is used to check the gem located in row , col can found chain or not
    function checkHaveChain(row, col) {
        var gemType = _gemsType[row][col];
        var vertLength = 1;
        for (var i = row - 1; i >= 0 && _gemsType[i][col] == gemType; i--, vertLength++);
        for (var i = row + 1; i < Setting.row && _gemsType[i][col] == gemType; i++, vertLength++);
        if (vertLength >= 3) return true;
        horzLength = 1;
        for (var i = col - 1; i >= 0 && _gemsType[row][i] == gemType; i--, horzLength++);
        for (var i = col + 1; i < Setting.column && _gemsType[row][i] == gemType; i++, horzLength++);
        return (horzLength >= 3);
    }

    //This list is used to store the player selected Gem
    var selectedGem = [];

    //This function is called when player select gem
    // If it is the second selection of gem, it will check the player move validity
    // If it is not valid, it will cancel the selection or have animation of swap and swap backgroundColor
    // If it is valid it will start the removal of gems
    this.onSelectGem = function(gem) {
        if (selectedGem.length == 0) {
            selectedGem.push(gem);
            highlightGem(gem);
        } else if (selectedGem.length == 1) {
            var sGem0 = selectedGem[0];
            deHighlightGem(sGem0);
            if ((sGem0.row == gem.row || sGem0.col == gem.col) &&
                (Math.abs(sGem0.row - gem.row) == 1 || Math.abs(sGem0.col - gem.col) == 1)) {

                if (this.checkMoveValid(sGem0.row, sGem0.col, gem.row, gem.col)) {
                    allowInput = false;
                    _gemsTypeSwap(sGem0.row, sGem0.col, gem.row, gem.col);
                    gemGrid.gemSwap(sGem0, gem);
                    gemGrid.gemSwapAnimate(sGem0, gem, bind(this, function() {
                        this.possibleMove = {};
                        getAllChain();
                        this.removeChain();
                    }));
                } else {
                    gemGrid.gemSwap(sGem0, gem);
                    gemGrid.gemSwapAnimate(sGem0, gem, function() {
                        gemGrid.gemSwap(sGem0, gem);
                        gemGrid.gemSwapAnimate(sGem0, gem, () => {
                            allowInput = true;
                        });
                    });
                }
            }
            selectedGem.pop();
        } else {
            Console.log("error");
        }
    }

    // This fucntion is used to check the player move in the this.possibleMove list or not
    this.checkMoveValid = function(row0, col0, row1, col1) {
        var lRow = Math.min(row0, row1);
        var lCol = Math.min(col0, col1);
        if (this.possibleMove.hasOwnProperty(lRow + "," + lCol)) {
            // -1: no chain , 0 : horizontal ,1: veritical , 2 : both
            if (this.possibleMove[lRow + "," + lCol] == 2) {
                return true;
            } else if (this.possibleMove[lRow + "," + lCol] == 1) {
                if (col0 == col1)
                    return true;
            } else if (this.possibleMove[lRow + "," + lCol] == 0) {
                if (row0 == row1)
                    return true;
            }
        }
        return false;
    }


    var allChain = [];
    //This function is used to get all chain formed and passed it to allChain  list
    function getAllChain() {
        allChain = [];
        var destroyList = {};
        //Get all horizontal chain
        for (var i = 0; i < Setting.row; i++) {
            for (var j = 0; j < Setting.column - 2;) {
                var type = _gemsType[i][j];
                if (_gemsType[i][j + 1] == type && _gemsType[i][j + 2] == type) {
                    var chainSet = [];
                    while (j < _gemsType[i].length && _gemsType[i][j] == type) {
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
        for (var j = 0; j < Setting.column; j++) {
            for (var i = 0; i < Setting.row - 2;) {
                var type = _gemsType[i][j];
                if (_gemsType[i + 1][j] == type && _gemsType[i + 2][j] == type) {
                    var chainSet = [];
                    var chainIndex = -1;
                    while (i < _gemsType.length && _gemsType[i][j] == type) {
                        if (destroyList.hasOwnProperty(i + "," + j)) {
                            chainIndex = destroyList[i + "," + j];
                        }
                        chainSet.push(i + "," + j);
                        i++;
                    }
                    if (chainIndex == -1) {
                        allChain.push(chainSet);
                    } else {
                        for (var a = 0; a < chainSet.length; a++) {
                            if (allChain[chainIndex].indexOf(chainSet[a]) < 0)
                                allChain[chainIndex].push(chainSet[a]);
                        }
                    }

                } else {
                    i++;
                }
            }
        }
    }

    var chainCount = 0;
    // This function is called when there is chain to remove in game
    // This is used for setting the score and show the animation of score
    // The score is calcuated based on the total chainCount currently having
    this.setScore = function(chain) {
        var score = chain.length * Setting.basicScore * chainCount;
        this.totalScore += score;
        this.targetScore -= score;
        if (this.targetScore < 0)
            this.targetScore = 0;
        var startX = 0;
        var startY = 0;
        for (var i = 0; i < chain.length; i++) {
            var coord = Global.getCoord(chain[i][0], chain[i][1])
            startX += coord.x;
            startY += coord.y;
        }
        startX /= chain.length;
        startY /= chain.length;

        var scoreView = new ui.TextView({
            superview: this,
            x: startX + Setting.gridX - 15,
            y: startY + Setting.gridY,
            width: 60,
            height: 30,
            autoFontSize: true,
            verticalAlign: 'middle',
            horizontalAlign: 'center',
            wrap: false,
            strokeWidth: '3',
            strokeColor: '#fff',
            color: '#F9912E',
            shadowColor: '#3A96CF',
            zIndex: 1
        });
        scoreView.setText(score);
        sound.play("whack");
        var animator = animate(scoreView).wait(500)
            .then({
                x: this.scoreTxt.style.x + 30,
                y: this.scoreTxt.style.y
            }, 300)
            .then(bind(this, () => {
                this.scoreTxt.setText("Score:" + this.totalScore);
                this.targetScoreTxt.setText("Target:" + this.targetScore);;
                this.removeSubview(scoreView);
            }));
    }

    // This function is used for removing chain
    // This will update the _gemsType and also call GemGrid to update UI
    this.removeChain = function() {
        if (allChain == 0) console.log("error");
        chainCount += allChain.length;
        for (var i = 0; i < allChain.length; i++) {
            var chain = [];
            for (var j = 0; j < allChain[i].length; j++) {
                var coord = allChain[i][j].split(",");
                chain.push(coord);
                _gemsType[coord[0]][coord[1]] = -1;
            }
            this.setScore(chain);
        }
        gemGrid.once("GemGrid:RemoveChainFinish", bind(this, function() {
            this.gemFall();
            gemGrid.gemFall();
            this.refillGem();
            gemGrid.refillGems(_gemsType);
            this.checkChainAfterFall();
            gemGrid.allGemMove();
        }));

        gemGrid.removeAllChain(allChain);
    }

    //This function is used to check Chain after gem falling
    //If there is chain founded after gem falling, it will restart the process
    // of removing chain again
    this.checkChainAfterFall = function() {
        gemGrid.once("GemGrid:MoveFinish", bind(this, function() {
            getAllChain();
            if (allChain != 0) {
                this.removeChain();
            } else {
                this.getAllPossibleMove();
                chainCount = 0;
                allowInput = true;
                this.availableMove--;
                this.moveTxt.setText("Move:" + this.availableMove);
                this.checkGameStatus();
            }
        }));
    }


    //This function is used to calcuated the _gemsType after gem removing
    // This gem will move down if there is gap
    this.gemFall = function() {
        for (var j = 0; j < Setting.column; j++) {
            var btmEmpty = -1;
            for (var i = Setting.row - 1; i >= 0; i--) {
                if (_gemsType[i][j] == -1) {
                    if (btmEmpty == -1) {
                        btmEmpty = i;
                    }
                } else {
                    if (btmEmpty != -1) {
                        _gemsType[btmEmpty][j] = _gemsType[i][j];
                        _gemsType[i][j] = -1;
                        btmEmpty--;
                    }
                }
            }
        }
    }
    //This function is used to add back the gems type after gem removing and fill
    // the gap
    this.refillGem = function() {
        for (var j = 0; j < Setting.column; j++) {
            for (var i = 0; i < Setting.row; i++) {
                if (_gemsType[i][j] != -1) continue;
                var randomType = Math.floor((Math.random() * 5));
                _gemsType[i][j] = randomType;
            }
        }
    }



});


// This function is used to highlight Gem to show user selection
function highlightGem(gem) {
    gem.updateOpts({
        backgroundColor: '#ffffff'
    });
}
// This function is used to dehighlight Gem
function deHighlightGem(gem) {
    gem.updateOpts({
        backgroundColor: ''
    });
}
