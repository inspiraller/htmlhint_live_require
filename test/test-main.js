var tests = [];
for (var file in window.__karma__.files) {
    if (/Spec\.js$/.test(file)) {
        tests.push(file);
    }
}


var objConfig = fnRequireConfig();

// everything in tests runes from base/
objConfig.baseUrl = '/base/www/' + objConfig.baseUrl;

// ask Require.js to load these files (all our tests)
objConfig.deps = tests;

// start test run, once Require.js is done
objConfig.callback = window.__karma__.start;

requirejs.config(objConfig);

// original 
/*
requirejs.config({
        baseUrl:'/base/www/js/modules',
    paths: {
        'jquery': '../lib/jquery',
        'underscore': '../lib/underscore',
        'htmlhint':'../lib/htmlhint/htmlhint',
        'jshint':'../lib/htmlhint/jshint',
        'csslint':'../lib/htmlhint/csslint',
        'ace':'../lib/htmlhint/ace'
    },

    shim: {
        "jquery-cookie"  : ["jquery"],
        'underscore': {
            exports: '_'
        },
        'htmlhint': {
            exports: 'HTMLHint'
        },
        'jshint': {
            exports: 'JSHINT'
        },
        'csslint': {
            exports: 'CSSLint'
        }     
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});


*/

