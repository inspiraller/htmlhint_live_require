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
        var objReport = this.recurseJson(arrHtmlJson, strAllStyles, strRegExcludeClasses, isExcludeBemModifier);
//console.log('objReport = ', objReport);
        return objReport;
    },  
    trim: function(str){
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    getHtmlAsJson : function(strWrapped, markers){
        // remove everything outside body
        //html = html.replace(/^[\w\W]*(<body(\s[^<>]*>|>)[\w\W]*<\/body\s*>)[\w\W]*$/gi,'$1');
        
        var arrHtmlJson = createHtmlAsJson(strWrapped, markers.strMarkerHandle);       
        return arrHtmlJson;
        
    },

    recurseJson:function(arrHtmlJson, strAllStyles, strRegExcludeClasses, isExcludeBemModifier){//, objReport
        var objReport = (arguments.length > 4)?arguments[4]:[];
        
        for(var i = 0, intLen = arrHtmlJson.length; i < intLen; ++i){
            var objElem = arrHtmlJson[i];
            var attr = objElem.attr;
            var strClasses = (attr)?attr.class:'';

            //console.log('##############################################################################')
            //console.log('recurseJson - elem = ', objElem.elem);  


            if(strClasses){
                var isMultipleClasses = strClasses.split(' ').length > 1;
                if(isMultipleClasses){
                    objReport = this.filterOutNonParents(strAllStyles, strClasses, objElem, strRegExcludeClasses, isExcludeBemModifier, objReport);
                }
            }
            if(objElem.children){
                objReport = this.recurseJson(objElem.children, strAllStyles, strRegExcludeClasses, isExcludeBemModifier, objReport);
            }
        }
        return objReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, objElem, strRegExcludeClasses, isExcludeBemModifier, objReport){   

        var strClassesCombined = strClasses.replace(/(^|\s+)/g,'.');

        if(strRegExcludeClasses){
            var regExclude = RegExp(strRegExcludeClasses,'g');
            strClassesCombined = strClassesCombined.replace(regExclude, '');
            strClasses = strClassesCombined.replace(/\./g,' ');
            strClasses = this.trim(strClasses);
        }
        
        var objStyles = styleBlocks(strAllStyles, strClassesCombined);
        var isStyles = (Object.keys(objStyles).length > 0)?true:false;        
        var objStylesFiltered = (isStyles)?styleBlocksFilter(strClasses, objElem, objStyles, isExcludeBemModifier):{};


        var strSelectorsMissing = this.getMissingSelectors(strClasses, objStyles);
        if(strSelectorsMissing){
            if(!objReport.arrSelectorsMissingFromCss){
                objReport.arrSelectorsMissingFromCss = [];
            }
            objReport.arrSelectorsMissingFromCss.push({
                objElem:objElem,
                strSelectors:strSelectorsMissing
            });
        }


//console.log('________________________________________');
//console.log('objStyles = ', objStyles);    
//console.log('objStylesFiltered = ', objStylesFiltered);

        var objMatching = this.compareProps(objStylesFiltered);
        var isMatching = (Object.keys(objMatching.properties).length > 0 )? true : false;        
        if(isMatching){

            if(!objReport.arrMultipleClassesSameProperties){
                objReport.arrMultipleClassesSameProperties = [];
            }
            objReport.arrMultipleClassesSameProperties.push({
                elem:objElem,
                matching:objMatching
            });
        }
        return objReport;

    },
    getMissingSelectors:function(strClasses, objStyles){
        var arrClasses = strClasses.split(' ');      
        var strSelectorsMissing = '';
        for(var i = 0, intLen = arrClasses.length; i < intLen; ++i){
            var strClass = arrClasses[i];
            if(typeof objStyles['.' + strClass] === 'undefined'){
                if(strSelectorsMissing!==''){
                    strSelectorsMissing+=',';
                }
                strSelectorsMissing+='.' + strClass;
            }
        }
        return strSelectorsMissing;

    },
    compareProps:function(objStylesFiltered){

        var isMultipleClasses = (Object.keys(objStylesFiltered).length > 1)? true: false;


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
