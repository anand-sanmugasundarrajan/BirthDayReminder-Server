import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "ComponentRegistry": function() {
        return ComponentRegistry;
    }
});

import { ComponentRegistry } from "/node_modules/@slyte/component/index.js";

class BirthdayReminderComponentRegistry extends ComponentRegistry{
    constructor(){
        super();
    }
    lookups(){
        return [];
    }
    addRegistries() {
        return [this.$app.$lyteUiComponentAddon.$component];
    }

    _() {
        _;
    }
}

BirthdayReminderComponentRegistry.register({
    hash: "C_birthday-reminder_app_0",
    refHash: "app_1",
    app: true
});

class Component extends BirthdayReminderComponentRegistry.Component {
    lookups() {
        return [{component : BirthdayReminderComponentRegistry}]
    }

    _() {
        _;
    }
}
export {BirthdayReminderComponentRegistry,Component}; 

