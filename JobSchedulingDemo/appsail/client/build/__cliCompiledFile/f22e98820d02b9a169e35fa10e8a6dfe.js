import { Lyte } from "@slyte/core";
import { errorCodes } from "@slyte/core/src/errors.js";
import { Service } from "@slyte/core";
import { Logger } from './lyte-error';
import { resolvePromises } from './rsvp';
const _keywords = {
  "component" : ["init", "didConnect", "didDestroy", "constructor", "onError", "actions", "methods", "data"],
  "adapter" : ["namespace", "actionNamespace", "host", "withCredentials", "buildURL", "methodForRequest", "headersForRequest", "reloadRecord", "reloadRecord", "reloadAll", "processRequest", "parseResponse", "parseRequest", "super"],
  "serializer" : ["normalize", "normalizeResponse", "serialize", "serializeKey", "deserializeKey", "extractMeta", "payloadKey", "serializeRecord", "normalizeRecord", "super"],
  "route" : ["getDependencies", "getResources", "beforeModel", "model", "afterModel", "redirect", "renderTemplate", "afterRender", "beforeExit", "didDestroy", "queryParams", "title", "routeName", "component", "parent", "currentModel", "forceFetch", "setTitle", "setQueryParams", "getQueryParams", "setDynamicParam", "getDynamicParam", "removeFromCache", "refresh", "transitionTo", "replaceWith","actions"]
};  
// var arrayUtils =  function() {
//     let lc = window.CrmComponentRegistry._instanceList[0]._getLyteComponent();
//     return lc.aF.apply(lc, arguments);
// };
// var objectUtils =  function() {
//     let lc = window.CrmComponentRegistry._instanceList[0]._getLyteComponent();
//     return lc.oF.apply(lc, arguments);
// }
// var set = function(){
//   return LyteComponent.set.apply(LyteComponent,arguments);
// }
// var get = function(){
//   return LyteComponent.get.apply(LyteComponent,arguments);
// }
// var render = function() {
//   return LyteComponent.render.apply(LyteComponent, arguments);
// }
// var modifyTemplate = function(){
//   return LyteComponent.modifyTemplate.apply(LyteComponent,arguments);
// }
// var compileDynamicTemplate = function(){
//   return LyteComponent.compileDynamicTemplate.apply(LyteComponent,arguments);
// }
// var doDomProcessing = function(){
//   return LyteComponent.doDomProcessing.apply(LyteComponent,arguments);
// }
// var getComponentTemplate = function(){
//   return LyteComponent.getComponentTemplate.apply(LyteComponent,arguments);
// }
// var addLyteEventListener = function(){
//   return Lyte.Component.addLyteEventListener.apply(Lyte.Component,arguments);
// }
// var removeLyteEventListener = function(){
//   return Lyte.Component.removeLyteEventListener.apply(Lyte.Component,arguments);
// }
function getNearestApp(node){
    while(node){
      if(node.component){
        return node.component.getApp();
      }
      node = node.parentElement;
    }
    return Lyte._getDefaultAppIns();
}
function defProp() {
	Object.defineProperty.apply(Object, arguments);
}

function defProps() {
	Object.defineProperties.apply(Object, arguments);
}

function observes(){
  var args = Array.from(arguments), 
  func = args.pop(), 
  properties = [];
  args.forEach(function(observerValue) {
      let valueDetails = observerValue.split("::"), 
      observerType = valueDetails[0], 
      observerTo = valueDetails[1];
      switch(observerType){
          // case "event":{
          //     customCrmComponent._callbacks[observerType].push(observerFunction);
          // }
          // break;
          // case "action":
          // case "method":
          // {
          //     customCrmComponent._callbacks[observerType].push({[observerTo] : observerFunction});
          // }
          // break;
          default :{
              properties.push(observerType);
          }
      }
  })
  if(properties.length){
    var observerObj = {
        properties:properties,
        type:"observer",
        value:func
    }
    return observerObj;
  }
}

function isKeyword(key, scope){
  var arr = ["component", "adapter", "serializer", "route"];
  if(scope){
    arr = [scope];
  }
  var len = arr.length;
  for(var i=0;i<len;i++){
    var keyArr = _keywords[arr[i]];
    if(keyArr){
      var res = keyArr.indexOf(key);
      if(res != -1){
        return true;
      }
    }
  }
  return false;
}

function injectServiceToModules(scp, services){
  var mdlObj = scp.$.injectServices;
  for(var mKey in mdlObj){
    var mdl = mdlObj[mKey];
    for(var name in services){
      mdl(name, serv[name], mKey);
    }
  }
}

// function addToInstance(ins) {
//   if(ins.is != "app"){
//     if(!__instances[ins.is].hasOwnProperty(ins.name))
//     {
//       __instances[ins.is][ins.name] = ins;
//     }
//     else{
//       Lyte.warn("L001", ins.is, ins.name);
//     } 
//   }
//   else{
//     if(!__instances[ins.is]){
//       __instances[ins.is] = ins;
//     }
//     else{
//       Lyte.warn("L001", ins.is, "");
//     }
//   }
// }

// function createEngineInstance(engineName,config){
//   var ins = new Lyte('engine',engineName,config);
//   ins = Object.assign(ins,__instances.engine[engineName]);
//   return ins;
// }

function registerErrorCodes(obj, lyte) {
    Object.assign(errorCodes, obj);
}


function isEntity(object){
  if(object && object.$ && object.$.hasOwnProperty("isModified")) {
    return true;
  }
  return false;
}

function isRecord(object){
  if(object && object.$ && object.$.hasOwnProperty("isModified")) {
    return true;
  }
  return false;
}
function getVal(key,target){
  return target && target.__config && (target.__config[key]?"true":(target.__config[key] == false?"false":undefined));
}
function getConfig(key,target){
  if(!target){
    target = LyteCls._instances[0].$router.getRouteInstance();
    return getVal(key,target.$component)||
          ((!target._callee)?getVal(key,target.$app): getConfig(key,target._callee));
  }
  else{
    return getVal(key,target.component)||
          getVal(key,target.$component)||
          ((!target._callee)?getVal(key,target.$app): getConfig(key,target._callee));
  }
}
function getCurrentRouterInstance(){
  return LyteCls._instances[0].$router.getRouteInstance();
}
// function getConfig(key,regIns){
//   var configObj = window.__config;
//   if(configObj){
//       return {value:configObj[key],...((regIns)?{regIns:window.__config.getIns}:{})};
//   }
// }

function triggerEvent() {
  var args = Array.prototype.slice.call(arguments, 1)
  var eventName = arguments[0];
  var stopEvent = false;
  var s = this.__lyteRegisteredEvents[eventName];
    if(!s) {
      s = this.__lyteRegisteredEvents[eventName] = {"listeners" : new Map()};
    } else {
      var mp = s.listeners, keys = Array.from(mp.keys()), kLen = keys.length;    
      for(var i=0;i<kLen;i++) { 
        var func = mp.get(keys[i]);
        if(func) {
           var ret = func.apply(this, args);
           if(ret === false) {
             stopEvent = true;
             break;
           }
        }
      }
    }
    var customEvent = new CustomEvent(eventName, {"detail" : args});
    if(!stopEvent) {
     document.dispatchEvent(customEvent); 
    } 
 }

function addEventListener(eventName, func) {
  if(typeof func !== "function") {
      Lyte.error("Second parameter to Lyte.Component.addGlobalEventListener() must be a function");
      return;
  }
  var s = this.__lyteRegisteredEvents[eventName];
  if(!s) {
    s = this.__lyteRegisteredEvents[eventName] = {"listeners" : new Map()};
  }
  var id = genMapId(s.listeners);
  var d = s.listeners.set(id, func);
  return eventName + "-" + id;
}

function removeEventListener(id) {
  if(!id) {
    Lyte.error("listener unique id not specified");
    return;
  }
   var arr = id.split("-"), evid = arr.pop(), name = arr.join("-");
   var s = this.__lyteRegisteredEvents[name];
   if(!s || !s.listeners.get(evid)) {
     Lyte.error("No such listener registered");
     return;
   }
   s.listeners.delete(evid);
}

function genMapId(map){
  var id = Math.floor(Math.random()*10000000000 + 1);
  while(map.get(id)){
      id = Math.floor(Math.random()*10000000000 + 1)
  }
  return id.toString();
}

// function checkNestedProp (id, path, dtype, wobj, object, property, value, check, fromStore) {
//   if (dtype && path.length != 0){
//       var extend;
//       if(Lyte.Transform[dtype.type]){
//           extend = true;
//       }
//       if (dtype.type == 'array' || (extend && Lyte.Transform[dtype.type].extends == "array")) {
//           if (dtype.items && !isNaN(path[0]) && _typeof(dtype.items) == 'object') {
//               path = path.slice(1);
//               checkNestedProp(id, path, dtype.items, wobj, object, property, value, check);
//           }
//       } else if (dtype.type == "object" || (extend && Lyte.Transform[dtype.type].extends == "object")) {
//           if (dtype.properties){
//               var k = path[0];
//               path = path.slice(1);
//               checkNestedProp(id, path, k == "" ? dtype :dtype.properties[k], wobj, object, property, value, check);
//           }
//       }
//   // } else if (dtype.properties && Lyte.isRecord(value) && !check.hasOwnProperty("warn")) {
//   //     check.warn = { warn: true, message: "Nested property will not support for the record" };
//   } 
//   else {
//       var err;
//       if (dtype && (dtype.properties || dtype.items) && !check.hasOwnProperty("warn")) {
//           var component = {};component.__data = {};
//           if (dtype.properties) {
//               component.__data[property] = dtype.properties[property];
//           } else {
//               component.__data[property] = dtype;
//           }
//           var cp = validateData(object, property, value, component);
//           var errKey = wobj.attr ? wobj.attr : wobj.key,_path = wobj.path.split(".");
//           if (cp && (typeof cp === 'undefined' ? 'undefined' : _typeof(cp)) == "object" && cp.code) {
//               cp.value = value;
//               cp.path = wobj.path !=""?wobj.path:property;
//               if(wobj.isRec && fromStore && wobj.key ==  undefined && wobj.path!=""){
//                   errKey = wobj.path.split(".")[0]
//                   _path.shift();
//                   _path = (_path.length == 1 && _path[0] == property) ? [] : _path;
//               }
//               wobj.Error = {};
//               wobj.Error && wobj.Error[errKey] ? wobj.Error[errKey].code && wobj.Error[errKey].nested ? wobj.Error[errKey].nested : wobj.Error[errKey].nested = {} : wobj.Error[errKey] = { nested: {} };
//               wobj.Error[errKey].code = "ERR34"
//               wobj.Error[errKey].message = Logger.errorCodes.ERR34;
//               err = wobj.Error[errKey].nested;
//               wobj._cmpErr[errKey].code = "ERR34";
//               wobj._cmpErr[errKey].message = Logger.errorCodes.ERR34 ;
//               var cmpErrPath = wobj._cmpErr[errKey].path ? wobj._cmpErr[errKey].path : [] ;
//               if(wobj.path !=""){
//                   _path.forEach(function (k) {
//                       if (err && !err[k]) {
//                           err = err[k] = {};
//                       } else {
//                           err = err[k];
//                       }
//                   });
//               }
//               wobj.index != undefined ? err[wobj.index] = cp : err[property] = cp;
//               cmpErrPath.push(wobj.index == undefined && property? wobj.path+"."+property : wobj.index !=undefined ? wobj.path+"."+wobj.index : wobj.path)
//               wobj._cmpErr[errKey].path = cmpErrPath;
//           } else{
//               if(wobj.isRec && fromStore && wobj.key ==  undefined){
//                   errKey = wobj.path.split(".")[0]
//                   _path.shift();
//                   _path = (_path.length == 1 && _path[0] == property) ? [property] : _path;
//               }
//               err = wobj.Error[errKey] && wobj.Error[errKey].nested ? wobj.Error[errKey].nested : undefined;
//               //var p = object.$.error[property];
//               if(err){
//                   var key = wobj.index || property; 
//                   var flag = true,
//                   p = wobj.path !=""?_path:[property];
//                   wobj.index ? p.push(wobj.index) : p;
//                   var prev;
//                   p.forEach(function (r) {
//                       if (err[r] && err[r].code) {
//                           delete err[r];
//                           if(err && Object.keys(err).length == 0){
//                               flag = true;
//                           }
//                           else{
//                               flag = false;
//                           }
//                       }
//                       err = err[r];
//                   });
//                   if (flag == true && wobj.Error[errKey] && wobj._cmpErr[errKey]) {
//                       delete wobj.Error[errKey];
//                       delete wobj._cmpErr[errKey]
//                   }
//               }

//           }
//           if((check.value && check.value.hasOwnProperty("code") && cp.code) || !check.value){
//               check.value = cp;
//           }
//       }
//   }
//   wobj.path && delete wobj.path;
//   wobj.index && delete wobj.index;
//   wobj.attr && delete wobj.attr;
// };

function checkNestedProp(id,path,dtype,wobj,object,property,value,check){
  if(path.length!=0){
      if(dtype.type == 'array'){
          if(dtype.items && !isNaN(path[0]) && typeof(dtype.items)=='object'){
              path= path.slice(1);
              checkNestedProp(id,path,dtype.items,wobj,object,property,value,check)
          }
      }
      else if( dtype.type == "object"){
          if(dtype.properties && dtype.properties.hasOwnProperty(path[0])){
              var k = path[0];
              path = path.slice(1);
              checkNestedProp(id,path,dtype.properties[k],wobj,object,property,value,check);
          }
      }
  }
  else{
      var err;
      if(dtype.properties || dtype.items){
          var component={};component.__data={};
          if(dtype.properties){
                  component.__data[property]=dtype.properties[property];
              }
              else{
                  component.__data[property]=dtype;
              }
          var cp = validateData(object, property, value, component);
          if(cp && typeof(cp)=="object" && cp.code){
              cp.value=value;
              cp.path=wobj.path;
              (wobj.Error && wobj.Error[wobj.key])?(wobj.Error[wobj.key].code && wobj.Error[wobj.key].nested)?wobj.Error[wobj.key].nested:wobj.Error[wobj.key].nested={}:wobj.Error[wobj.key]={code:cp.code,message:cp.message,nested:{}};
              err = wobj.Error[wobj.key].nested;
              wobj.path.split('.').forEach(function(k){
                  if(err && !err[k]){
                      err=err[k]={};
                  }
                  else{
                      err=err[k];
                  }
              })
              wobj.index?err[wobj.index]=cp:err[property]=cp;
              (object.$ && object.$.error)?object.$.error=err:object.$={error:err};
              Object.defineProperty(object,'$',{
                  enumerable:false,
                  writable:false
              });
          }
          else if(!cp && object.$ && (object.$.error[property] ||(wobj.index && object.$.error[wobj.index]))){
              err = wobj.Error[wobj.key].nested||undefined;
              var key = wobj.index||property;
              delete object.$.error[key];
              var f = true,p=wobj.path.split(".");
              (wobj.index)?p.push(wobj.index):p;
              p.forEach(function(r){
                  if(err[r] && err[r].code){
                      f=false;
                  }
                  err=err[r];
              });
              if(f == true && wobj.Error[wobj.key]){
                  delete wobj.Error[wobj.key];
              }
          }
          check.value=cp;
      }
  } 
}

var types = ["string", "object", "number", "boolean", "array", "component"];
function prop(type, opts){
  var obj = {};
  obj.type = type;
  obj._type = "prop";
  if(opts == undefined){
    opts = {};
  }
  Object.assign(obj,opts);
  return obj;
}

function one(name,opts){
  return defineRelation(name,"belongsTo",opts);
}

function many(name,opts){
  return defineRelation(name,"hasMany",opts);
}

function extendEventListeners(scp){
  if(scp && !scp.hasOwnProperty("__lyteRegisteredEvents")){
      Object.defineProperties(scp, {
          __lyteRegisteredEvents : {
              value : {}
          },
          addEventListener : {
              value : addEventListener
          },
          removeEventListener : {
              value : removeEventListener
          },
          triggerEvent : {
              value : triggerEvent
          }
      });
  }
}

function getSuperClass(obj, getName){
	var cons = obj, isInstance = (typeof obj === "object");
	if(isInstance){
		cons = obj.constructor;
	}
	var bClass = Object.getPrototypeOf(cons);
	if((!(bClass instanceof Function)) || bClass === Service){
		if(getName){
			return obj.name;
		}
		return obj;
	} 
	return getSuperClass(bClass, getName);
}

function isInheritedClass(baseObj, inheritedClass){
  var cons = baseObj, isInstance = (typeof obj === "object");
  if(isInstance){
    cons = baseObj.constructor;
  }
  var bClass = Object.getPrototypeOf(cons);
  if((bClass.hasOwnProperty("__lyteOrigClass") && bClass.__lyteOrigClass == inheritedClass) || (bClass == inheritedClass)){
    return true;
  }
  else if((!(bClass instanceof Function)) || bClass === Service){
    return false;
  }  
  return isInheritedClass(bClass, inheritedClass); 
}

function newGetSuperClass(obj, getName, toBeCompared, getClass) {
  var cons = obj, isInstance = (typeof obj === "object");
  if(isInstance){
    cons = obj.constructor;
  }
  var bClass = Object.getPrototypeOf(cons);
  if(bClass.__lyteOrigClass == toBeCompared){
    return true;
  }
  else if((!(bClass instanceof Function)) || bClass === Service){
    // return false;
    if(getName){
      return obj.name;
    } else if(getClass){
      return obj;
    }
    return obj;
  }  
  return newGetSuperClass(bClass, getName, toBeCompared);    
}

function includeMixins(arr,mainClass){
  if(arr.length == 0) {
    return mainClass;
  } 
  var currentClass = mainClass;
  for(var i=0;i<arr.length;i++) {
    var classVar = arr[i];
    var classFunction = classVar._classFunc;
    currentClass = classFunction(currentClass, classFunction.overrides,classFunction._proxy);
  }
  return currentClass;
}
function getClass(arr, mainClass,clsObj) {
  if(arr.length == 0) {
      return mainClass;
  }
  var currentClass = mainClass;
  for(var i=0;i<arr.length;i++) {
    var classVar = arr[i];
    var classFunction = classVar._classFunc;
    currentClass = classFunction(currentClass, classFunction.overrides,classFunction._proxy);
  }

  return currentClass;
}


Function.prototype.tempApply=Function.prototype.apply;
Function.prototype.tempCall=Function.prototype.call;
Function.prototype.tempBind=Function.prototype.bind;
var classObj = {};
function createCustomClass(classDefFunc, fromInside) {

  class LyteModule {
      constructor() {
          if(window.ssss1) {
              this.constructor = window.ssss1;
              window.ssss1 = undefined;
          }
      }
    static actions(arg1) {
      return arg1 ? arg1 : {};
    }
    static methods(arg1) {
      return arg1 ? arg1 : {};
    }
    static observers(arg1) {
      return arg1 ? arg1 : {};
    }
    data(arg1) {
      return arg1 ? arg1 : {};
    }
   
  }
    var dummyObj={};

    var proxy = new Proxy(class {
        static [Symbol.hasInstance](instance) {  // checks if the object's prototype chain contains the [Symbol.hasInstance] method
          console.log("inside  custom instanceof check")
          return instance instanceof dummyObj.arg1._initialCopyClass;
        }
      },{
      "construct" : function(a,b,c) {
        if(c==proxy) {
          window.ssss1 = dummyObj.retClass;
          let constr=Reflect.construct(dummyObj.retClass._initialCopyClass, b);
          if(constr._afterConstructor){
            constr._afterConstructor();
          }
          return constr;
        } else {
          return Reflect.construct(dummyObj.arg1, b,c);
        }
          
      }, 
      "get" : function(target, prop,value) {
        if(prop == "prototype") {
          return Reflect.get(...arguments);
        } else if(prop == "hasOwnProperty" ) {
          return function(prop1) {
              return dummyObj.arg1.hasOwnProperty(prop1);
          }  
        }
        else if(dummyObj.arg1.hasOwnProperty(prop)) {
          return dummyObj.arg1[prop];
        }
        else if(prop.toString()==='Symbol(Symbol.hasInstance)'){
          return Reflect.get(target, prop,value);
        } 
        else {
          return Reflect.get(dummyObj.arg1, prop,value);
        }
      }, 
      "set" : function(target, prop, value, receiver) {
        dummyObj.arg1._updateStaticVal(prop, value, receiver);
          return true;
      }, 
      "getPrototypeOf": function(target){
        return Reflect.getPrototypeOf(dummyObj.arg1); 
      },
      "defineProperty": function(target, key, descriptor) {
        dummyObj.arg1._defineProperty(target,key,descriptor);
          return true;
        },
        
      "getOwnPropertyDescriptor":function(target,prop){
          if( Object.hasOwn(dummyObj.arg1,prop)){
            return {
              value:dummyObj.arg1[prop],
              enumerable : true,
              configurable : true,
              writable : true
          };
          }
          else {
            return Reflect.getOwnPropertyDescriptor(...arguments)  ;
          }
        } ,
        "deleteProperty":function(target,prop,value){
          return dummyObj.arg1._deleteProperty(target,prop);
        }
      });
  var retClass = classDefFunc(LyteModule, function(arg1,cacheObj) {
      if(arg1.name[0]=='_'){
          Object.defineProperty(arg1,"name",{value:arg1.name.slice(1)});
      }
      dummyObj.arg1 = arg1;
      arg1._lyteClasses = [];
    arg1._lyteClasses = [];  //keep track of classes that have been extended from retClass.
  
    arg1._updatePrototypeVal = function(prop, value) {
       arg1.prototype[prop]=value;
       this._lyteClasses.forEach(function(item){
        item.prototype[prop]=value;
       });  
  }
  arg1._deleteProperty=function(target,prop){
    if(arg1[prop]){
      delete arg1[prop];
      this._lyteClasses.forEach(function(item){
        delete item[prop];
      })
    }
    delete arg1.prototype[prop];
    this._lyteClasses.forEach(function(item){
      delete item.prototype[prop];
    });
  }

  arg1._defineProperty = function(target, prop, descriptor) {
  Object.defineProperty(arg1,prop,descriptor);
    this._lyteClasses.forEach(function(item) {
      if(descriptor==undefined){
        item.prototype[prop]=undefined;
      }else{
        Object.defineProperty(item, prop, descriptor);
      }
    });

  }

  arg1._updateStaticVal = function(prop, value, receiver) {
    //updates the static values of arg1 and all the classes in _lyteClasses with the provided prop and value.
    // arg1[prop]=value;
    this[prop] = value;
    if(cacheObj && cacheObj.hasOwnProperty(prop)){
      cacheObj[prop]=value;
    }
    this._lyteClasses.forEach(function(item) {
      item[prop] = value;
    });
  }
  arg1._hasOwnProperty=function(target,prop,receiver){
    return arg1.prototype.hasOwnProperty(prop)
  }

     let tempProxy=new Proxy({} /*proxy.prototype*/, {

      "get" : function(target, prop) {
        //  if(Object.hasOwn(arg1._initialCopyClass.prototype,prop))
        //    return arg1.prototype[prop];
        if(prop === "deleteProp") {
            return function(prop1) {
                 return arg1._deleteProperty(target, prop1, undefined);
                 };
          }
          else if(prop=="hasOwnProperty"){
            return function(prop1){
                return arg1._hasOwnProperty(target,prop1);
            }
        }
        else {
          if(arg1.prototype[prop] && typeof arg1.prototype[prop]=="function" ) {
              arg1.prototype[prop].apply = function() {
                  let tempArgument=arguments[0];
                  while(tempArgument){
                      if(arg1._proxy==tempArgument.constructor){
                          return arg1._initialCopyClass.prototype[prop].tempApply(tempArgument, arguments[1]);
                      }
                      tempArgument=Object.getPrototypeOf(tempArgument);
                  }
                return  arg1.prototype[prop].tempApply(arguments[0],arguments[1]);
              }
              arg1.prototype[prop].call = function() {
                  let tempArgument=arguments[0];
                  while(tempArgument){
                      if(arg1._proxy==tempArgument.constructor){
                          return arg1._initialCopyClass.prototype[prop].tempCall(tempArgument, arguments[1]);
                      }
                      tempArgument=Object.getPrototypeOf(tempArgument);
                  }
                return  arg1.prototype[prop].tempCall(arguments[0],arguments[1]);
              }
              arg1.prototype[prop].bind = function() {
                  let tempArgument=arguments[0];
                  while(tempArgument){
                      if(arg1._proxy==tempArgument.constructor){
                          return arg1._initialCopyClass.prototype[prop].tempBind(tempArgument, arguments[1]);  
                      }
                      tempArgument=Object.getPrototypeOf(tempArgument);
                  }
                return  arg1.prototype[prop].tempBind(arguments[0],arguments[1]);
              }
          }
            return arg1.prototype[prop];
      }
          
      }, 
      "set" : function(target, prop, value) {    
          arg1._updatePrototypeVal(prop, value);
          return true;
      }, 
      "defineProperty" : function(target, prop, value) {
        arg1._defineProperty(target, prop, value);
      },
      "getPrototypeOf": function(target){
        return Reflect.getPrototypeOf(arg1); 
      }, 
  })  ;
   Object.setPrototypeOf(proxy.prototype,tempProxy);                                        
  return proxy;
  },proxy);
  retClass._proxy = proxy;
  dummyObj.retClass = retClass;
  classDefFunc._proxy = proxy;
  
  // var initialCopyClass = classDefFunc(LyteModule, overrides,proxy);
  var initialCopyClass=overrides(dummyObj.arg1);
  function overrides(cls) {
      if(cls.name[0]=='_'){
          Object.defineProperty(cls,"name",{value:cls.name.slice(1)});
      }
      retClass._lyteClasses.push(cls);
      cls.prototype.__origConstructor = cls;
      cls.__lyteOrigClass = retClass;
      if(retClass._lyteClasses.length>1){
          let baseCls=retClass._lyteClasses[0];
          let arr=Object.getOwnPropertyNames(retClass._lyteClasses[0]);
          for(let i=0;i<arr.length;i++){
              if(!cls.hasOwnProperty(arr[i])){
                  cls[arr[i]]=baseCls[arr[i]];
              }
          }
      let arr1=Object.getOwnPropertyNames(retClass._lyteClasses[0].prototype);
          for(let i=0;i<arr1.length;i++){
              if(!cls.prototype.hasOwnProperty(arr1[i])){
                  cls.prototype[arr1[i]]=baseCls.prototype[arr1[i]];
              }
          }
      }
    return cls;
  }


  classDefFunc.overrides = overrides;
  retClass._classFunc = classDefFunc;
  initialCopyClass._classFunc=classDefFunc;   //new changes
  // retClass._initialCopyClass = initialCopyClass; //new changees
  dummyObj.arg1._initialCopyClass = initialCopyClass;
  classDefFunc._mainClass = retClass;
  if(initialCopyClass.name[0]=='_'){
      Object.defineProperty(initialCopyClass,"name",{value:initialCopyClass.name.slice(1)});

  }   
  return retClass;
}

function getCustomData(scp, fieldVal, fromDb){
  if(fromDb){
    if(scp && scp.dataType && scp.dataType.hasOwnProperty(fieldVal)){
      return scp.dataType[fieldVal];
    }
    scp = scp.lyte;
  }
  if(scp && scp.dataType && scp.dataType.hasOwnProperty(fieldVal)){
    return scp.dataType[fieldVal];
  }
}
function checkProperty(property, dataVal, key, fieldVal, record, name, scp, errorCodes ,init, field, fromDb){
  // var errorCodes = scp.errorCodes;
  var exts = "extends";
  switch(property){
    case "type" : 
      if(typeof fieldVal !== "string"){
        var _fld = getCustomData(scp, fieldVal._name, fromDb);
        if (_fld && dataVal !== undefined && dataVal !== null) {
          var _ret = true;
          if (Array.isArray(dataVal)) {
              if (_fld.type != "array") {
                  return { code: "ERR03", message: errorCodes.ERR03, expected: fieldVal };
              }
              if(_fld.hasOwnProperty("items")){
                  _ret = checkProperty("items", dataVal, key, _fld.items);
              }
          }else if(typeof dataVal === "object" && _fld.type == "object" && _fld.hasOwnProperty("properties")){
              _ret = checkProperty("properties", dataVal, key, _fld.properties);
          } 
          else if (fieldVal && _fld.type != typeof(dataVal)) {
            return { code: "ERR03", message: errorCodes.ERR03, expected: fieldVal };
          }
          if(_ret !== true){
              return _ret;
          }
        }
      }
      else if(dataVal !== undefined && dataVal !== null){
        if(Array.isArray(dataVal)){
          if(fieldVal != "array"){
              return {code : "ERR03", message : errorCodes.ERR03, expected : fieldVal};
          }
        }
        else if(dataVal && dataVal._compName){
          if(fieldVal != "component"){
            return {code : "ERR03", message : errorCodes.ERR03, expected : fieldVal};
          }
        }
        else if(fieldVal != (typeof dataVal)){
          return {code : "ERR03", message : errorCodes.ERR03, expected : fieldVal};
        }
      }
      break;
    case "mandatory":
        let validateFlag = fieldVal;
        if(typeof fieldVal == "object"){
          if(init && fieldVal.skipValidationOnInit == true){
            validateFlag = false;
          }
        }
        if (validateFlag && (dataVal == undefined || dataVal == null || dataVal === "")) {
          return { code: "ERR02", message: errorCodes.ERR02 };
        }
      break;
    case "maximum" :
      if((typeof dataVal == "number") && dataVal > fieldVal){
        return {code : "ERR04", message : errorCodes.ERR04, expected : fieldVal};
      }
      break;
    case "minimum" :
      if((typeof dataVal == "number") && dataVal < fieldVal){
        return {code : "ERR05", message : errorCodes.ERR05, expected : fieldVal};
      }
      break;
    case "maxLength" :
    case "maxItems" :
      if(dataVal && dataVal.length > fieldVal){
        return {code : "ERR06", message : errorCodes.ERR06, expected : fieldVal};
      }
      break;
    case "minLength" :
    case "minItems" :
      if(dataVal && dataVal.length < fieldVal){
        return {code : "ERR07", message : errorCodes.ERR07, expected : fieldVal};
      }
      break;
      case "pattern" :
        if(typeof fieldVal == "string"){
            var _scp = scp;
            if(fromDb){
              _scp = scp.lyte;
            }
            if(_scp){ 
              if(_scp.patterns && _scp.patterns.hasOwnProperty(fieldVal)){
                fieldVal = _scp.patterns[fieldVal];
              }
              else{
                Logger.warn("Pattern with name - "+ fieldVal+" is not registered");
                break;
              }
            }
          }
          if( typeof dataVal == "string" && !(new RegExp(fieldVal).test(dataVal))){
            return {code : "ERR08", message : errorCodes.ERR08, expected : fieldVal};
          }
          break;
      case "uniqueItems" :{
      if(Array.isArray(dataVal) && fieldVal){
        var newArr = [];
        for(var i=0; i<dataVal.length; i++){
          var val = dataVal[i];
          if(newArr.indexOf(val) != -1){
            return {code : "ERR09", message : errorCodes.ERR09};
          }
          newArr.push(val);
        }         
      }
      break;        
    }
    case "constant" :
      if(Array.isArray(dataVal)){
        var resp = dataVal.length==fieldVal.length && dataVal.every(function(v,i) { return v === fieldVal[i]});
        if(!resp){
          return {code : "ERR10", message : errorCodes.ERR10, expected : fieldVal};
        }
      }
      else if(typeof dataVal == "object"){
        var resp = db.connector.$.compareObjects(dataVal, fieldVal);
        if(!resp){
          return {code : "ERR10", message : errorCodes.ERR10, expected : fieldVal};
        }
      }
      else if(dataVal && dataVal != fieldVal){
        return {code : "ERR10", message : errorCodes.ERR10, expected : fieldVal};
      }
      break;
    case "items" :{
      if(Array.isArray(dataVal)){
        for(var i=0; i<dataVal.length; i++){
          for(var property in fieldVal){
            var resp = checkProperty(property, dataVal[i], i, fieldVal[property], undefined, undefined, scp, errorCodes, undefined, fieldVal);
            if(resp != true){
              resp.path = resp.path ? i + "." + resp.path : resp.path;
              return resp;
            }
          }
        }         
      }
      break;        
    }
    case "properties" :
      if(typeof dataVal == "object" && !Array.isArray(dataVal)){
        for (var key in dataVal) {
          if(fieldVal.hasOwnProperty(key)){
              var fld = fieldVal[key]
              for (var property in fld) {
                  var resp = checkProperty(property, dataVal[key], key, fld[property], undefined, undefined, scp, errorCodes, undefined, fld);
                  if (resp != true) {
                      resp.path = resp.path ? property + "." + resp.path : property.toString();
                      return resp;
                  }
              }
          }
          else if(field.exact){
              return { code : "ERR29", message: Lyte.errorCodes.ERR29, property: key };
          }
        }
      }
      break;
    case "validation" :{
      var validator = fieldVal;
      if(validator){
        var resp =  validator.validate.apply(record, [key, dataVal, name]);
        if(resp != true){
          return resp;
        }
      }       
    }
    break;
    case "instanceof": 
    {
        if(typeof dataVal === "object" && !Array.isArray(dataVal) && !(dataVal instanceof fieldVal)){
            return { code: "ERR30", message: Lyte.errorCodes.ERR30, property: key, instanceof: fieldVal};
        }
    }
  }
  return true;
}

function validateData(object, key, value, component,scp ,init) {
  var definition = component.__data[key];
  var isError = false;
  var type = definition ? definition.type : undefined;
  for(var defKey in definition) {
    let app = component.getApp ? component.getApp() : undefined;
    isError =  checkProperty(defKey, value, key, definition[defKey], object, undefined, app, Logger.errorCodes, init, definition);
    if(isError !== true) {
      return isError;
    }
  }
  return false;
}

function deepCopyObject(obj){
  return copyObject(obj, true);
}

function copyObject( obj, internal )  {
  var targetVal = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
  var current, copies = [{source : obj, target : targetVal}], keys, propertyIndex, descriptor, nextSource, indexOf, sourceReferences = [obj];
  var cloneObject = copies[0].target, targetReferences = [cloneObject];
  while(current = copies.shift()){
      keys = Object.keys(current.source);
      for(propertyIndex = 0; propertyIndex < keys.length; propertyIndex++){
          descriptor = Object.getOwnPropertyDescriptor(current.source, keys[propertyIndex]);
          if(!descriptor){
              continue;
          }
          if(!descriptor.value || typeof descriptor.value != "object"){
              Object.defineProperty(current.target, keys[propertyIndex], descriptor);
              continue;
          }
          nextSource = descriptor.value;
          if(!(descriptor.value instanceof Promise)){
            descriptor.value = Array.isArray(nextSource) ? [] : nextSource instanceof Set ? new Set() : Object.create(Object.getPrototypeOf(nextSource));
          }
          indexOf = sourceReferences.indexOf(nextSource);
          if(indexOf != -1){
              descriptor.value = targetReferences[indexOf];
              Object.defineProperty(current.target, keys[propertyIndex], descriptor);
              continue;
          }
          sourceReferences.push(nextSource);
          targetReferences.push(descriptor.value);
          Object.defineProperty(current.target, keys[propertyIndex], descriptor);
          copies.push({source : nextSource, target : descriptor.value});
      }
      if(internal){
        if(isEntity(current.source)){
          Object.defineProperty(current.target, "$", {
            value: {}
          });
          current.target.$.isNew = current.source.$.isNew;
          current.target.$.isModified = current.source.$.isModified;
          current.target.$.isDeleted = current.source.$.isDeleted;
          current.target.$.pK = current.source.$.pK;
          current.target.$._attributes = current.source.$._attributes;
          current.target.$.isCloned = true;
          if(current.source.$.hasOwnProperty("deepNest")){
            current.target.$.deepNest = current.source.$.deepNest;
          }
          if(current.source.$.hasOwnProperty("partialType")){
            current.target.$.partialType = current.source.$.partialType;
          }
        }
        if(Array.isArray(current.source)){
          if(current.source.partial){
            Object.defineProperty(current.target, "partial", {
              value: current.source.partial
            });
          }
        }
      }
  }
  return cloneObject;
}

function defineRelation(name,type,opts){
  var relation = {type : "relation", relType : type, relatedTo : name};
  if(opts){
    relation.opts = opts;
  }
  return relation;
}

function establishObserverBindings(observers,fromStore,properties,model,lyteScp) {
  var scope = this;
  var watchProps = model && fromStore ? model._fldGrps.JsonPathWatch : scope.constructor._deepWatchProperties;
  if(fromStore){
    scope = fromStore;      
  }
  for(var i=0;i<observers.length;i++) {
    var props = observers[i].properties;
    var obsAttr = {},obsDuplicate=false;
    var Jpath={}
    for(var j=0;j<props.length;j++) {
      var actProp;
      var isArrayObserver = false;
      var isObjectObserver = false;
      if(typeof props[j] == "string"){
        if(props[j].search(/^\$\./g)!=-1){
         
          var JsonPath = props[j];

          var CmpPropertyPath = JsonPath.match(/[^\$.][^\.]*/g)[0]
          if(CmpPropertyPath.search(/\[[0-9*]\]/g)!=-1){
            CmpPropertyPath = CmpPropertyPath.split(/\[[0-9*]\]/g)[0];
          }
          if(watchProps[CmpPropertyPath]==undefined){
            watchProps[CmpPropertyPath]=[];
          }

          if(Jpath[CmpPropertyPath] == undefined){
            Jpath[CmpPropertyPath]=[];
          }
          
          var JSONPATH ;
          var reg = "^\\$\\."+CmpPropertyPath+"\\.?"
          reg = new RegExp(reg);
          JSONPATH = props[j].replace(reg,"$.")
          if(!watchProps[CmpPropertyPath].includes(JSONPATH)){
            watchProps[CmpPropertyPath].push(JSONPATH)
          }
          
          if(!Jpath[CmpPropertyPath].includes(JSONPATH)){
            Jpath[CmpPropertyPath].push(JSONPATH)
          }


          CmpPropertyPath =CmpPropertyPath+".*";
          if(!obsAttr.hasOwnProperty(CmpPropertyPath)){
            actProp= getProperty.call(this,CmpPropertyPath,fromStore,properties)
            obsAttr[CmpPropertyPath]=true;
            obsDuplicate = false;
          }
          else{
            obsDuplicate = true;
          }
        }
        else if(props[j].indexOf('.[]') !== -1) {
          isArrayObserver = true;
          actProp = getProperty.call(this,props[j].substring(0, props[j].indexOf('.[]')),fromStore,properties);
        }
        else if(props[j].indexOf('.{}') !== -1) {
          isObjectObserver = true;
          let objObbName = props[j].substring(0, props[j].indexOf('.{}'))
          actProp = this.getProperty(objObbName);
          Object.defineProperty(actProp, '_objectObservers', {
            value: true,
            enumerable: false,
            writable: true,
            configurable: true
          });
			  }
        else {
          if(props[j].indexOf('.*') !== -1) {
            var prop = props[j].split(".")[0];
            var isDeepObs = (!fromStore && this.component.__data[prop] && this.component.__data[prop].watch) || (fromStore && model && model.fieldList && model.fieldList[prop] && model.fieldList[prop].watch) ? true : false;
            if(!isDeepObs){
              continue;
            }
          } 
          actProp = getProperty.call(this,props[j],fromStore,properties);
        }
      if(!obsDuplicate){
        if(!actProp._observers) {
          Object.defineProperty(actProp, '_observers', {
            value : new Set(),
            enumerable: false, 
            writable: true,
            configurable: true
          });
        }
       actProp._observers.add({callee : scope, observer: observers[i], isArrayObserver : isArrayObserver,isObjectObserver:isObjectObserver });
      }
    }else{
      Lyte.warn.call(lyteScp,"ERR27",JSON.stringify(props[j]),observers[i].fnName,this.tagName);
    }
  }
  observers[i].Jpath  = Jpath;
  obsAttr={};
}
}
// getProperty(key) {
//   var arr = key.match(/([^[\].]+|\[\])/g);
// let property = this;
// if(!property._properties[arr[0]]) {
//       property._properties[arr[0]] = {};
//   } 
//   property = property._properties[arr[0]];

// defProp(property, '_path', {enumerable: false, value : arr[0]});
// for(let i=1;i<arr.length;i++) {
//       if (arr[i].startsWith("'") || arr[i].startsWith('"')) {//added check
//           arr[i] = arr[i].substring(1, arr[i].length -1);
//       }
//       if(!property[arr[i]]) {
//           property[arr[i]] = {};
//           defProp(property[arr[i]], '_path', {enumerable: false, value : property._path + "." + arr[i]});
//       }
//     property = property[arr[i]];
//   }
//  return property;
// }
function getProperty(key,fromStore,properties) {
  var arr = key.match(/([^[\].]+|\[\])/g);
  let property = this;
  if(fromStore){
    property = properties;
    if(!properties[arr[0]]){
        properties[arr[0]] = {};
    }
    property = properties[arr[0]];
  }
  else {                      
    if(!property._properties[arr[0]]) {
        property._properties[arr[0]] = {};
    } 
    property = property._properties[arr[0]];
  }

  Object.defineProperty(property, '_path', {enumerable: false, value : arr[0]});
  for(let i=1;i<arr.length;i++) {
    if (arr[i].startsWith("'") || arr[i].startsWith('"')) {//added check
      arr[i] = arr[i].substring(1, arr[i].length -1);
    }
    if(!property[arr[i]]) {
        property[arr[i]] = {};
        Object.defineProperty(property[arr[i]], '_path', {enumerable: false, value : property._path + "." + arr[i]});
    }
    property = property[arr[i]];
  }
  return property;
}

let nestScpId = 1;
const nestScp = {};
const __nestRef__ = {};
const __nestScp__ = new Map();
function establishObjectBinding(data, attr, fromStore, update, storeRecord, watch) {
  var model, fld, nestObj;
  var checkAttrs=data.__component__ && data.__component__.component.__data?data.__component__.component.__data[attr]:undefined, db;
  if (fromStore || storeRecord) {
      model = (data.$)? (data.$.schema ? data.$.schema : data.$.model) :(storeRecord && storeRecord.$.model)?storeRecord.$.model:undefined;
      db = model.db;
      fld = model ? model.fieldList[attr] : undefined;
      if (!fld) {
          return;
      }
      checkAttrs=fld;
      watch = fld.watch;
  }
  if (update && data._scp && data._scp.size) {
      var keys = Array.from(data._scp.keys());
      keys.forEach(function (id) {
        var _mpObj = data._scp.get(id), 
        mpObj = _mpObj.paths;
          for (var key in mpObj) {
              var path = key ? key.split(".") : [];
              path.push(attr);
              bindObj(data, attr, id, path, new Map(),checkAttrs,watch);
          }
      });
  }
  if ((!fromStore || fld.watch || fld.properties || fld.items || watch) && data[attr]) {
      var _scpObj, kmpKey;
      if (data && data.__component__) {
          data.__component__.__scpObj || Object.defineProperty(data.__component__, "__scpObj", {
              value: {}
          });
          kmpKey = data.__component__;
          _scpObj = data.__component__.__scpObj;
      } else if (isEntity(data)) {
          data.$.__scpObj || Object.defineProperty(data.$, "__scpObj", {
              value: {}
          });
          kmpKey = data;
          _scpObj = data.$.__scpObj;
      }
      var obj = _scpObj,
      id;
      if (_scpObj) {
          var __nestScp1Set__ = false, __nestScp2Set__ = false;
          if (fromStore) {
              if(data[attr] && !__nestScp__.has(data[attr])){
                  nestObj = { db: db, model: model._name, attr: attr, pK: data.$.pK };
                  __nestScp1Set__ = true;
              }
              else{
                // var kmp = __nestScp__[kid] = __nestScp__[kid] || new Map();
                // data ? kmp.set(data, true) : undefined;
                var __nId = __nestScp__.get(data[attr])
                var refMp = __nestRef__[__nId] = __nestRef__[__nId] || new Map();
                var refMpId = genMapId(refMp);
                refMp.set(refMpId, true);
                setRecBindMap(nestScp[__nId], {db:db, model:model._name, attr: attr, pK: data.$.pK});
                obj[attr] = __nId+"_"+refMpId;
              }
          } else {
            if(data[attr] && !__nestScp__.has(data[attr])){
              // nestObj = { data: data[attr] };
              nestObj = {
                data : data[attr],
                dtype : data.__component__.component.__data[attr],
                Error:data.__component__.component.data.errors,
                key:attr
              };
                __nestScp2Set__ = true;
            }
            else{
                var __nId = __nestScp__.get(data[attr])
                var refMp = __nestRef__[__nId] = __nestRef__[__nId] || new Map();
                var refMpId = genMapId(refMp);
                refMp.set(refMpId, true);
                obj[attr] = __nId+"_"+refMpId;
            }
        }
        if(nestObj){
          nestScpId++;
          var refMp = __nestRef__[nestScpId] = __nestRef__[nestScpId] || new Map();
          var refMpId = genMapId(refMp);
          refMp.set(refMpId, true);
          __nestScp__.set(data[attr], nestScpId);
          if(__nestScp1Set__){
              nestScp[nestScpId] = {};
              if(db){
                nestScp[nestScpId].db = db;
              }
              setRecBindMap(nestScp[nestScpId], nestObj);
              //     setRecBindMap(model._name, attr, data.$.pK, nestScpId); 
          }
          if(__nestScp2Set__){   
            nestScp[nestScpId] = nestObj;                 
          }
          nestScp[nestScpId]._data = data[attr];
          obj[attr] = obj[attr] || nestScpId+"_"+refMpId;
          var path = [];
          // fromStore ? path.push(attr) : undefined;
          bindObj(data, attr, nestScpId, path, new Map(), checkAttrs, watch);
        }
    }
}
};

function establishWatchScope(watchProps,model){
  var scope = this,object;
  for (var v in watchProps){
    var property = v;
    var watch = watchProps[v]
    if(scope.component && scope.component.__data && scope.component.__data[property]){
      object = scope.getData(property);
      watch = scope.component.__data[property].watch ? true : watch;
      if(typeof object == "object"){
        establishObjectBinding(scope.component.data,v,false,undefined,undefined,watch)
      }
      if( nestScp[__nestScp__.get(object)]){
        nestScp[__nestScp__.get(object)].dtype.watch = watch;
      }
    }
    else{
      if(model){
        var fieldList = model.fieldList;
        if(fieldList[v] && fieldList[v].watch == undefined){
          fieldList[v].watch = watch ;
          model._fldGrps.watch[v] = fieldList[v];
        }
      }
    }
  }
}

function removeNestScp2Bind(mp, mdlObj){
  var mp = mp.model;
  if (mp.has(mdlObj.model)) {
    var mp1 = mp.get(mdlObj.model);
    if (mp1.has(mdlObj.pK)) {
        var mp2 = mp1.get(mdlObj.pK);
        if (mp2.has(mdlObj.attr)) {
            mp2.delete(mdlObj.attr);
        }
        !mp2.size ? mp1.delete(mdlObj.pK) : undefined; 
    }
    !mp1.size ? mp.delete(mdlObj.model) : undefined;
  }
}

function setRecBindMap(obj, nestObj){
  var mp = obj.model = obj.model || new Map(), modelName = nestObj.model, pK = nestObj.pK, attr = nestObj.attr;
  if(modelName && !mp.has(modelName)){
    mp.set(modelName, new Map());
  }
  mp = mp.get(modelName);
  if(pK && !mp.has(pK)){
    mp.set(pK, new Map());
  }
  mp = mp.get(pK);
  if(attr && !mp.has(attr)){
    mp.set(attr, true);
  }
}


function bindObj(data, key, id, path, mp, checkAttrs, watch) {
  mp = mp || new Map();
  var value = key != undefined ? data[key] : data;
  var cyclic = false;
  if(!path.length && __nestScp__.get(data) === id){
    delete nestScp[id].cyclic;
  }
  if (path.length > 1 && value && nestScp[id] && nestScp[id].hasOwnProperty("data") && nestScp[id].data === value) {
    if(mp.get(value)){
      cyclic = true;
    }
    if (checkAndAddBind(value, id, path, cyclic)) {
      estObjScp(value, id, path, cyclic);
    }
    return;
  }
  var attrs;
  if(checkAttrs && (checkAttrs.hasOwnProperty("items")||checkAttrs.hasOwnProperty("properties"))){
      attrs=checkAttrs.items || checkAttrs.properties;
  }
  attrs=watch?undefined:attrs;
  if (Array.isArray(value)) {
    if (!mp.get(value)) {
      mp.set(value, true);
      value.forEach(function (val, idx) {
        path.push(idx);
        if(watch || (checkAttrs && checkAttrs.hasOwnProperty("items") && typeof(checkAttrs.items) == "object" )){
          bindObj(value, idx, id, path, mp,attrs,watch);
        }  
        // bindObj(value, idx, id, path, mp);
        path.pop();
      });
    } else {
      cyclic = true;
    }
    if (checkAndAddBind(value, id, path, cyclic)) {
      var _establish;
      if(Array.isArray(watch)){
        _establish = checkEstablishingSCP(value,path,watch)
      }
      if(_establish || (typeof watch =="boolean" && watch )){
          estObjScp(value, id, path, cyclic);
      }
    }
  } else if (value && typeof(value) == "object") {
    var cyclic = false;
    if (!mp.get(value)) {
      mp.set(value, true);
      for (var str in value) {
        path.push(str);
        if(watch || (attrs && attrs.hasOwnProperty(str))){
          bindObj(value, str, id, path, mp,attrs?attrs[str]:undefined,watch);
        }  
        // bindObj(value, str, id, path, mp);
        path.pop();
      }
    } else {
      cyclic = true;
    }
    if (checkAndAddBind(value, id, path, cyclic)) {
      var _establish;
      if(Array.isArray(watch)){
        _establish = checkEstablishingSCP(value,path,watch)
      }
      if(_establish || (typeof watch =="boolean" && watch ) ){
          estObjScp(value, id, path, cyclic);
      }
    }
  }
};

function checkAndAddBind(value, id, path, cyclic){
    if(!value._scp || !value._scp.size){
        return true;
    }
    if(value._scp.size){
      if(value._scp.has(id)){
          var _obj = value._scp.get(id);
          var obj = _obj.paths;
          if(obj.hasOwnProperty(path.join("."))){
            if(cyclic){
              nestScp[id].cyclic = true;
            }                      
            return false;
          }
      }
    }
    return true;
}   

function estObjScp(value, id, path, cyclic){
  if(!value._scp){
    Object.defineProperty(value, "_scp", {
      value : new Map(),
      enumerable : false,
      configurable : true
    });
  }
  var mp = value._scp;
  if(!mp.has(id)){
    mp.set(id, {});
  }
  var obj = mp.get(id),
  path = path ? path.join(".") : path;
  var pathObj = obj.paths = obj.paths || {};
  pathObj[path] = true;
  var nestObj = nestScp[id];
  nestObj.cyclic = true;
}

function cmpObjs(obj1, obj2){
    if(Object.keys(obj1).length !== Object.keys(obj2).length){
        return false;
    }
    for(var key in obj1){
        if(!obj2.hasOwnProperty(key)){
            return false;
        }
        var ret = cmpData(obj1[key], obj2[key]);
        if(ret == false){
            return false;
        }
    }
    return true;
}	


function cmpData(data1, data2){
  if(Array.isArray(data1)){
    if((!Array.isArray(data2)) || data1.length !== data2.length){
      return false;
    }
    var len = data1.length, ret;
    for(var i=0;i <len; i++){
      ret = cmpData(data1[i], data2[i]);
      if(ret == false){
        return false;
      }
    }
  }
  else if(data1 && data2 && typeof data1 == "object" && typeof data2 == "object"){
    return cmpObjs(data1,data2);
  }
  else if(isEntity(data1) && isEntity(data2)){
    if(data1.$.schema){
      if( (data1.$.schema._name !== data1.$.schema._name) || (str$.getpKVal(data1) !== str$.getpKVal(data2)) ){
        return false;
      }
    }
    else{
      if( (data1.$.model._name !== data1.$.model._name) || (str$.getpKVal(data1) !== str$.getpKVal(data2)) ){
        return false;
      }
    }
  }
  else if(data1 !== data2){
    return false;
  }
  return true;
}

function nestScpRmPath(obj, path){
  if(obj && obj.paths){
      obj = obj.paths;
      for(var key in obj){
          if(key.startsWith(path+".")){
              delete obj[key];
          }
      }
  }
}

function nestScpRemove(data, id, path){
  var mp = data._scp;
  if(mp && mp.size){
      if(path){
        nestScpRmPath(mp.get(id), path);
        var _obj = mp.get(id); 
        var obj = _obj ? _obj.paths : undefined;
        if(obj && !Object.keys(obj).length){
            mp.delete(id);
        }  
      }
      else{
          mp.delete(id);
      }
      if(!mp.size){
        delete data._scp;
      }
  }
}

function rmNestScp(value, id, mp, data, path){
  if (Array.isArray(value)) {
      if (!mp.get(value)) {
          mp.set(value, true);
          value.forEach(function (val, idx) {
              rmNestScp(val, id, mp, undefined, path);
          });
      }
      nestScpRemove(value, id, path);
  } else if (value && typeof(value) == "object") {
      if (!mp.get(value)) {
          mp.set(value, true);
          for (var str in value) {
              rmNestScp(value[str], id, mp, undefined, path);
          }
      }
      nestScpRemove(value, id, path);
  }
}

function removeNestScp(value, id, mpId, path, context, mp, data, recObj) {
  mp = mp || new Map();
  id = Number.parseInt(id);
  var obj = nestScp[id], kmp = __nestRef__[id];
  if(recObj && obj.model){
    removeNestScp2Bind(obj, recObj);
  }
  if(context){
      if(kmp && kmp.has(mpId)){
          kmp.delete(mpId);
      }
      if(!kmp || (kmp && !kmp.size)){
          delete __nestRef__[id];
          if(__nestScp__.has(value)){
              __nestScp__.delete(value);
          }
          rmNestScp(value, id, mp, true, path);
          if(!data){
              delete nestScp[id];
          }
      }
  }
  else{
    rmNestScp(value, id, mp, true, path);
  }
};

//@3055
// function addStateToMap(event, target, XHR, stateName){
//   var mp = window.__nodeXHRMap = window.__nodeXHRMap || new Map();
//   var nodeMap = mp.get(target);
//   if(!nodeMap){
//       mp.set(target, new Map());
//   }
//   nodeMap = mp.get(target);
//   var sr = target.lyteState = target.lyteState || [], type = stateName || XHR;
//   if(sr.indexOf(type) == -1){
//       sr.push(type);
//   }
//   target.setAttribute("lyte-state", "");
//   var evMap = nodeMap.get(event);
//   if(!evMap){
//       nodeMap.set(event, []);
//       evMap = nodeMap.get(event);
//   }
//   if(stateName){
//       evMap.push({state:stateName});
//       return {target: target, event: event};        
//   }
//   else{
//       evMap.push({isXHR:true, xhr:XHR});
//       var callback = function(arg){
//         if(XHR.readyState == 4){
//             removeStateFromMap(XHR, event, target);
//             XHR.removeEventListener("readystatechange", callback);
//         }
//     }
//     XHR.addEventListener("readystatechange", callback);
//   }
// }

// function removeStateFromMap(type, event, target){
//   var mp = window.__nodeXHRMap; 
//   var nodeMap = mp.get(target);
//   if(!nodeMap){
//       return;
//   }
//   var evMap = nodeMap.get(event);
//   if(!evMap){
//       return;
//   }
//   if(evMap){
//       var arr = evMap;
//       var ind = -1;
//       arr.every(function(itm, idx){
//           if((itm && itm.isXHR && itm.xhr == type)|| (typeof type == "string" && itm.state == type)){
//               ind = idx;
//               return false;
//           }
//           return true;
//       });
//       if(ind != -1){
//           arr.splice(ind,1);
//           var sind = target.lyteState.indexOf(type);
//           target.lyteState.splice(sind, 1);
//           if(!arr.length){
//               nodeMap.delete(event);
//               var tyInd = target && Array.isArray(target.lyteState) ? target.lyteState.indexOf(type) : -1; 
//               tyInd != -1 ? target.lyteState.splice(tyInd, 1) : undefined;
//               if(target && target.lyteState && target.lyteState.length == 0){
//                   target.lyteState = null;
//                   target.removeAttribute("lyte-state");
//               } 
//           }
//           if(!nodeMap.size){
//               mp.delete(target);
//           }
//       }
//   }
// }

function toBeUsedServices(obj){
  var serviceToBeUsed = Object.assign({},obj.Lyte.toBeInjectedServices);
  var arr = obj.services;
  if(arr){
    arr.forEach(function(service){
        if(typeof service == "string"){
            serviceToBeUsed[service] = service;
        }
        else if(service && typeof service == "object"){
            for(var key in service){
                serviceToBeUsed[key] = service[key];
            }
        }
    })
  }
  return serviceToBeUsed;
}

function extendService(obj){
  var servObj = obj.serviceToBeUsed || toBeUsedServices(obj), name;
  for(var serv in servObj){
    name = servObj[serv];
    if(obj.Lyte.registeredServices.hasOwnProperty(name)){
      obj.scope[serv] = obj.Lyte.registeredServices[name];
    }else{
      obj.Lyte.$.requiredServices(serv, name, obj.callback);
    }
  }  
}

function extendMixin(obj){
  var scp = obj.Lyte, self = obj.scope;
  obj.mixins.forEach(function(item){
    if(scp.Mixin.exists(item)){
      var mixin = scp.registeredMixins[item];
      for(var key in mixin){
        self[key] = mixin[key];
      }
    }
    else{
      scp.$.requiredMixins(item, obj.callback);
    }
  });
}

function toAddSuper(scp, key, name, self){
  if(scp.__toAddSuper && scp.__toAddSuper.hasOwnProperty(name)){
    var addSuper = scp.__toAddSuper[name];
    for(var i=0; i<addSuper.length; i++){
      var child = scp[addSuper[i]];
      if(child && child.is == key){
        child.$super = self;
        self.__extendedBy.push(addSuper[i]);
        var index;
        if(name != "application")
        {	
          if(scp.__toAddSuper.application)
          {
            index = scp.__toAddSuper.application.indexOf(child.__name);
            if(index > -1)
            {
              scp.__toAddSuper.application.splice(index,1);
            }
          }
          if(scp.application)
          {
            index = scp.application.__extendedBy.indexOf(child.__name);
            if(index > -1)
            {
              scp.application.__extendedBy.splice(index,1);
            }
          }
        }
      }
    }
    delete scp.__toAddSuper[name];
  }
}

function _get(cacheObj, key) {
  return cacheObj[key];
}
function globalsSet(scope,value){
  let set = this.$utils.set;
  if(set){
      return set(this.__gl,scope,value);
  }
  else{
      this.error("Globals set will be supported only if component registry is imported in the app");
  }
};
function globalsGet(scope){
  let get = this.$utils.get;
  if(get){
      return get(this.__gl,scope);
  }
  else{
      elf.error("Globals get will be supported only if component registry is imported in the app");
  }
};
function arrayUtils(){
  let arrayUtils = this.$utils.arrayUtils;
  if(arrayUtils){
      return arrayUtils.apply(arrayUtils, arguments);
  }else{
      this.error("arrayUtils will be supported only if component registry is imported in the app");
  }
}
function objectUtils(){
  let objectUtils = this.$utils.objectUtils;
  if(objectUtils){
      return objectUtils.apply(objectUtils, arguments);
  }else{
      this.error("objectUtils will be supported only if component registry is imported in the app");
  }
}
function _lyteDidConnect(LClass,ins){
  if(LClass._component.didConnect){
    LClass._component.didConnect(ins);
  }
}
function _lyteInit(LClass,ins){
  ins.__gl = {};
  ins.Globals = {};
  // ins.triggerEvent = triggerEvent;
  // ins.addEventListener = addEventListener;
  // ins.removeEventListener = removeEventListener; 
  ins.extendEventListeners = extendEventListeners;
  extendEventListeners(ins);
  extendEventListeners(LClass);
  if(LClass._component.init){
    LClass._component.init(ins);
  }
  // ins.arrayUtils = arrayUtils;
  // ins.objectUtils = objectUtils;
  ins.arrayUtils = function() {
    return arrayUtils.apply(ins ,arguments);
  }
  ins.objectUtils = function(){
      return objectUtils.apply(ins ,arguments);
  }
  ins.Globals.set = function(){
      return globalsSet.apply(ins ,arguments);
  }
  ins.Globals.get = function(){
      return globalsGet.apply(ins ,arguments);
  }
  ins.lyteError = Logger;
  ins.error = Logger.error.bind(Logger);
  ins.warn = Logger.warn.bind(Logger);
  ins.errorCodes = Logger.errorCodes;
  defProp(ins, "patterns", {
    value: {
      email : new RegExp(/^([A-Za-z0-9._%\-'+/]+@[A-Za-z0-9.-]+\.[a-zA-Z]{2,22})$/),
      url : new RegExp(/(^(ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&amp;%$#_[\]@!()*;~]*)?$)/),
      ampm : new RegExp(/^(AM|PM|am|pm)$/),
      hour : new RegExp(/^(0?[0-9]|1[0-9]|2[0-4])$/),
      minute : new RegExp(/^(0?[0-9]|[1-5][0-9]|60)$/),
      boolean : new RegExp(/^(true|false|TRUE|FALSE)$/),
      alphaNumeric : new RegExp(/([a-zA-Z0-9])+/),
      alphabetsOnly : new RegExp(/([a-zA-Z])+/),
      numeric : new RegExp(/([0-9])+/),
      phoneNo : new RegExp(/^[0-9a-zA-Z+.()\-;\s]+$/)
    }
  });
  ins.deepCopyObject = function(obj){
    return copyObject(obj);
  }
  ins.prop = function(type, opts){
    var obj = {};
    obj.type = type;
    if(opts == undefined){
      opts = {};
    }
    // if(this.types.indexOf(type) == -1 && !this.Transform.hasOwnProperty(type)){
    //   throw new Error("Not a valid field type - "+type);
    // }
    Object.assign(obj, opts);
    return obj;
  }
  Logger.addEventListener("error", function(){  
    var arr = Array.from(arguments);
    if (LClass.onerror) {
      LClass.onerror.apply(LClass, arr);
    }
    if(LClass.triggerEvent){
      arr.unshift("error");
      LClass.triggerEvent.apply(LClass, arr);
    }
  });
  ins.types = types;
  ins.log = function (text, src, color) {
    if (this.config && this.config.debug) {
        if(color) {
            console.log("%c" + text,'color:' + color);
        } else {
          console.log(text);      
        }
    }
  };
  ins.isComponent = function(object) {
      if(object && object.$node && object.__data) {
        return true;
      }
      return false;
  }
  ins.Transform = {};
  ins.one = one;
  ins.many = many;

  ins.registerDataType = function(fieldTypeName, properties){
      var exts = "extends";
      if(ins.Transform.hasOwnProperty(fieldTypeName)){
        LClass.error("Custom Field Type - "+fieldTypeName+" -  already exists.");
        return;
      }
      if(properties[exts] == undefined || ins.types.indexOf(properties[exts]) == -1){
        LClass.error("Not a valid field type - "+properties[exts]);
        return;
      }
      ins.Transform[fieldTypeName] = properties;
  }
  ins.registerPattern = function(patternName, pattern){
    ins.patterns[patternName] = pattern;
  }
  ins.injectResources = function (files, every, completed, options) {
    var successFiles = [],
    errorFiles = [],
    scope = ins;
    every = every || function () {};
    completed = completed || function () {};
    return new Promise(function (resolve,reject) {
      processRequirements(files, function () {
        if (options && options.defer) {
          options.defer({
            injectJS: injectJS,
            files: files,
            errorFiles: errorFiles
          });
          resolve();
        } else {
          injectJS(files, function () {
            completed(successFiles, errorFiles);
            if(errorFiles.length) {
                reject(successFiles, errorFiles);
              } else {
                resolve(successFiles, errorFiles);
              }
          });
        }
      }.bind(ins));
    });
  
    function injectJS(files, resolve, execFiles) {
      execFiles = execFiles || []
      if (!files) {
        resolve(successFiles, errorFiles);
      } else {
        if (!Array.isArray(files)) {
          files = [files];
        }
        if (!files.length) {
          resolve(successFiles, errorFiles);
        }
        var len = -files.length;
        files.forEach(function (file) {
          if (typeof file == "string") {
             var fileSplit = file.split('.'),
            type = fileSplit[fileSplit.length - 1];
            if (type && type == "js" && execFiles.indexOf(file) == -1) {
              execFiles.push(file);
              createScript(file, function () {
                loaded();
              });
            } else {
              loaded();
            }
          } else if (Array.isArray(file)) {
            new Promise(function (r) {
              injectJS(file, r);
            }).then(function () {
              loaded();
            });
          } else {
            len--;
            new Promise(function (r) {
              injectJS(file.parent, r);
            }).then(function () {
              new Promise(function (r) {
                injectJS(file.child, r);
              }).then(function () {
                loaded();
              });
              loaded();
            });
          }
        });
      }
  
      function loaded() {
        len++;
        if (len == 0) {
          resolve(successFiles, errorFiles);
        }
      }
    }
    
    function createScript(file, resolve) {
      var ev = scope.injectResources.respObj[file];
      if (!scope.injectResources.availableTags[file] || scope.injectResources.availableTags[file].tag.tagName == "LINK") {
        var tag = document.createElement('script');
        tag.setAttribute('type', "text/javascript");
        ev.getAttributeNames().forEach(function (attr) {
          if (["href", "as", "rel"].indexOf(attr) == -1) {
            tag.setAttribute(attr, ev.getAttribute(attr));
          }
        });
        tag.setAttribute('src', file);
        tag.onerror = tag.onload = function(event) {
          if (event.type == "error") {
            errorFiles.push(event)
          } else {
            successFiles.push(event)
          }
          scope.injectResources.availableTags[file].tag.remove();
          scope.injectResources.availableTags[file] = { tag: tag, event: { type: event.type == "error" ? "error" : "load"} };
          resolve();
        }
        Lyte.$.assetsDiv.appendChild(tag);
      } else {
        resolve();
      }
    }
  
    function processRequirements(files, resolve) {
      if (!files) {
        resolve();
      } else {
        if (!Array.isArray(files)) {
          files = [files];
        }
        if (!files.length) {
          resolve();
        }
        var len = -files.length;
        files.forEach(function (file) {
          if (typeof file == "string") {
            requestFile.call(scope, file, scope.injectResources.availableTags[file], function () {
              loaded();
            });
          } else if (Array.isArray(file)) {
            new Promise(function (r) {
              processRequirements(file, r);
            }).then(function () {
              loaded();
            });
          } else {
            len--;
            new Promise(function (r) {
              processRequirements(file.parent, r);
            }).then(function () {
              loaded();
            });
            new Promise(function (r) {
              processRequirements(file.child, r);
            }).then(function () {
              loaded();
            });
          }
        });
      }
  
      function loaded() {
        len++;
        if (len == 0) {
          resolve();
        }
      }
  
      function requestFile(file, cached, resolve) {
        if(ins.$.reqFiles[file]) {
          ins.$.reqFiles[file].push(resolve);
        } else {
          var scope = ins;
          ins.$.reqFiles[file] = [resolve];
          if (cached && cached.event.type != "error") {
            if (ins.removeFromCache.arr.indexOf(file) != -1) {
              ins.removeFromCache.arr.splice(scope.removeFromCache.arr.indexOf(file), 1);
            }
            fileLoaded.call(cached.tag, file, cached.event, true);
            resolve();
          } else {
            makeRequest(file, function (event) {
              scope.injectResources.respObj[file] = ins;
              scope.$.reqFiles[file].forEach(function (resolve) {
                resolve();
              });
              // filesObj[file] = ins;
              fileLoaded.call(ins, file, event);
              every.call(ins, event);
            });
          }
        }
      }
  
      function fileLoaded(file, event, cached) {
        delete scope.$.reqFiles[file];
        if (!cached) {
          if (scope.injectResources.availableTags[file]) {
            scope.injectResources.availableTags[file].tag.remove();
            delete scope.injectResources.respObj[file];
          }
          ins.onerror = ins.onload = undefined;
          scope.injectResources.availableTags[file] = { tag: ins, event: { type: event.type } };
        }
      }
    }
  
    function makeRequest(file, callBack) {
      var tag,
          ev = every.internal || {},
          fileSplit = file.split('.'),
          type = fileSplit[fileSplit.length - 1];
      ev.file = file;
      if (fileSplit.length == 1) {
        Lyte.error('Type of file is not specified in injectResources.');
        return;
      }
      tag = document.createElement('link');
      tag.setAttribute('href', file);
      ev.tag = tag;
      if (type == 'css') {
        tag.setAttribute('type', "text/css");
        tag.setAttribute('rel', "stylesheet");
        tag.onerror = tag.onload = function (event) {
          // if (event.type == "error") {
          //   errorFiles.push(event);
          // } else {
          //   successFiles.push(event);
          // }
          callBack.call(ins, event);
        };
      } else {
        tag.setAttribute('as', "script");
        tag.setAttribute('rel', "preload");
        tag.onerror = tag.onload = function (event) {
          // if (event.type != "error") {
          //   tag.status = 200;
          // }
          callBack.call(ins, event);
        };
      }
      Lyte.triggerEvent("onBeforeInject", ev);
      Lyte.$.assetsDiv.appendChild(tag);
    };
  };
  ins.injectResources.availableTags = [];
  ins.injectResources.respObj = [];

  ins.removeFromCache = function(arr) {
    var scope = ins;
    ins.removeFromCache.assign.call(ins,arr);
    if(ins.removeFromCache.arr.length) {
      ins.removeFromCache.arr.forEach(function(file) {
        if(scope.injectResources.availableTags[file]) {
          scope.injectResources.availableTags[file].tag.remove();
          delete scope.injectResources.availableTags[file];  
        }
      });
      ins.removeFromCache.arr = [];
    }
  }
  ins.removeFromCache.arr = [];
  ins.removeFromCache.assign = function(arr) {
    arr = arr == "*" ? Object.keys(ins.injectResources.availableTags) : (Array.isArray(arr) ? arr : [arr]); 
    ins.removeFromCache.arr = ins.removeFromCache.arr.concat(arr);
    return;
  }
  ins.resolvePromises = function(promises) {
    return new Promise(function(res, rej) {
      resolvePromises(promises).then(function(data) {
        res(data);
      },function(data) {
        rej(data);
      })
    })
  }
  // ins.setState = function(str){
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
  // ins.removeState = function(str){
  //   if(!str){
  //       console.error("Please provide a state name");
  //   }
  //   var mp = window.__stateMap;
  //   if(mp){
  //       var obj = mp.get(str);
  //       if(obj){
  //           mp.delete(str);
  //           removeStateFromMap(str, obj.event, obj.target);
  //       }
  //   }
  // }

  // ins.setConfig = function(key, value){
  //   var configObj = window.__config = window.__config || {};
  //   configObj[key] = value;
  // }
  // ins.getConfig = getConfig;
}


function _defineProperty(exportsObj,specsObj){
  let actualObj = {};
  let defineProperty = function(obj,property){
    Object.defineProperty(exportsObj,property,{
      set : function(newValue){
        actualObj[property] = newValue;
      },
      get : function(){
        if(!actualObj[property]){
          actualObj[property] = obj();
        }
        return actualObj[property];
      }

    })
  }
  for(let key in specsObj){
    defineProperty(specsObj[key],key)
  }
}

function checkEstablishingSCP(value,path,watch){
  if(Array.isArray(watch)){
      var _path ='';
      _path = path.join(".")
      if(checkWatchPath(_path,watch,true) && typeof value != "object"){
          return true
      }
      var _key = Object.keys(value);
      for(var i_scp =0 ; i_scp<_key.length ; i_scp++){
          var spiePath = _key[i_scp];
         var finalaUth =  _path == ""?spiePath : _path+"."+spiePath;
          if(checkWatchPath(finalaUth,watch,true)){
              return true
          }
      }
  }
}
function checkWatchPath(actualPath,watchArr,establishBind){
  if(typeof watchArr == "boolean" && watchArr === true){
      return true
  }
  else if(Array.isArray(watchArr)){
      for(var i_watch=0; i_watch < watchArr.length ; i_watch++){
          var path = watchArr[i_watch];
          path =path.replace(/ /g,"");
          path = path.replace(/\$\.\./g,"..");
          path = path.replace(/\$\./g,"")
          var weirdPath = path.search(/\.\./g) != -1 || path.search(/\[|\\]|\{|\}/g)!=-1 ? true : false || path.includes("*");
          if(actualPath == path){
              return true;
          }
          else if (weirdPath){
              if(establishBind){
                if(path.search(/\.\./) != -1 ){
                  path = path.replace(/\.\.\S+/g,"..*")
                  if(path == "..*"){
                    return true;
                  }
                } 
              }
              path = path.search(/\[/) == 0? path.replace("[",""):path;
              path = path.search(/\.\.\[/)==0 ? path.replace("..[",".."):path
              path = path.replace(/\.*\[/g,".");
              path = path.replace(/\]/g,"");
              var _watchPath = checkWeirdPath(path,actualPath);
              if(_watchPath){
                  return true
              }
          }
      }
  }
}
function checkWeirdPath(watchPath,actualPath){
  if(actualPath == watchPath){
      return true;
  }
  else if(watchPath.includes("..") || watchPath.includes("*")) {
      var cmpPath = watchPath;
      cmpPath = cmpPath.replace(/\*/g, "$$")
      cmpPath = cmpPath.replace(/\.\./g,"::")
      // cmpPath = cmpPath.replace("[","\\[")
      cmpPath = cmpPath.replace(/\./g, "\\.")
      cmpPath=cmpPath.replace(/\:\:/g,"\\.?.*\\.?");
      cmpPath=cmpPath.replace(/\$/g,".*");
      var _wildCard = watchPath.split(".")
      var _wClenght = _wildCard.length;
      if(_wildCard[_wClenght-2] == "" && _wildCard[_wClenght-1]!="*"){
        cmpPath = cmpPath+"$";
      }
      var regularExp = new RegExp(cmpPath);
      if(regularExp.test(actualPath)){
          return true;
      }
      return false;
  }
}
function removeStateFromMap(type, event, target) {
  var mp = window.__nodeXHRMap;
  var nodeMap = mp.get(target);
  if (!nodeMap) {
      return;
  }
  var evMap = nodeMap.get(event);
  if (!evMap) {
      return;
  }
  if (evMap) {
      var arr = evMap;
      var ind = -1;
      arr.every(function (itm, idx) {
          if ((itm && itm.isXHR && itm.xhr == type) || (typeof type == "string" && itm.state == type)) {
              ind = idx;
              return false;
          }
          return true;
      });
      if (ind != -1) {
          arr.splice(ind, 1);
          var sind = target.lyteState.indexOf(type);
          target.lyteState.splice(sind, 1);
          if (!arr.length) {
              nodeMap.delete(event);
              var tyInd = target && Array.isArray(target.lyteState) ? target.lyteState.indexOf(type) : -1;
              tyInd != -1 ? target.lyteState.splice(tyInd, 1) : undefined;
              if (target && target.lyteState && target.lyteState.length == 0) {
                  target.lyteState = null;
                  target.removeAttribute("lyte-state");
              }
          }
          if (!nodeMap.size) {
              mp.delete(target);
          }
      }
  }
}

function addStateToMap(event, target, XHR, stateName) {
  var mp = window.__nodeXHRMap = window.__nodeXHRMap || new Map();
  var nodeMap = mp.get(target);
  if (!nodeMap) {
      mp.set(target, new Map());
  }
  nodeMap = mp.get(target);
  var sr = target.lyteState = target.lyteState || [],
      type = stateName || XHR;
  if (sr.indexOf(type) == -1) {
      sr.push(type);
  }
  target.setAttribute("lyte-state", "");
  var evMap = nodeMap.get(event);
  if (!evMap) {
      nodeMap.set(event, []);
      evMap = nodeMap.get(event);
  }
  if (stateName) {
      evMap.push({
          state: stateName
      });
      return {
          target: target,
          event: event
      };
  } else {
      evMap.push({
          isXHR: true,
          xhr: XHR
      });
      var callback = function () {
          if (XHR.readyState == 4) {
              removeStateFromMap(XHR, event, target);
              XHR.removeEventListener("readystatechange", callback);
          }
      }
      XHR.addEventListener("readystatechange", callback);
  }
}

export {
  /*addToInstance,
  createEngineInstance, */
  removeStateFromMap,
  addStateToMap,
  types,
  nestScp,
  nestScpId,
  getConfig,
  getCurrentRouterInstance,
  registerErrorCodes,
  isEntity,
  _defineProperty,
  triggerEvent,
  addEventListener,
  prop,
  removeEventListener,
  extendEventListeners,
  checkProperty,
  validateData,
  deepCopyObject,
  copyObject,
  defineRelation,
  establishObserverBindings,
  getProperty,
  // getErrorMessage,
  establishObjectBinding,
  bindObj,
  estObjScp,
  cmpObjs,
  cmpData,
  nestScpRemove,
  removeNestScp,
  toBeUsedServices,
  extendService,
  extendMixin,
  toAddSuper,
  isKeyword,
  injectServiceToModules,
  observes,
  getSuperClass,
  defProp,
  defProps,
  newGetSuperClass, 
  getClass, 
  includeMixins,
  createCustomClass,
  one,
  many, 
  _get,
  // arrayUtils,
  // objectUtils,
  // set,
  // render,
  // modifyTemplate,
  // compileDynamicTemplate,
  // doDomProcessing,
  // getComponentTemplate,
  // get,
  checkNestedProp,
  getNearestApp,
  isInheritedClass,
  globalsSet,
  globalsGet,
  arrayUtils,
  objectUtils,
  _lyteInit,
  _lyteDidConnect,
  checkEstablishingSCP,
  checkWatchPath,
  establishWatchScope
}
