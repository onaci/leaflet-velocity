const gulp = require("gulp");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const concatCss = require("gulp-concat-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const postCss = require("gulp-postcss");

// Concatenate & Minify src and dependencies
gulp.task("scripts", function () {
  return gulp
    .src(["src/js/**.js"])
    .pipe(concat("leaflet-velocity.js"))
    .pipe(
      babel({
        presets: ["@babel/preset-env"]
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(rename("leaflet-velocity.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task("concatCss", function () {
  return gulp
    .src("./src/css/*.css")
    .pipe(concatCss("leaflet-velocity.css"))
    .pipe(gulp.dest("./dist"));
});

gulp.task("postCss", function () {
  return gulp
    .src("./dist/leaflet-velocity.css")
    .pipe(postCss())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist"));
});

// Watch Files For Changes
gulp.task("watch", function () {
  // We watch both JS and HTML files.
  gulp.watch("src/js/*.js", gulp.series("scripts"));
  gulp.watch("src/css/*.css", gulp.series("concatCss", "postCss"));
});

// Default Task
gulp.task('default', gulp.series("scripts", "concatCss", "postCss", "watch"));
