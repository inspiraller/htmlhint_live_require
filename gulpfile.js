var gulp = require('gulp');
var KarmaTestServer = require('karma').Server;
var browserSync = require('browser-sync').create(); // note must install globally: npm install -g browser-sync

gulp.task('server', function() {
	browserSync.init({
			server: {
					baseDir: "./www/",
					index: "index.html"
			}
	});

  gulp.watch([
    './www/js/lib/htmlhint/*.js',
    './www/js/modules/*.js'
    ]).on('change', browserSync.reload);
});


gulp.task('test', function (done) {

  new KarmaTestServer({
    configFile: require('path').resolve('karma.conf.js'),
    singleRun: false

/*
    "browsers": ["Chrome"]
*/
  }, function(error){

  	error = error ? new Error('Karma returned with the error code: ' + error) : undefined;

    done(error);

  }).start();

});


gulp.task('default', ['server']);
