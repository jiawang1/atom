"use strict";

var through = require("through2");
var gutil = require('gulp-util');
var logger = require('./logger.js');

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
		var _newName = partOfString(file.path, _slash);
		aMap.push({
			key:partOfString(_newName, _sep, true),
			value:_newName
		});
		this.push(file);
		calback();
	});
};

module.exports = mapFileName;