import { Service } from "@slyte/core"
import { isInheritedClass, isEntity } from "@slyte/core/src/lyte-utils.js";
import {  initCB, getFromCB, dbModName } from "./utils.js";
import { ConnectorError } from "./dberror.js";
/*convert to custom class*/
class Connector extends Service {
    constructor(){
        super();
        this.constructor._name = dbModName(this.constructor.name, "Connector");
    }
    static processResponse(db, xhr, type, name, argsObj, urlObj, key, customData, opts){
        return new Promise(function(resolve, reject){
            if(xhr){
                var contentType = xhr.getResponseHeader('content-type'),
                resp,
                isSuccess = xhr && (xhr.status.toString()[0] == "2" || xhr.status.toString()[0] == "3") ? true : false,
                def = db.getSchemaObj(name),
                cresp;
                if(Connector.JSON.test(contentType)){
                    resp = xhr.responseText.length ? JSON.parse(xhr.responseText) : JSON.parse("{}");
                }
                else if(Connector.TEXT.test(contentType)){
                    try {
                        resp = JSON.parse(xhr.responseText);
                    }
                    catch(exp){ 
                        resp = new ConnectorError("Cannot parse the data", xhr);
                        isSuccess = false;
                    }
                }
                else if(type !== "triggerAction"){
                    resp = xhr.responseText;
                }
                else{
                    resp = new ConnectorError("Not an acceptable content-type: "+contentType, xhr);
                }
                argsObj.payLoad = resp;
                // def = getSchemaObj(db, def);
                var res = initCB(
                    db,
                    "connector",
                    def ? def.connector : undefined,
                    Connector.PARSERESPONSE,
                    { argsObj: argsObj, args:[type, name, xhr, resp, urlObj ? urlObj.qP : undefined, key, customData, opts]}
                );
                if(res){
                    cresp = res.data;
                    resp = argsObj.payLoad = cresp;
                }
                if(cresp && cresp instanceof Promise)
                {
                    return cresp.then(function(res){
                        argsObj.payLoad = res;
                        return resolve(res)
                    }, function(res){
                        return reject(res);
                    })
                    // return RESTConnector.handleParseResponsePromise(db,cresp,def,type,key,urlObj,xhr,undefined,undefined,undefined,resolve,reject,opts,argsObj);
                }
                else{
                    if(isSuccess){
                        return resolve(resp)
                    }
                    else{
                        return reject(resp);
                    }
                }

            }
        });
    }

    static sendXHR(db,name,type,key,urlObj,customData,argsObj,opts){
        var xhr = new XMLHttpRequest();
        var prm = new Promise(function(res, rej){
            argsObj.xhr = xhr;
            xhr.open(urlObj.method, urlObj.url, true);
            for(var header in urlObj.headers){
                xhr.setRequestHeader(header, urlObj.headers[header]);
            }
            if(urlObj.data !== undefined && !(urlObj.data instanceof FormData) && ( urlObj.headers && !urlObj.headers.hasOwnProperty("Content-Type") && urlObj.method !== "GET")){
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            xhr.withCredentials = (urlObj.withCredentials)?true:false;
            var sch = db.getSchemaObj(name);
            if(sch && sch.connector){
                initCB(db, "connector", sch.connector, /*RESTConnector.PARSEREQUEST*/ "parseRequest", { argsObj: argsObj, args:[type, name, xhr ,urlObj ? urlObj.qP : undefined, key, customData]});
            }
            db.emit("beforeRequest", [xhr, name, type, key, urlObj.qP]);
            xhr.send(urlObj.data);
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    db.emit("afterRequest",[xhr, name, type, key, urlObj.qP]);
                    argsObj.status = xhr.status;
                    /*RESTConnector.processResponse*/ Connector.processResponse(db, xhr, type, name, argsObj, urlObj, key, customData, opts).then(function(data){
                        return res({data:data, xhr:xhr});
                    }, function(err){
                        return rej({data:err, xhr:xhr});
                    });
                }
            }
        });
        prm.xhr = xhr;
        return prm;
    }
    static getConnector(db, def, argsObj, defless){
        var defObj = def;
        def = def.def ? def.def : def
        if(defless){
            if(db.Connector.hasOwnProperty(def)){

            }
        }
        else if(def && def.Connector && !isInheritedClass(def.Connector, db.constructor.ConnectorCls) && typeof def.Connector == "function" ){
            var parent = Object.getPrototypeOf(def.Connector), parentName = parent ? parent.name :undefined, context;
            var connec = def.Connector.apply(def, [argsObj]);
            if(connec){
                db.lyte.scopedInstance(connec, [db], function(ins){
                    defObj.connector = ins;
                }, [db]);
                context = defObj.connector.__type;
                db.connector[context] = db.connector[context] || {};
                db.connector[context][defObj.connector.constructor._name] = defObj.connector;
            }
        }
    }
    static getSerializer(db, def, argsObj){
        var defObj = def;
        def = def.def ? def.def : def
        if(def && def.Serializer && !isInheritedClass(def.Serializer, db.constructor.SerializerCls) && typeof def.Serializer == "function"){
            var parent = Object.getPrototypeOf(def.Serializer), parentName = parent ? parent.name :undefined, context;
            var serz = def.Serializer.apply(def, [argsObj]);
            if(serz){
                db.lyte.scopedInstance(serz, [db], function(ins){
                    defObj.serializer = ins;
                }, [db]);
                context = defObj.serializer.__type;
                db.serializer[context] = db.serializer[context] || {};
                db.serializer[context][defObj.serializer.constructor._name] = defObj.serializer;
            }
        }
    }
    static getSuccess(db,def,type,key,urlObj,respObj,resolve,reject,response,resObj,from,opts,argsObj){
        var resp = respObj ? respObj.data : response, 
        // req = respObj ? respObj.xhr : undefined, 
        req,
        xhr = respObj ? respObj.xhr : undefined,
        batchIndex, 
        batch, 
        customD = opts.customD, 
        name = def && def._name ? def._name : def,
        status = xhr ? xhr.status : undefined;
        if(from != "idb"){
            var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
            if(resObj){
                batchIndex = resObj.index;
                batch = resObj.batch;
                argsObj.xhr = req = resObj.resp;
                argsObj.payLoad = resObj.content;
                var res = initCB(db,"connector", def.connector, baseCons.PARSERESPONSE , { argsObj: argsObj, args:[type, name, req, resp, urlObj ? urlObj.qP : undefined, key, customD, opts]});
                if(res){
                    resp = res.data;
                }
                if(resp instanceof Promise)
                {
                    return baseCons.handleParseResponsePromise(db,resp,def,type,key,urlObj,xhr,undefined,batchIndex,batch,resolve,reject,opts,argsObj);
                }
                else{
                    argsObj.payLoad = resp;
                }
            }
            // if(req){
                argsObj.payLoad = resp;
            // }
            return baseCons.findParseRequestPromise(db, resp,def,type,key,urlObj,xhr,batchIndex,batch,resolve,opts,argsObj);
        }
        var resArr = xhr ? [resp, xhr.statusText, xhr] : (batchIndex != undefined) ? [resp,"batch",{index:batchIndex,batch:batch}] : from ? [resp, "idb"] : [resp];
        resolve(resArr);
    }
    static getFailure(db,def,type,key,urlObj,respObj,resolve,reject,opts,content,code,argsObj,bObj){
        var customD = opts.customD, 
        name = def && def._name ? def._name : def;
        var xhr = respObj? respObj.xhr : undefined,
        response = respObj ? respObj.data : undefined;
        if(xhr){
            var resp;         
            argsObj.payLoad = response;
            var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
            var res = initCB(db,"connector", def ? def.connector : undefined, baseCons.PARSERESPONSE, { argsObj: argsObj, args:[type, name, xhr, response ,urlObj ? urlObj.qP : undefined, key, customD, opts]});
            if(res){
                resp = res.data;
                argsObj.payLoad = resp;
            }
            if(resp instanceof Promise)
            {
                return baseCons.handleParseResponsePromise(db,resp,def,type,key,urlObj,xhr,undefined,undefined,undefined,resolve,reject,opts,argsObj);
            }
            return reject(xhr);
        }
        else if(content){
            var batch, batchIndex;
            if(bObj){
                batchIndex = bObj.index;
                batch = bObj.batch;
            }
            db.$.batchResponse[batch][batchIndex] = {code:code, status:"requestFailure", data:content};
            return reject({code:code,status:"requestFailure", data:content});
        }
        return reject(respObj.data);
    }
    static handleParseResponsePromise(db,response,def,type,key,urlObj,xhr,partialObj,batchIndex,batch,resolve,reject,opts,argsObj)
    {
        response.then(function(payload){
            argsObj.payLoad = payload;
            var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
            if(type == "get")
            {
                baseCons.findParseRequestPromise(db, payload,def,type,key,urlObj,xhr,batchIndex,batch,resolve,opts,argsObj);
            }
            else
            {
                baseCons.otherParseRequestPromise(db, payload,def,type,key,urlObj,xhr,partialObj,batchIndex,batch,resolve,reject,opts ? opts.customD : undefined,undefined,argsObj,key);
            }
        },function(payload){	
            reject(xhr);
        });
    }
    static findParseRequestPromise(db, payload,def,type,key,urlObj,xhr,batchIndex,batch,resolve,opts,argsObj){
        var options = Object.assign({},opts);
        delete options.customD;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer; 
        var resp = baseSerz.getResponse(db,payload,def,type,key,urlObj,xhr, opts ? opts.customD : undefined, options,argsObj);
        var resArr = xhr ? [resp, xhr.statusText, xhr] : (batchIndex != undefined) ? [resp,"batch",{index:batchIndex,batch:batch}] : [resp];
        resolve(resArr);
    }
    static create(db, name, data, isSingleRecord, customData, qP, mutationName){
        var type= isSingleRecord ? "createEntity": "create", 
        def = db.schema[name], 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData};
        Connector.getConnector(db, def, argsObj);
        Connector.getSerializer(db, def, argsObj);
        return def.connector.constructor.create.apply(def.connector.constructor, arguments);
    }
    static put(db, name, data, record, isSingleRecord,customData, qP, mutationName){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        type = (isSingleRecord) ? "updateEntity" : "update", 
        key = isSingleRecord ? (isComp && bK ? record[bK] : record.$.pK) : undefined, 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key};
        Connector.getConnector(db, def, argsObj);
        Connector.getSerializer(db, def, argsObj);
        return def.connector.constructor.put.apply(def.connector.constructor, arguments);
    }
    static del(db, name, data, isSingleRecord, destroy, customData, qP, mutationName){
        var def = db.schema[name], 
        bK = def.bK , 
        isComp = def.isComp, 
        type = destroy || "deleteEntity", 
        key = isSingleRecord ? (isComp && bK ? data[bK] : data.$.pK) : undefined, 
        argsObj = { type: type, schemaName : name, queryParams: qP, customData: customData, key: key};
        Connector.getConnector(db, def, argsObj);
        Connector.getSerializer(db, def, argsObj);
        return def.connector.constructor.del.apply(def.connector.constructor, arguments);
    }
    static otherParseRequestPromise(db,resp,def,type,data,urlObj,xhr,partialObj,batchIndex,batch,resolve,reject,customData,partialRef,argsObj,key){
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer; 
        var response = baseSerz.genericResponse(db,resp,def,type,data,urlObj,xhr,partialObj,customData,partialRef,argsObj);
        if(batchIndex != undefined){
            db.$.batchResponse[batch][batchIndex] = response;
        }
        if(type != "action" && db.idbIns && def){
            db.idbIns.updateIDB(db,def._name,type,data,customData,urlObj);
        }
        var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
        if(baseCons.constructor.returnData == "new"){
            var obj = {};
            if(xhr && xhr.status){
                obj.status = xhr.status;
            }
            if(obj.status === 204){
                obj.data = null;
            }
            else{
                obj.data = response;
            }
        }
        resolve(response);
    }
    static handleRequest(db,urlObj,name,data,type,changedData,customData,partialObj,key,actionName, partialRef, argsObj){
        if(urlObj.data && (typeof urlObj.data == "object" || isEntity(urlObj.data) || Array.isArray(urlObj.data)) && !(urlObj.data instanceof FormData)){
            // urlObj.reqData = Lyte.deepCopyObject(urlObj.data);
            urlObj.data = JSON.stringify(urlObj.data);
        }
        var self = this, xhr, key, def = db.schema[name], prmXhr;;
        var prm = new Promise(function(resolve, reject){
            var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
            var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;             
            var processRequest = getFromCB(db,"connector", def ? def.connector : undefined, baseCons.PROCESSREQUEST),sendXHR = true;
            var makeBatch = db.$.makeBatch;
            var batchPro = false;
            if(processRequest){
                sendXHR = false;
                var returnPromise = self.callGeneric(db,type,def,urlObj.data,data,customData,urlObj?urlObj.qP:undefined,key,urlObj.url,actionName,urlObj.method,urlObj.headers,argsObj),response;
                if(returnPromise instanceof Promise){
                    batchPro = true;						
                    returnPromise.then(function(resp){
                        resp = (resp == "" ? JSON.parse("{}") : JSON.parse(resp));
                        response = baseSerz.genericResponse(db,resp,def,type,data,urlObj,undefined,partialObj,customData,undefined,argsObj);
                        resolve(response);
                    },function(message){
                        reject(message);
                    });
                }
                else{
                    sendXHR = true;
                }
            }
            if(makeBatch && !batchPro){
                baseCons.constructBatch(db,name,type,key,urlObj,customData).then(function(respObj){
                    var resp = respObj.content; 
                    baseCons.handleSuccess(db, name, type, xhr, data, urlObj, resolve, resp, respObj,undefined,reject,key,customData,actionName,partialRef, argsObj);
                    // resolve(resp);
                },function(resObj){
                    baseCons.handleFailure(db, name, type, xhr, data, urlObj, resolve,resObj.content,undefined,reject,key,customData,resObj.code,actionName, argsObj, resObj);
                });
            }
            else if(sendXHR){
                var argsXHR = [db,name,type,key,urlObj,customData,argsObj];
                var xhrPrm = baseCons.sendXHR.apply(baseCons, argsXHR);
                xhrPrm.then(function(xhrResp){
                    baseCons.handleSuccess(db, name, type, xhrResp, data, urlObj, resolve, undefined, undefined, partialObj,reject,key,customData,actionName,partialRef,argsObj);					
                },function(xhrResp){
                    baseCons.handleFailure(db, name, type, xhrResp, data, urlObj, resolve, undefined,partialObj,reject,key,customData,undefined,actionName,argsObj);
                });
                prmXhr = xhrPrm.xhr;
            }
        });	
        if(prmXhr){
            prm.xhr = prmXhr;
        }
        return prm;
    }
    static handleSuccess(db, name, type, xhrResp, data, urlObj, resolve, resp, respObj, partialObj, reject, key, customData, actionName, partialRef, argsObj){
        var resp = resp ? resp : xhrResp ? xhrResp.data : undefined, 
        req, 
        batchIndex, 
        batch, 
        xhr = xhrResp ? xhrResp.xhr : undefined,
        req = xhr ? xhr : undefined,
        def = db.schema[name], 
        opts = { customD : customData };
        var baseCons = def && def.connector ? def.connector.constructor : db.constructor.Connector;
        if(respObj){
            batchIndex = respObj.index;
            batch = respObj.batch;
            req = respObj.resp;
            argsObj.xhr = req;
            var res = initCB(db,"connector", def && def.connector ? def.connector : undefined, baseCons.PARSERESPONSE, { argsObj:argsObj, args:[type, name, req, resp, urlObj ? urlObj.qP : undefined, key,customData,undefined,actionName]});
            if(res){
                resp = res.data;
                if(resp instanceof Promise)
                {
                    return baseCons.handleParseResponsePromise(db,resp,def,type,data,urlObj,xhr,partialObj,batchIndex,batch,resolve,reject,opts,argsObj);
                }
                else{
                    argsObj.payLoad = resp;
                }
            }
        }
        return this.otherParseRequestPromise(db, resp,def,type,data,urlObj,xhr,partialObj,batchIndex,batch,resolve,reject,customData,partialRef,argsObj,key);
    }
    static handleFailure(db, name, type, xhrResp, data, urlObj, resolve, respObj, partialObj,reject,key,customData,code,actionName,argsObj,bObj){
        var def = db.schema[name],
        xhr = xhrResp ? xhrResp.xhr : undefined;
        if(xhr){
            var resp, 
            response = xhrResp ? xhrResp.data : undefined;
            argsObj.payLoad = response;
        }
        else if(respObj){
            var batch, batchIndex;
            if(bObj){
                batchIndex = bObj.index;
                batch = bObj.batch;
            }
            db.$.batchResponse[batch][batchIndex] = {code:code, status:"requestFailure", data:respObj};
            reject({code:code, status:"requestFailure", data:respObj});
        }
        reject(response);
    }
}
Connector.__lMod = "Connector";
Connector.returnData = "old";
Connector.PARSEREQUEST = "parseRequest";
Connector.REQUESTURL = "requestURL";
Connector.REQUESTHEADERS = "requestHeaders";
Connector.REQUESTMETHOD = "requestMethod";
Connector.REFETCHALL = "refetchAll";
Connector.REFETCH = "refetchEntity";
Connector.PROCESSREQUEST = "processRequest";
Connector.PARSERESPONSE = "parseResponse";
Connector.JSON = /application\/json/;
Connector.TEXT = /text\/plain/;
export { Connector };
