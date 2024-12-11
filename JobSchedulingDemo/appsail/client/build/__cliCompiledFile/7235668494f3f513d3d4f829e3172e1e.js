import { _defProp, getFromCB, registerField, defArrUtls, defUtls, evAdd, evRemove, evEmit, extendDef, establishObsBindings, schArgs, dbModName, getSchemaObj } from "./utils.js";
import { $Entity } from "./Entity.js";
import { getDefaultVal } from './utils';
import { establishObjectBinding, establishObserverBindings, extendEventListeners, isInheritedClass , establishWatchScope} from "@slyte/core/src/lyte-utils.js";
import { Dberror } from "./dberror.js";

class Schema {
    static observers(arg){
        return arg;
    }
    static actions(arg){
        return arg;
    }
    static prop(type, opts){
        if(opts && typeof opts !== "object"){
            console.error("second param should be a object");
        }
        opts = opts || {};
        var obj = Object.assign({},opts);
        obj.type = type;
        return obj;
    }
    static register(opts){
        var rHash = opts.refHash;
        var schCls = this, 
        dbMap = Schema.db = Schema.db || new Map(),  
        schMap,
        schClsName = schCls.name;
        if(!dbMap.has(rHash)){
            dbMap.set(rHash, new Map());
        }
        schMap = dbMap.get(rHash);
        if(!schMap.has(schClsName)){
            schMap.set(schCls.name, schCls);
        }
        Schema.triggerEvent(rHash, schCls);
    }
    static registerInDb(opts, parent){
        this.__class = Schema;
        var name;
        if(this.schemaName){
            name = this._name = this.schemaName;
        }   
        else{
            name = opts && opts.name? opts.name : this.name;
            name = this._name = dbModName(name, "Schema", opts && opts.name ? false : true);
        }
        parent = parent || Object.getPrototypeOf(this);
        if(!parent.schema.hasOwnProperty(name)){
            parent.schema[name] = this;
            this.opts = opts;
            if(parent.schema.triggerEvent){
                parent.schema.triggerEvent("add", name, this);
            }
        }
        else{
            Dberror.warn("Schema with the same name - "+ name+ " already present in the db");
        }        
    }
    static create(db, lIns){
        var _this = {}, 
        parent = Object.getPrototypeOf(this);
        parent = parent !== db.constructor.Schema && parent !== Schema ? parent : undefined;
        extendEventListeners(_this);
        Object.defineProperty(_this, "emit", {
            value: function(name, args){
                var arr = Array.isArray(args) ?  Array.from(args) : [];
                arr.splice(0, 0, name);
                _this.triggerEvent.apply(this, arr);
            }
        });
        var name = _this._name = this._name;
        var delay = this.opts && this.opts.delay ? this.opts.delay : undefined;
        _this.db = db;
        _this.Lyte = lIns;
        _this.__class = Schema;
        _this.fieldList = {id : {type : "string", primaryKey : true, defined : false}};
        _this.relations = new Map();
        _this._properties = {};
        _this._fldGrps = { default : {}, hasMany: {}, watch: {}, inherit:{} ,nested_prop: {}, reverseKey: new Map() , JsonPathWatch : {} };
        _this.data = [];
        _this.dirty = [];
        _this._deleted = new Map();
        _this.events = {};
        _this.def = this;
        _this.endPoint = this.endPoint;
        _defProp(_this.data, "_recMap", new Map());
		// _defProp(_this, "db", db);
        
        var obs = [], self = _this, _self = this;
        function _props(){
            delete self._pK;
            delete self._arrPk;
            var parentProps = {};
            if(parent && parent.props){
                parentProps = parent.props(lIns);
                for(var key in parentProps){
                    if(parentProps[key].type == "relation"){
                        delete parentProps[key];
                    }
                }
            }
            var fields = Object.assign(parentProps, _self.prototype.props(lIns));            
            for(var key in fields){
                registerField(db,self,key,fields[key],obs);
            }
            if(!self._pK){
                self._pK = 'id';
            }    
            self.isComp = false;
            var splt = self._pK.split(',');
            if(splt.length > 1){
                self.isComp = true;
            }
            self._arrPk = splt;    
            // delete _self.prototype.props;    
        }
        var self = _this;
        db.schema[_this._name] = _this;
        if(this.prototype.props){
            if(delay){
                setTimeout(_props,1)
            }
            else{
                _props();
            }
        }
        if(this.prototype.actions){
            var parentAct = {};
            if(parent && parent.actions){
                parentAct = parent.actions() || {};
            }
            Object.defineProperty(_this, "actions", {
                value: Object.assign(parentAct, this.prototype.actions() || {})
            });
            // _this.actions = Object.assign(parentAct, this.prototype.actions());
        }
        if(this.observers){
            var parentObs = {};
            if(parent && parent.observers){
                parentObs = parent.observers() || {};
            }
            var obj = Object.assign(parentObs, this.observers() || {});
            for(var key in obj){
                obs.push(obj[key]);
            }
        }
        _this.didLoad = _this.didLoad || [];
        if(this.prototype.didLoad){
            _this.didLoad.push(this.prototype.didLoad);
        }
        if(this.prototype.idb){
            this.prototype.idb;
            _this.idb = this.prototype.idb(db);
        }
        if(!_this._pK){
            _this._pK = 'id';
        }
        _this.isComp = false;
        var splt = _this._pK.split(',');
        if(splt.length > 1){
            _this.isComp = true;
        }
        _this._arrPk = splt;
        establishObserverBindings(obs,true,_this._properties, _this);
        establishWatchScope(_this._fldGrps.JsonPathWatch,_this)
        defArrUtls(_this.data);
        defUtls(_this.data, _this);
        if(parent){
            extendDef.apply(self, [db.getSchemaObj(parent._name), undefined, db]);
        }
        else if(this.prototype.polymorphic){
            var pArr = this.prototype.polymorphic();
            pArr.forEach(function(itm, idx){
                extendDef.apply(db.getSchemaObj(itm._name), [self, undefined, db]);
            });
        }
        delete _this.connector;
        delete _this.serializer;
        var self = _this;
        if(this.Connector){
            if(isInheritedClass(this.Connector, db.constructor.ConnectorCls)){
                _this.Connector = this.Connector;
                var cname = dbModName(this.Connector.name, "Connector");
                if(cname === "application"){
                    var aIns;
                    lIns.scopedInstance(this.Connector, [db], function(ins){
                        self.connector = ins;
                        aIns = ins;
                    }, [db]);
                    var context = aIns.__type
                    db.Connector[context] = db.Connector[context] || {};
                    db.Connector[context][cname] = _self.Connector;
        
                    db.connector[context] = db.connector[context] || {}; 
                    db.connector[context].application = aIns;
                }
                else{
                    lIns.scopedInstance(this.Connector, [db], function(ins){
                        self.connector = ins;
                    }, [db]);
                    var context = self.connector.__type;
                    db.Connector[context] = db.Connector[context] || {};
                    db.Connector[context][cname] = _self.Connector;
                }
    
                // _this.connector = new this.Connector(lIns); 
            }
        }
        else if(db.applicationConnector){
            self.connector = db.applicationConnector;
        }
        if(this.Serializer){
            if(isInheritedClass(this.Serializer, db.constructor.SerializerCls)){
                _this.Serializer = this.Serializer;
                var sname = dbModName(this.Serializer.name, "Serializer");
                if(sname === "application"){
                    var asIns;
                    lIns.scopedInstance(this.Serializer, [db], function(ins){
                        self.serializer = ins;
                        asIns = ins;
                    }, [db]);
                    var context = asIns.__type
    
                    db.Serializer[context] = db.Serializer[context] || {};
                    db.Serializer[context][sname] = _self.Serializer;
        
                    db.serializer[context] = db.serializer[context] || {}; 
                    db.serializer[context].application = asIns;
                }
                else{
                    lIns.scopedInstance(this.Serializer, [db], function(ins){
                        self.serializer = ins;
                    }, [db]);
                    var context = self.serializer.__type
                    db.Serializer[context] = db.Serializer[context] || {};
                    db.Serializer[context][sname] = _self.Serializer;
                }
            }
        }
        else if(db.applicationSerializer){
            self.serializer = db.applicationSerializer;
        }
        _this.cache = {
            get : function(){
                var args = schArgs.apply(self, arguments);
                return self.db.cache.get.apply(self.db.cache, args);
            },
            getAll: function(){
                var args = schArgs.apply(self, arguments);
                return self.db.cache.getAll.apply(self.db.cache, args);
            },
            drop : function(){
                var args = schArgs.apply(self, arguments);
                return self.db.drop.apply(self.db.cache, args);
            },
            dropAll : function(){
                var args = schArgs.apply(self, arguments);
                return self.db.dropAll.apply(self.db.cache, args);
            }
        }
        delete this.prototype.actions;
        delete this.prototype.didLoad;
        delete this.prototype.includes;
        delete this.prototype.idb;
        return _this;
    }
    constructor(data, opts, db){
        // super();
        var def = this.constructor;
        def = getSchemaObj(db, def);
        var delayPers = opts && opts.hasOwnProperty("delayPersistence") ? opts.delayPersistence : getFromCB(db,"connector", def.connector, "delayPersistence");
        Object.assign(this, data);
        Object.defineProperties(this, {
            $ :{
                writable : true,
                value : new $Entity(this, def, delayPers, db)
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
        for(var wKey in watchF){
            establishObjectBinding(this, wKey, true, undefined, undefined, true);
        }
        for(var hKey in hasManyF){
            var hFld = hasManyF[hKey];
            if(this.hasOwnProperty(hKey)){
                this[hKey] = Array.isArray(this[hKey]) ? Array.from(this[hKey]) : this[hKey];
            }
            else if(hFld.relatedTo){
                var toInit = getFromCB(db,"serializer", getSchemaObj(db, hFld.relatedTo).serializer, "initHasManyRelation");
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
    static addEventListener(type, func){
        return evAdd(this,type,func);
    }
    static removeEventListener(id){
        evRemove(this,id);
    }
    static emit(type, args){
        evEmit(this,type,args);
    }
    static on(type,func){
        return this.addEventListener(type,func);
    }
    /**
     * To get a data from the server.
     * @param {Object} obj - arguments object.
     * @param {string} obj.schema - schema.
     * @param {string} obj.pK - pK.
     * @return A promise which will be resolved on success and rejected on failure
    */
}

Schema.__lMod = "Schema";

extendEventListeners(Schema);

export { Schema };
