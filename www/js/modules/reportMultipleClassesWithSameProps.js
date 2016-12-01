// dependencies
var wrapTagPointers = (typeof wrapTagPointers!=='undefined')?wrapTagPointers:function wrapTagPointers(){};
var createHtmlAsJson = (typeof createHtmlAsJson!=='undefined')?createHtmlAsJson:function createHtmlAsJson(){};
var styleBlocks = (typeof styleBlocks!=='undefined')?styleBlocks:function styleBlocks(){};
var styleBlocksFilter = (typeof styleBlocksFilter!=='undefined')?styleBlocksFilter:function styleBlocksFilter(){};

var reportMultipleClassesWithSameProps  = function(strWrapped, markers, strAllStyles, strRegExcludeClasses, isExcludeBemModifier){
    var inst = new ReportMultipleClassesWithSameProps();
    return inst.init(strWrapped, markers, strAllStyles, strRegExcludeClasses, isExcludeBemModifier);
};
var ReportMultipleClassesWithSameProps = function(){};

ReportMultipleClassesWithSameProps.prototype = {
    init:function(strWrapped, markers, strAllStyles, strRegExcludeClasses, isExcludeBemModifier){


        var arrHtmlJson = this.getHtmlAsJson(strWrapped, markers);
        var arrReport = this.recurseJson(arrHtmlJson, strAllStyles, strRegExcludeClasses, isExcludeBemModifier);
//console.log('arrReport = ', arrReport);
        return arrReport;
    },  

    getHtmlAsJson : function(strWrapped, markers){
        // remove everything outside body
        //html = html.replace(/^[\w\W]*(<body(\s[^<>]*>|>)[\w\W]*<\/body\s*>)[\w\W]*$/gi,'$1');
        
        var arrHtmlJson = createHtmlAsJson(strWrapped, markers.strMarkerHandle);
        return arrHtmlJson;
        
    },

    recurseJson:function(arrHtmlJson, strAllStyles, strRegExcludeClasses, isExcludeBemModifier){//, arrReport
        var arrReport = (arguments.length > 4)?arguments[4]:[];
        
        for(var i = 0, intLen = arrHtmlJson.length; i < intLen; ++i){
            var objElem = arrHtmlJson[i];
            var attr = objElem.attr;
            var strClasses = (attr)?attr.class:'';

            //console.log('##############################################################################')
            //console.log('recurseJson - elem = ', objElem.elem);  


            if(strClasses){
                var isMultipleClasses = strClasses.split(' ').length > 1;
                if(isMultipleClasses){
                    arrReport = this.filterOutNonParents(strAllStyles, strClasses, objElem, strRegExcludeClasses, isExcludeBemModifier, arrReport);
                }
            }
            if(objElem.children){
                arrReport = this.recurseJson(objElem.children, strAllStyles, strRegExcludeClasses, isExcludeBemModifier, arrReport);
            }
        }
        return arrReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, objElem, strRegExcludeClasses, isExcludeBemModifier, arrReport){   

        var strClassesCombined = strClasses.replace(/(^|\s+)/g,'.');

        if(strRegExcludeClasses){
            var regExclude = RegExp(strRegExcludeClasses,'g');
            strClassesCombined = strClassesCombined.replace(regExclude, '');
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
            });
        }

        return arrReport;

    },
    compareProps:function(objStylesFiltered){
        var isMultipleClasses = Object.keys(objStylesFiltered).length > 1;

        var objMatchingSelectors = {};
        var objMatchingProperties = {};



        if(isMultipleClasses){
            var arrAllProps = [];

            var strTheClass, i, p, intLen;


            var filterProps = function(arrAllProps, prop){
                arrAllPropsFiltered = arrAllProps.filter(function(item){
                    return item[prop];
                });
                return arrAllPropsFiltered;
            };


            for(strTheClass in objStylesFiltered){
                var arrClass = objStylesFiltered[strTheClass];                
                var strThisClassAllProps = '';

                for(i = 0, intLen = arrClass.length; i < intLen; ++i){
                    var objClass = arrClass[i];
                    var objClassProps = objClass.props;                                
                    
                    for(p in objClassProps){
                        var prop = p;

                        prop = this.matchFuzzyPropNames(prop);

                        var arrAllPropsFiltered = filterProps(arrAllProps, prop);

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
        };

    },
    matchFuzzyPropNames:function(prop){
        return prop;
        //var regFuzzy = /^(margin|padding)\-[\w\W]*$/;
        //return prop.replace(regFuzzy,'$1');
    }
};
