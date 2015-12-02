var gulp = require('gulp');
var fs = require("fs");

var less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),        
    concat = require('gulp-concat'),      
    merge = require('merge-stream'),
    rename = require('gulp-rename');        

var compilor = require("./hybrisCompileLoader");

var oConfiguration = {};

	gulp.task("build-less",function(){

		gulp.src("./_ui/responsive/theme-blue/css/home.less").pipe(less()).pipe(gulp.dest("./_ui/responsive/theme-blue/css"));

	});

	gulp.task("prepare-config",function(cb){

		compilor.generateConfigutation().then(function(data){
			oConfiguration = data;
			cb();
		}, function(err){
			cb(err);
		});
	});

	gulp.task("compile-less",["prepare-config"], function(cb){

		if(oConfiguration.enableLess){
			if(oConfiguration.deployMode.indexOf("pro") >= 0 || oConfiguration.enableCompress ){
				for(var i = 0, j = oConfiguration.lessSourceFile.length; i < j ; i++){
					gulp.src(oConfiguration.lessSourceFile[i])
						.pipe(less())
    					.pipe(gulp.dest(oConfiguration.lessSourceFile[i].substring(0, oConfiguration.lessSourceFile[i].length - 6)));
				}
				cb();
			}
		}else{
			cb();
		}
	});

	gulp.task("compress-css",['compile-less'], function(cb){
			
			if(oConfiguration.enableCompress){
				console.log(oConfiguration.aCSSMap);
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
						.pipe(concat("combind.min.js"))
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
		
	});