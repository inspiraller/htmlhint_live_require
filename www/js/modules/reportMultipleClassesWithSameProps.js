var reportMultipleClassesWithSameProps  = function(arrHtmlJson, html, regExclude, isExcludeBemModifier){
    var inst = new ReportMultipleClassesWithSameProps();
    return inst.init(arrHtmlJson, html, regExclude, isExcludeBemModifier);
}
var ReportMultipleClassesWithSameProps = function(){}
ReportMultipleClassesWithSameProps.prototype = {
    init:function(html, strAllStyles, regExclude, isExcludeBemModifier){

        var arrHtmlJson = this.getHtmlAsJson(html);
        var arrReport = this.recurseJson(arrHtmlJson, html, strAllStyles, regExclude, isExcludeBemModifier);
//console.log('arrReport = ', arrReport);
        return arrReport;
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
        

        if(strWrapped){
            var arrHtmlJson = createHtmlAsJson(strWrapped, markers.strMarkerHandle);
            return arrHtmlJson;
        }

        return [];
    },

    recurseJson:function(arrHtmlJson, html, strAllStyles, regExclude, isExcludeBemModifier){//, arrReport
        var arrReport = (arguments.length > 5)?arguments[5]:[];
        
        for(var i = 0, intLen = arrHtmlJson.length; i < intLen; ++i){
            var objElem = arrHtmlJson[i];
            var attr = objElem.attr;
            var strClasses = (attr)?attr.class:'';

            //console.log('##############################################################################')
            //console.log('recurseJson - elem = ', objElem.elem);  


            if(strClasses){
                var isMultipleClasses = strClasses.split(' ').length > 1;
                if(isMultipleClasses){
                    arrReport = this.filterOutNonParents(strAllStyles, strClasses, objElem, regExclude, isExcludeBemModifier, arrReport);
                }
            }
            if(objElem.children){
                arrReport = this.recurseJson(objElem.children, html, strAllStyles, regExclude, isExcludeBemModifier, arrReport);
            }
        }
        return arrReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, objElem, regExclude, isExcludeBemModifier, arrReport){   

        var strClassesCombined = strClasses.replace(/(^|\s+)/g,'.');

        if(regExclude){
            var regExcludeClasses = RegExp(regExclude,'g');
            strClassesCombined = strClassesCombined.replace(regExcludeClasses, '');
            strClasses = strClassesCombined.replace(/\./g,' ');
        }
        
        var objStyles = styleBlocks(strAllStyles, strClassesCombined);
        var isStyles = (Object.keys(objStyles).length > 0)?true:false;
        var objStylesFiltered = (isStyles)?styleBlocksFilter(strClasses, objElem, objStyles, isExcludeBemModifier):{};

//console.log('________________________________________');
//console.log('objStyles = ', objStyles);    
//console.log('objStylesFiltered = ', objStylesFiltered);

        var objMatching = this.compareProps(objStylesFiltered);
        var isMatching = (Object.keys(objMatching.properties).length > 0 )? true : false;        
        if(isMatching){
            arrReport.push({
                elem:objElem,
                matching:objMatching
            })
        }

        return arrReport;

    },
    compareProps:function(objStylesFiltered){
        var isMultipleClasses = Object.keys(objStylesFiltered).length > 1;

        var objMatchingSelectors = {};
        var objMatchingProperties = {};

        if(isMultipleClasses){
            var arrAllProps = [];

            var strTheClass, i, p;

            for(strTheClass in objStylesFiltered){
                var arrClass = objStylesFiltered[strTheClass];                
                var strThisClassAllProps = '';

                for(i = 0, intLen = arrClass.length; i < intLen; ++i){
                    var objClass = arrClass[i];
                    var objClassProps = objClass.props;                                
                    
                    for(p in objClassProps){
                        var prop = p;
                        var val = objClassProps[p];

                        prop = this.matchFuzzyPropNames(prop);

                        var arrAllPropsFiltered = arrAllProps.filter(function(item){
                            return item[prop];
                        });
                        var objPropInOtherSelector =  arrAllPropsFiltered[0] || null;

                        if(objPropInOtherSelector && strThisClassAllProps.indexOf(',' + prop + ',') === -1){
                                                                                                                
                            if(!objMatchingProperties[prop]){

                                var objOtherMatch = objPropInOtherSelector[prop];
                                var strOtherSelector = objOtherMatch.selector;

                                objMatchingSelectors[strOtherSelector] = objOtherMatch;

                                objMatchingProperties[prop] = [];                                  
                                objMatchingProperties[prop].push(objOtherMatch);
                            }

                            objMatchingSelectors[strTheClass] = objClass;
                            objMatchingProperties[prop].push(objClass); 

                           
                        }else{
                            strThisClassAllProps+=',' + prop + ',';    
                        }

                        var objPropToClass = {};
                        objPropToClass[prop] = objClass;
                        arrAllProps.push(objPropToClass);
                        
                    }
                }
            }
        }             
        return {
            properties:objMatchingProperties,
            selectors:objMatchingSelectors
        }

    },
    matchFuzzyPropNames:function(prop){
        return prop;
        //var regFuzzy = /^(margin|padding)\-[\w\W]*$/;
        //return prop.replace(regFuzzy,'$1');
    }
}
