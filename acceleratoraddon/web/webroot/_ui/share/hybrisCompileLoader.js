var PropertiesLoader = require("./propertiesLoader");
var path = require("path");
var fs = require('fs');
var Q = require('q');
var extractor = require('./extractFile');

var aParam = [
	{"key": "enableLess", "value": "atom.config.LESS.enabled"},
	{"key": "enableCompress", "value": "atom.config.compress.enabled"},
	{"key": "lessSourceFile", "value":  "atom.config.LESS.source.folder"},
	{"key": "lessDestFolder", "value": "atom.config.LESS.dest.folder"},
	{"key": "jsRootPath", "value": "atom.config.js.root.folder"},
	{"key": "cssRootPath", "value": "atom.config.css.root.folder"},
	{"key": "combindJSDest", "value": "atom.config.compress.js.dest.filePath"},
	{"key": "combindCSSDest", "value": "atom.config.compress.css.dest.filePath"},
	{"key": "buildProxyHost", "value": "atom.config.build.env.proxy.host"},
	{"key": "buildProxyPort", "value": "atom.config.build.env.proxy.port"},
	{"key": "enableHint", "value": "atom.config.jshint.enable"},
	{"key": "enableHintExtract", "value": "atom.config.jshint.extract.enable"},
	{"key": "hintExtractFolders", "value": "atom.config.jshint.extract.folder","seperator":","},
	{"key": "compressSourceFolder", "value": "atom.config.compress.sourceTag.folder"}
];

exports.generateConfigutation = function(oConfiguration){

	var deferred = Q.defer();
	var configPath = path.join( oConfiguration.currentPath + "/config.properties");
	console.log("current config " + configPath);
	var oLoader = new PropertiesLoader(configPath);

/*  load configuration from properties file, prepare source for gulp task */
 	oLoader.loadFile(function(err, sConfigFile){
 		if(err){
 			deferred.reject(err);		
 		}

 		for(var i = 0, j = aParam.length; i < j; i++){
 			var _value = oLoader.findPropertyValue(sConfigFile, aParam[i].value, aParam[i].seperator);
			oConfiguration[aParam[i].key] = prepareParam(_value);

 		}

 		function prepareParam(param){
 			if(typeof _value !== "string"){
 				return _value.map(function(value){
 					return path.isAbsolute(value)?toRelativePath(value):value;
 				});
 			}else{
 				return path.isAbsolute(param)?toRelativePath(param):param;
 			}
 		}
		/* 
			deal with LESS 
		*/
		if(!!oConfiguration.enableLess){
			if(!!oConfiguration.enableCompress || !oConfiguration.devEnable){
					if(oConfiguration.lessSourceFile){
						var aPath = oConfiguration.lessSourceFile.split(",");
							for(var i = 0, j = aPath.length; i < j; i++){
								aPath[i] = path.normalize(aPath[i]+ "/*.less");
						}
						oConfiguration.lessSourceFile = aPath;
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

		function toRelativePath(path){
			if(path.indexOf("/") === 0 && path.indexOf("webroot") < 0 && path.indexOf("//") !== 0){
				return "." + path;
			}
			return path;
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


