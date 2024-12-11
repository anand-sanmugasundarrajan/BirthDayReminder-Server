import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Db": function() {
        return Db;
    },

    "RESTConnector": function() {
        return RESTConnector;
    },

    "RESTSerializer": function() {
        return RESTSerializer;
    }
});

import { Db,RESTConnector,RESTSerializer } from "/node_modules/@slyte/data/index.js";

class BirthdayReminderDb extends Db{
    _() {
        _;
    }
}

BirthdayReminderDb.Connector = RESTConnector;
BirthdayReminderDb.Serializer = RESTSerializer;

BirthdayReminderDb.register({
    hash: "db_birthday-reminder_app_0"
});

let Schema = BirthdayReminderDb.Schema;
export {BirthdayReminderDb,Schema};
