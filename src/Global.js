var Global = Class(function() {
  this.Target = [100,100,100,100,100];
  this.Move = [15,12,10,8,6];
  this.Setting = {
     column : 10,
     row : 8,
     gridWidth : 300,
     gridHeight : 250,
     gridX : 11,
     gridY : 149,
     moveTime : 100,
     basicScore : 60
  }
  var gemWidth = this.Setting.gridWidth/this.Setting.column;
  var gemHeight =  this.Setting.gridHeight/this.Setting.row;
this.getCoord = function(row, col) {
    return {
        x: gemWidth * col,
        y: gemHeight * row
    };
}

});
exports = new Global();
