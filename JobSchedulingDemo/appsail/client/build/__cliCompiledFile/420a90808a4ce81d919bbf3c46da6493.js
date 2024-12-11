
import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "prop": function() {
        return prop;
    },

    "Component": function() {
        return Component;
    }
});

import { prop } from "/node_modules/@slyte/core/index.js";
import  {Component}  from "../component";


class WelcomeComp extends Component {
    constructor() {
		super();
	}

    data(arg1) {
		return Object.assign(super.data({
			"features" : prop("array",{
				default : [
					{module : 'Router',url : 'http://lyte/2.0/doc/route/introduction'},
					{module : 'Components',url : 'http://lyte/2.0/doc/components/introduction'},
					{module : 'Data',url : 'http://lyte/2.0/doc/data/introduction'},
					{module : 'CLI',url : 'http://lyte/2.0/doc/cli/introduction'}
				]
			})
		}), arg1);
	}

    static methods(arg1) {
		return Object.assign(super.methods({
		}), arg1);
	}

    static actions(arg1) {
		return Object.assign(super.actions({
			
		}), arg1);
	}

    static observers(arg1) {
		return Object.assign(super.observers({
		}), arg1);
	}

    _() {
        _;
    }
}


WelcomeComp._template = "<template tag-name=\"welcome-comp\"> <h1>Available features of SLYTE</h1> <ul> <template items=\"{{features}}\" item=\"item\" index=\"index\" is=\"for\" _new=\"true\"><li> <a href=\"{{item.url}}\" target=\"_blank\">{{item.module}}</a> </li></template> </ul> </template>";;
WelcomeComp._dynamicNodes = [{"t":"a","p":[3,1]},{"t":"f","p":[3,1],"dN":[{"t":"a","p":[0,1]},{"t":"tX","p":[0,1,0]}]}];;
WelcomeComp._observedAttributes = ["features"];


export {WelcomeComp};

WelcomeComp.register("welcome-comp", {
    hash: "WelcomeComp_15",
    refHash: "C_birthday-reminder_app_0"
});
