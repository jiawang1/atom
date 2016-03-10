"use strict";
var fs = require("fs"),
	path = require("path"),
	rl = require('readline'),
	Q = require('q'),
	glob = require("glob"),
	logger = require('./logger');

const FORMAT_JS = "_js",
	FORMAT_CSS = "_css",
	FILE_FORMAT = ".jsp";


exports.extractCSS = function(filePath, option) {
	/** ignore media type */
	return extractFile(filePath, new RegExp(/^\s*<link\s*.*(href=["|']\S*["|'])/i), new RegExp(/css|less/)).then(function(aMap) {
		return aMap.map(function(item) {
			return item.replace(/.less/, ".css");
		});
	});
};

exports.extractJS = function(filePath, option) {

	return extractFile(filePath, new RegExp(/^\s*<script.*(src=["|']\S*["|'])/i), new RegExp(/js/)).then(function(aMap) {
		var oMap = {};
		oMap.js = [];
		// oMap.minjs = [];
		for (var i = 0, j = aMap.length; i < j; i++) {
			// if(aMap[i].lastIndexOf(".min.js") >= 0){
			// 	oMap.minjs.push(aMap[i]);
			// }else{
			oMap.js.push(aMap[i]);
			// }
		}
		return oMap;
	});

};

exports.extractAdditionalResource = function(root, aGlobs) {
	var deferred = Q.defer(),
		aFinalGlob = [],
		aFileCollection = [];

	aGlobs.sort(function(item1, item2) {
		return item2.length - item1.length;
	});

	logger.log("aGlobs :" + aGlobs);
	aGlobs.forEach(function(item, index) {
		
		if (item.slice(item.length - 5) === "*.jsp") {
			item = item.slice(0, item.lastIndexOf("/"));
		}
		if (item.indexOf("./") === 0) {
			item = item.slice(1);
		}

		var isReplaced = aFinalGlob.some(function(ta, inx, arr) {
			if (ta.indexOf(item) >= 0) {
				arr[inx] = item;
				return true;
			}
			return false;
		});
		if (!isReplaced) {
			aFinalGlob.push(item);
		}

	});

	Q.all(aFinalGlob.map(function(item) {
		var _deferred = Q.defer();
		item = path.join(root, item ,"/**/*.jsp");
		glob(item, function(err, aFiles) {
			if (err) {
				_deferred.reject(err);
				return;
			}
			_deferred.resolve(aFiles);
		});
		return _deferred.promise;

	})).then(function(files) {
		// logger.log("JSPFiles");
		// logger.log(files);
		var JSPFiles = files.reduce(function(pre, curr) {
			return pre.concat(curr);
		});
		// logger.log("JSPFiles" + JSPFiles);
		Q.all(JSPFiles.map(function(file, index) {
			return __extractFile(file, function(oFileMap, line) { // call back handler		

				var aMatch = line.match(/^\s*<link\s*.*(href=["|']\S*["|'])|^\s*<script.*(src=["|']\S*["|'])/i);
				if (aMatch && aMatch.length > 2) {

					if (aMatch[1]) { //	css file

						if (!oFileMap[FORMAT_CSS]) {
							oFileMap[FORMAT_CSS] = [];
						}
						__orgnizeFilePath(oFileMap[FORMAT_CSS], aMatch[1]);

					} else { // js file
						if (!oFileMap[FORMAT_JS]) {
							oFileMap[FORMAT_JS] = [];
						}
						__orgnizeFilePath(oFileMap[FORMAT_JS], aMatch[2]);
					}

				}

			}, function(line) { // should start call back
				return line.search(/<.*:optimize/i) >= 0;
			}, function(line) { //should end call back
				return line.search(/<\/.*:optimize>/i) >= 0;
			});

		})).then(function(aResults) {
			var oFinalMap = {
				aJSMap: [],
				aCSSMap: []
			};

			aResults.forEach(function(item, index) {

				if(item.value[FORMAT_CSS]){
					oFinalMap.aCSSMap.push({
						key: item.key+ FORMAT_CSS,
						value:item.value[FORMAT_CSS]
					});
				}


				if(item.value[FORMAT_JS]){
					oFinalMap.aJSMap.push({
						key:item.key+ FORMAT_JS,
						value:item.value[FORMAT_JS]
					});
				}

			});

			deferred.resolve(oFinalMap);
		}).fail(function(err){
			deferred.reject(err);
		});
	}, function(err) {
		logger.error(err);
		deferred.reject(err);
	});

	return deferred.promise;
};

function __orgnizeFilePath(aContainer, filePath) {

	var aResult = filePath.split("=");

	if (aResult.length > 1) {
		aResult[1] = path.normalize(aResult[1].replace(/^"(.*)"/, "$1").replace(/^\$\{.*\}/, ""));
		if (aContainer.indexOf(aResult[1]) < 0) {
			logger.log("need result");
			logger.log(aResult[1]);
			aContainer.push(aResult[1].replace(/(.*)\.less$/i, "$1" + ".css"));
		}

	}
}

function __extractFile(filePath, handleResult, shouldStart, shouldEnd) {

	var javaCommentCount = 0,
		htmlCommentCount = 0,
		ieConditionComment = 0,
		isStart = false,
		isEnd = false,
		deferred = Q.defer();

	// deferred.number = extName;
	var oPathMap = {
		key: '',
		value: {}
	};
	var fPath = path.normalize(filePath);

	if (filePath.slice(filePath.length - 4) === ".jsp") {

		/* only need partial path which after WEB-INF , and / should be replaced to _ since this is Java variable*/
		filePath = filePath.slice(0, filePath.length - 4);
		oPathMap.key = filePath.replace(/^.*(\/WEB-INF\/.*)$/i, "$1").replace(/\//g, "_");

	} else {

		//TODO for javascript.tag/stylesheettag
	}
	var inputStream = fs.createReadStream(fPath);
	var rStream = rl.createInterface({
		input: inputStream
	});

	rStream.on("line", function(line) {
		if (line.length === 0) {
			return;
		}

		var _commentFinishLine = false;

		if (line.search(/^\s*<%--.*--%>$|^\s*<!--.*-->$/) >= 0) {
			return;
		}

		if (line.search(/^\s*(?=.*<!--\[if)(?!.*\[endif\]-->)/) >= 0) {
			ieConditionComment++;
		}

		if (line.search(/^\s*(?!.*<!--\[if)(?=.*\[endif\]-->)/) >= 0) {
			ieConditionComment = 0;
			_commentFinishLine = true;
		}

		// if(line.search(/^\s*<%--.*/) >= 0 && line.search(/--%>/) < 0){
		if (line.search(/^\s*(?=.*<%--)(?!.*--%>)/) >= 0) {
			javaCommentCount++;
		}

		if (line.search(/^\s*(?=.*<!--)(?!.*-->)/) >= 0) {
			// if(line.search(/^\s*<!--.*/) >= 0 && line.search(/-->/) < 0){
			htmlCommentCount++;
		}

		if (line.search(/^\s*(?!.*<!--)(?=.*-->)/) >= 0) {
			// if(line.search(/^\s*<!--.*/) < 0 && line.search(/-->/) >= 0){
			htmlCommentCount = 0;
			ieConditionComment = 0;
			_commentFinishLine = true;
		}

		if (line.search(/^\s*(?!.*<%--)(?=.*--%>)/) >= 0) {
			// if(line.search(/^<%--.*/) < 0 && line.search(/--%>/) >= 0){
			javaCommentCount--;
			_commentFinishLine = true;
		}

		if (htmlCommentCount + javaCommentCount + ieConditionComment > 0 || _commentFinishLine) { // comments part
			return;
		}

		if (isStart || (isStart = (shouldStart ? shouldStart(line) : false))) {
			if (!isEnd && (isEnd = (shouldEnd ? shouldEnd(line):false))) { //means optimaze tag end, should stop
				rStream.pause();
				rStream.close();
				logger.log("close is called");
				rStream.input&&rStream.input.destroy&&rStream.input.destroy();
			} else { // read content, should be source file
				if(!isEnd){
					logger.log("this the line" + line);
					handleResult(oPathMap.value, line);
				}
			}
		}
	});

	rStream.on("error", function(err) {
		logger.error("come to error" + err);
		deferred.reject(err);
	});

	rStream.on("close", function() {
		deferred.resolve(oPathMap);
	});
	return deferred.promise;

}

function extractFile(filePath, pattern, extName) {
	var javaCommentCount = 0,
		htmlCommentCount = 0,
		ieConditionComment = 0,
		deferred = Q.defer();

	deferred.number = extName;
	var aPathMap = [];
	var fPath = path.normalize(filePath);

	var rStream = rl.createInterface({
		input: fs.createReadStream(fPath)
	});

	rStream.on("line", function(line) {
		if (line.length === 0) {
			return;
		}

		var _commentFinishLine = false;

		if (line.search(/^\s*<%--.*--%>$|^\s*<!--.*-->$/) >= 0) {
			return;
		}

		if (line.search(/^\s*(?=.*<!--\[if)(?!.*\[endif\]-->)/) >= 0) {
			ieConditionComment++;
		}

		if (line.search(/^\s*(?!.*<!--\[if)(?=.*\[endif\]-->)/) >= 0) {
			ieConditionComment = 0;
			_commentFinishLine = true;
		}

		// if(line.search(/^\s*<%--.*/) >= 0 && line.search(/--%>/) < 0){
		if (line.search(/^\s*(?=.*<%--)(?!.*--%>)/) >= 0) {
			javaCommentCount++;
		}

		if (line.search(/^\s*(?=.*<!--)(?!.*-->)/) >= 0) {
			// if(line.search(/^\s*<!--.*/) >= 0 && line.search(/-->/) < 0){
			htmlCommentCount++;
		}

		if (line.search(/^\s*(?!.*<!--)(?=.*-->)/) >= 0) {
			// if(line.search(/^\s*<!--.*/) < 0 && line.search(/-->/) >= 0){
			htmlCommentCount = 0;
			ieConditionComment = 0;
			_commentFinishLine = true;
		}

		if (line.search(/^\s*(?!.*<%--)(?=.*--%>)/) >= 0) {
			// if(line.search(/^<%--.*/) < 0 && line.search(/--%>/) >= 0){
			javaCommentCount--;
			_commentFinishLine = true;
		}

		if (htmlCommentCount + javaCommentCount + ieConditionComment > 0 || _commentFinishLine) { // comments part
			return;
		}
		var aMatch = line.match(pattern);
		if (aMatch && aMatch.length > 1) {
			var aResult = aMatch[1].split("=");

			aResult[1] = aResult[1].replace(/^"(.*)"/, "$1");

			if (aResult.length > 1 && path.extname(aResult[1]).toLowerCase().search(extName) >= 0) {
				aResult[1] = aResult[1].replace(/^\$\{.*\}/, "");
				if (aPathMap.indexOf(path.normalize(aResult[1])) < 0) {
					aPathMap.push(path.normalize(aResult[1]));
				}
			}
		}

	});

	rStream.on("error", function(err) {
		logger.log("come to error" + err);
		deferred.reject(err);
	});

	rStream.on("close", function() {
		deferred.resolve(aPathMap);
	});

	return deferred.promise;
}

// var test = exports.extractJS("./WEB-INF/tags/responsive/template/compressible/js.tag", {});
// logger.log(test);
// test.then(function(data){
// logger.log("final" + Object.prototype.toString.call(data.js));
// });