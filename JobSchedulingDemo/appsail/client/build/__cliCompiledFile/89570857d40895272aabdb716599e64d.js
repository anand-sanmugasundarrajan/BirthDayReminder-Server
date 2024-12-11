import { Service } from "@slyte/core";
import { getConfig,getCurrentRouterInstance,removeStateFromMap,addStateToMap } from "@slyte/core/src/lyte-utils.js";
class StateHandler extends Service {
    createMap(list) {
        const map = {};
        list.forEach((ele) => {
            ele.match(this.eRegex) && (map[ele] = true);
        });
        return map;
    }


    overrideXHR() {
        let XHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            let event = window.event,
                type,
                lTarget = event ? event.$lTarget : undefined,
                target = event ? event.target : undefined,
                router;

            if (lTarget && target && getConfig((type = event.type), lTarget) == "true") {
                if (event) {
                    target && target.getAttribute && target.getAttribute("lyte-state-handling") != "false" ? addStateToMap(type, target, this) : undefined;//no i18n
                }
            } else if (router = getCurrentRouterInstance()) {
                let currentAction = router.navigation ? router.navigation.ev : undefined;
                lTarget = currentAction ? currentAction.$lTarget : undefined;
                target = currentAction ? currentAction.target : undefined;
                type = currentAction ? currentAction.type : undefined;
                if (lTarget && target && getConfig(type, lTarget)) {
                    if (target.getAttribute && target.getAttribute("lyte-state-handling") != "false") {
                        let mp = window.__transXHRMap = window.__transXHRMap || new Map();
                        mp.set(router.navigation, {
                            currentAction: currentAction,
                            XHR: this
                        });
                        addStateToMap(type, target, this);
                    }
                }
            }
            XHRSend.apply(this, arguments);
        }
    }

    static setState(str){
        if(!str){
          console.error("Please provide a state name");
        }
        let type = event.type,
            lTarget = event ? event.$lTarget : undefined,
            target = event ? event.target : undefined;
        if(target && lTarget && getConfig(type,lTarget) == "true" && target && target.getAttribute && target.getAttribute("lyte-state-handling") != "false"){
            if(!target.getAttribute("lyte-state")){
                let mp = this.__stateMap = this.__stateMap || new Map();
                if(!mp.get(str)){
                    let obj = addStateToMap(type, target, undefined, str);
                    mp.set(str, obj);
                }
                else{
                    console.error("There is already a open state by the name",str);
                }
            }
        }     
    }

    static removeState(str){
        if(!str){
            console.error("Please provide a state name");
        }
        let mp = this.__stateMap;
        if(mp){
            let obj = mp.get(str);
            if(obj){
                mp.delete(str);
                removeStateFromMap(str, obj.event, obj.target);
            }
        }
    }
    constructor(ins, options) {
        super();
        this.eRegex = /^(click|dblclick|mouseover|mouseout|mousemove|mousedown|mouseup|contextmenu|keydown|keyup|keypress|submit|reset|focus|blur|input|change|select|load|resize|scroll|unload|beforeunload|DOMContentLoaded|readystatechange|touchstart|touchmove|touchend|touchcancel|play|pause|ended|volumechange|durationchange|ratechange|dragstart|drag|dragenter|dragleave|dragover|drop|dragend)$/gm;
        if (!ins.$StateHandler) {
            this.overrideXHR();
        }
        if (ins && options && options.event) {
            ins.__proto__.__config = ins.__proto__.__config || {};
            Object.assign(ins.__proto__.__config,this.createMap(options.event));
        }
    }
}
export {
    StateHandler
};