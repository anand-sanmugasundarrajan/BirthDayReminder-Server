// function BaseCompiler(){
    let Compile = {};
    Compile.regex = {
        get lyteTemplateType1() { return /if|for|switch/g },
        get getArrayArgRegex() { return /\[(?=([\s]*[\w-_.]+)([\(\[]))/g },
        get getArrayArgRegexCLI() { return /\[(?=([\s]*[\w-_]+)([\(\[]))/g },
        get matchInsideParentheses() { return /\(.*\)$/ },
        get startsAndEndWithNumber() { return /^[0-9]$/ },
        get matchInsideSquareBrackets() { return /\[.*\]/ },
        get getHelperRegex() { return /\((?:[^\)]*|(?:(?:"(?:[^"\\]|\\.)*?")|(?:'([^'\\]|\\.)*?')|[\w\s!@#$%^&*)([\]+=.,_-]*?)*?)\)$/ },
        get matchAllEmptyCharacter() { return /\s/g },
        get endsWithCloseParantheses() { return /\)$/g },
        get startWithMustacheWithContent() { return /^{{(?=[\s]*[\w-_\(\$)]+)/ },
        get dynamicValueCheck() { return /[\w!@#\$%\^\&*\)\(+=.,_-]+[\s]*[(]{0,1}(?:"([^"]|\\")*?"|'([^']|\\')*?'|[\w\s!@#\$%\^\&*\)\(\[\]+=.,_-]*?)*?[)]{0,1}[\s]*(?=}})/g },
        get validMustacheCheck() { return /{{[^}]*?(?:(?:('|")[^\1]*?\1)[^}]*?)*}}$/ },
        get mustacheCountCheck() { return /{{[a-zA-Z0-9_.\[\]\(\)]*(?![\\])}}/g },
        get validateArrayIndexing() { return /[a-zA-z0-9]*\[.*\]/g },
        get mustache() { return /{{[^}]*?(?:(?:[^\1]*?\1)[^}]*?)*}}/g },
        get lyteTemplateType2() { return /(for|forIn|if|switch)$/ },
        get splitTextNodesMustache() { return /{{[^}]*?(?:(?:('|")[^\1]*?\1)[^}]*?)*}}/g },
        get tableTags() { return /^(TR|TD|TH|TBODY|THEAD|TFOOT)$/ },
        get tableTagsWithSelect() { return /^(SELECT|TR|TABLE|TBODY|THEAD|TFOOT)$/ },
        get eventListRegexFull() { return /^(onfocus|onfocusin|onfocusout|onresize|onscroll|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseover|onmouseout|onchange|onselect|onsubmit|onkeydown|onkeypress|onkeyup|oncontextmenu|ondragstart|ondrag|ondragenter|ondragleave|ondragover|ondrop|ondragend|onload|onunload|onabort|onerror|onscroll|onreset|onblur|onafterprint|onbeforeprint|ononbeforeunload|onerror|onhashchange|onload|onmessage|onoffline|ononline|onpagehide|onpageshow|onpopstate|onstorage|onunload|oninput|oninvalid|onsearch|ononmousewheel|onwheel|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|onscroll|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|onscroll|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|onscroll|onabort|oncanplay|oncanplaythrough|oncuechange|ondurationchange|onemptied|onended|onloadeddata|onloadedmetadata|onloadstart|onpause|onplay|onplaying|onprogress|onratechange|onseeked|onseeking|onstalled|onsuspend|ontimeupdate|onvolumechange|onwaiting|onpaste)$/ },
        get eventListRegexPart() { return /^(onfocus|onfocusin|onfocusout|onresize|onscroll|onclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseover|onmouseout|onchange|onselect|onsubmit|onkeydown|onkeypress|onkeyup|oncontextmenu)$/ },
        get keyWordsRegex() { return /((const)|(continue)|(default)|(delete)|(do)|(else)|(enum)|(export)|(extends)|(finally)|(for)|(function)|(if)|(import)|(in)|(instanceof)|(new)|(return)|(super)|(switch)|(try)|(typeof)|(var)|(void)|(while)|(with))(?!\w)/g },
        get lyteHelperRegex() { return /__LyteHelper(\w*?)__/g },
        get tableElementRegex() { return /^(TBODY|THEAD|TFOOT)$/ },
        get getTransitionOrderRegex() { return /^f|fI|e|s|cD|cM|i|r|yield$/g },
        get getChildRegex() { return /^f|fI|e|s|cD|i|r|yield$/g },
        get startWithMustacheRegex() { return /^{{/ },
        get endWithMustacheRegex() { return /}}$/ },
        get baseCaseMustacheCheck() { return /{{.*}}/ },
        get commentedMustacheCheck() { return /\\{{.*}}/ }
    
    }
    Compile.getTrimmedContent = function(content, position, node) {
        let dummyContent = content;
        if(node) {
            position = [];
            let parentNode = node.parentNode;
            while(true) {
                position.$unshift(this.getArrayIndex(parentNode.childNodes,node));
                parentNode = parentNode.parentNode;
                node = node.parentNode;
                if(!parentNode) {
                    break;
                }
            }
        }
        for(let i=0;i<position.length;i++) {
            for(let j=content.childNodes.length-1;j>position[i];j--) {
                content.childNodes[j].remove();
            }
            content = content.childNodes[position[i]];
        }
        return dummyContent;
    }
    Compile.getArrayIndex = function(array,value) {
        for(let i=0;i<array.length;i++) {
            if(array[i] === value) {
                return i
            };
        }
    }

    Compile.splitMixedText = function(str,componentName,errors){
            // console.log("str",str);
        var stack = [],
        start = 0,
        flag = false,
        helper = {
            name: "concat",
            args: []
        };
        for (var i = 0; i < str.length; i++) {
            var j = i;
            if (str[i - 1] !== "\\" && str[i] === "{" && str[++i] === "{") {
                stack.push('{{');
                helper.args.push("'" + str.substr(start, j - start) + "'");
                start = i + 1;
            } else if (str[i] === "}" && str[++i] === "}" && stack.length) {
                stack.pop(start);
                var toPush = str.substr(start, j - start);
                if((toPush.startsWith("'") && toPush.endsWith("'")) || (toPush.startsWith('"') && toPush.endsWith('"'))){
                    console.warn("Rendering string value inside dynamic data (mustache) is depriciated","for the value ",toPush ,"on the attribute value ",str);
                }
                var actObj  =  this.getArray(toPush);  
                if(actObj && actObj == "timeoutError"){
                    errors.push(new Error("(LC:timeout8)Syntax error in node "+node.node+" for the value: "+" - "+node.text));
                    return;
                }else if(actObj === false){
                    errors.push(new Error("(LC:14)Syntax Error in node "+node.node+"for the value:"+node.text));
                    return;
                }
                if(actObj){
                    toPush = actObj;
                    helper.args.push({type:"sq",value:actObj});
                    flag = true;
                }
                if(!actObj){
                    actObj = this.getHelper(toPush);  
                    if(actObj){
                        if(actObj == "timeoutError"){
                            errors.push(new Error("(LC:timeout5)Syntax Error in node "+"  for : "+str));
                            return;
                        }
                        else if(actObj.name == "lbind"){
                            errors.push(new Error("(LC:lbind5) Syntax Error : lbind are not allowed with prepending or appending with texts "+" for : "+str));
                            return;
                        }
                        else if(actObj == "lbindError" || actObj.args == "lbindError"){
                            errors.push(new Error("(LC:lbind6)Syntax Error : lbind are not allowed inside helpers on node "+node.node+" for: "+ str));
                            return;
                        }
                        else if(actObj.name == "lbind" && node.tagName == "TEMPLATE"&& node.hasAttribute("is") && this.regex.lyteTemplateType1.test(node.attr.is)){
                            errors.push(new Error("(LC:lbind7)Syntax Error : lbind not allowed as value in if/for/switch node"+"for: "+str));
                            return;
                        }
                        
                        else if(actObj.name == "action"){
                            errors.push(new Error("(LC:9)Syntax Error : action are not allowed with prepending or appending with texts "+"for :"+str));
                            return;
                        }
                        else if(actObj.name == "method"){
                            errors.push(new Error("(LC:10)Syntax Error : method are not allowed with prepending or appending with texts "+"for :"+str));
                            return;
                        }
                        toPush = actObj;
                        if(!this.fromCLI && this.regex.getArrayArgRegex.test(toPush)){
                            flag = true;
                        }
                        helper.args.push({ type: "helper", value: toPush })
                        if (this.fromCLI) {
                            if (this.defaultImpDetails.helpers.indexOf(actObj.name) == -1 && this.defaultHelpers.indexOf(actObj.name) == -1) {
                                this.defaultImpDetails.helpers.push(actObj.name);
                            }
                            this.getImportedHelpers(actObj.args, this.defaultImpDetails.helpers);
                        }
                    }
                    else if(actObj === false){
                        errors.push(new Error("(LC:13)Syntax error in node "+node.node+" for the attribute:"+node.attributes[x].nodeName+"- "+node.attributes[x].text));
                        return;
                    }
                    else{
                        if((toPush.startsWith("'") && toPush.endsWith("'")) || (toPush.startsWith('"') && toPush.endsWith('"'))){
                            console.warn("Rendering string value inside dynamic data (mustache) is depriciated","for the value ",toPush ,"on the attribute value ",str);
                        }
                        helper.args.push(toPush);
                    }
                    if(this.fromCLI){
                        start = i + 1;  
                    }
                }
                if (!this.fromCLI) {
                    start = i + 1;//checkWithMentor 3055 it should come up one step
                }
                // var actObj = getHelper(toPush, componentName);
                // if (actObj) {
                //     toPush = actObj;
                //     helper.args.push({
                //         type: "helper",
                //         value: toPush
                //     });
                // } else {
                //     helper.args.push(toPush);
                // }
                // start = i + 1;
            }

        }
        if (start < str.length) {
            helper.args.push("'" + str.substr(start, str.length - start) + "'");
        }
        if (flag) {
            helper._t = "hq";
            return helper;
        }
        else {
            return helper;
        }
    }

    Compile.getHelper = function(dynamicValue) {
        let helperValue = this.regex.getHelperRegex.exec(dynamicValue);
        if(helperValue){
            let actObj = this.getHelperInfo(dynamicValue,helperValue);
            if(this.regex.getArrayArgRegex.test(dynamicValue)){
                actObj._t = 'hq';
            }
            // actObj._importHelperArray = importHelperArray;
            return actObj;
        }
        return undefined;
    }
    

    Compile.getHelperInfo = function(dynamicValue, helperValue){
        let helperFunc = {};
        helperFunc.name = dynamicValue.substr(0, helperValue.index).replace(this.regex.matchAllEmptyCharacter, '');
        helperValue = (helperValue) ? helperValue[0].trim() : helperValue;
        let args = this.getHelperArgs(helperValue.substr(1,helperValue.length-2));
        if(helperFunc.name == "lyteViewPort" && helperValue == "()"){
            helperFunc.args = [];
            return helperFunc;
        }
        if (args === false) {
            return false;
        }
        helperFunc.args = args;
        return helperFunc;
    }

    Compile.getHelperArgs = function(str){
        let stack = [],
        escapeQuote = false,
        stringStarted = false,
        bracketStack = [],
         args = [],
          from = 0;
        let lastPushed;
        for(let i=0; i<str.length; i++){
            if(!stack.length && str.charAt(i) === ","){
                let toPush = str.substr(from,i-from);
                toPush = toPush.trim();
                if(toPush && toPush.startsWith("\"") && toPush.endsWith("\"")){
                    toPush = toPush.slice(1,-1);
                    toPush = "'" + toPush + "'";
                }
                try{
                    toPush = this.getHelperArgValue(toPush);
                }
                catch(err){
                    console.log("errr",err);
                    if(err.message == "lbindError"){
                        return "lbindError"
                    }
                }
                args.push(toPush);
                from = i + 1;
            }
            else if(!bracketStack.length && stringStarted && str.charAt(i) === "\\" && /\\|\'|\"/g.test(str.charAt(i+1))){
                str = str.substr(0,i)  + str.substr(i+1,str.length);
            }
            else if(str.charAt(i) === "\\" && /\\/g.test(str.charAt(i+1))){
                // str = str.substr(0,i)  + str.substr(i+1,str.length);
                // continue;
                i++;
            }
            else if(str.charAt(i) === "\\" && /\'|\"/g.test(str.charAt(i+1))){
                escapeQuote = true
            }
            else if(str.charAt(i) === "("){
                if(stack[stack.length - 1] != "'" && stack[stack.length - 1] != "\""){
                    stack.push(str.charAt(i));
                    lastPushed = str.charAt(i);
                    bracketStack.push("(");
                }
            }
            else if(str.charAt(i) === ")"){
                if(stack[stack.length-1] === "("){
                    stack.pop();
                    bracketStack.pop();
                }
            }
            else if(str.charAt(i) === "'"){// && str.charAt(i-1) !== "\\"
                if(escapeQuote){
                    escapeQuote = false;
                    continue;
                }
                else if(stack[stack.length-1] === "'"){
                    stringStarted = false
                    stack.pop();
                }
                else if(stack[stack.length-1] !== "\""){
                    stack.push(str.charAt(i));
                    lastPushed = str.charAt(i);
                    stringStarted = true;
                }
            }
            else if(str.charAt(i) === "\""){// && str.charAt(i-1) !== "\\"
                if(escapeQuote){
                    escapeQuote = false;
                    continue;
                }
                else if(stack[stack.length-1] === "\""){
                    stringStarted = false
                    stack.pop();
    //                  str.replaceAt(i, "'");
                }
                else if(stack[stack.length-1] !== "'"){
                    stack.push(str.charAt(i));
                    lastPushed = str.charAt(i);
                    stringStarted = true;
    //                  str.replaceAt(i, "'");
                }
            }
        }
        if (stack.length) {
            return false;
        }
        let toPush = str.substr(from, str.length - from);
        toPush = toPush.trim();
        if (toPush && toPush.startsWith("\"") && toPush.endsWith("\"")) {
            toPush = toPush.slice(1, -1);
            toPush = "'" + toPush + "'";
        }
        try{
            toPush = this.getHelperArgValue(toPush);
        }
        catch(err){
            console.log("errr",err);
            if(err.message == "lbindError"){
                return "lbindError"
            }
            return false;
        }
        args.push(toPush);
        return args;
    }
    
    Compile.getHelperArgValue = function(argValue) {
        switch (argValue) {
            case "undefined":
                return undefined
            case "true":
                return true;
            case "false":
                return false;
            case "null":
                return null;
            case "":
                return undefined;
            default:
                if (argValue && argValue.startsWith("'") && argValue.endsWith("'")) {
                    return (this.fromCLI)?this.decodeHtmlEntities.decode(argValue):argValue;
                }else if(this.fromCLI && this.regex.getArrayArgRegexCLI.test(argValue) && !this.regex.endsWithCloseParantheses.test(argValue)){// //array //if array inside helepr or array inside array it should work/\w+\[.*\]/g
                    let arg = this.getArrayArg(argValue);
                    return arg.args[0];
                } 
                else if(!this.fromCLI && this.regex.getArrayArgRegex.test(argValue) && !this.regex.endsWithCloseParantheses.test(argValue)){
                    let arg = this.getArrayArg(argValue);
                    return arg.args[0];
                }
                else if(/\([\w\s,')(]*/.test(argValue)) {
                    let arg = this.getHelper(argValue);
                    if(arg === false){
                        throw new Error(argValue);
                    }
                    if(arg.name == "lbind"){
                        throw new Error("lbindError");
                    }
                    return {"type" : "helper" , "value" : arg}
                } else if (!isNaN(argValue)) {
                    return parseInt(argValue);
                } else {
                    return argValue;
                }
        }
    }
    Compile.getMustache = function(value,componentName,syn){
        value=(value && typeof value === "string") ? value.trim() : value;
            if(this.regex.startWithMustacheWithContent.test(value)){
            let arr = value.match(this.regex.mustacheCountCheck);
                if(arr && arr.length > 1){
                    console.log("length>1",value)
                    return undefined;
                }
                // console.log(value);
                if(syn && !syn.bool){
                    console.log("syntax error",syn)
                    return {bool:false,err:syn.err};
                }
                if(!this.regex.validMustacheCheck.test(value)){
                    return undefined;
                }
                let dynamic = value.match(this.regex.dynamicValueCheck); // /* */
                if(dynamic && dynamic.length > 1){
                    return undefined;
                }
                else{
                    dynamic = (dynamic) ? dynamic[0].trim(): dynamic;                
                }
                // console.log("dynamic value before returning ", dynamic);
                return dynamic;
            }
            return undefined;
    }
    Compile.syntaxCheckWorkerNew = function(val){
        var parsingMustache;
        var retObj = {
            "mustache":0,
            bool : true,
            err : null
        }
        for(let i=0;i<val.length;i++){
            if(parsingMustache){
                if(val[i] == "\\"){
                    i=i+1;
                }
                else if(val[i] == "'"){
                    if(lastString != '"'){//val[i-1] != "\\"  && 
                        if(!stringStarted){
                            stringStarted = true;
                            lastString = "'";
                        }else{
                            stringStarted = false;
                            lastString = undefined;
                        }
                    }               
                }
                else if(val[i] == '"'){
                    if(lastString != "'"){//val[i-1] != "\\" &&
                        if(!stringStarted){
                            stringStarted = true;
                            lastString = '"'
                        }else{
                            stringStarted = false;
                            lastString = undefined;
                        }
                    }
                }
                else if(val[i] == "{" && !stringStarted){
                    retObj.bool = false;
                    retObj.err = " unexpected '{' bracket ";
                    return retObj;
                }
                else if(val[i] == "{" && stringStarted && val[i-1] == "{"){
                    retObj.mustache ++;
                }
                else if(val[i] == "}" && val[i-1] == "}" && !stringStarted){
                    if(curlyBracket.length){
                        retObj.bool = false;
                        retObj.err = " error unmatched '(' bracket ";
                        return retObj;
                    }
                    if(squareBracket.length){
                        retObj.bool = false;
                        retObj.err = " unmatched '['bracket ";
                        return retObj;
                    }
                    parsingMustache = false;
                }
                else if(val[i] == "[" && !stringStarted){
                    squareBracket.$push("[");
                }
                else if(val[i] == "]" && !stringStarted){
                    if(squareBracket.length){
                        squareBracket.$pop();
                    }else{
                        retObj.bool = false;
                        retObj.err = " unmatched ']' bracket ";
                        return retObj;
                    }
                }
                else if(val[i] == "(" && !stringStarted){
                    curlyBracket.$push('(');
                }
                else if(val[i] == ")" && !stringStarted){
                    if(curlyBracket.length){
                        curlyBracket.$pop();
                    }else{
                        retObj.bool = false;
                        retObj.err = " unmatched ')' bracket "; 
                        return retObj;
                    }
                }
            }    
            else if((val[i] == "{" && val[i-1] == "{" && val[i-2] != "\\")){
                //start parsing
                var curlyBracket =[] ,squareBracket =[] ,stringStarted ,lastString;
                var parsingMustache = true;
            }
        }
        if(parsingMustache){
            retObj.bool = false;
            retObj.err = " unmatched '{' bracket";
            return retObj;
        }
        return retObj;
    }
    Compile.getArray = function(mustacheVal){
        // becomses true if it is arr[arr[0]] or arr[helper()]
        if(this.regex.getArrayArgRegex.test(mustacheVal) && !this.regex.endsWithCloseParantheses.test(mustacheVal)){
            let arg = this.getArrayArg(mustacheVal);
            if(arg && arg.args[0]){
                arg.args[0].value._t = "sq";
                return arg.args[0].value;
            }else{
                return false;
            }
        }
    }
    Compile.splitMultiDimensionArray = function(val,arrayExtra){
        var openSq = 0,openSqPos = 0,lastString,stringStarted,openSPos,resultStack = [],extra = false,extraPos;
        for(var i=0 ; i<val.length;i++){
            if(val[i] == "\\"){
                i=i+1;
            }
            else if(val[i] == "'"){
                if(lastString != '"'){//val[i-1] != "\\"  &&
                    if(!stringStarted){
                        stringStarted = true;
                        lastString = "'";
                    }else{
                        stringStarted = false;
                        lastString = undefined;
                    }
                }               
            }
            else if(val[i] == '"'){
                if(lastString != "'"){//val[i-1] != "\\" &&
                    if(!stringStarted){
                        stringStarted = true;
                        lastString = '"'
                    }else{
                        stringStarted = false;
                        lastString = undefined;
                    }
                }
            }
            else if(val[i] == "[" && !stringStarted){
                openSq = openSq + 1;
                if(openSq == 1){
                    openSqPos = i;
                }
            }
            else if(val[i] == "]" && !stringStarted){
                openSq = openSq - 1;
                if(!extra && openSq == 0){
                    resultStack.push(val.substring(openSqPos+1,i));//need to handlw []
                    openSq = 0;
                    if(val[i+1]=='.'){
                        extra = true;
                        extraPos = i+1;
                    }
                }
            }
        }
        if(extra){
            arrayExtra.push(val.substring(extraPos,i));//need to handlw []
        }
        return resultStack;
    }
    Compile.getArrayArg = function(argStr){
        //argStr may be 0 or '0' or 'abc' or a() or a[] or a(b[]) or a[b()]
        // var arg = {"type":"sq","value":{"args":[],"name":""}},arrayName;
        if(this.regex.matchInsideParentheses.test(argStr)){
            //if arr comes inside helper
            let arg = this.getHelper(argStr);  
            if(arg === false){
                return false;
            };
            return {"args":[{ "type": "helper", "value": arg }]}
        }
        else if(this.regex.validateArrayIndexing.test(argStr)){
            let arg = {'args':[]}, ret = [], temp,arrayExtra=[],retNew = [];
            let arrayArg = this.regex.matchInsideSquareBrackets.exec(argStr);
            let arrayName = argStr.substr(0,arrayArg.index);
            // arrayArg = arrayArg[0];
            //splitting multi dimensional array a[one][two][three] into array
            var arr = this.splitMultiDimensionArray(argStr, arrayExtra);
            for(var i=0; i<arr.length; i++){
                if(this.regex.getArrayArgRegex.test(arr[i]) || this.regex.matchInsideParentheses.test(arr[i])){
                    temp = this.getArrayArg(arr[i]);
                    ret.push(temp.args[0]);
                }
                else{
                    ret.push(arr[i])
                }
            }
            for(var i=0; i<arrayExtra.length; i++){
                if(this.regex.getArrayArgRegex.test(arrayExtra[i])){
                    temp = this.getArrayArg(arrayExtra[i]);
                    retNew.push(temp.args[0])
                }else{
                    retNew.push(arrayExtra[i])
                }
            }
            ret.forEach(function(item,index){
                if (item && item && typeof item == "string" && item.startsWith("\"") && item.endsWith("\"")) {
                    item = item.slice(1, -1);
                    item = "'" + item + "'";
                }else if(typeof item == "string" && Compile.regex.startsAndEndWithNumber.test(item)){
                    item = "'" + item + "'";
                }
                arg.args.push(item)
            })
            arg.name = arrayName;
            if(retNew && retNew.length > 0){
                arg.extra = retNew;
            }
            return {"args":[{"type" : "sq" , "value" : arg}]};
        } 
    }
    Compile.getDV = function(value){
        var result = [],ref = result,arr = [],data = "",strStack = [],arrayStack = [],refStack = [],strLast,str;
        for(var i=0;i<value.length;i++){
            if(value[i] === "."){
                if(data.length){
                    ref.$push(data);
                }
                data = "";
                continue;
            }
            else if(value[i] === "["){
                arrayStack.$push(i)
                if(data.length){
                    ref.$push(data);
                }
                while(value[i+1] === "\s"){
                    i++;
                }
                if(value[i+1] === "\"" || value[i+1] === "'"){
                    strStack.$push(value[i+1]);
                    strLast = value[i+1];
                    i++;
                }
                else if(arr.length){
                    ref.$push([]);
                    refStack.$push(ref);
                    ref = ref[ref.length-1];
                }else{
                    arr.$push([]);
                    refStack.$push(ref);
                    ref = arr[arr.length-1];
                }
                data = "";
                continue;
            }
            else if((value[i] === "\"" || value[i] === "'" ) && value[i++] === strLast){
                while(value[i] === "\s" && value[i] != "]"){
                    i++;
                }
                strStack.$pop();
                str = true;
            }
            if(value[i] === "]"){
                arrayStack.$pop();
                if(data.length){
                    if(str === true){
                        ref.$push(data);    
                    }
                    else if(!isNaN(parseInt(data))){
                        if(refStack.length){
                            ref = refStack.$pop();
                            if(arr.length && Array.isArray(ref[ref.length-1]) && !ref[ref.length-1].length){
                                ref.$pop();
                            }
                            ref.$push(data);
                            if(!arrayStack.length && arr.length){
                                arr.$shift();
                            }
                        }
                    }
                    else{
                        ref.$push(data);
                    }
                }
                if(!arrayStack.length && arr.length){
                    result.$push(arr.$shift());
                    ref = result;
                }
                else if(refStack.length && !arr.length){ 
                    ref = refStack.$pop();
                }
                data = "";
                str = "";
                continue;
            }
            data = data.concat(value[i]);
        }
        if(data.length){
            result.$push(data);
        }
        if(strStack.length || arrayStack.length){
            console.log("check the syntax",strStack,arrayStack);
        }
        return result;
    }
    // return Compile;
// }

if( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = Compile;
}else{
    window.BaseCompiler = Compile;
}
// BaseCompiler();
