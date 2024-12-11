import {Index as Index} from '/router/routes/index.js';
import {Birthday as Birthday} from '/router/routes/birthday.js';

import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "RouterMap": function() {
        return RouterMap;
    }
});

import { RouterMap } from "/node_modules/@slyte/router/index.js";

class BirthdayReminderMap extends RouterMap {
    map() {
        this.route("index",{
            path:'/',
            handler: Index
        })
        this.route("birthday", {
            handler: Birthday
        });
    }

    _() {
        _;
    }
}
BirthdayReminderMap.path = '../routes';
export {BirthdayReminderMap};
