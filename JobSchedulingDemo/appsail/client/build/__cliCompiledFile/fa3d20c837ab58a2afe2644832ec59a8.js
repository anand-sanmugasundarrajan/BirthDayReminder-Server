import { deepCopyObject, extendEventListeners } from "@slyte/core/src/lyte-utils";
import { Service } from "@slyte/core/src/service";
/*convert to custom class */
class Utils extends Service {
    static addMethods(data){
        if(Array.isArray(data)){
            data.forEach(function(fn){
                var name = fn._name ? fn._name : fn.name;
                if(!Utils.prototype[name]){
                    Utils.prototype[name] = fn;
                }
            });
        }
    } 
}
Utils.addMethods([deepCopyObject, extendEventListeners]);

export { Utils };