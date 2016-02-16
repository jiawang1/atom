"use strict";

var through = require("through2");
var crypto = require('crypto');
var gutil = require('gulp-util');

var generateHash = function(opt){

	var options = {
		hash: 'sha1'
		// extName : /^(.*)(\.js|\.css)$/
	};
	for(var att in opt){
		if(opt.hasOwnProperty(att)){
			options[att] = opt[att];
		}
	}

	return through.obj(function(file, encoding, calback){

		if (file.isNull()) {
            return callback(null, file);
        }
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-hashsum', 'Streams not supported'));
			return;
		}

		var _digest = crypto
			.createHash(options.hash)
			.update(file.contents, 'binary')
			.digest('hex');
			file.path = file.path.replace(/^(.*)(\.js|\.css)$/, "$1" +"_" + _digest + "$2");
			
			this.push(file);
			calback();
	});
};

module.exports = generateHash;
