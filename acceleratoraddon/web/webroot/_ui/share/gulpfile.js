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
	compilor = require("./hybrisCompileLoader");

var oConfiguration = (function(args) {

	var _o = {
		devEnable: false,
		webRoot: process.cwd(),
		currentPath: __dirname,
		fileSuffix: Date.now()
	};
	for (var i = 0, j = args.length; i < j; i++) {
		if(args[i].search(/^--.*/) >= 0){
			_o[args[i].substring(2)] = args[i + 1];
			console.info(args[i].substring(2) + " value is " + _o[args[i].substring(2)]);
			i++;
		}
	}
	return _o;

})(process.argv.slice(7));


gulp.task("prepare-config", function(cb) {

	Q.all([compilor.generateConfigutation(oConfiguration), compilor.generateAddonResources(oConfiguration)]).then(
		function(aData){
			oConfiguration = aData[0];
			oConfiguration.aCSSMap = oConfiguration.aCSSMap.concat(aData[1].cssMap);
			oConfiguration.oJSMap.js = oConfiguration.oJSMap.js.concat(aData[1].jsMap);
			cb();
		},
		function(err){
			console.log(err);
			cb(err);}
		);
});


gulp.task("js-lint", ["prepare-config"], function(cb) {

	if (oConfiguration && oConfiguration.enableHint === "true") {

		fs.readFile(path.join(__dirname + "/package.json"),"utf8",function(err, data){
			var _options = {};
			if(err){
				console.error("read hint configuration file failed: " + err);
			}else{
				_options = JSON.parse(data).jshintConfig;
			}
			var aSrc = oConfiguration.oJSMap.js;
			if(oConfiguration.enableHintExtract && oConfiguration.hintExtractFolders.length>0){
				aSrc = aSrc.concat(oConfiguration.hintExtractFolders);
				gulp.src(aSrc)
				.pipe(jshint.extract('auto'))
				.pipe(jshint(_options))
				.pipe(jshint.reporter('default'));
			}else{
				gulp.src(aSrc)
				.pipe(jshint(_options))
				.pipe(jshint.reporter('default'));
			}
			cb();
		});
	}else{
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
				.pipe(gulp.dest(__destFolder || oConfiguration.lessSourceFile[i].substring(0, oConfiguration.lessSourceFile[i].length - 6)));

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
			.pipe(concat("combind.min_" + oConfiguration.fileSuffix + ".css"))
			.pipe(minifycss())
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest(oConfiguration.combindCSSDest));
		cb();

	} else {
		cb();
	}
});

gulp.task("compress-js", ["prepare-config"], function(cb) {
	if (oConfiguration.enableCompress === "true") {
		if (oConfiguration.combindJSDest) {
			try {
				fs.accessSync(oConfiguration.combindJSDest, fs.W_OK);
				merge(gulp.src(oConfiguration.oJSMap.minjs), minifyjs(oConfiguration.oJSMap.js))
					.pipe(concat("combind.min_" + oConfiguration.fileSuffix + ".js"))
					.pipe(gulp.dest(oConfiguration.combindJSDest));
				cb();
			} catch (err) {
				console.log(err);
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

	var _fileName = path.join(oConfiguration.webRoot + "/WEB-INF/tags/shared/variables/generateCompressName.jsp");
	var _fContent = "<%@ taglib prefix=\"c\" uri=\"http://java.sun.com/jsp/jstl/core\"%>\n <c:set var=\"compressFileSuffix\" scope=\"session\" value=\"" + oConfiguration.fileSuffix + "\"/>";
	fs.writeFile(_fileName, _fContent, 'utf8', function(err) {

		console.log("generate file finish");
		cb(err);
	});

});

//default --gulpfile ./_ui/addons/atom/share/gulpfile.js --cwd . --devEnable true