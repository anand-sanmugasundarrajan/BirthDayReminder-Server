import { __getCurrentContext, __getCurrentFunc, __setCurrentContext, toLowerCase, Lyte } from "@slyte/core/src/lyte.js"
import { extendEventListeners } from "@slyte/core/src/lyte-utils";
/*convert to custom class*/
class Service { 
    static actions(arg1) {
      if(super.actions){
        return super.actions(arg1 ? arg1 : {});
      }
      return arg1 ? arg1 : {};
    }
    static methods(arg1) {
      if(super.methods){
        return super.methods(arg1 ? arg1 : {});
      }
      return arg1 ? arg1 : {};
    }
    static observers(arg1) {
      if(super.observers){
        return super.observers(arg1 ? arg1 : {});
      }
      return arg1 ? arg1 : {};
    }
    data(arg1) {
      if(super.data){
        return super.data(arg1 ? arg1 : {});
      }
      return arg1 ? arg1 : {};
    }
    constructor() {
        var context = __getCurrentContext();
        // if(context){
        if(context.__isAddon) {
            if(this.__isAddon){
                this.$parent = context;
                this.$app = context.$app;
            }else{
                this.$addon = context;
            }
            if(toLowerCase(this.constructor.name) !== "utils"){
                this.$utils = context.$utils;
            }
        } else {
            this.$app = context;
            if(this.__isAddon){
                this.$parent = context;
            }
            if(toLowerCase(this.constructor.name) !== "utils"){
                this.$utils = context.$utils;
            }
        }
        var func = __getCurrentFunc();
        var lookupMap;
        if(this.__isAddon){
            Object.defineProperty(this, "__lyte", {
                enumerable : false, 
                writable : true, 
                value : {"lookupMap" : new Map()}
            });
            lookupMap = this.__lyte.lookupMap;
            extendEventListeners(this.__lyte.lookupMap);
        }
        else{
            if(this.$addon){
                lookupMap = this.$addon.__lyte.lookupMap;
            }else if(this.$app){
                lookupMap = this.$app.__lyte.lookupMap;
            }
        }
        if(func) {
            func(this);
        }
        var oldContext = __getCurrentContext();
        if(this.__isAddon) {
            __setCurrentContext(this);
        }
        
        if(lookupMap.get(this.constructor)){
            lookupMap.set(this.constructor,this);
        }
        else if(this.constructor.SINGLETON){
            Lyte._singleTonLookupMap.set(this.constructor,this);
        }

        var lookups = this.lookups();
        // if(this.$addon){ //commented since lookups returned array - we are not using or holding it for anny purpose
        //     this.$addon.__lyte.lookupMap.lookups = lookups;
        // }else{
        //     this.$app.__lyte.lookupMap.lookups = lookups;
        // }
        __handleLookups(lookups, this.__isAddon ? this : context, this);
        this.__lookups = lookups;
        if(this.__isAddon) {
            __setCurrentContext(oldContext);
        }
        // }else{
            // debugger
        // }
    }
    
    lookups() {
        return [];
    }

    onLookup() {
        
    }
}
function __getLyte(service){
    return service.$addon ? service.$addon.__lyte : service.__lyte ? service.__lyte : service.$app.__lyte;
}
function __handleLookups(lookups, app, curr) {
    if(lookups && lookups.length){
        var appLookupMap = app.__lyte.lookupMap;
        var currLookupMap = __getLyte(curr).lookupMap;
        lookups.forEach(function(item) {
            if(!item){
                Lyte.error("Invalid class/instance passed in "+ curr.constructor.name + "'s lookup hook.")
                return
            }
            if(typeof item == "string") {
                if(curr) {
                    if(item.length){
                        if(appLookupMap.get(item)){
                            curr["$" + item] = appLookupMap.get(item);
                            __callOnLookup(curr["$" + item], curr);
                        }
                        else{
                            var id = app.__lyte.lookupMap.addEventListener(item, function(ins){
                                curr["$" + item] = ins;
                                __callOnLookup(ins, curr);
                                app.__lyte.lookupMap.removeEventListener(id);
                            });
                        }
                    }
                    else{
                        Lyte.error("Lookup cannot be added for empty(undefined) key");
                    }
                }
            } else {
                if(__checkIfService(item)) {
                    instantiateService(item, app, curr);
                } else if(Object.keys(item).length == 1) {
                    for(var onlyKey in item){
                        var val = item[onlyKey];
                        if(onlyKey.length){
                            if(/^(utils|node|lg|app|addon)$/.test(onlyKey)){
                                Lyte.error("Lookup cannot be added for the predefined key - "+ onlyKey);
                                return;
                            }
                            let name = "$" + onlyKey;
                            if(__checkIfService(val)) {
                                instantiateService(val, app, curr, name);
                            } else {
                                if(val && typeof val == "object"){
                                    curr[name] = val;
                                    __callOnLookup(val, curr);
                                    if(!appLookupMap.get(onlyKey)){
                                        appLookupMap.set(onlyKey, val); //how singleton af ?
                                        appLookupMap.triggerEvent(onlyKey, val);
                                    }
                                }
                                else if(typeof val == "string"){
                                    if(appLookupMap.get(val)){
                                        curr[name] = appLookupMap.get(val);
                                        __callOnLookup(curr[name], curr);
                                    }
                                    else{
                                        var id = appLookupMap.addEventListener(val, function(ins){
                                            curr[name] = ins;
                                            __callOnLookup(ins, curr);
                                            appLookupMap.removeEventListener(id);
                                        });
                                    }
                                }
                                currLookupMap.set(onlyKey, val);
                            }
                        }
                        else{
                            Lyte.error("Lookup cannot be added for empty(undefined) key");
                        }
                    }
                }
            }
            
        });
    }
}

function instantiateService(cls, app, curr, name) {
    name = name || ("$" + toLowerCase(cls.name));
    let appLookupMap = app.__lyte.lookupMap;
    // let currLookupMap = curr.__lyte.lookupMap;
    let lookupValue = appLookupMap.get(cls);
    if(lookupValue) {
        if(lookupValue instanceof Promise) {
            lookupValue.then(function(val) {
                curr[name] = val;
                __callOnLookup(val, curr);
            });
        } else {
            curr[name] = lookupValue;
            __callOnLookup(lookupValue, curr);
        }
    } else {
        if(cls.SINGLETON){
            let singleTonclass = Lyte._singleTonLookupMap.get(cls)
            if(singleTonclass){
                curr[name] = singleTonclass;
                return;
            }else{
                Lyte._singleTonLookupMap.set(cls,cls);
            }
        }else{
            appLookupMap.set(cls, cls);
        }
        let obj = curr[name] = new cls();
        __callOnLookup(obj, curr);
        appLookupMap.triggerEvent(name, obj);
    }
}
function __checkIfService(item) {
    var isService = false;
    while(item != null) {
        if(item == Service || item.__lyteOrigClass) {
            isService = true;
            break;
        } else {
            item = Object.getPrototypeOf(item);
        }
    }
    return isService;
}

function __callOnLookup(service, module) {
    if(service && service.onLookup) {
        service.onLookup(module);
    }
}
export { Service, __checkIfService, __handleLookups ,__getLyte}
