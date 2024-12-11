import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "BirthdayReminderApp": function() {
        return BirthdayReminderApp;
    }
});

import {BirthdayReminderApp} from "./app.js";

var app = new BirthdayReminderApp({
    performance : true,
    debug : true
});

export {app};
