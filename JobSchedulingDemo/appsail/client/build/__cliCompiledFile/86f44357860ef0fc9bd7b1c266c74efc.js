import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Db": function() {
        return Db;
    },

    "RESTSerializer": function() {
        return RESTSerializer;
    },

    "RESTConnector": function() {
        return RESTConnector;
    }
});

import { Db } from "/node_modules/@slyte/data/index.js";
import {RESTConnector} from "/node_modules/@slyte/data/index.js"
import {RESTSerializer} from "/node_modules/@slyte/data/index.js"





class LyteUiComponentDb extends Db{
    lookups() {
        return [  ];
    }

    _() {
        _;
    }
}

LyteUiComponentDb.Connector = RESTConnector;
LyteUiComponentDb.Serializer = RESTSerializer;

LyteUiComponentDb.register({
    hash: "db_lyte-ui-component_@zoho/lyte-ui-component_2"
});

let Schema = LyteUiComponentDb.Schema;
let Connector =  LyteUiComponentDb.Connector;
let Serializer = LyteUiComponentDb.Serializer;

export {LyteUiComponentDb,Schema,Connector,Serializer}; 