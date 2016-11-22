define([
    'styleBlocks',
    'wrapTagPointers',
    'createHtmlAsJson',
    'reportMultipleClassesWithSameProps'
], function(
    styleBlocks, 
    wrapTagPointers, 
    createHtmlAsJson, 
    reportMultipleClassesWithSameProps
) {

    // note: if styleBlocks isn't defined in test-main.js then it won't get pulled in.


    var strAllStyles = `
    /* 1 class separator */
    #grandDaddy .theClass1{
        font-size:1px;
    }

    /* 1 class separator by different class */
    #grandDaddy .theClass2{
        font-size:2px;
    }


    /* parent sibling separator */
    .parentDeep2_1_A + parentDeep2_2_B .theClass2{
        font-size:3px;
    }

    /* sibling separator */
    #someSibling + .theClass2{
        font-size:3px;
    }

    /* many ancestor separator  */
    .grandDaddyClass_A .parentDeep1 .parentDeep2_2_A .theClass1{
        font-size:4px;
    }

    /* combinator - single class */
    .parentDeep1,
    .theClass1,
    #grandDaddy{
        font-size:5px;
    }

    /* combinator - sibling class */
    #someSibling + .theClass2,
    .theClass1{
        font-size:6px;
    }

    /* combinator - attached - ancestor class */
    #grandDaddy.grandDaddyClass_A .theClass2,
    .theClass1{
        font-size:7px;
    }

    /* many commas*/
    .somethingElse .whatever,
    .somethingElse .somethin.theClass23,
    .somethingElse .something.2theClass2.theClass2,
    .theClass23,
    .something .theClass2{
        font-size:8px;
    }


    /* square brackets*/
    .somethingElse .whatever[somethingelse],
    .something .theClass2[something]{
        font-size:8px;
    }

    /* psuedo */
    .something .theClass2:first-child.somethingElse{
        font-size:8px;
    }


    /* combined on end*/
    .whatever,
    .something .theClass2.somethingElse#somethingElse,
    .whatever2{
        font-size:8px;
    }


    /* the wrong class */
    .theClass12{
        background:red;
    }
    /* the wrong class */
    .theClass12,    
    .ttheClass1{
        background:blue;
    }
`;

    var html = `&lt;!DOCTYPE HTML&gt;
    &lt;html&gt;
    &lt;head&gt;
        &lt;meta charset=&quot;UTF-8&quot;&gt;
        &lt;title&gt;HTMLHint&lt;/title&gt;

        &lt;script&gt;

    /*    
            &lt;tag&gt;&lt;/tag&gt;
    */

    //  &lt;tag&gt;&lt;/tag&gt;

        &lt;/script&gt;


    &lt;/head&gt;
    <!-- 
    &lt;tag&gt;&lt;/tag&gt;

    -- -- -->

    &lt;body&gt;

    &lt;div id="grandDaddy" class="grandDaddyClass_A grandDaddyClass_B"&gt;
        &lt;span class='parentDeep1 parentDeep1_A'&gt;&times;&lt;/span&gt;
        &lt;div class='parentDeep1'&gt;
            &lt;div class="parentDeep2_1_A"&gt;&lt;/div&gt;
            &lt;div class='parentDeep2_2_A parentDeep2_2_B'&gt;
                &lt;h3 id="someSibling" class="sibling_A   sibling1_B"&gt;
                    &lt;span class="spanX"&gt;some span text 1&lt;/span&gt;
                    HTML/CSS
                    &lt;p&gt; 
                        &lt;i&gt; italic text &lt;/i&gt;
                    &lt;/p&gt;
                    &lt;span class="spanY"&gt;some span text 2&lt;/span&gt;

                &lt;/h3&gt;
                &lt;p class="sibling_A"&gt;&lt;/p&gt;
                &lt;a class="theClass1 theClass2"&gt; content&lt;/a&gt;
            &lt;/div&gt;
        &lt;/div&gt;      
    &lt;/div&gt;


    &lt;/body&gt;
    &lt;/html&gt;`;
    html = html.replace(/\&lt\;/g,'<').replace(/\&gt\;/g,'>');

    var objReport = reportMultipleClassesWithSameProps(html, strAllStyles);


console.log('objReport = ', objReport);
});
