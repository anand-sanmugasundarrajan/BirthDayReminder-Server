import { Service } from "@slyte/core/src/service"
import { cbScp, cB, isEmpty, handleResponse, initCB, getSchemaObj, _defProp, dbModName , isDirty } from "./utils.js";
import { isEntity } from "@slyte/core/src/lyte-utils";

/*convert to custom class*/
class Serializer extends Service {
    constructor(){
        super();
        this.constructor._name = dbModName(this.constructor.name, "Serializer");
    }
    static genericResponse(db,resp,def,type,data,urlObj,xhr,partialObj,customData,partialRef,argsObj){
        var response = resp, 
        name = def && def._name ? def._name : def,
        status = xhr ? xhr.status : undefined, 
        scope, 
        args, 
        qP = urlObj ? urlObj.qP : undefined, extractMetaCall;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        scope = cbScp(db, def ? def.serializer : undefined, baseSerz.GETMETA, "serializer");
        if(scope){
            if(response){
                var metaRes = cB(scope, [argsObj]);
                if(!isEmpty(metaRes)){
                    argsObj.meta = response.meta = metaRes;    
                }
                extractMetaCall = true;
            }
            else{
                extractMetaCall = false;
            }
        }
        if(response && type != "action" && type != "ajax"){
            response = baseSerz.buildJSON(db, def, type, response, isEntity(data) ? data[db.getSchemaObj(name)._pK] :undefined ,xhr ? xhr.status : undefined, urlObj, customData, qP, argsObj);
            if( extractMetaCall == false && scope && response ){
                var metaRes = cB(scope, [argsObj]);
                if(!isEmpty(metaRes)){
                    response.meta = metaRes;
                }
            }
            var keys = Object.keys(response);
            var len = keys.length;
            /* Internal release
            scope = cbScp(db, def ? def.serializer : undefined, RESTSerializer.DESERIALIZEKEY, "serializer");
            if(scope){
                db.lyte.warn("LD08", "deserializeKey", "callback", "Please use normalizeKey callback instead");
                if(len > 2){
                    db.lyte.error("LD09");
                }
                    var index = 0;
                    if(keys[0] == "meta"){
                        index = 1;
                    }
                    var deserializeKey = cB(scope, [argsObj]), rec = response[keys[index]];
                    delete response[keys[index]];
                    response[deserializeKey] = rec;	
            } 
            */	
            handleResponse(db, data, response, def, type, partialObj, undefined, partialRef);
        }
        return response;
    }
    static getResponse(db,resp,def,type,key,urlObj,xhr,customData,opts,argsObj){
        var name = def && def._name ? def._name : def,
        scope, 
        payLoad, 
        args, 
        qP = urlObj ? urlObj.qP : undefined;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        var doNormalize = opts.cacheData !== undefined && opts.cacheData !== null && typeof opts.cacheData == "object" && opts.cacheData.hasOwnProperty("normalize")  ? opts.cacheData.normalize : true;
        if(doNormalize){
            resp = baseSerz.normalizeResponse(db, def, type, resp, key, xhr ? xhr.status : xhr, urlObj,customData,opts,argsObj)
            payLoad = resp;
            if(payLoad && typeof payLoad != "object"){
                payLoad = JSON.parse(payLoad);
                argsObj.payLoad = payLoad;
            }
            var res = initCB(db,"serializer", def.serializer, baseSerz.GETMETA, { argsObj: argsObj, args:[payLoad,name,type,qP,customData,opts]}), metaRes;
            if(res){
                metaRes = res.data;
                if(!isEmpty(metaRes)){
                    payLoad.meta = metaRes;
                    argsObj.meta = payLoad.meta;
                }	
            }
            var keys = Object.keys(payLoad);
            var len = keys.length; 
            if(len){			
                res = initCB(db,"serializer", def.serializer, baseSerz.NORMALIZEKEY, { argsObj: argsObj, args:[name,type,key,qP,customData,opts]});
                var plKey;
                if(res){
                    plKey = res.data;
                    if(plKey && plKey != name){
                        var temp = payLoad[plKey];
                        payLoad[name] = temp;
                        delete payLoad[plKey];
                    }
                }
                /* Internal release
                scope = cbScp(db,def.serializer, RESTSerializer.DESERIALIZEKEY, "serializer");
                if(scope){
                    db.lyte.warn("LD08", "deserializeKey", "callback", "Please use payloadKey callback instead");
                    if(len > 2){
                        db.lyte.error("LD09");
                    }
                    var index = 0;
                    if(len == 2 && keys[0] == "meta"){
                        index = 1;
                    }
                    args = [name,type];
                    var deserializeKey = cB(scope, [argsObj]), rec = payLoad[keys[index]];
                    delete payLoad[keys[index]];
                    payLoad[deserializeKey] = rec;
                }
                */
                baseSerz.normalize(
                    db,
                    def,
                    type,
                    payLoad,
                    key,
                    xhr ? xhr.status : xhr,
                    urlObj.headers,
                    customData,
                    opts,
                    urlObj,
                    argsObj
                );
            }
            return payLoad;
        }
        else{
            payLoad = resp
            if(payLoad && typeof payLoad != "object"){
                payLoad = JSON.parse(payLoad);
                argsObj.payLoad = payLoad;
            }
            var res = initCB(db,"serializer", def.serializer, baseSerz.GETMETA, { argsObj: argsObj, args:[payLoad,name,type,qP,customData,opts]}), metaRes;
            if(res){
                metaRes = res.data;
                if(!isEmpty(metaRes)){
                    payLoad.meta = metaRes;
                    argsObj.meta = payLoad.meta;
                }	
            }
            return payLoad;
        }
    }
    static sendingData(db,name,data,urlObj,type,customData,snapshot,argsObj,partial){
        var serializeKey = name, 
        payload = {}, 
        qP = urlObj ? urlObj.qP : undefined, 
        tempObj = {},
        def = db.schema[name];
        for (var key in urlObj){
            tempObj[key] = urlObj[key];
        }
        tempObj.type = type;
        tempObj.schema = name;
        argsObj.data = data;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        var res = initCB(db,"serializer", def.serializer, baseSerz.SERIALIZEKEY, { argsObj: argsObj, args:[name,type,customData,qP]});
        if(res){
            serializeKey = res.data;
        }
        data = baseSerz.serializeRecords(db,def,data,snapshot,tempObj,"serializeEntity",customData,argsObj,partial);
        if(!serializeKey){
            payload = data;
        }
        else if(Array.isArray(data) || typeof data == "object" || isEntity(data)){
            payload[serializeKey] = data;
        }
        argsObj.data = payload;
        var res = initCB(db,"serializer", def.serializer, baseSerz.SERIALIZE, { argsObj: argsObj, args:[type,payload,snapshot,customData,name,qP]});
        if(res){
            argsObj.data = payload = res.data;
        }   
        urlObj.data = payload;
    }
    static serializeRecords(db,schema,data,records,urlObj,type,customData,argsObj,partial){
        var defless = db.applicationConnector && db.applicationConnector.__type == "REST" ? db.applicationConnector.schemaless : undefined;
        if(!schema && defless){
            return data;
        }
        var rels = schema.relations;
        if(!records && type != "normalizeEntity"){
            records = db.cache.getEntity(schema.def, data.$.pK);
        }
        var result, 
        baseSerz = schema && schema.serializer ? schema.serializer.constructor : db.constructor.Serializer;
        if(Array.isArray(data)){
            result = [];
            for(var index1=0;index1<data.length;index1++){
                var record = data[index1];
                if(record && typeof record === "object")
                {
                    result.push(baseSerz.serializeSingleRecord(db,schema,record,records ? records[index1]:undefined,urlObj,rels,type,customData,argsObj,partial));
                }
                else{
                    result.push(record);
                }
            }
        }
        else if(data){
            result = data;
            if(data && typeof data === "object"){
                result = baseSerz.serializeSingleRecord(db,schema,data,records,urlObj,rels,type,customData,argsObj,partial)
            }
        }
        return result;
    }
    static serializeSingleRecord(db,def,data,record,urlObj,rels,type,customData,argsObj,partial){
        var partObj;
        type == "serializeRecord" && typeof data == "object" && data.$ == undefined ? store.$.defProp(data, "$", {}): data;
        if(typeof partial == "object" && record && record.$ && record.$.pK){
            partObj = partial.get ? partial.get(record.$.pK):partial;
            if(data.$ && data.$._partialObj){
                var data$; 
                data$ = Object.assign({}, data.$);
                data = Object.assign({}, data);
                store.$.defProp(data, "$", data$);
            }
            var relDirty =  store.$.isDirty(record,record.$.schema.relations);
            if(record.$.isModified || (Array.isArray(relDirty) && relDirty.length != 0)){
                var dirtAttr = record.$.getDirtyAttributes();
                Array.isArray(relDirty) && dirtAttr.concat(relDirty);
                var keys = Object.keys(data);
                !partObj.hasOwnProperty("_removedAttr")?Object.defineProperties(partObj,{_removedAttr : {value : {} }}):undefined; 
                dirtAttr.forEach(function(val){
                    if(!keys.includes(val) && !record.$.schema._arrPk.includes(val)){
                        partObj._removedAttr[val] = true;
                    }
                })
            }
            Object.defineProperties(data.$,{
                _partialObj:{
                    value:partObj
                },
                _pkVal:{
                    value:record.$.pK
                },
                _model:{
                    value:model_name
                },
                _payloadObj:{
                    value:data
                }
            })
        }
        type == "serializeRecord" ? store.$.defpayObjUtls(data.$) : undefined;
        var name = def && def._name ? def._name : def,
        baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer, 
        scope = cbScp(db,def.serializer,type == "serializeEntity" ? baseSerz.SERIALIZEENTITY : baseSerz.NORMALIZEENTITY,"serializer");
        if(scope){
            var args;
            var oPLoad = argsObj.payLoad
            if(type == "serializeEntity"){
                argsObj.entityData = data;
                argsObj.cachedData = record;
                args = [argsObj];
            }
            else{
                argsObj.entityData = data;
                argsObj.entityPayload = data;
                args = [argsObj];
            }
            data = cB(scope,args);
            argsObj.payLoad = oPLoad;
        }
        if(rels){
            rels.forEach(function(rel, key){
                var relLen = rel.length;
                for(var i=0; i<relLen; i++){
                    var field = rel[i];
                    var val = data[field.relKey], recs, res, relTo, srz, isPoly;
                    if(field.type == "relation" && val && ( type == "normalizeEntity" || ( type == "serializeEntity" && field.opts && field.opts.serialize && field.opts.serialize != "id"))){
                        recs = record ? record[field.relKey] : undefined, relTo = getSchemaObj(db, field.relatedTo), srz = field.opts ? field.opts.serialize : undefined;
                        isPoly = field.opts ? field.opts.polymorphic : undefined
                        if(field.relType === "hasMany"){
                            if(!Array.isArray(val)){
                                val = [val];
                            }
                            var valLen = val.length, res = [];
                            for(var index1=0;index1<valLen;index1++){
                                var _relTo = relTo;
                                if(isPoly){
                                    if(type == "normalizeEntity"){
                                        _relTo = val[index1] && val[index1]._type ? val[index1]._type : relTo; 
                                    }
                                    else if(type == "serializeEntity"){
                                        if(srz == "record"){
                                            _relTo = recs && isEntity(recs[index1]) ? recs[index1].$.schema._name : relTo;
                                        }
                                        else if(srz == "partial"){
                                            _relTo =  val[index1] && val[index1].$ ?  val[index1].$.polymorphicType : relTo;
                                        }
                                    }
                                }	
                                res.push(baseSerz.serializeRecords(db,relTo,val[index1],undefined,urlObj,type,customData,argsObj));
                            }
                            data[field.relKey] = res;
                        }
                        else {
                            var _relTo = relTo;
                            if(isPoly){
                                if(type == "normalizeEntity"){
                                    _relTo = data[field.relKey] && data[field.relKey]._type ? data[field.relKey]._type : relTo; 
                                }
                                else if(type == "serializeEntity"){
                                    _relTo = isEntity(record[field.relKey]) ? record[field.relKey].$.schema._name : relTo;									
                                }
                            }	
                            data[field.relKey] = baseSerz.serializeRecords(db,_relTo,data[field.relKey],record ? record[field.relKey] : undefined,urlObj,type,customData,argsObj);
                        }
                    }	
                }
            });
        }
        return data;
    }
    static buildJSON(db, def, type, payLoad, id, status, urlObj, customData, qP, argsObj){
        var headers = urlObj ?  urlObj.headers : undefined, 
        realData = payLoad,
        name = def && def._name ? def._name : def;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        var res = initCB(db, "serializer", def.serializer, baseSerz.NORMALIZE, { argsObj: argsObj, args:[name, type, realData, id, status, headers, urlObj ? urlObj.qP : undefined,customData]});
        if(res){
            argsObj.payLoad = realData = res.data;
            
        }
        var changed = false, recs, isGet = type == "get";
        if(!isGet && realData && typeof realData == "object"){
            res = initCB(db,"serializer", def.serializer, baseSerz.NORMALIZEKEY, { argsObj: argsObj, args:[name,type,undefined,qP,customData]});
            if(res){
                var plKey = res.data;
                if(plKey && plKey != name){
                    var temp = realData[plKey];
                    realData[name] = temp;		
                    delete realData[plKey];
                }	
            }
        }    
        if(isGet || (realData && realData[name])){
            recs = realData[name], changed = true;
            // Internal release
            var scope = cbScp(db, def.serializer, baseSerz.PROCESSENTITY, "serializer");
            if(scope){
                if(Array.isArray(recs)){
                    for(var i=0; i<recs.length; i++){
                        argsObj.entityData = recs[i];
                        recs[i] = cB(scope, [argsObj]);
                    }
                }					
                else{
                    argsObj.entityData = recs;
                    recs = cB(scope, [argsObj]);
                }
            }
            var flUrlObj = type != "pushPayload" ? {url:urlObj.url, method:urlObj.method, headers:urlObj.headers, type: type, qP : urlObj.qP, withCredentials: urlObj.withCredentials, schema :name} : undefined;
            recs = baseSerz.serializeRecords(db, def, recs, undefined, flUrlObj, baseSerz.NORMALIZEENTITY, customData, argsObj);
            realData[name] = recs;
            argsObj.payLoad = realData;
        }
        return realData;
    }
    static normalizeResponse(db, def, type, payLoad, id, status, urlObj, customData, opts, argsObj){
        var headers = urlObj ? urlObj.headers : undefined,
        name = def && def._name ? def._name : def, realData;
        argsObj.payLoad = realData = payLoad;
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        var res = initCB(db,"serializer", def.serializer, baseSerz.NORMALIZE, { argsObj: argsObj, args:[name, type, realData, id, status, headers, urlObj ? urlObj.qP : undefined, customData, opts]});
        if(res){
            argsObj.payLoad = realData = res.data;
        }
        return realData;
    }
    static normalize(db,def,type,payLoad,id,status,headers,customData,opts,urlObj,argsObj){
        var realData = payLoad, 
        changed = false,
        name = def && def._name ? def._name : def;
        if(type == "get" || realData[name]){
            realData = realData[name];
            changed = true;
        }
        // Internal release
        var baseSerz = def && def.serializer ? def.serializer.constructor : db.constructor.Serializer;
        var scope = cbScp(db,def.serializer, baseSerz.PROCESSENTITY, "serializer");
        if(scope){
            if(Array.isArray(realData)){
                for(var i=0; i<realData.length; i++){
                    argsObj.entityData = realData[i];
                    realData[i] = cB(scope, [argsObj]);
                }
            }					
            else{
                argsObj.entityData = realData;
                realData = cB(scope, [argsObj]);
            }
        }
        
        argsObj.payLoad = realData;
        if(changed){
            payLoad = {};
            realData = baseSerz.serializeRecords(db, def, realData, undefined, {url:urlObj.url, method:urlObj.method, headers:urlObj.headers, type: type, qP : urlObj.qP, withCredentials: urlObj.withCredentials, schema :name}, "normalizeEntity", customData, argsObj)
            payLoad[name] = realData;
        }
        argsObj.payLoad = payLoad;
    }
}

Serializer.__lMod = "Serializer";

export { Serializer };