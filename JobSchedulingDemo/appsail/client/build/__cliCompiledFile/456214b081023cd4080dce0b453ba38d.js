import { Logger } from "/node_modules/@slyte/core/index.js";

class RouterError extends Logger {
    static getErrorMessage(code) {
        arguments[0] = `LR${code}`
        var msg = super.getErrorMessage.apply(this,arguments);
        return msg;
    }
}

RouterError.errorCodes = {
    LR400 : `url "{0}" is not defined in router.`,
    LR400A : `Base path of url is not specified.`,
    LR422 : `There is no route definition for the route {args[1].splice(0,args[2]+1).join('.')}.`,
    LR498 : `Invalid argument {0}`,
    LR498A : `Invalid argument {0} provided in {1}.`,
    LR499 : `Dynamic params for the route {0} is not provided.`,
    LR499A : `Dynamic params for the route {0} is not provided {args[2].outerHTML}.`,
    LR499B: `Transition tried without arguments.`,
    LR405 : `Method invocation before Router initialized.`,
     // LR203 : `Data provided for component is not valid.`,
     LR428 : `There is no outlet named {0}.`,
     LR420A : `Error in {0} of route {1}.`,
     LR420 : `Promise rejected`
    //  LR424 : `File not loaded in {0} of route {1}.\n {args[3][0].target.outerHTML}`,
};

export {
    RouterError
}


// var lyte;

// function _getError() {
//     var args = arguments,
//     error;
//     switch(args[0]) {
//         case 400 :
//             error = args[1] ? "url '"+args[1]+"' is not defined in router." : "Base path of url is not specified.";
//             break;
//         case 422 :
//             error = "There is no route definition for the route "+(args[1].splice(0,args[2]+1).join('.'))+".";
//             break;
//         case 424 : 
//             error = "File not loaded in "+args[1]+ " of route "+args[2]+".\n"+args[3][0].target.outerHTML;
//             break;
//         case 498: 
//             error = "Invalid argument " + args[1] + (args[2] ? " provided in "+args[2] : ".");
//             break;
//         case 499 : 
//             error = args[1] ? ("Dynamic params for the route "+args[1]+" is not provided" + (args[2] && args[2].outerHTML  ? " in "+args[2].outerHTML : ".")) : "Transition tried without arguments.";
//             break;
//         case 420 : 
//             error = (args[3]? "Promise rejected" : "Error")+" in "+args[1]+" of route "+args[2]+".";
//             break;
//         case 428 : 
//             error = "There is no outlet named "+args[1]+".";
//             break;
//         case 203 :
//             error =  "Data provided for component is not valid.";
//             break;
//         case 405 :
//             error =  "Method invocation before Router initialized.";
//             break;
//     }
//     return 'LR '+args[0]+': '+error;
// }

// function _bindLyteInstanceToError(ins) {
//     lyte = ins;
// }

// function _consoleError() {
//     return lyte.error(arguments[0].stack ? arguments[0] : _getError.apply(this,arguments),arguments[3]);
// }

// export {
//     _bindLyteInstanceToError,
//     _getError,
//     _consoleError
// }



// class ValidationError extends Dberror{
//     static errorCodes = {
//         ERR01 : "Primary key cannot be modified", 
//         ERR02 : "Mandatory prop cannot be empty", 
//         ERR03 : "Type of value does not match the specified data type",
//         ERR04 : "Value is greater than the maximum value allowed",
//         ERR05 : "Value is less than the minimum value allowed", 
//         ERR06 : "Length of string/array is greater than the maximum limit allowed", 
//         ERR07 : "Length of string/array is less than the minimum limit allowed",
//         ERR08 : "String does not match the specified pattern", 
//         ERR09 : "Values in array are not unique", 
//         ERR10 : "Value is not equal to the specified constant", 
//         ERR11 : "Schema of related field is not defined",
//         ERR12 : "Schema of backward relation is not defined", 
//         ERR13 : "Entity not found", 
//         ERR14 : "Schema does not match the schema defined in the related field", 
//         ERR15 : "Error in creating a entity as a relation",
//         ERR16 : "Entity with primary key already exists", 
//         ERR17 : "Value cannot be changed because entity has been deleted", 
//         ERR18 : "Action not defined", 
//         ERR19 : "Schema not defined",
//         ERR20 : "Key not specified", 
//         ERR21 : "'one' relationship expects a single object/id", 
//         ERR22 : "Type not specified for polymorphic relation", 
//         ERR23: "Primary Key value not present", 
//         ERR24: "Error while relating entities", 
//         ERR25: "Backward relation not present",
//         ERR26: "Primary key value cannot be undefined or null",
//         ERR27: `Observer can observe only string data type value, {0} value cannot be observed in the function named '{0}' in the component '{1}'`,
//         ERR29: "Property not defined in the object",
//         ERR30: "Property's value is not an instanceof the mentioned class"      
//     }
//     constructor(lyte, attr, obj, message){
//         super();
//         Object.defineProperties(this, {
//              : {
//                 value : {isError : true , error:message?message:{}}
//             }
//         });
//         if(attr){
//             ValidationError.setError(lyte,this,attr,obj);
//         }    
//     }

//     static setError(lyte,err,attr,codeObj){
//         if(err..hasOwnProperty("error")){
//             if(Array.isArray(attr)){
//                 attr.forEach(function(itm){
//                     cmpSet(lyte, err..error, itm, codeObj);
//                 });
//             }
//             else{
//                 cmpSet(lyte, err..error,attr,codeObj);
//             }
//         }
//         else{
//             ValidationError.error("LD03",err,attr);
//         }
//     }

//     static setRecErr(ent, field, code, value){
//         var lyte = ent.schema.Lyte;
//         cmpSet(lyte, ent, "isError", true);
//         var errObj = code;
//         if(typeof errObj == "object"){
//             cmpSet(lyte, ent.error,field,errObj);
//         }
//         else{
//             if(typeof code == "string"){
//                 var errMes = ValidationError.errorCodes[code];
//                 if(errMes){
//                     errObj = {code : code, message : ValidationError.errorCodes[code]};
//                 }
//                 else{
//                     errObj = code;
//                 }
//             }
//             cmpSet(lyte, ent.error, field, errObj);
//             if(value){
//                 cmpSet(lyte, ent.error[field],"value",value);
//             }				
//         }
// 		var db = ent.schema.db;
//         emit(db,"error",ent.entity,field,errObj);
//     }

//     static clrRecErr(ent, field, code){
//         var lyte = ent.schema.Lyte;
//         var objUtl = lyte.objectUtils;
//         var err = ent.error;
//         if(code){
//             if(ent.error.code == code){
//                 if(typeof objUtl != "undefined"){
//                     objUtl(err,"delete",field);
//                 }
//                 else{
//                     delete err[field];                        
//                 }
//             }
//         }
//         else if(field){
//             if(typeof objUtl != "undefined"){
//                 objUtl(err,"delete",field);
//             }
//             else{
//                 delete err[field];                       
//             }
//         }
//         else{
//             if(typeof objUtl != "undefined"){
//                 for(var err in err){
//                     objUtl(err,"delete",err);
//                 }
//             }	
//             else{
//                 ent.error = {};
//             }   
//         }
//         if(Object.keys(ent.error).length == 0){
//             cmpSet(lyte, ent, "isError", false);
//         }
//     }
// }

// class ConnectorError extends Dberror {
//     constructor(msg, xhr){
//         super();
//         this.message = msg;
//         this.xhr = xhr;
//     }
// }

// class SerializerError extends Dberror{
//     constructor(msg, xhr){
//         super();
//         this.message = msg;
//         this.xhr = xhr;
//     }
// }

// export { ValidationError, Dberror, ConnectorError, SerializerError };