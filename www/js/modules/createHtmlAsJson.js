var createHtmlAsJson = function(html, strMarkerHandle){

  var objParent = (arguments.length > 2)?arguments[2]:{};
  var index = (arguments.length > 3)?arguments[3]:0;
  var strHtmlAll = (arguments.length > 4)?arguments[4]:html;

  var arrChildren = [];


  // TODO:, reduce these down to one, by doing a find and replace on all attributes to ensure they are all one type, ie attr="dbl quoted value"
  var regAttr1 = /\s([^\=<>\s\'\"]+)\=\"([^\"]*)\"/g;

  var trim = function(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };


  var getPos = function(strHtmlAll, index, strMarkerHandle){
    var strUp = strHtmlAll.substring(0, index);

    var intLine = strUp.split(/\n/).length;


    //var intLastIndexOfLine = strUp.search(/(^|\n)[^\n]*$/);
    var intLastIndexOfLine = strUp.lastIndexOf('\n') + 1;

    var strCol = strUp.substr(intLastIndexOfLine);

    strCol = strCol.replace(RegExp('\\' + strMarkerHandle + '\\d+ ','g'),'');  
    var intCol = strCol.length + 1;

    return {
      line:intLine,
      col:intCol
    };
  };


  // Get children of each top element.
  // TODO: supply this regex to the function, to save redeclaring it.
  var regPairs = new RegExp('(\\' + strMarkerHandle + '(\\d+) <(\\w[^\\s<>]*)([^<>]*)>)([\\w\\W]*)\\' + strMarkerHandle + '\\2 ','g');        

  if(html.search(regPairs) === -1){
    arrChildren.push({
      elem:'textNode',
      content:html
    });
  }else{
    
    // on each child of top element, capture the elem, content, attributes.
    // if the child has children then recurse again.
    
    var arrMatch = null;
    var obj;
    do{

      arrMatch = regPairs.exec(html);

      if(arrMatch){
             
        
        obj = {};
        
        var intEachIndex = index + arrMatch.index;
        
        var elem = arrMatch[3];   

        var isSelfClosing = elem.lastIndexOf('/')!==-1 || false;

        var content = (!isSelfClosing)? arrMatch[5] :null;
        var attr = arrMatch[4] || false;
     

        obj.elem = elem;

        var pos = getPos(strHtmlAll, intEachIndex, strMarkerHandle);
        obj.line = pos.line;
        obj.col = pos.col;
        
        //obj.isSelfClosing = isSelfClosing;                                     
        
        if(attr){
          var arrAttr;
          obj.attr = {};
          
          // TODO: only have one while, for one type of attribute supplied.

          do{
            arrAttr = regAttr1.exec(attr);
            if(arrAttr){
              var key = arrAttr[1];
              var val = arrAttr[2];
              val = trim(val);   
              key = trim(key);            
              obj.attr[key] = val; 
            }         
          }while(arrAttr);
        }

        if(content){
          content = content.substring(0, content.lastIndexOf('</'));
          obj.children = createHtmlAsJson(content, strMarkerHandle, obj, intEachIndex + arrMatch[1].length, strHtmlAll);
          
        }  
        if(objParent.elem){
          obj.parent = objParent;
        }           
        arrChildren.push(obj);
        if(arrChildren.length > 1){
          obj.preSiblings = arrChildren.slice(0, arrChildren.length - 1); 
        }   
      }
    } while(arrMatch);
  }
  return arrChildren;   

             /* This method should create example:
var json = [{
  elem:"body",
  line:2,
  attr:{
    class:"elem1 elem2 elem3"
  },
  children:[
    {
      h1:{

      }
    },
    {
      p1:{
        classes:'p1class',
        children:[
          {
            span:{

            }
          },
          {
            span:{

            }
          }
        ]
      }
    },
    {
      p2:{
        classes:'p2class',
        children:[
          {
            span:{

            }
          },
          {
            span:{

            }
          }
        ]
      }
    }          
  ]          
}] 
    */

};