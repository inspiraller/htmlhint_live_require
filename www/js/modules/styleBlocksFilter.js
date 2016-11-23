
var styleBlocksFilter = function(strClasses, objElem, objStyles){
    var inst = new StyleBlocksFilter();
    return inst.init(strClasses, objElem, objStyles);
}
var StyleBlocksFilter = function(){}
StyleBlocksFilter.prototype = {
    init:function(strClasses, objElem, objStyles){
        var objStylesFiltered = {};
        objStylesFiltered = this.classesAndIds(strClasses, objElem, objStyles, objStylesFiltered);
        return objStylesFiltered;
    },
    classesAndIds:function(strClasses, objElem, objStyles, objStylesFiltered){
        var arrClasses = strClasses.split(' ');        
        for(var i=0, intLen = arrClasses.length; i < intLen; ++i){
            var strClass = arrClasses[i];
            objStylesFiltered['.' + strClass] = [];
            objStylesFiltered = this.filterOutParents(strClass, objStyles, objElem, objStylesFiltered);
        }


console.log('#########################################');       
console.log('objElem = ', objElem);
console.log('elem = ', objElem.elem);
console.log('strClasses= ', strClasses);    

//console.log('strAllStyles = ', strAllStyles); 
//console.log('objStyles = ');
//console.dir(objStyles);

console.log('objStylesFiltered = ',  objStylesFiltered);

        return objStylesFiltered;
    },
    filterOutParents:function(strClass, objStyles, objElem, objStylesFiltered){
        var arrStyles = objStyles['.' + strClass];

console.log('#########################################');  
console.log('strClass = ', strClass);


        for(var i = 0, intLen = arrStyles.length; i < intLen; ++i){
            var objEachStyle = arrStyles[i];
            var block = objEachStyle.block;
            block = this.removeClassFromEndOfBlock(block, strClass);
            var strPrecedingSelector = this.getPreceedingSelector(block);        
            var isParent = this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, objElem.parent);
            
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
    recurseParentsToMatchPreceedingSelectors:function(block, strPrecedingSelector, objElem){

//console.log('___________________________________________________________');
//console.log('block = ', block)
//console.log('strPrecedingSelector="' +  strPrecedingSelector + '"');
//console.log('objElem = ', objElem);


        if(!strPrecedingSelector){          
            return true;
        }else if(!objElem){
            return false;
        }

        var hasGenericParentClassOrId = this.hasGenericParentClassOrId(block, strPrecedingSelector, objElem);

        // TOD
        // hasDirectParent
        // hasDirectSibling
        // hasGenericSibling
        // hasElem
        // hasSquare
        // hasPseudo


        return hasGenericParentClassOrId;
    },

    /*********************************************************************************************/
    /* hasGenericParentClassOrId() - Generic, meaning non direct parent */
    hasGenericParentClassOrId:function(block, strPrecedingSelector, objElem){
        var objCombinedClassOrId = this.getParentsFromCombinedSelectors(strPrecedingSelector);
        var arrClasses = objCombinedClassOrId.arrClasses;
        var arrIds = objCombinedClassOrId.arrIds;

        var hasMatchingClass = this.filterParentsByClass(objElem, block, strPrecedingSelector, arrClasses);
        var hasMatchingId = this.filterParentsById(objElem, block, strPrecedingSelector, arrIds);
       
        if(arrClasses.length && hasMatchingClass &&  arrIds.length && hasMatchingId){
            return true;
        }else{
            return hasMatchingClass || hasMatchingId;
        }
    },
    getParentsFromCombinedSelectors:function(strSelector){
        var arrClasses = [];
        var arrIds = [];
        var isSiblingSelector = (strSelector.search(/[\+\~]\s*$/)!==-1)?true:false;

        if(!isSiblingSelector){

            // remove all parenthesis and square bracket matchers.
            strSelector = strSelector.replace(/\[[^\[\]]*\]/g,'');
            strSelector = strSelector.replace(/\([^\(\)]*\)/g,'');
            
            var regAllCombinedClasses = /([\.\#])[^\.\#\s\>\+\~\[\(\:]+/g;
            var arrMatch;

            while(arrMatch = regAllCombinedClasses.exec(strSelector)){
                var idOrClass = arrMatch[1];
                if(idOrClass === '.'){
                    arrClasses.push(arrMatch[0]); 
                }else{
                    arrIds.push(arrMatch[0]); 
                }
            }
        }
        return {
            arrClasses:arrClasses,
            arrIds:arrIds
        }
    }, 
    filterParentsByClass:function(objElem, block, strPrecedingSelector, arrClasses){
        if(arrClasses.length){
            for(var i = 0, intLen = arrClasses.length; i < intLen; ++i){
                var strPrecedingClass = arrClasses[i];     
                var attr = objElem.attr;           
                if(!attr){
                    return false;
                }
                var isClassExistInHtml = this.matchInHtml(attr.class, strPrecedingClass.substr(1));

                if(isClassExistInHtml){      

                    block = this.removeClassFromEndOfBlock(block, strPrecedingClass);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, objElem.parent);
                }
            }
        }
        return false;
    },
    filterParentsById:function(objElem, block, strPrecedingSelector, arrIds){
        if(arrIds.length){
            for(var i = 0, intLen = arrIds.length; i < intLen; ++i){
                var strPrecedingId = arrIds[i];
                var attr = objElem.attr;
                if(!attr){
                    return false;
                }
                var isIdExistInHtml = this.matchInHtml(attr.id, strPrecedingId.substr(1));
                if(isIdExistInHtml){      
                    block = this.removeClassFromEndOfBlock(block, strPrecedingId);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, objElem.parent);
                }
            }
        }   
        return false;      
    },
    matchInHtml:function(strAll, strSelector){     
        if(!strAll){ return false;}
        var regHasSelector = RegExp('(^|\\s)' +strSelector + '(\\s|$)');
        return (strAll.search(regHasSelector)!==-1)?true:false;  
    }
};