# credits to:
git+https://github.com/kjbekkelund/karma-requirejs.git

This is a customized variation.

# pre-requisites installed globally:
node, npm, karma-cli, gulp

# Custom karma config
npm  install

# install additional dependencies for this repo
$ npm install gulp jasmine karma karma-chrome-launcher karma-htmlfile-reporter karma-jasmine karma-requirejs requirejs --save-dev

# run via gulp
gulp testKarma

# or run via karma
karma start

# Note: This uses html reporter to generate a test output file at - test/testOutput.html

This is useful because reading test errors from the command line is difficult with all the noisy information.
