var createHtmlAsJson = function(html, strMarkerHandle){
  var inst = new CreateHtmlAsJson();
  return inst.init(html, strMarkerHandle);
};

var CreateHtmlAsJson = function(){};

CreateHtmlAsJson.prototype = {
  init:function(html, strMarkerHandle){
    var strPosEnd = this.getEndMarkerNumber(html, strMarkerHandle);
    return this.buildJson(html, strMarkerHandle, {}, 0, html, strPosEnd);
  },
  getEndMarkerNumber:function(html, strMarkerHandle){
    var strPosEnd = '';
    var regEnd = new RegExp('\\' + strMarkerHandle + '(\\d+) \\s*$');

    var arrMatchEnd = html.match(regEnd);

    if(arrMatchEnd && arrMatchEnd.length){
      strPosEnd = arrMatchEnd[1];
    }
    return strPosEnd;
  },
  buildJson:function(html, strMarkerHandle, objParent, index, strHtmlAll, strPosEnd){

    var arrChildren = [];
    var obj;

    var regPairs = new RegExp('(\\' + strMarkerHandle + '(\\d+) <(\\w[^\\s<>]*)([^<>]*)>)([\\w\\W]*)\\' + strMarkerHandle + '\\2 ','g');

    if(html.search(regPairs) === -1){
      var pos = this.getPos(strHtmlAll, index, strMarkerHandle);

      obj = {};
      obj = this.setProps(obj, 'text', index, pos, html);
      obj = this.setEnd(obj, strPosEnd, strMarkerHandle, html);
      arrChildren.push(obj);
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

          var attr = arrMatch[4] || false;                                                   
          obj = this.setAttr(obj, attr);

          var pos = this.getPos(strHtmlAll, intEachIndex, strMarkerHandle);
          var strRaw = arrMatch[1].replace(RegExp('\\' + strMarkerHandle + '\\d+ ','g'),'');

          obj = this.setProps(obj, 'tagstart', intEachIndex, pos, strRaw); 
          obj = this.setTagName(obj, arrMatch);
          obj = this.setChildren(obj, arrMatch, strMarkerHandle, intEachIndex, strHtmlAll, strPosEnd);
          obj = this.setParent(obj, objParent);
          arrChildren.push(obj);
          obj = this.setPresiblings(obj, arrChildren);

          obj = this.setEnd(obj, strPosEnd, strMarkerHandle, arrMatch[0]);

        }
      } while(arrMatch);
    }
    return arrChildren;   
  },
  setEnd:function(obj, strPosEnd, strMarkerHandle, strRaw){
    if(strRaw.indexOf(strMarkerHandle + strPosEnd + ' ') === 0){
      obj.lastTag = true;
    }
    return obj;
  },
  setTagName:function(obj, arrMatch){
    obj.tagName =  arrMatch[3]; 
    return obj;
  },
  setParent:function(obj, objParent){
    if(objParent.tagName){
      obj.parent = objParent;
    } 
    return obj;
  },  
  setPresiblings:function(obj, arrChildren){
    if(arrChildren.length > 1){
      obj.preSiblings = arrChildren.slice(0, arrChildren.length - 1); 
    } 
    return obj;
  },
  setChildren:function(obj, arrMatch, strMarkerHandle, intEachIndex, strHtmlAll){
    var tagName = arrMatch[3];   
    var isSelfClosing = tagName.lastIndexOf('/')!==-1 || false;
    var content = (!isSelfClosing)? arrMatch[5] :null;
    if(content){
      content = content.substring(0, content.lastIndexOf('</'));
      obj.children = this.buildJson(content, strMarkerHandle, obj, intEachIndex + arrMatch[1].length, strHtmlAll);            
    }  
    return obj;
  },
  setAttr:function(obj, attr){
    if(attr){
      var arrAttr;
      obj.attr = {};
      
      var regAttr1 = /\s([^\=<>\s\'\"]+)\=\"([^\"]*)\"/g;


      do{
        arrAttr = regAttr1.exec(attr);
        if(arrAttr){
          var key = arrAttr[1];
          var val = arrAttr[2];
          val = this.trim(val);   
          key = this.trim(key);            
          obj.attr[key] = val; 
        }         
      }while(arrAttr);
    }

    return obj;
  },
  setProps:function(obj, strType, index, pos, strRaw){
    obj.type = strType;
    obj.line = pos.line;
    obj.col = pos.col;
    obj.pos = index;
    obj.raw = strRaw;

    return obj;
  },
  trim: function(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  },
  getPos: function(strHtmlAll, index, strMarkerHandle){
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
  }

};
