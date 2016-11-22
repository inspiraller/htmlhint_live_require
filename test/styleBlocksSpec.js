define(['styleBlocks'], function(styleBlocks) {
    // note: if styleBlocks isn't defined in test-main.js then it won't get pulled in.

   var strAllStyles = `
        .nav{
            margin:10px;
        }
        .genericUL{
            margin:20px;
        }
        .formUL,
        .footerUL{
            margin:40px;
        }
        .something .nav{
            margin:50px;
        }
    `;

    describe('<strong>Testing - styleBlocks: </strong><br/><br/>',function(){


        var strWhen = 'When styles = ' + strAllStyles.replace(/\n/g,'<br/>');
        describe(strWhen, function() { // when...



            var strSelectors = `.footerUL.Whatever`;
            var strAndWhen = '<br/><br/>And multiple selectors = ' + strSelectors;

            describe(strAndWhen, function() { // and when...

                var objStyles = styleBlocks(strAllStyles, strSelectors);

                it("Then = {'.footerUL':[{block:'.footerUL{ }', all:'.formUL,.footerUL{}', line:0}}", function() {// then 
                    expect(
                        objStyles['.footerUL'][0].block
                    ).toBeTruthy();

                });
            });


            var strSelectors = `.nav.contactUL`;
            var strAndWhen = '<br/><br/>And multiple selectors = ' + strSelectors;

            describe(strAndWhen, function() { // and when...

                var objStyles = styleBlocks(strAllStyles, strSelectors);

                it("Then = {'.nav':[{},{}],'.contactUL':[]'}", function() {// then 
                    expect(
                        objStyles['.nav'].length
                    ).toEqual(2);

                    expect(
                        objStyles['.contactUL'].length
                    ).toEqual(0);
                });
            });


            var strSelectors = `.footerUL.nav`;
            var strAndWhen = '<br/><br/>And multiple selectors = ' + strSelectors;

            describe(strAndWhen, function() { // and when...

                var objStyles = styleBlocks(strAllStyles, strSelectors);

                it("Then = {'.footerUL':[{}],'.nav':[{},{}]'}", function() {// then 
                    expect(
                        objStyles['.footerUL'].length
                    ).toEqual(1);

                    expect(
                        objStyles['.nav'].length
                    ).toEqual(2);
                });
            });

        });


    });

});
