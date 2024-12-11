import { getFromCB, _defProp, getDefaultVal, establishObsBindings, getpKVal, isDirty, recChk, setData, rllBckRecArr, deleteDeepNest, cmpSet, removeParentNesting, deleteFromArray, genUnRedoStack, rollBackDelete, rollBackNew, removeOnSave, evAdd, evRemove, evEmit, validateRecord, updateJSON, getInd, toJSON, unredoOp, deepCopyStack, deepCopyAttrs, setState, mergeResponse, getSchemaObj, changePersist} from "./utils.js";
import { Dberror, ValidationError } from "./dberror";
import { removeFromStore } from './utils';
import { deepCopyObject, establishObjectBinding } from "@slyte/core/src/lyte-utils.js";
import { Connector } from "./Connector.js";

class Entity {
    constructor(name,data,opts){
        var def = db.getSchema(name), delayPers = opts ? opts.delayPersistence : getFromCB(db, "connector", def.connector, "delayPersistence");
        Object.assign(this, data);
        Object.defineProperties(this, {
            $ : {
                writable : true,
                value : new $Entity(this, def, delayPers)
            }
        });
        var parent = db.$.saveParent;
        if(parent && this !== parent){
            _defProp(this.$, "parent", parent);
        }
        var defF = def._fldGrps.default;
        var watchF = def._fldGrps.watch;
        var hasManyF = def._fldGrps.hasMany;
        for(var dKey in defF){
            var dFld = defF[dKey];
            var fldVal = data[dKey];
            if(fldVal === undefined || fldVal === ""){
                this[dKey] = getDefaultVal(this, dFld.default);
            }
        }

        for( var k in model.fieldList){
            var field= model.fieldList[k];
            if(/^(array|object)$/.test(field.type) && (field.properties || field.items)){
                establishObjectBinding(this,k,true,undefined,undefined,(field && field.watch)?field.watch:undefined);
            }
        }
    
        // for(var wKey in watchF){
        //     establishObjectBinding(this, wKey, true);
        // }
        for(var hKey in hasManyF){
            var hFld = hasManyF[hKey];
            if(this.hasOwnProperty(hKey)){
                this[hKey] = Array.isArray(this[hKey]) ? Array.from(this[hKey]) : this[hKey];
            }
            else if(hFld.relatedTo){
                var toInit = getFromCB(db,"serializer", getSchemaObj(db,hFld.relatedTo).serializer, "initHasManyRelation");
                if(toInit){
                    this[hKey] = [];
                }
            }
        }
        var props = def._properties;
        if(Object.keys(props).length){
            if(!this._bindings){
                _defProp(this, '_bindings', new Set(), false, true, true);
            }
            this._bindings.add(props);
            establishObsBindings(this,props);
        }
    }
}
Entity.__lMod = "Entity";
class $Entity {
    constructor(ins, def, delayPers, db){
        // def = getSchemaObj(db, def);
        this.isModified = false;
        this.isNew = false;
        this.isDeleted = false;
        this.isError = false;
        this.error = {};
        this.db = db;
        this.isUnloaded = false;
        var pkVal = getpKVal(ins, def);
        Object.defineProperties(this, {
            events:{ 
                value : [],
                writable : true
            }, 
            validatedOnCreate:{ 
                value : true,
                writable: true
            },
            pK:{
                value: pkVal,
                writable: true
            },
            schema : {
                value : def
            },
            _attributes : {
                value : {} ,
                writable : true
            },
            _relationships : {
                value : {},
                writable : true
            },
            isDirty: {
                value: function value(){
                    var result = [];
                    var ins = this.entity;
                    if(ins.$.isModified){
                        return true;
                    }
                    result = isDirty(db, ins, this.schema.relations);
                    if(result.length){
                        return result;
                    }
                    return false;
                }
            },
            undoStack : {
                value : genUnRedoStack(),
                writable : true
            },
            redoStack : {
                value : genUnRedoStack(),
                writable : true
            },
            delayPersistence : {
                value : delayPers
            },
            entity: {
                value: ins
            }
        });
        this.inIDB = false;
        this.isPersisted = true;
        this.strictLock = def.db && def.db.entityStrictLock ? def.db.entityStrictLock : false; 
    }
    get(attr){
        if(this.db.lyte && this.db.lyte.$utils && this.db.lyte.get){
            return this.db.lyte.$utils._get(this.entity,attr)
        }
        else{
            if(recChk(this.db.lyte, this.entity)){
                return this.entity[attr];
            }
        }
    }
    set(attr, value, opts){
        if(recChk(this.db.lyte, this.entity)){
            if(this.isUnloaded){
                ValidationError.setRecErr(this, this.schema._pK, "ERR17");
            }
            else{
                setData(this, attr, value, opts);
            }
            return this.entity;
        }
    }
    getDirtyProps(){
        if(recChk(this.db.lyte, this.entity)){
            var ret = [];
            var attributes = this._attributes;
            if(Object.keys(attributes).length){
                for(var key in attributes){
                    ret.push(key);
                }
            }
            return ret;
        }
    }
    revertProps(attr){
        if(recChk(this.db.lyte, this.entity)){
            if(!Array.isArray(attr)){
                attr = [attr];
            }
            var ins = this.entity, changed = [], def = this.schema, _attrs = this._attributes;
            for(var i=0; i<attr.length; i++){
                var key = attr[i];
                if(_attrs.hasOwnProperty(key)){
                    var field = def.fieldList[key], oldVal = _attrs[key];
                    if(field.type == "relation"){
                        rllBckRecArr(def.db, oldVal && oldVal._changes ? oldVal._changes : oldVal, ins, def, field);
                        var obj = ins.$.dN && ins.$.dN.hasOwnProperty(key) ? ins.$.dN[key] : new Map();
                        for(var dnArr of obj){
                            deleteDeepNest(ins, key, dnArr[0]);
                        }
                    }
                    else{
                        cmpSet( def.db.lyte, ins, key, oldVal, undefined, true );
                    }
                    changed.push(key);
                    delete _attrs[key];
                }
                ValidationError.clrRecErr(this, key);
            }
            if(!Object.keys(this._attributes).length){
                if((!this.hasOwnProperty("dN") || ( this.dN && !Object.keys(this.dN).length )) && !ins.$.isNew){
                    removeParentNesting(ins, undefined, "modified");
                }
                cmpSet(def.db.lyte, this, "isModified", false);
                changePersist(this.entity, true);
                if(!this.isNew){
                    deleteFromArray(def.dirty, this.get(def._pK));
                }
            }
            if(changed.length > 0){
                var arr = [ins,changed];
                this.emit("change", arr);
                def.emit("change", arr);
                this.undoStack = genUnRedoStack();
                this.redoStack = genUnRedoStack();
            }
        }
    }
    revert(state){
        if(recChk(this.db.lyte, this.entity)){
            var def = this.schema, pK = def._pK;
            if(state){
                this.revertToState(state);
            }
            else {
                if(this.isModified){
                    this.revertProps(this.getDirtyProps());
                    delete this._savedState;
                }
                if(this.isDeleted){
                    // var index = getInd(model._deleted, pK, this.get(pK));
                    rollBackDelete(def, this.get(pK));
                }
                else if(this.isNew){
                    rollBackNew(def, this.entity, pK);
                }			
                else if(this.isError){
                    ValidationError.clrRecErr(this);
                }
            }
            removeOnSave(def.db, this.schema._name, this.entity.$.pK);
        }
    }
    delete(delayPers){
        if(recChk(this.db.lyte, this.entity)){
            var def = this.schema, ins = this.entity, 
            delayPers = ( delayPers !== undefined ) ? delayPers : (ins.$.delayPersistence ? ins.$.delayPersistence.delete : false); 
            removeFromStore(def, ins.$.pK, undefined, undefined, delayPers);
        }
    }
    destroy(customData,qP,delayPers){
        if(recChk(this.db.lyte, this.entity)){
            this.delete(delayPers);
            return this.save(customData,qP,"destroyRecord");
        }
    }
    addEventListener(type, func){
        if(recChk(this.db.lyte, this.entity)){
            return evAdd(this, type, func);
        }
    }
    removeEventListener(id){
        if(recChk(this.db.lyte, this.entity)){
            evRemove(this,id);
        }
    }
    emit(type, args){
        if(recChk(this.db.lyte, this.entity)){
            evEmit(this,type,args);
        }
    }
    triggerAction(actionName,customData,qP,method,data){
        if(recChk(this.db.lyte, this.entity)){
            var def = this.schema, 
			db = def.db,
			actions = def.actions, 
			action = (actions) ? actions[actionName] : undefined;
            if(action){
                return def.connector.constructor.handleAction(db,actionName,def,this.entity,customData,qP,method,data);
            }
            return Promise.reject({code : "ERR18", message : Dberror.errorCodes.ERR18, data : actionName});
        }
    }
    save(customData,qP,options,destroy,mutationName){
        if(recChk(this.db.lyte, this.entity)){
            var def = this.schema, 
			db = def.db,
			ins = this.entity, 
			dirty = this.isDirty(), 
			validateOnSave = options && options.validateOnSave, 
			skipValidation = options && options.skipValidation, 
			fields = def.fieldList, 
			ret;
            if(this.isUnloaded !== true){
                if(this.isDeleted){
                    if(!this.isNew){
                        return Connector.del(db, def._name, ins, true, destroy, customData, qP, mutationName);
                    }
                }
                else if(this.isNew){
                    var err = this;
                    if(!skipValidation && (!ins.$.validatedOnCreate || validateOnSave)){
                        ret = validateRecord(db, this.entity, fields);
                    }
                    if(!skipValidation && (ret == false || (err && err.error && Object.keys(err.error).length > 0))){
                        return Promise.reject(err.error);
                    }
                    return Connector.create(db, def._name, ins, true , customData, qP, mutationName);
                }
                else if(this.isModified || (dirty && dirty.length) ){
                    var data = {};
                    if(!skipValidation && (options && validateOnSave)){
                        ret = validateRecord(db, this.entity, fields);
                    }
                    if(!skipValidation){
                        if(ret == false || (ins && ins.$ && ins.$.isError)){
                            return Promise.reject(ins.$.error);
                        }
                    }
                    var data = updateJSON(db, this.entity, def, dirty);
                    return Connector.put(db, def._name, data, ins, true, customData, qP, mutationName);
                }
            }
            else{
                Dberror.warn(db.lyte,"LD29", typeof ins.$.pK == "object" ? JSON.stringify(ins.$.pK) : ins.$.pK, def._name)
				var rejectUnloadRecordSave = getFromCB(db, "connector", def.connector, "rejectUnloadRecordSave");
				if(rejectUnloadRecordSave){
					return Promise.reject({code: "ERR28", message: Dberror.errorCodes.ERR28, data: ins});
				}
			}
            return Promise.resolve();
        }
    }
    getInitialValues(attr){
        if(recChk(this.db.lyte, this.entity)){
            var isAttrPassed = false;
            if(attr){
                if(!Array.isArray(attr)){
                    attr = [attr];
                }
                isAttrPassed = true;
            }
            else{
                attr = this.getDirtyProps();
            }
            var ret = {}, rec = this.entity, _attrs = this._attributes;
            for(var i=0; i<attr.length; i++){
                if(rec[attr] == undefined || !rec[attr[i]].add){
                    ret[attr[i]] = _attrs[attr[i]];					
                }
                else{
                    ret[attr[i]] = rec[attr[i]].slice(0);
                    var arr = _attrs[attr[i]] && _attrs[attr[i]]._changes ? _attrs[attr[i]]._changes : [], 
                    isPoly = rec[attr[i]].polymorphic,
                    pK = !isPoly ? rec[attr[i]].schema._pK : undefined;
                    for(var j=arr.length-1; j>=0; j--){
                        if(arr[j]._type == "added"){
                            for(var k=0; k<arr[j].records.length; k++){
                                var index = getInd(ret[attr[i]], !isPoly ? pK : arr[j].records[k].$.schema._pK, arr[j].records[k].$.pK);
                                if(index == -1){
                                    continue;
                                }
                                ret[attr[i]].splice(index, 1);
                            }
                        }
                        else if(arr[j]._type == "removed"){
                            for(var k=arr[j].records.length-1; k>=0; k--){
                                ret[attr[i]].splice(arr[j]._indices[k], 0, arr[j].records[k]);
                            }
                        }
                        else if(arr[j]._type == "changed"){
                            ret[attr[i]] = Array.isArray(arr[j].records) ? Array.from(arr[j].records) : arr[j].records;
                        }
                    }
                }
            }
            if(isAttrPassed){
                return ret[attr[0]];
            }
            return ret;
        }
    }
    toJSON(type){
        if(recChk(this.db.lyte, this.entity)){
            var db = this.schema.db,addNotDefinedFields,
            parentRel = arguments[1];
            if(typeof type == "object" && type.hasOwnProperty("addNotDefinedFields")){
                addNotDefinedFields = type.addNotDefinedFields?true:false
                type = undefined;
            }
            return Object.assign({}, toJSON(db, this.schema._name, this.entity, !type ? true : type, undefined, undefined, parentRel,addNotDefinedFields));
        }
    }
    undo(attr, state){
        if(recChk(this.db.lyte, this.entity)){
            var currentState = this.undoStack._order_.length;
            state = state || (currentState ? currentState - 1 : currentState);
            // state = state || 0;
            while(currentState-- > state){
                unredoOp(1, this, attr);
            }
        }
    }
    getCurrentState(){
        if(recChk(this.db.lyte, this.entity)){
            return this.undoStack._order_.length;
        }
    }
    redo(attr){
        if(recChk(this.db.lyte, this.entity)){
            unredoOp(2,this,attr);
        }
    }
    validate(arr){
        if(recChk(this.db.lyte, this.entity)){
            var fields = {};
            var def = this.schema;
            var fieldList = def.fieldList;
            if(Array.isArray(arr)){
                arr.forEach(function(item, index){
                    if(fieldList[item]){
                        fields[item] = fieldList[item];
                    }
                });
            }
            if(Object.keys(fields).length == 0){
                fields = fieldList;
            }
            validateRecord(def.db, this.entity, fields);				
        }
    }
    saveState(state){
        if(recChk(this.db.lyte, this.entity)){
            var fromRel = arguments[1];
            var parentRel = arguments[2];
            if(!fromRel){
                if(!this.isNew && !this.isModified){
                    Dberror.warn(this.db.lyte,"LD20");
                    return;
                }
                var savedState = this._savedState = this._savedState || {};
                var currentState = state, randomState;
                while(!currentState){
                    randomState = Math.floor(Math.random()*100000 + 1);
                    currentState = !savedState.hasOwnProperty(randomState) ? randomState : currentState;
                }
            }
            var obj = this.toJSON("state", parentRel);
            _defProp(obj, "$", {}, false, true);
            _defProp(obj.$, "isSavedState", true, false, true);
            _defProp(obj.$, "pK", this.entity.$.pK, false, true);
            var pK = this.schema._arrPk;
            pK.forEach(function(val){
                delete obj[val];
            });
            var undoStack = this.undoStack;
            var redoStack = this.redoStack;
            var _attributes = this._attributes;
            // var dN = this.entity.$.dN;
            if(undoStack && Object.keys(undoStack).length){
                var _order = undoStack._order_;
                undoStack = obj.$.undoStack = deepCopyStack(undoStack);
                _defProp(undoStack, "_order_", deepCopyObject(_order), false, true);
            }
            if(redoStack && Object.keys(redoStack).length){
                var _order = redoStack._order_;
                redoStack = obj.$.redoStack = deepCopyStack(redoStack);
                _defProp(redoStack, "_order_", deepCopyObject(_order), false, true);
            }			
            if(_attributes && Object.keys(_attributes).length){
                obj.$._attributes = deepCopyAttrs(this.schema, _attributes);
            }
            if(!fromRel){
                this._savedState[currentState] = obj; 
                return currentState;
            }else{
                return obj;	
            }
        }
    }
    clearState(state){
        if(recChk(this.db.lyte, this.entity)){
            if(!state){
                this._savedState = {};
                return;
            }
            delete this._savedState[state];
        }
    }
    revertToState(state){
        if(recChk(this.db.lyte, this.entity)){
            var savedSt = this._savedState
            var obj = savedSt ? savedSt[state] : undefined;
            if(!obj){
                Dberror.warn(this.db.lyte, "LD21", state);
                return;
            }
            setState(this, obj);
            delete this._savedState[state];
        }
    }
    hasSavedState(state){
        if(recChk(this.db.lyte, this.entity)){
            return this._savedState && this._savedState.hasOwnProperty(state) ? true : false;
        }
    }
    clone(){
        if(recChk(this.db.lyte, this.entity)){
            var parentRel = arguments[0];
            var obj = this.toJSON("clone", parentRel);
            return this.schema.db.newEntity(this.schema.def, obj);
        }
    }
    persist(obj){
        if(recChk(this.db.lyte, this.entity)){
            var schema = this.schema, 
			name = schema._name,
			db = schema.db, 
			ins = this.entity, 
			partialObj = {obj:new Map()}, 
            type, 
            dirty;
            if(this.isNew){
                type = "create";
                toJSON(db, name, ins, undefined, "create", partialObj);
            }
            else if(dirty = this.isDirty()){
                var data = updateJSON(db, ins, this.schema, dirty);
                toJSON(db, name, data, undefined, undefined, partialObj);
            }
            var pObj = partialObj.obj.get(this.pK);
            mergeResponse(db, ins, this.schema, undefined, this.pK, pObj, true);
            if(db.idbIns){
                db.idbIns.updateIDB(db, name, type ? type : ins.$.isDeleted ? "deleteEntity" : ins.$.isModified || dirty ? "updateEntity" : undefined, ins);
            }
        }
    }
}
$Entity.__lMod = "$Entity";
_defProp(Entity, "strictValueSet", true);
_defProp(Entity, "strictRelSet", true);
export { Entity, $Entity };