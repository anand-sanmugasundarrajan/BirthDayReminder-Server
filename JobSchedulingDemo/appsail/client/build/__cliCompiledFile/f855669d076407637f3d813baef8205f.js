//ignorei18n_start
import {ComponentRegistry,_LC} from "@slyte/component";
import { Service } from "@slyte/core/src/service";
import { Lyte } from "@slyte/core";
import Compile from '../compiler/cli/lyte-base-compile.js';
_LC.getFastCompRegistry = function(obj){
    let registryMap = new WeakMap();
    var currentReg = _LC.getCurrentRegistryIns();
    if(currentReg){
        if(this.iterateRegistries([currentReg],obj,registryMap)){
            return;
        }
    }else{
        let defRegIns = _LC.getDefaultRegistryIns();
        if(defRegIns){
            this.iterateRegistries([defRegIns],obj,registryMap);    
        }else{
            let defaultReg = _LC.getDefaultRegistry();
            let defaultRegInsArr = defaultReg._instanceList;
            this.iterateRegistries(defaultRegInsArr,obj,registryMap);
        }
        
    }
}
function noop() {}
/*convert to custom class and register*/
class Turbo extends Service {
    static register(){
        ComponentRegistry.addFakeDirective(this,"turbo");
    }
    renderComponent(dynNode, preDefObj, self) {
    	var componentName = dynNode.componentName;
    	var staticAttrs = dynNode.staticAttrs;
        var constr = ComponentRegistry._registeredCommonClass[componentName];
        if(!constr) {
          return "";
        }
        if(!_LC.getDefaultRegistry()){
            Lyte.error("Component's Default Registry not registered!");
            return;
        }
        var obj = {compName : componentName, type: "component"};
        _LC.getFastCompRegistry(obj);
        if(!_LC.verifyDetails(obj)){
            Lyte.error(self.localName + " : Component Not found in any registry.");
            return
        }
        var lIns = obj.lIns ,compClass = obj.compClass ,regIns = obj.regIns;
        var component;
        lIns.scopedInstance(compClass,[],function(ins){
            component = preDefObj.component = ins
        },[regIns])
        component._registryClass = compClass._registryClass;
        component.$registry = component.$component = regIns;
    	component.data = {};
    	let data = compClass._data ? compClass._data.apply(component) : {};
    	var def = "default";
    	for(let key in data) {
            component.data[key] = data[key][def];
        }
        component.data.errors = {};
        component.__data = data;
        var obsAttrs = regIns.constructor._registeredComponentClass[componentName]._observedAttributes;
        preDefObj.data = preDefObj.data || {};
		for(var key in staticAttrs) {
			if(obsAttrs.indexOf(key) !== -1) {
				preDefObj.data[key] = staticAttrs[key];
			}
		}
		let initProperties = preDefObj.data;
        if(initProperties) {
            for(let key in initProperties) {
                let actVal;
                if(component.__data[key] && component.__data[key].type !== _LC.getDataType(initProperties[key]) && (initProperties[key] !== undefined  || component.__data[key].type === "boolean")) {
                    actVal = _LC.typeCast(initProperties[key], component.__data[key].type);
                } else {
                     actVal = initProperties[key];
                }
                let error = _LC.handleValidation(component.data, key, actVal, component);
                if(!error) {
                    component.data[key] = actVal;    
                }
                
            }
        }
        if(true) {
            component._methods = {};
			for(var key in compClass._methods) {
			    component._methods[key] = compClass._methods[key];
            }
            component.$node = {"querySelector" : noop, "localName" : componentName};
        	if(component.init) {
            	component.init.apply(component);
            }
            let initCallbacks;
            if(compClass._callBacks && (initCallbacks = compClass._callBacks.init)) {
			    for(let i=0;i<initCallbacks.length;i++) {
			        initCallbacks[i].value.apply(component);
			    }
			}
            preDefObj.unbound = true;
            delete component.$node.querySelector;
        	return this.renderFast(compClass._dynamicNodes, compClass._sta, component, preDefObj, self);
        }
		return "";
    }
    renderFast(dynamicNodes, arr, comp, compPreDef, self) {
        if(!arr){
            Lyte.error(comp.$node.localName+" component not supporting fast render. please add @turbo-supported in the component's template tag.");
            return "";
        }
        var fastRenderIndex;
        var prevComp;
        if(comp) {
            prevComp = self.component;
            self.component = comp;
        }
        var compData = self.component.data;
        var str = "";
        var dynamicCompile = arr;
        var dynamicCompileNodes = arr.cc;
        let removeFirstChar = false;
        for(var i=0;i<dynamicCompileNodes.length;i++) {
            let app = self.component.getAppOrAddon();
            if(dynamicCompileNodes[i] != undefined) {
                var inte = dynamicCompileNodes[i];
                var dynNode = dynamicNodes[inte];
                if(dynNode.dynamicValue) {
                    let locVal = _LC.getDD(compData, dynNode.newDynamicValue);
                    locVal = (locVal == undefined || locVal == null) ? "" : locVal; 
                    // str = str + ZSEC.Encoder.encodeForHTML(locVal);
                    str = str + app.Security.escape(locVal);
                } else if(dynNode.helperInfo) {
                    _LC.ffr = true;
                      let helperVal = self.processHelper(self, {name : dynNode.helperInfo.name, args : self.processArgs(self,dynNode, [], undefined, undefined, true)}, undefined);
                    _LC.ffr = false;
                     helperVal = (helperVal == undefined || helperVal == null) ? "" : helperVal;
                    //  str = str + ( (dynNode.helperInfo.name === "unescape") ? helperVal : ZSEC.Encoder.encodeForHTML(helperVal) );
                    str = str + ((dynNode.helperInfo.name === "unescape") ? helperVal : app.Security.escape(helperVal));
                } else if(dynNode.t){
                    switch(dynNode.t) {
                        case "f" : {
                            let prevDynamic = dynamicNodes[inte-1].a.items;
                            var items;
                            if(prevDynamic.dynamicValue) {      
                                items = _LC.getDD(compData, prevDynamic.newDynamicValue);
                            } else if(prevDynamic.helperInfo) {
                                items = self.processHelper(self, {name : prevDynamic.helperInfo.name, args : self.processArgs(self,prevDynamic, [], undefined, undefined, true)}, undefined);
                            }
                            var itemKey = dynNode._args.item || "item";
                            var indexKey = dynNode._args.index || "index";
                            let renderedStr = "";
                            if(items && items.length) {
                                var initialItemValue = compData[itemKey];
                                var initialIndexValue = compData[indexKey];
                                for(var indexInd=0;indexInd<items.length;indexInd++) {
                                    let item = items[indexInd];
                                    compData[itemKey] = item;
                                    compData[indexKey] = indexInd;
                                    renderedStr += this.renderFast(dynNode.dN, dynNode._sta, undefined, compPreDef, self);
                                }
                                compData[itemKey] = initialItemValue;
                                compData[indexKey] = initialIndexValue;
                            }
                            str += renderedStr;
                        }
                        break;
                        case "fI" : {
                            let prevDynamic = dynamicNodes[inte-1].a.object;
                            var object;
                            if(prevDynamic.dynamicValue) {
                                object = _LC.getDD(compData, prevDynamic.newDynamicValue);
                            } else if(prevDynamic.helperInfo) {
                                object = self.processHelper(self, {name : prevDynamic.helperInfo.name, args : self.processArgs(self,prevDynamic, [], undefined, undefined, true)}, undefined);
                            }
                            var valueKey = dynNode._args.value || "value";
                            var keyKey = dynNode._args.key || "key";
                            let renderedStr = "";
                            let objKeys;
                            if(object && (objKeys = Object.keys(object))) {
                                var initialValueValue = compData[valueKey];
                                var initialKeyValue = compData[keyKey];
                                for(var keyIndex=0;keyIndex < objKeys.length;keyIndex++) {
                                    let key = objKeys[keyIndex];
                                    compData[valueKey] = object[key];
                                    compData[keyKey] = key;
                                    renderedStr += this.renderFast(dynNode.dN, dynNode._sta, undefined, compPreDef, self);
                                }
                                compData[itemKey] = initialValueValue;
                                compData[indexKey] = initialKeyValue;
                            }
                            str += renderedStr;
                        }
                        break;
                        case "e" : 
                        case "s" : {
                            var value;
                            if((dynNode.t == "s" || dynNode.t == "e") && !dynNode.hd){
                                let prevDynamic = dynamicNodes[inte-1].a.value;
                                if(prevDynamic.dynamicValue) {
                                    value = _LC.getDD(compData, prevDynamic.newDynamicValue);
                                } else if(prevDynamic.helperInfo) {
                                    value = self.processHelper(self, {name : prevDynamic.helperInfo.name, args : self.processArgs(self,prevDynamic, [], undefined, undefined, true)}, undefined);
                                }
                            }
                            var currentCaseName;
                            if(value) {
                                currentCaseName = dynNode.t === "e" ? "true" : value.toString();
                            } else {
                                if(dynNode.t=== "e")  {
                                    currentCaseName = "false";
                                } else {
                                    switch(value) {
                                    case undefined : 
                                        currentCaseName = "undefined";
                                        break;
                                    case null : 
                                        currentCaseName = "null";
                                        break;
                                    case false: 
                                        currentCaseName = "false";
                                        break;
                                    case "": 
                                        currentCaseName = '""';
                                        break;
                                    }
                                }
                            }
                            let scope;
                            if(dynNode.hd){
                                var casesList = dynNode.co;
                                var indexStart = 0;
                                for(var j=indexStart; j<casesList.length; j++){
                                    var caseName = casesList[j];
                                    if(dynNode.c[caseName].dcn){
                                        let prevDynamic = dynNode.c[caseName].cdp.a.case;
                                        if(prevDynamic.dynamicValue) {
                                            value = _LC.getDD(compData, prevDynamic.newDynamicValue);
                                        } else if(prevDynamic.helperInfo) {
                                            value = self.processHelper(self, {name : prevDynamic.helperInfo.name, args : self.processArgs(self,prevDynamic, [], undefined, undefined, true)}, undefined);
                                        }
                                        if(value){
                                            scope  = dynNode.c[caseName];
                                            break;
                                        }
                                    }
                                }
                            }
                            else{
                                scope = dynNode.c[currentCaseName];
                            }
                            if(!scope) {
                                if((scope = dynNode.d) && scope._sta) {
                                    str += this.renderFast(scope.dN, scope._sta, undefined, compPreDef, self);
                                }
                            } else {
                                while(scope) {
                                    str += this.renderFast(scope.dN, scope._sta, undefined, compPreDef, self);
                                    if(scope.additional) {
                                        if(scope.additional.next) {
                                            scope = dynNode.c[scope.additional.next];
                                        } else {
                                            scope = dynNode.d;
                                        }
                                        
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                        break;
                        case "a" : {
                            let nextDynamic;
                            let fastRenderProp;
                            let dynLength = dynamicNodes.length;
                            for(let k=inte+1;k<dynLength;k++) {
                                let locDyn = dynamicNodes[k];
                                if(locDyn.t !== "r" && locDyn.t !== "cD" && locDyn.t !== "i" && locDyn.t !== "cM") {
                                    break;
                                } else {
                                    if(dynamicNodes[k].t === "cD" || dynamicNodes[k].t === "i" || dynamicNodes[k].t === "cM") {
                                        if(dynamicNodes[k].p.toString() == dynamicNodes[inte].p.toString()) {
                                            if(dynamicNodes[k].t == "cD") {
                                                if(ComponentRegistry._registeredCommonClass[dynamicNodes[k].componentName]) {
                                                    nextDynamic = dynamicNodes[k];
                                                    break;
                                                }
                                            } else {
                                                nextDynamic = dynamicNodes[k];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            let setAttr;
                            if(nextDynamic) {
                                setAttr = nextDynamic.t !== "cM";
                                fastRenderIndex = _LC.fRC++;
                                fastRenderProp = _LC.fRP[fastRenderIndex] = {"data" : {}};
                            }
                            if(!nextDynamic || nextDynamic.t !== "cM") {
                                str = str.substring(0, str.length - 11);
                            }
                            let attr = dynNode.a;
                            let actionObj = {};
                            for(let key in attr) {
                                if(attr[key].dynamicValue) {
                                    // let nodeValue = this.get(attr[key].dynamicValue);
                                    let nodeValue = attr[key].newDynamicValue ? _LC.getDD(compData, attr[key].newDynamicValue) : self.get(attr[key].dynamicValue);
                                    
                                    if(fastRenderProp) {
                                        fastRenderProp.data[attr[key].camelCase] = nodeValue;
                                        if(typeof nodeValue == "string" && setAttr) {
                                            nodeValue = this.formatValue(key, nodeValue, self);
                                            str = str + nodeValue + " ";
                                        }
                                    } else {
                                        nodeValue = this.formatValue(key, nodeValue, self);
                                        str = str + nodeValue + " ";
                                    }
                                } else if(attr[key].helperInfo) {
                                    if(attr[key].helperInfo.name === "action") {
                                        let actionName = attr[key].helperInfo.args[0];
                                        let boundName;
                                        if(actionName.startsWith('"') || actionName.startsWith("'")) {
                                            boundName = actionName.substring(1, actionName.length - 1);
                                        } else {
                                            Lyte.warn("Deprecation warning. Action name " + actionName + " must be in quotes");
                                            boundName = actionName;
                                        }
                                        let actArgs = self.processArgs(self, attr[key], [], "__lyteEvent__", "__lyteNode__");
                                        let actualAttrName = attr[key].globalEvent ? attr[key].name : (attr[key].name.indexOf("-") !== -1)? attr[key].name : attr[key].name.substr(2);
                                        actionObj[actualAttrName] = {"name" : boundName, "args" : attr[key].helperInfo.args, "actArgs" : actArgs, "globalEvent" : attr[key].globalEvent ? true : false, "skipArgProcessing" : true};
                                    }  else if (attr[key].helperInfo.name === "method") {
                                        var methodsObj = compPreDef ? compPreDef._methods : self.component._methods; 
                                        if(fastRenderProp) {
                                            let methods = fastRenderProp._methods = fastRenderProp._methods || {};
                                            let parentComp = compPreDef ? compPreDef.component : self.component;
                                            let actArgs = self.processArgs(self, attr[key], [], "__lyteEvent__", "__lyteNode__");
                                            var methodFunc = function() { //eslint-disable-line no-loop-func
                                                let node = self.$node;
                                                let args = actArgs.slice(1);
                                                let functionName = actArgs[0];
                                                let customArgs = Array.from(arguments);
                                                let mainArgs = args.$concat(customArgs);
                                                return parentComp._methods[functionName].apply(parentComp, mainArgs);
                                            }
                                            methods[attr[key].camelCase] = methodFunc;
                                        }
                                    } else {
                                        let nodeValue = self.processHelper(self, {name : attr[key].helperInfo.name, args : self.processArgs(self,attr[key], [], undefined, undefined, true)}, undefined);
                                        if(fastRenderProp) {
                                            fastRenderProp.data[attr[key].camelCase] = nodeValue;
                                            if(typeof nodeValue == "string" && setAttr) {
                                                nodeValue = this.formatValue(key, nodeValue, self);
                                                str = str + nodeValue + " ";
                                            }
                                        } else {
                                            nodeValue = this.formatValue(key , nodeValue, self);
                                            str = str + nodeValue + " ";                                        
                                        }
                                    }
                                }
                            }
                            if(Object.keys(actionObj).length) {
                                let locIndex = _LC.fRC++;
                                str = str + "lyteaction=" + locIndex + " ";
                                _LC.fRP[locIndex] = actionObj;
                                actionObj.componentName = self.component.$node.localName || "undefined";
                                //str = str + "lyteaction=" + ZSEC.Encoder.encodeForHTMLAttribute(JSON.stringify(actionObj)) + " ";
                            }
                            if(fastRenderProp && nextDynamic.t !== "cM" && nextDynamic.t !== "i") {
                                str = str + "_lyteprop=" + fastRenderIndex + " ";
                            }
                            if(!dynNode.attrHandling) {
                                dynamicCompile[i+1] = dynamicCompile[i+1].substr(1);
                                dynNode.attrHandling = true;
                            }
                        }
                        break;
                        case "i" : {
                            let preDefObj = fastRenderIndex !== undefined ? _LC.fRP[fastRenderIndex] : undefined;
                            if(preDefObj) {
                                delete _LC.fRP[fastRenderIndex];
                                // _LC.$pushFrc(fastRenderIndex);
                            }
                            fastRenderIndex = undefined;
                            let yieldObj;
                            let yieldName = dynNode.yieldName || preDefObj.data.yieldName;
                            if(preDefObj) {
                                delete preDefObj.data.yieldName;
                            }
                            let yieldCallee;
                            if(!compPreDef || !compPreDef.yields) {
                                yieldObj = self._yields[yieldName];
                                if(yieldObj) {
                                    yieldCallee = yieldObj._callee;
                                } else {
                                    break;
                                }
                            } else {
                                yieldObj = compPreDef.yields[yieldName];
                                yieldCallee = compPreDef._yieldCallee;
                            }
                            if(yieldObj) {
                                let parentScope;
                                let locComp;
                                if(yieldCallee instanceof HTMLElement) {
                                    parentScope = yieldCallee;
                                } else {
                                    parentScope = self;
                                    locComp = self.component;
                                    self.component = yieldCallee.component;
                                }
                                let contextSwitch = {};
                                let contextSwitchArray = [];
                                if(yieldObj._cx) {
                                    _LC.adCx(yieldObj, contextSwitchArray);
                                }
                                if(preDefObj) {
                                    for(var key in preDefObj.data) {
                                        contextSwitch[key] = parentScope.component.data[key];
                                        parentScope.component.data[key] = preDefObj.data[key];
                                    }
                                }
                                var componentScope = parentScope.component;
                                if(prevComp && prevComp.$node == yieldCallee) {
                                    componentScope = prevComp
                                }
                                // if(componentScope == self.component) {
                                //     componentScope = prevComp;
                                // }
                                str = str + this.renderFast(yieldObj.dN || yieldObj._dynamicNodes, yieldObj._sta, componentScope, yieldCallee, parentScope);
                                for(let key in contextSwitch) {
                                    parentScope.component.data[key] = contextSwitch[key];
                                }
                                if(yieldObj._cx) {
                                    _LC.rmCx(yieldObj, contextSwitchArray); 
                                }
                                if(locComp) {
                                    parentScope.component = locComp;
                                }
                            }
                            //str = str + self.renderComponent(dynNode, preDefObj, compData);
                        }
                        break;
                        case "cM" : {
                            if(fastRenderIndex !== undefined) {
                                let preDefObj = _LC.fRP[fastRenderIndex];
                                let componentName = preDefObj.data.componentName;
                                if(componentName) {
                                    if(ComponentRegistry._registeredCommonClass[componentName]) {
                                        str = str + "<" + componentName + " _lyteprop="+ fastRenderIndex+">";
                                        fastRenderIndex = undefined;
                                        str = str + this.renderComponent({"componentName" : componentName}, preDefObj, self);
                                        str = str + "</" + componentName + ">";
                                    } else {
                                        str = str + "component not registered";
                                        // Handle case where component has not been registered yet. 
                                    }   
                                }
                            }
                        }
                        break;
                        case "cD" : {
                            let preDefObj = fastRenderIndex !== undefined ? _LC.fRP[fastRenderIndex] : {};
                            fastRenderIndex = undefined;
                            str = str + this.renderComponent(dynNode, preDefObj, self);
                        }
                        break;
                        case "r" : {    
                            let preDefObj;
                            if(fastRenderIndex !== undefined) {
                                preDefObj = _LC.fRP[fastRenderIndex];
                            } else {
                                fastRenderIndex = _LC.fRC++;
                                preDefObj = _LC.fRP[fastRenderIndex] = {};
                            }
                            preDefObj.yields = preDefObj.yields || {};
                            preDefObj.yields[dynNode._args["yield-name"]] = dynNode;
                            if(!preDefObj._yieldCallee) {
                                preDefObj._yieldCallee = compPreDef ? compPreDef : {"component" : self.component};
                            }
                        }
                    }
                } else {
                    str = str + dynamicCompile[i];
                }
            } else {
                str = str + dynamicCompile[i];
            }
        }
        if(comp) {
            self.component = prevComp;
        }
        return str;
    }
    formatValue(key, nodeValue, self) {
        let type = typeof nodeValue;
        let app = self.component.getAppOrAddon();
        if(nodeValue === "") {
            type = "undefined";
        }
        let retVal;
        let isSpecialAttr = (key == "src") || (key == "href");
        switch(type) {
        case "boolean" : 
            return nodeValue ? key : "";
        case "object" : 
            retVal = ((typeof Record != "undefined" && nodeValue instanceof Record) ? JSON.stringify(nodeValue.$.toJSON()) : JSON.stringify(nodeValue));
            // return key + "=" + (isSpecialAttr ? retVal : ZSEC.Encoder.encodeForHTMLAttribute(retVal));
            return key + "=\"" + (isSpecialAttr ? retVal : app.Security.escape(retVal)) + "\"";
        case "undefined" : 
            return key
        default : 
            {
                // return key + "=" + (isSpecialAttr ? nodeValue : ZSEC.Encoder.encodeForHTMLAttribute(nodeValue) );
                return key + "=\"" + (isSpecialAttr ? nodeValue : app.Security.escape(nodeValue) ) + "\"";
            }
        }
    }
    static caseTx(dynNewCompile,mustache,info,j){
        if(dynNewCompile) {
            var newActObj;
            if(mustache){
                newActObj = Compile.getArray(mustache);  
                if(!newActObj && mustache){
                    newActObj = Compile.getHelper(mustache,true);  
                }
                info.newHelperInfo = newActObj;
                _LC.replaceWithPf(dynNewCompile, document.createTextNode("__**--Lyte"+j+"__**"));
            }   
        }
    }
    static caseI(dynNewCompile, info, j){
        // if(dynNewCompile) {
            dynNewCompile.appendChild(document.createTextNode("__**--Lyte"+j+"__**"));
            let yieldAttr = dynNewCompile.attributes["yield-name"];
            info.yieldName = yieldAttr ? yieldAttr.nodeValue : undefined;
        // }
    }
    static caseCD(dynNewCompile, info, j){
        // if(dynNewCompile) {
            dynNewCompile.appendChild(document.createTextNode("__**--Lyte"+j+"__**"));
            info.componentName = dynNewCompile.localName;
            var attrs = Array.from(dynNewCompile.attributes);
            info.staticAttrs = {};
            for(var i=0;i<attrs.length;i++) {
                info.staticAttrs[_LC.String.toCamelCase(attrs[i].nodeName)] = attrs[i].nodeValue;
            }
            delete info.staticAttrs._lyteprop;
        // }
    }
    static setAttribute(node,componentName,actString){
        // dynNewCompile.setAttribute(node.attributes[i].name.substr(2),componentName+" => "+ actString);
        _LC.setAttribute(node, componentName, actString);

    }
    static removeAttributeObj(dynNewCompile, attr, j){
        // if(dynNewCompile) {
            for(let key in attr) {
                dynNewCompile.removeAttribute(key);
            }
            dynNewCompile.setAttribute("_lyteAttr" , "__**--Lyte" + j + "__**", "");
        // }
    }
    static removeAttribute(node, name, value){
        node.removeAttribute(name, value);
    }
    static removeAttributeArr(dynNewCompile, toBeRemoved){
        if(toBeRemoved.length){
            for(let i=0; i<toBeRemoved.length;i++){
                dynNewCompile.removeAttribute(toBeRemoved[i]);
                // if(dynNewCompile) {
                //     dynNewCompile.removeAttribute(toBeRemoved[i]);
                // }
            }
        }
    }
    static getDynNewCompile(newCompile,pos){
        return _LC.getDynamicNode(newCompile,pos);
    }
    static replaceWithPf(dynNewCompile,j){
        return _LC.replaceWithPf(dynNewCompile, document.createTextNode("__**--Lyte"+j+"__**"));
    }
    static cMBefore(dynN, info){
        let dynNewCompile;
        // if(!dynNewCompile && (type == "r" || dynN.hasAttribute("unbound"))) { //af check
            if(Lyte._ms) {
                dynNewCompile = document.createElement("div");
                dynNewCompile.innerHTML = info.actualTemplate ? info.actualTemplate : dynN.outerHTML;
                dynNewCompile = dynNewCompile.childNodes[0];
                constr.splitTextNodes(dynNewCompile);
            } else {
                dynNewCompile = dynN.cloneNode(true);
            }
        // }

        let depthTemp;
        let dnNode;
        var actualTemplateNewCompile = dynNewCompile ? (Lyte._ie ? dynNewCompile : dynNewCompile.content) : undefined;
        // if(info.actualTemplate) {
        //     if(dynNewCompile) {
        //         actualTemplateNewCompile = _LC.getContentForIE(info.actualTemplate, constr);
        //     }
        // }
        return dynNewCompile//{dynNewCompile : dynNewCompile, actualTemplateNewCompile : actualTemplateNewCompile}
    }
    static cMBefore2(dynNewCompile, info, constr){
        var actualTemplateNewCompile = dynNewCompile ? (Lyte._ie ? dynNewCompile : dynNewCompile.content) : undefined;
        if(info.actualTemplate) {
            return _LC.getContentForIE(info.actualTemplate, constr);
        }
        return actualTemplateNewCompile;
    }
    static cMAfter(actualTemplateNewCompile, info, type, j, dynNewCompile){
        if(actualTemplateNewCompile) {
            let staticTemp = info.actualTemplate ? actualTemplateNewCompile : dynNewCompile;
            info._sta = _LC.processStatic(staticTemp);                      
        }
        if(dynNewCompile) {
            info._args = {};
            if(type === "r") {
                //dynNewCompile.parentNode.parentNode.insertBefore(document.createTextNode("__**--Lyte"+j+"__**"), dynNewCompile.parentNode);
                //dynNewCompile.parentNode.setAttribute("_lyteyield", "");
                //_LC.replaceWithPf(dynNewCompile, document.createTextNode(""));
                _LC.replaceWithPf(dynNewCompile, document.createTextNode("__**--Lyte"+j+"__**"));
            } else if(type === "cM") {
                _LC.replaceWithPf(dynNewCompile, document.createTextNode((dynNewCompile.hasAttribute("_lyteattr") ? dynNewCompile.getAttribute("_lyteattr"): "" )+ "__**--Lyte"+j+"__**"));
            } else {
                //dynNewCompile.replaceWith(document.createTextNode("__**--Lyte"+j+"__**"))
                _LC.replaceWithPf(dynNewCompile, document.createTextNode("__**--Lyte"+j+"__**"));
            }
            Array.from(dynNewCompile.attributes).forEach(function(item) { //eslint-disable-line no-loop-func
                info._args[item.nodeName] = item.nodeValue;
            });
        }
    }
    static caseES(dynNewCompile, info, constr){
        var actualTemplateNewCompile = dynNewCompile ? (Lyte._ie ? dynNewCompile : dynNewCompile.content) : undefined;
        if(info.actualTemplate) {
            // dynN = _LC.getContentForIE(info.actualTemplate, constr, undefined);
            if(dynNewCompile) {
                let dummy = _LC.getContentForIE(info.actualTemplate, constr);
                actualTemplateNewCompile = Lyte._ie ? dummy : dummy.content;
            }
        }
        return actualTemplateNewCompile;
    }
    static getNewCompile(componentClass){
        let newCompile;
        if(Lyte._ie) {
            newCompile = document.createElement("div");
            newCompile.innerHTML = componentClass._template.outerHTML;
            newCompile = newCompile.childNodes[0];
        } else {
            newCompile = componentClass._template.cloneNode(true);
        }
        return newCompile;
    }
}
Turbo.__lMod = "Turbo";
Turbo.register();
export default Turbo;
//ignorei18n_end