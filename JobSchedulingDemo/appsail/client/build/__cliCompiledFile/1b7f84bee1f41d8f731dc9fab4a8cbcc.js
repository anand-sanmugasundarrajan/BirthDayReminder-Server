import { _LC } from "../lyte-component.js";
import { Lyte } from "@slyte/core";

function renderHTML(string,outlet,options){
    var currentReg = _LC.getCurrentRegistryIns();
    _LC.setCurrentRegistryIns(options && options.registryInstance ? options.registryInstance : _LC.getDefaultRegistryIns());
    if(typeof string == "string") {
        if(outlet) {
            let actOutlet;
            if(typeof outlet == "string"){
                actOutlet = document.querySelector(outlet);
            }else{
                actOutlet = outlet;
            }
            if(actOutlet) {
                actOutlet.innerHTML = string;
            } else {
                Lyte.error("LC008", outlet);
            }
        }
    }
    _LC.setCurrentRegistryIns(currentReg);
}
export default renderHTML;