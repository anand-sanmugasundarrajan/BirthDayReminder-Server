import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Schema": function() {
        return Schema;
    },

    "prop": function() {
        return prop;
    },

    "one": function() {
        return one;
    }
});

import { prop, one } from "/node_modules/@slyte/core/index.js";
import { Schema } from "/node_modules/@zoho/lyte-ui-component/data-store/db.js";

class NavigationSchema extends Schema {
    props() {
        return {
            "id" : prop("string"),
            "range" : prop("array",{default:[25,50,75,100,200,300,400,500]}),
            "type" : prop("string",{default:"select",pattern:/select|range|input/}),
            "paginationAt" : prop("array",{default:["top","bottom"]}),
            "perPage" : prop("number",{default:25}),
            "view" : one("view")
        };
    }



    _() {
        _;
    }
}

export { NavigationSchema };

NavigationSchema.register({
    hash: "NavigationSchema_4",
    refHash: "db_lyte-ui-component_@zoho/lyte-ui-component_2"
});