var createHtmlAsJson = function(html, strMarkerHandle){

    var objParent = (arguments.length > 2)?arguments[2]:{};
    var intLineNum = (arguments.length > 3)?arguments[3]:0;
    
    var arrChildren = [];
  

    // TODO:, reduce these down to one, by doing a find and replace on all attributes to ensure they are all one type, ie attr="dbl quoted value"
    var regAttr1 = /\s([^\=<>\s\'\"]+)\=\"([^\"]*)\"/g;

  
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
      while(arrMatch = regPairs.exec(html)){          
             
        
        obj = {};
        
        
        //var intElemLineNum = intLineNum + arrMatch.index;
        var intElemLineNum = intLineNum + (html.substring(0, arrMatch.index).split('\n').length - 1);
        
        var elem = arrMatch[3];                 
        var isSelfClosing = elem.lastIndexOf('/')!==-1 || false;
        var content = (!isSelfClosing)? arrMatch[5] :null;
        var attr = arrMatch[4] || false;

        obj.elem = elem;
        obj.line = intElemLineNum + 1;
        
        //obj.isSelfClosing = isSelfClosing;                                     
        
        if(attr){
          var arrAttr;
          obj.attr = {};
          
          // TODO: only have one while, for one type of attribute supplied.
          while(arrAttr = regAttr1.exec(attr)){
            var key = arrAttr[1];
            var val = arrAttr[2];
            obj.attr[key] = val;          
          }
        }

        if(content){
          content = content.substring(0, content.lastIndexOf('</'));
          obj.children = createHtmlAsJson(content, strMarkerHandle, obj, intElemLineNum);
          
        }  
        if(objParent.elem){
          obj.parent = objParent;
        }           
        arrChildren.push(obj);
        if(arrChildren.length > 1){
          obj.preSiblings = arrChildren.slice(0, arrChildren.length - 1); 
        }   
    }  
  }
  return arrChildren;   

             /* This method should create example:
var json = [{
  classes:'bodyclass',
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

}