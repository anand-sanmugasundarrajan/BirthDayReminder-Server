// import expHandlers from "../expHandlers.js";
// import * as Espree from "espree";
import BaseCompiler from "../cli/lyte-base-compile.js";
import ClientCompilerInternal from "../cli/lyte-client-compile.js";
import { _LC } from "../../lyte-component.js";
/**
     *  @param1 actualComponent - Actual component where we are gonna render the dynamicTemplate.
     *  @param2 templateToRender - clonedNode / String (Which will be converted to DOM) - that needs to be rendered. 
     *  @returnVal rendered dom
*/
ClientCompilerInternal.compileDynamicTemplate = function(actualComponent, templateToRender) {
    if (!actualComponent || !actualComponent.hasAttribute("lyte-rendered")) {
        console.error("Provided element is not a component / not rendered yet")
        return;
    }
    if (!templateToRender) {
        console.error("No template is provided for appending")
        return;
    }
    if (typeof templateToRender === "string") {
        var temp = document.createElement("div");
        temp.innerHTML = templateToRender;
        templateToRender = temp.childNodes[0];
    }
    var templateToRenderAct = document.createElement("template");
    //templateToRenderAct.content.appendChild(templateToRender);
    // if (Lyte._ie) {
    //     templateToRenderAct.appendChild(templateToRender);
    // } else {
        templateToRenderAct.content.appendChild(templateToRender);
    // }
    var dynamicNodes = this.getDynamicNodes(actualComponent.tagName, undefined, templateToRenderAct);
    _LC.doCompile(templateToRenderAct.content, dynamicNodes.dynamicNodes, actualComponent.localName, actualComponent.constructor, undefined, actualComponent.component.constructor);
    var returnVal = actualComponent.renderNodes(templateToRenderAct, dynamicNodes.dynamicNodes, undefined, {}, true, {}, templateToRenderAct.outerHTML)
    return returnVal;

}
ClientCompilerInternal.compileTemplate = function(templateToRender){
    if (typeof templateToRender === "string") {
        var temp = document.createElement("div");
        temp.innerHTML = templateToRender.trim();
        templateToRender = temp.childNodes[0];
    }
    var tagName = templateToRender.getAttribute("tag-name");
    var dynamicNodes = this.getDynamicNodes(tagName, undefined, templateToRender);  
    return {
        _template : templateToRender.outerHTML,
        _dynamicNodes : dynamicNodes.dynamicNodes
    }
}
/**
 * @param1 func - function to execute without losing bindings
 * @param2 scope - scope with which the function must be executed 
 */
ClientCompilerInternal.doDomProcessing = function(func, scope) {
    _LC.ignoreDisconnect = true;
    if (scope) {
        func.call(scope);
    } else {
        func();
    }
    _LC.ignoreDisconnect = false;
}

ClientCompilerInternal.getComponentTemplate = function (componentName, registryName) {
    let dummyLyteComponentsDiv = _LC.getComponentsDiv(_LC.dummyLyteComponentsDiv, registryName);
    var temp = dummyLyteComponentsDiv.querySelector("template[tag-name=" + componentName + "]");
    if (temp) {
        if (temp.content) {
            return temp.content;
        } else {
            var div = document.createElement("div")
            div.innerHTML = temp.outerHTML;
            return div.querySelector("template");
        }
    } else {
        console.error("No such component is registered");
        return;
    }
}
ClientCompilerInternal.modifyTemplate = function(componentName,template,compClass){
    // this.constructor._registeredCommonClass['client-comp1'].activeInstances
    debugger
    var registryClass = compClass._registryClass;
    if(registryClass._reRegisteredComponents.indexOf(componentName) == -1){
        registryClass._reRegisteredComponents.push(componentName);
    }
    if(registryClass._registeredCommonClass[componentName]) {
        // var comp = registryClass._registeredCommonClass[componentName];
        var compClassDef = compClass; //this._registeredComponents[componentName];
        if(compClassDef.activeInstances > 0) {
            console.warn("There are active instances of the component " + componentName + " and hence cannot be unregistered");
        }
        else{
            if(this.getDynamicNodes) {
                var returnVal = this.getDynamicNodes(componentName, undefined, template);
                if(returnVal.errors){
                    console.error("Error in the component",returnVal.componentName,returnVal.errors);
                    return false;
                }else{  
                    // var docTemplate = _LC.lyteComponentsDiv.querySelector("template[tag-name="+componentName+ "]")//check
                    var lyteComponentsDiv = _LC.getComponentsDiv(_LC.lyteComponentsDiv, registryClass.name);
                    var docTemplate = lyteComponentsDiv.querySelector("template[tag-name="+componentName+ "]");
                    if(docTemplate) {
                        // var docTemplateCopy = Array.from(_LC.lyteComponentsDiv.querySelectorAll("template[tag-name="+componentName+ "]"));
                        var docTemplateCopy = Array.from(
                            lyteComponentsDiv.querySelectorAll("template[tag-name="+componentName+ "]")
                        );
                        // Array.from(document.querySelectorAll("template[tag-name="+componentName+ "]")).forEach(el => el.remove());	
                        docTemplateCopy.forEach(function(el){
                            el.remove()
                        });
                    }
                    if(compClassDef._depthTemp) {
                        compClassDef._depthTemp.remove();    
                    }
                    compClassDef._depthTemp = document.createElement("template");
                    // compClassDef.originalDef._template =returnVal.template;
                    // compClassDef.originalDef._dynamicNodes = returnVal.dynamicNodes;
                    // compClassDef.originalDef._templateAttributes = returnVal._templateAttributes;
                    compClassDef._template = returnVal.template;
                    compClassDef._dynamicNodes = returnVal.dynamicNodes;
                    compClassDef._templateAttributes = returnVal._templateAttributes;
                    // debugger;
                    compClassDef._registered = false;
                    registryClass.registerComponent(componentName,compClassDef)//,compClassDef.originalOpt,compClassDef,this
                }
            }
        }
    }
    else{
    console.warn(componentName , "is not registered");
    }
}
_LC.core._constructor._registerComponent = function(a,b,c,d,e){
    if(d._reRegisteredComponents.indexOf(a) != -1){
        c._template = JSON.parse(c._template);
    }
    _LC.core._registerComponent.call(this,a,b,c,d,e);
}
_LC.registerComponent = function(componentName, componentClass ,registryInstance){
    let registry = componentClass._registryClass;
    _LC.core.registerComponent.call(this,componentName, componentClass, registryInstance);
    if(registry._reRegisteredComponents.indexOf(componentName) != -1){
        registry._reRegisteredComponents.splice(registry._reRegisteredComponents.indexOf(componentName),1);
    }
}
// var ClientCompilerAdvanced = function(){
//     var args = Array.from(arguments);
//     args.$push(expHandlers,Espree)
//     ClientCompiler.apply(this,args);
// }
// debugger
var ClientCompiler = Object.assign(BaseCompiler, ClientCompilerInternal);
// debugger
// try {
//     module.exports = ClientCompiler;
// }
// catch{
    
// }
export { ClientCompiler }