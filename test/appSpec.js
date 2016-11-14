define(['htmlhint'], function(htmlhint) {

    var ruleSets = {
        'tagname-lowercase': true,
        'attr-lowercase': true,
        'attr-value-double-quotes': true,
        'doctype-first': true,
        'steves-rule-capture-all':!0,
        'tag-pair': true,
        'spec-char-escape': true,
        'id-unique': true,
        'src-not-empty': true,
        'attr-no-duplication': true,
        'title-require': true
    };




    describe('htmlhint test 1', function() {

        it('is an example:', function() {
          

            var messages = HTMLHint.verify('<div>hello mum</div>', ruleSets);
            var message;
            for(var i=0, l=messages.length;i<l;i++){
                message = messages[i];

                console.log('message = ' + message.message);
                
            }



            expect('bling').toEqual('ring');

        });



    });

});
