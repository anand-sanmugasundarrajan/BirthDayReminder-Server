import {_LC } from "@slyte/component";
// import { Lyte } from "@slyte/core";
import { Service } from "@slyte/core";
class V3Registry extends Service {
    render(componentName, data, outlet, _lyteOptions){
        var component;
        let decideReg = _LC.getDecidedRegistry();
        if(componentName && _LC.validateRenderData(data)) {
            _LC.setDecidedRegistry(V3Registry);
            if(typeof componentName == "string") {
                component = document.createElement(componentName);
            } else {
                Lyte.error("LC007");  //no i18n  
                _LC.setDecidedRegistry(decideReg);
                return;
            }
        } else {
            Lyte.error("LC007");//no i18n
            _LC.setDecidedRegistry(decideReg);
            return;
        }
        if(data){ 
            component.setData(data);
        }
        if(outlet) {
            let actOutlet;
            if(typeof outlet == "string"){
                actOutlet = document.querySelector(outlet);
            }else{
                actOutlet = outlet;
            }
            if(actOutlet) {
                if(_lyteOptions && _lyteOptions.clearOutlet){
                    actOutlet.innerHTML = "";    
                }
                actOutlet.appendChild(component);
                component._callee = component.getCallee ? component.getCallee(actOutlet) : undefined;
            } else {
                Lyte.error("LC008", outlet);//no i18n
            }
        }
        _LC.setDecidedRegistry(decideReg);
        return component;
    }
}
export {V3Registry}