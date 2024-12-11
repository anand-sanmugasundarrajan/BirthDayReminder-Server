import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "BirthdayReminderComponentRegistry": function() {
        return BirthdayReminderComponentRegistry;
    },

    "Router": function() {
        return Router;
    },

    "BirthdayReminderMap": function() {
        return BirthdayReminderMap;
    }
});

import { Router } from "/node_modules/@slyte/router/index.js";
import  {BirthdayReminderMap}  from "./maps/map";
import {BirthdayReminderComponentRegistry}  from "../components/component";
class BirthdayReminderRouter extends Router {
    constructor() {
        super(...arguments);

        this.beforeRouteNavigation = function(prev,current) { 
            
        };

        this.afterRouteNavigation = function(current) {

        };
    }

    lookups(){
		return [{component : BirthdayReminderComponentRegistry}]
	}

    getComponentRegistry() {
		return this.$component;
	}

    getConfig() {
		var config = {
			baseMap : BirthdayReminderMap	
		}
		return config;
	}

    _() {
        _;
    }
}

export {BirthdayReminderRouter} ;

