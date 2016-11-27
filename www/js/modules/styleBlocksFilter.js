
var styleBlocksFilter = function(strClasses, objElem, objStyles){
    var inst = new StyleBlocksFilter();
    return inst.init(strClasses, objElem, objStyles);
}
var StyleBlocksFilter = function(){}
StyleBlocksFilter.prototype = {
    init:function(strClasses, objElem, objStyles){
        var objStylesFiltered = {};
        objStylesFiltered = this.filterOnClasses(strClasses, objElem, objStyles, objStylesFiltered);
        return objStylesFiltered;
    },
    filterOnClasses:function(strClasses, objElem, objStyles, objStylesFiltered){
        var arrClasses = strClasses.split(' ');        
        for(var i=0, intLen = arrClasses.length; i < intLen; ++i){
            var strClass = arrClasses[i];

            if(strClass){
//console.log('strClass = ', strClass);
                objStylesFiltered['.' + strClass] = [];

                objStylesFiltered = this.filterOutParents(strClass, objStyles, objElem, objStylesFiltered);
            }
        }


//console.log('#########################################');       
//console.log('objElem = ', objElem);
//console.log('elem = ', objElem.elem);
//console.log('strClasses= ', strClasses);    

//console.log('strAllStyles = ', strAllStyles); 
//console.log('objStyles = ');
//console.dir(objStyles);

//console.log('objStylesFiltered = ',  objStylesFiltered);

        return objStylesFiltered;
    },
    filterOutParents:function(strClass, objStyles, objElem, objStylesFiltered){
        var arrStyles = objStyles['.' + strClass];

//console.log('#########################################');  
//console.log('strClass = ', strClass);


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
    removeIdFromEndOfBlock:function(block, strId){
        return block.substring(0, block.lastIndexOf(strId));
    },    
    getPreceedingSelector : function(block){
        var regPreceedingSelector = /[^\s\[\]\(\)\:]+(\:+[^\s\:]+|\[[^\[\]]*\]|\([^\(\)]*\))*(\s*(\+|~|>))?\s*$/i;
        // 

        var strPrecedingSelector = block.substr(block.search(regPreceedingSelector));        
        return strPrecedingSelector;

    },
    recurseParentsToMatchPreceedingSelectors:function(block, strSelector, objElem){

//console.log('___________________________________________________________');
//console.log('block = ', block)
//console.log('strSelector="' +  strSelector + '"');
//console.log('objElem = ', objElem);


        if(!strSelector){          
            return true;
        }else if(!objElem){
            return false;
        }

        var isMatch = this.matchSelectorsOnParent(block, strSelector, objElem);

        // TOD
        // hasDirectParent
        // hasDirectSibling
        // hasGenericSibling
        // hasElem
        // hasSquare
        // hasPseudo

        return isMatch;
    },

    /*********************************************************************************************/
    matchSelectorsOnParent:function(block, strSelector, objElem){
        var objAdjoined = this.getAdjoined(strSelector);


        var arrClasses = objAdjoined.arrClasses;
        var strId = objAdjoined.strId;
        var strElem = objAdjoined.strElem;

        var isSelectors = (Object.keys(objAdjoined).length > 0)? true:false;

console.log('objAdjoined = ', objAdjoined);
console.log('isSelectors = ', isSelectors);

  // ######################################################################################
  /*    TO INSTATE
        if(isSelectors){
            var isParentMatchAdjoined = this.matchAdjoinedOnParent(objElem, objAdjoined);            
            if(isParentMatchAdjoined){

                var strPrevPrecedingSelector = this.removeLastAjoiningSelectorsFromBlock(block);
                return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);       
            }else{
                return this.recurseParentsToMatchPreceedingSelectors(block, strSelector, objElem.parent);
            }
        }else{
            return false;
        }
*/



        // #####################################################
        // TO REMOVE
        if(arrClasses.length){
            for(var i = 0, intLen = arrClasses.length; i < intLen; ++i){
                var strClass = arrClasses[i];     
                var attr = objElem.attr;           
                if(!attr){
                    return false;
                }
                var isClassExistInHtml = this.matchInHtml(attr.class, strClass.substr(1));

                if(isClassExistInHtml){      

                    block = this.removeClassFromEndOfBlock(block, strClass);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strSelector, objElem.parent);
                }
            }
        }
        return false;

/*
        var hasMatchingClass = this.filterParentsByClass(objElem, block, strSelector, arrClasses);
        var hasMatchingId = this.filterParentsById(objElem, block, strSelector, strId);
       
        if(arrClasses.length && hasMatchingClass &&  arrIds.length && hasMatchingId){
            return true;
        }else{
            return hasMatchingClass || hasMatchingId;
        }
        */
    },
    getAdjoined:function(strSelector){
        var objAdjoined = {};

        var arrClasses = [];
        var strId = '';
        var strElem = '';

        var isSiblingSelector = (strSelector.search(/[\+\~]\s*$/)!==-1)?true:false;

        if(!isSiblingSelector){

            // remove all parenthesis and square bracket matchers.
            strSelector = strSelector.replace(/\[[^\[\]]*\]/g,'');
            strSelector = strSelector.replace(/\([^\(\)]*\)/g,'');
            
            // get classes
            var regAllCombinedClasses = /\.[^\.\#\s\>\+\~\[\(\:]+/g;
            var arrMatch;
            while(arrMatch = regAllCombinedClasses.exec(strSelector)){                
                arrClasses.push(arrMatch[0]); 
            }

            if(arrClasses.length){
                objAdjoined.arrClasses = arrClasses;
            }

            // get id
            var arrId = strSelector.match(/\#[^\.\#\s\>\+\~\[\(\:]+/);
            if(arrId && arrId.length){
                objAdjoined.strId = arrId[0];
            }

            // get elem
            var arrElem = strSelector.match(/^\s*([^\.\#\s\>\+\~\[\(\:]+)/);
            if(arrElem && arrElem.length){
                objAdjoined.strElem = arrElem[1];
            }

        }
        return objAdjoined;
    }, 
    matchAdjoinedOnParent:function(objElem, objAdjoined){

        // test if elem
        var strElem = objAdjoined.strElem;
        if(strElem!=='' && objElem.elem !== strElem){
            return false;
        }
        var attr = objElem.attr;

        // test if id
        var strId = objAdjoined.strId;
        if(strId!=='' && attr.id !== strId.substr(1)){
            return false;
        }

        var arrClasses = objAdjoined.arrClasses;
        if(arrClasses && arrClasses.length){
            for(var i=0, intLen = arrClasses.length; i < intLen; ++i){
                var strClass = arrClasses[i];
                var reg = RegExp('(^|\\s)' + strClass.substr(1) + '(\\s|$)');
                if(attr.class.search(reg) === -1){
                    return false;
                }                
            }
        }

        return true;
    },
    removeLastAjoiningSelectorsFromBlock:function(block){
        var intIndexSpaceInBrackets = block.search(/([\(\[]|$)/);
        block = block.substring(0, intIndexSpaceInBrackets);
        var reg = /[^\s\[\]\(\)\:]+(\:+[^\s\:]+|\[[^\[\]]*\]|\([^\(\)]*\))*(\s*(\+|~|>))?\s*$/i;
        block = block.replace(regPreceedingSelector,'');
        block = block.replace(/\s*$/,'');
        return block;
    },
    filterParentsByClass:function(objElem, block, strSelector, arrClasses){
        if(arrClasses.length){
            for(var i = 0, intLen = arrClasses.length; i < intLen; ++i){
                var strClass = arrClasses[i];     
                var attr = objElem.attr;           
                if(!attr){
                    return false;
                }
                var isClassExistInHtml = this.matchInHtml(attr.class, strClass.substr(1));

                if(isClassExistInHtml){      

                    block = this.removeClassFromEndOfBlock(block, strClass);
                    var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                
                    return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);
                }else{
                    return this.recurseParentsToMatchPreceedingSelectors(block, strSelector, objElem.parent);
                }
            }
        }
        return false;
    },
    filterParentsById:function(objElem, block, strSelector, strId){
        if(strId!==''){           
            var attr = objElem.attr;
            if(!attr){
                return false;
            }
            var isIdExistInHtml = this.matchInHtml(attr.id, strId.substr(1));
            if(isIdExistInHtml){      
                block = this.removeIdFromEndOfBlock(block, strId);
                var strPrevPrecedingSelector = this.getPreceedingSelector(block);
            
                return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);
            }else{
                return this.recurseParentsToMatchPreceedingSelectors(block, strSelector, objElem.parent);
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