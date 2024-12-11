import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Route": function() {
        return Route;
    }
});

import { Route } from "/node_modules/@slyte/router/index.js";
let WelcomeComp, BirthdayReminder;

class Index extends Route {
    render() {
		return {outlet : "#outlet",component : BirthdayReminder}
	}

    static actions(arg1) {
		return Object.assign(super.actions({
			
		}), arg1);
	}

    _() {
        _;
    }

    getRequirements() {
        arguments[1].push(import(/* webpackChunkName: "components/javascript/welcome-comp" */
        "../../components/javascript/welcome-comp").then(function(res) {
            WelcomeComp = res.WelcomeComp;
        }));

        arguments[1].push(import(/* webpackChunkName: "components/javascript/birthday-reminder" */
        "../../components/javascript/birthday-reminder").then(function(res) {
            BirthdayReminder = res.BirthdayReminder;
        }));
    }
}

Index.routePath = "index";

export {Index};

