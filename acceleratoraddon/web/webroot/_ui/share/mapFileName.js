"use strict";

var through = require("through2");
var gutil = require('gulp-util');
var logger = require('./logger.js');
const COMBINED_JS = "combindjs",
	 COMBINED_CSS = "combindcss";

var mapFileName = function(aMap, sep) {

	var _sep = sep || "_",
		_slash = "\/";

	return through.obj(function(file, encoding, calback) {

		if (file.isNull()) {
			return callback(null, file);
		}
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-hashsum', 'Streams not supported'));
			return;
		}

		function partOfString(target, sep, before) {

			if (before) {
				return target.substring(0, target.lastIndexOf(sep));
			} else {
				return target.substring(target.lastIndexOf(sep) + 1);
			}
		}

		var aPartial = file.path.split("/");
		var sName = partOfString(aPartial[aPartial.length - 1], _sep, true);
		var hash = partOfString(aPartial[aPartial.length - 1], _sep);
		if(sName === COMBINED_JS || sName === COMBINED_CSS){
			aMap.push({
				key:sName,
				value:aPartial[aPartial.length - 1]
			});
		}else{

			var suffix = partOfString(sName, _sep);
			sName = partOfString(partOfString(sName, _sep, true), _sep) + _sep + suffix;
			file.path = partOfString(file.path, _slash, true) + "/" + sName + _sep + hash; 

			aMap.push({
				key:partOfString(aPartial[aPartial.length - 1], _sep, true),
				value:sName+ _sep + hash
			});
		}
		this.push(file);
		calback();
	});
};

module.exports = mapFileName;