var browserSync, cached, changed, chmod, concat, config, csso, debug, del, filter, gulp, gulpif, imagemin, inheritance, jade, karma, newer, notify, plumber, prefix, rename, sass, sourcemaps, uglify, errorAlert;

gulp = require('gulp');
del = require('del');
newer = require('gulp-newer');
sourcemaps = require('gulp-sourcemaps');
concat = require('gulp-concat');
chmod = require('gulp-chmod');
uglify = require('gulp-uglify');
plumber = require('gulp-plumber');
notify = require('gulp-notify');
karma = require('karma').server;
changed = require('gulp-changed');
browserSync = require('browser-sync');
rename = require('gulp-rename');
sass = require('gulp-sass');
prefix = require('gulp-autoprefixer');
csso = require('gulp-csso');
filter = require('gulp-filter');
cached = require('gulp-cached');
inheritance = require('gulp-jade-inheritance');
debug = require('gulp-debug');
gulpif = require('gulp-if');
jade = require('gulp-jade');
imagemin = require('gulp-imagemin');
config = {
  path: 'dist'
  };

// config file

gulp.task('del', function() {
  return del(config.path, {
    force: true
  });
});


// require('./gulp/static.coffee'); 
// removed: 'bower_components/jquery/dist/jquery.js'
// gulp.task('vendor', function() {
//   return gulp.src(['bower_components/modernizr/modernizr.js', , 'bower_components/angular/angular.min.js', 'bower_components/velocity/velocity.min.js', 'bower_components/velocity/velocity.ui.min.js']).pipe(newer(config.path + "/scripts/vendor.min.js")).pipe(uglify()).pipe(concat('vendor.min.js')).pipe(gulp.dest(config.path + "/scripts"));
// });

// require('./gulp/sass.coffee');

errorAlert = function(error) {
  notify.onError({
    title: 'SASS Error',
    message: 'Check your terminal!'
  })(error);
  console.log(error.toString());
  return this.emit('end');
};

gulp.task('sass', function() {
  gulp.src('src/**/*.scss')
  .pipe(plumber({errorHandler: errorAlert}))
  .pipe(sass({style: 'expanded'}))
  .pipe(prefix({
    browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']}))
  .pipe(csso())
  .pipe(rename('styles.css'))
  .pipe(chmod(755))
  .pipe(gulp.dest(config.path + "/styles"))
  .pipe(browserSync.reload({stream: true}));
});

// require('./gulp/jade.coffee');

errorAlert = function(error) {
  notify.onError({
    title: 'Jade Error',
    message: 'Check your terminal!'
  })(error);
  console.log(error.toString());
  return this.emit('end');
};

gulp.task('jade', function() {
  return gulp.src('src/**/*.jade').pipe(plumber({
    errorHandler: errorAlert
  })).pipe(changed(config.path, {
    extension: '.html'
  })).pipe(cached('jade')).pipe(inheritance({
    basedir: 'src'
  })).pipe(debug({
    title: 'changed'
  })).pipe(jade({
    pretty: true
  })).pipe(chmod(755)).pipe(rename(function(file) {
    return file.dirname = file.dirname.replace('views', '');
  })).pipe(gulp.dest(config.path));
});


// gulp - js
gulp.task('javascript', function() {
  return gulp.src(['src/**/*.js']).pipe(newer(config.path + "/scripts/app.min.js")).pipe(uglify()).pipe(concat('app.min.js')).pipe(gulp.dest(config.path + "/scripts"));
});

// require('./gulp/images.coffee');
gulp.task('images', function() {
  return gulp.src('src/brand/images/**/*').pipe(changed(config.path + "/images")).pipe(chmod(755)).pipe(gulp.dest(config.path + "/images"));
});

gulp.task('imagesProduction', function() {
  return gulp.src('src/brand/images/**/*').pipe(changed(config.path + "/images")).pipe(imagemin()).pipe(chmod(755)).pipe(gulp.dest(config.path + "/images"));
});

// start server
gulp.task('serve', ['sass'], function() {
  browserSync({
    server: {
      baseDir: config.path
    },
    port: 4000,
    open: false,
    reloadOnRestart: false,
    ghostMode: true,
    notify: false
  });
  gulp.watch('src/**/*.scss', ['sass']);
  gulp.watch(['src/**/*.js', '!src/**/*.spec.js'], ['javascript', browserSync.reload]);
  return gulp.watch('src/**/*.jade', ['jade', browserSync.reload]);
});


gulp.task('default', ['jade', 'sass', 'javascript', 'images', 'serve']);

// ---