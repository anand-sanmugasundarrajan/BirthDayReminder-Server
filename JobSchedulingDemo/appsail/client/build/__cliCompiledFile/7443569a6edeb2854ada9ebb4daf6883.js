import { cmpSet, emit} from "./utils";
import { Logger } from "@slyte/core";

class Dberror extends Logger {
    constructor(){
        super(...arguments);
    }
}

Dberror.errorCodes = {
    LD01: "Primary key value might be missing in the response data that is received, {0}",
    LD02: "Not a valid {0}",
    LD03: "Cannot set the error {0} for {1}",
    LD04: "No such record to merge, {0}",
    LD05: "Model( {0} ) of related property - {1} not found in model - {2}",
    LD06: "Backward relation not present in model( {0} ), for the property {1} of model( {2} )",
    LD07: "{0} type not handled in handleArrayOperations",
    LD08: "{0} {1} will be deprecated from next version {2}",
    LD09: "deserializeKey cannot be processed for payload with more than two keys. Please use payloadKey callback instead or try modifying the same in normalizeResponse callback",
    LD10: "Response data not in a format lyte data store expects",
    LD11: "Deprecation Warning! findRecord response payload will not accept an array. It will be deprecated from the next version",
    LD12: "Response ( {0} ) is not in a format, lyte data store expects",
    LD13: "Response processing failed in {0} for model-{1} {2}, since invalid data is received in {1}(modelName) key of response data. Data - {3}",
    LD14: "Cannot register {0} - {1}, as it already exists.",
    LD15: "Primary key value might be missing in the response data that is received, {0}",
    LD16: "Record merge failed for the record in model - {0} with primaryKey value - {1}, since either the persisted(saved) primary key value for a newly created record is not received from server or not in the proper structure to merge",
    LD17: "Record with the primary key value already exists",
    LD18: "No { 0 } present",
    LD19: "Deprecation Warning! findAll will not accept response payload values other than an array or any empty value. Current implementation which allows this will be deprecated from the next version",
    LD20: "Record cannot be saved as a state, when it is not either a new or a modified record or in a error state.",
    LD21: "No such state ( {0} ) saved for the record.",
    LD22: "For create / createRecord, response with a primary key value should be received",
    LD23: "PrimaryKey field {1} in {0} cannot have default value",
    LD24: "Response couldn't be parsed, {0}",
    LD25: "Cannot create record for the data - {0}",
    LD26: "Only one baseKey is allowed for a model",
    LD27: "Record merge failed, since the data passed is invalid - {0}",
    LD28: "Record merge failed for the model - {0}, since a valid primary key value is not found in the data to be merged - {1}"   
};

Dberror.register();

class ValidationError {
    constructor(lyte, attr, obj, message){
        Object.defineProperties(this, {
            $ : {
                value : {isError : true , error:message?message:{}}
            }
        });
        if(attr){
            ValidationError.setError(lyte,this,attr,obj);
        }    
    }

    static setError(lyte,err,attr,codeObj){
        if(err.$.hasOwnProperty("error")){
            if(Array.isArray(attr)){
                attr.forEach(function(itm){
                    cmpSet(lyte, err.$.error, itm, codeObj);
                });
            }
            else{
                cmpSet(lyte, err.$.error,attr,codeObj);
            }
        }
        else{
            ValidationError.error(lyte,"LD03",err,attr);
        }
    }

    static setRecErr(ent$, field, code, value){
        var lyte = ent$.schema.Lyte;
        cmpSet(lyte, ent$, "isError", true);
        var errObj = code;
        if(typeof errObj == "object"){
            cmpSet(lyte, ent$.error,field,errObj);
        }
        else{
            if(typeof code == "string"){
                var errMes = ValidationError.errorCodes[code];
                if(errMes){
                    errObj = {code : code, message : ValidationError.errorCodes[code]};
                }
                else{
                    errObj = code;
                }
            }
            cmpSet(lyte, ent$.error, field, errObj);
            if(value){
                cmpSet(lyte, ent$.error[field],"value",value);
            }				
        }
		var db = ent$.schema.db;
        emit(db,"error",ent$.entity,field,errObj);
    }

    static clrRecErr(ent$, field, code){
        var lyte = ent$.schema.Lyte;
        var objUtl = lyte.objectUtils;
        var $err = ent$.error;
        if(code){
            if(ent$.error.code == code){
                if(typeof objUtl != "undefined"){
                    objUtl($err,"delete",field);
                }
                else{
                    delete $err[field];                        
                }
            }
        }
        else if(field){
            if(typeof objUtl != "undefined"){
                objUtl($err,"delete",field);
            }
            else{
                delete $err[field];                       
            }
        }
        else{
            if(typeof objUtl != "undefined"){
                for(var err in $err){
                    objUtl($err,"delete",err);
                }
            }	
            else{
                ent$.error = {};
            }   
        }
        if(Object.keys(ent$.error).length == 0){
            cmpSet(lyte, ent$, "isError", false);
        }
    }
}

ValidationError.errorCodes = {
    ERR01 : "Primary key cannot be modified", 
    ERR02 : "Mandatory prop cannot be empty", 
    ERR03 : "Type of value does not match the specified data type",
    ERR04 : "Value is greater than the maximum value allowed",
    ERR05 : "Value is less than the minimum value allowed", 
    ERR06 : "Length of string/array is greater than the maximum limit allowed", 
    ERR07 : "Length of string/array is less than the minimum limit allowed",
    ERR08 : "String does not match the specified pattern", 
    ERR09 : "Values in array are not unique", 
    ERR10 : "Value is not equal to the specified constant", 
    ERR11 : "Schema of related field is not defined",
    ERR12 : "Schema of backward relation is not defined", 
    ERR13 : "Entity not found", 
    ERR14 : "Schema does not match the schema defined in the related field", 
    ERR15 : "Error in creating a entity as a relation",
    ERR16 : "Entity with primary key already exists", 
    ERR17 : "Value cannot be changed because entity has been deleted", 
    ERR18 : "Action not defined", 
    ERR19 : "Schema not defined",
    ERR20 : "Key not specified", 
    ERR21 : "'one' relationship expects a single object/id", 
    ERR22 : "Type not specified for polymorphic relation", 
    ERR23: "Primary Key value not present", 
    ERR24: "Error while relating entities", 
    ERR25: "Backward relation not present",
    ERR26: "Primary key value cannot be undefined or null",
    ERR27: "Observer can observe only string data type value, '{0}' value cannot be observed in the function named '{1}' in the component '{2}'",
    ERR29: "Property not defined in the object",
    ERR30: "Property's value is not an instanceof the mentioned class"      
};

// ValidationError.register();


class ConnectorError extends Dberror {
    constructor(msg, xhr){
        super();
        this.message = msg;
        this.xhr = xhr;
    }
}
ConnectorError.register();

class SerializerError extends Dberror {
    constructor(msg, xhr){
        super();
        this.message = msg;
        this.xhr = xhr;
    }
}
SerializerError.register();

export { ValidationError, Dberror, ConnectorError, SerializerError };