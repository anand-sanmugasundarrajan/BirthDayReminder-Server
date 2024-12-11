import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "ComponentRegistry": function() {
        return ComponentRegistry;
    }
});

import { ComponentRegistry } from "/node_modules/@slyte/component/index.js";



class LyteUiComponentComponentRegistry extends ComponentRegistry{
    constructor(){
        super();
    }
    lookups(){
        return [];
    }

    _() {
        _;
    }
}

LyteUiComponentComponentRegistry.register({
    hash: "C_lyte-ui-component_@zoho/lyte-ui-component_2",
    refHash: "@zoho/lyte-ui-component_3"
});

class Component extends LyteUiComponentComponentRegistry.Component {
    lookups(){
        return [   {component : LyteUiComponentComponentRegistry} ];
    }

    _() {
        _;
    }
}

export {LyteUiComponentComponentRegistry,Component}; 
