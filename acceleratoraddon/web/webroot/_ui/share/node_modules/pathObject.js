var isUrl = require("./helper").isUrl;
var path = require("path");

function PathObject(data) {
	this.index = data.index;
	this.path = data.path;
	this.directory = data.directory;

	if(data.options && data.options.host && data.options.port){
		this.options = data.options;
	}

	if(this.options && this.isUrl()){
		if(!this.options.path){
			this.options.path = this.path.search(/http|https/) < 0?("http:" + this.path):this.path;
		}
		this.options.headers = this.options.headers || {};
		if(!this.options.headers.Host){
			var _aMathes = this.path.match(/(?:\/\/([^\/]*))\//);
			_aMathes.length > 0 && this.options.headers.Host = _aMathes[1];
		}
	}
};

PathObject.prototype.isUrl = function () {
	var result = isUrl(this.path);
	return result;
};

PathObject.prototype.getPathDirectory = function () {
	var file = path.join(this.directory, this.path);
	var result = path.dirname(file);
	return result;
};

module.exports = PathObject;
