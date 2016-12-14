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
          var tagName = arrMatch[3];  
          var isSelfClosing = this.isSelfClosing(arrMatch);           
          var content = this.getContent(isSelfClosing, arrMatch[5]);
          var strRaw = arrMatch[1].replace(RegExp('\\' + strMarkerHandle + '\\d+ ','g'),'');


          obj = this.setProps(obj, 'tagstart', intEachIndex, pos, strRaw); 
          obj = this.setTagName(obj, tagName);
          obj = this.setSelfClosing(obj, isSelfClosing);

          
          obj = this.setChildren(obj, arrMatch, strMarkerHandle, intEachIndex, strHtmlAll, tagName, content);
          obj = this.setParent(obj, objParent);

          arrChildren.push(obj);
          obj = this.setPresiblings(obj, arrChildren);
          obj = this.setEnd(obj, strPosEnd, strMarkerHandle, arrMatch[0]);

        }
      } while(arrMatch);
    }
    return arrChildren;   
  },
  isSelfClosing:function(arrMatch){
    var strTagEnd1 = arrMatch[3];
    var strTagEnd2 = arrMatch[4];


    if(strTagEnd1!=='' && strTagEnd1.lastIndexOf('/') === (strTagEnd1.length - 1)){
      return true;
    }else if(strTagEnd2!=='' && strTagEnd2.lastIndexOf('/') === (strTagEnd2.length - 1)){
      return true;
    }
    return false;  
  },
  setSelfClosing:function(obj, is){
    obj.close = (is)?'/':'';
    return obj;
  },    
  setEnd:function(obj, strPosEnd, strMarkerHandle, strRaw){
    if(strRaw.indexOf(strMarkerHandle + strPosEnd + ' ') === 0){
      obj.lastTag = true;
    }
    return obj;
  },
  setTagName:function(obj, tagName){
    obj.tagName =  tagName; 
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
  getContent:function(isSelfClosing, strMatchContents){
    var content = (!isSelfClosing)? strMatchContents :null;
    content = (content)?content.substring(0, content.lastIndexOf('</')):null;    
    return content;
  },
  setChildren:function(obj, arrMatch, strMarkerHandle, intEachIndex, strHtmlAll, tagName, content){
    if(content){
      obj.children = this.buildJson(content, strMarkerHandle, obj, intEachIndex + arrMatch[1].length, strHtmlAll);            
    }  
    return obj;
  },
  setAttr:function(obj, attr){
    obj.attrs = [];   
    if(attr){
      var arrAttr;
         
      var regAttr1 = /\s([^\=<>\s\'\"]+)\=\"([^\"]*)(\")/g;
      do{
        arrAttr = regAttr1.exec(attr);
        if(arrAttr){
          var key = this.trim(arrAttr[1]);
          var val = this.trim(arrAttr[2]);

          obj.attrs.push({
            index: regAttr1.index,
            name: key,
            value: val,
            quote: arrAttr[3],
            raw: arrAttr[0]
          });
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
