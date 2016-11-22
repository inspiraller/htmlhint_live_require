// Karma configuration
// Generated on Sun Oct 20 2013 07:28:56 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    plugins: [
      "karma-chrome-launcher",
      "karma-jasmine",
      "karma-requirejs",
      "karma-htmlfile-reporter"
    ],


    // frameworks to use
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'www/js/lib/**/*.js', included: false},
        {pattern: 'www/js/modules/**/*.js', included: false},
        {pattern: 'test/*Spec.js', included: false},

        'www/js/require-config.js',
        'test/test-main.js',
    ],


    // list of files to exclude
    exclude: [
        'www/js/require-config-and-main.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'

    reporters: ['progress', 'html'],
 
    // the default configuration 
    htmlReporter: {
      outputFile: 'test/testOutput.html',
            
      // Optional 
      pageTitle: 'Unit Tests',
      subPageTitle: 'HTMLHint helpers',
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
