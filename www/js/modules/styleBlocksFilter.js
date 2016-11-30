
var styleBlocksFilter = function(strClasses, objElem, objStyles, isExcludeBemModifier){
    var inst = new StyleBlocksFilter();
    return inst.init(strClasses, objElem, objStyles, isExcludeBemModifier);
}
var StyleBlocksFilter = function(){}
StyleBlocksFilter.prototype = {
    init:function(strClasses, objElem, objStyles, isExcludeBemModifier){
        var objStylesFiltered = {};
        objStylesFiltered = this.filterOnClasses(strClasses, objElem, objStyles, objStylesFiltered, isExcludeBemModifier);
        return objStylesFiltered;
    },
    filterOnClasses:function(strClasses, objElem, objStyles, objStylesFiltered, isExcludeBemModifier){
        var arrClasses = strClasses.split(' ');        
        for(var i=0, intLen = arrClasses.length; i < intLen; ++i){
            var strClass = arrClasses[i];

            if(strClass){

//console.log('styleBlocksFilter - strClass = ', strClass);


                objStylesFiltered['.' + strClass] = [];
                objStylesFiltered = this.filterOutParents(strClass, objStyles, objElem, objStylesFiltered, isExcludeBemModifier);                
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
    filterOutParents:function(strClass, objStyles, objElem, objStylesFiltered, isExcludeBemModifier){
        var arrStyles = objStyles['.' + strClass];


        if(arrStyles){
            for(var i = 0, intLen = arrStyles.length; i < intLen; ++i){
                var objEachStyle = arrStyles[i];

                var isBemModifier = this.getBemModifier(strClass, objStyles, objEachStyle, isExcludeBemModifier);

                if(isBemModifier){
                    delete objStylesFiltered['.' + strClass];
                    return objStylesFiltered;
                }
                // We don't need two lots of objStylesFiltered['.' + strClass] to match properties against in reportMultilpleClassesWithSameProps                
                var isExistingAdjoinedToThis = this.getExistingAdjoinedWith(objStylesFiltered, objEachStyle);
                if(isExistingAdjoinedToThis){
                    delete objStylesFiltered['.' + strClass];
                    return objStylesFiltered;
                }

                var block = objEachStyle.block;


                //block = this.removeClassFromEndOfBlock(block, strClass);
                block = this.removeProps(block);
                block = this.removeLastAjoiningSelectorsFromBlock(block);

                var strPrecedingSelector = this.getPreceedingSelector(block);        
                var isParent = this.recurseParentsToMatchPreceedingSelectors(block, strPrecedingSelector, objElem.parent);
          
                if(isParent){
                    objStylesFiltered['.' + strClass].push(objEachStyle);
                }       

            }
        }

        return objStylesFiltered;
    }, 
    getBemModifier:function(strClass, objStyles, objEachStyle, isExcludeBemModifier){

        if(isExcludeBemModifier){
            var regBem  = /^[\.\#\w][^\-\.\#\{\(\[\;\:]*\-\-[^\-]+$/;
            if(strClass.search(regBem)!==-1){             
                return true;
            }            
        }
        return false;
    },
    getExistingAdjoinedWith:function(objStylesFiltered, objEachStyle){
        var arrAdjoinedWith = objEachStyle.arrAdjoinedWith;
            
        if(arrAdjoinedWith){
            for(var i=0, intLen = arrAdjoinedWith.length; i < intLen; ++i){
                var strEachSelector = arrAdjoinedWith[i];
                if(typeof objStylesFiltered[strEachSelector]!=='undefined'){
                    return true;
                }
            }
        }
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
    recurseParentsToMatchPreceedingSelectors:function(block, strSelector, objElem){

//console.log('___________________________________________________________');
////console.log('block = ', block)
//console.log('strSelector="' +  strSelector + '"');
//console.log('objElem.parent= ', objElem);


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

        if(isSelectors){
            var isParentMatchAdjoined = this.matchAdjoinedOnParent(objElem, objAdjoined);     


            if(isParentMatchAdjoined){                
                var block = this.removeLastAjoiningSelectorsFromBlock(block);

                var strPrevPrecedingSelector = this.getPreceedingSelector(block);
                return this.recurseParentsToMatchPreceedingSelectors(block, strPrevPrecedingSelector, objElem.parent);       
            }else{
                return this.recurseParentsToMatchPreceedingSelectors(block, strSelector, objElem.parent);
            }
        }else{
            return false;
        }

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

        if(strElem && strElem!=='' && objElem.elem !== strElem){         
            return false;
        }
        var attr = objElem.attr || {};

        // test if id
        var strId = objAdjoined.strId;

        if(strId && strId!=='' && attr.id !== strId.substr(1)){       
            return false;
        }

        var arrClasses = objAdjoined.arrClasses;
        if(arrClasses && arrClasses.length){
            if(!attr.class){
                return false;
            }
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
    removeProps:function(block){
       return block.replace(/\{[^\{\}]*\}\s*$/,'');
    },
    removeLastAjoiningSelectorsFromBlock:function(block){

        var intIndexSpaceInBrackets = block.search(/([\(\[]|$)/);

        block = block.substring(0, intIndexSpaceInBrackets);
        
        var reg = /[^\s\[\]\(\)\:]+(\:+[^\s\:]+|\[[^\[\]]*\]|\([^\(\)]*\))*(\s*(\+|~|>))?\s*$/i;

        block = block.replace(reg,'');
        block = block.replace(/\s*$/,'');

        return block;
    }
};