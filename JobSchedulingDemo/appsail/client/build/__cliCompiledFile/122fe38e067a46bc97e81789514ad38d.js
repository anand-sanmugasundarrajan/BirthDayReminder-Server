var errorCodes =  {
  ERR01 : "Primary key cannot be modified", 
  ERR02 : "Mandatory field cannot be empty", 
  ERR03 : "Type of value does not match the specified data type",
  ERR04 : "Value is greater than the maximum value allowed",
  ERR05 : "Value is less than the minimum value allowed", 
  ERR06 : "Length of string/array is greater than the maximum limit allowed", 
  ERR07 : "Length of string/array is less than the minimum limit allowed",
  ERR08 : "String does not match the specified pattern", 
  ERR09 : "Values in array are not unique", 
  ERR10 : "Value is not equal to the specified constant", 
  ERR11 : "Model of related field is not defined",
  ERR12 : "Model of backward relation is not defined", 
  ERR13 : "Record not found", 
  ERR14 : "Model does not match the related field model", 
  ERR15 : "Error in creating a record as a relation",
  ERR16 : "Record with primary key already exists", 
  ERR17 : "Value cannot be changed because record has been deleted", 
  ERR18 : "Action not defined", 
  ERR19 : "Model not defined",
  ERR20 : "Key not specified", 
  ERR21 : "'belongsTo' relationship expects a single object/id", 
  ERR22 : "Type not specified for polymorphic relation", 
  ERR23: "Primary Key value not present", 
  ERR24: "Error while relating record", 
  ERR25: "Backward relation not present",
  L001: "{0} {1} is already registered",
  ERR27 : "Observer can observe only string data type value, '{0}' value cannot be observed in the function named '{1}' in the component '{2}'",
//   /* move to component */
//   LC001: "Error while parsing custom prop handler attribute {0}. Check if the value provided is a valid JSON",
//   LC002: "{0} Component is not compiled. Please compile using Lyte CLI",
//   LC003: "Helper named {0} is not defined",
//   LC004: "Action named {0} doesn't exists",
//   LC005: "Lyte.objectUtils doesn't support {0} function",
//   LC006: "Lyte.arrayUtils doesn't support {0} function",
//   LC007: "Component name not specified in Lyte.Component.render",
//   LC008: "Specified outlet {0} doesn't exists - Lyte.Component.render",
//   LC009: "Method named {0} doesn't exists in {1} component",
//   LC010: "Parent Node / reference Node not provided for insertBefore method",
  /* move to data */
  LD01: "Primary key value might be missing in the response data that is received, {0}",
  LD02: "{0} - {1} is not registered",
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

function getErrorMessage(code) {
    var args = Array.from(arguments).slice(1);
    if(errorCodes[code]) {
        return errorCodes[code].replace(/{(\d+)}/g, function(t, i) {
            return args[i]
        });
    } else {
        return code;
    }
}

export {
    getErrorMessage, errorCodes
}