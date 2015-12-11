var gulp = require('gulp');
 	fs = require("fs"),
	path = require("path"),
	less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),        
    concat = require('gulp-concat'),      
    merge = require('merge-stream'),
    cssimport = require("gulp-cssimport"),
    rename = require('gulp-rename'),       
	compilor = require("./hybrisCompileLoader");

var oConfiguration = (function(args){

	var _o = {
		devEnable: false,
		webRoot:process.cwd(),
		currentPath:__dirname,
		fileSuffix: Date.now()
	};
	for(var i = 0, j= args.length; i < j; i++){
		if(args[i] === "--devEnable"){
			_o.devEnable = !!args[i + 1];
			return _o;
		}
	}
	return _o;

})(process.argv.slice(2));

	gulp.task("prepare-config",function(cb){

		compilor.generateConfigutation(oConfiguration).then(function(data){
			oConfiguration = data;
			cb();
		}, function(err){
			cb(err);
		});
	});

	gulp.task("compile-less",["prepare-config"], function(cb){

		var __destFolder = oConfiguration.lessDestFolder;
		if(oConfiguration.enableLess){
			if(!oConfiguration.devEnable || oConfiguration.enableCompress ){
				for(var i = 0, j = oConfiguration.lessSourceFile.length; i < j ; i++){
					gulp.src(oConfiguration.lessSourceFile[i])
						.pipe(less())
    					.pipe(gulp.dest(__destFolder || oConfiguration.lessSourceFile[i].substring(0, oConfiguration.lessSourceFile[i].length - 6) ));
				}
				cb();
			}
		}else{
			cb();
		}
	});

	gulp.task("compress-css",['compile-less'], function(cb){
			if(oConfiguration.enableCompress){
				var __oprions = oConfiguration.buildProxyHost?{
					"httpRequestOptions":{
						"host":oConfiguration.buildProxyHost,
						"port":oConfiguration.buildProxyPort
					}
				}:undefined;

				gulp.src(oConfiguration.aCSSMap)
				.pipe(cssimport(__oprions))
				.pipe(concat("combind.min_"+ oConfiguration.fileSuffix + ".css"))
				.pipe(minifycss())
				.pipe(gulp.dest(oConfiguration.combindCSSDest));
				cb();

			}else{
				cb();
			}
	});

	gulp.task("compress-js", ["prepare-config"],function(cb){
			if(oConfiguration.enableCompress){

				if(oConfiguration.combindJSDest){
					try{
						fs.accessSync(oConfiguration.combindJSDest, fs.W_OK);
						merge(gulp.src(oConfiguration.oJSMap.minjs), minifyjs(oConfiguration.oJSMap.js))
						.pipe(concat("combind.min_"+ oConfiguration.fileSuffix + ".js"))
						.pipe(gulp.dest(oConfiguration.combindJSDest));
						cb();
					}catch(err){
						console.log(err);
						cb(err);
					}
				}
			}else{
				cb();
			}

			function minifyjs(files){
				return gulp.src(files).pipe(uglify());
			}

	});

	gulp.task("default",["compress-css", "compress-js"], function(cb){

		var _fileName = path.join(oConfiguration.webRoot +"/WEB-INF/tags/shared/variables/generateCompressName.jsp");

		var _fContent = "<%@ taglib prefix=\"c\" uri=\"http://java.sun.com/jsp/jstl/core\"%>\n <c:set var=\"compressFileSuffix\" scope=\"session\" value=\""+ oConfiguration.fileSuffix + "\"/>";

		fs.writeFile(_fileName, _fContent ,'utf8',function(err){

				console.log("generate file finish");
				cb(err);
		});


		
	});

//default --gulpfile ./_ui/addons/atom/share/gulpfile.js --cwd . --devEnable true
