var gulp = require('gulp');
gulp.task('generate-service-worker', function(callback) {
    var swPrecache = require('sw-precache');
    var rootDir = '';
console.log('sucede');
    swPrecache.write(`/service-worker.js`, {
        staticFileGlobs: ['/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
        stripPrefix: rootDir
    }, callback);
});