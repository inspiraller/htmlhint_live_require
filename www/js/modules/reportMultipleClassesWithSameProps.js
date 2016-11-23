var reportMultipleClassesWithSameProps  = function(arrHtmlJson, html){
    var inst = new ReportMultipleClassesWithSameProps();
    return inst.init(arrHtmlJson, html);
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

    recurseJson:function(arrHtmlJson, html, strAllStyles){//, objReport
        var objReport = (arguments.length > 3)?arguments[3]:{};
        
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
                    objReport = this.filterOutNonParents(strAllStyles, strClasses, objElem, objReport);
                }
            }
            if(objElem.children){
                objReport = this.recurseJson(objElem.children, html, strAllStyles, objReport);
            }
        }
        return objReport;
    },
    filterOutNonParents:function(strAllStyles, strClasses, objElem, objReport){   


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

        var objStylesFiltered = styleBlocksFilter(strClasses, objElem, objStyles);

        //objReport.add
        return objReport;

        //return objStylesFiltered;
    }
}
