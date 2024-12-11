// debugger
import { establishObjectBinding, isEntity, validateData, establishObserverBindings, cmpData, removeNestScp, nestScp, bindObj, deepCopyObject, checkNestedProp, prop , checkWatchPath,establishWatchScope} from "@slyte/core/src/lyte-utils";
import { Lyte, LyteAddon } from "@slyte/core";
import { Jwalk } from "@slyte/core/src/JsonPath.js"
import Compile from './compiler/cli/lyte-base-compile.js';
import './ZohoSecurity/lyte-component-security.js'; //slicer af
import { ValidationError } from "@slyte/data/src/dberror.js"; //slicer store
import { Service } from "@slyte/core/src/service";
import { deepValueChange, setData } from "@slyte/data/src/utils";
import { Utils } from "@slyte/core/src/Utils.js";
//@Slicer.developmentStart
import { ComponentError, ApiError, RegistryError } from "./utils/lyte-errors.js";
//@Slicer.developmentEnd
if(!window.__lyteConfig){
    window.__lyteConfig = {
        _definedBeforeBridging : [],
        _alreadyDefinedBeforeBridging : [],
        v4 : true
    }
}
window.__lyteConfig.v4 = true;
let ltCf = window.__lyteConfig;
if(!ltCf.customElementsDefine){
    ltCf.customElementsDefine = customElements.constructor.prototype.define; 
    Object.defineProperty(customElements.constructor.prototype,"define",{
        value : function(name, compClass, options, _lyteOptions){
            if(customElements.get(name)){
                ltCf._alreadyDefinedBeforeBridging.push({name : name, compClass : compClass, options : options, _lyteOptions : _lyteOptions, scope : this});
            }else{
                ltCf._definedBeforeBridging.push({name : name, compClass : compClass, options : options ,_lyteOptions : _lyteOptions, scope : this});
                ltCf.customElementsDefine.apply(this,arguments);
            }
        },
        enumerable: false
    })
}
/*convert to custom class*/
class ComponentRegistry extends Service {
    isComponentRegistry(){
        return true;
    }
    getDirectiveObj(){
        if(this._directive){
            return this._directive;
        }
        return false;
    }
    static getFastObj(){
        return this.turbo ? this.turbo : false;
    }
    constructor(opt){
        super(opt);
        var registryClass = this.constructor;
        if(!registryClass._registered){
            //@Slicer.developmentStart
            RegistryError.error("LC001", registryClass.name);
            //@Slicer.developmentEnd
            return;
        }
        // //@Slicer.afzalStart
        // console.log("aaffff")
        // //@Slicer.$afzalEnd
        /* registering component in app module - for router */
        let app = _LC.getNearestParentApp(this);
        app.$.modules.triggerEvent("add", "component", this);
        if(_LC.getDefaultRegistry() == registryClass){
            //set default registry instance and it can be overrided with app's getRegistryInstance.
            _LC.setDefaultRegistryIns(this)
        }
        registryClass._instanciated = true;
        this.registeredComponents = {};
        this.registeredCeComponents = {}
        this._registeredComponents = {};
        this._registeredCeComponents = {};
        this._defaultDirectives = [];
        this.registeredDirectives = [];
        this._registeredDirectivesClass = {};
        ComponentRegistry.registerAllComponent(registryClass._registeredComponentClass,this);
        ComponentRegistry.registerAllCeComponent(registryClass._registeredCeComponentClass,this);
        registryClass._instanceList.push(this);
        _LC.setAddedRegistries(this,registryClass.name);
        this.render = _LC.render;     
        // this.renderHTML = _LC.renderHTML;
        this.set = _LC.set;
        this.get = _LC.get;
        let currentAppOrAddon = _LC.getAppOrAddon(this);
        this.setDefaultDirectives(currentAppOrAddon);
        _LC.updateDomApis(this);
        this.replaceWith = _LC.replaceWith;
        this.throwEvent = _LC.throwEvent;
        this.chI = _LC.chI;
        this.chromeBugFix = _LC.chromeBugFix;
        this.lyteComponentsDiv = _LC.lyteComponentsDiv;
        this.String = _LC.String;
        this.addAction = _LC.addAction;
        this.getLyteComponentsDiv = function(){
            return _LC.getComponentsDiv(_LC.lyteComponentsDiv,registryClass.name);
        }
        this._getLyteComponent = function(){
            return _LC;
        }
    }
    setDefaultDirectives(app){ 
        let defaultDirectives = ["directive","shadow","shadow-style","shadow-supported","turbo","turbo-supported","unbound","view"];
        let self = this;
        defaultDirectives.forEach(function(item){
            let directiveIns;
            if(self.constructor[item]){
                app.scopedInstance(self.constructor[item],[self],function(ins){
                    directiveIns = ins;
                },[])
                self["_"+item] = directiveIns;
            }
            self._defaultDirectives.push(item);
        })
    }
    static register(options){
        if(options){
            if(options.app == true){
                _LC.setDefaultRegistry(this);
            }
            if(options.hash){
                this._hash = options.hash;
            }
            if(options.refHash){
                this._refHash = options.refHash;
            }
        }
        this._registeredComponentClass = Object.assign({},ComponentRegistry._defaultComponents);
        this._registeredCeComponentClass = Object.assign({},ComponentRegistry._defaultCeComponents);
        this._registered = true;
        this.prototype.registeredHelpers = Object.assign({},ComponentRegistry._defaultHelpers,this._beforeRegisteredHelpers ? this._beforeRegisteredHelpers : {});
        this.registeredHelpers = this.prototype.registeredHelpers;
        this.appendChild = _LC.appendChild;//because of ui comps
        this.insertAfter = _LC.insertAfter;
        this.insertBefore = _LC.insertBefore;
        this.replaceWith = _LC.replaceWith;
        this.shouldIgnoreDisconnect = _LC.shouldIgnoreDisconnect;
        this._beforeRegisteredHelpers = {};
        this._instanceList = [];
        var registryClassDef = this;
        ComponentRegistry._registeredRegistries.push({
            name : registryClassDef.name,
            class : registryClassDef
        });
        if(Compile.needDummyComponentsDiv){
            _LC.setComponentsDiv(_LC.dummyLyteComponentsDiv,this.name);
        }
        _LC.setComponentsDiv(_LC.lyteComponentsDiv,this.name);
        if(registryClassDef.idePlugins){
            registryClassDef.idePlugins.forEach(function(plugin){
                plugin(_LC)
            })
        }
        if(this.arrayOverride){
            _LC.arrayOverride();
        }
        let lazyDir = this._lazyRegisterDirectives;
        if(lazyDir){
            for(let key in lazyDir){
                this[key] = lazyDir[key];
                _LC.updateDirectivesInReg(ComponentRegistry, lazyDir[key], key);
            }
        }
        // if(registryClassDef.Compile.needDummyComponentsDiv){
        //     _LC.setComponentsDiv(_LC.dummyLyteComponentsDiv,this.name);
        // }
        /*convert to custom class*/
        this.Component = (function() {
            class newC extends ComponentRegistry._componentApis {
                constructor(){
                    super();
                }
                static register(compName){
                    compName = compName || _LC.String.dasherize(this.name);
                    this._registryClass = registryClassDef;
                    registryClassDef.registerComponent(compName, this);
                }
                static unregisterComponent(){
                    _LC.unregisterComponent.apply(this,arguments);
                }
            }
            newC.__lMod = "Component";
            newC._registryClass = registryClassDef;

            newC._render = function(){
                return _LC._render.apply(this,arguments);
            };

            return newC;
        })();
        this.registerDirective = function(name,directiveClass){
            var registry = this;
            if(registry._directivesList[name]){
                //@Slicer.developmentStart
                RegistryError.error("LC002", "Directive", name, registry.name);
                //@Slicer.developmentEnd
                return;
            }
            registry._directivesList[name] = directiveClass;
            directiveClass._registryClass = registry;
            if(registry._instanciated){
                registry._instanceList.forEach(function(ins){
                    directiveClass.actualRegistration(name,directiveClass,ins);
                })
            }
        }
        /*convert to custom class*/
        this.CustomElements = (function() {
            class newCE extends Service {
                constructor(){
                    super();
                }
                static register(compName){
                    compName = compName || _LC.String.dasherize(this.name);
                    this._registryClass = registryClassDef;
                    registryClassDef.registerCeComponent(compName, this, this.options);
                }
            }
            newCE._registryClass = registryClassDef;
            return newCE;
        })();
    }
    static registerCeComponent(name,CompClass, options){
        var registry = this;
        if(registry._registeredCeComponentClass[name]){
            //@Slicer.developmentStart
            RegistryError.error("LC002", "Raw Component", name, registry.name);
            //@Slicer.developmentEnd
            return;
        }
        CompClass.activeInstances = 0;
        registry._registeredCeComponentClass[name] = CompClass;//af move below
        CompClass._compName = name;
        CompClass._options = options;
        if(registry._instanciated){
            registry._instanceList.forEach(function(ins){
                registry.registerAllCeComponent({[name] : CompClass},ins);
            })
        }
    }
    static registerComponent(name,CompClass){
        var registry = this;
        if(registry._registeredComponentClass[name] && registry._reRegisteredComponents.indexOf(name) == -1){
            //@Slicer.developmentStart
            RegistryError.error("LC002", "Component", name, registry.name);
            //@Slicer.developmentEnd
            return;
        }
        CompClass.activeInstances = 0;
        registry._registeredComponentClass[name] = CompClass;//af move below
        CompClass._compName = name;
        if(registry._instanciated){
            registry._instanceList.forEach(function(ins){
                registry.registerAllComponent({[name] : CompClass},ins);
            })
        }
    }
    static unregisterComponent(){
        _LC.unregisterComponent.apply(this,arguments);
    }
    static registerHelper(name,helper){
        //@Slicer.developmentStart
        if(ComponentRegistry._defaultHelpers[name]){    
            console.warn("Deprecated : Default helpers of Lyte can't be overrided - " + name + "");
        }else if(this._registered && this.prototype.registeredHelpers[name] || this._beforeRegisteredHelpers && this._beforeRegisteredHelpers[name]){
            console.warn("Deprecated : Helper named - " + name + " is already registered");
        }
        //@Slicer.developmentEnd
        if(this._registered){
            this.prototype.registeredHelpers[name] = helper;
        }else if(this._beforeRegisteredHelpers){
            this._beforeRegisteredHelpers[name] = helper;
        }else{
            this._beforeRegisteredHelpers = {[name] : helper};
        }
    }
    static registerCustomPropHandler(){
        _LC.registerCustomPropHandler.apply(this,arguments);
    }
}
ComponentRegistry.__lMod = "ComponentRegistry";
ComponentRegistry._registeredRegistries = [];
ComponentRegistry._definedComponents = {};
ComponentRegistry._definedCeComponents = {};
ComponentRegistry._registeredCommonClass = {};
ComponentRegistry._registeredCommonCeClass = {};
ComponentRegistry.customPropHandlers = [];
ComponentRegistry.customPropRegex = "";
ComponentRegistry._defaultHelpers = {};
ComponentRegistry._defaultComponents = {};
ComponentRegistry._defaultCeComponents = {};
ComponentRegistry.globalComponents = ["lyte-event-listener","import-shadow-style"];
ComponentRegistry._unRegisteredComponents = [];
ComponentRegistry._reRegisteredComponents = [];
ComponentRegistry._directivesList = {};
ComponentRegistry._registeredDirectivesClass = {};
ComponentRegistry._lazyRegisterDirectives = {};
ComponentRegistry._preLoadedDirectives = {};

/*convert to custom class*/
ComponentRegistry._componentApis = (function() {
    class apis extends Service {
        constructor(){
            super();
            this.$ = {
                validate : function(){
                    return _LC.validate.apply(this, arguments);
                },
                _ins : this
            }
        }
        set(){
            return _LC.componentSet.apply(this, arguments);
        }
        get(){
            return _LC.componentGet.apply(this, arguments);
        }
        throwEvent(){
            return _LC.throwEvent.apply(this, arguments);
        }
        executeMethod(){
            return _LC.executeMethod.apply(this, arguments);
        }
        getData(){
            return _LC.componentGetData.apply(this, arguments);
        }
        setData(){
            return _LC.componentSetData.apply(this, arguments);
        }
        getMethods(){
            return _LC.componentGetMethods.apply(this, arguments);
        }
        setMethods(){
            return _LC.componentSetMethods.apply(this, arguments);
        }
        hasAction(){
            return _LC.componentHasAction.apply(this, arguments);
        }
        getActions(){
            return _LC.componentGetActions.apply(this, arguments);
        }
        getObservers(){
            return _LC.componentGetObservers.apply(this, arguments);
        }
        getApp(){
            return _LC.getApp.apply(this, arguments);
        }
        getAppOrAddon(){
            return _LC.getAppOrAddon.apply(this, arguments);
        }
    }
    return apis;
})();

ComponentRegistry.registerAllComponent = function(compClassList, registryInstance) {
    for(var compName in compClassList){
        let compClass = compClassList[compName];
        // if (registryInstance.constructor._reRegisteredComponents.indexOf(compName) == -1 && registryInstance.registeredComponents[compName]) {
        //     _Lyte.error("Component " + componentName + " already registered");
        //     return;
        // }
    if (registryInstance.constructor._definedComponents[compName] && registryInstance.constructor._reRegisteredComponents.indexOf(compName) == -1 && !registryInstance.constructor._unRegisteredComponents[compName]) {
            //same component class for same reigstry which has multiple registry instance
            registryInstance.registeredComponents[compName] = true;
            continue;
        }
        compClass._compName = compName;
        compClass._data = compClass.prototype.data;
        compClass._actions = compClass.actions();
        compClass._methods = compClass.methods();
        compClass.__observers = _LC.executeObservers(compClass);
        compClass.addRegistries = compClass.prototype.addRegistries;
        if(compClass._dynamicNodes && compClass._dynamicNodes.length && compClass._dynamicNodes[compClass._dynamicNodes.length-1].type == "dc"){
            compClass.dc = compClass._dynamicNodes.$pop();
        }
        compClass._callBacks = {};
        compClass._observers = [];
        _LC.updateCustomCrmComponent(compClass);
        compClass._observedMethodAttributes = compClass._observedMethodAttributes || {};
        _LC.registerComponent(compName, compClass,registryInstance);
        registryInstance.registeredComponents[compName] = true;
        registryInstance._registeredComponents[compName] = compClass;
    }
};

ComponentRegistry.registerAllCeComponent = function(compClassList, registryInstance) {
    for(var compName in compClassList){
        let compClass = compClassList[compName];
        if (registryInstance.constructor._definedCeComponents[compName]) {
            //same component class for same reigstry which has multiple registry instance
            registryInstance.registeredComponents[compName] = true;
            continue;
        }
        compClass._compName = compName;
        compClass.addRegistries = compClass.prototype.addRegistries;
        _LC.registerCeComponent(compName, compClass,registryInstance);
        registryInstance.registeredCeComponents[compName] = true;
        registryInstance._registeredCeComponents[compName] = compClass;
    }
};

/*convert to custom class*/
ComponentRegistry.Component = (function() {
    class newC extends ComponentRegistry._componentApis {
        constructor(){
            super();
        }
        static register(compName){
            compName = compName || _LC.String.dasherize(this.name);
            if(ComponentRegistry.globalComponents.indexOf(compName) != -1){
                let compClass = this;
                compClass._registryClass = ComponentRegistry;
                ComponentRegistry._defaultComponents[compName] = compClass;
                compClass._compName = compName;
                compClass.activeInstances = 0;   
                ComponentRegistry._registeredRegistries.forEach(function(reg){
                    let registry = reg.class;
                    registry._registeredComponentClass[compName] = compClass;
                    if(registry._instanciated){
                        registry._instanceList.forEach(function(ins){
                            registry.registerAllComponent({[compName] : compClass},ins);
                        })
                    }
                })
            }
            //@Slicer.developmentStart
            else{
                RegistryError.error("LC003" , compName);
            }
            //@Slicer.developmentEnd
        }
    }
    newC.__lMod = "Component";
    newC._registryClass = ComponentRegistry;
    return newC;
})();

ComponentRegistry.addFakeDirective = function(baseClass,name){
    this._lazyRegisterDirectives[name] = baseClass;
    this[name] = baseClass;
    _LC.updateDirectivesInReg(this,baseClass,name);
};

/*convert to custom class*/
class Component extends ComponentRegistry._componentApis {
    constructor(){
        super();
    }
    // static _registryClass = registryClassDef;
    static register(compName, options){
        var _registryClass = _LC.getRegistryClass(options);
        if(!_registryClass){
            //@Slicer.developmentStart
            RegistryError.error("LC004", "Component", compName)
            //@Slicer.developmentEnd
            return
        }
        this._refHash = options.refHash
        compName = compName || _LC.String.dasherize(this.name);
        this._registryClass = _registryClass;
        _registryClass.registerComponent(compName, this);
    }
    static unregisterComponent(){
        _LC.unregisterComponent.apply(this,arguments);
    }
}
Component.__lMod = "Component";

Component._render = function(){
    return _LC._render.apply(this,arguments);
};

/*convert to custom class*/
class RawComponent extends Service {
    constructor(){
        super();
    }
    // static _registryClass = registryClassDef;
    static register(compName, options){
        var _registryClass = _LC.getRegistryClass(options);
        if(!_registryClass){
            //@Slicer.developmentStart
            RegistryError.error("LC004", "Raw Component", compName)
            //@Slicer.developmentEnd
            return;
        }
        this._refHash = options.refHash
        compName = compName || _LC.String.dasherize(this.name);
        this._registryClass = _registryClass;
        _registryClass.registerCeComponent(compName, this, this.options);
    }
}
RawComponent.__lMod = "RawComponent";
class Helper {
    static register(name, helper, options){
        var _registryClass = _LC.getRegistryClass(options);
        if(!_registryClass){
            //@Slicer.developmentStart
            RegistryError.error("LC004", "Helper", name)
            //@Slicer.developmentEnd
            return;
        }
        helper._hash = options.hash;
        helper._refHash = options.refHash;
        //@Slicer.developmentStart
        if(ComponentRegistry._defaultHelpers[name]){    
            console.warn("Deprecated : Default helpers of Lyte can't be overrided - " + name + "");
        }else if(_registryClass._registered && _registryClass.prototype.registeredHelpers[name] || _registryClass._beforeRegisteredHelpers && _registryClass._beforeRegisteredHelpers[name]){
            console.warn("Deprecated : Helper named - " + name + " is already registered");
        }
        //@Slicer.developmentEnd
        if(_registryClass._registered){
            _registryClass.prototype.registeredHelpers[name] = helper;
        }else if(_registryClass._beforeRegisteredHelpers){
            _registryClass._beforeRegisteredHelpers[name] = helper;
        }else{
            _registryClass._beforeRegisteredHelpers = {[name] : helper};
        }
    }
}
Helper.__lMod = "Helper";
function arrayUtils(){
    return _LC.aF.apply(_LC, arguments);
}
function objectUtils(){
    return _LC.oF.apply(_LC, arguments);
}
function set(){
    return _LC.set.apply(_LC.String, arguments);
}
ComponentRegistry._registeredComponentClass = {};
ComponentRegistry._registeredCeComponentClass = {};
// ComponentRegistry.Compile = Compile;
let orgArrFns = ["push", "pop", "splice", "shift", "unshift", "concat"];
for(let i=0; i<orgArrFns.length; i++){
    let arrFnName = orgArrFns[i];
    // Array.prototype["$"+orgArrFns[i]] = Array.prototype[orgArrFns[i]]
    Object.defineProperty(Array.prototype, "$"+arrFnName, {
        enumerable: false, 
        value : Array.prototype[arrFnName]
    })
}
var _LC = {
    validateRenderData : function(data){
        //@Slicer.developmentStart
        if( !(data === undefined || data === null || (typeof data == "object" && !Array.isArray(data)) ) ){
            Lyte.warn("Invalid data passed to render the component from route.");
            // return false;
        }
        //@Slicer.developmentEnd
        return true;
    },
    _render : function(object){
        let compClass = this;
        ltCf.fromV4Render = true;
        let oldLyteV4 = ltCf.lyteV4;
        let outlet = object.outlet;
        let registryInstance = object.registryInstance;
        let data = object.data;
        let options = object.options;
        if(compClass._registered){
            if(_LC.validateRenderData(data)){
                if(data && data.lyteV4){
                    ltCf.lyteV4 = true;
                }
                if(registryInstance){
                    if(!_LC.isValidReg(registryInstance)){
                        //@Slicer.developmentStart
                        ApiError.error("LC006");
                        //@Slicer.developmentEnd
                        ltCf.fromV4Render = false;
                        ltCf.lyteV4 = oldLyteV4
                        return;
                    }
                    let ele = registryInstance.render(compClass,data,outlet,options);
                    if(object._route){
                        ele._route = object._route;
                    }
                    ltCf.fromV4Render = false;
                    ltCf.lyteV4 = oldLyteV4
                    return ele;
                }else{
                    let registryClass = compClass._registryClass;
                    if(registryClass._instanciated && registryClass._instanceList.length){
                        // if(registryClass._instanceList.length > 1){
                        //     Lyte.error("Registry not instanced for ",compClass.name);
                        // }else{
                            let ele = registryClass._instanceList[0].render(compClass, data, outlet, options);
                            if(object._route){
                                ele._route = object._route;
                            }
                            ltCf.fromV4Render = false;
                            ltCf.lyteV4 = oldLyteV4
                            return ele;
                        // }
                    }
                    //@Slicer.developmentStart
                    else{
                        ApiError.error("LC007");
                    }
                    //@Slicer.developmentEnd
                }
            }
        }
        //@Slicer.developmentStart
        else{
            ApiError.error("LC008");
        }
        //@Slicer.developmentEnd
    },
    Security : {
        defaultTags : ["link-to"],
        defaultAttr : ["yield-name","lt-prop-route", "lt-prop-dp", "lt-prop-fragment", "lt-prop-qp", "lt-prop", "lt-prop-class", "lt-prop-id", "lt-prop-rel", "lt-prop-title", "lt-prop-style", "lt-prop-target","lt-prop-td","lt-prop-custom","lt-prop-target","lt-prop-id","lt-prop-class","lt-prop-style","lt-prop-rel","lt-prop-title"],
        sanitizeHTML : function(obj){
            let clean;
            let divEle = document.createElement("div");
            let html = obj.html;
            let instance = obj.instance;
            // let options = obj.options;
            let additionalObject = obj.additionalObject ? obj.additionalObject : {};
            if(instance && Object.keys(instance).length){
                if(additionalObject && Object.keys(additionalObject).length){
                    clean = _LC.Security.sanitizeWithConfig(html ,additionalObject, instance);
                }
                else{
                    clean = instance.sanitize(html);
                }
            }else{
                //@Slicer.developmentStart
                ApiError.error("LC009");
                //@Slicer.developmentEnd
                return;
            }
            divEle.innerHTML = clean;
            return divEle;
        },
        createSanitizer : function (obb) {
            _LC.Security.initializeConfig(obb);
            _LC.Security.addConfig(obb);
            _LC.Security.addLyteComponents(obb);
            let instance = ZSEC.HTMLPurifier(obb);
            instance._GLOBAL_TAGS = obb.GLOBAL_TAGS;
            instance._GLOBAL_ATTRIBUTES = obb.GLOBAL_ATTRIBUTES;
            instance._FORBID_TAGS = obb.FORBID_TAGS;
            instance._FORBID_ATTR = obb.FORBID_ATTR;
            return instance;
        },
        sanitizeWithConfig : function(html , additionalObject, instance){
            _LC.Security.addGlobalObject(instance,additionalObject);
            let clean = instance.sanitize(html);
            _LC.Security.removeGlobalObject(instance,additionalObject);
            return clean;
        },
        initializeConfig : function(obb){
            if (!obb.GLOBAL_ATTRIBUTES) {
                obb.GLOBAL_ATTRIBUTES = [];
            }
            if (!obb.FORBID_TAGS) {
                obb.FORBID_TAGS = [];
            }
            if (!obb.FORBID_ATTR) {
                obb.FORBID_ATTR = [];
            }
            if (!obb.GLOBAL_TAGS) {
                obb.GLOBAL_TAGS = [];
          }
        },
        addConfig : function(obb){
            _LC.Security.defaultAttr.forEach(function(item){
                obb.GLOBAL_ATTRIBUTES.$push(item);
            })
            _LC.Security.defaultTags.forEach(function(item){
                obb.GLOBAL_TAGS.$push(item);
            })
        },
        removeConfig : function(obb){
            if(obb && Object.keys(obb) && Object.keys(obb).length > 0){
                if(obb.GLOBAL_ATTRIBUTES && obb.GLOBAL_ATTRIBUTES.length > 0){
                    _LC.Security.defaultAttr.forEach(function(item){
                        var index = obb.GLOBAL_ATTRIBUTES.indexOf(item);
                        if(index != -1){
                            obb.GLOBAL_ATTRIBUTES.$splice(index,1);
                        }
                    })
                }
                if(obb.GLOBAL_TAGS && obb.GLOBAL_TAGS.length > 0){
                    _LC.Security.defaultTags.forEach(function(item){
                        var index = obb.GLOBAL_TAGS.indexOf(item);
                        if(index != -1){
                            obb.GLOBAL_TAGS.$splice(index,1);
                        }
                    })
                }
            }
        },
        addLyteComponents : function(obb){
            var globalTagArr = Array.from(obb.GLOBAL_TAGS);
            var attr = [];
            for(var a=0; a<globalTagArr.length; a++){
                let regComps = ComponentRegistry._registeredCommonClass;
                if(regComps[globalTagArr[a]]){
                    attr = regComps[globalTagArr[a]].observedAttributes;
                }else if(Lyte.registeredCustomComponent[globalTagArr[a]]){
                    if(Lyte.registeredCustomComponent[globalTagArr[a]].observedAttributes){
                        attr = Lyte.registeredCustomComponent[globalTagArr[a]].observedAttributes;
                    }
                }
                for(var i=0; i<attr.length; i++){
                    if(obb.GLOBAL_ATTRIBUTES.indexOf(attr[i]) == -1){
                        obb.GLOBAL_ATTRIBUTES.$push(attr[i]);
                    }
                }
            }
        },
        addGlobalObject : function(instanceObj,additionalObj){
            for (var property in additionalObj) {
                    if(Array.isArray(additionalObj[property])){
                        additionalObj[property].forEach(function(item){
                            if(instanceObj["_"+property].indexOf(item) == -1){
                                instanceObj["_"+property].$push(item);
                            }
                        });
                }
            }
        },
        removeGlobalObject : function(instanceObj,additionalObj){
            for (var property in additionalObj) {
                if(Array.isArray(additionalObj[property])){
                    additionalObj[property].forEach(function(item){
                        var index = instanceObj["_"+property].indexOf(item);
                        if(index != -1){
                            instanceObj["_"+property].$splice(index,1);
                        }
                    });
            }
            };
        }
    },
    toBeRegistered : [],
    getRegistryClass : function(options){
        let registryClass;
        ComponentRegistry._registeredRegistries.forEach(function(obj){
            let reg = obj.class;
            if(reg._hash == options.refHash){
                registryClass = reg;
                return
            }

        })
        return registryClass;
    },
    "setCurrentRegistryIns" : function(currentReg){
        _LC._currentRegistryInstance = currentReg;
    },
    "setCurrentRegistry" : function(reg){
        _LC._currentRegistry = reg;
    },
    "getCurrentRegistryIns" : function(){
        return _LC._currentRegistryInstance;
    },
    "getCurrentRegistry" : function(){
        return _LC._currentRegistry;
    },
    "getDecidedRegistry" : function(){
        return _LC._decidedRegistry;
    },
    "setDecidedRegistry" : function(reg){
        _LC._decidedRegistry = reg;
    },
    "setDefaultRegistry" : function(reg){
        _LC._defaultRegistry = reg;
    },
    "setDefaultRegistryIns" : function(regIns){
        _LC._defaultRegistryIns = regIns;
    },
    "getDefaultRegistryIns" : function(){
        return _LC._defaultRegistryIns;
    },
    "getDefaultRegistry" : function(){
        return _LC._defaultRegistry;
    },
    "setAddedRegistries" : function(scope,scopeName){
        let addedRegistries = scope.addRegistries ? scope.addRegistries.apply(scope) : [];
        if(addedRegistries){
            let validReg = _LC.validateArrRegistry(addedRegistries,scopeName);
            scope.addedRegistries = validReg ? addedRegistries : [];
        }else{
            scope.addedRegistries = [];
        }
    },
    "validateArrRegistry" : function(arr , moduleName){
        for(let i=0; i<arr.length; i++){
            if(!_LC.validateRegistry(arr[i],moduleName)){
                return false;
            }
        }
        return true;
    },
    "isValidReg" : function(reg){
        return reg && reg.isComponentRegistry && reg.isComponentRegistry()
    },
    "validateRegistry" : function(reg,moduleName){
        if(!_LC.isValidReg(reg)){
            let name =  reg ? reg.constructor ? reg.constructor.name : reg : reg ;
            //@Slicer.developmentStart
            RegistryError.error("LC005", name, moduleName);
            //@Slicer.developmentEnd
            return false;
        }
        return true;
    },
    "getApp" : function(node){
        if(node){
            return node.$app ? node.$app : node.$addon.$app;
        }else{
            return this.$app ? this.$app : this.$addon.$app;
        }
    },
    "getNearestParentApp" : function(node){
        if(!node){
            node = this;
        }
        while(node){
            if(node.$app){
                app = node.$app;
                break;
            }
            else if(node.$addon){
                if(node.$addon.$app){
                    app = node.$addon.$app
                    break;
                }
            }
            node = node.$addon;
        }
        return app;
    },
    "getAppOrAddon" : function(node){
        // node can be component or registry
        node = node ? node : this;
        if(node){
            return node.$app ? node.$app : node.$addon;
        }
    },
    "migratedv2" : function(app){
        if((app.constructor._migration && app.constructor._migration.version == "2") || (app.constructor.__slyteApp)){
            return true;
        }
    },
    "updateDirectivesInReg" : function(self,dClass,name){
        self._registeredRegistries.forEach(function(regObj){
            let regClass = regObj.class;
            if(regClass._instanciated){
                regClass._instanceList.forEach(function(regIns){
                    let directiveIns;
                    let app = _LC.getAppOrAddon(regIns);
                    app.scopedInstance(dClass,[regIns],function(ins){
                        directiveIns = ins;
                    },[])
                    regIns["_"+name] = directiveIns;
                    regIns._defaultDirectives.push(name);
                })
            }
        })
    },
    "updateDomApis" : function(regIns){
        regIns.appendChild = _LC.appendChild;
        regIns.insertAfter = _LC.insertAfter;
        regIns.insertBefore = _LC.insertBefore
    },
    "getMyScope" : function(node){
        if(node.$app){
            return node.$app;
        }else if(node.$addon){
            return node.$addon;
        }
    },
    "setComponentsDiv" : function(template,name){
        let div = createElement("div");
        div.setAttribute("id",name);
        template.appendChild(div);
        return div;
    },
    "getComponentsDiv" : function(template,name){
        return template.querySelector("#"+name);
    },
    "getCompRegistry" : function(obj,self){
        var initProp = self._initProperties;
        if((initProp && initProp.lyteRegistry) || (self.hasAttribute("lyte-registry"))){
            var reg = initProp.lyteRegistry || self.getAttribute("lyte-registry");
            var registryMap = new WeakMap();
            if(this.checkInRegistry(reg,obj,registryMap)){
                return;
            }
        }
        var currentReg = _LC.getCurrentRegistryIns();
        if(currentReg){
            this.traverseRegistries([currentReg],obj,self);
        }else{
            let defRegIns = _LC.getDefaultRegistryIns();
            if(defRegIns){
                this.traverseRegistries([defRegIns],obj,self);    
            }else{
                let defaultReg = _LC.getDefaultRegistry();
                let defaultRegInsArr = defaultReg._instanceList;
                this.traverseRegistries(defaultRegInsArr,obj,self);
            }
        }
    },
    "verifyDetails" : function(obj){
        var lIns = obj.lIns ,compClass = obj.compClass ,regIns = obj.regIns;
        if(!lIns || !compClass || !regIns){
            return false;
        }
        return true;
    },
    "isValidateLyteReg" : function(reg,registryMap){
        if(!_LC.isValidReg(reg)){
            //@Slicer.developmentStart
            RegistryError.error("LC006", reg.constructor.name);
            //@Slicer.developmentEnd
            return false;
        }else if(registryMap.get(reg)){
            //@Slicer.developmentStart
            RegistryError.error("LC007", reg.constructor.name);
            //@Slicer.developmentEnd
            return false;
        }
        registryMap.set(reg,reg);
        return true;
    },
    "checkInRegistry" : function(registry,obj,registryMap){
        if(this.isValidateLyteReg(registry,registryMap)){
            obj.compClass = obj.type == "component" ? registry.constructor._registeredComponentClass[obj.compName] : registry.constructor._registeredCeComponentClass[obj.compName];
            if(obj.compClass){
                obj.regIns = registry;
                obj.lIns = registry.$app ? registry.$app : registry.$addon;
                return true;
            }else{
                if(registry.addedRegistries){
                    let addedReg = registry.addedRegistries;
                    for(let i=0; i<addedReg.length; i++){
                        if(this.checkInRegistry(addedReg[i],obj,registryMap)){
                            return true;
                        }
                    }
                }
            }
        }
    },
    "iterateRegistries" : function(baseRegistryArr,obj,registryMap){
        for(let i=0; i<baseRegistryArr.length; i++){
            if(this.checkInRegistry(baseRegistryArr[i],obj,registryMap)){
                return true;
            }
        }
    },
    "traverseRegistries" : function(baseRegistryArr,obj,self){
        let registryMap = new WeakMap();
        if(this.iterateRegistries(baseRegistryArr,obj,registryMap)){
            return
        }
        let parentComp = self._callee || self.getCallee && self.getCallee(self.parentNode);
        if(!parentComp){
            return;
        }
        while(parentComp){
            let parentCompReg = parentComp.$registry;
            registryMap = new WeakMap();
            if(this.checkInRegistry(parentCompReg,obj,registryMap)){
                return;
            }
            if(parentComp.component.addedRegistries){
                let pcAddedReg = parentComp.component.addedRegistries;
                for(let i=0; i<pcAddedReg.length; i++){
                    registryMap = new WeakMap();
                    if(this.checkInRegistry(pcAddedReg[i],obj,registryMap)){
                        return;
                    }
                }
            }
            parentComp = parentComp._callee || parentComp.getCallee && parentComp.getCallee(parentComp.parentNode);
        }
        
    },
    "getCommonClass" : function(componentName){
        var customCrmComponent = ComponentRegistry._registeredCommonClass[componentName];
        return customCrmComponent;
    },
    "getCommonCustomClass" : function(componentName){
        var customCrmComponent = ComponentRegistry._registeredCommonClass[componentName];
        return customCrmComponent;
    },

    "registerCeComponent" : function(componentName, componentClass, registryInstance){
        let customLyteCustomComponent;
        let registry = componentClass._registryClass;
        let registryName = registry.name;
        if(registryInstance.registeredCeComponents[componentName] && ComponentRegistry._registeredCommonCeClass[componentName]._reg[registryName]) {
            customLyteCustomComponent = this.getCommonCustomClass(componentName,registryName);
        }else{
            customLyteCustomComponent = class extends LyteCustomElement {
                constructor(){
                    super()
                }
            }
            customLyteCustomComponent._observedAttributes = componentClass.observedAttributes || [];
            customLyteCustomComponent._deepWatchProperties = componentClass._deepWatchProperties || {};
            registryInstance.registeredCeComponents[componentName] = true;
            if (document.readyState === "complete" || document.readyState === "interactive") {     
                customElements.define(componentName, customLyteCustomComponent, undefined, {v4raw : true});
            }
            else{
                _LC.toBeRegistered.$push({name:componentName, def: customLyteCustomComponent, _lyteOptions : {v4raw : true} });//af check
            }
            ComponentRegistry._definedCeComponents[componentName] = customLyteCustomComponent;
            componentClass._instanciated = true;
            componentClass._registered = true;
            ComponentRegistry._registeredCommonCeClass[componentName] = customLyteCustomComponent;
            registry._registeredCeComponentClass[componentName] = componentClass;
        } 
    },
    "validate" : function() {
        var compInstance = this._ins;
        var data = compInstance.data;
        for(var key in data) {
            _LC.handleValidation(data, key, data[key], compInstance);
        }
    },
    "registerComponent" : function(componentName,componentClass,registryInstance) {
        let customCrmComponent;
        let alreadyRegistered;
        let registry = componentClass._registryClass;
        let registryName = registry.name;
        if(registryInstance.registeredComponents[componentName] && ComponentRegistry._registeredCommonClass[componentName]._reg[registryName]) {
            //think this place wont be called need to remove this check
            customCrmComponent = this.getCommonClass(componentName, registryName);
        }
        else if(ComponentRegistry._unRegisteredComponents[componentName]){
            customCrmComponent = this.getCommonClass(componentName);
            delete ComponentRegistry._unRegisteredComponents[componentName];
            alreadyRegistered = true;
        }
         else {
            customCrmComponent = class extends customElementPrototype {
                constructor(){
                    super()
                }
            }
            registryInstance.registeredComponents[componentName] = true;
            customCrmComponent._reg = {[registryName] : {}};
            customCrmComponent._depthTemp = document.createElement("template");//af check
            customCrmComponent.prototype.throwAction = this.throwAction;
            customCrmComponent._compName = componentName;
            Object.defineProperty(customCrmComponent.prototype, "setData", {
                configurable : true, 
                writable : true,
                value : function(arg0, arg1 ,options) {
                    return this.component.setData(arg0, arg1, options);
                }
            });

            Object.defineProperty(customCrmComponent.prototype, "getData", {
                configurable : true, 
                writable : true,
                value : function(arg0) {
                    return this.component.getData(arg0);
                }
            });

            Object.defineProperty(customCrmComponent.prototype, "setMethods", {
                configurable : true, 
                writable : true, 
                value : function(arg0, arg1) {
                    return this.component.setMethods(arg0, arg1);
                }
            })
            customCrmComponent.prototype.get = this.nodeGet;
            customCrmComponent.prototype.set = this.nodeSet;
        }
        if(componentClass.ssr){
            customCrmComponent._ssr = componentClass.ssr();
            if(customCrmComponent._ssr.config){
                customCrmComponent._config = customCrmComponent._ssr.config;
            }
        }

        customCrmComponent.componentClass = componentClass;
        var Component;
        if(ComponentRegistry._registeredCommonClass[componentName]){
            Component = ComponentRegistry._registeredCommonClass[componentName].component;
            Component.list.push(componentClass);
        }else{
            Component = {list : [componentClass]};
        }
        componentClass._v4 = true;
        customCrmComponent.component = Component;
        customCrmComponent._observedAttributes = componentClass._observedAttributes || [];
        customCrmComponent._deepWatchProperties = componentClass._deepWatchProperties || {};
        // if(!componentClass._registered){
            customCrmComponent._registerComponent(
                componentName,
                customCrmComponent,
                componentClass,
                registry,
                registryInstance
            );
        // }
        customCrmComponent._bindsIds = [];
        if(!ComponentRegistry._definedComponents[componentName]) {
            if (document.readyState === "complete" || document.readyState === "interactive") {     
                customElements.define(componentName, customCrmComponent, undefined, {v4 : true});
            }
            else{
                _LC.toBeRegistered.$push({name:componentName, def: customCrmComponent, _lyteOptions : {v4 : true}});
            }
        }
        ComponentRegistry._definedComponents[componentName] = customCrmComponent;
        let depthTemp = customCrmComponent._depthTemp;
        if(depthTemp && depthTemp.content.childNodes.length) { //removed _ie
            depthTemp.setAttribute("data-id", "depthTemp_" + componentName);
            let lyteComponentsDiv = _LC.getComponentsDiv(_LC.lyteComponentsDiv,registry.name);
            lyteComponentsDiv.appendChild(depthTemp);
        } else {
            delete customCrmComponent._depthTemp;
        }
        componentClass._instanciated = true;
        componentClass._registered = true;
        ComponentRegistry._registeredCommonClass[componentName] = customCrmComponent;
        registry._registeredComponentClass[componentName] = componentClass;
        if(alreadyRegistered) {
            var pendingComps = customCrmComponent._pendingComponents || [];
            pendingComps.forEach(function(item) {
                delete item.__lyteIgnore 
                item.actualConstructor();
                var arr = Array.from(item.attributes);
                arr.forEach(function(attr) {
                    if(item.constructor.observedAttributes.indexOf(attr.name) != -1) {
                        item.attributeChangedCallback(attr.name, null, attr.value);
                    }
                    
                });
                item.connectedCallback();
            });
            customCrmComponent._pendingComponents = [];
        }
        return customCrmComponent;
    },
    // "_lyteInstance": Lyte,
    "shadow" : {
        "getHostElement" : function(node){
            if(node){
                let host = node.host;
                if(host && host.tagName){
                    return host;
                }
            }
        },
        "stringToStyle" : function(str){
            var wrapper = document.createElement("wrapper");
            wrapper.innerHTML = str;
            return wrapper.firstChild;
        },
    },
    "directive" : {
        setTagDirectives : function(compClass,comp){
            if(compClass._lyteOptions && compClass._lyteOptions.attributes && compClass._lyteOptions.attributes.length){
                let attr = compClass._lyteOptions.attributes;
                for(let i=0; i<attr.length; i++){
                    if(typeof attr[i] == "object"){
                        if(attr[i].name.startsWith("@")){
                            comp._tagDirectives.push(attr[i]);
                            compClass._lyteOptions.attributes.splice(i,1);
                            i--;
                        }
                    }else{
                        if(attr[i].startsWith("@")){
                            comp._tagDirectives.push(attr[i]);
                            compClass._lyteOptions.attributes.splice(i,1);
                            i--;
                        }
                    }
                }
            }
        },
        checkSameAttrName : function(arr,directiveName,arg){
            let duplicateFound;
            arr.forEach(function(attr){
                if(attr.hookName == directiveName && arg){
                    attr.stringValue = arg;
                }
            })
            return duplicateFound;
        },
        isDirectiveNode : function(node){
            if(node.hookNode || (node.nodeName && node.nodeName.startsWith("@")) || node._isDirectiveNode){
                return true;
            }
            return false;
        },
        getActualTransitionArg : function(attr,node){
            if(attr.hasOwnProperty("dynamicValue") || attr.hasOwnProperty("helperInfo")){
                if(node.hasOwnProperty("_transitionArgs")){
                    if(node._transitionArgs.hasOwnProperty(attr.hookName)){
                        return node._transitionArgs[attr.hookName];
                    }
                }
            }else if(attr.hasOwnProperty("stringValue")){
                if(attr.hasOwnProperty("stringValue")){
                    if(attr.stringValue === ""){
                        return true
                    }if(attr.stringValue === "true"){
                        return true
                    }else if(attr.stringValue === "false"){
                        return false
                    }else{
                        return attr.stringValue;
                    }
                }
            }
        },
        getTransitionArg : function(node,directiveName){
            let transitionArg;
            if(node.component && node.component.constructor._options){
                this.setAttrFromRender(node);
            }
            var self = this;
            if(node._specialAttributeDetails){
                node._specialAttributeDetails.forEach(function(attr){
                    if(directiveName == attr.hookName){
                        transitionArg = self.getActualTransitionArg(attr,node);
                        return;
                    }
                })
            }
            return transitionArg;
        },
        setAttrFromRender : function(comp,tagDirectives){
            if(tagDirectives.length){
                if(!comp._specialAttributeDetails){
                    comp._specialAttributeDetails = [];
                }
                var self = this;
                tagDirectives.forEach(function(directiveName){
                    if(self.checkSameAttrName(comp._specialAttributeDetails,directiveName,directiveName.value)){
                        return;
                    }
                    let attr;
                    if(typeof directiveName == "string"){ 
                        attr = {
                            hookName : directiveName.slice(1,directiveName.length),
                            hookNode : true,
                            name : directiveName,
                            stringValue : ""
                        }   
                    }else{
                        attr = {
                            hookName : directiveName.name.slice(1,directiveName.name.length),
                            hookNode : true,
                            name : directiveName.name,
                            stringValue : directiveName.value
                        }
                    }
                    comp._specialAttributeDetails.push(attr)
                })
            }
        },
        setNodeArgs : function(node,nodeValue){
            // node.ownerElement._transitionArgs = nodeValue;
            let nodeName = node.nodeName;
            node.ownerElement.removeAttribute(nodeName);
            // node.nodeName = node.nodeName.slice(1,node.nodeName.length);
            if(!node.ownerElement._transitionArgs){
                node.ownerElement._transitionArgs = {};
            }
            let actNodeName = nodeName
            if(nodeName.startsWith("@")){
                actNodeName = nodeName.slice(1,nodeName.length);
            }
            node.ownerElement._transitionArgs[actNodeName] = nodeValue;
            node.ownerElement.setAttribute("lyte-directive-" + actNodeName,"");
        }
    },
    "fRP" : {},
    "fRC" : 0,
    // "frcUnused" : [],
    "customPropRegex" : "",
    // "pushFrc" : function(fastRenderIndex) {
    //     this.frcUnused.$push(fastRenderIndex);
    //     delete _LC.fRP[fastRenderIndex];
    // },
    // "getFrc" : function() {
    //     let frcIndex;
    //     if(this.frcUnused.length) {
    //         frcIndex = this.frcUnused.$shift()
    //     } else {
    //         frcIndex = this.fRC++;
    //     }
    //     return frcIndex;
    // },
    "customPropHandlers" : [],
    "_registeredComponents" : {},
    // "_reRegisteredComponents" : [],
    // "toBeRegistered" : [],
    "updateCustomCrmComponent" : function(componentClass){
        var def = componentClass.__observers;
        for(let key in def) {
            if (def[key] && def[key].type === "observer") {
                def[key].fnName = key;
                componentClass._observers.$push(def[key]);
            } else if (def[key] && def[key].type === "callBack") {
                var props = def[key].properties;
                for (var k = 0; k < props.length; k++) {
                    if (!componentClass._callBacks[props[k]]) {
                        componentClass._callBacks[props[k]] = [];
                    }
                    def[key].fnName = key;
                    componentClass._callBacks[props[k]].$push(def[key]);
                }
                if (def[key].observes) {
                    def[key].observes.fnName = key;
                    componentClass._observers.$push(def[key].observes);
                }
            }
        }
        // delete orgDef.observers;
        // for (let key in orgDef) {
        //     componentClass.prototype[key] = orgDef[key];
        // }
        // return orgDef;
    },
    // "dataFromMixin" : function(mixinsToBeUsed,actionsFromMixin,methodsFromMixin,newDefinition){
    //     var mixinslen = mixinsToBeUsed.length;
    //     for(let i=0; i<mixinslen ; i++) {
    //         for(let item in mixinsToBeUsed[i]){
    //             if(item === "actions") {
    //                 Object.assign(actionsFromMixin, mixinsToBeUsed[i][item]);    
    //             } else if(item === "methods") {
    //                 Object.assign(methodsFromMixin, mixinsToBeUsed[i][item]);    
    //             } else {
    //                 newDefinition[item] = mixinsToBeUsed[i][item];
    //             }
    //         }
    //     }
    //     return{"actionsFromMixin":actionsFromMixin,"methodsFromMixin":methodsFromMixin,"newDefinition":newDefinition}
    //   },
    "throwEvent" : function(eventName){
        let self = this.$node ? this.$node : this;
        const evt = self._actions? self._actions[eventName] : undefined; 
        let customArgs = [];        
        if(arguments.length > 1){        
            for(let i=1;i<arguments.length; i++){            
                customArgs.$push(arguments[i]);                
                }        
            }
            //wait for release
            //eventName = _LC.String.toCamelCase(eventName);
            _LC.throwAction.call(self, self._callee, eventName, undefined, true, customArgs, self);
        if(this.$node) {
            self.dispatchEvent(evt? evt : new CustomEvent(eventName, {"detail" : customArgs}));
        }
    },
    //this and scope reference should be either a node or a route.
    "throwAction" : function(scope,eventName,actObj,isCustom,customArgs, node, event, hasHandled, fromEv){
        let actionsObj;
        let app = _LC.getNearestParentApp(this.component);
        if(this._route && isCustom) {
            // scope = Lyte.Router.getRouteInstance(this._route);
            scope = app.$.modules.router[0].getRouteInstance(this._route)//.__lp.fns;
            var fns = scope.__lp.fns;
            actionsObj = fns.actions || (fns.actions = {});
        } else if(this.routeName) {
            //process for the parent route and get the current component and proceed;
            let parentRoute = this.parent;
            if(parentRoute) {
                if(parentRoute.component && parentRoute.component.component) {
                    scope = parentRoute.component;
                    actionsObj = scope.component.constructor._actions; 
                } else {
                    scope = parentRoute;
                    // actionsObj =  scope.actions || (scope.actions = {});            
                    var fns = scope.__lp.fns;
                    actionsObj = fns.actions || (fns.actions = {});
                }
            }
        } else if(scope){
                actionsObj = scope.component.constructor._actions
        }
        if(!scope) {
            //Only warning is thrown because, we can have a eventListener for the dom directly. 
            //@Slicer.developmentStart
            if(!hasHandled) {
                Lyte.warn("Nothing handled the action "+ eventName + ".");    
            }
            //@Slicer.developmentEnd
            return;
        }
        actObj = (actObj) ? actObj : this._actions && this._actions[eventName]? this._actions[eventName].processAction : void 0;     
        //wait for release
        /* 
        var dasherizedEventName = _LC.String.dasherize(eventName);
        actObj = (actObj) ? actObj : this._actions && this._actions[dasherizedEventName]? this._actions[dasherizedEventName].processAction : void 0;     
        */
        let args = customArgs ? customArgs : [];
        if(actObj){
            var contextSwitchArray = [];
            if(node) {
                _LC.adCx(node, contextSwitchArray);
            }
            let concatArgs;
            if(actObj.skipArgProcessing) {
                // concatArgs = deepCopyObject(actObj.args);
                // concatArgs.$shift();
                // var eventIndex = concatArgs.indexOf("__lyteEvent__");
                // var nodeIndex = concatArgs.indexOf("__lyteNode__");
                // if(eventIndex !== -1) {
                //     concatArgs[eventIndex] = event;
                // } 
                // if(nodeIndex !== -1) {
                //     concatArgs[nodeIndex] = target;
                // }
                concatArgs = actObj.args;
            } else {
                concatArgs = this.processArgs(scope,{"helperInfo" : actObj}, undefined, event, node);
            }
            args.$splice.apply(args, [0,0].$concat(concatArgs) );
            if(node) {
                _LC.rmCx(node, contextSwitchArray);
            }
            if(actionsObj[actObj.name]){
                if(!isCustom){  
                    //args.$unshift(window.event);
                    let parent = node.parentNode;
                    let val = actionsObj[actObj.name].apply(this.component,args);
                    if(event.currentTarget !== document.body && !_LCSD.getHostElement(event.currentTarget) && !fromEv) {
                        val = false;
                    }
                    hasHandled = true;
                    if(val !== false && !event.cancelBubble){
                        if(actObj.from && node.getAttribute(event.type) && node._boundEvents && node._boundEvents[event.type]) {
                            let actions = node._callee.component.constructor._actions;
                            let actObj = node._boundEvents[event.type];
                            let cloneActObj = deepCopyObject(actObj);
                            // cloneActObj.args.$shift();
                            _LC.skipArgProcessing(cloneActObj, event, node);
                            _LC.throwAction.call(node._callee,node._callee,event.type,cloneActObj, undefined, undefined, node, event, hasHandled);
                        } else {
                            if(_LC.hasLyteEvents(node, eventName)) {
                                let eventStopped = _LC.handleLyteEvents(node, event);
                                val = eventStopped ? false : true;       
                            }
                            if(val === false) {
                                return;
                            }
                            if(_LC.isCustomElement(node)){
                                scope = parent;
                            }
                            if(parent){
                                let eventStopped;
                                while(parent && !_LCSD.getHostElement(parent) && (!parent.getAttribute(eventName) || parent.hasAttribute("disabled") ) && parent.tagName != "BODY"){
                                    if(_LC.hasLyteEvents(parent, eventName)) {
                                        eventStopped = _LC.handleLyteEvents(parent, event);
                                        if(eventStopped) {
                                            break;
                                        }
                                    }
                                    parent = parent.parentNode;
                                }
                                if(eventStopped || !parent || parent.tagName === "BODY"){
                                    return;
                                }
                                if(!parent._callee){
                                    parent._callee = parent.getCallee ? parent.getCallee(parent) : _LC.getCallee(parent);
                                }
                                if(parent && event.type === eventName && !event.cancelBubble){
                                   if(parent._evBoundEvents && parent._evBoundEvents[eventName]) {
                                       let actObj = parent._evBoundEvents[eventName];
                                       let cloneActObj = deepCopyObject(actObj);
                                    //    cloneActObj.args.$shift();
                                        _LC.skipArgProcessing(cloneActObj, event, parent);
                                       _LC.throwAction.call(parent,parent,eventName,cloneActObj,undefined,undefined,parent,event, hasHandled);  
                                   } else if(parent && parent._boundEvents && parent._boundEvents[eventName]) {
                                       let actObj = parent._boundEvents[eventName];
                                       let cloneActObj = deepCopyObject(actObj);
                                       _LC.skipArgProcessing(cloneActObj, event, parent);
                                       _LC.throwAction.call(parent._callee,parent._callee,eventName,cloneActObj,undefined,undefined,parent,event, hasHandled);  
                                   }
                                }
                            }
                        }
                    }
                }            
                else{                
                    actionsObj[actObj.name].apply(this._callee.component,args);
                    hasHandled = true;                                             
                } 
            }
            //@Slicer.developmentStart
            else{
                ComponentError.error(app, "LC004" , actObj.name);
            }
            //@Slicer.developmentEnd
        } else if(isCustom) {
            var eventsObj = actionsObj[eventName]  || actionsObj[_LC.String.toCamelCase(eventName)] || actionsObj[_LC.String.dasherize(eventName)];
            if(eventsObj) {
                var scopeS = _LC.isCustomElement(scope) ? scope.component : scope;   
                let val = eventsObj.apply(scopeS, args);
                //let val = eventsObj.apply(_LC.isCustomElement(scope)? scope.component : scope, args);
                hasHandled = true;
                if(val !== false) {
                    _LC.throwAction.call(scope, scope._callee, eventName, actObj, isCustom, customArgs, undefined, undefined, hasHandled);
                }
            } else {
                _LC.throwAction.call(scope, scope._callee, eventName, actObj, isCustom, customArgs, undefined, undefined, hasHandled);
            }
        }
        
    },
    "isControlHelper" : function(ownerElement) {
        return (ownerElement.tagName === "TEMPLATE" && ownerElement.getAttribute("is") && ownerElement.getAttribute("is") !== "component") || (ownerElement.hasAttribute("lyte-for") || ownerElement.hasAttribute("lyte-if") || ownerElement.hasAttribute("lyte-switch") || ownerElement.hasAttribute("lyte-forin"));
    },
    "isCustomElement" : function(node, isTemplate) {
        return node.hasAttribute && ((( node.tagName ==="TEMPLATE" || node.attributes["lyte-for"] || node.attributes["lyte-if"] || node.attributes["lyte-switch"] || node.attributes["lyte-forin"] ) && isTemplate )  || (node.nodeName && node.nodeName.indexOf('-') !== -1 && (ComponentRegistry._registeredCommonClass[node.localName] || node.tagName === "LYTE-YIELD")));
    },
    "componentSet" : function(key, value, options, forceExecute, fromParent) {
        if(!forceExecute && this.get(key) === value) {
            _LC.clearError(this.data, key);
            //@Slicer.developmentStart
            if(!fromParent){
                if(typeof value == "object"){
                    Lyte.warn("The data passed to update '" + key + "' is the same reference of the actual data. So component bindings won't be updated.");
                }
            }
            //@Slicer.developmentEnd
            return;
        }
        //temporary fix
        _LC.set(this.data, key, value, options, undefined, fromParent);
    },
    "componentGet" : function(key) {
        return key ? _LC.get(this.data, key) : this.data;
    },
    "nodeGet" : function(key) {
        return key ? this.component.get(key) : this.component.data;
    },
    "nodeSet" : function(key, value, options, fromParent) {
        this.component.set(key, value, options, undefined, fromParent);
    },
    "registerMixin" : function(name,mixin){
        Lyte.Mixin.register.call(Lyte, name, mixin);
    },
    "sendtoclient": function(prop,server,node){
        var data = server ? prop.component.data : prop;
        var newData = {};
        var data_prop = node;
        for (var i in data){
            if(server){
                var def = prop.component.__data[i];
                if(i == "bindIds"){ 
                    newData[i] = {value : data[i] }
                }
                    if(def && /^(object|array)$/.test(def.type) && prop._attributeDetails && prop._attributeDetails.hasOwnProperty(_LC.String.dasherize(i))){
                        newData[i] = { "fP" : true };
                    }
                    else if(data[i] instanceof Date){
                        newData[i] = { "value" : data[i] , "type" : "Date" }
                    }
                    else if(data_prop[i]){
                        newData[i] = { "value" : data[i] , "type" : data_prop[i].type }
                    }else{
                        var type = typeof(data[i])
                        if(data[i] == undefined){
                            type = undefined;
                        }
                        newData[i] = {"value" : data[i] ,"type":type}
                    }
            }else{
                if(data[i].type=="Date"){
                    newData[i] = new Date(data[i].value);
                }
                else if(!data[i].fP){
                    newData[i]= data[i].value;
                }
            }
        }
        return newData;        	
    },
    "typeCast" : function(value, dataType, obj) {
        if(value === null) {
            return value;
        }
        try {
            switch(dataType) {
            case "string" : 
                return typeof value === "object" ? JSON.stringify(value) : value.toString(); 	
            break;
            case "number" :
                {
                if(value == "") {
                    return undefined;
                }
                let val = +value;
                if(isNaN(val)) {
                    throw "TypeCast exception";
                } 
                return val;
                }
            break;
            case "array" : 
            case "object" :
                return JSON.parse(value);
                break;
            case "boolean" :
                return ( (!value && value !== "") || value=== "false") ? false : true; 
            break;
            default : 
                return value;
            }
        } catch(e) {
            if(obj) {
                obj.isError = true;
            }
            return value;
        }
        
    },
    "getDataType" : function(value) {
        var type = typeof value;
        if(type === "object") {
            if(Array.isArray(value)) {
                return "array";
            }
        }
        return type;
    },
    "handleValidation" : function(object, property, value, component ,init) {
        let error = validateData(object, property, value, component ,this._lyteInstance ,init);
        if(error) {
            _LC.set(component.data.errors, property, error);
            if(component.$node.callback) {
                component.$node.callback("onError", property, error);
            }
        } else {
            _LC.clearError(object, property);
        }
        return error;
    },
    "clearError" : function(data, property) {
        if(data.errors && data.errors[property]) {
            _LC.oF(data.errors, "delete", property);
        }
    },
    "createLyteId" : function(comp){
        comp.__counter++;
        return "__lyteId" + comp.__counter;
    },
    "apdNode" : function(node, comp) {
        _LC.tDiv.content.appendChild(node);
        let id = this.createLyteId(comp);
        comp.__h[id] = node;
        node.__lyteId = id;
    },
    "update":function(object, property, value, options, fromStore,oldValue,setterScope, actualProperty, fromParent ,FromUtils, storeRecord){
        let fromComponent = object.__component__;
        let updateAttr = true;
        let dataType, dataDef, estObjBind = false;
        if(!oldValue){
            oldValue = object[property];
            if(fromComponent && fromComponent.tagName !== "LYTE-YIELD") {
                dataDef = fromComponent.component.__data[property];
                if(dataDef && (dataType = dataDef.type)) {
                    updateAttr = !dataDef.hideAttr;
                    if(dataType !== _LC.getDataType(value) && (value !== undefined || dataType === "boolean")) {
                        value = _LC.typeCast(value, dataType);
                    }
                }
                if(value === oldValue) {
                    _LC.clearError(object, property);
                    return;
                }
                if(!options || (typeof options == "object" && options.skipValidation != true)){
                    let error = _LC.handleValidation(object, property, value, fromComponent.component);
                    if(error) {
                        // if(fromComponent.component.data.errors && Object.keys(fromComponent.component.data).length){
                        //     Lyte.error("Error in data passed to component '"+fromComponent.component.$node.localName+"' for the properties - "+Object.keys(fromComponent.component.data.errors).toString());
                        // }
                        return;
                    }
                }
        }
            //object[property] = value;
            if(!object.hasOwnProperty(property) && !(Array.isArray(object))) {
                _LC.oF(object, "add", property, value, true )
            } else {
                object[property] = value;
            }
        }
        let toBeExecuted = fromComponent ? true : false;
        let dasherizedAttr = _LC.String.dasherize(property);
        if(fromComponent && actualProperty && ( (typeof value === "string" && fromComponent.getAttribute(dasherizedAttr) !==  value) || fromComponent.hasAttribute(dasherizedAttr) )) {
            // (customPropRegex && this.customPropRegex)
            let cpr;
            if(fromComponent.tagName == "LYTE-YIELD"){
                cpr = fromComponent._callee.component._registryClass.customPropRegex;
            }else{
                cpr = fromComponent.component._registryClass.customPropRegex;
            }
             if((!cpr.exec(property) || fromComponent.hasAttribute(dasherizedAttr) ) && updateAttr) {
                 if(value && typeof value === "object") {
                     let jsonString;
                     try{
                        jsonString = JSON.stringify(value);
                        fromComponent.attributes.getNamedItem(dasherizedAttr).__lyteIgnore = true;
                        fromComponent.setAttribute(dasherizedAttr, jsonString);
                     } catch(e) {

                     }
                 } else {
                     let attributeString = _LC.typeCast(value, "string");
                     if(fromComponent.getAttribute(dasherizedAttr) !== attributeString) {
                         let detAttr = fromComponent.attributes.getNamedItem(dasherizedAttr);
                         if(detAttr) {
                             detAttr.__lyteIgnore = true;
                         }
                         attributeString = attributeString || "";
                         fromComponent.setAttribute(dasherizedAttr, attributeString);
                     }
                 }
             }
        }
        if(value && typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" ) {
            //newValue is of type object 
            
            if(oldValue && typeof oldValue === "object" && oldValue._bindings) {
                //Both oldValue and newValue are objects. 
                if(!value._bindings) {
                    defProp(value, "_bindings", {
                        enumerable: false, 
                        writable: true, 
                        value : new Set(),
                        configurable: true
                    });
                }
                //for changing only child component
                if(fromComponent && fromComponent.component.data === object && property.indexOf('.')=== -1) {
                    let bindings = fromComponent.getProperty(property);
                    this.removeSelectedBindingDeep(bindings, oldValue);
                    addBindings(value._bindings,bindings);
                    this.establishBindings(bindings, value);
                    //For removing binding in the object due to forIn Helper ( actual object binding and not the _dynamicNodes binding).
                    if(bindings._forHelpers) {
                        let bindfor = bindings._forHelpers.toArrayLyte();
                        for(var i=0;i<bindfor.length;i++){
                            let item = bindfor[i];
                            if(item._propBindingObject) {
                                this.removeSelectedBindingDeep(item._propBindingObject, oldValue);
//                                  value._bindings.add(item._propBindingObject);
//                                  this.establishBindings(item._propBindingObject, value);
                            }
                        }
                    }
                    let stack = [];
                    this.affectChanges(bindings,undefined,oldValue,setterScope,object[property],stack);
                    this.executeObserver(stack);
                } else {
                    //To change only the bindings present in the object and not all the bindings present in the oldValue.
                    if(object._bindings) {
                        let oldbind = object._bindings.toArrayLyte();
                        for(let i=0; i<oldbind.length;i++){
                            let item = oldbind[i][property];
                            if(item) {
                                this.removeSelectedBindingDeep(item, oldValue);
                                addBindings(value._bindings,item);
                                this.establishBindings(item, value);
                                //For removing binding in the object due to forIn Helper ( actual object binding and not the _dynamicNodes binding).
                                if(item._forHelpers) {
                                    let forbind = item._forHelpers.toArrayLyte();
                                    for(let j=0;j<forbind.length;j++){
                                        let itemBinding = forbind[j];
                                        if(itemBinding._propBindingObject) {
                                            this.removeSelectedBindingDeep(itemBinding._propBindingObject, oldValue);
                                        }
                                    }
                                }
                                let stack = [];
                                this.affectChanges(item,undefined,oldValue,setterScope,object[property],stack);
                                this.executeObserver(stack);
                            }
                        }
                    }
                
                
                }
            } else {
                //newValue is object and oldValue is string. Hence establish bindings from oldValue's object and place it in the newValue. 
                if(object._bindings) {
                    makeSet(value, "_bindings");
                    let objbind = object._bindings.toArrayLyte();
                    for(let i=0;i<objbind.length;i++){
                        let item = objbind[i];
                        if(item[property]) {
                            addBindings(value._bindings,item[property]);
                            this.establishBindings(item[property], value);
                            let stack = [];
                            this.affectChanges(item[property],undefined,oldValue,setterScope,object[property],stack);
                            this.executeObserver(stack);
                        }
                    }
                }
            }
            dataDef = dataDef || (fromComponent && fromComponent.tagName !== "LYTE-YIELD" ? fromComponent.component.__data[property] : undefined); 
            if((fromStore && isEntity(object)) || (object && object.hasOwnProperty("_scp") && object._scp.size) || (dataDef && (/^(object|array)$/.test(dataDef.type)) && (dataDef.watch || dataDef.hasOwnProperty("items") || dataDef.hasOwnProperty("properties")))){
                estObjBind = true;
            }
        } else {
            //newValue is string
            
            if(oldValue && typeof oldValue === "object" && oldValue._bindings && object._bindings) {
                //newValue is string and oldValue is object 
                let objbind = object._bindings.toArrayLyte();
                for(let i=0;i<objbind.length;i++){
                    let item = objbind[i];
                    if(item[property]) {
                        //oldValue._bindings.delete(item[property]);
                        //if(oldValue._bindings.size === 0) {
                        //  delete oldValue._bindings;
                        //  break;
                        //}
                    this.removeSelectedBindingDeep(item[property], oldValue);
                        if(item[property]._forHelpers) {
                            let forbind = item[property]._forHelpers.toArrayLyte();
                            for(let j=0;j<forbind.length;j++){
                                let itemBinding =forbind[j];
                                if(itemBinding._propBindingObject) {
                                    this.removeSelectedBindingDeep(itemBinding._propBindingObject, oldValue);
                                }
                            }
                        }
                    }
                }
            }
            
            //when newValue and oldValue , both are string, no need to change bindings. 
            if(object._bindings) {
                let objbind = object._bindings.toArrayLyte();
                for(let i=0;i<objbind.length;i++){
                    let item = objbind[i];
                    if(item[property]) {
                        let stack = [];
                        this.affectChanges(item[property],undefined,oldValue,setterScope,object[property],stack);
                        this.executeObserver(stack);
                    }
                }
            }
        }
        if(object._scp){
            if(!cmpData(oldValue, value)){
                this.callDeepObservers(object, { type:"deepChange", oldValue:oldValue, newValue : value }, property);
            }
            if(oldValue && (Array.isArray(oldValue) || typeof oldValue == "object")){
                var keys = Array.from(object._scp.keys());
                keys.forEach(function(id){
                    var nestObj = nestScp[id];
                    var isCyclic = nestObj.cyclic;
                    removeNestScp(oldValue, id);
                    if(isCyclic){
                        bindObj(nestObj._data, undefined, id, [], new Map());
                    }
                });
            }
        }
        if((isEntity(object) && object.$.__scpObj) || (object.hasOwnProperty("__component__") && object.__component__.__scpObj)){
            var _scpObj, kmpKey;
            if(isEntity(object)){
                _scpObj = object.$.__scpObj;
                kmpKey = object;
            }else{
                _scpObj = object.__component__.__scpObj;
                kmpKey = object.__component__;
            }
            if(_scpObj.hasOwnProperty(property)){
                var _sId = _scpObj[property].split("_");
                removeNestScp(oldValue, _sId[0], _sId[1], undefined, kmpKey, undefined, isEntity(value) || Array.isArray(value) && value.model && value.add ? value : undefined);
                delete _scpObj[property];
            }
        }
        if (!FromUtils) {
            _LC.callObjectObservers(object, { type: "change", "oldValue": oldValue, "newValue": value, item: property });
        }
        if(estObjBind){
            // establishObjectBinding(object, property, fromStore, true);
            establishObjectBinding(
                object,
                property,
                fromStore,
                true,
                storeRecord,
                (dataDef && dataDef.watch)?dataDef.watch:undefined
            );
        }
        if(toBeExecuted && !fromParent && fromComponent._attributeDetails && fromComponent._callee) {
            //let syntaxValue = fromComponent.getAttributeNode(property).syntaxValue;
            let attrDetail = fromComponent._attributeDetails[_LC.String.dasherize(property)];
            let syntaxValue;
            if(attrDetail && attrDetail.isLbind) {
                syntaxValue = attrDetail.dynamicValue;
            }
            if(syntaxValue) {
                let contextSwitchArray;
                if(fromComponent._cx) {
                    contextSwitchArray = [];
                    _LC.changeContext(fromComponent._cx.node, contextSwitchArray, fromComponent._cx )
                }
                let obj = _LC.getNew(fromComponent._callee.component.data, syntaxValue);
                if(!obj.context){
                    return;
                }
                let exec = false;
                if(obj.context === fromComponent._callee.component.data) {
                    if(fromComponent._callee._properties[obj.lastKey] && fromComponent._callee._properties[obj.lastKey].__fromComponent) {
                        exec = true;
                    }
                } else {
                    exec = true;
                }
                //self.setData(this._lbind,this.value);
                if(exec) {
                    let lastKeyIndex = +obj.lastKey;
                    if(Array.isArray(obj.context) && typeof lastKeyIndex == "number") {
                        _LC.aF(obj.context, lastKeyIndex < obj.context.length ? "replaceAt" : "insertAt", lastKeyIndex, value);
                    } else {
                        _LC.set(obj.context, obj.lastKey, value, options);
                    }
                }
                if(contextSwitchArray) {
                    _LC.removeContext(fromComponent._cx.node, contextSwitchArray, fromComponent._cx )
                }
            }
        }
    },
    "getContentForIE" : function getContentForIE(content, constr, newlyCreated, info) {
        if(typeof content === "string") {
            newlyCreated = true;
            var div = createElement("div");
            div.innerHTML = content;
            content = div.childNodes[0];
            constr.splitTextNodes(content);
        }
        if(content.getAttribute && content.getAttribute("depth")) {
            if(info) {
                info._content = div;
            }
            var itr = parseInt(content.getAttribute("depth"));
            content =  newlyCreated ? content.content : content.content.cloneNode(true);
            // content = Lyte._ie ? content : (newlyCreated ? content.content : content.content.cloneNode(true));
            for(var i=0;i<itr;i++) {
                content = content.childNodes[0];
            }
        }
        return content;
    },
    "replaceWithPf" : function(node1, node2) {
        // if(Lyte._rwpf) {
        //     _LC.insertBeforeNative(node1.parentNode,node2, node1);
        //     node1.remove();
        // } else {
            node1.replaceWith(node2);
        // }
    },
    "getCallee" : function(callee, self){
        while(callee &&  !_LC.isCustomElement(callee) && callee.tagName !== "LYTE-YIELD") {
            if(callee.tagName === "BODY") {
                callee = null;
                break;
            }
            let hostEle = _LCSD.getHostElement(callee)
            if(!callee.parentNode && hostEle){
                callee = hostEle;
            }
            else{
                callee = callee.parentNode;
            }
        }
        if(callee && callee.tagName === "LYTE-YIELD") {
        return callee._registerYield? callee._registerYield._callee : undefined;
        }
        return ((self ===  callee) ? undefined : callee);
    },
    "set" : function(object, property, value, options, fromStore, fromParent, FromUtils) {
        let lastIndex = -1;
        var s_rec,check={},recDottedProp;
        if(isEntity(object) && fromStore){
            s_rec=object;
        }
        if(!(typeof property === "object") || !property){
            property = property+"";
            lastIndex = property.lastIndexOf('.');
        }
        let actualProperty = property;
        if(lastIndex !== -1) {
            let outerPropertyPath = property.substring(0, lastIndex);
            property = property.substring(lastIndex + 1);
            object = _LC.get(object, outerPropertyPath);
            recDottedProp = true;
        }
        if(typeof property === "string" && object[property] === value) {
            if(object.__component__) {
                _LC.clearError(object, property);
            } else if(isEntity(object)) {
                if(!object.$.isCloned){
                    ValidationError.clrRecErr(object.$, property);
                }
                object.$.emit("set", [object, property]);
                if(object.$.schema){
                    object.$.schema.emit("set", [object.$.schema._name, object, property]);
                    object.$.schema.db.emit("set", [object.$.schema._name, object, property]);
                }
                else if(object.$.model){
                    object.$.model.emit("set", [object.$.model._name, object, property]);
                    object.$.model.db.emit("set", [object.$.model._name, object, property]);
                }

            }
            return;
        }
        let oldValues = [];
        if(object._setterScope){
            var setterScope = object._setterScope;
        }
        var checkSim = false, watch = [];
        if(object._scp && object._scp.size){
            var keys = Array.from(object._scp.keys()), obj;
            keys.forEach(function(id){
                var _obj = object._scp.get(id);
                obj = _obj.paths;
                var recObj = nestScp[id], model, field, rec, attr, wobj = {};
                var pathArr = Object.keys(obj), aPath;
                if(pathArr.length > 1){
                    aPath = "*";
                }
                else if(pathArr.length == 1){
                    aPath = pathArr[0];
                }
                wobj.path = aPath;
                wobj.id = id;
                if(pathArr.length > 1){
                    wobj.paths = pathArr;
                }
                wobj.attr = attr;
                wobj.data = recObj.data;
                wobj.dtype=recObj.dtype||undefined;
                wobj.key=recObj.key||undefined;
                wobj.Error=recObj.Error||undefined;
                var db = recObj.db;
                if(recObj.model){
                    var mMap = recObj.model;
                    var mKeys = Array.from(recObj.model.keys());
                    for(var i=0; i<mKeys.length; i++){
                        var mName = mKeys[i];
                        var pkMap = mMap.get(mName);
                        if(pkMap){
                            var pkArr = Array.from(pkMap.keys());
                            var pkLen = pkArr.length;
                            for(var j=0; j<pkLen; j++){
                                var mPk = pkArr[j];
                                var attrMap = pkMap.get(mPk);
                                var attrArr = Array.from(attrMap.keys());
                                var attrLen = attrArr.length;
                                for(k=0; k<attrLen; k++){
                                    var mAttr = attrArr[k];
                                    var mObj = Object.assign({}, wobj);
                                    if(db.getSchema){
                                        var mRec = recObj.db.cache.getEntity({schema:db.getSchema(mName), pK:mPk});
                                    }
                                    else{
                                        var mRec = recObj.db.cache.getEntity({model:db.getModel(mName), pK:mPk});
                                    }
                                    if(mRec){
                                        model = mRec.$.schema ? mRec.$.schema : mRec.$.model;
                                        field = model.fieldList[mAttr];
                                        if(field && field.watch == true){
                                            mObj.data = deepCopyObject(mRec[mAttr]);
                                            mObj.rec = mRec;
                                            mObj.isRec = true;
                                            mObj.attr = mAttr;
                                            mObj.dtype = model.fieldList[mAttr];
                                            mObj.Error=mRec.$.error;
                                        }
                                        watch.$push(mObj);
                                    }
                                }
                            }
                        }
                    }
                } 
                else{
                    watch.$push(wobj);
                }         
            });
            watch.forEach(function(val){
                if((!options || (typeof options == "object" && options.skipValidation != true)) && (val.dtype || val.rec) ){
                    var id = val.id,path=val.path.split("."),dtype=val.dtype;
                    checkNestedProp(id,path,dtype,val,object,property,value,check);
                    if(object.$ && Object.values(object.$.error).length==0){
                        delete object.$
                    };
                }
            })
            if(check.value && check.value.code){
                return;
            }
        }
        actualProperty = actualProperty === property ? actualProperty : undefined;
        var shareObj = {};
        if(typeof property === "object"){
            if(isEntity(object) && !fromStore && !object.$.isCloned) {
                    // for(let key in property){
                    //     if(Array.isArray(object[key])){
                    //         oldValues.$push({key:key,oldValue:object[key].slice(0)});    
                    //     }
                    //     else{
                    //         oldValues.$push({key:key,oldValue:object[key]});
                    //     }
                    // }
                    for(let key in property) {
                        let locValue = property[key];
                        let dataType = object.$.schema ? object.$.schema.fieldList[key] : object.$.model.fieldList[key];
                        dataType = dataType ? dataType.type : undefined;
                        if(dataType && (locValue !== undefined || dataType === "boolean") && dataType !== _LC.getDataType(locValue)) {
                            property[key] = _LC.typeCast(locValue, dataType);
                        }
                    }
                    let record = setData(object.$, property, undefined, options, undefined, undefined, shareObj);
                    if(record.$.isError){
                        return record;
                    }
                    // for(let i=0; i<oldValues.length; i++){
                    //     _LC.update(object,oldValues[i].key,object[oldValues[i].key],fromStore,(oldValues[i].oldValue === undefined)?null:oldValues[i].oldValue ,setterScope, actualProperty, fromParent);
                    // }
            } else {
                //object[property] =  value;
                for(let key in property){
                    //_LC.update(object,key,property[key],fromStore,undefined,setterScope, actualProperty, fromParent);
                    //value is option here
                    _LC.set(object, key, property[key], value, fromStore, fromParent);
                }
            }
        }
        else{
            if(isEntity(object) && (!fromStore || (fromStore && recDottedProp)) && !object.$.isCloned) {
                let old = object[property];
                let dataType = object.$.schema ? object.$.schema.fieldList[property] : object.$.model.fieldList[property];
                dataType = dataType ? dataType.type : undefined;
                if(dataType && (value !== undefined || dataType === "boolean") && dataType !== _LC.getDataType(value)) {
                    value = _LC.typeCast(value, dataType);
                }
                let record = setData(object.$, property,value, options, undefined, undefined, shareObj);
                if(record.$.isError){
                    return record;
                }
                //Commented because update will happend when "set" is called from setData of store. 
                //_LC.update(object,property,value,fromStore,(old === undefined) ? null : old,setterScope , actualProperty);    
            } else {
                _LC.update(object,property,value,options,fromStore,undefined,setterScope,actualProperty, fromParent, FromUtils, s_rec);
            }
        }
        if(watch && watch.length){
            watch.forEach(function(obj){
                if(obj.isRec){
                    deepValueChange(obj.rec, obj.attr, obj.rec[obj.attr], obj);
                }
            });
        }
    },
    "adCx" : function(node, contextSwitchArray) {
        let isYield = node.tagName === "LYTE-YIELD";
        if(node._cx && (!isYield || node._cx.node.tagName !== "LYTE-YIELD")) {
            _LC.changeContext(node._cx.node, contextSwitchArray, node._cx, isYield);
        } else if(isYield && node._callee._cx) {
            _LC.changeContext(node._callee._cx.node, contextSwitchArray, node._callee._cx, true);
        }
    }, 
    "rmCx" : function(node, contextSwitchArray) {
        let isYield = node.tagName === "LYTE-YIELD";
        if(node._cx && (!isYield || node._cx.node.tagName !== "LYTE-YIELD")) {
            _LC.removeContext(node._cx.node, contextSwitchArray, node._cx, isYield);
        } else if(isYield && node._callee._cx) {
            _LC.removeContext(node._callee._cx.node, contextSwitchArray, node._callee._cx, true);
        }
    },
    "changeContext" : function(node, contextSwitchArray, contextSwitchInfo, proceedFurther) {
        if(!contextSwitchInfo) {
            return;
        }
        let isYield = node.tagName === "LYTE-YIELD";
        if(node._cx && (!isYield || node._cx.node.tagName !== "LYTE-YIELD")) {
            _LC.changeContext(node._cx.node, contextSwitchArray, node._cx, node.tagName === "LYTE-YIELD" || proceedFurther);
        } else if((node.tagName === "LYTE-YIELD" || proceedFurther) && node._callee && node._callee._cx) {
            _LC.changeContext(node._callee._cx.node, contextSwitchArray, node._callee._cx);
        }
        if(isYield) {
            let insertYield = node._registerYield;
            let callee = insertYield._callee;
            if(callee && callee._cx) {
                _LC.changeContext(callee._cx.node, contextSwitchArray, callee._cx);
            }
        }
        let indexValue, itemValue;
        if(contextSwitchInfo.type) {
            if(contextSwitchInfo.type === "for") {
                indexValue = node.getAttribute("index");
                itemValue = node.getAttribute("item");
                if(node._items.length === 0) {
                    return;
                }
            } else {
                indexValue = node.getAttribute("key");
                itemValue = node.getAttribute("value");
                if(Object.keys(node._items).length === 0) {
                    return;
                }
            }
            let callee = node._callee;
            let initialItemValue = callee.component.data[itemValue];
            let initialIndexValue = callee.component.data[indexValue];
            let initialItemProp = callee._properties[itemValue];
            let initialIndexProp = callee._properties[indexValue];
             let items = contextSwitchInfo.type === "for" ? node._currentItems : node._currentObject;
            callee.component.data[itemValue] = items[contextSwitchInfo.itemIndex];
            callee.component.data[indexValue] = contextSwitchInfo.itemIndex;
            callee._properties[itemValue] = node._items[contextSwitchInfo.itemIndex].itemProperty;
            callee._properties[indexValue] = node._items[contextSwitchInfo.itemIndex].indexProperty;
            let dummyObject = {"initialItemValue" : initialItemValue , "initialIndexValue" : initialIndexValue, "initialItemProp" : initialItemProp, "initialIndexProp" : initialIndexProp};
            contextSwitchArray.$push(dummyObject);
        } else {
            //handling for yield
            let dummyObject = {};
            let callee = node._registerYield._callee;
            Object.keys(contextSwitchInfo.node._properties).forEach(function(key) {
                dummyObject[key] = {};
                dummyObject[key].value = callee.component.data[key];
                dummyObject[key].property = callee._properties[key];
                callee._properties[key] = contextSwitchInfo.node._properties[key];
                callee.component.data[key] = contextSwitchInfo.node.component.data[key];
            }); 
            contextSwitchArray.$push(dummyObject);
        }
    },
    "removeContext" : function(node, contextSwitchArray, contextSwitchInfo, proceedFurther) {
        if(!contextSwitchInfo) {
            return;
        }
        let isYield = node.tagName === "LYTE-YIELD";
        if(node._cx && (!isYield || node._cx.node.tagName !== "LYTE-YIELD")) {
            _LC.removeContext(node._cx.node, contextSwitchArray, node._cx, node.tagName === "LYTE-YIELD" || proceedFurther);
        } else if((node.tagName === "LYTE-YIELD" || proceedFurther) && node._callee && node._callee._cx) {
            _LC.removeContext(node._callee._cx.node, contextSwitchArray, node._callee._cx)
        }
        if(isYield) {
            let insertYield = node._registerYield;
            let callee = insertYield._callee;
            if(callee && callee._cx) {
                _LC.removeContext(callee._cx.node, contextSwitchArray, callee._cx);
            }
        }
        let indexValue, itemValue;
        if(contextSwitchInfo.type) {
            if(contextSwitchInfo.type === "for") {
                indexValue = node.getAttribute("index");
                itemValue = node.getAttribute("item");
                if(node._items.length === 0) {
                    return;
                }
            } else {
                indexValue = node.getAttribute("key");
                itemValue = node.getAttribute("value");
                if(Object.keys(node._items).length === 0) {
                    return;
                }
            }
            let callee = node._callee;
            let items = node._attributes.items;
            let removedObject = contextSwitchArray.$shift();
            callee.component.data[itemValue] = removedObject.initialItemValue;
            callee.component.data[indexValue] = removedObject.initialIndexValue;
            callee._properties[itemValue] = removedObject.initialItemProp;
            callee._properties[indexValue] = removedObject.initialIndexProp;
        } else {
            let callee = node._registerYield._callee;
            let removedObject = contextSwitchArray.$shift();
            Object.keys(contextSwitchInfo.node._properties).forEach(function(key) {
                callee.component.data[key] = removedObject[key].value;
                callee._properties[key] = removedObject[key].property;
            });
        }
    },
    "objectUtils" : function(){
        return _LC.oF.apply(_LC, arguments);
    },
    "sortCommands" : function(array1, arrayB) {
        var retVal = {};
        var arrayA = array1.slice();
        retVal.origianlArray = array1;
        var commands = [];
        
        for (let i = 0; i < arrayB.length; i++) {
            // var targetIndex = arrayA.findIndex((element) => element === arrayB[i]);
            var targetIndex = arrayA.indexOf(arrayB[i]);
        
            if (targetIndex === -1) {
            commands.push({
                type: 'Add',
                element: arrayB[i], 
                toIndex : i
            });
            arrayA.splice(i, 0, arrayB[i]);
            } else {
            if (targetIndex !== i) {
                commands.push({
                type: 'Move',
                element: arrayB[i],
                fromIndex: targetIndex,
                toIndex: i
                });
                arrayA.splice(targetIndex, 1);
                arrayA.splice(i, 0, arrayB[i]);
            }
            }
        }
        
        for (let i = arrayA.length - 1; i >= arrayB.length; i--) {
            commands.push({
            type: 'Remove',
            element: arrayA[i]
            });
            arrayA.splice(i, 1);
        }
        retVal.commands = commands;
        retVal.changedArray = arrayB;
        return retVal;
    },
    "oF" : function() {
        let object = arguments[0];
        let functionName = arguments[1];
        let property = arguments[2];
        let newValue = arguments[3];
        let fromComponent = arguments[4];
        let fromStore = arguments[5];
        if(functionName === "add" && !fromComponent) {
            let obj = {type:"change","oldValue":object[property],"newValue":newValue,"item":property};
            _LC.set(object, property, newValue,undefined, fromStore,undefined,true);
            _LC.callObjectObservers(object,obj);
            return;
        }
        let options = {};
        options.type = functionName;
        options.property = property;
        if(!/^(add|delete)$/.test(functionName)) {
            //@Slicer.developmentStart
            ApiError.error("LC001", functionName);
            //@Slicer.developmentEnd
            return;
        }
        let bindings = object._bindings;
        if(functionName === "delete") {
            let obj = {type:"change","oldValue":object[property],"newValue":newValue,"item":property};
            _LC.set(object, property, undefined, undefined, fromStore,undefined,true);
            _LC.callObjectObservers(object,obj);
        } else {
            object[property] = newValue;
        }
        if(bindings) {
            let bind = bindings.toArrayLyte();
            for(let i=0;i<bind.length;i++) {
                let binding = bind[i];
                let forHelpers = binding._forHelpers;
                if(forHelpers) {
                    let helperBind = forHelpers.toArrayLyte();
                    for(let j=0;j<helperBind.length;j++) {
                        let forHelper = helperBind[j];
                        if(forHelper.getAttribute("is") != "forIn"){
                            continue;
                        }
                        let itemValue = forHelper.getAttribute("key");
                        //Need to check
//                            _LC.removeSelectedBindingDeep({[itemValue] :                        forHelper._items[property].itemProperty}, {[itemValue] : object[property]});
                        let contextSwitchArray = [];
                        if(functionName === "add") {
                            _LC.adCx(forHelper, contextSwitchArray);
                        }
                        forHelper._callee.updateForInHelper(forHelper, options);
                        if(functionName === "add") {
                            _LC.rmCx(forHelper, contextSwitchArray);
                        }
                    }
                }
            }
        }
        if(functionName === "delete") {
            delete object[property];
        }
    },
    "arrayUtils" : function(){
        return _LC.aF.apply(_LC, arguments);
    },
    "aF" : function() {
        var argumentsArr = Array.from(arguments);
        var fromOverride = false;
        if(argumentsArr[0] && typeof argumentsArr[0] == "object" && argumentsArr[0].fromOverride){
            argumentsArr.$shift();
            fromOverride = true;
        }
        let array = argumentsArr[0];
        let initialArrLength = array.length;
        let callLengthObserver = true;
        let functionName = argumentsArr[1];
        let value = arguments[3],check={};
        if(/^(replaceAt|removeAt|shift)$/.test(functionName) && !array.length) {
            //@Slicer.developmentStart
            Lyte.warn(functionName + " operation cannot be performed on empty array");
            //@Slicer.developmentEnd
            return;
        }
        let commands;
        if(functionName == "sort") {
            var originalArray = arguments[0];
            var sortFunction = arguments[2];
            var addedArguments = arguments[3] || [];
            var dummyArray = originalArray.slice();
            addedArguments.forEach(function(item) {
                dummyArray.push(item);
            });
            if(typeof arguments[2] == "function") {
                dummyArray.sort(sortFunction);
            } else {
                var obj = arguments[2];
                var key = obj.sortBy;
                var order = obj.sortOrder;
                function sorting(item1, item2) {
                    var item1 = key ? item1[key] : item1;
                    var item2 = key ? item2[key] : item2;
                    if(item1 > item2) {
                        return order ? 1 : -1;
                    } else if(item1 < item2) {
                        return order ? -1 : 1;
                    } else {
                        return 0;
                    }
                }
                dummyArray.sort(sorting)
            }
            commands = this.sortCommands(originalArray, dummyArray).commands;
        }
        let commArgs = arguments[2], oldVal, obsObj, watch = [];
        if(array._scp && /^(replaceAt|splice|removeAt|remove|insertAt)$/.test(functionName)){
            array._scp.forEach(function(_obj, id){
                var rec, attr, wobj = {};
                var recObj = nestScp[id];
                var obj = _obj.paths;
                var pathArr = Object.keys(obj), aPath;
                if(pathArr.length > 1){
                    aPath = "*";
                }
                else if(pathArr.length == 1){
                    aPath = pathArr[0];
                }
                wobj.path = aPath;
                wobj.id = id;
                if(pathArr.length > 1){
                    wobj.paths = pathArr;
                }
                wobj.attr = attr;
                wobj.data = recObj.data;
                wobj.reInit = isEntity(recObj.data) || (Array.isArray(recObj.data) && (recObj.data.schema || recObj.data.model) && recObj.data.add);
                wobj.dtype=recObj.dtype||undefined;
                wobj.key=recObj.key||undefined;
                wobj.Error=recObj.Error||undefined;
                wobj.index=commArgs;
                if(recObj.model){
                    var mMap = recObj.model;
                    var mKeys = Array.from(recObj.model.keys());
                    for(var i=0; i<mKeys.length; i++){
                        var mName = mKeys[i];
                        var pkMap = mMap.get(mName);
                        if(pkMap){
                            var pkArr = Array.from(pkMap.keys());
                            var pkLen = pkArr.length;
                            for(var j=0; j<pkLen; j++){
                                var mPk = pkArr[j];
                                var attrMap = pkMap.get(mPk);
                                var attrArr = Array.from(attrMap.keys());
                                var attrLen = attrArr.length;
                                for(k=0; k<attrLen; k++){
                                    var mAttr = attrArr[k];
                                    var mObj = Object.assign({}, wobj);
                                    if(recObj.db.getSchema){
                                        var mRec = recObj.db.cache.getEntity({schema:recObj.db.getSchema(mName), pK:mPk});
                                    }
                                    else{
                                        var mRec = recObj.db.cache.getEntity({model:recObj.db.getModel(mName), pK:mPk});
                                    }
                                    if(mRec){
                                        var model = mRec.$.schema ? mRec.$.schema : mRec.$.model;
                                        var field = model.fieldList[mAttr];
                                        if(field && (field.properties || field.items || field.watch == true)){
                                            mObj.data = deepCopyObject(mRec[mAttr]);
                                            mObj.rec = mRec;
                                            mObj.isRec = true;
                                            mObj.attr = mAttr;
                                            mObj.dtype = model.fieldList[mAttr];
                                            mObj.Error=mRec.$.error;
                                            mObj.key=mAttr;
                                        }
                                        // mObj.reInit = true;
                                        watch.push(mObj);
                                    }
                                }
                            }
                        }
                    }
                } 
                else{
                    wobj.reInit = isEntity(recObj.data) || (Array.isArray(recObj.data) && (recObj.data.schema || recObj.data.model ) && recObj.data.add);
                    watch.push(wobj);
                }
            });
            watch.forEach(function(val){
                if((val.dtype || val.rec) ){
                    var id = val.id,path=val.path.split("."),dtype=val.dtype;
                    checkNestedProp(id,path,dtype,val,array,path,commArgs,check);
                    if(array.$ && Object.values(array.$.error).length==0){
                        delete array.$
                    };
                }
            });
            if(check.value && check.value.code){return;}
        }  
        switch(functionName) {
        case "replaceAt" : 
            {
            let index = parseInt(argumentsArr[2]);
            if(index > array.length) {
                Lyte.warn("index provided for replaceAt is greater than array length");
                return [];
            }
            //let args = Array.prototype.slice.call(argumentsArr, 3);
            let args = argumentsArr[3];
            if(!(Array.isArray(args))) {
                args = [args];
            }
            else if(fromOverride){
                args = [args];
            }
            let deletedItems = array.$splice.apply(array, [index, 1].$concat(args));
            let options = {"firstIndex" : index, "secondIndex" : args.length, "type" : "replace"};
            //All references updated by now
            if(options.secondIndex == 1){
                callLengthObserver = false;
            }
            //remove binding from previous object
            if(array._bindings) {
                let objbind = array._bindings.toArrayLyte();
                for(let i=0;i<objbind.length;i++){
                    let item = objbind[i];
                    if(item._forHelpers) {
                        let helperbind = item._forHelpers.toArrayLyte();
                        for(let j=0;j<helperbind.length;j++){
                            let helper = helperbind[j];
                            if(helper.getAttribute("is") != "for"){
                                continue;
                            }
                            /*if(helper.hasAttribute("unbound")) {
                                continue;
                            }*/
                            let finalIndex = index + deletedItems.length;
                            let itemValue = helper.getAttribute("item");
                            for(let i=index, j=0;i<finalIndex;i++,j++) {
                                _LC.removeSelectedBindingDeep({[itemValue] : helper._items[i].itemProperty}, {[itemValue] : deletedItems[j]});
                            }
                            let contextSwitchArray = [];
                            _LC.adCx(helper, contextSwitchArray);
                            helper._callee.updateForHelper(helper, options);
                            _LC.rmCx(helper, contextSwitchArray);
                        }
                    }
                    for(let key in item) {
                        let parsedKey = parseInt(key);
                        let cond = (options.secondIndex == 1) ? (parsedKey == options.firstIndex) : (parsedKey >= options.firstIndex);
                        if(!isNaN(parsedKey) && cond) {
                            let diff = parsedKey - options.firstIndex;
                            let oldObject;
                            if(diff < 1) {
                                oldObject = deletedItems[diff];
                            } else {
                                oldObject = array[options.firstIndex - 1  + options.secondIndex + diff];
                            }
                            this.removeSelectedBindingDeep(item[key], oldObject);
                            if(item[key]._forHelpers) {
                                let bindfor = item[key]._forHelpers.toArrayLyte();
                                for(var j=0;j<bindfor.length;j++){
                                    let item1 = bindfor[j];
                                    if(item1._propBindingObject) {
                                        this.removeSelectedBindingDeep(item1._propBindingObject, oldObject);
//                                          value._bindings.add(item._propBindingObject);
//                                          this.establishBindings(item._propBindingObject, value);
                                    }
                                }
                            }
                            if(array[parsedKey] && typeof array[parsedKey] === "object") {
                                makeSet(array[parsedKey], "_bindings");
                            this.establishBindings({"dummy" : item[key]},{"dummy" : array[parsedKey]});
                            }
                            this.affectChanges(item[key],undefined,oldObject,undefined,array[parsedKey]);
                            if(options.secondIndex == 1){
                                break; 
                            }
                        }
                    }
                }
            }
            obsObj = {type:"array",insertedItems:args, removedItems:deletedItems, index:index};
            _LC.bindWatchObj(watch, array, args, deletedItems, index);
            _LC.callArrayObservers(array,obsObj,callLengthObserver,initialArrLength);
            return deletedItems[0];
            }
            break;
        case "splice" : {
            let index = parseInt(argumentsArr[2]);
            if(index > array.length) {
                Lyte.warn("index provided is greater than array length");
                return [];
            }
            let toBeDeleted = argumentsArr.length > 3 ? argumentsArr[3] : array.length - index;
            let args;
            let skip = false;
            if(argumentsArr.length > 4){
                args = argumentsArr[4]
            }else{
                args = []
                skip = true;
            }
            if(!(Array.isArray(args))) {
                args = [args];
            }
            else if(!skip && fromOverride){
                args = [args];
            }
            let deletedItems = array.$splice.apply(array, [index, toBeDeleted].$concat(args));
            let options = {"firstIndex" : index, "secondIndex" : args.length, "thirdIndex" : toBeDeleted, "type" : "splice"};
            //All references updated by now
            if(options.secondIndex == options.thirdIndex){
                callLengthObserver = false
            }
            //remove binding from previous object
            if(array._bindings) {
                let objbind = array._bindings.toArrayLyte();
                for(let i=0;i<objbind.length;i++){
                    let item = objbind[i];
                    if(item._forHelpers) {
                        let helperbind = item._forHelpers.toArrayLyte();
                        for(let j=0;j<helperbind.length;j++){
                            let helper = helperbind[j];
                            /*if(helper.hasAttribute("unbound")) {
                                continue;
                            }*/
                            if(helper.getAttribute("is") != "for"){
                                continue;
                            }
                            let finalIndex = index + deletedItems.length;
                            let itemValue = helper.getAttribute("item");
                            for(let i=index, j=0;i<finalIndex;i++,j++) {
                                _LC.removeSelectedBindingDeep({[itemValue] : helper._items[i].itemProperty}, {[itemValue] : deletedItems[j]});
                            }
                            let contextSwitchArray = [];
                            _LC.adCx(helper, contextSwitchArray);
                            helper._callee.updateForHelper(helper, options);
                            _LC.rmCx(helper, contextSwitchArray);
                        }
                    }
                    for(let key in item) {
                        let parsedKey = parseInt(key);
                        var cond = options.secondIndex == options.thirdIndex ? key >= options.firstIndex && key < (options.firstIndex+options.secondIndex) : parsedKey >= options.firstIndex;
                        if(!isNaN(parsedKey) && cond) {
                            let diff = parsedKey - options.firstIndex;
                            let oldObject;
                            if(diff < options.thirdIndex) {
                                oldObject = deletedItems[diff];
                            } else {
                                oldObject = array[options.firstIndex - options.thirdIndex  + options.secondIndex + diff];
                            }
                            this.removeSelectedBindingDeep(item[key], oldObject);
                            if(item[key]._forHelpers) {
                                let bindfor = item[key]._forHelpers.toArrayLyte();
                                for(var j=0;j<bindfor.length;j++){
                                    let item1 = bindfor[j];
                                    if(item1._propBindingObject) {
                                        this.removeSelectedBindingDeep(item1._propBindingObject, oldObject);
//                                          value._bindings.add(item._propBindingObject);
//                                          this.establishBindings(item._propBindingObject, value);
                                    }
                                }
                            }
                            if(array[parsedKey] && typeof array[parsedKey] === "object") {
                                makeSet(array[parsedKey], "_bindings");
                            this.establishBindings({"dummy" : item[key]},{"dummy" : array[parsedKey]});
                            }
                            this.affectChanges(item[key],undefined,oldObject,undefined,array[parsedKey]);
                        }
                    }
                }
            }
            obsObj = {type:'array',index:index,insertedItems:args, removedItems:deletedItems};
            _LC.bindWatchObj(watch, array, args, deletedItems, index);
            _LC.callArrayObservers(array,obsObj,callLengthObserver ,initialArrLength);
            return deletedItems;
        }
        break;
        case "push" : 
            {
            let toPush = argumentsArr[2];
            if(fromOverride && argumentsArr.length > 3){
                toPush = argumentsArr.$splice(2,argumentsArr.length);
            }
            else if(!(Array.isArray(toPush))) {
                toPush = [toPush];
            }
            else if(fromOverride){
                toPush = [toPush];
            }
            _LC.aF(array, 'insertAt', array.length, toPush);
            }
            break;
        case "pop" : 
               return _LC.aF(array, 'remove', array.length -1)[0];
            break;
        case "shift" : 
        case "shiftObject" :
              return _LC.aF(array, 'remove', 0)[0];
              break;
        case "removeAt" : 
        case "remove" : 
            {
            let index = parseInt(argumentsArr[2]);
            if(index > array.length) {
                Lyte.warn("index provided for removeAt is greater than array length");
                return [];
            }
            let length = argumentsArr[3] ? parseInt(argumentsArr[3]) : 1;
            let options = {"firstIndex" : index, "secondIndex" : length, "type" : "remove"};
            let deletedItems = array.$splice(index,length);
            if(array._bindings) {
                let objbind = array._bindings.toArrayLyte();
                for(let i=0;i<objbind.length;i++){
                    let item = objbind[i];
                    if(item._forHelpers) {
                        let helperbind = item._forHelpers.toArrayLyte();
                        for(let j=0;j<helperbind.length;j++){
                            let helper = helperbind[j];
                            /*if(helper.hasAttribute("unbound")) {
                                continue;
                            }*/
                            if(helper.getAttribute("is") != "for"){
                                continue;
                            }
                            let finalIndex = index + deletedItems.length;
                            let itemValue = helper.getAttribute("item");
                            for(let i=index, j=0;i<finalIndex;i++,j++) {
                                _LC.removeSelectedBindingDeep({[itemValue] : helper._items[i].itemProperty}, {[itemValue] : deletedItems[j]});
                            }
                            let contextSwitchArray = [];
                            _LC.adCx(helper, contextSwitchArray);
                            helper._callee.updateForHelper(helper, options);
                            _LC.rmCx(helper, contextSwitchArray);
                        }
                       }
                        for(let key in item) {
                        let parsedKey = parseInt(key);
                        if(!isNaN(parsedKey) && parsedKey >= options.firstIndex) {
                            let diff = parsedKey - options.firstIndex;
                            let oldObject;
                            if(diff < options.secondIndex) {
                                oldObject = deletedItems[diff];
                            } else {
                                oldObject = array[options.firstIndex - options.secondIndex + diff];
                            }
                            this.removeSelectedBindingDeep(item[key], oldObject);
                            if(item[key]._forHelpers) {
                                let bindfor = item[key]._forHelpers.toArrayLyte();
                                for(var j=0;j<bindfor.length;j++){
                                    let item1 = bindfor[j];
                                    if(item1._propBindingObject) {
                                        this.removeSelectedBindingDeep(item1._propBindingObject, oldObject);
//                                          value._bindings.add(item._propBindingObject);
//                                          this.establishBindings(item._propBindingObject, value);
                                    }
                                }
                            }
                            if(array[parsedKey] && typeof array[parsedKey] === "object") {
                                makeSet(array[parsedKey], "_bindings");
                            this.establishBindings({"dummy" : item[key]},{"dummy" : array[parsedKey]});
                            }
                            this.affectChanges(item[key],undefined,oldObject,undefined,array[parsedKey]);
                        }
                    }
                }
            }
            obsObj = {type:"array",removedItems:deletedItems,index:index};
            _LC.bindWatchObj(watch, array, undefined, deletedItems, index);
            _LC.callArrayObservers(array,obsObj,callLengthObserver ,initialArrLength); 
            return deletedItems;
            }
            break;
        case "removeObject" : 
                commArgs = [commArgs];
        case "removeObjects" :
            if(!(Array.isArray(commArgs))) {
                commArgs = [commArgs];
            }
            else if(fromOverride){
                commArgs = [commArgs];
            }
            if(commArgs == array){
                commArgs = Array.from(commArgs);// both array are same instance so cloning
            }
            for(var i=0;i<commArgs.length;i++) {
                let inde = array.indexOf(commArgs[i]);
                if(inde !== -1) {
                   _LC.aF(array, 'removeAt', inde);                         
                }
            }
            //Lyte.arrayUtils(array, 'removeObject', actObj);
            //Lyte.arrayUtils(array, 'removeObjects', []);
        break;
        case "unshift" : 
        case "unshiftObject" : 
        case "unshiftObjects" : 
            //_LC.aF.apply(_LC, [array, 'insertAt', 0].$concat(Array.prototype.slice.call(argumentsArr, 2)));
            {
            let toPush = argumentsArr[2];
            if(!(Array.isArray(toPush))) {
                toPush = [toPush];
            }
            else if(fromOverride){
                toPush = [toPush];
            }
            _LC.aF(array, 'insertAt', 0, toPush);
            }
            break;
        case "insertAt" : 
            {
            let index = parseInt(argumentsArr[2]);
            //let args = Array.prototype.slice.call(argumentsArr, 3);
            let args = argumentsArr[3];
            let len = args.length;
            if(!(Array.isArray(args))) {
                args = [args];
            }
            else if(fromOverride){
                args = [args];
            }
            for(let i=index;i>array.length;i--) {
                args.$unshift(undefined);
                index--;
            }
            let options = {"firstIndex" : index, "secondIndex" : args.length, "type" : "insert"};
            array.$splice.apply(array, [index, 0].$concat(args));
            if(array._bindings) {
                let arrbind = array._bindings.toArrayLyte();
                for(let i=0;i<arrbind.length;i++){
                    let item = arrbind[i];
                    if(item._forHelpers) {
                        let forbind = item._forHelpers.toArrayLyte();
                        for(let j=0;j<forbind.length;j++){
                            /*if(forbind[j].hasAttribute("unbound")) {
                                continue;
                            }*/
                            let helper = forbind[j];
                            if(helper.getAttribute("is") != "for"){
                                continue;
                            }
                            let contextSwitchArray = [];
                            _LC.adCx(helper, contextSwitchArray);
                            helper._callee.updateForHelper(helper, options);
                            _LC.rmCx(helper, contextSwitchArray);
                        }
                    }
                    for(let key in item) {
                        let parsedKey = parseInt(key);
                        if(!isNaN(parsedKey) && parsedKey >= options.firstIndex) {
                            this.removeSelectedBindingDeep(item[key], array[parsedKey+options.secondIndex]);
                            if(item[key]._forHelpers) {
                                let bindfor = item[key]._forHelpers.toArrayLyte();
                                for(var j=0;j<bindfor.length;j++){
                                    let item1 = bindfor[j];
                                    if(item1._propBindingObject) {
                                        this.removeSelectedBindingDeep(item1._propBindingObject, oldObject);
//                                          value._bindings.add(item._propBindingObject);
//                                          this.establishBindings(item._propBindingObject, value);
                                    }
                                }
                            }
                            if(array[parsedKey] && typeof array[parsedKey] === "object") {
                                makeSet(array[parsedKey], "_bindings");
                            this.establishBindings({"dummy" : item[key]},{"dummy" : array[parsedKey]});    
                            }
                            this.affectChanges(item[key],undefined,array[parsedKey + options.secondIndex],undefined,array[parsedKey]);
                        }
                    }
                }
            }
            let position = parseInt(argumentsArr[2]);
            obsObj = {type:"array",insertedItems:(!(Array.isArray(argumentsArr[3]))) ? [argumentsArr[3]]: argumentsArr[0].slice(position,position+len),index:position};
            _LC.bindWatchObj(watch, array, args, undefined, position);
            _LC.callArrayObservers(array,obsObj,callLengthObserver ,initialArrLength);                
            }
            break;
        case "concat" : 
            //_LC.aF.apply(_LC, [array, 'insertAt',array.length].$concat(argumentsArr[2]));
            _LC.aF(array, 'insertAt', array.length, argumentsArr[2]);
            break;
        case "sort" : 
            let optionsArray = [];
            commands.forEach(function(command) {
                switch(command.type) {
                    case "Remove" : {
                        let removedItems = array.splice(command.toIndex, 1);
                        optionsArray.push({"firstIndex" : command.toIndex, "secondIndex" : 1, "type" : "remove", "removedItem" : removedItems[0]});
                    }
                    break;
                    case "Move" : {
                        let removedItems = array.splice(command.fromIndex, 1);
                        array.splice(command.toIndex, 0, command.element);
                        optionsArray.push({"firstIndex" : command.fromIndex, "secondIndex" : 1, "type" : "remove", "removedItem" : removedItems[0]});
                        // optionsArray.push({"firstIndex" : command.toIndex, "secondIndex" : 1, "thirdIndex" : 0, "type" : "splice"});
                        optionsArray.push({"firstIndex" : command.toIndex, "secondIndex" : 1, "type" : "insert"});
                    }
                    break;
                    case "Add" : {
                        array.splice(command.toIndex, 0, command.element);
                        // optionsArray.push({"firstIndex" : command.toIndex, "secondIndex" : 1, "thirdIndex" : 0, "type" : "splice"});
                        optionsArray.push({"firstIndex" : command.toIndex, "secondIndex" : 1, "type" : "insert"});
                    }
                    break;
                }
            });
            if(array._bindings) {
                let arrbind = array._bindings.toArrayLyte();
                for(let i=0;i<arrbind.length;i++){
                    let item = arrbind[i];
                    if(item._forHelpers) {
                        let forbind = item._forHelpers.toArrayLyte();
                        for(let j=0;j<forbind.length;j++){
                            /*if(forbind[j].hasAttribute("unbound")) {
                                continue;
                            }*/
                            let helper = forbind[j];
                            if(helper.getAttribute("is") != "for"){
                                continue;
                            }
                            let contextSwitchArray = [];
                            _LC.adCx(helper, contextSwitchArray);
                            for(let j=0;j<optionsArray.length;j++) {
                                let optionItem = optionsArray[j];
                                // Removal of bindings
                                let itemValue = helper.getAttribute("item");
                                if(optionItem.type == "remove") {
                                    this.removeSelectedBindingDeep({[itemValue] : helper._items[optionItem.firstIndex].itemProperty}, {[itemValue] : optionItem.removedItem});
                                }
                                helper._callee.updateForHelper(helper, optionItem);
                            }
                            _LC.rmCx(helper, contextSwitchArray);
                        }
                    }
//                         for(let key in item) {
//                             let parsedKey = parseInt(key);
//                             if(!isNaN(parsedKey) && parsedKey >= options.firstIndex) {
//                                 this.removeSelectedBindingDeep(item[key], array[parsedKey+options.secondIndex]);
//                                 if(item[key]._forHelpers) {
//                                     let bindfor = item[key]._forHelpers.toArrayLyte();
//                                     for(var j=0;j<bindfor.length;j++){
//                                         let item1 = bindfor[j];
//                                         if(item1._propBindingObject) {
//                                             this.removeSelectedBindingDeep(item1._propBindingObject, oldObject);
// //                                          value._bindings.add(item._propBindingObject);
// //                                          this.establishBindings(item._propBindingObject, value);
//                                         }
//                                     }
//                                 }
//                                 if(array[parsedKey] && typeof array[parsedKey] === "object") {
//                                 	makeSet(array[parsedKey], "_bindings");
//                                 this.establishBindings({"dummy" : item[key]},{"dummy" : array[parsedKey]});    
//                                 }
//                                 this.affectChanges(item[key],undefined,array[parsedKey + options.secondIndex],undefined,array[parsedKey]);
//                             }
//                         }
                }
            }
            break;
        default: 
            //@Slicer.developmentStart
            ApiError.error("LC002", functionName);
            //@Slicer.developmentEnd
            return;
        }
        return array;
    },
    "callDeepObservers" : function (data, args, property ,callLengthObserver){
        var self = this;
        var keys = Array.from(data._scp.keys());
        keys.forEach(function(id){
            var _scp = data._scp.get(id), 
            scp = _scp.paths,
            pathArr = Object.keys(scp), 
            aPath;
            if(pathArr.length == 1){
                aPath = pathArr[0];
            }
            else if(pathArr.length > 1){
                aPath = pathArr;
            }
            var recObj = nestScp[id], 
            attr, 
            rec, 
            isRec = false;
            if(recObj.model){
                var mMap = recObj.model;
                var db = recObj.db;
                var mKeys = Array.from(recObj.model.keys());
                for(var i=0; i<mKeys.length; i++){
                    var mName = mKeys[i];
                    var pkMap = mMap.get(mName);
                    if(pkMap){
                        var pkArr = Array.from(pkMap.keys());
                        var pkLen = pkArr.length;
                        for(var j=0; j<pkLen; j++){
                            var mPk = pkArr[j];
                            var attrMap = pkMap.get(mPk);
                            var attrArr = Array.from(attrMap.keys());
                            var attrLen = attrArr.length;
                            for(k=0; k<attrLen; k++){
                                var mAttr = attrArr[k];
                                if(db.getSchema){
                                    var mRec = db.cache.getEntity({schema:db.getSchema(mName), pK:mPk});
                                }
                                else{
                                    var mRec = db.cache.getEntity({model:db.getModel(mName), pK:mPk});
                                }
                                self.deepObsBind(mRec, true, mAttr, args, pathArr, aPath, data, property, callLengthObserver)                                    
                            }
                        }
                    }
                }
            } 
            else{
                rec = recObj.data;
                self.deepObsBind(rec, isRec, attr, args, pathArr, aPath, data, property, callLengthObserver)
            }
        });
    },
    "deepObsBind":function(rec, isRec, attr, args, pathArr, aPath, data, property, callLengthObserver){
        var type = args.type
        var watchPath , propPath;
        if(rec._bindings){
            var newArgs = Object.assign({},args);
            var objbind = rec._bindings.toArrayLyte();
            for (var _i65 = 0; _i65 < objbind.length; _i65++) {
                propPath = aPath;
                var binding = objbind[_i65], obj = undefined;
                watchPath = objbind[_i65]._path
                if(isRec){
                    if(binding.hasOwnProperty(attr) && binding[attr].hasOwnProperty("*")){
                        obj = binding[attr]["*"];
                        watchPath = binding[attr]._path;
                    } 
                }
                else if(binding.hasOwnProperty("*")){
                    obj = binding["*"];
                }
                if(obj){
                    var obsbind = obj._observers ? obj._observers.toArrayLyte() : [], path;
                    if(property){
                        if(pathArr.length > 1){
                            var len = pathArr.length, nPathArr = [];
                            for(var i=0;i<len;i++){
                                nPathArr.push(pathArr[i] ? pathArr[i]+"."+property : property);
                            }
                            propPath = nPathArr;
                        }
                        else if(pathArr.length == 1){
                            propPath = aPath ? aPath.concat("." + property) : property;
                        }
                    }
                    for (var j = 0; j < obsbind.length; j++) {
                        var observer = obsbind[j];
                        newArgs.path = propPath;
                        newArgs.type = "deepChange";
                        newArgs.data = rec;
                        var argPath = obj._path.split('.');
                        argPath.$pop();
                        newArgs.item = argPath.join('.'); 
                        var exactPath = newArgs.index!=undefined?(propPath!=""?propPath+".":propPath)+newArgs.index:propPath
                        if(observer.callee && observer.callee.component){
                            //  observer.observer.value.call(observer.callee.component, newArgs);
                            var calldeep = true;
                            var _data = observer.callee.component.__data[newArgs.item];
                            var _watch = _data ? _data.watch : undefined;
                            if(_data && typeof _watch != "boolean"){
                                var watchArr = obsbind[j].observer.Jpath[watchPath];
                                calldeep = checkWatchPath(exactPath , watchArr);
                            }
                            if(calldeep){
                                observer.observer.value.call(observer.callee.component, newArgs);
                            }
                        }
                        else{
                            var scope = data._setterScope ? data._setterScope : window;
                            if(Array.isArray(scope)){
                                var sLen = scope.length;
                                for(var k=0;k<sLen;k++){
                                    var itm = scope[k];
                                    var calldeep = true;
                                    if(newArgs.data && newArgs.hasOwnProperty("item")){
                                        var watchArr = newArgs.data.$.schema._fldGrps.watch[newArgs.item].watch
                                        if(Array.isArray(watchArr)){
                                            watchArr = obsbind[j].observer.Jpath[watchPath];
                                            calldeep = checkWatchPath(exactPath , watchArr);
                                        }
                                    }
                                    if(calldeep){
                                        observer.observer.value.call(itm, newArgs);
                                    }
                                }
                            }
                            else{
                                var calldeep = true;
                                if(newArgs.data && newArgs.hasOwnProperty("item")){
                                    var watchArr = newArgs.data.$.schema._fldGrps.watch[newArgs.item].watch
                                    if(Array.isArray(watchArr)){
                                        watchArr = obsbind[j].observer.Jpath[watchPath];
                                        calldeep = checkWatchPath(exactPath , watchArr);
                                    }
                                }
                                if(calldeep){
                                    observer.observer.value.call(scope, newArgs);
                                }
                            }
                        }
                    }
                }
                if (!callLengthObserver && type == "array" && binding.length) {
                    this.affectChanges(binding.length,undefined,initialArrLength,undefined,array.length,callLengthObserver);
                }
            }
        }
    },
    "callArrayObservers" : function(array, args ,callLengthObserver ,initialArrLength) {
        if(array._scp && array._scp.size){
            this.callDeepObservers(array, Object.assign({},args) ,undefined, true);          
        }
        if(array._bindings) {
            let objbind = array._bindings.toArrayLyte();
            for(let i=0;i<objbind.length;i++){
                let binding = objbind[i];
                let path = objbind[i]._path;
                if(binding._observers) {
                    let obsbind = binding._observers.toArrayLyte();
                    for(let j=0;j<obsbind.length;j++){
                        let observer = obsbind[j];
                        if(observer.isArrayObserver) {
                            if(args){
                                args.item = path;
                            }
                            if(observer.callee && observer.callee.component){
                                observer.observer.value.call( observer.callee.component, args);
                            }
                            else{
                                var scope = array._setterScope ? array._setterScope : window;
                                if(Array.isArray(scope)){
                                    var sLen = scope.length;
                                    for(var k=0;k<sLen;k++){
                                        var itm = scope[k];
                                        observer.observer.value.call( itm, args);                                                        
                                    }
                                }
                                else{
                                    observer.observer.value.call(scope, args);
                                }
                            }
                        }
                    }
                }
                if(binding.length) {
                    this.affectChanges(binding.length,undefined,initialArrLength,undefined,array.length,undefined,callLengthObserver);
                }
            }
        }
    },
    "callObjectObservers" : function(obj, args) {
        if(obj._bindings) {
            let objbind = obj._bindings.toArrayLyte();
            if(args.oldValue !== args.newValue){
                for(let i=0;i<objbind.length;i++){
                    let binding = objbind[i];
                    let path = objbind[i]._path;
                    if(binding["{}"]){
                        this.affectChanges(binding["{}"]);
                    }
                    if(binding._objectObservers && binding._observers) {
                        let obsbind = binding._observers.toArrayLyte();
                        for(let j=0;j<obsbind.length;j++){
                            let observer = obsbind[j];
                            if(observer.isObjectObserver) {
                                if(args){
                                    if(args.item){
                                        args.item = path + "." + args.item;
                                    }else{
                                        args.item = path;
                                    }
                                }
                                observer.observer.value.call( observer.callee && observer.callee.component ? observer.callee.component : obj._setterScope? obj._setterScope : window , args);
                            }
                        }
                    }
                }
            }
        }
    },
    "bindWatchObj" : function(watch, data, insItems, remItems, pos){
        if(watch && watch.length){
            watch.forEach(function(wObj){
                if(wObj.isRec){
                    deepValueChange(wObj.rec, wObj.attr, data, wObj);
                }
                if(remItems){
                    remItems.forEach(function(itm){
                        removeNestScp(itm, wObj.id, undefined, undefined, undefined, undefined, wObj.reInit ? wObj.data : undefined);
                    });
                }
                if(insItems){
                    insItems.forEach(function(itm,idx){
                        if(itm && ( Array.isArray(itm) || typeof itm == "object" )){
                            var pth = wObj.path.split(',');
                            pth.$push(pos+idx);
                            bindObj(itm, undefined, wObj.id,  pth && pth.length ? pth : [], undefined, undefined, true);
                        }
                    });
                }
                if(pos !== undefined){
                    var nestObj = nestScp[wObj.id];
                    if(nestObj.cyclic){
                        removeNestScp(nestObj._data, wObj.id);
                        bindObj(nestObj._data, undefined, wObj.id, [], undefined, undefined, true);
                    }
                    else{
                        var insLen = insItems ? insItems.length : 0, newInd = pos+insLen;
                        var arr = data.slice(newInd);
                        arr.forEach(function(itm){
                            removeNestScp(itm, wObj.id);
                        });
                        arr.forEach(function(itm,idx){
                            if(itm && ( Array.isArray(itm) || typeof itm == "object" )){
                                var pth = wObj.path.split(',');
                                pth.$push(newInd+idx);
                                bindObj(itm, undefined, wObj.id,  pth && pth.length ? pth : [], undefined, undefined, true);
                            }
                        });
                    }
                }
            });
        }
    },
    "establishUpdateBindings" : function(bindings, property, actualData) {
        let objbind = bindings.toArrayLyte();
        for(let i=0;i<objbind.length;i++){
            let item = objbind[i];
            if(item[property]) {
                makeSet(actualData, "_bindings");
                addBindings(actualData._bindings,item[property]);
                this.establishBindings(item[property], actualData);
            }

        }
    },
    "establishSelectedBinding" : function(property, actualData,node) {
        if(!property) {
            return;
        }
        let propName = property._path;
        let props = propName.split('.');
        let currentProp = node.getProperty(props[0]);
        let currentValue = actualData[props[0]];
        for(let i=0;i<props.length;i++) {
            if(!currentValue || typeof currentValue !== "object") {
                break;
            } 
            makeSet(currentValue, "_bindings");
                addBindings(currentValue._bindings,currentProp);
                currentProp = currentProp[props[i+1]];
                currentValue = currentValue[props[i+1]];
        }
    },
    "establishBindings": function(properties, actualData) {
        if(properties._helperNodes) {
            let path = properties._path;
            let arr = properties._helperNodes.toArrayLyte();
            for(let s=0;s<arr.length;s++) {
                let nodes = arr[s]._dynamicProperty ? arr[s]._dynamicProperty[path]: undefined;
                if(nodes) {
                    for(let j=0;j<nodes.length;j++) {
                        let node = nodes[j];
                        let helper = node.ownerElement;
                        if(helper && helper.tagName === "TEMPLATE" && helper.getAttribute("is") === "for") {
                            if(helper._items) {
                                let item = helper.getAttribute("item");
                                for(let i=0;i<helper._items.length;i++) {
                                    let data = actualData[i];
                                    let item = helper.getAttribute("item");
                                    if(data) {
                                        if(typeof helper._items[i] === "object") {
                                            this.establishBindings(helper._items[i].itemProperty, {[item] : data});
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for(let i in properties) {
            let actData = actualData[i];
            if(!actData || typeof actData === "string" || typeof actData === "number" || typeof actData === "boolean") {
                if(!actualData._bindings) {
                    makeSet(actualData, "_bindings");
                }
                addBindings(actualData._bindings,properties);
            } else {
                if(!actData._bindings) {
                    makeSet(actData, "_bindings");
                }
                addBindings(actData._bindings,properties[i]);
                if(typeof properties[i] === "object") {
                    this.establishBindings(properties[i], actData);
                }
            }
        }
    },
    "removeSelectedBindingDeep" : function(binding, actualData, fromDisConnect) {
        var del = "delete";
        if(!actualData && !fromDisConnect) {
            return;
        }
        if(actualData && actualData._bindings) {
            deleteBindingCheckSize(actualData, "_bindings", binding);
        }
        for(let i in binding) {
            let actData;
            if(actualData){
                actData = actualData[i];
            }   
            if(actData && actData._bindings) {
                deleteBindingCheckSize(actData, "_bindings", binding[i]);
            }
            if(typeof binding[i] === "object") {
                this.removeSelectedBindingDeep(binding[i], actData ,fromDisConnect);
            }
        }
        if(fromDisConnect){
            let dynNodes = binding._dynamicNodes;
            let helperNodes = binding._helperNodes;
            if(dynNodes && dynNodes.length){
                binding._dynamicNodes.$splice(0,dynNodes.length);   
            }
            if(helperNodes && helperNodes.size){
                helperNodes.clear();
            }
        }
        if(binding && binding._forHelpers) {
            let objbind = binding._forHelpers.toArrayLyte();
            for(let i=0;i<objbind.length;i++){
                let fH = objbind[i];
                if(fH.getAttribute("is") === "for") {
                    let item = fH.getAttribute("item");
                    let items = fH._attributes.items;
                    let itemCases = fH._items;
                    for(let i=0;i<itemCases.length;i++) {
                        this.removeSelectedBindingDeep(itemCases[i].itemProperty, items[i], fromDisConnect);
                    }
                } else {
                    if(fH._propBindingObject) {
                        if(actualData && actualData._bindings) {
                            deleteBindingCheckSize(actualData, "_bindings", fH._propBindingObject);
                            this.removeSelectedBindingDeep(fH._propBindingObject, actualData, fromDisConnect);
                        }
                    }
                }
            }
        }
    },
    "removeAllBindings" : function(properties, data) {
        var del = "delete";
        for(let key in properties) {
            if(data[key] && data[key]._bindings) {
//                    data[key]._bindings[del](properties[key]);
//                    if(!data[key]._bindings.size) {
//                        delete data[key]._bindings;
//                    }
                deleteBindingCheckSize(data[key], "_bindings", properties[key]);
            }
            if(data[key] && typeof data[key] !== "string") {
                _LC.removeAllBindings(properties[key], data[key]);
            }
        }
    },
    "affectChanges" : function(item, contextAlreadySwitched,oldValue,setterScope,newValue,stack,callLengthObserver) {
        if(item._dynamicNodes) {
            for(let i=0;i<item._dynamicNodes.length;i++) {
                item._dynamicNodes[i]._callee.updateNode(item._dynamicNodes[i], item._path);
            }
        }
        let propPath = item._path;
        if(item._helperNodes) {
            let nodes = [],itemHelperNodes = item._helperNodes.toArrayLyte();
            for(let s=0;s<itemHelperNodes.length;s++){
                if(!item._helperNodes.has(itemHelperNodes[s])) {
                    continue;
                }
                if(itemHelperNodes[s].getAttribute("is") === "for" && itemHelperNodes[s]._items) {
                    let innerContextSwitchArray = [];
                    _LC.adCx(itemHelperNodes[s], innerContextSwitchArray);
                    let  indexValue = itemHelperNodes[s].getAttribute("index");
                    let itemValue = itemHelperNodes[s].getAttribute("item");
                    let callee = itemHelperNodes[s]._callee;
                    let initialItemValue = callee.component.data[itemValue];
                    let initialIndexValue = callee.component.data[indexValue];
                    let initialItemProp = callee._properties[itemValue];
                    let initialIndexProp = callee._properties[indexValue];
                    let items = itemHelperNodes[s]._attributes.items;
                    for(let i=0;i<itemHelperNodes[s]._items.length;i++) {
                        callee.component.data[itemValue] = items[i];
                        callee.component.data[indexValue] = i;
                        callee._properties[itemValue] = itemHelperNodes[s]._items[i].itemProperty;
                        if(itemHelperNodes[s]._items[i]._dynamicProperty[propPath]) {
                            nodes = itemHelperNodes[s]._items[i]._dynamicProperty[propPath];
                            for(let i=0;i<nodes.length;i++) {
                                nodes[i]._callee.updateNode(nodes[i], propPath);
                            }
                        }
                    }
                    callee.component.data[itemValue] = initialItemValue;
                    callee.component.data[indexValue] = initialIndexValue;
                    callee._properties[itemValue] = initialItemProp;
                    callee._properties[indexValue] = initialIndexProp;
                    _LC.rmCx(itemHelperNodes[s], innerContextSwitchArray);                                    
                } else if(itemHelperNodes[s].getAttribute("is") === "forIn" && itemHelperNodes[s]._items) {
                    let innerContextSwitchArray = [];
                    _LC.adCx(itemHelperNodes[s], innerContextSwitchArray);
                    let  indexValue = itemHelperNodes[s].getAttribute("key");
                    let itemValue = itemHelperNodes[s].getAttribute("value");
                    let callee = itemHelperNodes[s]._callee;
                    let initialItemValue = callee.component.data[itemValue];
                    let initialIndexValue = callee.component.data[indexValue];
                    let initialItemProp = callee._properties[itemValue];
                    let initialIndexProp = callee._properties[indexValue];
                    let object = itemHelperNodes[s]._attributes.object;
                    for(let key in itemHelperNodes[s]._items) {
                        callee.component.data[itemValue] = object[key];
                        callee.component.data[indexValue] = key;
                        callee._properties[itemValue] = itemHelperNodes[s]._items[key].itemProperty;
                        if(itemHelperNodes[s]._items[key]._dynamicProperty[propPath]) {
                            nodes = itemHelperNodes[s]._items[key]._dynamicProperty[propPath];
                            for(let i=0;i<nodes.length;i++) {
                                nodes[i]._callee.updateNode(nodes[i], propPath);
                            }
                        }
                    }
                    callee.component.data[itemValue] = initialItemValue;
                    callee.component.data[indexValue] = initialIndexValue;
                    callee._properties[itemValue] = initialItemProp;
                    callee._properties[indexValue] = initialIndexProp;
                    _LC.rmCx(itemHelperNodes[s], innerContextSwitchArray);    
                } else {
                    nodes = itemHelperNodes[s]._dynamicProperty[item._path] || [];
                    let contextSwitchArray = [];
                    if(nodes.length) {
                        _LC.adCx(itemHelperNodes[s], contextSwitchArray);
                        for(let i=0;i<nodes.length;i++) {
                            nodes[i]._callee.updateNode(nodes[i], item._path);
                        }
                        _LC.rmCx(itemHelperNodes[s], contextSwitchArray);    
                    }
                    
                }
            }
        }
        if(item._observers) {
            let objbind = item._observers.toArrayLyte();
            let cond = callLengthObserver == false ? false : oldValue != undefined || newValue != undefined;
            if(cond){
                for(let i=0;i<objbind.length;i++){
                    let observer = objbind[i];
                    let obsObj = {type:"change",oldValue:oldValue,newValue:newValue, item: item._path};
                    if(observer.callee && observer.callee.component){
                        if(stack && observer.isObjectObserver){
                            obsObj.observer = observer;
                            stack.$push(obsObj);
                        }else{
                            observer.observer.value.call(  observer.callee.component, obsObj);                      
                        }
                    }
                    else{
                        var scope = setterScope ? setterScope : window;
                        if(Array.isArray(scope)){
                            var sLen = scope.length;
                            for(var k=0;k<sLen;k++){
                                var itm = scope[k];
                                observer.observer.value.call( itm, obsObj);
                            }
                        }
                        else{
                            observer.observer.value.call( scope, obsObj);                      
                        }
                    }
                }
            }
        }
        if(Array.isArray(item)){
            for(var i=0;i<item.length;i++){
                for(let key in item[i]) {
                    this.affectChanges(item[i][key], true,oldValue?(oldValue[i]?oldValue[i][key]:oldValue[i]):oldValue,setterScope,newValue?(newValue[i]?newValue[i][key]:newValue[i]):newValue);
                }
            }
        }
        else{
            for(let key in item) {
                var oldV = oldValue ? oldValue[key] : oldValue, newV = newValue ? newValue[key] : newValue;
                if(key == "*" && item[key].hasOwnProperty("_observers")){
                    oldV = oldValue;
                    newV = newValue
                }
                this.affectChanges(item[key], true, oldV, setterScope, newV,stack);
            }
        }
    },
    "executeObserver": function(stack){
        stack.forEach(function(obj){
            obj.observer.observer.value.call( obj.observer.callee && obj.observer.callee.component ? obj.observer.callee.component : setterScope ? setterScope : window ,{type:obj.type,oldValue:obj.oldValue,newValue:obj.newValue, item: obj.item});   
        });
    },
    "skipArgProcessing" : function(cloneActObj,ev,target) {
        if(cloneActObj.skipArgProcessing) {
            let args = cloneActObj.args = cloneActObj.actArgs;
            args.$shift();
            var eventIndex = args.indexOf("__lyteEvent__");
            var nodeIndex = args.indexOf("__lyteNode__");
            if(eventIndex !== -1) {
                args[eventIndex] = ev;
            } 
            if(nodeIndex !== -1) {
                args[nodeIndex] = target;
            }
        } else {
            cloneActObj.args.$shift();
        }
    },
    // getDV added
    // "getDV" : function(value){    
    //     var result = [],ref = result,arr = [],data = "",strStack = [],arrayStack = [],refStack = [],strLast,str;
    //     for(var i=0;i<value.length;i++){
    //         if(value[i] === "."){
    //             if(data.length){
    //                 ref.$push(data);
    //             }
    //             data = "";
    //             continue;
    //         }
    //         else if(value[i] === "["){
    //             arrayStack.$push(i)
    //             if(data.length){
    //                 ref.$push(data);
    //             }
    //             while(value[i+1] === "\s"){
    //                 i++;
    //             }
    //             if(value[i+1] === "\"" || value[i+1] === "'"){
    //                 strStack.$push(value[i+1]);
    //                 strLast = value[i+1];
    //                 i++;
    //             }
    //             else if(arr.length){
    //                 ref.$push([]);
    //                 refStack.$push(ref);
    //                 ref = ref[ref.length-1];
    //             }else{
    //                 arr.$push([]);
    //                 refStack.$push(ref);
    //                 ref = arr[arr.length-1];
    //             }
    //             data = "";
    //             continue;
    //         }
    //         else if((value[i] === "\"" || value[i] === "'" ) && value[i++] === strLast){
    //             while(value[i] === "\s" && value[i] != "]"){
    //                 i++;
    //             }
    //             strStack.$pop();
    //             str = true;
    //         }
    //         if(value[i] === "]"){
    //             arrayStack.$pop();
    //             if(data.length){
    //                 if(str === true){
    //                     ref.$push(data);    
    //                 }
    //                 else if(!isNaN(parseInt(data))){
    //                     if(refStack.length){
    //                         ref = refStack.$pop();
    //                         if(arr.length && Array.isArray(ref[ref.length-1]) && !ref[ref.length-1].length){
    //                             ref.$pop();
    //                         }
    //                         ref.$push(data);
    //                         if(!arrayStack.length && arr.length){
    //                             arr.$shift();
    //                         }
    //                     }
    //                 }
    //                 else{
    //                     ref.$push(data);
    //                 }
    //             }
    //             if(!arrayStack.length && arr.length){
    //                 result.$push(arr.$shift());
    //                 ref = result;
    //             }
    //             else if(refStack.length && !arr.length){ 
    //                 ref = refStack.$pop();
    //             }
    //             data = "";
    //             str = "";
    //             continue;
    //         }
    //         data = data.concat(value[i]);
    //     }
    //     if(data.length){
    //         result.$push(data);
    //     }
    //     if(strStack.length || arrayStack.length){
    //         console.log("check the syntax",strStack,arrayStack);
    //     }
    //     return result;
    // },
    "ccDelay" : [],
    "callCC" : function() {
        this.ccDelay.forEach(function(item) {
            if(item.component) {
                item.actualConnectedCallback();
            }
        });
        this.ccDelay = [];
    },
    "getDD":function(context,dataArr){
        var self = context;
        dataArr.forEach(function(item,index){
            if(Array.isArray(item)){
                if(context == undefined){
                    return undefined;
                }
                var inner = _LC.getDD(self,item);
                if(inner == undefined){
                    return undefined;
                }
                context = context[inner];
            }else{
                if(context == undefined){
                    return undefined;
                }
                context = context[item];
            }
        });
        return context;
    },

    "processStatic" : function(temp) {
        let arr = temp.innerHTML.split("__**");
        let newArr = [];
        for(var i=0;i<arr.length;i++) {
            if(arr[i].startsWith("--Lyte")) {
                newArr.$push(parseInt(arr[i].substring(6)));
            } else {
                newArr.$push(undefined);
            }
        }
        arr.cc = newArr;
        return arr;
    },
    "findLastNodeL" : function(lastNode1,count,node){
        var totalNodeIndex = 0;
        if(count != undefined){
            totalNodeIndex = count; 
        }
        var helperNode;
        switch(node.getAttribute("is")) {
            case "for" : 
                if(node._helpers[totalNodeIndex]){
                    helperNode = node._helpers[totalNodeIndex][0];   
                }
                if(!lastNode1) {
                    if(node._forContent[0]){
                        lastNode1 = node._forContent[0][0];
                    }
                }
                break;
            case "forIn" : 
                if(node._helpers[node._keysArray[0]]){
                    helperNode = node._helpers[node._keysArray[0]][0];
                }
                if(!lastNode1) {
                    if(node._forContent[node._keysArray[0]]){
                        lastNode1 = node._forContent[node._keysArray[0]][0];
                    }
                }                   
                break;
            case "if" : 
            case "switch" : 
                helperNode = node._helpers[totalNodeIndex];
                if(!lastNode1) {
                    lastNode1 = node._caseContent[0];
                }
            break;
            case "component" : 
                lastNode1 = lastNode1._renderedComponent[lastNode1._currentComponent] || lastNode1;
                return lastNode1;
        }
        if(!lastNode1){
            lastNode1 = node._placeHolder;
        }
        if(helperNode && (lastNode1 == helperNode._placeHolder)) {
            lastNode1 =  this.findLastNodeL(undefined, undefined, helperNode);
        }
        return lastNode1;
    },
    "processAction" : function(node) {
        Array.from(node.querySelectorAll('[lyteaction]')).forEach(function(item) { 
            let locIndex = item.attributes.lyteaction.value;
            item._boundEvents = _LC.fRP[locIndex];
            delete _LC.fRP[locIndex];
            // _LC.$pushFrc(locIndex);
            // item._boundEvents = JSON.parse(item.attributes.lyteaction.value);
            var _cx = item._boundEvents._cx;
            let boundEvents = item._boundEvents;
            delete boundEvents._cx;
            let componentName = boundEvents.componentName;
            delete boundEvents.componentName;
            for(var key in item._boundEvents) {
                if(key.indexOf("-") !== -1) {
                    item._actions = item._actions || {};
                    item._actions[key] = new CustomEvent(key);
                    item._actions[key].processAction = item._boundEvents[key];
                    item._boundEvents[key].actArgs.$shift();
                    let nodeIndex = item._boundEvents[key].actArgs.indexOf("__lyteNode__");
                    if(nodeIndex !== -1) {
                        item._boundEvents[key].actArgs[nodeIndex] = item;
                    }
                    item._boundEvents[key].args = item._boundEvents[key].actArgs;
                    delete item._boundEvents[key];
                } else {
                    let actArgs = deepCopyObject(item._boundEvents[key].args);
                    let actName = actArgs.$splice(0,1)[0];
                    actName = actName.startsWith("'")? actName.replace(/'/g,''):  actName;
                    let actString = getArgString(actName, actArgs);
                    item.setAttribute(key.startsWith("on") ? key.substr(2) : key ,componentName+" => "+ actString);
                    if(!item._boundEvents[key].globalEvent) {
                        item.addEventListener(key,globalEventHandler);
                    }
                }
            }
            item._boundEvents._cx = _cx;
            item.removeAttribute("lyteaction");
            //item._boundEvents = item.
        });
    },
    "getCtxVal" : function(context,val){
        if(context != undefined){
            return context[val];
        }else{
            return undefined;
        }
    },
    "get" : function(context, path, ac,cache) {
        if(!ac) {
            ac = [];
        }
        if(cache && cache.hasOwnProperty(path)){// cache.cacheData[path]
            var nodeValue = cache[path]._data; /* put as local variable due to error. plz cross check - christo */
            if(cache[path]._dyn){
                cache[path]._dyn.forEach(function(item){
                    ac.$push(item);
                });
            }
            return nodeValue;
        }
        else{
        try{
            if(path.search(/^\$\./g)!=-1){
                return Jwalk(context,path);
            }
            let arr = path.match(/([^[\]]+|\[\])/g);
            let initialContext = context;
            ac.$push(arr[0]);
            let locArr = arr[0].split('.'); 
            for(let k=0;k<locArr.length;k++) {
                context = _LC.getCtxVal(context,locArr[k])
            }
            for(let i=1;i<arr.length;i++) {
                let locVal = arr[i];
                //this is context switching
                if(locVal.startsWith(".")) {
                    //direct context switching
                    let locArr = locVal.substring(1).split('.');
                    for(let k=0;k<locArr.length;k++) {
                        context = _LC.getCtxVal(context,locArr[k])
                    }
                    // ac[ac.length -1] = ac[ac.length - 1] + locVal;
                    ac[0] = ac[0] + locVal;
                } else if(locVal.startsWith("'") || locVal.startsWith('"') || !isNaN(locVal)) {
                    if(!isNaN(locVal)) {
                        // ac[ac.length-1] = ac[0] + "." + locVal;
                        ac[0] = ac[0] + "." + locVal;
                        context = _LC.getCtxVal(context,locVal)
                    } else {
                        // ac[ac.length-1] = ac[0] + "." + locVal.substring(1, locVal.length -1);
                        ac[0] = ac[0] + "." + locVal.substring(1, locVal.length -1);
                        context = _LC.getCtxVal(context,locVal.substring(1, locVal.length -1))
                    } 
                } else {
                    let length = ac.length;
                    let val = _LC.get(initialContext, locVal, ac);
                    ac[0] = ac[0] + "." + val;
                    context = _LC.getCtxVal(context,val)
                }
                }
                if(cache){
                    cache[path] = {};
                    cache[path]._data = context;  
                    cache[path]._dyn = ac;
                }
            return context;
        } catch(e) {
            return undefined;
        }
        }
    },
    "getNew" : function(context, path) {
        try{
            let arr = path.match(/([^[\]]+|\[\])/g);
            let initialContext = context;
            let locArr = arr[0].split('.'); 
            if(arr.length < 2) {
                if(locArr.length <2) {
                    return {"context": initialContext, "lastKey" : locArr[0]};
                } else {
                    for(var k=0;k<locArr.length-1;k++) {
                        context = context[locArr[k]];
                    }
                    return {"context" : context, "lastKey" : locArr[k]}
                }
            }
            for(let k=0;k<locArr.length;k++) {
                context = context[locArr[k]];
            }
            for(var i=1;i<arr.length - 1;i++) {
                let locVal = arr[i];
                //this is context switching
                if(locVal.startsWith(".")) {
                    //direct context switching
                    let locArr = locVal.substring(1).split('.');
                    for(let k=0;k<locArr.length;k++) {
                        context = context[locArr[k]];
                    }
                } else if(locVal.startsWith("'") || locVal.startsWith('"') || !isNaN(locVal)) {
                    context = context[locVal.substring(1, locVal.length -1)];
                } else {
                    let val = this.get(initialContext, locVal);
                    context = context[val];
                }
                }
            let lastKey = arr[i];
            if(lastKey.startsWith(".")) {
                //direct context switching
                let locArr = lastKey.substring(1).split('.');
                let k=0
                for(;k<locArr.length - 1;k++) {
                    context = context[locArr[k]];
                }
                lastKey = locArr[k];
            } else if(lastKey.startsWith("'") || lastKey.startsWith('"') || !isNaN(lastKey)) {
                lastKey = lastKey.substring(1, lastKey.length -1);
            } else {
                lastKey = this.get(initialContext, lastKey);
            }
            return {"context" : context, "lastKey" : lastKey };
        } catch(e) {
            return undefined;
        }
    },
    "componentGetData" : function(key){
        if(key) {
            return this.get(key);
        } else {
            return this.data;
        }
    },
    "componentSetData" : function(arg0, arg1 ,options) {
        if(typeof arg0 === "string") {
            this.set(arg0, arg1 ,options);
        } else if(typeof arg0 === "object") {
            for(let key in arg0) {
                this.set(key, arg0[key],arg1);
            }
        }
    },
    "componentGetMethods" : function(key) {
        if(key) {
            return this._methods[key];
        } else {
            return this._methods;
        }
    }, 
    "componentHasAction" : function(key) {
        if(key && this.$node._actions[key]) {
            return true;
        } else {
            return false;
        }
    }, 
    "componentGetActions" : function(key) {
        if(key) {
            return this.constructor._actions[key];
        } else {
            return this.constructor._actions;
        }
    }, 
    "componentGetObservers" : function() {
        return this.constructor._observers;
    },
    "componentsetActions" : function(arg0,arg1) {
        let actions = this.$node.constructor._actions;
        if(typeof arg0 === "string") {
            actions[arg0] = arg1;
        } else if(typeof arg0 === "object") {
            for(let key in arg0) {
                actions[key] = arg0[key];
            }
        }
    },
    "componentSetMethods" : function(arg0, arg1) {
        if(typeof arg0 === "string") {
            this._methods[arg0] = arg1;
        } else if(typeof arg0 === "object") {
            for(let key in arg0) {
                this._methods[key] = arg0[key];
            }
        }
    },
    "String" : {
        "cache_c":{},
        "cache_d":{},
        "upperCaseFirstLetter" : function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        "lowerCaseFirstLetter" : function(string) {
            return string.charAt(0).toLowerCase() + string.slice(1);
        }, 
        "toCamelCase" : function(string) {
            if(!this.cache_c[string]){
                this.cache_c[string] = string.replace(/(-\w)/g, function(m){return m[1].toUpperCase();});
            }
            return this.cache_c[string];
        }, 
        "dasherize" : function(string) {
            if(!this.cache_d[string]){
                this.cache_d[string] = string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            }
            return this.cache_d[string];
        }
    },
    "appendChild" : function(outlet, component) {
        _LC.ignoreDisconnect = Lyte.ignoreDisconnect = true;
        outlet.appendChild(component);
        _LC.ignoreDisconnect = Lyte.ignoreDisconnect = false;
    },
    "replaceWith" : function() {
        var argumentsArr = Array.from(arguments);
        var oldNode = argumentsArr.$shift();
        _LC.ignoreDisconnect = true;
        var parentNode = oldNode.parentNode;
        for(var i=0,node;node=argumentsArr[i];i++) {
            _LC.insertBeforeNative(parentNode, node, oldNode);
        }
        oldNode.remove();
        _LC.ignoreDisconnect = false;
    },	
    // "removeIfCaseContent" : function(comp,node,direct){
    //     if(!direct){
    //         for(let tempName in node._tempList) {
    //             this.removeDynamicNodes(node._tempList[tempName],comp);
    //         }
    //     }
    // },
    // "removeYieldContent" : function(node,){
    //     if(!direct){
    //         for(let tempName in node._tempList) {
    //             this.removeDynamicNodes(node._tempList[tempName]);
    //         }
    //     }
    // },
    "insertBeforeNative" : function(parent, newNode, refNode) {
        parent.insertBefore(newNode, refNode);
    },
    "insertBefore" : function(referenceNode, newNode, parentNode) {
        _LC.ignoreDisconnect = true;
        if(!parentNode) {
            if(!referenceNode) {
                //@Slicer.developmentStart
                ApiError.error("LC005");
                //@Slicer.developmentEnd
                _LC.ignoreDisconnect = false;
                return;
            } else {
                parentNode = referenceNode.parentNode;
            }
        }
        _LC.insertBeforeNative(parentNode , newNode, referenceNode ? referenceNode : null);
        _LC.ignoreDisconnect = false;
    },
    "insertAfter" : function() {
        var argumentsArr = Array.from(arguments);
        var referenceNode = argumentsArr.shift();
        _LC.ignoreDisconnect = true;
        referenceNode.after.apply(referenceNode, argumentsArr);
        _LC.ignoreDisconnect = false;
    },
    "executeMethod" : function() {
        let args = Array.prototype.slice.call(arguments, 1);
        var methodName = _LC.String.toCamelCase(arguments[0]);
        if(!this._methods[methodName]) {
            //@Slicer.developmentStart
            let app = _LC.getNearestParentApp(this.component);
            ComponentError.error(app, "LC005", methodName, this.$node.tagName);
            //@Slicer.developmentEnd
            return;
        }
        return this._methods[methodName].apply(this, args);
    },
    // "getProperData" : function(obj) {
    //     var dataType = obj.dataType;
    //     var attr = obj.attr;
    //     var newValue = obj.newValue;
    //     var tagName = obj.tagName;
    //     switch(dataType) {
    //     case "boolean" : 
    //         {
    //             if(!newValue || newValue === "false") {
    //                 newValue= false;
    //             } else {
    //                 newValue = true;
    //             }
    //         }
    //         break;
    //     case "object" : 
    //         try{
    //             newValue = JSON.parse(newValue);
    //             if(!(newValue instanceof Object)) {
    //                 Lyte.warn("data type of the value provided for attribute "+ attr + " of " + tagName + " is not valid");
    //             }
    //         } catch(e) {
    //             Lyte.warn("attribute "+attr+ " is not a valid JSON string.");
    //             return;
    //         }
    //         break;
    //     case "array":
    //         try{
    //             newValue = JSON.parse(newValue);
    //             if(!(newValue instanceof Array)) {
    //                 Lyte.warn("data type of the value provided for attribute "+ attr + " of " + tagName + " is not valid");
    //             }
    //         } catch(e) {
    //             Lyte.warn("attribute "+attr+ " is not a valid JSON string.");
    //             return;
    //         }
    //         break;
    //     case "number":
    //         {
    //     let numValue = +newValue;
    //         if(newValue === numValue+"") {
    //             newValue = numValue;
    //         } else {
    //             Lyte.warn("data type of the value provided for attribute "+ attr + " of " + tagName + " is not valid");
    //             return;
    //         }
    //     }
    //         break;
    //     }
    //     obj.newValue = newValue;
    //     return true;
    // }, 
    "cssEscape" : function(string) {
        if(string) {
            return string.replace(/['"]/g, "\\$&");    
        } else {
            return string;
        }
        
    },
    "arrayOverride" : function(){
        let allArrFns = ["push","pop","splice","shift","unshift","concat","replaceAt","shiftObject","remove","removeAt","removeObject","removeObjects","unshiftObject","unshiftObjects","insertAt"];
        for(let i=0; i<allArrFns.length; i++){
            let fnName = allArrFns[i];
            Array.prototype[fnName] = (function() {
                return function() {
                    let actArgs = Array.from(arguments);
                    if(_LC){
                        let opt = {fromOverride : true};
                        actArgs.$unshift(opt,this,fnName);
                        return _LC.aF.apply(_LC, actArgs);
                    }else{
                        return this["$"+fnName].apply(this,actArgs);
                    }
                };
            })();
        }
    },
    "render" : function(componentName, data, outlet, _lyteOptions) {
        var component;
        ltCf.fromV4Render = true;
        let oldLyteV4 = ltCf.lyteV4;
        if(_LC.validateRenderData(data)) {
            var currentReg = _LC.getCurrentRegistryIns();
            var currentRegClass = _LC.getCurrentRegistryIns();
            _LC.setCurrentRegistryIns(_lyteOptions && _lyteOptions.registryInstance ? _lyteOptions.registryInstance : this);
            _LC.setCurrentRegistry(_lyteOptions && _lyteOptions.registry ? _lyteOptions.registry : undefined);
            if(data && data.lyteV4){
                ltCf.lyteV4 = true;
            }
            if(componentName && typeof componentName == "string") {
                //@Slicer.developmentStart
                if(!this._registeredComponents[componentName]){
                    Lyte.warn("Invalid Lyte Component name : '" + componentName + "'. It is not registered with Lyte.");
                }
                Lyte.warn("Passing component name '" +componentName+ "' as string is depricated.");
                //@Slicer.developmentEnd
                component = createElement(componentName);
            } else if(componentName && componentName._compName) {
                componentName._lyteOptions = _lyteOptions;
                component = createElement(componentName._compName);
                if(componentName._lyteOptions && componentName._lyteOptions.attributes && componentName._lyteOptions.attributes.length){
                    componentName._lyteOptions.attributes.forEach(function(attr){
                        if(typeof attr == "object"){
                            component.setAttribute(attr.name,attr.value);
                        }else{
                            component.setAttribute(attr,"");
                        }
                    })
                }
                componentName._lyteOptions = undefined;
            } else {
                //@Slicer.developmentStart
                ApiError.error("LC003");    
                //@Slicer.developmentEnd
                _LC.setCurrentRegistryIns(currentReg); 
                _LC.setCurrentRegistry(currentRegClass);
                ltCf.fromV4Render = false;
                ltCf.lyteV4 = oldLyteV4
                return;
            }
        } else {
            //@Slicer.developmentStart
            ApiError.error("LC0010");
            //@Slicer.developmentEnd
            _LC.setCurrentRegistryIns(currentReg);
            _LC.setCurrentRegistry(currentRegClass)
            ltCf.fromV4Render = false;
            ltCf.lyteV4 = oldLyteV4
            return;
        }
        
        if(data){ 
            component.setData(data);
        }
        if(_lyteOptions && _lyteOptions.methods){
            component.setMethods(_lyteOptions.methods);
        }
        if(outlet) {
            let actOutlet;
            if(typeof outlet == "string"){
                actOutlet = document.querySelector(outlet);
            }else{
                actOutlet = outlet;
            }
            if(actOutlet) {
                if(_lyteOptions && _lyteOptions.clearOutlet){
                    actOutlet.innerHTML = "";    
                }
                actOutlet.appendChild(component);
                component._callee = component.getCallee ? component.getCallee(actOutlet) : undefined;
            } 
            //@Slicer.developmentStart
            else {
                ApiError.error("LC004", outlet);
            }
            //@Slicer.developmentEnd
        }
        _LC.setCurrentRegistryIns(currentReg);
        _LC.setCurrentRegistry(currentRegClass);
        ltCf.fromV4Render = false;
        ltCf.lyteV4 = oldLyteV4
        return component;
    },
    // "renderHTML" : function(string,outlet,options){
    //     var currentReg = _LC.getCurrentRegistryIns();
    //     _LC.setCurrentRegistryIns(options && options.registryInstance ? options.registryInstance : this)
    //     if(typeof string == "string") {
    //         if(outlet) {
    //             let actOutlet;
    //             if(typeof outlet == "string"){
    //                 actOutlet = document.querySelector(outlet);
    //             }else{
    //                 actOutlet = outlet;
    //             }
    //             if(actOutlet) {
    //                 actOutlet.innerHTML = string;
    //             } else {
    //                 Lyte.error("LC008", outlet);
    //             }
    //         }
    //     }
    //     _LC.setCurrentRegistryIns(currentReg);
    // },
    "removeForContent" : function(node){
        for(let s=0;s<node._forContent.length;s++) {
            for(let i=0;i<node._forContent[s].length; i++ ) {
                node._forContent[s][i].remove();
            }
        }
    },
    "removeForInContent" : function(node){
        for(var ind in node._forContent) {
            for(let i=0;i<node._forContent[ind].length; i++ ) {
                node._forContent[ind][i].remove();
            }
        }
    },
    "removeIfContent" : function(node){
        for(let i=0;i<node._caseContent.length; i++ ) {
            node._caseContent[i].remove();
        }
    },
    "removeIfCaseContent" : function(comp,node,direct){
        if(!direct){
            for(let tempName in node._tempList) {
                this.removeDynamicNodes(node._tempList[tempName],comp);
            }
        }
    },
    "removeYieldContent" : function(node){
        if(!direct){
            for(let tempName in node._tempList) {
                this.removeDynamicNodes(node._tempList[tempName]);
            }
        }
    },
    "removeDynamicNodes" : function(node,comp){
        for(let key in node._dynamicProperty) {
            if(node._dynamicProperty[key].isActualNode) {
                node._dynamicProperty[key].isActualNode._helperNodes[del](node);
            }else {
                let helperNodes = comp.getProperty(key)._helperNodes;
                if(helperNodes) {
                    helperNodes.delete(node);
                }
            }
        }
        node._dynamicProperty = {};
    },
    "insertInDom" : function(placeHolder,lastNode,toAppendMain){
        if(placeHolder) {
            _LC.insertBeforeNative(placeHolder.parentNode, toAppendMain, placeHolder);                	
        } else {
            _LC.insertBeforeNative(lastNode.parentNode,toAppendMain, lastNode);                
        } 
    },
    "appendInDom" : function(comp,content){
        comp.appendChild(content);
    },
    "instantiateSecurity" : function(lyteIns){
        lyteIns.Security = {
            "_ourSanitizerInstance_" :{},
            "_userSanitizerInstance_":{}, 
            "_eM" : {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '`': '&#x60;',
                '=': '&#x3D;'
              }, 
            "_eR" : /[&<>"'`=]/g,
            "_eF" : function(str) {
                return this._eM[str];
            }, 
            "escape" : function(string) {
                if (typeof string !== 'string') {
                    string = '' + string;
                }
                return string.replace(this._eR, this._eF.bind(this));
            }
        };
        var sec = {};
        lyteIns.Security._ourSanitizerInstance_ = _LC.Security.createSanitizer(sec);
        lyteIns.Security.createSanitizer = function (obb) {
            return _LC.Security.createSanitizer(obb);
        };
    },
    "setAttribute" : function(node,name,val){
        node.setAttribute(name,val);
    }
}
_LC.setData = function(arg0, arg1) {
    this._initProperties = this._initProperties || {};
    if(typeof arg0 === "string") {
        this._initProperties[arg0] = arg1
    } else if(typeof arg0 === "object") {
        for(let key in arg0) {
            this._initProperties[key] = arg0[key];
        }
    }
}
_LC.setMethods = function(arg0, arg1) {
    this._initMethods = this._initMethods || {};
    if(typeof arg0 === "string") {
        this._initMethods[arg0] = arg1
    } else if(typeof arg0 === "object") {
        for(let key in arg0) {
            this._initMethods[key] = arg0[key];
        }
    }
}
Lyte.$.shadowDiv._duplicateStyle = [];
Lyte.$.assetsDiv._duplicateStyle = [];
Lyte.$.shadowDiv._compList = [];
Lyte.$.shadowDiv._shadowChild = [];
var div = document.createElement("div");
div.setAttribute("id","lessDiv");
Lyte.$.shadowDiv._lessDiv = div;
div._impNames = [];

Lyte._component.init = function(lyteIns){
    _LC.instantiateSecurity(lyteIns);
    lyteIns.addEventListener("afterRouteTransition", function() {
        _LC.chromeBugFix();
    });
}
LyteAddon._component.init = function(addOnIns){
    _LC.instantiateSecurity(addOnIns);
}
Lyte._component.didConnect = function(lyteIns){
    //will be called after afterlookups
    if(lyteIns.getDefaultRegistry){
        let regIns = lyteIns.getDefaultRegistry();
        if(!_LC.isValidReg(regIns)){
            let name =  regIns ? regIns.constructor ? regIns.constructor.name : regIns : regIns ;
            //@Slicer.developmentStart
            RegistryError.error("LC008", name, name);
            //@Slicer.developmentEnd
            return false;
        }
        _LC.setDefaultRegistryIns(regIns);
    }
}
//var toArrayLyte = "toArrayLyte";
//var bindStr = "_bindings";
//var compStr = "component";
//var forHelperStr = "_forHelpers";
//var dynamicNodesStr = "_dynamicNodes";
//var calleeStr = "_callee";
//var getAttributeStr = "getAttribute";
//var hasAttributeStr = "hasAttribute";
//var removeAttributeStr ="removeAttribute";
//var setAttributeStr = "setAttribute";
//var parentNodeStr = "parentNode";
//var nodeNameStr = "nodeName";
//var ownerElementStr = "ownerElement";
var globalDOMEvents = [
    "focus",
    "focusin",
    "focusout",
    "resize",
    "scroll",
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseover",
    "mouseout",
    "change",
    "select",
    "submit",
    "keydown",
    "keypress",
    "keyup",
    "contextmenu"
];
// var registerHelperStr = "registerHelper";
var delStr = "delete";

function defProp() {
	Object.defineProperty.apply(Object, arguments);
}

function makeSet(obj, key) {
	if(!obj[key]) {
		defProp(obj, key, {
			value : new Set(),
			enumerable : false,
			writable : true,
			configurable : true
		})
	}
}
function addBindings(bindings, property) {
    bindings.add(property);
}

function makeArray(obj, key) {
	if(!obj[key]) {
		defProp(obj, key, {
			value : [],
			enumerable : false,
			writable : true,
			configurable : true
		})
	}
}

function createDocFragment() {
	return document.createDocumentFragment();
}

function createElement(elm) {
	return document.createElement(elm);
}

// function insertBefore(parent, newNode, refNode) {
// 	parent.insertBefore(newNode, refNode);
// }

function deleteBindingCheckSize(obj, key, valToDelete) {
	obj[key][delStr](valToDelete);
	if(!obj[key].size) {
		delete obj[key];
	}
}

/*	IE Browser
	Lyte._ie 
	Edge Browser
	Lyte._ed 
	Replace with needed;
	Lyte._rwpf 
	IE / Edge Browser
	Lyte._ms
*/

let userAgent = navigator.userAgent;
// //temporary fix for IE 11
// if(userAgent.match(/rv:11\.0/) && userAgent.match(/Trident/)) {
// 	Lyte._ie = true;
//     window.action = function() {
//         return;
//     }
// }
// if(userAgent.match('Edge')) {
//     var s = createElement("div");
//     s.innerHTML= "<template><div>c</div></template>";
//     if(s.querySelector("template").childNodes.length) {
//         Lyte._ie = true;
//     } else {
//         Lyte._ed = true;    
//     }
//     s.remove()
// }

class Test extends HTMLElement {
    constructor() {
        super();
        if(!this.attributes.t) {
            _LC.frSpecial = true;
        }
    }
}

// if(Lyte._ie || Lyte._ed) {
// 	var doc = createDocFragment();
// 	doc.appendChild(document.createTextNode("  dummy "));
// 	doc.childNodes[0].replaceWith(document.createTextNode("changed"));
// 	if(doc.childNodes[0].textContent !== "changed") {
// 		Lyte._rwpf = true;
// 	}
// 	Lyte._ms = true;
// }

// Lyte.Component = {}//mainClass;
// Lyte.compile = {};//af check
// var _LyteComponent = Lyte.Component;

// let arrayUtils =  function() {
// 	//arrayFunctions
//     return _LC.aF.apply(_LC, arguments);
// };
// let objectUtils =  function() {
// 	//objectFunctions
//     return _LC.oF.apply(_LC, arguments);
// }

_LC.errorNodeDetails = function(node) {
    var str = node.cloneNode(true);
    str.innerHTML = ".....";
    return str.outerHTML;
}
// _LyteComponent.register = function() {
//     _LC.registerComponent.apply(_LC, arguments);
// }
// _LyteComponent.directive = {
//     register : function() {
//         _LC.registerDirective.apply(_LC, arguments);
//     }
// }
// _LyteComponent.destroy = function() {
//     _LC.destroy.apply(_LC, arguments);
// }

// _LyteComponent.registerDirective = function() {
//     _LC.registerDirective.apply(_LC, arguments);
// }

// _LyteComponent.registerHelper = function() {
//     _LC.registerHelper.apply(_LC, arguments);
// }
// _LyteComponent.set = function() {
//     _LC.set.apply(_LC, arguments);
// }
// _LyteComponent.registeredHelpers = {};
// _LyteComponent.registeredComponents = {};
// _LyteComponent.registeredDirectives = [];
function noop() {

}
_LC.registerCustomPropHandler = function(propName) {
    let dasherized = _LC.String.dasherize(propName);
    propName = _LC.String.toCamelCase(propName);
    if(this.customPropHandlers.indexOf(propName) === -1) {
        this.customPropHandlers.$push(propName);
        customElementPrototype.prototype[propName] = function() {
            _LC.customPropRegex = this.component._registryClass.customPropRegex;
            let argsLength = arguments.length;
            let arg0 = arguments[0];
            let options = arguments[2];
            let compData = this.component.data;
            if(!arg0) {
                //Read all the values
                let obj = {};
                for(let key in compData) {
                    if(key.startsWith(propName)) {
                        let objKey = key.substring(propName.length);
                        objKey = _LC.String.lowerCaseFirstLetter(objKey);
                        obj[objKey] = compData[key];
                    }
                }
                return obj;
                
            } else if(typeof arg0 === "string") {
                if(argsLength > 1) {
                    //Set a value
                    this.set(propName+ _LC.String.upperCaseFirstLetter(arg0), arguments[1], options);
                } else {
                    //Read a value
                    let actKey = propName + _LC.String.upperCaseFirstLetter(arg0);
                    return compData[actKey];
                }
            } else if(typeof arg0 === "object") {
                //Write a set of values
                for(let key in arg0) {
                    let objKey = propName + _LC.String.upperCaseFirstLetter(key);
                    this.set(objKey, arg0[key], arguments[1]);
                }
            }
            _LC.customPropRegex  = "";
        }
        this.customPropRegex = new RegExp("^(" + this.customPropHandlers.join("|")+ ")");
    }
}
_LC.unregisterComponent = function(componentName) {//af check
    if(this._registeredComponentClass[componentName]) {
        var compClass = this._registeredComponentClass[componentName];
        var commonClass = this._registeredCommonClass[componentName];
        if(compClass.activeInstances > 0) {
            //@Slicer.developmentStart
            Lyte.warn(
                "There are active instances of the component " + componentName + " and hence cannot be unregistered"
            );
            //@Slicer.developmentEnd
        } else {
            // comp._properties = {};
            let ind = commonClass.component.list.indexOf(compClass);
            if(ind != -1){
                commonClass.component.list.splice(ind,1);
            }
            delete commonClass.componentClass;
            compClass._actions = compClass._template = compClass._dynamicNodes = compClass.__observers = null;            
            compClass._callBacks = {};
            compClass._observers = [];
            compClass._data = undefined;
            compClass._methods = {};
            compClass._classFunc = null;
            compClass._registered = false
            compClass.prototype.get = noop;
            compClass.prototype.set = noop;
            Object.defineProperty(commonClass.prototype, "setData", {
                configurable : true, 
                writable : true, 
                value : function(arg0, arg1) {
                    this._initProperties = this._initProperties || {};
                    if(typeof arg0 === "string") {
                        this._initProperties[arg0] = arg1
                    } else if(typeof arg0 === "object") {
                        for(let key in arg0) {
                            this._initProperties[key] = arg0[key];
                        }
                    }
                }
            });

            Object.defineProperty(commonClass.prototype, "setMethods", {
                configurable : true, 
                writable : true, 
                value : function(arg0, arg1) {
                    this._initMethods = this._initMethods || {};
                    if(typeof arg0 === "string") {
                        this._initMethods[arg0] = arg1
                    } else if(typeof arg0 === "object") {
                        for(let key in arg0) {
                            this._initMethods[key] = arg0[key];
                        }
                    }
                }
            });

            delete this._registeredComponentClass[componentName];
            this._instanceList.forEach(function(registryIns){
                delete registryIns._registeredComponents[componentName];
                delete registryIns.registeredComponents[componentName];
            })
            // var template = document.querySelector("template[tag-name="+componentName+ "]")
            var lyteComponentsDiv = _LC.getComponentsDiv(_LC.lyteComponentsDiv, this.name);
            var template = lyteComponentsDiv.querySelector("template[tag-name="+componentName+ "]");
            if(template) {
                template.remove();
            }
            // lyteht -> lyteHelperTemplates
            var helperTemplate = compClass._helperTemplate;
            if(helperTemplate) {
                helperTemplate.remove();
            }
            if(commonClass._depthTemp) {
                commonClass._depthTemp.remove();    
            }
            if(compClass._style){
                compClass._style = undefined;
            }
        }
        ComponentRegistry._unRegisteredComponents[componentName] = true;
    } 
    //@Slicer.developmentStart
    else {
        Lyte.warn("Component "+ componentName + " not yet registered");
    }
    //@Slicer.developmentEnd
}

var elementPrototype = typeof HTMLElement !== "undefined" ? HTMLElement : Element;

Lyte.$.appendTemplateDiv = function() {
    document.body.appendChild(_LC.tDiv);
    document.body.appendChild(_LC.h1Div);
}

function onDomContentForLyte() {
    // if(!Lyte._ie){//_ie
    	document.body.appendChild(_LC.lyteComponentsDiv);
        //document.body.appendChild(_LC.tDiv);
    // }
    document.body.appendChild(_LC.hDiv);
    let bodyEvents = globalDOMEvents;    
    for(let i=0; i<bodyEvents.length; i++){    
        var evnt = bodyEvents[i];    
        document.body.addEventListener(evnt,globalEventHandler, true);    
    }    
    
    let comp = _LC.toBeRegistered;    
    if(comp.length){    
        for(let j=0; j<comp.length;j++){
            customElements.define(comp[j].name, comp[j].def, undefined, comp[j]._lyteOptions);    
        }    
        _LC.toBeRegistered = [];    
    }
    if(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        var style = createElement("style");
        style.innerHTML = "* { cursor : pointer}";
        document.head.appendChild(style);
    }
    document.head.appendChild(Lyte.$.shadowDiv._lessDiv);
}

var changeEventhandler = function(event) {
	var target = event.target || event.srcElement;
	if(!target._attributeDetails) {
		return;
	}
	var attributeName = "value";
	if(target.type === "checkbox" || target.type=== "radio") {
		attributeName = "checked";
	}
	let contextSwitchArray = [];
	var attrNode ;
	var attrDetail = target._attributeDetails[attributeName]
	if(!attrDetail || !attrDetail.isLbind) {
		return;
	}
	//attrNode = (attributeName === "checked") ? target._attributeDetails[attributeName].bindedNode : target.getAttributeNode(attributeName);
	var callee = target;
	if(!target._callee){
		while(callee && !_LC.isCustomElement(callee) && callee.tagName !== "LYTE-YIELD") {
			if(callee.tagName === "BODY") {
				callee = null;
				break;
			}
			callee = callee.parentNode;
		}
		if(callee && callee.tagName === "LYTE-YIELD"){
			target._callee = callee._registerYield._callee;
		} else {
			target._callee = callee;
		}
	}
	let self = target._callee;
	if(target) {
		_LC.adCx(target, contextSwitchArray);
	}
    let obj = _LC.getNew(self.component.data, attrDetail.dynamicValue);
    if(!obj.context){
        return;
    }
    let lastKeyIndex = +obj.lastKey;
    if(Array.isArray(obj.context) && typeof lastKeyIndex == "number") {
        _LC.aF(obj.context, lastKeyIndex < obj.context.length ? "replaceAt" : "insertAt", lastKeyIndex, target[attributeName]);
    } else {
        _LC.set(obj.context, obj.lastKey, target[attributeName]);
    }
	// _LC.set(obj.context, obj.lastKey, target[attributeName]);
	if(target) {
		_LC.rmCx(target, contextSwitchArray);
	}		
}
document.addEventListener("change", changeEventhandler);
var globalEventHandler = function(ev){
	var evnt = ev.type;
    var target = ev.target,toRemove;
    if(ev.target.shadowRoot){
        return;
    }
    if(/^(click|dblclick|mouseover|mouseout|mousemove|mousedown|mouseup|contextmenu|keydown|keyup|keypress|submit|reset|focus|blur|input|change|select|load|resize|scroll|unload|beforeunload|DOMContentLoaded|readystatechange|touchstart|touchmove|touchend|touchcancel|play|pause|ended|volumechange|durationchange|ratechange|dragstart|drag|dragenter|dragleave|dragover|drop|dragend)$/g.test(evnt) && target.getAttribute && target.getAttribute("lyte-state") != null){
        ev.preventDefault();
		return;
	}
    if(ev.currentTarget !== document.body && !_LCSD.getHostElement(ev.currentTarget)) {
        target = ev.currentTarget;
    }
	if(!window.event){
		toRemove = true;
		window.event = ev;
	}
    let eventStopped = false;
    while(target && target.getAttribute && (!target.getAttribute(evnt) || (target.hasAttribute("disabled") && evnt != "blur")) && target.tagName != "BODY"){
		if(_LC.hasLyteEvents(target, evnt)) {
            eventStopped = _LC.handleLyteEvents(target, ev);
            if(eventStopped) {
                break;
            }
        }
        target = target.parentNode;
	}
    if(eventStopped || !target) {
        return;
    }
 	var callee = target;
    if((target._callee && target._callee.component && target._callee.component.constructor._v3) || (target.component && target.component.constructor && target.component.constructor._v3)){
        return;
    }
	if(!target._callee){
		while(callee && !_LC.isCustomElement(callee) && callee.tagName !== "LYTE-YIELD") {
			if(callee.tagName === "BODY") {
				callee = null;
				break;
			}
			callee = callee.parentNode;
		}
		if(callee && callee.tagName === "LYTE-YIELD"){
			target._callee = callee._registerYield._callee;
		} else {
			target._callee = callee === target ? undefined : callee;
		}
	}
    if(target._callee && !target._callee.component){
        Lyte.warn("Component of the target node is destroyed and so "+ evnt +" wont be triggered.");    
        return;
    }
    event.$lTarget = target;
	if(target._evBoundEvents && target._evBoundEvents[evnt]) {
        //Not needed - but check and remove
		// let actions = target._callee? target._callee.component.constructor._actions : target.component.constructor._actions ;
        //let actions = target.component.constructor._actions;
		let actObj = target._evBoundEvents[evnt];
        let cloneActObj = deepCopyObject(actObj);
        _LC.skipArgProcessing(cloneActObj, ev, target);
		_LC.throwAction.call(target,target,evnt,cloneActObj, undefined, undefined, target, ev, undefined, true);
	} else if(target.getAttribute && target.getAttribute(evnt) && target._boundEvents && target._boundEvents[evnt]){
		// let actions = target._callee.component.constructor._actions;
        // let func = target.getAttribute(evnt).split(" => ")[1];
        let actObj = target._boundEvents[evnt];
		let cloneActObj = deepCopyObject(actObj);
		_LC.skipArgProcessing(cloneActObj, ev, target);
		_LC.throwAction.call(target._callee,target._callee,evnt,cloneActObj, undefined, undefined, target, ev);
	}
	if(target.tagName === "LABEL"){
		var input = target.querySelector("input");
		if(input && input.getAttribute(evnt)){
			// let actions = target._callee.component.constructor._actions;
			// let func = input.getAttribute(evnt).split(" => ")[1];
			//	let actObj = target._callee.constructor.getHelper(func);
            let actObj = target._boundEvents[evnt];
            let cloneActObj = deepCopyObject(actObj);
			_LC.skipArgProcessing(cloneActObj, ev, target);
			_LC.throwAction.call(target._callee,target._callee,evnt,cloneActObj, undefined, undefined, input,ev);
		}
	}
	if(toRemove){
		window.event = undefined;
	}
}
class LyteYield extends HTMLElement {
    constructor() {
        super();   
        this.decideConstructor();
    }
    decideConstructor(){
        if(ltCf.versionBridge){
            let V3Registry = ltCf.versionBridge.component.V3Registry;
            let foundInV3List = V3Registry.allList.v3[this.localName]
            let foundInV4List = V3Registry.allList.v4[this.localName]
            if(foundInV3List){
                if(!foundInV4List || (!this.hasAttribute("lyte-v4") && !ltCf.lyteV4 && !ltCf.v4Render && (ltCf.fromV3Render || _LC.getCurrentRegistry() == V3Registry || foundInV3List))){
                    //v3
                    let v3CompClass = foundInV3List;
                    let self = this;
                    LyteYield._V3InsApi.forEach(function(apiName){
                        self[apiName] = v3CompClass.prototype[apiName];
                    })
                }
            }
        }
    }
    connectedCallback(){
        this._connectedCallback();
    }
    _connectedCallback() {
        this._callee = this._callee || _LC.getCallee(this.parentNode, this);
        let registry,shadowObj,directiveObj;
        if(this._callee){
            registry = this._callee.$component;
           if(registry){
            shadowObj = registry._shadow;
            directiveObj = registry._directive;
           }
        }
        if(directiveObj){
            this._transitionAppend = []
        }
        if(shadowObj && this.shadowRoot){
            shadowObj.insertInLessDiv(this._shadowParent,this._lessDiv)
            shadowObj.updateLessDiv(this._lessDiv,this.shadowRoot._compList);
        }
        if(!this._registerYield && this._callee) {
            var yieldName;
            if(this._callee._fR && this._callee._fR._yieldCallee) {
                this._registerYield = {"_callee" : this._callee._fR._yieldCallee.component.$node};
            } else if(this._callee._yields &&  (yieldName=this.attributes["yield-name"]) && (yieldName = yieldName.nodeValue) && this._callee._yields[yieldName]) {
                this._registerYield = {"_callee" : this._callee._yields[yieldName]._callee};
            }
        }
    }
    disconnectedCallback(){
        this._disconnectedCallback();
    }
    _disconnectedCallback(){
        if(_LC.ignoreDisconnect || this._deleted) {
            return;
        }
        let shadowObj = this._callee.getShadowObj();
        shadowObj && shadowObj.destroyRef(this);
        let registry = this._callee.$component;
        let directiveObj = registry._directive;
        this._deleted = true;
        if(!this._properties) {
            return;
        }
        var nodeContextSwitchArray = [];
        _LC.adCx(this, nodeContextSwitchArray);
        _LC.removeSelectedBindingDeep(this._properties, this.component.data, true);
        let node = this._registerYield;
        if(!node) {
        _LC.rmCx(this, nodeContextSwitchArray);
        return;
        }
        var toAppendContextSwitchArray = [];
        //newContext not needed
        var del = "delete";//for ie 11.0
        _LC.adCx(node, toAppendContextSwitchArray);
        for(let key in this._dynamicProperty) {
            if(this._dynamicProperty[key].isActualNode) {
                this._dynamicProperty[key].isActualNode._helperNodes[del](this);
            }else {
                let helperNodes = node._callee.getProperty(key)._helperNodes;
                if(helperNodes) {
                    helperNodes[del](this);
                }
            }
        }
        this._dynamicProperty = {};
        for(let i=0;i<this._helpers.length;i++) {
            node._callee.removeHelpers(this._helpers[i]);
        }
        this._helpers = [];
        _LC.rmCx(node, toAppendContextSwitchArray);
        _LC.rmCx(this, nodeContextSwitchArray);
        directiveObj && directiveObj.destroyPromises(this);
        // var self = this;
        // setTimeout(function() {
        //     self._registerYield = null
        //     self._callee = null;
        // },0);
    }
    getProperty(key) {
            var arr = key.match(/([^[\].]+|\[\])/g);
            let property = this;
            if(!property._properties[arr[0]]) {
                    property._properties[arr[0]] = {};
            } 
            property = property._properties[arr[0]];
        
            defProp(property, '_path', {enumerable: false, value : arr[0]});
            for(let i=1;i<arr.length;i++) {
                if (arr[i].startsWith("'") || arr[i].startsWith('"')) {//added check
                    arr[i] = arr[i].substring(1, arr[i].length -1);
                }
                    if(!property[arr[i]]) {
                        property[arr[i]] = {};
                        defProp(property[arr[i]], '_path', {enumerable: false, value : property._path + "." + arr[i]});
                }
                property = property[arr[i]];
            }
            return property;
        }
}
LyteYield._V3InsApi = ["_connectedCallback", "getProperty","_disconnectedCallback"]; //no i18n
ltCf._LyteYield = LyteYield;
customElements.define("lyte-yield", LyteYield, undefined, {v4 : true});
ltCf.v3 && !ltCf.instanctiatedBridge && ltCf.instanciateBridge();
//v4 class code
class LyteCustomElement extends HTMLElement {
    constructor(){
        super();
        this.decideConstructor();
    }
    decideConstructor(){
        if(ltCf.versionBridge){
            let V3Registry = ltCf.versionBridge.component.V3Registry;
            let foundInV3List = V3Registry.allList.v3raw[this.localName];
            let foundInV4List = V3Registry.allList.v4raw[this.localName];
            if(foundInV3List){
                if(!foundInV4List || (!this.hasAttribute("lyte-v4") && !ltCf.lyteV4 && !ltCf.fromV4Render && (ltCf.fromV3Render || _LC.getDecidedRegistry() == V3Registry || foundInV3List))){
                    //v3
                    let v3CompClass = V3Registry.allList.v3raw[this.localName];
                    let self = this;
                    LyteCustomElement._V3InsApi.forEach(function(apiName){
                        self[apiName] = v3CompClass.prototype[apiName];
                    })
                }
            }
        }
        //v4 
        this.actualConstructor();
    }
    actualConstructor(){
        this.__lyteCustomElement = true;
        if(this.isClonedNode()){
            this.__cloned = true;
            let attrList = this.attributes;
            for(let i=0; i<attrList.length; i++){
              let attrNode = attrList[i];
              attrNode._lyte = {cloned : true,userCloned : true, name : attrNode.nodeName ,value : attrNode.nodeValue};
            }
        }
        if(!_LC.getDefaultRegistry()){
            //@Slicer.developmentStart
            RegistryError.error("LC009");
            //@Slicer.developmentEnd
            return;
        }
        var obj = {compName : this.localName, type : "customComponent"};
        _LC.getCompRegistry(obj,this);
        if(!_LC.verifyDetails(obj)){
            //@Slicer.developmentStart
            RegistryError.error("LC010", "Raw Component", this.localName);
            //@Slicer.developmentEnd
            return
        }
        var lIns = obj.lIns ,compClass = obj.compClass ,regIns = obj.regIns;
        var compInstance;
        lIns.scopedInstance(compClass,[this],function(ins){
            compInstance = ins;
        },[regIns])
        this.$component = this.$registry = regIns;
        compInstance.$component = compInstance.$registry = regIns;
        compInstance._registryClass = compClass._registryClass;
        this._registryClass = compClass._registryClass;
        _LC.setAddedRegistries(compInstance,this.localName);
        this.component = compInstance;
        compInstance.$node = this;
        let options = compClass._options;
        if(options && options.clone){
            this._allCallbacks = options.clone.allCallbacks;
            if(typeof options.clone.attributeChangedCallback == "object"){
                this._duringClone = options.clone.attributeChangedCallback.duringClone;
                this._afterClone = options.clone.attributeChangedCallback.afterClone;
            }else{
                this._allAttributesCallback = options.clone.attributeChangedCallback;
            }
            this.__connectedCallback = options.clone.connectedCallback;
            this.__disconnectedCallback = options.clone.disconnectedCallback;
        }
        this._actualConnectedCallback = compClass.prototype.connectedCallback;
        this._actualAttributeChangedCallback = compClass.prototype.attributeChangedCallback;
        this._actualDisconnectedCallback = compClass.prototype.disconnectedCallback;
        this._reconnectedCallback = compClass.prototype.reconnectedCallback;
        this._removedCallback = compClass.prototype.removedCallback;
    }
    executeLyteCallbacks(callBack,argArr){
        if(callBack) {
            callBack.apply(this.component, Array.from(argArr));
        }
    }
    isClonedNode(){
        if(this.hasAttribute("lyte-rendered-ce") && !this.LyteConnected || this.__cloned){
            return true;
        }
        return false;
    }
    _isClonedAttribute(attrName,oldVal,newVal){
        let attrNode = this.attributes[attrName];
        if(attrNode._lyte && attrNode._lyte.cloned && attrNode._lyte.name == attrName && attrNode._lyte.value == newVal && oldVal === null){
            return true;
        }
        return false;
    }
    isClonedAttribute(attrName){
        let attrNode = this.attributes[attrName];
        if(attrNode._lyte && attrNode._lyte.userCloned){
            return true;
        }
        return false;
    }
    connectedCallback(){
        this._connectedCallback();
    }
    _connectedCallback(){
        if(_LC.ignoreDisconnect || Lyte.ignoreDisconnect){
            if(this._reconnectedCallback){
                this.executeLyteCallbacks(this._reconnectedCallback,arguments);
            }
            return;
        }
        if(this.isClonedNode() && (this._allCallbacks == false || this.__connectedCallback == false)){
            return;
        }
        this.executeLyteCallbacks(this._actualConnectedCallback,arguments);
        this.setAttribute("lyte-rendered-ce", "");
        this.LyteConnected = true;
    }
    static get observedAttributes() {
        return this._observedAttributes;	
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        this._attributeChangedCallback(attr, oldValue, newValue);
    }
    _attributeChangedCallback(attr, oldValue, newValue){
        var cloneStatus;
        var clonedNode = this.isClonedNode();
        if(clonedNode){
            if(this._allCallbacks == false || this._allAttributesCallback == false){
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
                    if(this._duringClone == false){
                        return;
                    }
                }else{
                    this.attributes[arguments[0]]._lyte.userCloned = false;
                    if(this._afterClone == false){
                        return;
                    }
                }
            }
        }
        this.executeLyteCallbacks(this._actualAttributeChangedCallback,arguments);
        if(clonedNode && this.attributes[arguments[0]] && this.attributes[arguments[0]]._lyte){
            this.attributes[arguments[0]]._lyte.userCloned = cloneStatus;
        }
    }
    disconnectedCallback() {
        this._disconnectedCallback();
    }
    _disconnectedCallback(){
        if(_LC.ignoreDisconnect || Lyte.ignoreDisconnect){
            if(this._removedCallback){
                this.executeLyteCallbacks(this._removedCallback,arguments);
            }
            return;
        }
        if(this.isClonedNode() && (this._allCallbacks == false || this.__disconnectedCallback == false)){
            return;
        }
        this.executeLyteCallbacks(this._actualDisconnectedCallback,arguments);
    }
}
LyteCustomElement._V3InsApi = ["_connectedCallback", "_attributeChangedCallback" ,"_disconnectedCallback","actualConstructor","executeCallbacks","isNewComp"];
ltCf._LyteCustomElement = LyteCustomElement;
ltCf.v3 && !ltCf.instanctiatedBridge && ltCf.instanciateBridge();
//v4 class code
class customElementPrototype extends elementPrototype {
    constructor() {
        super();
        this.decideConstructor();
    }
    decideConstructor(){
        let self = this;
        if(ltCf.versionBridge){
            let V3Registry = ltCf.versionBridge.component.V3Registry;
            let foundInV3List = V3Registry.allList.v3[this.localName]
            let foundInV4List = V3Registry.allList.v4[this.localName]
            if(foundInV3List){
                if((!foundInV4List) || (!this.hasAttribute("lyte-v4") && !ltCf.lyteV4 && !ltCf.fromV4Render && (ltCf.fromV3Render || _LC.getDecidedRegistry() == V3Registry || foundInV3List ))){
                    //v3
                    let v3CompClass = foundInV3List;
                    customElementPrototype._V3InsApi.forEach(function(apiName){
                        self[apiName] = v3CompClass.prototype[apiName];
                    })
                    self.component = self.constructor.component = v3CompClass.component;
                    this.setData = v3CompClass.component.prototype.setData;
                    this.setMethods = v3CompClass.component.prototype.setMethods;
                }else if(foundInV4List){
                    //v4
                    let v4CompClass = foundInV4List;
                    customElementPrototype._v4RegClassApi.forEach(function(apiName){
                        self.constructor[apiName] = v4CompClass[apiName];
                    })
                    customElementPrototype._v4RegProtoApi.forEach(function(apiName){
                        self[apiName] = v4CompClass.prototype[apiName];
                    })
                }
            }
        }
        //v4 
        this.actualConstructor();
    }
    actualConstructor() {
        // this.setData = _LC.setData;
        // this.setMethods = _LC.setMethods;
        if(this.hasAttribute("lyte-rendered") || this._ccCalled) {//aaf check
            this.__lyteIgnore = true;
        	return;
        } else if(ComponentRegistry._unRegisteredComponents[this.localName]){
            this.__lyteIgnore = true;
            var origClass = ComponentRegistry._registeredCommonClass[this.localName];
            origClass._pendingComponents = origClass._pendingComponents || [];
            origClass._pendingComponents.push(this);
            return;
        }
        if(!_LC.getDefaultRegistry()){
            //@Slicer.developmentStart
            RegistryError.error("LC009");
            //@Slicer.developmentEnd
            return;
        }
        let fastRenderIndex;
        let lytePropAttr = this.attributes._lyteprop;
        lytePropAttr = lytePropAttr ? lytePropAttr.nodeValue : undefined;
        let fastRenderedProp = (fastRenderIndex = lytePropAttr) ? _LC.fRP[fastRenderIndex] : undefined;
        let compInstance;// = this.component = new this.constructor.component.list[0]();//this.component = fastRenderedProp ? fastRenderedProp.component : new this.constructor.component();
        var self = this;
        if(!fastRenderedProp){
            var obj = {compName : this.localName, type : "component"};
            _LC.getCompRegistry(obj,this);
            if(!_LC.verifyDetails(obj)){
                //@Slicer.developmentStart
                RegistryError.error("LC010", "Component", this.localName);
                //@Slicer.developmentEnd
                return
            }
            var lIns = obj.lIns ,compClass = obj.compClass ,regIns = obj.regIns;
            lIns.scopedInstance(compClass,[],function(ins){
                compInstance = self.component = ins
            },[regIns])
            this.$component = this.$registry = regIns;
            compInstance.$component = compInstance.$registry = regIns;
            compInstance._registryClass = compClass._registryClass;
            this._registryClass = compClass._registryClass;
            _LC.setAddedRegistries(compInstance,this.localName);
        }else{
            compInstance = self.component = fastRenderedProp.component;
            var compClass = this.constructor.component.list[0];
            this.$component = this.$registry = compInstance.$component;
            this._registryClass = compInstance._registryClass;
        }
        this._properties = {};
        this._compClass = compClass;
        this._tagDirectives = [];
        _LC.directive.setTagDirectives(compClass,this);
        _LC.directive.setAttrFromRender(this,this._tagDirectives);
        compInstance._methods = {};
        
        compInstance._config = this.constructor._config;
        compInstance.actions = Object.assign({},compClass._actions);
        //@Slicer.developmentStart
        var act = compInstance.actions;
        Object.defineProperty(compInstance,"actions",{
            get : function() {
        		Lyte.warn("Accessing actions directly is deprecated. Move the required common code from action block to a common function and access it.");
        		return act;
        	}   
        });
        var met = compInstance.methods;
        Object.defineProperty(compInstance,"methods",{
            get : function() {
        		Lyte.warn("Accessing methods directly is deprecated. Kindly make use of 'this.executeMethod' Api.");
        		return met;
        	}   
        });
        //@Slicer.developmentEnd
        compClass.activeInstances++; 
        let compData;
        
        if(!fastRenderedProp) {
            compData = compInstance.data = {};
            let data = compClass._data ? compClass._data.apply(compInstance) : {};
            var def = "default";
            defProp(compData, '__component__', {
                value : this,
                configurable : true,
                writable: true,
                enumerable : false
            });
            compInstance.__data = data;
            compData.errors = {};
            for(let key in data) {
                var obj = data[key];
                compData[key] = obj[def];
                if(/^(object|array)$/.test(obj.type) && (obj.watch || (obj.hasOwnProperty("items") || obj.hasOwnProperty("properties")) )){
                    establishObjectBinding(compData, key, false,undefined,undefined,obj.watch?true:undefined);
                }
            }
            compData.errors = {};
            compInstance.__data = data;
        }
        
        for(let key in compClass._methods) {
            compInstance._methods[key] = compClass._methods[key];
        }
        if(compInstance.$node) {    
            for(var key in compInstance.$node) {
                if(key != "localName"){
                    this[key] = compInstance.$node[key];
                }
            }
        }
        compInstance.$node = this;
        let _overrides;
        let _config_flag;
        if(compInstance._ssr && compInstance._ssr.config){
            if( compInstance._ssr.config.clientLifeCycleHooks != undefined ){
                _config_flag = compInstance._ssr.config.clientLifeCycleHooks == true || ( typeof compInstance._ssr.config.clientLifeCycleHooks == 'object' ? compInstance._ssr.config.clientLifeCycleHooks.includes('init') : false );
            }
        }
        
        if(!fastRenderedProp) {
            // this.callback("constructor"); //af check // no need
            this._actions = this._actions ? this._actions : {};
            this._callee = this._callee || this.getCallee(this.parentNode);

            //check if it is called from server || to ssr bind
            
            //check if it has ssr contructor for ssr
            //ssrcode_client
            if( _config_flag || !this.hasAttribute( 'server-rendered' ) ){
                if( _overrides && _overrides.constructor && this.serverCall ){
                    _overrides.constructor.apply( this.component );
                }
            } 

            //checking lyte.attr ytpe and given default value type
            for (var key in compData) {
                var field = compData.__component__.component.__data[key];
                var error = _LC.handleValidation(compData, key, compData[key], compInstance ,true);
                if (error) {
                    compData[key] = undefined;
                    var field = compData.__component__.component.__data[key]; 
                    if(field && /^(object|array)$/.test(field.type)){
                        establishObjectBinding(compData, key, undefined,undefined,undefined,field.watch ? true:undefined);
                    }
                }
            }
            // if(compData.errors && Object.keys(compData.errors).length){
            //     Lyte.error("Error in data passed to component '"+ this.localName +"' for the properties - "+Object.keys(compData.errors).toString());
            // }
        } else {
            this._fR = fastRenderedProp;
            delete _LC.fRP[fastRenderIndex];
            // _LC.$pushFrc(fastRenderIndex);
        }
    }
    getDirectiveObj(){
        if(!_LC.directive.bundled){
            return false;
        }
        return _LC.directive;
    }
    getShadowObj(){
        if(this.$registry._shadow){
            return this.$registry._shadow;
        }
        return false;
    }
    getFastObj(){
        if(this.$registry["_turbo"]){
            return this.$registry["_turbo"];
        }
        return false;
    }
    getViewObj(){
        if(this.$registry["_view"]){
            return this.$registry["_view"];
        }
        return false;
    }
    getMethods(arg0) {
        return this.component.getMethods(arg0);
    }
    hasAction(arg0) {
        return this.component.hasAction(arg0);
    }
    setActions(arg0,arg1){
        return this.component.setActions(arg0,arg1);
    }
    getActions(arg0) {
        return this.component.getActions(arg0);
    }
    getObservers() {
        return this.component.getObservers();
    }
    setMethods(arg0, arg1) {
        return this.component.setMethods(arg0, arg1);
    }
    // getData(arg0) {
    //     return this.component.getData(arg0);
    // }
    // setData(arg0, arg1 ,options) {
    //     return this.component.setData(arg0, arg1, options);
    // }
    getCallee(callee){
        return _LC.getCallee(callee, this);
    }
    afterConnected(fastRenderProp,ssrBind) {
        let constr = this.component.constructor;
        //initProperties is used because, we may have cases where the component wouldn't have been registered but 
        //it would be in dom already with some attributes. In those cases we can store the data in _initProperties as key, value.
        //These properties would then be applied to the component, once it gets instantiated. 
        
        //This is done, in order to solve when on a string value update of an if helper, the binding in the true or false case must be established. 
        //Without this, we won't establish the _properties in the component to the actual Data. 
        if(this.getAttribute("_lyteprop")) {
        	return "";
        }
        let obsattr = this.constructor._observedAttributes;
        for(let i=0;i<obsattr.length;i++){
            let key = obsattr[i];
            let prop = this.getProperty(key);
            defProp(prop, '__fromComponent', {
            	value : true,
                enumerable : false
            });
        }
        this.getProperty("errors");
        let app = this.component.getAppOrAddon();
        var $lg = app.__gl, 
        compInstance = this.component,
        compData = compInstance.data;
        compData.$lg = $lg;
        this.component.constructor.prototype.$lg = $lg;
        if(this._initProperties) {
            let initProperties = this._initProperties;
            // if(initProperties["lyteUnbound"] && _LC.migratedv2(app)){ //devmode
            //     Lyte.error("lyteUnbound is moved to directive. so please make use of @unbound");
            // }
            for(let key in initProperties) {
                let actVal;
                let field = compInstance.__data[key]; 
                if(field && field.type !== _LC.getDataType(initProperties[key]) && (initProperties[key] !== undefined  || field.type === "boolean")) {
                    actVal = _LC.typeCast(initProperties[key], compInstance.__data[key].type);
                } else {
                     actVal = initProperties[key];
                }
                let error = _LC.handleValidation(compData, key, actVal, compInstance ,true);
                if(!error) {
                    compData[key] = actVal;    
                    if(field && /^(object|array)$/.test(field.type) && (field.watch || (field.hasOwnProperty("items") || field.hasOwnProperty("properties")))){
                        establishObjectBinding(compData, key, undefined,undefined,undefined,field.watch?true:undefined);
                    }
                }
            }
            this._initProperties = undefined;
        }
        //@Slicer.developmentStart
        if(compData.errors && Object.keys(compData.errors).length){
            ComponentError.error("LC006",this.component.$node.localName,+Object.keys(this.component.data.errors).toString())
        }
        //@Slicer.developmentEnd
        if(this._initMethods) {
            let initMethods = this._initMethods;
            for(let key in initMethods) {
                compInstance._methods[key] = initMethods[key];
            }
            this._initMethods = undefined;
        }
        let _config_flag;
        if( compInstance._ssr && compInstance._ssr.config ){
            if( compInstance._ssr.config.clientLifeCycleHooks != undefined ){
                _config_flag = compInstance._ssr.config.clientLifeCycleHooks == true || ( typeof compInstance._ssr.config.clientLifeCycleHooks == 'object' ? compInstance._ssr.config.clientLifeCycleHooks.includes('init') : false );
            }
        }
        let _overrides;      
        
        //ssrcode client        
        ssrBind && this.cmpBind(fastRenderProp);
        if( _config_flag || !this.hasAttribute( 'server-rendered' ) )
        {
            if( _overrides && _overrides.init && this.serverCall ){
                _overrides.init.apply( this.component );
            }else{        
                this.callback('init');
            }
            this.onCallBack('init');
        }
        // this.callback('init');
        // this.onCallBack('init');
        let templateAttributes = this.component.constructor._templateAttributes;
        if(templateAttributes && templateAttributes.a) {
        	for(let key in templateAttributes.a) {
//        		let attr = templateAttributes.attr[i];
				let attr = templateAttributes.a[key];
        		if((!this.hasAttribute(attr.name) && !compData.hasOwnProperty(attr.name) ) || attr.globalEvent) {
        			if(attr.helperInfo && attr.helperInfo.name === "action") {
                        this._evBoundEvents = this._evBoundEvents || {};
                        let actionName = attr.helperInfo.args[0];
					    let boundName;
					    if(actionName.startsWith('"') || actionName.startsWith("'")) {
						boundName = actionName.substring(1, actionName.length - 1);
					    } else {
						//Lyte.warn("Deprecation warning. Action name should be in quotes");
						boundName = actionName;
                        }
                        let actualAttrName = attr.globalEvent ? attr.name : (attr.name.indexOf("-") !== -1)? attr.name : attr.name.substr(2);
                        this._evBoundEvents[actualAttrName] = {"name" : boundName, "args" : attr.helperInfo.args, "from" : "component"};
                        let prevAttribute = this.getAttribute(attr.name);
                        let currentAttribute = this.component.constructor._template.getAttribute(attr.name);
                        //this.setAttribute("ev:"+attr.name, this.component.constructor._template.getAttribute(attr.name));
                        this.setAttribute(attr.name, currentAttribute + (prevAttribute ? " ; " + prevAttribute : ""));
                    }
                    if(!attr.globalEvent) {
                        attr.from = "component";
                        if(attr.staticValue) {
                            this.setAttribute(templateAttributes.a[key].name, attr.staticValue);
                        }
                        else if(_LC.directive.isDirectiveNode(attr)){
                            let actAttrName = attr.name;
                            let attrName = actAttrName;
                            let duplicateFound;
                            if(!this._specialAttributeDetails){
                                this._specialAttributeDetails = [];
                            }else{
                                this._specialAttributeDetails.forEach(function(oldAttr){
                                    if(oldAttr.hookName == actAttrName){
                                        duplicateFound = true;
                                    }
                                })
                            }
                            if(attr.hasOwnProperty("stringValue")){
                                
                                if(!duplicateFound){
                                    let strAttr = {
                                        hookName : attr.hookName,
                                        hookNode : attr.hookNode,
                                        name : attr.name,
                                        stringValue : attr.stringValue
                                    }
                                    this._specialAttributeDetails.push(strAttr);
                                }
                            }else if(attr.hasOwnProperty("dynamicValue")){
                                this.setAttribute(attr.hookName, "{{dummy}}");
                                let attrNode = this.attributes.getNamedItem(attr.hookName);
                                attr._isDirectiveNode = true;
							    this.bindNode(attrNode, [], undefined, {}, attr, undefined, undefined, true );
                                if(!this._specialAttributeDetails){
                                    this._specialAttributeDetails = [];
                                }
                                let dynAttr = {
                                    hookName : attr.hookName,
                                    hookNode : attr.hookNode,
                                    name : attr.name,
                                    dynamicValue : attr.dynamicValue
                                }
                                this._specialAttributeDetails.push(dynAttr);
                            }
                            
                        }
                        //@Slicer.developmentStart
                        else if(key.startsWith("@")){
                            ComponentError.error("LC007")
                        }
                        //@Slicer.developmentEnd
                        else{
                            this.setAttribute(templateAttributes.a[key].name, "{{dummy}}");
							this.bindNode(this.attributes.getNamedItem(templateAttributes.a[key].name), [], undefined, {}, templateAttributes.a[key], undefined, undefined, true );
                        }
                    }
        			
        		}
        	}
        }
        this.registerYields();
        let dumFlg;
        if(compData.lyteUnbound && !_LC.migratedv2(app)) {
        	_LC.unbound = true;
            dumFlg = true
        }
        let unboundDirective = _LC.directive.getTransitionArg(this,"unbound");
        if(unboundDirective){
            _LC.unbound = true;
        }
        if(!dumFlg){
            this.component.data.lyteUnbound = unboundDirective;//add in future   
        }
        let content = "";
        let fastRender,fastRenderSupported
        let unboundBeta = compData.lyteFastRender;
        fastRender = _LC.directive.getTransitionArg(this,"turbo");
        this.component.data.lyteFastRender = fastRender;
        if(fastRender){
            fastRenderSupported = _LC.directive.getTransitionArg(this,"unbound-supported") || _LC.directive.getTransitionArg(this,"turbo-supported");
            if(!fastRenderSupported){
                //@Slicer.developmentStart
                ComponentError.error("LC008", this.localName)
                //@Slicer.developmentEnd
                this.component.data.lyteFastRender = false;
            }
        }
        
        let fastObj = this.getFastObj();
        if((unboundBeta && !(_LC.migratedv2(app))) || (fastRender && fastRenderSupported && fastObj)){
            content = fastObj.renderFast(constr._dynamicNodes, constr._sta, compInstance, undefined, this);
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    _LC.callCC();
                });
            });
        }
        else {
            content = this.renderNodes(constr._template, constr._dynamicNodes,undefined,undefined, undefined, undefined, this.component.constructor._tC);
        }
        return content;
    }

    //RN
    renderNodes(toAppend, dynamicNodes, helperNode, options, establishBindings, returnVal, templateContent ,yieldComp) {
        options = options || {};
        let content;
        let constr = this.constructor;
        // let Compile = this.component.constructor.Compile;
        let directiveObj = this.getDirectiveObj();
        /*if(Lyte._ie){
            let newFrag = toAppend.cloneNode(true, "lyte");
            this.constructor.splitTextNodes(newFrag);
            content = newFrag;
        }
        else{
            content = toAppend.cloneNode(true, "lyte");
        }*/
        let templateDepthHandlingNeeded = false;
        if (!toAppend) {
            templateDepthHandlingNeeded = true;
            content = _LC.getContentForIE(templateContent , constr);
        } else if(toAppend.hasAttribute("depth")) {
        	templateDepthHandlingNeeded = true;
        	content = _LC.getContentForIE(toAppend , constr);
        } else {
            content = toAppend.content.cloneNode(true, "lyte");
        }
        let updateHelpers = [],processLast = [],helperFunc,stoppedNode;
        
        let toBeInsMap = new Map();
        for(let i=0;i<dynamicNodes.length;i++) {
            let info = dynamicNodes[i], type = info.t, pos = info.p, dynamicN = content, helperInfo;
            dynamicN = getDynamicNode(dynamicN,pos);
            if(directiveObj && info.trans){
                dynamicN._hooksPresent = true;
            }
            if(!dynamicNodes._cache){
                dynamicNodes._cache = {};
            }
            if(type ===  "cD") {
            	if(options.node) {
            		dynamicN._cx = options;
            	} else if(helperNode) {
            		dynamicN._cx	= helperNode._cx;
            	}
                  
                if(directiveObj){
                    directiveObj.infoCD(this,info,dynamicN,helperNode,options);
                }
                // dynamicN._callee = this//af check
            } 
            else if(type === "tX"){
                 this.bindNode(dynamicN, undefined, helperNode, options, dynamicNodes[i], processLast, establishBindings,undefined,dynamicNodes._cache,type,undefined,toBeInsMap);
            }
            else if(type === "a"){
            	dynamicN._attributeDetails = info.a;            	
                if(dynamicN.nodeName === "LYTE-YIELD") {
                    dynamicN._callee = this;
                    dynamicN.component = {}
                    dynamicN.component.data = {};
                    defProp(dynamicN.component.data, "__component__", {
                    	value : dynamicN,
                    	configurable : true,
                    	writable : true,
                        enumerable : false
                    });
                    dynamicN._properties = {};
                    for(let j=0;j<dynamicN.attributes.length;j++) {
                        let attr = dynamicN.attributes[j];
                        if(attr.nodeName !== "is" && attr.nodeName !== "yield-name") {
                            dynamicN._properties[_LC.String.toCamelCase(attr.nodeName)] = {};
                        }
                    }
                }
                let toBeRemoved = [];
				for(let key in info.a) {
                	let attr = info.a[key];
                	attr._depthTemp = info._depthTemp;
                	let attrName = key;
                    if(attr && (attr.dynamicValue || attr.helperInfo)) {
                        if(options.node) {
                                dynamicN._cx = options;
                        }
                        else if(helperNode) {
                            dynamicN._cx = helperNode._cx;
                        }
                        let actionName, boundName;
                        if(attr.helperInfo && attr.helperInfo.name === "action") {
                            dynamicN._boundEvents = dynamicN._boundEvents || {};
                            actionName = attr.helperInfo.args[0];
                            if(actionName.startsWith('"') || actionName.startsWith("'")) {
                                boundName = actionName.substring(1, actionName.length - 1);
                            } else {
                                // Lyte.warn("Deprecation warning. Action name " + actionName + " must be in quotes");
                                boundName = actionName;
                            }
                            let actualAttrName = attr.globalEvent ? attrName : (attrName.indexOf("-") !== -1)? attrName : attrName.substr(2);
                            dynamicN._boundEvents[actualAttrName] = {"name" : boundName, "args" : attr.helperInfo.args};
                            //to bind actions in ssr components
                            let id;
                               
                        }            
			            if(!attr.globalEvent) {
                            /*this.bindNode(dynamicN.getAttributeNode(attrName), toBeRemoved, helperNode, options, attr, undefined, establishBindings);
                             */
                            if(!dynamicN.hasAttribute(attrName)) {
                                dynamicN.setAttribute(attrName, "{{dummy}}");
                            }
                        	var node = this.bindNode(dynamicN.attributes.getNamedItem(attrName), toBeRemoved, helperNode, options, attr, undefined, establishBindings,undefined,dynamicNodes._cache,type,i);
                            if(node !== dynamicN.attributes.getNamedItem(attrName)) {
                            	dynamicN._removedAttributes = dynamicN._removedAttributes || {};
                            	dynamicN._removedAttributes[attrName] = node;
                            }
                        }
                    }
                    if(directiveObj && attr.hookNode){
                        directiveObj.infoA(this,info,dynamicN,helperNode,attr,yieldComp,options);
                    }
                }
                //Added now
                if(info.a && Object.keys(info.a).length) {
                	dynamicN._callee = this;
                }
                for(let d=0;d<toBeRemoved.length;d++) {
                    dynamicN.removeAttribute(toBeRemoved[d]);
                }
            }
            else if(/^(f|fI|cM)$/.test(type)){
            	if(options.node) {
            		dynamicN._cx = options;
            	} else if(helperNode) {
            		dynamicN._cx	= helperNode._cx;
            	}
                if(directiveObj){
                    directiveObj.infoF(this,info,dynamicN,helperNode,type,options);
                }
                dynamicN._dynamicNodes = info.dN;
                // if(Lyte._ms) {
                //     dynamicN._tC = info.templateContent;  
                // }
                if(info.actualTemplate) {
                    dynamicN._tC = info.actualTemplate;
                }
                let returnVal;
                switch(type) {
                case "f" : 
                    dynamicN._ht = info._ht;
                	returnVal = this.updateForHelper(dynamicN,{"type" : "default"} , options.node? options : undefined, establishBindings, info._sta ,yieldComp);
                	break;
                case "fI" : 
                    dynamicN._ht = info._ht;
                	returnVal = this.updateForInHelper(dynamicN,{"type" : "default"} , options.node? options : undefined, establishBindings ,yieldComp);
                	break;
                case "cM" : 
                	returnVal = this.updateDynamicComponent(dynamicN, false, options.node ? options : undefined, establishBindings ,yieldComp);
                }
                if(returnVal) {
                	updateHelpers.$push(returnVal);
                }
            }
            else if(/^(e|s)$/.test(type)){
                var def ="default";
                dynamicN._cases = info.c; 
                dynamicN._hd = info.hd;
                dynamicN._co = info.co
                dynamicN._default = info.d;
                dynamicN._ht = info._ht;
                if(options.node) {
            		dynamicN._cx = options;
            	} else if(helperNode) {
            		dynamicN._cx	= helperNode._cx;
            	}
                if(directiveObj){
                    directiveObj.infoE(this,helperNode,dynamicN,info,options);
                }
                if(info.actualTemplate) {
                    dynamicN._tC = info.actualTemplate;
                    if(!dynamicN._origTemplate) {
                    	// if(Lyte._ie) {
                    	// 	dynamicN._origTemplate = createElement("template")
                    	// } else {
        	            	dynamicN._origTemplate = info._depthTemp.cloneNode(true);
                    	// }
                    	if(dynamicN.hasAttribute("value")) {
                    		dynamicN._origTemplate.setAttribute("value", dynamicN.getAttribute("value"));
                    	}
                        if(dynamicN.hasAttribute("l-c")) {
                    		dynamicN._origTemplate.setAttribute("l-c", dynamicN.getAttribute("l-c"));
                    	}
                    }
                }
                let id,obj;
                
                
                let returnVal = this.updateSwitchHelper(type, dynamicN, options.node ? options : undefined, undefined, establishBindings ,yieldComp,undefined,helperNode,id,i);
                if( !_LC.unbound && ( this._ssrBind || ( this._callee && this._callee._ssrBind ) )){
                    // delete obj.node;
                    // obj.case = dynamicN._currentCase || dynamicN._currentScope; 
                    if(dynamicN.getAttribute("l-c")){
                        obj._new = dynamicN.getAttribute("_new") ? true:undefined;
                        obj.lc = true;
                        obj.case = dynamicN._currentScope;
                    }else{
                        obj.case = dynamicN._currentCase; 
                    }
                }
                if(returnVal) {
                	updateHelpers.$push(returnVal);
                	let isBreak = returnVal.toAppendMain.querySelector("template[is=break]");
                	if(isBreak) {
                		dynamicN._isStopped = "break";
                		content = Compile.getTrimmedContent(content, info.p,undefined);
                		stoppedNode = info.p;
                		break;
                	}
                	let isContinue = returnVal.toAppendMain.querySelector("template[is=continue]");
                	if(isContinue) {
                		dynamicN._isStopped = "continue";
                		content = Compile.getTrimmedContent(content, info.p,undefined);
//                		stoppedNode = info.position;
                		break;
                	}
                }
            } else if(type === "r") {
                dynamicN._childPromise = [];
                
                dynamicN._dynamicNodes = info.dN;
                dynamicN._sta = info._sta;
                dynamicN._ht = info._ht;
                // if(Lyte._ms) {
                //     dynamicN._tC = info.templateContent;  
                // }
//                updateHelpers.$push(dynamicN);
                if(directiveObj){
                    dynamicN._childPromise = [];
                    directiveObj.infoE(this,helperNode,dynamicN,info,options);
                }
                if(options.node) {
                    dynamicN._cx = options;
                }
                else if(helperNode) {
                    dynamicN._cx = helperNode._cx;
                }
                //Added now                
                dynamicN._callee = this;
            } else if(type === "i") {
            	if(options.node) {
            		dynamicN._cx = options;
            	} else if(helperNode) {
            		dynamicN._cx	= helperNode._cx;
            	}
                
                dynamicN.component = dynamicN.component || {"data" : {}};
                dynamicN._properties = dynamicN._properties || {};
                if(directiveObj){
                    directiveObj.infoI(this,info,dynamicN,helperNode,options);
                }
                for(let x=0; x<dynamicN.attributes.length; x++) {
                    let attrObj = dynamicN.attributes[x];
                    let attrName = attrObj.name;
                    let attrValue = attrObj.value;
                    if(attrName !== "yield-name") {
                        if(dynamicN._properties && !dynamicN._properties[attrName]){
                            dynamicN._properties[attrName] = {};
                        }
                        if(dynamicN._attributeDetails && !dynamicN._attributeDetails[attrName]){
                            dynamicN.component.data[attrName] = attrValue;
                        }
                    }
                }
                this.updateYield(dynamicN, false, options.node? options : undefined,helperNode);
                if(info.chld){
                    dynamicN._chld = info.chld;
                }
                if(info.sibl){
                    dynamicN._sibl = info.sibl;
                }
            }
        }
        dynamicNodes._cache = undefined;
        for(let i=0;i<processLast.length;i++) {
             let dynamicPosition = processLast[i].dynamicPositions;
                 let processNode = dynamicPosition.initialNode;
                 let nodeValue = dynamicPosition.dynamicNodeValue;
                 let childLen = nodeValue.childNodes.length;
                 if(!childLen) {
                    nodeValue.appendChild(document.createTextNode(""));
                        childLen = 1;
                 }
                 let startingNode = nodeValue.childNodes[0];
                 if(processNode.parentNode.nodeName === "#document-fragment") {
                 	while(nodeValue.childNodes.length) {
                 		_LC.insertBeforeNative(processNode.parentNode, nodeValue.childNodes[0], processNode);
                    }
                 	processNode.remove();
                 } else {
                	 processNode.replaceWith.apply(processNode,nodeValue.childNodes);
                 }
                 processLast[i].dynamicPositions = {startingNode : startingNode, length: childLen}
        }
        if(toBeInsMap.size){
            toBeInsMap.forEach(function(val, key){
                val.pN.insertBefore(key, val.cN);
                if(val.cN.nextSibling){
                    val.pN.insertBefore(document.createElement("textend"), val.cN.nextSibling);
                }
                else{
                    val.pN.appendChild(document.createElement("textend"));
                }
            })
        }  
        if(stoppedNode) {
        	returnVal = returnVal || {};
        	returnVal.stop = true;
        }
        if(helperNode) {
            if(options.type) {
                helperNode._helpers[options.itemIndex] = updateHelpers;
                if(templateDepthHandlingNeeded) {
                    content = constr.createDocFragment1(content);  
                }
                return content;
            } else {
                helperNode._helpers = helperNode._helpers || [];
                helperNode._helpers.$push.apply(helperNode._helpers, updateHelpers);
                if(templateDepthHandlingNeeded) {
                    content = constr.createDocFragment1(content);  
                }
                return content;
            }
        }
        this.executeBlockHelpers(updateHelpers);
        if(templateDepthHandlingNeeded) {
            content = constr.createDocFragment1(content);  
        }
        return content;
    }

    executeBlockHelpers(updateHelpers, node) {
	    for(let i=0;i<updateHelpers.length;i++) {
            var lastNode = updateHelpers[i].lastNode;
            var parentNode = lastNode.parentNode; 
                
            if(lastNode._placeHolder) {
                lastNode = lastNode._placeHolder;
                parentNode = lastNode.parentNode;
            }
            //parentNode = updateHelpers[i].lastNode.parentNode || updateHelpers[i].lastNode._placeHolder.parentNode;
            _LC.insertBeforeNative(parentNode, updateHelpers[i].toAppendMain, lastNode);
            updateHelpers[i] = updateHelpers[i].lastNode;
	    		// updateHelpers[i].lastNode.parentNode.insertBefore(updateHelpers[i].toAppendMain, updateHelpers[i].lastNode);
	    		// updateHelpers[i] = updateHelpers[i].lastNode;
	    		//updateHelpers[i]._parentIf = node;
//	    		if(!updateHelpers[i]._cx && node) {
//	    			updateHelpers[i]._cx = node._cx;
//	    		}
	    }	
    }

    updateBlockHelpers(updateHelpers,contextSwitchInfo){
        for(let i=0;i<updateHelpers.length;i++) {
            switch(updateHelpers[i].getAttribute('is')) {
            case "f" :
                this.updateForHelper(updateHelpers[i], {"type" : "default"},contextSwitchInfo);
                break;
            case "e" : 
                this.updateSwitchHelper("e",updateHelpers[i],contextSwitchInfo);
                break;
            case "fI" : 
                this.updateForInHelper(updateHelpers[i] , {"type" : "default"},contextSwitchInfo);
                break;
            case "s" :
                this.updateSwitchHelper("s",updateHelpers[i],contextSwitchInfo);
                break;
            case "cM" : 
                this.updateDynamicComponent(updateHelpers[i], false, contextSwitchInfo);
                break;
            case "i" : 
//              this.updateYield(updateHelpers[i], false, contextSwitchInfo);
                break;
            case "yield" : 
            case "r" : 
                if(contextSwitchInfo) {
                    updateHelpers[i]._cx = contextSwitchInfo;
                }
                break;
            default: 
                if(updateHelpers[i].tagName === "LYTE-YIELD") {
                    this.updateYield(updateHelpers[i], false, contextSwitchInfo);
                }
                
            }
         }
    }
    //AttributeChangedCallback will be called for the attributes mentioned in the this._observedAttributes array. 
    static get observedAttributes() {
    		let newArr = [];
            for(let i=0;i<this._observedAttributes.length;i++) {
                newArr[i] = _LC.String.dasherize(this._observedAttributes[i]);
            }
            let customPropHandlers;
            if(this.componentClass){
                customPropHandlers = this.componentClass._registryClass.customPropHandlers
            }else{
                customPropHandlers = _LC.customPropHandlers;
            }
            customPropHandlers.forEach(function(item,index) {
                newArr.$push(_LC.String.dasherize(item));
            })
            return newArr;	
    }

    //Callback from browser, whenever any of the observed attribute changes. 
    //We call the component set, in order to affect the related changes. 
    attributeChangedCallback(attr, oldValue, newValue) {
        this._attributeChangedCallback(attr, oldValue, newValue);
    }
    _attributeChangedCallback(attr, oldValue, newValue){
        if(!this._registryClass || !this.$registry.registeredComponents[this.localName]) {
            return;
        }
        let constr = this.constructor;
       	if((constr._observedMethodAttributes && constr._observedMethodAttributes[attr]) || this.__lyteIgnore) {
   		 	return;
    	}
        let actualAttr = _LC.String.toCamelCase(attr);
        let isCustomProp = this.component._registryClass.customPropHandlers.indexOf(actualAttr);
        if(isCustomProp !== -1) {
            let propValue = this.component._registryClass.customPropHandlers[isCustomProp];
            let lyteProps = newValue;
            if(lyteProps) {
                try{
                    lyteProps = JSON.parse(lyteProps);
                    for(let key in lyteProps) {
                        let actKey = propValue + _LC.String.upperCaseFirstLetter(key);
                        this.set(actKey, lyteProps[key]);
                    }
                } catch (e) {
                    //@Slicer.developmentStart
                    ComponentError.error("LC001", attr, this.localName);
                    //@Slicer.developmentEnd
                }
            }
            return;
        }
        if(oldValue === newValue) {
            return;
        }
        var attrNode = this.attributes.getNamedItem(attr);
        if(attrNode) {
            if(attrNode.__lyteIgnore) {
                this.attributes.getNamedItem(attr).__lyteIgnore = false;
                return;    
            }
        } else if(this["__"+attr]) {
            this["__"+attr] = false;
            return;
        }
        let compInstance = this.component;
        let dataType = compInstance.__data[actualAttr].type;
        if(dataType !== "string") {
        	let obj = {"attr" : attr, "tagName" : this.tagName};
        	newValue = _LC.typeCast(newValue, dataType, obj);
        	if(obj.isError) {
                //@Slicer.developmentStart
        		Lyte.warn(
                    "data type of the value provided for attribute "+attr+ " of " + this.tagName + " is not valid"
                );
                //@Slicer.developmentEnd
        		return;
        	}
        }
        let compData = compInstance.data;
        if(compData[actualAttr] !== newValue) {
            // Null check is done because when we do a removeAttribute directly on a component, the corresponding value expected is that of undefined and not null.
            this.set(actualAttr, newValue === null ? undefined: newValue);
        } else {
            _LC.clearError(compData, actualAttr);
        }
    }

    //Used to remove helpers of specific index in a for helper. 
    removeHelpersSpecificIndex(node, index,totalProms,fakeRemove,previousPromise) {
        if(node.hc){
            fakeRemove = true;
        }
        if(node._helpers[index]) {
            for(let j=0;j<node._helpers[index].length;j++) {
                    this.removeHelpers(node._helpers[index][j],undefined,undefined,totalProms,fakeRemove,previousPromise);
            }
        }
        let directiveObj = this.getDirectiveObj();
        if(directiveObj && node.hc && node._forContent[index] && node._specialNodes){
            directiveObj.removeForIndexContent(this,node,totalProms,previousPromise,index);
        }else if(node._forContent[index]) {
            if(!fakeRemove){
                // this.rmOtherNodes(node,node._forContent[index],totalProms);
                // if(node._helpers[index]) {
                //     for(let j=0;j<node._helpers[index].length;j++) {
                //         directiveObj.removeFromDomNormal(node._helpers[index][j]);
                //     }
                // }
                if(node._forContent[index]) {
                    for(let i=0;i<node._forContent[index].length; i++ ) {
                        node._forContent[index][i].remove();
                    }
                }
            }
            var self = this;
            Object.keys(node._items[index]._dynamicProperty).forEach(function(key) {
                node._dynProps[key]--;  
                if(!node._dynProps[key]) {
                    let prop  = self.getProperty(key);
                    if(prop._helperNodes) {
                        prop._helperNodes[delStr](node);
                    }
                }
            });
            node._items[index] = {"_dynamicProperty" : {}, "itemProperty" : {}, "indexProperty": {}};
        }
    }
    //Used to remove all the helpers within an helper. 
    removeHelpers(node, update, direct,totalProms,fakeRemove,previousPromise) {
        
        if(!direct) {
            node.remove();
            var helpersObj = node.getAttribute("is") === "component" ? this.__dc : this.__h;
            let nodeId = node.__lyteId;
            delete helpersObj[nodeId];
        }
        if(direct && node.hc){
            fakeRemove = true;
        }
        var del = "delete";
        let parent;
        var contextSwitchArray = [];
        let directiveObj = this.getDirectiveObj();
        _LC.adCx(node, contextSwitchArray);
        if(node._forContent) {
            if(node.getAttribute("is") === "for") {
        	if(node._helpers) {
                for(let i=0;i<node._helpers.length;i++) {
                    for(let j=0;j<node._helpers[i].length;j++) {
                            this.removeHelpers(node._helpers[i][j],undefined,undefined,totalProms,fakeRemove,previousPromise);
                    }
                    directiveObj && directiveObj.checkFakeForAndRemove(fakeRemove,node,i);
                }
            }
            if(directiveObj){
                directiveObj.removeForContent(this,direct,fakeRemove,node,totalProms);
            }else{
                _LC.removeForContent(node);
            }
            let key = node.getAttribute("item");
            if(node._items.length) {
                let prop = node._items[0].itemProperty;
                for(let i=0;i<node._items.length;i++) {
                    let dynProp = node._items[i]._dynamicProperty;
                    for(let dP in dynProp) {
                        let property = this.getProperty(dP); 
                        if(property._helperNodes){
                            property._helperNodes[del](node);                    
                        }
                    }    
                }
                if(prop) {
                    for(let i=0;i<node._items.length;i++) {
                        this.removeBindings({[key] : node._items[i].itemProperty}, {[key] : node._attributes.items[i]});
                    }
                }
            }
            if(!update) {
            	if(node._actualBinding) {
            		if(node._attributes.items && node._attributes.items._bindings && node._actualBinding._createdBinding) {
                        node._attributes.items._bindings[del](node._actualBinding);
                    } 
                    if(node._actualBinding._forHelpers) {
                        node._actualBinding._forHelpers[del](node);
                    }
                    var multiplePrpty = node._removedAttributes.items._multipleProperty;
                    if(node._removedAttributes && node._removedAttributes.items && !node._removedAttributes.items.helperValue && multiplePrpty && multiplePrpty[0].actProp._forHelpers) {
                    	multiplePrpty[0].actProp._forHelpers[del](node);
                    }
            	}
            }
            node._items = [];
        } else {
        	if(node._helpers) {
                let keys = Object.keys(node._helpers);
                for(let i=0;i<keys.length;i++) {
                    for(let j=0;j<node._helpers[keys[i]].length;j++) {
                        this.removeHelpers(node._helpers[keys[i]][j],undefined,undefined, totalProms, fakeRemove, previousPromise);
                    }
                    directiveObj && directiveObj.checkFakeForAndRemove(fakeRemove,node,keys[i]);
                }
            }
            if(directiveObj){
                directiveObj.removeForInContent(this,direct,fakeRemove,node,totalProms);
            }else{
                _LC.removeForInContent(node);
            }
            let items = node._items;
            let key = node.getAttribute("key");
            for(let index in items){
                let item = items[index];
                let prop = item.itemProperty;
                let dynamicProp = item._dynamicProperty;
                for(let dP in dynamicProp) {
                    let property = this.getProperty(dP); 
                    if(property._helperNodes){
                        property._helperNodes[del](node);                    
                    }
                }
                if(prop) {
                    this.removeBindings({[key] : node._items[index].itemProperty}, {[key] : node._attributes.object[index]});
                }

            }
            if(!update) {
                if(node._actualBinding) {
                    if(node._attributes.object && node._attributes.object._bindings && node._actualBinding._createdBinding) {
                        node._attributes.object._bindings[del](node._actualBinding);
                    } 
                    if(node._actualBinding._forHelpers) {
                        node._actualBinding._forHelpers[del](node);
                    }
                }
                var multiplePrpty = node._removedAttributes.object._multipleProperty;
                if(node._removedAttributes.object && !node._removedAttributes.object.helperValue && multiplePrpty && multiplePrpty[0].actProp._forHelpers) {
                    multiplePrpty[0].actProp._forHelpers[del](node);
                }
                if(node._propBindingObject && node._attributes.object && node._attributes.object._bindings) {
                    node._attributes.object._bindings[del](node._propBindingObject);
                }
            }
            node._items= {};
          }
        } else if(node._caseContent || node._yieldContent) {
        	if(node._helpers) {
                for(let j=0;j<node._helpers.length;j++) {
                    this.removeHelpers(node._helpers[j],undefined,undefined, totalProms, fakeRemove, previousPromise);
                }
                directiveObj && directiveObj.checkFakeIfAndRemove(fakeRemove,node);
            }
            if(directiveObj){
                directiveObj.removeIfContent(this,direct,fakeRemove,node,totalProms,previousPromise,this);
            }else{
                _LC.removeIfContent(node)
                _LC.removeIfCaseContent(this,node,direct);
                if(node._yieldContent){
                    for(let i=0;i<node._yieldContent.length; i++ ) {
                        node._yieldContent[i].remove();
                    }
                }
            }
            if(node._caseContent){
                for(let key in node._dynamicProperty) {
                    if(node._dynamicProperty[key].isActualNode) {
                        node._dynamicProperty[key].isActualNode._helperNodes[del](node);
                    }else {
                        let helperNodes = this.getProperty(key)._helperNodes;
                        if(helperNodes) {
                            helperNodes[del](node);
                        }
                    }
                }
            }
            node._dynamicProperty = {};
            let viewObj = this.getViewObj()
            if(viewObj){
                viewObj.rmCaseContent(node)
            }
        } else if(node._renderedComponent) {
            for(let key in node._renderedComponent) {
                if(node._renderedComponent[key]) {
                    var renderedComponent = node._renderedComponent[key];
                    if(directiveObj && direct && renderedComponent._hooksPresent){
                        directiveObj.removeRenderedComponent(comp,node,previousPromise);
                    }else{
                        if(!fakeRemove){
                            node._renderedComponent[key].remove();
                            node._renderedComponent[key] = null;
                        }
                    }
                }
            }
        }
          _LC.rmCx(node, contextSwitchArray);
          if(!fakeRemove){
            node._helpers = [];
          }
    }
    updateYield(node, update, contextSwitchInfo,helperNode) {
        let shadowObj = this.getShadowObj();
        let directiveObj = this.getDirectiveObj();
        let app = this.component.getAppOrAddon();
        if(directiveObj){
            node._childPromise = [];
            node._specialNodes = [];
        }
        let constr = this.constructor;
        if(!node._callee) {
            node._callee = this;
        }        
        let toAppend = node._callee._yields[this.getYieldName(node)];
        if(!toAppend) {
        	return;
        }
        node._registerYield = toAppend;
        //ADded now
        let parentScope = toAppend._callee || node._callee._callee;
        if(!parentScope) {
            // if(Lyte._ms) {
            //     var div = createElement("div");
            //     div.innerHTML = toAppend.outerHTML;
            //     // if(Lyte._ie){
            //     //     div.firstChild.innerHTML = toAppend.innerHTML;
            //     //  }
            //     var content1 = div.childNodes[0];
            //     constr.splitTextNodes(content1);
            //     content1 = constr.createDocFragment1(content1);
            //     if(shadowObj && directiveObj && directiveObj.getTransitionArg(this,"shadow-supported") && directiveObj.getTransitionArg(this,"shadow") == true){
            //         shadowObj.updateYield(this,node,toAppend,content1);
            //     }else if(content1){
            //         node.appendChild(content1);
            //     }
            //     else{
            //         node.appendChild(toAppend.content.cloneNode(true, "lyte"));
            //     }
            // } else {
                 if(shadowObj && directiveObj && directiveObj.getTransitionArg(this,"shadow-supported") && directiveObj.getTransitionArg(this,"shadow") == true){
                    shadowObj.updateYield(this,node,toAppend);
                }else{
                    node.appendChild(toAppend.content.cloneNode(true, "lyte"));
                }
            // }
            
            node._helpers = [];
            return;
        }    
	    if(!toAppend._callee) {
    		toAppend._callee = parentScope;
    	} 
        node._dynamicProperty = node._dynamicProperty || {};
        //set values from child component. 
        let obj = {},contextSwitchingArray = {},self = this,contextSwitchArray = [];
        _LC.adCx(toAppend, contextSwitchArray);
        Object.keys(node._properties).forEach(function(key) {
            contextSwitchingArray[key] = {};
            contextSwitchingArray[key].value = parentScope.component.data[key];
            contextSwitchingArray[key].property = parentScope._properties[key];
            parentScope._properties[key] = node._properties[key];
            parentScope.component.data[key] = node.component.data[key];
        }); 
        // htA -> helpertemplateApplied
        if(toAppend._ht && !toAppend._htA) {
            toAppend._htA = true;
            toAppend.content.append(toAppend._ht.content.cloneNode(true));
        }
        let yieldComp = node._callee;
        let content = parentScope.renderNodes(toAppend, toAppend._dynamicNodes || [], node, {"node" : node}, true, undefined, toAppend._tC , yieldComp);
        directiveObj && directiveObj.updateSpecialNodeRef(this,node,toAppend,helperNode);
        if(!_LC.directive.getTransitionArg(node,"unbound")) {
        	_LC.establishBindings(node._properties, node.component.data);
        }else if(!node.component.data.lyteUnbound && !_LC.migratedv2(app)) {        	
        	_LC.establishBindings(node._properties, node.component.data);
        }
        parentScope.executeBlockHelpers(node._helpers);
        Object.keys(node._properties).forEach(function(key) {
            parentScope.component.data[key] = contextSwitchingArray[key].value;
            parentScope._properties[key] = contextSwitchingArray[key].property;
        });
        _LC.rmCx(toAppend, contextSwitchArray); 
        if(shadowObj  && _LC.directive.getTransitionArg(this,"shadow-supported") && _LC.directive.getTransitionArg(this,"shadow") == true){
            shadowObj.updateYield(this,node,toAppend,content,parentScope);
        }else if(content){
            node.appendChild(content);
        }
        else{
            node.appendChild(toAppend.content.cloneNode(true, "lyte"));
        }
    }
    //upddc
    updateDynamicComponent(node, update, contextSwitchInfo, establishBindings) {
    	let returnVal;
        // let registryClass = this._registryClass;
        let directiveObj = this.getDirectiveObj();
        node._callee = this;
        let keepAlive = node.hasAttribute("lyte-keep-alive");
        if(!node._renderedComponent) {
            node._renderedComponent = {};
            let id = _LC.createLyteId(this);
            this.__dc[id] = node;
            node.__lyteId = id;
        }
        
        node._cx = contextSwitchInfo || node._cx;
        node._dynamicProperty = node._dynamicProperty || {};
        let componentName = node.getAttribute("component-name") || (node._attributes ? node._attributes["component-name"] : undefined);
        let componentClass =  node._attributes ? node._attributes["component-class"] : undefined;
        let registryInstance = (node._initProperties ? node._initProperties.lyteRegistry : undefined) || (node._attributes ? node._attributes["lyte-registry"] : undefined);
        let regClass;
        if(!componentName && !componentClass) {
            return;
        }
        //@Slicer.developmentStart
        // else if(componentName){
        //     ComponentError.warn("LC016",componentName);
        // }
        //@Slicer.developmentEnd
        else if(componentClass){
            componentName = componentClass._compName;
            regClass = componentClass._registryClass
        }
        if(directiveObj){
            node._childPromise = []
            directiveObj.checkOngoingPromises(node);
            node._totalPromise = [];
        }
        let component,newComponent = false;
        if(update) {
        	if(keepAlive) {
        		_LC.ignoreDisconnect = true;
        	}
            if(node._renderedComponent[node._currentComponent]) {
                var activeComponent = node._renderedComponent[node._currentComponent];
                if(activeComponent){
                    if(directiveObj && activeComponent._specialNodes && activeComponent._specialNodes.length>0){
                        directiveObj.updateRenderedComp(this,activeComponent,node,keepAlive)
                    }else{
                        if(keepAlive){
                            _LC.hDiv.content.appendChild(activeComponent) 
                        }else{
                            activeComponent.remove();
                        }
                        
                    }
                }
            }
            _LC.ignoreDisconnect = false;
            if(!keepAlive) {
                node._dynamicProperty = {};
            }
            if(node._renderedComponent[componentName] && keepAlive) {
                component = node._renderedComponent[componentName];
            } else {
                if(registryInstance){
                    component = registryInstance.render(componentClass,{});
                }else if(regClass && regClass._instanceList && regClass._instanceList[0]){
                    component = regClass._instanceList[0].render(componentClass,{});
                }
                else{
                    component = createElement(componentName);
                }
                newComponent = true;
            }
        }  else {
            // var flag = false;
            // if(node._initProperties && node._initProperties.lyteRegistry){
            //     _LC.setCurrentRegistryIns(node._initProperties.lyteRegistry);
            //     flag = true;
            // }
            // component = createElement(componentName);
            // if(flag){
            //     _LC.setCurrentRegistryIns(undefined);
            // }
            if(registryInstance){
                component = registryInstance.render(componentClass,{});
            }else if(regClass && regClass._instanceList && regClass._instanceList[0]){
                component = regClass._instanceList[0].render(componentClass,{});
            }
            else{
                component = createElement(componentName);
            }
            newComponent = true;
        }
        if(!keepAlive && node._currentComponent) {
            node._renderedComponent[node._currentComponent] = null;
        }
        if(newComponent) {
//          let componentData = {};
            for(let i=0;i<node.attributes.length;i++) {
                if(node.attributes[i].name !== "is" && node.attributes[i].name !== "component-name" && node.attributes[i].name !== "component-class" && node.attributes[i].name !== "lyte-keep-alive" && !node.attributes[i].name.startsWith("@")) {
                    component.setAttribute(node.attributes[i].name, node.attributes[i].value);
                }
            }
//          componentData = component._attributes;
            if(node._attributes) {
                for(var key in node._attributes) {
                    // if(key == "component-data"){
                    //     component.setData(node._attributes[key]);
                    // }
                	// else 
                    if(key!== "component-name" && key!== "component-class") {
                		component.setData(_LC.String.toCamelCase(key), node._attributes[key]);
                	}
                }
            }
            let toAppend = this.renderNodes(node, node._dynamicNodes, node, undefined, establishBindings, undefined, node._tC);
            component.appendChild(toAppend);
            if(directiveObj && activeComponent){
                component._dependentPromise = activeComponent._totalPromise;
            }
            component._toRegEvnts = node._toRegEvnts;
        }
        if(directiveObj){
            returnVal = directiveObj.updateDynamicComp(this,update,component,activeComponent,node,newComponent);
        }else{
            if(!update) {
                returnVal = {"toAppendMain" : component, "lastNode" : node};
            } else {
                _LC.ignoreDisconnect = true;
                _LC.insertBeforeNative(node.parentNode,component, node);
                _LC.ignoreDisconnect = false;
            }
        }
        component._dynComp = true;
        node._renderedComponent[componentName] = component;
        node._currentComponent = componentName;
	    component._callee = this;
        
	    component._actions = node._actions;
        component.setMethods(node._initMethods);
        component._attributeDetails = node._attributeDetails;
        component._boundEvents = node._boundEvents;
        component._cx = node._cx;
        return returnVal;
    }
    // It constructs/updates the for helper. 
    updateForHelper(node, options, contextSwitchInfo, establishBindings, staticTempArr,yieldComp) {
        let directiveObj = this.getDirectiveObj();
        directiveObj && directiveObj.instanciateForPromises(node);
        let app = this.component.getAppOrAddon();
        if(node.tagName !== "TEMPLATE") {
            Object.keys(node).forEach(function(item) {
            	if(item !== "innerHTML" && item !== "innerText") {
	                node._origTemplate[item] = node[item];            	
            	}
            });
            // if(Lyte._ie) {
            // 	var div = createElement("div");
            //     div.innerHTML = node._tC;
            //     node._origTemplate.innerHTML = div.children[0].innerHTML;
            //     this.constructor.splitTextNodes(node._origTemplate);
            //     if(node.hasAttribute("depth")) {
            //         node._origTemplate.setAttribute("depth", node.getAttribute("depth"));    
            //     }
            // }
            let placeHolder = node._origTemplate._placeHolder = document.createTextNode("");
            node._origTemplate.setAttribute("item", node.getAttribute("item"));
            node._origTemplate.setAttribute("index", node.getAttribute("index"));
            
            if(!_LC.migratedv2(app) && node.hasAttribute("unbound")) {
                //What if unbound is dynamic attribute ? It will be set in _attributes of node._origTemplate -> So No worries (y)
                node._origTemplate.setAttribute("unbound", "true");
            }
            //node.replaceWith(node._origTemplate._placeHolder);
            _LC.replaceWithPf(node, node._origTemplate._placeHolder);
            // node = _LC.replaceWithOrigTemplate(node)
            node = node._origTemplate;
            node.setAttribute("is", "for");
            _LC.apdNode(node, this);
            placeHolder._helper = node;
            
        } else if(!node._placeHolder){
            var emptyTextNode;
            
                emptyTextNode = document.createTextNode("");
                
            //node.replaceWith(emptyTextNode);
            _LC.replaceWithPf(node, emptyTextNode)
            node._placeHolder = emptyTextNode;
            emptyTextNode._helper = node;
            _LC.apdNode(node, this);
        }
        node._sta = node._sta || staticTempArr;
        let callee = this;
        node._callee = this;
        node._attributes = node._attributes || {};
        if(options.type === "update" && node._currentItems === node._attributes.items) {
            return {};
        }
        node._cx = contextSwitchInfo || node._cx;
        let  indexValue = node.getAttribute("index");
        if(!indexValue) {
            node.setAttribute("index", "index");
            indexValue = "index";
        }
        let itemValue = node.getAttribute("item");
        if(!itemValue) {
            node.setAttribute("item", "item");
            itemValue = "item";
        }
        let initialItemValue = callee.component.data[itemValue],initialIndexValue = callee.component.data[indexValue];
        let initialItemProp = callee._properties[itemValue],initialIndexProp = callee._properties[indexValue];
        callee._properties[itemValue] = callee._properties[indexValue] = {};
        let items = node._attributes.items,content = node.content,dynamicNodes = node._dynamicNodes,lastNode = node;
        if(!node._items) {
            node._items = [];
        }
        node._dynProps = node._dynProps || {};
        let lastIndexForIteration;
        let firstIndexForIteration;
        let firstIndex = options.firstIndex;
        let secondIndex = options.secondIndex;
        let thirdIndex = options.thirdIndex;
        var totalNodeIndex = firstIndex + secondIndex;
        var updateIndexProperty = true;
        var indexPropertyStartIndex = 0;
        if(options) {
            switch(options.type) {
            case "remove"  :{
                lastIndexForIteration = firstIndex;
                indexPropertyStartIndex = firstIndex;
                let totalProms = node._totalPromise;
                for(let i=secondIndex; i>0; i--) {
                    let ind = firstIndex + i-1;
                    directiveObj && directiveObj.onGoingForPromise(node,ind)
                    this.removeHelpersSpecificIndex(node, ind, totalProms, undefined,totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                }
                //ln
                /*for(let i=(firstIndex)?firstIndex-secondIndex:firstIndex;i<node._items.length;i++) {
                    let forItem = node._items[i].itemProperty;
                    if(forItem._helperNodes){
                        for (var item of forItem._helperNodes){
                            let ind = item._cx.itemIndex;
                            item._cx.itemIndex = (ind)? ind- secondIndex : ind;
                        }
                    }
                }*/
                for(let i=firstIndex + secondIndex; i<node._items.length;i++) {        
                    node._items[i]._cx.itemIndex = node._items[i]._cx.itemIndex - secondIndex;        
                }
                node._items.$splice(firstIndex, secondIndex);
                node._helpers.$splice(firstIndex, secondIndex);
                node._forContent.$splice(firstIndex, secondIndex);
                node._specialNodes && node._specialNodes.$splice(firstIndex, secondIndex);
                break;
            }
            case "insert" : {
                firstIndexForIteration = firstIndex;
                lastIndexForIteration = secondIndex;
                indexPropertyStartIndex = firstIndex + secondIndex;
                if(node._forContent[firstIndex]) {
                    lastNode = node._forContent[firstIndex][0];
                }
                let newArr = [], newObj = [], newArr1 = [];
                for(let v=secondIndex, k=firstIndex;v>0;v--, k++) {
                    newArr.$push([]);
                    newObj.$push({});
                    newArr1.$push([]);
                }
                node._helpers.$splice.apply(node._helpers, [firstIndex, 0].$concat(newArr));
                node._items.$splice.apply(node._items, [firstIndex, 0].$concat(newObj));
                //ln
//                  for(let i=firstIndex + secondIndex;i<node._items.length;i++) {
//                      let forItem = node._items[i].itemProperty;
//                      for (var item of forItem._helperNodes){
//                          item._cx.itemIndex = item._cx.itemIndex + secondIndex;
//                      }
//                  }
                for(let i=firstIndex + secondIndex; i<node._items.length;i++) {
                    node._items[i]._cx.itemIndex = node._items[i]._cx.itemIndex + secondIndex;
                }
                node._forContent.$splice.apply(node._forContent, [firstIndex, 0].$concat(newArr1));
                node._specialNodes && node._specialNodes.$splice.apply(node._specialNodes,  [firstIndex, 0].$concat(newArr1));
            }
                break;
            case "replace" : {
                firstIndexForIteration = firstIndex;
                lastIndexForIteration = secondIndex;
                indexPropertyStartIndex = firstIndex + secondIndex;
                let totalProms = node._totalPromise;
                directiveObj && directiveObj.onGoingForPromise(node,firstIndex)
                this.removeHelpersSpecificIndex(node, firstIndex, totalProms, undefined, totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                let toAppendMain = createDocFragment();
                if(node._forContent[firstIndex+1]) {
                    lastNode = node._forContent[firstIndex+1][0];
                }
                let newArr = [], newObj = [], newArr1 = [];
                for(let v=secondIndex, k=firstIndex;v>0;v--, k++) {
                    newArr.$push([]);
                    newArr1.$push([]);
                    newObj.$push({});
                }
                node._helpers.$splice.apply(node._helpers,[firstIndex, 1].$concat(newArr));
                node._items.$splice.apply(node._items, [firstIndex, 1].$concat(newObj));
//                  for(let i=firstIndex + secondIndex;i<node._items.length;i++) {
//                      let forItem = node._items[i].itemProperty._forItem;
//                      forItem.itemIndex = forItem.itemIndex + secondIndex - 1 ;
//                  }
                for(let i=firstIndex + secondIndex; i<node._items.length;i++) {
                    node._items[i]._cx.itemIndex = node._items[i]._cx.itemIndex + secondIndex - 1;
                }
                node._forContent.$splice.apply(node._forContent, [firstIndex, 1].$concat(newArr1));
                node._specialNodes && node._specialNodes.$splice.apply(node._specialNodes,  [firstIndex, 1].$concat(newArr1));
                if(options.secondIndex == 1){
                    updateIndexProperty = false;
                }
                break;
            }
            case "splice" : {
                firstIndexForIteration = firstIndex;
                lastIndexForIteration = secondIndex;
                indexPropertyStartIndex = firstIndex + secondIndex;
                let totalProms = node._totalPromise;
                for(let i=thirdIndex;i>0;i--) {
                    let ind = i + firstIndex-1;
                    directiveObj && directiveObj.onGoingForPromise(node,ind)
                    this.removeHelpersSpecificIndex(node, ind, totalProms, undefined, totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                }
                let toAppendMain = createDocFragment();
                if(node._forContent[firstIndex+thirdIndex]) {
                    lastNode = node._forContent[firstIndex+thirdIndex][0];
                }
                let newArr = [], newObj = [], newArr1 = [];
                for(let v=secondIndex, k=firstIndex;v>0;v--, k++) {
                    newArr.$push([]);
                    newArr1.$push([]);
                    newObj.$push({});
                }
                node._helpers.$splice.apply(node._helpers,[firstIndex, thirdIndex].$concat(newArr));
                node._items.$splice.apply(node._items, [firstIndex, thirdIndex].$concat(newObj));
//                  for(let i=firstIndex + secondIndex;i<node._items.length;i++) {
//                      let forItem = node._items[i].itemProperty._forItem;
//                      forItem.itemIndex = forItem.itemIndex + secondIndex - 1 ;
//                  }
                for(let i=firstIndex + secondIndex; i<node._items.length;i++) {
                    node._items[i]._cx.itemIndex = node._items[i]._cx.itemIndex + secondIndex - thirdIndex;
                }
                node._forContent.$splice.apply(node._forContent, [firstIndex, thirdIndex].$concat(newArr1));
                node._specialNodes && node._specialNodes.$splice.apply(node._specialNodes,  [firstIndex, thirdIndex].$concat(newArr1));
                if(options.secondIndex == options.thirdIndex){
                    updateIndexProperty = false;
                }
                break;
            }
            break;
            case "update" : 
            {
                let key = node.getAttribute("item");
//                  this.removeHelpers(node, true);
                let totalProms = node._totalPromise;
                for(let i=node._items.length-1;i>=0;i--) {
                    directiveObj && directiveObj.onGoingForPromise(node,i)
                    this.removeHelpersSpecificIndex(node, i, totalProms, undefined,totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                }
//                  if(node._attributes.items) {
//                      for(let i=0;i<node._attributes.items.length && node._items[i];i++) {
//                          _LC.removeSelectedBindingDeep(node._items[i].itemProperty[key], node._attributes.items[i]);
//                      }
//                  }
                node._items = [];
        }
            case "default" : 
            {
                node._forContent = [];
                if(directiveObj){
                    node._specialNodes = [];
                }
                node._helpers = [];
                firstIndexForIteration = 0;
                lastIndexForIteration = items? items.length : 0 ;
                indexPropertyStartIndex = items? items.length : 0 ;
            }
            //@Slicer.developmentStart
            break;
            default: 
                ComponentError.error("LC009","updateForHelper")
            //@Slicer.developmentEnd
            }
        }
        if(!lastNode) {
            lastNode = node;
        }
        if(lastNode != node && node._helpers.length > 0  && (options.type == "insert" ||"replace"|| "splice") ){
            lastNode = _LC.findLastNodeL(lastNode,totalNodeIndex,node);
        }
        let returnVal;
        var localUnbound = false;
        var initialUnbound = _LC.unbound;
        if((node.hasAttribute("unbound") || (node._attributes && node._attributes.unbound && node._attributes.unbound !== "false")) && !_LC.migratedv2(app)) {
            localUnbound = true;
            _LC.unbound = true;
        }
        if((!node._fRender && (node.getAttribute("unbound") == "lyteFastRender" || (node._attributes && node._attributes.unbound == "lyteFastRender"))) && !_LC.migratedv2(app)) {
            node._fRender = true;
        }
        let unboundDirective = _LC.directive.getTransitionArg(node,"unbound");
        if(unboundDirective){
            if(unboundDirective == "lyteFastRender"){
                //@Slicer.developmentStart
                ComponentError.error("LC010", _LC.errorNodeDetails(node))
                //@Slicer.developmentEnd
            }else{ // if(unboundDirective !== "false")
                localUnbound = true;
                _LC.unbound = true;
            }
        }
        let fastDirective = _LC.directive.getTransitionArg(node,"turbo");
        if(fastDirective){
            if(!node._fRender ){//&& fastDirective !== "false"
                node._fRender = true;
                localUnbound = true;
                _LC.unbound = true;
            }
        }
        node._currentItems = items;        
        if((lastIndexForIteration - firstIndexForIteration) > 0) {
            if(node._ht && !node._htA) {
                node.content.append(node._ht.content.cloneNode(true));
                node._htA = true;
            }
        }
        if(options.type !== "remove") {
            var totalString = "";
            var domArr = [];
            var toAppendMain = createDocFragment();
            for(let k = firstIndexForIteration,v=lastIndexForIteration;v>0; k++, v--) {
                node._helpers[k] = [];
                if(directiveObj){
                    node._specialNodes[k] = [];
                }
                node._items[k] = {"_dynamicProperty" : {}, "itemProperty" : {}, "indexProperty": {}};
                callee.component.data[itemValue] = items[k];
                callee.component.data[indexValue] = k;
                var cacheData = {};
                cacheData[itemValue]={}
                cacheData[itemValue]._data = items[k];
                cacheData[itemValue]._dyn = [itemValue];
                cacheData[indexValue]={}
                cacheData[indexValue]._data = k;
                cacheData[indexValue]._dyn = [indexValue];
                callee._properties[itemValue] = {};
                callee._properties[indexValue] = {};
                let optns = {"itemValue" : itemValue, "itemIndex" : k, "type" : "for", "node" : node, "indexValue" : indexValue};
//                  defProp(callee._properties[itemValue], '_forItem', {
//                      enumerable: false, 
//                      writable: true, 
//                      configurable: true, 
//                      value : optns
//                  });
                node._items[k]._cx = optns;
                let breakCheck = {};
                let toAppend;
                if(node._fRender) {
                    let fastObj = this.getFastObj();
                    let str = fastObj.renderFast(dynamicNodes, node._sta, this.component, undefined, this);
                    totalString = totalString + str;
                    // var template = document.createElement("template");
                    // template.innerHTML = str;
                    // toAppend = template.content;
                } else {
                    dynamicNodes._cache = cacheData;
                    toAppend = this.renderNodes(node.hasAttribute("depth") ? node._depthTemp : node, dynamicNodes, node, optns, establishBindings, breakCheck, node._tC,yieldComp);
                }
                //to bind in ssr components
                
                let dynProps = Object.keys(node._items[k]._dynamicProperty);
                for(let d=0;d<dynProps.length;d++) {
                    let key = dynProps[d];
                    node._dynProps[key] ? node._dynProps[key]++ : (node._dynProps[key] = 1);    
                }
                node._items[k].itemProperty = this.getProperty(itemValue);
                node._items[k].indexProperty = this.getProperty(indexValue);    
//                  if(options.type !== "default") {
                if(!_LC.unbound) {
                	_LC.establishBindings({[itemValue] : node._items[k].itemProperty},{[itemValue]:node._attributes.items[k]});
                }
//                  }
                if(!node._fRender){
                    node._forContent[k] = Array.from(toAppend.childNodes);
                } else {
                    domArr.$push(node._forContent[k] = []);
                }
                //Needs to revisit this and make sure it happen within renderNodes function itself;
//                  if(options.type !== "update") {
                this.executeBlockHelpers(node._helpers[k], node);
                if(!node._fRender) {
                    toAppendMain.appendChild(toAppend);
                }
                if(breakCheck.stop) {
                    break;
                }
            }
            if(node._fRender) {
                var s = document.createElement("template");
                s.innerHTML = totalString;
                toAppendMain.appendChild(s.content);
                _LC.processAction(toAppendMain);
                var childrenArr;
                // if(Lyte._ie) {
                //     childrenArr = [];
                //     var childNodes = toAppendMain.childNodes;
                //     for(var i=0;i<childNodes.length;i++) {
                //         if(childNodes[i].nodeType == 1) {
                //             childrenArr.$push(childNodes[i]);
                //         }
                //     }
                // } 
                // else {
                    childrenArr = toAppendMain.children;
                // }
                for(var i=0;i<domArr.length;i++) {
                    domArr[i].$push(childrenArr[i]);
                }
                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        _LC.callCC();
                    });
                });
            }
            //Provided so that before appending the component to DOM it is reset to previous value
            _LC.unbound = initialUnbound;
            if(options.type === "default") {
                returnVal = {"toAppendMain" : toAppendMain, "lastNode" : lastNode};
            } else {
                if(directiveObj){
                    var dependentPromises = [];
                    directiveObj.getAllDependentPromises(this,dependentPromises,node._totalPromise);
                    directiveObj.insertInDom(this,lastNode._placeHolder,lastNode,toAppendMain,undefined,undefined,dependentPromises);
                }else{
                    _LC.insertInDom(lastNode._placeHolder,lastNode,toAppendMain);
                }
            }
            if(!localUnbound && node._removedAttributes && node._removedAttributes.items && !node._removedAttributes.items.helperValue && node._removedAttributes.items._multipleProperty && node._removedAttributes.items._multipleProperty[0]) {
            	_LC.establishBindings({"items" : node._removedAttributes.items._multipleProperty[0].actProp}, {"items" : items});
            }
        }
        _LC.unbound = initialUnbound;
        if(updateIndexProperty){
            for(let i=indexPropertyStartIndex; i<node._items.length; i++) {
                if(node._items[i].indexProperty) {
                    _LC.affectChanges(node._items[i].indexProperty);
                }
            }
        }
        callee.component.data[itemValue] = initialItemValue;
        callee.component.data[indexValue] = initialIndexValue;
        callee._properties[itemValue] = initialItemProp;
        callee._properties[indexValue] = initialIndexProp;
        node._currentItems = items;
        return returnVal;
    }
    //It constructs/updates forIn Helper.
    //updFIH
    updateForInHelper(node, options, contextSwitchInfo, establishBindings,yieldComp) {
        let directiveObj = this.getDirectiveObj();
        directiveObj && directiveObj.instanciateForPromises(node);
        let app = this.component.getAppOrAddon();
        if(node.tagName !== "TEMPLATE") {
            Object.keys(node).forEach(function(item) {
                if(item !== "innerHTML" && item !== "innerText") {
	                node._origTemplate[item] = node[item];            	
            	}
            });
            // if(Lyte._ie) {
            // 	var div = createElement("div");
            //     div.innerHTML = node._tC;
            //     node._origTemplate.innerHTML = div.children[0].innerHTML;
            //     this.constructor.splitTextNodes(node._origTemplate);
            //     if(node.hasAttribute("depth")) {
            //         node._origTemplate.setAttribute("depth", node.getAttribute("depth"));
            //     }
            // }
            let placeHolder = node._origTemplate._placeHolder = document.createTextNode("");
            node._origTemplate.setAttribute("key", node.getAttribute("key"));
            node._origTemplate.setAttribute("value", node.getAttribute("value"));
            if(node.hasAttribute("unbound") && !_LC.migratedv2(app)) {
                //What if unbound is dynamic attribute ? 
                node._origTemplate.setAttribute("unbound", "true");
            }
            
            //node.replaceWith(node._origTemplate._placeHolder);
            _LC.replaceWithPf(node, node._origTemplate._placeHolder)
            // node = _LC.replaceWithOrigTemplate(node)
            node = node._origTemplate;
            node.setAttribute("is", "forIn");
            _LC.apdNode(node, this);
            placeHolder._helper = node;
        } else if(!node._placeHolder){
            var emptyTextNode;
            
                emptyTextNode = document.createTextNode("");
                
            //node.replaceWith(emptyTextNode);
            _LC.replaceWithPf(node, emptyTextNode);
            node._placeHolder = emptyTextNode;
            _LC.apdNode(node, this);
            emptyTextNode._helper = node;
        }
        let callee = this;
        node._callee = this;
        node._attributes = node._attributes || {};
        if(options.type === "update" && node._currentObject === node._attributes.object) {
            return {};
        }
        contextSwitchInfo = contextSwitchInfo ? contextSwitchInfo : node._cx;
        node._cx = contextSwitchInfo;
        let key = node.getAttribute("key");
        if(!key) {
            key = "key";
            node.setAttribute("key", "key");
        }
        let value = node.getAttribute("value");
        if(!value) {
            value = "value";
            node.setAttribute("value", "value");
        }
        let initialKeyValue = callee.component.data[key];
        let initialValueValue = callee.component.data[value];
        let initialKeyProp = callee._properties[key];
        let initialValueProp = callee._properties[value];
        callee._properties[key] = callee._properties[value] = {};
        let object = node._attributes.object;
        let content = node.content;
        let dynamicNodes = node._dynamicNodes;
        let lastNode = node;
        let keysArray = [];
        if(!node._items) {
            node._items = {};
        }
        node._dynProps = node._dynProps || {};
        if(options) {
            switch(options.type) {
            case "delete"  :{
                let totalProms = node._totalPromise;
                directiveObj && directiveObj.onGoingForPromise(node,options.property)
                this.removeHelpersSpecificIndex(node, options.property, totalProms, undefined,totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                var delIndex = node._keysArray.indexOf(options.property);
                if(delIndex > -1) {
                  node._keysArray.$splice(delIndex,1);
                }
                if(node._helpers) {
                    delete node._helpers[options.property];    
                }
                delete node._propBindingObject[options.property];
            }
            break;
            case "add" : {
                keysArray = [options.property];
                node._keysArray.$push(options.property);
            }
            break;
            case "update" : 
            {
                let totalProms = node._totalPromise;
                let keyObjArr = node._keysArray;
                for(let i=keyObjArr.length-1; i>=0; i--){
                    directiveObj && directiveObj.onGoingForPromise(node,keyObjArr[i])
                    this.removeHelpersSpecificIndex(node, keyObjArr[i], totalProms, undefined,totalProms && totalProms.length ? totalProms[totalProms.length-1] : undefined);
                }
                node._keysArray = keysArray = object ? Object.keys(object) : [];
                node._helpers = {};
                node._items = {};
                node._propBindingObject = {};
            }
            break;
            case "default" : 
            {
                node._forContent = {};
                if(directiveObj){
                    node._specialNodes = {};
                }
                node._helpers = {};
                node._keysArray = keysArray = object? Object.keys(object) : [];
//                  keysArray = Object.keys(object);

            }
            //@Slicer.developmentStart
            break;
            default: 
                ComponentError.error("LC009","updateForInHelper")
            //@Slicer.developmentEnd

            }
        }
        let returnVal;
        if(!object) {
            let toAppendMain = createDocFragment();
            if(options.type !== "default") {
            	_LC.insertBeforeNative(lastNode.parentNode,toAppendMain, lastNode);
            } else {
                returnVal = {"toAppendMain" : toAppendMain, "lastNode" : lastNode};
            }    
        }
        let localUnbound = false;
        let initialUnbound = _LC.unbound;
        if((node.hasAttribute("unbound") || (node._attributes && node._attributes.unbound)) && !_LC.migratedv2(app)) {
            localUnbound = true;
            _LC.unbound = true;
        }
        let unboundDirective = _LC.directive.getTransitionArg(node,"unbound")
        if(unboundDirective){
            localUnbound = true;
            _LC.unbound = true;
        }
        node._currentObject = object;
        if(keysArray.length && node._ht && !node._htA) {
            node.content.append(node._ht.content.cloneNode(true));
            node._htA = true;
        }
        if(object && options.type !== "remove") {
            var toAppendMain = createDocFragment();
            node._propBindingObject = node._propBindingObject || {};
            keysArray.forEach(function(itemKey, index, array) {
                node._helpers[itemKey] = [];
                if(directiveObj){
                    node._specialNodes[itemKey] = [];
                }
                node._items[itemKey] = {"_dynamicProperty" : {}, "itemProperty" : {}};
                callee.component.data[key] = itemKey;
                callee.component.data[value] = object[itemKey];
                callee._properties[key] = {};
                callee._properties[value] = {};
                var cacheData = {};
                cacheData[key] = {}
                cacheData[key]._data = itemKey;
                cacheData[key]._dyn = [key];
                cacheData[value] = {}
                cacheData[value]._data = object[itemKey];
                cacheData[value]._dyn = [value];
                let optns = {"itemIndex" : itemKey, "itemValue" : value, "keyValue" : key, "type" : "forIn", "node" : node};
                node._items[itemKey]._cx = optns;
                dynamicNodes._cache = cacheData;
                let toAppend = this.renderNodes(node.hasAttribute("depth") ? node._depthTemp : node, dynamicNodes, node, optns, establishBindings, undefined, node._tC,yieldComp);
                Object.keys(node._items[itemKey]._dynamicProperty).forEach(function(key) {
                    node._dynProps[key] ? node._dynProps[key]++ : (node._dynProps[key] = 1);    
                })
                node._items[itemKey].itemProperty = this.getProperty(value);
                node._propBindingObject[itemKey] = node._items[itemKey].itemProperty;
                node._forContent[itemKey] = Array.from(toAppend.childNodes);
//                    this.updateBlockHelpers(node._helpers[itemKey], optns);
                this.executeBlockHelpers(node._helpers[itemKey], node);
                //to bind in ssr components
                
                toAppendMain.appendChild(toAppend);
            }, this); 
//              if(options.type !== "update") {
                if(!_LC.unbound && typeof node._attributes.object =='object' && !Array.isArray(node._attributes.object)) {
            		makeSet(node._attributes.object, "_bindings");
                    addBindings(node._attributes.object._bindings,node._propBindingObject);
                    _LC.establishBindings(node._propBindingObject, node._attributes.object);
            	}
//              }
				_LC.unbound = initialUnbound;
                if(options.type !== "default") {
                    if(directiveObj){
                        let dependentPromises = [];
                        directiveObj.getAllDependentPromises(this,dependentPromises,node._totalPromise);
                        directiveObj.insertInDom(this,lastNode._placeHolder,lastNode,toAppendMain,undefined,undefined,dependentPromises);
                    }else{
                        _LC.insertInDom(lastNode._placeHolder,lastNode,toAppendMain);
                    }
                } else {
                    returnVal = {"toAppendMain" : toAppendMain, "lastNode" : lastNode};
                }

        }
        _LC.unbound = initialUnbound; 
        callee.component.data[key] = initialKeyValue;
        callee.component.data[value] = initialValueValue;
        callee._properties[key] = initialKeyProp;
        callee._properties[value] = initialValueProp;
        node._currentObject = object;
        return returnVal;
    }
    rmCaseBindings(node,templInd,currentInd){
        let casesList = node._co;
        for(let i=templInd+1;i<=currentInd;i++){
            let temp = node._tempList[casesList[i]];
            if(temp){
                _LC.removeDynamicNodes(temp,this);
                node._bindedList[casesList[i]] = false;
            }
        }
    }
    getCaseTemplate(node,nodeTemp,caseName,caseStr){
        var dummyTemp;
        var obj = {};//check
        if(!node._tempList[caseName]){
            // if(Lyte._ms){
            //     dummyTemp = _LC.getContentForIE(node._cases[caseName].templateContent , this.constructor,undefined,obj);
            //     if(obj._content){
            //         dummyTemp = obj._content.childNodes[0];
            //     }
            // }else{
                dummyTemp = nodeTemp.content.querySelector(caseStr+_LC.cssEscape(caseName)+'\']');
            // }
            node._tempList[caseName] = dummyTemp;
        }else{
            dummyTemp = node._tempList[caseName];
        }
        return dummyTemp;
    }
    getCaseIndexScope(node,templateCaseNode,casesList,caseName,switchValue,lyteConvertedSwitch){
        var caseName = templateCaseNode.getAttribute("lc-id");
        var templInd = casesList.indexOf(caseName);
        let val = templateCaseNode._attributes.case;
        var currentInd = casesList.indexOf(node._currentScope);
        var scope;
        if(node._currentScope != "default"){
            if(templInd == currentInd){
                if(val){
                    if(lyteConvertedSwitch){
                        return false;
                    }else if(val==templateCaseNode._prevDataVal){ //second check for lyteconvertedtemp
                        return false;
                    }
                    else if(val == switchValue){
                        scope  = node._cases[caseName];
                    }
                }
            }
            else if(templInd > currentInd){
                return false;
            }
            else if(templInd < currentInd){
                if(val){
                    this.rmCaseBindings(node,templInd,currentInd);
                    scope  = node._cases[caseName];
                    scope.cn = caseName;
                }else{
                    return false;
                }
            }
        }else{
            this.rmCaseBindings(node,templInd,casesList.length-1);//templInd+1
        }
        return scope;
    }
    getSwitchScope(node,templateCaseNode,scope,nodeTemp,helperNode,contextSwitchInfo,switchValue,lyteConvertedSwitch,idx,id){
        var caseStr;
        var casesList = node._co;
        var currentInd = -1;//casesList.indexOf(node._currentScope);
        if(templateCaseNode){
            scope = this.getCaseIndexScope(node,templateCaseNode,casesList,caseName,switchValue,lyteConvertedSwitch);
            if(scope == false){
                return false;
            }
        }
        // else{
        //     currentInd = -1;
        // }
        if(!scope){
            var indexStart = node._currentScope ? currentInd + 1 : 0;
            for(var i=indexStart; i<casesList.length; i++){
                var caseName = casesList[i];
                var dummyTemp;
                if(node._cases[caseName].dcn){
                    caseStr = '[lc-id=\'';
                    dummyTemp = this.getCaseTemplate(node,nodeTemp,caseName,caseStr);
                    dummyTemp._parentSwitch = node;
                    dummyTemp._callee = this;
                    if(node._bindedList[caseName]){
                        if((lyteConvertedSwitch && dummyTemp._attributes.case) || (!lyteConvertedSwitch && dummyTemp._attributes.case == switchValue)){
                            scope  = node._cases[caseName];
                            scope.cn = caseName;
                            dummyTemp._prevDataVal = dummyTemp._attributes.case;
                            if(!templateCaseNode && !lyteConvertedSwitch){
                                this.rmCaseBindings(node,i,casesList.length);
                            }
                            break;
                        }
                    }else{
                        var toBeRemoved = [];
                        dummyTemp._dynamicProperty = dummyTemp._dynamicProperty || {};
                        if(lyteConvertedSwitch && helperNode && i==0){
                            this.bindNode(dummyTemp.attributes.getNamedItem("case"), toBeRemoved,  helperNode , helperNode.getAttribute("is")!="switch" && contextSwitchInfo ? contextSwitchInfo :{}, node._cases[caseName].cdp.a.case,undefined,undefined,undefined,undefined,lyteConvertedSwitch?"l":undefined,idx,undefined,id);
                        }else{
                            this.bindNode(dummyTemp.attributes.getNamedItem("case"), toBeRemoved, dummyTemp ,{}, node._cases[caseName].cdp.a.case,undefined,undefined,undefined,undefined,lyteConvertedSwitch?"l":undefined,idx,undefined,id);
                        }
                        // if(this._ssrBind && textNode){
                        //     textNode.setAttribute( "placeHolderId", dummyTemp.getAttribute( 'bindId' ) );
                        // }
                        
                        // debugger;
                        // if(helperNode){
                        //     helpId = helperNode.getAttribute("bindId");
                            
                        //     obj._helperId = helpId;
                        //     if(/^(for|forIn)$/.test(helperNode.getAttribute("is"))){
                        //         obj._forType = this.getssrType(helperNode.getAttribute("is"));
                        //         obj._forIndex = dynamicN._cx.itemIndex;
                        //     }
                        // }
                        // this.component.data.bindIds.push( obj );
                        dummyTemp._cx = contextSwitchInfo;
                        node._bindedList[caseName] = true;
                        dummyTemp._parentSwitch = node;
                        let val;
                        if(dummyTemp.getAttribute("case")=== "" || dummyTemp.getAttribute("case")) {
                            val = dummyTemp.getAttribute("case");
                        }if(dummyTemp._attributes) {
                            val = dummyTemp._attributes.case;
                        }
                        if((lyteConvertedSwitch && val) || (!lyteConvertedSwitch && val == switchValue)){
                            scope  = node._cases[caseName];
                            scope.cn = caseName;
                            dummyTemp.cn = val;
                            break;
                        }
                    }
                }else if(!lyteConvertedSwitch){
                    //might br stattic caseinbetween
                    caseStr = "[case='";
                    dummyTemp = this.getCaseTemplate(node,nodeTemp,caseName,caseStr);
                        let val = dummyTemp.getAttribute("case");
                        if(val == switchValue){
                            scope  = node._cases[caseName];
                            scope.cn = caseName;
                            dummyTemp._prevDataVal = val;
                            break;
                        }
                }
            }      
        }  
        return scope;
    }
    //updSH
    updateSwitchHelper(type,node, contextSwitchInfo, update, establishBindings,yieldComp,templateCaseNode,helperNode,id,idx){
         var lyteConvertedSwitch = node.getAttribute("l-c");
         let directiveObj = this.getDirectiveObj();
         if(directiveObj){
             directiveObj.checkOngoingPromises(node);
             directiveObj.instanciateForPromises(node);//af
         }
         if(node._ht && !node._htA) {
             node.content.append(node._ht.content.cloneNode(true));
             node._htA = true;
         }
         if(node.tagName !== "TEMPLATE") {
             Object.keys(node).forEach(function(item) {
                 if(item !== "innerHTML" && item !== "innerText") {
                     node._origTemplate[item] = node[item];
                 }
             });
             // if(Lyte._ie) {
             // 	var div = createElement("div");
             //     div.innerHTML = node._tC;
             //     node._origTemplate.innerHTML = div.children[0].innerHTML;
             //     this.constructor.splitTextNodes(node._origTemplate);
             //     if(node.hasAttribute("depth")) {
             //         node._origTemplate.setAttribute("depth", node.getAttribute("depth"));    
             //     }
             // }
             let placeHolder = node._origTemplate._placeHolder = document.createTextNode("");
             //node.replaceWith(node._origTemplate._placeHolder);
             _LC.replaceWithPf(node, node._origTemplate._placeHolder);
             node = node._origTemplate;
             // node = _LC.replaceWithOrigTemplate(node)
             node.setAttribute("is", _LC.mappy[type]);
             _LC.apdNode(node, this);
             placeHolder._helper = node;
         } else if(!node._placeHolder){
             var emptyTextNode;
             
                 emptyTextNode = document.createTextNode("");
                 
             //node.replaceWith(emptyTextNode);
             _LC.replaceWithPf(node, emptyTextNode);
             node._placeHolder = emptyTextNode;
             emptyTextNode._helper = node;
             _LC.apdNode(node, this);
         }
         let isNew = false;
         let lastNode = node;
         if(!node._callee) {
             node._callee = this;
             isNew = true;
         }
         node._bindedList = node._bindedList || {};
         node._tempList = node._tempList || {};
         contextSwitchInfo = contextSwitchInfo ? contextSwitchInfo : node._cx;
         node._cx = contextSwitchInfo;
         node._dynamicProperty = node._dynamicProperty ? node._dynamicProperty : {};
         var switchValue;
         if(node.getAttribute("value")=== "" || node.getAttribute("value")) {
             switchValue = node.getAttribute("value");
         } else if(node._attributes) {
             switchValue = node._attributes.value;
         }
         if(!lyteConvertedSwitch && !node._hd){
             if(switchValue) {
                 switchValue = switchValue.toString();
             } else {
                 switch(switchValue) {
                     case undefined : 
                         switchValue = "undefined";
                         break;
                     case null : 
                         switchValue = "null";
                         break;
                     case false: 
                         switchValue = "false";
                         break;
                     case "": 
                         switchValue = '""';
                         break;
                     case 0 : 
                         switchValue = '0';
                 }
             }
         }
         if((!lyteConvertedSwitch && !node._hd) && switchValue === node._currentCase) {
             return;
         }
         let scope,caseStr;
         node._currentCase = switchValue;
         var nodeTemp = node._depthTemp || node;
         if(node._hd){
             scope = this.getSwitchScope(node,templateCaseNode,scope,nodeTemp,helperNode,contextSwitchInfo,switchValue,lyteConvertedSwitch,idx,id);
             if(scope){
                 node._currentCase = scope.cn;
             }
         }
         else{
             caseStr = '[case=\''
             scope = node._cases[switchValue];
         }
         if(scope === false || (!scope && node._previousScope == "default")){
             return;
         }
         if(node._caseContent && node._caseContent.length) {
             this.removeHelpers(node, undefined, true,node._totalPromise);//, node._hd ?{start:templInd+1,end:node._currentScope != "default"?currentInd:casesList.length-1}:false
         }
         node._currentScope = scope && scope.cn;
         let defaultContent;
         if(!scope){
             scope = node._default;
             node._currentScope = "default";
             defaultContent = nodeTemp.content.querySelector('[default]');
             if(scope._ht && !defaultContent._htA) {
                 defaultContent._htA = true;
                 defaultContent.content.append(scope._ht.content.cloneNode(true));
             }
             node._isDefault = true; 
             if(!defaultContent) {
                 // if(node._caseContent && node._caseContent.length) {
                 //     this.removeHelpers(node, undefined, true ,node._totalPromise);
                 // }
                 // node._previousCase = node._currentCase;
                 node._caseContent = [];
                 let emptyTextNode = document.createTextNode("");
                 node._caseContent.$push(emptyTextNode);
                 node._currentCaseName = switchValue;
                 node._helpers = node._helpers || [];
                 if(update) {
                     //lastNode.parentNode.insertBefore(emptyTextNode, node);
                     if(lastNode._placeHolder) {
                         _LC.insertBeforeNative(lastNode._placeHolder.parentNode,emptyTextNode, lastNode._placeHolder);                    
                     } else {
                         _LC.insertBeforeNative(lastNode.parentNode,emptyTextNode, node);
                     }
                     return;
                 } else {
                     let toAppendMain = createDocFragment();
                     toAppendMain.append(emptyTextNode);
                     return {lastNode : lastNode, toAppendMain : toAppendMain};
                 }
             }
         }
         
 //        if(currentCase) {
 //              if(currentCase.tagName === "TEMPLATE" && !currentCase.getAttribute("is")){
 //                  currentCase = currentCase.content;
 //              } else {
 //                  let temp = createElement('template');
 //                  let clone = currentCase.cloneNode(true);
 //                  temp.content.appendChild(clone);
 //                  currentCase.removeAttribute('slot');
 //                  currentCase = temp.content;
 //              }
 //              scope.content = currentCase;
 //        }
  
         // if(node._caseContent && node._caseContent.length) {
         //     this.removeHelpers(node, undefined, true ,node._totalPromise);
         // }
         let dummyScope = scope;
         let additionalContentArr = [];
         let cnt=0;
         let dummyCaseName = switchValue;
         let template;
         if(defaultContent) {
             template = defaultContent
         } else {
             template = nodeTemp.content.querySelector((scope.dcn ? '[lc-id=\'' : '[case=\'') +_LC.cssEscape(scope.cn ? scope.cn : dummyCaseName)+'\']');
         }
         // if(!template._callee){
         //     template._callee = this;
         // }
         let contentArr = [];
         if(directiveObj){
             node._specialNodes = [];
         }
         let nextCaseName;
         while(dummyScope) {
             if(dummyScope._ht && !template._htA) {
                 template._htA = true;
                 template.content.append(dummyScope._ht.content.cloneNode(true));
             }
             let dynamicNodes = dummyScope.dN;
             if(nextCaseName && node._cases[nextCaseName].dcn){
                 caseStr = '[lc-id=\'';
                 var tempNode = this.getCaseTemplate(node,nodeTemp,nextCaseName,caseStr);
                 if(!node._bindedList[nextCaseName]){
                     var toBeRemoved = [];
                     tempNode._dynamicProperty = tempNode._dynamicProperty || {};
                     this.bindNode(tempNode.attributes.getNamedItem("case"), toBeRemoved, tempNode ,{}, node._cases[nextCaseName].cdp.a.case);
                     tempNode._cx = contextSwitchInfo;
                     node._bindedList[nextCaseName] = true;
                     tempNode._parentSwitch = node;
                 }
             }
             let processedContent = this.renderNodes(template, dynamicNodes, node, undefined, establishBindings, undefined, dummyScope.templateContent,yieldComp);
             
             contentArr.$push(processedContent);
             if(dummyScope.additional) {
                 if(node._cases[dummyScope.additional.next] && node._cases[dummyScope.additional.next].dcn){
                     caseStr = '[lc-id=\'';
                 }else{
                     caseStr = '[case=\''
                 }
                 if(dummyScope.additional.next) {
                     nextCaseName = dummyScope.additional.next;
                     template = node.content.querySelector(caseStr+_LC.cssEscape(dummyScope.additional.next)+'\']');
                     dummyScope = node._cases[dummyScope.additional.next];
                 } else {
                     template = node.content.querySelector('[default]');
                     dummyScope = node._default;
                 }
             } else {
                     break;
             }
         }
         node._caseContent = [];
         let toAppendMain = createDocFragment();
         for(let i=0;i<contentArr.length;i++) {
             if(contentArr[i].nodeType == 11){
 //                for(let j=0;j<contentArr[i].childNodes.length;j++) {
 //                    node._caseContent.$push(contentArr[i].childNodes[j]);
 //                }
                 node._caseContent = node._caseContent.$concat(Array.from(contentArr[i].childNodes));
             }
             else{
                 node._caseContent.$push(contentArr[i]);
             }
                 toAppendMain.append(contentArr[i]);
 //            node.parentNode.insertBefore(contentArr[i], node);
         }
           this.executeBlockHelpers(node._helpers, node);
           if(update) {
               let returnVal;
               if(toAppendMain.querySelector("template[is=break]")) {
                   returnVal = "break";
               } else if(toAppendMain.querySelector("template[is=continue]")) {
                   returnVal = "continue";
               }
               if(directiveObj){
                 let dependentPromises = [];
                 directiveObj.getAllDependentPromises(this,dependentPromises,node._totalPromise);
                 directiveObj.insertInDom(this,node._placeHolder,node,toAppendMain,node._previousCase ?false:true,undefined,dependentPromises);
               }else{
                 _LC.insertInDom(node._placeHolder,node,toAppendMain);
               }

               node._previousCase = node._currentCase;
               node._previousScope = node._currentScope;
               return returnVal;
           } else {
                 node._previousCase = node._currentCase;
                 node._previousScope = node._currentScope;
               return {"toAppendMain" : toAppendMain, "lastNode" : node};
           }
     }

    dummy(a,b) {
        let dummy = this.component.constructor._properties[boundValue].observer;
    }

    callObservers(boundValue, key) {
        let property = this.component.constructor._properties[boundValue];
        let observers = property?property.observer: undefined;
        if(observers) {
            for(let i=0;i<observers.length;i++) {
                if(key.indexOf('.') === -1 || observers[i].path === key) {
                    this["_"+observers[i].functionName].apply(this);
                }
            }
        }
    }

    // static updateValue(property, path, value) {
    //     let pathVals = path.split('.');
    //     let context = property;
    //     for(let i=0;i<pathVals.length -1;i++) {
    //         context = context[pathVals[i]];
    //     }
    //     context[pathVals[i]] = value;
    // }

    //    static createDocFragment(template){
    //        let childNodes = template.cloneNode(true,"lyte").childNodes;
    ////           let childNodes = template.childNodes;
    //        let frag = document.createDocumentFragment();
    //        let len = childNodes.length;
    //        for(let i=0; i<len; i++){
    //            frag.appendChild(childNodes[0]);
    //        }
    //        return frag;
    //    }

    static createDocFragment1(template) {
        if(template.content) {
            return template.content;
        }
    	let childNodes = template.childNodes;
    	let frag = createDocFragment();
    	let len = childNodes.length;
    	for(let i=0; i<len; i++){
            frag.appendChild(childNodes[0]);
        }
    	return frag;
    }
    static seperateStyle(componentClass,componentsDiv){
        componentClass._template.replace(/\\'/g,"'");
        let div = createElement("div");
        div.innerHTML = componentClass._template;
        while(div.firstChild){
            if(div.firstChild.nodeName === "STYLE") {
                componentClass._style = div.firstChild.outerHTML;
                div.firstChild.remove();
            } else {
                // div.firstChild.setAttribute("lyte-registry",componentClass._registryClass.name);
                componentsDiv.appendChild(div.firstChild);
            }
        }
    }
    static _registerComponent(a,b,componentClass,registry,registryInstance) {
        let componentsDiv = _LC.getComponentsDiv(_LC.lyteComponentsDiv ,registry.name);
        let origTemplateValue = componentClass._template;
        let app = _LC.getAppOrAddon(registryInstance);
        var clonedDummyTemp;
        if(componentClass._template && typeof componentClass._template === "string"){
            this.seperateStyle(componentClass,componentsDiv);
        }else if(componentClass.template && typeof componentClass.template === "object"){
            componentClass._template = componentClass.template._template;
            componentClass._dynamicNodes = componentClass.template._dynamicNodes;
            componentClass.template = undefined;
            this.seperateStyle(componentClass,componentsDiv);
        }
        componentClass._template = componentsDiv.querySelector("template[tag-name='"+a+"']");
        componentClass._helperTemplate = document.createElement("template");
        componentClass._helperTemplate.setAttribute("_lyteht", a );
        _LC.h1Div.content.appendChild(componentClass._helperTemplate);
        if(!componentClass._template) {
            //@Slicer.developmentStart
            console.error("Template not found for the component : '"+a+"'");
            //@Slicer.developmentEnd
        	return;
        }
        if(Compile.needDummyComponentsDiv) {
            // if(Lyte._ie) {
            //     let temp = Compile.getTemplateFromString(origTemplateValue);
            //     // let dummyLyteComponentsDiv = _LC.setComponentsDiv(_LC.dummyLyteComponentsDiv,registry.name);
            //     _LC.getComponentsDiv(_LC.dummyLyteComponentsDiv,registry.name)
            //     dummyLyteComponentsDiv.appendChild(temp);
            // } else {
                clonedDummyTemp = componentClass._template.cloneNode(true);   
            // }
        }
        if(componentClass._template && !componentClass._template.content){
//            var frag = document.createDocumentFragment();
//            let childNodes = this._template.cloneNode(true,"lyte").childNodes;
//            //let childNodes = this._template.childNodes;
//            let len = childNodes.length;
//            for(let i=0; i<len; i++){
//                frag.appendChild(childNodes[0]);
//            }
//            this._template.content = frag;
        }
        // var s = Lyte._ie ? componentClass._template : componentClass._template.content;//)?this._template.content:document.createDocumentFragment(this._template);
        var s = componentClass._template.content; //)?this._template.content:document.createDocumentFragment(this._template);
        //This is used to split text nodes which contain multiple dynamic values 
        //Eg." Name is {{name}} and age is {{age}} "
        //This is used to find the dynamicNodes and helper nodes for the given component. 
        if(!componentClass._dynamicNodes){
            if(Compile.getDynamicNodes) {
                var returnVal = Compile.getDynamicNodes(a);
                if(returnVal.errors){
                    //@Slicer.developmentStart
                    console.error("Error in the component", returnVal.componentName, returnVal.errors);
                    //@Slicer.developmentEnd
                    return false;
                }else{
                    componentClass._dynamicNodes = returnVal.dynamicNodes;
                    if(componentClass._dynamicNodes && componentClass._dynamicNodes.length && componentClass._dynamicNodes[componentClass._dynamicNodes.length-1].type == "dc"){
                        b.dc = componentClass._dynamicNodes.$pop();
                    }
                }
            } 
            //@Slicer.developmentStart
            else {
                ComponentError.error("LC002", a);  
            }
            //@Slicer.developmentEnd
	    } 
        if(componentClass._dynamicNodes) {
            this.setTemplateAttributes(a, componentClass, clonedDummyTemp);
            var hasUnbound = this.getFastRenderSupported(componentClass._templateAttributes);
            let fastRenderClass = registry.getFastObj();
            // var hasUnbound = b._observedAttributes.indexOf("lyteUnbound") !== -1;
            if(!hasUnbound && !_LC.migratedv2(app)){
                hasUnbound = b._observedAttributes.indexOf("lyteUnbound") !== -1;
            }
            var newCompile;
            if(hasUnbound) {
                if(fastRenderClass){
                    newCompile = fastRenderClass.getNewCompile(componentClass);
                }
                //@Slicer.developmentStart
                else{
                    ComponentError.error("LC011")
                }
                //@Slicer.developmentEnd
                // if(Lyte._ie) {
                //     newCompile = document.createElement("div");
                //     newCompile.innerHTML = componentClass._template.outerHTML;
                //     newCompile = newCompile.childNodes[0];
                // } else {
                //     newCompile = componentClass._template.cloneNode(true);
                // }
            }
            this.splitTextNodes(s);
            if(hasUnbound && fastRenderClass) {
                this.splitTextNodes(newCompile);
            }
            doCompile(s, componentClass._dynamicNodes, a, b, newCompile ? newCompile.content : undefined, componentClass, fastRenderClass);
            // if(Lyte._ed) { 
            //     componentClass._tC = componentClass._template.outerHTML;
            // } 
            // else if(Lyte._ie) {
            //     componentClass._tC = s.outerHTML;
            // }
        }
        clonedDummyTemp && _LC.getComponentsDiv(_LC.dummyLyteComponentsDiv,registry.name).appendChild(clonedDummyTemp);
        componentClass._sta = newCompile ? _LC.processStatic(newCompile) : undefined;
    }
    static getFastRenderSupported(templateAttributes){
        if(templateAttributes && templateAttributes.a){
            for(let attrName in templateAttributes.a){
                if(attrName == "@unbound-supported" || attrName == "@turbo-supported" ){
                    return true;
                }
            }
        }

    }
    static setTemplateAttributes(a, componentClass,clonedDummyTemp){
        componentClass._templateAttributes = {t : "a", "a" : {}, p: []};
        var ta = [componentClass._templateAttributes];
        doCompile(componentClass._template, ta, a, this, undefined, componentClass);
        componentClass._templateAttributes = ta[0];
        if(componentClass._templateAttributes && componentClass._templateAttributes.a) {
            var attributesT = componentClass._template.attributes;
            try{
                for(let i=0;i<attributesT.length;i++) {
                    let attrName = attributesT[i].name;
                    if(!componentClass._templateAttributes.a[attrName] && attrName !== "tag-name" && attrName !== "use-strict" && attrName !== "lyte-registry" && attrName !== "__vp") {
                        componentClass._templateAttributes.a[attrName] = {"name" : attrName, "staticValue" :  attributesT[i].value};
                        componentClass._template.removeAttribute(attrName);
                        clonedDummyTemp && clonedDummyTemp.removeAttribute(attrName);
                        i--;
                    }
                }    
            } catch(e) {
                //@Slicer.developmentStart
                ComponentError.error("LC012")
                //@Slicer.developmentEnd
            }
        }
    }
    //This is used to split text nodes which contain multiple dynamicNodes. 
    static splitTextNodes(node) {
        if(node && node.childNodes && node.childNodes.length) {
            for(let i=node.childNodes.length-1;i>=0;i--) {
                this.splitTextNodes(node.childNodes[i]);
            }
        }
        if(node.tagName === "TEMPLATE") { // && !Lyte._ie
            this.splitTextNodes(node.content);
        }
        if(node.nodeType === node.TEXT_NODE) {
            let nodeValue = node.nodeValue;
            if(nodeValue){
                let mustacheValues = nodeValue.match(/{{[^}]*?(?:(?:('|")[^\1]*?\1)[^}]*?)*}}/g); //'
                if(!mustacheValues) {
                    return;
                }
                let newNodeArray = [];
                for(let i=0;i<mustacheValues.length;i++) {
                    let mustacheStartIndex = nodeValue.indexOf(mustacheValues[i]);
                    let mustacheEndIndex = mustacheStartIndex + mustacheValues[i].length;
                    if(mustacheStartIndex) {
                            newNodeArray.$push(document.createTextNode(nodeValue.substring(0, mustacheStartIndex)));
                    }
                    newNodeArray.$push(document.createTextNode(nodeValue.substring(mustacheStartIndex, mustacheEndIndex)));
                    nodeValue = nodeValue.substring(mustacheEndIndex);
                }
                if(!(!nodeValue.trim() && node.nextSibling && node.nextSibling.nodeType === 3 && !node.nextSibling.nodeValue.trim())) {
                    newNodeArray.$push(document.createTextNode(nodeValue));
                }
                //Fix for IE Edge issue with higher versions where node.replaceWith is not working when the parent is a doc fragment.
                if(node.parentNode.nodeName === "#document-fragment") {
                	for(let i=0;i<newNodeArray.length;i++) {
                		_LC.insertBeforeNative(node.parentNode,newNodeArray[i],node);
                      }
                    node.remove();
                } else {
                	node.replaceWith.apply(node, newNodeArray);
                } 
            }
        }
    }
    //It registers the binding of the node with the properties with which the dynamicNode depends. 
    bindNode(node, toBeRemoved, helperNode, options, nodeInfo, processLast, establishBindings, isTemplate,cache,type,idx,toBeInsMap,bId) {
        let lyteConvertedSwitch = false;
        if(type == "l"){
            lyteConvertedSwitch = true;
            type = "a";
        }
        let itemValue = options.itemValue;
        let forIndex = options.itemIndex;
        let forType = options.type;
        let indexValue = options.indexValue;
        let dynamicValue = nodeInfo.dynamicValue;
        let helperFunc = nodeInfo.helperInfo;
        let nodeValue, ownerElement = node.ownerElement;
        let dynamicValuesArray = [];
        let isDirectiveNode;
        let directiveObj = this.getDirectiveObj();
//        if(node.nodeType === 2 && _LC.isCustomElement(node.ownerElement,true) ) {
//          node = {nodeName : node.nodeName, ownerElement: ownerElement, nodeType : 2, nodeValue : node.nodeValue};
//        }
        if(node.nodeType === 2) {
            node = {nodeName : node.nodeName, ownerElement : node.ownerElement, nodeType : 2, nodeValue : node.nodeValue, _attributeDetails : node._attributeDetails, _isDirectiveNode : nodeInfo._isDirectiveNode};
            // if(directiveObj){
            isDirectiveNode = _LC.directive.isDirectiveNode(node)
            // }
        }
        //to get bindings in ssr components
        
        node._callee = this;
        let isHelper = false;
        if(helperFunc && Object.keys(helperFunc).length) {
            isHelper = true;
            if(helperFunc._t){
                node._sq = true;
            }
            let attrName = node.nodeName;
            nodeValue = node.helperValue = helperFunc;
            let helperArgs = [];
            if(helperFunc.name === "action"){
                let actName = helperFunc.args[0];
                helperFunc.args[0] = actName.startsWith("'")? actName.replace(/'/g,''):  actName;
                // if(forType) {
                //     ownerElement._cx = options;
                // } else if(helperNode) {
                //     ownerElement._cx = helperNode._cx;
                // }
                actName = helperFunc.args.slice(0,1)[0];
                let args = helperFunc.args.slice(1,helperFunc.args.length), isCustom = false;
                let attrName = node.nodeName;
                if(attrName.indexOf("-") != -1){
                    isCustom = true;
                }
                helperArgs = [ownerElement,attrName,isCustom,{name:actName,args:args}];
                this.processHelper(this, {"name" : helperFunc.name, "args" : helperArgs}, node);
                return;
            } else{
                if(helperFunc.name === "method") {
                    helperArgs = helperFunc.args;
                         
                } else {  
                    helperArgs = this.processArgs(this,{"helperInfo" : helperFunc} ,dynamicValuesArray,undefined,node,false,helperFunc._t ?undefined:cache);
                }
            }
            if(helperFunc._t == "sq"){
                nodeValue = this.processArray(this,{"name" : helperFunc.name, "args" : helperArgs},dynamicValuesArray,helperFunc.extra,event, node, undefined);
            }
            else{
                nodeValue = this.processHelper(this, {"name" : helperFunc.name, "args" : helperArgs}, node);
            }
            if(helperFunc.name === "unescape"){
//              let test = node.replaceWith.apply(node,nodeValue.childNodes);
                let obj = {
                    initialNode : node,
                    dynamicNodeValue : nodeValue
                };
                node = {dynamicPositions : obj, "_callee" : node._callee, helperValue : node.helperValue};
                nodeValue = undefined;
                processLast.$push(node);
            }
        } else {
            helperFunc = {};
            node.syntaxValue = dynamicValue;
            let dynamicValues = [];
            nodeValue = _LC.get(this.component.data, dynamicValue, dynamicValues,cache);
            dynamicValuesArray.$push(dynamicValues);
        }
        //if(node.nodeType === 2 && ( (typeof nodeValue !== "string" && (_LC.isCustomElement(node.ownerElement,true) || typeof nodeValue === "boolean") ) || _LC.isControlHelper(node.ownerElement) )) {
        //	let bindedNode = node;
            //node = {nodeName : node.nodeName, ownerElement: ownerElement, nodeType : 2, nodeValue : node.nodeValue, _callee : this, syntaxValue : node.syntaxValue, helperValue : node.helperValue, _attributeDetails : node._attributeDetails};
        if(node.nodeType == 2) {
            let tagName = node.ownerElement.tagName;
            if(tagName == "INPUT" || tagName == "TEXTAREA" || (tagName == "DIV" && node.ownerElement.hasAttribute("contenteditable") )) {
                var rA = node.ownerElement._rA = node.ownerElement._rA || [];
                node.ownerElement._rA.$push(node);
            }
            if(!ownerElement._origTemplate) {
                if(( ownerElement.hasAttribute("lyte-for") || ownerElement.hasAttribute("lyte-if") || ownerElement.hasAttribute("lyte-switch") || ownerElement.hasAttribute("lyte-forin") ) && ownerElement.tagName !== "TEMPLATE") {
                    // if(Lyte._ie) {
                    //     node.ownerElement = createElement("template");
                    //     node.ownerElement.setAttribute("is", nodeInfo._depthTemp);
                    // } else {
                        node.ownerElement = nodeInfo._depthTemp.cloneNode(true);
                    // }
                    ownerElement._origTemplate = node.ownerElement;
                }
            } else {
                node.ownerElement = ownerElement._origTemplate;
            }
        //	node.ownerElement._attributeDetails[node.nodeName].bindedNode = node;
        //}
        }
        let actMultiProp; 
        if(helperFunc.name !== "unbound" && !_LC.unbound) {
            let dynamicProp;
            if(helperNode) {
                dynamicProp = forType? helperNode._items[forIndex]._dynamicProperty : helperNode._dynamicProperty;
            }
            let obj, helperId;
            for(let d=0;d<dynamicValuesArray.length;d++) {
            	let dynamicValues = dynamicValuesArray[d];
                
            	for(let v=0;v<dynamicValues.length;v++) {
                    //to get binding in ssr components
                    var _nes = false;
                    
            		let actProperty = this.getProperty(dynamicValues[v]);
            		if(helperNode) {
            			let ind = dynamicValues[v].search(/\W/);
            			let boundValue;
            			if(ind !== -1) {
            				boundValue = dynamicValues[v].substring(0, ind);
            			} else {
            				boundValue = dynamicValues[v];
            			}
            			if(boundValue !== itemValue && boundValue !== indexValue && (!options.node || !options.node._properties || !options.node._properties[boundValue])) {
            				//to bind for in ssr
                            
                            makeSet(actProperty, "_helperNodes");
            				actProperty._helperNodes.add(
            						helperNode
            				);
            				dynamicProp[dynamicValues[v]] ? dynamicProp[dynamicValues[v]].$push(node): (dynamicProp[dynamicValues[v]] = []).$push(node);
            			} 
            			else {
            				node._cx = options;
//            				if(!actProperty._dynamicNodes) {
//            					actProperty._dynamicNodes = [];
//            					defProp(actProperty, '_dynamicNodes', {
//            						value: [],
//            						enumerable: false, 
//            						writable: true, 
//            						configurable: true
//            					});
//            				}
            				makeArray(actProperty, "_dynamicNodes");
                            if(actProperty._dynamicNodes.indexOf(node) == -1){
            				    actProperty._dynamicNodes.$push(node);
                            }
            				if(boundValue !== indexValue) {
            					actMultiProp = actProperty;
            				}
            			}
            		} else {
//            			if(!actProperty._dynamicNodes) {
//            				defProp(actProperty, '_dynamicNodes', {
//            					value : [], 
//            					enumerable: false, 
//            					writable: true,
//            					configurable: true
//            				});
//            			}
            			makeArray(actProperty, "_dynamicNodes");
                        if(actProperty._dynamicNodes.indexOf(node) == -1){
            			    actProperty._dynamicNodes.$push(node);
                        }
            		}
            		if ((ownerElement && (ownerElement.hasAttribute("lyte-for") || ownerElement.hasAttribute("lyte-if") || ownerElement.hasAttribute("lyte-switch") || ownerElement.hasAttribute("lyte-forin") )) || (ownerElement && ownerElement.tagName === "TEMPLATE" && /^(for|forIn)$/.test(ownerElement.getAttribute("is")) && !isHelper)) {
            			let type= ownerElement.getAttribute("is");
            			if( (type=== "for" && node.nodeName === "items") || (type==="forIn" && node.nodeName === "object")) {
            				if(!actProperty._forHelpers) {
            					makeSet(actProperty, "_forHelpers");
            				}
                            //to bind for in ssr
                            
            				node.ownerElement._actualBinding = actProperty;
            				actProperty._forHelpers.add(node.ownerElement);
            			}
            		}
            		if(establishBindings) {
            			_LC.establishSelectedBinding(actProperty, this.component.data, this );
            		}
                    //to get ssr bindings 
                     
            	}
                
                if(dynamicValues.length > 1 || helperFunc._t) {
            		node._multipleProperty = node._multipleProperty || [];
            		node._multipleProperty.$push({"dynamicProp" : actMultiProp ? undefined : dynamicProp, "actProp" : this.getProperty(dynamicValues[0]), "helperNode" : helperNode, "dynamicValues" : dynamicValues, index:d});
            	}
                
            }
        }
        nodeValue = !typeof nodeValue === "boolean" && !typeof nodeValue === "number" ? (nodeValue? nodeValue : ""): nodeValue;
        if(isDirectiveNode){
            _LC.directive.setNodeArgs(node,nodeValue);
        }
        else if(node.nodeType === 2) {
            let parentNode = node._parentNode? node._parentNode : node.ownerElement;
            if(parentNode.tagName) {
                let is = parentNode.getAttribute("is");
            }
            let isCustomElement = _LC.isCustomElement(parentNode,true);
            if(isCustomElement && !isDirectiveNode) {
                 if(parentNode.set) {
                    parentNode.set(_LC.String.toCamelCase(node.nodeName), nodeValue);
                 } else {
                    parentNode._initProperties = parentNode._initProperties || {};
                     parentNode._initProperties[_LC.String.toCamelCase(node.nodeName)] =nodeValue;
                }
            }
            let origNodeValue = nodeValue;
            // if(directiveNode){
            //     node.ownerElement._transitionArgs = origNodeValue;
            //     node.ownerElement.removeAttribute(node.nodeName);
            //     node.nodeName = node.nodeName.slice(1,node.nodeName.length);
            // }
            //!== "string"
            if(isCustomElement && typeof nodeValue !== "string" && !isTemplate) {
                parentNode._attributes = parentNode._attributes || {};
                parentNode._attributes[node.nodeName] = nodeValue;
                if(parentNode.nodeName === "TEMPLATE" && isHelper) {
                    if((parentNode.getAttribute("is") === "for" && node.nodeName === "items") || (parentNode.getAttribute("is") === "forIn" && node.nodeName === "object") && !_LC.unbound) {
                        //node._actualBinding = {"_forHelpers" : new Set().add(parentNode)};
                        node.ownerElement._actualBinding = {
                            "_forHelpers" : new Set().add(parentNode),
                            "_createdBinding" : true
                        };
                        if(nodeValue && typeof nodeValue !== "number"){
                            makeSet(nodeValue, "_bindings");
                            addBindings(nodeValue._bindings,node.ownerElement._actualBinding);
                        }
                    }
                }
                toBeRemoved.$push(node.nodeName);
            }
            else {
                if(typeof nodeValue === "boolean") {
                    parentNode._attributes = node.ownerElement._attributes || {};
                    parentNode._attributes[node.nodeName] = nodeValue;
                    if(!nodeValue) {
//                      node.ownerElement.removeAttribute(node.nodeName);
                        toBeRemoved.$push(node.nodeName);
                    } else {
                        parentNode.setAttribute(node.nodeName, "");
                    }
                } else {
                    if(nodeValue && typeof nodeValue === "object"){
                        var res;
                        if(typeof Record != "undefined" && nodeValue instanceof Record){
                            res = JSON.stringify(nodeValue.$.toJSON())
                        }
                        else{
                            try{
                                res = JSON.stringify(nodeValue)
                            }
                            catch(exp){
                                //@Slicer.developmentStart
                                ComponentError.error(
                                    "LC013",
                                    node.nodeName,
                                    node.ownerElement.nodeName.toLocaleLowerCase(),
                                    node.ownerElement.nodeName.toLocaleLowerCase()
                                )
                                //@Slicer.developmentEnd
                            }
                        }
                    }
                    else if(nodeValue== null || nodeValue == undefined){
                        res = ""
                    }
                    else{
                        res = nodeValue;
                    }
                    nodeValue = res;
                    if(_LC.isControlHelper(node.ownerElement)) {
                    	 parentNode._attributes = node.ownerElement._attributes || {};
                         parentNode._attributes[node.nodeName] = nodeValue;
                         toBeRemoved.$push(node.nodeName);
                    } else {
                         let locNodeVal = nodeValue === undefined ? "" : nodeValue;
                         //if(node.nodeName === "style") {
                         //   node.ownerElement.setAttribute("style",locNodeVal);
                         //} else {
                         //   node.nodeValue = locNodeVal;
                         //}
                         node.ownerElement.setAttribute(node.nodeName, locNodeVal);
                    }
                    
                }
            }
            if(parentNode.tagName === "LYTE-YIELD" /*parentNode.getAttribute("is") === "insertYield"*/) {
                parentNode.component.data[_LC.String.toCamelCase(node.nodeName)] = origNodeValue;
            }
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(parentNode.nodeName)) {
                        if (node.nodeName === "value") {
                            parentNode.value = (nodeValue === undefined) ? "" : nodeValue;
                        } else if (node.nodeName === "checked") {
                            parentNode.checked = nodeValue;
                        }
            }
            if(!nodeValue && _LC.booleanAttrList.indexOf(node.nodeName) !== -1) {
                toBeRemoved.$push(node.nodeName);
            }
        } 
        else {
            node.nodeValue = nodeValue === undefined ? '' : nodeValue;
        }
	return node;
    }

    debounce(func, threshold) {
        var timeout;
        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
            	func.apply(obj, args);
                timeout = null;
            };
            if (timeout){
            	clearTimeout(timeout);
            }
            timeout = setTimeout(delayed, threshold || 100);
            //console.log(timeout,threshold);
        };
    }
    getProperty(key) {
        var arr = key.match(/([^[\].]+|\[\])/g);
        let property = this;
        if(!property._properties[arr[0]]) {
            property._properties[arr[0]] = {};
        } 
        property = property._properties[arr[0]];
        
        defProp(property, '_path', {enumerable: false, value : arr[0]});
        for(let i=1;i<arr.length;i++) {
            if (arr[i].startsWith("'") || arr[i].startsWith('"')) {//added check
			    arr[i] = arr[i].substring(1, arr[i].length -1);
		    }
            if(!property[arr[i]]) {
                property[arr[i]] = {};
                defProp(property[arr[i]], '_path', {enumerable: false, value : property._path + "." + arr[i]});
            }
            property = property[arr[i]];
        }
        return property;
    }
    //updN
    updateNode(node, updatePath) {
        let compInstance = this.component;
        var del = "delete";
        let multiplePropNode = [];
        let multipleProp;
        let nodeHasHelperNode;
        let isDirectiveNode;
        if(node.nodeType == 2){
            isDirectiveNode = _LC.directive.isDirectiveNode(node)
        }
        if(node._multipleProperty) {
        	for(var i=0;i<node._multipleProperty.length;i++) {
        		if(node._multipleProperty[i]  && node._multipleProperty[i].dynamicValues.lastIndexOf(updatePath) > 0 ) {
                    var dynStartIndex = node._sq ? node._multipleProperty[i].dynamicValues.lastIndexOf(updatePath) : 1;
                    multiplePropNode[i] = false;
                    multipleProp = node._multipleProperty[i];
		            let nodes;
                    for(var j=0;j<dynStartIndex;j++){
                        var pathName = node._sq ? multipleProp.dynamicValues[j] : multipleProp.actProp._path;
                        if(multipleProp.dynamicProp){
                            nodeHasHelperNode = true;
                            if(!node._sq || multipleProp.dynamicProp[multipleProp.dynamicValues[j]]){
                                multiplePropNode[i] = multipleProp;
                                nodes = multipleProp.dynamicProp[pathName];
                                if(nodes  && pathName.indexOf('.') != -1) {
                                    let index = nodes.indexOf(node);
                                    if(index != -1){
                                        nodes.$splice(index, 1);
                                    }
                                }
                                let helperNode = multipleProp.helperNode;
                                if(nodes.length === 0) {
                                    if(helperNode.getAttribute("is") === "if" || helperNode.getAttribute("is") === "switch" || (helperNode.hasAttribute("lc-id") && helperNode.getAttribute("is") === "case")) {
                                        multipleProp.actProp._helperNodes[del](helperNode);
                                        delete multipleProp.dynamicProp[multipleProp.actProp._path];
                                    } else {
                                        delete multipleProp.dynamicProp[multipleProp.actProp._path];
                                        if(helperNode._items) {
                                            let removeHelper = true;
                                            for(let i=0;i<helperNode._items.length;i++) {
                                                if(helperNode._items[i]._dynamicProperty && helperNode._items[i]._dynamicProperty[pathName]) {
                                                    removeHelper = false;
                                                    break;
                                                }
                                            }
                                            if(removeHelper) {
                                                multipleProp.actProp._helperNodes[del](helperNode);
                                                //console.log('for helper is removed');
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(!nodeHasHelperNode) {
                            if(multiplePropNode[i] == false){
                                multiplePropNode[i] = ["dynamicNodes"];
                            }else{
                                multiplePropNode[i].$push("dynamicNodes");
                            }
                            var prop = this.getProperty(pathName);
                            nodes = prop._dynamicNodes;
                            if(nodes) {
                                let index = nodes.indexOf(node);
                                if(index != -1 && pathName!=updatePath && pathName.indexOf('.') != -1){
                                    nodes.$splice(index, 1);
                                    if(!nodes.length) {
                                        delete prop._dynamicNodes;
                                    }
                                }
                            }
                        }else{
                            nodeHasHelperNode=false; 
                        }
                    }
		        }
			}
		}
        if(!node.syntaxValue && !node.helperValue) {
            return;
        }
        let contextSwitchInfo;
        let isYieldContext;
        if(node._cx || (node.nodeType === 2 && node.ownerElement._cx)) {
            contextSwitchInfo = node._cx || node.ownerElement._cx;
            var contextSwitchArray = [];
            _LC.changeContext(contextSwitchInfo.node, contextSwitchArray, contextSwitchInfo );
        } else if(node.tagName === "LYTE-YIELD" && node._callee._cx) {
        	isYieldContext = true;
        	contextSwitchInfo = node._callee._cx;
        	var contextSwitchArray = [];
        	_LC.changeContext(contextSwitchInfo.node, contextSwitchArray, contextSwitchInfo, true);
        }
        let nodeValue;
        let dynamicValues = [];
        var isHelper = false;
        let helperRetVal;
        if(node.helperValue){
            isHelper = true;
            nodeValue = node.helperValue;
                    let helperFunc = nodeValue;
                    if(helperFunc._t){
                        node._sq = true;
                    }
                    let helperArgs = this.processArgs(this,{"helperInfo" : helperFunc} ,dynamicValues,undefined,node);    
                    if(helperFunc._t == "sq"){
                        helperRetVal = this.processArray(this,{"name" : helperFunc.name, "args" : helperArgs},dynamicValues,helperFunc.extra,undefined, node, undefined);
                    }else{
                        helperRetVal = this.processHelper(this,{"name" : helperFunc.name, "args" : helperArgs}, node);
                    }
                    nodeValue = helperRetVal;
                    if(helperFunc.name === "unescape") {
                        let oldDynamicPosition = node.dynamicPositions;
                        let oldStartingNode = oldDynamicPosition.startingNode;
                        let oldChldLen = oldDynamicPosition.length;
                        while(oldChldLen > 1) {
                            let next = oldStartingNode.nextSibling;
                            oldStartingNode.remove();
                            oldStartingNode = next;
                            oldChldLen--;
                        }
                        let childLen = nodeValue.childNodes.length;
                        if(!childLen) {
                            nodeValue.appendChild(document.createTextNode(""));
                            childLen = 1;
                        }
                        let startingNode = nodeValue.childNodes[0];
                        oldStartingNode.replaceWith.apply(oldStartingNode,nodeValue.childNodes);
                        let obj = {startingNode : startingNode, length: childLen};
                        node.dynamicPositions = obj;
                        nodeValue = undefined;
                    }
        } else {
            let boundValue = node.syntaxValue;
            let path;
            if(boundValue.indexOf('.') !== -1 || boundValue.indexOf('[') !== -1) {
                path = boundValue;
                boundValue = boundValue.substring(0,boundValue.indexOf('.'));
            }
            let value = path ? _LC.get(compInstance.data, path, dynamicValues) : compInstance.data[boundValue]; 
            nodeValue = !typeof value === "boolean" && !typeof value === "number" ? (value? value : ""): value;
        }
        let origNodeValue = nodeValue;
		if(!(dynamicValues[0] instanceof Array)) {
        	dynamicValues = [dynamicValues];
		}
        
        if(multiplePropNode) {
        	for(var i=0;i<multiplePropNode.length;i++) {
        		if(multiplePropNode[i]) {
                    var ind = node._sq ? node._multipleProperty[i].dynamicValues.lastIndexOf(updatePath) : 1;
					let multipleProp = node._multipleProperty[i];
                    let dynamicValIndex = node._multipleProperty[i].index;
                    for(var j=0;j<ind;j++){
                        if(node._sq && dynamicValues[dynamicValIndex][j].indexOf('.') == -1){
                            continue;
                        }
                        let prop = this.getProperty(dynamicValues[dynamicValIndex][j]);
                        let totalProp = this.getProperty(dynamicValues[dynamicValIndex][j].substring(0, dynamicValues[dynamicValIndex][j].indexOf('.')));
                        var value = this.getData(dynamicValues[dynamicValIndex][j].substring(0, dynamicValues[dynamicValIndex][j].indexOf('.')));                            
                        if(Array.isArray(multiplePropNode) && multiplePropNode[dynamicValIndex] && multiplePropNode[dynamicValIndex][j] && (multiplePropNode[dynamicValIndex][j] === "dynamicNodes")) {
                            makeArray(prop, "_dynamicNodes");
                            if(prop._dynamicNodes.indexOf(node) == -1){
                                prop._dynamicNodes.$push(node);
                            }
                        } else {
                            makeSet(prop, "_helperNodes");
                            prop._helperNodes.add(
                                    multipleProp.helperNode
                            );
                            let dynamicProp = multipleProp.dynamicProp;
                            dynamicProp[prop._path] ? dynamicProp[prop._path].$push(node): (dynamicProp[prop._path] = []).$push(node);
                        }
                        if(value != undefined){
                            _LC.establishBindings(totalProp, value);
                        }
                        if(j==0){
                            if(node.ownerElement && (node.ownerElement.hasAttribute("lyte-for") || node.ownerElement.hasAttribute("lyte-if") || node.ownerElement.hasAttribute("lyte-switch") || node.ownerElement.hasAttribute("lyte-forIn")) || node.ownerElement && node.ownerElement.tagName === "TEMPLATE" && /^(for|forIn)$/.test(node.ownerElement.getAttribute("is")) && !isHelper) {
                                var type = node.ownerElement.getAttribute("is");
                                if (type === "for" && node.nodeName === "items" || type === "forIn" && node.nodeName === "object") {
                                    if(multipleProp.actProp._forHelpers.has(node.ownerElement)){
                                        multipleProp.actProp._forHelpers.delete(node.ownerElement);
                                    }
                                    if(!multipleProp.actProp._forHelpers.size) {
                                        delete multipleProp.actProp._forHelpers;
                                    }
                                    if (!prop._forHelpers) {
                                        makeSet(prop, "_forHelpers");
                                    }
                                    node.ownerElement._actualBinding = prop;
                                    prop._forHelpers.add(node.ownerElement);
                                }
                            }
                            node._multipleProperty[i].actProp = prop;
                            node._multipleProperty[i].dynamicValues = dynamicValues[dynamicValIndex];
                        }
                    }
	        	}
	        }
		}
        if(isDirectiveNode){
            _LC.directive.setNodeArgs(node,origNodeValue);
        }
        else if(node.nodeType === 2) {
        	let parentNodes = [];
            let pN = node._parentNode ? node._parentNode :  node.ownerElement;
            if(pN.tagName === "TEMPLATE" && pN.getAttribute("is") === "component" && node.nodeName !== "component-name" && node.nodeName !== "component-class") {
            	let isKeepAlive = pN.hasAttribute("lyte-keep-alive");
            	if(isKeepAlive) {
            		for(var key in pN._renderedComponent) {
            			parentNodes.$push(pN._renderedComponent[key]);
            		}
            	} else {
                    var compName = pN._currentComponent;
                    if(compName && pN._renderedComponent[compName]){
                        parentNodes.$push(pN._renderedComponent[compName]);
                    }
            	}
            }
            parentNodes.$push(pN);
            for(let i=0;i<parentNodes.length;i++) {
            	let parentNode = parentNodes[i];
            	if(parentNode.set) {
                    // if(parentNode._dynComp && node.nodeName == "component-data"){
                    //     parentNode.set(nodeValue , undefined, undefined,true);    
                    // }else{
                        parentNode.set(_LC.String.toCamelCase(node.nodeName), nodeValue, undefined, true);
                    // }
                    } else {
                        parentNode._initProperties = parentNode._initProperties || {};
                        parentNode._initProperties[_LC.String.toCamelCase(node.nodeName)] = nodeValue;
                    }
                    if(parentNode.tagName === "LYTE-YIELD" && parentNode.component.data && node.nodeName && parentNode.component.data[node.nodeName] !== nodeValue /*parentNode.getAttribute("is") === "insertYield"*/) {
                        _LC.set(parentNode.component.data, _LC.String.toCamelCase(node.nodeName), nodeValue,undefined , undefined, parentNode);
                    }
                    parentNode._attributes = parentNode._attributes || {};
                    //!== "string"
                    if(_LC.isCustomElement(parentNode,true) && typeof nodeValue !== "string") {
                        if(node.ownerElement.nodeName === "TEMPLATE") {
                            if(node.helperValue) {
                            	if((node.ownerElement.getAttribute("is") ===  "for" && node.nodeName === "items") || (node.ownerElement.getAttribute("is") ===  "forIn" && node.nodeName === "object")) {
                            		let oldValue = node.ownerElement._attributes[node.nodeName];
                            		let newValue = nodeValue;
                            		_LC.removeSelectedBindingDeep(node.ownerElement._actualBinding, oldValue);
                            		if(newValue  && typeof newValue !== "number") {
                            			makeSet(newValue, "_bindings");
                                        addBindings(newValue._bindings,node.ownerElement._actualBinding);
                            			_LC.establishBindings(node.ownerElement._actualBinding, newValue);
                            		}
                            		if(node.nodeName === "object") {
                            			_LC.removeSelectedBindingDeep(node.ownerElement._propBindingObject, oldValue);
                            		}
                            		//console.log("old Value ", oldValue, " new Value ", newValue);
                            	}
                            }else{
                                if((node.ownerElement.getAttribute("is") ===  "for" && node.nodeName === "items") || (node.ownerElement.getAttribute("is") ===  "forIn" && node.nodeName === "object")) {
                            		let oldValue = node.ownerElement._attributes[node.nodeName];
                            		if(node.nodeName === "object") {
                            			_LC.removeSelectedBindingDeep(node.ownerElement._propBindingObject, oldValue);
                            		}
                            	}
                            }
                            parentNode["__"+node.nodeName] = true;
                            if(node.nodeName != "case"){
                                parentNode.removeAttribute(node.nodeName);
                            }
                        } else {
                            //Needs revisiting
                            //parentNode.removeAttribute(node.nodeName);
                        }

                    } else {
                        if(typeof nodeValue === "boolean") {
                            parentNode._attributes = parentNode._attributes || {};
                            parentNode._attributes[node.nodeName] = nodeValue;
                            if(!nodeValue) {
                                parentNode.removeAttribute(node.nodeName);
                            } else {
                                parentNode.setAttribute(node.nodeName, "");
                            }
                        } else {
                            if(nodeValue && typeof nodeValue === "object"){
                                var res;
                                if(typeof Record != "undefined" && nodeValue instanceof Record){
                                    res = JSON.stringify(nodeValue.$.toJSON())
                                }
                                else{
                                    try{
                                        res = JSON.stringify(nodeValue)
                                    }
                                    catch(exp){
                                        //@Slicer.developmentStart
                                        ComponentError.error(
                                            "LC013",
                                            node.nodeName,
                                            node.ownerElement.nodeName.toLocaleLowerCase(),
                                            node.ownerElement.nodeName.toLocaleLowerCase()
                                        )
                                        //@Slicer.developmentEnd
                                    }                                
                                }
                            }
                            else if(nodeValue== null || nodeValue == undefined){
                                res = ""
                            }
                            else{
                                res = nodeValue
                            }
                            nodeValue = res;
                            let locNodeVal = nodeValue === undefined ? "" : nodeValue;
                            // if(node.nodeName === "style") {
                            //     node.ownerElement.setAttribute("style",locNodeVal);
                            // } else {
                            //     node.nodeValue = locNodeVal;
                            // }

                            // if(node instanceof Node) {
                            //Check safari issue once
                            let oE = node.ownerElement;
                            if(oE.hasAttribute(node.nodeName)) {
                                if(oE.tagName != "INPUT" || node.nodeName != "value" || !oE.validity.badInput) {
                                    oE.setAttribute(node.nodeName, locNodeVal);
                                }
                            } else {
                                node.nodeValue = locNodeVal;                              
                            }
                        }
                    }
                    parentNode._attributes[node.nodeName] = nodeValue;
                    if(/^(INPUT|TEXTAREA|SELECT)$/.test(parentNode.nodeName)) {
                        if(node.nodeName === "value") {
                             let val = (nodeValue === undefined) ? "" : nodeValue;
                             if(parentNode.value !== val) {
                                parentNode.value = val;
                             } 
                        } else if(node.nodeName === "checked") {
                            parentNode.checked = nodeValue;
                        }
                    }
                    if(!nodeValue && _LC.booleanAttrList.indexOf(node.nodeName) !== -1) {
                        parentNode.removeAttribute(node.nodeName);
                    }
                    let isStopped = parentNode._isStopped;
                    let result;
                    switch(parentNode.getAttribute("is")) {
                        case "for" :
                            this.updateForHelper(parentNode, {"type" : "update"});
                            break;
                        case "if" : 
                            result = this.updateSwitchHelper("e",parentNode, undefined, true, true);
                            break;
                        case "case" : 
                            result = this.updateSwitchHelper("s",parentNode._parentSwitch, undefined, true, true,undefined,parentNode);
                            break;
                        case "forIn" : 
                            this.updateForInHelper(parentNode , {"type" : "update"});
                            break;
                        case "switch" :
                            this.updateSwitchHelper("s",parentNode, undefined, true, true);
                            break;
                        case "component" : 
                            if(node.nodeName === "component-name" || node.nodeName === "component-class") {
                                this.updateDynamicComponent(parentNode, "update");    
                            }
                            break;
                        default:            
                    }
//                 	let handleBreakOptions;
//                 	if(isStopped &&  isStopped !== result) {
//                 		//console.log("new value is stopped");
//                 		if(!result) {
//                 			//console.log("new value is not stopped");
//                 			if(isStopped === "break") {
//                 				handleBreakOptions = "SM"
//                 			} else {
//                 				handleBreakOptions = "SS"
//                 			}
//                 		} else if(result === "break") {
//                 			handleBreakOptions = "MS";
//                 			//console.log("old value is continue and new value is break");
//                 		} else {
//                 			handleBreakOptions = "SM";
//                 			//console.log("old value is break and new value is continue");
//                 		}
//                 	} else if(result === "break") {
//                 		handleBreakOptions = "MS";
//                 		//console.log("old value not stopped and new value is break");
// //                		this.handleBreak(parentNode._cx, "break");
//                 	} else if(result === "continue") {
//                 		handleBreakOptions = "SS";
//                 		//console.log("old value not stopped and new value is continue");
// //                		this.handleBreak1(parentNode._cx , "continue");
//                 	}
//                 	if(handleBreakOptions) {
//                 		this.handleBreak(parentNode._cx, handleBreakOptions);
//                 	}
            }
        }
        else {
            node.nodeValue = nodeValue === undefined ? '' : nodeValue;
        }
        if(contextSwitchInfo) {
            _LC.removeContext(contextSwitchInfo.node, contextSwitchArray, contextSwitchInfo, isYieldContext);
        }
    }

    // handleBreak(contextSwitchInfo, options) {
    // 	if(contextSwitchInfo) {
    // 		let forTemplate = contextSwitchInfo.node;
    // 		let breakIndex = contextSwitchInfo.itemIndex;
    // 		let itemValue = forTemplate.getAttribute("item");
    // 		let forContent = contextSwitchInfo.node._forContent;
    // 		let endIndex = options[0] === "M" ? forContent.length : breakIndex + 1;
    // 		for(let j=breakIndex;j<endIndex;j++) {
    // 			let currentForContent = forContent[j];
    // 			for(let i=0;i<currentForContent.length;i++) {
    // 				currentForContent[i].remove();
    // 				if(currentForContent[i]._forContent || currentForContent[i]._caseContent) {
    // 					this.removeHelpers(currentForContent[i]);
    // 				}
    // 			}	
    // 				forContent[j] = [];
    // 				_LC.removeSelectedBindingDeep(forTemplate._items[j].itemProperty, forTemplate._attributes.items[j]);
    // 				forTemplate._helpers[j] = [];
    // 				forTemplate._items[j] = {"_dynamicProperty" : {}, "itemProperty" : {}, "indexProperty": {}};
    // 		}
    // 		let length = forTemplate._attributes.items.length;
    // 		if(options[1] === "M") {
    // 			this.updateForHelper(forTemplate, {firstIndex : breakIndex, secondIndex : length - breakIndex, "type" : "replace"}, undefined, {});
    // 		} else {
    // 			this.updateForHelper(forTemplate, {firstIndex : breakIndex, secondIndex : 1, "type" : "replace"}, undefined, {});
    // 		}
    // 	}
    // }

    createCustomEvent(eventName, parentNode, actObj){
        const customEvent = new CustomEvent(eventName);
        parentNode._actions[eventName] = customEvent;
        parentNode._actions[eventName].processAction = actObj;
    }

    isEmptyString(str){
        return (!(typeof str === "string") || str === "" );
    }

    processArgs(scope,dynN,dynamicValues,event, node, newCompile,cache,parentSq){
        let args = dynN.newHelperInfo && newCompile ? dynN.newHelperInfo.args : dynN.helperInfo.args;
        if(dynN.helperInfo && dynN.helperInfo._t == "sq")   {
            parentSq = true;
        }
        dynamicValues = dynamicValues || [];
        args = (Array.isArray(args)) ? Array.from(args) : args;
        for(let i=0; i<args.length; i++){
            if(args[i] && args[i].type){
                if(args[i].type == "sq"){
                    this.internalArray(scope, args, i, dynamicValues, event, node, newCompile,parentSq);
                }else{
                    this.internalHelpers(scope, args, i, dynamicValues, event, node, newCompile,cache,parentSq);
                }
            } else {
                if(!this.isEmptyString(args[i])) {
                    if(args[i].startsWith("'") && args[i].endsWith("'")){
                        args[i] = args[i].substr(1,args[i].length-2);       
                    } else {
                        args[i] = args[i].trim();
                        if(args[i] === "event" && event) {
                            args[i] = event;
                        } else if(args[i] === "this" && node) {
                            args[i] = node.nodeType === 2 ? node.ownerElement : node;
                        } else {
                            let dynamicVals = [];
                            args[i] = _LC.get(scope.component.data,args[i],dynamicVals,cache);
                            if(!parentSq || dynamicValues.length == 0){
                                dynamicValues.$push(dynamicVals);
                            }else{
                                if(dynamicVals.length > 1){
                                    for(let s=0; s<dynamicVals.length; s++){
                                        dynamicValues[dynamicValues.length-1].$push(dynamicVals[s]);
                                    }
                                }else{
                                    dynamicValues[dynamicValues.length-1].$push(dynamicVals[0]);
                                }
                            }
                        }
                    }
                } else if(newCompile) {
                    if(args[i] instanceof Array) {
                        args[i] = _LC.getDD(scope.component.data, args[i]);
                    }
                }
            }
            
        }
        return args;
    }

    internalHelpers(scope,args,i,dynamicValues, event, node, newCompile,cache,parentSq){
        let helperFunc = args[i].value;
        var helperVal =  this.processHelper(scope,{"name" : helperFunc.name, "args" : this.processArgs(scope,{"helperInfo" : helperFunc},dynamicValues, event, node, newCompile,cache,parentSq)});
        args[i] = helperVal;
    }
    internalArray(scope, args, i, dynamicValues, event, node, newCompile,parentSq) {
        var helperFunc = args[i].value;
        if(!parentSq){
            dynamicValues.$push([]);
        }
        var helperVal =  this.processArray(this,{"name" : helperFunc.name, "args" : this.processArgs(scope,{"helperInfo" : helperFunc},dynamicValues, event, node, newCompile,undefined,true)},dynamicValues, helperFunc.extra ? Array.from(helperFunc.extra):undefined,event, node, newCompile);
        args[i] = helperVal;
    }
    processArray(scope,helperFunc,dynamicValues,extra,event, node, newCompile){
        var arrVal;
        dynamicValues = dynamicValues || [];
        var dynVal = [];
        var arr = helperFunc.name;
        var len = helperFunc.args.length;
        var str="";
        for(var i=0; i<len; i++){
            str = str + "['"+ helperFunc.args[i] + "']"
        }
        var fullData = arr+str;
        if(extra && extra.length){
            for(var i=0; i<extra.length; i++){
                if(typeof extra[i] == "string"){
                    fullData += extra[i];
                }else{
                    if (extra[i] && extra[i].type) {
                        if (extra[i].type == "sq") {
                            this.internalArray(scope, extra, i, dynamicValues, event, node, newCompile, true);
                        } else {
                            this.internalHelpers(scope, extra, i, dynamicValues, event, node, newCompile, undefined, true);
                        }
                        fullData += extra[i];
                    } 
                }
            }
        }
        if(!helperFunc.name.startsWith('.')){
            arrVal = _LC.get(scope.component.data, fullData, dynVal);
            if(dynamicValues.length == 0){
                dynamicValues.$push(dynVal);
            }else{
                dynamicValues[dynamicValues.length-1].$unshift(dynVal[0]);
            }
            return arrVal;
        }else{
            return fullData;
        }
        
    }
    processHelper(scope,helperFunc, node){
        let args = [];
        let helperName = helperFunc.name;
        if(!scope.$component.registeredHelpers[helperName]){
            //@Slicer.developmentStart
            let app = _LC.getNearestParentApp(this.component);
            ComponentError.error(app, "LC003" , helperFunc.name);
            //@Slicer.developmentEnd
            return;
	    }
        switch(helperFunc.name){
            case "method" : 
                args.$push(this, node);
                break;
            case "lbind" :
                args.$push(this, node.ownerElement);
                break;
            case "lyteViewPort" :
                if(node && node.ownerElement){
                    args.$push(node.ownerElement);
                    if(!helperFunc.args.length){
                        args.$push(false);
                    }
                }else{
                    return true;
                }
        }
        return scope.$component.registeredHelpers[helperFunc.name].apply(scope.component,args.$concat(helperFunc.args));
        // return _LyteComponent.registeredHelpers[helperFunc.name].apply(this,args.$concat(helperFunc.args));
    }

    // getActionProperty(prop){
    //     let hostProp = this._properties;
    //     let value = (hostProp)?hostProp[prop].value:undefined;
    //     return value;
    // }

    // hasInternalBindings(content){
    //     return content.match(/[(]{1}[^)]+[)]{1}/);
    // }

    // getArgValues(argNames, properties) {
    //     let argValueArray = [];
    //     for(let i=0;i<argNames.length;i++) {
    //         argValueArray.$push(properties[argNames[i]].value);
    //     }
    //     return argValueArray;
    // }

    createEventListeners(node,actionType,actObj){
        let self = this;
        if(!node._callee && node !== this) {
            node._callee = this;
        }
        if(globalDOMEvents.indexOf(actionType) == -1){
            let infoAttr = actionType.substr(2);
            let infoAttrVal = node.getAttribute(infoAttr);
            // var evntListener = function(event) {
        	// 	var toRemove;
            //     if(!window.event) {
            //         window.event = event;
            //         toRemove = true;
            //     }
            //     _LC.throwAction.call(self,self,actionType.substr(2),actObj, undefined, undefined, node, event);
            //     if(toRemove) {
            //         window.event = undefined;
            //     }
            // };
            if ((ComponentRegistry._registeredCommonClass[node.localName] && !node.component) || (node.tagName === "TEMPLATE" && node.getAttribute("is") === "component")) {
            	node._toRegEvnts = node._toRegEvnts || {};
            	node._toRegEvnts[actionType.substr(2)] = {"listener" : globalEventHandler , "attrVal" : this.tagName.toLowerCase()+" => "+actObj.name};
            } else {
            	node.setAttribute(infoAttr, this.tagName.toLowerCase()+" => "+actObj.name);
            	//Event is not in capture phase because, in capture phase, multiple event listeners in hierarchy are called from parent to child (since registration is done in that order)
            	node.addEventListener(actionType.substr(2), globalEventHandler);
            }
            if(node.hasAttribute(actionType)){
            	node[actionType] = undefined;
            }
            node.removeAttribute(actionType);
        }
    }

    registerParentYield(yieldName){
        let locYield,parentYield = this._callee._yields[yieldName];
        if(parentYield){
            // if(Lyte._ie) {
            //     locYield = document.createElement("div");
            //     locYield.innerHTML = parentYield.outerHTML;
            //     locYield = locYield.childNodes[0];
            //     this.constructor.splitTextNodes(locYield);
            // } else {
                locYield = parentYield.cloneNode(true);
            // }
            Object.keys(parentYield).forEach(function(item) {  //eslint-disable-line no-loop-func
                locYield[item] = parentYield[item];
            });
            this._yields[yieldName] = locYield;
        }
    }

    getYieldName(node){
        if(node.getAttribute("yield-name")){
            return node.getAttribute("yield-name");
        }else if(node._attributes && node._attributes["yield-name"]){
            return node._attributes["yield-name"];
        }
    }

    registerYields() {
        this._yields = {};
        let yields = this.querySelectorAll('template[is=registerYield],template[is=yield]');
        let lazyYields = [];
        for(let i=0;i<yields.length;i++) {
            while(yields[i].hasChildNodes()) {
                yields[i].content.appendChild(yields[i].childNodes[0]);
            }
            let yieldName = this.getYieldName(yields[i]);
            if(yields[i].hasAttribute("from-parent") && this._callee) {
                if(this._callee._yields){
                    this.registerParentYield(yieldName);
                }
                else{
                    lazyYields.push(yields[i]);
                }
            } else {
                this._yields[yieldName] = yields[i];
            }
        }
        if(lazyYields.length && this._callee){
            var self = this;
            this.lazyYield = function(){
                if(self._callee){
                    for(let j=0;j<lazyYields.length;j++){
                        let lYield = lazyYields[j];
                        self.registerParentYield(this.getYieldName(lYield));
                    }
                    self._callee.removeEventListener("onReady", self.lazyYield);
                    delete self.lazyYield;
                }
            };
            this._callee.addEventListener("onReady", this.lazyYield);
        }
    }

    connectedCallback() {
        this._connectedCallback();
    }
    _connectedCallback(){
        if(this.hasAttribute("lyte-rendered") || this._ccCalled || !this._registryClass || !this.$registry.registeredComponents[this.localName]) {
            return;
        }
        let fastRenderProp = this._fR;
        if(!fastRenderProp) {
            this._callee = this._callee || this.getCallee(this.parentNode);
        }
        this.__h = {};
        this.__counter = 0;
        this.__dc = {};
        if(fastRenderProp) {
            let methods = fastRenderProp._methods;
            if(methods) {
                this.setMethods(methods);
            }
            _LC.ccDelay.$push(this);
            this._ccCalled = true;
        } else {
            this.actualConnectedCallback();
        }
        let viewObj = this.getViewObj()
        if(viewObj){
            viewObj.connectedCallback(this)
        }
    }
    cmpBind(fastRenderProp){
        let compData = this.component.data;
        if(!_LC.unbound && !fastRenderProp && !compData.lyteFastRender) {
            establishObserverBindings.call(this,this.component.constructor._observers,undefined,undefined,undefined,Lyte);
            establishWatchScope.call(this,this.constructor._deepWatchProperties)
            //this.establishObserverBindings();
            makeSet(compData, "_bindings");
            addBindings(compData._bindings,this._properties);
            _LC.establishBindings(this._properties, compData);
        }
    }
    actualConnectedCallback(){
        let compData = this.component.data;
        if(this.component.constructor.dc){
            this.dc = this.component.constructor.dc.p;
        }
        let directiveObj = this.getDirectiveObj();
        directiveObj && directiveObj.instanciatePromises(this)
        let fastRenderProp = this._fR;
        if(fastRenderProp) {
            this._callee = this._callee || this.getCallee(this.parentNode);
        }
        for(let key in this._toRegEvnts) {
        	this.addEventListener(key, this._toRegEvnts[key].listener);
        	if(this.hasAttribute(key)) {
        		this.setAttribute(key, this.getAttribute(key) + " ; "+ this._toRegEvnts[key].attrVal);
        	} else {
        		this.setAttribute(key, this._toRegEvnts[key].attrVal);
        	}
        }
        this._toRegEvnts = {};
        let initialUnbound = _LC.unbound;
        let ssrBind  = this._ssrData || this.getAttribute("ssrbindservernode");
        if(ssrBind && !this.component.data.lyteUnbound){
            this.bindServerData();
            this.removeAttribute("ssrbindservernode");
        }
        let content =  this.afterConnected(fastRenderProp,ssrBind);
        !ssrBind && this.cmpBind(fastRenderProp);

        _LC.unbound = initialUnbound;
        var tagName = this.tagName;
        let dependentPromises = [];
        directiveObj && directiveObj.getDependentPromises(this,dependentPromises,this._dependentPromise);
        if(typeof content === "string") {
            if(content) {
                if(_LC.frSpecial) {
                    let temp = document.createElement("template");
                    temp.innerHTML = content;
                    this.innerHTML = "";
                    this.appendChild(temp.content);
                } else {
                    this.innerHTML = content;
                }
            }
            _LC.processAction(this);
        }
        else{
            let viewObj = this.getViewObj()
            if(viewObj){
                viewObj.actualConnectedCallback(this,content)
            }
            let shadowObj = this.getShadowObj();
            let shadowDeep,shadowMode,shadowParent;
            var shadowSupported = _LC.directive.getTransitionArg(this,"shadow-supported")
            if(shadowObj){
                _LC.directive.setAttrFromRender(this,this._tagDirectives);
                // if(shadowSupported){
                    if(this.$registry._defaultDirectives && this.$registry._defaultDirectives.indexOf("shadow") != -1){
                        var shadowVal = _LC.directive.getTransitionArg(this,"shadow")
                        shadowMode = shadowVal;
                        this.component.data.lyteShadow = shadowVal; //af??
                    }
                    shadowParent = this;
                    if(this.parentNode.shadowRoot){
                        Lyte.warn(this.tagName +" should not be the direct child of a shadow component "+this.parentNode.tagName)
                    }
                    let rtObj = shadowObj.getShadowParent(this,directiveObj);
                    shadowParent = rtObj.shadowParent;
                    shadowDeep = rtObj.shadowDeep;
                // }
            }
            if(shadowObj && shadowMode == true){
                if(shadowSupported){
                    shadowObj.applyShadow(this,content,shadowParent,dependentPromises);
                }
                //@Slicer.developmentStart
                else{
                    ComponentError.error("LC017",this.localName)
                }
                //@Slicer.developmentEnd
            }
            else if(shadowObj && shadowParent){
                if(shadowMode == undefined && shadowDeep == true && this.constructor._observedAttributes.indexOf("lyteShadow")!=-1){
                    shadowObj.applyShadow(this,content,shadowParent,dependentPromises);
                }
                else{
                    this._hasShadowParent=true;
                    this._sw = [];
                    this.component.data.lyteShadow = false;//need to check
                    shadowObj.attachStyleToParentShadow(this, shadowParent, content);
                    if(directiveObj){
                        directiveObj.appendInDom(this,content,true,true,dependentPromises);
                    }else{
                        _LC.appendInDom(this,content);
                    }
                }
            }
            else{
                this.component.data.lyteShadow = false;//need to check
                if(this._compClass._style && Lyte.$.assetsDiv._duplicateStyle.indexOf(tagName) == -1){
                    var style = _LCSD.stringToStyle(this._compClass._style);
                    style.setAttribute("lyte-id","global-style-"+tagName);
                    if(this._ssrBind){
                        style.setAttribute("from-ssrComponent",tagName);
                    }
                    Lyte.$.assetsDiv.appendChild(style);
                    Lyte.$.assetsDiv._duplicateStyle.$push(tagName);
                }
                if(Lyte.$.shadowDiv._compList.indexOf(tagName) == -1){
                    Lyte.$.shadowDiv._compList.$push(tagName);
                }
                if(directiveObj){
                    directiveObj.appendInDom(this,content,true,true,dependentPromises);
                }else{
                    _LC.appendInDom(this,content);
                }
            }
        }
        if(directiveObj){
            this._transitionAppend = []
        }
        let dataDef = this.component.__data;
        let attributes = this.attributes;
        this.__lyteIgnore = true;
        for(let i=attributes.length-1;i>-1;i--) {
            let camelCase = _LC.String.toCamelCase(attributes[i].nodeName);
            if(dataDef[camelCase] && dataDef[camelCase].hideAttr) {
            this.removeAttribute(attributes[i].nodeName);
            }
        }
        this.__lyteIgnore = false;
	    if( this._callee && this._callee.serverCall ){
            this.serverCall = true;
        }
        //to bind in ssr
        if( this.serverCall && !this.hasAttribute( "server-rendered") ){
            this.setAttribute( "server-rendered", "");
            var newData = _LC.sendtoclient.call(this,this,true,this.component.__data);
            this.setAttribute("component-data", JSON.stringify( newData ) );
        }
        if( !this.hasAttribute( "server-rendered" ) )
        {        
	        this.setAttribute("lyte-rendered", "");
        }
        
        if(!fastRenderProp && !Lyte._ignoreOnReady) {
            this.dispatchEvent(new CustomEvent("onReady"));
        }
        
        let _config_flag;
        if( this.component._ssr && this.component._ssr.config ){
            if( this.component._ssr.config.clientLifeCycleHooks != undefined ){
                _config_flag = this.component._ssr.config.clientLifeCycleHooks == true || ( typeof this.component._ssr.config.clientLifeCycleHooks == 'object' ? this.component._ssr.config.clientLifeCycleHooks.includes('didConnect') : false );
            }
        }
        let _overrides = this.component._ssr ? this.component._ssr.overrides : undefined;
        if( !this.hasAttribute( "server-rendered" ) || this.serverCall ||  _config_flag ){
            if( _overrides && _overrides.didConnect && this.serverCall ){
                _overrides.didConnect.apply( this.component );
            }else{        
                this.callback("didConnect");
            }
            this.onCallBack("didConnect");
        }
    
        if( this.serverCall == undefined ){
            this.callback( "didRender" );
        }            
        if(fastRenderProp) {
            this.removeAttribute("_lyteprop");
        }
    }
    onCallBack(name){
        let callbacks = this.component.constructor._callBacks[name];
        if(callbacks){
            for(let i=0;i<callbacks.length;i++){
                try{
                    callbacks[i].value.call(this.component);    
                } catch(e) {
                    //@Slicer.developmentStart
                    ComponentError.error(e);
                    //@Slicer.developmentEnd
                }
                
            }
        }
    }
    callback(name){
        var func = this.component[name];
        var args;
        if(func){
            if(arguments.length > 1) {
                args = Array.from(arguments);
                args.$splice(0,1)
            }
            try{
                func.apply(this.component, args || []);    
            } catch(e) {
                //@Slicer.developmentStart
                ComponentError.error(e);
                //@Slicer.developmentEnd
            }
        }
    }
    establishObserverBindings() {
        let observers = this.component.constructor._observers;
        for(let i=0;i<observers.length;i++) {
            let props = observers[i].properties;
            for(let j=0;j<props.length;j++) {
                let actProp;
                let isArrayObserver = false;
                if(props[j].indexOf('.[]') !== -1) {
                    isArrayObserver = true;
                    actProp = this.getProperty(props[j].substring(0, props[j].indexOf('.[]')));
                } else {
                    actProp = this.getProperty(props[j]);
                }
                makeSet(actProp, "_observers");
                actProp._observers.add({callee : this, observer: observers[i], isArrayObserver : isArrayObserver});
            }
        }
    }
    removeBindings(properties, actualData) {
        var del = "delete";
        for(let i in properties) {
            let actData = actualData[i];
            if(actData && actData._bindings) {
                actData._bindings[del](properties[i]);
                //Error while trying to delete _bindings from actData when actData is of type Array
                /*  if(!actData._bindings.size) {
                    delete actData._bindings;
                } */
            }
            if(typeof properties[i] === "object" && actData) {
                this.removeBindings(properties[i], actData);
            }
        }
    }
    actualDisconnected() {
        var self = this;
        if(!self.component) {
            return;
        }
        self._cx = null;
        self._callee = null;
        self.component.$node = null;
        self.component.__data = null;
        self.component.data.__component__ = null;
        self.component.data = null;
        self.component = null;
        self.__dc = self.__dc || {};
        self.__h =  self.__h || {};
        for (key in self.__dc) {
            var helper = self.__dc[key];
            //helper.remove();
            if(helper.hasAttribute("lyte-keep-alive")) {
                var objKeys = Object.keys(helper._renderedComponent);
                for(var j=0;j<objKeys.length;j++) {
                    let key = objKeys[j];
                    if(key !== helper._currentComponent) {
                        // Will remove from hDiv.
                        helper._renderedComponent[key].remove();
                    }
                }
            }
        }
        for (key in self.__h) {
            self.__h[key].remove();
        }
        self.__h = {};
        self.__dc = {};
        let yields = self._yields;
        for(var key in yields) {
            yields[key]._callee = null;
        }
        self = null;
    }
    disconnectedCallback() {
        this._disconnectedCallback();
    }
    _disconnectedCallback(){
        if(_LC.ignoreDisconnect || !this.component) {
	       return;
        }
        let shadowObj = this.getShadowObj();
        let directiveObj = this.getDirectiveObj();
        shadowObj && shadowObj.destroyRef(this);
        let viewObj = this.getViewObj()
        if(viewObj){
            viewObj.disconnectedCallback(this)
        }
        this._destroyed = true;
        if(this.__toRemoveLazy){
            for(var __key in this.__toRemoveLazy){
                var __arr = this.__toRemoveLazy[__key];
                __arr.forEach(function(id){
                    Lyte.$.toRemoveFromRequiredServices(id);
                });
            }
            delete this.__toRemoveLazy;
        }
        this.component._bindings = null;
        var scpObj = this.__scpObj;
        if(scpObj){
            for(var key in scpObj){
                var propData = this.component.data[key], id = scpObj[key], idArr = id.split("_");
                if(propData){
                    removeNestScp(this.component.data[key], idArr[0], idArr[1], undefined, this);
                }
            }
        }
        if(!this._fR) {
            _LC.removeSelectedBindingDeep(this._properties, this.component.data, true);
        }
        if(directiveObj){
            directiveObj.destroyHelperPromises([this.__dc,this.__h]);
        }
        var h = this.__h;
        for (key in h) {
            if(h[key]._actualBinding){
                this.removeHelpers(h[key]);
            }
        }
        h = {};
        for(key in this._properties) {
            this._properties[key] = {};
        }
        this.callback('didDestroy');
        this.onCallBack('didDestroy');
        this.component.constructor.activeInstances--;
        if(!_LC.dcc) {
            _LC.dcc = [];
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    if(viewObj){
                        viewObj.actualDisconnected(this)
                    }
                    try{
                        for(var i=0,item;item=_LC.dcc[i];i++) {
                            item.actualDisconnected();
                        }
                    }
                    catch(e) {

                    }
                    _LC.dcc = undefined;
                });
            });
        }
        _LC.dcc.$push(this);
        directiveObj && directiveObj.destroyPromises(this);
        if(this.lazyYield){
            this.removeEventListener("onReady", this.registerParentYield);
        }   
        // var self = this;
        // setTimeout(function() {
        //     self.actualDisconnected();
        // },0);
        // this.constructor.activeInstances--;
    }
}
customElementPrototype._V3InsApi = ["cmpBind","component","actualConstructor","_connectedCallback","actualConnectedCallback", "getMethods","hasAction", "setActions", "setMethods", "getCallee", "afterConnected", "renderComponent", "renderFast", "formatValue", "renderNodes", "executeBlockHelpers", "updateBlockHelpers", "_attributeChangedCallback" , "removeHelpersSpecificIndex", "removeHelpers", "updateYield", "updateDynamicComponent","updateForHelper", "updateForInHelper", "updateSwitchHelper", "callObservers","bindNode","debounce", "getProperty", "updateNode", "handleBreak", "createCustomEvent", "isEmptyString", "processArgs", "internalHelpers", "processHelper", "getActionProperty", "hasInternalBindings", "getArgValues", "createEventListeners", "registerParentYield", "registerYields", "onCallBack", "callback", "establishObserverBindings", "removeBindings", "actualDisconnected" ,"_disconnectedCallback","throwAction","get","set","initializeMethod"];
customElementPrototype._V3StaticApi = ["_observers","_callBacks","_properties","activeInstances","_depthTemp","_bindsIds","_ssr","_config","_mixins","_serviceToBeUsed","_actions","_template","_dynamicNodes","_templateAttributes","_observedAttributes","_observedMethodAttributes","_data","_methods","_pendingComponents","splitTextNodes" ,"_registerComponent", "createDocFragment1" , "updateValue"];
customElementPrototype._v4RegClassApi = ["_reg","_compName","componentClass","_observedAttributes"]; //component
customElementPrototype._v4RegProtoApi = ["setData", "getData", "setMethods", "get", "set", "_pendingComponents"];
customElementPrototype.version = {v3 : {component : undefined}};
ltCf._customElementPrototype = customElementPrototype;
ltCf.v3 && !ltCf.instanctiatedBridge && ltCf.instanciateBridge();
// window._customElementPrototype = customElementPrototype;
// var onObj = function(){
//     return {"type": "callBack", "value":(this.type === "observer") ? this.value:this , "properties":arguments, "observes":(this.type === "observer" ? this: undefined)}
// }
// var observesObj = function() {
//     return {"type" : "observer", "value" : this, "properties" : arguments, "on":Function.prototype.on}
// }
// var computedObj = function() {
//     return {"type" : "computed", "value" : this, "properties" : arguments}
// }
// var fnProto = Function.prototype;
// fnProto.on ? fnProto.lyteOn = onObj : fnProto.on = onObj;
// fnProto.observes ? fnProto.lyteObserves = observesObj : fnProto.observes = observesObj;
// fnProto.computed ? fnProto.lyteComputed = computedObj : fnProto.computed = computedObj;


// BaseCompiler(Lyte,_LC);
// if(compConfig.compiler){
//     compConfig.compiler(_LC);
// }

Lyte.typeCast = _LC.typeCast;
Lyte.getDataType = _LC.getDataType;
// Lyte.Component._get = _LC.get;
_LC.chromeBugFix = function() {
    var version = userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);;
    version = version ? parseInt(version[2], 10) : 0;
    if(version > 62) {
        this.chI = [];
        document.addEventListener("focus", function(event) {
            var target = event.target;
            if(target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "DIV") {
                if(_LC.chI.indexOf(target) == -1) {
                    _LC.chI.$push(target);
                }
            }
        } , true);
        this.chromeBugFix = function() {
            var tags = _LC.chI;
            var tagsL = tags.length;
            var toRemove = ["_callee", "_attributeDetails", "_attributes", "_removedAttributes", "_yields" , "_rA", "_cx"];//no i18n
            var toBeRemoved = [];
            var keepAliveInputs = [];
            document.querySelectorAll("[lyte-keep-alive]").forEach(function(item,index){
                for(var key in item._renderedComponent) {
                    keepAliveInputs.$push.apply(keepAliveInputs, Array.from(item._renderedComponent[key].querySelectorAll("input")));
                }
            });
            for(var i= tagsL-1, item;item=tags[i];i--) {
                if((document.compareDocumentPosition(item) % 2) && (keepAliveInputs.indexOf(item) == -1)) {
                    tags.$splice(i,1);
                    item.remove();
                    toBeRemoved.$push(item);
                    item._rA = item._rA || [];
                    item._rA.forEach(function(remAttr) { //eslint-disable-line no-loop-func
                        remAttr.ownerElement = undefined;
                    });
                    toRemove.forEach(function(key) {//eslint-disable-line no-loop-func
                        item[key] = undefined;
                    });
                    Array.from(item.attributes).forEach(function(itemVal) {//eslint-disable-line no-loop-func
                        item.removeAttribute(itemVal.nodeName);
                    });
                }
            }
        }
        // Lyte.addEventListener("afterRouteTransition", function() {
        //     _LyteComponent.chromeBugFix();
        // });
        if(!Lyte.Router) {
            setInterval(function() {
                // _LC.chromeBugFix();
                _LC.String.cache_c = {};
                _LC.String.cache_d = {};
            },300000)
        }
    }
}
Lyte.$.chromeBugFix = _LC.chromeBugFix;

// _LC._directives = {};
if(!customElements.get("lyte-safari-test-component")){
    customElements.define("lyte-safari-test-component", Test, undefined, {v4 : true});
}
var divTest = document.createElement("div");
divTest.innerHTML = "<lyte-safari-test-component t></lyte-safari-test-component>";

let _LCSD = _LC.shadow;
// _LyteComponent.render = _LC.render;
//Change it in v3.0 - Remove from _LC scope. 
// _LyteComponent.insertBefore = _LC.insertBefore;
// _LyteComponent.insertAfter = _LC.insertAfter;
// _LyteComponent.replaceWith = _LC.replaceWith;
// _LyteComponent.appendChild = _LC.appendChild;
_LC.tDiv = createElement("template");
_LC.tDiv.setAttribute("id", "dummy-templates-div");
// _LC.tDiv.setAttribute("style", "display:none");
_LC.hDiv = createElement("template");
_LC.hDiv.setAttribute("id", "keep-alive-div");
// _LC.hDiv.setAttribute("style", "display:none");
_LC.h1Div = createElement("template");
_LC.h1Div.setAttribute("id", "lyte-helper-div");
// _LC.h1Div.setAttribute("style", "display:none");

// ComponentRegistry.Compile.componentsDiv = 
_LC.lyteComponentsDiv = createElement("div");
_LC.lyteComponentsDiv.setAttribute("id", "lyte-components-div");
_LC.setComponentsDiv(_LC.lyteComponentsDiv,ComponentRegistry.name);


_LC.dummyLyteComponentsDiv = document.createElement("div");
_LC.dummyLyteComponentsDiv.setAttribute("id", "dummy-lyte-components-div");
_LC.setComponentsDiv(_LC.dummyLyteComponentsDiv,ComponentRegistry.name);

// if(!Lyte._ie) {
if (document.readyState === "complete" || document.readyState === "interactive") {     
    document.body.appendChild(_LC.dummyLyteComponentsDiv);  
}else{
    document.addEventListener("DOMContentLoaded", function(){
        document.body.appendChild(_LC.dummyLyteComponentsDiv);  
    },true);
}
// }

Set.prototype.toArrayLyte = function() {
    if(this.constructor.name === "Set"){
        return Array.from(this);
    }
    else{
        return Array.from(this._values);
    }
}
//_LC.registerListener(function() {
//  
//});

if(document.readyState === "complete" || document.readyState === "interactive") {
    onDomContentForLyte();
} else {
    document.addEventListener("DOMContentLoaded", function(e){
        onDomContentForLyte();
    },true);
}
_LC.mappy = {
    t: "type",
    p: "position",
    dN: "dynamicNodes",
    c: "cases",
    d: "default",
    a: "attr",
    f: "for",
    fI: "for-in",
    e: "if",
    s: "switch",
    i: "insertYield",
    r: "registerYield",
    cM: "component",
    cD: "componentDynamic",
    a: "attr",
    tX: "text"
    // dcn - dynamicCaseName
    // cn - caseName
    // hd - hasDynamicCase
    // hc - hasChildTrans
    // in - indNew
    // l-c - lyte-convertion
    // lc-id - lyte-case-id
    // lc_id - lyte_case_id
    // cdp - casesDeepNodes
    // co - casesOrder
    // dc - _dChild
}

function createSvgDepth(actualTemplate,type){
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for(var s=0; s<actualTemplate.childNodes.length; s++){
        svg.appendChild(actualTemplate.childNodes[s].cloneNode(true));
    }
    var depthTemp = document.createElement("template");
    depthTemp.setAttribute("is", type);
    for(var s=0; s<svg.childNodes.length; s++){
        depthTemp.content.appendChild(svg.childNodes[s]);
        s--;
    }
    return depthTemp;
}
function createDepth(actualTemplate,type){
    var depthTemp = document.createElement("template");
    depthTemp.setAttribute("is", type);
    depthTemp.innerHTML = actualTemplate.innerHTML;
    return depthTemp;
}
function appendDepth(depthTemp,constr){
    constr.splitTextNodes(depthTemp);
    constr._depthTemp.content.appendChild(depthTemp);
}
function setHT(dynN,info,dynNewCompile,constr){
    var flag  = true;
    if(dynN.tagName == "TEMPLATE") {
        info._ht = dynN.innerHTML;
        flag = false;
    }
    if(info._ht) {
        if(flag){
            dynN.innerHTML = info._ht;
            constr.splitTextNodes(dynN);
        }
        if(dynNewCompile && dynNewCompile.innerHTML !== info._ht) {
            dynNewCompile.innerHTML = info._ht;
            constr.splitTextNodes(dynNewCompile);
        }
    }
}
function doCompile(dynamicN, dynamicNodes, componentName, constr, newCompile, componentClass, fastRenderClass) {
    for(let j=0;j<dynamicNodes.length;j++) {
        let info = dynamicNodes[j], type = info.t, pos = info.p, helperInfo;
        let dynN = getDynamicNode(dynamicN,pos);
        let dynNewCompile;
        if(newCompile && fastRenderClass) {
            dynNewCompile = fastRenderClass.getDynNewCompile(newCompile,pos);
        }
        switch(type) {
        case "tX" : {
            dynN.nodeValue = dynN.nodeValue.replace('.{}','____lyteinternal____');
            var syn = Compile.syntaxCheckWorkerNew(dynN.nodeValue);
            let mustache = Compile.getMustache(dynN.nodeValue,syn);
            if(mustache){
                mustache = mustache.replace('____lyteinternal____','.{}');
                actObj = Compile.getArray(mustache);  
            }
            if(!actObj && mustache){
                actObj = Compile.getHelper(mustache);  
            }
            dynN.nodeValue = dynN.nodeValue.replace('____lyteinternal____','.{}');
            let dynamic = mustache;
            if(actObj){
                info.helperInfo = actObj;
                dynNewCompile && fastRenderClass.caseTx(dynNewCompile,mustache,info,j);
           }
            else if(dynamic){
                //deepNodes.$push({type: "text", position:deepN.slice(), dynamicValue: dynamic});
                info.dynamicValue = dynamic;
                info.newDynamicValue = Compile.getDV(dynamic);
                if(dynNewCompile) {
                    fastRenderClass.replaceWithPf(dynNewCompile,j)
                }
//              LN to do
//              deepNodes.$push({type: "text", position:deepN.slice(), dynamicValue: getDV(dynamic)});                    
            }
        }
        break;
        case "i" : {
            dynNewCompile && fastRenderClass.caseI(dynNewCompile,info,j);
        }
        break;
        case "cD" : {
            dynNewCompile && fastRenderClass.caseCD(dynNewCompile,info,j);
        }
        break;
        case "a" : {
            let add = false, toBeRemoved = [],toBeAdded = [];
            let node = dynN;
            let attr = info.a = info.a || {};
            for(let i=0;i<node.attributes.length;i++) {
                if(node.attributes[i].nodeValue.indexOf("{{") !== -1) {
                    node.attributes[i].nodeValue = node.attributes[i].nodeValue.replace('.{}','____lyteinternal____');
                    var val = node.attributes[i].nodeValue;
                    var syn = Compile.syntaxCheckWorkerNew(val);
                    var actObj,actValue,multipleAttr=false;
                    var splittedMus = val.split("{{");
                    var splittedMusLen = splittedMus.length;
                    if(syn.mustache >0){
                        splittedMusLen = splittedMusLen - syn.mustache;
                    }
                    if((splittedMusLen > 2 || !/^{{/.test(val) || !/}}$/.test(val)) && /{{.*}}/.test(val) && !/\\{{.*}}/.test(val)){
                        actObj = Compile.splitMixedText(val);
                        multipleAttr = true;
                    }
                    else{
                        actValue = Compile.getMustache(val,syn);
                        if(actValue){
                            actValue = actValue.replace('____lyteinternal____','.{}');
                            actObj = Compile.getArray(actValue);  
                        }
                        if(!actObj && actValue){
                            actObj = Compile.getHelper(actValue);  
                        }
                    }
                    node.attributes[i].nodeValue = node.attributes[i].nodeValue.replace('____lyteinternal____','.{}');
                    if( actObj && (actObj.name === "action" || actObj.name === "method") && /^(onfocus|onfocusin|onfocusout|onresize|onscroll|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseover|onmouseout|onchange|onselect|onsubmit|onkeydown|onkeypress|onkeyup|oncontextmenu|__focus|__focusin|__focusout|__resize|__scroll|__click|__dblclick|__mousedown|__mouseup|__mousemove|__mouseover|__mouseout|__change|__select|__submit|__keydown|__keypress|__keyup|__contextmenu)$/.test(node.attributes[i].name)){
                            var newActObj;
                            if(actValue){
                                newActObj = Compile.getArray(actValue);  
                            }
                            if(!newActObj && actValue){
                                newActObj = Compile.getHelper(actValue,true);  
                            }
                            attr[node.attributes[i].name.substr(2)] = {
                                name:node.attributes[i].name.substr(2),
                                camelCase : _LC.String.toCamelCase(node.attributes[i].name.substr(2)),
                                helperInfo: actObj,
                                newHelperInfo : newActObj,
                                globalEvent: true
                            };
                            let actArgs = deepCopyObject(actObj.args);
                            let actName = actArgs.$splice(0,1)[0];
                            actName = actName.startsWith("'")? actName.replace(/'/g,''):  actName;
                            let actString = getArgString(actName, actArgs);
                            node.setAttribute(node.attributes[i].name.substr(2),componentName+" => "+ actString);
                            if(dynNewCompile) {
                                fastRenderClass.setAttribute(dynNewCompile, node.attributes[i].name.substr(2),componentName+" => "+ actString)
                            }
                            toBeRemoved.$push(node.attributes[i].name);                            
                    }
                    else{
                        if(actObj || actValue) {
                            let attrToPush = {};
                            // if(actObj && actObj.name === "method"){
                            //     let actArgs = deepCopyObject(actObj.args);
                            //     let actName = actArgs.$splice(0,1)[0];
                            //     actName = actName.startsWith("'")? actName.replace(/'/g,''):  actName;
                            //     let actString = getArgString(actName, actArgs);
                            //     node.setAttribute(node.attributes[i].name,componentName+" => "+ actString);
                            // }
                            if(node.attributes[i].name.startsWith("lbind:")) {
                                toBeRemoved.$push(node.attributes[i].name);
                                toBeAdded.$push({"name" : node.attributes[i].name.substring(6), "value": node.attributes[i].nodeValue});
                                attrToPush.isLbind = true;
                                attrToPush.name = node.attributes[i].name.substring(6);
                                attrToPush.camelCase = _LC.String.toCamelCase(attrToPush.name);
                            }
                            else {
                                attrToPush.name = node.attributes[i].name;
                                attrToPush.camelCase = _LC.String.toCamelCase(attrToPush.name);
                            }
                            if(actObj) {
                                if(actObj.name === "lbind") {
                                    attrToPush.dynamicValue = actObj.args[0];
                                    attrToPush.newDynamicValue = Compile.getDV(actObj.args[0]);
                                    attrToPush.isLbind = true;
                                }
                                else {
                                    attrToPush.helperInfo = actObj;
                                    var newActObj;
                                    if(multipleAttr){
                                        newActObj = Compile.splitMixedText(val);
                                    }
                                    else{
                                        if(actValue){
                                            newActObj = Compile.getArray(actValue);  
                                        }
                                        if(!newActObj && actValue){
                                            newActObj = Compile.getHelper(actValue,true);  
                                        }
                                    }
                                    attrToPush.newHelperInfo = newActObj;
                                }
                            } 
                            else {
                                attrToPush.dynamicValue = actValue;
//                              LN to do
                                attrToPush.newDynamicValue = Compile.getDV(actValue);
                            }
                            add = true;
                            attr[attrToPush.name] = attrToPush;
                        }                  
                    }
                }
                if(node.attributes[i].name.startsWith("@")){
                    let specialAttr;
                    add = true;
                    node._special = true;
                    let attrToPush = {};
                    attrToPush.name = node.attributes[i].name;
                    if(attr[attrToPush.name] && attr[attrToPush.name].dynamicValue){
                        attrToPush.dynamicValue = attr[attrToPush.name].dynamicValue;
                    }else if(attr[attrToPush.name] && attr[attrToPush.name].helperInfo){
                        attrToPush.helperInfo = attr[attrToPush.name].helperInfo;
                    }else{
                        attrToPush.stringValue = node.attributes[i].nodeValue;
                        let ndName = node.attributes[i].nodeName
                        toBeRemoved.push(ndName);
                        toBeAdded.push({name : "lyte-directive-" + ndName.slice(1,ndName.length), value : ""});
                    }
                    attr[attrToPush.name] = attrToPush;
                    attrToPush.hookNode  = true;
                    let hookName = node.attributes[i].name.slice(1,node.attributes[i].name.length);
                    attrToPush.hookName = hookName;
                    specialAttr = true;
                }
            }
            if(toBeRemoved.length){
                for(let i=0; i<toBeRemoved.length;i++){
                    node.removeAttribute(toBeRemoved[i]);
                }
            }
            if(dynNewCompile) {
                fastRenderClass.removeAttributeArr(dynNewCompile, toBeRemoved);
                fastRenderClass.removeAttributeObj(dynNewCompile, attr, j)
            }
            if(toBeAdded.length) {
                for(let i=0;i<toBeAdded.length;i++) {
                    node.setAttribute(toBeAdded[i].name, toBeAdded[i].value);
                }
            }
        } 
        break;
        case "f" : 
        case "fI" : 
        case "r" : 
            setHT(dynN,info,dynNewCompile,constr);
        case "cM" : {
            var actualTemplate = dynN.content;
            if(!dynNewCompile && (type == "r" || dynN.hasAttribute("unbound"))) { //af check
                if(fastRenderClass){
                    dynNewCompile = fastRenderClass.cMBefore(dynN, info);
                }
            }
            let depthTemp;
            let dnNode;
            let actualTemplateNewCompile = dynNewCompile ? fastRenderClass.cMBefore2(dynNewCompile, info, constr) : undefined;
            if(info.actualTemplate) {
                actualTemplate = _LC.getContentForIE(info.actualTemplate, constr, undefined, Lyte._ms? info : undefined);
            }
            doCompile(actualTemplate, info.dN, componentName, constr, actualTemplateNewCompile, componentClass, fastRenderClass);
            if(dynNewCompile){
                fastRenderClass.cMAfter(actualTemplateNewCompile, info, type, j, dynNewCompile);
            }
            // if(Lyte._ms) {
            //     if(info.actualTemplate) {
            //         info.templateContent = actualTemplate.outerHTML;
            //         if(info._content) {
            //             info.actualTemplate = info._content.innerHTML;
            //             delete info._content;
            //         }
            //     } else {
            //         info.templateContent = dynN.outerHTML;
            //     }
            //     dynN.innerHTML = "";  
            // }
            if(info.actualTemplate) {
                depthTemp = type;
                // if(!Lyte._ie ) {
                    if(info.svg){
                        depthTemp = createSvgDepth(actualTemplate,type)
                    }else{
                        depthTemp = createDepth(actualTemplate,type)
                    }
                    appendDepth(depthTemp,constr);
                // }
                if(dynamicNodes[j-1] && (dynamicNodes[j-1].p.toString() === dynamicNodes[j].p.toString())) {
                    dnNode = dynamicNodes[j-1];
                } else {
                    dnNode = dynamicNodes[j];
                }
                dnNode._depthTemp = depthTemp;
            }
            if(info._ht) {
                info._ht = dynN.cloneNode(true);
                componentClass._helperTemplate.content.append(info._ht)
                dynN.innerHTML = "";
            }
                //  When a registerYield is present inside another registerYield, in fastRender, we will not be able to get the template using the positions and parentComponent alone, since the insertYield is present inside the insertYield of the parent component. 
                // info.actYield = dynN;
              }
        break;
        case "e" : 
        case "s" : {
            let caseStr;
            setHT(dynN,info,dynNewCompile,constr);
            let depthTemp;
            let actualTemplateNewCompile;
            if(info.actualTemplate) {
                dynN = _LC.getContentForIE(info.actualTemplate, constr, undefined);
            }
            if(dynNewCompile){
                actualTemplateNewCompile = fastRenderClass.caseES(dynNewCompile, info, constr);
            }
            var def = "default";
            // if(Lyte._ms) {
            // 	var cases = {};
            //     var defCase;
            //     var dynNchildNodes = dynN.childNodes;
            //     var lyteCaseName = info.hd ? "lc-id" : "case";
            //     for(var i=0;i<dynNchildNodes.length;i++) {
            //       if(dynNchildNodes[i].tagName === "TEMPLATE"){
            //         if(dynNchildNodes[i].getAttribute(lyteCaseName)) {
            //             cases[dynNchildNodes[i].getAttribute(lyteCaseName)] = dynNchildNodes[i];
            //         } else if(dynNchildNodes[i].hasAttribute("default")) {
            //     		  defCase = dynNchildNodes[i];
            //     	  }
            //       }
            //     }
            //     for (let key in info.c) {
            //         if(info.c[key].dcn){
            //             doCompile(dynN, [info.c[key].cdp], componentName, constr ,undefined ,componentClass, fastRenderClass);
            //         }
            //     }
            //     for (let key in info.c) {
            //         let contentNewCompile;
            //         caseStr = info.c[key].dcn ? "[lc-id='" : "[case='";                    
            //         content = _LC.getContentForIE(cases[key], undefined, true);
            //         if(actualTemplateNewCompile) {
            //             contentNewCompile = _LC.getContentForIE(actualTemplateNewCompile.querySelector(caseStr+_LC.cssEscape(key)+ "']"));
            //         }
            //         setHT(content,info.c[key],contentNewCompile,constr);

            //         doCompile(content, info.c[key].dN, componentName, constr, contentNewCompile ? _LC.getContentForIE(contentNewCompile) : undefined, componentClass, fastRenderClass);

            //         cases[key].remove();
            //         if(actualTemplateNewCompile) {
            //             info.c[key]._sta = _LC.processStatic(contentNewCompile);
            //         }
            //         info.c[key].templateContent = cases[key].outerHTML;
            //     }
            //     if (info.d.dN) {
            //         let contentNewCompile;
            //         content = _LC.getContentForIE(defCase, undefined, true);
            //         if(actualTemplateNewCompile) {
            //             contentNewCompile = actualTemplateNewCompile.querySelector("[default]");
            //         }
            //         setHT(content,info.d,contentNewCompile,constr);
            //         doCompile(content, info.d.dN, componentName, constr, contentNewCompile? _LC.getContentForIE(contentNewCompile) : undefined, componentClass, fastRenderClass);

            //         defCase.remove();
            //         info.d.templateContent = defCase.outerHTML;
            //         if(actualTemplateNewCompile) {
            //             info.d._sta = _LC.processStatic(contentNewCompile);
            //         }
            //     }
            // } else {
                var dynNContent = dynN.content || dynN;
            	for(let key in info.c) {
                    caseStr = info.c[key].dcn ? "[lc-id='" : "[case='";
                    let contentNewCompile;
                    if(actualTemplateNewCompile) {
                        contentNewCompile = _LC.getContentForIE(actualTemplateNewCompile.querySelector(caseStr+_LC.cssEscape(key)+ "']"));
                    }
                    var content = _LC.getContentForIE(dynNContent.querySelector(caseStr+_LC.cssEscape(key)+ "']"), undefined, true);
                    setHT(content,info.c[key],contentNewCompile,constr);
            		if(info.c[key].dcn){
                        doCompile(dynNContent, [info.c[key].cdp], componentName, constr ,undefined ,componentClass);
                    }
                    doCompile(content.tagName === "TEMPLATE" ? content.content : content, info.c[key].dN,componentName, constr, contentNewCompile, componentClass, fastRenderClass);
                    if(actualTemplateNewCompile) {
                      info.c[key]._sta = _LC.processStatic(contentNewCompile);
                    }
                    if(info.c[key]._ht) {
                        info.c[key]._ht = content.cloneNode(true);
                        componentClass._helperTemplate.content.append(info.c[key]._ht)
                        content.innerHTML = "";
                    }
            	}
            	if(info.d.dN) {
                    let contentNewCompile
                    if(actualTemplateNewCompile) {
                        contentNewCompile = _LC.getContentForIE(actualTemplateNewCompile.querySelector("[default]"));
                    }
                    var content = _LC.getContentForIE(dynNContent.querySelector("[default]"), undefined, true);
                    setHT(content,info.d,contentNewCompile,constr);
            		doCompile(content.tagName === "TEMPLATE" ? content.content : content, info.d.dN,componentName, constr, contentNewCompile, componentClass, fastRenderClass);
                    if(actualTemplateNewCompile) {
                      info.d._sta = _LC.processStatic(contentNewCompile);
                    }
                    if(info.d._ht) {
                        info.d._ht = content.cloneNode(true);
                        componentClass._helperTemplate.content.append(info.d._ht)
                        content.innerHTML = "";
                    }
            	}
            	
            // }

            if(info.actualTemplate) {
                depthTemp = type;
                // if(!Lyte._ie ) {
                    if(info.svg){
                        depthTemp = createSvgDepth(dynN.content,type)
                    }else{
                        depthTemp = createDepth(dynN,type)
                    }
                    appendDepth(depthTemp,constr);
                // }
                if(dynamicNodes[j-1] && (dynamicNodes[j-1].p.toString() === dynamicNodes[j].p.toString())) {
            		dynamicNodes[j-1]._depthTemp = depthTemp;
            	} else {
            		dynamicNodes[j]._depthTemp = depthTemp;
            	}
            }

            if(dynNewCompile) {
                fastRenderClass.replaceWithPf(dynNewCompile,j)
            }
            if(info._ht) {
                info._ht = dynN.cloneNode(true);
                componentClass._helperTemplate.content.append(info._ht)
                dynN.innerHTML = "";
            }
        }
        break;    
        }
    }
}

//This is the function where the actual rendering takes place. 
//It takes the template, finds the actual dynamic nodes uwing dynamicNodes argument and then binds each node with the associated
//property by calling bindNode. 

function getDynamicNode(content, positions){
    let dynamicN = content;
    for(var i=0; i<positions.length; i++){
        dynamicN = (dynamicN.tagName != "TEMPLATE") ? dynamicN.childNodes[positions[i]] : dynamicN.content.childNodes[positions[i]];
    }
    return dynamicN;
}

function getArgString(name, array) {
    let retString;
    for(let i=0;i<array.length;i++) {
        if(array[i] && typeof array[i] === "object") {
            array[i] = getArgString(array[i].value.name, array[i].value.args);
        }
    }
    if(name) {
        retString = name +  "(" + array.toString() + ")";
    } else {
        retString = array.toString();
    }
    return retString;
}

var defHelpers = ComponentRegistry._defaultHelpers;
defHelpers["unbound"] = function(value){
     return value;
}
defHelpers["action"] = function(parentNode,attrName,isCustom,actObj){
    if(isCustom){
        parentNode._actions = parentNode._actions? parentNode._actions : {};
        if(!parentNode._actions[attrName]){
            this.$node.createCustomEvent(attrName, parentNode, actObj); 
            parentNode.removeAttribute(attrName);
        }
    }
    else{
        
        this.$node.createEventListeners(parentNode,attrName,actObj);    
    }
};

defHelpers["lbind"] = function(name){
	return this.getData(name);
};

defHelpers["method"] = function(parentComponent, attributeNode, functionName) {
    var parentComponent = arguments[0];
    var attributeNode = arguments[1];
    var functionName = arguments[2];
    var self = arguments[0].component;
    var childComponent = attributeNode? attributeNode.ownerElement : null;
    var attributeName = arguments[1].nodeName;
    attributeNode = null;
    var args = Array.prototype.slice.call(arguments, 2);
    var newFunc = function() {
        let node = this.$node;
        let contextSwitchArray = [];
        _LC.adCx(node, contextSwitchArray);
        let processedArgs = this.$node.processArgs(this.$node._callee,{"helperInfo" : {"args" : args}}, [], undefined, this.$node);
        let functionName1 = processedArgs.$splice(0,1)[0];
        _LC.rmCx(node, contextSwitchArray);
        let customArgs = Array.from(arguments);
        let mainArgs = processedArgs.$concat(customArgs);
        if(self._methods[functionName1]) {
            return self._methods[functionName1].apply(self, mainArgs);
        }
        //@Slicer.developmentStart
        ComponentError.error("LC005", functionName, self.$node.tagName);
        //@Slicer.developmentEnd
    }
    if(childComponent) {
        if(!childComponent.set) {
            childComponent.setMethods(_LC.String.toCamelCase(attributeName), newFunc);
        } else {
            childComponent.component._methods[_LC.String.toCamelCase(attributeName)] = newFunc;
        }
    } else {
        return newFunc;
    }
};

defHelpers["unescape"] = function(value,additionalObject,userInstance){
    let lyteIns = this.getAppOrAddon();
    if(_LC.ffr) {
        return value;
    }
    if(lyteIns.Security.ignoreSanitizer){ //af check //take this lyte app instance and proceed
        let divEle = document.createElement("div");
        divEle.innerHTML = value;
        return divEle;
    }
    else{
        if(additionalObject && Object.keys(additionalObject) && Object.keys(additionalObject).length >0){
            if(Object(additionalObject.GLOBAL_TAGS).length>0){
                var index = additionalObject.GLOBAL_TAGS.indexOf("link-to");
                if(index != -1){
                    additionalObject.GLOBAL_TAGS.$splice(index,1);
                }
            }
            if(additionalObject && additionalObject.GLOBAL_ATTRIBUTES && Object.keys(additionalObject.GLOBAL_ATTRIBUTES).length>0){
                var arr = ["yield-name","lt-prop-route", "lt-prop-dp", "lt-prop-fragment", "lt-prop-qp", "lt-prop", "lt-prop-class", "lt-prop-id", "lt-prop-rel", "lt-prop-title", "lt-prop-style", "lt-prop-target","lt-prop-td","lt-prop-custom","lt-prop-target","lt-prop-id","lt-prop-class","lt-prop-style","lt-prop-rel","lt-prop-title"];
                for(var i=0;i<arr.length;i++){
                    var index =additionalObject.GLOBAL_ATTRIBUTES.indexOf(arr[i]);
                    if(index != -1){
                        additionalObject.GLOBAL_ATTRIBUTES.$splice(index,1);
                    }
                }
            }
        }
        if(additionalObject && additionalObject.GLOBAL_TAGS){//this if check is inorder to getobserved attributes given in globaltags
            if(additionalObject.GLOBAL_ATTRIBUTES == undefined){
                additionalObject.GLOBAL_ATTRIBUTES = [];
            }
            var globalTagArr = Array.from(additionalObject.GLOBAL_TAGS);
            var attr = [];
            for(var a=0; a<globalTagArr.length; a++){
                
                let regComps = ComponentRegistry._registeredCommonClass;
                if(regComps[globalTagArr[a]]){
                    attr = regComps[globalTagArr[a]].observedAttributes;
                }else if(Lyte.registeredCustomComponent[globalTagArr[a]]){
                    if(Lyte.registeredCustomComponent[globalTagArr[a]].observedAttributes){
                        attr = Lyte.registeredCustomComponent[globalTagArr[a]].observedAttributes;
                    }else{
                        attr = [];
                    }
                }
                for(var i=0; i<attr.length; i++){
                    if(additionalObject.GLOBAL_ATTRIBUTES.indexOf(attr[i]) == -1){
                        additionalObject.GLOBAL_ATTRIBUTES.$push(attr[i]);
                    }
                }
            }
        }
        var divEle = document.createElement("div");
        if(userInstance && Object.keys(userInstance).length){
            if(additionalObject && Object.keys(additionalObject).length){
                lyteIns.Security.addGlobalObject(userInstance,additionalObject);
                var clean = userInstance.sanitize(value);
                lyteIns.Security.removeGlobalObject(userInstance,additionalObject);
            }
            else{
                var clean = userInstance.sanitize(value);
            }
        }
        else{
            if(additionalObject && Object.keys(additionalObject).length){
                lyteIns.Security.addGlobalObject(lyteIns.Security._ourSanitizerInstance_,additionalObject);
                var clean = lyteIns.Security._ourSanitizerInstance_.sanitize(value);
                lyteIns.Security.removeGlobalObject(lyteIns.Security._ourSanitizerInstance_,additionalObject);
            }else{
                var clean = lyteIns.Security._ourSanitizerInstance_.sanitize(value);
            }
        }
        divEle.innerHTML = clean;
        return divEle;
    }
};
defHelpers["unescape"] = function(value,additionalObject,userInstance){
    let lyteIns = this.getAppOrAddon();
    if(_LC.ffr) {
        return value;
    }
    let divEle = document.createElement("div");
    if(lyteIns.Security.ignoreSanitizer){ //af check //take this lyte app instance and proceed
        divEle.innerHTML = value;
        return divEle;
    }
    else{
        if(additionalObject && Object.keys(additionalObject) && Object.keys(additionalObject).length > 0){
            _LC.Security.initializeConfig(additionalObject);
            _LC.Security.removeConfig(additionalObject);
            _LC.Security.addLyteComponents(additionalObject);
        }
        let clean;
        let ins = userInstance && Object.keys(userInstance).length ? userInstance : lyteIns.Security._ourSanitizerInstance_;
        if(additionalObject && Object.keys(additionalObject).length){
            clean = _LC.Security.sanitizeWithConfig(value ,additionalObject, ins);
        }else{
            clean = ins.sanitize(value);
        }
        divEle.innerHTML = clean;
        return divEle;
    }
};

defHelpers["escape"] = function(value,type){
    if(type == 'url'){
        return ZSEC.Encoder.encodeForHTMLAttribute(value);	
    }
    else if(type == 'js'){
        return ZSEC.Encoder.encodeForJavaScript(value);
    }
    else if(type == 'css'){
        return ZSEC.Encoder.encodeForCSS(value);	
    }
    else{
        return value;
    }
};

defHelpers["debugger"] = function() {
    debugger;
};

defHelpers["log"] = function() {
    console.log.apply(window, Array.from(arguments));
};

defHelpers["ifEquals"] = function(arg1, arg2) {
    if(arg1 === arg2) {
        return true;
    } else {
        return false;
    }
};

defHelpers["if"] = function(value, trueValue, falseValue) {
    if(value) {
        return trueValue;
    } else {
        return falseValue;
    }
};

defHelpers["negate"] = function(arg1) {
    return !arg1;
};


defHelpers["ifNotEquals"] = function(arg1, arg2) {
    if(arg1 === arg2) {
        return false;
    } else {
        return true;
    }
};

defHelpers['concat'] = function(){
	var resp = '';
	var argLength = arguments.length;
	for(var i=0;i<argLength;i++){
		if(arguments[i] != undefined){
			resp += arguments[i];
		}
	}
	return resp;
};


defProp(HTMLElement.prototype, 'setData', {
    configurable : true, 
    writable : true,
    value : function(arg0, arg1) {
        this._initProperties = this._initProperties || {};
        if(typeof arg0 === "string") {
            this._initProperties[arg0] = arg1
        } else if(typeof arg0 === "object") {
            for(let key in arg0) {
                this._initProperties[key] = arg0[key];
            }
        }
    }
});

defProp(HTMLElement.prototype, 'setMethods', {
    configurable : true, 
    writable : true,
    value : function(arg0, arg1) {
        this._initMethods = this._initMethods || {};
        if(typeof arg0 === "string") {
            this._initMethods[arg0] = arg1
        } else if(typeof arg0 === "object") {
            for(let key in arg0) {
                this._initMethods[key] = arg0[key];
            }
        }
    }
});

defHelpers['encAttr'] = function(val) {
    return ZSEC.Encoder.encodeForHTMLAttribute(encodeURIComponent(val));
}

defHelpers['expHandlers'] = function(leftOperand,operator,rightOperand,nextOperand){
    var argLen = arguments.length;
    if(operator == '++' ){
    	if(rightOperand == "postfix"){
    	   return (leftOperand++);
    	} else if(rightOperand == "prefix"){
    		return (++leftOperand);
    	}
    } else if(operator == "--"){
    	if(rightOperand == "postfix"){
    	   return (leftOperand--);
    	} else if(rightOperand == "prefix") {
    		return (--leftOperand);
    	}
    } else if((operator == "==")){
    	return leftOperand == rightOperand;
    }
     else if((operator == "===")){
    	return leftOperand === rightOperand;
    }
    
    else if((operator == "!=")) {
        return leftOperand != rightOperand;
    }
    else if((operator =="!==")) {
        return leftOperand !== rightOperand;
    }
    else if( operator == "&&") {
    	return leftOperand && rightOperand;
    } else if(operator == "||") {
    	return leftOperand || rightOperand;
    } else if(operator == "+"){
        if(argLen > 2){
        	return leftOperand+rightOperand;
        }
        return leftOperand;
    } else if(operator == '-'){
         if(argLen > 2){
        	return leftOperand-rightOperand;
        }
        return (-leftOperand);
    } else if(operator == '*'){
    	return leftOperand * rightOperand;
    } else if(operator == "/"){
    	return leftOperand / rightOperand;
    } else if(operator == "%"){
    	return leftOperand % rightOperand;
    } else if(operator == "<"){
    	return leftOperand < rightOperand;
    } else if(operator == ">") {
    	return leftOperand > rightOperand;
    } else if(operator == "<=") {
    	return leftOperand <= rightOperand;
    } else if(operator == ">=") {
    	return leftOperand >= rightOperand;
    } else if(operator == '|') {
        return leftOperand | rightOperand;
    } else if(operator == '&') {
        return leftOperand & rightOperand;
    }
    else if(operator == "!" ){
        return (!leftOperand);
    } else if(operator == '=') {
        leftOperand = rightOperand;
        return leftOperand;
    } else if(operator == "+=") {
        return leftOperand += rightOperand;
    } else if(operator == '-=') {
        return leftOperand -= rightOperand;
    } else if(operator == "*=") {
        return leftOperand *= rightOperand;
    } else if(operator == '/=') {
        return leftOperand /= rightOperand;
    } else if(operator == '?:') {
        return (leftOperand ? rightOperand : nextOperand);
    }
 };

ComponentRegistry.registerCustomPropHandler("ltProp");

_LC.shouldIgnoreDisconnect = function() {
    return _LC.ignoreDisconnect;
}

_LC.addAction = function(element, eventName, func, context) {
    element._lyteEvents = element._lyteEvents || {};
    element._lyteEvents[eventName] = element._lyteEvents[eventName] || []; 
    var ind = element._lyteEvents[eventName].$push({"func" : func, "fromEventListener" : true, "context" : context});
    return eventName + "-" + ind; 
  }

ComponentRegistry.prototype.removeAction = function(element, listenerId) {
    if(!listenerId) {
        //@Slicer.developmentStart
        ComponentError.error("LC014")
        //@Slicer.developmentEnd
        return;
    }
    var split = listenerId.split('-');
    var eventName = split[0];
    var index = parseInt(split[1]);
    if(!element._lyteEvents || !element._lyteEvents[split[0]] || isNaN(index)) {
        //@Slicer.developmentStart
        ComponentError.error("LC015")
        //@Slicer.developmentEnd
        return;
    }
    element._lyteEvents[split[0]][split[1] - 1] = {};
}


_LC.hasLyteEvents = function(element, eventName) {
    if(element._lyteEvents && element._lyteEvents[eventName]) {
        return true;
    } else {
        return false;
    }
}

_LC.handleLyteEvents = function(element, event) {
    var funcs = element._lyteEvents[event.type];
    var ret;
    var eventStopped;
    for(var i=0;i<funcs.length;i++) {
        if(funcs[i].func) {
            ret = funcs[i].func.call(funcs[i].context ? funcs[i].context : window, event);
            if(ret === false || event.cancelBubble) {
                eventStopped = true;
                break;
            } 
        }
    }
    if(eventStopped) {
        event.stopPropagation();
    }
    return eventStopped;
}
_LC.executeObservers = function(compClass){
    Lyte._preRegister();
    let __observers = compClass.observers();
    Lyte._postRegister();
    return __observers;
}
_LC.chromeBugFix();
_LC.booleanAttrList = ["async","autocomplete","autofocus","autoplay","border","challenge","checked1","compact","contenteditable","controls","default","defer","disabled","formNoValidate","frameborder","hidden","indeterminate","ismap","loop","multiple","muted","nohref","noresize","noshade","novalidate","nowrap","open","readonly","required","reversed","scoped","scrolling","seamless","selected","sortable","spellcheck","translate"]

_LC.core = {};
_LC.core._constructor = customElementPrototype;
_LC.core._registerComponent = customElementPrototype._registerComponent;
_LC.core.registerComponent = _LC.registerComponent;
_LC.core.executeBlockHelpers = customElementPrototype.prototype.executeBlockHelpers;
_LC.core.updateForHelper = customElementPrototype.prototype.updateForHelper;
_LC.core.updateForInHelper = customElementPrototype.prototype.updateForInHelper;
_LC.core.updateSwitchHelper = customElementPrototype.prototype.updateSwitchHelper;

ComponentRegistry.prototype.set = _LC.set;
ComponentRegistry.prototype.get = _LC.get;
_LC.aF._name = "arrayUtils";
_LC.oF._name = "objectUtils";
Utils.addMethods([_LC.set,_LC.get,_LC.arrayUtils,_LC.objectUtils])
let appendChild = _LC.appendChild;
let insertAfter = _LC.insertAfter;
let insertBeforeFn = _LC.insertBefore
let replaceWith = _LC.replaceWith;
let render = _LC.render;
let shouldIgnoreDisconnect = _LC.shouldIgnoreDisconnect;
_LC.globalDOMEvents = globalDOMEvents;
_LC.globalEventHandler = globalEventHandler;
_LC.changeEventhandler = changeEventhandler;
_LC.doCompile = doCompile;
_LC.getDynamicNode = getDynamicNode;
export {ComponentRegistry,Component,RawComponent,Helper,arrayUtils,objectUtils,set,appendChild,insertAfter,insertBeforeFn as insertBefore,replaceWith,shouldIgnoreDisconnect,defProp,render,_LC,customElementPrototype,LyteCustomElement};
