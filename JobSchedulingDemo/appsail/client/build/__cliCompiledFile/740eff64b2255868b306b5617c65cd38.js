// import { Lyte } from "@slyte/core";
// import { Compile } from '@slyte/component/src/lyte-base-compile.js';
// import { expHandlers } from "../expHandlers/js";
// import { _LC, doCompile} from "./lyte-component.js";
// import { _LC,doCompile ,expHandlers,Espree } from "./lyte-component";
// function ClientCompiler(Lyte, _LC, Compile,doCompile ,expHandlers,Espree) {
    // if(!document){
    //     var document = undefined;
    // }
    // if(!window){
    //     var window = {};
    // }
    let Compile = {};
    Compile.fromCLI = undefined;
    Compile.defaultImpDetails = {
        components: [],
        helpers: [],
        alreadyImported: false
    };
    Compile.htmlStr = {},
    Compile.pushDir = function(dirName){
        if(this.defaultDirectives.indexOf(dirName) != -1){
            let actDirName = this.dirMap[dirName];
            if(actDirName && this.impObj.defaultDirectives.indexOf(actDirName) == -1){
                this.impObj.defaultDirectives.push(actDirName);
            }else if(this.impObj.defaultDirectives.indexOf(dirName) == -1){
                this.impObj.defaultDirectives.push(dirName);
            }
        }
        else if(this.impObj.directives.indexOf(dirName) == -1){
            this.impObj.directives.push(dirName);
        }
    }
    Compile.dirMap = {
        "shadow-supported" : "lyte-shadow",
        "shadow" : "lyte-shadow",
        "turbo-supported" : "lyte-turbo",
        "unbound" : "lyte-turbo",
        "turbo" : "lyte-turbo",
        "view-in" : "lyte-view",
        "view-out" : "lyte-view"
    }
    Compile.impObj = {
        "components": [],
        "helpers": [],
        "directives" : [],
        "defaultDirectives" : [],
        "defaultComponents" : [],
        "registryMap": {},
        "options" : {
            "internalSlicer" : {}
        }
    };
    Compile.debug = true;
    Compile.needDummyComponentsDiv = true;
    Compile.defaultComponents = ["link-to"];
    Compile.defaultSrcComponents = ["lyte-event-listener","import-shadow-style"];
    Compile.defaultHelpers = ["unbound", "action", "lbind", "method", "unescape", "escape", "debugger", "log", "ifEquals", "if", "negate", "ifNotEquals", 'concat', 'encAttr', 'expHandlers'];
    Compile.defaultDirectives = ["shadow","shadow-supported","turbo","turbo-supported","view-in","view-out","unbound"];
    Compile.addUnbound = function(node,template,tagName,parentElementName){
        let hasUnbound,unboundVal,hasFastRender,fastRenderVal;
        if(node.hasAttribute("@unbound")){
            hasUnbound = true;
            unboundVal  = node.getAttribute("@unbound");
            node.removeAttribute("@unbound");
        }
        if(node.hasAttribute("@turbo")){
            hasFastRender = true;
            fastRenderVal  = node.getAttribute("@turbo");
            node.removeAttribute("@turbo");
        }
        if(hasUnbound || hasFastRender){
            let unboundHtml;
            if(unboundVal || fastRenderVal){
                unboundHtml = "<" + tagName;
                if(hasUnbound){
                    if(unboundVal){
                        unboundHtml = unboundHtml + " @unbound=" + unboundVal;
                    }else{
                        unboundHtml = unboundHtml +" @unbound";
                    }
                }
                if(hasFastRender){
                    if(fastRenderVal){
                        unboundHtml = unboundHtml + " @turbo=" + fastRenderVal;
                    }else{
                        unboundHtml = unboundHtml +" @turbo";
                    }
                }
                unboundHtml = unboundHtml + ">" + "</" + tagName + ">";
            }else if(hasUnbound){
                unboundHtml = "<"+ tagName +" @unbound></"+ tagName +">";
            }else if(hasFastRender){
                unboundHtml = "<"+ tagName +" @turbo></"+ tagName +">";
            }
            let root = "div";
            if(parentElementName){
                root = parentElementName;
            }
            let div = document.createElement(root);
            div.innerHTML = unboundHtml;
            template = div.firstChild;
        }else{
            template = document.createElement(tagName);
        }
        return template;
    }
    
    Compile.getImpDetails = function (node) {
        var obj = {};
        var name = node.attr.name;
        var from = node.hasAttribute("from") ? node.attr.from : false;
        try {
            name = JSON.parse(name);
        } catch (e) {

        }
        if (!Array.isArray(name)) {
            name = [name];
        }
        obj.name = name;
        if (from) {
            obj.from = from;
        }
        return obj;
    }
    Compile.impDetails = function (node, impObj) {
        var nodeType = node.tag;
        var obj = {};
        let compArr = impObj.components;
        let helpersArr = impObj.helpers;
        let pushToObj = function (obj, arr) {
            let names = obj.name;
            let length = names.length;
            for (let i = 0; i < length; i++) {
                impObj.registryMap[names[i]] = obj.from;
            }
            // arr.push(...names);
            names.forEach(function(name){
                arr.push(name);
            })
        }
        switch (nodeType) {
            case "import-component": {
                obj = this.getImpDetails(node);
                pushToObj(obj, compArr);
            }
            break;
        case "import-helper": {
            obj = this.getImpDetails(node);
            pushToObj(obj, helpersArr);
        }
        break;
        }
    }
    Compile.checkForMixedCase = function(val) {
        let seenDoubleQuotes = false,
            seenSingleQuotes = false,
            mustacheStarted = false,
            mixedCase = false;
        let slashCount = 0;
        let mustacheSpots = [],res = "",mus={};
        for (var i = 0; i < val.length; i++) {
            //remove spaces other than present in double and single quotes
            if (mustacheStarted && ((seenDoubleQuotes || seenSingleQuotes) || val[i].match(/\S/))) {
                res += val[i];
            }
            if (val[i - 1] != "\\" && val[i] == "{" && val[i + 1] == "{" && !seenDoubleQuotes && !seenSingleQuotes) {
                if(mustacheStarted){
                    return {
                        bool:false,
                        errorIndex:i-mus.index[0]+1,
                        err:"Invalid dynamic value inside dynamic value `{{`"
                    };
                }
                if (!mixedCase && i != 0) {
                    mixedCase = true
                }
                mus = {}
                mus.index = [i];
                // spot[0] = i;
                mustacheStarted = true;
            }
            if (val[i] == "}" && val[i + 1] == "}" && !seenDoubleQuotes && !seenSingleQuotes && mustacheStarted) {
                if (!mixedCase && i + 1 != val.length - 1) {
                    mixedCase = true
                }
                // spot[1] = i + 1;
                mus.index[1] = i + 1;
                mus.orgMus = val.substring(mus.index[0],mus.index[1]+1);
                mus.mus = "{"+res+"}";
                res = "";
                mustacheSpots.push(mus);
                mustacheStarted = false;
            }
            if (val[i] == "\\") {
                slashCount++;
            }
            if (val[i - 1] != "\\" || (val[i - 1] == "\\" && slashCount % 2 == 0)) {
                if (val[i] == "'" && !seenDoubleQuotes && mustacheStarted) {
                    seenSingleQuotes = !seenSingleQuotes;
                }
                if (val[i] == '"' && !seenSingleQuotes && mustacheStarted) {
                    seenDoubleQuotes = !seenDoubleQuotes;
                }
            }
            if (val[i] != "\\") {
                slashCount = 0;
            }
    
        }
        return {
            bool:true,
            mixedCase: mixedCase,
            mustacheSpots: mustacheSpots
        };
    }
    Compile.processAttr = function (componentName, node, deepNodes, deepN, is, strict, errors, warnings) {
        if (node.hasAttributes && node.hasAttributes()) { //template has no attributes
            let add = false,
                toBeRemoved = [],
                toBeAdded = [],
                tempObj = {};
            var attr = {};
            let nodeAttrType = node.attrType;
            for (let i = 0; i < node.attributes.length; i++) {
                let fnFlag;
                let eventListRegex = this.regex.eventListRegexFull;
                if (eventListRegex.test(node.attributes[i].nodeName) && strict) {
                    fnFlag = true;
                }
                if (node.attributes[i].nodeValue.indexOf("{{") !== -1) {
                    let actObj, actValue;
                    let val = node.attributes[i].nodeValue;
                    if (this.fromCLI) {
                        if (nodeAttrType[node.attributes[i].nodeName] == "Mixed") {
                            actObj = this.splitMixedText(val, componentName, errors);
                        } else if (nodeAttrType[node.attributes[i].nodeName] == "helper") {
                            actValue = this.getMustache(val, {
                                bool: true
                            });
                            if (actValue) {
                                actObj = this.getArray(actValue);
                                if (actObj && actObj == "timeoutError") {
                                    errors.push(new Error("(LC:timeout7)Syntax error in node " + node.node + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].text));
                                    continue;
                                } else if (actObj === false) {
                                    errors.push(new Error("(LC:12)Syntax error in node " + node.node + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].text));
                                    continue;
                                }
                            }
                            if (!actObj && actValue) {
                                actObj = this.getHelper(actValue);
                                actValue = actValue.replace('____lyteinternal____', '.{}');
                                if (actObj && actObj.args == "lbindError" || actObj == "lbindError") {
                                    errors.push(new Error("(LC:lbind4)Syntax Error : lbind are not allowed inside helpers on node " + node.node + " for: " + node.attributes[i].text));
                                    continue;
                                } else if (actObj && actObj.name == "lbind" && node.tagName == "TEMPLATE" && node.hasAttribute("is") && this.regex.lyteTemplateType1.test(node.attr.is)) {
                                    errors.push(new Error("(LC:lbind3)Syntax Error : lbind not allowed as value in if/for/switch node" + "for: " + val));
                                } else if (actObj && actObj == "timeoutError") {
                                    errors.push(new Error("(LC:timeout4)Syntax error in node " + node.node + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].text));
                                    continue;
                                } else if (actObj === false) {
                                    errors.push(new Error("(LC:7)Syntax error in node " + node.node + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].text));
                                    continue;
                                }
                                if (actObj) {
                                    if (this.defaultImpDetails.helpers.indexOf(actObj.name) == -1 && this.defaultHelpers.indexOf(actObj.name) == -1) {
                                        this.defaultImpDetails.helpers.push(actObj.name);
                                    }
                                    this.getImportedHelpers(actObj.args, this.defaultImpDetails.helpers);
                                }
                            }
                        } else if (nodeAttrType[node.attributes[i].nodeName] == "Multi-dimensional array") {
                            actObj = this.getArray(val);
                            if (actObj && actObj == "timeoutError") {
                                errors.push(new Error("(LC:timeout7)Syntax error in node " + node.node + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].text));
                                continue;
                            } else if (actObj === false) {
                                errors.push(new Error("(LC:12)Syntax error in node " + node.node + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].text));
                                continue;
                            }
                            if (!actObj) {
                                actValue = this.getMustache(val, {
                                    bool: true
                                });
                                if (actValue && typeof actValue === 'object') {
                                    if (actValue.bool === false) {
                                        continue;
                                    }
                                }
                            }
                        } else {
                            actValue = this.getMustache(val, {
                                bool: true
                            });
                            if (actValue && typeof actValue === 'object') {
                                if (actValue.bool === false) {
                                    // errors.push(new Error("Syntax error in node "+actValue.err+" in "+node.node+" for the attribute: "+node.attributes[i].nodeName+" - "+node.attributes[i].text +" in the component "+componentName));
                                    continue;
                                }
                            }
                        }
                    } else {
                        node.attributes[i].nodeValue = node.attributes[i].nodeValue.replace('.{}', '____lyteinternal____').trim();
                        val = node.attributes[i].nodeValue;
                        let res = this.checkForMixedCase(val);
                        if (res.bool) {
                            let {
                                mustacheSpots
                            } = res;
                            if (mustacheSpots.length && mustacheSpots.length > 0) {
                                for (let j = 0; j < mustacheSpots.length; j++) {
                                    let x = mustacheSpots[j].mus
                                    if(x.match(/\&|\||\!|\=|\+|-|\*|\/|<|>|\?|:|%/gm)){
                                        x = this.trimAttr(x, errors, node, node.attributes[i], componentName);
                                    }
                                    val = val.replace(mustacheSpots[j].orgMus,function(){return x});
                                }
                            }
                            node.attributes[i].nodeValue = val;
                        }
                        let syn = this.syntaxCheckWorkerNew(node.attributes[i].nodeValue);
                        if (!syn.bool) {
                            errors.push(new Error("(LC:syn2)Syntax error in node " + syn.err + " in " + node.nodeName + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].nodeValue + " in the component " + componentName));
                            continue;
                        }
                        var splittedMus = val.split("{{");
                        var splittedMusLen = splittedMus.length;
                        if (syn && syn.mustache > 0) {
                            splittedMusLen = splittedMusLen - syn.mustache;
                        }
                        var ind = val.indexOf("}}");
                        if ((splittedMusLen > 2 || !this.regex.startWithMustacheRegex.test(val) || !this.regex.endWithMustacheRegex.test(val)) || val[ind + 2] && this.regex.baseCaseMustacheCheck.test(val) && !this.regex.commentedMustacheCheck.test(val)) {
                            actObj = this.splitMixedText(val, componentName, errors, node, i);
                        } else {
                            actValue = this.getMustache(val, componentName, syn);
                            if (actValue && actValue == "timeoutError") {
                                errors.push(new Error("(LC:timeout3)Syntax error in node " + actValue.err + " in " + node.nodeName + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].nodeValue));
                                continue;
                            }
                            console.log("actValue response " + actValue + "val given to mustache" + val)
                            if (actValue && typeof actValue === 'object') {
                                if (actValue.bool === false) {
                                    errors.push(new Error("(LC:6)Syntax error in node " + actValue.err + " in " + node.nodeName + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].nodeValue));
                                    continue;
                                }
                            }
                            if (actValue) {
                                actObj = this.getArray(actValue);
                                if (actObj && actObj == "timeoutError") {
                                    errors.push(new Error("(LC:timeout7)Syntax error in node " + node.nodeName + " for the attribute: " + node.attributes[i].nodeName + " - " + node.attributes[i].nodeValue));
                                    continue;
                                } else if (actObj === false) {
                                    errors.push(new Error("(LC:12)Syntax error in node " + node.nodeName + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].nodeValue));
                                    continue;
                                }
                            }
                            if (!actObj && actValue) {
                                actValue = actValue.replace('____lyteinternal____', '.{}');
                                actObj = this.getHelper(actValue);
                                if (actObj && actObj.args == "lbindError" || actObj == "lbindError") {
                                    errors.push(new Error("(LC:lbind4)Syntax Error : lbind are not allowed inside helpers on node " + node.nodeName + " for: " + node.attributes[i].nodeValue));
                                    continue;
                                } else if (actObj && actObj.name == "lbind" && node.tagName == "TEMPLATE" && node.hasAttribute("is") && this.regex.lyteTemplateType1.test(node.getAttribute("is"))) {
                                    errors.push(new Error("(LC:lbind3)Syntax Error : lbind not allowed as value in if/for/switch node" + "for: " + val));
                                } else if (actObj && actObj == "timeoutError") {
                                    errors.push(new Error("(LC:timeout4)Syntax error in node " + node.nodeName + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].nodeValue));
                                    continue;
                                } else if (actObj === false) {
                                    errors.push(new Error("(LC:7)Syntax error in node " + node.nodeName + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].nodeValue));
                                    continue;
                                }
                            }
                        }
                    }
                    if (actObj && (actObj.name === "action" || actObj.name === "method") && this.regex.eventListRegexPart.test(node.attributes[i].name)) {
                        add = true;
                        if (!this.fromCLI) {
                            attr[node.attributes[i].name.substr(2)] = {
                                name: node.attributes[i].name.substr(2),
                                helperInfo: actObj,
                                globalEvent: true
                            };
                        }
                        let actArgs = this.deepCopyObject(actObj.args);
                        let actName = actArgs.splice(0, 1)[0];
                        if (typeof actName != 'string' || !actName.startsWith("'")) {
                            errors.push(new Error(" action or method must start with string on " + node.nodeName + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].nodeValue));
                        } else {
                            actName = actName.startsWith("'") ? actName.replace(/'/g, '') : actName;
                        }
                        "came in 2033"
                        //node.setAttribute(node.attributes[i].name.substr(2),componentName+" => "+ actString);
                        toBeRemoved.push(node.attributes[i].name);
                    } else {
                        if (actObj && (actObj.name === "action" || actObj.name === "method")) {
                            if (actObj.args && (typeof actObj.args[0] === 'object' || !actObj.args[0].startsWith("'"))) {
                                warnings.push({
                                    message: " action or method must start with string on " + node.nodeName + " for the attribute:" + node.attributes[i].nodeName + "- " + node.attributes[i].nodeValue
                                });
                            }
                        }
                        if (actObj || actValue) {
                            add = true;
                            let attrToPush = {};
                            if (node.attributes[i].name.startsWith("lbind:")) {
                                toBeRemoved.push(node.attributes[i].name);
                                toBeAdded.push({
                                    "name": node.attributes[i].name.substring(6),
                                    "value": node.attributes[i].nodeValue
                                });
                                attrToPush.isLbind = true;
                                attrToPush.name = node.attributes[i].name.substring(6);
                            } else {
                                attrToPush.name = node.attributes[i].name;
                            }
                            if (actObj) {
                                if (actObj.name === "lbind") {
                                    attrToPush.dynamicValue = actObj.args[0];
                                    attrToPush.isLbind = true;
                                } else {
                                    attrToPush.helperInfo = actObj;
                                }
                            } else {
                                attrToPush.dynamicValue = actValue;
                                //                              LN to do
                                //                              attrToPush.dynamicValue = getDynamicValue(actValue);
                            }
                            add = true;
                            attr[attrToPush.name] = attrToPush;
                        }
                    }
                    node.attributes[i].nodeValue = node.attributes[i].nodeValue.replace('____lyteinternal____', '.{}');
                    if (fnFlag && !(actObj && (actObj.name === "action"))) {
                        let err = new Error("(LC:22)Strict-Mode: Please specify action in " + node.nodeName + " for attribute-" + node.attributes[i].nodeName);
                        err.strict = true;
                        errors.push(err);
                    }
                } else {
                    if (fnFlag) {
                        let err = new Error("(LC:23)Strict-Mode: Please specify action in " + node.nodeName + " for attribute-" + node.attributes[i].nodeName);
                        err.strict = true;
                        errors.push(err);
                    }
                }
                if (node.attributes[i].name.startsWith("@")) {
                    add = true;
                    node._special = true;
                    let attrToPush = {};
                    attrToPush.name = node.attributes[i].name;
                    attrToPush.dynamicValue = node.attributes[i].nodeValue;
                    attr[attrToPush.name] = attrToPush;
                    attr._special = true;
                }
            }
            
            if (attr && add) {
                let dummyAttr = {};
                let keys = Object.keys(attr);
                if (keys.indexOf("style") !== -1) {
                    dummyAttr.style = attr.style;
                }
                if (keys.indexOf("type") !== -1 && (node.tagName === "BUTTON" || node.tagName === "INPUT")) {
                    dummyAttr.t = attr.type;
                }
                if (node.tagName === "INPUT" && node.getAttribute("type") === "number") {
                    dummyAttr.value = attr.value;
                }
                if (keys.indexOf("placeholder") !== -1 && node.tagName === "TEXTAREA") {
                    node.removeAttribute("placeholder");
                    dummyAttr.placeholder = attr.placeholder;
                }
                let obj = {
                    "t": "a",
                    p: deepN.slice()
                };
                if (node._special) {
                    obj.trans = true;
                }
                if (Object.keys(dummyAttr).length) {
                    obj.a = dummyAttr;
                }
                deepNodes.push(obj);
            }
        }
        return attr;
    }
    Compile.getImportedHelpers = function (array, helperArr) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] && typeof array[i] === "object") {
                let helperName = array[i].value.name;
                if (helperArr.indexOf(helperName) == -1 && this.defaultHelpers.indexOf(helperName) == -1) {
                    helperArr.push(helperName);
                }
                array[i] = this.getImportedHelpers(array[i].value.args, helperArr);
            }
        }
    }
    Compile.elifHold = false;
    Compile.getArgString = function (name, array) {
        let retString;
        for (let i = 0; i < array.length; i++) {
            // console.log("array content"+JSON.stringify(array[i]));
            if (array[i] && typeof array[i] === "object") {
                array[i] = this.getArgString(array[i].value.name, array[i].value.args);
            }
        }
        if (name) {
            retString = name + "(" + array.toString() + ")";
        } else {
            retString = array.toString();
        }
        return retString;
    }
    Compile.trimAttr = function (tempVal, errors, node, attrNode, componentName, check = {}) {
        let trimmedVal;
        trimmedVal = tempVal.replace(this.regex.keyWordsRegex, '__LyteHelper$1__')
        try {
            let expOutput;
            // if (check.fromParser) {
            expOutput = this.expHandlers.handleExpression(this.Espree.parse(trimmedVal), true);
            // } else {
            //     expOutput = expHandlers.handleExpression(Espree.parse(trimmedVal), true);
            // }
            if (expOutput && (expOutput !== trimmedVal)) {
                expOutput = expOutput.replace(this.regex.lyteHelperRegex, '$1');
                tempVal = "{{" + expOutput + "}}";
            }
        } catch (e) {
            trimmedVal = trimmedVal.replace(this.regex.lyteHelperRegex, '$1');
            tempVal = trimmedVal;
            if (check.fromParser && !e.message.match(/^Unexpected token \.\d+$/gm)) {
                capturedError = {
                    bool: false,
                    err: e.message,
                    warning: null,
                    errorIndex: e.index
                };
            } else if (!check.fromParser && e.message === "Only helper function calls are allowed") {
                if (attrNode) {
                    e.message = "(LC:1)Syntax error in node " + node.nodeName + " for the attribute: " + attrNode.nodeName + " - " + attrNode.nodeValue + ". Only helper function calls are allowed"
                    errors.push(new Error(e));
                } else {
                    e.message = "(LC:2)Syntax Error in node " + node.nodeName + " for :" + node.nodeValue + ". Only helper function calls are allowed"
                    errors.push(new Error(e));
                }
            }
        }
        return tempVal;
    }
    // window.pendingComponents = [];

    Compile.getDynamicNodes = function(fileName, resolve, templateToRender, fromCLIFlag, errorObj) {

        this.fromCLI = fromCLIFlag;
        if( fromCLIFlag ) {
            global.window = {};
        }
        else if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            globalThis.window = {};
        }
        window.pending = true;
        let returnValue, missingComp;
        let s, comp, errors = [],
            warnings = (this.fromCLI) ? errorObj.warnings : [];
        if (templateToRender && !this.fromCLI) {
            comp = templateToRender;
        } else {
            if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
                globalThis.document = templateToRender;
            }
            else{
                global.document = templateToRender;
            }
            comp = document.querySelector("template[tag-name='" + fileName + "']")
        }
        //console.log("components generating dynamicNodes"+fileName)
        if (!comp) {
            missingComp = fileName;
            errors.push(new Error("Cannot find template " + fileName));
            returnValue = {
                componentName: fileName,
                errors: errors,
                warning: warnings
            };
        } else {
            var nextElement = comp.nextElementSibling;
            if(nextElement && nextElement.tagName == "TEMPLATE" && nextElement.hasAttribute("view-port-template")) {
                var viewPortIf = document.createElement("template");
                viewPortIf.setAttribute("lyte-if", "{{lyteViewPort}}");
                viewPortIf.setAttribute("vpc","true");
                viewPortIf.content.appendChild(document.createElement("dummy-port-element"));
                viewPortIf.content.appendChild(nextElement.content);
                viewPortIf.content.appendChild(document.createElement("dummy-port-element"));
                var falseCase = document.createElement("template");
                falseCase.setAttribute("lyte-else","");
                falseCase.content.appendChild(comp.content);
                comp.innerHTML = "";
                comp.content.appendChild(viewPortIf);
            }
            s = comp.content;
        }
        if (s) {
            if (!this.fromCLI) {
                this.splitTextNodes(s, warnings);
            }
            let dynamicNodes = [];

            var attrStrict = comp.getAttribute("use-strict");
            var strict = (attrStrict == false ||  attrStrict == "false") ? attrStrict : attrStrict == undefined ? window.useStrict: attrStrict;
            if(strict == "false") {
                strict = false;
            } else if(strict == "true") {
                strict = true;
            }
            
            if (strict) {
                if (s.querySelector("script")) {
                    let e = new Error("Security: Script tags should not be included")
                    e.strict = true;
                    errors.push(e)
                }
                if (s.querySelector("style")) {
                    let e = new Error("Security: Style tags should not be included")
                    e.strict = true;
                    errors.push(e)
                }
            }
            let d = [];
            try {
                this.newGetDeepNodes(fileName, comp, d, [], undefined, true, errors, warnings);
                this.processTemplate(s, dynamicNodes, fileName, strict, errors, warnings);
                this.getTransitionOrder(dynamicNodes);
            } catch (e) {
                console.log("Error from getDynamicNodes:-\n", e);
            }
            let obb = {};
            this.getTemplateDirectChild(dynamicNodes, obb);
            if (obb && (obb.hc || obb.trans)) {
                let newobb = {
                    "type": "dc",
                    "trans": obb.trans,
                    hc: obb.hc,
                    p: obb.dc
                }
                dynamicNodes.push(newobb);
            }
            let attr = comp.attributes;
            for(let i = 0; i< attr.length; i++){
                let attrName = attr[i].name;
                if(attrName.startsWith("@")){
                    let dirName = attrName.split("@")[1];
                    this.pushDir(dirName);
                }
            }
            if (errors.length) {
                returnValue = {
                    componentName: fileName,
                    errors: errors,
                    warnings: warnings
                };
            } else {
                let template = comp.outerHTML;
                if(this.fromCLI){
                    template = "_template = " + JSON.stringify(template+"____cssContent")+";";
                    dynamicNodes ="_dynamicNodes = " + JSON.stringify(dynamicNodes)+";";
                }
                else{
                    template = JSON.stringify(template);
                }
                // console.log("defaultDirectives - ", this.impObj.defaultDirectives);
                returnValue = {
                    componentName: fileName,
                    dynamicNodes,
                    template,
                    _templateAttributes: d[0],

                    // ,
                    // ...(this.fromCLI ? {
                    //     importDetails: this.impObj,
                    //     needToImpDetails: this.defaultImpDetails
                    // } : {})
                    warnings: warnings
                };
                if(this.fromCLI){
                    returnValue.importDetails = Compile.deepCopyObject(this.impObj);
                    returnValue.needToImpDetails = Compile.deepCopyObject(this.defaultImpDetails);
                }
            }
        }
        window.pending = false;
        if(this.fromCLI){
            if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
                globalThis.window && (delete globalThis.window);
                globalThis.document && (delete globalThis.document);
            }
            else{
                global.window && (delete global.window);
                global.document && (delete global.document);
            }
        }
        Compile.defaultImpDetails = this.defaultImpDetails = {
            components: [],
            helpers: [],
            alreadyImported: false
        };
        Compile.impObj = this.impObj = {
            "components": [],
            "helpers": [],
            "directives" : [],
            "defaultDirectives" : [],
            "defaultComponents" : [],
            "registryMap": {},
            "options" : {
                "internalSlicer" : {}
            }
        };
        this.fromCLI = undefined;
        return returnValue;
    }
    Compile.splitTextNodes = function (node, warnings, svg, checker = {}, errorObj, impObj) {
        var nodeName = node.localName;
        if (checker.fromMain) {
            if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
                globalThis.document = node;
            }
            else{
                global.document = node;
                
            }
            impObj = this.impObj;
            checker.fromMain = undefined;
        }
        if(checker.fromCLI){
            this.htmlStr= {
                innerHTML:"innerObj",
                outerHTML:"outerObj"
            }
        }else{
            this.htmlStr= {
                innerHTML:"innerHTML",
                outerHTML:"outerHTML"
            }
        }
        let compVal = this.defaultImpDetails.components;
        if (nodeName && nodeName.indexOf("-") != -1 && compVal.indexOf(nodeName) == -1 && this.defaultComponents.indexOf(nodeName) == -1) {
            if (nodeName == "lyte-import" || nodeName == "import-component" || nodeName == "import-helper") {
                this.defaultImpDetails.alreadyImported = true;
            } else if(this.defaultSrcComponents.indexOf(nodeName) != -1 && impObj.defaultComponents.indexOf(nodeName) == -1){
                impObj.defaultComponents.push(nodeName);
            } else {
                compVal.push(nodeName);
            }
        }
        if (node.tagName === "svg") {
            svg = true;
        }
        if (node.hasAttribute) {
            if (node.hasAttribute("is") && this.regex.lyteTemplateType2.test(node.getAttribute("is")) && node.getAttribute("_jsp") != "true" && !node.hasAttribute("lyte-for") && !node.hasAttribute("lyte-for-in") && !node.hasAttribute("lyte-if") && !node.hasAttribute("lyte-switch") && !node.hasAttribute("_new")) {
                warnings.push({
                    message: "Deprecated Syntax : '" + this.errorNodeDetails(node) + "' Change it to " + "'lyte-" + node.getAttribute("is") + "' syntax. It will not be supported in upcoming versions.\n"
                })
            }
            if (svg && node.tagName == "template" && node.hasAttribute("is") && this.regex.lyteTemplateType2.test(node.getAttribute("is"))) {
                var template = document.createElement("template");
                template[this.htmlStr["innerHTML"]] = node[this.htmlStr["innerHTML"]]
                var attrs = node.attributes;
                for (var i = 0; i < attrs.length; i++) {
                    template.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
                }
                node.replaceWith(template);
                node = template;
            }
            if (node.hasAttribute("lyte-for")) {
                let errorinfo = this.getErrorInfo(node);
                var lyteFor = node.getAttribute("lyte-for");
                var lyteForOptions = {};
                if (node.hasAttribute("lyte-options")) {
                    try {
                        lyteForOptions = JSON.parse(node.getAttribute("lyte-options"));
                    } catch (e) {
                        lyteForOptions = {};
                    }
                }
                var lyteForArr = lyteFor.split(" ");
                var template;
                if (node.tagName === "TEMPLATE") {
                    template = node;
                } else if (svg && node.tagName == "template") {
                    template = this.addUnbound(node,template,"template");
                    node.removeAttribute("lyte-for");
                    node.removeAttribute("lyte-options");
                    template[this.htmlStr["innerHTML"]] = node[this.htmlStr["innerHTML"]];
                    node.replaceWith(template);
                    node = template;
                } else {
                    template = this.addUnbound(node,template,"template");
                    node.removeAttribute("lyte-for");
                    node.removeAttribute("lyte-options");
                    template[this.htmlStr["innerHTML"]] = node[this.htmlStr["outerHTML"]];
                    node.replaceWith(template);
                    node = template;
                }
                node.removeAttribute("lyte-for");
                node.removeAttribute("lyte-options");
                if (checker.fromParser) {
                    if (!template.attrType) {
                        template.attrType = {}
                    };

                    let syn = checker.syntaxCheckWorkerNew(lyteForArr[0], checker);
                    template.setAttribute("items", syn.text);
                    template.attrType.items = syn.type;

                    syn = checker.syntaxCheckWorkerNew(lyteForArr[2] || "item", checker);
                    template.setAttribute("item", syn.text);
                    template.attrType.item = syn.type;

                    syn = checker.syntaxCheckWorkerNew(lyteForArr[3] || "index", checker);
                    template.setAttribute("index", syn.text);
                    template.attrType.index = syn.type;
                } else {
                    template.setAttribute("items", lyteForArr[0]);
                    template.setAttribute("item", lyteForArr[2] || "item");
                    template.setAttribute("index", lyteForArr[3] || "index");
                }
                template.setAttribute("is", "for");
                template.setAttribute("_new", "true");
                template.setAttribute("errorinfo", JSON.stringify(errorinfo));
                if (lyteForOptions.unbound) {
                    template.setAttribute("unbound", lyteForOptions.unbound);
                }

            } else if (node.hasAttribute("lyte-for-in")) {
                let errorinfo = this.getErrorInfo(node);
                var lyteFor = node.getAttribute("lyte-for-in");
                var lyteForOptions = {};
                if (node.hasAttribute("lyte-options")) {
                    try {
                        lyteForOptions = JSON.parse(node.getAttribute("lyte-options"));
                    } catch (e) {
                        lyteForOptions = {};
                    }
                }
                var lyteForArr = lyteFor.split(" ");
                var template;
                if (node.tagName === "TEMPLATE") {
                    template = node;
                    node.removeAttribute("lyte-for-in");
                    node.removeAttribute("lyte-options");
                } else if (svg && node.tagName == "template") {
                    template = this.addUnbound(node,template,"template");
                    node.removeAttribute("lyte-for-in");
                    node.removeAttribute("lyte-options");
                    template[this.htmlStr["innerHTML"]] = node[this.htmlStr["innerHTML"]]
                    node.replaceWith(template);
                    node = template;
                } else {
                    template = this.addUnbound(node,template,"template");
                    node.removeAttribute("lyte-for-in");
                    node.removeAttribute("lyte-options");
                    template[this.htmlStr["innerHTML"]] = node[this.htmlStr["outerHTML"]];
                    node.replaceWith(template);
                    node = template;
                }
                if (checker.fromParser) {
                    if (!template.attrType) {
                        template.attrType = {}
                    };
                    let syn = checker.syntaxCheckWorkerNew(lyteForArr[0], checker);
                    template.setAttribute("object", syn.text);
                    template.attrType.object = syn.type;

                    syn = checker.syntaxCheckWorkerNew(lyteForArr[2] || "value", checker);
                    template.setAttribute("value", syn.text);
                    template.attrType.value = syn.type;

                    syn = checker.syntaxCheckWorkerNew(lyteForArr[3] || "key", checker);
                    template.setAttribute("key", syn.text);
                    template.attrType.key = syn.type;
                } else {
                    template.setAttribute("object", lyteForArr[0]);
                    template.setAttribute("value", lyteForArr[2] || "value");
                    template.setAttribute("key", lyteForArr[3] || "key");
                }
                template.setAttribute("is", "forIn");
                template.setAttribute("_new", "true");
                template.setAttribute("errorinfo", JSON.stringify(errorinfo));
                if (lyteForOptions.unbound) {
                    template.setAttribute("unbound", lyteForOptions.unbound);
                }
            } else if (node.hasAttribute("lyte-if")) {
                var modifiedIf = this.handleLyteIf(node, svg, checker, errorObj);
                node.replaceWith(modifiedIf);
                node = modifiedIf;
            } else if (node.hasAttribute("lyte-switch")) {
                // handleLyteSwitch(node,svg);//af check
                var modifiedSwitch = this.handleLyteSwitch(node, svg, checker, errorObj);
                node.replaceWith(modifiedSwitch);
                node = modifiedSwitch;
            } else if (svg && node.tagName == "template" && node.hasAttribute("is") && this.regex.lyteTemplateType2.test(node.getAttribute("is"))) {
                var template = document.createElement("template");
                template[this.htmlStr["innerHTML"]] = node[this.htmlStr["innerHTML"]]
                var attrs = node.attributes;
                for (var i = 0; i < attrs.length; i++) {
                    template.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
                }
                node.replaceWith(template);
                node = template;
            } else if (node.hasAttribute("is") && node.getAttribute("is") == "if") {
                var modifiedIf = this.jspIfToSwitch(node, checker);
                node.replaceWith(modifiedIf);
                node = modifiedIf;
            }
            for(let i=0; i<node.attributes.length; i++){
                let attrName = node.attributes[i].name;
                if(attrName.startsWith("@")){
                    let dirName = attrName.substring(1);
                    this.pushDir(dirName);
                    if(dirName == "view-in"){
                        // debugger
                        let attrVal = node.attributes[i].value;
                        if(attrVal.startsWith("{{")){
                            attrVal = attrVal.substring(2, attrVal.length-2);
                            node.setAttribute("lyte-if", "{{lyteViewPort(" + attrVal + ")}}");
                        }else if(attrVal === ""){;
                            node.setAttribute("lyte-if", "{{lyteViewPort()}}");
                        }
                        else{
                            node.setAttribute("lyte-if", "{{lyteViewPort(" + attrVal + ")}}");
                        }
                        node.removeAttribute(attrName);
                        if(node.nextElementSibling && node.nextElementSibling.hasAttribute("@view-out")){
                            node.nextElementSibling.removeAttribute("@view-out");
                            node.nextElementSibling.setAttribute("lyte-else","");
                            var modifiedIf = this.handleLyteIf(node,svg);
                            node.replaceWith(modifiedIf);
                            node = modifiedIf;
                        }else{
                            errors.push(new Error("(LC:26) view-out directive not found"));
                        }
                    }
                }
            }
            for(let i=0; i<node.attributes.length; i++){
                let attrName = node.attributes[i].name;
                if(attrName.startsWith("@")){
                    let dirName = attrName.substring(1);
                    this.pushDir(dirName);
                }
            }
        }

        if (node && node.childNodes && node.childNodes.length) {
            for (var i = node.childNodes.length - 1; i >= 0; i--) {
                var chlNode = node.childNodes[i];
                if (chlNode.hasAttribute) {
                    if (chlNode.hasAttribute("lyte-if-else") || chlNode.hasAttribute("lyte-else")) {
                        if (!(chlNode.previousElementSibling && (chlNode.previousElementSibling.hasAttribute("lyte-if") || chlNode.previousElementSibling.hasAttribute("lyte-else-if")))) {
                            warnings.push({
                                message: "Element with lyte-else must be preceded by a element having lyte-if or lyte-else :\n \t" + chlNode.cloneNode().outerHTML
                            })
                        }
                    } else {
                        if (checker.ide && node.childNodes[i].getAttribute("case") == "false") {
                            window.elifHold = true;
                        }
                        this.splitTextNodes(node.childNodes[i], warnings, svg, checker, errorObj, impObj);
                    }
                } else {
                    this.splitTextNodes(node.childNodes[i], warnings, svg, checker, errorObj, impObj);
                }
            }
        }
        if (node.tagName === "TEMPLATE") {
            this.splitTextNodes((node.content) ? node.content : this.createDocFragment(node), warnings, svg, checker, errorObj, impObj);
        }
        if (node.tagName == "LYTE-IMPORT") {
            for (let c = 0; c < node.children.length; c++) {
                this.impDetails(node.children[c], impObj);
            }
            if (node.previousSibling && node.previousSibling.nodeValue == " " && node.nextSibling && node.nextSibling.nodeValue == " ") {
                node.previousSibling.remove();
            }
            node.remove();
            return;
        }
        if (!checker.fromParser && node.nodeType === node.TEXT_NODE) {
            var nodeValue = node.nodeValue;
            if (nodeValue) {
                let mustacheValues = nodeValue.match(this.regex.splitTextNodesMustache); //'
                if (!mustacheValues) {
                    return;
                }
                var newNodeArray = [];
                for (var i = 0; i < mustacheValues.length; i++) {
                    var mustacheStartIndex = nodeValue.indexOf(mustacheValues[i]);
                    var mustacheEndIndex = mustacheStartIndex + mustacheValues[i].length;
                    if (mustacheStartIndex) {
                        newNodeArray.push(document.createTextNode(nodeValue.substring(0, mustacheStartIndex)));
                    }
                    newNodeArray.push(document.createTextNode(nodeValue.substring(mustacheStartIndex, mustacheEndIndex)));
                    nodeValue = nodeValue.substring(mustacheEndIndex);
                }
                newNodeArray.push(document.createTextNode(nodeValue));
                node.replaceWith.apply(node, newNodeArray);
            }
        }
    }


    //This method will run through all the nodes of the template and put the dynamicNode positions 
    //in deepNodes and helper node positions in helperNodes
    //By helper nodes, we mean all the for and if helpers which are present in the component template. 
    //The template will contain the dynamicNodes. 
    //For template contains - _forTemplate, which will contain the content and _dynamicNodes
    //If template contains - _trueCase, _falseCase, which will contain the content and _dynamicNodes.
    Compile.processTemplate = function(node, deepNodes, componentName, strict, errors, warnings, nearByParent) {
        let isBreak = node.querySelector('template[is=break]');
        if (isBreak) {
            this.getTrimmedContent(node, undefined, isBreak);
        }
        let isContinue = node.querySelector('template[is=continue]');
        if (isContinue) {
            this.getTrimmedContent(node, undefined, isContinue);
        }

        this.helperNodes = [];
        if (node.hasChildNodes()) {
            let runningIndex = 0;
            let oldParent;
            if (nearByParent == "svg" || nearByParent == "foreignObject") {
                oldParent = nearByParent;
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                let deepN = [];
                deepN.push(i);
                let index = 0;
                let tagName = node.childNodes[i].tagName;
                if (tagName) {
                    if (tagName == "svg") {
                        nearByParent = "svg";
                    } else if (tagName == "foreignObject" || tagName == "FOREIGNOBJECT") {
                        nearByParent = "foreignObject";
                    }
                    let is = node.childNodes[i].getAttribute("is");
                    if (tagName === "TEMPLATE" && is) {
                        //                        index = helperNodes.push(node.childNodes[i]);
                        //We will be adding an attribute index1 in the helper templates, 
                        //This is done because we will be storing all the helper nodes as such in an array _helperNodes in the component template. 
                        //In order to lookup to the dynamicNodes of the for template or if template, we need to have a reference of which 
                        //helper we are calling. 
                        //By this way, we will be adding an index1 Attribute which will contain index startign from 0. 
                        //This index refreshes for each component registration. 
                        //                        node.childNodes[i].setAttribute("index1", index-1);
                        this.newGetDeepNodes(
                            componentName,
                            node.childNodes[i],
                            deepNodes,
                            deepN,
                            is,
                            strict,
                            errors,
                            warnings,
                            nearByParent
                        );
                    } else {
                        this.newGetDeepNodes(componentName, node.childNodes[i], deepNodes, deepN, undefined, strict, errors, warnings, nearByParent);
                    }
                    node.childNodes[i].removeAttribute("errorinfo");
                } else {
                    this.newGetDeepNodes(componentName, node.childNodes[i], deepNodes, deepN, undefined, strict, errors, warnings, nearByParent);
                }
                nearByParent = oldParent;
            }
        }

    }
    Compile.errorNodeDetails = function (node) {
        if (node.hasAttribute("errorinfo")) {
            let errorinfo = JSON.parse(node.getAttribute("errorinfo"));
            return "`" + errorinfo.details.tagName + "`" + " with attribute " + errorinfo.details.name + "=\"" + errorinfo.details.value.replace(/@mus@/g, "{{") + "\"";
        }
        let str = node.cloneNode(true);
        str.innerHTML = ".....";
        return str.outerHTML;
    }
    //This method is the place where the deepNodes and helperNodes gets updated with the 
    //Values of the positions of dynamicNodes and helperNodes. 
    Compile.newGetDeepNodes = function(
        componentName,
        node,
        deepNodes,
        deepN,
        is,
        strict,
        errors,
        warnings,
        nearByParent
    ) {
        if (!Object.getPrototypeOf(node).querySelectorAllChildren) {
            let obj = node;
            while (obj.parent) {
                if (Object.getPrototypeOf(obj).querySelectorAllChildren && this.fromCLI) {
                    obj.refreshNode(true);
                    break;
                }
                obj = obj.parent;
            }
        }
        node._parent = node.parentNode;
        let toBePushed;
        let errorMsg = "Usage of block helpers (for|forIn|if|switch) inside the tags (TABLE|TR|SELECT) will not work in IE11. \n If your app is supported for IE11, please use lyte ui components lyte-table and lyte-dropdown instead of table and select tags respectively";
        if (node.nodeType == 8) {
            deepN.pop();
            return;
        }
        if (node.tagName && node.tagName.indexOf("-") !== -1 && node.tagName !== "LYTE-YIELD") {
            toBePushed = {
                "t": "cD",
                p: deepN.slice()
            };
        }
        if (node.tagName === "LYTE-YIELD") {
            toBePushed = {
                "t": "i",
                p: deepN.slice()
            };
        } else
        if (is === "registerYield" || is === "yield") {
            let dynamicNodes = [];
            if (node.tagName != "TEMPLATE") {
                errors.push(new Error("Syntax error in node '" + this.errorNodeDetails(node) + "' in the component " + componentName + ". Yield must be given in template tag only"));
            } else {
                this.processTemplate(node.content, dynamicNodes, componentName, strict, errors, warnings, nearByParent); //Lyte._ie ? node : 
                this.getTransitionOrder(dynamicNodes);
                toBePushed = {
                    "t": "r",
                    p: deepN.slice(),
                    "dN": dynamicNodes
                };
                this.getTemplateDirectChild(dynamicNodes, toBePushed);
            }
        } else if (is === "insertYield") {
            deepNodes.push({
                "t": "i",
                p: deepN.slice()
            });
        } else
        if (is === "for") {
            let template = node;
            node._forTemplate = {};

            if (template) {
                node._forTemplate.content = template.content;
                node._forTemplate.content._parent = template;
                let dynamicNodes = [];
                this.processTemplate(node._forTemplate.content, dynamicNodes, componentName, strict, errors, warnings, nearByParent); //Lyte._ie ? node._forTemplate : 
                this.getTransitionOrder(dynamicNodes);
                toBePushed = {
                    "t": "f",
                    p: deepN.slice(),
                    "dN": dynamicNodes
                };
                this.getTemplateDirectChild(dynamicNodes, toBePushed);
                node = this.replaceParentNode(node, "for", toBePushed, componentName, errors, true, nearByParent);
            }
        } else if (is === "forIn") {
            let template = node;
            node._forInTemplate = {};
            if (template) {
                node._forInTemplate.content = template.content;
                node._forInTemplate.content._parent = template;
                let dynamicNodes = [];
                this.processTemplate(node._forInTemplate.content, dynamicNodes, componentName, strict, errors, warnings, nearByParent);//Lyte._ie ? node._forInTemplate :
                this.getTransitionOrder(dynamicNodes);
                toBePushed = {
                    "t": "fI",
                    p: deepN.slice(),
                    "dN": dynamicNodes
                };
                this.getTemplateDirectChild(dynamicNodes, toBePushed);
            }
            node = this.replaceParentNode(node, "forIn", toBePushed, componentName, errors, true, nearByParent);
        } else if (is === "switch" || is === "if" || is == "case") {
            // if(node.parentElement && /^(SELECT|TR|TABLE)$/.test(node.parentElement.tagName)) {
            //     warnings.push({message: errorMsg});
            // }
            let casesArr = {},
                defaultArr = {};
            let defaultCase = node.content.querySelector("[default]");
            let cases = node.content.querySelectorAll("[case]");
            let currentCaseTemplate;
            let tobj = {};
            let hasDynamicCase;
            let casesOrder = [];
            let prevCaseName;
            var rtObj = {};
            for (let i = 0; i < cases.length; i++) {
                let dynamicCaseName = false;
                let casesDeepNodes = []
                let currentCase = cases[i];
                currentCaseTemplate = cases[i];
                let caseName = currentCase.getAttribute("case");
                let actCaseName = caseName;
                tobj[actCaseName] = {};
                if (is === "switch" && caseName == "") {
                    caseName = "\"\"";
                }
                if (is === "switch") { //check
                    cases[i].setAttribute("is", "case");
                }
                if (currentCase.tagName === "TEMPLATE" && (!currentCase.getAttribute("is") || currentCase.getAttribute("is") == 'case')) {
                    currentCase.setAttribute("case", caseName);
                    currentCase = currentCase.content;
                } else {
                    let temp = document.createElement('template');
                    let clone = currentCase.cloneNode(true);
                    temp.content.appendChild(clone);
                    temp.setAttribute("case", caseName);
                    clone.removeAttribute('case');
                    currentCaseTemplate = temp;
                    currentCase = temp.content;
                    cases[i].replaceWith(temp);
                }
                this.processAttr(componentName, currentCaseTemplate, casesDeepNodes, [i], is, strict, errors, warnings);
                if (casesDeepNodes.length && cases[i].getAttribute("case").startsWith("{{")) {
                    dynamicCaseName = true;
                    hasDynamicCase = true;
                    var actName = cases[i].getAttribute("case");
                    cases[i].dcn = true;
                    caseName = "lc_id_" + i;
                    currentCaseTemplate.setAttribute("lc-id", caseName);
                    tobj[caseName] = tobj[actCaseName];
                    delete tobj[actCaseName];
                }
                casesOrder.push(caseName);
                let dynamicNodes = [];
                currentCase._parent = node;
                this.processTemplate(currentCase, dynamicNodes, componentName, strict, errors, warnings, nearByParent);
                this.getTransitionOrder(dynamicNodes);
                this.getTemplateDirectChild(dynamicNodes, tobj[caseName]);
                var rtObj = {};
                if (is === "if") {
                    this.replaceCaseNode(currentCaseTemplate, componentName, errors, node, rtObj, nearByParent);
                }
                if (caseName === "") {
                    caseName = '""';
                }
                casesArr[caseName] = {
                    dN: dynamicNodes,
                    cdp: casesDeepNodes[0]
                };
                dynamicNodes.forEach((dyn) => {
                    dyn.cn = caseName;
                })
                if (dynamicCaseName) {
                    casesArr[caseName].dcn = true;
                }
                if (is === "if") {
                    continue;
                }
                var prevCase = casesArr[prevCaseName];
                if (dynamicCaseName && prevCase && prevCase.additional && prevCase.additional.next) {
                    prevCase.additional.next = cases[i].getAttribute("lc-id");
                }
                let isBreak = currentCase.querySelector("template[is=break]");
                if (!isBreak) {
                    if (cases[i + 1]) {
                        casesArr[caseName].additional = {
                            "next": cases[i + 1].getAttribute("case")
                        };
                    } else if (defaultCase) {
                        casesArr[caseName].additional = {
                            "default": true
                        };
                    }
                } else {
                    isBreak.remove();
                }
                this.replaceCaseNode(currentCaseTemplate, componentName, errors, node, rtObj, nearByParent);
                prevCaseName = caseName;
            }
            if (defaultCase) {
                let dCase;
                let dCaseTemplate;
                tobj["default"] = {}
                if (defaultCase.tagName === "TEMPLATE" && !defaultCase.getAttribute("is")) {
                    dCase = defaultCase.content;
                    dCaseTemplate = defaultCase;
                } else {
                    let temp = document.createElement('template');
                    let clone = defaultCase.cloneNode(true);
                    temp.content.appendChild(clone);
                    temp.setAttribute("default", '');
                    clone.removeAttribute('default');
                    dCase = temp.content;
                    dCaseTemplate = temp;
                    defaultCase.replaceWith(temp);
                }
                let isBreak = dCaseTemplate.content.querySelector("template[is=break]");
                if (isBreak) {
                    isBreak.remove();
                }
                let dynamicNodes = [];
                dCase._parent = node;
                this.processTemplate(dCase, dynamicNodes, componentName, strict, errors, warnings, nearByParent);
                this.getTransitionOrder(dynamicNodes);
                this.getTemplateDirectChild(dynamicNodes, tobj.default);
                dynamicNodes.forEach(function (dyn) {
                    dyn.cn = "default";
                })
                defaultArr = {
                    dN: dynamicNodes
                };
                this.replaceCaseNode(dCaseTemplate, componentName, errors, node, rtObj, nearByParent);
            }
            is == "if" ? is = "e" : is = "s";
            if (is === "s") {
                this.getSwitchOrder(casesArr, tobj, defaultArr);
                let keys = Object.keys(casesArr);
                for (let i = 0; i < keys.length; i++) {
                    this.getTemplateDirectChild(casesArr[keys[i]].dN, tobj[keys[i]]);
                }
            }
            // console.log("the value of d org",defaultArr)
            toBePushed = {
                "t": is,
                p: deepN.slice(),
                "c": casesArr,
                "d": defaultArr,
                dc: tobj,
                "hd": hasDynamicCase,
                "co": casesOrder
            };
            if (rtObj.svg) {
                toBePushed.svg = true;
            }
            is == "e" ? is = "if" : is = "switch";
            let keys = Object.keys(tobj);
            for (let x = 0; x < keys.length; x++) {
                if (tobj[keys[x]].hc) {
                    toBePushed.hc = true;
                    toBePushed.trans = true;
                }
            }
            node = this.replaceParentNode(node, is, toBePushed, componentName, errors, undefined, nearByParent);
        } else if (is === "component") {
            node._componentTemplate = {};
            node._componentTemplate.content = node.content;
            let dynamicNodes = [];
            this.processTemplate(node._componentTemplate.content, dynamicNodes, componentName, strict, errors, warnings, nearByParent);
            this.getTransitionOrder(dynamicNodes);
            toBePushed = {
                "t": "cM",
                p: deepN.slice(),
                "dN": dynamicNodes
            };
            this.getTemplateDirectChild(dynamicNodes, toBePushed);
        } else if (node.nodeType == 3) {
            if (node.nodeValue.indexOf("{{") !== -1) {
            let syn = undefined
                if (!this.fromCLI) {
                    node.nodeValue = node.nodeValue.replace('.{}', '____lyteinternal____');
                    let val = node.nodeValue;
                    //need option
                    if (typeof Espree !== 'undefined' && typeof expHandlers !== 'undefined') {
                        let res = this.checkForMixedCase(val);
                        if (res.bool) {
                            const {
                                mustacheSpots
                            } = res;
                            tempVal = [];
                            if (mustacheSpots.length && mustacheSpots.length > 0) {
                                for (let j = 0; j < mustacheSpots.length; j++) {
                                    let x = mustacheSpots[j].mus
                                    if(x.match(/\&|\||\!|\=|\+|-|\*|\/|<|>|\?|:|%/gm)){
                                        x = this.trimAttr(x, errors, node, undefined, componentName);
                                    }
                                    val = val.replace(mustacheSpots[j].orgMus,function(){return x});
                                }
                            }
                            node.nodeValue = val;
                        }
                    }

                    syn = this.syntaxCheckWorkerNew(node.nodeValue);
                    if (!syn.bool) {
                        errors.push(new Error("Syntax error in node " + syn.err + " in " + node.nodeName + " for the node value: " + node.nodeValue + " in the component " + componentName));
                        return;
                    }
                }
                let mustache = this.getMustache(node.nodeValue, componentName, syn),
                    dynamicValue, helperFunc;
                if (mustache && mustache == "timeoutError") {
                    errors.push(new Error("(LC:timeout1) Syntax error in node " + mustache.err + " in " + node.nodeName + " for the attribute: " + node.nodeName + " - " + node.nodeValue));
                    return;
                }
                if (mustache && typeof mustache === 'object') {
                    if (mustache.bool === false) {
                        errors.push(new Error("Syntax error in node " + mustache.err + " in " + node.nodeName + " for the attribute: " + node.nodeName + " - " + node.nodeValue + " in the component " + componentName));
                    }
                }
                if (mustache) {
                    helperFunc = this.getArray(mustache);
                    if (helperFunc && helperFunc == "timeoutError") {
                        errors.push(new Error("(LC:timeout6)Syntax error in node " + node.nodeName + " for the value: " + " - " + node.nodeValue));
                        return;
                    } else if (helperFunc === false) {
                        errors.push(new Error("(LC:11)Syntax Error in node " + node.nodeName + "for the value:" + node.nodeValue));
                        return;
                    }
                }
                if (mustache) {
                    if (!helperFunc) {
                        mustache = mustache.replace('____lyteinternal____', '.{}');
                        helperFunc = this.getHelper(mustache);
                        if (helperFunc && helperFunc.args == "lbindError" || helperFunc == "lbindError") {
                            errors.push(new Error("(LC:lbind2) Syntax Error : lbind are not allowed inside helpers in " + node.nodeName + " for : " + node.nodeValue + " in the component " + componentName));
                        } else if (helperFunc && helperFunc.name == "lbind") {
                            errors.push(new Error("(LC:lbind1) Syntax Error : lbind are not allowed to render in dom " + node.nodeName + " for: " + node.nodeValue + " in the component " + componentName));
                        } else if (helperFunc === false) {
                            errors.push(new Error("Syntax Error in node " + node.nodeName + "for :" + node.nodeValue + " in the component " + componentName));
                            return;
                        }
                        if (this.fromCLI && helperFunc) {
                            if (this.defaultImpDetails.helpers.indexOf(helperFunc.name) == -1 && this.defaultHelpers.indexOf(helperFunc.name) == -1) {
                                this.defaultImpDetails.helpers.push(helperFunc.name);
                            }
                            this.getImportedHelpers(helperFunc.args, this.defaultImpDetails.helpers);
                        }
                    }
                } else {
                    errors.push(new Error("Syntax Error in node " + node.nodeName + "for :" + node.nodeValue + " in the component " + componentName));
                }
                node.nodeValue = node.nodeValue.replace('____lyteinternal____', '.{}');
                let dynamic = mustache;
                if (helperFunc) {
                    deepNodes.push({
                        t: "tX",
                        p: deepN.slice() /*, helperInfo: helperFunc*/
                    });
                } else if (dynamic) {
                    deepNodes.push({
                        t: "tX",
                        p: deepN.slice() /*, dynamicValue: dynamic*/
                    });
                    //                  LN to do
                    //                  deepNodes.push({type: "text", position:deepN.slice(), dynamicValue: getDynamicValue(dynamic)});                    
                }
            }
            deepN.pop();
            return;
        }
        var attr = this.processAttr(componentName, node, deepNodes, deepN, is, strict, errors, warnings);
        if (node.hasChildNodes() && node.tagName !== "TEMPLATE") {
            let oldParent;
            if (nearByParent == "svg" || nearByParent == "foreignObject") {
                oldParent = nearByParent;
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                deepN.push(i);
                let tagName = node.childNodes[i].tagName;
                if (tagName) {
                    if (tagName == "svg") {
                        nearByParent = "svg";
                    } else if (tagName == "foreignObject" || tagName == "FOREIGNOBJECT") {
                        nearByParent = "foreignObject";
                    }
                    let is = node.childNodes[i].getAttribute("is");
                    if (tagName && is) {
                        this.newGetDeepNodes(componentName, node.childNodes[i], deepNodes, deepN, is, strict, errors, warnings, nearByParent);
                    } else {
                        this.newGetDeepNodes(componentName, node.childNodes[i], deepNodes, deepN, undefined, strict, errors, warnings, nearByParent);
                    }
                    node.childNodes[i].removeAttribute("errorinfo")
                } else {
                    this.newGetDeepNodes(componentName, node.childNodes[i], deepNodes, deepN, undefined, strict, errors, warnings, nearByParent);
                }
                nearByParent = oldParent;
            }
        }
        if (attr && attr._special && toBePushed && toBePushed.t == "cD") {
            toBePushed._igTs = true;
        }
        if (attr && attr._special && toBePushed && toBePushed.t == "cM") {
            toBePushed._igTs = true;
        }
        if (attr && attr._special && toBePushed && toBePushed.t == "i") {
            toBePushed._igTs = true;
        }
        if (toBePushed) {
            deepNodes.push(toBePushed);
        }
        deepN.pop();
    }

    Compile.getArrayIndex = function (array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return i
            };
        }
    }
    Compile.getTrimmedContent = function (content, position, node) {
        let dummyContent = content;
        if (node) {
            position = [];
            let parentNode = node.parentNode;
            while (true) {
                position.unshift(this.getArrayIndex(parentNode.childNodes, node));
                parentNode = parentNode.parentNode;
                node = node.parentNode;
                if (!parentNode) {
                    break;
                }
            }
        }
        for (let i = 0; i < position.length; i++) {
            for (let j = content.childNodes.length - 1; j > position[i]; j--) {
                content.childNodes[j].remove();
            }
            content = content.childNodes[position[i]];
        }
        return dummyContent;
    }
    Compile.createDocFragment = function (template) {
        var childNodes = template.cloneNode(true).childNodes;
        var frag = document.createDocumentFragment();
        var len = childNodes.length;
        for (var i = 0; i < len; i++) {
            frag.appendChild(childNodes[0]);
        }
        return frag;
    }
    Compile.deepCopyObject = function (obj) {
        var current, copies = [{
                source: obj,
                target: Object.create(Object.getPrototypeOf(obj))
            }],
            keys, propertyIndex, descriptor, nextSource, indexOf, sourceReferences = [obj];
        var cloneObject = copies[0].target,
            targetReferences = [cloneObject];
        while (current = copies.shift()) {
            keys = Object.getOwnPropertyNames(current.source);
            for (propertyIndex = 0; propertyIndex < keys.length; propertyIndex++) {
                descriptor = Object.getOwnPropertyDescriptor(current.source, keys[propertyIndex]);
                if (!descriptor.value || typeof descriptor.value != "object") {
                    Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                    continue;
                }
                nextSource = descriptor.value;
                descriptor.value = Array.isArray(nextSource) ? [] : Object.create(Object.getPrototypeOf(nextSource));
                indexOf = sourceReferences.indexOf(nextSource);
                if (indexOf != -1) {
                    descriptor.value = targetReferences[indexOf];
                    Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                    continue;
                }
                sourceReferences.push(nextSource);
                targetReferences.push(descriptor.value);
                Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                copies.push({
                    source: nextSource,
                    target: descriptor.value
                });
            }
        }
        return cloneObject;
    }

    Compile.replaceCaseNode = function (node, componentName, errors, templateNode, rtObj, nearByParent) {
        var tagName;
        var template;
        if (nearByParent) {
            if (nearByParent == "svg") {
                rtObj.svg = true;
                var template = node.cloneNode();
                template.innerHTML = "<svg>" + node.innerHTML + "</svg>";
                template.setAttribute("depth", 1);
                node.replaceWith(template);
                return;
            }
        }
        for (var i = 0; i < node.content.children.length; i++) {
            if (node.content.children[i].tagName !== "TEMPLATE") {
                if (this.regex.tableTags.test(node.content.children[i].tagName)) {
                    tagName = node.content.children[i].tagName;
                }
                break;
            }
        }
        if (tagName) {
            if (tagName === "TR") {
                template = node.cloneNode();
                template.innerHTML = "<table><tbody>" + node.innerHTML + "</tbody></table>";
                template.setAttribute("depth", 2);

            } else if (this.regex.tableElementRegex.test(tagName)) {
                template = node.cloneNode()
                template.innerHTML = "<table>" + node.innerHTML + "</table>";
                template.setAttribute("depth", 1);
            } else {
                template = node.cloneNode();
                template.innerHTML = "<table><tbody><tr>" + node.innerHTML + "</tr></tbody></table>";
                template.setAttribute("depth", 3);
            }
            if (template.content.childNodes.length > 1) {
                template.content.childNodes.forEach(function (item) {
                    if (item.nodeName != "TABLE") {
                        if (item.nodeType == 1) {
                            errors.push(new Error("Syntax Error : Unexpected node - " + item.nodeName + "tag" + "inside " + tagName + " tag in the component " + componentName))
                        } else {
                            errors.push(new Error("Syntax Error : Unexpected text node - " + item.nodeValue + "present inside " + tagName + " tag in the component " + componentName))
                        }
                    }
                })
            }
            if (this.fromCLI) {
                template.refreshNode();
            }
            node.replaceWith(template);
        }
    }
    Compile.getParent = function (node) {
        var newNode = node;
        while (newNode) {
            if (newNode._parent) {
                if (newNode._parent.tagName && newNode._parent.tagName != "TEMPLATE") {
                    return newNode._parent;
                }
            }
            newNode = newNode._parent;
        }
    }
    Compile.getTemplateDirectChild = function (dynamicNodes, info) {
        var stack = [];
        info.dc = [];
        // info["hc"] = false;
        for (var i = 0; i < dynamicNodes.length; i++) {
            var dyn = dynamicNodes[i]
            var x = false;
            if ((dyn.trans || dyn.hc || dyn._comp || dyn.t == "cD" || dyn.t == "i" || dyn.t == "cM") && !dyn._igTs) {
                stack.forEach((item, index) => {
                    if (Compile.subArray(dyn.p, item)) {
                        x = true;
                    }
                });

                if (!x) {
                    stack.push(dyn.p);
                    // dyn["dirctChld"] = true;
                    info.dc.push(dyn.in)
                }
                info.hc = true;
                info.trans = true;
            }

        }
        if (!info.hc) {
            for (var i = 0; i < dynamicNodes.length; i++) {
                if (dynamicNodes[i].in != undefined && dynamicNodes[i].t != "cD" && dynamicNodes[i].t != "i") {
                    dynamicNodes[i].in = undefined;
                }
            }
            delete info.dc;
        }
    }
    Compile.getSwitchOrder = function (casesArr, tobj, defaultArr) {
        var keys = Object.keys(casesArr);
        var ln = keys.length;
        var club = [];
        for (var i = 0; i < ln; i++) {
            if (tobj[keys[i]].trans && casesArr[keys[i]].additional) {
                var stack = [];
                var flag = false;
                casesArr[keys[i]].dN.forEach((dyn) => {
                    club.push(dyn);
                })
                stack.push(keys[i]);
                while (keys[i] && casesArr[keys[i]].additional) {
                    flag = true;
                    var caseName;
                    if (casesArr[keys[i]].additional.next) {
                        caseName = casesArr[keys[i]].additional.next;
                    } else if (casesArr[keys[i]].additional.default) {
                        caseName = "default";
                        defaultArr.dN.forEach((dyn) => {
                            club.push(dyn);
                        })
                        i++;
                        continue;
                    }
                    if (tobj[caseName].trans) {
                        casesArr[caseName].dN.forEach((dyn) => {
                            club.push(dyn);
                        })
                    }
                    stack.push(caseName);
                    i++;
                }
                if (flag) {
                    this.getTransitionOrder(club, true);
                    // for(var i=0;i<stack.length;i++){
                    //     getTemplateDirectChild(club,tobj[stack[i]]);
                    // }
                }
            }
        }
    }
    Compile.getTransitionOrder = function (a, switchcase) {
        var count = 0;
        var previousTransition;
        for (var i = a.length - 1; i >= 0; i--) {
            if ((a[i].trans || this.regex.getTransitionOrderRegex.test(a[i].t)) && !a[i]._igTs) {
                a[i].in = count;
                count++;
                if (previousTransition) {
                    if (this.subArray(previousTransition.p, a[i].p)) {
                        a[i].chld = this.getChild(a, i, switchcase);
                    } else if (previousTransition) {
                        a[i].sibl = [previousTransition.in];
                    }
                }
                previousTransition = a[i]
            }
        }
    }
    Compile.subArray = function (sub, master) {
        //master//small //sub //big
        var brk = false;
        for (var i = 0; i < master.length; i++) {
            if (master[i] == sub[i]) {
                continue;
            } else {
                brk = true;
                break;
            }
        }

        if (!brk && master.length != sub.length) {
            return true;
        } else {
            return false;
        }
    }
    Compile.getChild = function (a, i, switchcase) {
        var childArr = [];
        var x = i;
        var previous;
        var caseName;
        if (switchcase) {
            caseName = a[i].cn;
        }
        while (a[i]) {
            i++;
            if (switchcase) {
                if (a[i] && a[i].cn != caseName) {
                    break;
                }
            }
            if (a[i] && (a[i].trans || a[i]._comp || this.regex.getChildRegex.test(a[i].t)) && !a[i]._igTs) {
                if (previous != undefined) {
                    if (this.subArray(a[i].p, previous)) {
                        //ignoring child's child
                        continue;
                    }
                }
                if (this.subArray(a[i].p, a[x].p)) {
                    childArr.push(a[i].in);
                } else {
                    break;
                }
                previous = a[i].p;
            }
        }
        if (a[i]) {
            a[x].sibl = [a[i].in];
        }
        return childArr;
    }
    Compile.svgFix = function (node, type, toBePushed, parentElementName, componentName, errors) {
        var templateNode = node.cloneNode();
        var newElementName;
        if (!node.content || !node.content.children || !node.content.children[0] || !node.content.children[0].tagName) {
            errors.push(new Error("Syntax Error in the node " + this.errorNodeDetails(node)));
            return node;
        } else {
            newElementName = node.content.children[0].tagName;
        }
        templateNode.innerHTML = "<svg>" + node.innerHTML + "</svg>"
        templateNode.setAttribute("depth", 1);
        return this.inner(node, templateNode, type, newElementName, parentElementName, toBePushed);
    }
    Compile.inner = function (node, templateNode, type, newElementName, parentElementName, toBePushed) {
        var newElement = this.addUnbound(node,newElement,newElementName,parentElementName);
        var parentElement = document.createElement(parentElementName);
        switch (type) {
            case "for":
                newElement.setAttribute("is", "for");
                newElement.setAttribute("lyte-for", "true");
                if (node.hasAttribute("unbound")) {
                    newElement.setAttribute("unbound", node.getAttribute("unbound"));
                }
                // newElement.setAttribute("items", node.getAttribute("items"));
                // newElement.setAttribute("item", node.getAttribute("item"));
                // newElement.setAttribute("index", node.getAttribute("index"));
                break;
            case "if":
            case "switch":
                newElement.setAttribute("is", type);
                newElement.setAttribute("lyte-" + type, "true");
                //newElement.setAttribute("value", node.getAttribute("value"));
                break;
            case "forIn":
                newElement.setAttribute("is", "forIn");
                newElement.setAttribute("lyte-forin", "true");
                if (node.hasAttribute("unbound")) {
                    newElement.setAttribute("unbound", node.getAttribute("unbound"));
                }
                // newElement.setAttribute("object", node.getAttribute("object"));
                // newElement.setAttribute("key", node.getAttribute("key"));
                // newElement.setAttribute("value", node.getAttribute("value"));
                break;
        }
        var attrs = node.attributes;
        for (var i = 0; i < attrs.length; i++) {
            if(!attrs[i].nodeName.startsWith("@")){
                newElement.setAttribute(attrs[i].nodeName, attrs[i].nodeValue);
            }    
        }
        if (parentElementName !== "SELECT" && (type === "for" || type === "forIn")) {
            this.removeAllAttributes(templateNode);
            toBePushed.actualTemplate = templateNode.outerHTML;
            toBePushed.tagName = parentElementName;
            if (templateNode.hasAttribute("depth")) {
                newElement.setAttribute("depth", templateNode.getAttribute("depth"));
            }
        } else {
            this.removeAllAttributes(node);
            toBePushed.actualTemplate = node.outerHTML;
        }
        node.replaceWith(newElement);
        return newElement;
    }
    Compile.replaceParentNode = function (node, type, toBePushed, componentName, errors, forHold, nearByParent) {
        var parentNode = this.getParent(node);
        if (parentNode && nearByParent) {
            if (nearByParent == "svg") {
                var parentElementName = parentNode.tagName;
                toBePushed.svg = true;
                return this.svgFix(node, type, toBePushed, parentElementName, componentName, errors);
            }
            return node;
        }
        if (!parentNode) {
            return node;
        }
        var parentElementName = parentNode.tagName;
        var newElementName;
        var templateNode = node.cloneNode();
        var childTagName;
        if (forHold) {
            for (var i = 0; i < node.content.children.length; i++) {
                if (node.content.children[i].tagName !== "TEMPLATE") {
                    if (this.regex.tableTags.test(node.content.children[i].tagName)) {
                        childTagName = node.content.children[i].tagName;
                    }
                    break;
                }
            }
        }
        if (parentNode && (this.regex.tableTagsWithSelect.test(parentElementName))) {
            switch (parentElementName) {
                case "SELECT":
                    newElementName = "option";
                    break;
                case "TR":
                    if (!forHold) {
                        templateNode.innerHTML = "<table><tbody><tr>" + node.innerHTML + "</tr></tbody></table>"
                        templateNode.setAttribute("depth", 3);
                        newElementName = "td";
                    } else {
                        if (childTagName && childTagName == "TR") {
                            errors.push(new Error("Syntax Error : Unexpected node - " + childTagName + "tag inside " + parentElementName + " tag in the component " + componentName))
                        } else {
                            templateNode.innerHTML = "<table><tbody><tr>" + node.innerHTML + "</tr></tbody></table>"
                            templateNode.setAttribute("depth", 3);
                            newElementName = "td";
                        }
                    }
                    break;
                case "TABLE":
                    if (!forHold) {
                        templateNode.innerHTML = "<table>" + node.innerHTML + "</table>";
                        templateNode.setAttribute("depth", 1);
                        newElementName = "tbody";
                    } else {
                        if (childTagName && (childTagName == "TBODY" || childTagName == "THEAD" || childTagName == "TFOOT")) {
                            templateNode.innerHTML = "<table>" + node.innerHTML + "</table>";
                            templateNode.setAttribute("depth", 1);
                        } else if (childTagName && childTagName == "TR") {
                            templateNode.innerHTML = "<table><tbody>" + node.innerHTML + "</tbody></table>";
                            templateNode.setAttribute("depth", 2);
                        } else {
                            templateNode.innerHTML = "<table><tbody><tr>" + node.innerHTML + "</tr></tbody></table>"
                            templateNode.setAttribute("depth", 3);
                        }
                        newElementName = "tbody";
                    }
                    break;
                case "TBODY":
                case "THEAD":
                case "TFOOT":
                    if (!forHold) {
                        templateNode.innerHTML = "<table><tbody>" + node.innerHTML + "</tbody></table>";
                        templateNode.setAttribute("depth", 2);
                        newElementName = "tr";
                    } else {
                        if (childTagName && (childTagName == "TR")) {
                            templateNode.innerHTML = "<table><tbody>" + node.innerHTML + "</tbody></table>";
                            templateNode.setAttribute("depth", 2);
                        } else {
                            templateNode.innerHTML = "<table><tbody><tr>" + node.innerHTML + "</tr></tbody></table>"
                            templateNode.setAttribute("depth", 3);
                        }
                        newElementName = "tr";
                    }
                    break;
            }
            if (templateNode.content.childNodes.length > 1) {
                templateNode.content.childNodes.forEach(function (item) {
                    if (item.nodeName != "TABLE") {
                        if (item.nodeType == 1) {
                            errors.push(new Error("Syntax Error : Unexpected node - " + item.nodeName + "tag inside " + parentElementName + " tag in the component " + componentName))
                        } else {
                            errors.push(new Error("Syntax Error : Unexpected text node - " + item.nodeValue + "present inside " + parentElementName + " tag in the component " + componentName))
                        }
                    }
                })
            }
            return this.inner(node, templateNode, type, newElementName, parentElementName, toBePushed);
        }

        return node;
    }
    Compile.removeAllAttributes = function (node) {
        let ls = node.querySelectorAll("errorinfo");
        for (let i = 0; i < ls.length; i++) {
            ls.removeAttribute("errorinfo");
        }
        var arr = Array.from(node.attributes);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].nodeName != "depth" && arr[i].nodeName != "is") {
                node.removeAttribute(arr[i].nodeName);
            }
        }
    }

    Compile.siblingNullCheck = function (nextSibling) {
        if (nextSibling.previousSibling.nodeValue === null || nextSibling.nextSibling.nodeValue === null) {
            return null;
        } else {
            return 1;
        }
    }
    Compile.jspIfToSwitch = function (element, check = {}) {
        var temp = document.createElement("template");
        if (element.hasAttribute("is") && element.getAttribute("is") == "if") {
            temp.setAttribute("is", "switch");
            temp.setAttribute("l-c", true);
        }
        if(element.hasAttribute("_jsp")){
            temp.setAttribute("_jsp",element.getAttribute("_jsp"));
        }
        this.getCase(temp, element, check);
        return temp;
    }

    Compile.appendBreak = function (temp) {
        var breakTemp = document.createElement("template");
        breakTemp.setAttribute("is", "break");
        temp.content.appendChild(breakTemp);
    }
    Compile.getCase = function (temp, element, check = {}) {
        var ifStmt, trueCase, falseCase;
        ifStmt = element.getAttribute("value");
        if (element.getAttribute("_jsp") == "true") {
            trueCase = element.content.children[0];
            falseCase = element.content.children[1];
        } else {
            trueCase = element.content.querySelector("[case=true]");
            falseCase = element.content.querySelector("[case=false]");
        }
        if (!trueCase && falseCase) {
            //create empty true case
            let tempCase = document.createElement("template");
            tempCase.setAttribute("case", "true");
            trueCase = tempCase;
        }
        if (trueCase || falseCase) {
            if (trueCase && trueCase.getAttribute("case") == "true") {
                let caseTemp;
                if (trueCase.tagName != "TEMPLATE") {
                    trueCase.removeAttribute("case");
                    caseTemp = this.createCase(ifStmt, trueCase, check);
                } else {
                    caseTemp = this.createCase(ifStmt, trueCase.content, check);
                }
                temp.content.appendChild(caseTemp);
                this.appendBreak(caseTemp);
            }
            if (falseCase && falseCase.getAttribute("case") == "false") {
                var elif = false;
                if (falseCase.tagName != "TEMPLATE") {
                    falseCase.removeAttribute("case");
                    let tempCase = document.createElement("template");
                    tempCase.setAttribute("default", "");
                    tempCase.content.appendChild(falseCase);
                    temp.content.appendChild(tempCase);
                } else {
                    if (falseCase.content.children && falseCase.content.children.length && falseCase.content.children[0].getAttribute("lyte-elif") == "true") {
                        elif = falseCase.content.children[0];
                        this.getCase(temp, elif, check);
                    } else {
                        let tempCase = document.createElement("template");
                        tempCase.setAttribute("default", "");
                        tempCase.content.appendChild(falseCase.content);
                        temp.content.appendChild(tempCase);
                    }
                }
            }
        } else {
            temp[this.htmlStr["innerHTML"]] = element[this.htmlStr["innerHTML"]];
        }
    }
    Compile.createCase = function (value, content, check = {}) {
        let tempCase = document.createElement("template");
        tempCase.setAttribute("is", "case");
        if (check.fromParser) {
            let syn = check.syntaxCheckWorkerNew(value, check);
            tempCase.setAttribute("case", syn.text);
            if (!tempCase.attrType) {
                tempCase.attrType = {};
            }
            tempCase.attrType.case = syn.type;
        } else {
            tempCase.setAttribute("case", value);
        }
        tempCase.content.appendChild(content);
        return tempCase;
    }
    Compile.checkAttr = function (obj, key) {
        return (obj.hasAttribute(key)) ? key : false;
    }

    Compile.getErrorInfo = function (obj) {
        let key = this.checkAttr(obj, "lyte-if") || this.checkAttr(obj, "lyte-switch") || this.checkAttr(obj, "lyte-for") || this.checkAttr(obj, "lyte-for-in"),
            errorinfo = undefined;
        if (!key && (this.regex.lyteTemplateType2.test(obj.getAttribute("is")))) {
            key = obj.getAttribute("is");
        }
        if (key) {
            errorinfo = {
                name: "errorinfo",
                details: {
                    tagName: obj.tagName,
                    name: key,
                    value: obj.getAttribute(key).replace(/{{/g, "@mus@")
                }
            }
        }
        return errorinfo;
    }
    Compile.handleLyteIf = function (element, svg, check = {}, errorObj) {
        var ifStmt;
        var temp = document.createElement("template");
        let errorinfo = this.getErrorInfo(element);
        if (element.hasAttribute("lyte-if")) {
            ifStmt = element.getAttribute("lyte-if");
            element.removeAttribute("lyte-if")
            temp.setAttribute("is", "switch");
            if(element.hasAttribute("__vp")){
                temp.setAttribute("__vp", element.getAttribute("__vp"));
            }
            if (check.fromParser) {
                if (!temp.attrType) {
                    temp.attrType = {};
                }
                let syn = check.syntaxCheckWorkerNew(ifStmt, check);
                temp.setAttribute("value", syn.text);
                temp.attrType.value = syn.type;
            } else {
                temp.setAttribute("value", ifStmt);
            }
            temp.setAttribute("l-c", true);
            temp.setAttribute("_new", "true");
            temp.setAttribute("errorinfo", JSON.stringify(errorinfo));
        } else if (element.hasAttribute("lyte-else-if")) {
            ifStmt = element.getAttribute("lyte-else-if");
            element.removeAttribute("lyte-else-if");
        }
        try {
            if (check.ide && window.elifHold) {
                temp.setAttribute("el", true);
                window.elifHold = false;
            }
        } catch (e) {
            console.log("ide");
        }
        var trueTemp;
        if (svg && element.tagName == "template") {
            trueTemp = document.createElement("template");
            trueTemp[this.htmlStr["innerHTML"]] = element[this.htmlStr["innerHTML"]]
        } else if (element.tagName === "TEMPLATE") {
            trueTemp = element.cloneNode();
            trueTemp[this.htmlStr["innerHTML"]] = element[this.htmlStr["innerHTML"]];
        } else {
            trueTemp = document.createElement("template");
            trueTemp[this.htmlStr["innerHTML"]] = element[this.htmlStr["outerHTML"]];
        }
        if (trueTemp.hasAttribute("is")) {
            var wrapperTemp = document.createElement("template");
            wrapperTemp.content.appendChild(trueTemp);
            trueTemp = wrapperTemp;
        }
        temp.content.appendChild(trueTemp);
        if (check.fromParser) {
            if (!trueTemp.attrType) {
                trueTemp.attrType = {};
            }
            let syn = check.syntaxCheckWorkerNew(ifStmt, check);
            trueTemp.setAttribute("case", syn.text);
            trueTemp.attrType.case = syn.type;
        } else {
            trueTemp.setAttribute("case", ifStmt);
        }
        trueTemp.setAttribute("is", "case");
        if (temp.getAttribute("is") == "switch" && temp.hasAttribute("value")) {
            if (temp.getAttribute("value").startsWith("{{")) {
                temp.removeAttribute("value");
            }
        }
        var breakTemp = document.createElement("template");
        breakTemp.setAttribute("is", "break");
        trueTemp.content.appendChild(breakTemp);
        //Else case handling
        if (element.nextElementSibling) {
            var nextSibling = element.nextElementSibling;
            var falseTemp;
            var type;
            if (nextSibling.hasAttribute("lyte-else")) {
                type = "lyte-else";
            } else if (nextSibling.hasAttribute("lyte-else-if")) {
                type = "lyte-else-if";
            }
            if (type) {
                if (type === "lyte-else") {
                    nextSibling.removeAttribute("lyte-else");
                    if (svg && nextSibling.tagName == "template") {
                        falseTemp = document.createElement("template");
                        // falseTemp.setAttribute("case", "false");
                        falseTemp[this.htmlStr["innerHTML"]] = nextSibling[this.htmlStr["innerHTML"]]
                    } else if (nextSibling.tagName === "TEMPLATE") {
                        falseTemp = nextSibling.cloneNode();
                        falseTemp[this.htmlStr["innerHTML"]] = nextSibling[this.htmlStr["innerHTML"]];
                    } else {
                        falseTemp = document.createElement("template");
                        // falseTemp.setAttribute("default", "");
                        falseTemp[this.htmlStr["innerHTML"]] = nextSibling[this.htmlStr["outerHTML"]];
                    }
                    falseTemp.setAttribute("default", "");
                    if (nextSibling.nextSibling && nextSibling.previousSibling && this.siblingNullCheck(nextSibling) && (nextSibling.nextSibling.nodeValue.trim() === "") && ("" === nextSibling.previousSibling.nodeValue.trim())) {
                        nextSibling.nextSibling.remove();
                    }
                    nextSibling.remove();
                } else {
                    falseTemp = this.handleLyteIf(nextSibling, svg, check, errorObj).content;

                    if (nextSibling.nextSibling && nextSibling.previousSibling && this.siblingNullCheck(nextSibling) && (nextSibling.nextSibling.nodeValue.trim() === "") && ("" === nextSibling.previousSibling.nodeValue.trim())) {
                        nextSibling.nextSibling.remove();
                    }
                    nextSibling.remove();

                }
                temp.content.appendChild(falseTemp);
            }
        }
        return temp;
    }

    Compile.handleLyteSwitch = function (node, svg, check, errorObj) {
        var template;
        var switchValue = node.getAttribute("lyte-switch");
        let errorinfo = this.getErrorInfo(node);
        var childElements;
        var type;
        if (node.tagName === "TEMPLATE") {
            template = node;
            template.removeAttribute("lyte-switch");
            childElements = Array.from(template.content.children);
            type = "template";
        } else if (svg && node.tagName == "template") {
            template = document.createElement("template");
            var attrs = node.attributes;
            for (var j = 0; j < attrs.length; j++) {
                template.setAttribute(attrs[j].nodeName, attrs[j].nodeValue);
            }
            // falseTemp.setAttribute("case", "false");
            template.removeAttribute("lyte-switch");
            // template.innerHTML = node.innerHTML
            type = "template";
            childElements = Array.from(node.children);
        } else {
            node.removeAttribute("lyte-switch");
            template = document.createElement("template");
            if (check.ide) {
                template.setAttribute("nt", true);
            }
            childElements = Array.from(node.children);
        }
        template.setAttribute("_new", "true");

        for (var i = 0; i < childElements.length; i++) {
            var child = childElements[i];
            if (child.hasAttribute("lyte-case")) {
                var isChildTemplate = child.tagName === "TEMPLATE";
                if (svg && child.tagName === "template") {
                    var temp = document.createElement("template");
                    temp[this.htmlStr["innerHTML"]] = child[this.htmlStr["innerHTML"]];
                    var attrs = child.attributes;
                    for (var j = 0; j < attrs.length; j++) {
                        temp.setAttribute(attrs[j].nodeName, attrs[j].nodeValue);
                    }
                    child = temp;
                    isChildTemplate = true;
                }
                //var childTemplate = isChildTemplate ? child : document.createElement("template");
                var childTemplate = child;
                var hasBreak = child.hasAttribute("lyte-break");
                var caseValue = child.getAttribute("lyte-case");

                child.removeAttribute("lyte-case");
                child.removeAttribute("lyte-break");
                if (child.hasAttribute("lyte-if")) {
                    isChildTemplate = false;
                    var oldChild = child;
                    child = this.handleLyteIf(child, svg, check, errorObj);
                    oldChild.remove();
                } else if (child.hasAttribute("lyte-switch")) {
                    isChildTemplate = false;
                    this.handleLyteSwitch(child, svg, check, errorObj);
                }
                if (isChildTemplate) {
                    template.content.appendChild(child, true);
                    child.setAttribute("case", caseValue);
                    child.removeAttribute("lyte-case");
                } else {
                    childTemplate = document.createElement("template");
                    childTemplate.setAttribute("case", caseValue);
                    child.removeAttribute("lyte-case");
                    childTemplate.content.appendChild(child, true);
                    template.content.appendChild(childTemplate);
                }
                if (hasBreak) {
                    var breakTemp = document.createElement("template");
                    breakTemp.setAttribute("is", "break");
                    childTemplate.content.appendChild(breakTemp);
                    child.removeAttribute("lyte-break");
                }
            }
        }
        var defaultCase; // = type ? node.content.querySelector("[lyte-default]") : node.querySelector("[lyte-default]");
        if (svg && node.tagName == "template") {
            defaultCase = type ? node.querySelector("[lyte-default]") : node.querySelector("[lyte-default]");
        } else {
            defaultCase = type ? node.content.querySelector("[lyte-default]") : node.querySelector("[lyte-default]");
        }
        if (defaultCase) {
            var isDefCaseTemp;
            if (defaultCase.tagName === "TEMPLATE") {
                isDefCaseTemp = true;
            } else if (svg && defaultCase.tagName === "template") {
                var temp = document.createElement("template");
                temp[this.htmlStr["innerHTML"]] = defaultCase[this.htmlStr["innerHTML"]];
                var attrs = defaultCase.attributes;
                for (var j = 0; j < attrs.length; j++) {
                    temp.setAttribute(attrs[j].nodeName, attrs[j].nodeValue);
                }
                defaultCase = temp;
                isDefCaseTemp = true;
            }
            defaultCase.removeAttribute("lyte-default");
            if (defaultCase.hasAttribute("lyte-if")) {
                isDefCaseTemp = false;
                var oldDefault = defaultCase;
                defaultCase = this.handleLyteIf(defaultCase, svg, check, errorObj);
                oldDefault.remove();
            } else if (defaultCase.hasAttribute("lyte-switch")) {
                isDefCaseTemp = false;
                this.handleLyteSwitch(defaultCase, svg, check, errorObj);
            }
            if (isDefCaseTemp) {
                template.content.appendChild(defaultCase, true);
                defaultCase.setAttribute("default", "");
            } else {
                var defTemp = document.createElement("template");
                defTemp.setAttribute("default", "");
                defTemp.content.appendChild(defaultCase, true);
                template.content.appendChild(defTemp);
            }
        }
        if (check.fromParser) {
            if (!template.attrType) {
                template.attrType = {};
            }
            let syn = check.syntaxCheckWorkerNew(switchValue, check);
            template.setAttribute("value", syn.text);
            template.attrType.value = syn.type;
        } else {
            template.setAttribute("value", switchValue);
        }

        template.setAttribute("is", "switch");
        if (!type) {
            template.setAttribute("errorinfo", JSON.stringify(errorinfo));
            node[this.htmlStr["innerHTML"]] = template[this.htmlStr["outerHTML"]];
        } else {
            node = template;
            node.setAttribute("errorinfo", JSON.stringify(errorinfo));
        }
        return node;
    }
    

    Compile.getTemplateFromString = function (str, outlet) {
        var div = document.createElement("div");
        div.innerHTML = str;
        div.remove();
        return div.firstChild;
    }

    Compile.addComponentTemplate = function (html, componentName) {
        var temp = document.createElement("template");
        if (componentName) {
            var s = document.createElement("template");
            s.setAttribute("tag-name", componentName);
            s.setAttribute("registry-name", this.constructor.name);
            s.innerHTML = html;
            temp.content.appendChild(s);
        } else {
            temp.innerHTML = html;
        }
        Compile.componentsDiv.appendChild(temp.content);
    }
    Compile.compileComponent = function (obj,options={}) {
        let componentName = obj.name
        let templateStr = obj.template;
        let jsStr = obj.js.toString();
        let observedAttributes = obj.observedAttributes;
        let compiledStr = "";

        if (typeof componentName !== "string" || componentName == "") {
            return {
                errors: [{
                    "message": "Invalid Component Name - " + componentName
                }]
            }
        } else if (typeof templateStr !== "string" || templateStr == "") {
            return {
                errors: [{
                    "message": "Invalid Template String - " + templateStr
                }]
            }
        } else if (typeof jsStr !== "string" || jsStr == "") {
            return {
                errors: [{
                    "message": "Invalid Javascript String - " + jsStr
                }]
            }
        } else {
            let errorObj = { mustacheSyntax:{arr:[],obj:{}}, warnings: [] }
            this.decodeHtmlEntities = htmlParser.decodeHtmlEntities;
            let obj = htmlParser.htmlToJsObjectLyteRendered.toObject(templateStr, {
                enhanced: true,
                fromCLI: true,
                Compile: Compile
            },errorObj);
            if (obj.querySelector("[tag-name]")) {
                let returnedObj = this.getDynamicNodes(componentName, undefined, obj, true, errorObj);
                if(options.checkMustacheSyntax){
                    console.error(errorObj.mustacheSyntax);
                }
                if (returnedObj.errors && returnedObj.errors.length) {
                    console.error("Errors in the component ", componentName, " during compilation!", returnedObj.errors);
                    return {
                        componentName: componentName,
                        errors: returnedObj.errors
                    };
                }
                if (returnedObj.warnings && returnedObj.warnings.length) {
                    console.warn("Warnings in the component ", componentName, " during compilation!", returnedObj.warnings);
                }

                var firstStr = /class \w+ extends .*?{/g.exec(jsStr);
                var strArr = jsStr.split(firstStr[0]);
                compiledStr = firstStr[0] + "\nstatic _template = " + JSON.stringify(JSON.parse(returnedObj.template)) + ";\n" + "static _dynamicNodes = " + JSON.stringify(returnedObj.dynamicNodes) + ";\n" + (returnedObj._templateAttributes ? ("static _templateAttributes = " + returnedObj._templateAttributes + ";\n") : "") + "static _observedAttributes = " + (observedAttributes ? JSON.stringify(observedAttributes) : "[]") + ";\n";
                compiledStr = strArr[0] + compiledStr + strArr[1];


            } else {
                return {
                    errors: [{
                        "message": "Missing attribute `tag-name` in the component " + componentName
                    }]
                }
            }
            return compiledStr;
        }
    }
// }
if( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = Compile;
}
else{
    window.ClientCompilerInternal = Compile;
}
// export default ClientCompiler