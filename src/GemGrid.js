import animate;
import src.Gem as Gem;
import ui.View;
import ui.TextView;
import device;
import ui.ViewPool as ViewPool;
import src.Global as Global;

var Setting = Global.Setting;
var gemWidth = Global.Setting.gridWidth/Global.Setting.column;
var gemHeight = Global.Setting.gridHeight/Global.Setting.row;
exports = Class(ui.View, function(supr) {
    this.init = function(opts) {
        opts = merge(opts, {
            x: Setting.gridX,
            y: Setting.gridY,
            width: Setting.gridWidth,
            height: Setting.gridHeight
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
            width: gemWidth,
            height: gemHeight,
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
        this.gems = [];
        for (var i = 0; i < Setting.row; i++) {
            var gemRows = [];
            for (var j = 0; j < Setting.column; j++) {
                var params = {
                    row: i,
                    column: j,
                    gemType: _gemsType[i][j],
                    x: gemWidth * j,
                    y: gemHeight * (i - Setting.row - 1),
                    moveCount: Setting.row + 1
                };
                gemRows.push(this.addGem(params));
            }
            this.gems.push(gemRows);
        }
        this.allGemMove();
    };


    this.gemMove = function(gem) {
        var animator = animate(gem).now(Global.getCoord(gem.row, gem.col),
            Setting.moveTime * gem.moveCount);
        return animator;
    }
	this.destroyGem = function(gem)
	{
		 var animator = animate(gem.gemImg).now({width:0,height:0},
            3000);
        return animator;
	}
	var removeCounter = 0;
	var numberOfRemove= 0;
    this.removeAllChain = function(allChain) {
		var lastgemAnimator;
        for (var i = 0; i < allChain.length; i++) {
            for (var j = 0; j < allChain[i].length; j++) {

				numberOfRemove++;
                var position = allChain[i][j].split(",");
                var gemsToRemove;
				gemsToRemove = this.gems[position[0]][position[1]];
                this.gems[position[0]][position[1]] = null;
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
            for (var j = 0; j < Setting.column; j++) {
			var refillCnt = 0;
				for (var i = Setting.row - 1; i >=0; i--) {

				if(this.gems[i][j] == null)
				{
                var params = {
                    row: i,
                    column: j,
                    gemType: _gemsType[i][j],
                    x: gemWidth * j,
                    y: gemHeight * (- 1 - refillCnt),
                    moveCount: refillCnt + 1 + i
                };
				refillCnt++;
                this.gems[i][j] = this.addGem(params);
				}
			}
        }
    }



	this.gemFall = function(){
		for(var j = 0; j < Setting.column; j++)
		{
			var btmEmpty = -1;
			for(var i = Setting.row-1; i>=0 ; i--)
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
        var col = Math.floor(point.x / Setting.gridWidth * Setting.column);
        var rol = Math.floor(point.y / Setting.gridHeight * Setting.row);
        return this.gems[rol][col];
    }
    this.clearGem = function(){
        this.gems = [];
    }
});

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
