var fs = require("fs");
var path = require("path");
var rl = require('readline');
var Q = require('q');
var logger = require('./logger');


exports.extractCSS = function(filePath, option){
	/** ignore media type */
	return extractFile(filePath, new RegExp(/^\s*<link\s*.*(href=["|']\S*["|'])/i), new RegExp(/css|less/)).then(function(aMap){
		return  aMap.map(function(item){
			return item.replace(/.less/, ".css");
		});
	});
};

exports.extractJS = function(filePath, option) {

	return extractFile(filePath, new RegExp(/^\s*<script.*(src=["|']\S*["|'])/i), new RegExp(/js/)).then(function(aMap){
				var oMap = {};
				oMap.js = [];
				// oMap.minjs = [];
				for(var i = 0, j = aMap.length; i < j; i++){
					// if(aMap[i].lastIndexOf(".min.js") >= 0){
					// 	oMap.minjs.push(aMap[i]);
					// }else{
						oMap.js.push(aMap[i]);
					// }
				}
				return oMap;
	});

};

function extractFile(filePath, pattern, extName){
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

	rStream.on("line", function(line){
		if(line.length === 0){
			return;
		}

		var __commentFinishLine = false;

		if(line.search(/^\s*<%--.*--%>$|^\s*<!--.*-->$/) >= 0){
			return;
		}

		if(line.search(/^\s*(?=.*<!--\[if)(?!.*\[endif\]-->)/) >= 0){
			ieConditionComment++;
		}

		if(line.search(/^\s*(?!.*<!--\[if)(?=.*\[endif\]-->)/) >= 0){
			ieConditionComment = 0;
			__commentFinishLine = true;
		}

		// if(line.search(/^\s*<%--.*/) >= 0 && line.search(/--%>/) < 0){
		if(line.search(/^\s*(?=.*<%--)(?!.*--%>)/) >= 0){
			javaCommentCount++;			
		}

		if(line.search(/^\s*(?=.*<!--)(?!.*-->)/) >= 0){
			// if(line.search(/^\s*<!--.*/) >= 0 && line.search(/-->/) < 0){
			htmlCommentCount++;
		}

		if(line.search(/^\s*(?!.*<!--)(?=.*-->)/) >= 0){
			// if(line.search(/^\s*<!--.*/) < 0 && line.search(/-->/) >= 0){
			htmlCommentCount = 0;
			ieConditionComment = 0;
			__commentFinishLine = true;
		}

		if(line.search(/^\s*(?!.*<%--)(?=.*--%>)/) >= 0){
			// if(line.search(/^<%--.*/) < 0 && line.search(/--%>/) >= 0){
			javaCommentCount--;	
			__commentFinishLine = true;		
		}

		if(htmlCommentCount + javaCommentCount + ieConditionComment > 0 || __commentFinishLine){  				 // comments part
			return;
		}
		var aMatch = line.match(pattern);
		if(aMatch && aMatch.length > 1){
			var aResult = aMatch[1].split("=");

			aResult[1] = aResult[1].replace(/^"(.*)"/,"$1");

			if(aResult.length > 1 && path.extname(aResult[1]).toLowerCase().search(extName) >=0){
				aResult[1] = aResult[1].replace(/^\$\{.*\}/, "");
				if(aPathMap.indexOf(path.normalize(aResult[1])) < 0){
				aPathMap.push(path.normalize(aResult[1]));
					}
			}
		}

	});

	rStream.on("error",function(err){
		logger.log("come to error" + err);
		deferred.reject(err);
	});
	
	rStream.on("close", function(){
		deferred.resolve(aPathMap);
	});

	return deferred.promise;
}

// var test = exports.extractJS("./WEB-INF/tags/responsive/template/compressible/js.tag", {});
// logger.log(test);
// test.then(function(data){
// logger.log("final" + Object.prototype.toString.call(data.js));
// }); 




