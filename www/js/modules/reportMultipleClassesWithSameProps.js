var reportMultipleClassesWithSameProps  = function(arrHtmlJson, html){
    new ReportMultipleClassesWithSameProps().init(arrHtmlJson, html);
}
var ReportMultipleClassesWithSameProps = function(){}
ReportMultipleClassesWithSameProps.prototype = {
    init:function(html, strAllStyles){

        var arrHtmlJson = this.getHtmlAsJson(html);
        var objReport = this.recurseJson(arrHtmlJson, html, strAllStyles);

        return objReport;
    },  
    getHtmlAsJson : function(html){
        // remove everything outside body
        //html = html.replace(/^[\w\W]*(<body(\s[^<>]*>|>)[\w\W]*<\/body\s*>)[\w\W]*$/gi,'$1');

        var markers = {
            strMarkerStart : '\u0398',
            strMarkerEnd : '\u20AA',
            strMarkerHandle : '\u20A9',
            strMarkerEndComment : '\u03C8'
        }

        var strWrapped = wrapTagPointers(html, markers);
        
    //console.log('######################################################################################################');
    //console.log('wrapped = ',strWrapped);

        var arrHtmlJson = createHtmlAsJson(strWrapped, markers.strMarkerHandle);

    //console.log('######################################################################################################');
    //console.log('arrHtmlJson =');
    //console.dir(arrHtmlJson);


        return arrHtmlJson;
    },

    recurseJson:function(arrHtmlJson, html, strAllStyles){
        var objReport = {};
        for(var i = 0, intLen = arrHtmlJson.length; i < intLen; ++i){
            var obj = arrHtmlJson[i];
            var attr = obj.attr;
            var strClasses = (attr)?attr.class:'';

            //console.log('line = ', obj.line);  
            //var arrLines = html.split('\n');
            //console.log('line extract = ', arrLines[obj.line]);

            if(strClasses){
                var isMultipleClasses = strClasses.split(' ').length > 1;
                if(isMultipleClasses){
                    objReport = this.filterOutNonParents(strAllStyles, strClasses, obj);
                }
            }
            if(obj.children){
                objReport = this.recurseJson(obj.children, html, strAllStyles);
            }
        }
        return objReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, obj){   

// TO REMOVE - 
// THIS IS JUST FOR TESTING
if(strClasses !== 'theClass1 theClass2'){
    return {};
}     
    // TODO:
        // if an element has more than one class.
        // search theClass in bundle.css and build an array of all items found, irrespective of parent or sibling classes.

        // filter down the class by each preclass/id
            // sibling
            // parent
                // repeat onto the next preclass/id until no more levels exist.
                // once you have an array of all remaining classes - compare the properties, and if any are shared, provide error message.

        strClassesCombined = strClasses.replace(/(^|\s+)/g,'.');

        var objStyles = styleBlocks(strAllStyles, strClassesCombined);

        var arrClasses = strClasses.split(' ');
        var objStylesFiltered = {};
        for(var i=0, intLen = arrClasses.length; i < intLen; ++i){
            var strClass = arrClasses[i];
            objStylesFiltered['.' + strClass] = [];
            objStylesFiltered = this.filterOutParents(strClass, objStyles, obj, objStylesFiltered);
        }


console.log('#########################################');       
console.log('obj = ', obj);
console.log('elem = ', obj.elem);
console.log('strClasses= ', strClasses);    

//console.log('strAllStyles = ', strAllStyles); 
//console.log('objStyles = ');
//console.dir(objStyles);

console.log('objStylesFiltered = ',  objStylesFiltered);

        return {};

    },
    filterOutParents:function(strClass, objStyles, obj, objStylesFiltered){
        var arrStyles = objStyles['.' + strClass];

console.log('#########################################');  
console.log('strClass = ', strClass);


        for(var i = 0, intLen = arrStyles.length; i < intLen; ++i){
            var objEachStyle = arrStyles[i];
            var block = objEachStyle.block;
            block = this.removeClassFromEndOfBlock(block, strClass);
            var strPrecedingSelector = this.getPreceedingSelector(block);        
            var isParent = this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, obj.parent);
            
            if(isParent){
                objStylesFiltered['.' + strClass].push(objEachStyle);
            }       

        }


        return objStylesFiltered;
    }, 
    removeClassFromEndOfBlock:function(block, strClass){
        return block.substring(0, block.lastIndexOf('.' + strClass));
    },
    getPreceedingSelector : function(block){
        var regPreceedingSelector = /[^\s\[\]\(\)\:]+(\:+[^\s\:]+|\[[^\[\]]*\]|\([^\(\)]*\))*(\s*(\+|~|>))?\s*$/i;
        // 

        var strPrecedingSelector = block.substr(block.search(regPreceedingSelector));        
        return strPrecedingSelector;

    },
    recurseParentsToMatchPreceedingSelectors:function(block, strPrecedingSelector, obj){

//console.log('___________________________________________________________');
//console.log('block = ', block)
//console.log('strPrecedingSelector="' +  strPrecedingSelector + '"');
//console.log('obj = ', obj);


        if(!strPrecedingSelector){          
            return true;
        }else if(!obj){
            return false;
        }
        var objCombinedClassOrId = this.getPreceedingClassFromCombinedClasses(strPrecedingSelector);
        var arrClasses = objCombinedClassOrId.arrClasses;
        var arrIds = objCombinedClassOrId.arrIds;

        var hasMatchingClass = this.filterParentsByClass(obj, block, strPrecedingSelector, arrClasses);
        var hasMatchingId = this.filterParentsById(obj, block, strPrecedingSelector, arrIds);
       
        if(arrClasses.length && hasMatchingClass &&  arrIds.length && hasMatchingId){
            return true;
        }else{
            return hasMatchingClass || hasMatchingId;
        }

//  console.log('return false');
        return false;
    },
    filterParentsByClass:function(obj, block, strPrecedingSelector, arrClasses){
        if(arrClasses.length){
            for(var i = 0, intLen = arrClasses.length; i < intLen; ++i){
                var strPrecedingClass = arrClasses[i];     
                var attr = obj.attr;           
                if(!attr){
                    return false;
                }
                var isClassExistInHtml = this.matchInHtml(attr.class, strPrecedingClass.substr(1));

                if(isClassExistInHtml){      

                    block = this.removeClassFromEndOfBlock(block, strPrecedingClass);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, obj.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, obj.parent);
                }
            }
        }
        return false;
    },
    filterParentsById:function(obj, block, strPrecedingSelector, arrIds){
        if(arrIds.length){
            for(var i = 0, intLen = arrIds.length; i < intLen; ++i){
                var strPrecedingId = arrIds[i];
                var attr = obj.attr;
                if(!attr){
                    return false;
                }
                var isIdExistInHtml = this.matchInHtml(attr.id, strPrecedingId.substr(1));
                if(isIdExistInHtml){      
                    block = this.removeClassFromEndOfBlock(block, strPrecedingId);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, obj.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, obj.parent);
                }
            }
        }   
        return false;      
    },
    matchInHtml:function(strAll, strSelector){     
        if(!strAll){ return false;}
        var regHasSelector = RegExp('(^|\\s)' +strSelector + '(\\s|$)');
        return (strAll.search(regHasSelector)!==-1)?true:false;  
    },
    getPreceedingClassFromCombinedClasses:function(strSelector){
        // remove all parenthesis and square bracket matchers.
        strSelector = strSelector.replace(/\[[^\[\]]*\]/g,'');
        strSelector = strSelector.replace(/\([^\(\)]*\)/g,'');

        var regAllCombinedClasses = /([\.\#])[^\.\#\s\>\+\~\[\(\:]+/g;
        var arrMatch;
        var arrClasses = [];
        var arrIds = [];
        while(arrMatch = regAllCombinedClasses.exec(strSelector)){
            var idOrClass = arrMatch[1];
            if(idOrClass === '.'){
                arrClasses.push(arrMatch[0]); 
            }else{
                arrIds.push(arrMatch[0]); 
            }
        }
        return {
            arrClasses:arrClasses,
            arrIds:arrIds
        }
    }

}