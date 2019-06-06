const gulp = require("gulp");
const gulpEjsMonster = require("gulp-ejs-monster");

gulp.task("ejs_rive", function(done) {
  return gulp
    .src("./temp/rive/*.ejs")
    .pipe(
      gulpEjsMonster({
        extname: "rive",
        showHistoryOnCrash: true
      })
    )
    .pipe(gulp.dest("./dist/rive"));
  done();
});
gulp.task("ejs_js", function(done) {
  return gulp
    .src("./temp/js/*.ejs")
    .pipe(
      gulpEjsMonster({
        extname: "js",
        showHistoryOnCrash: true
      })
    )
    .pipe(gulp.dest("./dist/js"));
  done();
});

//запуск всех задач последовательно
gulp.task(
  "default",
  gulp.series(
    // gulp.parallel("test", "beta", "top_config_test", "top_config_beta", "rive_test", "vars_test", "rive_beta", "vars_beta", function (done) {
    //     // do more stuff
    //     console.log("done");
    //     done();
    // }),
    "ejs_js",
    "ejs_rive"
  )
);
