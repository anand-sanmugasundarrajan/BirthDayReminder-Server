import { defineRelation, triggerEvent, isEntity, extendEventListeners, /*getConfig,@3055*/ addEventListener, removeEventListener, copyObject, defProps, globalsSet, globalsGet, /*,type, prop, addToInstance*/set,get, arrayUtils, objectUtils,_lyteInit,_lyteDidConnect} from '@slyte/core/src/lyte-utils.js';
import { __checkIfService, __handleLookups } from "./service";
import { resolvePromises } from './rsvp';
import { Logger } from './lyte-error';
import { Utils } from "./Utils.js";
import { __getLyte } from "./service.js"
import { DataType as DataTypeClass } from "./DataType.js";
import {Mixin} from "./Mixin.js";
var __instances = { engine : {}, addon: {}};
var __componentsMap = {};
var __servicesMap = {}; // Map for containing the services needed for every engine
var __enginesMap = new Map(); //Map for containing the engines associated with every service
var d = document;
// //change to defProp later
// Function.prototype.observes = function(){//af
//   return {
//     type: "observer",
//     value: this,
//     properties: arguments,
//     on: Function.prototype.on
//   }
// }
// Function.prototype.on = function(){
//   return {
//     type: "callBack",
//     value: "observer" === this.type ? this.value : this,
//     properties: arguments,
//     observes: "observer" === this.type ? this : void 0
// }
// }
var currentContext;
var currFunc;

function __setCurrentFunc(func) {
    currFunc = func;
}

function __getCurrentFunc() {
    return currFunc;
}
function __setCurrentContext(self) {
    currentContext = self;
}

function __getCurrentContext() {
    return  currentContext;
}

function toLowerCase(string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}

function __scopedInstance(cls, args, func, extendArgs) {
  var oldcontext = __getCurrentContext();
  __setCurrentContext(this);
  var self = this;
  __setCurrentFunc(function(ins) {
      __setCurrentFunc();
      if(extendArgs && extendArgs.length){
        extendArgs.forEach(function(itm){
          // let itm__lyte = __getLyte(itm);
          // itm.__lookups
          if(itm.__lookups && itm.__lookups.length){
            __handleLookups(itm.__lookups, self, ins);
          }
        });
      }
      func(ins);
  });
  var ins = Reflect.construct(cls, args);
  __setCurrentContext(oldcontext);
  return ins;
}

class Lyte {
  static dataType(type){
    var self = this;
    class dataType extends self.DataType {}
    dataType.type = type;
    return dataType;
  }

  lookups() {
    return [];
  }

  scopedInstance() {
    return __scopedInstance.apply(this, Array.from(arguments));
  }
  static componentMap(map){
    Lyte._componentMap = map;
  }
  static register(options){
    if(options){
      if(options.app == true){
        Lyte._setDefaultApp(this);
      }
      if(options._migration){
        this._migration = options._migration;
      }
      if(options.hash){
        this._hash = options.hash;
      }
      if(options.refHash){
          this._refHash = options.refHash;
      }
    }
    var DT = this.DataType = (function() {
      class DataType extends DataTypeClass {
        static register(){
          DataTypeClass.registerInApp.apply(this, [DT]);
        }
      }
      return DataType;
    })();
    DT.dataType = {};
    extendEventListeners(DT.dataType);
    // DT.register = function(){
    //     DataTypeClass.register.apply(this, [DT]);
    // }    
    var hash = options ? options.hash : undefined;
    if(hash && DataTypeClass && DataTypeClass.app && DataTypeClass.app.has(options.hash)){
      var dMap = DataTypeClass.app.get(hash);
      if(dMap.size){
        dMap.forEach(function(cls, name){
          DataTypeClass.registerInApp.apply(cls, [DT]);
          dMap.delete(name);
        });
        if(!dMap.size){
          DataTypeClass.app.delete(hash);
        }
        if(!DataTypeClass.app.size){
          delete DataTypeClass.app;
        }
      }
    }
    if(hash){
      DataTypeClass.addEventListener(hash, function(dCls){
        DataTypeClass.registerInApp.apply(dCls, [DT]);
        if(DataTypeClass.lyte.has(hash)){
            var dMap = DataTypeClass.lyte.get(hash); 
            if(dMap.has(dCls.name)){
              dMap.delete(dCls.name);
            }
            if(!dMap.size){
              DataTypeClass.lyte.delete(hash);
            }
            if(!DataTypeClass.lyte.size){
              delete DataTypeClass.lyte;
            }
        }
      });
    }
  }
  constructor(config) {
    var self = this;
    let defApp = Lyte._getDefaultApp();
    if(!Lyte._getDefaultAppIns() &&  defApp && defApp == this.constructor){
      Lyte._setDefaultAppIns(this);
    }
    Lyte._instances.push(this);
    // extendEventListeners(this);
    // this.lyteError = Logger;
    // this.error = Logger.error.bind(Logger);
    // this.warn = Logger.warn.bind(Logger);
    // this.errorCodes = Logger.errorCodes;
    // this.addEventListener = addEventListener;
    // this.removeEventListener = removeEventListener;
    // this.triggerEvent = triggerEvent;
    var consoleTime = [],
    wLyte = Lyte;
    var type = this.is = config.__lp && config.__lp.type ? config.__lp.type :  "app";
    this.config = config;
    this.version = "4.0.0";
    this.$ = {
      isApp : type == "app",
      isSubApp : type == "subApp",
      isAddon : type == "Addon",
      reqFiles : {},
      injectServices : {},
      modules : {}
    };
    extendEventListeners(this.$.modules);
    this.$.modules.addEventListener("add", function(name, ins){
      if(!self.$.modules.hasOwnProperty(name)){
        self.$.modules[name] = [];
      }
      self.$.modules[name].push(ins);
    });
    defProps(this, {
      "__mixins__":{
        value: new Map()
      },
      "registeredServices":{
        value:{}
      },
      "registeredMixins":{
        value:{}
      },
      "_registeredComponents":{
        value: {}
      },
      "Service":{
        value:{}
      },
      "toBeInjectedServices": {
        value:{}
      },
      "toBeRegistered": {
        value:{}
      },
      "dataType":{
        value:{}
      }
    });
    defProps(this, { "customValidator":{
      value: new Map()
    } });
    this.constructor.DataType.dataType.addEventListener("add",function(name, def){
      self.dataType[name] = def;
    });
    var dTypeDef = this.constructor.DataType.dataType;
    for(var dKey in dTypeDef){
      this.dataType[dKey] = dTypeDef[dKey];
    }
    this.registeredCustomComponent = {};
    this.updateMixinsInApp();
    // this.Globals = {}
    // this.__lyteRegisteredEvents = {};
    // this.patterns = {
    //   email : /^([A-Za-z0-9._%\-'+/]+@[A-Za-z0-9.-]+\.[a-zA-Z]{2,22})$/,
    //   url : /(^(ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&amp;%$#_[\]@!()*;~]*)?$)/,
    //   ampm : /^(AM|PM|am|pm)$/,
    //   hour : /^(0?[0-9]|1[0-9]|2[0-4])$/,
    //   minute : /^(0?[0-9]|[1-5][0-9]|60)$/,
    //   boolean : /^(true|false|TRUE|FALSE)$/,
    //   alphaNumeric : /([a-zA-Z0-9])+/,
    //   alphabetsOnly : /([a-zA-Z])+/,
    //   numeric : /([0-9])+/,
    //   phoneNo : /^[0-9a-zA-Z+.()\-;\s]+$/
    // };
    // this.$.requiredMixins  = {};
    // this.$.requiredServices = {};
    var self = this;
    this.time = function(fn) {
      if(this.config.performance) {
        var index;
        if((index = consoleTime.indexOf(fn)) != -1) {
          consoleTime.splice(index,1);
          console.timeEnd(fn);
        } else {
          consoleTime.push(fn)
          console.time(fn);
        }
      }
    }

    // this.arrayUtils = arrayUtils;
    // this.objectUtils = objectUtils;
    // this.Globals.set = function(){
    //   return globalsSet.apply(self ,arguments);
    // }
    // this.Globals.get = function(){
    //   return globalsGet.apply(self ,arguments);
    // }
    // if(Lyte._component.init){
    //   Lyte._component.init(this);
    // }
    // if(config.compiler){
    //   config.compiler.compiler(this);
    // }
    _lyteInit(Lyte, this);
    this.Globals._name = "Globals";
    Utils.addMethods([this.Globals])

    if(config && config.engines){
      for(var engine in config.engines){
        var dependencies = config.engines[engine];
        if(dependencies.dependencies.services){
          __servicesMap[engine] = dependencies.dependencies.services;
        }
      }
    }

    if(type == 'engine' && name){
      if(__servicesMap[name]){
        __servicesMap[name].forEach(function(itm){
          if(config.dependencies && (engServ = config.dependencies.services)){
            if(itm && typeof itm == 'object'){
              for(var key in itm){
                if(engServ.includes(key)){
                  if(__instances.app.registeredServices.hasOwnProperty(itm[key])){
                    self.registeredServices[itm[key]] = __instances.app.registeredServices[itm[key]]
                  }
                  // else{
                  //   self.$.requiredServices(key,itm[key],callback.bind(self));
                  // }
                self.toBeInjectedServices[key] = itm[key];
                  if(!__enginesMap.has(itm[key])){
                    __enginesMap.set(itm[key],[]);
                  }
                  __enginesMap.get(itm[key]).push(self.name);
                }
              }
            }else if(itm){
              if(engServ.includes(itm)){
                if(__instances.app.registeredServices.hasOwnProperty(itm)){
                  self.registeredServices[itm] = __instances.app.registeredServices[itm]
                }
                // else{
                //   self.$.requiredServices(itm,itm,callback.bind(self));
                // }
                self.toBeInjectedServices[itm] = itm;
                if(!__enginesMap.has(itm)){
                  __enginesMap.set(itm,[]);
                }
                __enginesMap.get(itm).push(self.name);
                }
              }
            }
        })
      }
    }

    // this.__lyteRegisteredEvents = {};

    this.addEventListener("navigationStart", function(obj){
      var trans = obj.nextTrans;
      if(trans && obj.prevTrans){
          if(window.event && /^(click|dblclick|mouseover|mouseout|mousemove|mousedown|mouseup|contextmenu|keydown|keyup|keypress|submit|reset|focus|blur|input|change|select|load|resize|scroll|unload|beforeunload|DOMContentLoaded|readystatechange|touchstart|touchmove|touchend|touchcancel|play|pause|ended|volumechange|durationchange|ratechange|dragstart|drag|dragenter|dragleave|dragover|drop|dragend)$/g.test(window.event.type)){
              trans.ev = window.event;
              if(obj.prevTrans.ev){
                delete obj.prevTrans.ev;
              }
          }
          else if((obj.prevTrans.state == 409 || obj.prevTrans.state == 308) && obj.prevTrans.ev){
            trans.ev = obj.prevTrans.ev;
            delete obj.prevTrans.ev;
        }
      }
    });

    this.addEventListener("afterRouteNavigation", function(obj){
        if(obj && obj.trans){
            var mp = window.__transXHRMap;
            if(obj.trans.state == 409 || obj.trans.state == 308){
                if(mp){
                    var mpObj = mp.get(obj.trans);
                    if(mpObj){
                        removeStateFromMap(mpObj.XHR, mpObj.currentAction.type, mpObj.currentAction.target);
                        mp.delete(obj.trans);
                    }
                }
            }
            else if(obj.trans.state == 200){
                mp ? mp.delete(obj.trans) : undefined;
                obj.trans.ev ? delete obj.trans.ev : undefined;
            }
        }
    });

    this.addEventListener("afterRouteTransition",function(obj){
      if(false) { /* move code to component*/
        LyteComponent.chromeBugFix();
      }
    })

    this.addEventListener("beforeRouteNavigation", function(obj){
        if(obj && obj.prevTrans && obj.prevTrans.nested){
            obj.trans.ev = obj.prevTrans.ev;
            obj.trans.fromPrevTrans = true; // temp check
        }
    });

    this.includes = function(modules) {
      for(var module in modules) {
        var mod = this[module] = modules[module];
        mod.lyteInit ? mod.lyteInit(this) : undefined;
      }
    }
    // this.Security = {};
    // this.Security.$scp = this;
    // this.Security.createSanitizer = Lyte.Security.createSanitizer;
    // addToInstance(this);
    // window.Lte = Lyte.$scp[type][this.name] = this;
    //window.Lte = Lyte.$scp[type][this.name] = this;
    if(__instances.app && false) { /* remove this code. Move this to component module */
      for(var compName in __globalElements.Component.registeredComponents){
        __componentsMap[compName] = {
              'is' : __instances.app.is,
              'name' : __instances.app.name
        };
      }
    }

    // if(false) { /* check code to move to compoennt module*/
    //   this.Component._registeredComponents = Object.assign(this.Component._registeredComponents , __globalElements.Component._registeredComponents);
    //   this.Component.registeredComponents = Object.assign(this.Component.registeredComponents , __globalElements.Component.registeredComponents);
    //   this.Component.registeredHelpers = Object.assign(this.Component.registeredHelpers , __globalElements.Component.registeredHelpers);
    //   this.Component.customPropRegex =  __globalElements.Component.customPropRegex;
    //   this.Component.customPropHandlers = Array.from(__globalElements.Component.customPropHandlers);
    // }
    // this.$.requiredMixins.component = Lyte.Component.requiredMixins.component;
    // this.Security = {};
    // this.Security.$scp = this;
    // this.Security.createSanitizer = Lyte.Security.createSanitizer;

    if(config && config.init){
      config.init.apply(this);
    }
    Object.defineProperty(this, "__lyte", {
      enumerable : false, 
      writable : true, 
      value : {"lookupMap" : new Map()}
    });
    extendEventListeners(this.__lyte.lookupMap);
    __setCurrentContext(this);
    __handleLookups([Utils], this, this);
    var lookups = this.lookups();
    // if(Array.isArray(lookups)){
    //   lookups.unshift(Utils);
    // }
    // else{
    //   lookups = [Utils];
    // }
    __handleLookups(lookups, this, this);
    __setCurrentContext(undefined)   
    // if(Lyte.instantiateComponent){
    //   Lyte.instantiateSecurity(this);
    // }
    // if(Lyte._component.didConnect){
    //   Lyte._component.didConnect(this);
    // }
    _lyteDidConnect(Lyte, this);
  }
  updateMixinsInApp(){
    var hash = this.constructor._hash;
    if(hash){
      var mObj = Mixin.registeredMixin[hash];
      if(mObj){
        for(var key in mObj){
          let mixinCls = mObj[key];
          if(this.constructor._hash == mixinCls._refHash){
            this.registeredMixins[mixinCls.name] = mixinCls;
          }
        }
      }
    }
  }
  static isEntity(obj){
    isEntity(obj);
  }
  get __isApp() {
    return true;
  }
}

Lyte._instances = [];

var fnProto = Function.prototype;
if(!fnProto.on){
    fnProto.on = function(){
        Lyte.warn("'.on()' method with the argument '" + arguments[0] + "' cannot be executed outside component scope.");
        return { "type": "callBack", "value": this.type === "observer" ? this.value : this, "properties": arguments, "observes": this.type === "observer" ? this : undefined };
    };
}
if(!fnProto.observes){
    fnProto.observes = function(){
        Lyte.warn("'.observes()' method with the arguments '" + arguments[0] + "' cannot be executed outside component scope.");
        return { "type": "observer", "value": this, "properties": arguments, "on": Lyte._onObj, "lyteOn": Lyte._onObj };
    };
}
if(!fnProto.computed){
    fnProto.computed = function(){
        Lyte.warn("'.computed()' method with the arguments '" + arguments[0] + "' cannot be executed outside component scope.");
        return { "type": "computed", "value": this, "properties": arguments };
    };
}
Lyte._onObj = function(){
  return {"type": "callBack", "value":(this.type === "observer") ? this.value:this , "properties":arguments, "observes":(this.type === "observer" ? this: undefined)}
}
Lyte._observesObj = function() {
    return {"type" : "observer", "value" : this, "properties" : arguments, "on": Lyte._onObj, "lyteOn" : Lyte._onObj}
}
Lyte._computedObj = function() {
    return {"type" : "computed", "value" : this, "properties" : arguments}
}
Lyte._preRegister = function(){
  Lyte._actualFnProtoOn = Function.prototype.on;
  Lyte._actualFnProtoObserves = Function.prototype.observes;
  Lyte._actualFnProtoComputed = Function.prototype.computed;
  let fnProto = Function.prototype;
  fnProto.on = fnProto.lyteOn = Lyte._onObj;
  fnProto.observes = fnProto.lyteObserves = Lyte._observesObj;
  fnProto.computed = fnProto.lyteComputed = Lyte._computedObj;
}
Lyte._postRegister = function(){
  let fnProto = Function.prototype;
  fnProto.on = Lyte._actualFnProtoOn;
  fnProto.observes = Lyte._actualFnProtoObserves;
  fnProto.computed = Lyte._actualFnProtoComputed;
}

Object.defineProperty(Lyte, "_singleTonLookupMap", {
  enumerable : false, 
  writable : true, 
  value : new Map()
});
extendEventListeners(Lyte._singleTonLookupMap);
// Lyte.prototype.arrayUtils = function(){
//   if(this.$.modules.component && this.$.modules.component.length){
//     let lc = this.$.modules.component[0]._getLyteComponent();
//     return lc.aF.apply(lc, arguments);
//   }else{
//     this.error("arrayUtils will be supported only if component registry is imported in the app");
//   }
// }
// Lyte.prototype.objectUtils = function(){
//   if(this.$.modules.component && this.$.modules.component.length){
//     let lc = this.$.modules.component[0]._getLyteComponent();
//     return lc.oF.apply(lc, arguments);
//   }else{
//     this.error("objectUtils will be supported only if component registry is imported in the app");
//   }
// }
// extendEventListeners(Lyte);
// Logger.addEventListener("error", function(){  
//   var arr = Array.from(arguments);
//   if (Lyte.onerror) {
//     Lyte.onerror.apply(Lyte, arr);
//   }
//   if(Lyte.triggerEvent){
//     arr.unshift("error");
//     Lyte.triggerEvent.apply(Lyte, arr);
//   }
// });

window.addEventListener("getLyteIns", function(ev){
  if(ev && ev.detail && ev.detail.init){
    ev.detail.init(Array.from(Lyte._instances));
  }
});
// Lyte.prototype.Compile = {};
window.LyteCls = Lyte;/* global lyte class */
Lyte.error = Logger.error.bind(Logger);
Lyte.warn = Logger.warn.bind(Logger);
Lyte.errorCodes = Logger.errorCodes;
Lyte.browser = {};
Lyte._component = {};
Lyte.appList = [];
Lyte._setDefaultApp = function(appClass){
  Lyte._defaultApp = appClass;
}
Lyte._setDefaultAppIns = function(appIns){
  Lyte._defaultAppIns = appIns;
}
Lyte._getDefaultApp = function(){
  return Lyte._defaultAppIns;
}
Lyte._getDefaultAppIns = function(){
  return Lyte._defaultAppIns;
}
var userAgent = navigator.userAgent;
//temporary fix for IE 11
if (userAgent.match(/rv:11/)) {
  Lyte.browser.ie = true;
  window.action = function () {
    return;
  };
}
if (userAgent.match('Edge')) {
  var s = createElement("div");
  s.innerHTML = "<template><div>c</div></template>";
  if (s.querySelector("template").childNodes.length) {
    Lyte.browser.ie = true;
  } else {
    Lyte.browser.edge = true;
  }
  s.remove();
}

Lyte.reg = function(fn,options) {
  let type = options.type;
  let name = options.name;
  if(Lyte.$scp[type][name] && Lyte.$sscp[type][name]){
    fn(Lyte.$scp[type][name],Lyte.$sscp[type][name]);
  }
  else{
    Lyte.$scp[type][name] = new Lyte(type,name);
    Lyte.$sscp[type][name] = new Lyte.Store();
    fn(Lyte.$scp[type][name],Lyte.$sscp[type][name]);
  }
}
Lyte.$scp = {app : {}, addon : {}, subApp : {}};
Lyte.$sscp = {app : {},subApp : {}}
// Lyte.__lyteRegisteredEvents = {};
// Lyte.addEventListener = addEventListener;
// Lyte.removeEventListener = removeEventListener;
// Lyte.triggerEvent = triggerEvent;
Lyte.toBeRegistered = [];
Lyte.nestScp = {};
Lyte.nestScpId = 1;
Lyte.addons = {};
Lyte.registeredCustomComponent = {};
Lyte.$ = {
  assetsDiv : document.createElement("div"),
  shadowDiv : document.createElement("div")
}
Lyte.$.assetsDiv.setAttribute("id", "lyteAssetsDiv");
Lyte.$.shadowDiv.setAttribute("id", "lyteShadowDiv");

Lyte.domContentLoaded = function(callback) {
  if(d.readyState === "complete" || d.readyState === "interactive") { 
    callback();
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      callback();
    });
  }
}

Lyte.createApplication = function(name, config){
  var ins = new Lyte("app", name, config);
  setTimeout(function() {
    config.includes.forEach(function(module) {
      module.init && module.init(ins);
    });
  },0)
  if(Lyte.Store) {
    var sins = new Lyte.Store();
    Lyte.$sscp.app[name] = sins;
  }
  // window.Lte = Lyte.$scp.app[name] = ins;
  return ins;
}

Lyte.createEngine = function(name, config){
  var ins = new Lyte("engine", name, config);
  // var sins = new Lyte.Store();
  // Lyte.$sscp.engine[name] = sins;
  Lyte.$scp.engine[name] = ins;
  return ins;
}

Lyte.createAddon = function(name, config){
  var ins = new Lyte("addon", name, config);
  Lyte.$scp.addon[name] = ins;
  return ins;
}

// Lyte.prototype.types = ["string", "object", "number", "boolean", "array"];

// Lyte.prototype.deepCopyObject = function(obj){
//   return copyObject(obj);
// }

// Object.defineProperty(Lyte, 'debug', {
//   set : function(data) {
//     Lyte._debug = Lyte.prototype.debug = data;
//     return data;
//   },
//   get : function() {
//     return Lyte._debug;
//   }
// });

// Lyte.prototype.log = function (text, src, color) {
//   if (this.config.debug) {
//       if(color) {
//           console.log("%c" + text,'color:' + color);
//       } else {
//         console.log(text);      
//       }
//   }
// };

// Lyte.prototype.isComponent = function(object) {
//   if(object && object.$node && object.__data) {
//     return true;
//   }
//   return false;
// }
// Lyte.prototype.Transform = {};
// Lyte.prototype.prop = function(type, opts){
//   var obj = {};
//   obj.type = type;
//   if(opts == undefined){
//     opts = {};
//   }
//   // if(this.types.indexOf(type) == -1 && !this.Transform.hasOwnProperty(type)){
//   //   throw new Error("Not a valid field type - "+type);
//   // }
//   Object.assign(obj,opts);
//   return obj;
// }

// Lyte.prototype.one = function(name,opts){
//   return defineRelation(name,"belongsTo",opts);
// }

// Lyte.prototype.many = function(name,opts){
//   return defineRelation(name,"hasMany",opts);
// }

// Lyte.prototype.registerDataType = function(fieldTypeName, properties){
//   var exts = "extends";
//   if(this.Transform.hasOwnProperty(fieldTypeName)){
//     this.error("Custom Field Type - "+fieldTypeName+" -  already exists.");
//     return;
//   }
//   if(properties[exts] == undefined || this.types.indexOf(properties[exts]) == -1){
//     this.error("Not a valid field type - "+properties[exts]);
//     return;
//   }
//   this.Transform[fieldTypeName] = properties;
// }

// Lyte.prototype.registerPattern = function(patternName, pattern){
//   this.patterns[patternName] = pattern;
// }

// Lyte.prototype.injectResources = function (files, every, completed, options) {
//   var successFiles = [],
//   errorFiles = [],
//   scope = this;
//   every = every || function () {};
//   completed = completed || function () {};
//   return new Promise(function (resolve,reject) {
//     processRequirements(files, function () {
//       if (options && options.defer) {
//         options.defer({
//           injectJS: injectJS,
//           files: files,
//           errorFiles: errorFiles
//         });
//         resolve();
//       } else {
//         injectJS(files, function () {
//           completed(successFiles, errorFiles);
//           if(errorFiles.length) {
//               reject(successFiles, errorFiles);
//             } else {
//               resolve(successFiles, errorFiles);
//             }
//         });
//       }
//     }.bind(this));
//   });

//   function injectJS(files, resolve, execFiles) {
//     execFiles = execFiles || []
//     if (!files) {
//       resolve(successFiles, errorFiles);
//     } else {
//       if (!Array.isArray(files)) {
//         files = [files];
//       }
//       if (!files.length) {
//         resolve(successFiles, errorFiles);
//       }
//       var len = -files.length;
//       files.forEach(function (file) {
//         if (typeof file == "string") {
//            var fileSplit = file.split('.'),
//           type = fileSplit[fileSplit.length - 1];
//           if (type && type == "js" && execFiles.indexOf(file) == -1) {
//             execFiles.push(file);
//             createScript(file, function () {
//               loaded();
//             });
//           } else {
//             loaded();
//           }
//         } else if (Array.isArray(file)) {
//           new Promise(function (r) {
//             injectJS(file, r);
//           }).then(function () {
//             loaded();
//           });
//         } else {
//           len--;
//           new Promise(function (r) {
//             injectJS(file.parent, r);
//           }).then(function () {
//             new Promise(function (r) {
//               injectJS(file.child, r);
//             }).then(function () {
//               loaded();
//             });
//             loaded();
//           });
//         }
//       });
//     }

//     function loaded() {
//       len++;
//       if (len == 0) {
//         resolve(successFiles, errorFiles);
//       }
//     }
//   }

//   function createScript(file, resolve) {
//     var ev = scope.injectResources.respObj[file];
//     if (!scope.injectResources.availableTags[file] || scope.injectResources.availableTags[file].tag.tagName == "LINK") {
//       var tag = document.createElement('script');
//       tag.setAttribute('type', "text/javascript");
//       ev.getAttributeNames().forEach(function (attr) {
//         if (["href", "as", "rel"].indexOf(attr) == -1) {
//           tag.setAttribute(attr, ev.getAttribute(attr));
//         }
//       });
//       tag.setAttribute('src', file);
//       tag.onerror = tag.onload = function(event) {
//         if (event.type == "error") {
//           errorFiles.push(event)
//         } else {
//           successFiles.push(event)
//         }
//         scope.injectResources.availableTags[file].tag.remove();
//         scope.injectResources.availableTags[file] = { tag: tag, event: { type: event.type == "error" ? "error" : "load"} };
//         resolve();
//       }
//       Lyte.$.assetsDiv.appendChild(tag);
//     } else {
//       resolve();
//     }
//   }

//   function processRequirements(files, resolve) {
//     if (!files) {
//       resolve();
//     } else {
//       if (!Array.isArray(files)) {
//         files = [files];
//       }
//       if (!files.length) {
//         resolve();
//       }
//       var len = -files.length;
//       files.forEach(function (file) {
//         if (typeof file == "string") {
//           requestFile.call(scope, file, scope.injectResources.availableTags[file], function () {
//             loaded();
//           });
//         } else if (Array.isArray(file)) {
//           new Promise(function (r) {
//             processRequirements(file, r);
//           }).then(function () {
//             loaded();
//           });
//         } else {
//           len--;
//           new Promise(function (r) {
//             processRequirements(file.parent, r);
//           }).then(function () {
//             loaded();
//           });
//           new Promise(function (r) {
//             processRequirements(file.child, r);
//           }).then(function () {
//             loaded();
//           });
//         }
//       });
//     }

//     function loaded() {
//       len++;
//       if (len == 0) {
//         resolve();
//       }
//     }

//     function requestFile(file, cached, resolve) {
//       if(this.$.reqFiles[file]) {
//         this.$.reqFiles[file].push(resolve);
//       } else {
//         var scope = this;
//         this.$.reqFiles[file] = [resolve];
//         if (cached && cached.event.type != "error") {
//           if (this.removeFromCache.arr.indexOf(file) != -1) {
//             this.removeFromCache.arr.splice(scope.removeFromCache.arr.indexOf(file), 1);
//           }
//           fileLoaded.call(cached.tag, file, cached.event, true);
//           resolve();
//         } else {
//           makeRequest(file, function (event) {
//             scope.injectResources.respObj[file] = this;
//             scope.$.reqFiles[file].forEach(function (resolve) {
//               resolve();
//             });
//             // filesObj[file] = this;
//             fileLoaded.call(this, file, event);
//             every.call(this, event);
//           });
//         }
//       }
//     }

//     function fileLoaded(file, event, cached) {
//       delete scope.$.reqFiles[file];
//       if (!cached) {
//         if (scope.injectResources.availableTags[file]) {
//           scope.injectResources.availableTags[file].tag.remove();
//           delete scope.injectResources.respObj[file];
//         }
//         this.onerror = this.onload = undefined;
//         scope.injectResources.availableTags[file] = { tag: this, event: { type: event.type } };
//       }
//     }
//   }

//   function makeRequest(file, callBack) {
//     var tag,
//         ev = every.internal || {},
//         fileSplit = file.split('.'),
//         type = fileSplit[fileSplit.length - 1];
//     ev.file = file;
//     if (fileSplit.length == 1) {
//       Lyte.error('Type of file is not specified in injectResources.');
//       return;
//     }
//     tag = document.createElement('link');
//     tag.setAttribute('href', file);
//     ev.tag = tag;
//     if (type == 'css') {
//       tag.setAttribute('type', "text/css");
//       tag.setAttribute('rel', "stylesheet");
//       tag.onerror = tag.onload = function (event) {
//         // if (event.type == "error") {
//         //   errorFiles.push(event);
//         // } else {
//         //   successFiles.push(event);
//         // }
//         callBack.call(this, event);
//       };
//     } else {
//       tag.setAttribute('as', "script");
//       tag.setAttribute('rel', "preload");
//       tag.onerror = tag.onload = function (event) {
//         // if (event.type != "error") {
//         //   tag.status = 200;
//         // }
//         callBack.call(this, event);
//       };
//     }
//     Lyte.triggerEvent("onBeforeInject", ev);
//     Lyte.$.assetsDiv.appendChild(tag);
//   };
// };

// if(Lyte.browser.ie) { //remove no ie support // af
//   Lyte.prototype.injectResources = function (files, every, completed) {
//     var successFiles = [],
//     errorFiles = []; 
//     every = every || function() {};
//     completed = completed || function() {};
//     return new Promise(function(resolve) {
//       processRequirements(files, resolve);   
//     }).then(function() {
//       completed(successFiles,errorFiles);  
//     });

//     function processRequirements(files, resolve) {
//       if(!files) {
//         resolve();
//       } else {
//         if(!Array.isArray(files)) {
//           files = [files];
//         }
//         if(!files.length) {
//           resolve();
//         }
//         var len = -(files.length);
//         files.forEach(function(file) {
//           if(typeof file == "string"){
//             requestFile.call(scope,file, scope.injectResources.availableTags[file], function() {
//               loaded();
//             });  
//           } else if(Array.isArray(file)) {
//             new Promise(function(r){
//               processRequirements(file, r);
//             }).then(function(){
//               loaded();
//             })
//           } else {
//             new Promise(function(r){
//               processRequirements(file.parent, r);
//             }).then(function(){
//               new Promise(function(r1){
//                 processRequirements(file.child, r1)
//               }).then(function(){
//                 loaded();
//               })
//             })
//           }
//         })
//       }

//       function loaded() {
//         len++;
//         if(len == 0) {
//           resolve();
//         }
//       }

//       function requestFile(file,cached,resolve) {
//         if(this.$.reqFiles[file]) {
//           this.$.reqFiles[file].push(resolve)
//         } else {
//           this.$.reqFiles[file] = [resolve];
//           if(cached && cached.event.type != "error") {
//             if(this.removeFromCache.arr.indexOf(file) != -1) {
//               this.removeFromCache.arr.splice(this.removeFromCache.arr.indexOf(file),1);
//             }
//             fileLoaded.call(cached.tag,cached.event,true);
//             resolve();
//           } else {
//             makeRequest(file,
//               function(event) {
//                 this.$.reqFiles[file].forEach(function(resolve) {
//                   resolve();
//                 });
//                 fileLoaded.call(this,event);
//                 every.call(this,event);
//               }
//             );
//           }
//         }
//       }

//       function fileLoaded(event,cached) {
//         var file = this.getAttribute('src') || this.getAttribute('href');
//         delete scope.$.reqFiles[file];
//         if(!cached) {
//           if(scope.injectResources.availableTags[file]) {
//             scope.injectResources.availableTags[file].tag.remove();
//           }
//           this.onerror = this.onload = undefined;
//           scope.injectResources.availableTags[file] = {tag : this, event : {type : event.type}};
//         }
//       }
//     }

//     function makeRequest(file,callBack) {
//       var tags = { ".js": 'script', ".css" : 'link' },
//       type = file.match(/\.[a-zA-Z]+(?=\?|$)/),
//       tag = document.createElement(tags[type]);
//       if (!type) {
//         Lyte.error('Type of file is not specified in injectResources.');
//         return;
//       } else if (type == '.css') {
//         tag.setAttribute('href', file);
//         tag.setAttribute('type', "text/css");
//         tag.setAttribute('rel', "stylesheet");
//       } else {
//         tag.setAttribute('src', file);
//       }
//       tag.onerror = tag.onload = function (event) {
//         if(event.type == "error") {
//           errorFiles.push(event);  
//         } else {
//           successFiles.push(event);
//         }
//         if(callBack) {
//           callBack.call(this,event);
//         }
//       };
//       var ev = every.internal || {};
//       ev.file = file;
//       ev.tag = tag;
//       Lyte.triggerEvent("onBeforeInject", ev);
//       Lyte.$.assetsDiv.appendChild(tag);
//     };
//   };
// }

// Lyte.prototype.injectResources.availableTags = [];
// Lyte.prototype.injectResources.respObj = [];

// Lyte.prototype.removeFromCache = function(arr) {
//   var scope = this;
//   this.removeFromCache.assign.call(this,arr);
//   if(this.removeFromCache.arr.length) {
//     this.removeFromCache.arr.forEach(function(file) {
//       if(scope.injectResources.availableTags[file]) {
//         scope.injectResources.availableTags[file].tag.remove();
//         delete scope.injectResources.availableTags[file];  
//       }
//     });
//     this.removeFromCache.arr = [];
//   }
// }

// Lyte.prototype.removeFromCache.arr = [];

// Lyte.prototype.removeFromCache.assign = function(arr) {
//     arr = arr == "*" ? Object.keys(this.injectResources.availableTags) : (Array.isArray(arr) ? arr : [arr]); 
//     this.removeFromCache.arr = this.removeFromCache.arr.concat(arr);
//     return;
// }

// Lyte.prototype.triggerEvent = triggerEvent;

// Lyte.prototype.addEventListener = addEventListener;

// Lyte.prototype.removeEventListener = removeEventListener; 

// Lyte.prototype.extendEventListeners = extendEventListeners;

// Lyte.prototype.resolvePromises = function(promises) {
//   return new Promise(function(res, rej) {
//     resolvePromises(promises).then(function(data) {
//       res(data);
//     },function(data) {
//       rej(data);
//     })
//   })
// }

Lyte.createCustomElement = function(customElementName, definition) {
  var constructor = definition.constructor;
  delete definition.constructor;
  var connectedCallback = definition.connectedCallback;
  delete definition.connectedCallback;
  var attributeChangedCallback = definition.attributeChangedCallback;
  delete definition.attributeChangedCallback;
  var disconnectedCallback = definition.disconnectedCallback;
  delete definition.disconnectedCallback;

  this.defProperty = function(obj, key, val) {
    var obj1 = {};
    if(val.get) {
      obj1.get = val.get
    }
    if(val.set) {
      obj1.set = val.set
    }
    Object.defineProperty(obj, key, obj1);
  }
  class classDef extends HTMLElement {
    constructor() {
      super();
      if(this.isNewComp(customElementName)){
        this.executeCallbacks(constructor,arguments);
      }else{
        this.__lyteIgnore = true;
      }
    }

    connectedCallback(){
      let _LC = Lyte._instances[0].$.modules.component[0]._getLyteComponent();//temp fix
      if(!_LC.ignoreDisconnect && !this.__lyteIgnore) {
        this.executeCallbacks(connectedCallback,arguments);
        this.setAttribute("lyte-rendered-ce", "");
      }
    }
    attributeChangedCallback(){
      if(!this.__lyteIgnore) {
        this.executeCallbacks(attributeChangedCallback,arguments);
      }
    }
    disconnectedCallback(){
      let _LC = Lyte._instances[0].$.modules.component[0]._getLyteComponent();//temp fix
      if(!_LC.ignoreDisconnect && !this.__lyteIgnore) {
        this.executeCallbacks(disconnectedCallback,arguments);
      }
    }
    executeCallbacks(callBack,argArr){
      if(callBack) {
        callBack.apply(this, Array.from(argArr));
      }
    }
    isNewComp(customElementName){
      if(this.hasAttribute("lyte-rendered-ce")) {
        return false;
      }
      return true;
    }
  }
  var staticDef = definition.static;
  if(staticDef) {
    for(var key in staticDef) {
      if(typeof staticDef[key] === "object") {
        this.defProperty(classDef, key, staticDef[key]);
      } else {
        Object.defineProperty(classDef, key, {
          value : staticDef[key]
        });
      }
    }
    delete definition.static;
  }
  for(var key in definition) {
    if(typeof definition[key] === "object") {
      this.defProperty(classDef.prototype, key, definition[key]);
    } else {
      Object.defineProperty(classDef.prototype, key, { writable: true, value : definition[key]});
    }
  }
  definition.static = staticDef;
  definition.constructor = constructor;
  definition.connectedCallback = connectedCallback;
  definition.attributeChangedCallback = attributeChangedCallback;
  definition.disconnectedCallback = disconnectedCallback;
  if (document.readyState === "complete" || document.readyState === "interactive") {     
    // document is already ready to go
    customElements.define(customElementName, classDef);
  }
  else{
    // ***
    //Change the Lyte to instance
    Lyte.toBeRegistered.push({name:customElementName, def: classDef});
  }
  Lyte.registeredCustomComponent[customElementName] = classDef;
}

function domContentLoaded1() {
  document.head.appendChild(Lyte.$.assetsDiv);
  document.head.appendChild(Lyte.$.shadowDiv);
  let comp = Lyte.toBeRegistered;    
  if(comp && comp.length){    
      for(let j=0; j<comp.length;j++){
          customElements.define(comp[j].name, comp[j].def);    
      }    
      Lyte.toBeRegistered = [];    
  }
}

if(document.readyState === "complete" || document.readyState === "interactive") {
    domContentLoaded1();
} else {
    document.addEventListener("DOMContentLoaded", function(e){
        domContentLoaded1();
    },true);
}

//@3055
// var XHRSend = XMLHttpRequest.prototype.send;
// XMLHttpRequest.prototype.send = function(){
//     var event = window.event;  
//     var type, target = event ? event.target : undefined; 
//     let regIns = getConfig("stateHandling",true)
//     if(getConfig("stateHandling")){
//         if(event){
//             type = event.type;
//             /^(click|dblclick)$/.test(type) && target && target.getAttribute && target.getAttribute("lyte-state-handling") != "false" ? addStateToMap(type,target,this) : undefined;
//         }
//         else{
//             var router = Lyte && Lyte.Router ? Lyte.Router.getRouteInstance() : undefined;
//             if(router){
//                 var currentAction = router.transition ? router.transition.ev : undefined;
//                 if(currentAction && currentAction.target && currentAction.target.getAttribute && currentAction.target.getAttribute("lyte-state-handling") != "false"){
//                     var mp = window.__transXHRMap = window.__transXHRMap || new Map();
//                     mp.set(router.transition, {currentAction : currentAction, XHR:this});
//                     addStateToMap(currentAction.type, currentAction.target, this);
//                 }
//             }
//         }
//     }
//     XHRSend.apply(this, arguments);
// }

// Lyte.prototype.setState =   function(str){
//   if(!str){
//     console.error("Please provide a state name");
//   }
//   var evnt = window.event;
//   if(/^(click|dblclick)$/.test(evnt.type)){
//       var target = evnt.target;
//       if(getConfig("stateHandling") == true && target && target.getAttribute && target.getAttribute("lyte-state-handling") != "false"){
//           var state = target.getAttribute("lyte-state");
//           if(!state){
//               var mp = window.__stateMap = window.__stateMap || new Map();
//               var mpobj = mp.get(str);
//               if(!mpobj){
//                   var obj = addStateToMap(evnt.type, target, undefined, str);
//                   mp.set(str, obj);
//               }
//               else{
//                   console.error("There is already a open state by the name",str);
//               }
//           }
//       }        
//   }
// }

// Lyte.prototype.removeState = function(str){
//     if(!str){
//         console.error("Please provide a state name");
//     }
//     var mp = window.__stateMap;
//     if(mp){
//         var obj = mp.get(str);
//         if(obj){
//             mp.delete(str);
//             removeStateFromMap(str, obj.event, obj.target);
//         }
//     }
// }

// Lyte.prototype.setConfig = function(key, value){
//     var configObj = window.__config = window.__config || {};
//     configObj[key] = value;
// }

// Lyte.prototype.getConfig = getConfig;  @3055


// Lyte.errorCodes = errorCodes;
// Lyte.registerErrorCodes = registerErrorCodes;
// Lyte.getErrorMessage = getErrorMessage;

export { Lyte, __instances, __componentsMap, __getCurrentContext, toLowerCase, __getCurrentFunc, __scopedInstance, __setCurrentContext};


