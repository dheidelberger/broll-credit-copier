//Adapted from: https://gist.github.com/lykmapipo/eec3888e41d5be70a4eb

var gulp = require('gulp'),
	clean = require('gulp-clean'),
    jshint = require('gulp-jshint'),
    gulpIgnore = require('gulp-ignore'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip');
    
var preprocess = require('gulp-preprocess');
var preprocOpts = {
    PRODUCTION: true
};

var logPrefix = "               ";

//clean build directory
gulp.task('clean', function() {
	return gulp.src('build/*', {read: false})
		.pipe(clean());
});

gulp.task('copy',['clean'], function() {
	return gulp.src(['*images/**/*','*libs/**/*','*sounds/**/*','basic.css','manifest.json','background.html'])
		.pipe(gulp.dest('build/'));
	
});

gulp.task('scripts',function() {
    return gulp.src(['*.js','*sites/**/*'])
    .pipe(preprocess({ context: preprocOpts }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulpIgnore.exclude(['gulpfile.js']))
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});

gulp.task('zip',['scripts','copy'],function() {
    var manifest = require('./manifest');
    var version = manifest.version;
    version = version.replace(/\./g,'-');
    var name = manifest.name;
    var filename = name+" "+version+".zip";
    console.log(logPrefix+"Zipping: "+filename);
    return gulp.src('build/**')
    .pipe(zip(filename))
    .pipe(gulp.dest('../'));

});

gulp.task('default',['copy','scripts','zip']);