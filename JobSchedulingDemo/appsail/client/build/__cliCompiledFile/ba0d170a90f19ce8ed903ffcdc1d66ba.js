function resolvePromises(promises) {
    if(typeof promises == "string" || promises instanceof Promise) {
        return promises;
    } else {
        if(Array.isArray(promises)) {
        return promiseArray(promises);
        } else if(typeof promises == "object") {
        return promiseHash(promises);
        }    
    }

    function promiseHash(promiseObj) {
        var actPromKeys = [],
        promises = [],
        promiseKeys = Object.keys(promiseObj);
        promiseKeys.forEach(function(key) {
            var value = promiseObj[key];
        if(value instanceof Promise) {
            actPromKeys.push(key)
            promises.push(value);
        }
        });
        if(!promises.length) {
            return Promise.resolve(promiseObj);
        } else {
            var obj = {},promise = new Promise(function(resolve,reject) {
            Promise.all(promises).then(function(data) {
                promiseKeys.forEach(function(promiseKey) {
                if(actPromKeys.indexOf(promiseKey) != -1) {
                    obj[promiseKey] = data[actPromKeys.indexOf(promiseKey)]
                } else {
                    obj[promiseKey] = promiseObj[promiseKey];
                }
                });
            resolve(obj);
            },function(err) {
            reject(err);
            });
        });   
        return promise;
        }
    }
    
    function promiseArray(promiseArray) {
        var array = [],
        hasPromise = false;
        promiseArray.every(function(item,i) {
            if(item instanceof Promise) { 
                hasPromise = true;
                return false;
            }
            return true
        });
        if(!hasPromise) {
            return Promise.resolve(promiseArray);
        }
        var promise = new Promise(function(resolve,reject) {
            Promise.all(promiseArray).then(function(data) {
                promiseArray.forEach(function(key,index){
                    array[index] = data[index];
                });
                resolve(array);
            },function(err) {
                reject(err);
                
            });
        });   
        return promise;
    }
};

export {
    resolvePromises
}