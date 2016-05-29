//This class is for global setting and function
var Global = Class(function() {
  this.Target = [3000,5000,7000,9000,13000];
  this.Move = [15,12,12,10,9];
  this.Setting = {
     column : 10,
     row : 8,
     gridWidth : 300,
     gridHeight : 250,
     gridX : 11,
     gridY : 149,
     // the time for move one gem height;
     moveTime : 100,
     basicScore : 60
  }
  var gemWidth = this.Setting.gridWidth/this.Setting.column;
  var gemHeight =  this.Setting.gridHeight/this.Setting.row;

//This is used for getGoord of gem 
this.getCoord = function(row, col) {
    return {
        x: gemWidth * col,
        y: gemHeight * row
    };
}

});
exports = new Global();
