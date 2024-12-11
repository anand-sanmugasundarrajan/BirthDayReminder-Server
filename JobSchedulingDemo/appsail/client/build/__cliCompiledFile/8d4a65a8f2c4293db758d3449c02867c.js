import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "prop": function() {
        return prop;
    },

    "one": function() {
        return one;
    },

    "Schema": function() {
        return Schema;
    },

    "ViewConnector": function() {
        return ViewConnector;
    }
});

import {ViewConnector} from "/node_modules/@zoho/lyte-ui-component/data-store/connectors/view.js"
import { prop, one } from "/node_modules/@slyte/core/index.js";
import { Schema } from "/node_modules/@zoho/lyte-ui-component/data-store/db.js";

class ViewSchema extends Schema {
    static observers() {
        return {
            invokeSave : function(){
                this.$.save();
            }.observes("sortBy","sortOrder","selectedFields")
        };
    }

    props() {
        return {
            id : prop("string"),
            name : prop("string"),
            fields : prop("array"),
            selectedFields :prop("array"),
            sortBy : prop("string"),
            navigation : one("navigation"),
            sortOrder : prop("string",{pattern:/desc|asc/}),

        };
    }

    _() {
        _;
    }
}

ViewSchema.Connector = ViewConnector;

export { ViewSchema };

ViewSchema.register({
    hash: "ViewSchema_5",
    refHash: "db_lyte-ui-component_@zoho/lyte-ui-component_2"
});