import {Lyte} from "@slyte/core";
class CustomElements {
    static define(name,customElementClass,options){
      if(options && options.clone){
        var allCallbacks = options.clone.allCallbacks;
        var duringClone,afterClone,allAttributesCallback;
        if(typeof options.clone.attributeChangedCallback == "object"){
          duringClone = options.clone.attributeChangedCallback.duringClone;
          afterClone = options.clone.attributeChangedCallback.afterClone;
        }else{
          allAttributesCallback = options.clone.attributeChangedCallback;
        }
        var connectedCallback = options.clone.connectedCallback;
        var disconnectedCallback = options.clone.disconnectedCallback;
      }
      var actualConnectedCallback = customElementClass.prototype.connectedCallback;
      var actualAttributeChangedCallback = customElementClass.prototype.attributeChangedCallback;
      var actualDisconnectedCallback = customElementClass.prototype.disconnectedCallback;
      var reconnectedCallback = customElementClass.prototype.reconnectedCallback;
      var removedCallback = customElementClass.prototype.removedCallback;

      class LyteCustomElement extends customElementClass {
        constructor(){
          super();
          if(this.isClonedNode()){
            this.__cloned = true;
            let attrList = this.attributes;
            for(let i=0; i<attrList.length; i++){
              let attrNode = attrList[i];
              attrNode._lyte = {cloned : true,userCloned : true, name : attrNode.nodeName ,value : attrNode.nodeValue};
            }
          }
        }
        connectedCallback(){
          if(Lyte.ignoreDisconnect){
            if(reconnectedCallback){
              this.executeLyteCallbacks(reconnectedCallback,arguments);
            }
            return;
          }
          if(this.isClonedNode() && (allCallbacks == false || connectedCallback == false)){
              return;
          }
          this.executeLyteCallbacks(actualConnectedCallback,arguments);
          this.setAttribute("lyte-rendered-ce", "");
          this.LyteConnected = true;
        }
        attributeChangedCallback(){
          var cloneStatus;
          var clonedNode = this.isClonedNode();
          if(clonedNode){
            if(allCallbacks == false || allAttributesCallback == false){
              return;
            }else{
              let attrName = arguments[0];
              let oldVal = arguments[1];
              let newVal = arguments[2];
              let attrNode = this.attributes[attrName];
              cloneStatus = this.attributes[arguments[0]]._lyte.userCloned;
              let isClonedAttribute = this._isClonedAttribute(attrName,oldVal,newVal,attrNode);
              if(isClonedAttribute){
                this.attributes[arguments[0]]._lyte.userCloned = true;
                if(duringClone == false){
                  return;
                }
              }else{
                this.attributes[arguments[0]]._lyte.userCloned = false;
                if(afterClone == false){
                  return;
                }
              }
            }
          }
          this.executeLyteCallbacks(actualAttributeChangedCallback,arguments);
          if(clonedNode && this.attributes[arguments[0]] && this.attributes[arguments[0]]._lyte){
            this.attributes[arguments[0]]._lyte.userCloned = cloneStatus;
          }
        }
        disconnectedCallback(){
          if(Lyte.ignoreDisconnect){
            if(removedCallback){
              this.executeLyteCallbacks(removedCallback,arguments);
            }
            return;
          }
          if(this.isClonedNode() && (allCallbacks == false || disconnectedCallback == false)){
            return;
          }
          this.executeLyteCallbacks(actualDisconnectedCallback,arguments);
        }
      }
        
      customElementClass.prototype.executeLyteCallbacks = function(callBack,argArr){
        if(callBack) {
          callBack.apply(this, Array.from(argArr));
        }
      }
      customElementClass.prototype.isClonedNode = function(){
        if(this.hasAttribute("lyte-rendered-ce") && !this.LyteConnected || this.__cloned){
          return true;
        }
        return false;
      }
      customElementClass.prototype._isClonedAttribute = function(attrName,oldVal,newVal){
        let attrNode = this.attributes[attrName];
        if(attrNode._lyte && attrNode._lyte.cloned && attrNode._lyte.name == attrName && attrNode._lyte.value == newVal && oldVal === null){
          return true;
        }
        return false;
      }
      customElementClass.prototype.isClonedAttribute = function(attrName){
        let attrNode = this.attributes[attrName];
        if(attrNode._lyte && attrNode._lyte.userCloned){
          return true;
        }
        return false;
      }
      
      customElements.define(name,LyteCustomElement);

    }
}

export default CustomElements;














// import {Lyte} from "@slyte/core";
// class CustomElements {
//     static define(name,customElementClass,options){
//         var skipCallbacksOnClone = false;
//         if(options && options.clone && options.clone.skipCallbacks){
//           skipCallbacksOnClone = true;
//         }
//         var actualConnectedCallback = customElementClass.prototype.connectedCallback;
//         var actualAttributeChangedCallback = customElementClass.prototype.attributeChangedCallback;
//         var actualDisconnectedCallback = customElementClass.prototype.disconnectedCallback;
//         var lyteConnectedCallback = function(){
//           if(Lyte.ignoreDisconnect){
//             if(this.reconnectedCallback){
//               this.executeLyteCallbacks(this.reconnectedCallback,arguments);
//             }
//             return;
//           }
//           if(this.isCloned()){
//             this.__cloned = true;
//           }
//           if(skipCallbacksOnClone && this.isCloned()){
//             return;
//           }
//           this.executeLyteCallbacks(actualConnectedCallback,arguments);
//           this.setAttribute("lyte-rendered-ce", "");
//           this.LyteConnected = true;
//         }
//         var lyteAttributeChangedCallback = function(){

//           if(this.isCloned()){
//             this.__cloned = true;
//           }
//           if(skipCallbacksOnClone && this.isCloned()){
//             return;
//           }
//           this.executeLyteCallbacks(actualAttributeChangedCallback,arguments);
//         }
//         var lyteDisConnectedCallback = function(){
//           if(Lyte.ignoreDisconnect){
//             if(this.removedCallback){
//               this.executeLyteCallbacks(this.removedCallback,arguments);
//             }
//             return;
//           }
//           if(skipCallbacksOnClone && this.isCloned()){
//             return;
//           }
//           this.executeLyteCallbacks(actualDisconnectedCallback,arguments);
//         }

//         customElementClass.prototype.connectedCallback = lyteConnectedCallback;
//         customElementClass.prototype.disconnectedCallback = lyteDisConnectedCallback;
//         customElementClass.prototype.attributeChangedCallback = lyteAttributeChangedCallback;

//         customElementClass.prototype.executeLyteCallbacks = function(callBack,argArr){
//           if(callBack) {
//             callBack.apply(this, Array.from(argArr));
//           }
//         }
//         customElementClass.prototype.isCloned = function(){
//           if(this.hasAttribute("lyte-rendered-ce") && !this.LyteConnected || this.__cloned){
//             return true;
//           }
//           return false;
//         }
        
//         customElements.define(name,customElementClass);

//         customElementClass.prototype.connectedCallback = actualConnectedCallback;
//         customElementClass.prototype.attributeChangedCallback = actualAttributeChangedCallback;
//         customElementClass.prototype.disconnectedCallback = actualDisconnectedCallback;

//     }
// }

// export default CustomElements;