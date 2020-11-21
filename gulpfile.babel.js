// https://medium.com/@xoor/building-a-node-js-rest-api-8-unit-testing-822c32a587df

const gulp = require('gulp');
const del = require('del');
const runSequence = require('run-sequence');
const babelCompiler = require('@babel/register');

const paths = {
  js: ['./**/*.js', '!dist/**', '!node_modules/**'],
  tests: './src/test/*.js',
};

// Clean up dist directory
gulp.task('clean', () => {
  return del('dist/**');
});

// triggers mocha tests
gulp.task('test', () => {
  let exitCode = 0;
  
  return gulp.src([paths.tests], { read: false })
    .pipe(plugins.plumber())
    .pipe(plugins.mocha({
      reporter:'spec',
      ui: 'bdd',
      timeout: 2000,
      compilers: {
        js: babelCompiler
      }
    }))
    .once('error', (err) => {
      console.log(err);
      exitCode = 1;
    })
    .once('end', () => {
      process.exit(exitCode);
    });
});


gulp.task('mocha', ['clean'], () => {
  return runSequence('babel', 'test');
});
