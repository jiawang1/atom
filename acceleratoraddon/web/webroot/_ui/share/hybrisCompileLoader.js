var PropertiesLoader = require("./propertiesLoader");
var path = require("path");
var fs = require('fs');
var Q = require('q');
var extractor = require('./extractFile');

var aParam = [
	{"key": "enableLess", "value": "atom.config.LESS.enabled"},
	{"key": "enableCompress", "value": "atom.config.external.compress.enabled"},
	{"key": "lsssSourceFile", "value":  "atom.config.LESS.source.folder"},
	{"key": "lessDestFolder", "value": "atom.config.LESS.dest.folder"},
	{"key": "jsRootPath", "value": "atom.config.js.root.folder"},
	{"key": "cssRootPath", "value": "atom.config.css.root.folder"},
	{"key": "compressSourceFolder", "value": "atom.config.external.compress.source.filePath"},
	{"key": "deployMode", "value": "atom.config.external.mode"}
];

var configPath = path.normalize("./config.properties");


exports.generateConfigutation = function(){

	var oConfiguration = {};
	var deferred = Q.defer();

	var oLoader = new PropertiesLoader(configPath);

/*  load configuration from properties file, prepare source for gulp task */
 	oLoader.loadFile(function(err, sConfigFile){
 		if(err){
 			deferred.reject(err);		
 		}

 		for(var i = 0, j = aParam.length; i < j; i++){
 			oConfiguration[aParam[i].key] = oLoader.findPropertyValue(sConfigFile, aParam[i].value);
 		}
		/* 
			deal with LESS 
		*/
		if(!!oConfiguration.enableLess){
			if(!!oConfiguration.enableCompress || oConfiguration.deployMode.indexOf('pro') >= 0){
					if(oConfiguration.lsssSourceFile){
						var aPath = oConfiguration.lsssSourceFile.split(",");
							for(var i = 0, j = aPath.length; i < j; i++){
								aPath[i] = path.normalize(aPath[i]+ "/*.less");
						}
						oConfiguration.lsssSourceFile = aPath;
					}
			}
		}
		/**
			prepare compress config info
		*/
		if(!!oConfiguration.enableCompress){
			var jsFile = path.normalize(oConfiguration.compressSourceFolder + "/js.tag");
			var cssFile = path.normalize(oConfiguration.compressSourceFolder + "/css.tag");

			Q.all([extractor.extractCSS(cssFile), extractor.extractJS(jsFile)]).spread(function(aCSSMap, oJSMap){
				
				concatRoot(oConfiguration.jsRootPath, oJSMap.js, oJSMap.minjs);
				concatRoot(oConfiguration.cssRootPath, aCSSMap);
				oConfiguration.oJSMap = oJSMap;
				oConfiguration.aCSSMap = aCSSMap;
				deferred.resolve(oConfiguration);
				
			}).fail(function(err){
				deferred.reject(err);	
			});
		}else{
			deferred.resolve(oConfiguration);
		}

		function concatRoot(root){

			Array.prototype.slice.apply(arguments,[1]).forEach(function(_arays){
				_arays.forEach(function(item, index, current){  current[index] = path.normalize(root + item); });
			});
		}

 	});
		return  deferred.promise;
};	

// function promiseWrite(content){
// 	console.log("write file compileJson.json")
// 	return Q.denodeify(fs.writeFile("compileJson.json", JSON.stringify(content)));
// }

function test(){
	exports.generateConfigutation(); 
}


