"use strict";
(self["webpackChunkbirthday_reminder"] = self["webpackChunkbirthday_reminder"] || []).push([["components/javascript/welcome-comp"],{

/***/ 48468182:
/*!***********************************************!*\
  !*** ./components/javascript/welcome-comp.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WelcomeComp": () => (/* binding */ WelcomeComp)
/* harmony export */ });
/* harmony import */ var _slyte_core_src_lyte_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../../../node_modules/@slyte/core/index.js */ 93608996);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ 18578959);


var _ = {};

(0,_slyte_core_src_lyte_utils__WEBPACK_IMPORTED_MODULE_0__._defineProperty)(_, {
    "prop": function() {
        return _slyte_core_src_lyte_utils__WEBPACK_IMPORTED_MODULE_0__.prop;
    },

    "Component": function() {
        return _component__WEBPACK_IMPORTED_MODULE_1__.Component;
    }
});





class WelcomeComp extends _component__WEBPACK_IMPORTED_MODULE_1__.Component {
    constructor() {
		super();
	}

    data(arg1) {
		return Object.assign(super.data({
			"features" : (0,_slyte_core_src_lyte_utils__WEBPACK_IMPORTED_MODULE_0__.prop)("array",{
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




WelcomeComp.register("welcome-comp", {
    hash: "WelcomeComp_15",
    refHash: "C_birthday-reminder_app_0"
});


/***/ })

}]);
//# sourceMappingURL=welcome-comp.js.map