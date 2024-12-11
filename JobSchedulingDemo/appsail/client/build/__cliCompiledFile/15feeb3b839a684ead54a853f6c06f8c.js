import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Lyte": function() {
        return Lyte;
    },

    "BirthdayReminderDb": function() {
        return BirthdayReminderDb;
    },

    "BirthdayReminderComponentRegistry": function() {
        return BirthdayReminderComponentRegistry;
    },

    "LyteUiComponentAddon": function() {
        return LyteUiComponentAddon;
    },

    "BirthdayReminderRouter": function() {
        return BirthdayReminderRouter;
    }
});

import Turbo from "@slyte/component/src/directives/lyte-turbo";
import { Lyte } from "/node_modules/@slyte/core/index.js";
import  {BirthdayReminderDb} from "./data-store/db";
import  {BirthdayReminderComponentRegistry}  from "./components/component";
import  {BirthdayReminderRouter}  from "./router/router";
import { LyteUiComponentAddon } from "/node_modules/@zoho/lyte-ui-component/addon.js";
class BirthdayReminderApp extends Lyte{
    lookups(){
        return [LyteUiComponentAddon,{component : BirthdayReminderComponentRegistry}, {router : BirthdayReminderRouter} , {db : BirthdayReminderDb}];
    }

    _() {
        _;
    }
}
export {BirthdayReminderApp};

BirthdayReminderApp.register({
    hash: "app_1"
});

