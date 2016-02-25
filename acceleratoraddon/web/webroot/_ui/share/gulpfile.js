var gulp = require('gulp'),
	fs = require("fs"),
	path = require("path"),
	less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	merge = require('merge-stream'),
	jshint = require('gulp-jshint'),
	Q = require('q'),
	cssimport = require("gulp-cssimport"),
	sourcemaps = require('gulp-sourcemaps'),
	compilor = require("./hybrisCompileLoader"),
	logger = require('./logger'),
    hashGenerator = require("./hashFileName"),
	mapName = require("./mapFileName.js");
const SEP = "_",
	  COMBINED_JS='combindjs_min.js',
	  COMBINED_CSS='combindcss_min.css';
var __cssNameMap = [],
	__jsNameMap = [];
var oConfiguration = (function(args) {

	var _o = {
		devEnable: false,
		webRoot: process.cwd(),
		currentPath: __dirname,
		fileSuffix: Date.now()
	};
	for (var i = 0, j = args.length; i < j; i++) {
		if (args[i].search(/^--.*/) >= 0) {
			_o[args[i].substring(2)] = args[i + 1];
			logger.log(args[i].substring(2) + " value is " + _o[args[i].substring(2)]);
			i++;
		}
	}
	return _o;

})(process.argv.slice(7));


gulp.task("prepare-config", function(cb) {
	Q.all([compilor.generateConfigutation(oConfiguration), compilor.generateAddonResources(oConfiguration)]).then(
		function(aData) {
			oConfiguration = aData[0];
			oConfiguration.aCSSMap = oConfiguration.aCSSMap.concat(aData[1].cssMap);
			oConfiguration.oJSMap.js = oConfiguration.oJSMap.js.concat(aData[1].jsMap);
			cb();
		},
		function(err) {
			logger.error(err);
			cb(err);
		}
	);
});


gulp.task("js-lint", ["prepare-config"], function(cb) {

	if (oConfiguration && oConfiguration.enableHint === "true") {

		fs.readFile(path.join(__dirname + "/package.json"), "utf8", function(err, data) {
			var _options = {};
			if (err) {
				logger.error("read hint configuration file failed: " + err);
			} else {
				_options = JSON.parse(data).jshintConfig;
			}
			var aSrc = oConfiguration.oJSMap.js;
			if (oConfiguration.enableHintExtract && oConfiguration.hintExtractFolders.length > 0) {
				aSrc = aSrc.concat(oConfiguration.hintExtractFolders);
				gulp.src(aSrc)
					.pipe(jshint.extract('auto'))
					.pipe(jshint(_options))
					.pipe(jshint.reporter('default'));
			} else {
				gulp.src(aSrc)
					.pipe(jshint(_options))
					.pipe(jshint.reporter('default'));
			}
			cb();
		});
	} else {
		cb();
	}

});

gulp.task("compile-less", ["prepare-config"], function(cb) {

	var __destFolder = oConfiguration.lessDestFolder;
	if (oConfiguration.enableLess === "true") {
		if (!oConfiguration.devEnable || oConfiguration.enableCompress) {
			gulp.src(oConfiguration.lessSourceFile)
				.pipe(sourcemaps.init())
				.pipe(less())
				.pipe(sourcemaps.write("."))
				.pipe(gulp.dest(__destFolder));

			cb();
		}
	} else {
		cb();
	}
});

gulp.task("compress-css", ['compile-less', "prepare-config"], function(cb) {
	if (oConfiguration.enableCompress === "true") {
		var __oprions = oConfiguration.buildProxyHost ? {
			"httpRequestOptions": {
				"host": oConfiguration.buildProxyHost,
				"port": oConfiguration.buildProxyPort
			}
		} : undefined;

		gulp.src(oConfiguration.aCSSMap)
			.pipe(cssimport(__oprions))
			.pipe(sourcemaps.init())
			.pipe(concat(COMBINED_CSS))
			.pipe(minifycss())
			.pipe(hashGenerator())
			.pipe(mapName(__cssNameMap, SEP))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest(oConfiguration.combindCSSDest))
			.on('end', function() {
				logger.log(__cssNameMap);
				cb();
			});

	} else {
		cb();
	}
});

gulp.task("compress-js", ["prepare-config"], function(cb) {
	if (oConfiguration.enableCompress === "true") {
		if (oConfiguration.combindJSDest) {
			try {
				fs.accessSync(oConfiguration.combindJSDest, fs.W_OK);
				merge(minifyjs(oConfiguration.oJSMap.js))
					.pipe(concat(COMBINED_JS))
					.pipe(hashGenerator())
					.pipe(mapName(__jsNameMap, SEP))
					.pipe(gulp.dest(oConfiguration.combindJSDest))
					.on('end', function() {
						cb();
					});
			} catch (err) {
				logger.error(err);
				cb(err);
			}
		}
	} else {
		cb();
	}
	function minifyjs(files) {
		return gulp.src(files)
			.pipe(uglify());
	}

});

gulp.task("default", ["compress-css", "js-lint", "compress-js"], function(cb) {

	// generate JSP for file name
	const __generatedFile = "/WEB-INF/tags/shared/variables/generateCompressName.jsp";
	__generatedFile.split("/").reduce(function(prev, current, index, arr) {

		if (index < arr.length - 1) {
			var __currentPath = prev + "/" + current;
			if (!fs.existsSync(__currentPath)) {
				fs.mkdirSync(__currentPath);
			}
		}
		return __currentPath;
	}, oConfiguration.webRoot);

	function buildeJSP(aMap){
		return	aMap.reduce(function(prev, item){
			return prev + "\n <c:set var=\""+ item.key +"\" scope=\"session\" value=\"" + item.value + "\"/>";
		},'');
	}


	var _fileName = path.join(oConfiguration.webRoot + __generatedFile);
	var _fContent = "<%@ taglib prefix=\"c\" uri=\"http://java.sun.com/jsp/jstl/core\"%> " + buildeJSP(__jsNameMap.concat(__cssNameMap));
	fs.writeFile(_fileName, _fContent, 'utf8', function(err) {
		if (err) {
			logger.error("generate file failed");
		} else {
			logger.log("generate file finish");
		}
		cb(err);
	});

});

//default --gulpfile ./_ui/addons/atom/share/gulpfile.js --cwd . --devEnable true