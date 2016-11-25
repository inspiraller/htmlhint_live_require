# credits to:
git+https://github.com/kjbekkelund/karma-requirejs.git

This is a customized variation.

# pre-requisites installed globally:
node, npm, gulp

# Determine location for repo
cd c:\myProjects

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Editing the javascript for this repo

### Download this repo
git clone https://github.com/inspiraller/htmlhint_live_require.git

### cd to repo
cd htmlhint_live_require

### install node modules
npm install

### fix any sass errors
npm rebuild node-sass

### To view in chrome browser for testing
gulp

### look in the console to see report message example
Multiple selectors exist with same properties. selectors = .elem1,.elem2,.elem3. Properties = font-size,margin,border

### change any of the following:

JS:
***To update htmlhint parse to provide html to start event:***
www/js/libe/htmlhint/htmlhint.js

```javascript
 self.fire('start', {
                pos: 0,
                line: 1,
                col: 1,
                html:html
            });
```

***To update the rule - multiple-classes-with-same-properties:***
www/js/lib/htmlhint/htmlhint.js 

***To update the dependencies:***
www/js/modules/*.js 

***To update the reference to the dependencies:***
www/js/require-config.js
www/js/modules/app.js

***To update the reference to the rule:***
www/js/app.js
```javascript
    var ruleSets = {
            /* others...*/
            'multiple-classes-same-property':true,
    }
```

# Providing tests for your changes

### pre-requisites installed globally:
node, npm, karma-cli, gulp

### Custom karma config
npm  install

### install additional dependencies for this repo
$ npm install gulp jasmine karma karma-chrome-launcher karma-htmlfile-reporter karma-jasmine karma-requirejs requirejs --save-dev

### run via gulp
gulp testKarma

### or run via karma
karma start

### Note: This uses html reporter to generate a test output file at - test/testOutput.html

This is useful because reading test errors from the command line is difficult with all the noisy information.

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Building your changes into original HTMLHINT plugin
# After changing any javascript from the htmlhint_live_require repo 
# - how to convert into a htmlhint build for testing locally

# 1) you have to download htmlhint repo
# 2) you have to update the following files:

gruntfile.js

```javascript
/*global module:false*/
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            

            node: {
                src: ['Gruntfile.js', 'test/**/*.js', 'bin/*'],
                options: {
                    jshintrc: ".jshintrc-node"
                }
            }
        },
        clean: ["lib", "coverage"],
        concat: {
            htmlhint: {
                src: [
                    'src/core.js', 
                    'src/reporter.js', 
                    'src/htmlparser.js', 

                    /* in order */
                    'src/multipleClassDependencies/wrapTagPointers.js',
                    'src/multipleClassDependencies/styleBlocks.js',
                    'src/multipleClassDependencies/createHtmlAsJson.js',
                    'src/multipleClassDependencies/styleBlocksFilter.js',
                    'src/multipleClassDependencies/reportMultipleClassesWithSameProps.js',

                    'src/rules/*.js'
                ],
                dest: 'lib/htmlhint.js'
            }
        },
        exec: {
            test: {
                command: '"./node_modules/.bin/mocha" --recursive',
                stdout: true,
                stderr: true
            },
            cover: {
                command: '"./node_modules/.bin/istanbul" cover "./node_modules/mocha/bin/_mocha" -- --recursive',
                stdout: true,
                stderr: true
            }
        },

        replace: {
            version: {
                files: {
                    'lib/htmlhint.js':'lib/htmlhint.js'
                },
                options: {
                    prefix: '@',
                    variables: {
                        'VERSION': '<%= pkg.version %>',
                        'RELEASE': dateFormat('yyyyMMdd')
                    }
                }
            }
        },
        watch: {
            src: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: 'dev'
            }
        }
    });

    grunt.registerTask('build', ['jshint', 'clean', 'concat']);

    grunt.registerTask('dev', ['build', 'exec:test']);

    grunt.registerTask('default', ['build', 'exec:cover', 'uglify', 'replace:version']);

    function dateFormat(date, format) {
        if(format === undefined){
            format = date;
            date = new Date();
        }
        var map = {
            "M": date.getMonth() + 1, //月份
            "d": date.getDate(), //日
            "h": date.getHours(), //小时
            "m": date.getMinutes(), //分
            "s": date.getSeconds(), //秒
            "q": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        format = format.replace(/([yMdhmsqS])(\1)*/g, function(all, t){
            var v = map[t];
            if(v !== undefined){
                if(all.length > 1){
                    v = '0' + v;
                    v = v.substr(v.length-2);
                }
                return v;
            }
            else if(t === 'y'){
                return (date.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    }

};

```

htmlparser.js

Find:
```javascript
           self.fire('start', {
                pos: 0,
                line: 1,
                col: 1
            });
```

Replace with (As this will supply html now to the rule we are going to add):
```javascript
           self.fire('start', {
                pos: 0,
                line: 1,
                col: 1,
                html:html
            });
```

rules/multiple-classes-same-property.js
```javascript
// RESTORE FOR BUILD
var fs = require('fs');

HTMLHint.addRule({
    id: 'multiple-classes-same-property',
    description: 'Prevent classes with the same properties',
    init: function multipleClases(parser, reporter, options) {

        var self = this;

        // REMOVE FOR BUILD
        /*
        var reporter = {
            error:function(str, intLine){
                console.log(str);
            }


        }
        // REMOVE FOR BUILD
        var strAllStyles = $('#styles').val();
        */

        // RESTORE FOR BUILD
        var strPathToBundledCss = options;
        // example styles
        var strAllStyles = '.classX{ background:red;}';        
        strAllStyles = fs.readFileSync(strPathToBundledCss, "utf8");        

        var allEvent = function(event) {
            if(event.type == 'start'){

                var html = event.html;

                var arrReport = reportMultipleClassesWithSameProps(html, strAllStyles);

                for(var i=0, intLen = arrReport.length; i < intLen; ++i){
                    var objReport = arrReport[i];
                    var objElem = objReport.elem;
                    var objMatchingSelectors = Object.keys(objReport.matching.selectors);
                    var strSelectors = objMatchingSelectors.join(',');
                    var objMatchingProperties = Object.keys(objReport.matching.properties);
                    var strProperties = objMatchingProperties.join(',');

                    var strReport = "Multiple selectors exist with same properties. selectors = " + strSelectors + '. Properties = ' + strProperties ;
                    reporter.error(strReport, objElem.line, 0, self, event.raw);                    
                }

            }
            parser.removeListener("start", allEvent);
        };
        parser.addListener("start", allEvent);
    }
});
```

# run grunt to build the file: lib/htmlhint.js
grunt

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# How to use your new HTMLHINT rule in your new project with sublime

### Install sublime and linters
- Download and install sublime
- via package control install sublime linter and SublimeLinter-contrib-htmlhint

### Create new project that will use these lint styles
mkdir c:\myNewProject

### Add this project into sublimes side panel

### Note: Don't add the original HTMLHINT repo folder to sublime
This can confuse sublime on which htmlhint file to use

### install npm package htmlhint into this project
npm install htmlhint --save-dev

### Copy the grunt generated lib/htmlhint.js on top of your new project lib/htmlhint.js file.
example:
c:/myNewProjec/node_modules/htmlhint/lib/htmlhint.js

### In your new project - add rule multiple-classes-same-property and reference bundled styles file

c:/myNewProjec/.htmlhintrc
```javascript
{
    "tag-pair": true,
    "multiple-classes-same-property":"C:\\myOtherProject\\dis\\generatedStyles.min.css"
}
```

### To test your bundled css file - geneatedStyles.min.css
```css
    .elem1{ font-size:10px;}
    .elem2{ font-size:20px;}
```

### Open any html file to see any errors now popping up
index.html
```
<div class="elem1 elem2 elem3"></div>
```

