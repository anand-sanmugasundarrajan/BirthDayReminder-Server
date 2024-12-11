import { Connector } from "./Connector";
import { getFromCB, initCB, addToCachedBatch, cbScp, cB, initPartialObj, toJSON, compareData, dbModName } from "./utils.js";
import { GraphqlSerializer } from "./GraphqlSerializer";
import { graphQlconfig, cpdGql } from "./gqlUtils";
/*convert to custom class*/
class GraphqlConnector extends Connector {
    static register(parent){
        // this.__class = GraphqlConnector;
        // var name = this._name = dbModName(this.name, "Connector");
    }
    constructor(){
        super();
        this.host = window.location.origin ? window.location.origin : window.location.protocol+"//"+window.location.host;
        this.namespace = "";
        this.actionNamespace = "action";
        this.batchNamespace = "batch";
        this.__type = "gql";
    }
    static buildURL(db,type,method,def,key,snapshot,queryParams,actionName,customData,url,argsObj,gqlEnables){
        var adapter, name;
        if(def !== undefined){
            adapter = def.connector, name = def._name;
        }
        var schemaless = db.Connector.gql && db.Connector.gql.application ? db.Connector.gql.application.prototype.schemaless : undefined;
        if(typeof def == "string" && schemaless){
            name = def;
        }
        var host = getFromCB(db,"connector",adapter,"host"), 
        url = url || "";
        argsObj.host = host;
        if(!url){
            if(host !== undefined){
                url += host;
                if(host[host.length-1] != "/"){
                    url+="/";					
                }
            }
        }
        
        var gqlNamespace = getFromCB(db, "connector", adapter, "namespace");
        url+=gqlNamespace?gqlNamespace:"";

        if(!queryParams){
            queryParams = {};
        }
        var ret = {method : (method)? method : "POST"}, res;
        ret.gql=gqlEnables;
        argsObj.url = url;
        argsObj.method = ret.method;
        argsObj.queryParams = queryParams;
        res = initCB(db,"connector", adapter, GraphqlConnector.REQUESTHEADERS, { argsObj: argsObj, args:[type, queryParams, customData, actionName, key]});
        if(res){
            ret.headers = res.data;
        }
        argsObj.headers = ret.headers;
        argsObj.cachedData = snapshot;
        res = initCB(db,"connector", adapter, GraphqlConnector.REQUESTURL, { argsObj: argsObj, args:[name, type, queryParams, snapshot, url,actionName,customData, key]});
        if(res){
            url = res.data;
        }
        argsObj.url = url;
        res = initCB(db,"connector", adapter, GraphqlConnector.REQUESTMETHOD, { argsObj: argsObj, args:[method, type, queryParams, customData, actionName, key]});
        if(res){
            ret.method = res.data;
        }
        argsObj.method = method;
        if(Object.keys(queryParams).length){
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
    static get(db, type, def, key, queryParams, cacheQuery, customData, cacheData, unload, forceFetch, opName, gqlVar){
        var name = def && def._name ? def._name : def, 
        argsObj = { type: type, schemaName : name, queryParams: queryParams, opts:{cacheData:cacheData !== undefined ? cacheData : true, cacheQuery:cacheQuery!== undefined ? cacheQuery : false, unload: unload!==undefined?unload:false, forceFetch: forceFetch!==undefined?forceFetch:false }, customData: customData, key: key}
        var mdl = def,
        makeBatch = db.$.makeBatch, 
        defless = db.Connector.gql && db.Connector.gql.application ? db.Connector.gql.application.prototype.schemaless : undefined, 
        gqlobj = ( gqlVar || opName ) ? {} : undefined, 
        gqlEnables; 
        if(defless && typeof def == "string"){
            var defobj = db.schemaless, _name = def; 
			def = defobj[_name] = defobj[_name] || {};
            def._name = _name;
        }
        Connector.getConnector(db, def, argsObj, defless);
        Connector.getSerializer(db, def, argsObj, defless);
        if(mdl || ( typeof mdl == "string"  && defless === true)){
            if(unload){
                if(key !== undefined){
                    db.dropEntity(def.def, key);
                }
                else{
                    db.dropAll(def.def);
                }
            }
            opName?gqlobj.query=opName:undefined;
            gqlVar?gqlobj.variables=gqlVar:undefined;
            customData = customData == undefined ? getFromCB(db,"connector", mdl.connector, "customData") : customData;
            argsObj.gqlObj = gqlobj;
            gqlEnables = initCB(db, "connector", def.connector, "buildGqlQuery", {argsObj:argsObj, args:[name,type,queryParams,key,gqlobj,customData]});
            if(gqlEnables){
                gqlEnables = gqlEnables.data;
            }
            var urlObj = this.buildURL(db, type, "POST", def, key, undefined, queryParams,undefined,customData,undefined,argsObj,gqlEnables), 
            self = this,
            queryParams = urlObj.qP, 
            toCheckParams = (cacheQuery && typeof cacheQuery !== "boolean") ? cacheQuery : (queryParams && typeof queryParams == "object") ? queryParams : undefined;
            if(urlObj.gql){
                if (typeof (urlObj.gql) =="object"){
                    opName=urlObj.gql.query,
                    gqlVar=urlObj.gql.variables;
                }else if(urlObj.gql === true){
                    opName=gqlVar=undefined;
                }
                urlObj.data=graphQlconfig(db,def,key,type,queryParams,opName,gqlVar,urlObj,undefined,undefined,argsObj);
                if(urlObj.data.LdEr){
                    Dberror.warn(db.lyte,urlObj.data.LdEr,urlObj.data.key,modelName);
                    return Promise.reject({code :urlObj.data.LyteError , message : Dberror.errorCodes[urlObj.data.LyteError], data:urlObj.data.key})
                }
            }
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
                var scope = cbScp(db, def.connector, type == "getAll" ? GraphqlConnector.REFETCHALL : GraphqlConnector.REFETCH, "connector");
                if(scope){
                    var data;
                    if(key !== undefined){
                        data = db.cache.getEntity(mdl.def,key);							
                    }
                    else{
                        data = db.cache.getAll(mdl.def);
                    }
                    argsObj.cachedData = data;
                    if(data !== undefined && !cB(scope, [argsObj])){
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
                var res = initCB(db,"serializer", mdl.serializer, GraphqlSerializer.SERIALIZE, { argsObj: argsObj, args:[type,undefined,undefined,customData,name,queryParams]});
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
                processRequest = getFromCB(db,"connector", def ? def.connector : undefined, GraphqlConnector.PROCESSREQUEST),payLoad, sendXHR = true, 
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
                            payLoad = GraphqlSerializer.getResponse(db,resp,def,type,key,urlObj,undefined,customData,opts,argsObj);
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
                        RESTConnector.getFailure(db,def,type,key,urlObj,undefined,resolve,reject,opts,resObj.content,resObj.code,argsObj);
                    });
                }
                // else if(idbObj){
                //     getFromIDB(idbObj, name, type, queryParams, key, urlObj).then(function(payLoad){
                //         var res = initCB(db,"serializer", schema.serializer, RESTSerializer.IDBRESPONSE, { argsObj: argsObj, args:[name, type, queryParams, key, payLoad]});
                //         if(res){
                //             payLoad = res.data;
                //         }
                //         if(payLoad == false){
                //             RESTConnector.sendXHR.apply(RESTConnector, argsXHR).then(function(resp){
                //                 RESTConnector.getSuccess(db,def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                //             }, function(resp){
                //                 RESTConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
                //             });							
                //         }
                //         else{
                //             RESTConnector.getSuccess(db, def,type,key,urlObj,undefined,resolve,reject,payLoad,undefined,"idb",opts,argsObj);
                //         }
                //     },function(message){
                //         RESTConnector.sendXHR.apply(RESTConnector, argsXHR).then(function(resp){
                //             RESTConnector.getSuccess(db, def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                //         }, function(resp){
                //             RESTConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
                //         });							
                //     });
                // }
                else if(sendXHR){
                    var xhrPrm = GraphqlConnector.sendXHR.apply(GraphqlConnector, argsXHR);
                    xhrPrm.then(function(resp){
                        GraphqlConnector.getSuccess(db, def,type,key,urlObj,resp,resolve,reject,undefined,undefined,undefined,opts,argsObj);
                    },function(resp){
                        GraphqlConnector.getFailure(db,def,type,key,urlObj,resp,resolve,reject,opts,undefined,undefined,argsObj);
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
    static create(db, name, data, isSingleRecord, customData, qP, mutationName){
        var type = isSingleRecord ? "createEntity": "create", 
        def = db.schema[name], 
        gqlObj = mutationName?{"mutation":mutationName}:{},
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData}, 
        gqlEnables, 
        createdVariables={};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        argsObj.gqlObj = gqlObj;
        gqlEnables = initCB(db, "connector", def.connector, "buildGqlQuery", {argsObj:argsObj, args:[name,type,qP,undefined,gqlObj,customData]});
        if(gqlEnables){
            gqlEnables = gqlEnables.data;
        }
        var urlObj = this.buildURL(db, type, "POST", def, undefined, data,qP,undefined,customData,undefined,argsObj,gqlEnables);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, undefined, urlObj.url, customData, argsObj);
        var changedData = toJSON(db, name, data, undefined, "create", partial);
        GraphqlSerializer.sendingData(db, name, changedData, urlObj, type, customData, data, argsObj);
        cpdGql(db,def,type,qP,mutationName,createdVariables,urlObj,changedData,customData,argsObj);
        return this.handleRequest(db, urlObj, name, data, type, changedData, customData, partial.obj, undefined, undefined, partial.ref, argsObj);
    }
    static put(db, name, data, record, isSingleRecord,customData, qP, mutationName){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        type = (isSingleRecord) ? "updateEntity" : "update", 
        partialObj = new Map(), 
        key = isSingleRecord ? (isComp && bK ? record[bK] : record.$.pK) : undefined, 
        gqlObj = mutationName?{"mutation":mutationName}:{},
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key}, 
        gqlEnables, 
        createdVariables={};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        argsObj.gqlObj = gqlObj;
        gqlEnables = initCB(db, "connector", def.connector, "buildGqlQuery", {argsObj:argsObj, args:[name,type,qP,key,gqlObj,customData]});
        if(gqlEnables){
            gqlEnables = gqlEnables.data;
        }
        var urlObj = this.buildURL(db, type, "POST", def, key, data, qP, undefined, customData, undefined, argsObj, gqlEnables);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, key, urlObj.url, customData, argsObj);
        var updatedData = toJSON(db, name, data, undefined, undefined, partial);
        GraphqlSerializer.sendingData(db, name, updatedData, urlObj, type, customData, record, argsObj);
        cpdGql(db,def,type,qP,mutationName,createdVariables,urlObj,updatedData,customData,argsObj);
        return this.handleRequest(db, urlObj, name, record, type, updatedData, customData, partial.obj,key, undefined, partial.ref, argsObj);
    }
    static del(db, name, data, isSingleRecord, destroy, customData, qP, mutationName){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        gqlObj= mutationName ? { "mutation" : mutationName } : {},
        type = destroy || "deleteEntity", 
        key = isSingleRecord ? (isComp && bK ? data[bK] : data.$.pK) : undefined, 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key}, 
        gqlEnables, 
        createdVariables={};
        customData = customData == undefined ? getFromCB(db,"connector", def.connector, "customData") : customData;
        argsObj.gqlObj = gqlObj;
        gqlEnables = initCB(db, "connector", def.connector, "buildGqlQuery", {argsObj:argsObj, args:[name,type,qP,key,gqlObj,customData]});
        if(gqlEnables){
            gqlEnables = gqlEnables.data;
        }
        var urlObj = this.buildURL(db, type, "POST", def, key, data,qP,undefined,customData,undefined,argsObj,gqlEnables);
        qP = urlObj.qP;
        var partial = initPartialObj(db, name, type, qP, key, urlObj.url, customData, argsObj);
        var ids = [];
        if(!isSingleRecord){
            ids = data.map(function(val){
                return val.$.pK;
            });				
        }
        var pkVal = (isSingleRecord) ?  (data ? data.$.pK : undefined) : ids;
        def.serializer.constructor.sendingData(db, name, pkVal, urlObj, type, customData, data, argsObj);
        cpdGql(db,def,type,qP,mutationName,createdVariables,urlObj,pkVal,customData,argsObj);
        return this.handleRequest(db, urlObj, name, data, type, pkVal, customData, undefined, key, undefined, undefined, argsObj);
    }
}

GraphqlConnector.__lMod = "GraphqlConnector";
GraphqlConnector.returnData = "old";
GraphqlConnector.PARSEREQUEST = "parseRequest";
GraphqlConnector.REQUESTURL = "requestURL";
GraphqlConnector.REQUESTHEADERS = "requestHeaders";
GraphqlConnector.REQUESTMETHOD = "requestMethod";
GraphqlConnector.REFETCHALL = "refetchAll";
GraphqlConnector.REFETCH = "refetchEntity";
GraphqlConnector.PROCESSREQUEST = "processRequest";
GraphqlConnector.PARSERESPONSE = "parseResponse";
GraphqlConnector.JSON = /application\/json/;
GraphqlConnector.TEXT = /text\/plain/;
GraphqlConnector.__extendedBy = [];

export { GraphqlConnector };