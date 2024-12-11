import { getFromCB, initCB, addToCachedBatch, cbScp, cB, initPartialObj, toJSON, compareData } from "./utils.js";
import { RESTSerializer } from "./RESTSerializer.js";
import { isEntity } from "@slyte/core/src/lyte-utils";
import { Connector } from "./Connector.js";
/*convert to custom class*/
class RESTConnector extends Connector {
    static register(parent){
    }
    constructor(db){
        super();
        this.host = window.location.origin ? window.location.origin : window.location.protocol+"//"+window.location.host;
        this.namespace = "";
        this.actionNamespace = "action";
        this.batchNamespace = "batch";
        this.__type = "REST";
        var lIns = db.lyte, 
        name = this.constructor._name;
        Object.defineProperty(this,'$lg', {
            value : lIns.__gl
        });   
        if(!db.getConnectorObj(name)){
            db.connector.REST = db.connector.REST || {}; 
            db.connector.REST[this.constructor._name] = this; 
        }
    }

    // static sendXHR(db,name,type,key,urlObj,customData,argsObj,opts){
    //     var xhr = new XMLHttpRequest();
    //     var prm = new Promise(function(res, rej){
    //         argsObj.xhr = xhr;
    //         xhr.open(urlObj.method, urlObj.url, true);
    //         for(var header in urlObj.headers){
    //             xhr.setRequestHeader(header, urlObj.headers[header]);
    //         }
    //         if(urlObj.data !== undefined && ( urlObj.headers && !urlObj.headers.hasOwnProperty("Content-Type") && urlObj.method !== "GET")){
    //             xhr.setRequestHeader("Content-Type", "application/json");
    //         }
    //         xhr.withCredentials = (urlObj.withCredentials)?true:false;
    //         initCB(db,"connector", name, RESTConnector.PARSEREQUEST, { argsObj: argsObj, args:[type, name, xhr ,urlObj ? urlObj.qP : undefined, key, customData]});
    //         db.emit("beforeRequest", [xhr, name, type, key, urlObj.qP]);
    //         xhr.send(urlObj.data);
    //         xhr.onreadystatechange = function(){
    //             if(xhr.readyState == 4){
    //                 db.emit("afterRequest",[xhr, name, type, key, urlObj.qP]);
    //                 argsObj.status = xhr.status;
    //                 RESTConnector.processResponse(db, xhr, type, name, argsObj, urlObj, key, customData, opts).then(function(data){
    //                     return res({data:data, xhr:xhr});
    //                 }, function(err){
    //                     return rej({data:err, xhr:xhr});
    //                 });
    //             }
    //         }
    //     });
    //     prm.xhr = xhr;
    //     return prm;
    // }
    static getHost(db, connector){
        
    }
    static buildURL(db,type,method,def,key,snapshot,queryParams,actionName,customData,url,argsObj){
        var adapter, name;
        if(def !== undefined){
            adapter = def.connector, name = def._name;
        }
        var schemaless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined;
        if(typeof def == "string" && schemaless){
            name = def;
        }
        var host = getFromCB(db,"connector",adapter,"host"), 
        url = url || "", 
        makeBatch = db.$.makeBatch;
        argsObj.host = host;
        if(!url){
            if(!makeBatch){
                if(host !== undefined){
                    url += host;
                    if(host[host.length-1] != "/"){
                        url+="/";					
                    }
                }
            }
            var namespace = getFromCB(db,"connector",adapter,"namespace");
            if(namespace !== "" && namespace[namespace.length-1] != "/"){
                url+=namespace+"/";
                argsObj.namespace = namespace;
            }
            else{
                url+=namespace;
            }
            if(type != "batch"){
                if(def.endPoint){
                    url +=def.endPoint
                }
                else{
                    url+=name;
                }
                if(key && typeof key != "object"){
                    url+="/"+key;
                }	
            }
            if(type == "action" && def){
                var actionNamespace = getFromCB(db,"connector",adapter,"actionNamespace");
                if(actionNamespace !== "" && actionNamespace[actionNamespace.length-1] != "/"){
                    url+="/"+actionNamespace;
                }
                else{
                    url+=actionNamespace;
                }
                // url+="/"+getFromCB(db,"connector",adapter,"actionNamespace");
                var actions = def.actions, action = actions[actionName].endPoint ? actions[actionName].endPoint : actionName;
                url+="/"+action;
                argsObj.actionName = action;
            } else if(type == "batch"){
                url+=getFromCB(db,"connector",undefined,"batchNamespace");
            }
        }
        if(!queryParams){
            queryParams = {};
        }
        var ret = {method : (method)? method : ""}, res;
        argsObj.url = url;
        argsObj.method = ret.method;
        argsObj.queryParams = queryParams;
        res = initCB(db,"connector", adapter, RESTConnector.REQUESTHEADERS, { argsObj: argsObj, args:[type, queryParams, customData, actionName, key]});
        if(res){
            ret.headers = res.data;
        }
        argsObj.headers = ret.headers;
        argsObj.cachedData = snapshot;
        res = initCB(db,"connector", adapter, RESTConnector.REQUESTURL, { argsObj: argsObj, args:[name, type, queryParams, snapshot, url,actionName,customData, key]});
        if(res){
            url = res.data;
        }
        argsObj.url = url;
        res = initCB(db,"connector", adapter, RESTConnector.REQUESTMETHOD, { argsObj: argsObj, args:[method, type, queryParams, customData, actionName, key]});
        if(res){
            ret.method = res.data;
        }
        argsObj.method = method;
        if(!makeBatch && Object.keys(queryParams).length){
            url+="?";
            var index = 0;
            for(var qKey in queryParams){
                if(index !== 0){
                    url+="&";
                }
                var res = queryParams[qKey];
                if(res && typeof res == "object"){
                    res = JSON.stringify(res);
                }
                url+=qKey+"="+encodeURIComponent(res);
                index++;
            }
        }
        if(adapter && adapter.withCredentials == true){
            ret.withCredentials = true;
        }
        ret.url = url;
        ret.qP = queryParams;
        return ret;
    }
    static get(db, type, def, key, queryParams, cacheQuery, customData, cacheData, unload, forceFetch){
        var name = def && def._name ? def._name : def, 
        argsObj = { type: type, schemaName : name, queryParams: queryParams, opts:{cacheData:cacheData !== undefined ? cacheData : true, cacheQuery:cacheQuery!== undefined ? cacheQuery : false, unload: unload!==undefined?unload:false, forceFetch: forceFetch!==undefined?forceFetch:false }, customData: customData, key: key}, 
        mdl = def,
        makeBatch = db.$.makeBatch, 
        defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined;
        if(defless && typeof def == "string"){
            var defobj = db.schemaless, _name = def; 
			def = defobj[_name] = defobj[_name] || {};
            def._name = _name;
        }
        if(mdl || ( typeof mdl == "string"  && defless === true)){
            RESTConnector.getConnector(db, def, argsObj, defless);
            RESTConnector.getSerializer(db, def, argsObj, defless);
            if(unload){
                if(key !== undefined){
                    db.dropEntity(def.def, key);
                }
                else{
                    db.dropAll(def.def);
                }
            }
            customData = customData == undefined ? getFromCB(db,"connector", mdl.connector, "customData") : customData;
            var urlObj = this.buildURL(db, type, "GET", def, key, undefined, queryParams,undefined,customData,undefined,argsObj), 
            self = this,
            queryParams = urlObj.qP, 
            toCheckParams = (cacheQuery && typeof cacheQuery !== "boolean") ? cacheQuery : (queryParams && typeof queryParams == "object") ? queryParams : undefined;
            if(key == undefined && toCheckParams && db.schema.cachedQueries && db.schema.cachedQueries[name] && !forceFetch){
                var cachedQueries = db.schema.cachedQueries[name], 
                sendData;
                for(var i=0; i<cachedQueries.length; i++){
                    var qry = cachedQueries[i];
                    if(!qry.hasDeletedRecords){
                        var params = qry.cacheQuery;
                        if(compareData(params, toCheckParams, true)){
                            sendData = [qry.data, "cache", undefined, qry.status];
                            break;
                        }
                    }
                }
                if(sendData){
                    return new Promise(function(resolve){
                        if(makeBatch){
                            addToCachedBatch(db,Array.isArray(sendData) ? sendData[0][name] : sendData);
                        }
                        resolve(sendData);
                    });
                }
            }
            else if(key !== undefined && toCheckParams && db.schema.cachedRecordQueries && db.schema.cachedRecordQueries[name] && db.schema.cachedRecordQueries[name][key] && !forceFetch){
                var cachedQueries = db.schema.cachedRecordQueries[name][key], 
                sendData;
                for(var i=0; i<cachedQueries.length; i++){
                    var params = cachedQueries[i].cacheQuery;
                    if(compareData(params, toCheckParams, true)){
                        sendData = [cachedQueries[i].data, "cache", undefined, cachedQueries[i].status];
                        break;
                    }
                }
                if(sendData){
                    return new Promise(function(resolve){
                        if(makeBatch){
                            addToCachedBatch(db,Array.isArray(sendData) ? sendData[0][name] : sendData);
                        }
                        resolve(sendData);
                    });
                }
            }
            else if(!forceFetch){
                var scope = cbScp(db, def.connector, type == "getAll" ? RESTConnector.REFETCHALL : RESTConnector.REFETCH, "connector");
                if(scope){
                    var data, callRefetch = false;
                    if(key !== undefined){
                        data = db.cache.getEntity(mdl.def,key);		
                        callRefetch = isEntity(data) ? true : false; 					
                    }
                    else{
                        data = db.cache.getAll(mdl.def);
                        callRefetch = data && data.length ? true : false;
                    }
                    argsObj.cachedData = data;
                    if(callRefetch && !cB(scope, [argsObj])){
                        var toRet = {};
                        toRet[name] = data;
                        return new Promise(function(resolve){
                            if(makeBatch){
                                addToCachedBatch(db,toRet[name]);
                            }
                            resolve([toRet, "cache"], "success", undefined, true);
                        });
                    }
                }
            }
            if(urlObj.method == "POST"){
                var res = initCB(db,"serializer", mdl.serializer, RESTSerializer.SERIALIZE, { argsObj: argsObj, args:[type,undefined,undefined,customData,name,queryParams]});
                if(res){
                    urlObj.data = res.data;
                    if(urlObj.data && (typeof urlObj.data == "object" || isEntity(urlObj.data) || Array.isArray(urlObj.data)) && !(urlObj.data instanceof FormData)){
                        // urlObj.reqData = Lyte.deepCopyObject(urlObj.data);
                        urlObj.data = JSON.stringify(urlObj.data);
                    }
                    argsObj.data = urlObj.data;
                }
            }
            var prmXhr;
            var prm = new Promise(function(resolve, reject){
                var idbObj = def ? def.idb : undefined, 
                processRequest = getFromCB(db,"connector", def ? def.connector : undefined, RESTConnector.PROCESSREQUEST),payLoad, sendXHR = true, 
                batchPro = false, 
                opts = { cacheQuery : cacheQuery, cacheData : cacheData, customD : customData},
                argsXHR = [db,name,type,key,urlObj,customData,argsObj,opts];
                if(processRequest){
                    sendXHR = false;
                    var returnPromise = self.callGeneric(db,type,def,undefined,undefined,customData, queryParams,key,urlObj.url,undefined,urlObj.method,urlObj.headers,argsObj);
                    if(returnPromise instanceof Promise){
                        batchPro = true;
                        returnPromise.then(function(resp){
                            resp = (resp == "" ? JSON.parse("{}") : JSON.parse(resp));
                            payLoad = RESTSerializer.getResponse(db,resp,def,type,key,urlObj,undefined,customData,opts,argsObj);
                            resolve([payLoad]);
                        },function(message){
                            reject(message);
                        });
                    }
                    else{
                        sendXHR = true;
                    }
                }
                if(makeBatch && !batchPro){
                    RESTConnector.constructBatch.apply(RESTConnector, argsXHR).then(function(resObj){
                        var payLoad = resObj.content;
                        RESTConnector.getSuccess(db,def,type,key,urlObj,undefined,resolve,reject,payLoad,resObj,undefined,opts,argsObj);
                    },function(resObj){
                        RESTConnector.getFailure(db,def,type,key,urlObj,undefined,resolve,reject,opts,resObj.content,resObj.code,argsObj,resObj);
                    });
                }
                else if(idbObj && db.idbIns){
                    db.idbIns.getFromIDB(idbObj, name, type, queryParams, key, urlObj).then(function(payLoad){
                        var res = initCB(db,"serializer", def.serializer, RESTSerializer.IDBRESPONSE, { argsObj: argsObj, args:[name, type, queryParams, key, payLoad]});
                        if(res){
                            payLoad = res.data;
                        }
                        if(payLoad == false){
                            var xhrPrm = RESTConnector.sendXHR.apply(RESTConnector, argsXHR);
                            xhrPrm.then(function(resp){
                                RESTConnector.getSuccess(db,def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                            }, function(resp){
                                RESTConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
                            });	
                            prmXhr = xhrPrm.xhr;						
                        }
                        else{
                            RESTConnector.getSuccess(db, def,type,key,urlObj,undefined,resolve,reject,payLoad,undefined,"idb",opts,argsObj);
                        }
                    },function(message){
                        var xhrPrm = RESTConnector.sendXHR.apply(RESTConnector, argsXHR);
                        xhrPrm.then(function(resp){
                            RESTConnector.getSuccess(db, def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                        }, function(resp){
                            RESTConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
                        });		
                        prmXhr = xhrPrm.xhr;					
                    });
                }
                else if(sendXHR){
                    var xhrPrm = RESTConnector.sendXHR.apply(RESTConnector, argsXHR);
                    xhrPrm.then(function(resp){
                        RESTConnector.getSuccess(db, def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                    },function(resp){
                        RESTConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
                    });
                    prmXhr = xhrPrm.xhr;
                }
            });
            if(prmXhr){
                prm.xhr = prmXhr;
            }
            return prm;
        }
        else {
            Dberror.error(db.lyte,"LD02","Schema",name);
            return Promise.reject({code : "ERR19", message : Dberror.errorCodes.ERR19, data:name});
        }
    }
    static create(db, name, data, isSingleRecord, customData, qP){
        var type= isSingleRecord ? "createEntity": "create", 
        def = db.schema[name], 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        var urlObj = this.buildURL(db, type, "POST", def, undefined, data,qP,undefined,customData,undefined,argsObj);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, undefined, urlObj.url, customData, argsObj);
        var changedData = toJSON(db, name, data, undefined, "create", partial);
        RESTSerializer.sendingData(db, name, changedData, urlObj, type, customData, data, argsObj);
        return this.handleRequest(db, urlObj, name, data, type, changedData, customData, partial.obj, undefined, undefined, partial.ref, argsObj);
    }
    static put(db, name, data, record, isSingleRecord,customData, qP){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        type = (isSingleRecord) ? "updateEntity" : "update", 
        partialObj = new Map(), 
        key = isSingleRecord ? (isComp && bK ? record[bK] : record.$.pK) : undefined, 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        var urlObj = this.buildURL(db, type, "PATCH", def, key, data, qP, undefined, customData, undefined, argsObj);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, key, urlObj.url, customData, argsObj);
        var updatedData = toJSON(db, name, data, undefined, undefined, partial);
        RESTSerializer.sendingData(db, name, updatedData, urlObj, type, customData, record, argsObj);
        return this.handleRequest(db, urlObj, name, record, type, updatedData, customData, partial.obj,key, undefined, partial.ref, argsObj);
    }
    static del(db, name, data, isSingleRecord, destroy, customData, qP){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        type = destroy || "deleteEntity", 
        key = isSingleRecord ? (isComp && bK ? data[bK] : data.$.pK) : undefined, 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        var urlObj = this.buildURL(db, type, "DELETE", def, key, data,qP,undefined,customData,undefined,argsObj);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, key, urlObj.url, customData, argsObj);
        var ids = [];
        if(!isSingleRecord){
            ids = data.map(function(val){
                return val.$.pK;
            });				
        }
        var pkVal = (isSingleRecord) ?  (data ? data.$.pK : undefined) : ids;
        RESTSerializer.sendingData(db, name, pkVal, urlObj, type, customData, data, argsObj);
        return this.handleRequest(db, urlObj, name, data, type, pkVal, customData, undefined, key, undefined, undefined, argsObj);
    }
    static handleAjax(obj){
        if(obj.url){
            if(!obj.schema){
                Dberror.error(obj.db.lyte,"Please pass schema param to db.ajax call");
                return Promise.reject("Please pass schema param to db.ajax call");
            }
        }
        var argsObj = { type: "ajax", schemaName : obj.schema, queryParams: obj.queryParams, customData: obj.customData}
        var urlObj = RESTConnector.buildURL(obj.db, "ajax", obj.type, obj.schema, obj.index, undefined, obj.queryParams, undefined, obj.customData, obj.url, argsObj);
        urlObj.data = obj.data;
        var qP = urlObj.qP, res = initCB(obj.db,"serializer", obj.schema, RESTSerializer.SERIALIZE, { argsObj: argsObj, args:["ajax",urlObj.data,undefined,obj.customData,obj.schema,qP,undefined]});
        if(res){
            argsObj.data = urlObj.data = res.data;
        }
        return RESTConnector.handleRequest(obj.db, urlObj, obj.schema, undefined, "ajax",undefined,obj.schema,undefined,undefined,undefined,undefined,argsObj);
    }
    static handleAction(db,actionName,def,record,customData,qP,method,data){
        var pkVal;
        if(record && isEntity(record)){
            pkVal = record.$.get(def._pK);				
        }
        var name = def._name, 
        type = "action", 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, actionName:actionName}
        RESTConnector.getConnector(db, def, argsObj);
        RESTConnector.getSerializer(db, def, argsObj);
        customData = customData == undefined ? getFromCB(db,"connector", def ? def.connector : undefined, "customData") : customData;
        var urlObj = this.buildURL(db,type, method ? method : "POST", def, pkVal, record, qP, actionName, customData, undefined, argsObj);
        argsObj.data = urlObj.data = data, qP = urlObj.qP;
        var res = initCB(db,"serializer", def.serializer, RESTSerializer.SERIALIZE, { argsObj: argsObj, args:["action",data,record,customData,name,qP,actionName]});
        if(res){
            argsObj.data = urlObj.data = res.data;
        }
        return this.handleRequest(db, urlObj, def._name, undefined, type,undefined,customData,undefined,undefined,actionName,undefined,argsObj);
    }
    static callGeneric(db, type, def, data, record, customData, queryParams, key, url, actionName, method, headers, argsObj){
        var name = def && def._name ? def._name : def;
        argsObj.cachedData = record;
        var res = initCB(db,"connector", def.connector, RESTConnector.PROCESSREQUEST, {argsObj:argsObj, args:[type,name,data,record,customData,queryParams,key,url,actionName,method,headers]});
        return res ? res.data : undefined;
    }
    static handleBatchPromise(obj){
        var response = obj.response,
        db = obj.db, 
        batch = obj.batch, 
        fail = obj.fail;
        //callback
        obj.argsObj.payLoad = response;
        if(!fail){
            var res = initCB(db,"serializer", undefined, RESTSerializer.NORMALIZE, {argsObj:obj.argsObj, args:[undefined,"batch",obj.response]});
            if(res){
                response = res.data;
            }
    
            var resp = response.batch_requests;
            resp.forEach(function(item, index){
                var pro = db.$.batchPromise[batch][index];
                var status = item.status.toString();
                var code = status[0];
                if(code == "2"){
                    pro.resolve({content:item.content,index:index,batch:batch,resp:item});
                }
                else if(code == "4" || code == "5"){
                    db.$.batchResponse[batch][index] = undefined;
                    pro.reject({content:item.content,index:index,batch:batch,resp:item,code:status});
                }
            });
        }
        else{
            var prmArr = db.$.batchPromise[batch];
            prmArr.forEach(function(itm, idx){
                itm.reject({content:{}, index: idx, batch:batch, code:"400",resp:{}})
            });
        }
        // obj.resolve(response);
        delete db.$.batch[batch];
        delete db.$.batchPromise[batch];
    }
    static constructBatch(db,name,type,key,urlObj,customData){
        return new Promise(function(resolve, reject){
            var batch = db.$.currentBatch;
            var q = db.$.batch[batch] = db.$.batch[batch] || [];
            var pro = db.$.batchPromise[batch] = db.$.batchPromise[batch] || []; 
            var batchObj = {};
            batchObj.method = urlObj.method;
            batchObj.uri = "/" + urlObj.url;
            batchObj.parameters = urlObj.qP;
            batchObj.content = typeof urlObj.data == "string" ? JSON.parse(urlObj.data) : undefined;
            q.push(batchObj);
            pro.push({resolve:resolve,reject:reject});	
        });
    }
}
RESTConnector.__lMod = "RESTConnector";
RESTConnector.returnData = "old";
RESTConnector.PARSEREQUEST = "parseRequest";
RESTConnector.REQUESTURL = "requestURL";
RESTConnector.REQUESTHEADERS = "requestHeaders";
RESTConnector.REQUESTMETHOD = "requestMethod";
RESTConnector.REFETCHALL = "refetchAll";
RESTConnector.REFETCH = "refetchEntity"
RESTConnector.PROCESSREQUEST = "processRequest";
RESTConnector.PARSERESPONSE = "parseResponse";

RESTConnector.JSON = /application\/json/;
RESTConnector.TEXT = /text\/plain/;
RESTConnector.__extendedBy = [];
export { RESTConnector };