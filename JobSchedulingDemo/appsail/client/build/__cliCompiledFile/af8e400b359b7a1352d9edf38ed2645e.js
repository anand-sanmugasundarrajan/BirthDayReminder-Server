import { Service } from "@slyte/core"
import { isEntity } from "@slyte/core/src/lyte-utils";
import { checkPresenceInArray, getpKVal, getRelatedRecord, initCB } from "./utils";

class LyteIDB extends Service {
  static getBlobURL( url ) {
      return URL.createObjectURL( new Blob( [ "importScripts( '"+ url +"' );" ], { type: "text/javascript" } ) );
  }

  static changeIDBState(db, rec, parent){
      rec.$.inIDB = rec.$.inIDB || {};
      if(parent){
        rec.$.inIDB[parent.schema] = rec.$.inIDB[parent.schema] || new Map();
        rec.$.inIDB[parent.schema].set(parent.pK, true);
      }
      else{
        Object.defineProperty(rec.$.inIDB, "self", {
          value: true
        });
      }
      var relMod = db.schema[rec.$.schema._name] && db.schema[rec.$.schema._name].idb ? db.schema[rec.$.schema._name].idb.deserializeKeys : undefined;
      if(relMod){
        for(var k=0;k<relMod.length;k++){
          var rel = rec.$.schema.fieldList[relMod[k]];
          if(rec.hasOwnProperty(relMod[k]) && rel.relType == "hasMany"){
            if(Array.isArray(rec[relMod[k]])){
              for(var p=0; p<rec[relMod[k]].length; p++){
                if(isEntity(rec[relMod[k]][p])){
                  LyteIDB.changeIDBState(db, rec[relMod[k]][p], parent ? parent : {schema:rec.$.schema._name, pK:rec.$.pK});
                }
              }
              rec[relMod[k]].inIDB || Object.defineProperty(rec[relMod[k]], "inIDB", {value: {}});
              if(parent){
                rec[relMod[k]].inIDB[parent.schema] = rec[relMod[k]].inIDB[parent.schema] || new Map();
                rec[relMod[k]].inIDB[parent.schema].set(parent.pK, true);        
              }
              else{
                rec[relMod[k]].inIDB.self = true;
              }
            }
            else if(isEntity(rec[relMod[k]])){
              LyteIDB.changeIDBState(db, rec[relMod[k]], parent ? parent : {schema:rec.$.schema._name, pK:rec.$.pK});
            }
          }
        }
      }
  }

  initWorker(url, db){
      var self = this;
      return new Promise(function(resolve, reject){
          var worker = LyteIDB.worker;
          // self = this;
          if(!worker){
            worker = LyteIDB.worker = new Worker(LyteIDB.getBlobURL(url));
          }
          self.idbQ2 = {};
          self.db = db;
          worker.onmessage = function(event){
            var obj = event.data;
            if(obj && obj.lyteidb){
              if(obj.type == "open"){
                if(obj.msg != "error"){
                  setTimeout(function(){
                    LyteIDB.triggerIDBInsertion();
                  },0);
                  Object.defineProperty(LyteIDB, "isIDBOpened", { value : true});
                  Object.defineProperty(db, "idbOpen", { value : false});
                  var host = window.location.host, 
                  idb = localStorage.getItem("idb"+host); 
                  if(idb == undefined){
                    localStorage.setItem("idb"+host,1);
                  }
                  else{
                    idb = parseInt(idb);
                    localStorage.setItem("idb"+host,idb+1);
                  }
                  if(self.restoreData === false){
                    window.addEventListener("beforeunload",function(){
                        self.removeCurrentIDB();
                    });
                  }
                  // return resolve(worker);
                }
                // else{
                //   // return reject();
                // }
              }
              else if(obj.qProcess =="completed4"){
                var key = Object.keys(this.idbQ2)[0]
                var arr = obj.data || [];
                arr.forEach(function(item,index){
                  var rec = db.cache.get({schema:db.getSchema(key),pK:item});
                  if(rec){
                    rec.$.inIDB = true;
                  }
                });
                delete this.idbQ2[key];
                LyteIDB.isProcessing = false;        
              }
              else if(obj.hasOwnProperty("code")){
                var req = obj.req, 
                q = LyteIDB[obj.schema][obj.req], 
                reqObj = (req == "findRecord") ? q[obj.key].splice(0,1)[0] : q.splice(0,1)[0];
                if(obj.code == 200){
                  if(reqObj && reqObj.resolve){
                    reqObj.resolve(obj.data);
                  }
                }else if(obj.code == 400){
                  if(reqObj && reqObj.reject){
                    reqObj.reject();
                  }
                }
                if(q.length == 0){
                  delete LyteIDB[obj.schema][obj.req];
                }
              }
              else if(obj.pause){
                var reqObj = LyteIDB[obj.schema][obj.req];
                var pause = localStorage.getItem("pause");
                localStorage.setItem("pause",!pause);
                if(reqObj){
                  reqObj = !Array.isArray(reqObj) ? [reqObj] : reqObj;
                  reqObj.forEach(function(reqItm){
                    if(reqItm && reqItm.reject){
                      reqItm.reject();
                    }
                  });
                }
              }
              else if(obj.init == "done"){
                return resolve(worker);
              }
            }
            // if(Object.keys(this.idbQ2).length == 0){
            //   LyteIDB.isProcessing = false;
            // }
          };
          worker.onerror = function(event){ 
            reject();
          }
      });
  }

  constructor(opts){
      super();
      this.getQ = {};
      this.restoreData = false;
      this.maintainOrder = false;
      this.maxProcessingTime = 5000;
      var hasAnotherTab = false,
      host = window.location.host, 
      self = this;
      localStorage.setItem(host+"parent", Date.now());
      window.addEventListener("storage", function(ev){
          if(ev.key == host+"child"){
              hasAnotherTab = true;
          }
          if(ev.key == host+"parent"){
            localStorage.setItem(host+"child", Date.now());
          }
      });
      this.init = new Promise(function(resolve, reject){
        var version = opts ? opts.version : undefined,
        restoreData = self.restoreData = opts && opts.hasOwnProperty("restoreData") ? opts.restoreData : self.restoreData, 
        models = [],
        db, 
        dbName; 
        if(!opts || !opts.db || !opts.name){
          console.error("IDB cannot be initiated without db instance or idb name");
          return reject("IDB cannot be initiated without db instance or idb name");
        }
        if(opts.db && opts.db.idbIns){
          console.error("db instance already initiated with a idb");
          return reject("db instance already initiated with a idb");            
        }
        db = opts.db;
        
        dbName = opts ? opts.name : db._name; 
        self.name = dbName = LyteIDB.idbNamePrefix + dbName;
        self.initWorker(opts?opts.url:undefined, db).then(function(worker){
          var db = opts.db;
          LyteIDB.idbs.set(dbName, self);
          for(var key in opts.db.schema){
            var mdl = opts.db.schema[key];
            if(mdl.hasOwnProperty("idb")){
              var conf = mdl.idb;
              var pK = opts.db.schema[key]._pK;
              var pObj = {modelName:key,pK:pK};
              if(conf.hasOwnProperty("maintainOrder")){
                pObj.maintainOrder = conf.maintainOrder;
              }
              models.push(pObj);
            }
          }
          var res = initCB(db, "connector", undefined, "idbBeforeOpen", {argsObj:{models:models}});
          if(res && res.data){
            models = res.data;
          }
          setTimeout(function(){
              if(!hasAnotherTab){
                  if(restoreData === false){
                    localStorage.setItem("idb"+host, 1);
                    self.removeIDBDatabase().then(function(){
                      self.openIDB(models, dbName, version);
                      // worker.postMessage({tolyteidb:true,models:models, type:"open", version:version, maintainOrder:LyteIDB.maintainOrder, name : dbName});
                      models = [];
                    });
                  }
                  else{
                    self.openIDB(models, dbName, version);
                    // worker.postMessage({tolyteidb:true,models:models, type:"open", version:version, maintainOrder:LyteIDB.maintainOrder, name : dbName});
                    models = [];
                  }
              }
              else{
                self.openIDB(models, dbName, version);
                // worker.postMessage({tolyteidb:true,models:models, type:"open", version:version, maintainOrder:LyteIDB.maintainOrder, name: dbName});
                models = [];
              }
              localStorage.removeItem(window.location.host+"child");
              localStorage.removeItem(window.location.host+"parent");
          },20);
          worker.onmessage = function(event){
            var obj = event.data;
            if(obj && obj.lyteidb){
              if(obj.type == "open"){
                if(obj.msg != "error"){
                  // if(store.adapter.application == undefined || !store.adapter.application.differIDBAction){
                  db.idbIns = self;
                  Object.defineProperty(LyteIDB, "isIDBOpened", { value : true});
                  Object.defineProperty(db.$, "idbOpen", { value : false});
                  var host = window.location.host, 
                  idb = localStorage.getItem("idb"+host); 
                  if(idb == undefined){
                    localStorage.setItem("idb"+host,1);
                  }
                  else{
                    idb = parseInt(idb);
                    localStorage.setItem("idb"+host,idb+1);
                  }
                  if(self.restoreData === false){
                    window.addEventListener("beforeunload",function(){
                        self.removeCurrentIDB();
                    });
                  }
                  return resolve();
                }
                else{
                  return reject();
                }
              }
              else if(obj.qProcess =="completed4"){
                var obj = LyteIDB.isProcessing, 
                _data = obj.q.data, 
                idbIns, 
                qType = obj.q.type;
                // if(!Array.isArray(arr)){
                //   arr = [arr];
                // }
                idbIns = LyteIDB.idbs.get(obj.q.name);
                var arr;
                if(/^(push|getAll|getEntity)$/.test(qType)){
                  arr = _data[obj.q.schema];
                }
                arr = _data;
                if(arr && !Array.isArray(arr)){
                  arr = [_data];
                }
                if(!/^(delete|deleteEntity)$/.test(qType)){
                  arr.forEach(function(item,index){
                    var rec = idbIns.db.cache.getEntity({schema:idbIns.db.getSchema(key),pK:getpKVal(item, idbIns.db.getSchemaObj(key))});
                    if(rec){
                      LyteIDB.changeIDBState(idbIns.db, rec);
                      // rec.$.inIDB = true;
                    }
                  });
                }
                LyteIDB.isProcessing = false;    
                idbIns.triggerIDBInsertion();    
              }
              else if(obj.hasOwnProperty("code")){
                var req = obj.req;
                var q = self.getQ[obj.schema][obj.req];
                var reqObj = (req == "getEntity") ? q[obj.key].splice(0,1)[0] : q.splice(0,1)[0];
                if(obj.code == 200){
                  if(reqObj && reqObj.resolve){
                    reqObj.resolve(obj.data);
                  }
                }else if(obj.code == 400){
                  if(reqObj && reqObj.reject){
                    reqObj.reject();
                  }
                }
                if(q.length == 0){
                  delete self.getQ[obj.schema][obj.req];
                }
              }
              else if(obj.pause){
                var reqObj = LyteIDB[obj.schema][obj.req];
                var pause = localStorage.getItem("pause");
                localStorage.setItem("pause",!pause);
                if(reqObj){
                  reqObj = !Array.isArray(reqObj) ? [reqObj] : reqObj;
                  reqObj.forEach(function(reqItm){
                    if(reqItm && reqItm.reject){
                      reqItm.reject();
                    }
                  });
                }
              }
            }
                        
          }
          // resolve(); 
        }, function(){
          reject();
        });
      });  
  }

  openIDB(models, name, version){
    LyteIDB.worker.postMessage({tolyteidb:true,models:models, type:"open", version:version, maintainOrder:LyteIDB.maintainOrder, name : name});
  }

  removeCurrentIDB(){
      var self = this; 
      return new Promise(function(resolve, reject){
        var host = window.location.host, 
        idb = localStorage.getItem("idb"+host);
        if(idb == undefined || parseInt(idb) - 1 == 0){
          self.deleteIDB(self.name).then(function(){
            return resolve();    
          }, function(){
            return reject();
          });
        }
        else{
          localStorage.setItem("idb"+host,parseInt(idb) - 1);
          return resolve();
        }
      });
  }

  deleteIDB(name){
    return new Promise(function(resolve, reject){
      var trans = indexedDB.deleteDatabase(name);
      trans.onsuccess = function(){
        return resolve();
      }
      trans.onerror = function(){
        return reject();
      }
    });
  }

  removeIDBDatabase(){
    var self = this;
    return new Promise(function(resolve, reject){
        indexedDB.databases().then(function(arr){
          var len = arr.length, obj, j=0, lidbcount = 0;
          for(var i=0;i<len;i++){
            obj = arr[i];
            if(obj.name.startsWith(LyteIDB.idbNamePrefix)){
              lidbcount++;
              self.deleteIDB(obj.name).then(function(){
                if(++j == lidbcount){
                  localStorage.removeItem("idb"+window.location.host);
                  self.didInit = false;
                  resolve();
                }
              }, function(){
                if(++j == lidbcount){
                  localStorage.removeItem("idb"+window.location.host);
                  self.didInit = false;
                  resolve();
                }
              });
            }
          }
          if(!len || !lidbcount){
            resolve();
          }
        });
      });
  }

  postMessage(obj){
      if(LyteIDB.isIDBOpened){
          var itm = { schema: obj.schema, key: obj.key, type: obj.req, customData: obj.customData, queryParams: obj.queryParams };
          delete obj.customData;
          var res, cData;
          res = initCB(this.db, "serializer", this.db.getSchemaObj(itm.schema).serializer, "beforeIDBGet", {argsObj:[itm]});
          if(res && res.data){
            cData = res.data;
            if(cData && typeof cData == "object"){
              delete cData.type;
              Object.assign(obj,cData)
              // LyteIDB.worker.postMessage(obj);
            }
            else{
              if(obj && obj.reject){
                obj.reject();
              }
            }
          }
          if(obj.resolve && obj.reject){
            var getQ = this.getQ[obj.schema] = this.getQ[obj.schema] || {}; 
            // LyteIDB[obj.schema] = LyteIDB[obj.schema] || {};
            var qObj = {
              key:obj.key,
              resolve : obj.resolve,
              reject: obj.reject,
              queryParams: obj.queryParams,
              req: obj.req,
              name: this.name
            };
            if(obj.req == "getEntity"){
              var typeQ = getQ[obj.req] = getQ[obj.req] || {};
              var q = typeQ[obj.key] = typeQ[obj.key] || []
              q.push(qObj); 
            }
            else{
              var q = getQ[obj.req] = getQ[obj.req] || [];
              q.push(qObj); 
            }
            delete obj.resolve;
            delete obj.reject;
          }
          obj.tolyteidb = true;
          obj.name = this.name;
          
          LyteIDB.worker.postMessage(obj);
      }
      else if(obj && obj.reject){
        obj.reject();
      }
  }

  IDBQProcess(obj){
    var pK = this.db.getSchemaObj(obj.schema)._pK, 
    newQ, 
    res, 
    cData;
    res = initCB(this.db, "serializer", this.db.getSchemaObj(obj.schema).serializer, "beforeIDBCrud", {args:[obj]});
    if(res && res.data){
      cData = res.data;
      if(cData){
        delete cData.customData;
        newQ = cData;
      }
    }
    else{
      newQ = obj;
    }

    if(newQ){
      LyteIDB.isProcessing = {q:newQ, module:obj.schema};
      LyteIDB.worker.postMessage({tolyteidb:true, type:"push", module:obj.schema, data:newQ, pK:pK, name:this.name});        
    }
  }

  triggerIDBInsertion(){
    var self = this, isProcessing = LyteIDB.isProcessing, idbIns;
    if(!isProcessing && LyteIDB.q.length){
      setTimeout(function(){
        var currentProcess = LyteIDB.q.splice(0, 1), 
        obj = currentProcess[0];
        idbIns = LyteIDB.idbs.get(obj.name);
        idbIns.IDBQProcess(obj);
      }, 1);    
    }
  }

  getFromIDB(idbObj ,name, type, queryParams,key, urlObj, xhr){
    var self = this;
    return new Promise(function(resolve, reject){
      if(LyteIDB.worker){
        var reqType = idbObj.queryCache ? "getCachedData" : type == "getAll" ? "_getAll" : "_get", 
        obj = {resolve : resolve, reject: reject, type:reqType, schema :name, req:type, key:key};
        if(reqType == "getCachedData"){
          obj.queryParams = queryParams;
        }
        self.postMessage(obj);
      }else{
        reject();
      }
    });
  }

  updateIDB(db, name, type, data, customData, urlObj, key){
    if(data && !Array.isArray(data)){
      data = [data];
    }
    var schema = db.schema[name], 
    self = this;;
    if(!schema || !schema.hasOwnProperty("idb") || (schema.idb && !schema.idb.hasOwnProperty("queryCache"))){
              data.forEach(function(item, index){
                  if(item && isEntity(item)){
                      self.updateRelationsIDB(db, item, schema.relations, customData, type);
                  }
              });
      return;
    }
    var idb = schema.idb,
    queryCache = idb.queryCache,
    name = schema._name;
    // var q =	db.$.idbQ2[schema._name] = db.$.idbQ2[schema._name] || [];
    if(data){
      switch(type){
        case "update":
        case "updateEntity":
        {
          data.forEach(function(item, index){
            if(item && isEntity(item)){
              var relations = schema.relations;

                              if(item.$.inIDB && item.$.inIDB.self){
                                  self.qPush(db, name, {type:"updateEntity",schema:name,data:item.$.toJSON("idb"), queryCache:queryCache, customData:customData});
                              }

              self.updateRelationsIDB(db, item, relations, customData);
            }
          });
          break;
        }
        case "delete":
        case "deleteEntity":
        case "destroyEntity":
        {
          var parent, 
          pDef, 
          parentQ,
          def = db.getSchemaObj(schema._name),  
          pK = def._pK, 
          arrPk = def._arrPk;
          data.forEach(function(item, index){
            if(item && isEntity(item)){
              var pkObj = {};
                              for(var i=0;i<arrPk.length;i++){
                                  pkObj[arrPk[i]] = item[arrPk[i]];
                              }
              var relations = schema.relations;
              if(item.$.inIDB && item.$.inIDB.self){
                self.qPush(db, schema._name, {type:"deleteEntity",schema :schema._name,key:pkObj, queryCache:queryCache, customData:customData});
              }
              self.updateRelationsIDB(db, item, relations, customData);
            }
          });
          break;
        }
        case "create":
        case "createEntity":{
          data.forEach(function(item, index){
            if(item && isEntity(item)){
              var relations = schema.relations;
              self.qPush(db, schema._name, {type:"createEntity",schema :schema._name,data:item.$.toJSON("idb"), queryCache:queryCache, customData:customData})
              // q.push({type:"createEntity",schema :schema._name,data:item.$.toJSON(true)});
              self.updateRelationsIDB(db, item, relations, customData);
            }
          });
          break;
        }
      }
    }
  }

  updateRelationsIDB(db, item, relations, customData, type){
    var self = this;
    switch(type){
              case "create":
              case "createRecord": {
                  for(var key in relations){
                      var rel = relations[key];
                      rel.forEach(function(obj){
                          var relKey = obj.relKey, 
                          data;
                          if(obj.dummy){
                              data = getRelatedRecord(item,obj.relatedTo,obj.dummy);
                          }	
                          else{
                              data = item[relKey];
                          }	
                          if(data && !Array.isArray(data)){
                              data = [data];
                          }	
                          if(data){
                              data.forEach(function(_data){
                                  var pModel = _data.$.schema;
                                  if(_data.$.inIDB.self){
                  self.qPush(db, pModel._name, {type:"updateEntity",schema:pModel._name, data:_data.$.toJSON("idb"), customData:customData})
                                  }
                                  for(var iKey in _data.$.inIDB){
                                      var mp = _data.$.inIDB[iKey]; 
                                      mp.forEach(function(value, pkVal){
                                          self.qPush(db, iKey, {type:"updateEntity", model:iKey, data:db.cache.get({schema: db.getSchema(iKey), pK:pkVal}).$.toJSON("idb"), customData:customData});
                                      });
                                  }
                              });
                          }
                      });
                  }
              }
              break;
              default: {
                  var idbObj = item.$.inIDB;
                  if(idbObj){
                      for(mKey in idbObj){
                          var mp = idbObj[mKey];
                          mp.forEach(function(value, key){
                              var pRec = db.cache.get({schema:db.getSchema(mKey), pK:key});
              self.qPush(db, mKey, {type:"updateEntity",model:mKey,data:pRec.$.toJSON("idb"), customData:customData})
                          });
                      }
                  }
              }
          }
  }

  // addToIDBonSave(db, name, rec){
  //   var schema = db.schema[name],
  //   fields = schema.fieldList, 
  //   saveMod = db.$.onSave ? db.$.onSave[name] : undefined, 
  //   self = this;
  //   if(saveMod){
  //     var pK = db.schema[name]._pK, 
  //     saveQ = rec && pK ? saveMod[rec[pK]] : undefined;
  //     if(saveQ){
  //       for(var key in saveQ){
  //         var ids = saveQ[key], 
  //         relMod = getSchemaObj(db, fields[key].relatedTo);
  //         ids.forEach(function(item){
  //           var rec = db.cache.getEntity(relMod.def,item);
  //           if(rec){
  //             var parent = rec.$.parent;
  //             if(isEntity(parent)){
  //               var mod = parent.$.schema, 
  //               modName = mod._name, 
  //               modPk = mod._pK;
  //               self.checkAndAddToIDBQ(db, modName, "updateEntity", db.cache.getEntity(mod.def,parent[modPk]).$.toJSON(true));
  //             }
  //             else{
  //               self.checkAndAddToIDBQ(db, relMod, "updateEntity", db.cache.getEntity(relMod.def,item).$.toJSON(true));
  //             }
  //           }
  //         });
  //       }
  //       self.removeOnSave(db, name, rec[pK]);
  //     }
  //   }
  // }

  checkAndAddToIDBQ(db, name, type, data){
    var obj = {schema : name, type:type, data:data};
    // var q = db.$.idbQ2[name] = db.$.idbQ2[name] || [];
    this.qPush(db, name, obj);
  }

  idbQ2Push(db,name,rawData,queryParams,type,key,meta,customData){
    try{
      var schema = db.schema[name];
      if(schema && schema.hasOwnProperty("idb")){
        // rawData = deepCopyObject(rawData);
        var qObj = {
          schema :name,
          type:type
        }, 
        pK = schema._pK, 
        idb = schema.idb;
        switch(type){
          case "update":
          case "create":{
            qObj.data = []
            rawData.forEach(function(item){
              qObj.data.push(isEntity(item)?item.$.toJSON():item);
            });
            break;
          }
          case "updateRecord":
          case "createRecord":{
            qObj.data = rawData;
            break;
          }
          case "delete":{
            qObj.data = rawData;
            break;
          }
          case "destroyRecord":
          case "deleteRecord":{
            qObj.id = rawData;
            break;
          }
          case "getEntity":
          {
            qObj.key = key;		
                          var newRawData = rawData[0].$.toJSON("idb");	
                          var nObj = {};
                          nObj[name] = newRawData;
                          if(meta){
                              nObj.meta = meta;
                          }	
                          if(idb.queryCache === true){
                              qObj.queryParams = queryParams;
                          }
                          qObj.data = nObj;
                          break;
          }
          case "getAll": {
                          var newRawData = [];
                          rawData.forEach(function(itm){
                              newRawData.push(itm.$.toJSON("idb"));
                          });
                          var nObj = {};
                          nObj[name] = newRawData;
                          if(meta){
                              nObj.meta = meta;
                          }
                          // rawData[modelName] = this.removeNotNeededKeys(modelName, rawData[modelName], idb);
                          if(idb.queryCache === true){
                              qObj.queryParams = queryParams;
                          }
                          qObj.data = nObj;
                          break;
          }
          case "pushPayload": {
            if(isEntity){
                              rawData = rawData.$.toJSON("idb");
            }
            qObj.data = rawData;
            break;
          }
        }
        this.qPush(db, name, qObj);
      }	
    }
    catch(err){
      db.lyte.error("Error while adding to IDBQueue ",err);
    }
  }

  updateRelationsIDB(db, item, relations, customData, type){
          switch(type){
              case "create":
              case "createRecord": {
                  for(var key in relations){
                      var rel = relations[key];
                      rel.forEach(function(obj){
                          var relKey = obj.relKey, 
                          data;
                          if(obj.dummy){
                              data = getRelatedRecord(item,obj.relatedTo,obj.dummy);
                          }	
                          else{
                              data = item[relKey];
                          }	
                          if(data && !Array.isArray(data)){
                              data = [data];
                          }	
                          if(data){
                              data.forEach(function(_data){
                                  var pModel = _data.$.schema, pRelQ = store.$.idbQ2[pModel._name] = store.$.idbQ2[pModel._name] || [];
                                  if(_data.$.inIDB.self){
                  this.constructor.qPush(db, pModel._name, {type:"updateRecord",schema:pModel._name, data:_data.$.toJSON("idb"), customData:customData})
                                  }
                                  for(var iKey in _data.$.inIDB){
                                      var mp = _data.$.inIDB[iKey], 
                                      _relQ =  store.$.idbQ2[iKey] = store.$.idbQ2[iKey] || [];
                                      mp.forEach(function(value, pkVal){
                                          this.constructor.qPush(db, iKey, {type:"updateRecord", schema:iKey, data:store.peekRecord(iKey, pkVal).$.toJSON("idb"), customData:customData});
                                      });
                                  }
                              });
                          }
                      });
                  }
              }
              break;
              default: {
                  var idbObj = item.$.inIDB;
                  if(idbObj){
                      for(mKey in idbObj){
                          var mp = idbObj[mKey];
                          mp.forEach(function(value, key){
                              var pRec = db.cache.get({schema:db.getSchema(mKey), pK:key});
                              LyteIDB.qPush(db, mKey, {type:"updateRecord",schema:mKey,data:pRec.$.toJSON("idb"), customData:customData});
                          });
                      }
                  }
              }
          }
      }

  qPush(db, name, obj){
    var idbName = db.idbIns.name;
    obj.name = idbName;
    obj.schema = name;
    // obj.idbIns = this;
    this.constructor.q.push(obj);
    this.triggerIDBInsertion();
  }

  checkAndRemoveKey(db, rawData, fields, deserializeKeys){
    for(var key in rawData){
      var field = fields[key];
      if(field && field.type == "relation"){
        if(deserializeKeys && !checkPresenceInArray(deserializeKeys,key)){
          delete rawData[key];
        }
        else{
          this.removeNotNeededKeys(db, field.relatedTo._name, rawData[key]);
        }
      } 
    }
  }

  removeNotNeededKeys(db, name, rawData){
    var schema = db.schema[name], 
    fields = schema.fieldList, 
    deserializeKeys = schema.idb ? schema.idb.deserializeKeys : undefined,
    self = this;
    if(schema){
      var self = this;
      if(Array.isArray(rawData)){
        rawData.forEach(function(item){
          self.checkAndRemoveKey(db, item, fields, deserializeKeys);
        });
      }
      else{
        self.checkAndRemoveKey(db, rawData, fields, deserializeKeys)
      }
    }
    return rawData;
  }
}
LyteIDB.isProcessing = false;
LyteIDB.q = [];
LyteIDB.idbs = new Map();
Object.defineProperty(LyteIDB, "idbNamePrefix", {
  value: "lidb_"
});

export { LyteIDB };
