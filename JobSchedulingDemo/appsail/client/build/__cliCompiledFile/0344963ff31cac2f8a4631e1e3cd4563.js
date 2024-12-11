import { _compareObj, _dotSerperator, _normalizeMatchedObj, _normalizeTransitionParams, _strPresence } from "@slyte/router/src/router-utils";
import { Service } from '@slyte/core/src/service';

/*convert to custom class*/
class Route extends Service {
    constructor({ i, routeName, options, init})  {
		super();
		const { lyte, LR } = options;
		this.routeName = routeName;
		this.$router = LR;
		Object.defineProperties(this,{
			"navigation" : {
				get : function() {
					return LR.__lp.nav.get(this)._trans;
				}
			}, 
			"__lp" : {
				get : function() {
					return LR.__lp.nav.get(this).rOpts[i];
				},
				set : function(key, value) {
					if(key == "toBeUsed") {
						if(this.__lp.toBeUsed.length){
							var self = this;
							lyte.extendService({services : this.__lp.toBeUsed || [], type:"route", ins: this, callback : function(serv, key, aName, serName){
								var obj = {};
								obj.key = key;
								obj.service = serName;
								lyte.extendService({services : [obj], type:"route", ins: self});
							}});
						}
					}
					LR.__lp.nav.get(this).rOpts[i][key] = value;
				}
			},
			"$" : {
				get : function() {
					return LR.__lp.nav.get(this).rOpts[i].$;
				},
				set : function(key, value) {
					LR.__lp.nav.get(this).rOpts[i].$[key] = value;
				}
			},
			"currentData" : {
				get : function() {
					return LR.__lp.nav.get(this).rOpts[i].currentData;
				},
				set : function(value) {
					LR.__lp.nav.get(this).rOpts[i].currentData = value;
				}
			}
		});
		// this.parent = routes[i-1] instanceof Promise ? routes[i-1].then(function() {this.parent = routes[i-1]}.bind(this)) : routes[i-1];
		this.removeFromCache = function(arr) {
			lyte.removeFromCache.assign.call(lyte,arr);
		};
		this.replaceWith = LR.replaceWith;
		this.navigateTo = LR.navigateTo;
		this.navigateForward = LR.navigateForward;
		this.navigateBack = LR.navigateBack;
		this.refresh = function(obj) {
			var refreshFrom = _dotSerperator(this.__lp.objPath).length-1,
			trans = options.trans,
			route = Array.from(trans.matched.route),
			processed = {
				matched : trans.matched,
				R : trans.R,
				rOpts : trans.rOpts,
				transComp : {
					unRendered : route.splice(refreshFrom),
					rendered : route
				}
			};
			trans.abort({state : 308, iAbort : true});
			options.newTransInfo = {replace : true, data : trans.data, fromHistory : false, url : trans.url};
			if(obj && obj.refreshTemplate) {
				processed.refreshFrom = refreshFrom;
			}
			return options.dispatch(trans.url, processed)._trans;
		};
		this.setTitle = function(title) {
			d.title = this.title = title;
		};
		this.getQueryParams = function() {
			return this.__lp.param.queryParams;
		};
		this.getDynamicParam = function() {
			return this.__lp.param.dynamicParam;
		};
		Object.defineProperty(this,'$lg', {
			value : lyte.__gl
		});
		this.getRouteInstance = function(routeName) {
			return LR.getRouteInstance(routeName);
		};
		this.setDynamicParam = function(value) {
			if(value && this.__lp.param.dynamicParam && this.__lp.param.dynamicParam != value) {
				var dynamicParams = Array.from(options.trans.matched.dynamicParams);
				options.trans.matched.dpObj
				dynamicParams.splice(this.__lp.objPath.split(".").length-1, 1, value);
				return paramChangeTrans(options, cloneMatchedObj(options.trans.matched,{dynamicParams : dynamicParams}));
			}
			return options.trans._trans;
		};

		this.setQueryParams = function(key,value,opts)  {
			var obj = {},
			refresh;
			if(typeof key == "object") {
				obj = key;
				opts = value;
			} else {
				obj[key] = value;
			}
			if(typeof opts == "object") {
				refresh = opts.refresh;
			}
			refresh = opts;
			var matched = cloneMatchedObj(options.trans.matched,{queryParams : Object.assign({},options.trans.matched.queryParams,obj)});
			if(!_compareObj(options.trans.matched.queryParams,matched.queryParams)) {
				matched.refreshData = matched.refreshData == undefined ? refresh : matched.refreshData;
				return paramChangeTrans(options, matched);
			}
			return options.trans._trans;
		};
		//give support for remove query params
		this.throwEvent = typeof lyte.$.component !== "undefined" && lyte.$.component.throwEvent;
		init(this)
		if(this.init) {this.init();}
	}
}

Route.__lMod = "Route";

function paramChangeTrans(options, matched) {
	var url = options.constructURLFromRoute(matched),
	processed = {
		matched : matched,
		R : options.trans.R,
		rOpts : options.trans.rOpts
	};
	options.newTransInfo = {
		data: options.trans.data,
		url: url,
		fromHistory: false
	};
	options.dispatch(url, options.decideTransition(processed));
	return options.newTrans._trans;
}

function cloneMatchedObj(matched, data) {
	var obj = Object.assign({}, matched);
	obj.route = data.route || Array.from(matched.route)
	obj.dynamicParams = data.dynamicParams || Array.from(matched.dynamicParams)
	obj.queryParams = data.queryParams || Object.assign({}, matched.queryParams)
	delete obj.refreshRoute;
	delete obj.refreshData;
	return obj;
	// var obj = Object.assign({},matched);
	// obj.route = data.route || Array.from(matched.route);
	// obj.dynamicParams = data.dynamicParams || Array.from(matched.dynamicParams);
	// obj.queryParams = data.queryParams || Object.assign({},matched.queryParams);
	// return obj;
}

export { Route };

// src = prevInstance || this.constructor,
// routePredefined = options.routePredefined;
// for(var key in src) {
// 	if(_strPresence(routePredefined,key)) {
// 		this.#__lp__.fns[key] = src[key];
// 	} else if(key == "actions") {
// 		if(typeof ins.constructor.actions == "function") {
// 			ins.actions = ins.constructor.actions();
// 		}
// 		options.fns.actions = RouteClass.actions && RouteClass.actions() || {};
// 	} 
// else if(prevInstance) {
// 	if(key != "__lp") {
// 		this[key] = src[key]; // need to remove this;
// 	}
// } 
// }
// routePredefined.forEach(function(key) {
// 	if(key == "actions") {
// 		if(typeof ins.constructor.actions == "function") {
// 			ins.actions = ins.constructor.actions();
// 		}

// 		options.fns.actions = RouteClass.actions && RouteClass.actions() || {};
// 	} else {
// 		options.fns[key] = RouteClass.prototype[key]
// 	}
// 	delete RouteClass.prototype[key];
// });

// for(var key in src) {
// 	if(prevInstance || !_strPresence(routePredefined,key)) {
// 		if(key != "__lp") {
// 			this[key] = src[key];
// 		}
// 	} 
// }

// [beforeFetch,fetch,afterFetch].forEach(function(key) {
// 	Object.defineProperties(this.$, {
// 		[key] : {
// 			get : function() {
// 				return this.__lt.rOpts[i].$[key];
// 			},
// 			set : function() {
// 				this.__lt.rOpts[i].$[key] = value;
// 			}
// 		}
// 	})
// })
// this.__lp = deepCopyObject(prevInstance && prevInstance.__lp || routeOptions);
// this.__lp = deepCopyObject((prevInstance && prevInstance.__lp) || RouteClass.__lp); make only one instance
// delete this.__lt.rendered;
// this.transition = this.navigation = options.newTrans._trans;
// if(processed.transComp && !processed.transComp.rendered[i] && processed.transComp.redirected) {
// 	if(processed.transComp.redirected.i < i) {
// 		delete this.__lp.loadDependencies;
// 		delete this.__lp.loadResources;
// 		this.$ = {};
// 		delete this.currentModel;
// 	} else if(processed.transComp.redirected.i != i) {
// 		delete this.__lp.stencils;
// 	}
// } else {
// 	delete this.__lp.stencils;
// }
// this.__lp.param = {
// 	queryParams :{},
// 	dynamicParam : undefined
// }
// this.__lp.queryParams = {};