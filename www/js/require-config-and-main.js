//requirejs = (typeof requirejs!== 'undefined')? requirejs:{config:function(){}};
requirejs.config({
		baseUrl:'js/modules',
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
    }
});

require(['app'],function(app){

});