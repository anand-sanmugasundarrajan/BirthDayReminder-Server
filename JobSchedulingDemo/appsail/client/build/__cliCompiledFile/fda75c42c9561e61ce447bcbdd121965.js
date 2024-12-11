import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

if(!window.LytePopup){
    window.LytePopup = {
        components:[],
        bodywrapperCount:0,
        onEscape : function(evt){
            evt = evt || window.event;
            var isEscape = false;
            var isTabPressed = false;
            var isEnter = false;
            var activeElement = document.activeElement;
            if ("key" in evt) {
                isEscape = (evt.key == "Escape" || evt.key == "Esc");
                isTabPressed = (evt.key == "Tab");
                isEnter = (evt.key == "Enter");
            } else {
                isEscape = (evt.keyCode == 27);
                isTabPressed = (evt.keyCode == 9);
                isEnter = (evt.keyCode == 13);
            }
            if (isEscape) {
                LytePopup.closePopup(undefined,true,evt);
            }
            if(isTabPressed && LytePopup.components.length > 0) {
                LytePopup.trapFocus(evt);
            }
            if(isEnter && activeElement && ( activeElement.classList.contains('alertClose') || activeElement.classList.contains('lyteModalClose') || activeElement.classList.contains('lytePopoverClose') )){
                activeElement.click();
            }
        },
        bindDocumentKeydown : function(){
            document.addEventListener('keydown',LytePopup.onEscape,true);
        },
        checkAndRemoveWrapper : function(){
            var elements = Array.from(document.querySelectorAll('.lyteAlertOpened')).concat(Array.from(document.querySelectorAll('.lyteModalOpened')), Array.from(document.querySelectorAll('.lytePopoverOpened')));
            if(elements.length == 0){
                document.body.classList.remove('bodyWrapper');
            }
            else{
                for(var i = 0; i < elements.length; i++){
                    if(elements[i].ltProp('freeze')){
                        return;
                    }
                }
                document.body.classList.remove('bodyWrapper');
            }
        },
        hideOrShowFreeze : function(cond, currComp, removedFromDom){
            var prevEleFreeze = '',val, currEleFreeze = '', prevElem = '', currElem = '';
            if(cond == "open" && LytePopup.components.length > 1){
                for(var i = LytePopup.components.length - 2 ; i >= 0; i--){
                    if(LytePopup.components[i].$node.tagName == "LYTE-MODAL"){
                        prevEleFreeze = 'lyte-modal-freeze';
                    }
                    else if(LytePopup.components[i].$node.tagName == "LYTE-POPOVER"){
                        prevEleFreeze = 'lyte-popover-freeze';
                    }
                    else{
                        prevEleFreeze = '.alertFreezeLayer';
                    }
                    if(currComp.$node.tagName == "LYTE-MODAL"){
                        currEleFreeze = 'lyte-modal-freeze';
                    }
                    else if(currComp.$node.tagName == "LYTE-POPOVER"){
                        currEleFreeze = 'lyte-popover-freeze';
                    }
                    else{
                        currEleFreeze = '.alertFreezeLayer';
                    }
                    prevElem = LytePopup.components[i].childComp.querySelector(prevEleFreeze);
                    currElem = currComp.childComp.querySelector(currEleFreeze);
                    val = currComp.getData('ltPropDimmer') && currComp.getData('ltPropDimmer').opacity ? currComp.getData('ltPropDimmer').opacity : "";
                    if(prevElem && currElem){
                        prevElem.style.transition = "none";
                        currElem.style.transition = "none";
                        prevElem.style.zIndex = 15;
                        prevElem.style.opacity = 0;
                        currElem.style.visibility = 'visible';
                        currElem.style.opacity = val;
                        setTimeout(LytePopup.removeTransition, 100, currElem, prevElem);
                        prevElem.style.zIndex = "";
                        currComp.addedFreezeDetails = true;
                        break;
                    }
                }
            }
            else if(cond == "close" && LytePopup.components.length > 1 && LytePopup.components[LytePopup.components.length-1] === currComp){
                for(var i = LytePopup.components.length - 2 ; i >= 0; i--){
                    if(LytePopup.components[i].$node.tagName == "LYTE-MODAL"){
                        prevEleFreeze = 'lyte-modal-freeze';
                    }
                    else if(LytePopup.components[i].$node.tagName == "LYTE-POPOVER"){
                        prevEleFreeze = 'lyte-popover-freeze';
                    }
                    else{
                        prevEleFreeze = '.alertFreezeLayer';
                    }
                    if(currComp.$node.tagName == "LYTE-MODAL"){
                        currEleFreeze = 'lyte-modal-freeze';
                    }
                    else if(currComp.$node.tagName == "LYTE-POPOVER"){
                        currEleFreeze = 'lyte-popover-freeze';
                    }
                    else{
                        currEleFreeze = '.alertFreezeLayer';
                    }
                    prevElem = LytePopup.components[i].childComp.querySelector(prevEleFreeze);
                    currElem = currComp.childComp.querySelector(currEleFreeze);
                    val = LytePopup.components[i].getData('ltPropDimmer') && LytePopup.components[i].getData('ltPropDimmer').opacity ? LytePopup.components[i].getData('ltPropDimmer').opacity : "";
                    if(prevElem && currElem){
                        currElem.style.transition = "none";
                        prevElem.style.transition = "none";
                        prevElem.style.zIndex = 15;
                        currElem.style.opacity = 0;
                        prevElem.style.visibility = "visible";
                        prevElem.style.opacity = val;
                        setTimeout(LytePopup.removeTransition, 100, currElem, prevElem);
                        prevElem.style.zIndex = '';
                        currElem.style.visibility = "";
                        break;
                    }
                    else{
                        if(prevElem && removedFromDom){
                            prevElem.style.transition = "none";
                            prevElem.style.zIndex = 15;
                            prevElem.style.visibility = "visible";
                            prevElem.style.opacity = val;
                            setTimeout(LytePopup.removeTransition, 100, currElem, prevElem);
                            prevElem.style.zIndex = '';
                            break;
                        }
                    }
                }
            }
        },
        removeTransition : function(currElem, prevElem){
            if(currElem){
                currElem.style.transition = "";
            }
            if(prevElem){
                prevElem.style.transition = "";
            }
        },
        addPopup : function(component) {
            LytePopup.closePopup();
            var compLengh = LytePopup.components.length;
            if(compLengh>0){
                var prevZIndex = 0;
                var prePopup = '', thisPopup = '';
                if(LytePopup.components[compLengh-1].$node.tagName == "LYTE-MODAL"){
                    prePopup = '.modalWrapper';
                }
                else if(LytePopup.components[compLengh-1].$node.tagName == "LYTE-POPOVER"){
                    prePopup = '.popoverWrapper';
                }
                else{
                    prePopup = '.alertWrapper';
                }

                if(component.$node.tagName == "LYTE-MODAL"){
                    thisPopup = '.modalWrapper';
                }
                else if(component.$node.tagName == "LYTE-POPOVER"){
                    thisPopup = '.popoverWrapper';
                }
                else{
                    thisPopup = '.alertWrapper';
                }
                var node = component.childComp.querySelector(thisPopup);
                prevZIndex = Number(document.defaultView.getComputedStyle(LytePopup.components[LytePopup.components.length-1].childComp.querySelector(prePopup),null).getPropertyValue('z-index'));
                if(prevZIndex+2 > Number(document.defaultView.getComputedStyle(node,null).getPropertyValue('z-index'))){
                    node.style.zIndex = prevZIndex+2;
                }
                // component.childComp.querySelector(thisPopup).style.zIndex = prevZIndex+2;
                // if(component.$node.ltProp('freeze') && component.childComp.querySelector(thisFreeze)){
                //     component.childComp.querySelector(thisFreeze).style.zIndex = prevZIndex+1;
                // }
            }
            LytePopup.components[compLengh] = component;
            if(component.getData('ltPropFreeze') || component.$node.tagName == "LYTE-ALERT"){
                LytePopup.hideOrShowFreeze("open", component)
            }
        },
        closePopup : function(component,fromEscape,event){
            if(fromEscape){
                var lastPop = LytePopup.components[LytePopup.components.length-1];
                if(lastPop){
                    var dropdowns = $L(lastPop.actualModalDiv).find('lyte-dropdown')
                    var dontClose = false;
                    for(var i = 0;i<dropdowns.length;i++){
                        if(dropdowns[i]){
                            if(dropdowns[i].getData('ltPropIsOpen')){
                                dontClose = true
                            }
                        }
                    }
                    if(lastPop && lastPop.$node.ltProp("closeOnEscape") && !dontClose){
                        lastPop.$node.setData('escClicked' , event);
                        lastPop.$node.ltProp("show",false);
                    }
                }
            } else {
                if(component){
                    var index = LytePopup.components.indexOf(component);
                    if(index > -1){
                        LytePopup.components.splice(index,1);
                    }
                }
                else{
                    for(var i=LytePopup.components.length-1;i>=0;i--){
                        if(LytePopup.components[i].$node && !LytePopup.components[i].$node.ltProp("allowMultiple")){
                            var comp = LytePopup.components[i];
                            // if(comp.$node.tagName == "LYTE-MODAL"){
                            //     LytePopup.components.splice(i,1);
                            // }
                            comp.$node.ltProp("show",false);
                        }
                    }
                }
            }
        },
        getScrollParent : function(node) {
            var isElement = node instanceof HTMLElement,
                overflowY = isElement && window.getComputedStyle(node).overflowY,
                isScrollable = overflowY !== 'visible' && overflowY !== 'hidden',
                scrollHeight = node && isScrollable ? node.scrollHeight : 0,
                clientHeight = node && isScrollable ? node.clientHeight : 0;

            if (!node) {
                return null;
            } else if (isScrollable && scrollHeight > clientHeight) {
                return node;
            }

            return LytePopup.getScrollParent(node.parentNode) || document.body;
        },
        focusFunction : function(node){
            node.focus()
            if(node.tagName === "INPUT" || node.tagName === "TEXTAREA"){
                if(node.type !== "checkbox" && node.type !== "radio" && node.type !== "number"){
                    node.selectionStart = node.value.length
                    node.scrollLeft = node.scrollWidth - node.getBoundingClientRect().width
                }
            }
        },
        trapFocus : function( evt, node ){
            var focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), *[contenteditable]';
            var parent = node || LytePopup.components[LytePopup.components.length-1].actualModalDiv;
            // get list of focusable items
            var focusableItems;
            focusableItems = $L(parent.querySelectorAll(focusableElementsString)).filter(function(ind, item){ return $L(item).is(':visible') && (item.tabIndex != -1) && !(item.disabled)});

            if(focusableItems.length == 0){
                return;
            }
            if(node){
                if(focusableItems.length > 1 && (focusableItems[0].classList.contains('lyteModalClose') || focusableItems[0].classList.contains('lytePopoverClose'))){
                    this.focusFunction(focusableItems[1])
                    // focusableItems[1].focus();
                }
                else{
                    this.focusFunction(focusableItems[0])
                    // focusableItems[0].focus();
                }
                return;
            }

            // get currently focused item
            var focusedItem = document.activeElement;
            var focusedParent;

            if(!(parent.contains(focusedItem))){
              focusedParent = $L(focusedItem).closest('lyte-drop-box')[0]
              if(focusedParent){
                focusedParent = focusedParent.origindd
              }
              if(!(parent.contains(focusedParent))){
                LytePopup.initializeFocus(parent);
                evt && evt.preventDefault();
                return;
              }
            }

            // get the number of focusable items
            var numberOfFocusableItems = focusableItems.length;

            // get the index of the currently focused item
            var focusedItemIndex;
            for(var i = 0; i < focusableItems.length; i++){
                if(focusableItems[i] == focusedItem){
                    focusedItemIndex = i;
                    break;
                }
            }

            if (evt.shiftKey) {
                //back tab
                // if focused on first item and user preses back-tab, go to the last focusable item
                if (focusedItemIndex == 0) {
                    this.focusFunction(focusableItems.get(numberOfFocusableItems - 1))
                    // focusableItems.get(numberOfFocusableItems - 1).focus();
                    evt.preventDefault();
                }

            } else {
                //forward tab
                // if focused on the last item and user preses tab, go to the first focusable item
                if (focusedItemIndex == numberOfFocusableItems - 1) {
                    this.focusFunction(focusableItems.get(0))
                    // focusableItems.get(0).focus();
                    evt.preventDefault();
                }
            }
        },
        initializeFocus : function(node){
            if(node.classList.contains('lyteModal') || node.classList.contains('lytePopover')){
                LytePopup.trapFocus(null, node);
            }
            else if(node.classList.contains('alertPopup')){
                var buttons = node._callee.ltProp('buttons');
                for(var i = 0; i<buttons.length; i++){
                    if(buttons[i].type == "accept"){
                        this.focusFunction(node.querySelectorAll('button')[i])
                        // node.querySelectorAll('button')[i].focus();
                        break;;
                    }
                }
            }
        },
        transitionEnd : function(evt){
            if(evt.target == this && LytePopup.components.length > 0){
                var comp = LytePopup.components[LytePopup.components.length-1];
                var element = comp.actualModalDiv;
                !(comp.getData('ltPropPreventFocus')) && LytePopup.initializeFocus(element);
                this.removeEventListener( 'transitionend', LytePopup.transitionEnd );
            }
        },
        bindTransitionEnd : function(node){
            node && node.addEventListener( 'transitionend', LytePopup.transitionEnd );
        }
    };

    LytePopup.bindDocumentKeydown();
}
window.ratingNum = 0;

window._lyteUiUtils.convert_diacritics = function( str ){
    var diacritics = [
        { value : 'A',  regex : /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
        { value : 'AA', regex : /[\uA732]/g },
        { value : 'AE', regex : /[\u00C6\u01FC\u01E2]/g },
        { value : 'AO', regex : /[\uA734]/g },
        { value : 'AU', regex : /[\uA736]/g },
        { value : 'AV', regex : /[\uA738\uA73A]/g },
        { value : 'AY', regex : /[\uA73C]/g },
        { value : 'B',  regex : /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
        { value : 'C',  regex : /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
        { value : 'D',  regex : /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
        { value : 'DZ', regex : /[\u01F1\u01C4]/g },
        { value : 'Dz', regex : /[\u01F2\u01C5]/g },
        { value : 'E',  regex : /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
        { value : 'F',  regex : /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
        { value : 'G',  regex : /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
        { value : 'H',  regex : /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
        { value : 'I',  regex : /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
        { value : 'J',  regex : /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
        { value : 'K',  regex : /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
        { value : 'L',  regex : /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
        { value : 'LJ', regex : /[\u01C7]/g },
        { value : 'Lj', regex : /[\u01C8]/g },
        { value : 'M',  regex : /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
        { value : 'N',  regex : /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
        { value : 'NJ', regex : /[\u01CA]/g },
        { value : 'Nj', regex : /[\u01CB]/g },
        { value : 'O',  regex : /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
        { value : 'OI', regex : /[\u01A2]/g },
        { value : 'OO', regex : /[\uA74E]/g },
        { value : 'OU', regex : /[\u0222]/g },
        { value : 'P',  regex : /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
        { value : 'Q',  regex : /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
        { value : 'R',  regex : /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
        { value : 'S',  regex : /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
        { value : 'T',  regex : /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
        { value : 'TZ', regex : /[\uA728]/g },
        { value : 'U',  regex : /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
        { value : 'V',  regex : /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
        { value : 'VY', regex : /[\uA760]/g },
        { value : 'W',  regex : /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
        { value : 'X',  regex : /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
        { value : 'Y',  regex : /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
        { value : 'Z',  regex : /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
        { value : 'a',  regex : /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
        { value : 'aa', regex : /[\uA733]/g },
        { value : 'ae', regex : /[\u00E6\u01FD\u01E3]/g },
        { value : 'ao', regex : /[\uA735]/g },
        { value : 'au', regex : /[\uA737]/g },
        { value : 'av', regex : /[\uA739\uA73B]/g },
        { value : 'ay', regex : /[\uA73D]/g },
        { value : 'b',  regex : /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
        { value : 'c',  regex : /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
        { value : 'd',  regex : /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
        { value : 'dz', regex : /[\u01F3\u01C6]/g },
        { value : 'e',  regex : /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
        { value : 'f',  regex : /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
        { value : 'g',  regex : /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
        { value : 'h',  regex : /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
        { value : 'hv', regex : /[\u0195]/g },
        { value : 'i',  regex : /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
        { value : 'j',  regex : /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
        { value : 'k',  regex : /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
        { value : 'l',  regex : /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
        { value : 'lj', regex : /[\u01C9]/g },
        { value : 'm',  regex : /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
        { value : 'n',  regex : /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
        { value : 'nj', regex : /[\u01CC]/g },
        { value : 'o',  regex : /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
        { value : 'oi', regex : /[\u01A3]/g },
        { value : 'ou', regex : /[\u0223]/g },
        { value : 'oo', regex : /[\uA74F]/g },
        { value : 'p', regex : /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
        { value : 'q', regex : /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
        { value : 'r', regex : /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
        { value : 's', regex : /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
        { value : 't', regex : /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
        { value : 'tz', regex : /[\uA729]/g },
        { value : 'u', regex : /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
        { value : 'v', regex : /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
        { value : 'vy', regex : /[\uA761]/g },
        { value : 'w', regex : /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
        { value : 'x', regex : /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
        { value : 'y', regex : /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g }
  ];

  diacritics.forEach( function( item ){
    str = str.replace( item.regex, item.value );
  });

  return str;
}
