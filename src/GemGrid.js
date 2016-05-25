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
        // this.gemViewPool = new ViewPool({
        //     ctor: Gem,
        //     initCount: COLUMN*ROW*1.2,
        //     initOpts: {
        //         superview: this,
        //         width: GEMWIDTH,
        //         height: GEMHEIGHT,
        //         backgroundColor: "#00ffff"
        //     }
        // });


    };
    this.addGem = function(params) {
        // var gem = this.gemViewPool.obtainView();
        // gem.updateOpts({x:params.x,y:params.y,backgroundColor:"#00ffff",superview:this });
        // gem.updateParams({
        //     id: params.id,
		// 	width: GEMWIDTH,
        //     height: GEMHEIGHT,
        //     row: params.row,
        //     col: params.column,
        //     gemType: params.gemType,
        //     moveCount: params.moveCount
        // });
        var gem = new Gem({
            superview: this,
            x:params.x,
            y:params.y,
            width: GEMWIDTH,
            height: GEMHEIGHT,
            gemType: params.gemType,
            moveCount: params.moveCount,
            row: params.row,
            col: params.column
        });
        return gem;

    };

    this.gems = [];

    this.allGemMove = function() {
		var lastgemAnimator;
        for (var i = 0; i < this.gems.length; i++) {
            for (var j = 0; j < this.gems[i].length; j++) {
                if (this.gems[i][j] != null && this.gems[i][j].moveCount != 0) {
                    lastgemAnimator = this.gemMove(this.gems[i][j]);
                }
            }
        }
		lastgemAnimator.then(bind(this,function(){
            resetGems(this.gems);
		this.emit("GemGrid:MoveFinish");
		}));
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
	this.destroyGem = function(gem)
	{
		 var animator = animate(gem).now({width:0,height:0},
            100);
        return animator;
	}
	var removeCounter = 0;
	var numberOfRemove= 0;
    this.removeAllChain = function(allChain) {
		var lastgemAnimator;
        for (var i = 0; i < allChain.length; i++) {
            for (var j = 0; j < allChain[i].length; j++) {
				numberOfRemove++;
                var coord = allChain[i][j].split(",");
                var gemsToRemove = []
				gemsToRemove = this.gems[coord[0]][coord[1]];
                this.gems[coord[0]][coord[1]] = null;
				this.removeGem(gemsToRemove);
            }
        }
    }
	this.removeGem = function(gemsToRemove)
	{
		this.destroyGem(gemsToRemove).then(bind(this,()=>{
					//this.gemViewPool.releaseView(gemsToRemove);
                    this.removeSubview(gemsToRemove);


                    this.checkRemoveAllFinish();
					}));
	}
	this.checkRemoveAllFinish = function()
	{
		removeCounter++;
		if(removeCounter == numberOfRemove)
		{
			removeCounter = 0;
			numberOfRemove = 0;
			this.emit("GemGrid:RemoveChainFinish");
		}
	}


	this.refillGems = function (_gemsType){
            for (var j = 0; j < COLUMN; j++) {
			var refillCnt = 0;
				for (var i = ROW - 1; i >=0; i--) {

				if(this.gems[i][j] == null)
				{
                var params = {
                    row: i,
                    column: j,
                    gemType: _gemsType[i][j],
                    x: GWIDTH / COLUMN * j,
                    y: GHEIGHT / ROW * (- 1 - refillCnt),
                    moveCount: refillCnt + 1 + i
                };
				refillCnt++;
                this.gems[i][j] = this.addGem(params);
				}
			}
        }
    }



	this.gemFall = function(){
		for(var j = 0; j < COLUMN; j++)
		{
			var btmEmpty = -1;
			for(var i = ROW-1; i>=0 ; i--)
			{
				if(this.gems[i][j]==null)
				{
					if(btmEmpty == -1)
					{
						btmEmpty = i;
					}
				}
				else
				{
					if(btmEmpty != -1)
					{
						this.gems[btmEmpty][j] = this.gems[i][j];
						this.gems[btmEmpty][j].moveCount = btmEmpty - i;
						this.gems[btmEmpty][j].row = btmEmpty;
						this.gems[i][j] = null;
						btmEmpty--;
					}
				}
			}
		}
	}


    this.selectedGem = [];


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
        for(var j = 0; j<gems[i][j].length; j++)
            gems[i].moveCount = 0;
    }
}
