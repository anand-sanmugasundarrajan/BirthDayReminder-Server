import { _delimit } from "./router-utils";
import { deepCopyObject } from '@slyte/core/src/lyte-utils';

class Location {
    constructor(obj) {
        var ignore = ["reload","ancestorOrigins","replace","toString","assign"]
        for(var key in obj) {
            if(ignore.indexOf(key) == -1) {
                this[key] = obj[key];
            }
        }
    }
}

class History {
    constructor({ historyType, popState, parent}) {
        var __lh = this.__lh = {
            historyType : parent && parent.history.type || historyType,
            allowHistoryChange : false,
            fromHistory : false,
            historyLength : 1,
            exp : {                
            }
        };
        this.parent = parent;

        window.addEventListener('popstate', function(event) {
            __lh.fromHistory = true;
            setHistoryObj.call(this, event.state);
            popState(event);
        }.bind(this));
       

        // Object.defineProperty(this.constructor.prototype, 'state', {
        //     get : function() {
        //         return this.getData();
        //     },
        //     set : function(data) {
        //         if(this.__lh.allowHistoryChange) {
        //             debugger;
        //             this.__lh.allowHistoryChange = false;
        //         } else {
        //             lyte.warn('setting on data will not be pushed to history. If needed, use `LR.history.replaceState`.');
        //         }
        //         return data;
        //     }
        // });

        __lh.exp.pushState = this.pushState = function(data, title, url, metaData) {
            url = mergeWithParentUrl.call(this,{url})
            return stateChange.call(this, data,title,url,metaData);
        };
    
        __lh.exp.replaceState = this.replaceState = function(data,title,url,metaData) {
            url = mergeWithParentUrl.call(this,{url})
            return stateChange.call(this,data,title,url,metaData, true);
        };
        __lh.exp.go = this.go = history.go
        __lh.exp.back = this.back = history.back
        __lh.exp.forward = this.forward = history.forward
        __lh.exp.length = this.length = history.length
        Object.defineProperty(this,"scrollRestoration",{
            get : () => {
                return history.scrollRestoration;
            },
            set : (value) => {
                history.scrollRestoration = value;
            }
        })
    
        this.getMeta = function() {
            var meta = history.state && history.state.meta
            return meta;
        }

        function mergeWithParentUrl({url}) {
            if(this.parent) {
                debugger;
                var i,
                pUrl = this.parent.history.url,
                serch = ((i = url.indexOf('?')) != -1) ? "?"+url.slice(i+1) : "";
                serch = this.parent.history.search+serch;
                if(url.indexOf("#") != -1) {
                    url = _delimit(url.split("#")[1])
                }
                if(this.__lh.historyType == "hash") {
                    pUrl = this.parent.path
                    url = pUrl+ url
                } else if(pUrl.indexOf("#")) {
                    pUrl = this.parent.path + url + _delimit(pUrl.split("#")[1])
                } 
                url += (serch ? "?"+serch : "");
            }
            return url
        }
        
        __lh.exp.getData = this.getData = function() {
            return history.state && history.state.data;
        }
        
        // this.getHistoryObj = function() {
        //     var retObj =  {
        //         historyType : historyType,
        //         index : this.__lh.currentMeta ?  this.__lh.currentMeta.__lh.index : 0,
        //         fromHistory : this.__lh.fromHistory ? (this.__lh.prevMeta ? (this.__lh.prevMeta.__lh.index < this.__lh.currentMeta.__lh.index ? 'forward' : 'back') : 'reload') : false,
        //         initial : this.__lh.historyLength == 0
        //     }
        //     // allowHistoryChange = true;
        //     retObj.state = history.state;
        //     retObj.meta = this.getMeta() || {};
        //     retObj.data = this.getData() || {};
        //     return retObj;
        // }
    }
}

function getHistoryState(obj) {
    /* 
    {
            matched : obj.matched,
            url : obj.url,
            index : obj.fromHistory ? (this.getMeta() ? this.getMeta().index : historyLength) : ((obj.replace && this.getMeta()) ? this.getMeta().index : (historyLength = historyLength+1))
        }

        state data which needs to be pushed to history. 
        - Matched object is added to process url directly with history back and forward.
        - Index is used to detect browser back or forward.
    */
    var metaData = obj.metaData || {},
    currentMeta = this.__lh.prevMeta = this.__lh.currentMeta;
    metaData.__lh = {
        index : obj.replace ? (currentMeta ? currentMeta.__lh.index : this.__lh.historyLength-1) : (currentMeta ? currentMeta.__lh.index+1 : this.__lh.historyLength),
        url : obj.url,
        title : obj.title
    }
    return {
        meta : this.__lh.currentMeta = metaData,
        data : obj.data
    };
}

function stateChange(data,title,url, metaData, replace) {
    var args = [getHistoryState.call(this, {data , metaData, replace, title, url}) , title] 
    if(url) {
        /* support for windows, undefined is appended to url */
        args.push(url)
    }
    // this.__lh.prevMeta = history.state && history.state.meta;
    window.history[replace ? "replaceState" : "pushState"].apply(window.history, args);
    var hstry = setHistoryObj.call(this) //this.getHistoryObj();
    // this.__lh.index = his.index;
    if(!hstry.fromHistory && !replace) {
        this.__lh.historyLength++;
    }
    return hstry;
}

function setHistoryObj(popHistory) {
    var self = deepCopyObject(this);
    if(popHistory) {
        self.__lh.currentMeta = self.__lh.prevMeta = popHistory.meta;
        return self.__lh.exp;
    }
    self.__lh.exp = new Location(window.location);
    var href = self.getMeta() && self.getMeta().__lh.url || window.location.href,
    urlSplit = href.split("?"),
    search = urlSplit[1] || "",
    hash = urlSplit[0].split("#")[1] || "";
    self.__lh.exp.index = self.__lh.index = self.__lh.currentMeta ?  self.__lh.currentMeta.__lh.index : 0;
    self.__lh.exp.fromHistory = self.__lh.fromHistory = self.__lh.fromHistory ? (self.__lh.prevMeta ? (self.__lh.prevMeta.__lh.index < self.__lh.currentMeta.__lh.index ? 'forward' : 'back') : 'reload') : false;
    self.__lh.exp.initial = self.__lh.initial = self.__lh.historyLength == 0;
    self.__lh.exp.data = self.getData && self.getData() || history.state && history.state.data;
    self.__lh.exp.url = href;
    self.__lh.exp.type = this.parent ? this.parent.history.type : this.__lh.historyType;
    self.__lh.exp.href = self.__lh.exp.origin+self.__lh.exp.pathname+href;
    self.__lh.exp.search = search && "?"+search;
    self.__lh.exp.hash = hash && "#"+hash;
    self.__lh.state = history.state;
    self.__lh.currentMeta = self.__lh.prevMeta = self.getMeta && self.getMeta() || history.state && history.state.meta;
    return self.__lh.exp;
}

export {
    History
};
    