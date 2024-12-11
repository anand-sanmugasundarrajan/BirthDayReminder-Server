import { Lyte } from "@slyte/core";
import { _LC } from "@slyte/component";
function loadComponent(componentName,registryClass) {
    if(!registryClass || !registryClass._hash){
        registryClass = _LC.getDefaultRegistry();
    }
    if(typeof componentName === "string") {
      componentName = [componentName];
    }
    var promises = [];
    var downloadType = "component";
    for(var i=0;i<componentName.length;i++) {
        let cmpName = componentName[i];
        let hash = registryClass._hash;
        if(typeof cmpName == "object"){
            hash = cmpName.registry ? cmpName.registry._hash : hash;
            cmpName = cmpName.name;
        }
        if(cmpName.indexOf("/") != -1){
            downloadType = "path";
        }
        if(Lyte._componentMap){
            var nameMap = Lyte._componentMap[downloadType][hash];
            if(nameMap){
                var arr = nameMap[cmpName];
                if(arr && arr.length){
                    for(let j=0; j<arr.length;j++){
                        var script = document.createElement("script");
                        var src = arr[j]; //need to remove once cli gave full path
                        script.setAttribute("src", src);
                        document.head.appendChild(script);
                        promises.push(createPromiseScript(script))
                    }
                }else{
                    Lyte.error("No component mapping available for component name "+ cmpName + "in the registry" + registryClass.name + " .");
                }
            }else{
                Lyte.error("No mapping available for " + registryClass.name + "  registry.");
            }
        }else{
            Lyte.error("No mapping JSON available");
        }
    }
    return Promise.all(promises);
}
function createPromiseScript(script) {
    return new Promise(function(resolve, reject) {
        script.onload = script.onreadystatechange = function() {
            if(!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                resolve();
            }
        }
    });
}
export {loadComponent};
