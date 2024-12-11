import { Logger } from "./lyte-error";
import { defProp, extendEventListeners } from "./lyte-utils";

class DataType {
    static register(opts){
        this._name = this.name.replace(/([a-zA-Z0-9])(DataType)$/g, '$1');
        var clsExt = this.extends || this.type;
        this.type = clsExt;
        if(clsExt == undefined || DataType.types.indexOf(clsExt) == -1){
            Logger.error("Not a valid field type - "+clsExt);
            return;
        }  
        if(this.prototype.serialize){
            this.serialize = this.prototype.serialize;
        }      
        if(this.prototype.deserialize){
            this.deserialize = this.prototype.deserialize;
        }
        var rHash = opts.refHash;
        var currCls = this, 
        appMap = DataType.lyte = DataType.lyte || new Map(),  
        dtMap,
        currClsName = currCls.name;
        if(!appMap.has(rHash)){
            appMap.set(rHash, new Map());
        }
        dtMap = appMap.get(rHash);
        if(!dtMap.has(currClsName)){
            dtMap.set(currCls.name, currCls);
        }
        DataType.triggerEvent(rHash, currCls);
    }
    static registerInApp(parent){
        var name = this._name = this.name || this.name.replace(/([a-zA-Z0-9])(DataType)$/g, '$1');
        var clsExt = this.extends || this.type;
        this.type = clsExt;
        if(clsExt == undefined || DataType.types.indexOf(clsExt) == -1){
            Logger.error("Not a valid field type - "+clsExt);
            return;
        }  
        if(this.prototype.serialize){
            this.serialize = this.prototype.serialize;
        }      
        if(this.prototype.deserialize){
            this.deserialize = this.prototype.deserialize;
        }
        var name = this._name = this._name || this.name.replace(/([a-zA-Z0-9])(DataType)$/g, '$1');
        if(!parent.dataType.hasOwnProperty(name)){
            parent.dataType[name] = this;
            if(parent.dataType.triggerEvent){
                parent.dataType.triggerEvent("add", name, this);
            }
        }
        else{
            Logger.warn("DataType with the same name - "+ name+ " already present in the app");
        }
    }
}
defProp(DataType, "types", {
    value: ["string", "object", "number", "boolean", "array"]
});
extendEventListeners(DataType);
export { DataType };