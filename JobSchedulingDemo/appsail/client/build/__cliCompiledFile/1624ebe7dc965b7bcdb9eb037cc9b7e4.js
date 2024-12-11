import { Serializer } from "./Serializer";
/*convert to custom class*/
class GraphqlSerializer extends Serializer {
    static register(parent){
        // this.__class = GraphqlSerializer;
        // var name = this._name = dbModName(this.name, "Serializer");
    }
    constructor(){
        super();
        this.__type = "gql";
    }
}

GraphqlSerializer.__lMod = "GraphqlSerializer";
GraphqlSerializer.PROCESSENTITY = "processEntity";
GraphqlSerializer.NORMALIZE = "normalizePayload";
GraphqlSerializer.SERIALIZE = "serializePayload";
GraphqlSerializer.SERIALIZEKEY = "serializeKey";
GraphqlSerializer.NORMALIZEKEY = "normalizeKey";
GraphqlSerializer.SERIALIZEENTITY = "serializeEntity";
GraphqlSerializer.NORMALIZEENTITY = "normalizeEntity";
GraphqlSerializer.DESERIALIZEKEY = "deserializeKey";
GraphqlSerializer.GETMETA = "getMeta";
GraphqlSerializer.IDBRESPONSE = "idbResponse";
GraphqlSerializer.REFERENCEKEY = "referenceKey";
GraphqlSerializer.__extendedBy = [];

export { GraphqlSerializer };