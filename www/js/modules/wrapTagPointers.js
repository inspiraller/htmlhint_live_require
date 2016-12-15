
var trace = function(x){
    console.log(x); 
};

var wrapTagPointers = function(str, markers){
    return new WrapTagPointers().init(str, markers);
};

var WrapTagPointers = function(){};

WrapTagPointers.prototype = {

    init:function(str, markers){


        str = this.fixQuotes(str);

        var strMarkerStart = markers.strMarkerStart;
        var strMarkerEnd = markers.strMarkerEnd;
        var strMarkerHandle = markers.strMarkerHandle;
        var strMarkerEndComment = markers.strMarkerEndComment;

    //If contains html
        if(str.search(/[<>]/)!==-1){

            // fix self closing
            str = this.fixSelfClosing(str);

            //loop all tags and wrap with markers
            //set markers
            //convert:     <p></p>
            //to:        �<p></p>`
            str = str.replace(/(<\w+(\s+|[\s\:][^>]*[^\/])?>)/g, strMarkerStart + "$1");
            str = str.replace(/(<\/\w+([\s\:][^>]*)?>)/g,"$1"+strMarkerEnd);

            str = this.removePointersInComments(str, strMarkerStart, strMarkerEnd, strMarkerEndComment);


            //Loop through each wrapped tag and add a handle marker around it. Example:
            //search: �(<(tag) >...</(tag)>)`
            //replace with: ¬1 <(tag) >...</(tag)>¬1
            //replace with: ¬2 <(tag) >...</(tag)>¬2
            //replace with: ¬3 <(tag) >...</(tag)>¬3
            //etc...


            var strWellFormed = str;

            var intC = 0,
            regI = RegExp(strMarkerStart+"(<(\\w[^\\s]*)[^\\/][^"+strMarkerStart+strMarkerEnd+"]*<\\/\\2\\s*>)"+strMarkerEnd,'g');
            var fnReplace = function(){
                var arg = arguments;
                var strA = ((strMarkerHandle + intC + ' ') +  arg[1] + (strMarkerHandle + intC + ' '));
                ++intC;
                return strA;
            };
            // Wrap uncollapsed tags
            while(strWellFormed.search(regI)!== -1) {strWellFormed = strWellFormed.replace(regI,fnReplace);}

            // Wrap collapsed/self closing tags
            strWellFormed = strWellFormed.replace(/(<[^>]*\/>)/g,fnReplace);
             
            //console.log('after - str = ', str);

            var objBadHtml = this.testBadHtml(strWellFormed, strMarkerStart, strMarkerEnd);

            if(objBadHtml){
                return {
                    objStart:objBadHtml.objStart,
                    objEnd:objBadHtml.objEnd,
                    isValid:false,
                    strHtml:strWellFormed
                };
            }else{
                return {
                    isValid:true,
                    strHtml:strWellFormed
                };
            }

        }else{
            return {
                isValid:false,
                intStartLine:0,
                strMsg:'You have not supplied any html!',
                strHtml:str
            };            
        }

    },
    fixSelfClosing:function(str){
        str = str.replace(/<(img|hr|br|meta|area|base|col|command|embed|input|keygen|link|param|source|track|wbr)([^>]*)\/?>/g,'<$1' + '$2/>');

        // if self closing fix has added to a non self closing item - ie <input></input> then remove the self closing fix.
        str = str.replace(/<(img|hr|br|meta|area|base|col|command|embed|input|keygen|link|param|source|track|wbr)([^<>]*)\/(>[^<]*<\/\1\s*>)/g,'<' + '$1' + '$2' + '$3');
        return str;
    },
    fixQuotes:function(html){

        // find
        // <input disabled selected=\'selected and something\' dude checked="checked" whatever whatever2/>

        // replace with
        // <input disabled selected="selected and something" dude checked="checked" whatever whatever2/>
      
        var regAttrApos = /(<[^<>]*\s)(\w[^\=<>\s\'\"]*)\=\'([^\']*)\'/g;
        while(html.search(regAttrApos) !== -1){
            html = html.replace(regAttrApos,'$1' + '$2="$3"');
        }
      
        // find
        // <input disabled selected=\'selected and something\' dude checked="checked" whatever whatever2/>

        // replace with
        // <input disabled="disabled" selected="selected and something" dude="dude" checked="checked" whatever="whatever" whatever2="whatever2"/>
      
      
        var regAttrNothing = /(<\w[^\s<>]*)((\s+\w[^\=<>\s\'\"]*\=\"[^\"]*\")*)\s(\w[^\=<>\s\'\"\/]*)(\s|\/|>)/g;  
        while(html.search(regAttrNothing) !== -1){           
          html = html.replace(regAttrNothing,'$1' + '$2' + ' ' + '$4' + '="' + '$4' + '"' + '$5');
        }
     
        // todo:
        // <body class="something" id="missingendquote>
        // <body class="missingendquote id="">

        return html;
    },    
    testBadHtml:function(strWellFormed, strMarkerStart, strMarkerEnd){
        // Test bad html
        var intStartBad = strWellFormed.lastIndexOf(strMarkerStart);

        if(intStartBad!==-1){
            var objStart = this.getBadStartTag(strWellFormed, intStartBad, strMarkerStart);
            var strStartTag = objStart.strStartTag;
            var intStartLine = objStart.intStartLine;

            var objEnd = this.getBadEndTag(strWellFormed, intStartBad, strMarkerEnd);
            var strEndTag = objEnd.strEndTag;
            var intEndLine = objEnd.intEndLine;

            return {
                objStart:objStart,
                objEnd:objEnd
            };
        }
        return false;
    },
    getBadStartTag:function(str, intStartBad, strMarkerStart){
        var strStart = str.substr(intStartBad);
        var strStartTag = strStart.substring(0, strStart.indexOf('>'));
        var intStartLine = str.substring(0, intStartBad).split('\n').length;
        strStartTag = strStartTag.replace(strMarkerStart,'');
        return {
            strStartTag:strStartTag,
            intStartLine:intStartLine
        };

    },
    getBadEndTag:function(str, intStartBad, strMarkerEnd){
        // find first instance of bad marker.
        var intEndBad = intStartBad + str.substr(intStartBad).search(strMarkerEnd);

        if(intEndBad < intStartBad){
            return {
                intEndLine:str.length
            };
        }else{
            var strBad = str.substring(0, intEndBad);
            var strBadTag = strBad.substr(strBad.lastIndexOf('<'));
            var intEndLine = str.substring(0, intEndBad).split('\n').length;        
            var strEndTag = strBadTag.replace(strMarkerEnd,'');

            return {
                strEndTag:strEndTag,
                intEndLine:intEndLine
            };
        }

    },
    removePointersInComments:function(str, strMarkerStart, strMarkerEnd, strMarkerEndComment){

        // remove any existing end marker after a --<
        str = str.replace(RegExp('(\\-\\->)\\' + strMarkerEnd,'g'),'$1');

        // Remove tagpointers inside  <!-- --> 
        str = str.replace(RegExp('(\\-\\->)','g'),'$1' + strMarkerEndComment);
        var regInsideComments = RegExp('(<\\!\\-\\-[^\\' + strMarkerEndComment + '\\' + strMarkerStart + '\\'  + strMarkerEnd + ']*' + ')[\\' + strMarkerStart + '\\' + strMarkerEnd + ']','gi');      
        while(str.search(regInsideComments) !==-1){                   
          str = str.replace(regInsideComments,'$1');
        }

        // Remove tagpointers inside  <![CDATA[]]>
        str = str.replace(/(\]\]>)/g,'$1' + strMarkerEndComment);

        var regInsideCdata = RegExp('(<\\!\\[CDATA\\[[^\\' + strMarkerEndComment + '\\' + strMarkerStart + '\\'  + strMarkerEnd + ']*' + ')[\\' + strMarkerStart + '\\' + strMarkerEnd + ']','gi');      
        while(str.search(regInsideCdata) !==-1){                   
          str = str.replace(regInsideCdata,'$1');
        }

        // Remove tagpointers inside <script> or <script type="text/javascript"> or <script language="javascript">        
        str = str.replace(/(<\/script\s*>)/g,'$1' + strMarkerEndComment);              
        var regInsideScript = RegExp('(<script(\\s+(type\\=\\"text\\/javascript\\"|language\\=\\"javascript\\"))*\s*>)([^\\' + strMarkerEndComment + ']*)[\\' + strMarkerStart + '\\'  + strMarkerEnd  + ']([^\\' + strMarkerEndComment+ ']*)\\' + strMarkerEndComment,'gi');            
        while(str.search(regInsideScript) !==-1){                   
          str = str.replace(regInsideScript,'$1' + '$4' + '$5');
        }
       
        // Remove tagpointers inside script comments //        
        var regInsideScriptLineComment = RegExp('(<script(\s|>)[^\\' + strMarkerEndComment + ']*\\/\\/[^\\n\\r\\f\\' + strMarkerEndComment + ']*)[\\' + strMarkerStart + '\\'  + strMarkerEnd  + ']','gi');            
        while(str.search(regInsideScriptLineComment) !==-1){                   
          str = str.replace(regInsideScriptLineComment,'$1');
        }

        // Remove tagpointers inside script comments /* */
        str = str.replace(/(\/\*)/g,'$1' + strMarkerEndComment);     
        var regInsideStar = RegExp('(\\/\\*[^\\' + strMarkerEndComment + '\\' + strMarkerStart + '\\'  + strMarkerEnd + ']*' + ')[\\' + strMarkerStart + '\\' + strMarkerEnd + ']','gi');      
        while(str.search(regInsideStar) !==-1){                   
          str = str.replace(regInsideStar,'$1');
        }

        str = str.replace(RegExp('\\' + strMarkerEndComment,'g'),'');    


        return str;   
    }
};