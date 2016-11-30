
var trace = function(x){
    console.log(x); 
}

var wrapTagPointers = function(str, markers){
    return new WrapTagPointers().init(str, markers);
}

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

    //str = str.substring(0,100) + '<BIB>' + str.substr(100);

            // remove comments
            //str = str.replace(/-->/g,'¬');
            //str = str.replace(/<\!--[^¬]*¬/g,'');

            // fix self closing
            str = this.fixSelfClosing(str);

            //loop all tags and wrap with markers
            //set markers
            //convert:     <p></p>
            //to:        �<p></p>`
            str = str.replace(/(<\w+([\s\:][^>]*[^\/])?>)/g, strMarkerStart + "$1");
            str = str.replace(/(<\/\w+([\s\:][^>]*)?>)/g,"$1"+strMarkerEnd);



            str = this.removePointersInComments(str, strMarkerStart, strMarkerEnd, strMarkerEndComment);

            //Loop through each wrapped tag and add a handle marker around it. Example:
            //search: �(<(tag) >...</(tag)>)`
            //replace with: ¬1 <(tag) >...</(tag)>¬1
            //replace with: ¬2 <(tag) >...</(tag)>¬2
            //replace with: ¬3 <(tag) >...</(tag)>¬3
            //etc...

            var intC = 0,
            regI = RegExp(strMarkerStart+"(<(\\w[^\\s]*)[^\\/][^"+strMarkerStart+strMarkerEnd+"]*<\\/\\2\\s*>)"+strMarkerEnd,'g');
            var fnReplace = function(){
                var arg = arguments;
                var strA = ((strMarkerHandle + intC + ' ') +  arg[1] + (strMarkerHandle + intC + ' '));
                ++intC;
                return strA;
            }
            // Wrap uncollapsed tags
            while(str.search(regI)!== -1) {str = str.replace(regI,fnReplace);}

            // Wrap collapsed/self closing tags
            str = str.replace(/(\<[^>]*\/>)/g,fnReplace);

//console.log('str = ', str);                

            str = this.testBadHtml(str, strMarkerStart, strMarkerEnd);

        }else{
            //not valid, firebug would show errors.
            trace('You have not supplied any html!');
        }


        return str;
    },
    fixSelfClosing:function(str){
        return str.replace(/<(img|hr|br|meta|area|base|col|command|embed|input|keygen|link|param|source|track|wbr)([^>]*)\/?>/g,'<$1' + '$2/>');
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
    testBadHtml:function(str, strMarkerStart, strMarkerEnd){
        // Test bad html
        var intStartBad = str.lastIndexOf(strMarkerStart);
        var intEndBad = str.search(strMarkerEnd);
        if(intStartBad!==-1){
            var strStart = str.substr(intStartBad);
            var strStartTag = strStart.substring(0, strStart.indexOf('>'));
            var intStartLine = str.substring(0, intStartBad).split('\n').length - 1;

            var strBad = str.substring(0, intEndBad);
            var strBadTag = strBad.substr(strBad.lastIndexOf('<'));
            var intBadLine = str.substring(0, intEndBad).split('\n').length - 1;

            strStartTag = strStartTag.replace(strMarkerStart,'');
            strBadTag = strBadTag.replace(strMarkerEnd,'');

            trace('Your html is not well formed. line:' + intStartLine + ', tag:' + strStartTag + ' doesnt match line: ' + intBadLine + ', tag: ' + strBadTag);

            return null;
        }
        return str;
    },
    removePointersInComments:function(str, strMarkerStart, strMarkerEnd, strMarkerEndComment){

        // Remove tagpointers inside comments /**/ or <!-- --> or <![CDATA[ ]]> 
        str = str.replace(/(\-\-\>|\*\/|\\]\\]>)/g,'$1' + strMarkerEndComment);            
        var regInsideComments = RegExp('((<\\!--|\\/\\*|<\\!\\[CDATA)[^\\' + strMarkerEndComment + '\\' + strMarkerStart + '\\'  + strMarkerEnd + ']*' + ')[\\' + strMarkerStart + '\\' + strMarkerEnd + ']','gi');      
        while(str.search(regInsideComments) !==-1){                   
          str = str.replace(regInsideComments,'$1');
        }
        str = str.replace(RegExp('\\' + strMarkerEndComment,'g'),'');
        
        // Remove tagpointers inside script comments //
        str = str.replace(/(<\/script\s*>)/g,'$1' + strMarkerEndComment);            
        var regInsideScriptComments = RegExp('(<script(\s|>)[^\\' + strMarkerEndComment + ']*\\/\\/[^\\n\\r\\f\\' + strMarkerEndComment + ']*)[\\' + strMarkerStart + '\\'  + strMarkerEnd  + ']','gi');            
        while(str.search(regInsideScriptComments) !==-1){                   
          str = str.replace(regInsideScriptComments,'$1');
        }


        // Remove tagpointers inside <script> or <script type="text/javascript"> or <script language="javascript">          
        var regInsideScriptComments = RegExp('(<script(\\s+(type\\=\\"text\\/javascript\\"|language\\=\\"javascript\\"))*\s*>)([^\\' + strMarkerEndComment + ']*)[\\' + strMarkerStart + '\\'  + strMarkerEnd  + ']([^\\' + strMarkerEndComment+ ']*)\\' + strMarkerEndComment,'gi');            
        while(str.search(regInsideScriptComments) !==-1){                   
          str = str.replace(regInsideScriptComments,'$1' + '$4' + '$5');
        }

        str = str.replace(RegExp('\\' + strMarkerEndComment,'g'),'');    


        return str;   
    }
}