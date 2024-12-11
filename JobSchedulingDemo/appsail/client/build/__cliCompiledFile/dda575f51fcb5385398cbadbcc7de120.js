import { deepCopyObject } from "@slyte/core/src/lyte-utils";
import { _consoleError } from "./router-errors";

const _strPresence = (str, char) => str.includes(char),

_dotSerperator = (str) => str.split('.').filter(Boolean),

_dynamicRouteCheck = (route) => _strPresence(route,":"),

_wildcardRouteCheck = (route) => _strPresence(route,"*"),

_delimit = (seg) => seg[0] == "/" ? seg : "/"+seg,

_splitPath = (path) => path.match(/[^/?]+/g) || [];

function scriptExecution(scriptNode) {
    for(var i=0,currentScript;currentScript = scriptNode[i];i++) {
        var parent = currentScript.parentNode,
        s = d.createElement("script");
        for(var j = 0,attributes;attributes = currentScript.attributes[j]; j++) {
        s.setAttribute(attributes.name, attributes.value);
        }
        s.innerHTML = currentScript.innerHTML;
        parent.appendChild(s);
        parent.removeChild(currentScript);
    }
}

function _compareObj(obj1,obj2) {
    var obj1keys = Object.keys(obj1),
    obj2keys = Object.keys(obj2);
    if(obj1keys.length != obj2keys.length) {
    return false;
    } else {
    for(var key in obj1) {
        if(obj1[key] != obj2[key]) {
        return false;
        }
    }
    return true;
    }
}

function _getObj(arr,obj) {
    /**
     *  get nested property from an object
     * @params {array} array
     * @params {object} object
     * @returns
     */
    if(!obj) {
        return;
    } else if(!arr) {
        return obj;
    } else if(!Array.isArray(arr) && typeof arr == 'string') {
        arr = _dotSerperator(arr);
    }
    arr.every(function(key)  {
        if(obj && obj[key]) {
            obj = obj[key];
            return true;
        }
        return obj = false;
    });
    return obj;
}

function _frameQueryParams(url) {
    if(url) {
        var qp = {},
        split,
        params = _strPresence(url,"?") ? url.split("?")[1] : url;
        params = _strPresence(params,"&") ? params.split(/&/g) : [params];
        for(var i = 0,l = params.length; i < l; i++) {
            qp[(split = params[i].split('='))[0]] = split[1] ? decodeURIComponent(split[1]) : split[1];
        }
        return qp;
    } 
}

function _frameDynamicParams(url,matched, routesObj) {
    var dynamicParam,
    fdp,
    framedDP = [],
    urlSplit = _splitPath(url.split('?')[0]);
    for(var i = 0,l = matched.route.length,r; i < l; i++) {
        r = matched.route[i];
        routesObj = _getObj([r],routesObj);
        var routeObj =  routesObj.__lp;
        if(routeObj.wildcard) {
            if(routeObj.sufix.length) {
            var dp = urlSplit.slice(0,urlSplit.indexOf(routeObj.sufix[0]));
            fdp = decodeURI(dp.join('/'));
            pop(dp.concat(routeObj.sufix),urlSplit);
            } else {
            fdp = decodeURI(urlSplit.join('/'));
            }
        } else if(routeObj.dkey) {
            dynamicParam = urlSplit[routeObj.dIndex];
            pop(_splitPath(routeObj.path),urlSplit);
            fdp = decodeURI(dynamicParam);
        } else {
            pop(_splitPath(routeObj.path),urlSplit);
            fdp = undefined;
        }
        framedDP.push(fdp);
    };
    return framedDP;
}

function _validateURL(url) {
    url = url.replace(/\/\//g,'/');
    url = url.replace(/\/\?/g,'?');
    return url;
}

function _normalizeTransitionParams(obj) {
    // To normalize argument for transition, returns matched obj from obj or native tranisitionTo argument.
    var params;
    if(typeof obj == "object") {
        params = obj;
    } else {
        params = {
            queryParams : {},
            dynamicParams : []
        };
        Array.from(arguments).forEach(function(arg,index) {
            if(Array.isArray(arg)) {
                _consoleError.call(lyte,498,JSON.stringify(arg));
                return;
        } else {
            if(index == 0) {
                params.route = arg;
        } else if(arg && typeof arg == "object") {
            params.queryParams = deepCopyObject(arg);
            } else {
                params.dynamicParams.push(arg);
            }  
        }
        });
    }
    return params;
}

function _getRouteFromAlias(obj) {
	var route = obj.route,
    alias;
	if(typeof route == "string") {
        if(route.indexOf('$') == 0) {
            alias = route.split('$')[1],
            map = obj.map;
            // if(map || (map = config.engineConf[config.mountedEngines[obj.parent]].aliasRouteMap)) {
            // }
                if(map[alias]) {
                    route = map[alias]
                } else {
                    _consoleError.call(this,obj.route+' is not a valid route alias')
                    return;
                }
        }
        route = route.split('.');
	}
    return { route, alias};
}

function _checkIfSameRoute(transInfo1, transInfo2) {
    if(transInfo1 && transInfo2 && transInfo1.route == transInfo2.route && transInfo1.fragment == transInfo2.fragment && transInfo1.dynamicParams.length === transInfo2.dynamicParams.length && _compareObj(transInfo1.queryParams,transInfo2.queryParams)) {
        if(transInfo1.dynamicParams.length) {
            for(let i = 0,dynamicParam; dynamicParam = transInfo1.dynamicParams[i]; i++) {
                if(dynamicParam != transInfo2.dynamicParams[i]){
                    return false;
                }
            }
        }
        return true;
    }
    return false;
};

function pop(path,urlSplit) {
    for(var i = 0,l = path.length; i < l; i++) {
        urlSplit.shift();
    };
}

export {
    _strPresence,
    _dotSerperator,
    scriptExecution,
    _getObj,
    _delimit,
    _splitPath,
    _getRouteFromAlias,
    _compareObj,
    _dynamicRouteCheck,
    _wildcardRouteCheck,
    _frameQueryParams,
    _normalizeTransitionParams,
    _validateURL,
    _frameDynamicParams,
    _checkIfSameRoute
}