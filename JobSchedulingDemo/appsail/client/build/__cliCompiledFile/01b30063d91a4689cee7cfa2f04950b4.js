import { Lyte } from "./lyte";
import { extendEventListeners } from "./lyte-utils";
import { LyteAddon } from "./LyteAddon";

// add function which throws error //ex Lyte.attr function need to be added with checking secind arguments as object ans so it will override the original Lyte.attr function in develepment mode
class LyteError extends Error {

}

const level = 0;
class Logger extends Error {
    static get level(){
        return level;
    }
    constructor(){
        super(...arguments);
    }
    static register(){
        var context = this;
        while(context !== Logger){
            if(!context.hasOwnProperty("addEventListener")){
                extendEventListeners(context);
            }
            context = Object.getPrototypeOf(context);
        }
        if(!Logger.triggerEvent){
            extendEventListeners(Logger);
        }
    }
    static registerErrorCodes(obj, defineProperty){
        if(obj && typeof obj == "object"){
            for(var key in obj){
                var message = obj[key];
                if(defineProperty){
                    Object.defineProperty(this.errorCodes, key, {
                        value: message
                    });
                }
                else{
                    this.errorCodes[key] = message;
                }
            }
        }
    }
    static getErrorMessage(code, withCode){
      var args = Array.from(arguments).slice(1);
      if(this.errorCodes[code]) {
          var msg = this.errorCodes[code].replace(/{(\d+)}/g, function(t, i) {
              return args[i];
          });
          return code+": "+msg;
      } else {
          return code;
      }
    }
    static setErrorMessage(code, message, defineProperty){
        if(defineProperty){
            Object.defineProperty(this.errorCodes, code, {
                value: message
            });
        }
        else{
            this.errorCodes[code] = message;
        }
    }
    static error(){
        var args = Array.from(arguments), arg0 = arguments[0], ins, errorObj, logLevel = Logger.level;
        if(arg0 instanceof Lyte || arg0 instanceof LyteAddon){
            ins = arg0;
            args.splice(0,1);
            if(ins.hasOwnProperty("logLevel")){
                logLevel = ins.logLevel;
            }
        }
        if(logLevel < 3){
            errorObj = args[0];
            var parse = errorObj.stack, 
            context = this;
            errorObj = parse ? errorObj : new this(this.getErrorMessage.apply(this, args));
            while(context !== Logger){
                if (context.hasOwnProperty("onerror")) {
                    context.onerror.call(context, errorObj, args[1], this, ins);
                }
                if(context.hasOwnProperty("triggerEvent")){
                    context.triggerEvent.call(context, "error", errorObj, args[1], this, ins);
                }
                context = Object.getPrototypeOf(context);
            }
            if (Logger.hasOwnProperty("onerror")) {
                Logger.onerror.call(Logger, errorObj, args[1], this, ins);
            }
            if(Logger.hasOwnProperty("triggerEvent")){
                Logger.triggerEvent.call(Logger, "error", errorObj, args[1], this, ins);
            }
            if(ins){
                if(ins.onerror) {
                    ins.onerror.call(ins, errorObj, args[1], this, ins);
                }
                if(ins.triggerEvent){
                    ins.triggerEvent.call(ins, "error", errorObj, args[1], this, ins);
                }
            }
            var safari = errorObj.stack && errorObj.stack.indexOf(errorObj.message) == -1
            if (parse && !safari) {
                errorObj = JSON.parse(JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj)));
            }
            if(args[1]) {
                console.error(errorObj.stack ? (safari ? errorObj : errorObj.stack) : errorObj.message, args[1]);
            } else {
                console.error(errorObj.stack ? (safari ? errorObj : errorObj.stack) : errorObj.message);    
            }
        }
    }
    static warn(){
        var args = Array.from(arguments), arg0 = arguments[0], ins, errorObj, logLevel = Logger.level;
        if(arg0 instanceof Lyte || arg0 instanceof LyteAddon){
            ins = arg0;
            args.splice(0,1);
            if(ins.hasOwnProperty("logLevel")){
                logLevel = ins.logLevel;
            }
        }
        if(logLevel < 2){
            var errorObj = args[0];
            errorObj = errorObj.stack ? JSON.parse(JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj))) : new this(this.getErrorMessage.apply(this, args));
            console.warn(errorObj.stack ? (errorObj.stack.indexOf(errorObj.message) != -1 ? errorObj.stack.replace("Error: ", "Warn: ") : errorObj) : errorObj.message);
        }
    }
    static log(){
        var args = Array.from(arguments), arg0 = arguments[0], ins, errorObj, logLevel = Logger.level;
        if(arg0 instanceof Lyte || arg0 instanceof LyteAddon){
            ins = arg0;
            args.splice(0,1);
            if(ins.hasOwnProperty("logLevel")){
                logLevel = ins.logLevel;
            }
        }
        if(logLevel == 0){
            var errorObj = args[0];
            errorObj = errorObj.stack ? JSON.parse(JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj))) : new this(this.getErrorMessage.apply(this, args));
            console.log(errorObj.stack ? (errorObj.stack.indexOf(errorObj.message) != -1 ? errorObj.stack.replace("Error: ", "Log: ") : errorObj) : errorObj.message);        
        }
    }
}

Logger.errorCodes = {
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
    ERR30: "Property's value is not an instanceof the mentioned class",      
    L001: "{0} {1} is already registered",
    // /* move to component */
    // LC001: "Error while parsing custom prop handler attribute {0}. Check if the value provided is a valid JSON",
    // LC002: "{0} Component is not compiled. Please compile using Lyte CLI",
    // LC003: "Helper named {0} is not defined",
    // LC004: "Action named {0} doesn't exists",
    // LC005: "Lyte.objectUtils doesn't support {0} function",
    // LC006: "Lyte.arrayUtils doesn't support {0} function",
    // LC007: "Component name not specified in Lyte.Component.render",
    // LC008: "Specified outlet {0} doesn't exists - Lyte.Component.render",
    // LC009: "Method named {0} doesn't exists in {1} component",
    // LC010: "Parent Node / reference Node not provided for insertBefore method",
};

extendEventListeners(Logger);

window.Logger = Logger;
export { Logger };
