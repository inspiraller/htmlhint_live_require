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

            var regMatchWholeBlock = RegExp('(^|\\n|\\}) *([^\\{\\}\\n]*' + encodedSelector + '\\s*[\\,\\{\\.\\#\\:\\[][^\\}]*\\})','g');
            var regMatchSameClass = RegExp('(^|\\,)([^\\{\\,]*' + encodedSelector + '(\\[[^\\]]*\\]|\\:[^\\:][^\\,\\{]*|[\\#\\.][^\\,\\{]*)*)\\s*[\\,\\{]','g');

            var arrMatch = null;

            while(arrMatch = regMatchWholeBlock.exec(strAllStyles)){          
                var strMatch = arrMatch[2];               
                var intLine = this.getLine(strAllStyles, regMatchWholeBlock.lastIndex);  
   

                var strLastSelector = this.getLastSelector(strMatch);
                obj[strClass] = [];

                var arrAdjoinedWith = this.getAdjoinedWith(strLastSelector, strClass, strLastSelector);

                obj = this.filterCombinedClassesToSingleLine(obj, strClass, strMatch, intLine, regMatchSameClass, strLastSelector, arrAdjoinedWith);

            }
        }

        return obj;
    },
    getLastSelector:function(strMatch){
        var reg = /(^|\s)([\w\.\#\[\(][^\s\{\}]*)\s*(\{|$)/;
        var arrLastSelector = strMatch.match(reg);
        if(arrLastSelector && arrLastSelector.length){
            return arrLastSelector[2];
        }
        return null;
    },
    getAdjoinedWith:function(strSelectors, strClass, strLastSelector){
        // TODO - tidy up
        var reg = /([\w\.\#\[\(][^\s\{\}\.\#\[\(]+)/g;
        var arrMatch;
        var arrAdjoinedWith = [];

        while(arrMatch = reg.exec(strSelectors)){
            if(arrMatch[1] !== strClass){
                arrAdjoinedWith.push(arrMatch[1]);
            }
        }
        return arrAdjoinedWith;
    },
    filterCombinedClassesToSingleLine : function(obj, strClass, strMatch,  intLine, regMatchSameClass, strLastSelector, arrAdjoinedWith){
        // replace all other commas..
        var strNoContentInComments = this.replaceContentInComments(strMatch);
        var strCssProps = strMatch.replace(/^[^\{]*/,'');
        var arrMatchSameClass;
        var props = this.getProps(strCssProps);

        while(arrMatchSameClass = regMatchSameClass.exec(strNoContentInComments)){
            var strEach = arrMatchSameClass[2];
            
            strEach = strEach.replace(/^\s*\}?\s*/,'');

            var strFiltered = strEach + strCssProps;

            var objToPush = {
                selector:strLastSelector,
                line:intLine,
                block:strFiltered,
                all:strMatch,
                props:props
            };
            if(arrAdjoinedWith.length > 0){
                objToPush.arrAdjoinedWith = arrAdjoinedWith;
            }
            obj[strClass].push(objToPush);
        }
        return obj;
    },
    getProps:function(strCssProps){
        if(strCssProps){
            var reg = /[\{\;]\s*([^\:\s\;\}\{\!]+)\:\s*([^\;\:\}\{\!]+)/g;

 
            var arr;
            var props = {};
            while(arr = reg.exec(strCssProps)){
                var key = arr[1];
                var val = arr[2]
                props[key] = val;
            }
            return props;
            
        }
        return {};
    },
    getLine : function(styles, intPos){
        var arrMatch = styles.substring(0, intPos).match(/\n/g);
        return (arrMatch && arrMatch.length)?arrMatch.length:0;
    },
    replaceContentInComments : function(style){
        style = style.replace(/\*\//g,'¬');   

        style = style.replace(/\/\*([^\¬]*)\¬/g,function($0, $1){
            var strCommentKeepNewLines = $1.replace(/[^\n]*/g,'');
            return '/' + '*' + strCommentKeepNewLines + '*' + '/';
        });
        return style;
    }    
}

