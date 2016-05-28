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
import animate;
import src.GemGrid as GemGrid;
import src.Global as Global;

var Setting = Global.Setting;
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
        this.moveTxt = new ui.TextView({
            superview: this,
            x: 210,
            y: 40,
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
        this.scoreTxt = new ui.TextView({
            superview: this,
            x: 20,
            y: 40,
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
        this.targetScoreTxt = new ui.TextView({
            superview: this,
            x: 20,
            y: 70,
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

        this.on('app:start', bind(this, function() {
            this.gameStart();
            this.startTxt.setText("Tap to Start!");
        }));

    };
    var gemGrid;
    var _gemsType = [];
    var allowInput = false;
    this.currentLevel = 0;
    this.totalScore = 0;
    this.gameStart = function() {
        gemGrid = new GemGrid({
            superview: this,
        });

        this.once('InputSelect', () => {
            this.startTxt.hide();
            this.availableMove = Global.Move[this.currentLevel];
            this.targetScore = Global.Target[this.currentLevel];
            this.moveTxt.setText("Move:" + this.availableMove);
            this.scoreTxt.setText("Score:" + this.totalScore);
            this.targetScoreTxt.setText("Target:"+ this.targetScore)
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

    this.checkGameStatus = function(){
        if(this.targetScore == 0)
        {
            if(Global.Target.length == this.currentLevel + 1){
                this.startTxt.setText("Congradulation!!!\nYou beat the game!");
                this.currentLevel = 0;
            }
            else {
                this.startTxt.setText("You beat level "+ (this.currentLevel + 1) +"!");
                this.currentLevel++;
            }
            this.resetGame();
            this.gameStart();
        }
        else if(this.availableMove == 0){
            this.startTxt.setText("You lose!");
            this.currentLevel = 0;
            this.resetGame();
            this.gameStart();
        }

    }
    this.resetGame = function(){
        _gemsType = [];
        //gemGrid.gems = [];
        selectedGem = [];
        this.removeSubview(gemGrid);
        //gemGrid.clearGem();
        gemGrid = null;
        this.startTxt.show();
    }


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
        this.possibleMove = {};
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
        for (var i = col + 1; i < COLUMN && _gemsType[row][i] == gemType; i++, horzLength++);
        return (horzLength >= 3);
    }


    var selectedGem = [];

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
    this.checkMoveValid = function (row0,col0,row1,col1){
        var lRow = Math.min(row0,row1);
        var lCol = Math.min(col0,col1);
        if (this.possibleMove.hasOwnProperty(lRow + "," + lCol))
        {
                            // -1: no chain , 0 : horizontal ,1: veritical , 2 : both
            if(this.possibleMove[lRow + "," + lCol] == 2)
            {
                return true;
            }
            else if(this.possibleMove[lRow + "," + lCol] == 1)
            {
                if (col0 == col1)
                    return true;
            }
            else if(this.possibleMove[lRow + "," + lCol] == 0)
            {
                if(row0 == row1)
                    return true;
            }
        }
        return false;
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
        for (var j = 0; j < COLUMN; j++) {
            for (var i = 0; i < ROW - 2;) {
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
    this.setScore = function(chain){
        var score = chain.length * Setting.basicScore*chainCount;
        this.totalScore += score;
        this.targetScore -= score;
        if(this.targetScore < 0)
            this.targetScore = 0;
        var startX = 0;
        var startY = 0;
        for(var i = 0; i <chain.length;i++){
            var coord = Global.getCoord(chain[i][0],chain[i][1])
            startX += coord.x;
            startY += coord.y;
        }
        startX /= chain.length;
        startY /= chain.length;
        // var scoreView = this.scoreViewPool.obtainView();
        //
        // scoreView.updateOpts({x:startX,y:startY,visible:true});
        // scoreView.setText("Get Score");
        // var animator = animate(scoreView).now({x: 20,y: 40},
        //         3000).then(this.scoreViewPool.releaseView(scoreView));
        // this.anime.push(animator);

        var scoreView = new ui.TextView({
            superview: this,
            x: startX + Setting.gridX -15,
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
            zIndex:1
        });
        scoreView.setText(score);
        var animator = animate(scoreView).wait(500)
        .then({x: this.scoreTxt.style.x + 30,y:this.scoreTxt.style.y},300)
        .then(bind(this,()=>{
                     this.scoreTxt.setText("Score:" + this.totalScore);
                     this.targetScoreTxt.setText("Target:" + this.targetScore);;
                     this.removeSubview(scoreView);
                 }));

        // var gem = this.gemViewPool.obtainView();
        // gem.updateOpts({x:params.x,y:params.y,backgroundColor:"#00ffff",superview:this });
    }

    this.removeChain = function() {
        if(allChain == 0) console.log("error");
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



    this.gemFall = function() {
        for (var j = 0; j < COLUMN; j++) {
            var btmEmpty = -1;
            for (var i = ROW - 1; i >= 0; i--) {
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

    this.refillGem = function() {
        for (var j = 0; j < COLUMN; j++) {
            for (var i = 0; i < ROW; i++) {
                if (_gemsType[i][j] != -1) continue;
                var randomType = Math.floor((Math.random() * 5));
                _gemsType[i][j] = randomType;
            }
        }
    }



});



function highlightGem(gem) {
    gem.updateOpts({
        backgroundColor: '#ffffff'
    });
}

function deHighlightGem(gem) {
    gem.updateOpts({
        backgroundColor: ''
    });
}
