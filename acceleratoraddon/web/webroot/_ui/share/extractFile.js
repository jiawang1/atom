var fs = require("fs");
var path = require("path");
var rl = require('readline');
var Q = require('q');


exports.extractCSS = function(filePath, option){
	/** ignore media type */
	return extractFile(filePath, new RegExp(/^<link.*(href=["|'].*["|'])/i), new RegExp(/css|less/)).then(function(aMap){
		console.log("css return value " + Object.prototype.toString.call(aMap));
		return  aMap.map(function(item){
			return item.replace(/.less/, ".css");
		});
	});
};

exports.extractJS = function(filePath, option) {

	return extractFile(filePath, new RegExp(/^<script.*(src=["|'].*["|'])/i), new RegExp(/js/)).then(function(aMap){
				var oMap = {};
				oMap.js = [];
				oMap.minjs = [];
				for(var i = 0, j = aMap.length; i < j; i++){
					if(aMap[i].lastIndexOf(".min.js") >= 0){
						oMap.minjs.push(aMap[i]);
					}else{
						oMap.js.push(aMap[i]);
					}
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

		if(line.search(/^(?=.*<!--\[if)(?!.*\[endif\]-->)/) >= 0){
			ieConditionComment++;
		}

		if(line.search(/^(?!.*<!--\[if)(?=.*\[endif\]-->)/) >= 0){
			ieConditionComment--;
			__commentFinishLine = true;
		}

		if(line.search(/^<%--.*--%>$|^<!--.*-->$/) >= 0){
			return;
		}

		// if(line.search(/^<%--.*/) >= 0 && line.search(/--%>/) < 0){
		if(line.search(/^(?=.*<%--)(?!.*--%>)/) >= 0){
			javaCommentCount++;			
		}

		if(line.search(/^(?=.*<!--)(?!.*-->)/) >= 0){
			// if(line.search(/^<!--.*/) >= 0 && line.search(/-->/) < 0){
			htmlCommentCount++;
		}

		if(line.search(/^(?!.*<!--)(?=.*-->)/) >= 0){
			// if(line.search(/^<!--.*/) < 0 && line.search(/-->/) >= 0){
			htmlCommentCount--;
			__commentFinishLine = true;
		}

		if(line.search(/^(?!.*<%--)(?=.*--%>)/) >= 0){
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
				aPathMap.push(path.normalize(aResult[1]));
			}
		}

	});
	
	rStream.on("close", function(){
		deferred.resolve(aPathMap);
	});

	return deferred.promise;
}

// var test = exports.extractJS("./WEB-INF/tags/responsive/template/compressible/js.tag", {});
// console.log(test);
// test.then(function(data){
// console.log("final" + Object.prototype.toString.call(data.js));
// }); 




