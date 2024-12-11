import { RouterError } from "./router-errors";
import { _getObj, _getRouteFromAlias } from "./router-utils";

const startFromStr = "start-from",
ltPropStr = "lt-prop",
routeStr = "route",
pReplace = ltPropStr+"-replace",
pStartFrom = ltPropStr+"-"+startFromStr,
pFragment = ltPropStr+"-fragment",
pDp = ltPropStr+"-dp",
pQp = ltPropStr+"-qp",
pTd = ltPropStr+"-td",
pData = ltPropStr+"-data",
pTrans = ltPropStr+"-trans",
pMeta = ltPropStr+"-meta",
refreshHRouteStr = "refresh-"+routeStr,
pRefreshRoute = ltPropStr+"-"+refreshHRouteStr,
linktoStr = "link-to",
ltPropWarning = "Error while parsing ltProp in "+linktoStr,
pRoute = ltPropStr+"-"+routeStr;
const parse = JSON.parse;

function linkToRegistration(lyte,LR,config) {
    LR.__lp.navigationCompleted = function(trans) {
        if(config.linkActiveClass && config.allLinks[trans.target]) {
            config.allLinks[trans.target].forEach(function(tag) {
                if(!tag.classList.contains(config.linkActiveClass)) {
                    tag.classList.add(config.linkActiveClass);
                    config.activeLinkTags.push(tag);
                }
            });
        }
    }

    LR.__lp.mutateCache = function(target) {
        if(config.allLinks[target]) {
            config.allLinks[target].forEach(function(tag) {
                if(config.linkActiveClass) {
                    tag.classList.add(config.linkActiveClass);
                }
                config.activeLinkTags.push(tag);
                var aTag = tag.getElementsByTagName('A')[0]
                if(aTag) {
                    aTag.setAttribute("href", LR.getURL(tag.getMatchedObject())); 
                }
            });
        }
    }

    class LinkTo extends HTMLElement {
        static get observedAttributes() {
            return [pRoute, pDp, pFragment, pQp, ltPropStr, 'lt-prop-class', 'lt-prop-id', 'lt-prop-rel', 'lt-prop-title', 'lt-prop-style', 'lt-prop-target','lt-prop-data-tabindex', 'lt-prop-aria-attributes','lt-prop-tabindex','lt-prop-aria-label'];
        }
        attributeChangedCallback(attr, oldValue, newValue) {
            if(this.matched && this.hasAttribute("lyte-rendered")) {
                let Atag = this.getElementsByTagName('A')[0];
                if(Atag) {
                    //If attr is ltProp
                    if(attr === ltPropStr) {
                        this.handleLtProp();
                        if(!this.hasAttribute("lt-prop-custom")) {
                            this.setCustomAttributes(Atag, true);
                        }
                        this.constructHref(Atag);
                    } else if(/^(lt-prop-route|lt-prop-fragment|lt-prop-dp|lt-prop-qp)$/.test(attr)) {
                        //if it is a route transition attribute
                        this.getMatchedObject();
                        this.constructHref(Atag, attr, oldValue, newValue);
                    } else if(!this.hasAttribute('lt-prop-custom')) {
                        //for rest of the attributes
                        Atag.setAttribute(attr.substring(8), newValue);
                    }
                }
            }
        }

        connectedCallback() {
            this.ltProp = this.ltProp || {};
            this.handleLtProp();
            if(this.hasAttribute("lyte-rendered")) {
                if(this.getElementsByTagName('A')[0] && !this.matched) {
                    this.getMatchedObject();
                }
                return;
            } 
            var isCustom = this.hasAttribute("lt-prop-custom") || this.ltProp.custom,
            aTag;
            if(isCustom) {
                if(aTag = this.getElementsByTagName('A')[0]) {
                    this.getMatchedObject();
                    this.constructHref(aTag);
                }
            } else {
                aTag = document.createElement("a");
                while(this.childNodes[0]) {
                    aTag.appendChild(this.childNodes[0]);
                }
                this.setCustomAttributes(aTag);
                this.getMatchedObject();
                this.constructHref(aTag);
                this.appendChild(aTag);
            }
            if(lyte.$.modules.component) {
                this._linkToEventId = lyte.$.modules.component[0].addAction(this, "click", function(event) {
                    linkToEventListener(event, this);
                }, this);
            } else {
                this.addEventListener("click", linkToEventListener);
            }
            this.setAttribute("lyte-rendered", "");
        }

        modifyLinkToTagsInRoute(remove) {
            var strRoute = Array.isArray(this.matched.route) ? this.matched.route.join('.') : this.matched.route,
            allLinks = config.allLinks[strRoute];
            if(remove) {
                if(allLinks) {
                    let pos = allLinks.indexOf(this);
                    if(pos != -1) {
                        allLinks.splice(pos,1);
                    }
                }
            } else {
                if(allLinks) {
                    allLinks.push(this);
                } else {
                    config.allLinks[strRoute] = [this];
                }
            }
            if(config.cacheRoutes[strRoute]) {
                let routesObj = config.routes,
                routes;
                if(remove) {
                    if(this.matched) {
                        routes = remove;
                    } else {
                        return;
                    }
                } else {
                    routes = this.matched.route;
                }
                if(!routes) {
                    return;
                } 
                routes = Array.isArray(routes) ? routes : _dotSerperator(routes);
                for(var i = 0,l = routes.length,r; i < l; i++) {
                    r = routes[i];
                    routesObj =  _getObj(r,routesObj);
                    if(!routesObj || !routesObj.__lp) {
                        RouterError.error(422,routes,i);
                        return false;
                    }
                    var def = routesObj.__lp.handler && routesObj.__lp.options;
                    if(remove) {
                        let pos = def.cacheLinks.indexOf(this);
                        if(pos !== -1) {
                            def.cacheLinks.splice(pos,1);
                        }
                    } else if(def.qpdef) {
                        def.cacheLinks.push(this);  
                    }
                }
            }
        }

        disconnectedCallback() {
            let m = this.modifyLinkToTagsInRoute.bind(this);
            if(lyte.$.component && !lyte.$.component.shouldIgnoreDisconnect()) {
                if(this.matched && this.matched.route) {
                    m(this.matched.route);
                }
                if(this._linkToEventId) {
                    lyte.$.component.removeLyteEventListener(this, this._linkToEventId);
                }
            }
        }
        
        handleLtProp(ignoreError) {
            var ltProp = this.getAttribute(ltPropStr);
            if(ltProp) {
                try{
                    this.ltProp = parse(ltProp);
                } catch(e) {
                    if(!ignoreError) {
                        lyte.error(ltPropWarning,ltProp);
                    }
                }
            }
        }

        setCustomAttributes(linkTag, onlyLtProp) {
            for(let key in this.ltProp) {
                if(/^(id|class|style|target)$/.test(key)) {
                    linkTag.setAttribute(key, this.ltProp[key]);
                }
            }
            if(!onlyLtProp) {
                for(let i=0,attr,attrName; attr = this.attributes[i]; i++) {
                    if((attrName = attr.nodeName) !== ltPropStr && /^(lt-prop-id|lt-prop-rel|lt-prop-class|lt-prop-style|lt-prop-target|lt-prop-data-tabindex|lt-prop-tabindex|lt-prop-aria-label|lt-prop-aria-attributes)$/.test(attrName)) {
                        linkTag.setAttribute(attrName.substring(8), attr.nodeValue);
                    }
                }
            }
        }

        constructHref(linkTag, attr, oldValue) {
            var href,
            m = this.modifyLinkToTagsInRoute.bind(this);
            if(href = LR.getURL.call(this,this.matched)) { /* deepCopyObj this.matched. ??*/
                linkTag.setAttribute("href", href); 
                if(attr === pRoute) {
                    m(oldValue);
                    m();
                } else {
                    m();
                }
            }
        }
    }
    
    LinkTo.prototype.getMatchedObject = function() {
        var matched = this.matched || {},
        ga = this.getAttribute.bind(this),
        dynamicParams = ga(pDp) || this.ltProp.dp || [],
        queryParams = ga(pQp) || this.ltProp.qp || {};
        if(!(dynamicParams instanceof Array)) {
            try {
                dynamicParams = parse(dynamicParams);  
            } catch(e) {
                RouterError.error("498A","dynamicParams",this.outerHTML);
                return;
            }
        }
        if(!(queryParams instanceof Object)) {
            try{
                queryParams = parse(queryParams);
                if(Array.isArray(queryParams)) {
                    RouterError.error("498A","queryParams",this.outerHTML);
                    return;
                }
            } catch(e) {
                RouterError.error("498A","queryParams",this.outerHTML);
                return;
            }
        }
        var routeFromAlias = _getRouteFromAlias.call(lyte,{route : ga(pRoute) || this.ltProp.route, map : config.aliasRouteMap});/* ga(pRoute) || this.ltProp.route; */
        matched.route = routeFromAlias.route;
        matched.alias = routeFromAlias.alias;
        matched.fragment = ga(pFragment) || this.ltProp.fragment;
        matched.dynamicParams = dynamicParams || [];
        matched.queryParams = queryParams || {};
        matched.refreshRoute = ga(pRefreshRoute) != undefined ? ga(pRefreshRoute) : this.ltProp[refreshHRouteStr];
        matched.refreshRoute = (matched.refreshRoute == "" || matched.refreshRoute == 'true') ? matched.route.join(".") : matched.refreshRoute;
        matched.startFrom = ga(pStartFrom) || this.ltProp[startFromStr];
        return this.matched = matched;
    };
    customElements.define(linktoStr, LinkTo);
    customElements.define("go-to", (function() {
        class GoTo extends LinkTo {}
        return GoTo;
    })());

    function linkToEventListener(event, linkTo) {
        if(event.button == 2 || event.defaultPrevented) {
            return;
        }
        var targetElem = linkTo || event.currentTarget;
        if(targetElem.children[0].tagName === "A" && (event.ctrlKey == true || event.metaKey == true || event.which == 2 || (targetElem.children[0].hasAttribute("target") && targetElem.children[0].getAttribute("target") !== "_self")) ) {
            return;  
        }
        event.preventDefault();
        if(!targetElem.matched) {
            targetElem.getMatchedObject();
        }
        var matched = Object.assign({},targetElem.matched);
        matched.route = Array.isArray(matched.route) ? matched.route.join('.') : matched.route;
        var replace = targetElem.ltProp.replace  || targetElem.hasAttribute(pReplace),
        transitionInstance = LR[replace && replace != "false" ? "replaceWith" : "navigateTo"](targetElem.matched);
        targetElem.handleLtProp(true)
        var transObj = {},
        transProp,
        ltProp = targetElem.ltProp;
        if(transProp = targetElem.getAttribute(pMeta) || targetElem.getAttribute(pTrans) || (ltProp && ltProp.meta)) {
            try{
                transObj = parse(transProp);  
            } catch(e) {
                RouterError.error("498A", pMeta , linkTo.outerHTML);
            }
        }
        let transitionData = targetElem.getAttribute(pData) || targetElem.getAttribute(pTd) || (ltProp && ltProp.data);
        if(transitionData/* = (transitionData || transObj.data)*/) {
            if(typeof transitionData === "string") {
                try {
                    transitionData = parse(transitionData);
                } catch(e) {
                    RouterError.error("498A", pData , linkTo.outerHTML);
                }
            }
            transObj.data = transitionData;
        }
        for(var key in transObj) {
            transitionInstance[key] = transObj[key];
        }
    }
}

export { linkToRegistration };