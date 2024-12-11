import { createCustomClass, getClass, getSuperClass } from "./lyte-utils.js";
import {Lyte} from "./lyte.js";
let registeredMixin = {};
let Mixin = createCustomClass(function(arg1,overrides){
    class Mixin extends getClass([],arg1) {
        static register(options){
            if(this.__lMod) {
                return super.register.apply(this, Array.from(arguments));
            }
            if(options){
                if(options.hash){
                    this._hash = options.hash;
                }
                if(options.refHash){
                    this._refHash = options.refHash;
                    var mobj = Mixin.registeredMixin[options.refHash] = Mixin.registeredMixin[options.refHash] || {};
                    mobj[this.name] = this;
                    Mixin.getAppClass(options, this);
                }
            }
        }
        static getAppClass(options, mixinCls){
            let registryClass;
            Lyte._instances.forEach(function(appIns){
                let appClass = appIns.constructor;
                if(appClass._hash == options.refHash){
                    appIns.registeredMixins[mixinCls.name] = mixinCls;
                }
            });
        }
    }
    Mixin.registeredMixin = registeredMixin;
    return overrides(Mixin)
})
export { Mixin };
