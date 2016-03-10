"use strict";
var PropertiesLoader = require("./propertiesLoader"),
	path = require("path"),
	fs = require('fs'),
	Q = require('q'),
	extractor = require('./extractFile'),
	logger = require('./logger');

const SEPERATOR = ",",
	ADDON_ROOT = "./_ui/",
	PROJECT_FILE = "project.properties";

var aParam = [{
	"key": "enableLess",
	"value": "atom.config.LESS.enabled"
}, {
	"key": "enableCompress",
	"value": "atom.config.compress.enabled"
}, {
	"key": "lessSourceFile",
	"value": "atom.config.LESS.source.folder"
}, {
	"key": "lessDestFolder",
	"value": "atom.config.LESS.dest.folder"
}, {
	"key": "jsRootPath",
	"value": "atom.config.js.root.folder"
}, {
	"key": "cssRootPath",
	"value": "atom.config.css.root.folder"
}, {
	"key": "combindJSDest",
	"value": "atom.config.compress.js.dest.filePath"
}, {
	"key": "combindCSSDest",
	"value": "atom.config.compress.css.dest.filePath"
}, {
	"key": "buildProxyHost",
	"value": "atom.config.build.env.proxy.host"
}, {
	"key": "buildProxyPort",
	"value": "atom.config.build.env.proxy.port"
}, {
	"key": "enableHint",
	"value": "atom.config.jshint.enable"
}, {
	"key": "aAdditionalSource",
	"value": "atom.config.addtional.source",
	"seperator": ","
}, {
	"key": "enableHintExtract",
	"value": "atom.config.jshint.extract.enable"
}, {
	"key": "hintExtractFolders",
	"value": "atom.config.jshint.extract.folder",
	"seperator": ","
}, {
	"key": "compressSourceFolder",
	"value": "atom.config.compress.sourceTag.folder"
}];

exports.generateConfigutation = function(oConfiguration) {

	var deferred = Q.defer();
	var configPath = path.join(oConfiguration.currentPath + "/config.properties");
	logger.log("current config " + configPath);
	var oLoader = new PropertiesLoader(configPath);

	/*  load configuration from properties file, prepare source for gulp task */
	oLoader.loadFile().then(
		function(sConfigFile) {
			for (var i = 0, j = aParam.length; i < j; i++) {
				var _value = oLoader.findPropertyValue(sConfigFile, aParam[i].value, aParam[i].seperator);

				oConfiguration[aParam[i].key] = prepareParam(_value);
				logger.log(aParam[i].key + ":" + oConfiguration[aParam[i].key]);

			}

			function prepareParam(param) {
				if (typeof _value !== "string") {
					return _value.map(function(value) {
						return path.isAbsolute(value) ? toRelativePath(value) : value;
					});
				} else {
					return path.isAbsolute(param) ? toRelativePath(param) : param;
				}
			}
			/* 
				deal with LESS 
			*/
			if (!!oConfiguration.enableLess) {
				if (!!oConfiguration.enableCompress || !oConfiguration.devEnable) {
					if (oConfiguration.lessSourceFile) {
						var aPath = oConfiguration.lessSourceFile.split(SEPERATOR);
						for (var i = 0, j = aPath.length; i < j; i++) {
							aPath[i] = path.normalize(aPath[i] + "/*.less");
						}
						oConfiguration.lessSourceFile = aPath;
					}
				}
			}
			/**
				prepare compress config info
			*/
			if (!!oConfiguration.enableCompress) {
				var jsFile = path.normalize(oConfiguration.compressSourceFolder + "/js.tag");
				var cssFile = path.normalize(oConfiguration.compressSourceFolder + "/css.tag");

				Q.all([extractor.extractCSS(cssFile), extractor.extractJS(jsFile), extractor.extractAdditionalResource(oConfiguration.webRoot, oConfiguration.aAdditionalSource)]).spread(function(aCSSMap, aJSMap, oAddi) {

					__concatRoot(oConfiguration.jsRootPath, aJSMap);
					__concatRoot(oConfiguration.cssRootPath, aCSSMap);
					__concatRoot(oConfiguration.jsRootPath, oAddi.aJSMap);
					__concatRoot(oConfiguration.cssRootPath, oAddi.aCSSMap);
					oConfiguration.aJSMap = aJSMap;
					oConfiguration.aCSSMap = aCSSMap;
					logger.log('js files ' + oConfiguration.aJSMap.length);
					logger.log(oConfiguration.aJSMap);
					logger.log('css files ' + oConfiguration.aCSSMap.length);
					logger.log(oConfiguration.aCSSMap);
					oConfiguration.aAddiJSMap = oAddi.aJSMap;
					oConfiguration.aAddiCSSMap = oAddi.aCSSMap;
					logger.log("additional file");
					logger.log(oConfiguration.aAddiJSMap);
					logger.log(oConfiguration.aAddiCSSMap);
					deferred.resolve(oConfiguration);

				}).fail(function(err) {
					logger.error(err);
					deferred.reject(err);
				});

			} else {
				deferred.resolve(oConfiguration);
			}


			function __concatRoot(root, aTarget) {

				aTarget.forEach(function(itm, index, current) {

					if (Object.prototype.toString.apply(itm) === "[object Object]") {
						__concatRoot(root, itm.value);
					} else {
						current[index] = path.normalize(root + itm);
					}

				});
			}

			function toRelativePath(path) {
				if (path.indexOf("/") === 0 && path.indexOf("webroot") < 0 && path.indexOf("//") !== 0) {
					return "." + path;
				}
				return path;
			}
		},
		function(err) {
			deferred.reject(err);
		});

	return deferred.promise;
};

exports.generateAddonResources = function(oConfiguration) {

	var addonPath = oConfiguration.addonPath,
		userEx = oConfiguration.userExperience,
		deferred = Q.defer();
	var aAddon = addonPath.split(SEPERATOR);
	aAddon = aAddon[0].trim().length === 0 ? aAddon.slice(1) : aAddon;

	Q.all(aAddon.map(function(item) { // format of item is addonName:addonPath

		var defer = Q.defer();
		var _aPath = item.split(":");
		var _path = path.normalize(_aPath[1] + "/" + PROJECT_FILE);

		var oLoader = new PropertiesLoader(_path);
		oLoader.loadFile().then(function(sConfigFile) {

			var aJS = [],
				aCSS = [];
			var _allJS = oLoader.findPropertyValue(sConfigFile, _aPath[0] + ".javascript.paths").trim();
			var _uxJS = oLoader.findPropertyValue(sConfigFile, _aPath[0] + ".javascript.paths." + userEx).trim();
			aJS = _allJS.length > 0 ? aJS.concat(_allJS.split(";")) : aJS;
			aJS = _uxJS.length > 0 ? aJS.concat(_uxJS.split(";")) : aJS;

			var _allCSS = oLoader.findPropertyValue(sConfigFile, _aPath[0] + ".css.paths").trim();
			var _uxCSS = oLoader.findPropertyValue(sConfigFile, _aPath[0] + ".css.paths." + userEx).trim();
			aCSS = _allCSS.length > 0 ? aCSS.concat(_allCSS.split(";")) : aCSS;
			aCSS = _uxCSS.length > 0 ? aCSS.concat(_uxCSS.split(";")) : aCSS;
			deferred.resolve({
				"jsMap": aJS,
				"cssMap": aCSS
			});
		}, function(err) {
			logger.error(err);
			deferred.reject(err);
		});
		return defer.promise;
	})).then(function(aData) {

		deferred.resolve(aData.reduce(function(pre, current) {
			current.jsMap = pre.jsMap.concat(current.jsMap);
			current.jsMap.forEach(function(item) {
				return path.normalize(ADDON_ROOT + _aPath[0] + "/" + item);
			});
			current.cssMap = pre.cssMap.concat(current.cssMap);
			current.cssMap.forEach(function(item) {
				return path.normalize(ADDON_ROOT + _aPath[0] + "/" + item);
			});
			return current;
		}));
	}, function(err) {
		deferred.reject(err);
	});
	return deferred.promise;
};

// function promiseWrite(content){
// 	logger.log("write file compileJson.json")
// 	return Q.denodeify(fs.writeFile("compileJson.json", JSON.stringify(content)));
// }

// function test(){
// 	exports.generateConfigutation(); 
// }