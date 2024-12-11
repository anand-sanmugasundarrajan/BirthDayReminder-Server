import { __scopedInstance } from "./lyte";
import { Service } from "./service";
import { _lyteInit, _lyteDidConnect } from "./lyte-utils.js";
// import { resolvePromises } from './rsvp';
// import { Logger } from './lyte-error';
/*convert to custom class*/
class LyteAddon extends Service {
    constructor(config){
        super();
        this.config = config;
        _lyteInit(LyteAddon,this);
        _lyteDidConnect(LyteAddon,this);
    }
    static register(options){
        if(options){
          if(options._migration){
            this._migration = options._migration;
          }
        }
    }
    lookups() {
        return [];
    }

    scopedInstance() {
        return __scopedInstance.apply(this, Array.from(arguments));
    }

    get __isAddon() {
        return true;
    }
    
}
// LyteAddon.prototype.resolvePromises = function(promises) {
//     return new Promise(function(res, rej) {
//       resolvePromises(promises).then(function(data) {
//         res(data);
//       },function(data) {
//         rej(data);
//       })
//     })
// }
LyteAddon._component = {};
// LyteAddon.error = Logger.error.bind(Logger);
// LyteAddon.warn = Logger.warn.bind(Logger);
// LyteAddon.errorCodes = Logger.errorCodes;

export { LyteAddon };