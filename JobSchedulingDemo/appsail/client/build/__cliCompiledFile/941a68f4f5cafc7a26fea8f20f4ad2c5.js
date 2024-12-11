import { _delimit, _dynamicRouteCheck, _frameQueryParams, _getObj, _strPresence, _splitPath, _wildcardRouteCheck } from "@slyte/router/src/router-utils";

const parseRouteMappingStr = "parseRouteMapping",
functionStr = "function";
var  mapObj = {}, 
pathStringArr = [], 
routeStringArr = [],
_config,
_initialRegisterRoute,
routesObj;

class RouterMap {
    constructor() {
        this.aliasPrefix = [];
        this.lazyRoute = this.route;
        this.mountRoute = this.route;

        this.setAlias = function(lyte,_config,alias,route) {
            var _alias="";
            if(alias) {
                if(this.aliasPrefix.length) {
                    this.aliasPrefix.forEach((a) => {
                        _alias += a;
                    });
                }
                alias = _alias+alias
            };
            if(_config.aliasRouteMap[alias]) {
                lyte.error('Duplicate entries found for alias "'+ alias +'". Existing entry will be overwritten');
            }
            _config.aliasRouteMap[alias] = route;
            _config.routeAliasMap[route] = alias;
        };
    }

    route(routeName, obj, nestedFn) {
        // var lazyRoute;
        // if(typeof obj.class == functionStr && obj.class.name == "__routeProm__") {
        //     // className = obj.cName;
        //     lazyRoute = true
        // }
        // if(!obj.class) {
        //     return "No route file map"
        // };
        if(typeof obj == "object"/*  || lazyRoute*/) {
            if(!obj.path) {
                obj.path = _delimit(routeName);
            } else {
                if(_strPresence(obj.path,"?")) {
                    var split = obj.path.split('?');
                    obj.defQP = _frameQueryParams(split[1]);
                    obj.path = split[0] || "/";
                }  
            }
            if(obj.queryParams) {
                obj.defQP = obj.queryParams;
            }
        } else {
            if(typeof obj == functionStr) {
                nestedFn = obj;
            }
            obj = {path : _delimit(routeName) /* ,cName : obj.class.name */};  
        }
        mapObj = _getObj(pathStringArr,_config.routeHash)[obj.path] = {__lp : {}};
        if(obj.path == '/') {
            pathStringArr.push('/');
        } else {
            var trimedPath = obj.path;
            if(_dynamicRouteCheck(trimedPath) || _wildcardRouteCheck(trimedPath)) {
                _splitPath(trimedPath).every(function(seg,index,arr) {
                if(_dynamicRouteCheck(seg) || _wildcardRouteCheck(seg)) {
                    var dkey;
                    if(_dynamicRouteCheck(seg)) {
                        dkey = seg.replace(":","");
                    } else  {
                        dkey = seg.replace("*","");
                        obj.wildcard = mapObj.__lp.wildcard = true;
                        obj.sufix = mapObj.__lp.sufix = [];
                        for(var i = index+1,j; j = arr[i]; i++) {
                            mapObj.__lp.sufix.push(j);
                        }
                    }
                    obj.dkey = mapObj.__lp.dkey = dkey;
                    obj.dIndex = mapObj.__lp.dIndex = index;
                    return false;
                }
                return true;
                });
            } 
            pathStringArr.push(trimedPath);
        }
        if(obj && obj.mount) {
            mapObj.__lp.mount = true;
        }
        var routes = _getObj(routeStringArr,routesObj) || routesObj;
        routeStringArr.push(routeName);
        mapObj.__lp.route = Array.from(routeStringArr);
        routes[routeName] ? (Object.assign(routes[routeName].__lp,obj)) : (routes[routeName] = {__lp : obj});
        if(obj.alias) {
            this.setAlias(this.lyte,_config,obj.alias,mapObj.__lp.route.join('.'))
        }
        if(obj.handler.name == "__routeProm__") {
            // obj.then = function(routeStringArr,data) {
            //     debugger;
            //     _initialRegisterRoute(routeStringArr,data[obj.cName]);    
            // }.bind(undefined,Array.from(routeStringArr))
        } else {
            _initialRegisterRoute(routeStringArr,obj.handler);
        }
        if(nestedFn) {
            nestedFn.call(this,{});
        }
        // if(obj && obj.mount) {
        //     _config.dependenciesApps[obj.mount] = _config.dependenciesApps[obj.mount] ? _config.dependenciesApps[obj.mount].push(routeStringArr) : [routeStringArr]
        //     obj.mount.prototype.map.call(this,{});
        // }
        routeStringArr.pop();
        pathStringArr.pop();
        this.aliasPrefix.pop();
    }
    include(mapClass, obj) {
        try {
            obj = obj || {};
            if(obj.aliasPrefix) {
                this.aliasPrefix.push(obj.aliasPrefix)
            }
            obj && new mapClass().map.call(this,{});
        } catch(e) {
            console.error(e, "Error in includes")
        }
    }
}

RouterMap.__lMod = "RouterMap";

function _parseRouteMap(MapClass,{ lyte, config , initialRegisterRoute }) {
    _config = config;
    _initialRegisterRoute = initialRegisterRoute;
    lyte.time(parseRouteMappingStr);
    routesObj = _config.routes ? _config.routes : (_config.routes = {})
    var ins = new MapClass({ lyte }),
    err = ins.map(_config);
    if(typeof err == "string") { lyte.log(err)};
    lyte.time(parseRouteMappingStr);
    return routesObj;
}

function _traverseMap(path, config) {
    if(!path) {
     return;
    }
    var selectedPaths = [],
    fragment;
    if(config.historyType) {
        var fragSplit = path.split('#');
        if(fragment = fragSplit[1]) {
            path = fragSplit[0];
        }
    }
    var pathSplit = path.split('?');
    path = decodeURI(pathSplit[0]);
    if(path == '/') {
        if(_getObj(['/'],config.routeHash)) {
            selectedPaths.push([path]);  
        } else {
            return;
        }
    } else {
        var params = pathSplit[1],
        pathSplitArr = _splitPath(path);
        var pathLevel = 0,
        pathArrLevel = [0],
        exactMatch,
        matchedPath = [];
        matchedPath.dynamicParams = [];
        findPossibleMatch(config.routeHash);

        function checkArrayMatch(arr1,arr2,l,pathObj,matchedPath) {
            if(!(pathObj.__lp.wildcard || pathObj.__lp.dkey)) {
            var prevObj;
            if(prevObj = _getObj(matchedPath,config.routeHash).__lp) {
                if(prevObj.wildcard) {
                var pathArr = arr2.slice(l);
                if(!(l += pathArr.indexOf(arr1[0]))) {
                    return false;
                }  
                }
            }
            }
            for(var i = 0,a1;a1 = arr1[i]; i++,l++) {
            if(a1 != arr2[l] && !_dynamicRouteCheck(a1)) {
                if(_wildcardRouteCheck(a1)) {
                if(pathObj.__lp.sufix.length) {
                    l = arr2.indexOf(pathObj.__lp.sufix[0])-1; 
                }
                } else if(arr1[l] == '/') {
                l--;
                } else {
                return false;  
                }
            }
            }
            return l;
        }

        function findPossibleMatch(mapObj) {
            for(var mapPath in mapObj) {
                if(!exactMatch) {
                    var pathObj = mapObj[mapPath],
                    innerLevel;
                    if(mapPath != "__lp") {
                        var mapPathSplit = _splitPath(mapPath);
                        if(mapPathSplit) {
                            if((innerLevel = checkArrayMatch(mapPathSplit,pathSplitArr,pathLevel,pathObj,matchedPath)) !== false) {
                            pathArrLevel.push(innerLevel);
                            pathLevel = pathArrLevel[pathArrLevel.length-1];
                                if(pathSplitArr.length == pathLevel || pathObj.__lp.mount) {
                                    var path = Array.from(matchedPath.concat(mapPath));
                                    if(pathObj["/"]) {
                                        path = path.concat('/');
                                    }
                                    selectedPaths.push(path);
                                    if(pathObj.__lp.wildcard || pathObj.__lp.dkey || pathObj.__lp.mount) {
                                        pathArrLevel.pop();
                                        pathLevel = pathArrLevel[pathArrLevel.length-1];
                                    } else {
                                        if(!/[:*]/.test(path.join(''))) {
                                            exactMatch = path;  
                                        }
                                        return;
                                    }
                                } else {
                                    var innerRoutes = Object.keys(pathObj);
                                    matchedPath.push(mapPath);
                                    if(pathSplitArr[pathLevel]) {
                                    if(pathObj.__lp.wildcard && !pathObj.__lp.sufix.length && innerRoutes.length == 1) {
                                        var wildcard= Array.from(matchedPath);
                                        if(pathObj["/"]) {
                                        wildcard = wildcard.concat('/');
                                        }
                                        selectedPaths.push(wildcard);
                                    } else if(innerRoutes.length > 1) {
                                        findPossibleMatch(pathObj);    
                                    }
                                    } 
                                    matchedPath.pop();
                                    pathArrLevel.pop();
                                    pathLevel = pathArrLevel[pathArrLevel.length-1];
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if(exactMatch) {
        return [exactMatch,path,params,fragment];
    } else if(selectedPaths.length == 1) {
        return [selectedPaths[0],path,params,fragment];
    } else if(selectedPaths.length) {
        return [getBestMatch(getStaticMatches(selectedPaths),selectedPaths),path,params,fragment];

        function getBestMatch(staticMatches, selectedPaths, position) {
            position = position || 0;
            var traversedStaticMatch = traversedStaticMatch || traverseArray(staticMatches),
            maxStaticSeg = Math.max(...traversedStaticMatch[position]),
            duplicatePos;
            while(duplicatePos = checkForArrayDuplicates(traversedStaticMatch[position], maxStaticSeg, selectedPaths, staticMatches)) {
                position = position+1;
                var newSelectedPaths = [],
                newStaticMatches = [];
                for(var i = 0,l = duplicatePos.length; i < l; i++) {
                    newSelectedPaths.push(selectedPaths[i]);
                    newStaticMatches.push(staticMatches[i]);
                }
                var newSelectedPathsFiltered = [],
                newStaticMatchesFiltered = [];
                for(var i = 0,l = newStaticMatches.length; i < l; i++) {
                    if(newStaticMatches[i][position] != undefined) {
                        newSelectedPathsFiltered.push(newSelectedPaths[i]);
                        newStaticMatchesFiltered.push(newStaticMatches[i]);
                    }
                }
                if(!newSelectedPathsFiltered.length) {
                    return newSelectedPaths[0];
                } else if(newSelectedPathsFiltered.length == 1) {
                    return newSelectedPathsFiltered[0];
                }
                return getBestMatch(newStaticMatchesFiltered, newSelectedPathsFiltered, position);
            }
            return selectedPaths[traversedStaticMatch[position].indexOf(maxStaticSeg)];
        }
        

        function getStaticMatches(selectedPaths) {
            var staticSegmentsInMatch = [];
            for(var i = 0,l = selectedPaths.length; i < l; i++) {
                var arr = Array.from(selectedPaths[i]),
                staticPath = 0,
                result = [];
                if(arr[0] == "/") {
                    arr.shift();
                }
                if(arr[arr.length-1] == "/") {
                    arr.pop();
                }
                var counter = -1;
                arr.every(function(seg,i) {
                    var noWildcard = true;
                    _splitPath(seg).every(function(innerSeg,j) {
                    counter++;
                    if(innerSeg == pathSplitArr[counter]) {
                        staticPath++;
                        if(arr.length == i+1){
                        result.push(staticPath);
                        }
                        return true;
                    } else if(innerSeg.indexOf(':') != -1) {
                        result.push(staticPath);
                        staticPath = 0;
                        return true;
                    } else {
                        if(innerSeg.indexOf('*') != -1) {
                        noWildcard = false;
                        }
                        result.push(staticPath);
                        return false;
                    }
                    });  
                    return noWildcard;
                });
                staticSegmentsInMatch.push(result);
            }
            return staticSegmentsInMatch;
        }
    } else {
        return false;
    }
}

function checkForArrayDuplicates(arr, value) {
    var pos = [];
    for(var i = 0,l = arr.length;i < l; i++) {
        if(arr[i] == value) {
            pos.push(i);
        }
    }
    return pos.length == 1 ? false : pos;
}

function traverseArray(arr) {
    var res = [],
    maxArrLen = 0;
    for(var i = 0,l = arr.length; i < l; i++) {
        var a = arr[i];
        maxArrLen = a.length > maxArrLen ? a.length : maxArrLen;
    }
    for(var i=0,a ;a = arr[i]; i++) {
        for(var j=0; j<maxArrLen; j++) {
            res[j] = res[j] || [];    
            res[j][i] = a[j];
        } 
    }
    return res;
}

export {
    _parseRouteMap,
    _traverseMap,
    RouterMap
}