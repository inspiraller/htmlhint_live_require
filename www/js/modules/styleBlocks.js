var encodeSelector = function(str){
    return str.replace(/([^\w\d\s<>])/gi,'\\' + '$1');
}

var styleBlocks = function(strAllStyles, strSelectors){
    return new StyleBlocks().init(strAllStyles, strSelectors);
}
var StyleBlocks = function(){};
StyleBlocks.prototype = {
    init : function(strAllStyles, strSelectors){

        var obj = {};
        var arrClasses = strSelectors.split('.');

        if(arrClasses.length > 1){
            obj = this.findClassesInStyles(strAllStyles, arrClasses, obj);           
        }
 
        return obj;
    },
    findClassesInStyles : function(strAllStyles, arrClasses, obj){
        for(var i = 1, intLen = arrClasses.length; i < intLen; ++i){


            var strClass = '.' + arrClasses[i];
            var encodedSelector = '\\.' + arrClasses[i];

            obj[strClass] = [];
           

            var regMatchWholeBlock = RegExp('(^|\\n)[^\\{\\}]*' + encodedSelector + '\\s*[\\,\\{\\.\\#\\:\\[][^\\}]*\\}','g');
            var regMatchSameClass = RegExp('(^|\\,)([^\\{\\,]*' + encodedSelector + '(\\[[^\\]]*\\]|\\:[^\\:][^\\,\\{]*|[\\#\\.][^\\,\\{]*)*)\\s*[\\,\\{]','g');

            var intLine = this.getLine(strAllStyles, regMatchWholeBlock.lastIndex);

            var arrMatch = null;

            while(arrMatch = regMatchWholeBlock.exec(strAllStyles)){            
                var strMatch = arrMatch[0];               
                obj = this.filterCombinedClassesToSingleLine(obj, strClass, strMatch, intLine, regMatchSameClass);
            }
        }
        return obj;
    },
    filterCombinedClassesToSingleLine : function(obj, strClass, strMatch,  intLine, regMatchSameClass){
        // replace all other commas..
        var strReplaceComments = this.replaceComments(strMatch);
        var strCssProps = strMatch.replace(/^[^\{]*/,'');
        var arrMatchSameClass;

        while(arrMatchSameClass = regMatchSameClass.exec(strReplaceComments)){
            var strEach = arrMatchSameClass[2].replace(/^\s*/,'');
            var strFiltered = strEach + strCssProps;
          
            obj[strClass].push({
                line:intLine,
                block:strFiltered,                    
                all:strMatch
            }); 
        }
        return obj;
    },
    getLine : function(styles, intPos){
        var arrMatch = styles.substring(0, intPos).match(/\n/g);
        return (arrMatch && arrMatch.length)?arrMatch.length - 1:0;
    },
    replaceComments : function(style){
        style = style.replace(/\*\//g,'¬');   

        // TODO: line number will be wrong if removing \n
        style = style.replace(/\/\*[^\¬]*\¬/g,'');
        return style;
    }    
}

