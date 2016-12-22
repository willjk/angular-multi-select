var gulp = require('gulp'),
angularFilesort = require('gulp-angular-filesort'),
	templateCache = require('gulp-angular-templatecache'),
	minifyHtml = require('gulp-minify-html'),
	runSequence = require('run-sequence'),
	del = require('del'),
	watch = require('gulp-watch');
var gutil = require('gulp-util');
 var concat = require('gulp-concat');
// var sass = require('gulp-sass');
// var minifyCss = require('gulp-minify-css');
// var rename = require('gulp-rename');
// var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

//Gulp angular js builder

gulp.task('compile', ['clean'], function(){
	runSequence([
		//'libraryScripts',
		'appScripts',
		'templates'
	]);
});

gulp.task('dev', function () {
    watch(['js/libs/multi-select/**/*.js', 'js/libs/multi-select/*.js'], function () {
        runSequence('appScripts');
    }, 500);
    watch(['js/libs/multi-select/**/*.html', 'js/libs/multi-select/*.html'], function () {
        runSequence('templates');
    }, 1500);
});

//gulp application script task, get scripts we want and filesort them via angular file sort
//TODO include all scripts
gulp.task('appScripts', function() {
	return gulp.src([
			'!gulpfile.js',
			'!**/gulpfile.js',
			'!js/libs/multi-select/isteven-multi-select.js',
			'js/libs/multi-select/**/*.js',
			'js/libs/multi-select/*.js',
			//'js/*.js',
		])
		.pipe(angularFilesort())
		.pipe(concat('app.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('templates', function() {
	return gulp.src('js/libs/multi-select/**/*.html')
		.pipe(minifyHtml({
			quotes: true,
			empty: true,
			spare: true,
			conditionals: true,
			cdata: true
		}))
		.pipe(templateCache('templates.js', {
			standalone: true
		}))
		.pipe(gulp.dest('dist/js'));
});

/* gulp task to clean out the dist folder to remove any ghosts */
gulp.task('clean', function(cb) {
	return del([
		'dist/js'
	], cb);
})

gulp.task('default', []);