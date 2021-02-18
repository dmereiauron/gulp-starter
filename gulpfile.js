const gulp = require('gulp')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const gulpIf = require('gulp-if')
const gcmq = require('gulp-group-css-media-queries')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const browserSync = require('browser-sync').create()

let isMap = process.argv.includes('--map')
let isMinify = process.argv.includes('--clean')
let isSync = process.argv.includes('--sync')

function clean() {
  return del('./build/*')
}

function html() {
  return (
    gulp
      .src('./src/**/*.html')
      // silense
      .pipe(gulp.dest('./build'))
      .pipe(gulpIf(isSync, browserSync.stream()))
  )
}

function js() {
  return gulp
    .src('./src/js/main.js')
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(gulp.dest('./build/js/main.js'))
    .pipe(gulpIf(isSync, browserSync.stream()))
}

function styles() {
  return (
    gulp
      .src('./src/css/main.scss')
      .pipe(gulpIf(isMap, sourcemaps.init()))
      .pipe(sass())
      //.pipe(gcmq())
      //.pipe(autoprefixer())
      .pipe(
        gulpIf(
          isMinify,
          cleanCSS({
            level: 2,
          })
        )
      )
      .pipe(gulpIf(isMap, sourcemaps.write()))
      .pipe(gulp.dest('./build/css'))
      .pipe(gulpIf(isSync, browserSync.stream()))
  )
}

function images() {
  return (
    gulp
      .src('./src/img/**/*')
      // size down, webp
      .pipe(gulp.dest('./build/img'))
  )
}

function watch() {
  if (isSync) {
    browserSync.init({
      server: {
        baseDir: './build/',
      },
      port: 8080,
    })
  }

  gulp.watch('./src/css/**/*.scss', styles)
  gulp.watch('./src/**/*.html', html)
  gulp.watch('./src/js/**/*.js', js)
}

let build = gulp.parallel(html, styles, js, images)
let buildWithClean = gulp.series(clean, build)
let dev = gulp.series(buildWithClean, watch)

gulp.task('build', buildWithClean)
gulp.task('watch', dev)
