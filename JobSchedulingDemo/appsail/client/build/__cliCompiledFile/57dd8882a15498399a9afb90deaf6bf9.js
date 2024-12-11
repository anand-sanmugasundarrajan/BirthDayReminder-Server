import { Dberror, ValidationError } from "./dberror";
import { Schema as SchemaClass } from "./Schema.js";
import { cacheQuery, cacheRecordQuery, cB, cbScp, comparePk, _defProp, evAdd, evEmit, evRemove, handleCachedResponse, initCB, insertIntoStore, isDirty, isEmpty, isEmptyArray, isEmptyObj, newRecord, registerField, removeFromStore, rollBackDelete, rollBackNew, toInsertData, unRegCb, unregisterDef, updateFieldValidation, updateJSON, validateRecord, getInd, handleArrOp, compareData, getSchemaObj, getOrigParent } from "./utils.js";
import { Entity, $Entity } from "./Entity.js";
import { extendEventListeners, isEntity, getSuperClass, newGetSuperClass, prop } from "@slyte/core/src/lyte-utils";
import { DataType as DataTypeClass } from "@slyte/core";
import { Service } from "@slyte/core/src/service";
import { Connector } from "./Connector";
import { Serializer } from "./Serializer";
/*convert to custom class*/
class Db extends Service {
    // getConnector(name, type){
    //     if(type == "graphql"){
    //         return this.GraphqlConnector.connector[name];
    //     }    
    //     return this.RESTConnector.connector[name];
    // }
    // getSerializer(name, type){
    //     if(type == "graphql"){
    //         return this.GraphqlSerializer.serializer[name];
    //     }  
    //     return this.RESTSerializer.serializer[name];
    // }
    registerPattern(key, pattern){
        this.patterns[key] = pattern;
    }
    static getSchema(name){
        return this.Schema.schema[name];
    }
    static dataType(type){
        var self = this;
        class dataType extends self.DataType {}
        dataType.extends = type;
        return dataType;
    }
    static register(opts){
        var hash = opts ? opts.hash : this.name;
        var DT = this.DataType = (function() {
            class DataType extends DataTypeClass {}
            return DataType;
        })();
        DT.register = function(){
            DataTypeClass.registerInApp.apply(this, [DT]);
        }
        this.DataType.dataType = {};
        extendEventListeners(this.DataType.dataType);    
        Object.defineProperty(this, "Schema", {
            value: (function() {
                class Schema extends SchemaClass {
                }
                return Schema;
            })()
        });
        var SM = this.Schema; 
        this.Schema.schema = {};
        extendEventListeners(this.Schema.schema);
        if(SchemaClass.db && SchemaClass.db.size && SchemaClass.db.has(hash)){
            var schMap = SchemaClass.db.get(hash);
            if(schMap.size){
                schMap.forEach(function(cls, name){
                    SchemaClass.registerInDb.apply(cls, [undefined, SM]);
                    schMap.delete(name);
                });
                if(!schMap.size){
                    SchemaClass.db.delete(hash);
                }
                if(!SchemaClass.db.size){
                    delete SchemaClass.db;
                }
            }
        }
        SM.register = function(opts){
            SchemaClass.registerInDb.apply(this, [opts, SM]);
        }
        SchemaClass.addEventListener(hash, function(schCls){
            SchemaClass.registerInDb.apply(schCls, [undefined, SM]);
            if(SchemaClass.db.has(hash)){
                var schMap = SchemaClass.db.get(hash); 
                if(schMap.has(schCls.name)){
                    schMap.delete(schCls.name);
                }
                if(!schMap.size){
                    SchemaClass.db.delete(hash);
                }
                if(!SchemaClass.db.size){
                    delete SchemaClass.db;
                }
            }
        });
    }
    constructor(opts){
        super();
        var self = this, 
        appIns = this.$app || this.$addon;
        if(!this.constructor.Connector || !this.constructor.Serializer){
            Dberror.error(appIns, "Base Connector / Serializer not defined in Db class");
            return;
        }
        if(this.includeDbs){
            var subDbs = this.subDbs = [];
            var dbs = this.includeDbs();
            dbs.forEach(function(itm){
                if(newGetSuperClass(itm, false, self.constructor)){
                    subDbs.push(itm);
                }
            });
        }
        if(appIns.$ && appIns.$.modules.triggerEvent){
            appIns.$.modules.triggerEvent("add", "db", this);
        }
        _defProp(this,"Connector",{});
        _defProp(this,"Serializer",{});
        _defProp(this,"connector",{});
        _defProp(this,"serializer",{});
        _defProp(this,"schema",{});
        _defProp(this,"_schema",new Map());
        _defProp(this,"schemaless",{});
        _defProp(this,"dataType", {});
        _defProp(this,"_entity",Entity);
        var lIns = this.lyte = appIns;
        var parent = this.constructor;
        if(this.constructor.Connector && newGetSuperClass(this.constructor.Connector, false, Connector)){
            var cparentName = Object.getPrototypeOf(this.constructor.Connector).__lMod, context, defaultConnec;
            switch(cparentName){
                case "RESTConnector":
                    context = "REST";
                    break;
                case "GraphqlConnector":
                    context = "gql";
                    break;
                case "Connector":
                    defaultConnec = this.constructor.Connector;
            }
            if(context){
                this.Connector[context] = this.Connector[context] || {};
                this.Connector[context].application = this.constructor.Connector;
                this.lyte.scopedInstance(this.constructor.Connector, [this], function(ins){
                    self.connector[context] = self.connector[context] || {}; 
                    self.connector[context].application = ins;
                    self.applicationConnector = ins;
                }, [this]);
            }
            else if(defaultConnec){
                var dcparentName = defaultConnec.name, context;
                switch(dcparentName){
                    case "RESTConnector":
                        context = "REST";
                        break;
                    case "GraphqlConnector":
                        context = "gql";
                        break;
                }
                if(context){
                    class applicationConnector extends defaultConnec {
            
                    }
                    applicationConnector.register();
                    this.Connector[context] = this.Connector[context] || {};
                    this.Connector[context].application = applicationConnector;
                    this.lyte.scopedInstance(applicationConnector, [this], function(ins){
                        self.connector[context] = self.connector[context] || {}; 
                        self.connector[context].application = ins;
                        self.applicationConnector = ins;
                    }, [this]);
                }
            }
        }
        if(this.constructor.Serializer && newGetSuperClass(this.constructor.Serializer, false, Serializer)){
            var sparentName = Object.getPrototypeOf(this.constructor.Serializer).__lMod, context, defaultSerz;
            switch(sparentName){
                case "RESTSerializer":
                    context = "REST";
                    break;
                case "GraphqlSerializer":
                    context = "gql";
                    break;
                case "Serializer": 
                    defaultSerz = this.constructor.Serializer;
                    break;
            }
            if(context){
                this.Serializer[context] = this.Serializer[context] || {};
                this.Serializer[context].application = this.constructor.Serializer;
                this.lyte.scopedInstance(this.constructor.Serializer, [this], function(ins){
                    self.serializer[context] = self.serializer[context] || {}; 
                    self.serializer[context].application = ins;
                    self.applicationSerializer = ins;
                }, [this]);
            }
            else if(defaultSerz){
                var dsparentName = defaultSerz.name, context;
                switch(dsparentName){
                    case "RESTSerializer":
                        context = "REST";
                        break;
                    case "GraphqlSerializer":
                        context = "gql";
                        break;
                }
                if(context){
                    class applicationSerializer extends defaultSerz {
        
                    }
                    applicationSerializer.register();
                    this.Serializer[context] = this.Serializer[context] || {};
                    this.Serializer[context].application = applicationSerializer;    
                    this.lyte.scopedInstance(applicationSerializer, [this], function(ins){
                        self.serializer[context] = self.serializer[context] || {}; 
                        self.serializer[context].application = ins;
                        self.applicationSerializer = ins;
                    }, [this]);
                }
            }
        }
        var schemaDef = parent.Schema.schema;
        for(var key in schemaDef){
            this.schema[key] = schemaDef[key].create(this, lIns);
            this._schema.set(schemaDef[key], this.schema[key]);
        }
        var dTypeDef = parent.DataType.dataType;
        for(var dKey in dTypeDef){
            this.dataType[dKey] = dTypeDef[dKey];
        }
        this.entityStrictLock = true; //default for external release
        if(opts && opts.hasOwnProperty("entityStrictLock")){
            this.entityStrictLock = opts.entityStrictLock;
        }
        parent.Schema.Lyte = parent.DataType.Lyte = lIns;
        parent.Schema.db = parent.DataType.db = this;
        // var _Logger = lIns.lyteError || Logger; 
		this.$ = {
            toRelate:{},
            idbQ2:{}
        };
        this.cache = {
            getEntity:function getEntity(def,pKey,isDeleted){
                var args = arguments, 
                args0 = args[0], 
                isObj = typeof def == "object" && def != null,
                db = self,
                defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined, 
                _defless;
                if(isObj){
                    def = args0.schema, 
                    pKey = args0.pK, 
                    isDeleted = args0.isDeleted;
                }
                var isSchema = defless == true && typeof def == "string" ? false : (def ? (getSuperClass(def, true) === "Schema") : def);
                def = isSchema ? getSchemaObj(db, def) : def;
                var name = def && def._name ? def._name : def; 
                if( !def  ){
                    Dberror.error(appIns,"LD02","Schema ",name);
                    return;
                }
                else if(defless == true && !isSchema && name){
                    def = db.schemaless[name];
                    if(!def){
                        Dberror.error(appIns,"LD02","Schema");
                        return;	
                    }
                    _defless = true;
                }    
                if(isDeleted === true){
                    var deleted = def._deleted;
                    var obj = deleted.get(pKey);
                    if(obj && obj.data){
                        return obj.data;
                    }
                }
                else{
                    var isComp = def.isComp; 
                    pKey = (pKey == undefined) ? "" : pKey;
                    if(!isComp && def.data._recMap){
                        return def.data._recMap.get(pKey.toString());
                    }
                    else{
                        var data = def.data, entity;
                        if(_defless != true){
                            entity = data.filter(function(ins){
                                if(comparePk(ins, pKey)){
                                    return ins;
                                }
                            });
                        }
                        else{
                            entity = data.filter(function(ins){
                                if(ins[def._pK] === pKey){
                                    return ins;
                                }
                            });
                        }    
                        if(entity[0]){
                            return entity[0];
                        }
                    }
                }
                return undefined;
            },
            getAll: function getAll(def){
                var args = arguments, 
                args0 = args[0], 
                isObj = typeof def == "object" && def != null, 
                db = self,
                defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined;
                if(isObj){
                    def = args0.schema;
                }
                var isSchema = defless == true && typeof def == "string" ? false : (def ? (getSuperClass(def, true) === "Schema") : def);
                def = isSchema ? getSchemaObj(db, def) : def;
                var name = def && def._name ? def._name : def;
                if( !def  ){
                    Dberror.error(appIns,"LD02","Schema");
                    return;
                }
                else if(defless == true && !isSchema && name){
                    def = db.schemaless[name];
                    if(!def){
                        Dberror.error(appIns,"LD02","Schema ",name);
                        return;	
                    }
                }    
                return def.data;
            }
        }
        this.lyte = lIns;
        this.constructor.Schema.schema.addEventListener("add", function(name, def){
            self.schema[name] = def.create(self, lIns);
            self._schema.set(def, self.schema[name]);
        });
        this.constructor.DataType.dataType.addEventListener("add", function(name, def){
            self.dataType[name] = def;
        });
    }
    isEntity(obj){
        if(obj && obj.$ && obj.$ instanceof $Entity && obj.$.db == this){
            return true;
        }
        return false;
    }
    triggerUpdate(def, pkVal, keys, qP, customData){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, pkVal = args0.pK, keys = args0.keys, qP = args0.qP, customData = args0.customData;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19});
        }
        var name = def._name;
        var ArrayOfKeys,sendData=[],recordsArray=[];
        ArrayOfKeys = Array.isArray(pkVal)?pkVal:[pkVal]
        for(var update_Rec = 0; update_Rec<ArrayOfKeys.length ; update_Rec++){
            var ins = this.cache.getEntity(def.def, ArrayOfKeys[update_Rec])
            if(ins){
                var obj = {};
                var def = ins.$.schema,
                pK = def._arrPk,
                fields = keys || Object.keys(def.fieldList);	
                fields.forEach(function(item){
                    obj[item] = ins[item];
                });
                pK.forEach(function(item){
                    obj[item] = ins[item];
                });
                sendData.push(obj)
                recordsArray.push(ins);
            }
            else{
                return Promise.reject("No such record found");
            }
        }
        var isSingleRecord = false;
        if(!Array.isArray(pkVal)){
            sendData=sendData[0];
            recordsArray=recordsArray[0];
            isSingleRecord=true;
        }	
        return def.connector.constructor.put(this, name, sendData, recordsArray, isSingleRecord, customData, qP);
    }
    batch(arg){
		var db = this;
        return new Promise(function(resolve, reject){
            db.$.makeBatch = true;
            db.$.batch = db.$.batch || {};
            db.$.batchPromise = db.$.batchPromise || {};
            var method, 
            customData,
            bLen = (db.$.currentBatch === undefined) ? Object.keys(db.$.batch).length : (db.$.currentBatch + 1), 
            batch = db.$.currentBatch = bLen;
            if(arg && typeof arg == "function"){
                method = arg;
            }
            else if(arg && typeof arg == "object"){
                method = arg.method;
                customData = arg.customData;
            }
            try{
                method();
            }
            catch(e){
                db.$.makeBatch = false;
                throw e;
            }
            db.$.makeBatch = false;
            var payLoad = { batch:db.$.batch[batch] }, 
            argsObj = { type: "batch" }; 
            argsObj.customData = customData;
            argsObj.payLoad = payLoad;
            var urlObj = db.applicationConnector.constructor.buildURL(db, "batch", "POST", undefined, undefined, payLoad, undefined, undefined, customData, undefined, argsObj), 
            batchPl = payLoad.batch;
            if(isEmpty(batchPl)){
                if(db.$.cachedBatch && db.$.cachedBatch[batch] && db.$.cachedBatch[batch].length){
                    var finalRes = handleCachedResponse(db, batch, []);
                    return resolve(finalRes);
                }
                return resolve();					
            }
            argsObj.data = payLoad;
            var res = initCB(db,"serializer", undefined, db.applicationSerializer.constructor.SERIALIZE, {args:["batch",payLoad,undefined,customData], argsObj:argsObj});
            if(res){
                argsObj.data = payLoad = res.data;
            }
            var xhr = new XMLHttpRequest();
            argsObj.xhr = xhr;
            xhr.open("POST", urlObj.url, true);
            for(var header in urlObj.headers){
                xhr.setRequestHeader(header, urlObj.headers[header]);
            }
            xhr.withCredentials = (urlObj.withCredentials)?true:false;
            xhr.send(JSON.stringify(payLoad));
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    argsObj.xhr = xhr;
                    if(xhr.status.toString()[0] == "2" || xhr.status.toString()[0] == "3"){
                        var resp = JSON.parse(xhr.responseText);
                        db.$.batchResponse = db.$.batchResponse || {};
                        db.$.batchResponse[batch] = [];
                        db.applicationConnector.constructor.handleBatchPromise({db:db,response:resp,batch:batch,resolve:resolve, argsObj:argsObj});
                        setTimeout(function(){
                            var finalRes = handleCachedResponse(db, batch, db.$.batchResponse[batch]);
                            resolve(finalRes);
                            db.$.batchResponse[batch] = [];
                        },0);
                    }
                    else{
                        db.$.batchResponse[batch] = [];
                        db.applicationConnector.constructor.handleBatchPromise({db:db,batch:batch,resolve:resolve,fail:true, argsObj:argsObj});
                        setTimeout(function(){
                            var finalRes = handleCachedResponse(db, batch, db.$.batchResponse[batch]);
                            reject(finalRes);
                        },0);
                    }
                }
            }					
        });
    }
    push(def,data,deserialize,index){
        var args = arguments, 
        args0 = args[0], 
        isObj = typeof def == "object" && def != null,
        db = this,
        defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined; 
        if(isObj){
            def = args0.schema, 
            data = args0.data, 
            deserialize = args0.deserialize;
            index = args0.index;
        }
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        def = defless && typeof def === "string" ? def : getSchemaObj(this, def);
        var name = def && def._name ? def._name : def, 
        result = data, 
        len;
        if(deserialize){
            data = def.serializer.constructor.buildJSON(db,def,"pushPayload",data);
            var scope = cbScp(db, def.serializer, def.serializer.constructor.DESERIALIZEKEY, "serializer");
            len = data ? Object.keys(data).length : undefined;
            if(scope){
                Dberror.warn(this.lyte, "LD08", "deserializeKey", "callback", "Please use payloadKey callback instead");
                if(len > 2){
                    Dberror.error(this.lyte, "LD09");
                }
                var keys = Object.keys(data), ind = 0;
                if(keys.length == 2 && keys[0] == "meta"){
                    ind = 1;
                }
                var argsObj = { type: "pushPayload", schemaName: name};
                var deserializeKey = cB(scope, [argsObj]), rec = data[keys[ind]];
                delete data[keys[ind]];
                data[deserializeKey] = rec;
                
            }
            result = data[name];
        }
        // if(db.idbIns){
        //     db.idbIns.idbQ2Push(this,name,data,undefined,"pushPayload");
        // }
        data = insertIntoStore(
            this,
            def.def ? def.def : def,
            result,
            true,
            undefined,
            undefined,
            index,
            true
        );
        var nData = data || [];
        if(!Array.isArray(nData)){
            nData = [nData];
        }
        var idb = def && def.hasOwnProperty("idb");
        nData.forEach(function(itm){
            if(isEntity(itm)){
                if(idb){
                    db.idbIns.idbQ2Push(db,name,itm,undefined,"pushPayload");
                }
                if(!itm.$.isError){
                    if(itm.$.inIDB && Object.keys(itm.$.inIDB).length){
                        db.dbIns.updateRelationsIDB(itm, itm.$.model.relations);
                    }
                }
            }
        });

        def ? delete def.rel : undefined;
        return data;
    }
    unregisterSchema(data){		
		var self = this;
		if(Array.isArray(data)){
			data.forEach(function(item){
				unregisterDef(self, item);
			});
		}
		else{
			unregisterDef(self, data);
		}
    }
    unregisterConnector(data){
        if(Array.isArray(data)){
            data.forEach(function(item){
                unRegCb(this, "connector", item);
            });
        }	
        else{
            unRegCb(this, "connector", data);
        }		
    }
    unregisterSerializer(data){
        if(Array.isArray(data)){
            data.forEach(function(item){
                unRegCb(this, "serializer",item);
            });
        }
        else{
            unRegCb(this,"serializer",data);
        }
    }
    addField(def, key, type, options, skipValidation, deserialize){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, key = args0.key, type = args0.prop ? args0.prop : args0.type, options = args0.options, skipValidation = args0.skipValidation, deserialize = args0.deserialize;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        if(key === "$"){
            Dberror.error(this.lyte, "$ is a reserved key, which cannot be used as the field name");
            return;
        }
        var fieldType, obs = [];
        if(type && typeof type == "object"){
            registerField(this,def,key,type,obs);
            if(type.type == "relation"){
                fieldType = "relation"
            }
            else{
                fieldType = "attr"; 
            }
            var deserialize = arguments[4],
            skipValidation = arguments[3];
        }
        else{
            var field = prop(type,options);
            registerField(this,def,key,field,obs);
        }
        if(fieldType != "relation"){
            if(!skipValidation || deserialize){
                updateFieldValidation(this, def, key, deserialize, skipValidation);
            }
        }
    }
    getSchemaObj(name){
        var schema = this.schema[name];
        if(!schema && this.subDbs){
            var len = this.subDbs.length;
            for(var i=0; i<len; i++){
                var subDb = this.subDbs[i];
                if(subDb.schema[name]){
                    schema = subDb.schema[name];
                    break;
                }
            }
        }
        return schema;
    }
    getSchema(name){
        var schema = this.schema[name];
        if(!schema && this.subDbs){
            var len = this.subDbs.length;
            for(var i=0; i<len; i++){
                var subDb = this.subDbs[i];
                if(subDb.schema[name]){
                    schema = subDb.schema[name];
                    break;
                }
            }
        }
        return schema && schema.def? schema.def : schema;
    }
    hasSchema(name){
        // return this.schema.hasOwnProperty(name);
        var hasSchema = this.schema.hasOwnProperty(name);
        if(!hasSchema && this.subDbs){
            var len = this.subDbs.length;
            for(var i=0; i<len; i++){
                var subDb = this.subDbs[i];
                if(subDb.schema[name]){
                    hasSchema = subDb.schema.hasOwnProperty(name);
                    break;
                }
            }
        }
        return hasSchema;
    }
    getSerializerObj(name, type){
        // return this.serializer[name];
        type = type == "graphql" ? "gql" : type;
        var sObj = type ? this.serializer[type] : this.serializer.REST;
        if(sObj){
            var serializer = sObj[name];
            if(!serializer && this.subDbs){
                var len = this.subDbs.length;
                for(var i=0; i<len; i++){
                    var subDb = this.subDbs[i];
                    if(subDb.serializer[name]){
                        var ssObj = type ? subDb.serializer[type] : subDb.serializer.REST;
                        serializer = ssObj[name];
                        break;
                    }
                }
            }
            return serializer;
        }
    }
    getConnectorObj(name, type){
        // return this.connector[name];
        type = type == "graphql" ? "gql" : type;
        var cObj = type ? this.connector[type] : this.connector.REST;
        if(cObj){
            var connector = cObj[name];
            if(!connector && this.subDbs){
                var len = this.subDbs.length;
                for(var i=0; i<len; i++){
                    var subDb = this.subDbs[i];
                    if(subDb.connector[name]){
                        var scObj = type ? subDb.connector[type] : subDb.connector.REST;
                        connector = scObj[name];
                        break;
                    }
                }
            }
            return connector;
        }
    }
    newEntity(def, opts, skipValidation){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, opts = args0.data, skipValidation = args0.skipValidation;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte, "LD02","Schema");
            return;
        }
        // skipValidation = skipValidation == undefined ? true : skipValidation;
        var name = def._name;
        return newRecord(this, def, opts, skipValidation);
    }
    deleteEntity(def, key){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, key = args0.pK;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        removeFromStore(def, key, undefined);
    }
    getEntity(def, key, queryParams, cQuery, cacheData, customData, drop, forceFetch, index, methodType, oprName, variables){
        var args = arguments, 
        args0 = args[0], 
        isObj = typeof def == "object" && def != null,
        db = this,
        appIns = this.$app || this.$addon;
        if(isObj){
            def = args0.schema, 
            key = args0.pK, 
            queryParams = args0.qP, 
            cQuery = args0.cacheQuery, 
            cacheData = args0.cacheData, 
            customData = args0.customData;
            drop = args0.drop,
            forceFetch = args0.forceFetch, 
            index = args0.index;
            oprName = args0.gqlQuery;
            variables = args0.gqlVariables;
        }
        var name = def ? def._name : undefined;
        def = typeof def === "string" ? def : getSchemaObj(this, def);
        var connec = def && def.connector ? def.connector.constructor : db.applicationConnector.constructor; 
        var prm = connec.get(this,methodType ? methodType : "getEntity",def,key,queryParams,cQuery,customData,cacheData,drop,forceFetch,oprName,variables);
        var gPrm = prm.then(function(){
            var data = arguments[0][0], 
            fromCache = arguments[0][1] == "cache" ? true : false,
            xhr = arguments[0][2],
            status = xhr ? xhr.status : arguments[0][3],
            batchObj = (arguments[0][1] == "batch") ? arguments[0][2] : undefined,
            fromIDB = (arguments[0][1] == "idb") ? true : false,
            schema = def, 
            defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined, 
            isDefinedSchema = (typeof schema !== "string" ? (getSuperClass(schema ? schema.def : undefined, true) === "Schema") : false),
            name = isDefinedSchema ? schema._name : defless ? schema : undefined,
            toCacheParams = (cQuery && cQuery !== true) ? cQuery : (cQuery === true && queryParams && typeof queryParams == "object" && Object.keys(queryParams).length ) ? queryParams : undefined,
            _defless;
            
            if(!isDefinedSchema  && cacheData == undefined){
                cacheData = false;
            }
            else if(defless && !isDefinedSchema && cacheData == true){
                _defless = true;
            }  
            if(cacheData !== undefined && typeof cacheData == "object" && cacheData !== null){
                cacheData = cacheData.hasOwnProperty("cache") ? cacheData.cache : true;
            }
            if(cacheData === false){
                if(!fromCache && toCacheParams){
                    if(key != undefined){
                        cacheRecordQuery(db, name, key, toCacheParams, data, status);
                    }
                    else{
                        cacheQuery(db, name, toCacheParams, data, status);
                    }
                }
                if(batchObj != undefined){
                    db.$.batchResponse[batchObj.batch][batchObj.index] = data;
                }
                return data;
            }
            if(data){
                if(!fromCache){
                    var isEmp;
                    if(!data || !data.hasOwnProperty(name)){
                        Dberror.error(db.lyte, "LD13", "get",name, (",key-"+(typeof key == "object"? JSON.stringify(key):key)+(queryParams && typeof queryParams == "object" ? ", queryParams-"+JSON.stringify(queryParams)+"":"")), isEntity(data) ? data: JSON.stringify(data));
                        return;
                    }						
                    // if(!fromIDB && db.idbIns){
                    //     db.idbIns.idbQ2Push(db,name,data,queryParams,methodType ? methodType : "getEntity", key); 
                    // }
                    if(!isEntity(data)){
                        var payLoad = data[name], pload;
                        if(key !== undefined){
                            if(isEmpty(payLoad) || isEmptyObj(payLoad)){
                                pload = data[name] = {};
                                isEmp = true;
                            }
                            if(typeof payLoad != "object" || Array.isArray(payLoad)){
                                Dberror.warn(db.lyte,"LD11");
                            }
                        }
                        else{
                            if(payLoad === undefined || payLoad === null || isEmptyArray(payLoad)){
                                pload = data[name] = [];
                                isEmp = true;
                            }
                            else if(!Array.isArray(payLoad)){
                                Dberror.warn(db.lyte,"LD19");
                            } 
                        }
                        if(!isEmp){
                            var defnd = _defless ? "id" : undefined,
                            ind = _defless && index != undefined ? index : defnd;
                            if(key !== undefined){
                                pload = insertIntoStore(db, schema.def ? schema.def : schema, payLoad, true, true, undefined, ind);
                                data[name] = pload;
                            }
                            else{
                                pload = toInsertData(db, schema.def ? schema.def : schema, data,true,ind);
                                data[name] = pload;
                            }
                            var nRec = pload;
                            if(pload && !Array.isArray(pload)){
								nRec =[pload];
							}
                            if(!fromIDB && db.idbIns && ((nRec && !nRec.$) || (pload && pload.$ && !pload.$.isError))){
								if(def && def.hasOwnProperty('idb')){
									db.idbIns.idbQ2Push(db, name, nRec, queryParams, methodType ? methodType : "getEntity", undefined, undefined, customData);
								}
								nRec.forEach(function(itm){
									if(itm && itm.$ && itm.$.inIDB && Object.keys(itm.$.inIDB).length){
										db.idbIns.updateRelationsIDB(itm, itm.$.model.relations);
									}
								});
							}
                            if(fromIDB && Array.isArray(nRec) && nRec.length){
                                nRec.forEach(function(itm){
                                    db.idbIns.constructor.changeIDBState(db, itm);
                                });
                            }
                        }
                        if(data.hasOwnProperty("meta")){
                            if(!isEntity(pload) && !data[name].$){
                                data[name].$ || _defProp(data[name], "$", {});
                            }
                            var p$ = pload.$ ? pload.$ : _defProp(pload, "$", {});
                            p$.meta = data.meta;
                        }
                    }
                    if(!fromCache && toCacheParams){
                        if(key !== undefined){
                            cacheRecordQuery(db, name, key, toCacheParams, data);
                        }
                        else{
                            cacheQuery(db, name, toCacheParams, data);								
                        }
                    }						
                }
                if(batchObj != undefined){
                    db.$.batchResponse[batchObj.batch][batchObj.index] = data[name];
                }
                if(connec.returnData == "new"){
                    var obj = {};
                    obj.data = data[name];
                    if(data.meta){
                        obj.meta = data.meta;
                    }
                    if(status !== undefined){
                        obj.status = status;
                    }
                    return obj;
                }
                return data[name];	
            }
            return arguments;
        }, function(e){
            return Promise.reject(e);
        });
        if(prm.xhr){
            gPrm.xhr = prm.xhr;
        }
        return gPrm;
    }
    getAll(def, queryParams, cQuery, cacheData, customData, drop, forceFetch, index, oprName,variables ){
        return this.getEntity(def, undefined, queryParams, cQuery, cacheData, customData, drop, forceFetch, index, "getAll", oprName,variables)
    }
    ajax(obj){
        var defless = this.Connector.REST.application ? this.Connector.REST.application.prototype.schemaless : undefined;
        if(defless != true){
            return Promise.reject("Schemaless behaviour is not enabled. Please enable it to make db.ajax call for not defined schemas");
        }
        if(!obj.schema){
            return Promise.reject("Schema name is mandatory for db.ajax");
        }
        if(!obj.type){
            return Promise.reject(obj.type+" is not a valid HTTP method");
        }
        var def = typeof obj.schema === "string" ? this.schema[obj.schema] : undefined;
        if(def || (getSuperClass(obj.schema) === Object.getPrototypeOf(this.constructor.Schema))){
            return Promise.reject(obj.schema+" is a defined schema. db.ajax is supported only for a schema which is not defined");
        }
        var nObj = Object.assign({}, obj);
        nObj.db = this;
        return this.applicationConnector.constructor.handleAjax(nObj);
    }
    deleteMany(def, pK){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, pK = args0.pK;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        removeFromStore(def, pK, undefined);
    }
    dropEntity(def, key){
        var args = arguments, 
        args0 = args[0], 
        isObj = typeof def == "object" && def != null,
        db = this,
        defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined, 
        _defless; 
        if(isObj){
            def = args0.schema, key = args0.pK;
        }
        def = defless && typeof def === "string" ? def : getSchemaObj(this, def);
        var parentRel = args[2];
        var schema = def;
        if( !def  ){
            Dberror.error(db.lyte,"LD02","Schema");
            return;
        }
        else if(defless == true && typeof def == "string"){
            var name = def;
            schema = db.schemaless[def];
            if(!schema){
                Dberror.error(db.lyte,"LD02","Schema ",name);
                return;	
            }
            _defless = true;
        }

        if(key == undefined){
            Dberror.warn(db.lyte,"LD18","key");
        }
        var cls = def && def.def ? def.def : def; 
        var data = this.cache.getEntity(cls, key),
        pkVal;
        if(_defless == true){
            var ind = getInd(schema.data, schema._pK, key);
            if(ind != -1){
                handleArrOp(this.lyte, schema.data, "removeAt", undefined, ind, 1);
            }
        }
        else if(data){
            pkVal = data.$.pK;
            removeFromStore(schema, pkVal, true, true, undefined, undefined, true, parentRel);
            def._deleted.delete(key);
            var crq = this.schema.cachedRecordQueries;
            if(crq && crq[name] && crq[name][key]){
                crq[name][key] = [];
            }
            var cqueries = db.schema.cachedQueries;	
            if(cqueries){
                var n=def._name, Nm = cqueries[n];
                if(Nm && Nm.length){
                    for(var i=Nm.length-1; i>=0; i--){
                        var obj = Nm[i];
                        if(obj && obj.data){
                            var ind = obj.data[n].indexOf(data);
                            if(ind != -1){
                                Nm.splice(i, 1);
                            }							
                        }
                    }					
                }
            }
        }
    }
    dropAll(def, arr){
        var args = arguments, 
        args0 = args[0], 
        isObj = typeof def == "object" && def != null,
        db = this,
        defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined, 
        _defless;
        if(isObj){
            def = args0.schema, arr = args0.data;
        }
        def = defless && typeof def === "string" ? def : getSchemaObj(this, def);
        var name = def ? def._name: undefined, schema = def;
        if( !def  ){
            Dberror.error(db.lyte,"LD02","Schema");
            return;
        }
        else if(defless == true && typeof def == "string"){
            var name = def;
            schema = db.schemaless[def];
            if(!schema){
                Dberror.error(db.lyte,"LD02","Schema ",name);
                return;	
            }
            _defless = true;
        }
        var keys = [], 
        cls = def && def.def ? def.def : def,
        data = arr || this.cache.getAll(cls);
        if(_defless == true){
            handleArrOp(this.lyte, schema.data, "removeAt", undefined, 0, schema.data.length);
        }
        else{
            if(data){
                for(var i=0; i<data.length; i++){
                    keys.push(data[i].$.pK);
                }				
            }
            removeFromStore(schema, keys, true, true, undefined, undefined, true);
            this.schema[name].dirty = [];
            this.schema[name]._deleted = new Map();
            var cq = this.schema.cachedQueries;
            if(cq && cq[name]){
                cq[name] = [];
            }
			var crq = this.schema.cachedRecordQueries; 
			if(crq && crq[name]){
				crq[name] = [];
			}
        }
    }
    triggerAction(def,actionName,customData,qP,method,data){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, actionName = args0.action, qP = args0.qP, customData = args0.customData, method = args0.method, data = args0.data;
        }
        def = getSchemaObj(this, def);
        if(!def){
            Dberror.error(this.lyte,"LD02","Schema");
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19});
        }
        var actions = def.actions, action = (actions)?def.actions[actionName]:undefined;
        if(action){
            return def.connector.constructor.handleAction(this,actionName,def,this.cache.getAll(def.def),customData,qP,method,data).then(function(data){
                return data;
            },function(err){
                return Promise.reject(err);
            });
        }
        else{
            return Promise.reject({code : "ERR18", message : Dberror.errorCodes.ERR18});
        }
    }
    revert(def){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def=args0.schema;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        var name = def._name;
        var pK = def._pK, self = this, 
        dirty = Array.from(def.dirty),
        len = dirty.length;
        for(var i=0; i<len; i++){
            var rec = self.cache.getEntity(def.def, dirty[i]);
            if(rec && rec.$.isDeleted){
                continue;
            }
            else if(rec && rec.$.isNew){
                rollBackNew(def, rec, pK);
            }                                
            else if(rec && rec.$.isModified){
                rec.$.revertProps(rec.$.getDirtyProps());
            }
        }
        rollBackDelete(def, undefined, true);
    }
    create(def, data, customData, qP, toFilterRecords, mutationName){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, data = args0.data, customData = args0.customData, qP = args0.qP, toFilterRecords = args0.toSendData, 
            mutationName = args0.mutationName;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema ");
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19});
        }
        var name = def._name;
        if(Array.isArray(data)){
            var self = this;
            data.forEach(function(item){
                var resp = newRecord(self, def, item);
                if(resp.$.isError){
                    return Promise.reject(resp);
                }
            });
        }
        else if(data && typeof data == "object"){
            var self = this;
            var resp = newRecord(self, def, data);
            if(resp.$.isError){
                return Promise.reject(resp);
            }				
        }
        var dirty = def.dirty, len = dirty.length, created = [], err;
        for(var i=0; i<len; i++){
            var rec = this.cache.getEntity(def.def, dirty[i]);
            if(rec && rec.$.isNew){
                if(toFilterRecords && toFilterRecords.indexOf(rec) == -1){
                    continue;
                }	
                err = new ValidationError(def.lyte);
                validateRecord(this, rec, def.fieldList);
                if(rec.$.isError && Object.keys(rec.$.error).length > 0){
                    return Promise.reject(err);
                }
                created.push(rec);
            }
        }
        if(created.length){
            return Connector.create(this, name, created, false, customData, qP, mutationName);
        }
        return Promise.resolve();
    }
    update(def, customData, qP, toFilterRecords, mutationName){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, qP = args0.qP, customData = args0.customData, toFilterRecords = args0.toSendData, 
            mutationName = args0.mutationName;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19});
        }
        var changed = [], 
        name = def._name,
        db = def.db,
        recordsChanged = [],
        records = toFilterRecords || db.cache.getAll(def.def),
        rels = def.relations,
		self = this;
        records.forEach(function(item){
            if(item.$.schema === def ){
                var rec = item,
                dirty = isDirty(self, rec, rels);
                if((rec && rec.$.isModified && !rec.$.isNew) || (dirty && dirty.length)){
                    var obj = updateJSON(self, rec, def, dirty);
                    changed.push(obj);
                    recordsChanged.push(rec);
                }
            }
        });
        if(changed.length){
            return Connector.put(this, name, changed, recordsChanged,false, customData, qP, mutationName);
        }
        return Promise.resolve();
    }
    delete(def, key, customData, qP, toFilterRecords, mutationName){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null; 
        if(isObj){
            def = args0.schema, key = args0.pK, qP = args0.qP, customData = args0.customData, toFilterRecords = args0.toSendData, 
            mutationName = args0.mutationName;
        }
        def = getSchemaObj(this, def);
        if( !def  ){
            Dberror.error(this.lyte,"LD02","Schema");
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19});
        }
        var name = def._name;
        if(key){
            this.deleteEntity(name, key);				
        }
        var deleted = [];
        def._deleted.forEach(function(itm, idx){
            deleted.push(itm.data);
        });
        if(toFilterRecords){
            var newDel = [];
            toFilterRecords.forEach(function(itm){
                var ind = deleted.indexOf(itm);
                if(ind != -1){
                    newDel.push(itm);
                }
            });
            deleted = newDel;
        }
        if(deleted.length){
            var prm = Connector.del(this, name, deleted,undefined,"delete",customData,qP,mutationName);
            return prm.then(function(resp){
                return resp;
            }, function(e){
                return Promise.reject(e);
            });
        }
        return Promise.resolve();
    }
    clearCachedQuery(def, key, cacheQuery){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null, qP; 
        if(isObj){
            def = args0.schema, key = args0.pK, qP = cacheQuery = args0.cacheQuery;
            // key = (key == undefined && queryParams && typeof queryParams == "object") ? queryParams : key;
        }
        else{
            if( key && typeof key == "object"){
                qP = key;
                key = undefined;
            }
            else if(cacheQuery && typeof cacheQuery == "object"){
                qP = cacheQuery;
            }
        }
        def = getSchemaObj(this, def);
        // var qP = key && typeof key == "object" ? key : queryParams && typeof queryParams == "object" ? queryParams : undefined,
        var cachedQueries = [];
        if(!qP){
            if(def && def._name){
                var cq = this.schema.cachedQueries;
                var crq = this.schema.cachedRecordQueries;
                cq && cq.hasOwnProperty(def._name) ? delete cq[def._name] : undefined;
                crq && crq.hasOwnProperty(def._name) ? ( key ? delete crq[def._name][key] : delete crq[def._name] )  : undefined;
            }
            else{
                this.schema.cachedQueries = [];
                this.schema.cachedRecordQueries = {};
            }
            return;
        }
        if(qP){
            if(key == undefined){
                var cq = this.schema.cachedQueries;
                if(cq && cq[def._name]){
                    cachedQueries = cq[def._name];
                }
            }
            else{
                var crq = this.schema.cachedRecordQueries;
                if(crq && crq[def._name] && crq[def._name][key]){
                    cachedQueries = crq[def._name][key];
                }
            }
            for(var i=0; i<cachedQueries.length; i++){
                if(compareData(cachedQueries[i].cacheQuery, qP, true)){
                    cachedQueries.splice(i, 1);
                    break;
                }
            }
        }
    }
    getErrorMessage(code){
        var args = arguments, args0 = args[0], isObj = typeof code == "object" && code != null; 
        if(isObj){
            code = args0.code;
        }
        return Dberror.errorCodes[code];
    }
    setErrorMessages(obj){
        Object.assign(Dberror.errorCodes, obj);
    }
    addEventListener(type,func){
        var args = arguments, args0 = args[0], isObj = typeof type == "object" && type != null; 
        if(isObj){
            type = args0.type, func = args0.func;
        }
        return evAdd(this,type,func);
    }
    removeEventListener(id){
        var args = arguments, args0 = args[0], isObj = typeof id == "object" && id != null; 
        if(isObj){
            id = args0.id;
        }
        evRemove(this,id);
    }
    emit(type,args){
        var _args = arguments, args0 = _args[0], isObj = typeof type == "object" && type != null; 
        if(isObj){
            type = args0.type, args = args0.args;
        }
        evEmit(this,type,args);
    }
    getPrimaryKey(def){
        var args = arguments, args0 = args[0], isObj = typeof def == "object" && def != null;
        if(isObj){
            def = args0.schema;
        }
        def = getSchemaObj(this, def);
        if(!def){
            Dberror.error(this.lyte,"LD02","Schema");
            return;
        }
        return def._pK;
    }
    getDirtyEntities(def , filters , deepNest){
        var isObj = typeof def == "object" ? true : false; 
        if(isObj){
            var args = arguments[0];
            def = args.schema;
            filters = args.filters;
            deepNest = args.deepNest;
        }
        var model = getSchemaObj(this, def);
        if(!model){
            Dberror.warn("LD02","schema ",def._name);
            return;
        }
        var DirtyKeys = model.dirty,dirtyRecords=[],dirty={isNew :[],isModified :[],isDeleted :[]};
        for(var i_dirty = 0 ; i_dirty<DirtyKeys.length; i_dirty++){
            var record = this.cache.getEntity(def,DirtyKeys[i_dirty]);
            if(record){
                record.$.isNew?dirty.isNew.push(record):dirty.isModified.push(record);
            }
        }
        if(model._deleted.size){
            var deletedRecord = model._deleted
            deletedRecord.forEach(function(value){
                dirty.isDeleted.push(value.data);
            })
        }
        if(model.dirty || model._deleted.size){
            if(filters == undefined || filters == true){
                dirtyRecords=dirtyRecords.concat(dirty.isNew,dirty.isModified,dirty.isDeleted);
            }
            if(Array.isArray(filters)){
                filters.forEach(function(value){
                    dirtyRecords=dirtyRecords.concat(dirty[value]);
                })
            }
            if(typeof filters == "string"){
                dirtyRecords = dirty[filters];
            }
        }
        if(deepNest){
            var records =this.cache.getAll(def);
            records.forEach(function(rec){
                if(rec.$.isDirty() && !dirtyRecords.includes(rec)){
                    dirtyRecords.push(rec);
                }
            });
        }
        return dirtyRecords;
    }
}

Db.__lMod = "Db";
Db.ConnectorCls = Connector;
Db.SerializerCls = Serializer;

export { Db, Dberror, ValidationError};
