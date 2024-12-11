import { Dberror, ValidationError } from "./dberror";
import { Schema } from "./Schema.js";
import { cmpData,nestScp,isEntity, deepCopyObject, establishObjectBinding, checkProperty, newGetSuperClass, defProp, removeNestScp } from "@slyte/core/src/lyte-utils.js";
import { Entity } from "./Entity.js";
// import { isMixin } from "../../core/src/lyte-utils";

// function getOrigParent(cls){
// 	var prt = Object.getPrototypeOf(cls);
// 	while(isMixin(prt)){
// 		prt = Object.getPrototypeOf(prt);
// 	}
// 	return prt;
// }

function changePersist(record, value){
	if(!record.$.isUnloaded || record.$.isPeristed !== value){
		switch(value){
			case true: {
				if(!record.$.isNew && !record.$.isModified && !record.$.isDeleted){
					cmpSet(undefined, record.$, "isPersisted", true);
				}
				break;
			}
			case false: {
				if(record.$.isNew || record.$.isModified || record.$.isDeleted || (record.$.dN && Object.keys(record.$.dN) && Object.keys(record.$.dN).length)){
					cmpSet(undefined, record.$, "isPersisted", false);
				}
				break;
			}
		}
	}
}

function getSchemaObj(db, schema){
	var schemaObj = db._schema.get(schema);
	if(!schemaObj && db.subDbs){
		var len = db.subDbs.length;
		for(var i=0;i<len;i++){
			var subDb = db.subDbs[i];
			if(subDb._schema.get(schema)){
				schemaObj = subDb._schema.get(schema);
				break;
			}
		}
	}
	return schemaObj;
}

function dbModName(name, type, pascalToCamel){
	var mp = { Schema : /([a-zA-Z0-9])(Schema)$/g, Connector: /([a-zA-Z0-9])(Connector)$/g, Serializer : /([a-zA-Z0-9])(Serializer)$/g };
	name = name.replace(mp[type], '$1');
	return pascalToCamel !== false ? name.slice(0, 1).toLowerCase() + name.slice(1) : name;
}

function schArgs(){
	var arg1 = arguments[0], args;
	if(typeof arg1 == "object"){
		arg1.schema = this;
		args = [arg1]
	}
	else{
		args = Array.from(arguments);
		args.splice(0,0,this);
	}
	return args;
}

function evAdd(scope,type,func){
	scope.events = scope.events || {};
	scope.events[type] = scope.events[type] || [];
	scope.events[type].push({f : func});
	return type+"-"+(scope.events[type].length-1);              
}

function evRemove(scope,id){
	var type;
	if(id){
		if(/^(add|remove|change)$/.test(id)){
			type = id;
			(scope.events && scope.events[type]) ? delete scope.events[type] : undefined;   
		}
		else{
			var arr = id ? id.split("-") : undefined;
			if(arr){
				var listeners = scope.events[arr[0]];
				if(listeners && arr[1]){
					listeners[arr[1]] = null;
				}   
			}            
		}
	}else{
		var ev = scope.events;
		for(var evType in ev){
			(ev && ev[evType]) ? delete ev[evType] : undefined;
		}
	}
}

function evEmit(scope,type,args){
	var listeners = (scope.events && scope.events[type]) ? scope.events[type] : [];
	for(var i=0; i<listeners.length; i++){
		(listeners[i]) ? listeners[i].f.apply(null, args) : undefined;
	}            
}

function addTo_Del(def, data, ind){
	var deleted = def._deleted = def._deleted || new Map(), 
	obj = { index : ind , data : data };
	deleted.set(data.$.pK, obj);
}

function genUnRedoStack(){
	var obj = {};
	_defProp(obj, "_order_", [], false);
	return obj;
}

function deepCopyStack(stack){
	if(stack && typeof(stack) == "object"){
		stack = Object.assign({},stack);
		for(var attr in stack){
			if(Array.isArray(stack[attr])){
				var arr = stack[attr] = Array.from(stack[attr]);
				arr.forEach(function(itm,idx){
					arr[idx] = Object.assign(itm);
				});
			}
		}
	}
	return stack;
}

function deepCopyAttrs(def,obj){
	var fields = def.fieldList, 
	obj = Object.assign({},obj);
	for(var attr in obj){
		var _attr = obj[attr];
		if(fields[attr] && fields[attr].type == "relation" && Array.isArray(_attr)){
			_attr = obj[attr] = Array.from(_attr);
			_attr.forEach(function(itm, idx){
				_attr[idx] = Object.assign({}, itm);
				itm.hasOwnProperty("records") && itm.records ? (itm.records = Array.from(itm.records)) : undefined;
				itm.hasOwnProperty("_indices") && itm._indices ? (itm._indices = Array.from(itm._indices)) : undefined;
			});
		}
	}
	return obj;
}

function unredoOp(type,rec,attr){
	var stack, revStack;
	var lyte = rec.schema.db.lyte;
	if(type == 1){
		stack = rec.undoStack;
		revStack = rec.redoStack;
	}
	else{
		stack = rec.redoStack;
		revStack = rec.undoStack;
	}
	var attrs=[], obj, revObj = {};
	if(attr){
		if(!Array.isArray(attr)){
			attrs=[attr];
		}
		else{
			attrs = attr;
		}
		attrs.forEach(function(item){
			if(stack[item].length){
			var len = stack._order_.length;
			for (var index=len-1;index>=0;index--){
				var order = stack._order_[index];
				var attrIndex = order.indexOf(item);
				if(attrIndex > -1){
					order.splice(attrIndex,1);
						if(!order.length){
							stack._order_.splice(index,1);
						}
						break;
					}
				}
			}
		});
	}
	else{
		attrs = stack._order_ && stack._order_.length ? stack._order_.pop() : attrs;
	}
	if(attrs.length){
		for(var index=0;index<attrs.length;index++){
			var key=attrs[index], obj = stack[key].pop();
			if(obj._type == "update"){
				if(obj.hasOwnProperty("val")){
					setData(rec,key,obj.val,undefined, revObj);
					// redoObj[key] = undo;
				}
				else if(obj.hasOwnProperty("records")){
					setData(rec,key,obj.records,undefined, revObj)	
				}
			}
			else if(type == 1 && obj._type == "propAdd"){
				if(typeof lyte != "undefined"){
					revObj[key] = {_type:"propDelete", val:rec.entity[key]};
					if(obj.hasOwnProperty("val")){
						setData(rec,key,obj.val,undefined, {});
						// redoObj[key] = undo;
					}
					if(lyte.objectUtils){
						lyte.objectUtils(rec.entity, "delete", key);
					}
					else{
						delete rec.entity[key];
					}
				}
				else{
					delete rec.entity[key];
				}
			}
			else if(type == 2 && obj._type == "propDelete"){
				revObj[key] = {_type:"propAdd"}
				setData(rec,key,obj.val,undefined, revObj);
			}
			else if(obj._type == "added"){
				rec.entity.$.get(key).remove(obj.records,undefined,revObj);
			}
			else if(obj._type == "removed"){
				rllBckRecArr(rec.schema.db, [obj], rec.entity, rec.schema, rec.schema.fieldList[key])
				obj._type = "added";
				revObj[key] = obj;
			}
		}
		var keys = Object.keys(revObj);
		for(var index=0;index<keys.length;index++){
			var key = keys[index];
			revStack[key] = revStack[key] || [];
			revStack[key].push(revObj[key]);
		}
		if(keys.length){
			// rec.redoStack._order_ = rec.redoStack._order_ || [];
			revStack._order_.push(keys);
		}
	}
}

function unregisterDef(db, schema){
	schema = getSchemaObj(db, schema);
	if(schema){
		var name = schema._name;
		if(schema.data.length){
			db.dropAll(schema.def);
		}
		var extendedBy = schema.extendedBy;
		if(extendedBy && Object.keys(extendedBy).length){
			for(var ext in extendedBy){
				unregisterDef(db, db.schema[ext].def);
			}
		}
		if(schema.extend){
			var extend = db.getSchemaObj(schema.extend);
			if(extend){
				delete extend.extendedBy[name];
			}
		}
		delete db.schema[name];  
		delete db.constructor.Schema.schema[name];
		db._schema.delete(schema.def);
	}
}

function updateFieldValidation(db, schema, key, deserialize, ignoreValidation){
	var records = schema.data, 
	fields = schema.fieldList;
	records.forEach(function(item){
		var field = fields[key], 
		isOldVal = item.$.error && item.$.error.hasOwnProperty(key) && item.$.error[key].hasOwnProperty("value") ? true : false, 
		oldVal = isOldVal ? item.$.error[key].value : undefined;
		ValidationError.clrRecErr(item.$, key);
		if(deserialize){
			var fldTypeName = field.type._name, 
			empD = getDsrzEmpData(schema, field, schema._name), 
			boolChk = !empD && item[key];
			if((item.hasOwnProperty(key) && (boolChk || empD) && db.dataType[fldTypeName].hasOwnProperty("deserialize"))){
				item[key] = db.dataType[fldTypeName].deserialize(item[key],key,schema._name,getpKVal(item,schema));
			}
		}
		isOldVal ? validateField(db, item, key, fields[key], undefined, {old:true, value:oldVal}) : validateField(db, item, key, fields[key], undefined)
		if(!ignoreValidation){
			var isOldVal = item.$.error && item.$.error.hasOwnProperty(key) && item.$.error[key].hasOwnProperty("value") ? true : false;
			var oldVal = isOldVal ? item.$.error[key].value : undefined;
			ValidationError.clrRecErr(item.$, key);
			isOldVal ? validateField(db, item, key, field, undefined, {old:true, value:oldVal}) : validateField(db, item, key, fields[key], undefined)
		}
		if(isOldVal && item.$.error && Object.keys(item.$.error) === 0){
			item.$.set(key, oldVal);
		}
	});
}

function handleCachedResponse(db,batch,resp){
	var cached = db.$.cachedBatch = db.$.cachedBatch || {}, 
	arr = cached[batch] || [], 
	count = 0;
	arr.forEach(function(item,index){
		resp.splice((item.ind+count++),0,item.data);
	});
	delete cached[batch];
	return resp;
}

function addToCachedBatch(db, data){
	var curr = db.$.currentBatch, 
	cached = db.$.cachedBatch = db.$.cachedBatch || {}, 
	cachedB = cached[curr] = cached[curr] || [], 
	arr = db.$.batch[curr] || [], 
	ind = arr.length;
	cachedB.push({ind:ind, data:data});
}

function checkObjAndAddToArr(arr, obj, keys){
	var len = Object.keys(keys).length, res = -1, arrLen = arr.length;
	for(var k=0; k<arrLen; k++){
		var item = arr[k];
		var i=0;
		for(var key in keys){
			if(item[key] == obj[key]){
				i++;
			}	
		}
		if(i == len){
			res = k;
			arr.splice(k,1,obj);
			return;
		}
	}
	if(res == -1){
		arr.push(obj);
	}
	return res;
}

function addToRelate(db, name, data, rel, key){
	var relMod = getSchemaObj(db, rel.forward.relatedTo), 
	toRelMod = db.$.toRelate[relMod._name] = db.$.toRelate[relMod._name] || new Map();
	if(!toRelMod.has(key)){
		toRelMod.set(key, []);
	}
	var toRel = toRelMod.get(key), 
	pkVal = data.$.pK, 
	obj = {schema : name, pkVal : pkVal, key : rel.forward.relKey};
	toRel.push(obj);
	// checkObjAndAddToArr(toRel, obj, ["record","key"]);
}

function getDefaultVal(rec, defVal){
	if(typeof defVal != "function"){
		return defVal;
	}
	else{
		return defVal.call(rec);
	}
}

function deepValueChange(rec, attr, value, changeObj){
	var toEmit = {emit : false, attr : [], oldRec : {}};
	estAttrs(rec, attr, value, toEmit, changeObj);
	checkAttrs(rec);
	changeCallbck(rec, toEmit);
}

function updateDn(record){
	var schema = record.$.schema, 
	relations = schema.relations;
	relations.forEach(function(rels, key){
		rels.forEach(function(itm){
			var options = itm.opts, 
			attr = itm.relKey, 
			relType = itm.relType ;
			if(options && options.deepNest == true){
				deepRelIter("updateDN", schema, record);
				if(record.hasOwnProperty(attr)){
					var relRec = record[attr];
					if(relType == "belongsTo" && (relRec.$.isModified || (relRec.$.dN && Object.keys(relRec.$.dN).length ))){
						setDeepNest(record, attr, relRec.$.pK, "updated", undefined, relRec)
					}
					else if(relType == "hasMany" && Array.isArray(relRec)){
						relRec.forEach(function(rec){
							if(rec.$.isModified || (rec.$.dN && Object.keys(rec.$.dN).length)){
								setDeepNest(record, attr, rec.$.pK, "updated", undefined, rec)
							}
						});
					}
				}
			}
		});
	});
}

function deepRelIter(type, def, record, parentRel){
	var relations = def.relations, db = def.db;
	relations.forEach(function(arr, key){
		arr.forEach(function(rel){
			var relKey = rel.relKey, isParent;
			var relType = rel.relType;
			var dN = rel.opts && rel.opts[type];
			if(parentRel){
				var relDef = getSchemaObj(db, rel.relatedTo);
				var child = getBackwardRel(def,rel, relDef);
				if(parentRel == child && def != relDef){
					isParent = true;
				}
			}
			if(!isParent && record.hasOwnProperty(relKey) && record[relKey] && dN){
				var relData = record[relKey];
				if(relType == "hasMany" && Array.isArray(relData)){
					relData.forEach(function(relRec){
						deepRelOptions(db, relRec, type, rel);
					});
				}
				else if(relType == "belongsTo" && isEntity(relData)){
					deepRelOptions(db, relData, type, rel);
				}
			}
		});		
	});
}

function deepRelOptions(db, relRec, type, rel){
	switch(type){
		case "rollback":
		{
			relRec.$.rollBack(undefined,rel);
			break;
		}	
		case "unload":
		{
			db.dropEntity(rel.relatedTo, relRec.$.pK, rel);
		}								
	}
}

function handleResults(db, results, partialRef){
	if(Array.isArray(results)){
		results.forEach(function(itm, idx){
			var refKey = partialRef.refKey;
			var refId = itm[refKey], refObj = partialRef.get(refId);
			if(refObj){
				mergePartialObj(db, refObj, undefined, itm, true);
			} 
		});
	}
	else{
		Dberror.warn(db.lyte, "results expected be a flat structure of type array, instead it was "+typeof(results));
	}
}

function handleResponse(db, data, response, schema, type, partialObj, status, partialRef){
	var pK = schema._pK, 
	partial, 
	obj, 
	pkVal;
	if(response.results && schema._name != "results"){
		handleResults(db,response.results, partialRef);
	}
	response = response[schema._name];
	if(Array.isArray(data)){
		for(var i=0; i<data.length; i++){
			obj = data[i], pkVal = obj.$.pK;
			partial = partialObj && obj && pkVal ?  partialObj.get(pkVal) : undefined;
			mergeResponse(db, data[i], schema, Array.isArray(response) ? response[i] : response, pK, partial);	
		}
	}
	else{
		pkVal = data.$.pK;
		partial = partialObj && data && pkVal ?  partialObj.get(pkVal) : undefined;
		mergeResponse(db, data, schema, response, pK, partial);	
	}
}

function setState(self, obj){
	self.dN ? self.dN = {} : undefined;
	setData(self, obj, undefined, undefined, {}, true);
	updateDn(self.entity);
	self.undoStack = obj.$.undoStack || genUnRedoStack();
	self.redoStack = obj.$.redoStack || genUnRedoStack();
	self._attributes = obj.$._attributes || {};
	checkAttrs(self.entity);
}

function validateRelatedRecord(db, record, key, field){
	var fields = getSchemaObj(db, field.relatedTo).fieldList;
	if(field && field.opts && record && record.hasOwnProperty(key)){
		if(field.opts && field.opts.serialize == "record"){
			if(field.relType == "belongsTo" && isEntity(record[key])){
				return validateRecord(db, record[key], fields);
			}
			else if(field.relType == "hasMany"){
				if(Array.isArray(record[key])){
					var ret = true, 
					result, 
					self = this;
					record[key].forEach(function(item, index){
						if(isEntity(item)){
							result = validateRecord(db, item, fields);
							if(result === false){
								ret = false;
							}
						}
					});
					return ret;
				}
			}
		}
	}
}

function validateRecord(db, record, fields){
	var result, ret = true, returnVal;
	for(var field in fields){
		returnVal = validateField(db, record, field, fields[field], result);
		if(ret === true && returnVal === false){
			ret = false;
		}
	}
	if(ret === false || (record.$.isError === true && record.$.error && Object.keys(record.$.error).length)){
		return false;
	}
	return true;
}

function validateField(db, record, key, field, result, obj){
	var val = obj && obj.old ? obj.value : record[key], 
	ret, 
	err = record.$, 
	clear,
	db = record.$.schema.db,
	lyte = record.$.schema.db.lyte,
	validateOptions = true;
	if(field.type == "relation"){
		ret = validateRelatedRecord(db, record, key, field);
		if(ret === false){
			result = false;
			return result;
		}
		validateOptions = false;
	}
	else if(field.mandatory && !record.$.error.hasOwnProperty(key) && (val === undefined || val === "" || (Array.isArray(val) && val.length === 0) )){
		ValidationError.setRecErr(err, key, {code : "ERR02", message : Dberror.errorCodes.ERR02, value : val});
	}
	if(validateOptions){
		clear = true;
		if( obj || (record.hasOwnProperty(key) && !record.$.error.hasOwnProperty(key))){
			for(var property in field){
				var resp = checkProperty(property, val, key, field[property], record, isEntity(record) ? record.$.schema._name : undefined, db, ValidationError.errorCodes, undefined, field, true);
				if(resp !== true){
					if(typeof resp == "object"){
						resp.value = val; 
					}
					ValidationError.setRecErr(err,key,resp);
					clear = false;
					//err[field] = resp;
					break;
				}
			}
			if(Entity.strictValueSet === false && obj && clear){
				cmpSet( lyte, record, key, val, undefined, true );
			}
			if(clear){
				ValidationError.clrRecErr(err, key);
			}		
		}
	}
}

function addOnSave(db,name,record,attr,field,pK,relPk){
	db.$.onSave = db.$.onSave || {};
	var saveMod = db.$.onSave[name] = db.$.onSave[name] || {};
	var saveQ = saveMod[record[pK]] = saveMod[record[pK]] || {} 
	var recs = record[attr] || [];
	if(field.relType == "belongsTo"){
		recs = !Array.isArray(record[attr]) ? [record[attr]] : record[attr]; 
	}
	recs.forEach(function(item){
		var q = saveQ[field.relKey] = saveQ[field.relKey] || [];
		checkAndAddToArray(q, item[relPk]);
	});
}

function removeOnSave(db, name, pkVal){
	var saveMod = db.$.onSave ? db.$.onSave[name] : undefined;
	if(saveMod && saveMod[pkVal]){
		delete saveMod[pkVal];
	}
}

function registerField(db,def,key,field,obs){
	var oldField = def.fieldList[key] ? Object.assign({},def.fieldList[key]) : undefined;
	if(key == "didLoad"){
		if(!def.didLoad){
			def.didLoad = [];
		}
		def.didLoad.push(field);
	}
	else if(typeof field.type == "string"){
		if(field.primaryKey){
			if(def.fieldList.id && def.fieldList.id.defined == false){
				delete def.fieldList.id;
			}
			if(field.hasOwnProperty("default")){
				Dberror.warn(db.lyte, "LD23",def._name,key);
				delete field.default;
			}
			if(def._pK != undefined){
				def._pK = def._pK + "," + key;
				def.isComposite = true; 
			}
			else{
				def._pK = key;
			}
			if(field.baseKey){
				if(def.bK){
					Dberror.warn(db.lyte, "LD02",type,def._name);
					return;
				}
				def.bK = key
			}	
		}
		def.fieldList[key] = field;
		if(oldField && def._fldGrps){
			if(oldField.hasOwnProperty("default")){
				delete def._fldGrps.default[key];
			}
			if(oldField.hasOwnProperty("watch")){
				delete def._fldGrps.watch[key];
			}
		}
		if(field.hasOwnProperty("default")){
			def._fldGrps.default[key] = field;
		}
		if(field.hasOwnProperty("watch") && (field.watch == true || Array.isArray(field.watch)) && /^(array|object)$/.test(field.type)){
			def._fldGrps.watch[key] = field;
		}		
	}
	else if(field._type == "prop"){
		if(newGetSuperClass(field.type,  undefined, def.db.constructor.DataType)){
			field.is = "transform";
			def.fieldList[key] = field;
		}
		else{
			Dberror.warn(db.lyte, key+" in Schema-"+def._name+" is not a valid prop");
		}
	}
	if(field.type === "relation"){
		field.relKey = key;
		var relTo;
		if(typeof field.relatedTo == "string"){
			var fRelToName = dbModName(field.relatedTo, "Schema"); 
			_relTo = db.constructor.getSchema(field.relatedTo);
			if(_relTo){
				relTo = _relTo;
			}
			else{
				var _id = db.constructor.Schema.schema.addEventListener("add", function(name, newRelTo){
					if(name == fRelToName){
						relDef(def, key, newRelTo, field);
						db.constructor.Schema.schema.removeEventListener(_id);
					}
				});
			}
		}
		else{
			relTo = field.relatedTo;
		}
		if(relTo){
			relDef(def, key, relTo, field);
		}
	}	
}

function relDef(def, key, relTo, field){
	if(typeof field.relatedTo == "string" && relTo && typeof relTo !== "string"){
		field.relatedTo = relTo;
	}
	var relObj = def.fieldList[key];
	if(!def.relations.get(relTo)){
		def.relations.set(relTo, []);
	}
	var rArr = def.relations.get(relTo);
	var chkObj = {};
	chkObj.relKey = relObj.relKey; 
	checkObjAndAddToArr(rArr, relObj, chkObj);
	if(field.relType == "hasMany"){
		def._fldGrps.hasMany[key] = field;
	}
	if(field.hasOwnProperty("opts") && field.opts.hasOwnProperty("reverseKey")){
		def._fldGrps.reverseKey.set(relTo, field);
	}
}
function unRegCb(db,type,name){
	var callback = db[type][name];
	if(!callback){
		Dberror.error(db.lyte,"LD02",type,name);
		return;
	}
	var extendedBy = callback.__extendedBy;
	if(extendedBy.length)
	{
		db[type].__toAddSuper = db[type].__toAddSuper || {};
		if(!db[type].__toAddSuper[name])
		{
			db[type].__toAddSuper[name] = extendedBy.slice();
		}
		else
		{
			extendedBy.forEach(function(item){
				db[type].__toAddSuper[name].push(item);
			});
		}
		extendedBy.forEach(function(item){
			db[type][item].$super = undefined;
		});
		if(db[type].application && name != "application")
		{	
			var application = db[type].application;
			extendedBy.forEach(function(item){
				db[type][item].$super = application;
				db[type].application.__extendedBy.push(item);
			});
		}
		if(!db[type].application)
		{
			if(!db[type].__toAddSuper.application)
			{
				db[type].__toAddSuper.application = extendedBy.slice();
			}
			else
			{
				extendedBy.forEach(function(item){
					db[type].__toAddSuper.application.push(item);
				});
			}
		}
	}
	if(callback.$super){
		callback.$super.__extendedBy.splice(callback.$super.__extendedBy.indexOf(name),1);
	}
	delete db[type][name];
}

function extendDef(extend, mdl, db){
	var scp = mdl || this,
	// scp = getSchemaObj(db, scp),
	db = db || scp.db;
	if(!extend){
		return;
	}
	var parentFields = Object.assign({},extend.fieldList);
	for(var key in parentFields){
		if(parentFields[key].type == "relation"){
			delete parentFields[key];
		}
	}
	var pkObj = {}, 
	extendParentPks = scp._pK == "id" && scp.fieldList.id.defined == false ? true : false;
	for(var key in parentFields){
		var fld = parentFields[key], 
		custPk = extendParentPks && fld.primaryKey && fld.defined != false;
		if(scp.fieldList.hasOwnProperty(key) && scp._fldGrps){
			var oldField = scp.fieldList[key];
			if(oldField.hasOwnProperty("default")){
				delete scp._fldGrps.default[key];
			}
			if(oldField.hasOwnProperty("watch")){
				delete scp._fldGrps.watch[key];
			}
		}
		if(fld.hasOwnProperty("default")){
			scp._fldGrps.default[key] = fld;
		}
		if(fld.hasOwnProperty("watch") && fld.watch == true && /^(array|object)$/.test(fld.type)){
			scp._fldGrps.watch[key] = fld;
		}
		if(!fld.primaryKey){
			scp.fieldList[key] = fld;
		}
		else {
			pkObj[key] = fld;
		}
	}
	var pkObjKeys = Object.keys(pkObj), pkObjLen = pkObjKeys.length;
	if(extendParentPks && pkObjLen){
		delete scp.fieldList.id;
		for(var key in pkObj){
			scp.fieldList[key] = pkObj[key];
		}
		if(pkObjLen == 1){
			scp._pK = pkObjKeys[0];
			scp._arrPk = Array.from(pkObjKeys);
		}
		else{
			scp.isComp = true;
			scp._arrPk = Array.from(pkObjKeys);
			scp._pK = scp._arrPk.toString();
		}
	}
	var name = scp._name;
	db.schema[name].extend = extend._name;
	extend.extendedBy = extend.extendedBy || {};
	extend.extendedBy[name] = true;
	// if(!db.connector[name] && db.connector[extend]){
	// 	db.connector[name] = db.connector[extend];
	// }
	// if(!db.serializer[name] && db.serializer[extend]){
	// 	db.serializer[name] = db.serializer[extend];
	// }
	if(extend.actions){
		var actions = scp.actions = scp.actions || {};
		for(var key in extend.actions){
			if(!actions.hasOwnProperty(key)){
				actions[key] = extend.actions[key]; 							
			}
		}					
	}
}

function demoLishObserverBindings(obj,prop,record){
	if(!record){
		record = obj;
	}
	for(var key in prop){
		if(obj[key] instanceof Object){
			if(record && obj[key]._setterScope){
				var ind = obj[key]._setterScope.indexOf(record);
				ind != -1 ? obj[key]._setterScope.splice(ind, 1) : undefined;
			}
			if(Object.keys(prop[key]).length){
				demoLishObserverBindings(obj[key],prop[key],obj);
			}
		}
		if(obj._setterScope && obj != record){
			var inx = obj._setterScope.indexOf(record);
			inx != -1 ? obj._setterScope.splice(inx, 1) : undefined;
		}
	}
}

function establishObsBindings(obj,prop,record){
	if(!record){
		record = obj;
	}
	for(var key in prop){
		if(obj[key] instanceof Object){
			if(!obj[key]._bindings){
				_defProp(obj[key], '_bindings', new Set(), false, true, true);
			}
			if(record && !obj[key]._setterScope){
				_defProp(obj[key],'_setterScope',[]);
			}
			var ind = obj[key]._setterScope.indexOf(record);
			ind == -1 ? obj[key]._setterScope.push(record) : undefined;
			obj[key]._bindings.add(prop[key]);
			if(Object.keys(prop[key]).length){
				establishObsBindings(obj[key],prop[key],obj);
			}
		}
		if(!obj._setterScope){
			_defProp(obj, '_setterScope', []);
			obj._setterScope.push(obj);
		}
	}
}

function isEmpty(val){
	if(val != undefined && val !== "" && val != null){
		return false;
	}
	return true;
}

function isEmptyObj(obj){
	if(obj !== null && typeof obj == "object" && Object.keys(obj).length == 0){
		return true;
	}
	return false;
} 

function isEmptyArray(arr){
	if(Array.isArray(arr) && arr.length == 0){
		return true;
	}
	return false;
}

function compareData(data1, data2, isQp){
	if(!isEmpty(data1) && !isEmpty(data2)){
		var data1Type = typeof data1, data2Type = typeof data2;
		if(data1Type !== data2Type){
			return false;
		}
		switch(data1Type){
			case "string":
			case "number":
			case "boolean":
			if(data1 === data2){
				return true;
			}
			break;
			case "object":
				return compareObjects(data1, data2, isQp);
		}
	}
	return false;
}

function compareObjects(obj1, obj2, qP){
	if(!(obj1 instanceof Object) || !(obj2 instanceof Object)){
		return false;
	}
	if(Object.keys(obj1).length != Object.keys(obj2).length){
		return false;
	}
	for(var key in obj1){
		var val1 = obj1[key], val2 = obj2[key];
		if(qP && Array.isArray(val1) && Array.isArray(val2)){
			if(val1.length != val2.length){
				return false;
			}
			var len = val1.length;
			for(var i=0; i<len; i++){
				var ret = compareData(val1[i], val2[i], qP);
				if(!ret){
					return false;
				}
			}
		}
		else if(val2 == undefined || !compareData(val1,val2,qP)){
			return false;
		}
	}
	return true;
}

function setData(self, attr, value, opts, redoObj, ignoreChange){
	var toEmit = {emit : false, attr : [], oldRec : {}}, 
	schema = self.schema, 
	db = schema.db,
	_estObsBind = false, 
	record = self.entity, 
	attrData;
	if(record && record.$.isStrict && record.$.isDeleted){
		Dberror.warn(db.lyte, "LD29");
		return;
	}
	if(attr && typeof attr === "object"){
		attrData = [];
		opts = value;
		for(var key in attr){
			attrData.push(key);
			setValue(self, key, attr[key], opts, toEmit, ignoreChange);
			schema && schema._properties && schema._properties.hasOwnProperty(key) ? _estObsBind = true : undefined;
		}
	}
	else{
		attrData = attr;
		setValue(self, attr, value, opts, toEmit, ignoreChange);
		schema && schema._properties && schema._properties.hasOwnProperty(attr) ? _estObsBind = true : undefined;
	}
	self.emit("set", [self.entity, attrData]);
	self.schema.emit("set", [schema._name, self.entity, attrData]);
	db.emit("set", [schema._name, self.entity, attrData]);
	if(_estObsBind){
		establishObsBindings(record, schema._properties);
	}
	if( !ignoreChange && toEmit.emit){
		changeCallbck(record, toEmit, redoObj)
	}
	return record;
} 

function changeCallbck(record, toEmit, redoObj){
	var db = record.$.schema.db;
	var arr = [record, toEmit.attr], 
	self = record.$;
	self.emit("change", arr);
	self.schema.emit("change", arr);
	db.emit("change", [self.schema._name,self.entity, toEmit.attr]);
	if(redoObj){
		for(var key in toEmit.oldRec){
			redoObj[key] = toEmit.oldRec[key];
		}
	}
	else{
		for(var index=0;index<toEmit.attr.length;index++){
			var key = toEmit.attr[index];
			self.undoStack[key] = self.undoStack[key] || [];
			self.undoStack[key].push(toEmit.oldRec[key]);
		}
		// self.undoStack._order_ = self.undoStack._order_ || _defProp(self.undoStack, "_order_", [], false, true);
		self.undoStack._order_.push(toEmit.attr); 
	}
}

function setValue(self,attr,value,opts,toEmit,ignoreChange,deepChange){
	var schema = self.schema, 
	db = schema.db,
	lyte = db.lyte,
	pK = schema._pK, 
	record = self.entity, 
	_attrs = record.$._attributes;
	if(attr === "$"){
		return;
	}
	if(attr != schema._pK){
		var field = schema.fieldList[attr], watch = field && field.opts ? field.opts.watch == true : undefined;
		var serz = field && field.opts ? field.opts.hasOwnProperty("serialize") : undefined;
		if(!field){
			cmpSet( lyte, record, attr, value, undefined, true );
			return;
		}
		else if(field.mandatory && (value == undefined || value == null || value === "")){
			ValidationError.setRecErr(self, attr, {code : "ERR02", message : Dberror.errorCodes.ERR02, value : value});
		}
		else if(field.relType){
			var relType = field.relType;
			var rel ={},relRec, oldVal, relMod = getSchemaObj(db, field.relatedTo), bDef = relMod, bPk = bDef._pK, relPk = relMod._pK, isComp = relMod.isComp, bPkType = isComp ? "object" : relMod.fieldList[bPk].type, relRec;
			var isComp = relMod.isComp, bPk = relMod._pK, bPkType = isComp ? "object" : relMod.fieldList[bPk].type, isPoly = field && field.opts ? field.opts.polymorphic : undefined;;
			getRelations(db, schema, field.relKey, relMod, rel);
			// var oldRecVal = record[attr], oldRecId, newRecId;
			// if(oldRecVal && isEntity(oldRecVal)){
			// 	oldRecId = oldRecVal.$.pK;
			// }
			// if(value && isEntity(value)){
			// 	newRecId = value.$.id;
			// }

			if(record[attr] && relType == "hasMany"){
				oldVal = [];
				record[attr].forEach(function(item){
					oldVal.push(item);
				});
				if(record[attr] === value){
					return;
				}
				if(Array.isArray(value) && value.length === record[attr].length){
					var valLen = value.length,j=0, val;
					for(var i=0;i<valLen;i++){
						val = value[i];
						if(isEntity(val)){
							relRec = val;
						}
						else {
							if(val && typeof val == bPkType){
								relRec = db.cache.getEntity((val._type) ? val._type : field.relatedTo, val);
							}
						}
						if(isEntity(relRec) && relRec === record[attr][i]){
							j++;
						}
						else{
							break;
						}
					}
					if(j && j == valLen){
						return;
					}
				}
				// oldVal = record[attr].slice(0);
				// oldVal1 = record[attr].mapBy(relMod._pK);
				addOnSave(db, schema._name, record, attr, field, pK, relPk);
				// toDemolishLink(schema, record, rel.forward);
				var relData = Array.from(record[attr]);
				relData.forEach(function(rec){
					demolishLink(db, rec, relPk, record, rel.forward.relKey, undefined, undefined, undefined, true);
					if(rel.backward !== null){
						demolishLink(db, record, schema._pK, rec, rel.backward.relKey, rel.forward);
					}
					_attrsForRel(record, attr, "removed", rec);
				});
				// // record[attr].splice(0, record[attr].length);
				// if(record[attr].length){
				// 	handleArrOp(lyte, record[attr], "removeAt", undefined, 0, record[attr].length);
				// }
				// _attrsForRel(record, attr, "removed", oldVal, 0);
				// if(!_attr.size){
				// 	delete record.$._attributes[attr];
				// }
			}
			else if(record[attr] && isEntity(record[attr]) && relType == "belongsTo"){
				oldVal = record[attr];
				if(isEntity(value)){
					relRec = value;
				}
				else {
					if(value && typeof value == bPkType){
						relRec = db.cache.getEntity((value._type) ? value._type : field.relatedTo, value);
					}
				}
				if(isEntity(relRec) && relRec === record[attr]){
					return;
				}
				// oldVal = this.createCopy(record[attr]);
				addOnSave(db, schema._name, record, attr, field, pK, relPk);
				// oldVal1 = record[attr][relMod._pK];
				// toDemolishLink(schema, record, rel.forward);
				var relRef = record[attr];
				demolishLink(db, relRef, relPk, record, rel.forward.relKey, undefined, undefined, undefined, true);
				if(rel.backward !== null){
					demolishLink(db, record, schema._pK, relRef, rel.backward.relKey, rel.forward);
				}
				_attrsForRel(record, attr, "removed", relRef);
				// record[attr] = undefined;
				cmpSet(lyte, record, attr, {}, opts, true);
				// _attrsForRel(record, attr, "removed", oldVal);
			}
			if(relType == "hasMany" && isEmpty(value)){
				var partial = record[attr] && record[attr].partial ? record[attr].partial : undefined;  
				cmpSet(lyte, record, attr, [], opts, true);
				partial ? defProp(record[attr], "partial", { value : partial }) : undefined;
				establishObsBindings(record, record.$.schema._properties);
				defArrUtls(record[attr]);
				defPolyUtls(record[attr]);
				defUtls(record[attr], relMod, record, attr);	
			}

			if(!Array.isArray(value)){
				value = [value];
			}
			else if(relType == "belongsTo"){
				revertToOldVal(record, attr, oldVal, rel);
				ValidationError.setRecErr(self, attr, "ERR21", value);
				return;
			}

			var err = [];
			for(var i=0; i<value.length; i++){
				if(isEmpty(value[i]) || (relType == "belongsTo" && isEmptyObj(value[i])) || (relType == "hasMany" && isEmptyArray(value[i]))){
					continue;
				}
				var relRecord = value[i], relMod1 = (value[i] && value[i]._type) ? value[i]._type : field.relatedTo;
				relMod1 = getSchemaObj(db, relMod1);
				if(!isComp && value[i] && typeof value[i] === bPkType){
					relRecord = db.cache.getEntity((value[i]._type) ? value[i]._type : field.relatedTo, value[i]);
					if(relRecord == undefined){
						addToRelate(db, schema._name, record, rel, value[i]);
					}
					else if(!Entity.strictRelSet && relRecord && relRecord.$ && relRecord.$.isError){
						err.push({code : "ERR15", message : Dberror.errorCodes.ERR15, error : Object.assign({}, relRecord)});
						continue;
					}
				}
				else if(value[i] && typeof value[i] == "object"){
					if(!Entity.strictRelSet && relRecord.$ && relRecord.$.isError){
						err.push({code : "ERR15", message : Dberror.errorCodes.ERR15, error : Object.assign({}, relRecord)});
						continue;
					}
					else if(!isEntity(relRecord)){
						if(isPoly && value[i] && value[i]._type){
							relRecord = db.cache.getEntity(db.getSchema(value[i]._type), getpKVal(value[i], db.getSchema(value[i]._type)));
						}
						else if(isComp){
							relRecord = db.cache.getEntity((value[i]._type) ? value[i]._type : field.relatedTo, value[i]);
							if(!relRecord){
								relRecord = newRecord(db, relMod1, value[i], opts ? opts.skipValidation : undefined);
							}
						}
						else if(value[i].$ && value[i].$.isSavedState){
							relRecord = db.cache.getEntity((value[i]._type) ? value[i]._type : field.relatedTo, value[i].$.pK);
							// if(!relRecord){
							// 	//to check 	
							// }
							setState(relRecord.$, value[i]);
						}
						else{
							relRecord = newRecord(db, relMod1, value[i],opts?opts.skipValidation:undefined);
						}
						if(!Entity.strictRelSet && relRecord.$.isError){
							err.push({code : "ERR15", data : value[i], message : Dberror.errorCodes.ERR15, error : Object.assign({}, relRecord)});
							continue;
						}
					}
				}
				var changed = establishLink(db, rel.forward, rel.backward, record, relRecord , undefined, undefined);
				if(changed != true){
					err.push({code : changed, data : value[i], message : Dberror.errorCodes[changed]});
				}
				else{
					_attrsForRel(record, attr, "added", relRecord);
					// if(!_attr.size){
					// 	delete record.$._attributes[attr];
					// }
					addOnSave(db, schema._name, record, attr, field, pK, relPk);
				}
			}
			if(err.length && (err.length == value.length)){
				revertToOldVal(record, attr, oldVal, rel);
				if(field.relType == "belongsTo"){
					ValidationError.setRecErr(self, attr, err[0]);
				}
				else{
					ValidationError.setRecErr(self, attr, err);
				}
				return;
			}
			else{
				if(err.length > 1){
					ValidationError.setRecErr(self, attr, err);
				}
				else{
					ValidationError.clrRecErr(self, attr);
				}
				if(!ignoreChange || serz){
					toEmit.emit = true;
					toEmit.attr.push(attr);
					var obj = {}; obj.records = oldVal; obj._type = "update";
					toEmit.oldRec[attr] = obj;
					var _attr = _attrs[attr] = _attrs[attr] || new Map();
					var _changes = _attr._changes = _attr._changes || []; 
					_changes.push({_type:"changed", records:oldVal});
					cmpRelInitVal(record, attr, bDef);
				}
			}
		}
		else{
			if(value !== record[attr]){
				// if(field && field.type !== Lyte.getDataType(value) && (value !== undefined  || field.type === "boolean")) {
				// 	value = Lyte.typeCast(value, field.type);
				// }
				var clear = true;
				if(!opts || (opts && opts.skipValidation !== true)){		
					for(var property in field){
						var resp = checkProperty(property, value, attr, field[property], record, schema._name, db, ValidationError.errorCodes, undefined, field, true);
						if(resp != true){
							if(typeof resp == "object"){
								resp.value = value;
							} 
							ValidationError.setRecErr(self, attr, resp);
							clear = false;
							if(Entity.strictValueSet === false){
								break;
							}
							return;
						}
					}
				}
				if(!ignoreChange){
					estAttrs(record, attr, value, toEmit, deepChange, opts, clear);
				}
				else{
					if(watch && /^(array|object)$/.test(field.type)){
						establishObjectBinding(record, attr, true, undefined, undefined,watch);
					}
					cmpSet(lyte,record,attr,value,opts,true);
				}
			}
			else if(value === record[attr] && record.$.isError && record.$.error[attr]){
				var valid = true;
				for(var property in field){
					var resp = checkProperty(property, value, attr, field[property], record, schema._name, db, ValidationError.errorCodes, undefined, field, true);
					if(resp != true){
						valid = false;
					}
				}
				if(valid){
					ValidationError.clrRecErr(self,attr);
				}
			}
		}
		checkAttrs(record);
	}
	else{
		if(record[attr] !== value){
			ValidationError.setRecErr(self, attr, "ERR01", value);
		}
	}
}

function estAttrs(record, attr, value, toEmit, deepChange, opts, clear){
	var _attrs = record.$._attributes, 
	schema = record.$.schema, 
	attribute = _attrs[attr], 
	isAttrPres = _attrs.hasOwnProperty(attr);
	if( !isAttrPres){
		_attrs[attr] = deepChange ? deepChange.data : createCopy(record[attr]);
	}
	else if((( deepChange && cmpData(isAttrPres ? attribute : deepChange.data, record[attr])) || (value && typeof value == "object" && ( !deepChange && compareObjects(attribute, value))) || (attribute == value))){
		delete _attrs[attr];
	}
	var hasAttr = record.hasOwnProperty(attr), 
	oldAttrVal = deepChange ? deepChange.data : record[attr];
	if(!deepChange){
		var isPropPresent = schema._properties && schema._properties.hasOwnProperty(attr), propObj = {};
		if(isPropPresent){
			propObj[attr] = schema._properties[attr];
			demoLishObserverBindings(record, propObj);
		}
		cmpSet(schema.db.lyte,record,attr,value,opts,true);
	}
	if(clear){
		ValidationError.clrRecErr(record.$, attr);
	}
	var obj = {};
	obj._type = "update";
	obj.val = oldAttrVal;
	if(!hasAttr){
		obj._type = "propAdd";
	}
	toEmit.emit = true;
	toEmit.attr.push(attr);
	toEmit.oldRec[attr] = obj;
}

function checkAttrs(record){
	var schema = record.$.schema;
	if( Object.keys(record.$._attributes).length ){
		// changeModified(schema.db.lyte, record, true, record.$.pK, true);
		if(!record.$.isNew){
			cmpSet(schema.db.lyte, record.$, "isModified", true);
			changePersist(record, false);
		}
		addDeepNest(record);
		checkAndAddToArray(schema.dirty, record[schema._pK]);
	}
	else{
		// changeModified(schema.db.lyte, record, false);
		cmpSet(schema.db.lyte, record.$, "isModified", false);
		changePersist(record, true);
		if(!record.$.isNew && (!record.$.hasOwnProperty("dN") || (record.$.dN && !Object.keys(record.$.dN).length))){
			var ignorePartial = record.$.isNew ? true : false;
			removeParentNesting(record, ignorePartial);                  
		}
		if(!record.$.isNew){
			deleteFromArray(schema.dirty, record.$.pK);
		}
	}
}

function checkForCorrectRelation(db,rel,record){
	var relatedTo = rel.relatedTo;
	if(!isEntity(record)){
		return false;
	}
	if(rel.opts && rel.opts.polymorphic){
		return (record.$.schema.extend ? rel.relatedTo === db.getSchema(record.$.schema.extend) : false);
	}
	return (rel && record ? relatedTo === record.$.schema.def : false);
}

function partialData(rec, prop, relRec, type, polymorphicType,partRemoveOnly){
	var arr = rec[prop];
	if(!arr || !Array.isArray(arr)){
		return true;
	}
	if(!arr.partial){
		defPar(arr);
	}
	var partial = arr.partial; 
	// = arr.partial || new Map();
	if(!partial.get(relRec)){
		partial.set(relRec, {});
	}
	var revert = false, 
	obj = partial.get(relRec), 
	objType = obj.type;
	if(type == "delete"){
		partial.delete(relRec);
		revert = true;
	}
	else{
		switch(objType){
			case "added":{
				if(type == "removed"){
					partial.delete(relRec);
					revert = true;
				}
				break;
			}
			case "removed":{
				if(type == "added"){
					if(rec[prop]._recMap){
						var relRec = rec[prop]._recMap.get(relRec.$.pK);
					} 
					if(!relRec || (isEntity(relRec) && !relRec.$.isDirty())){
						partial.delete(relRec);
						revert = true;
					}
					else{
						var obj = partial.get(relRec);
						obj.type = "modified";
					}
				}
				break;
			}
			case "modified":
			case "updated":{
				if(type == "added"){
					//this case mostly won't come. if at all it comes, break
					break;
				}
			}
			default:{
				if(!partRemoveOnly){
					var pObj = { type : type };
					polymorphicType ? pObj.polymorphicType = polymorphicType : undefined;
					partial.set(relRec, pObj);
				}
			}
		}
	}
	if(revert && !partial.size){
		deleteDeepNest(rec, prop, relRec);
		return true;
	}
}

function removeDeepNest(record){
	if(!isEntity(record)){
		return;
	}
	var bool1 = record.$.dN && Object.keys(record.$.dN).length;
	if(bool1){
		record.$.dN = {};
		var schema = record.$.schema, 
		relations = schema.relations;
		relations.forEach(function(rels, key){
			rels.forEach(function(item){
				var opts = item.opts;
				if(opts && (opts.deepNest == true || opts.serialize == "partial")){
					var data = record[item.relKey];
					if(Array.isArray(data)){
						data.forEach(function(itm){
							if(isEntity(itm)){
								removeDeepNest(itm);
								if(!itm.$.isNew && !itm.$.isModified && (!itm.$.dN || ( itm.$.dN && Object.keys(itm.$.dN).length == 0 ))){
									removeParentNesting(itm);
								}
							}
						});
					}
					else if(isEntity(data)){	
						removeDeepNest(data);
						if(!data.$.isNew && !data.$.isModified && (!data.$.dN || ( data.$.dN && Object.keys(data.$.dN).length == 0))){
							removeParentNesting(data);
						}																			
					}
				}
			});					
		});
	}
}

function addDeepNest(record, extended,type,parentRel,ignoreRel, mp , processOnlySrzPart){
	var relatedRecord, 
	mp = mp || new Map(),
	db = record.$.schema.db,
	schema = extended ? db.schema[record.$.schema.extend] : record.$.schema, 
	pK = record.$.pK,
	type = type || "updated",
	relations = schema.relations;
	relations.forEach(function(rels, key){
		rels.forEach(function(item){
			var inv , deep, part, serz, bMod = getSchemaObj(db , item.relatedTo);
			inv = getBackwardRel(schema,item,bMod);
			if(bMod){
				if(!item.relKey || (inv === item)){
					relatedRecord = getRelatedRecord(record,getSchemaObj(db, item.relatedTo),item.dummy ? item.dummy: item.relKey);
				}
				else{
					relatedRecord = record[item.relKey];
				}
				if(relatedRecord){
					var mppass = false, nmp , ignoreDn;
					if(inv !== parentRel){		
						if(!mp.get(inv)){
							nmp = mp.set(inv, new Map());
							mppass = true;
						}
						nmp = mp.get(inv);			
						if(mppass || !nmp.get(relatedRecord)){
							nmp.set(relatedRecord, true);
							if(inv && inv.opts){
								deep = inv.opts.deepNest;
								part = inv.opts.serialize == "partial" ? true : false; 
								serz = inv.opts.serialize ? true : false;
							}
							if((type == "updated" && serz == "id")){
								ignoreDn = true;
							}
							if((!processOnlySrzPart || ( processOnlySrzPart && part)) && !ignoreDn){
								if(deep == true){
				//					if(deep || part){
									makeDirty(relatedRecord, type, inv, pK, item, record, mp);
								}
								if(serz && record && relatedRecord && (!ignoreRel || !(ignoreRel && ignoreRel.schema === item.relatedTo && inv.relKey === ignoreRel.relKey))){
									var data = relatedRecord;
									if(inv.relType == "hasMany"){
										if(Array.isArray(data)){
											data.forEach(function(item){
												partialData(item, inv.relKey, record , /^(added|removed)$/.test(type) ? type : "modified");								
											});
										}
										else if(isEntity(data)){
											partialData(data, inv.relKey, record, /^(added|removed)$/.test(type) ? type : "modified");	
										}
									}
									else{
										if(Array.isArray(data)){
											data.forEach(function(item){
												if(type == "added" && item && item.$ && item.$.partial && item.$.partial[inv.relKey] && item.$.partial[inv.relKey].has(pK)){
													delete item.$.partial;
												}
											});
										}
										else if(isEntity(data)){
											if(type == "added" && data && data.$ && data.$.partial && data.$.partial[inv.relKey] && data.$.partial[inv.relKey].has(pK)){
												delete data.$.partial;
											}
										}
									}
									//partialData(record[item.relKey], inv.relKey, pK , "modified");
								}
							} 
						}
					}
				}
			}
		});		
	});
	if(schema.extend){
		addDeepNest(record, true);
	}
}

function makeDirty(records, type, rel, pK, parentRel, relRec, mp){
	if(!(rel.opts.serialize =='id' && type =="updated")){
		var relKey = rel.relKey;
		if(Array.isArray(records)){
			records.forEach(function(item){
				setDeepNest(item, relKey, pK, type, parentRel, relRec, mp);
			});
		}
		else if(isEntity(records)){
			setDeepNest(records, relKey, pK, type, parentRel, relRec, mp);
		}
	}
}

function setDeepNest(item, relKey, pK, type, parentRel, relRec, mp){
	var deepN = item.$.dN = item.$.dN || {}, 
	deepRel = deepN[relKey] = deepN[relKey] || new Map();
	if(!deepRel.has(relRec)){
		deepRel.set(relRec, {});
	}
	var obj = deepRel.get(relRec);
	switch(obj.type){
		case "added": {
			if(type == "removed"){
				deleteDeepNest(item, relKey, relRec);
			}
			break;
		}
		case "removed": {
			if(type == "added"){
				deleteDeepNest(item, relKey, relRec);
			}
			break;
		}
		default : {
			obj.type = type;
			changePersist(item, false);
			addDeepNest(item, undefined, undefined, parentRel, undefined, mp);		
		}
	}
}

function deleteDeepNest(rec, key, relRec){
	var deepNest = rec.$.dN;
	if(deepNest){
		if(deepNest[key] && relRec === undefined){
			delete deepNest[key];
		}
		else if(deepNest[key] && deepNest[key].get(relRec)){
			deepNest[key].delete(relRec);
			if(!deepNest[key].size){
				delete deepNest[key];
			}
		}
		if(!Object.keys(deepNest).length){
			delete rec.$.dN;
			if(!rec.$.isModified && !rec.$.isNew){
				removeParentNesting(rec);
			}
			changePersist(rec, true);
		}
	}
}

function getRelatedRecord(ins,def,key){
	if(ins){
		var relationship = ins.$._relationships;
		if(relationship[def._name] && relationship[def._name][key]){
			return relationship[def._name][key];
		}
	}
}

function removeParentNesting(rec, ignorePartial, type){
	var schema = rec.$.schema, 
	db = schema.db,
	pkVal = rec.$.pK, 
	rels = schema.relations;
	rels.forEach(function(relations, key){
		relations.forEach(function(item){
			var inv, deep, part, invRecs;
			//getRelations(schema, item.relKey, db.schema[item.relatedTo], rel);
			var bMod = item.relatedTo, _bDef = getSchemaObj(db, bMod);
			if(bMod){
				inv = getBackwardRel(schema, item, _bDef);
				//inv = rel.backward;
				if(inv && inv.opts){
					deep = inv.opts.deepNest;
					part = inv.opts.hasOwnProperty("serialize");
					if(!item.relKey || (item == inv)){
						invRecs = getRelatedRecord(rec,_bDef,item.dummy?item.dummy:item.relKey);
					}
					else{
						invRecs = rec[item.relKey];
					}
				}
				// if(deep == true){
				// 	if(Array.isArray(invRecs)){
				// 		invRecs.forEach(function(item){
				// 			if(isEntity(item)){
				// 				deleteDeepNest(item, inv.relKey, rec);
				// 			}
				// 		});
				// 	}
				// 	else if(isEntity(invRecs)){
				// 		deleteDeepNest(invRecs, inv.relKey, rec);
				// 	}
				// }
				if(part && !ignorePartial){
					if(invRecs && !Array.isArray(invRecs)){
						invRecs=[invRecs];
					}
					if(Array.isArray(invRecs)){
						invRecs.forEach(function(invItm){
							if(invItm instanceof bMod){
								if(inv.relKey){	
									if(inv.relType == "belongsTo" && invItm && invItm.$){
										if(invItm.$.partial && invItm.$.partial[inv.relKey] && invItm.$.partial[inv.relKey].has(rec)){
											invItm.$.partial[inv.relKey].delete(rec);
											if(!invItm.$.partial[inv.relKey].size){
												delete invItm.$.partial[inv.relKey]; 
											}
										}
										deep ? deleteDeepNest(invItm, inv.relKey, rec ) : undefined;
									}
									else if(inv.relType == "hasMany"){
										var invArr = invItm[inv.relKey];
										if(Array.isArray(invArr)){
											if(invArr.partial && invArr.partial.has(rec)){
												var _ptype = invArr.partial.get(rec).type;
												if(type == "modified"){
													if(/^(modified|updated)$/.test(_ptype)){
														invArr.partial.delete(rec);
													}   
												}
												else{
													invArr.partial.delete(rec);
												}
											}
											deep ? deleteDeepNest(invItm, inv.relKey, rec) : undefined;
										}
									}
								}
							}
						});
					}
				}
			}
		});		
	});
}

function cmpRelInitVal(record, attr, bDef ){
	var arr = record.$.getInitialValues(attr), 
	changed = true, 
	_attrs = record.$._attributes, 
	bPk = bDef._pK, 
	field = record.$.schema.fieldList[attr], 
	srz = field && field.opts ? field.opts.serialize : undefined, 
	cmpInd = (srz == "id" || srz == "record"); 
	if(arr && Array.isArray(record[attr]) && arr.length == record[attr].length && cmpInd){
		changed = false;
		for(var i=0; i<arr.length; i++){
			if(!comparePk(record[attr][i], arr[i])){
				changed = true;
				break;
			}
		}
	}
	var size = _attrs[attr].size;
	if((!changed && size == 0 && cmpInd) || (srz == "partial" && size == 0)){
		delete _attrs[attr];
	}
}

function _attrsForRel(record, attr, type, arr, index){
	var _attrs = record.$._attributes, 
	_attr,
	db = record.$.schema.db; 
	_attr = _attrs[attr] = _attrs[attr] || new Map();
	if(arr && !Array.isArray(arr)){
		arr = [arr];
	}
	arr.forEach(function(itm){
		var _attrObj = _attr.get(itm), currType = _attrObj ? _attrObj._type : undefined;
		switch(currType){
			case "added": {
				if(type == "removed"){
					_attr.delete(itm);
					break;
				}
			}
			case "removed":{
				if(type == "added"){
					_attr.delete(itm);
					break;
				}
			}
			default: {
				var obj = { _type : type };
				if(index){
					obj.index = index;
				}
				_attr.set(itm, obj);
			}
		}
	});
}

function establishToRelated(record, relArr){
	var bSchema = record.$.schema, 
	rel = {},
	db = bSchema.db;
	relArr.forEach(function(item){
		var rec = db.cache.getEntity(db.getSchemaObj(item.schema).def, item.pkVal);
		if(rec){
			var fSchema = rec.$.schema;
			getRelations(db, fSchema, item.key, bSchema, rel);
			establishLink(db, rel.forward, rel.backward, rec, record, undefined, true);
		}
	});
}

function add(value,type,opts,redoObj){
	var record = this.entity, 
	schema = record.$.schema,
	db = schema.db,
	attr = this.key, 
	field = schema.fieldList[attr], 
	rel = {}, 
	oldArr, 
	serz = field.opts ? field.opts.hasOwnProperty("serialize") : undefined;
	getRelations(db, schema, field.relKey, getSchemaObj(db, field.relatedTo), rel);
	if(!Array.isArray(value)){
		value = [value];
	}
	var relMod = getSchemaObj(db, rel.forward.relatedTo);
	var pK = relMod._pK, err = [], arr = [], isComp = relMod.isComp;
	if(record.$._attributes.hasOwnProperty(attr) && record.$._attributes[attr].length){
		oldArr = record.$.getInitialValues(attr);
	}
	for(var i=0; i<value.length; i++){
		var rec = value[i];
		if(isComp){
			if(typeof rec == "object" && Object.keys(rec).length === relMod._arrPk.length){
				if(this.polymorphic && !type){
					err.push({code : "ERR22", data : value[i], message : Dberror.errorCodes.ERR22});
					continue;
				}
				
				rec = db.cache.getEntity(this.polymorphic && type ? (typeof type == "string" ? db.getSchema(type) : type) : rel.forward.relatedTo, rec);	
			}
		}
		if((!isComp && relMod.fieldList[pK].type.toLowerCase() == typeof rec) || (isComp && typeof rec == "object" && Object.keys(rec).length === relMod._arrPk.length) ){
			if(this.polymorphic && !type){
				err.push({code : "ERR22", data : value[i], message : Dberror.errorCodes.ERR22});
				continue;
			}
			rec = db.cache.getEntity(this.polymorphic && type ? (typeof type == "string" ? db.getSchema(type) : type) : rel.forward.relatedTo, rec);
		}
		else if(typeof rec == "object" && !isEntity(rec)){
			if(this.polymorphic){
				var pType;
				if(rec._type){
					pType = typeof rec._type == "string" ?  db.getSchemaObj(rec._type) : rec._type
				}
				else if(type){
					pType = typeof type == "string" ?  db.getSchemaObj(type) : type
				}
				if(!pType){
					err.push({code : "ERR22", data : value[i], message : Dberror.errorCodes.ERR22});
					continue;
				}
				rec = newRecord(db, pType, rec, opts?opts.skipValidation:undefined);
			}
			else{
				rec = newRecord(db,getSchemaObj(db,field.relatedTo), rec, opts?opts.skipValidation:undefined);
			}
		}
		var polyType = this.polymorphic && type ? type : ((rec && rec._type) ?rec._type: undefined);
		if(rec == undefined){
			err.push({code : "ERR13", data : value[i], message : Dberror.errorCodes.ERR13});
		}
		else if(!Entity.strictRelSet && rec.$ && rec.$.isError){
			err.push({code : "ERR15", data : value[i], message : Dberror.errorCodes.ERR15, error : rec});
		}
		else if(isEntity(rec) && !hasDuplicateRelation(rec, record[attr], pK, polyType, relMod)){
			var resp = establishLink(db, rel.forward, rel.backward, record, rec);
			if(resp != true){
				err.push({code : resp, data : value[i], message : Dberror.errorCodes[resp]});
			}
			else{
				arr.push(rec);
			}
		}
	}
	if(arr.length){
		if(serz){
			var obj = {_type:"added", records: arr};
			_attrsForRel(record, attr, "added", arr);
			if(redoObj){
				redoObj[attr] = obj; 
			}
			else{
				var stackObj = {};
				stackObj[attr] = obj;
				record.$.undoStack[attr] = record.$.undoStack[attr] || [];
				record.$.undoStack[attr].push(obj);
				// record.$.undoStack._order_ = record.$.undoStack._order_ || [];
				record.$.undoStack._order_.push([attr]);
			}
			var _attrs = record.$._attributes, _attr = _attrs[attr];
			if(_attr){
				var _changes = _attr._changes = _attr._changes || [];
				_changes.push(obj);
			}
			cmpRelInitVal(record, attr, relMod);
			if(Object.keys(_attrs).length > 0){
				// changeModified(db.lyte, record, true)
				if(!record.$.isNew){
					cmpSet(db.lyte, record.$, "isModified", true);
					changePersist(record, false);
				}
				checkAndAddToArray(schema.dirty, record[schema._pK]);
			}
			else{
				delete record.$._attributes[attr];
				if(!Object.keys(record.$._attributes).length){
					// changeModified(db.lyte, record, false, record.$.pK)
					cmpSet(db.lyte, record.$, "isModified", false);
					changePersist(record, true);
					// record.$.isModified = false;
					// delete _attrs[attr];
					if(!record.$.isNew){
						deleteFromArray(schema.dirty, record.$.pK);
						if(!record.$.dN || (record.$.dN && !Object.keys(record.$.dN).length)){
							removeParentNesting(record);
						}			
					}
				}
			}
			emit(db, "change", record, [attr]);
		}
	}
	if(err.length > 0){
		ValidationError.setRecErr(record.$, attr, err);
	}
	else{
		ValidationError.clrRecErr(record.$, attr);
	}
	return record;
}

function remove(key,type,redoObj){
	var record = this.entity, 
	schema = record.$.schema, 
	db = schema.db,
	lyte = db.lyte,
	attr =  this.key, 
	field = schema.fieldList[attr], 
	rel = {},
	oldArr, 
	serz = field.opts ? field.opts.hasOwnProperty("serialize") : undefined;
	getRelations(db, schema, field.relKey, getSchemaObj(db, field.relatedTo), rel);
	if(!Array.isArray(key)){
		key = [key];
	}
	var relMod = getSchemaObj(db, rel.forward.relatedTo), 
	pK = relMod._pK, 
	isComp = relMod.isComp, 
	err = [], 
	relatedRecord, 
	arr = [], 
	indices = [];
	if(record.$._attributes.hasOwnProperty(attr) && record.$._attributes[attr].length){
		oldArr = record.$.getInitialValues(attr);
	}
	for(var i=0; i<key.length; i++){
		var rec = key[i], polyType;
		if((!isComp && relMod.fieldList[pK].type.toLowerCase() == typeof key[i]) || (isComp && typeof rec == "object" && Object.keys(rec).length === relMod._arrPk.length)){
			if(this.polymorphic == true && !type){
				err.push({code : "ERR22", data : key[i], message : Dberror.errorCodes.ERR22});
				continue;
			}
			relatedRecord = db.cache.getEntity((type)?(typeof type == "string" ? db.getSchema(type) : type):rel.forward.relatedTo,key[i]);
			polyType = type;
		}
		else if(isEntity(key[i])){
			relatedRecord = key[i];
			polyType = type ? type : ((relatedRecord && relatedRecord._type) ? relatedRecord._type : undefined);
		}
		if(relatedRecord){
			var index = getIndex(record[attr], pK, relatedRecord.$.get(pK),polyType);
			demolishLink(db, relatedRecord, pK, db.cache.getEntity(schema.def, record.$.pK), rel.forward.relKey, undefined, undefined, undefined, true);
			if(rel.backward != null){
				demolishLink(db, record, schema._pK, db.cache.getEntity((polyType)?(typeof polyType == "string" ? db.getSchema(polyType) : polyType):rel.forward.relatedTo, relatedRecord.$.pK), rel.backward.relKey, rel.forward);
			}
			arr.push(relatedRecord);
			indices.push(index);
		}
	}
	if(arr.length){
		if(serz){
			var obj = {_type:"removed", records: arr, _indices : indices};
			_attrsForRel(record, attr, "added", arr);
			if(redoObj){
				redoObj[attr] = obj; 
			}
			else{
				var stackObj = {};
				stackObj[attr] = obj;
				// record.$.undoStack.push(stackObj);
				record.$.undoStack[attr] = record.$.undoStack[attr] || [];
				record.$.undoStack[attr].push(obj);
				// record.$.undoStack._order_ = record.$.undoStack._order_ || [];
				record.$.undoStack._order_.push([attr]); 
			}
			var _attrs = record.$._attributes, _attr = _attrs[attr];
			if(_attr){
				var _changes = _attr._changes = _attr._changes || [];
				_changes.push(obj);
			}
			// if(!_attr.size){
			// 	delete record.$._attributes[attr];
			// }
			cmpRelInitVal(record, attr, relMod);
			if(Object.keys(_attrs).length > 0){
				// changeModified(lyte, record, true);
				if(!record.$.isNew){
					cmpSet(lyte, record.$, "isModified", true);
					changePersist(record, false);
				}
				checkAndAddToArray(schema.dirty, record[schema._pK]);
			}
			else{
				delete record.$._attributes[attr];
				if(!Object.keys(record.$._attributes).length){
					// changeModified(lyte, record, false, record.$.pK)
					cmpSet(lyte, record.$, "isModified", false);
					changePersist(record, true);
					// record.$.isModified = false;
					// delete _attrs[attr];
					if(!record.$.isNew){
						deleteFromArray(schema.dirty, record.$.pK);								
						if(!record.$.dN || (record.$.dN && !Object.keys(record.$.dN).length)){
							removeParentNesting(record);
						}			
					}
				}
			}
		}
		emit(db, "change", record, [attr]);
	}
	if(err.length > 0){
		ValidationError.setRecErr(record.$, attr, err);
	}
	else{
		ValidationError.clrRecErr(record.$, attr);
	}
}

function filter(record,filObj,len){
	var j=0;
	for(var key in filObj){
		if(record[key] === filObj[key]){
			j++;
		}
	}
	if(j === len){
		return true;
	}
}

function filterBy(obj){
	var len = Object.keys(obj).length, j = 0, arr = [];
	for(var i=0; i<this.length; i++){
		if(filter(this[i],obj,len)){
			arr.push(this[i]);
		}
	}
	if(!arr.filterBy){
		defArrUtls(arr);
		defUtls(arr,this.schema);
	}
	return arr;
}

function checkAndAddToArray(arr,value){
	if(!checkPresenceInArray(arr,value)){
		arr.push(value);
	}else{
		return -1;
	}
}

function deleteFromArray(arr,value){
	var ind = arr.indexOf(value);
	if(ind != -1){
		arr.splice(ind,1);
	}
}

function genPk(pK, opts, fields){
	var pkType;
	pK.forEach(function(item){
		pkType = fields[item].type;
		var random = opts[item] = Math.floor(Math.random()*100000 + 1);
		if(pkType == "string"){
			opts[item] = random.toString();                    
		}
	});
}

function generateRandomPk(def, opts, pK, fields){
	genPk(pK, opts, fields);
	while(isDuplicateRecord(def, opts, pK.toString())){
		genPk(pK, opts, fields);
	}            
}

function isDuplicateRecord(def,obj){
	var data = def.data, pK = def._pK, isComp = def.isComposite;
	if(data.length){
		if(!isComp && def.data._recMap){
			var pkVal = obj[pK];
			if(pkVal!=undefined){
				return def.data._recMap.get(pkVal ? pkVal.toString() : pkVal) !== undefined;
			}
			else{
				return false
			}
		}
		else{
			return data.some(function(record){
				if(compareObjects( getpKVal(obj, def), getpKVal(record) )){
					return true;
				}
			});
		}
	}
	return false;
}

function pkPresence(opts, pK){
	var result = true;
	pK.forEach(function(item){
		if(!opts.hasOwnProperty(item) || !opts[item] ){
			result = false;
			return;
		}
	});
	return result;
}

function updateJSON(db, record, def, dirty){
	var data = {},
	arrPk = def._arrPk,
	dirtyAttr = record.$._attributes;
	for(var field in dirtyAttr){
		data[field] = record[field];
	}
	var attrs = dirty;
	if(dirty == true){
		attrs = isDirty(db, record, def.relations) || [];
	}
	for(var i=0;i<attrs.length;i++){
		data[attrs[i]] = record[attrs[i]];
	}
	arrPk.forEach(function(item){
		data[item] = record[item];
	});
	return data;
}

function isDirty(db, record, relations, parent, fMod){
	var result = [];
	relations.forEach(function(red_def, rel){
		for(var j=0;j<red_def.length;j++){
			var rel = red_def[j];
			if(rel.opts && rel.opts.serialize){
				var key = rel.relKey, 
				type = rel.relType, 
				records = record[key],
				bMod = rel.relatedTo;
				if(parent && bMod){
					var child = getBackwardRel(fMod,rel,getSchemaObj(db, rel.relatedTo));
					if(parent == child && fMod != rel.relatedTo){
						continue;
					}
				}
				if(rel.opts.serialize == "record"){
					var res = isRelDirty(db, rel, records, rel);
					if(res){
						result.push(key);
						continue;
					}							
				}
				else if(rel.opts.serialize == "partial"){
					if(type == "hasMany"){
						if(records && records.partial && records.partial.size){
							result.push(key);
							continue;
						}
					}
					else{
						if((isEntity(records) && records.$.isModified) || (record && record.$ && record.$.partial && record.$.partial.hasOwnProperty(key))){
							result.push(key);
							continue;
						}
					}
				}
				if(rel.opts.deepNest == true){	
					if(record.$.dN && record.$.dN[key]){
						result.push(key);
					}
				}
			} 
		}
	});
	return result;
}

function isRelDirty(db, rel, records, parent){
	var type = rel.relType;
	var fMod = rel.relatedTo;
	var fDef = getSchemaObj(db, fMod);
	var relations = fDef.relations; 
	if(!isEmpty(records)){
		if(type == "hasMany" && Array.isArray(records) && records.length){
			var len = records.length;
			for(var i=0; i<len; i++){
				if(records[i].$.isModified == true){
					return true;
				}
			}
			for(var j=0; j<len; j++){
				var rec = records[j];
				var arr = isDirty(db, rec, relations, parent, fDef);
				if(arr.length){
					return true;
				}
			}
		}
		else if(type == "belongsTo" && isEntity(records)){
			if(records.$.isModified == true){
				return true;
			}
			var arr = isDirty(db, records, relations, parent, fDef);
			if(arr.length){
				return true;
			}
		}
	}
	return false;
}

function polymorphicToJSON(db,rel,data){
	var opts = rel.opts;
	if(opts && opts.polymorphic){
		if(Array.isArray(data)){
			var res = [];
			data.forEach(function(item){
				res.push(polyToJSON(db,item));
			});
			return res;
		}
		else{
			return polyToJSON(db,data);
		}
	}
}

function polyToJSON(db, data){
	// var type = data ? data._type : undefined;
	var polyMod = data.$.schema;
	if(!polyMod.hasOwnProperty("fieldList") && polyMod._name){
		polyMod = db.getSchema(polyMod._name);
	} 
	var pK = polyMod ? polyMod._pK : undefined, 
	poly = {}, 
	pkVal = data.$.pK;

	if(typeof pkVal == "object"){
		poly = Object.assign({}, pkVal);
	}
	else{
		poly[pK] = pkVal;
	}
	// poly._type = data._type;
	poly._type = data._type ? data._type : data.$.model._name;
	return poly;
}

function removeBackwardRel(val,rel,pK,pkVal,wholeRelKey){
	if(wholeRelKey){
		delete val[rel.backward.relKey];
		return; 
	}
	if(rel.backward != null){
		var rec = val[rel.backward.relKey];
		if(Array.isArray(rec)){
			for(var i=0; i<rec.length; i++){
				if(comparePk(rec[i],pkVal)){
					rec.splice(i,1);
					if(rec.length == 0){
						delete val[rel.backward.relKey];
					}
					return;
				}								
			}
		}
		else if(rec && isEntity(rec) && comparePk(rec, pkVal)){
			delete val[rel.backward.relKey];
		}
	}
}

function checkPresenceInArray(arr,value){
	return arr && arr.some(function(val){
		return val === value;
	});
}

function idbSerialize(db, data, rel, def, bDef, pkVal, expose){
	var relTo = rel.forward.relatedTo, 
	pK = def._pK, 
	bPk = bDef._pK;
	if(Array.isArray(data)){
		data.forEach(function(item, index){
			if(isEntity(item) && item.$.inIDB){
				data[index] = item[bPk];										
			}
			else if(!checkPresenceInArray(db.$.recStack[relTo._name],item[bPk])){
				removeBackwardRel(item, rel, pK, pkVal, true);
				removeSelfCircularReference(db, bDef._name, item, expose);
			}
			else{
				data[index] = item[bPk];										
			}
		});
	}
	else if(data && isEntity(data)){
		if(isEntity(data) && data.$.inIDB){
			obj[relKey] = data[bPk];
		}
		else if(!checkPresenceInArray(db.$.recStack[relTo._name],data[bPk])){
			removeBackwardRel(data, rel, pK, pkVal, true);
			removeSelfCircularReference(db, bDef._name, data,expose);
		}else{
			obj[relKey] = data[bPk];
		}
	}
}

function idSerialize(db, obj, rel, expose, partialObj, partialRef){
	var opts = rel.forward.opts, 
	polymorphic = opts ? opts.polymorphic : undefined, 
	relKey = rel.forward.relKey,
	relKey = rel.forward.relKey, 
	toJSON,
	clone, 
	saveState;
	if(opts){
		toJSON = opts.toJSON, clone = opts.clone, saveState = opts.saveState;
	}
	var data = obj[relKey], 
	schema = rel.backward.relatedTo, 
	bDef = rel.forward.relatedTo, 
	pkVal = getpKVal(obj,getSchemaObj(db, schema)), 
	modName;
	if(Array.isArray(data)){
		if(polymorphic){
			obj[relKey] = polymorphicToJSON(db,rel.forward,data);
		}
		else{
			var arr = [];
			if(partialObj){
				var partial = partialObj[relKey] = partialObj[relKey] || [], anyNew = false;
			}
			data.forEach(function(item){
				if(item.$.isNew && expose != true && expose != "state"){
					anyNew = true;
					rSerialize(db, item, rel, bDef, schema._pK, pkVal, expose, partial, partialRef);
					arr.push(item);													
				}
				else{
					if(partial){
						var pObj = {}, pType = "related";
						if(item.$.isDeleted){
							pType = "removed";
						}
						_defProp(pObj, "$", {});
						var nPartial = 	pObj.$, nDef = getSchemaObj(db, rel.forward.relatedTo);
						Object.defineProperties(nPartial, {
							pkVal : {
								value : item.$.pK
							},
							type : {
								value : pType
							},
							schema : {
								value : nDef
							},
							record : {
								value : db.cache.getEntity(nDef.def, item.$.pK)
							}
						});		
						if(item.$.isDeleted){
							pObj.$.onlyDetach = true;
						}
						partial.push(pObj);
					}
					if(!item.$.isDeleted){
						if(expose == true && toJSON){
							arr.push(item.$.toJSON(undefined, rel.backward));
						}
						else if(expose == "state" && saveState){
							arr.push(item.$.saveState(undefined, true, rel.backward));
						}
						else if(expose == "clone" && clone){
							arr.push(item.$.clone(rel.backward));
						}
						else{
							arr.push(item.$.pK && typeof item.$.pK == "object" ? Object.assign({}, item.$.pK) : item.$.pK);
						}	
					}
				}
			});
			obj[relKey] = arr;
		}
	}
	else if(data && isEntity(data)){
		if(data.$.isNew && expose != true && expose != "state"){
			var partial;
			if(partialObj){
				partial = partialObj[relKey] = partialObj[relKey] || {};
			}
			partial = rSerialize(db, data, rel, bDef, schema._pK, pkVal, expose, partial, partialRef);
			partialObj[relKey] = partial;
		}
		else{
			if(polymorphic){
				obj[relKey] = polymorphicToJSON(db,rel.forward,data);								
			}
			else if(!data.$.isDeleted){
				if(expose == true && toJSON){
					obj[relKey] = data.$.toJSON(undefined, rel.backward);
				}
				else if(expose == "state" && saveState){
					obj[relKey] = data.$.saveState(undefined, true, rel.backward);
				}
				else if(expose == "clone" && clone){
					obj[relKey] = data.$.clone(rel.backward);
				}
				else{
					obj[relKey] = (data.$.pK && typeof data.$.pK == "object" ? Object.assign({}, data.$.pK) : data.$.pK);
				}
			}
		}
	}
}

function recordSerialize(db, obj, key, val, rel, def, bDef, pkVal, expose, partialObj, partialRef){
	var pK = def._pK;
	if(Array.isArray(val)){
		if(val.length == 0){
			delete obj[key];
			return 0;
		}
		val = Array.from(val);
		var partial = partialObj[key] = partialObj[key] || [];
		for(var j=0; j<val.length; j++){
			if(val[j] && isEntity(val[j])){
				rSerialize(db, val[j], rel, bDef, pK, pkVal, expose, partial, partialRef);
				if(val[j].$.isDeleted){
					partial[j] && partial[j].$ ? partial[j].$.onlyDetach = true : undefined; 
					val.splice(j,1);
					j--;
				}
			}
		}
	}
	else if(val && isEntity(val)){
		var partial = partialObj[key] = partialObj[key] || {};
		partial = rSerialize(db, val, rel, bDef, pK, pkVal, expose, partial, partialRef);
		// if(val.$.isDeleted){
		// 	debugger
		// }
		partialObj[key] = partial;
	}
}

function rSerialize(db, data, rel, bDef, pK, pkVal, expose, partialObj, partialRef){
	var relTo = rel.forward.relatedTo, 
	partial, 
	def = rel.backward.relatedTo, 
	polymorphic = rel.forward.opts ? rel.forward.opts.polymorphic : undefined; 
	removeBackwardRel(data, rel, pK, pkVal);
	if(partialObj){
		var partial = {}, 
		pType = data.$.isNew ? "added" : data.$.isModified ? "modified" : data.$.isDeleted ? "removed" : "related", modName;
		if(polymorphic){
			modName = data.$.schema._name;
			data.$.polymorphicType = modName;
			bDef = db.schema[modName];
		}
		_defProp(partial, "$", {});
		var nPartial = 	partial.$, 
		nDef = polymorphic ? db.schema[modName] : getSchemaObj(db, relTo);
		Object.defineProperties(nPartial, {
			pkVal : {
				value : data.$.pK
			},
			type : {
				value : pType
			},
			schema : {
				value : nDef
			},
			record : {
				value : db.cache.getEntity(nDef.def, data.$.pK)
			}
		});
		if(Array.isArray(partialObj)){
			partialObj.push(partial);
		}
	}
	removeSelfCircularReference(db, bDef._name, data, expose, undefined, partial, partialRef);
	return partial;
}

function partialSerialize(db, obj, key, val, rel, def, bDef, pkVal, expose, partialObj, partialRef){
	var field = rel.forward, 
	pK = def._pK, 
	relTo = rel.forward.relatedTo,
	polymorphic = rel.forward.opts ? rel.forward.opts.polymorphic : undefined;
	if(field.relType == "hasMany"){
		if(val && val.partial){
			var part = val.partial,
			bpK = bDef._pK;
			if(partialObj){
				partial = partialObj[key] = partialObj[key] || [];
				_defProp(partial, "partial", true);
			}
			if(part){
				var pObj, 
				pKey, 
				newPartial,
				result = [], 
				self = this, 
				relRec;
				part.forEach(function(value , partKey){
					pObj = value, relRec = partKey, pKey = partKey.$.pK , newPartial;
					if(/^(added|modified)$/.test(pObj.type)){
						var pType = "related",
						ind = getIndex(val, bpK, pKey, undefined, getSchemaObj(db, relTo));
						if(ind != -1){
							var rec = val[ind], updVal, rec$;
							var polyType;
							if(rec && rec.$){
								rec$ = Object.assign({}, rec.$);
								rec = Object.assign({}, rec);
								_defProp(rec, '$', rec$);
							}
							updVal = rec;
							if(polymorphic && rec){
								polyType =  rec._type ? rec._type : rec.$.schema._name;
								bDef = db.schema[polyType];
							}
							var record = db.cache.getEntity(bDef.def, pKey);
							removeBackwardRel(rec, rel, pK, pkVal);
							if(rec.$.isNew){
								pType = "added";
							}
							else if(rec.$.isModified){
								pType = "modified";												
								var valDir = isDirty(db, record, bDef.relations);
								updVal = updateJSON(db, rec, bDef, valDir);				
							}
							else{
								var valDir = isDirty(db, record, bDef.relations);
								updVal = updateJSON(db, rec, bDef, valDir);											
							}
							if(partial){
								var newPart = {};
								_defProp(newPart, "$", {});
								var newPart$ = newPart.$,
								newPartDef = polymorphic ? polyType : relTo;
								Object.defineProperties(newPart$, {
									pkVal : {
										value : pKey
									},
									type : {
										value : pType
									},
									schema : {
										value : polymorphic ? db.schema[polyType] : getSchemaObj(db, relTo)
									},
									record : {
										value :  db.cache.getEntity(newPartDef, pKey)
									}																										
								});
								// if(partialRef){
								// 	var refId = "rec"+(++partialRef.size), refKey = partialRef.refKey;
								// 	updVal[refKey] = refId;
								// 	partialRef.set(refId, newPart);
								// }
								partial.push(newPart);
							}
							removeSelfCircularReference(db, bDef._name, updVal, expose, undefined, newPart, partialRef);			
							// var resObj = {type: pObj.type, data: updVal};
							if(isEntity(updVal)){
								updVal.$.partialType = pObj.type;
							}
							else{
								_defProp(updVal, "$", {});
								_defProp(updVal.$, "partialType", pObj.type);
								if(!updVal.$.hasOwnProperty("pK")){
									_defProp(updVal.$, "pK", pKey);
								}
							}
							if(polymorphic){
								updVal.$.polymorphicType = polyType;
							}
							result.push(updVal);
						}
					}
					else if(pObj.type == "removed"){
						var dObj = {};
						if(pKey && typeof pKey == "object"){
							Object.assign(dObj, Object.assign({},pKey));
						}
						else{
							dObj[bpK] = pKey;
						}
						var record = db.cache.getEntity(bDef.def, pKey) || db.cache.getEntity(bDef.def, pKey, true);
						if(partial){
							var newPart = {}; 
							_defProp(newPart, "$", {});
							var newPart$ = newPart.$;
							Object.defineProperties(newPart$, {
								pkVal : {
									value : pKey
								},
								type : {
									value : "removed"
								},
								schema : {
									value : polymorphic && pObj.polymorphicType ? db.schema[pObj.polymorphicType] : getSchemaObj(db, relTo) 
								},
								record: {
									value : record
								}																										
							});
							if(partialRef){
								var sz = partialRef.size,
								refId = "rec"+(++sz), refKey = partialRef.refKey;
								dObj[refKey] = refId;
								partialRef.set(refId, newPart);
							}
							partial.push(newPart);
						}
						_defProp(dObj, "$", {});
						dObj.$.partialType = "removed";
						if(polymorphic && pObj.polymorphicType){
							dObj.$.polymorphicType = pObj.polymorphicType;
						} 
						if(!dObj.$.hasOwnProperty('pK')){
							dObj.$.pK = pKey;
						}
						// result.push({type:"removed", data: dObj})

						result.push(dObj);
					}
				});
				if(result.length){
					val = obj[key] = result;
				}
				else{
					delete obj[key];
				}
			}
		}
		else{
			delete obj[key];
		}
	}
	else if(field.relType == "belongsTo" && val && isEntity(val)){
		var polyType;
		if(polymorphic && val){
			polyType =  val._type ? val._type : val.$.schema._name;
			bDef = db.schema[polyType];
		}
		removeBackwardRel(val, rel, pK, pkVal);
		var updVal = val, valDir;
		if(val.$.isNew){
			removeBackwardRel(val, rel, pK, pkVal);
		}
		else{
			valDir = isDirty(db, val, bDef.relations);
			updVal = updateJSON(db, val, bDef, valDir);
		}
		if(partialObj){
			var partial = partialObj[key] = partialObj[key] || {};
			var pType = val.$.isNew ? "added" : val.$.isModified ? "modified" : "related";
			_defProp(partial, "$", {});
			var partial$ = partial.$;
			var partMod = polymorphic ? db.schema[polyType] : getSchemaObj(db, relTo);
			Object.defineProperties(partial$, {
				pkVal : {
					value : val.$.pK
				},
				type : {
					value : pType
				},
				schema : {
					value : partMod
				},
				record : {
					value : db.cache.getEntity(partMod.def, val.$.pK)
				}
			});
			// if(partialRef){
			// 	var refId = "rec"+(++partialRef.size), refKey = partialRef.refKey;
			// 	updVal[refKey] = refId;
			// 	partialRef.set(refId, partial);
			// }
		}
		if(polymorphic){
			updVal.$ || _defProp(updVal, "$", {});
			updVal.$.polymorphicType = polyType;
		}
		removeSelfCircularReference(db, bDef._name, updVal, expose, undefined, partial, partialRef);
		val = obj[key] = updVal;
	}
}

function removeSelfCircularReference(db, name, obj, expose, type, partialObj, partialRef, parentRel,addNotDefinedFields){
	var def = db.schema[name], 
	fieldList = def.fieldList,
	pkVal = getpKVal(obj,def),  
	record = db.cache.getEntity(def.def, pkVal), 
	partObj = isEntity(record) ? record.$.partial : undefined, 
	polymorphicType = obj && obj.$ ? obj.$.polymorphicType : undefined, 
	refId;
	db.$.recStack[name] = db.$.recStack[name] || []; 
	var ret = checkAndAddToArray(db.$.recStack[name], pkVal)
	if(partialRef){
		var sz = partialRef.size,
		refObj = {};
		refId = "rec"+(++sz);
		_defProp(refObj, "$", {pkVal: record.$.pK, schema :record.$.schema});
		partialRef.set(refId, refObj);
	}
	var unlinkedKeys = getFromCB(db,"serializer",def.serializer,"serializeEmptyRelation");
	for(var key in obj){
		var field = fieldList[key], 
		extMod, 
		swap = false, 
		relTo, 
		bDef, 
		relType;
		var removePk = ((expose == "clone" || type == "create" || (isEntity(obj) && obj.$.isNew)) && def._pK == key) ? true: false;
		if(field && (field == parentRel || (removePk && expose != true && expose != "state"))){
			delete obj[key];
			continue;
		}
		if(!field){
			if(polymorphicType){
				extMod = db.getSchemaObj(polymorphicType);
				field = extMod.fieldList[key];
				swap = true;
			}
			if(!addNotDefinedFields){
				delete obj[key];
			}
			continue;
		}
		if(field && field.type != "relation" && !expose  && db.dataType[field.type] && db.dataType[field.type].serialize && obj.hasOwnProperty(key)){			
			obj[key] = db.dataType[field.type].serialize(obj[key],key,record);
			continue;
		}
		if(partObj && partObj.hasOwnProperty(key)){
			var partPload = {},
			_bDef = getSchemaObj(db, field.relatedTo),
			bPk = _bDef._pK,
			doCont = false;
			partObj[key].forEach(function(item, partPk){
				partPload[bPk] = partPk.$.pK;
				_defProp(partPload, "$", {});
				_defProp(partPload.$, "partialType", "removed");
				_defProp(partPload.$, "pK", partPk.$.pK);
				if(partialObj){
					var partial = partialObj[key] = partialObj[key] || {};
					_defProp(partial, "$", {});
					var partial$ = partial.$;
					Object.defineProperties(partial$, {
						pkVal : {
							value : partPk.$.pK
						},
						type : {
							value : "removed"
						},
						schema : {
							value : _bDef
						},
						parent : {
							value : record
						},
						record: {
							value: db.cache.getEntity(field.relatedTo, partPk.$.pK)
						}
					});
				}
				if((unlinkedKeys === true || (Array.isArray(unlinkedKeys) && unlinkedKeys.indexOf(field.relKey))) && field.opts && /^(id|record)$/.test(field.opts.serialize)){
					obj[key] = null;
					doCont = true;
				}
				else if(field.opts.serialize == "partial"){
					obj[key] = partPload;
					doCont = true;
				}
				if(field && field.opts && /^(id|record)$/.test(field.opts.serialize)){
					Object.defineProperties(partial$, {
						onlyDetach:{
							value: true
						},
						relKey: {
							value: key
						}
					});
				}
			});		
			if(doCont){
				continue;
			}
		}
		if((expose == true || expose == "clone" || expose == "state") && obj[key] && typeof obj[key] == "object" && field && field.type != "relation"){
			obj[key] = deepCopyObject(obj[key]);
			continue;
		}
		if(obj[key] && field && field.type == "relation"){
			relTo = field.relatedTo;
			relType = field.relType;
			bDef = getSchemaObj(db, relTo);
			if(bDef == undefined){
				continue;
			}
			var relKey = field.relKey, rel = {};
			if(swap){
				getRelations(db, extMod, field.relKey, bDef, rel);						
			}
			else{
				getRelations(db, def, relKey, bDef, rel);
			}
			var opts = field.opts;
			var serialize = opts ? opts.serialize : undefined, val = obj[relKey];
			if(expose == "idb"){
				idbSerialize(db, val, rel, def, bDef, pkVal, expose);
			}
			else if(expose || serialize == "id"){
				idSerialize(db, obj, rel, expose, partialObj, partialRef);
			}
			else if(serialize === "record"){
				var ret = recordSerialize(db, obj, key, val, rel, def, bDef, pkVal, expose, partialObj, partialRef);
				if(ret == 0){
					if(relType === "hasMany" && (unlinkedKeys === true || (Array.isArray(unlinkedKeys) && unlinkedKeys.indexOf(field.relKey))) && Array.isArray(record[key]) && record[key].partial && record[key].partial.size){
						var emptyArr = true;
						record[key].partial.forEach(function(pobj){
							if(pobj.type !== "removed"){
								emptyArr = false;
							}
						});
						if(emptyArr){
							obj[key] = [];
							continue;
						}
					}
				}
			}
			else if(serialize === "partial"){
				partialSerialize(db, obj, key, val, rel, def, bDef, pkVal, expose, partialObj, partialRef)
			}
			else{
				delete obj[relKey];
				continue;
			}
			val = obj ? obj[relKey] : undefined;
			if( val && (relType == "hasMany" && Array.isArray(val) && val.length == 0) || (relType == "belongsTo" && typeof val == "object" && Object.keys(val).length == 0)) {
				if((unlinkedKeys === true || (Array.isArray(unlinkedKeys) && unlinkedKeys.indexOf(field.relKey))) && relType == "hasMany" && field.opts && /^(id|record)$/.test(field.opts.serialize)){
					obj[relKey] = [];
				}
				else{
					delete obj[relKey];
				}
			}
		}
		
	}
	if(partialRef){
		var refKey = partialRef.refKey;
		obj[refKey] = refId;
	}
}

function getpKVal(ins, schema){
	var schema = schema ? schema : ins.$.schema, 
	arr = schema._arrPk;
	if(arr.length == 1){
		return ins[arr[0]];
	}
	else{
		var obj = {};
		arr.forEach(function(item){
			obj[item] = ins[item];
		});
	}
	return obj;
}

function toJSONObj(db, schema, data, expose, type, partial, parentRel, addNotDefinedFields){
	var copyObj, 
	pkVal, 
	name = schema._name, 
	pK = schema._pK;
	if(expose == true || expose == "state" || expose == "clone"){
		copyObj = Object.assign({},data);
	}
	else{
		copyObj = deepCopyObject(data)
	}
	if(isEntity(copyObj)){
		pkVal = copyObj.$.pK;
	}
	else{
		pkVal = db.cache.getEntity(schema.def, getpKVal(copyObj, schema)).$.pK;
	}
	var partialObj = partial ? partial.obj : undefined, partialMp;
	if(partialObj && !partialObj.has(pkVal)){
		partialObj.set(pkVal,{});
		partialMp = partialObj.get(pkVal); 
	}
	removeSelfCircularReference(db, name, copyObj,expose,type, partialMp, partial && partial.ref ? partial.ref : undefined, parentRel,addNotDefinedFields);
	if(expose == "idb"){
		db.idbIns.removeNotNeededKeys(db, name, copyObj);
	}
	return copyObj;
}

function toJSON(db,name,obj,expose,type,partialObj,parentRel,addNotDefinedFields){
	var copyObj, 
	def = db.schema[name];
	db.$.recStack = {};
	if(Array.isArray(obj)){
		var arr = [];
		for(var i=0; i<obj.length; i++){
			copyObj = toJSONObj(db, def, obj[i], expose, type, partialObj, parentRel,addNotDefinedFields);
			arr.push(copyObj);
		}
		return arr;
	}
	else if(obj && (typeof obj === "object" || isEntity(obj))){
		copyObj = toJSONObj(db, def, obj, expose, type, partialObj, parentRel,addNotDefinedFields);
	}
	db.$.recStack = {};
	return copyObj;
}

function createCopy(data){
	if(Array.isArray(data)){
		if(data.save){
			var arr = [];
			for(var i=0; i<data.length; i++){
				var rec = deepCopyObject(data[i]);
				arr.push(rec);
			}
			return arr;
		}
	}
	else if(data && ( isEntity(data) || typeof data == "object")){
		return deepCopyObject(data);
	}
	return data;
}

function initPartialObj(db, name, type, qP, key, url, customData, argsObj){
	var partial = { obj : new Map() };
	// rKey = "recId", 
	// refKey, 
	// res,
	// def = db.schema[name];
	// partial.ref = new Map();
	// res = initCB(db,"serializer", def.serializer, def.serializer.constructor.REFERENCEKEY, { argsObj: argsObj, args:[name,type,qP,key,url,customData]});
	// refKey = res ? res.data : undefined;
	// if(!isEmpty(refKey)){
	// 	rKey = refKey;
	// }
	// partial.ref.refKey = rKey;
	return partial;
}

function recChk(lyte, rec){
	if(isEntity(rec)){
		if(rec.$.isUnloaded !== true){
			return true;
		}
		else{
			Dberror.error(lyte, rec+ "has been dropped. So no operations can be performed over this entity");
		}
	}
	return false;
}

function initCB(db, type, ins, key, obj){
	var args = obj.args, ret = {}, _appC, _appS;
	obj.argsObj ? obj.argsObj.callback = key : undefined;
	if(ins){
		if(ins[key]){
			ret.data = ins[key].apply(ins, obj.argsObj ? [obj.argsObj] : obj.args);
			// if(db.debug){
			// 	Dberror.log(key+" of "+ type+"-"+ins.constructor.name+ " called", "#008000")
			// }
			return ret;
		}
	}
	else{
		var appC = db.applicationConnector, appS = db.applicationSerializer;
		if(type == "connector" && appC){
			if(appC[key]){
				ret.data = appC[key].apply(appC, obj.argsObj ? [obj.argsObj] : obj.args);
				return ret;
			}
		}
		else if(type == "serializer" && appS){
			if(appS[key]){
				ret.data = appS[key].apply(appS, obj.argsObj ? [obj.argsObj] : obj.args);
				return ret;
			}
		}
	}
}

function cB(callback,args){
	return callback.func.apply(callback.context, args.concat(callback.name));
}

function cbScp(db, ins, key, type){
	if(ins){
		if(ins[key]){
			return { func : ins[key], context: ins, name:key};
		}
	}
	else{
		var appC = db.applicationConnector, appS = db.applicationSerializer;
		if(type == "connector" && appC && appC[key]){
			return { func : appC[key], context: appC, name:key };
		}
		else if(type == "serializer" && appS && appS[key]){
			return { func : appS[key], context: appS, name:key};
		}
	}
}

function getFromCB(db, type, ins, key){
	var _appC, _appS, appC = db.applicationConnector, appS = db.applicationSerializer;
	if(ins){
		return ins[key];
	}
	else{
		// var appC = db.applicationConnector, appS = db.applicationSerializer;
		if(type == "connector"){
			if(appC){
				return appC[key];
			}
		}
		else if(type == "serializer" && appS){
			if(appS){
				return appS[key];
			}
		}
	}
}

function comparePk(ins, pkVal){
	var pK = ins.$.pK, 
	pkType = typeof pK;
	if(pkType == "string" || pkType == "number"){
		return pK === pkVal;
	}
	else if(typeof pK == "object"){
		var len = Object.keys(pK).length, i=0;
		for(var key in pK){
			if(pK[key] === pkVal[key]){
				i++;
			}
		}
		return len === i;
	}
}

function newRecord(db, def, opts, skipValidation){
	var lyte = db.lyte;
	if(opts == undefined){
		opts = {};
	}
	if(opts && typeof opts !== "object"){
		Dberror.warn(db.lyte, "LD25", opts);
		var err = new ValidationError(db.lyte, undefined, undefined, db.lyte.getErrorMessage("LD25", opts));
		return err;
	}
	var fields = def.fieldList, 
	record = {}, 
	errorObj = new ValidationError(db.lyte), 
	pK = def._arrPk;
	if(!pkPresence(opts, pK)){
		generateRandomPk(def, opts, pK, fields)
	}
	else if(isDuplicateRecord(def, opts, pK)){
		ValidationError.setError(lyte, errorObj, pK, {code : "ERR16", message : Dberror.errorCodes.ERR16})
	}
	for(var field in fields){
		var fieldKeys = fields[field];
		if(fieldKeys.relType == "hasMany"){
			record[field] = [];
		}
		var val = opts[field];     
		var fldType = fieldKeys.type;
		if(fldType != "relation"){
			if(val === undefined || val === ""){
				if(fieldKeys.hasOwnProperty("default")){
					val = record[field] = getDefaultVal(record, fieldKeys.default);
				}
			}
			// if(fldType !== Lyte.getDataType(val) && (val !== undefined  || fldType === "boolean")) {
			// 	val = Lyte.typeCast(val, fldType);
			// }		
			if(!skipValidation){
				for(var property in fieldKeys){
					var resp = checkProperty(property, val, field, fieldKeys[property], record, def._name, db, ValidationError.errorCodes, undefined, fieldKeys, true);
					if(resp != true){
						if(typeof resp == "object"){
							resp.value = val;
						}
						ValidationError.setError(lyte, errorObj,field,resp);
						break;
					}
				}
			}	
		}    
	}
	for(var opt_key in opts){
		record[opt_key] = opts[opt_key];
	}
	record = new def.def(record, {}, db);
	cmpSet(lyte, record.$, "isNew", true);
	changePersist(record, false);
	// record.$.isNew = true;
	var relations = def.relations;
	relations.forEach(function(relation, key){
		for(var i=0; i<relation.length; i++){
			var relObj = relation[i];
			var relKey = relObj.relKey;
			var polymorphic = relObj.opts ? relObj.opts.polymorphic : undefined; 
			if(record && record[relKey]){
				var optsRelVal = opts[relKey];
				record[relKey] = undefined;
				var fieldKeys = relation[i], rel = {}, resp = getRelations(db, def, fieldKeys.relKey, getSchemaObj(db, fieldKeys.relatedTo), rel),ingore=false;
				if(resp != true){
					ValidationError.setError(lyte, errorObj,fieldKeys.relKey,{code : resp, data : relation, message : Dberror.errorCodes[resp]});
					continue;
				}
				var bDef = getSchemaObj(db, fieldKeys.relatedTo), bPk = bDef._pK , isComp = bDef.isComp, bPkType = !isComp ? bDef.fieldList[bDef._pK].type : undefined;
				if(!Array.isArray(optsRelVal)){
					optsRelVal = [optsRelVal];
				}
				else if(relation[i].relType == "belongsTo"){
					ValidationError.setError(lyte, errorObj,fieldKeys.relKey,{code : "ERR21", data : optsRelVal, message : Dberror.errorCodes.ERR21});
					continue;
				}
				errorObj[fieldKeys.relKey] = [];
				for(var j=0; j<optsRelVal.length; j++){
					var relRecord = undefined, relMod = getSchemaObj(db, fieldKeys.relatedTo), ind;
					if(optsRelVal[j] && isEntity(optsRelVal[j])){
						relRecord = optsRelVal[j];
					}
					else if(isComp && typeof optsRelVal[j] == "object"){
						var ind = getIndex(bDef.data, bPk, getpKVal(optsRelVal[j], bDef));
						if(ind != -1){
							relRecord = bDef.data[ind];
						}
						else{
							if(polymorphic){
								if(optsRelVal[j] && optsRelVal[j].hasOwnProperty("_type")){
									relMod =  optsRelVal[j]._type;
								}
								else{
									ValidationError.setError(lyte, errorObj, fieldKeys.relKey, {code : "ERR22", data : optsRelVal[j], message : Dberror.errorCodes.ERR22});
									continue;		
								}
							}
							relRecord = newRecord(db, relMod, optsRelVal[j]);									
						}
					}
					else if(optsRelVal[j] && typeof optsRelVal[j] == bPkType.toLowerCase()){
						relRecord = db.cache.getEntity(relMod.def, optsRelVal[j]);
					}
					else if(optsRelVal[j] && typeof optsRelVal[j] == "object"){
						if(polymorphic){
							if(optsRelVal[j] && optsRelVal[j].hasOwnProperty("_type")){
								relMod =  optsRelVal[j]._type;
							}
							else{
								ValidationError.setError(lyte, errorObj, fieldKeys.relKey, {code : "ERR22", data : optsRelVal[j], message : Dberror.errorCodes.ERR22});
								continue;		
							}
						}
						relRecord = newRecord(db, relMod, optsRelVal[j]);
						// ingore = true;
					}
					if(relRecord && relRecord.$ && relRecord.$.isError){
						ValidationError.setError(lyte, errorObj, fieldKeys.relKey,{code : "ERR15", data : optsRelVal[j], message : Dberror.errorCodes.ERR15, error : Object.assign({}, relRecord)});
						continue;
					}
					if(relRecord && relRecord.$ && !relRecord.$.isError){
						resp = establishLink(db, rel.forward, rel.backward, record, relRecord, undefined, ingore);
						if(resp != true){
							ValidationError.setError(lyte, errorObj,fieldKeys.relKey,{code : resp, data : optsRelVal[j], message : Dberror.errorCodes[resp]});
						}							
					}
				}
				if(errorObj[fieldKeys.relKey].length == 0){
					delete errorObj[fieldKeys.relKey];
				}
				if(relation[i].relType == "hasMany"){
					var fieldkey = relKey;
					if(record[fieldkey] == undefined){
						record[fieldkey] = [];
					}
					if(!record[fieldkey].add){
						if(polymorphic){
							_defProp(record[fieldkey], "polymorphic", true);
						}
						defArrUtls(record[fieldkey]);
						defUtls(record[fieldkey], relation[i].relatedTo,record,fieldkey);
						defPolyUtls(record[fieldkey]);
					}
				}
			}
		}	
	});
	if(errorObj && errorObj.$ && Object.keys(errorObj.$.error).length > 0){
		return errorObj;
	}
	var toRel = db.$.toRelate[def._name], pkVal = record.$.pK;
	if(toRel && toRel.has(pkVal)){
		establishToRelated(record, toRel.get(pkVal));
		toRel.delete(pkVal);
	}
	if(def.didLoad){
		var callBack = def.didLoad;
		for(var i=0;i<callBack.length;i++){
			callBack[i].apply(record);				
		}
	}
	handleArrOp(lyte, def.data,"push",record);
	checkAndAddToArray(def.dirty, record.$.pK);
	def.emit("add",[record]);
	db.emit("add",[def._name,record]);
	if(skipValidation){
		record.$.validatedOnCreate = false;
	}
	return record;
}

function getIndex(data,pKey,pkVal,type,def){
	var isComp = def ? def.isComp : (pKey.split(',').length > 1 ? true : false); 
	if(!isComp){
		return getInd(data, pKey, pkVal, type)
	}
	else{
		return getCompInd(data, pkVal, type, def)
	}
}

function getCompInd(data,pkVal,type,def){
	for(var i=0;data && i<data.length;i++){
		var rec = data[i];
		if(type && data[i]._type !== type){
			continue;
		}
		if(compareObjects(getpKVal(rec,def), pkVal)) {
			return i;
		}
	}
	return -1;
}

function getInd(data,pKey,pkVal,type){
	for(var i=0;data && i<data.length;i++){
		var rec = data[i];
		if(type && rec._type !== type){
			continue;
		}
		if(rec[pKey] == pkVal){
			return i;
		}
	}
	return -1;
}

function isDuplicateEntity(def,obj){
	var data = def.data, pK = def._pK, isComp = def.isComposite;
	if(data.length){
		if(!isComp && def.data._recMap){
			var pkVal = obj[pK];
			return def.data._recMap.get(pkVal ? pkVal.toString() : pkVal) !== undefined;
		}
		else{
			return data.some(function(record){
				if(compareObjects( getpKVal(obj, def), getpKVal(record) )){
					return true;
				}
			});
		}
	}
	return false;
}

function compareRecords(a,b,pK,type,def){
	var pK = def._arrPk;
	if(isEntity(a) && isEntity(b) && pK.length){
		if(type && a._type && type !== a._type){
			return false;
		}
		var pkLen = pK.length;
		for(var i=0;i<pkLen;i++){
			var itm = pK[i];
			if(a[itm] && b[itm] && a[itm] !== b[itm]){
				return false;
			}
		}
		return true;
	}
	return false;
}

function hasRecordInArray(array,record,pK,type,isComp){
	if(isEntity(record) && pK){
		var len = array.length;
		for(var i=0; i<len; i++){
			var itm = array[i];
			if(type && itm._type !== type){
				continue;
			}
			if(isComp){
				if(compareRecords(itm, record, pK, undefined, record.$.schema)){
					return true;
				}
			}
			else{
				if((type && itm._type && type === record._type && itm[pK] === record[pK]) || (itm[pK] === record[pK])){
					return true;
				}
			}
		}
	}
	return false;
}

function hasDuplicateRelation(toRelate,relation,pK,type,def){
	var isComp = def.isComp;
	if(Array.isArray(relation)){
		if(!isComp && !relation.isPolymorphic && relation._recMap){
			return relation._recMap.get(toRelate[pK]);
		}
		else{
			return hasRecordInArray(relation, toRelate, pK, type, isComp);
		}
	}
	else if(relation && isEntity(relation)){
		return compareRecords(toRelate, relation, pK, type, def);
	}
	return false;
}

function toInsertData(db, def, payLoad, saveParent, index){
	// var def = db.schema[name];
	var name = def._name ? def._name : def;
	var data = insertIntoStore(db, def, payLoad[name],saveParent,true, undefined, index);
	def ? delete def.rel : undefined;
	return data;
}

function insertIntoStore(db,schemaCls,data,saveParent,stack,partialObj,index, checkRelData){
	var ret;
	if(Array.isArray(data)){
		ret = [];
		for(var i=0; i<data.length; i++){
			ret[i] = insertIntoStore(db, schemaCls, data[i], saveParent, stack, partialObj, index);
			if(ret[i] && ret[i].$ && ret[i].$.isError){
				if(!ret.$){
					_defProp(ret, "$", {}, true, true ,true); 
				} 
				// ret.$.isError = true;y
				cmpSet(db.lyte, ret.$, "isError", true);
			}
		}
	}
	else if(data && typeof data == "object" && Object.keys(data).length){
		// var cDef = db.getSchemaObj(name);
		var cDef = getSchemaObj(db, schemaCls);
		if(cDef){
			if(data._type && cDef.extendedBy){
				cDef = (cDef.extendedBy[data._type]) ? db.getSchemaObj(data._type) : undefined;
				// cDef = getSchemaObj(db, cDef);
			}
			if(isEntity(data))
			{
				return undefined;
			}
			if(checkRelData && data && cDef){
				var rels = cDef.relations;
				if(rels){
					rels.forEach(function(relArr, key){
						relArr.forEach(function(rel){
							var key = rel.relKey,
							type = rel.relType;
							if(type == "hasMany" && data.hasOwnProperty(key) && Array.isArray(data[key]) && data[key].length){
								var arr = data[key], newArr = [];
								arr.forEach(function(itm){
									if(isEntity(itm)){
										newArr.push(itm.$.pK);
									}
									else{
										newArr.push(itm);
									}
								});
								data[key] = newArr;
							}
							else if(type == "belongsTo" && data.hasOwnProperty(key) && isEntity(data[key])){
								data[key] = data[key].$.pK;
							}
						});
					});
				}
			}
			if(!isDuplicateEntity(cDef, data, cDef._pK)){
				var rec = new cDef.def(data, {}, db);
				cDef.data.push(rec);
				var toRel = db.$.toRelate[cDef._name], pkVal = rec.$.pK;
				if(saveParent){
					db.$.saveParent = rec;
				}
				ret = validateAndPush(db,cDef,rec,partialObj);
				if(toRel && toRel.has(pkVal)){
					establishToRelated(rec, toRel.get(pkVal));
					toRel.delete(pkVal);
				}
			}
			else{
				ret = validateAndMerge(cDef,data,partialObj);
				if(ret && ret.data){
					ret = ret.data;
				}
				else if(ret && ret.type){
					Array.isArray(result.args) ? result.args.splice(0,0,db.lyte) : [db.lyte]
					Dberror[result.type].apply(Dberror, result.args || [db.lyte]);
					return;
				}
			}
			if(saveParent){
				db.$.saveParent = undefined;
			}
			if(stack){
				db.$.recStack = {};
			}
		}
		else if(typeof schemaCls == "string"){
			var defobj = db.schemaless, 
			def = defobj[schemaCls] = defobj[schemaCls] || {};
			if(index){
				if(!typeof index == "string"){
					Dberror.error(db.lyte,"Index should be a string");
				}
				if(def._pK){
					if(def._pK !== index){
						Dberror.error(db.lyte,"");
						return;
					}
				}
				def._pK = index;
				def._arrPk = [index];
			}
			else{
				def._pK = index = "id";
				def._arrPk = [index];
			}
			def.data = def.data || [];
			defProp(def.data,"schemaless", {value:true});
			defProp(def.data, "pK", {value:def._pK});
			var ind = getInd(def.data, index, data[index]);
			if(ind == -1){
				handleArrOp(db.lyte, def.data, "push", data);
			}
			else{
				handleArrOp(db.lyte, def.data, "replaceAt", data, ind);
			}
			return data;
		}
	}
	return ret;
}

function validateAndPush(db,def,data,partialObj){
	if(!def.rel){
		def.rel = {};
	}
	var pkVals = def._arrPk, pkValsLen = pkVals.length, index;
	for(var i=0; i<pkValsLen; i++){
		var item = pkVals[i];
		if(!data.hasOwnProperty(item)){
			index = def.data.indexOf(data);
			def.data.splice(index,1);	
			return new ValidationError(db.lyte, item, {code : "ERR23", data : data, message : Dberror.errorCodes.ERR23});
		}
		else if(data[item] == undefined || data[item] == null){
			index = def.data.indexOf(data);
			def.data.splice(index,1);	
			return new ValidationError(db.lyte, item, {code : "ERR26", data : data, message : Dberror.errorCodes.ERR26});
		}
	}
	var mapPk = (( data.$.pK == undefined || typeof data.$.pK == "object") ? data.$.pK : data.$.pK.toString());
	def.data._recMap.set(mapPk, data);
	data = validateJSON(db, def, data, undefined, undefined, partialObj);
	var index = def.data.indexOf(data); //have to check if the removal of these lines, doesn't affect any
	def.data.splice(index, 1);
	handleArrOp(db.lyte,def.data,"push",data);
	if(def.didLoad){
		var callBack = def.didLoad;
		for(var i=0;i<callBack.length;i++){
			callBack[i].apply(data);	
		}
	}
	def.emit("add",[data]);
	db.emit("add",[def._name,data]);
	return data;
}

function validateJSON(db,def,data,keys,toValidate,partialObj){
	var validate = (toValidate) ? toValidate.toValidate : undefined;
	var fields = (validate && Object.keys(validate).length) ? validate : def.fieldList;
	var extended = def.extend ? true : false;
	for(var key in data){
		if(keys && keys.indexOf(key) == -1){
			continue;
		}
		var fld = fields[key];
		if(fld){
			if(fld.type == "relation" && data[key]){
				var partialAdd = (toValidate && toValidate.toPartialAdd) ? toValidate.toPartialAdd[key] : undefined;
				var resp = handleRelation(db, key, def, fld, data, partialAdd, partialObj);
				if(resp != true){
					return new ValidationError(db.lyte, key, {code : resp, data : data, message : Dberror.errorCodes[resp]});
				}
				if(fld.relType == "hasMany" && !data[key].add){
					defArrUtls(data[key]);
					defPolyUtls(data[key]);
					defUtls(data[key],fld.relatedTo,data,key);
				}
			}
			else if(fld.type){
				var fieldKeys = fld;
				if(data[key] === undefined && fieldKeys.default){
					data[key] = getDefaultVal(data, fieldKeys.default);
				}
				var empD = getDsrzEmpData(def, fld, def._name);
				var boolChk = !empD && data[key]
				if(data.hasOwnProperty(key) && (boolChk || empD) && db.dataType.hasOwnProperty(fieldKeys.type) && db.dataType[fieldKeys.type].hasOwnProperty("deserialize")){
					data[key] = db.dataType[fieldKeys.type].deserialize(data[key],key,def._name,getpKVal(data,def));
				}
			}
		}
		else{
			if(extended){
				var extMod = db.getSchemaObj(def.extend);
				var extKey = extMod.fieldList[key];
				if(extKey && extKey.type == "relation"){
					var partialAdd = (toValidate && toValidate.toPartialAdd) ? toValidate.toPartialAdd[key] : undefined;
					var resp = handleRelation(db, key, extMod, extKey, data, partialAdd);
					if(resp != true){
						return new ValidationError(db.lyte, key, {code : resp, data : data, message : Dberror.errorCodes[resp]});
					}
					if(extKey.relType == "hasMany" && !data[key].add){
						defArrUtls(data[key]);
						defPolyUtls(data[key]);
						defUtls(data[key],extMod,data,key);
					}
				}
			}
		}
	}
	return data;
}

function handleRelation(db,key,def,field,data,partialAdd, partialObj){
	var rel = {},
	mRel = def.rel = def.rel || {};
	if (!mRel.hasOwnProperty(key)){
		var relResp = getRelations(db, def,key,getSchemaObj(db, field.relatedTo),rel);	
		if(relResp !== true){
			return relResp;
		}
		mRel[key] = rel;
	}
	else{
		rel = mRel[key];
	}
	return solveRelation(db, rel, def, getSchemaObj(db, field.relatedTo), key, data, partialAdd, partialObj);
}

function getRelations(db,fDef,key,bDef,rel){
	if(bDef == undefined){
		Dberror.error("LD05",fDef.fieldList[key].relatedTo,key,fDef._name)
		return "ERR11";
	}
	rel.forward = fDef.fieldList[key];
	rel.backward = getBackwardRel(fDef,rel.forward,bDef);
	if(rel.backward === undefined){
		var temp_backward = {type: "relation",relatedTo:fDef.def, dummy:rel.forward.relKey, relKey:undefined};
		if(!bDef.relations.get(fDef.def)){
			bDef.relations.set(fDef.def, []);
		}
		var bArr = bDef.relations.get(fDef.def);
		bArr.push(temp_backward);
		rel.backward = temp_backward;
	}
	return true;
}

function getBackwardRel(fDef,rel,bDef){
	var inverse, 
	polymorphic, 
	db = fDef.db;
	if(rel.opts){
		inverse = rel.opts.reverseKey;
		polymorphic = rel.opts.polymorphic;
		if(inverse === null){
			return undefined;
		}
		if(polymorphic){
			var extDefs = bDef.extendedBy;
			if(extDefs){
				for(var key in extDefs){
					var extDef = db.getSchemaObj(key);
					// extDef = getSchemaObj(db, extDef);
					if(extDef.relations.get(fDef.def)){
						bDef = extDef;
						break;
					}
				}
			}
		}
	}
	var relatedTo;
	if(inverse && inverse != ""){
		relatedTo = inverse;
	}
	else{
		var bRel = bDef.relations.get(fDef.def);
		var extFDef = db.getSchemaObj(fDef.extend), checkPoly;
		if(!bRel && extFDef && bDef.relations.get(extFDef.def)){
			bRel = bDef.relations.get(extFDef.def);
			checkPoly = true;
		}
		relatedTo = (bRel && bRel.length == 1 && (bRel[0].opts && bRel[0].opts.reverseKey && bRel[0].opts.reverseKey !== rel.relKey ? false : true ) && (!checkPoly || (checkPoly && bRel[0].opts && bRel[0].opts.polymorphic))) ? bRel[0].relKey : undefined;
	}
	if(!relatedTo){
		var bRels = bDef.relations.get(fDef.def);
		var extFDef_1 = db.getSchemaObj(fDef.extend);
		if(!bRels && extFDef_1 && bDef.relations.get(extFDef_1.def) && bDef.relations.get(extFDef_1.def).opts && bDef.relations.get(extFDef_1.def).opts.polymorphic){
			bRels = bDef.relations.get(extFDef_1.def);
		}
		if(rel.dummy && bRels){
			for(var i=0;i<bRels.length;i++){
				if(bRels[i] && bRels[i].relKey && bRels[i].relKey == rel.dummy)
				{
					 relatedTo = bRels[i].relKey;
					 break;
				}
			}
		}
		else if(bRels){
			for(var i=0;i<bRels.length;i++){
				if(bRels[i] && bRels[i].opts && bRels[i].opts.reverseKey && bRels[i].opts.reverseKey === rel.relKey){
					relatedTo = bRels[i].relKey;
					break;
				}
				else if(bRels[i] && bRels[i].dummy && bRels[i].dummy == rel.relKey)
				{
					 relatedTo = bRels[i];
					 break;
				}
			}
		}
	}
	if(relatedTo && relatedTo.dummy){
		return relatedTo;
	}
	if(relatedTo && fDef._fldGrps.reverseKey.has(rel.relatedTo) && !rel.dummy){
		if(relatedTo && fDef.relations.get(rel.relatedTo) && fDef.relations.get(rel.relatedTo).length>1 && !inverse){
			if((!bDef.fieldList[relatedTo].opts) || bDef.fieldList[relatedTo].opts && !bDef.fieldList[relatedTo].opts.reverseKey){
				return undefined;
			}
		}
	}
	return relatedTo?bDef.fieldList[relatedTo]:undefined;			
}

function solveRelation(db,rel,fDef,bDef,key,data,partialAdd,partialObj){
	var forward = rel.forward, 
	partial = partialObj ? partialObj[key] : undefined, 
	partialRel = partial && partial.partial, 
	val = [];
	if(partialAdd){
		val = partialAdd;
	}
	else if(!partialRel){
		if(data[key] && (data[key].add || isEntity(data[key]) ) ){
			return true;
		}
		if(!Array.isArray(data[key])){
			data[key] = [data[key]];
		}
		else if(forward.relType == "belongsTo"){
			return "ERR21";
		} 
		val = data[key].splice(0, data[key].length);
		if(forward.relType == "belongsTo"){
			data[key] = undefined;				
		}                
	}
	else if(Array.isArray(data[key])){
		var val = data[key].splice(0, data[key].length);
	}
	for(var i=0; i<val.length; i++){
		var ret;
		ret = createAndRelate(db, fDef, bDef, data, key, val[i], rel, partial);
		if(ret != true){
			return ret;
		}
	}
	return true;
}

function createAndRelate(db, fDef, bDef, data, key, val, rel, partial){
	if(!rel.backward){
		if(rel.forward.relatedTo === fDef){
			rel.backward = rel.forward;
		}
		if(rel.backward === undefined){
			return "ERR12";
		}
	}
	var pK = fDef._pK, 
	isComp = bDef.isComp, 
	isPoly = rel.forward && rel.forward.opts ? rel.forward.opts.polymorphic : undefined,
	relatedRecord, 
	newPartial = partial && partial.hasOwnProperty(val[pK]) ? partial[val[pK]] : partial;
	if(!isComp && typeof val == bDef.fieldList[bDef._pK].type){
		relatedRecord = db.cache.getEntity(bDef.def, val);
	}
	else if(typeof val == "object" && !isEntity(val)){
		relatedRecord = insertIntoStore(db, bDef.def, val, undefined, undefined, newPartial);					
	}
	if(relatedRecord && relatedRecord.$ && relatedRecord.$.isError){
		cmpSet(db.lyte, data.$, "isError", true);
		var errObj = {code:"ERR24", message: Dberror.errorCodes.ERR24, data: data, error: relatedRecord.$.error};
		cmpSet(db.lyte, data.$.error, key, errObj );
	}
	else if(relatedRecord){
		if(!hasDuplicateRelation(relatedRecord, data[key], bDef._pK, isPoly ? val._type : undefined, bDef)){
			establishLink(db, rel.forward, rel.backward, data, relatedRecord, undefined, true, false);							
		}
	}
	else{
		addToRelate(db, fDef._name, data, rel, val);
	}
	return true;
}

function singleEstablishLink(forward,data,relatedRecord){
	var relation = relatedRecord.$._relationships , fName = data.$.schema._name , fRelKey = forward.relKey ;
	relation[fName] = relation[fName] || {};
	relation[fName][fRelKey] = relation[fName][fRelKey] || [];
	if(!hasDuplicateRelation(data,relation[fName][fRelKey],data.$.schema._pK, undefined, data.$.schema)){
		relation[fName][fRelKey].push(data);
	}
}	

function establishLink(db,forward,backward,data,relatedRecord,index,ignorePartial, isDuplicate,partRemoveOnly){
	if(!relatedRecord){
		return "ERR13";
	}
	if( !checkForCorrectRelation(db, forward, relatedRecord) ){
		return "ERR14";
	}
	var fRelKey = forward.relKey, 
	lyte = db.lyte,
	isPoly = forward.opts && forward.opts.polymorphic, 
	type = isPoly ? relatedRecord._type : undefined,
	ignoreRel = {};
	if(forward.relType == "belongsTo"){
		if(data[fRelKey] !== relatedRecord){
			cmpSet( lyte, data, fRelKey, relatedRecord, undefined, true );
		}
		if(data.$.partial && Object.keys(data.$.partial).length && data.$.partial[fRelKey]){
			delete data.$.partial[fRelKey];
		}
	}
	else if(forward.relType === "hasMany"){
		if(!data[fRelKey]){
			cmpSet(lyte,data,fRelKey,[],undefined,true);
		}
		if(!data[fRelKey].schema){
			var relDef = relatedRecord.$.schema;
			if(isPoly && type){
				_defProp(data[fRelKey], "polymorphic", true);
				relDef = db.getSchemaObj(relDef.extend);
			}
			establishObsBindings(data,data.$.schema._properties);
			defArrUtls(data[fRelKey]);
			defPolyUtls(data[fRelKey]);
			defUtls(data[fRelKey],relDef,data,fRelKey);
		}
		var mdl = forward ? getSchemaObj(db, forward.relatedTo) : undefined;
		if( isDuplicate == false || !hasDuplicateRelation(relatedRecord, data[fRelKey], (forward?mdl._pK : undefined),type, mdl) ){
			if(index != undefined){
				handleArrOp(db.lyte, data[fRelKey], "insertAt", relatedRecord, index);
				// if(typeof Lyte.arrayUtils != "undefined"){
				// 	Lyte.arrayUtils(data[fRelKey],"insertAt",index,relatedRecord);						
				// }
				// else{
				// 	data[fRelKey].splice(index, 0, relatedRecord);
				// }	
			}
			else{
				handleArrOp(db.lyte, data[fRelKey],"push",relatedRecord);
			}
		}
		var ret;

		if((!ignorePartial || partRemoveOnly)&& forward.opts && forward.opts.serialize){
			ret = partialData(data, fRelKey, relatedRecord, "added",undefined,partRemoveOnly);
			ignoreRel.relKey = fRelKey;
			ignoreRel.model = data.$.schema._name;
		}
	}
	var fnest = false;
	if(!ignorePartial){
		fnest = ret ? false : true;
	}
	// if(forward == backward){
	// 	singleEstablishLink(forward,data,relatedRecord);
	// 	return true;
	// }
	if(backward === null){
		if(relatedRecord.hasOwnProperty(bRelKey)){
			delete relatedRecord[bRelKey];
		}
		return true;
	}
	if(backward.dummy || forward == backward){
		singleEstablishLink(forward,data,relatedRecord);
	}
	else{
		var bRelKey = backward.relKey, relRecMod = relatedRecord.$.schema;
		if( !checkForCorrectRelation(db, backward, data) ){
			return "ERR14";
		}
		if(backward.relType == "belongsTo"){
			if(relatedRecord[bRelKey] != undefined  && relatedRecord[backward.relKey] !== data){
				toDemolishLink(relRecMod, relatedRecord, backward, ignorePartial);
			}
			if(relatedRecord[bRelKey] !== data){
				cmpSet(lyte,relatedRecord, bRelKey, data, undefined, true);
			}
			if(relatedRecord.$.partial && Object.keys(relatedRecord.$.partial).length && relatedRecord.$.partial[bRelKey]){
				delete relatedRecord.$.partial[bRelKey];
			}
		}
		else if(backward.relType === "hasMany"){
			if(!relatedRecord[bRelKey]){
				cmpSet(lyte,relatedRecord, bRelKey, [], undefined, true);
			}
			if(!relatedRecord[bRelKey].schema){
				defArrUtls(relatedRecord[bRelKey]);
				defPolyUtls(relatedRecord[bRelKey]);
				defUtls(relatedRecord[bRelKey],data.$.schema,relatedRecord,bRelKey);
			}
			var bMdl = backward ? getSchemaObj(db, backward.relatedTo) : undefined;
			if( !hasDuplicateRelation(data, relatedRecord[bRelKey], (backward ? bMdl._pK : undefined), type, bMdl) ){
				handleArrOp(db.lyte, relatedRecord[bRelKey],"push",data);
			}
			var bret;
			if((!ignorePartial || partRemoveOnly) && backward.opts && backward.opts.serialize){
				bret = partialData(relatedRecord, bRelKey, data, "added" , undefined,partRemoveOnly);
			}
			var bnest;
			if(!ignorePartial){
				bnest = bret ? false : true;
			}
		} 
	}
	if(fnest){
		if(forward && forward.opts && forward.opts.deepNest){
			var type = "added";
			if(data[forward.relKey].partial && data[forward.relKey].partial.get(relatedRecord.$.pK)){
				type = data[forward.relKey].partial.get(relatedRecord.$.pK).type;
			}
			setDeepNest(data, forward.relKey, relatedRecord.$.pK, "added", undefined, relatedRecord);
			bnest = false;
		}
		// addDeepNest(relatedRecord, undefined, !ignorePartial ? "added" : undefined, ignoreRel);
	}
	if(bnest){
		if(backward && backward.opts && backward.opts.deepNest){
			setDeepNest(relatedRecord, backward.relKey, data.$.pK, "added", undefined, data);
		}
	}
	return true;
}

function removeFromStore(def,keys,fromStore,ignorePartial, delayPer, onlyRem, deep, parentRel ,partOnlyRem){
	var data = def.data,
	db = def.db,
	lyte = db.lyte;
	if(data.length == 0){
		return;
	}
	if(!Array.isArray(keys)){
		keys = [keys];
	}
	var pKey = def._pK;
	for(var i=0; i<keys.length; i++){
		var index = getIndex(data, pKey, keys[i]);
		if(index == -1){
			continue;
		}
		var rec = data[index];
		var pK = rec.$.pK;
		var relations = def.relations;
		if(rec.$.isNew){
			onlyRem = delayPer = undefined;
			fromStore = true;
		} 
		if(relations.size){
			toDemolishRelation(def, index, ignorePartial, onlyRem, delayPer,partOnlyRem);	
		}
		var deleted;
		if(delayPer !== true && onlyRem !== false){
			deleted = handleArrOp(db.lyte, data,"removeAt",undefined,index,1);
			deep && deleted && deleted.length ? deepRelIter("unload", def, deleted[0], parentRel) : undefined;
			def.emit("remove", [deleted[0]]);
			db.emit("remove", [def._name,deleted[0]]);	
			if(def._properties){
				demoLishObserverBindings(rec, def._properties);
			}
		}
		if(fromStore === true){
			cmpSet(lyte, rec.$, "isUnloaded", true);
			var scpObj = rec.$.__scpObj;
			for(var key in scpObj){
				var sid = scpObj[key];
				var sidArr = sid.split("_");
				var nestObj = nestScp[sidArr[0]];
				nestObj ? removeNestScp(nestObj._data, sidArr[0], sidArr[1], undefined, rec, undefined, undefined, {model: def._name, pK:rec.$.pK, attr: key}) : undefined;
			}
			var cqueries = db.schema.cachedQueries;
			if(cqueries){
				var n=def._name, Nm = cqueries[n]
				if(Nm && Nm.length){
					for(var j=Nm.length-1; j>=0; j--){
						var obj = Nm[j];
						if(obj.hasDeletedRecords){
							if(obj.data){
								var ind = obj.data[n].indexOf(rec);
								if(ind !== -1){
									Nm.splice(j,1);					
								}
							}
						}
					}					
				}
			}
		}
		if(onlyRem == true){
			continue;
		}
		var remRec = deleted ? deleted[0] : rec;
		if(!fromStore){
			cmpSet( lyte, remRec.$, "isDeleted", true);
			changePersist(remRec, true);
			// deleted[0].$.isDeleted = true;
			if((delayPer !== true && onlyRem !== false) && (remRec.$.isNew || remRec.$.isModified)){
				deleteFromArray(def.dirty, remRec.$.pK);
			}
			if(!remRec.$.isNew){
				addTo_Del(def, remRec, index);
				// model._deleted.push(deleted[0]);
			}
			var cqueries = db.schema.cachedQueries;		
			if(cqueries){
				var n=def._name, Nm = cqueries[n];
				if(Nm && Nm.length){
					for(var j=Nm.length-1; j>=0; j--){
						var obj = Nm[j];
						if(obj && obj.data){
							var ind = obj.data[n].indexOf(rec);
							if(ind != -1){
								obj.hasDeletedRecords = true;
							}							
						}
					}					
				}
			}
		}
		var ind;
		if(Array.isArray(def.dirty) && (ind = def.dirty.indexOf(pK)) != -1){
			def.dirty.splice(ind, 1);
		}
	}
}

function toDemolishRelation(def,index,ignorePartial,onlyRem,delayPers,partOnlyRem){
	var record = def.data[index], 
	relations = def.relations,
	db = def.db;
	relations.forEach(function(rel, key){
		for(var i=0; i<rel.length; i++){
			var relation = rel[i],
			relDef = getSchemaObj(db, relation.relatedTo);
			if(relDef){
				var relPriKey = relDef._pK, 
				relkey = relation.relKey;
				// if(def._name == relDef._name){
				// 	var data = relDef.data,index1,index2;
				// 	for(index1=0 ; index1<data.length; index1++){
				// 		var item=data[index1];
				// 		if(Array.isArray(item[relkey])){
				// 			for(var index2=0;index2<item[relkey].length;index2++){
				// 				var value = item[relkey][index2];
				// 				if(value[relPriKey] == record[relPriKey] && onlyRem !== false)
				// 				{
				// 					handleArrOp(db.lyte, item[relkey],"removeAt",undefined,index2,1);
				// 				}
				// 			}
				// 		}
				// 		else if (isEntity(item[relkey])){
				// 			if(item[relkey][relPriKey] == record[relPriKey] && onlyRem !== false)
				// 				{
				// 					item[relkey] = undefined ;
				// 				}
				// 		}
				// 	}
				// }
				if(!record[relation.relKey] && !relation.dummy){
					continue;
				}
				toDemolishLink(def, record, relation, ignorePartial, onlyRem, delayPers,partOnlyRem);
			}
		}		
	});
}

function toDemolishLink(def,record,relation,ignorePartial,onlyRem,delayPers,partOnlyRem){
	var db = def.db,
	records = record[relation.relKey], 
	priKey = def._pK,  
	relDef = relation.relatedTo;
	if(!relDef){
		return;
	}
	var bRelation = getBackwardRel(def, relation, getSchemaObj(db, relDef));
	if(relation.dummy || (relation == bRelation)){
		records = getRelatedRecord(record,getSchemaObj(db, relation.relatedTo),relation.dummy);
	}
	if(bRelation){
		if(Array.isArray(records)){
			for(var i=0; i<records.length; i++){
				demolishLink(db, record, priKey, records[i], bRelation.relKey, relation, bRelation, ignorePartial, undefined, onlyRem, delayPers,partOnlyRem);
			} 
		}
		else if(isEntity(records)){
			demolishLink(db, record, priKey, records, bRelation.relKey, relation, bRelation, ignorePartial, undefined, onlyRem, delayPers,partOnlyRem);
		}
	}
}

function demolishSingleRelation(record,fName,key,relatedRecord,priKey,onlyRem,delayPers){
	var arr,index;
	if(isEntity(record)){
		arr = record.$._relationships;
		if(arr && arr[fName] && arr[fName][key] && (onlyRem !== false && delayPers !== true)){
			arr = arr[fName][key];
			index = getIndex(arr,priKey,relatedRecord[priKey]);
			if(index > -1){
				arr.splice(index,1);
			}
		}
	}
} 

function demolishLink(db, record, priKey, relatedRecord, bRelKey, relation, bRelation, ignorePartial, ignoreAttrCheck, onlyRem, delayPers, partOnlyRem){
	var links = relatedRecord[bRelKey], 
	relMod = relatedRecord.$.schema,
	lyte = relMod.Lyte,
	pK = record.$.pK, 
	poly = links ? links.polymorphic : undefined, 
	polymorphicType;
	if(Array.isArray(links)){
		var ind = getIndex(links, priKey, pK, poly ? record._type : undefined), 
		_attrs = relatedRecord.$._attributes, 
		initialVal = _attrs.hasOwnProperty(bRelKey) && _attrs[bRelKey] && _attrs[bRelKey].size  ? relatedRecord.$.getInitialValues(bRelKey) : undefined, 
		toRem = links.partial && links.partial.has(record) && links.partial.get(record).type == "added" ? true : false;
		if(ind != -1 && (toRem || (onlyRem !== false && delayPers !== true))){
			poly ? polymorphicType = links[ind].$.schema._name : undefined;
			handleArrOp(lyte, relatedRecord[bRelKey],"removeAt",undefined,ind,1);
		}
		if(!ignoreAttrCheck && initialVal){
			if(!hasRecordsArrayChanged(relatedRecord, bRelKey, initialVal)){
				   delete relatedRecord.$._attributes[bRelKey];
				   if(!Object.keys(relatedRecord.$._attributes).length){
					//    changeModified(lyte, relatedRecord, false, relatedRecord.$.pK)
					   cmpSet(lyte, relatedRecord.$, "isModified", false);
					   changePersist(relatedRecord, true);
					   if(!relatedRecord.$.isNew){
						   deleteFromArray(relMod.dirty, relatedRecord[relMod._pK]);
						   if(!relatedRecord.$.dN || (relatedRecord.$.dN && !Object.keys(relatedRecord.$.dN).length)){
							removeParentNesting(relatedRecord);
						}			
					}
				}
			}
		}
	}
	else if( links && (typeof links == "object" || isEntity(links)) && (onlyRem !== false && delayPers !== true) ){
		if(lyte != undefined && lyte.objectUtils != undefined){
			lyte.objectUtils(relatedRecord, "delete", bRelKey, undefined, undefined, true);
		}
		else {
			delete relatedRecord[bRelKey];
		}
	}
	else{
		demolishSingleRelation(relatedRecord,record.$.schema._name,relation.relKey,record,priKey, onlyRem, delayPers);
	}
	if(!bRelation){
		bRelation = relMod.fieldList[bRelKey];
	}
	if((!ignorePartial || partOnlyRem )&& onlyRem !== true){
		var relType, isPartial, ret, nest, serz;
		if(bRelation){
			if(bRelation.opts){
				isPartial = bRelation.opts.serialize == "partial";
				serz = bRelation.opts.serialize ? true : false;
				nest = bRelation.opts.deepNest;
			}
			var relType = bRelation ? bRelation.relType : undefined;
		}
		// if(delayPers && bRelation && bRelation.opts && /^(id|record)$/.test(bRelation.opts.serialize)){
		// 	return;
		// }
		if(relType == "belongsTo" && serz && !record.$.isNew){
			var partObj = relatedRecord.$.partial = relatedRecord.$.partial || {};
			partObj = partObj[bRelKey] = partObj[bRelKey] || new Map();
			if(!partObj.has(record)){
				partObj.set(record, {});
			}
			partObj = partObj.get(record);
			partObj.type = "removed";
		}
		if(bRelation && bRelation.opts && bRelation.opts.serialize){
			ret = partialData(relatedRecord, bRelKey, record, "removed", polymorphicType ,partOnlyRem);
			nest = ret && relType == "hasMany" ? false : nest;
		}
		if(nest == true){
			makeDirty(relatedRecord, "removed", bRelation, pK, undefined, record);
			addDeepNest(relatedRecord);
		}
	}
	if(ignorePartial){
		if(bRelation && bRelation.opts && bRelation.opts.serialize){
			partialData(relatedRecord, bRelKey, record, "delete", polymorphicType);
			var _attrs = relatedRecord.$._attributes, _attr = _attrs[bRelKey];
			if(_attr && _attr.size && _attr.get(record)){
				_attr.delete(record);
			}
			if(_attr && _attr.size){
				delete relatedRecord.$._attributes[bRelKey];
			}
		}
	}
}

function validateAndMerge(def, data, partialObj, mergeErr, ignoreStrict){
	var db = def.db;
	if(!def.rel){
		def.rel  = {};
	}
	var pkVal = getpKVal(data, def);
	if(pkVal === undefined){
		return { type:"error", args:["LD28", def._name, isEntity(data) ? data : JSON.stringify(data)]};				
	}

	var record = db.cache.getEntity(def.def, getpKVal(data, def));
	if(!record || !isEntity(record)){
		return { type:"error", args:["LD04",isEntity(data) ? data : JSON.stringify(data)]};
	}
	if(!ignoreStrict && record.$.strict && (record.$.isNew || record.$.isModified || record.$.isDeleted)){
		return { type:"error", args:["LD29"]};
	}
	mergeData(db, record, data, partialObj, mergeErr);
	if(def.didLoad){
		var callBack = def.didLoad;
		for(var i=0;i<callBack.length;i++){
			callBack[i].apply(record);				
		}
	}
	return { data : record};
}

function mergeData(db,record,data,partialObj,mergeErr){
	if(!record || !data){
		return;
	}
	var def = record.$.schema, field, _estObsBind = false;
	if(mergeErr){
		mergeError(def, record, data);
	}
	for(var key in data){
		field = def.fieldList[key];
		if(field){
			if(field.type != "relation"){
				var empD = getDsrzEmpData(def, field, def._name);
				var boolChk = !empD && data[key]
				if(data.hasOwnProperty(key) && (boolChk || empD) && db.dataType.hasOwnProperty(field.type) && db.dataType[field.type].hasOwnProperty("deserialize")){
					data[key] = db.dataType[field.type].deserialize(data[key],key,def._name,getpKVal(data,def));
				}
				var isPropPresent = def._properties && def._properties.hasOwnProperty(key), propObj = {};
				if(isPropPresent){
					propObj[key] = def._properties[key];
					demoLishObserverBindings(record, propObj);
				}
				cmpSet(db.lyte,record,key,data[key],undefined,true);
				def._properties && def._properties.hasOwnProperty(key) ? _estObsBind = true : undefined;
			}
			else if(field && field.type == "relation"){
				var todo = {};
				var rel = {};
				getRelations(db, record.$.schema, key, getSchemaObj(db, field.relatedTo), rel);
				var bMod = rel.forward.relatedTo;
				var result = compareRelations(db, record,data,key,field,partialObj ? partialObj[key] : undefined ,todo, mergeErr);
				mergeRecords(db, todo, result, def, getSchemaObj(db, bMod), record, key, data, rel, partialObj, mergeErr);
			}
		}
		else if(key != "$"){
			cmpSet( db.lyte,record,key,data[key],undefined, true );
		}
	}
	if(_estObsBind){
		establishObsBindings(record, def._properties);
	}
}

function mergeRecords(db, todo, result, def, bMod, record, key, data, rel, partialObj, mergeErr){
	if(!rel){
		var rel = {};
		getRelations(db, def, key, bMod, rel);	
	}
	var pK = def._pK;
	if(rel.forward.relType == "hasMany" && isEmptyArray(data[key])){
		cmpSet(db.lyte, record, key, [], undefined, true);
		establishObsBindings(record,record.$.schema._properties);
		defArrUtls(record[key]);
		defPolyUtls(record[key]);
		defUtls(record[key],bMod,record,key);
	}
	if(Array.isArray(todo.add)){
		todo.add.forEach(function(item){
			createAndRelate(def.db, def, bMod, record, key, item, rel, partialObj);
		});
	}
	if(Array.isArray(todo.remove)){
		todo.remove.forEach(function(obj){
			var pkVal = obj.pK, schemaName = obj.schema, _def = db.getSchema(schemaName);
			demolishLink(db, record, pK, db.cache.getEntity(_def, pkVal), rel.backward.relKey,  rel.forward, rel.backward, true); 
			demolishLink(db, db.cache.getEntity(_def, pkVal), db.getSchemaObj(schemaName)._pK, record, rel.forward.relKey, rel.backward, rel.forward, true); 
		});
	}
	if(record && record.hasOwnProperty(key)){
		deleteDeepNest(record, key);
		if(Array.isArray(record[key]) && record[key].hasOwnProperty("partial")){
			var partObj = record[key].partial, partKeys = [];
			partObj.forEach(function(value, partKey){
				partKeys.push(partKey);
				record[key].partial.delete(partKey);
			});
		}
	}
	switch(result){
		case 0:{
			if(isEntity(record[key])){
				demolishLink(db, record, pK, record[key], rel.backward.relKey, rel.forward, rel.backward, true); 
				demolishLink(db, record[key], bMod._pK, record, rel.forward.relKey, rel.backward, rel.forward, true); 								
			}
			createAndRelate(def.db, def, bMod, record, key, data[key], rel, partialObj);
			break;
		}
		case 1:{
			break;
		}
		case 2:{
			mergeData(db,record[key],data[key],undefined,mergeErr);
			break;
		}
		default : break;    
	}
}

function compareRelations(db,record,data,key,field,partialObj,todo,mergeErr){
	//return 0 - not same, 1 -same, 2 - merge, 3 - partial add, 4 - delete and partial add
	var def = getSchemaObj(db, field.relatedTo), 
	pK = def._pK, 
	result = [];
	if(field.relType == "belongsTo"){
		if(partialObj && partialObj.$.type === "removed" && (!data || (data && comparePk(record, getpKVal(data, def))))){
			return 1;
		}
		return compareRecordWithObj(record[key],data[key],pK, partialObj,mergeErr);
	}else{
		var isPartial = false;
		if((partialObj && partialObj.partial)){
			isPartial = true;
		}
		if(!isPartial && (!record.hasOwnProperty(key) || (record && record.hasOwnProperty(key) && (isEmpty(record[key]) || isEmptyArray(record[key]))))){
			if(todo){
				var arr = data[key] || [];
				arr.forEach(function(item){
					var add = todo.add = todo.add || [];
					add.push(item);
				});
				return;
			}
			return 0;
		}
		var len = data[key] ? data[key].length : 0,
		old=0,
		status=1,
		oldPks = [];
		for(var i=0;i<len;i++){
			var obj = data[key][i];
			if(partialObj && partialObj[i] && partialObj[i].$.type == "removed"){
				continue;
			}
			var ind = getIndex(record[key], pK, (typeof obj == "object") ? getpKVal(obj,def) : obj);
			if(ind == -1){
				if(todo){
					var add = todo.add = todo.add || [];
					add.push(obj);
				}
				status = 0;
				continue;
			}
			oldPks.push(record[key][ind].$.pK);
			var res = compareRecordWithObj(record[key][ind],obj,pK,partialObj ? partialObj[i] : undefined,mergeErr);
			if(res == 1){
				old++;
			}
			if(res == 2){
				mergeData(db,record[key][ind],obj, partialObj ? partialObj[i] : undefined, mergeErr);
			}
			else if(res == 0){
				status = 0;
			}
		}
		if(todo && !isPartial){
			var arr = record[key] || [];
			arr.forEach(function(item){
				var pkVal = item.$.pK;
				if(oldPks.indexOf(pkVal) == -1){
					var remove = todo.remove = todo.remove || [];
					remove.push({pK: pkVal, schema: item.$.schema._name});
				}
			});
		}
	}
}

function compareRecordWithObj(rec,obj,pK,partialObj, mergeErr){
	if( !rec || !isEntity(rec) ){
		return 0;
	}
	var recDef = rec.$.schema, 
	db = recDef.db,
	isComp = recDef.isComp, 
	recFields = recDef.fieldList;
	if(!isComp) {
		var field = recDef.fieldList[pK];
		if(typeof obj == field.type ){
			if(rec[pK] == obj){
				return 1;
			}
			else{
				return 0;
			}
		}
	}
	if(obj && typeof obj == "object"){
		if(!comparePk(rec, getpKVal(obj, recDef))){
			return 0;
		}
		for(var data_key in obj){
			var field = recFields[data_key];
			if(field){
				if(field.type == "relation"){
					var todo = {};
					var res = compareRelations(db, rec, obj, data_key, field, partialObj ? partialObj[data_key] : undefined, todo, mergeErr);
					mergeRecords(db, todo, res, recDef, getSchemaObj(db, field.relatedTo), rec, data_key, obj, undefined, partialObj);
				}
				else if(rec[data_key] != obj[data_key]){
					return 2;
				}                    
			}
			else{
				if(rec[data_key] != obj[data_key]){
					return 2;
				}
			}	
		}
		return 1;
	}
	return 0;
}

function rllBckRecArr(db, oldVal, ins, def, field){
	var rel = {}, 
	pK = def._pK,
	bDef = getSchemaObj(db, field.relatedTo),
	relPK = bDef._pK;
	getRelations(db, def, field.relKey, bDef, rel);
	if(oldVal.size){
		var keys = Array.from(oldVal.keys()).reverse();
		var self = this;
		keys.forEach(function(itm, idx){
			var val = oldVal.get(itm);
			if(val._type == "added"){
				var relatedRecord = itm;
				if(!relatedRecord.$.isUnloaded){
					demolishLink(db, relatedRecord, relPK, ins, rel.forward.relKey, rel.forward);
					if(rel.backward != null){
						demolishLink(db, ins, pK, relatedRecord, rel.backward.relKey, rel.forward);
					}
				}
			}
			else if(val._type == "removed"){
				var relatedRecord = itm;
				if(!relatedRecord.$.isUnloaded){
					establishLink(db, rel.forward, rel.backward, ins, relatedRecord, val.index);
				}
			}			
		});
	}
	else{
		for(var i=oldVal.length-1; i>=0; i--){
			var records = oldVal[i].records;
			if(oldVal[i]._type == "added"){
				for(var j=0; j<records.length; j++){
					var relatedRecord = records[j];
					if(recChk(db.lyte, relatedRecord)){ // temp check to know if record exist in store
						demolishLink(db, relatedRecord, relPK, ins, rel.forward.relKey);
						if(rel.backward != null){
							demolishLink(db, ins, pK, relatedRecord, rel.backward.relKey, rel.forward);
						}
					}
				}
			}
			else if(oldVal[i]._type == "removed"){
				for(var j=records.length-1; j>=0; j--){
					var relatedRecord = records[j];
					if(recChk(db.lyte, relatedRecord)){ // temp check to know if record exist in store
						establishLink(db, rel.forward, rel.backward, ins, relatedRecord, oldVal[i]._indices[j]);
					}
				}
			}
			else if(oldVal[i]._type == "changed"){
				var currentRecords = ins[field.relKey];
				if(!Array.isArray(currentRecords)){
					currentRecords = [currentRecords]; 
				}
				var self = this;
				var kLen = currentRecords.length;
				for(var k=0; k<kLen; k++){
					var relatedRecord = currentRecords[0];
					if(relatedRecord != undefined && recChk(db.lyte, relatedRecord)){
						demolishLink(db, relatedRecord, relPK, ins, rel.forward.relKey);
						if(rel.backward != null){
							demolishLink(db, ins, pK, relatedRecord, rel.backward.relKey,rel.forward);
						}
					}
				}
				if(!Array.isArray(records)){
					records = [records];
				}
				for(var j=0; j<records.length; j++){
					var relatedRecord = records[j];
					if(typeof relatedRecord == "string"){
						relatedRecord = db.cache.getEntity(rel.forward.relatedTo,relatedRecord);
					}
					if(relatedRecord != undefined && recChk(db.lyte, relatedRecord)){ // temp check to know if record exist in store
						establishLink(db, rel.forward, rel.backward, ins, relatedRecord, undefined);
					}
				}						
			}
		}
	}
}

function sortBy(field, order){
	var fieldArr = mapBy.call(this, field),
	def = this.schema;
	var fie = def.fieldList[field];
	if(fie && fie.type == "string"){
		fieldArr.sort();
		if(order == "desc"){
			fieldArr.reverse();
		}                
	}
	else{
		fieldArr.sort(function(a,b){return a-b;});
		if(order == "desc"){
			fieldArr.sort(function(a,b){return b-a;});
		}
	}
	var oldArr = this.slice(0), newArr = [];
	for(var i=0; i<fieldArr.length; i++){
		if(fieldArr[i] == undefined){
			continue;
		}
		var index = getIndex(oldArr, field, fieldArr[i]);
		newArr.push(oldArr[index]);
		oldArr.splice(index, 1);
	}
	if(oldArr.length > 0){
		if(order == "desc"){
			newArr = newArr.concat(oldArr);
		}
		else{
			newArr = oldArr.concat(newArr);
		}				
	}
	defArrUtls(newArr);
	defUtls(newArr,this.schema);
	return newArr;
}

function mapBy(field){
	return this.map(function(value){
		return value.$.get(field);
	});
}

function revertToOldVal(ins, attr, oldVal, rel){
	if(oldVal == undefined || oldVal.length == 0){
		return;
	}
	else{
		if(!Array.isArray(oldVal)){
			oldVal = [oldVal];
		}
		for(var i =0; i<oldVal.length; i++){
			var fRec = oldVal[i];
			establishLink(ins.$.schema.db, rel.forward, rel.backward, ins, fRec, undefined);
		}
	}
}

function removePartial(ins, key){
	var parObj = ins.$.partial;
	if(parObj && parObj[key] ){
		delete parObj[key];
	}
}

function rollBackDelete(def, pkVal, index){
	var arr = [], db = def.db;
	if(!pkVal){
		def._deleted.forEach(function(itm){
			arr.push(itm);
		});
	}
	else{
		var deleted = def._deleted, obj = deleted.get(pkVal), pK = def._pK;
		arr = [obj];
	}
	var len = arr.length;
	for(var i=len-1;i>=0;i--){
		var obj = arr[i];
		var rec = obj.data;
		//var currentInd = findCurrentInd(model, pkVal);
		var isRecInDef = def.data._recMap ? def.data._recMap.get(rec.$.pK) : (def.data.indexOf(rec) !== -1) ;
		if(isEntity(rec)){
			cmpSet(db.lyte, rec.$, "isDeleted", false);
			changePersist(rec, true);
			var isDuplicate = isDuplicateEntity(def, rec);
			if(!isRecInDef){
				if(index){
					handleArrOp(db.lyte, def.data,"insertAt",rec,obj.index);
					// db.$.modifyDelInd(model, pkVal);
				}
				else{
					handleArrOp(db.lyte, def.data,"push",rec);
				}
				def.emit("add", [rec]);
				db.emit("add", [def._name,rec]);	
				var relArr = def.relations;
				if(relArr){
					rollBackDeleteRel(db, def, rec, relArr);
				}
			}
			else{
				removeParentNesting(rec);
				addDeepNest(rec, undefined, "added");
			}
			// else{
			// 	Lyte.error("Cannot rollback record of model, since another instance of same record exists in store");
			// }
			var cqueries = db.schema.cachedQueries;	
			if(cqueries){
				var n=def._name, Nm = cqueries[n];
				if(Nm && Nm.length){
					for(var j=Nm.length-1; j>=0; j--){
						var obj = Nm[j];
						if(obj && obj.hasDeletedRecords){
							var ind = obj.data[n].indexOf(rec);
							if(ind != -1){
								delete obj.hasDeletedRecords;
							}							
						}
					}					
				}
			}
			if(rec.$.isNew || rec.$.isModified){
				checkAndAddToArray(def.dirty, rec[def._pK]);
			}
			ValidationError.clrRecErr(rec.$, pK, "ERR17");
			!isDuplicate ? def.data._recMap.set(typeof rec.$.pK == "object" ? rec.$.pK : rec.$.pK.toString(), rec) : undefined; //old handling
			def._deleted.delete(rec.$.pK);
		}
	}
}

function rollBackDeleteRel(db, def, rec, relArr){
	relArr.forEach(function(rel){
		var rLen = rel.length;
		for(var j=0;j<rLen;j++){
			var item = rel[j];
			var key = item.relKey, bRel, bMod;
			//if(rec.hasOwnProperty(key)){
				bMod = item.relatedTo;
				bRel = getBackwardRel(def,item,getSchemaObj(db, bMod));
				var data = rec[key];
				if(!item.relKey || (item == bRel)){
					data = getRelatedRecord(rec,getSchemaObj(db , item.relatedTo),item.dummy?item.dummy:item.relKey)
				}
				else{
					data = rec[item.relKey];
				}
				if(Array.isArray(data)){
					var dLen = data.length;
					for(var k=0; k<dLen; k++){
						if(item == bRel){
							establishLink(db,bRel,item,data[k],rec,undefined,false)
						}else{
							establishLink(db,item,bRel,rec,data[k],undefined,false);	
						}									
					}
				}
				else{
					if(item == bRel){
						establishLink(db,bRel,item,data,rec,undefined,false)
					}else{
						establishLink(db,item,bRel,rec,data,undefined,false);
					}
				}
			//}
		}						
	});
}
function rollBackNew(def, record, pK){
	removeFromStore(def, record.$.pK, true);
	// var pkVal = record.$.pK;
	// var index = this.getIndex(model.data, pK, pkVal);
	// store.$.toDemolishRelation(model, index);
	// this.handleArrOp(model.data,"removeAt",undefined,index,1);
	// // record.$.isNew = false;
	// store.$.cmpSet(record.$, "isNew", false);
	// store.$.cmpSet(record, "$",  {});
	// model.emit("remove", [record]);
	// store.emit("remove", [model._name,record]);

}

function emit(db, type, record, attr, err){
	record.$.emit(type, [record,attr,err]);
	record.$.schema.emit(type, [record, attr, err]);
	db.emit(type, [record.$.schema._name, record, attr, err]);
}

function hasRecordsArrayChanged(record, attr, old){
	var arr = old || record.$.getInitialValues(attr), 
	changed = true;
	if(arr && arr.length == record[attr].length){
		changed = false;
		for(var i=0; i<arr.length; i++){
			if(record[attr].indexOf(arr[i]) == -1){
				return true;
			}
		}
	}
	return changed;
}

function cacheQuery(db, name, cacheQuery, data, status){
    var cq = db.schema.cachedQueries;
    cq = db.schema.cachedQueries = cq || {};
    cq = cq[name] = cq[name] || [];
    cq.push({cacheQuery : cacheQuery, data : data, status : status});
}

function cacheRecordQuery(db, name, key, cacheQuery, data, status){
    var crq = db.schema.cachedRecordQueries;
    crq = db.schema.cachedRecordQueries = crq || {};
    crq = crq[name] = crq[name] || {};
    crq = crq[key] = crq[key] || [];
    crq.push({cacheQuery : cacheQuery, data : data, status : status});
}

function isDefData(data){
    if(Array.isArray(data) && (data.schemaless || (data.schema && data.schema.__class === Schema && !data.polymorphic))){
        return true;
    } 
}

function handleArrOp(lyte,data,type,obj,pos,len){
    len = len != undefined ? len : 0;
    // var toBind = typeof lyte.arrayUtils != "undefined" ? true : false, 
	var ret;
    switch(type){
        case "push": {
            if(isDefData(data)){
                data._recMap == undefined ? _defProp(data, "_recMap", new Map()) : undefined;
				if(!data.schemaless){
					data._recMap.set(typeof obj.$.pK == "object" ? obj.$.pK : obj.$.pK.toString(), obj);
				}
				else{
					data._recMap.set(obj[data.pK], obj);					
				}
            }
			ret = lyte && lyte.$utils && lyte.$utils.arrayUtils ? lyte.$utils.arrayUtils(data, "push", obj) : data.push(obj);
            break;
        }
        case "removeAt": {
            if(isDefData(data)){
                var cpyLen = len;
                for(var i=0;i<cpyLen;i++){
					var mpKey = undefined;
					if(!data.schemaless){
						var pkVal = data[pos+i] ? data[pos+i].$.pK : undefined;
						pkVal = ((typeof pkVal == "object") ? pkVal : pkVal.toString());
						mpKey = pkVal;
					}
					else{
						mpKey = data[pos+i][data.pK];
					}
                    mpKey !== undefined && data._recMap ? data._recMap.delete(mpKey) : undefined;
                }
            }
            // ret =  data.$splice ? data.$splice(pos,len) : data.splice(pos,len);
			ret = lyte && lyte.$utils && lyte.$utils.arrayUtils ? lyte.$utils.arrayUtils(data, "splice", pos, len) : data.splice(pos,len);
            break;
        }
        case "insertAt": {
            if(isDefData(data)){
                data._recMap == undefined ? _defProp(data, "_recMap", new Map()) : undefined;
				if(!data.schemaless){
					data._recMap.set(typeof obj.$.pK == "object" ? obj.$.pK : obj.$.pK.toString(), obj);
				}
				else{
					data._recMap.set(obj[data.pK], obj);					
				}
            }
            // ret = data.$splice ? data.$splice(pos,len,obj) : data.splice(pos,len,obj);
			ret = lyte && lyte.$utils && lyte.$utils.arrayUtils ? lyte.$utils.arrayUtils(data, "splice", pos, len, obj) : data.splice(pos, len, obj);
            break;
        }
        case "replaceAt": {
            // ret = data.$splice ? data.splice(pos,len,obj) : data.splice(pos,len,obj);
			ret = lyte && lyte.$utils && lyte.$utils.arrayUtils ? lyte.$utils.arrayUtils(data, "splice", pos, 1, obj) : data.splice(pos, 1, obj);
			break;
        }
        default: {
            Dberror.error(lyte,"LD07", type);
            break;
        }
    }
    return ret;
}

function defArrUtls(obj){
    Object.defineProperties(obj, {
        filterBy : {
            value : filterBy
        },
        sortBy : {
            value : sortBy
        },
        mapBy : {
            value : mapBy
        }
    });
}

function defPolyUtls(obj){
    Object.defineProperties(obj,{
        add : {
            value : add
        },
        remove : {
            value : remove
        }
    })
}

function defUtls(obj,def,ins,key){
    if(def){
        _defProp(obj, "schema", def);
    }
    if(ins){
        _defProp(obj, "entity", ins, false, true);
    }
    if(key){
        _defProp(obj, "key", key);
    }
}

function defPar(arr){
    _defProp(arr, "partial", new Map());
}

function cmpSet(lyte, obj, key, value, opts, fromStore){
    if(lyte && lyte.$utils && lyte.$utils.set){
        lyte.$utils.set(obj, key, value, opts, fromStore);
    }
    else{
        obj[key] = value;
    }
}

function _defProp(scp, key, val, enume, write, conf){
    enume = (enume === undefined) ? false : enume;
    write = (write === undefined) ? false : write;
	conf = (conf === undefined) ? false : conf;
    Object.defineProperty(scp, key, {
        value : val,
        enumerable : enume,
        writable : write,
		configurable : conf
    });
}


function removePartialKeys(db, data, schema){
    var rels = schema.relations,
	db = schema.db;
	rels.forEach(function(relArr, key){
		relArr.forEach(function(rel){
			var relObj = {}, 
			inv, 
			bMod = rel.relatedTo;
			if(bMod){
				var inv = getBackwardRel(schema, rel, getSchemaObj(db, bMod));
				if(inv && inv.relType == "hasMany" && inv.opts && inv.opts.serialize){
					var relKey = rel.relKey, invRelKey = inv.relKey, invObj = data[relKey];
					if(invObj){
						if(Array.isArray(invObj)){
							invObj.forEach(function(invRelRec){
								var invRelObj = invRelRec[invRelKey];
								if(invRelObj && invRelObj.partial && invRelObj.partial.get(data)){
									invRelObj.partial.delete(data);
								}		
							});
						}
						else if(invObj[invRelKey]){
							var invRelObj = invObj[invRelKey];
							if(invRelObj && invRelObj.partial && invRelObj.partial.get(data)){
								invRelObj.partial.delete(data);
							}
						}
					}
				}
			}
		});		
	});
}

function mergeResponse(db, data , schema , response , pK , partialObj, cPersist){
    var db = schema.db;
	removePartialKeys(db, data, schema, pK);
    if(partialObj && Object.keys(partialObj).length){
        mergeNewDataKeys(db, partialObj, data, response, cPersist);
    }
    if(mergeError(schema, data, response)){
        return;
    }
    var isRec = db.cache.getEntity(data.$.schema.def, data.$.pK), 
	dirtyId, 
	mergeDone = false,
	result;
    if(data.$.isDeleted){
       mergeDeletedRec(db, partialObj, data, cPersist);
    }
    if(data.$.isNew && isRec){
        mergeDone = mergeNewRecord(db, partialObj, data, response, true, cPersist);
    }
    if(data.$.isModified && isRec){
        mergeModifiedRec(db, partialObj, data, response, true, mergeDone, cPersist);
    }
    if(schema.dirty.length){
        deleteFromArray(schema.dirty, dirtyId);
    }
    if(partialObj && Object.keys(partialObj).length && response && !mergeDone){
        if(response){
            if(isRec){
                result = validateAndMerge(schema, response, partialObj, true, true);
				if(result && result.data){
					result = result.data;
				}
				else if(result && result.type){
					Array.isArray(result.args) ? result.args.splice(0,0,db.lyte) : [db.lyte]
					Dberror[result.type].apply(Dberror, result.args || [db.lyte]);
				}
            }
            else{
                result = insertIntoStore(db, schema.def, response, undefined, undefined, partialObj);
            }
        }					
    }
    // var dirty = data.$.isDirty();
    // for(var j=0; j < dirty.length ;j++){
    //     var records = data[dirty[j]];
    //     if(Array.isArray(records)){
    //         for(var k=0;k<records.length;k++){
    //             if(isEntity(records[k])){
    //                 cmpSet(db.lyte, records[k].$, "isModified", false);
	// 				changePersist(records[k], true);
    //             }
    //         }
    //     }
    //     else if(isEntity(records)){
    //         cmpSet(db.lyte, records.$, "isModified", false);
	// 		changePersist(records, true);
    //     }
    // }
    removeDirtyStack(data, partialObj);
    // removeDeepNest(data);
}

function removeDirtyStack(data,partial){
    if(partial && partial._removedAttr && Object.keys(partial._removedAttr).length !=0){
		for(var key in data.$._attributes){
			if(!partial._removedAttr.hasOwnProperty(key)){
				delete data.$._attributes[key];
			}
		}
	}
	else{
		data.$._attributes = {};
	}
	// data.$._attributes={};
	data.$.undoStack = genUnRedoStack();
	data.$.redoStack = genUnRedoStack();
	delete data.$._savedState;
	ValidationError.clrRecErr(data.$); 
}

function mergeNewDataKeys(db, partialObj, data, response, cPersist){
    if(partialObj && ((data && data.partial && data.partial.size) || partialObj.partial == true)){ //true checked since partial key can come in this 
        if(Array.isArray(partialObj)){				
            partialObj.forEach(function(item, index){
                if(item.$){
                    var pK = item.$.schema._pK;
                    var ind = getIndex(data, pK, item.$.pkVal);
                    if(item.$.onlyDetach === true){
						if(data.entity && data.key){
							deleteDeepNest(data.entity,data.key,item.$.pkVal);
						}
                        handleArrOp(db.lyte, data, "removeAt", undefined, ind, 1);
                    }
                    else{
                        mergeNewDataKeys(db, item, ind != -1 ? data[ind] : undefined, response ? response[index] : undefined, cPersist);
						data.partial ? data.partial.delete(item.$.pkVal) : undefined;
                    }
					if(!item._removedAttr || (item._removedAttr && Object.keys(item._removedAttr).length)){
						data.partial ? data.partial.delete(item.$.pkVal) : undefined;
					}
                }
            });
			if(Array.isArray(data) && data.partial && data.partial.size && data.entity && data.key && data.entity.$.schema){
				var relFld = data.entity.$.schema.fieldList[data.key], toRemPart = [];
				if(relFld.opts && /^(id|record)$/.test(relFld.opts.serialize)){
					data.partial.forEach(function(pObj, pKey){
						if(pObj.type == "removed"){
							toRemPart.push(pKey);
						}
					});
					toRemPart.forEach(function(rItm){
						var rec = db.cache.getEntity(db.getSchema(data.schema._name), rItm) || db.cache.getEntity(db.getSchema(data.schema._name), rItm, true);
						data.partial.delete(rItm);
						rec ? removeParentNesting(rec) : undefined;
					});	
				}
			}
        }
    }
    else if(partialObj && partialObj.$ && partialObj.$.type){
        if(partialObj.$.onlyDetach){ //only for belongsTo
			var parent = partialObj.$.parent;
			if(parent && parent.$.partial && parent.$.partial[partialObj.$.relKey] && parent.$.partial[partialObj.$.relKey].has(partialObj.$.pkVal) && parent.$.partial[partialObj.$.relKey].get(partialObj.$.pkVal).type == "removed"){                        
				var rec = db.cache.getEntity(db.getSchema(partialObj.$.schema.__class), partialObj.$.pkVal) || store.peekRecord(partialObj.$.model, partialObj.$.pkVal, true);
				parent.$.partial[partialObj.$.relKey].delete(partialObj.$.pkVal);
				if(!parent.$.partial[partialObj.$.relKey].size){
					delete parent.$.partial[partialObj.$.relKey];
					if(!Object.keys(parent.$.partial).length){
						delete parent.$.partial;
					}
				}
				rec ? removeParentNesting(rec) : undefined;
			}
		}
		else{
			mergePartialObj(db,partialObj, data, response, undefined, cPersist);
		}
    }
    else{
        if(Array.isArray(partialObj)){
            partialObj.forEach(function(item, index){
                mergeNewDataKeys(db, item, data[index], response ? response[index] : undefined, cPersist);
            });
        }
        else if(typeof partialObj == "object"){
            for(var key in partialObj){
                mergeNewDataKeys(db, partialObj[key], data[key], response ? response[key] : undefined, cPersist);
            }
        }
    }
}

function mergeError(schema, data, response){
    if(response && response.$ && response.$.isError){
        if(response.$.error){
            var obj = response.$.error;
            for(var key in obj){
                if(schema.fieldList.hasOwnProperty(key)){
                    ValidationError.setRecErr(data.$, key, obj[key]);
                }
            }
        }
		if(response.$.revert){
			data.$.revert();
		}
		delete response.$.revert;
        delete response.$.error;
        delete response.$.isError;
        return true;
    }
}

function mergePartialObj(db, partialObj, data, response, doMerge, cPersist){
    var prec = db.cache.getEntity(partialObj.$.schema.def, partialObj.$.pkVal), data = data || prec, isRec = prec ? true : false, mergeDone;
    if(partialObj && partialObj.$ && partialObj.$.processed){
        return;
    }
    if(mergeError(db.schema[partialObj.$.schema], data, response)){
        return;
    }
	if(partialObj.$.type == "removed"){
        mergeDeletedRec(db, partialObj, data, cPersist);
        return;
    }
    else if((partialObj.$.type == "added" || (data && data.$ && data.$.isNew == true)) && isRec){
        mergeDone = mergeNewRecord(db, partialObj, data, response, doMerge, cPersist);
    }
    else if((partialObj.$.type == "modified" || partialObj.$.type == "related" || (data && data.$ && data.$.isModified == true)) && isRec){
        mergeModifiedRec(db, partialObj, data, response, doMerge, mergeDone, cPersist);
    }
    if(isRec){
        if(partialObj.$.type != "removed"){
            for(var key in partialObj){
                var part = partialObj[key];
                mergeNewDataKeys(db, part, data[key], response ? response[key] : undefined,cPersist);
            }
        }
        if(data.$.partial && Object.keys(data.$.partial)){
            data.$.partial = new Map();
        }
        removeDirtyStack(data,partialObj);
    }
}

function mergeNewRecord(db, partialObj, data, response, doMerge, cPersist){
	var mdl = partialObj.$ ? partialObj.$.schema : data.$.schema,
	pKeys = mdl._arrPk, 
	oldPk = data.$.pK, 
	lyte = db.lyte,
	rec = db.cache.getEntity(mdl.def, oldPk), 
	result, 
	partRec = partialObj.$ ? partialObj.$.entity : undefined;
	if(isEntity(partRec) && partRec !== rec){
		return;
	}
	if(rec){
		var oldRelPk = typeof oldPk == "object" ? oldPk : oldPk.toString(), 
		crProcessed = false;
		if(cPersist !== true){
			pKeys.forEach(function(item){
				if(!response || !response.hasOwnProperty(item)){
					Dberror.error(lyte,"LD16", mdl._name, isEntity(data) ? (typeof data.$.pK == "object" ? JSON.stringify(data.$.pK) : data.$.pK) : undefined);
					return;
				}	
				cmpSet(lyte, data, item, response[item], undefined, true);
				crProcessed = true;
			});
			var newPk = getpKVal(data);
			cmpSet(lyte, data.$, "pK", getpKVal(data));
			var newRelPk = typeof newPk == "object" ? newPk : newPk.toString();
			if(mdl.data._recMap){
				mdl.data._recMap.delete(oldRelPk);
				mdl.data._recMap.set(newRelPk, data);
			}
			changeRelPkMaps(data, oldRelPk, newRelPk);
			updateNestScp(data, oldPk);
		}
		if(crProcessed && partialObj && partialObj.$ ){
			partialObj.$.processed = true;
		}
		if(doMerge && cPersist !== true){
			result = validateAndMerge(mdl, response, partialObj, true, true);
			if(result && result.data){
				result = result.data;
			}
			else if(result && result.type){
				Array.isArray(result.args) ? result.args.splice(0,0,db.lyte) : [db.lyte]
				Dberror[result.type].apply(Dberror, result.args || [db.lyte]);
			}
		}
		cmpSet(lyte, data.$, "isNew", false);
		if(partialObj.hasOwnProperty("_removedAttr") && Object.keys(partialObj._removedAttr).length!=0){
			return result;
		}
		cmpSet(lyte, data.$, "isModified", false);
		changePersist(data, true);
		deleteFromArray(mdl.dirty, oldPk);
		if(!data.$.dN || ( data.$.dN && Object.keys(data.$.dN).length == 0 )){
			removeParentNesting(data);
		}
	}
	return result;
}

function mergeModifiedRec(db, partialObj, data, response, doMerge, mergeDone, cPersist){
	var dirtyId = !dirtyId ? data.$.pK : dirtyId, result, lyte = db.lyte;
	if(!data.$.isDeleted && response && !mergeDone && cPersist !== true){
		if(response && doMerge){
			result =  validateAndMerge(data.$.schema, response, partialObj, true, true);
			if(result && result.data){
				result = result.data;
			}
			else if(result && result.type){
				Array.isArray(result.args) ? result.args.splice(0,0,db.lyte) : [db.lyte]
				Dberror[result.type].apply(Dberror, result.args || [db.lyte]);
			}
		}
		mergeDone = true;						
	}
	// changeModified(lyte, data, false, data.$.pK);
	if(partialObj && partialObj.hasOwnProperty("_removedAttr") && partialObj._removedAttr.length){
		return result;
	}
	cmpSet(lyte, data.$, "isModified", false);
	changePersist(data, true);
	if(!data.$.dN || ( data.$.dN && Object.keys(data.$.dN).length == 0 )){
		removeParentNesting(data);
	}
	return result;
} 

function mergeDeletedRec(db, partialObj, data){
	var pkVal, schema, obj;
	if(partialObj){
		schema = partialObj.$.schema;
		pkVal = partialObj.$.pkVal;
	}
	else if(data){
		schema = data.$.schema;
		pkVal = data.$.pK;
	}
	obj = schema._deleted.get(pkVal); 
	var rec = obj ? obj.data : undefined;
	var isRec = db.cache.getEntity(schema.def, pkVal);
	if(rec){
		cmpSet(db.lyte, rec.$, "isDeleted", false);
		cmpSet(db.lyte, rec.$, "isUnloaded", true);
		cmpSet(db.lyte, rec.$, "isPersisted", true);
		var scpObj = rec.$.__scpObj;
		for(var key in scpObj){
			var sid = scpObj[key];
			var sidArr = sid.split("_");
			var nestObj = nestScp[sidArr[0]];
			nestObj ? removeNestScp(nestObj._data, sidArr[0], sidArr[1], undefined, rec, undefined, undefined, {model:schema._name, pK: pkVal, attr: key}) : undefined;
		}	
		schema._deleted.delete(pkVal);
		removeParentNesting(rec);
	}
	if(isRec){
		removeFromStore(schema, pkVal, true, undefined, undefined, true);
		removeParentNesting(isRec);
	}
	else{
		var cqueries = db.schema.cachedQueries;
		if(cqueries){
			var n=schema._name, Nm = cqueries[n];
			if(Nm && Nm.length){
				for(var i=Nm.length-1; i>=0; i--){
					var obj = Nm[i];
					if(obj.hasDeletedRecords){
						if(obj.data){
							var ind = obj.data[n].indexOf(rec);
							if(ind !== -1){
								Nm.splice(i,1);					
							}
						}
					}
				}					
			}
		}
	}
	if(partialObj && partialObj.$ && partialObj.$.parent){
		partialObj.$.parent.$.partial = {};
	}
	partialObj && partialObj.$ ? partialObj.$.processed = true : undefined;
}

function changeRelPkMaps(data, oldPk, newPk){
	var schema = data.$.schema,
	db = schema.db,
	relations = schema.relations;
	relations.forEach(function(rels, key){
		rels.forEach(function(itm){
			var attr = itm.relKey, relType = itm.relType, inv;
			if(data.hasOwnProperty(attr)){
				var relRec = data[attr],
				bMod = getSchemaObj(db, itm.relatedTo), inv;
				if(bMod){
					inv = getBackwardRel(schema,itm,bMod);
					if(inv && inv.relType == "hasMany"){
						if(relType == "belongsTo" && isEntity(relRec)){
							relRec[inv.relKey] && relRec[inv.relKey]._recMap && relRec[inv.relKey]._recMap.delete(oldPk) ? relRec[inv.relKey]._recMap.set(newPk, data) : undefined;
						}
						else if(relType == "hasMany" && Array.isArray(relRec)){
							relRec.forEach(function(rec){
								isEntity(rec) && rec[inv.relKey] && rec[inv.relKey]._recMap && rec[inv.relKey]._recMap.delete(oldPk) ? rec[inv.relKey]._recMap.set(newPk, data) : undefined;
							});
						}
					}
				}
			}
		});
	});
	var _rels = data.$._relationships;
	for(var md in _rels){
		var mdObj = _rels[md];
		for(var attr in mdObj){
			var arr = mdObj[attr];
			arr.forEach(function(rec){
				var relData = rec[attr];
				if(Array.isArray(relData)){
					relData._recMap && relData._recMap.delete(oldPk) ? relData._recMap.set(newPk, data) : undefined;
				}
			});
		}
	}
}

function updateNestScp(obj, oldPk){
	if(isEntity(obj)){
		var scpObj = obj.$.__scpObj || {};
		for(var key in scpObj){
			var val = scpObj[key];
			val = val.split("_")[0];
			if(nestScp && nestScp.hasOwnProperty(val) && nestScp[val].model){
				var mp1 = nestScp[val].model.get(obj.$.schema._name);
				if(mp1.has(oldPk)){
					var val = mp1.get(oldPk);
					mp1.delete(oldPk);
					mp1.set(obj.$.pK, val);
				}
				// Lyte.nestScp[val].pK = record.$.pK;
			}
		}
	}
}

function getDsrzEmpData(schema, field){
	if(field.hasOwnProperty("deserializeEmptyData")){
		return field.deserializeEmptyData;
	}
	else{
		var desrz = getFromCB(schema.db, "serializer", schema.serializer, "deserializeEmptyData");
		if(desrz !== undefined){
			return desrz;
		}
	}
	return false;
}

// function defpayObjUtls(obj){
// 	Object.defineProperties(obj,{
// 		set:{
// 			value: payloadSet
// 		},
// 		remove:{
// 			value: payloadRemove
// 		}
// 	})
// }

// function defPayArrUtls(obj){
// 	Object.defineProperties(obj,{
// 		add : {
// 			value : payloadAdd
// 		},
// 		remove : {
// 			value : payloadRemove
// 		}
// 	})
// }

// function payloadAdd(key,index){
// 	if(!Array.isArray(key)){
// 		key=[key];
// 	}
// 	var def = this._schema, db = def.db, partObj=this._partialObj, payload=this._payloadObj;
// 	for(var i =0 ; i<key.length; i++){
// 		var record = db.cache.getEntity({schema:def, pK:key[i]}), partial={};
// 		_defProp(partial, "$", {});
// 		var nPartial = 	partial.$;
// 		Object.defineProperties(nPartial,{
// 			pkVal : {
// 				value : record.$.pK
// 			},
// 			type : {
// 				value : "related"
// 			},
// 			schema : {
// 				value : def
// 			},
// 			record : {
// 				value : record
// 			}
// 		});
// 		var _pk = typeof(record.$.pK) == "object" ? record.$.pK : { [record.$.model._pK] : record.$.pK };
// 		if(index){
// 			Lyte.arrayUtils(partObj,"insertAt",index,partial);
// 			Lyte.arrayUtils(payload,"insertAt",index,_pK);
// 			index=index++;
// 		}
// 		else{
// 			Lyte.arrayUtils(partObj,"push",partial);
// 			Lyte.arrayUtils(payload,"push",_pk);
// 		}
// 		store.$.defProp(_pk, "$", {});
// 		store.$.defpayObjUtls(_pk.$);
// 		Object.defineProperties(_pk.$,{
// 			_pkVal : {
// 				value : record.$.pK
// 			},
// 			_model : {
// 				value : modelName
// 			},
// 			_partialObj : {
// 				value : partial
// 			},
// 			_payloadObj:{
// 				value:_pk
// 			}
// 		});
// 	}
// }

// function payloadRemove(key){
// 	var def = this._schema, 
// 	partObj=this._partialObj, 
// 	payload=this._payloadObj;
// 	if(!Array.isArray(key)){
// 		key=[key];
// 	}
// 	for(var j =0; j<key.length; j++){
// 		if(Array.isArray(payload)){
// 			var len = payload.length;
// 			for(var i =0; i<len; i++){
// 				if(partObj[i].$.pkVal == key){
// 					partObj.splice(i, 1);
// 					payload.splice(i, 1);
// 					// Lyte.arrayUtils(partObj,"removeAt",i,1);
// 					// Lyte.arrayUtils(payload,"removeAt",i,1);
// 				}
// 			}
// 		}
// 		else{
// 			if(payload[key] && partObj[key]){
// 				delete payload[key[j]];
// 				delete partObj[key[j]];
// 				// Lyte.objectUtils(payload,"delete",key[j]);
// 				// Lyte.objectUtils(partObj,"delete",key[j]);
// 			}
// 		}
// 	}
// }

// function payloadSet(fkey){
// 	if(!Array.isArray(fkey)){
// 		fkey=[fkey];
// 	}
// 	var def = this._schema, db = def.db, pk = this._pkVal, payload = this._payloadObj;
// 	var record = db.cache.getEntity({schema:def.def,pK:pk}), partial=this._partialObj;
// 	for(i_key=0; i_key<fkey.length; i_key++){
// 		var key = fkey[i_key];
// 		var field = def.fieldList[key];
// 		if(record[key] && field.type == "relation"){
// 			if(field.relType == "hasMany"){
// 				partial[key]=[];
// 				payload[key]=[];
// 				_defProp(payload[key], "$", {});
// 				defPayArrUtls(payload[key].$);
// 				Object.defineProperties(payload[key].$,{
// 					_key:{
// 						value:field.relKey
// 					},
// 					_partialObj:{
// 						value:partial[key]
// 					},
// 					_schema:{
// 						value:field.relatedTo
// 					},
// 					_payloadObj:{
// 						value:payload[key]
// 					},
// 					// replace:{
// 					// 	value:store.$.replaceCheck,
// 					// 	writable:true
// 					// }
// 				})
// 				for(i=0; i<record[key].length; i++){
// 					payload[key].$.add(record[key][i].$.pK);
// 				}
// 			}
// 			else{
// 				partial[key]={};
// 				payload[key]={};
// 				payload[key]=typeof record[key].$.pK =="object" ? record[key].$.pK:{[record[key].$.model._pK]:record[key].$.pK};
// 				_defProp(partial[key], "$", {});
// 				var nPartial = 	partial[key].$;
// 				Object.defineProperties(nPartial,{
// 					pkVal : {
// 						value : record.$.pK
// 					},
// 					type : {
// 						value : "related"
// 					},
// 					schema : {
// 						value : def
// 					},
// 					record : {
// 						value : record[key]
// 					}
// 				});
// 				_defProp(payload[key], "$", {});
// 				Object.defineProperties(payload[key].$,{
// 					_pkVal : {
// 						value : record[key].$.pK
// 					},
// 					_schema : {
// 						value : field.relatedTo
// 					},
// 					_partialObj : {
// 						value : partial[key]
// 					},
// 					_payloadObj:{
// 						value:payload[key]
// 					}
// 				});
// 				defpayObjUtls(payload[key].$);
// 			}
// 		}
// 		else{
// 			payload[key]=record[key];
// 			partial[key]=record[key];
// 		}
// 	}
// }

// function replaceCheck(bool){
// 	store.$.defProp(this._partialObj,"replace",bool)
// }

export { evAdd,evRemove,evEmit,addTo_Del,genUnRedoStack,deepCopyStack,deepCopyAttrs,unredoOp,unregisterDef,updateFieldValidation,handleCachedResponse,addToCachedBatch,checkObjAndAddToArr,addToRelate,getDefaultVal,deepValueChange,updateDn,deepRelIter,deepRelOptions,handleResults,handleResponse,setState,validateRelatedRecord,validateRecord,validateField,addOnSave,removeOnSave,registerField,unRegCb,extendDef,demoLishObserverBindings,establishObsBindings,isEmpty,isEmptyObj,isEmptyArray,compareObjects,setData,changeCallbck,setValue,estAttrs,checkAttrs,checkForCorrectRelation,partialData,removeDeepNest,addDeepNest,makeDirty,setDeepNest,deleteDeepNest,getRelatedRecord,removeParentNesting,cmpRelInitVal,_attrsForRel,establishToRelated,add,remove,filter,filterBy,checkAndAddToArray,deleteFromArray,genPk,generateRandomPk,isDuplicateRecord,pkPresence,updateJSON,isDirty,isRelDirty,polymorphicToJSON,polyToJSON,removeBackwardRel,checkPresenceInArray,idbSerialize,idSerialize,recordSerialize,rSerialize,partialSerialize,removeSelfCircularReference,getpKVal,toJSONObj,toJSON,createCopy,initPartialObj,recChk,initCB,cB,cbScp,getFromCB,comparePk,newRecord,getIndex,getCompInd,getInd,isDuplicateEntity,compareRecords,hasRecordInArray,hasDuplicateRelation,toInsertData,insertIntoStore,validateAndPush,validateJSON,handleRelation,getRelations,getBackwardRel,solveRelation,createAndRelate,singleEstablishLink,establishLink,removeFromStore,toDemolishRelation,toDemolishLink,demolishSingleRelation,demolishLink,validateAndMerge,mergeData,mergeRecords,compareRelations,compareRecordWithObj,rllBckRecArr,sortBy,mapBy,revertToOldVal,removePartial,rollBackDelete,rollBackNew,emit,hasRecordsArrayChanged,cacheQuery,cacheRecordQuery,isDefData,handleArrOp,defArrUtls,defPolyUtls,defUtls,defPar,cmpSet,_defProp,removePartialKeys,mergeResponse,removeDirtyStack,mergeNewDataKeys,mergeError,mergePartialObj,mergeNewRecord,mergeModifiedRec,mergeDeletedRec,changeRelPkMaps,updateNestScp, compareData, schArgs, dbModName, getSchemaObj, changePersist};
