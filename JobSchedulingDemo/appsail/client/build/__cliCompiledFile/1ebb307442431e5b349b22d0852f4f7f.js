import { Lyte } from '@slyte/core';
import { deepCopyObject } from '@slyte/core/src/lyte-utils';
import { Service } from '@slyte/core/src/service';
import { linkToRegistration } from './go-to';
import { History } from './history';
import { _parseRouteMap, _traverseMap } from './map-parser';
import { RouterError } from './router-errors';
import { _dotSerperator, scriptExecution, _strPresence, _getObj, _delimit, _splitPath, _getRouteFromAlias, _compareObj, _wildcardRouteCheck, _dynamicRouteCheck, _frameQueryParams, _frameDynamicParams, _normalizeTransitionParams, _validateURL, _checkIfSameRoute} from './router-utils';

/*-----------string declaration starts------------*/
const routeStr = "route",
RouteStr = "Route",
fetchStr = "fetch",
FetchStr = "Fetch",
forceFetchStr = "force" + FetchStr,
NavigationStr = "Navigation",
NavigateStr = "Navigate",
pendingStr = "pending",
completedStr = "completed",
abortedStr = "aborted",
beforeStr = "before",
afterStr = "after",
didStr = "did",
willStr = "will",
nestedForcedPromisesStr = "nestedForcedPromises",
constructRunLoopStr = "constructRunLoop",
getRequirementsStr = "getRequirements",
divertStr = "divert",
renderStr = "render",
onErrorStr = "onError",
beforeLoadStr = "beforeLoad",
onBeforeLoadStr = "onBeforeLoad",
LINKTOStr = "LINK-TO",
stateChangeStr = "stateChange",
DestroyStr = "Destroy",
RouteNavigationStr = "Route" + NavigateStr,
afterRenderStr = afterStr + "Render",
beforeExitStr = beforeStr + "Exit",
didDestroyStr = didStr + DestroyStr,
pRoute = "lt-prop-" + routeStr,
NavigationAbortedStr = NavigationStr+" "+abortedStr + ".",
NavigationResumedStr = NavigationStr + " resumed.",
NavigationPausedStr = NavigationStr + " paused.",
NavigationComletedStr = NavigationStr+" "+completedStr + ".",
beforeFetchStr = beforeStr + FetchStr,
afterFetchStr = afterStr + FetchStr,
willNavigateStr = willStr + NavigateStr,
didNavigateStr = didStr + NavigateStr,
beforeRouteNavigationStr = beforeStr+RouteStr + NavigationStr,
afterRouteNavigationStr = afterStr+RouteStr + NavigationStr,
beforeTemplateDestroyStr = beforeStr+"Template" + DestroyStr,
renderLoadingTemplateStr = "renderLoadingTemplate",
renderTemplateWarning = renderStr+" hook should return either component or HTML. Rendering of HTML directly into the DOM within the "+renderStr + " hook is deprecated.",
__routeProm__Str = "__routeProm__",
/*-----------string declaration ends------------*/
fontColor = "MediumOrchid",
dloc = document.location,
resolvedPromise = Promise.resolve(),
emptyFn = function() {};

function getHook(routeInstance, hook) {
	return routeInstance.__lp.fns[hook]
}

function getAction(routeInstance, action) {
	return routeInstance.__lp.fns.actions && routeInstance.__lp.fns.actions[action]
}

/*convert to custom class*/
class Router extends Service {
    constructor(a) {
        super(a)

        this.__lp = {
            version : "1.0.0-beta.4",
            pendingReg : [],
            mountedApps : {},
            config : {},
            nav : new WeakMap()
        };

        this.checkIfSameRoute = _checkIfSameRoute;
        var newTransInfo,
		newTransInfoClone,
		newTransInfoTimer,
		lHistory,
		config = {
			historyType : false,
			baseURL : "",
			deferInit : false,
			preserveUrlOnBrowserNavigation : false,
			queryParamOptions : { cache : true},
			routeHash : {},
			urlCache : {},
			aliasRouteMap : {},
			routeAliasMap : {},
			cacheRoutes : {},
			allLinks : {},
			activeLinkTags : []
		},
		trans,
		prevTrans,
		newTrans,
		visibleTrans,
		historyObj,
		initialLoad = true,
		fromHistoryGo = false,
		processedDispatch;

        const run = {},
		lyte = this.$app,
		LR = this;

        lyte.extendEventListeners(this);

        run[getRequirementsStr] = function(hook,index) {
			const r = this.routes[index],
			res = r.__lp.loadResources =  [],
			dep = r.__lp.loadDependencies = [],
			callback = r.__lp.fns[hook];
			if(callback) {
				callHookWithoutPromise.call(this,callback,hook,index,[r.__lp.param, res, dep]);
			} 
			r.__lp.req = {
				resources : r.__lp.loadResources = Promise.all(res).then(function() {
					r.__lp.resourcesLoaded = true
				}),
				dependencies : r.__lp.loadDependencies = Promise.all(dep).then(function() {
					r.__lp.dependenciesLoaded = true	
				})
			}
			return resolvedPromise;
		}

        run[beforeFetchStr] = 
		run[fetchStr] = 
		run[afterFetchStr] = function(hook,index) {
			var routeInstance = this.routes[index],
			args = [getHook(routeInstance, hook),routeInstance];
			args.push(hook == afterFetchStr ? [routeInstance.currentData, routeInstance.__lp.param] : [routeInstance.__lp.param]);
			return callHookWithPromise.apply(this,args).then(setDataIn$,setDataIn$);
			function setDataIn$(data) {
				routeInstance.$[hook] = data;
				if(hook == fetchStr) {
					routeInstance.currentData = data;
				}
			}
		};

        run[divertStr] = function(hook,index) {
			var routeInstance = this.routes[index];
			return callHookWithPromise.apply(this,[getHook(routeInstance,hook),routeInstance,[routeInstance.currentData, routeInstance.__lp.param]]);
		};

        run[onErrorStr] = function(hook,index,err,state,options) {
			setPendingResume.call(trans,trans.prom);
			trans._trans.triggerEvent(onErrorStr,{error : err,hook : hook});
			var errIns = this.routes[index];
			for(; index >= 0 && !this.aborted && this.paused; index--) {
				var instance = this.routes[index];
				lyte.log(onErrorStr+" of "+ instance.routeName,routeStr,fontColor);
				if(callAction.call(this,onErrorStr,index,[err,this._trans, instance.__lp.param, hook]) == false) {
					break;
				}  
			}
			if(!options || !options.consoled) {
				_consoleErrorFromCallback(err,hook,errIns.routeName,state,options);
			}
		};

        run[willNavigateStr] = function(hook,index) {
			if(callAction.call(prevTrans,hook,index,[trans._trans]) == false) {
				removeHook(trans.runLoop.previous,hook);
			}
			return resolvedPromise;
		};

        run[beforeRouteNavigationStr] = function() {
			if(validateTransition(this)) {
				var pt;
				if(pt = prevTrans && prevTrans._trans) {
					delete pt.abort;
					delete pt.pause;
				}
				var obj = {
					prevNav : pt,
					nav : trans._trans,
					location : {fromHistory : (initialLoad ? "reload" : (newTrans && newTrans.navigationType ? false : true)), initial : initialLoad}
				}
				var callback = LR[beforeRouteNavigationStr]
				callback && callback.call(LR, obj.prevNav, obj.nav , obj.location);
				triggerEventOnInsAndClass(beforeRouteNavigationStr, obj)
			}
			return resolvedPromise;	
		};

        function triggerEventOnInsAndClass(ev,args) {
			trans._trans.triggerEvent(ev,args);
			LR.triggerEvent(ev, args);
			lyte.triggerEvent(ev, args);
		}

        run[afterRouteNavigationStr] = function(_trans) {
			var callback = LR[afterRouteNavigationStr];
			callback && callback.call(LR, _trans);
			triggerEventOnInsAndClass(afterRouteNavigationStr, {nav : _trans})
		};

        run[beforeLoadStr] = function(hook,index) {
			var routeProp = this.routes[index].__lp;
			if(routeProp.fns[hook]) {
				lyte.log(beforeLoadStr +' callback is depricated. Use renderLoadingTemplate callback');
			}
			callHookWithoutPromise.call(this,routeProp.fns[hook],hook,index,[routeProp.param]);
			return resolvedPromise;
		};

        run[onBeforeLoadStr] = function() {
			return new Promise(function(resolve,reject) {
				for(var len = trans.matched.route.length, i=1; i <= len && validateTransition(trans); i++) {
					var l = len-i,
					// actions,
					routeInstance = trans.routes[l];
					// if((actions = routeInstance.__lp.fns.actions) && actions.onBeforeLoad) {
					// 	// lyte.log(onBeforeLoadStr +' action is depricated. Use beforeLoad callback');
					// }
					if(!(routeInstance instanceof Promise) && trans.onLoadCalled.indexOf(l) == -1) {
						trans.onLoadCalled.push(l)
						if((callAction.call(trans,onBeforeLoadStr,l,[routeInstance.__lp.param]) == false) || (trans.onLoadCalled.length == len) || (i == len)) {
							resolve();
							break;
						}
					} else if(i == len){resolve();}
				}
			});
		};

        run[afterRenderStr] =
		run[didNavigateStr] = function(hook,index) {
			return new Promise(function(resolve, reject) {
				var routeInstance = this.routes[index],
				st = setTimeout(function() {
					if(hook == afterRenderStr) {
						this.rOpts[index].rendered = true;
						callHookWithPromise.call(this,getHook(routeInstance, hook),routeInstance,[routeInstance.currentData,routeInstance.__lp.param,routeInstance.component]).then(function(data) {
							if(!trans.routes[index+1]) {
								trans._trans.triggerEvent(afterRenderStr);
							}
							resolve(data);
						}, function(data) {
							reject(data);
						});
					} else {
						run.removeTemplate.call(this);
						if(callAction.call(this,hook,index,[routeInstance.__lp.param, trans._trans]) == false) {
							removeHook(trans.runLoop.current,hook);
							index = 0;
						}
						setVisibleTrans.call(this)
						resolve();
						lyte.time(this.prom.hook + this.prom.index);
						if(index == 0) {
							transitionCompleted({state : 200});
						}
					}
				}.bind(this,hook,index),0);
				this.fns.push(st);          
			}.bind(this));
		};

        run[beforeExitStr] = function(hook,index) {
			var prevTransRouteInstance = prevTrans.routes[index];
			return callHookWithPromise.call(this,prevTransRouteInstance.__lp.fns[hook],prevTransRouteInstance,[prevTransRouteInstance.currentData, prevTransRouteInstance.__lp.param]);
		};

        // run.getMountApp = function(hook,index) {
        // 	var ins = trans.routes[index];
        // 	var prom = callHookWithPromise.call(this,ins.__lp.fns[hook],ins,[ins.__lp.param]).then(function(resp) {
        // 		resp.$.mountedTo = {path : LR.getURL(ins.__lp.objPath), app : lyte};
        // 		LR.__lp.mountedApps[ins.__lp.objPath] = resp;
        // 	});
        // 	return prom
        // };

        run[renderLoadingTemplateStr] = function(hook, index) {
			var route = this.routes[index],
  			loadingTemplate = callHookWithoutPromise.call(this,route.__lp.fns[hook],hook,index,[route.__lp.param]),
			outlet;
			// routeProp.stencils = loadingTemplate || {};
			if(loadingTemplate && loadingTemplate.outlet && (outlet = getOutlet(loadingTemplate.outlet,route.parent))) {
				if(outlet.childNodes[0]) {
					triggerTemplateDestroy({outlet,route},false);
				}
				route.outlet = outlet;
				if(loadingTemplate.component) {
					renderComp(outlet, loadingTemplate.component, {data : loadingTemplate.data , ins : route, hook,index , registry : loadingTemplate.registry || LR.__lp.config.registry})
				} else if(loadingTemplate.html) {
					renderHTML(outlet, loadingTemplate.html)
				}
			}
			return resolvedPromise;
		};

        run[renderStr] = function(hook,index) {
			var routeInstance = this.routes[index],
			callback = routeInstance.__lp.fns[hook] || routeInstance.__lp.fns.renderTemplate;
			if(callback) {
				run.removeTemplate.call(this);
				setVisibleTrans.call(this)
				// if(routeInstance.outlet) {
				// 	routeInstance.outlet.innerHTML = "";
				// }
				var renderTemplate = callHookWithoutPromise.call(
                    this,
                    callback,
                    hook,
                    index,
                    [routeInstance.currentData, routeInstance.__lp.param]
                ),
				outlet;
				if(validateTransition(this)) {
					if(renderTemplate && (routeInstance.outletName = outlet = (renderTemplate.outlet || routeInstance.outlet))) {
						var data = routeInstance.currentData;
						if(routeInstance.outlet = outlet = getOutlet(renderTemplate.outlet,routeInstance.parent)) {
							var  obj = {
								outlet : renderTemplate.outlet,
								route : routeInstance
							};
							if(renderTemplate.component) {
								if(routeInstance.component && !renderTemplate.reRender && (routeInstance.component.localName == renderTemplate.component._compName) && routeInstance.outlet == outlet && outlet.contains(routeInstance.component)) {
									// componentDataCheck.call(this,data,routeInstance,hook,index);
									routeInstance.component.setData(data)
								} else {
									triggerTemplateDestroy(obj,false);
									routeInstance.component = renderComp(outlet, renderTemplate.component,{data, ins : routeInstance , hook,index , registry : renderTemplate.registry || LR.__lp.config.registry})
								}
							} else if(renderTemplate.html) {
								routeInstance.component = undefined;
								triggerTemplateDestroy(obj,false);
								renderHTML(outlet, renderTemplate.html)
							}
						} else {
							RouterError.error(428,renderTemplate.outlet);
						}
					} else {
						lyte.warn(renderTemplateWarning);
					}
				}  
			} else if(validateTransition(this) && this.runLoop.templateToRemove && this.routes.length == index+1) {
				run.removeTemplate.call(this);
			}
			return resolvedPromise;
		};

        // function componentDataCheck(data,routeInstance,hook,index) {
        // 	if(data) {
        // 		if(typeof data != "object" && Array.isArray(data)) {
        // 			processError.call(this,{stopTrans : true, err :Error(RouterError.getErrorMessage(203)).stack,instance :routeInstance,hook : hook,index : index});
        // 		}   
        // 	}
        // }

        function renderHTML(outlet, html) {
			outlet.innerHTML = html;
			var scripts = outlet.getElementsByTagName('script');
			if(scripts.length) {
				scriptExecution(Array.from(scripts),outlet);
			}
		}

        function renderComp(outlet, component, {data, ins, hook,index, registry }) {
			if(typeof component == "string") {
				console.error("Component name cannot be string");
				return;
			}
			// componentDataCheck.call(this,data,ins,hook,index);
			var compIns = component._render({
				outlet : outlet,
				data : data,
				options : {clearOutlet : true},
				registryInstance : registry,
				_route : ins.__lp.objPath
			})
			return compIns;
		}

        function getOutlet(outlet,parent) {
			var _outlet;
			if(parent) {
				_outlet =  parent.outlet ? parent.outlet.querySelector(outlet) : undefined;
				if(!_outlet) {
					return getOutlet(outlet,parent.parent);
				}
			} else if(!(_outlet = document.querySelector(outlet))) {
				return false;
			}
			return _outlet;
		}

        run.removeTemplate = function() {
			var arr = this.runLoop.templateToRemove;
			if(!this.cleared) {
				if(prevTrans && arr) {
					templateDelete.call(visibleTrans,arr);
				}
				this.cleared = true;
				delete this.runLoop.templateToRemove;
				lyte.removeFromCache();
			}
		};

        function setVisibleTrans() {
			if(visibleTrans != this) {
				visibleTrans = this;
				if(prevTrans != LR.__lp.visibleTrans) {
					removeNavWeakMap(LR.__lp.visibleTrans,this)
				}
				LR.__lp.visibleTrans = visibleTrans;
			}
		}

        function validateTransition(trans) {
			return !trans.aborted && !trans.paused;
		}

        function addToHistory(obj) {
			var type = obj.replace ? "replaceState" : "pushState";
			obj.title = obj.title || document.title;
			/* support for windows, undefined is appended to url */
			var args = [obj.data, obj.title]
			args.push(config.historyType ? _delimit(shiftBaseURL(obj.url, true)) : '#' + (config.slashAfterHash ? _delimit(obj.url) : (obj.url[0] == "/" && obj.url.length > 1 ? obj.url.substring(1,obj.url.length) : obj.url)));
			args.push(obj.meta);
			LR.location = lHistory[type].apply(lHistory,args);
			if(trans) {
				trans.location = LR.location
			}
		}

        this.getRouteDefinition = function(arr,def) {
			if(arr == "*" || !arr) {
				return config.routes;
			} else {
			def = def || config.routes;
			def = _getObj(arr,def);
				return def && def.__lp && def.__lp.handler || undefined;  
			}
		}

        this.setConfig = function(defConfig) {
			for(var key in defConfig) {
				if(key == "queryParamOptions") {
					config.queryParamOptions.cache = defConfig.queryParamOptions.cache;
				} else if(key == "historyType"){
					config[key] = defConfig[key] == "html5";
				} else if(key == "history"){
					config.historyType = defConfig.history == "html5";
				} else {
					config[key] = defConfig[key];
				}
			}
			this.__lp.config = config;
		}
        this.setConfig(this.getConfig && this.getConfig());
        this.__lp.config.registry = this.getComponentRegistry && this.getComponentRegistry();

        configureRoutes.call(this,this.__lp.config && this.__lp.config.baseMap && this.__lp.config.baseMap);

        function configureRoutes(baseMap) {
			_parseRouteMap.call(this,baseMap, {lyte, config, initialRegisterRoute });
			for(var i = 0,l = this.__lp.pendingReg.length; i < l; i++) {
				registerRoute.apply({},this.__lp.pendingReg[i]);
			}
			this.__lp.pendingReg = [];
			this.__lp.routesConfigured = true;
		}

        function init () {
			if(!config.deferInit && !LR.__lp.initCalled) {
				if(lyte.$.isApp) {
					LR.init();
				} else {
					setTimeout(function() {
						LR.init();
					},0)
				}
			} else {
				return;
			}
		}

        this.init = function(r) {
			if(!this.__lp.initCalled) {
				this.__lp.initCalled = true;
			} else {
				return;
			}
			if(this.onInit) { this.onInit();}
			lHistory = new History({
				historyType : LR.__lp.config.historyType ? "html5" : "hash",
				popState : popState
			}) 
			this.history = lHistory.__lh.exp;
			this.pushData = function(data,title,url) {
				lHistory.pushState(data,title,url,lHistory.getMeta());
			}
			this.replaceData = function(data,title,url) {
				lHistory.replaceState(data,title,url,lHistory.getMeta());
			}
			this.navigateBack = function(value) {
				if(!value) {
					lHistory.back.call(history);
				} else {
					lHistory.go.call(history,value);
				}
			}
			this.navigateForward = function(value) {
				if(!value) {
					lHistory.forward.call(history);
				} else {
					lHistory.go.call(history,value);
				}

			}
			this.scrollRestoration = lHistory.scrollRestoration;
			function popState(onChangeEvent) {
				var goValue,
				meta,
				url = getUrlFromMeta(onChangeEvent);
				historyObj = {
					fromHistory : true,
					url : url
				};
				if(onChangeEvent && lHistory.getData()) {
					historyObj.data = lHistory.getData();
				}
				if(config.preserveUrlOnBrowserNavigation) {
					if(fromHistoryGo) {
						fromHistoryGo = false;
						return;
					}
					if(lHistory && prevTrans && (meta = lHistory.getMeta()) && (lHistory.__lh.currentMeta.__lh.index !=  meta.__lh.index)) {
						fromHistoryGo = true
						goValue = lHistory.__lh.currentMeta.__lh.index - meta.__lh.index;
						history.go(goValue);
					}
					// if(lHistory && prevTrans && (meta = lHistory.getMeta()) && (prevTrans.history.index !=  meta.__lh.index)) {
					// 	fromHistoryGo = true
					// 	// goValue = prevTrans.history._meta.__lh.index - meta.__lh.index;
					// 	goValue = trans.history.__lh.prevMeta.__lh.index - meta.__lh.index;
					// 	history.go(goValue);
					// }
				}
				historyObj.goValue = goValue;
				if(trans && !trans.aborted) {
					trans.abort({state : 308, iAbort : true});
			   	}
				dispatch(url);
			}
			if(lyte.$.isApp) {
				if(config.historyType) {
					popState();
				} else {
					historyObj = {
						fromHistory : true,
						url : getLocation()
					};
					dispatch(historyObj.url);
				}
				linkToRegistration(lyte,this,config);
			}
			return this;
		};

        function getUrlFromMeta(onChangeEvent) {
			var url;
			if(!(lHistory.getMeta() && (url = lHistory.getMeta().url))) {
				if(config.historyType) {
					url = getLocation();
				} else {
					var newURL = onChangeEvent && onChangeEvent.newURL || dloc.hash;
					url = checkForEmptyPath(newURL.replace(/.*#/, ''));
				}  
			}
			return url;
		}

        function setRouteDef(dir, {RouteClass, options}) {
			var cache = config.routes,
			len = dir.length,
			dirLen = len - 1;
			for(var i = 0, key; i < len; i++) {
				key = dir[i];
				if (dirLen === i) {
					var obj = cache[key];
					if (obj && obj.__lp) {
						obj.__lp.handler = RouteClass;
						obj.__lp.options = options
					} else if (obj) {
						obj.__lp = { class : RouteClass, options };
					} else {
						cache[key] = { __lp: { class : RouteClass,  options } };
					}
				} else if (!cache[key]) {
					cache[key] = {};
				}
				cache = cache[key];
			}
		}

        function convertMatchedObjToRouteInfo(matched) {
			var info = {
				route : matched.route.join("."),
				fragment : matched.fragment,
				dynamicParams : matched.dynamicParams.filter(_arrayClean),
				queryParams : matched.queryParams

			};
			return info;
		}

        function _arrayClean(e) {
			return e != undefined;
		}

        this.replaceWith = function() {
			return routeTransition.call(this,_normalizeTransitionParams.apply(this,arguments), true);   
		};

        this.navigateTo = function() {
			return routeTransition.call(this,_normalizeTransitionParams.apply(this,arguments));  
		};

        /**
		 * @functionType getURL 
		 *  To get url for a route
		 * @author authorName
		 * @version 1.0.0
		 * @params {string} routeName
		 * @params {options} options
		 * @params {function} nestedRoute 
		 * @returns
		 */
        this.getURL = function(matched) {
			if(matched) {
				if(!matched.route) {
					matched = _normalizeTransitionParams.apply(this,arguments)
				} else if(!matched.queryParams) {
					matched.queryParams = {}
				}
				var url,
				l,
				linkTo = this.tagName == LINKTOStr,
				cache = config.urlCache,
				matchedCache,
				sticky = config.queryParamOptions.cache;
				if(!sticky && (matchedCache = cache[Array.isArray(matched.route) ? matched.route.join('.') : matched.route])) {
					url = matchedCache.url;
					if(l = matched.dynamicParams && matched.dynamicParams.length) {
						for(var i = 0; i < l; i++) {
							url = url.replace('<<dp>>',matched.dynamicParams[i]);	
						}
					} else if(url.indexOf('<<dp>>') != -1) {
						RouterError.error(linkTo ? "499A" : 499,matched.route,linkTo ? this : undefined);
					}
					if(!matched.queryParams) {matched.queryParams = {}}
					for(var key in matchedCache.defQP) {
						if(!matched.queryParams[key] && matchedCache.defQP[key]) {
							matched.queryParams[key] = matchedCache.defQP[key];
						}
					}
					url = appendQueryParamsAndFrag(url,matched);
				} else {
					if(linkTo) {
						url = constructURLFromRoute.apply(this,arguments);
					} else {
						url = constructURLFromRoute.call(this,matched);
					}
				}
				if(url) {
					url = config.historyType ? shiftBaseURL(url, true) : '#'+url;
					return url;
				}
			}
		};

        this.getRoute = function(url) {
			var matched = traverse(shiftBaseURL(url),true);
			if(matched && !matched.error) {
				if(config.routeAliasMap[matched.route]) {
					matched.alias = config.routeAliasMap[matched.route];
				}
				matched.dynamicParams = matched.dynamicParams.filter(_arrayClean);
				matched.route = matched.route.join('.');
				return matched;  
			}
		};

        function routeTransition(args, replace ) {
			var processed = normalizeMatchedObj.call(this,args);
			if(processed.error) {
				if(trans.running) {
					trans.pause();
					run[onErrorStr].call(trans,trans.prom.hook,trans.prom.index,processed.error,"420A",{ consoled : true});
				}
				return;
			}
			if(replace) {
				processed.matched.replace = true;
			}
			if(!LR.__lp.initCalled) {
				RouterError.error(405);
				return 
			}
			var matched = processed.matched,
			currRoute;
			processed.currRoute = currRoute = matched.route.join('.');
			matched.refreshRoute && currRoute == prevTrans.info.route;
			routeOptions.newTransInfo = newTransInfo = {
				replace : matched.replace || (matched.refreshRoute && LR.checkIfSameRoute(convertMatchedObjToRouteInfo(processed.matched),convertMatchedObjToRouteInfo(prevTrans.matched)) ? true :  matched.replace),
				title : trans ? trans.title : document.title,
				fromHistory : false
			};
			var url = dispatchTransition(processed);
			if(url && newTrans) {
				newTrans.navigationType = replace ? "replaceState" : "pushState";
				lyte.log(NavigateStr+' to '+currRoute+' '+url,routeStr);
				return newTrans._trans;  
			} else {
				lyte.log(NavigateStr+' failed')
				return {};
			}
		}

        function getLocation(obj) {
			if(config.historyType) {
				var path = checkForEmptyPath(dloc.pathname + dloc.search + (dloc.hash || ""));
				path = shiftBaseURL(path);
				return _delimit(path);  
			} else if(obj && obj.withHash)	{
				return _delimit(checkForEmptyPath(dloc.hash));
			} else {
				return _delimit(checkForEmptyPath(dloc.hash.replace('#','')));
			}
		}

        function checkForEmptyPath(path) {
			if(!path) {
				path = '/'
			}
			return path;
		}

        function shiftBaseURL(path,append) {
			var baseURL;
			if((baseURL = config.baseURL) && path) {
			baseURL = _delimit(baseURL);
			if(path.indexOf(baseURL) == 0 && !append) {
				return path.replace(baseURL,'');
			} else if(append && path.indexOf(baseURL) != 0) {
				return baseURL+path;
			} 
			} 
			return path;
		}

        function constructURLFromRoute(matched) {
			if(matched && matched.route) {
				var strRoute;
				if(!Array.isArray(matched.route)) {
					matched.route = _dotSerperator(strRoute = matched.route);
				} else {
					strRoute = matched.route.join('.')
				}
				matched.queryParams = matched.queryParams || {};
				matched.dynamicParams = matched.dynamicParams || [];
				matched.refreshData = false;
				var url,
				sameRoute = !!trans,
				dynamicPos = matched.dynamicParams.length != matched.route.length,
				dynamicParamPos = 0,
				linkTo = this && this.tagName == LINKTOStr,
				routeObj = config.routes,
				templateUrl = url = '',
				defQPTemp = {},
				route;
				for(var i = 0, l = matched.route.length; i < l; i++) {
					route = matched.route[i];
					if(sameRoute && trans.matched.route[i] != route) {
						sameRoute = false;
					}
					routeObj = _getObj(route,routeObj);
					if(!(routeObj && routeObj.__lp && routeObj.__lp.path)) {
						RouterError.error(422,matched.route,i);
						return false;
					}
					var def = routeObj.__lp.handler && routeObj.__lp.handler.name != __routeProm__Str ? routeObj.__lp.handler : undefined,
					rOpts = routeObj.__lp.options;
					// if(!def && !linkTo) {
					// 	_consoleError.call(lyte,422,matched.route,i);
					// }
					var path = routeObj.__lp.path,
					defaultQP;
					if(!def) {
						if(defaultQP = routeObj.__lp.defQP) {
						for(var key in defaultQP) {
							if(matched.queryParams && !matched.queryParams.hasOwnProperty(key)) {
								defQPTemp[key] = matched.queryParams[key] = defaultQP[key];
							} else {
								defQPTemp[key] = defaultQP[key];
							} 
						}
						}
					} else if(def.queryParams) {
						defaultQP = routeObj.__lp.defQP;
						var qpdef = rOpts.qpdef;
						for(var key in qpdef) {
							if(!matched.queryParams.hasOwnProperty(key)) {
								if(sameRoute && qpdef[key].cache) {
									matched.queryParams[key] = trans.rOpts[i].param.queryParams[key];
								} else if(defaultQP && defaultQP.hasOwnProperty(key)) {
									defQPTemp[key] = matched.queryParams[key] = defaultQP[key];
								}
							}
							if(!linkTo && !matched.refreshData && qpdef[key].refreshData) {
								matched.refreshData = true;
							}
						}
					}
					if(routeObj.__lp.dkey) {
						var dynamicPathSplit = _splitPath(path),
						dynamicPathSplitTemp = _splitPath(path),
						pos = dynamicPos ? dynamicParamPos : i;
						if(!matched.dynamicParams || !matched.dynamicParams[pos]) {
							RouterError.error(linkTo ? "499A" : 499,route,linkTo ? this : undefined);
						return false;   
						} else {
							dynamicPathSplit[routeObj.__lp.dIndex] = encodeURI(matched.dynamicParams[pos]);
							dynamicPathSplitTemp[routeObj.__lp.dIndex] = _delimit('<<dp>>');
							templateUrl += _delimit(dynamicPathSplitTemp.join('/')); 
							url += _delimit(dynamicPathSplit.join('/')); 
							dynamicParamPos++;
						} 
					} else {
						templateUrl += _delimit(path);
						url += _delimit(path);
					}
				}
				if(!config.cacheRoutes[strRoute]) {
					config.urlCache[strRoute] = {url : _validateURL(templateUrl), defQP : defQPTemp};
				}
				return appendQueryParamsAndFrag(url,matched);
			}
		}

        function appendQueryParamsAndFrag(url,matched) {
			url = url[url.length-1] == '/' && url.length != 1 ? url.slice(0,-1) : url;
			if(matched.queryParams) {
				var ques = true;
				for(var key in matched.queryParams) {
					if(matched.queryParams[key] != undefined) {
						if(ques) {
							url += '?';
							ques = false
						} else {
							url += '&';
						}
						url+= key+'='+encodeURIComponent(matched.queryParams[key]);  
					}
				}
			}
			if(config.historyType && matched.fragment) {
			url = url+"#"+matched.fragment;
			}
			return _validateURL(url);
		}

        var invokeRunLoop;
        function dispatch(path,processed) {
			let history;
			lyte.time(RouteNavigationStr);
			if(path && config.baseURL && document.location.pathname.indexOf(config.baseURL) == -1) {
				RouterError.error("400A");
				return;
			}
			processed = processed || (!initialLoad && (history = lHistory.getMeta()) && history.matched && history.__lh.url == getLocation({withHash : true}) /* && history.__lh.url.indexOf(path) != -1 */ ? normalizeMatchedObj(history.matched) : traverse(path));
			if(!processed || processed.error) {return};
			clearTimeout(invokeRunLoop);
			processed.prevTrans = processed.prevTrans || LR.__lp.prevTrans;
			processed.path = processed.path || path;
			processed.transComp = processed.transComp || getTransitionDiffernce(processed.prevTrans, processed.matched,processed.R);
			invoke(processed);
			lyte.triggerEvent("navigationStart", {prevTrans : prevTrans && prevTrans._trans, nextTrans : newTrans._trans});
			invokeRunLoop = setTimeout(function() {
				if(processed.matched.route.length) {
					downloadLazyRoutes(processed)
					newTrans._data = newTrans._trans.data ? deepCopyObject(newTrans._trans.data) : {};
					if(trans && trans.state == 102 && newTrans && LR.checkIfSameRoute(newTrans.info,trans.info) && !trans.aborted && JSON.stringify(trans._data) == JSON.stringify(newTrans._data)) {
						if(trans.iPause == true) {
							trans.resume();    
						}
						return;
					} else if(trans && trans.state == 102) {
						trans.abort({state : 409}); 
					}
					newTrans.transComp = processed.transComp;
					// if(trans) {
					// 	newTrans.pRoutes = trans.routes;
					// }
					routeOptions.trans = trans = newTrans;
					newTrans.runLoop = constructPrevRunLoop(processedDispatch = processed);
					newTransInfo = routeOptions.newTransInfo;
					trans.run();
					// trans.transComp = processed.transComp = processed.transComp || getTransitionDiffernce(processed.prevTrans, processed.matched,processed.R);
					// routeOptions.trans = trans = newTrans;
					// newTransInfo = routeOptions.newTransInfo;
					// if(trans._trans.data) {
					// 	newTransInfo.data = trans._trans.data;
					// }
					// newTransInfo.meta = trans.meta = {matched : trans.matched}
					// newTransInfo.state = trans.stateObj = getHistoryState({
					// 	replace : newTransInfo.replace,
					// 	data : newTransInfo.data,
					// 	url : trans.url,
					// 	matched : trans.matched,
					// 	fromHistory : newTransInfo.fromHistory
					// });
					// getHistoryObj(newTransInfo);
					
				} 
			},0);
			return newTrans;
		}

        function downloadLazyRoutes(processed) {
			var R = processed.R,
			promArr = [];
			R.forEach(function(fn,i) {
				if(fn.name == __routeProm__Str) {
					var dirArr = processed.matched._routes[i],
					routeDetail = _getObj(dirArr, config.routes);
					promArr.push(fn.call(routeDetail.__lp).then(function(data) {
						initialRegisterRoute(dirArr, data[routeDetail.__lp.cName]);
						processed.R[i] = routeDetail.__lp.handler;
					}));
				}
			})
			return Promise.all(promArr);
		}

        function getTransitionDiffernce(prevTrans, matched, R) {
			var like = true,
			similar = true,
			rendered = [],
			common = [],
			unRendered = [],
			templateToRemove,
			currRoute = matched.route.join('.'),
			r,
			tar = "";   
	
			if(prevTrans) {
				var prevMatched = prevTrans.matched,
				route,
				startFrom = matched.refreshRoute && currRoute == prevTrans.info.route ?  matched.refreshRoute : matched.startFrom;
				for(var i = 0, l = matched.route.length; i < l; i++) {
					route = matched.route[i];
					tar = tar + (tar ? "." : "") + route;
					if(similar && route == prevMatched.route[i] && (!startFrom || tar != startFrom)) {
						r = R ? R[i] : LR.getDefinition(route.slice(0,i));
						if(r.name != __routeProm__Str && like && compareRoute(matched._routes[i],i,prevMatched,matched)) {
							common.push(route);
							if(prevTrans.rOpts[i].rendered) {
								rendered.push(route);  
							} else {
								// like = false; dont change this code. It is commented for decideTransition function
								unRendered.push(route);  
							}
						} else {
							like = false;
							unRendered.push(route);
						}
					} else {
						similar = false;
						if(templateToRemove == undefined && prevTrans.routes[i] && prevTrans.rOpts[i].rendered != -1 && prevTrans.routes[i].outlet) {
							templateToRemove = i;
						}
						unRendered.push(route);
					}
				}
				if(prevMatched.route.length > matched.route.length) {
					var index = matched.route.length;
					if(templateToRemove == undefined && prevTrans.rOpts[i].rendered/* && prevTrans.routes[i].outlet */) {
					templateToRemove = index;
					}
				}
			} else {
				unRendered = unRendered.concat(matched.route);
			}
			return { rendered, unRendered, common, templateToRemove };
		}

        function compareRoute(rArr,index,prevMatched,matched) {
			var same = true,
			routeObj = _getObj(rArr,config.routes),
			ropt = routeObj.__lp.options;
			if(!ropt.queryParams && !routeObj.__lp.dkey) {
				return true;
			}
			if(routeObj.__lp.dkey && prevMatched.dynamicParams[index] != matched.dynamicParams[index]) {
				return false;
			} else if(ropt.queryParams && matched.refreshData) {
				ropt.queryParams.every(function(key) {
					if(same && ropt.qpdef[key].refreshData && (matched.queryParams || prevMatched.queryParams) && matched.queryParams[key] != prevMatched.queryParams[key]) {
					return same = false;
					} else {
					return true;
					} 
				});
			}
			return same;
		}

        const basicHooks = [fetchStr,divertStr,renderStr,afterRenderStr];

        function constructPrevRunLoop() {
			lyte.time(constructRunLoopStr);
			var b4Exit = [],
			willNavigate = [],
			b4RouteTrans = [{hook : beforeRouteNavigationStr}];
			if(prevTrans) {
				for(var i = prevTrans.matched.route.length-1,r;r = prevTrans.matched.route[i]; i--) {
					var r1 = trans.matched._routes[i];
					if(!r1 || (r1.join('.') != prevTrans.matched._routes[i].join('.'))) {
						b4Exit.push({hook : beforeExitStr, index : i});
					}
					willNavigate.push({hook : willNavigateStr, index : i});
				}
				lyte.time(constructRunLoopStr);
				return {previous : willNavigate.concat(b4RouteTrans).concat(b4Exit) ,current : b4Exit};
			}
			return {};
			// return { previous : b4RouteTrans };
		}

        function pushFetchHooks(loop, index) {
			loop.push(
				{hook : beforeFetchStr, index : index},
				{hook : fetchStr, index : index},
				{hook : afterFetchStr, index : index})
		}

        function convertToFF({ trans, index }) {
			var r = trans.routes[index];
			if(typeof r.__lp.fns.forceFetch && callHookWithoutPromise.call(trans,r.__lp.fns.forceFetch,forceFetchStr,index,[])) {
				trans.runLoop.forceFetch[index] = []
				pushFetchHooks((trans.runLoop.forceFetch[index] = []),index)
				trans.runLoop.current.every(function(obj,i) {
					if(obj.hook == beforeFetchStr && obj.index == index) {
						trans.runLoop.current.splice(i, 3);
						return false;
					}
					return true;
				})
				r.__lp.fetchStatus = pendingStr;
			}
		}

        function constructRunLoop(processed) {
			lyte.time(constructRunLoopStr);
			var transComp = processed.transComp,
			runLoop = trans.runLoop = {
				previous : [],
				current : [],
				forceFetch : {}
			},
			current = runLoop.current,
			// forceFetch = {},
			loadingTemplate = [],
			req = [],
			didTransit = [];
			
			if(transComp.rendered && transComp.rendered.length) {
				transComp.rendered.forEach(function(hook,index) {
					trans.rOpts[index].rendered = true;
					current.push({hook : divertStr,index : index});
					didTransit.push({hook : didNavigateStr,index : trans.matched.route.length-index-1});
				});
			}
			if(transComp.unRendered && transComp.unRendered.length) {
				transComp.unRendered.forEach(function(hook,orgIndex) {
					var index = transComp.rendered.length+orgIndex,
					r = trans.routes[index];
					if(!transComp.redirected || (transComp.redirected && transComp.redirected.index != index)) {
						loadingTemplate.push({hook : renderLoadingTemplateStr, index})
						req.push({hook : getRequirementsStr,index});
					}
					basicHooks.forEach(function(h,i) {
						if(i == 0) {
							if(!transComp.redirected || (transComp.redirected && transComp.redirected.index != index)) {
								pushFetchHooks(current,index)
								// if(!transComp.unRendered[orgIndex+1] && trans.matched.mountRoute) {
								// 	current.push({hook : "getMountApp", index});
								// }		
								if(r instanceof Promise) {
									r.then(function() {
										convertToFF({trans, index})
									})
								} else {
									convertToFF({trans, index})
								}
							}
						}  else {
							current.push({hook : h, index}); 
							if(h == renderStr && transComp.unRendered[orgIndex+1]) {
								current.push({hook : renderLoadingTemplateStr,index : index+1});
							}    
						}
					});  
					didTransit.push({hook : didNavigateStr,index : trans.matched.route.length-index-1});
				});		
			}
			trans.runLoop.current = [{hook : onBeforeLoadStr}].concat(loadingTemplate).concat(req).concat(current).concat(didTransit)
			if(!prevTrans) {
				trans.runLoop.current.unshift({hook : beforeRouteNavigationStr})
			}
			runLoop.templateToRemove = (prevTrans && prevTrans.runLoop.templateToRemove) ? prevTrans.runLoop.templateToRemove : [];
			if(transComp.templateToRemove != undefined) {
				runLoop.templateToRemove.push({index : transComp.templateToRemove, routes : visibleTrans.routes});
			}
			lyte.time(constructRunLoopStr);
		}

        function invoke(processed) {
			routeOptions.newTrans = LR.__lp.newTrans = newTrans = new Navigation(processed);
			newTrans.url = processed.path;
			newTrans.runLoop = {};
			newTrans._trans = limitTransition(newTrans);
			lyte.extendEventListeners(newTrans._trans);
			if(historyObj) {
				routeOptions.newTransInfo = newTransInfo = historyObj;
				newTransInfo.url = processed.path;
				newTrans._trans.data = historyObj.data || lHistory.getData() || {};
				newTransInfo.replace = true;
				historyObj = undefined;
			} else if(newTrans._trans.data) {
				LR.history.replaceState(newTrans._trans.data);
			}
		}

        function abortRunningPromises(trans) {
			if(trans.runningProm) {
				trans.runningProm.reject(abortedStr);  
			}
			if(trans.fRunningProm) {
				trans.fRunningProm.reject(abortedStr);   
			}
		}

        var navId = 0;
        function Navigation(processed) {
			this.navId = navId = navId+1;
			this.matched = processed.matched;
			this.target = processed.matched.target;
			this.logs = [];
			this.onLoadCalled = [];
			this.fns = [];

			this.getDynamicParams = function() {
				var dpObj = {};
				if(this.matched.dynamicParams) {
					this.matched.dynamicParams.forEach(function(dp,i) {
						if(dp) {
							var routesObj = _getObj(this.matched._routes[i], config.routes)
							dpObj[routesObj.__lp.dkey] = dp;
						}
					}.bind(this))
				}
				return dpObj;
			};
			this.pending = {
				dependencies : new Set(),
				resources : new Set(),
				forceFetch : new Set()
			};
			this.info = {
				route : processed.matched.target,
				queryParams : processed.matched.queryParams,
				dynamicParams : processed.matched.dynamicParams.filter(_arrayClean),
				alias : processed.matched.alias
			};
			if(processed.matched.fragment) {
				this.info.fragment = processed.matched.fragment;
			}
			this.R = processed.R;
			this.rOpts = processed.rOpts;
			this.running = this.aborted = this.paused = false;
			this.abort = function(obj) {
				if(newTransInfo && newTransInfo.goValue) {
					fromHistoryGo = false;
				}
				this.abort = emptyFn;
				abortRunningPromises(this);
				this.aborted = true;
				if(!obj) {
					obj = {state : 308};
				} 
				if(this.running) {
					lyte.log(NavigationAbortedStr,routeStr);
				}
				if(!obj.iAbort) {
					delete this.runLoop.templateToRemove;
				}
				transitionCompleted(obj);
			}.bind(this);
			this.pause = function (obj) {
			lyte.log(NavigationPausedStr, routeStr);
			if (obj && obj.iPause) {
				this.iPause = true;
			} else {
				this.iPause = false;
				this.state = this._trans.state = 307;
				this._trans.triggerEvent(stateChangeStr,this.state);
			}
			this.paused = trans.prom || true;
			this.resume = this._trans.resume = function (t) {
				t = t || this;
				if (t.prom != t.eProm) {
					if (!t.pendingResume) {
						t.pendingResume = t.resume;
						delete t._trans.resume;
						delete t.resume;
					}
					return;
				}
				delete t._trans.resume;
				delete t.resume;
				lyte.log(NavigationResumedStr, routeStr);
				if (t.paused) {
					var state,
					prom = t.prom;
					if(t.paused != true) {
						state = t.paused.state;
					}
					if (t.runLoop[state]) {
						if(state == forceFetchStr) {
							var newProm = t.runLoop.forceFetch[prom.index];
							if(newProm[0] && prom.hook == newProm[0].hook) {
								newProm.splice(0, 1);
							}
						} else if(t.runLoop[state][0] && t.runLoop[state][0].hook == t.paused.hook && t.runLoop[state][0].index == t.paused.index) {
							removeHook(t.runLoop[state], t.paused.hook, t.paused.index);
						}
					}
					t.iPause = t.paused = false;
					t.state = t._trans.state = 102;
					this._trans.triggerEvent(stateChangeStr,t.state);
					if(this.forceFetchRunning) {
						if(t.runLoop.forceFetch[prom.index][0]) {
							t.run(t.runLoop.forceFetch[prom.index][0]);
						} else {
							t.routes[prom.index].__lp.fetchStatus = completedStr;
							if (t.pending.waitingForFF != undefined && t.pending.waitingForFF == prom.index) {
								delete t.pending.waitingForFF;
								t.run();
							}
						}
					} else {
						if(state && state == forceFetchStr && !t.runLoop.forceFetch[prom.index][0]) {
							t.routes[prom.index].__lp.fetchStatus = completedStr;
						} 
						t.run();  
					}
				}
			}.bind(this);
			return this._trans;
			}.bind(this);
		}

        function templateDelete(arr) {
		/* clears outlet, from parent to child */
			for(var i = 0,l = arr.length,obj; i < l; i++) {
				obj = arr[i];
				for (var inst, j = obj.routes.length - 1; j >= obj.index; j--) {
					inst = obj.routes[j];
					if (inst.outlet) {
						triggerTemplateDestroy({outlet : inst.outletName, route : inst},true)
						inst.outlet.innerHTML = "";
						if(!trans.routes[j] || trans.routes[j].__lp.objPath != inst.__lp.objPath) {
							callDidDestroy.call(this,inst,j,obj);
						}
					}
				}
			}
		}

        function triggerTemplateDestroy(obj) {
			LR.triggerEvent(beforeTemplateDestroyStr,obj);
			lyte.triggerEvent(beforeTemplateDestroyStr,obj);
		}

        function callDidDestroy(inst,index) {
			lyte.log(didDestroyStr+" of "+ inst.routeName,routeStr,fontColor);
			lyte.time(didDestroyStr+index);
			callHookWithoutPromise.call(this,inst.didDestroy,didDestroyStr,index,[inst.currentData, inst.__lp.param]);
			lyte.time(didDestroyStr+index);
		}

        var stoppableHooks = [getRequirementsStr,beforeFetchStr,fetchStr,afterFetchStr];
        // error in these hooks should pause transition and call onerror action
        function errorStoppableHook(hook) {
			return _strPresence(stoppableHooks,hook);
		}

        function callHookWithPromise(callback,instance, args) {
			/* executes route hooks which will returns promise */
			if(callback) { 
				var resp,
				t = trans,
				prom = trans.prom,
				hook = prom.hook,
				index = prom.index,
				stopNav = errorStoppableHook(hook),
				self = this;
				return new Promise(function(resolve,reject) {
					try {
						t.logs.push(hook +' of route '+instance.routeName+ ' called');
						var result = callback.apply(instance,args);
						if(stopNav && result) { /* check why stopTrans is needed? */
							result = lyte.resolvePromises(result);
						}
						resp = Promise.resolve(result);
					} catch(err) {
						processError.call(self,{hook : hook, index : index, stopNav , err : err,instance : instance, promise : {resolve : resolve, reject : reject}});
						return;
					}
					resp.then(function(data) {
						if(prom.state != "previous" && trans._trans != instance.navigation) {
							t.logs.push("old navigation's promise rejected");
							reject()
						} else {
							resolve(data);
							callback.then && callback.then.success.apply(this,arguments);
						}
					},function(err) {
						t.prom = prom;
						reject(err)
						callback.then && callback.then.failure.apply(this,arguments)
						processError.call(self,{hook, index,stopNav,err,instance, PR : true});
					});  
				});
			} else {
				return resolvedPromise;
			}
		}

        function callHookWithoutPromise(callback,hook,index,args,splInstance) {
			/* executes route hooks which wont return promise  */
			if(callback) {
				var instance = this.routes[index];
				try {
					trans.logs.push(hook +' of route '+instance.routeName+ ' called');
					return callback.apply(splInstance || instance,args);
				} catch(err) {
					processError.call(this,{hook, index, stopNav : errorStoppableHook(hook),err,instance});
					return;
				}  
			}
		}

        function callAction(hook,index,args) {
			/* executes route's actions  */
			var action,
			routeInstance = this.routes[index] && this.routes[index];
			if(action = getAction(routeInstance, hook)) {
				try {
					trans.logs.push(hook +' of route '+routeInstance.routeName+ ' called');
					if(action.apply(routeInstance,args) == false) {
						return false;
					}
				} catch(e) {
					_consoleErrorFromCallback(e,hook,routeInstance.routeName);
					return false;
				} 
			}
		}

        function _consoleErrorFromCallback(err,hook,routeName,state,options) {
			if(typeof err == "string" || (typeof err == "object" && err.stack && !err.$)) {
				if(!err.stack) {
					err = Error(err);
				}
				err.$ = true;
				var internalErr = RouterError.getErrorMessage(state) || RouterError.getErrorMessage("420A",hook,routeName);
				err.stack = err.stack.replace(err.message,err.message = err.message+"\n\t"+internalErr);
				RouterError.error(err);
			} else {
				RouterError.error(state,hook,routeName,err,options && options.PR);
			}
		}

        function processError(options) {
			/* handles error in hooks */
			var instance = options.instance,
			stopNav = options.stopNav,
			err = options.err,
			hook = options.hook,
			index = options.index;
			if(stopNav) {
				trans.pause();
				run[onErrorStr].call(this,hook,index,err,"420",options);
			} else {
				_consoleErrorFromCallback(err,hook,instance.routeName);
				// if(_strPresence([willNavigateStr,didNavigateStr,beforeExitStr,redirectStr],hook)) {
					if(options.promise) {
						options.promise.resolve();
					}
				// } else {
					// trans.abort({state : 4, iAbort : true});
				// }
			}  
		}

        function runLoopPromise(fn,fnName,loop,success,failure) {
			success = success || emptyFn;
			failure = failure || function(error) {
				if(error != abortedStr) {
					RouterError.error(error);
				}
			};
			new Promise(function(resolve,reject) {
				if(fnName == nestedForcedPromisesStr ) {
					this.fRunningProm = {resolve : resolve, reject : reject};
					fn.call(this,this.runLoop.forceFetch,resolve);
				} else {
					this.runningProm = {resolve : resolve, reject : reject};
					fn.call(this,this.runLoop,loop,resolve);  
				}
			}.bind(this)).then(success,failure);
		}

        Navigation.prototype.run = function (pausedForcedProm) {
			if(pausedForcedProm) {
				nestedForcedPromises.call(this, this.runLoop.forceFetch , this.fRunningProm.resolve ,pausedForcedProm);
				return;
			}
			processRunLoop.call(this);
		};

        function processRunLoop() {
			runLoopPromise.call(trans,nestedPromises,"nestedPromises",'previous',function() {
			if(processedDispatch && !trans.running && !trans.aborted ) {
				initRoute(trans, processedDispatch);
				if(processedDispatch.hasOwnProperty("refreshFrom")) {
					for(var i = processedDispatch.refreshFrom,r; r = newTrans.routes[i]; i++) {
						delete r.component;
					}
				}
				document.title = this.title = this.routes[this.routes.length-1].title || document.title;
				if(trans._trans.data) {
					newTransInfo.data = trans._trans.data;
				}
				newTransInfo.meta = trans.meta = {matched : trans.matched}
				trans.state = trans._trans.state = 102;
				trans._trans.triggerEvent(stateChangeStr,trans.state);
				if(newTransInfo) {
					if(config.preserveUrlOnBrowserNavigation && newTransInfo.fromHistory) {
						// if(newTransInfo) {
							// if(config.preserveUrlOnBrowserNavigation) {
						if(/* newTransInfo.fromHistory && */ !!newTransInfo.goValue) {
							fromHistoryGo = true;
							history.go(-(newTransInfo.goValue));
						}
						newTransInfo.data = trans._trans.data || newTransInfo.data;
						// newTransInfo.state.data = trans._trans.data || newTransInfo.state.data;
						newTransInfoClone = deepCopyObject(newTransInfo);
						trans.stateObj = newTransInfo.state;
						newTransInfoTimer = setInterval(function() {
							if(!newTransInfoClone) {
								clearInterval(newTransInfoTimer);
								return;
							}
							if(!fromHistoryGo) {
								clearInterval(newTransInfoTimer);
								addToHistory(newTransInfoClone);
								newTransInfoClone = undefined;
								
							}
						},0)
					} else {
						newTransInfo.data = trans._trans.data || newTransInfo.data;
						// newTransInfo.state.data = trans._trans.data || newTransInfo.state.data;
						addToHistory(newTransInfo);
						trans.stateObj = newTransInfo.state;
					}
				}

					// 	newTransInfo.data = trans._trans.data || newTransInfo.data;
					// 	// newTransInfo.state.data = trans._trans.data || newTransInfo.state.data;
					// 	newTransInfoClone = deepCopyObject(newTransInfo);
					// 	trans.stateObj = newTransInfo.state;
					// 	newTransInfoTimer = setInterval(function() {
					// 		if(!newTransInfoClone) {
					// 			clearInterval(newTransInfoTimer);
					// 			return;
					// 		}
					// 		if(!fromHistoryGo) {
					// 			clearInterval(newTransInfoTimer);
					// 			addToHistory(newTransInfoClone);
					// 			newTransInfoClone = undefined;
								
					// 		}
					// 	},0)
					// } else {
					// 	newTransInfo.data = trans._trans.data || newTransInfo.data;
					// 	// newTransInfo.state.data = trans._trans.data || newTransInfo.state.data;
					// 	addToHistory(newTransInfo);
					// 	trans.stateObj = newTransInfo.state;
					// }
				// }
				LR.__lp.trans = trans;            
				processedDispatch.previous = false;
				constructRunLoop(processedDispatch);
				setParamsInInst(processedDispatch);
				routeOptions.newTransInfo = processedDispatch = newTransInfo = undefined;
				trans.running = true;
			}
			runLoopPromise.call(trans,nestedPromises,"nestedPromises",'current');
			}.bind(this));
		}

        function setPendingResume(promise) {
			trans.eProm = promise;
			if (this.pendingResume) {
			var resume = this.pendingResume;
			delete this.pendingResume;
			resume();
			}
		}

        function nestedForcedPromises(forcedLoop, resolve, promise) {
			if (validateTransition(this) && forcedLoop) {
				if(!promise) {
					for(var key in forcedLoop) {
						var routeLoop = forcedLoop[key],
						p = routeLoop[0];
						if(p) {
							if(!p.running) {
								nestedForcedPromises.call(this, forcedLoop, resolve,p);    
							}
						}
					}
					return;
				}
				var routeInstance = this.routes[promise.index];
				promise.state = forceFetchStr;
				trans.prom = promise;
				if (promise.hook == beforeFetchStr && !routeInstance.__lp.dependenciesLoaded) {
					routeInstance.__lp.loadDependencies.then(function() {
						nestedForcedPromises.call(this, this.runLoop.forceFetch , this.fRunningProm.resolve ,this.runLoop.forceFetch[promise.index][0]);
					}.bind(this))
					return;
				}
				logCallbacks(promise);
				forcedLoop[promise.index][0].running = true;
				forcedLoop[promise.index].splice(0, 1);
				lyte.time(promise.hook+promise.index);
				run[promise.hook].call(this, promise.hook, promise.index).then(function (data) {
					lyte.time(promise.hook+promise.index);
					setPendingResume.call(trans, trans.prom);
					if(promise.hook == afterFetchStr) {
						routeInstance.__lp.fetchStatus = completedStr;
						if (this.pending.waitingForFF != undefined && this.pending.waitingForFF == promise.index) {
							delete this.pending.waitingForFF;
							nestedPromises.call(this,this.runLoop,"current",this.runningProm.resolve);
						}
					} else if(promise.hook == fetchStr) {
						if(forcedLoop[promise.index][0] && forcedLoop[promise.index][0].hook == afterFetchStr) {
							nestedForcedPromises.call(this, forcedLoop, resolve,forcedLoop[promise.index][0]);	
						}
					} else {
						if(forcedLoop[promise.index][0] && forcedLoop[promise.index][0].hook == fetchStr) {
							nestedForcedPromises.call(this, forcedLoop, resolve,forcedLoop[promise.index][0]);	
						}
					}
				}.bind(this),function() {debugger;});
			} else {
				this.forceFetchRunning = false;
			}
		}

        function logCallbacks(promise) {
			if(lyte.config.debug) {
				var hook = promise.hook,
				index = promise.index;
				if([beforeRouteNavigationStr, onBeforeLoadStr].indexOf(promise.hook) != -1) {
					lyte.log(hook,routeStr,fontColor);
					return;  
				}
				var route = promise.state == "previous" ? prevTrans.R[index] : trans.R[index];
				lyte.log(hook +' of route '+route.routeName,routeStr,fontColor);    
			}
		}

        function nestedPromiseCall(promise, routeInstance, loop, state, resolve) {
			if(promise.hook == beforeFetchStr && !routeInstance.__lp.dependenciesLoaded) {
				routeInstance.__lp.loadDependencies.then(function() {
					routeInstance.__lp.dependenciesLoaded = true
					nestedPromises.call(this,loop,state,resolve);
				}.bind(this));
				return;
			} else if(promise.hook == renderStr && !routeInstance.__lp.resourcesLoaded) {
				routeInstance.__lp.loadResources.then(function() {
					routeInstance.__lp.resourcesLoaded = true
					nestedPromises.call(this,loop,state,resolve);
				}.bind(this));
				return;
			} else if(promise.hook == divertStr && routeInstance.__lp.fns.forceFetch && routeInstance.__lp.fetchStatus == pendingStr) {
				if(!this.forceFetchRunning) {
					this.forceFetchRunning = true;
					runLoopPromise.call(this,nestedForcedPromises,nestedForcedPromisesStr);
				}
				this.pending.waitingForFF = promise.index;
				return;
			} else {
				promise.state = state;
				trans.prom = promise;
				logCallbacks(promise);
				lyte.time(promise.hook+promise.index);
				run[promise.hook].call(this,promise.hook,promise.index).then(function(data) {
					lyte.time(promise.hook+promise.index);
					setPendingResume.call(trans,trans.prom);
					if(this.runningProm.resolve == resolve) {
					removeHook(loop[state],promise.hook,promise.index);
					nestedPromises.call(this,loop,state,resolve);  
					}
				}.bind(this));
			}
		}

        function nestedPromises(loop,state,resolve) {
			if(validateTransition(this)) {
				var runLoop = loop[state];
				if(runLoop && runLoop.length) {
					var promise = runLoop[0],
					routeInstance = state == "previous"? prevTrans.routes[promise.index] : this.routes[promise.index];
					if(routeInstance instanceof Promise) {
						routeInstance.then(function() {
							if(this.onLoadCalled.length && runLoop[0].hook != onBeforeLoadStr) {
								runLoop.unshift({hook : onBeforeLoadStr});
							}
							nestedPromises.call(this, loop, state, resolve);
						}.bind(this))
						return;
					} else {
						nestedPromiseCall.call(this,promise, routeInstance, loop, state, resolve)
					}
				} else if(resolve) {
					resolve();
				}
			} else if(this.paused && this.runningProm) {
				this.runningProm.reject(abortedStr);  
			}
		}

        function removeHook(loop,hook,index) {
			for(var i = 0,obj;obj = loop[i]; i++) {
				if(obj.hook == hook) {
					if(index != undefined) {
						if(index == obj.index) {
							loop.splice(i,1);
							break;
						}
					} else {
						loop.splice(i,1);
						i--;
					}
				}
			}
		}

        function transitionCompleted(obj) {
			/* called after a atransition is completed or aborted*/
			trans.fns = [];
			if(trans.running) {
				if(trans == newTrans) {
					routeOptions.newTrans = LR.__lp.newTrans = newTrans = undefined;  
				}
				if(newTransInfoClone) {
					clearInterval(newTransInfoTimer);
					addToHistory(newTransInfoClone);
					newTransInfoClone = undefined;
				}
				LR.__lp.navigationCompleted && LR.__lp.navigationCompleted(trans)
				for(var i = 0,l = trans.fns.length; i < l; i++) {
					clearTimeout(trans.fns[i]);
				};
				
				trans.pendingResume = undefined;
				trans.running = false;
				trans.state = trans._trans.state = obj.state;
				trans._trans.triggerEvent(stateChangeStr,trans.state);
				if(initialLoad || trans.state == 200) {
					removeNavWeakMap(prevTrans, trans)
					routeOptions.prevTrans = LR.__lp.prevTrans = prevTrans = trans;
					lyte.log(NavigationComletedStr,routeStr);
					lyte.time(RouteNavigationStr);
					if(config.historyType && trans.info.fragment) {
						var elem;
						if((elem = document.getElementById(trans._trans.info.fragment)) && elem.scrollIntoView && (LR.beforeScroll && LR.beforeScroll(trans._trans) != false)) {
							elem.scrollIntoView();
						}
					}
					run[afterRouteNavigationStr](trans._trans);
				} else if(obj.iAbort || visibleTrans == trans) {
					removeNavWeakMap(prevTrans, trans)
					routeOptions.prevTrans = LR.__lp.prevTrans = prevTrans = trans;
					if (trans.state && trans.state != 201) {
					run[afterRouteNavigationStr](trans._trans);
					}
				} else {
					if (trans.state && trans.state != 201) {
						run[afterRouteNavigationStr](trans._trans);
					}
					removeNavWeakMap(trans, newTrans || prevTrans)
					routeOptions.trans = LR.__lp.trans = trans = prevTrans;  
				}
				if(initialLoad) {
					initialLoad = false;
				}
			} else if(prevTrans){
				routeOptions.trans = LR.__lp.trans = trans = prevTrans;
			}
		}

        function removeNavWeakMap(p,t) {
			if(p && (visibleTrans && p != visibleTrans)) {
				setTimeout(function() {
					p.routes.forEach(function(route,i) {
						if(/*!t.rOpts[i] || p.rOpts[i].objPath != t.rOpts[i].objPath || */p.routes[i] != t.routes[i]) {
							LR.__lp.nav.delete(route);
						}
					})
				},0)
			}
		}

        function traverse(path, get) {
			if(path) {
				var routeObj = _traverseMap(path, config)
				if(routeObj) {
					return pathProcessor.apply(this,[get].concat(routeObj));
				} else {
					RouterError.error("400A",config.baseURL && path.indexOf(config.baseURL) != 0 ? '' : path);
					return { error : true }
				}
			}
		}

        function pathProcessor(get,selectedPath,path,params,fragment) {
			var newURL,
			orgMatched,
			newMatched,
			matched = {
			route : _getObj(selectedPath,config.routeHash).__lp.route,
			queryParams : params ? _frameQueryParams(params) : {}
			};
			if(config.historyType) {
				matched.fragment = fragment;
			}
			matched.dynamicParams = _frameDynamicParams(path,matched,config.routes);
			if(get) {return matched;}
			matched.dpProcessed = true;
			var transInfo = normalizeMatchedObj(matched);
			if(transInfo != false) {
				orgMatched = deepCopyObject(transInfo.matched);
				newMatched = deepCopyObject(transInfo.matched);
				if(!transInfo.matched.hasOwnProperty('refreshData')) {
					if(!constructURLFromRoute(transInfo.matched)) {
						return;
					}
				}
				newURL = constructURLFromRoute(newMatched);
				if(!_compareObj(newMatched.queryParams,orgMatched.queryParams)) {
					addToHistory({replace : true,state : window.history.state,url : newURL,fromHistory : true});
					transInfo.path = newURL;
				}  
			}
			return transInfo;
		}

        function setParamsInInst(processed) {
			if(config.linkActiveClass) {
				config.activeLinkTags.forEach(function(tag) {
						tag.classList.remove(config.linkActiveClass);
				});
			}
			config.activeLinkTags = [];
			var R,
			r,
			matched = processed.matched;
			try {
				function linkTagPush(tag) {
					if(tag.getAttribute('lt-prop-route') == matched.target && activeLinkTags.indexOf(tag) == -1) {
						activeLinkTags.push(tag);
					}
				}
				function setParams(i){
					var rOpts = trans.rOpts[i];
					// r = trans.routes[i];
					if(rOpts.qpdef) {
						for(var key in rOpts.qpdef) {
							rOpts.param.queryParams[key] = matched.queryParams[key];
						};
					}
					rOpts.param.dynamicParam = matched.dynamicParams[i];
					if(i+1 == l) {
						rOpts.linkTags.forEach(linkTagPush);
					}
				}

				function callSetParams(i) {
					setParams(i)
				}
				
				for(var i = 0,l = trans.R.length; i < l; i++) {
					if(trans.routes[i] instanceof Promise) {
						trans.routes[i].then(callSetParams.bind(this,i))
					} else {
						setParams(i)
					}
					
				}
				LR.__lp.mutateCache(matched.target)
			} catch(e) {
				RouterError.error(e);
			}
			return;
		}

        function initialRegisterRoute() {
			if(config.routes) {
				registerRoute.apply({},arguments);
			} else {
				this.__lp.pendingReg.push(arguments);
			}
		}

        function registerRoute(dir,RouteClass) {
			if(RouteClass.name != __routeProm__Str) {
				var options = {fns : {actions : {}}, $ : {}}
				if(!RouteClass.__lp || !RouteClass.__lp.fns) {
					RouteClass.__lp = { fns : options.fns };
					[renderLoadingTemplateStr,getRequirementsStr,forceFetchStr,beforeFetchStr,fetchStr,afterFetchStr,divertStr,renderStr,afterRenderStr,"actions",beforeExitStr/*,"getMountApp"*/].forEach(function(key) {
						var prop = RouteClass.prototype[key];
						options.fns[key] = prop
						delete RouteClass.prototype[key];
					});
					if(typeof RouteClass.actions == "function") {
						options.fns.actions = RouteClass.prototype.actions = RouteClass.actions();
					}
					// RouteClass.prototype.routeName = dir[dir.length-1];
				} else {
					options.fns = RouteClass.__lp.fns;
				}
				options.objPath = dir.join('.');
				options.cacheLinks = [];
				options.linkTags = [];
				options.param = {
					queryParams :{},
					dynamicParam : undefined
				};
				var cache = config.queryParamOptions.cache;
				if(options.queryParams = RouteClass.queryParams) {
					options.qpdef = {};
					options.$ = {};
					RouteClass.queryParams.forEach(function(qp,i) {
						if(typeof qp == "string") {
							options.qpdef[qp] = {
							cache : cache,
							refreshData : true
						};
						if(config.cacheRoutes[dir] == undefined && cache) {
							config.cacheRoutes[dir] = cache
						}
					} else if(typeof qp == "object") {
						for(var key in qp) {
							options.qpdef[key] = {
								cache : qp[key].hasOwnProperty('cache') ? qp[key].cache : cache,
								refreshData : qp[key].hasOwnProperty('refreshData') ? qp[key].refreshData : true
							};
							if(!config.cacheRoutes[dir] && options.qpdef[key].cache) {
								config.cacheRoutes[options.objPath] = true
							}
						}
						RouteClass.queryParams[i] = key;
						}
					});  
				}
				RouteClass.routeName = dir[dir.length -1];
				setRouteDef(dir,{RouteClass, options});
			}
		}

        const transPredefined = ['runLoop','running','paused','R','routes',abortedStr,'prom','run',pendingStr,'matched','fns','rOpts','logs','onLoadCalled','getDynamicParams'];

        function limitTransition(int) {
			var _trans = new navigation(int);
			int.state = _trans.state = 201;
			return _trans;
		}

        function dummy() {
			/*
			Dont delete this function.
			This one is to avoid function to be merged during minification.
			*/
			var _trans = new navigation(int);
		}

        function navigation(int) {
			for(var prop in int) {
				if(transPredefined.indexOf(prop) == -1) {
					if(prop == 'info') {
						this.info = deepCopyObject(int[prop]);
					} else {
						this[prop] = int[prop];
					}
				}
			}
		}

        this.getRouteInstance = function(routeName,t) {
			var newTrans;
			if(LR && LR.__lp.initCalled && (newTrans = (t || (LR.__lp && LR.__lp.trans) || trans)) && newTrans.routes) {
				var routeLen = newTrans.routes.length;
				if(!routeName) {
					return newTrans.routes[routeLen-1];
				} else if(routeName == "*") {
					return newTrans.routes;
				} else {
					var reqRouteLen = routeName.split('.').length-1,
					reqRoute = newTrans.routes[reqRouteLen];
					return reqRoute && reqRoute.__lp.objPath == routeName ? reqRoute : undefined;
				}
			}
		};

        function normalizeMatchedObj(obj) {
			// To construct dynamic params array.
			if(obj.route) {
				var routesObj = config.routes,
				// parentRouteObj,
				matched,
				// def,
				R = [],
				rOpts = [],
				errorCheck = function(route,i) {
					routesObj = _getObj(route,routesObj);
					if(!routesObj) {
						throw Error(RouterError.getErrorMessage("400A",matched.target));
					}
					R.push(routesObj.__lp.handler)
				};
				if(obj._routes) {
					matched = obj;
				} else {
					var routeFromAlias = _getRouteFromAlias.call(this,{route : obj.route, map : config.aliasRouteMap});
					matched = {
						route : routeFromAlias.route, /* Array.isArray(obj.route) ? obj.route : _dotSerperator(obj.route), */
						alias : routeFromAlias.alias,
						queryParams : obj.queryParams || {},
						dynamicParams : [],
						fragment : obj.fragment,
						target : "",
						refreshRoute : obj.refreshRoute,
						startFrom : obj.startFrom,
						_routes : []
					};
					if(obj.dynamicParams) {
						if(obj.dpProcessed) {
							matched.dynamicParams = Array.from(obj.dynamicParams);
						} else {
							var dynamicParams =  Array.from(obj.dynamicParams);
						}
					}
				}
				try {
					matched.route.forEach(obj._routes ? errorCheck : function(route,i) {
						matched.target = matched.target ? matched.target+'.'+route : route;
						matched._routes.push(_dotSerperator(matched.target));
						errorCheck(route,i)
						if(dynamicParams) {
							matched.dynamicParams.push(routesObj.__lp.dkey ? dynamicParams.shift() : undefined);
						}
					});
					var r = _getObj(matched._routes[matched._routes.length-1],config.routes)
					if(r && r.__lp.mount) {
						matched.mountRoute = true
					}
					if(dynamicParams && dynamicParams.length) {
						lyte.error('Extra dynamic params found. Provide exact numbers dynamic params required for the transition '+ JSON.stringify(dynamicParams));
					}
				} catch(e) {
					RouterError.error(e);
					return {error : e};
				}
				return { 
					rOpts,
					matched,
					R
				};
			} else {
				if(this.tagName == LINKTOStr) {
					RouterError.error("498A", pRoute ,this.outerHTML);
				} else {
					RouterError.error("499B");  
				}
			}
		}

        function initRoute(trans, processed, from) {
			trans.routes = [];
			processed.rOpts = processed.rOpts || [];
			var RouteClass,
			routeObj,
			matched = processed.matched,
			refMatch = processed.prevTrans,
			similarRoute = true;
			trans.routes = [];

			function pushRoute(i, routeObj, ins) {
				LR.__lp.nav.set(ins, newTrans);
				ins.parent = newTrans.routes[i-1] instanceof Promise ? newTrans.routes[i-1].then(function() {ins.parent = newTrans.routes[i-1]}.bind(this)) : newTrans.routes[i-1];
				trans.rOpts[i] = deepCopyObject(routeObj.__lp.options);
				newTrans.routes[i] = ins
			}

			function promFunc({routeStringArr, i, routeObj}, res) {
				routeObj.__lp.handler().then(function(data) {
					initialRegisterRoute(routeStringArr,(trans.R[i] = RouteClass = routeObj.__lp.handler = data[routeObj.__lp.cName]));
					lyte.scopedInstance(RouteClass,[{ i ,routeName : routeStringArr[i],options : routeOptions, init : pushRoute.bind(this,i,routeObj)}],emptyFn,[LR]);
					res()
				}.bind(routeObj));
			};

			for(var i = from || 0, route; route = matched.route[i]; i++) {
				routeObj = _getObj(newTrans.matched._routes[i], config.routes);
				RouteClass = routeObj.__lp.handler;
				if(!RouteClass) {return false;}
				if(refMatch && similarRoute && refMatch.matched && refMatch.matched.route[i] == route) {
					modifyInstance({route : refMatch.routes[i],i,processed, nav : newTrans});
					// lyte.scopedInstance(RouteClass,[rOpts,trans.routes,i,processed,routeOptions,refMatch.routes[i]],pushRoute.bind(this,i),[LR]);
				} else {
					if(RouteClass.name == __routeProm__Str) {
						trans.routes.push(new Promise(promFunc.bind(this, {routeStringArr : matched._routes[i], i, routeObj})))
					} else {
						lyte.scopedInstance(RouteClass,[{i ,routeName : route, options : routeOptions, init : pushRoute.bind(this,i, routeObj)}],emptyFn,[LR]);
					}
					similarRoute = false;
				}
			}
			refMatch = undefined;
		}

        function modifyTransition(trans) {
			if(trans.changedInstance) {
				trans.routes.forEach(function(route,i) {
					LR.__lp.nav.set(route,trans);
					LR.__lp.nav.get(route).rOpts = trans.rOpts[i]
				})
			}
			return trans;
		}

        function modifyInstance({route, i, processed, nav }) {
			var rOpts = nav.rOpts[i] = deepCopyObject(LR.__lp.nav.get(route).rOpts[i])
			LR.__lp.nav.set(route, nav);
			delete rOpts.rendered;
			if(processed.transComp && !processed.transComp.rendered[i] && processed.transComp.redirected) {
				if(processed.transComp.redirected.index < i) {
					delete rOpts.loadDependencies;
					delete rOpts.loadResources;
					route.$.beforeFetch = route.$.fetch = route.$.afterFetch = undefined;
				} else if(processed.transComp.redirected.index != i) {
					delete rOpts.stencils;
				}
			} else {
				delete rOpts.stencils;
			}
			nav.routes[i] = route;
		}

        function dispatchTransition(processed) {
			const url = constructURLFromRoute(processed.matched);
			if(url) {
				processed.path = newTransInfo.url = url;
				dispatch(url,decideTransition(processed));
			}
			return url;
		}

        const allHooks = [getRequirementsStr,beforeFetchStr,fetchStr,afterFetchStr,divertStr,renderStr,afterRenderStr];
        function decideTransition(processed) {
			/* determines which transition to consider as previous transition */
			if(trans) {
				if(trans.running) {
					var matched = processed.matched;
					if(trans.state == 102 && trans.prom && trans.prom.hook == divertStr) {
						var transComp = getTransitionDiffernce(trans,matched,processed.R),
						transitioningRoute = allHooks.indexOf(trans.prom.hook) <= 6 ? trans.prom.index : trans.prom.index+1,
						visibleTransComparison = getTransitionDiffernce(visibleTrans,matched,processed.R);
						if(transComp.common.length < visibleTransComparison.common.length) {
							if(trans.runLoop.templateToRemove.length) {
								trans.runLoop.templateToRemove.pop();
							}
							if(transComp.rendered.length < visibleTransComparison.rendered.length) {
								processed.prevTrans = modifyTransition(visibleTrans);
							}
							transComp = visibleTransComparison;
							if(trans.prom.index <= visibleTransComparison.common.length -1) {
								transComp.redirected = trans.prom;
							}
						} else if(transComp.common.length-1 >= transitioningRoute) {
							if(trans.prom.index <= transComp.common.length -1) {
								processed.prevTrans = trans;
								transComp.redirected = trans.prom;
							}
						}  
					}
					const info = {
						route : matched.target,
						queryParams : matched.queryParams,
						dynamicParams : matched.dynamicParams.filter(_arrayClean)
					};
					if(LR.checkIfSameRoute(trans.info,info) && !trans.aborted) {
						trans.pause({iPause : true});  
					} else {
						trans.abort({state : 409, iAbort : true});
					}
					processed.transComp = transComp;
				} else if(trans && !trans.aborted) {
					trans.abort({state : 409, iAbort : true});
				}
			}
			return processed;
		}

        if(lyte.$.modules.triggerEvent) {
			lyte.$.modules.triggerEvent("add", "router", this);
		}
        var routeOptions = {
			lyte,
			dispatch,
			LR,
			constructURLFromRoute,
			decideTransition
		}
        Lyte.domContentLoaded(init);
        return this;
    }
}

Router.__lMod = "Router";

export { Router };