//ignorei18n_start
import { Logger } from "@slyte/core";

class ComponentError extends Logger {
    constructor(){
        super(...arguments);
    }
}

ComponentError.errorCodes = {
    LC001: "Error while parsing custom prop handler attribute {0} to the component {1}. Check if the value provided is a valid JSON",
    LC002: "{0} Component is not compiled. Please compile using Lyte CLI",
    LC003: "Helper named {0} is not defined",
    LC004: "Action named {0} doesn't exists",
    LC005: "Method named {0} doesn't exists in {1} component",
    LC006: "Error in data passed to component '{0}' for the properties - {1}",
    LC007: "Directive syntax is used but source not loaded",
    LC008: "{0} component not supporting turbo render. please add @turbo-supported in the component's template tag.",
    LC009: "Error in updateForHelper",
    LC010: "Passing lyteFastRender to unbound option in 'for' helper is depricated. So please make use of '@turbo' directive in the node - {0}",
    LC011: "Fast render source not bundled",
    LC012: "Error with templateAttributes.",
    LC013: "Data passed for property '{0}' of '{1}' cannot be serialized. The component '{2}' might not be registered before its use.",
    LC014: "No listenerId provided",
    LC015: "Invalid listenerId / listener is not available",
    LC016: "Deprecation Warning! pass the component class to component-class attribute, instead of passing '{0}' string component name to component-name attribute.",
    LC017: "{0} component not supporting shadow dom rendering. please add @shadow-supported in the component's template tag."

};

ComponentError.register();

class ApiError extends Logger {
    constructor(){
        super(...arguments);
    }
}

ApiError.errorCodes = {
    LC001: "Lyte.objectUtils doesn't support {0} function",
    LC002: "Lyte.arrayUtils doesn't support {0} function",
    LC003: "Component not specified in Lyte.Component.render",
    LC004: "Specified outlet {0} doesn't exists - Lyte.Component.render",
    LC005: "Parent Node / reference Node not provided for insertBefore method",
    LC006: "Invalid registry instance passed - Lyte.Component.render",
    LC007: "Uninstantiated registry class passed - Lyte.Component.render",
    LC008: "Unregistered component class passed - Lyte.Component.render",
    LC009: "Sanitizer instance not passed to sanitize api",
    LC010: "Invalid data passed in Lyte.Component.render"

};

ApiError.register();

class RegistryError extends Logger {
    constructor(){
        super(...arguments);
    }
}

RegistryError.errorCodes = {
    LC001: "'{0}' registry is not registered with Lyte.",
    LC002: "'{0}' - '{1}' already registered with '{1}' registry.",
    LC003: "'{0}' Component class should extend a ComponentRegistry's Component property directly or extend through base component.",
    LC004: "Registry class extended in the '{0}' '{1}' is not registered with Lyte",
    LC005: "Invalid registry instance '{0}' passed in addRegistries hook of {1}",
    LC006: "Invalid registry instance '{0}'",
    LC007: "'{0}' Registry linked recursively in the app/addon.",
    LC008: "Invalid registry instance '{0}' passed in setDefaultRegisty hook of '{1}'",
    LC009: "Default Registry not found.",
    LC010: "{0} : {1} Not found in any registry."
};

RegistryError.register();

export {ComponentError, ApiError, RegistryError};
//ignorei18n_end