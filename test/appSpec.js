define(['htmlhint'], function(htmlhint) {

    var ruleSets = {
        'steves-rule-capture-all':!0
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
