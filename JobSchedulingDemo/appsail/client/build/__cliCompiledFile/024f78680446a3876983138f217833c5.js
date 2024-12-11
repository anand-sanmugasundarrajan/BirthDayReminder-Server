//ignorei18n_start
import {_LC} from "../lyte-component.js";
import { Service } from "@slyte/core/src/service";
import { Lyte } from "@slyte/core";
/*convert to custom class*/
class Directive extends Service {
    static register(compName, options){
        var _registryClass = _LC.getRegistryClass(options);
        if(!_registryClass){
            Lyte.error("registry class for the directive '"+compName+"' not registered with Lyte")
            return;
        }
        this._refHash = options.refHash;
        compName = compName || _LC.String.dasherize(this.name);
        this._registryClass = _registryClass;
        _registryClass.registerDirective(compName, this);
    }
    static actualRegistration(name,directiveClass,registryInstance){
        if(registryInstance.registeredDirectives.indexOf(name) != -1){
            Lyte.warn("Directive name "+ name + " already registered");
            return;
        }
        registryInstance.registeredDirectives.$push(name);
        registryInstance._registeredDirectivesClass[name] = directiveClass;
    }
}
Directive.__lMod = "Directive";
_LC.directive.bundled = true;
_LC.directive.appendHooks = function(state,comp,domAppendedFirstTime,initial,dependentPromises) {
    var self = this;
    if(comp._transitionAppend && comp._transitionAppend.length){
        comp._transitionAppend.forEach(function(node){
            node._specialAttributeDetails.forEach(function(attr){
                if(comp.$component._defaultDirectives.indexOf(attr.hookName) != -1){
                    if(node._defaultDirectives){
                        node._defaultDirectives.push(attr.hookName)
                    }else{
                        node._defaultDirectives = [attr.hookName];
                    }
                    return;
                }
                else if(comp.$component.registeredDirectives.indexOf(attr.hookName) == -1){
                    Lyte.warn("Directive names "+attr.hookName+" not found in the registry" + comp.$component.name);
                    return;
                }
                if(!node._directiveIns){
                    let dIns;
                    let lIns = _LC.getAppOrAddon(comp.$component);
                    let directiveClass = comp.$component._registeredDirectivesClass[attr.hookName];
                    lIns.scopedInstance(directiveClass,[],function(ins){
                        dIns = ins
                    },[])
                    node._directiveIns = dIns;
                }
                var directiveIns = node._directiveIns;
                if(directiveIns && !directiveIns[state]){
                    return;
                }
                var ev = {};
                ev.node = node;
                ev.state  = state;
                // ev.domAppendedFirstTime = domAppendedFirstTime;
                ev.initial = initial;
                ev.dependentPromises = dependentPromises;
                // ev.component = comp.component;
                self.appendHooksCall(state, comp.component, ev, attr);
            }.bind(comp));
        }.bind(comp))
    }
}

_LC.directive.getTransitionAttr = function(comp,directiveName){
    let found;
    if(comp._specialAttributeDetails && comp._specialAttributeDetails.length){
        comp._specialAttributeDetails.forEach(function(attr){
            if(attr.hookName == directiveName){
                found = attr
            }
        })
        return found;
    }
}
_LC.directive.appendHooksCall = function(state,comp,ev,attr){
    var val, node = ev.node;
    var transIns = node._directiveIns;
    if(transIns){
        val = this.getTransitionArg(node,attr.hookName);
        transIns.config = val
        transIns.component = comp;
        transIns[state].call(transIns,ev);
    }
}
_LC.directive.removeHooks = function(state,comp,content,node,ownpromise,chld,sibl,keepAlive,executed){
    var promise;
    var self = this;
    if(content._specialAttributeDetails && content._specialAttributeDetails.length){
    content._specialAttributeDetails.forEach(function(attr){
        if(comp.$component.registeredDirectives.indexOf(attr.hookName) == -1){
            Lyte.warn("Directive names "+attr.hookName+" not found in the registry" + comp.$component.name);
            return;
        }
        if(!content._directiveIns){
            let dIns;
            let lIns = _LC.getAppOrAddon(comp.$component);
            let directiveClass = comp.$component._registeredDirectivesClass[attr.hookName];
            lIns.scopedInstance(directiveClass,[],function(ins){
                dIns = ins
            },[])
            content._directiveIns = dIns;
        }
        var directiveIns = content._directiveIns;
        if(directiveIns && !directiveIns[state]){
            return;
        }
        if(directiveIns){
            if(!directiveIns[state]){
                if(executed){
                    executed.flag = false;
                }
                return;
            }
            maxResolveTime = directiveIns.maxResolveTime;
        }
        var ev = {};
        var maxResolveTime;
        ev.node = content;
        ev.state  = state;
        ev.childPromise = chld;
        // ev.component = this.component;
        // ev.hooks = currentDirective;
        if(sibl && sibl[0]){
            ev.previousSiblingPromise = sibl[0];
        }
        if(state == "onRemove"){
            var res, rej;
            promise = new Promise(function(resolve, reject) { 
                res = resolve, rej=reject;
                ev.done = resolve;
                self.removeHooksCall(state,comp.component,ev,attr,content);
            });
            // node._allPromise.$push(promise);
            content._promise = promise;
            content._promise._state = "pending";
            promise._res = res;
            promise._rej = rej;
            return promise;
        }else if(state == "afterRemove"){
            if(executed){
                executed.flag = true;
                executed.maxResolveTime = maxResolveTime;
            }
            if(ownpromise){
                var p = [ownpromise];
                Promise.all(p).then(function(){
                    if(!keepAlive){
                        content.remove();
                    }
                    if(comp.component){
                        self.removeHooksCall(state,comp.component,ev,attr,content);
                    }
                    content._promise._state = "resolved";
                    if(!keepAlive){
                        content._promise._node = null;
                    }
                });
            }else{
                // if(!keepAlive){
                //     content.remove();
                // }
                self.removeHooksCall(state, comp.component, ev, attr, content);
                // content._promise._state = "resolved";
                // if(!keepAlive){
                //     content._promise._node.remove();
                // }
            }
        }
        else{
            self.removeHooksCall(state,comp.component,ev,attr,content);
        }
    });
    }
    if(promise){
        return promise;
    }
}
_LC.directive.removeHooksCall = function(state,comp,ev,attr,content){
    var val ,transIns = content._directiveIns;
    if(transIns){
        val = this.getTransitionArg(ev.node,attr.hookName);
        transIns.config = val
        transIns.component = comp;
        transIns[state].call(transIns,ev);
    }
}
_LC.directive.setSpecialNodes = function(comp,helperNode,dynamicN,info,options){
    if(helperNode && (helperNode._hooksPresent || helperNode._defaultSetSpecialNode)){
        if(helperNode._specialNodes){
            if(helperNode.getAttribute("is") == "for"){
                helperNode._specialNodes[options.itemIndex][info.in] = dynamicN;
            }else if(helperNode.getAttribute("is") == "forIn"){
                helperNode._specialNodes[options.itemIndex][info.in] = dynamicN;
            }
            else if(helperNode && /if|switch/g.test(helperNode.getAttribute("is"))){
                helperNode._specialNodes[info.in] = dynamicN;  
            }
            else if(helperNode && helperNode.tagName == "LYTE-YIELD"){
                helperNode._specialNodes[info.in] = dynamicN;
            }
        }
    }else if(dynamicN && dynamicN._hooksPresent){
        comp._specialNodes[info.in] = dynamicN;
        comp._hooksPresent = true;
        comp.hc = true;
    }else if(dynamicN && dynamicN._defaultSetSpecialNode){
        comp._specialNodes[info.in] = dynamicN;
        comp._defaultSetSpecialNode = true;
    }
    if(info.chld){
        dynamicN._chld = info.chld;
    }
    if(info.dc){
        dynamicN.dc = info.dc;
        dynamicN.hc = info.hc;
    }
    if(info.sibl){
        dynamicN._sibl = info.sibl;
    }
}
_LC.directive.removeFromDom = function(content){
    if(Array.isArray(content)){
        for(let s=0;s<content.length; s++ ) {
            if(Array.isArray(content[s])){
                for(let i=0;i<content[s].length; i++ ) {
                    content[s][i].remove();
                }
            }else{
                content[s].remove();
            }
        }
    }else if(content instanceof Object){
        for (var ind in content) {
            for (let i = 0; i < content[ind].length; i++) {
                content[ind][i].remove();
            }
        }
    }
}
_LC.directive.removeFromDomNormal = function(node,content){
    if(node._forContent) {
        if(node.getAttribute("is") === "for") {
            if(node._rmLaterHelper) {
                for(let i=0;i<node._rmLaterHelper.length;i++) {
                    for(let j=0;j<node._rmLaterHelper[i].length;j++) {
                            this.removeFromDomNormal(node._rmLaterHelper[i][j]);
                    }
                    node._rmLaterHelper[i] = [];
                }
            }
            // for(let s=0;s<node._forContent.length;s++) {
            //     for(let i=0;i<node._forContent[s].length; i++ ) {
            //         node._forContent[s][i].remove();
            //     }
            // }
            _LC.removeForContent(node);
        }else{
            if(node._rmLaterHelper) {
                let keys = Object.keys(node._rmLaterHelper);
                for(let i=0;i<keys.length;i++) {
                    for(let j=0;j<node._rmLaterHelper[keys[i]].length;j++) {
                        this.removeFromDomNormal(node._rmLaterHelper[keys[i]][j]);
                    }
                    node._rmLaterHelper[keys[i]] = [];
                }
            }
            for(var ind in node._forContent) {
                for(let i=0;i<node._forContent[ind].length; i++ ) {
                    node._forContent[ind][i].remove();
                }
            }
        }
    }
    else if(node._caseContent || node._yieldContent){
        if(node._rmLaterHelper) {
            for(let j=0;j<node._rmLaterHelper.length;j++) {
                this.removeFromDomNormal(node._rmLaterHelper[j]);
            }
            node._rmLaterHelper = [];
        }
        for(let i=0;i<node._caseContent.length; i++ ) {
            node._caseContent[i].remove();
        }
        // node._caseContent = []; // not removed from pendignvewport elements
    } else if(node._renderedComponent) {

        for(let key in node._renderedComponent) {
            if(node._renderedComponent[key]) {
                node._renderedComponent[key].remove();
                node._renderedComponent[key] = null;
            }
        }
    }
}
_LC.directive.removeLaterHelper = function(node,content,normalRemove){
    if(node._forContent) {
        if(node.getAttribute("is") === "for") {
            if(node._rmLaterHelper) {
                for(let i=0;i<node._rmLaterHelper.length;i++) {
                    for(let j=0;j<node._rmLaterHelper[i].length;j++) {
                            this.removeLaterHelper(node._rmLaterHelper[i][j]);
                    }
                    node._rmLaterHelper[i] = [];
                }
            }
        }else{
            if(node._rmLaterHelper) {
                let keys = Object.keys(node._rmLaterHelper);
                for(let i=0;i<keys.length;i++) {
                    for(let j=0;j<node._rmLaterHelper[keys[i]].length;j++) {
                        this.removeLaterHelper(node._rmLaterHelper[keys[i]][j]);
                    }
                    node._rmLaterHelper[keys[i]] = [];
                }
            }
        }
    }
    else if(node._caseContent || node._yieldContent){
        if(node._rmLaterHelper) {
            for(let j=0;j<node._rmLaterHelper.length;j++) {
                this.removeLaterHelper(node._rmLaterHelper[j]);
            }
            node._rmLaterHelper = [];
        }
    }
    //  else if(node._renderedComponent) {
        // for(let key in node._renderedComponent) {
        //     if(node._renderedComponent[key]) {
        //         node._renderedComponent[key].remove();
        //         node._renderedComponent[key] = null;
        //     }
        // }
    // }
}
_LC.directive.rmOtherNodes = function(node,caseContentArr,totalProms,keepAlive){
    if(!keepAlive){
        if(totalProms && totalProms.length>0){
            //remove all _rmLaterHelper
            this.removeLaterHelper(node);
            Promise.all(totalProms).then(function(){
                this.removeFromDom(caseContentArr)
                totalProms = null;
            }.bind(this));
        }else{
            this.removeFromDomNormal(node,caseContentArr);
        }
    }
}
_LC.directive.getDirectChildPos = function(node){
    var directChildArr = [];
    if(node && (node.getAttribute("is") == "if")){
        let pCase = node._previousCase;
        if(pCase && node.dc && node.dc[pCase]){
            directChildArr = node.dc[pCase].dc;
        }
    }
    else if(node.getAttribute("is") == "switch"){
        let pCase = node._previousCase;
        let dr = node.dc;
        if(pCase && dr && dr[pCase] && dr[pCase].dc){
            dr[pCase].dc.forEach(function(item,index){
                directChildArr.$push(item);
            });
            var dummyScope = node._cases[pCase];
            while(dummyScope){
                if(dummyScope.additional) {
                    if(dummyScope.additional.next) {
                        let nxtName = dummyScope.additional.next
                        dummyScope = node._cases[dummyScope.additional.next];
                        let chldArr = dr[nxtName].dc
                        if(chldArr){
                            for(let i=0;i<chldArr.length;i++){
                                directChildArr.$push(chldArr[i]);
                            }
                            // dr[nxtName].dc.forEach(function(item,index){
                            //     directChildArr.$push(item);
                            // })
                        }
                    } else {
                        dummyScope = node._default;
                        let chldArr = dr["default"].dc; 
                        if(chldArr){
                            for(let i=0;i<chldArr.length;i++){
                                directChildArr.$push(chldArr[i]);
                            }
                            // dr["default"].dc.forEach(function(item,index){
                            //     directChildArr.$push(item);
                            // })  
                        }
                    }
                } else {
                    break;
                }
            }
        }
    }
    else if(node.dc && node.dc.length){
        directChildArr = node.dc;
    }
    return directChildArr;
}
_LC.directive.transitionRemoveHelpers = function(thisRef, node, totalProms ,content ,specialNodes,obj,nodeStack,keepAlive){
    var childProms = node._childPromise;
    var directChildArr = this.getDirectChildPos(node);
    if(content){
        if((node._hooksPresent||node.hc) && specialNodes){
            this.removeHookNodes(thisRef,specialNodes,node,totalProms,childProms,directChildArr,obj,nodeStack,keepAlive);
            if(childProms && childProms.length){
                this.rmOtherNodes(node,content,childProms,keepAlive);
            }
        }
    }
}
//need comp
_LC.directive.removeHookNodes = function(
    thisRef,
    hookNodes,
    node,
    totalProms,
    childProms,
    directChildArr,
    obj,
    nodeStack,
    keepAlive
) {
    var parentPrev;
    if(obj && obj.previousPromise){
        parentPrev = obj.previousPromise;
    }
    if(hookNodes && hookNodes.length > 0){
        for(var j=0; j<hookNodes.length; j++){
            var chld = [];
            var sibl = [];
            var ele = hookNodes[j];
            if(ele){
                if(ele.tagName =="TEMPLATE"){
                    var is = ele.getAttribute("is");
                    if(is == "if" || is == "switch"){
                        this.checkOngoingPromises(ele);
                        this.transitionRemoveHelpers(thisRef,ele,totalProms,ele._caseContent,ele._specialNodes,obj,nodeStack,keepAlive)
                        this.setParentChildPromise(ele,childProms,directChildArr,j,nodeStack,node);
                        continue;
                    }else if(is == "for"){
                        let hNode = ele._specialNodes;
                        this.checkOngoingPromises(ele);
                        if(ele.hc && hNode){
                            for(let k=hNode.length-1; k>=0; k--){
                                this.transitionRemoveHelpers(thisRef,ele,totalProms,ele._forContent,hNode[k],obj,nodeStack,keepAlive)
                            }
                        }
                        this.setParentChildPromise(ele,childProms,directChildArr,j,nodeStack,node);
                        continue;
                    }else if(is == "forIn"){
                        let hNode = ele._specialNodes;
                        this.checkOngoingPromises(ele);
                        var keysArr = Object.keys(ele._specialNodes);
                        if(ele.hc && hNode){
                            for(let k=keysArr.length-1; k>=0; k--){
                                this.transitionRemoveHelpers(thisRef,ele,totalProms,ele._forContent,hNode[keysArr[k]],obj,nodeStack,keepAlive)
                            }
                        }
                        this.setParentChildPromise(ele,childProms,directChildArr,j,nodeStack,node);
                        continue; 
                    }else if(is == "component"){
                        this.checkOngoingPromises(ele);
                        for(let key in ele._renderedComponent) {
                            if(ele._renderedComponent[key]) {
                                var comp = ele._renderedComponent[key];
                                if(comp._hooksPresent && key == ele._currentComponent){
                                    comp._childPromise =[];
                                    this.removeHookNodes(thisRef,[comp],ele,totalProms,ele._childPromise,[0],obj,nodeStack,keepAlive);
                                    if(childProms && comp._childPromise && ele._childPromise){
                                        for(let i=0; i<comp._childPromise.length; i++){
                                            ele._childPromise.$push(comp._childPromise[i]);
                                        }
                                        // comp._childPromise.forEach(function(proms){
                                        //     ele._childPromise.$push(proms);
                                        // })
                                    }
                                }else{
                                    ele._renderedComponent[key].remove();
                                    ele._renderedComponent[key] = null;
                                }
                            }
                        }
                        this.setParentChildPromise(ele,childProms,directChildArr,j,nodeStack,node);
                        continue;
                    }else if(is == "yield"){
                        continue; 
                    }
                }
                if(ele.component){
                    if(ele.hc){
                        this.checkOngoingPromises(ele);
                        this.transitionRemoveHelpers(thisRef,ele,totalProms,[ele],ele._specialNodes,obj,nodeStack,keepAlive)
                        // if(ele.tagName == "LYTE-YIELD"){
                        //     ele._fakeRemove = true;
                        //      ele.constructor.prototype.disconnectedCallback.apply(ele)
                        //     ele._deleted = true;
                        // }
                    }
                    if(!ele._specialAttributeDetails){
                        this.setParentChildPromise(ele,childProms,directChildArr,j,nodeStack,node);
                        continue;
                    }
                    this.getDirectTransChild(ele,chld);
                }
                //dont c _chld for comp 
                else{
                    this.getChildTransition(hookNodes,j,chld);
                }
                this.getSiblTransition(hookNodes,j,sibl,node,parentPrev);
                if(ele._specialAttributeDetails){
                    var ownpromise;
                    this.removeHooks('beforeRemove',thisRef,ele,node,undefined,chld,sibl);
                    ownpromise = this.removeHooks('onRemove',thisRef,ele,node,undefined,chld,sibl);
                    if(ownpromise){
                        var executed = {"flag" : false};
                        ownpromise._node = ele;
                        ele._ownPromise = ownpromise;
                        this.removeHooks('afterRemove',thisRef,ele,node,ownpromise,chld,sibl,keepAlive,executed);
                        totalProms && totalProms.$push(ownpromise);
                        if(childProms && directChildArr && directChildArr.length && directChildArr.indexOf(j) != -1){
                            childProms.$push(ownpromise);
                        }
                        if(obj){
                            obj.previousPromise = ownpromise;
                        }
                        var maxResolveTime = 5000;
                        if(executed && executed.maxResolveTime != undefined && typeof executed.maxResolveTime == "number"){
                            maxResolveTime = executed.maxResolveTime;
                        }
                        if(executed && !executed.flag){
                            this.setState(ownpromise,ele);
                        }
                        this.transitionDefaultResolve(ownpromise,maxResolveTime);
                    }else{
                        if(!keepAlive){
                            ele.remove();
                        }
                        this.removeHooks('afterRemove',thisRef,ele,node,undefined,chld,sibl,keepAlive);
                    }
                }
            }
        }
    }
}
_LC.directive.setParentChildPromise = function(ele,childProms,directChildArr,j,nodeStack,node){
    if(childProms && ele._childPromise && ele._childPromise.length && directChildArr && directChildArr.length && directChildArr.indexOf(j) != -1){
        ele._childPromise.forEach(function(proms){
            childProms.$push(proms);
        })
    }
    nodeStack.$push(node);
}
_LC.directive.checkOngoingPromises = function(ele){
    if(ele._totalPromise && ele._totalPromise.length){
        this.resolveOngoingPromise(ele._totalPromise);
        ele._totalPromise = [];
    }
}
_LC.directive.resolveOngoingPromise = function(totalProms){
    totalProms.forEach(function(promise){
        if(promise && promise._state == "pending"){
            promise._res();
            promise._state = "resolved";
            let nodeStr ="";
            if(promise._node){
                nodeStr = _LC.errorNodeDetails(promise._node);
            }
            Lyte.warn("Ongoing previous transition was resolved by lyte "+nodeStr);
        }
    })
}
_LC.directive.setState = function(ownpromise,ele){
    ownpromise.then(function(){
        ele.remove();
        ownpromise._state = "resolved";
    })
}
_LC.directive.transitionDefaultResolve = function(promise,maxResolveTime){
    var timeOutId = setTimeout(function(){
        promise._res();
        promise._state = "resolved";
        clearTimeout(timeOutId);
    },maxResolveTime);
}
_LC.directive.getSiblTransition = function(hookNodes,j,sibl,pnode,parentPrev){
    if(hookNodes[j]._sibl && hookNodes[j]._sibl.length){
        hookNodes[j]._sibl.forEach(function(indNew){
            let node = hookNodes[indNew];
            if(node){
                if(node.tagName == "TEMPLATE" && node.hc && node._childPromise){
                    if(!node._childPromise.length){
                        this.getNxtSiblTrans(node,pnode,sibl,hookNodes);
                    }else if(sibl && node._childPromise && node._childPromise.length){
                        let ln = node._childPromise.length;
                        sibl.$push(node._childPromise[ln-1]);
                    }
                }else if(sibl && node._hooksPresent && node._ownPromise){
                    sibl.$push(node._ownPromise);
                }
                else if(sibl && node.component && node._childPromise){
                    if(!node._childPromise.length){
                        this.getNxtSiblTrans(node,pnode,sibl,hookNodes);
                    }else{
                        let ln = node._childPromise.length;
                        sibl.$push(node._childPromise[ln-1]);
                    }
                }else if(sibl && parentPrev){
                    sibl.$push(parentPrev);
                }
            }
        }.bind(this))
        if(sibl && !sibl.length && parentPrev){
            sibl.$push(parentPrev);
        }
    }  else if(parentPrev){
        sibl.$push(parentPrev);
    }
}
_LC.directive.getNxtSiblTrans = function(node,template,sibl,hookNodes){
    while(node._sibl && !sibl.length){
        let ind = node._sibl[0];
        node = hookNodes[ind];
        if(node && node.tagName == "TEMPLATE" && node.hc){
            if(node._childPromise && !node._childPromise.length){
                this.getNxtSiblTrans(node,template,sibl,hookNodes);
            }else if(node._childPromise){
                let ln = node._childPromise.length;
                sibl.$push(node._childPromise[ln-1]);
            }
        }
        else if(node && node.component){
            if(node._specialAttributeDetails){
                sibl.$push(node);
            }else if(node.hc && node._childPromise){
                let ln = node._childPromise.length;
                sibl.$push(node._childPromise[ln-1]);
            }
            else{
                this.getNxtSiblTrans(node,template,sibl,hookNodes);
            }
        }
        else if(node && node._hooksPresent && node._ownPromise){
            sibl.$push(node._ownPromise);
        }
    }
}
_LC.directive.getChildTransition = function(hookNodes,j,chld){
    if(hookNodes[j]._chld){
        hookNodes[j]._chld.forEach(function(indNew){
            let node = hookNodes[indNew];
            if(node && chld&& node.tagName == "TEMPLATE" && node.hc && node.getAttribute("is") != "yield" && node.getAttribute("is") != "registerYield"){
                this.getDirectTransChild(node,chld);
            }else if(node && chld && node.component){
                if(node._specialAttributeDetails && node._ownPromise){
                    chld.$push(node._ownPromise);
                }else if(node.hc){
                    this.getDirectTransChild(node,chld);
                }
            }
            else if(node && chld && node._ownPromise){
                chld.$push(node._ownPromise);
            }
        }.bind(this))
    }
}
_LC.directive.getDirectTransChild = function(template,chld){
    let promiseArr = template._childPromise;
    let ln = promiseArr.length
    for(let i=ln-1; i>=0; i--){
        chld.$push(promiseArr[i]);
    }
}
_LC.directive.pushChildPromise = function(ele,childProms){
    ele._childPromise.forEach(function(proms){
        childProms.$push(proms);
    })
}
_LC.directive.setTransitionNodes = function(specialNodes,comp,dependentPromises,direct,stack){
    if(specialNodes && specialNodes.length){
        var ln = specialNodes.length;
        // var stack = [];
        for(var i=ln-1; i>=0; i--){
            var spNode = specialNodes[i];
            if(spNode && spNode.tagName == "TEMPLATE"){
                var is = spNode.getAttribute("is");
                switch(is){
                    case "for": {
                        if(spNode._specialNodes){
                            for(let j=0; j<spNode._specialNodes.length; j++){
                                this.setTransitionNodes(spNode._specialNodes[j],comp,dependentPromises,false,stack);
                            }
                        }
                    } break;
                    case "forIn": {
                        if(spNode._specialNodes){
                            var keys = Object.keys(spNode._specialNodes);
                            for(let j=0; j<keys.length; j++){
                                this.setTransitionNodes(spNode._specialNodes[keys[j]],comp,dependentPromises,false,stack);
                            }
                        }
                    }break;
                    case "switch":
                    case "if": {
                        if(spNode._specialNodes){
                            this.setTransitionNodes(spNode._specialNodes,comp,dependentPromises,false,stack);
                        }
                    }
                    break;
                    case "component": {
                        if(comp._transitionAppend && spNode._specialAttributeDetails){
                            comp._transitionAppend.$push(spNode);
                        }
                        var name = spNode._currentComponent;
                        if(name && spNode._renderedComponent[name]){
                            stack.$push(spNode._renderedComponent[name]);
                        }
                    }
                    break;
                    default: {
                        if(spNode._specialNodes){
                            this.setTransitionNodes(spNode._specialNodes,comp,dependentPromises,false,stack);
                        }
                    }
                }
            }else{
                if(spNode && spNode.component){
                    if(spNode._specialAttributeDetails && comp._transitionAppend){
                        comp._transitionAppend.$push(spNode);
                    }
                    // comp._transitionAppend.$push(spNode._specialNodes,comp);
                    if(spNode.tagName == "LYTE-YIELD"){
                        this.setTransitionNodes(spNode._specialNodes,comp,dependentPromises,false,stack);
                    }else if(stack){
                        stack.$push(spNode);
                    }
                }else if(comp._transitionAppend){
                    comp._transitionAppend.$push(spNode);
                }
                
            }
        }
        if(direct){
            this.appendHooks('beforeAppend',comp,undefined,undefined,dependentPromises)
            if(stack && stack.length){
                let self = this;
                stack.forEach(function(childComp){
                    var newStack = [];
                    self.setTransitionNodes(childComp._specialNodes,childComp,dependentPromises,true,newStack);
                })
                stack = null;
            }
            this.appendHooks('onAppend',comp,undefined,undefined,dependentPromises)
            this.appendHooks('afterAppend',comp,undefined,undefined,dependentPromises)
            comp._transitionAppend = [];
        }
    }
}
_LC.directive.checkFakeForAndRemove = function(fakeRemove,node,i){
    if(fakeRemove){
        if(!node._rmLaterHelper){
            node._rmLaterHelper = [];
        }
        node._rmLaterHelper[i] = node._helpers[i];
        node._helpers[i] = [];
    }else{
        node._helpers[i] = [];
    }
}
_LC.directive.checkFakeIfAndRemove = function(fakeRemove,node){
    if(fakeRemove){
        node._rmLaterHelper = node._helpers;
        node._helpers = [];
    }else{
        node._helpers = [];
    }
}
_LC.directive.removeForContent = function(comp,direct,fakeRemove,node,totalProms){
    if(direct && node.hc){
        for(let i=node._forContent.length-1; i>=0; i--){
            var forContent = Array.from(node._forContent[i]);
            var specialNodes = node._specialNodes[i];
            var obj = {};
            var nodeStack = [];
            obj.previousPromise = previousPromise;
            this.transitionRemoveHelpers(comp,node,totalProms,forContent,specialNodes,obj,nodeStack);
            if(totalProms && !totalProms.length){
                this.rmOtherNodes(node,forContent);
            }
            for(var j=0; j<nodeStack.length; j++){
                if(nodeStack[j] && nodeStack[j]._specialNodes && nodeStack[j]._specialNodes.length){
                    nodeStack[j]._specialNodes = [];
                }
            }
            if(node._specialNodes){
                for(let i=0; i<node._specialNodes.length; i++){
                    node._specialNodes[i] = []
                }
            }
            
        }
    }
    else{
        var forContent = node._forContent;
        if(forContent){
            if(!fakeRemove){
                this.rmOtherNodes(node,node._forContent,totalProms);
            }
        }
    }
}
_LC.directive.removeForInContent = function(comp,direct,fakeRemove,node,totalProms){
    if(direct && node.hc){
        var keys = Object.keys(node._specialNodes);
        var ln = keys.length;
        for(let i=ln-1; i>=0; i--){
            let key = keys[i];
            var forContent = Array.from(node._forContent[key]);
            var specialNodes = node._specialNodes[key];
            var obj = {};
            var nodeStack = [];
            // var yieldChild = node._yieldChild;
            obj.previousPromise = previousPromise;
            this.transitionRemoveHelpers(comp,node,totalProms,forContent,specialNodes,obj,nodeStack);
            if(totalProms && !totalProms.length){
                this.rmOtherNodes(node,forContent);
            }
            for(var j=0; j<nodeStack.length; j++){
                if(nodeStack[j] && nodeStack[j]._specialNodes && nodeStack[j]._specialNodes.length){
                    nodeStack[j]._specialNodes = [];
                }
            }
            if(node._specialNodes) {
                let keys = Object.keys(node._specialNodes);
                for(let i=0;i<keys.length;i++) {
                    for(let j=0;j<node._specialNodes[keys[i]].length;j++) {
                        this.removeHelpers(node._specialNodes[keys[i]][j],undefined,undefined, totalProms, fakeRemove, previousPromise);
                    }
                    node._specialNodes[keys[i]] = [];
                }
            }
        }
    }
    else{
        var caseContent = node._forContent;
        if(caseContent){
            if(!fakeRemove){
                this.rmOtherNodes(node,node._forContent,totalProms);
            }
        }
    }
}
_LC.directive.removeIfContent = function(comp,direct,fakeRemove,node,totalProms,previousPromise){
    if(direct && node.hc){
        var caseContent = Array.from(node._caseContent);
        var specialNodes = node._specialNodes;
        // var yieldChild = node._yieldChild;
        var obj = {};
        var nodeStack = [];
        obj.previousPromise = previousPromise;
        this.transitionRemoveHelpers(comp,node,totalProms,caseContent,specialNodes,obj,nodeStack);
        if(totalProms && !totalProms.length){
            this.rmOtherNodes(node,caseContent);
        }
        _LC.removeDynamicNodes(node,comp);
        if(!direct){
            for(let tempName in node._tempList) {
                _LC.removeDynamicNodes(node._tempList[tempName],comp);
            }
        }
        for(var j=0; j<nodeStack.length; j++){
            if(nodeStack[j] && nodeStack[j]._specialNodes && nodeStack[j]._specialNodes.length){
                nodeStack[j]._specialNodes = [];
            }
        }
        // nodeStack.forEach(function(item){
        //     if(item._specialNodes && item._specialNodes.length){
        //         item._specialNodes = [];
        //     }
        // })
        if(node._specialNodes){
            node._specialNodes = []
        }
    }
    else{
        var caseContent = node._caseContent;
        if(caseContent){
            if(!fakeRemove){
                this.rmOtherNodes(node,caseContent,totalProms);
            }
            _LC.removeDynamicNodes(node,comp);
            if(!direct && node._tempList){
                for(let tempName in node._tempList) {
                    _LC.removeDynamicNodes(node._tempList[tempName],comp);
                }
            }
        } else if(node._yieldContent){
            for(let i=0;i<node._yieldContent.length; i++ ) {
                node._yieldContent[i].remove();
            }
        }
    }
}
_LC.directive.removeForIndexContent = function(comp,node,totalProms,previousPromise,index){
    var forContent = Array.from(node._forContent[index]);
    var specialNodes = node._specialNodes[index];
    var nodeStack = [];
    var obj = {};
    obj.previousPromise = previousPromise;
    // var yieldChild = node._yieldChild && node._yieldChild[index];
    var stackPromise = [];
    this.transitionRemoveHelpers(comp,node,stackPromise,forContent,specialNodes,obj,nodeStack);
    node._ongoingpromise[index] = stackPromise;
    if(stackPromise && totalProms && stackPromise.length){
        node._ongoingpromise[index] = stackPromise;
        stackPromise.forEach(function(proms){
            totalProms.$push(proms);
        });
    }
    if(totalProms && !totalProms.length){
        // this.rmOtherNodes(node,forContent);
        if(node._helpers[index]) {
            for(let j=0;j<node._helpers[index].length;j++) {
                this.removeFromDomNormal(node._helpers[index][j]);
            }
        }
        if(node._forContent[index]) {
            for(let i=0;i<node._forContent[index].length; i++ ) {
                node._forContent[index][i].remove();
            }
        }
    }
    if(nodeStack){
        nodeStack.forEach(function(item){
            if(item._specialNodes && item._specialNodes.length && item!=node){
                item._specialNodes = [];
            }
        })
    }
    if(node._specialNodes && node._specialNodes[index]){
        node._specialNodes[index] = []
    }
}
_LC.directive.updateRenderedComp = function(comp,activeComponent,node,keepAlive){
    activeComponent._totalPromise = [];
    var obj = {};
    var nodeStack = [];
    var stackPromise = [];
    this.removeHookNodes(comp,[activeComponent],node,stackPromise,node._childPromise,activeComponent.dc,obj,nodeStack,keepAlive);
    node._totalPromise = stackPromise;
    if(stackPromise && activeComponent._totalPromise && stackPromise.length){
        stackPromise.forEach(function(proms){
            activeComponent._totalPromise.$push(proms);
        });
    }
    if(keepAlive){
        if(node._childPromise && node._childPromise.length){
            this.appendInKeepAliveDom(node,node._childPromise,activeComponent);
        }else{
            _LC.hDiv.content.appendChild(activeComponent) 
        }
        
    }else{
        if(nodeStack){
        nodeStack.forEach(function(item){
            if(item._specialNodes && item._specialNodes.length && item!=node){
                item._specialNodes = [];
            }
        })
        }
        if(node._childPromise && !node._childPromise.length){
            activeComponent.remove();    
        }
    }
}
_LC.directive.updateDynamicComp = function(comp,update,component,activeComponent,node,newComponent){
    let returnVal;
    if(!update) {
        if(comp._dependentPromise){
            component._dependentPromise = comp._dependentPromise;
        }
        returnVal = {"toAppendMain" : component, "lastNode" : node};
    } else {
        if(node._specialAttributeDetails && node._specialAttributeDetails.length > 0){
            component._specialAttributeDetails = node._specialAttributeDetails;
            comp._transitionAppend.$push(component);
        }
        let dependentPromises = [];
        if(activeComponent && activeComponent._totalPromise && activeComponent._totalPromise.length){// && this._transitionAppend.length
            for(let i=activeComponent._totalPromise.length-1;i>=0;i--){
                dependentPromises.$push(activeComponent._totalPromise[i])
            }
        }
        this.appendHooks('beforeAppend',comp,undefined,undefined,dependentPromises)
        if(!newComponent && component.hc){
            var stack = [];
            this.setTransitionNodes(component._specialNodes,component,dependentPromises,true,stack);
        }
        _LC.ignoreDisconnect = true;
        _LC.insertBeforeNative(node.parentNode,component, node);
        _LC.ignoreDisconnect = false;
        this.appendHooks('onAppend',comp,undefined,undefined,dependentPromises)
        this.appendHooks('afterAppend',comp,undefined,undefined,dependentPromises)
        comp._transitionAppend = [];
    }
    if(!update && node._specialAttributeDetails && node._specialAttributeDetails.length > 0 && comp._transitionAppend){
        component._specialAttributeDetails = node._specialAttributeDetails;
        comp._transitionAppend.$push(component);
    }
    return returnVal;
}
_LC.directive.onGoingForPromise = function(node,ind){
    if(node._ongoingpromise[ind]){
        this.resolveOngoingPromise(node._ongoingpromise[ind]);
        node._ongoingpromise[ind] = null;
    }
}
_LC.directive.removeRenderedComponent = function(comp,node,previousPromise){
    var obj = {};
    var nodeStack = [];
    obj.previousPromise = previousPromise;
    directiveObj.transitionRemoveHelpers(comp,renderedComponent,totalProms,[renderedComponent],renderedComponent._specialNodes,obj,nodeStack);
    if(totalProms && !totalProms.length){
        node._renderedComponent[key].remove();
        node._renderedComponent[key] = null;
    }
    if(nodeStack){
    nodeStack.forEach(function(item){
        if(item._specialNodes && item._specialNodes.length){
            item._specialNodes = [];
        }
    })
    }
    if(node._specialNodes){
        node._specialNodes = []
    }
}
_LC.directive.insertInDom = function(comp,placeHolder,lastNode,toAppendMain,domAppendedFirstTime,initial,dependentPromises){
    // var dependentPromises = [];
    // this.getAllDependentPromises(comp,dependentPromises,node._totalPromise);
    this.appendHooks('beforeAppend', comp, domAppendedFirstTime, initial, dependentPromises)
    _LC.insertInDom(placeHolder,lastNode,toAppendMain);
    this.appendHooks('onAppend',comp,domAppendedFirstTime,initial,dependentPromises)
    this.appendHooks('afterAppend',comp,domAppendedFirstTime,initial,dependentPromises)
    comp._transitionAppend = [];
}
_LC.directive.appendInDom = function(comp,content,domAppendedFirstTime,initial,dependentPromises){
    this.appendHooks('beforeAppend',comp,domAppendedFirstTime,initial,dependentPromises)
    _LC.appendInDom(comp,content);
    this.appendHooks('onAppend',comp,domAppendedFirstTime,initial,dependentPromises)
    this.appendHooks('afterAppend',comp,domAppendedFirstTime,initial,dependentPromises)
    comp._transitionAppend = [];
}
_LC.directive.getDependentPromises = function(comp,dependentPromises,sourcePromises){
    if(sourcePromises && sourcePromises.length){
        for(let i=sourcePromises.length-1;i>=0;i--){
            dependentPromises.$push(sourcePromises[i])
        }
    }
}
_LC.directive.getAllDependentPromises = function(comp,dependentPromises,sourcePromises){
    if(sourcePromises && sourcePromises.length && comp._transitionAppend && comp._transitionAppend.length){
        for(let i=sourcePromises.length-1;i>=0;i--){
            dependentPromises.$push(sourcePromises[i])
        }
    }
}
_LC.directive.instanciatePromises = function(comp){
    comp._childPromise = [];
    comp._transitionAppend = [];
    comp._totalPromise = [];
    comp._transitionHelperNodes = [];
    comp._specialNodes = [];
}
_LC.directive.instanciateForPromises = function(node){
    node._totalPromise = []
    node._childPromise = []
    if(!node._ongoingpromise){
        node._ongoingpromise = []
    }
}
_LC.directive.destroyPromises = function(comp){
    comp._specialNodes = null;
    comp._childPromise = null;
    comp._totalPromise = null;
}
_LC.directive.appendInKeepAliveDom = function(node,childProms,activeComponent){
    Promise.all(childProms).then(function(){
        if(node._dontAppend){
            activeComponent.remove();
        }else{
            _LC.ignoreDisconnect = true;
            _LC.hDiv.content.appendChild(activeComponent) 
            _LC.ignoreDisconnect = false;
        }
        childProms = null;
    }.bind(this));
}
_LC.directive.destroyHelperPromises = function(arr){
    for(let i=0; i<arr.length; i++){
        let helperArr = arr[i];
        for (let key in helperArr) {
            let node = helperArr[key];
            if(node._totalPromise && node._totalPromise.length){
                let isKeepAlive = node.hasAttribute("lyte-keep-alive");
                if(isKeepAlive){
                    node._dontAppend = true;
                }
                this.resolveOngoingPromise(node._totalPromise);
                node._totalPromise = null;
            }
        }
    }
}
_LC.directive.updateSpecialNodeRef = function(comp,node,toAppend,helperNode){
    if(node._specialNodes && node._specialNodes.length){
        node.dc = toAppend.dc;
        node.hc = true
        if(helperNode){
            helperNode.hc = true
        }else{
            comp.hc = true
        }
    }
}
_LC.directive.spliceSpecialNodes = function(node,firstIndex,secondIndex){
    node._specialNodes.$splice(firstIndex, secondIndex);
}
_LC.directive.infoCD = function(comp,info,dynamicN,helperNode,options){
    this.infoI(comp,info,dynamicN,helperNode,options);
    if(comp._dependentPromise){
        dynamicN._dependentPromise = comp._dependentPromise;
    }
}
_LC.directive.infoI = function(comp,info,dynamicN,helperNode,options){
    if(!info._igTs){
        dynamicN._defaultSetSpecialNode = true;
        this.setSpecialNodes(comp,helperNode, dynamicN, info, options); 
    }
}
_LC.directive.infoA = function(comp,info,dynamicN,helperNode,attr,yieldComp,options){
    this.setSpecialNodes(comp,helperNode,dynamicN,info,options);
    if(dynamicN._specialAttributeDetails && dynamicN._specialAttributeDetails.length){
        dynamicN._specialAttributeDetails.push(attr);
    }else{
        dynamicN._specialAttributeDetails = [attr];
    }
    // if(attr.stringValue){
        // dynamicN.removeAttribute(attr.name);
        // dynamicN.setAttribute(attr.hookName,attr.stringValue);
    // }
    if(yieldComp){
        yieldComp._transitionAppend.$push(dynamicN);
    }
    else if(comp._transitionAppend.indexOf(dynamicN)==-1 && dynamicN && dynamicN.getAttribute("is") != "component"){
        comp._transitionAppend.$push(dynamicN);
    }
}
_LC.directive.infoF = function(comp,info,dynamicN,helperNode,type,options){
    if(!info._igTs){
        if(type == "cM"){
            dynamicN._defaultSetSpecialNode = true;
        }
        this.setSpecialNodes(comp,helperNode, dynamicN, info, options); 
    }
}
_LC.directive.infoE = function(comp,helperNode,dynamicN,info,options){
    this.setSpecialNodes(comp,helperNode,dynamicN,info,options);
}
export default Directive;
//ignorei18n_end