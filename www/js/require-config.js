//requirejs = (typeof requirejs!== 'undefined')? requirejs:{config:function(){}};

// Note: This config is used for both our tests and our live application

var fnRequireConfig = function(){
    return {
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
            },  

            /* steves: stuff here...*/
            'styleBlocks': {
                exports: 'styleBlocks'
            },
            'wrapTagPointers': {
                exports: 'wrapTagPointers'
            } ,
            'createHtmlAsJson': {
                exports: 'createHtmlAsJson'
            },
            'reportMultipleClassesWithSameProps':{
                exports:'reportMultipleClassesWithSameProps'
            }        
        }
    };
}