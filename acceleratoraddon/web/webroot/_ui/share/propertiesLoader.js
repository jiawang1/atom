var fs = require("fs");
var path = require("path");

var count = 0;

var PropertiesLoader = function(file){

	// this.options = requiredProperties;
	this.file = path.normalize(file);

};

PropertiesLoader.prototype.loadFile = function(cb){

	var rs = fs.createReadStream(this.file);
	var _length = 0;
	var chunks = [];
	var that = this;

	rs.on("open", function(fd){
		console.log("start to read file: " +  that.file);
	});

	rs.on("data", function(data){
		chunks.push(data);
		_length = _length + data.length;
		// console.log("read count: " + count++);

	});

	rs.on("end", function(){
		console.log("file read end");
		var chunk, position = 0;
		var _buffer = new Buffer(_length);

		for(var i = 0, j = chunks.length; i < j; i++){

			chunk = chunks[i];
			// console.log("typeis : " + Object.prototype.toString.call(chunk));
			if(!Buffer.isBuffer(chunks[i])){
				chunk = new Buffer(chunks[i]);
			}
			chunk.copy(_buffer, position);
			position += chunk.length;

		}
		 cb(null,_buffer.toString());
		// console.log(configuration);
	});

	rs.on("error", function(err){
		console.log("read file " + that.file + " failed");
		console.log(err);
		cb(err);
	});

	};		

	PropertiesLoader.prototype.findPropertyValue = function(target, property, seperator){

			var _startInx = target.length - 1;
			var compressInx = findPosition(_startInx, target, property);
			var _endInx = target.indexOf("\n", compressInx);
			var _aValues = target.slice(compressInx,_endInx).split("=");
				if(_aValues.length > 0 &&_aValues[1] !== undefined){
					var _rawStr = _aValues[1].replace(/\r$/,"").trim();
					return seperator?_rawStr.split(seperator):_rawStr;
			}

			function findPosition(index, target, pattern){

				var _inx = 0;
				_inx = target.lastIndexOf(pattern, index);
				if(_inx > 0 && target.charAt(_inx - 1 ) === "#"){
					findPosition(_inx,target,pattern );
				}
				return _inx;
			}
	};					

module.exports = PropertiesLoader;

