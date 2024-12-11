import { Serializer } from "./Serializer";

/*convert to custom class*/
class RESTSerializer extends Serializer {
    static register(parent){
        // this.__class = RESTSerializer;
        // var name = this._name = dbModName(this.name, "Serializer");
    }
    constructor(db){
        super();
        this.__type = "REST";
        var lIns = db.lyte,
        name = this.constructor._name;
        Object.defineProperty(this,'$lg', {
            value : lIns.__gl
        });
        this.deserializeEmptyData = true;
        if(!db.getSerializerObj(name)){
            db.serializer.REST = db.serializer.REST || {}; 
            db.serializer.REST[name] = this; 
        }
    }
}

RESTSerializer.__lMod = "RESTSerializer";
RESTSerializer.PROCESSENTITY = "processEntity";
RESTSerializer.NORMALIZE = "normalizePayload";
RESTSerializer.SERIALIZE = "serializePayload";
RESTSerializer.SERIALIZEKEY = "serializeKey";
RESTSerializer.NORMALIZEKEY = "normalizeKey";
RESTSerializer.SERIALIZEENTITY = "serializeEntity";
RESTSerializer.NORMALIZEENTITY = "normalizeEntity";
RESTSerializer.DESERIALIZEKEY = "deserializeKey";
RESTSerializer.GETMETA = "getMeta";
RESTSerializer.IDBRESPONSE = "idbResponse";
RESTSerializer.REFERENCEKEY = "referenceKey";
RESTSerializer.__extendedBy = [];

export { RESTSerializer };