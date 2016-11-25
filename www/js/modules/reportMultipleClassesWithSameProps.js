var reportMultipleClassesWithSameProps  = function(arrHtmlJson, html){
    var inst = new ReportMultipleClassesWithSameProps();
    return inst.init(arrHtmlJson, html);
}
var ReportMultipleClassesWithSameProps = function(){}
ReportMultipleClassesWithSameProps.prototype = {
    init:function(html, strAllStyles){

        var arrHtmlJson = this.getHtmlAsJson(html);
        var arrReport = this.recurseJson(arrHtmlJson, html, strAllStyles);

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
    //console.log('######################################################################################################');
    //console.log('wrapped = ',strWrapped);

            var arrHtmlJson = createHtmlAsJson(strWrapped, markers.strMarkerHandle);
            return arrHtmlJson;
        }

    //console.log('######################################################################################################');
    //console.log('arrHtmlJson =');
    //console.dir(arrHtmlJson);


        return [];
    },

    recurseJson:function(arrHtmlJson, html, strAllStyles){//, arrReport
        var arrReport = (arguments.length > 3)?arguments[3]:[];
        
        for(var i = 0, intLen = arrHtmlJson.length; i < intLen; ++i){
            var objElem = arrHtmlJson[i];
            var attr = objElem.attr;
            var strClasses = (attr)?attr.class:'';

            //console.log('line = ', objElem.line);  
            //var arrLines = html.split('\n');
            //console.log('line extract = ', arrLines[objElem.line]);

            if(strClasses){
                var isMultipleClasses = strClasses.split(' ').length > 1;
                if(isMultipleClasses){
                    arrReport = this.filterOutNonParents(strAllStyles, strClasses, objElem, arrReport);
                }
            }
            if(objElem.children){
                arrReport = this.recurseJson(objElem.children, html, strAllStyles, arrReport);
            }
        }
        return arrReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, objElem, arrReport){   


// TO REMOVE - 
// THIS IS JUST FOR TESTING
//if(strClasses !== 'theClass1 theClass2'){
    //return arrReport;
//}     

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

        var objStylesFiltered = styleBlocksFilter(strClasses, objElem, objStyles);


        var objMatching = this.compareProps(objStylesFiltered);
        var isMatching = (Object.keys(objMatching.properties).length > 0 )? true : false;        
        if(isMatching){
            arrReport.push({
                elem:objElem,
                matching:objMatching
            })
        }

        //arrReport.add
        return arrReport;

        //return objStylesFiltered;
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
        var regFuzzy = /^(margin|padding)\-[\w\W]*$/;
        return prop.replace(regFuzzy,'$1');
    }
}
