function IdeOverride(_LC){
    _LC.core._constructor.prototype.executeBlockHelpers = function(updateHelpers, node) {
        var originalUpdateHelpers = Array.from(updateHelpers);
        _LC.core.executeBlockHelpers.call(this,updateHelpers);
        if(node){
            for(var i=0;i<originalUpdateHelpers.length;i++) {
                var lastNode = originalUpdateHelpers[i].lastNode;
                if(lastNode._placeHolder) {
                    lastNode = lastNode._placeHolder;
                }
                lastNode.__lyteHelper = node;
            }
        }   
    }
    _LC.core._constructor.prototype.updateForHelper = function(node, options, contextSwitchInfo, establishBindings, staticTempArr,yieldComp) {
        if(options){
            if(options.type !== "remove" && node._forContent && node._forContent.length === 1 && node._forContent[0].length === 1 && node._forContent[0][0].__lyteHelper === node &&
            node._forContent[0][0].nodeType === 3) {
                node._forContent[0][0].remove();
                node._forContent=[];
            }
        }
        var ret =  _LC.core.updateForHelper.call(this, node, options, contextSwitchInfo, establishBindings, staticTempArr,yieldComp)
        if(node.tagName !== "TEMPLATE") {
            node  = node._origTemplate;
        }
        node._placeHolder.__lytehelper = node._placeHolder._helper;
        node._placeHolder._actTemplate = node;
        if(options && options.type !== "remove") {
            if(!node._fRender){
                node._forContent.forEach(function(arr){
                    arr.forEach(function(ele){
                        ele.__lyteHelper = node;	
                    })  
                })
            } 
        }
        var lastNode = node;
        var items =  node._attributes.items; //node._items;
        if(!items || items.length === 0){
            var emptyTextNode = document.createTextNode("");
            node._forContent[0]=[emptyTextNode];
            emptyTextNode.__lyteHelper = node; 
            // _LC.unbound = initialUnbound;
            if(options.type !== "default") { 
                lastNode._placeHolder.parentNode.insertBefore(emptyTextNode, lastNode._placeHolder)
            }
        }
        return ret;
    }
    _LC.core._constructor.prototype.updateForInHelper = function(node, options, contextSwitchInfo, establishBindings,yieldComp) {
        if(options){
            if(options.type !== "remove" && node._forContent && node._forContent.helperLink && node._forContent.helperLink[0].__lyteHelper === node &&
                node._forContent.helperLink[0].nodeType === 3) {
                node._forContent.helperLink[0].remove();
                delete node._forContent.helperLink;
            }
        }
        var ret = _LC.core.updateForInHelper.call(this,node, options, contextSwitchInfo, establishBindings,yieldComp);
        if(node.tagName !== "TEMPLATE") {
            node  = node._origTemplate;
        }
        node._placeHolder.__lytehelper = node._placeHolder._helper;
        node._placeHolder._actTemplate = node;
        if(node._currentObject && options && options.type !== "remove") {
            node._keysArray.forEach(function(itemKey){
                node._forContent[itemKey].forEach(function(item) {		
                    item.__lyteHelper = node;		        
                });
            })
        }
        var lastNode = node;
            if((!node._keysArray || node._keysArray.length === 0)){
                var emptyTextNode = document.createTextNode("");
                node._forContent.helperLink = [emptyTextNode];
                emptyTextNode.__lyteHelper = node;
                if(options.type !== "default") {   
                    lastNode._placeHolder.parentNode.insertBefore(emptyTextNode, lastNode._placeHolder)
                }  	
            }
        return ret; 
    }
    _LC.core._constructor.prototype.updateSwitchHelper = function(type,node, contextSwitchInfo, update, establishBindings,yieldComp,templateCaseNode,helperNode){
        var ret = _LC.core.updateSwitchHelper.call(this,type,node, contextSwitchInfo, update, establishBindings,yieldComp,templateCaseNode,helperNode);
        if(node.tagName !== "TEMPLATE") {
            node  = node._origTemplate;
        }
        node._placeHolder.__lytehelper = node._placeHolder._helper;
        node._placeHolder._actTemplate = node;
        node._caseContent.forEach(function(item) {		
            item.__lyteHelper = node;		
        })
        return ret;
    }
}
export default IdeOverride;