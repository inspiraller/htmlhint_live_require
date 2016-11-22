define(['wrapTagPointers'], function(wrapTagPointers) {
    // note: if styleBlocks isn't defined in test-main.js then it won't get pulled in.


    describe('<strong style="color:blue">Testing - wrapTagPointers: </strong><br/><br/>',function(){

        var markers = {
            strMarkerStart : '\u0398',
            strMarkerEnd : '\u20AA',
            strMarkerHandle : '\u20A9',
            strMarkerEndComment : '\u03C8'
        }

       var html = `<!DOCTYPE HTML>
<html>
    <script>
        //<tag>
    </script>
    <tag></tag>
</html>`;

        var strMarkerHandle = markers.strMarkerHandle;
        var strWhen = 'When html = ' + html.replace(/</g,'&lt;').replace(/\n/g,'<br/>');
        describe(strWhen, function() { // when...

            var strWrapped = wrapTagPointers(html, markers);

            var strResultShouldBe = `<!DOCTYPE HTML>
₩2 <html>
    ₩0 <script>
        //<tag>
    </script>₩0 
    ₩1 <tag></tag>₩1 
</html>₩2 `;

            it("Then result = " + strResultShouldBe, function() {// then 
                expect(
                   strWrapped 
                ).toEqual(strResultShouldBe);

            });
            
        });

    });
});
