var fs = require("fs");
var path = require("path");
var Q = require('q');

var PropertiesLoader = function(file){

	// this.options = requiredProperties;
	this.file = path.normalize(file);

};

PropertiesLoader.prototype.loadFile = function(){

	var _length = 0;
	var chunks = [];
	var deferred = Q.defer();
	var rs = fs.createReadStream(this.file);

	rs.on("open", function(fd){
		console.log("start to read file: " +  this.file);
	}.bind(this));

	rs.on("data", function(data){
		console.log("get data for: " +  this.file);
		chunks.push(data);
		_length = _length + data.length;

	}.bind(this));

	rs.on("end", function(){
		console.log("file read end for " + this.file);
		var chunk, position = 0;
		var _buffer = new Buffer(_length);

		for(var i = 0, j = chunks.length; i < j; i++){

			chunk = chunks[i];
			if(!Buffer.isBuffer(chunks[i])){
				chunk = new Buffer(chunks[i]);
			}
			chunk.copy(_buffer, position);
			position += chunk.length;

		}
		deferred.resolve(_buffer.toString());
	}.bind(this));

	rs.on("error", function(err){
		console.log("read file " + this.file + " failed : " + err);
		deferred.reject(err);
	}.bind(this));
	  
	  return deferred.promise;	
	};		

PropertiesLoader.prototype.findPropertyValue = function(target, property, seperator){
			
			return findPosition(target.length -1, target, property);

			function findPosition(index, target, prop){
				var _inx = -1;
				_inx = target.lastIndexOf(prop, index);
				if(_inx < 0){
					return "";
				}

				if(target.charAt(_inx - 1 ) === "#"){    // comments
					return findPosition(_inx -1 ,target,prop);
				}
				
				var _endInx = target.indexOf("\n", _inx);
				var _aValues = target.slice(_inx,_endInx).split("=");
				if(_aValues[0] !== prop){						// longer properties than whaat we find
					return findPosition(_inx -1 ,target,prop);
				}

				if(_aValues.length > 0 &&_aValues[1] !== undefined){
					var _rawStr = _aValues[1].replace(/\r$/,"").trim();
					return seperator?_rawStr.split(seperator):_rawStr;
				}

				return "";
			}
	};					

module.exports = PropertiesLoader;

