import { Lyte } from "@slyte/core";

function pathFinder (scope,path){
    if(path){
        var Json = scope;
        if(typeof scope == "object"){
            return parsePath(scope,path)
        }
    }
    else{
        Lyte.error("Invalid JsonPath - " + path)
    }
}
function parsePath (scope,path){
    if(path.includes(".")){
        path=path.replace(/ /g,"");
        var pathArr =path.split(".")
        if(pathArr[0] == "$"){
            pathArr.splice(0,1)
        }
    }
    return GetData(scope,pathArr)
}
function GetData (scope,path,DeepTraverse){
    if(DeepTraverse){
        var arr =[];
        if(Array.isArray(scope)){
            path.splice(0,1);
            for(var i_deep=0; i_deep<scope.length ; i_deep++){
            var value = deepBranches(scope[i_deep],path,DeepTraverse)
            if(Array.isArray(value) && value.length ==0){
                value = undefined;
            }
            if(value){
                arr.push(value)
            }
            }
            return arr;
        }
    }
    else{
        return deepBranches(scope,path,DeepTraverse)
    }
}
function deepBranches (obj,path,DeepTraverse){
    for(var pathIndex =0 ; pathIndex<path.length; pathIndex ++){
        var key = path[pathIndex];
        var nextKey = path[pathIndex+1],_nextKey;
        if(nextKey){
            _nextKey = keyParser(nextKey);
        }
        if(key.includes("[") && key.includes("]")){
            var utilScope = key.match(/\[([^\]]+)\]/g)[0]
            var utilKey = key.match(/^(.+?)\[/g)
            if(utilKey){
                utilKey=utilKey[0].replace(/\[/g,"");
            }
            if(!Array.isArray(obj) && utilKey){
                obj = obj[utilKey];
            }
            obj = (!Array.isArray(obj) && utilScope) ? undefined : obj;
            if(Array.isArray(obj)){
                if(utilScope && !utilScope.includes("@")){
                    if(utilScope.includes(":")){
                        utilScope = utilScope.replace(/\[/g,"").replace(/\]/g,"");
                        var slice = utilScope.split(":");
                        var start = slice[0]==""?undefined:parseInt(slice[0]);
                        var end = slice[1]==""?undefined:parseInt(slice[1]);
                        obj = obj.slice(start,end)
                    }
                    else if(utilScope.includes("*")){
                        continue
                    }
                    else if(utilScope){
                        var key = utilScope.match(/\[(.*?)\]/)[1]
                        obj = obj[key]
                    }
                }
            }
        }
        else if(key == ""){
            if(_nextKey == undefined){
                Lyte.error("Invalid JsonPath - " + path + "expected : Path string should not end with the  '..' ")
            }
            obj = GetAllKeys(obj,_nextKey)
            if(path.length-1 != pathIndex){
                if(Array.isArray(obj)){
                    DeepTraverse =1;
                    var utilScope = nextKey.match(/\[([^\]]+)\]/g)
                    path.splice(0,pathIndex+1)
                    if(utilScope!=null){
                        utilScope = utilScope[0];
                        utilScope = utilScope.match(/\[(.*?)\]/)[1]
                        obj = separateArray(obj,utilScope);
                    }
                    if(path.length>1){
                        obj = GetData(obj,path,DeepTraverse)
                        break;
                    }
                }
            }
            if(nextKey && !nextKey.includes("[") && !nextKey.includes("]")){
                pathIndex++;
            }
        }
        else if(key == "*"){
            continue;
        }
        else{
            if(path[pathIndex-1] && (path[pathIndex-1] == "*" || path[pathIndex-1].includes("*"))){
                if(Array.isArray(obj)){
                    var newArray=[];
                    var ind=0;
                    for(var arr_index = 0; arr_index<obj.length; arr_index++){
                        if(obj[arr_index][key]){
                            newArray[ind] = obj[arr_index][key];
                            ind++;
                        }
                    }
                    obj=newArray;
                }
                else if (typeof obj == "object"){
                    obj = obj[key]
                }
            }
            else{
                obj = obj[key]?obj[key]:undefined;
            }
        }

    }
    return obj
}
function keyParser (key){
    if(key.includes("[") && key.includes("]")){
        var utilScope = key.match(/\[([^\]]+)\]/g)[0]
        var utilKey = key.match(/^(.+?)\[/g) 
        if(utilKey){
            utilKey=utilKey[0].replace(/\[/g,"");
            return utilKey;
        }
    }
    return key;
}
function GetAllKeys (scope,key){
    var arr= []; 
    getRecurssive(scope,key,arr);
    return arr
}
function getRecurssive (scope,key,arr){
    if(typeof scope == "object"){
        for(var v in scope){
            if(v == key){
                arr.push(scope[key])
            }
            if(typeof scope[v] == "object"){
                getRecurssive(scope[v],key,arr)
            }
        }
    }
    else if(Array.isArray(scope)){
        for( var index = 0 ; index<scope.length ; index++ ){
            var obj = scope[index];
            getRecurssive(obj,key,arr);
        }
    }
}
function separateArray (scope,index){
    var Arr =[];
    for (var i=0; i< scope.length; i++){
        if(scope[i][index]){
            Arr.push(scope[i][index]);
        }
    }
    return Arr;
}

export { pathFinder as Jwalk }