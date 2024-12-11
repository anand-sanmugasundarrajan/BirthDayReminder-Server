import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "LyteUiComponentComponentRegistry": function() {
        return LyteUiComponentComponentRegistry;
    },

    "stringify": function() {
        return stringify;
    },

    "lyteUiGetValue": function() {
        return lyteUiGetValue;
    },

    "lyteUiReturnValueBy": function() {
        return lyteUiReturnValueBy;
    },

    "lyteUiConcat": function() {
        return lyteUiConcat;
    },

    "lyteUiI18n": function() {
        return lyteUiI18n;
    },

    "lyteUiImageFile": function() {
        return lyteUiImageFile;
    },

    "lyteUiCapitalizeName": function() {
        return lyteUiCapitalizeName;
    },

    "lyteUiFileSize": function() {
        return lyteUiFileSize;
    },

    "lyteUiOptGroupCheck": function() {
        return lyteUiOptGroupCheck;
    },

    "lyteUiIsObject": function() {
        return lyteUiIsObject;
    },

    "lyteUiReturnOnlyKey": function() {
        return lyteUiReturnOnlyKey;
    },

    "lyteUiReturnOnlyValue": function() {
        return lyteUiReturnOnlyValue;
    },

    "appendChild": function() {
        return appendChild;
    },

    "insertBefore": function() {
        return insertBefore;
    },

    "insertAfter": function() {
        return insertAfter;
    },

    "replaceWith": function() {
        return replaceWith;
    }
});

import { LyteUiComponentComponentRegistry } from "/node_modules/@zoho/lyte-ui-component/components/component.js";
import { appendChild, insertBefore, insertAfter,replaceWith } from "/node_modules/@slyte/component/index.js";
import { stringify, lyteUiGetValue, lyteUiReturnValueBy, lyteUiConcat, lyteUiI18n, lyteUiImageFile, lyteUiCapitalizeName, lyteUiFileSize, lyteUiOptGroupCheck, lyteUiIsObject, lyteUiReturnOnlyKey, lyteUiReturnOnlyValue } from "/node_modules/@zoho/lyte-ui-component/components/helpers/exportable-helpers.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

window._lyteUiUtils = window._lyteUiUtils || { version : "4.1.2" };

window._lyteUiUtils.cboxId = 0;
window._lyteUiUtils.rbuttonId = 0;
window._lyteUiUtils.calId = 0;

window._lyteUiUtils.appendLocation = 'last'; // alternate is first

_lyteUiUtils.setAppendLocation = function( appendLocation ) {
	_lyteUiUtils.appendLocation = appendLocation;
};

( function() {
	var defaultValueCache = {};

	window._lyteUiUtils.resolveDefaultValue = function( componentName, propertyName, componentDefaultValue ) {
		var valueMap = defaultValueCache[ componentName ] || {};

		if( propertyName in valueMap ) {
			return clone( valueMap[ propertyName ] );
		}

		return componentDefaultValue;
	}

	_lyteUiUtils.registerDefaultValues = function( obj ) {
		for( var componentName in obj ) {
			var defaultValueMap = obj[ componentName ];

			defaultValueCache[ componentName ] = defaultValueMap;
		}
	}

	_lyteUiUtils.getDefault = function( name ){
		return defaultValueCache[ name ] || {};
	}

	var clone = function( org ) {
		var type = typeof org, result = {};

		if( type !== 'object' ) {
			return org;
		}

		if( Array.isArray( org ) ) {
			return org.slice( 0 );
		}

		// TODO: This can break. Need to deep clone.
		for( var key in org ) {
			result[ key ] = org[ key ];
		}

		return result;
	}

} )();

window._lyteUiUtils.getVisibleDropdowns = function() {
	var dropboxes = document.querySelectorAll( 'lyte-drop-box:not(.lyteDropdownHidden)' ), res = [], dropdown;

	for( var i = 0; i < dropboxes.length; i++ ) {
		dropdown = dropboxes[ i ].origindd;

		if( dropdown ) {
			res.push( dropdown );
		}
	}

	return res;
}

_lyteUiUtils.getRecentModal = function(){
	if(_lyteUiUtils.popupStack && _lyteUiUtils.popupStack.modalStack){
		var modalElem = {}
		modalElem.modalElem = _lyteUiUtils.popupStack.modalStack[_lyteUiUtils.popupStack.modalStack.length - 1].parentElement
		modalElem.childElem = _lyteUiUtils.popupStack.modalStack[_lyteUiUtils.popupStack.modalStack.length - 1].childElement
		return modalElem
	}
	
	return {}
}

_lyteUiUtils.getRecentPopover = function(){
	if(_lyteUiUtils.popupStack && _lyteUiUtils.popupStack.popoverStack){
		var popoverElem = {}
		popoverElem.popoverElem = _lyteUiUtils.popupStack.popoverStack[_lyteUiUtils.popupStack.popoverStack.length - 1].parentElement
		popoverElem.childElem = _lyteUiUtils.popupStack.popoverStack[_lyteUiUtils.popupStack.popoverStack.length - 1].childElement
		return popoverElem
	}
	
	return {}
}


_lyteUiUtils.closeDropdowns = function() {
	var dropdowns = _lyteUiUtils.getVisibleDropdowns() || [];

	for( var i = 0; i < dropdowns.length; i++ ) {
		dropdowns[ i ].close();
	}
}

_lyteUiUtils.closeAllPopups = function(){
	if(_lyteUiUtils.popupStack){
		var popups = _lyteUiUtils.popupStack.globalStack
		if(popups && popups.length > 0){
			for(var i=popups.length-1;i>=0;i--){
				if(popups[i].parentElement){
					$L(popups[i].parentElement)[0].setData('ltPropShow' , false)
				}
			}
		}
	}
}

_lyteUiUtils.i18n = function( key, componentName, fallback ){
	var keyName = ( componentName ? ( "lyte." + componentName + "." + key ) : key ),
	__obj = window._lyteUiComponentsLocale || {},
	ret =  __obj[ keyName || "" ];

	return ret || fallback || key;
}

_lyteUiUtils.getRTL = function(){
	if( this.Rtl != undefined && this.Rtl != null ) {
		return this.Rtl;
	}
	return this.Rtl = ( window.getComputedStyle( document.body ).getPropertyValue( 'direction' ) == 'rtl' );
}

_lyteUiUtils.isIos = /ip(hone|ad|od)/i.test( window.navigator.userAgent ) || ( /macintosh/i.test( window.navigator.userAgent ) && 'ontouchend' in document );

_lyteUiUtils.isAndroid = /android/i.test( window.navigator.userAgent );

_lyteUiUtils.isMobile =  _lyteUiUtils.isIos || _lyteUiUtils.isAndroid;


_lyteUiUtils.escape = function( str ){

	// convert to string and call replace

	if( typeof str === "number" ) {
		str = str + '';
	}
	return ( str || '' ).replace(/(\\|\'|\"|\?)/g, '\\$1');
}

_lyteUiUtils.appendChild = function( outlet, component ) {
	if( outlet !== document.body || _lyteUiUtils.appendLocation === 'last' ) {
		if(true && appendChild){
			return appendChild( outlet, component ) || component;
		}
		else {
			return appendChild( outlet, component ) || component;
		}
	}
	else {
		var firstChild = outlet.children[ 0 ],
		elementToPrepend = component,
		parentNode = outlet;

		return _lyteUiUtils.insertBefore( firstChild, elementToPrepend, parentNode ) || component;
	}
}

_lyteUiUtils.insertBefore = function( outlet, component ){
	// if(true && insertBefore){
		return insertBefore( outlet, component );
	// }
	// else {
		// return window.LyteComponent.insertBefore( outlet, component );
	// }
}

_lyteUiUtils.dispatchEvent = function( eventType, component , event_argument){
	var option = {};
	option.bubbles = true;
	option.detail = event_argument || {};
	var customevent =  new window.CustomEvent(eventType,option);
	return component && component.dispatchEvent(customevent);
}
_lyteUiUtils.insertAfter = function( outlet, component ){
	// if(true && insertAfter){
		return insertAfter( outlet, component );
	// }
	// else {
		// return window.LyteComponent.insertAfter( outlet, component );
	// }
}

_lyteUiUtils.getZIndex = function(){
	var zIndex = 1060;
	var globalStack = _lyteUiUtils.popupStack.globalStack
	if(globalStack && globalStack.length>1){
		var prevZ = $L(globalStack[globalStack.length-2].childElement).find('.lytePopupZI')
		zIndex = parseInt(getComputedStyle(prevZ[0]).zIndex) + 2
	}
	return zIndex;
}

_lyteUiUtils.getScrollBarWidth = function( ){
	if( this._scrollwidth != undefined ){
		return this._scrollwidth;
	}
	var e = document.createElement("p");
    e.style.width = "100%";
    e.style.height = "200px";
    var t = document.createElement("div");
    t.style.position = "absolute";
    t.style.top = "0px"
    t.style.left = "0px"
    t.style.visibility = "hidden"
    t.style.width = "200px"
    t.style.height = "150px"
    t.style.overflow = "hidden"
    t.appendChild(e)
    document.body.appendChild(t);
    var a = e.offsetWidth;
    t.style.overflow = "scroll";
    var i = e.offsetWidth;
    a == i && (i = t.clientWidth)
    document.body.removeChild(t)
    this._scrollwidth = a - i;
    return this._scrollwidth;
}

_lyteUiUtils.replaceWith = function( outlet, component ){
	// if( replaceWith){
		return replaceWith( outlet, component );
	// }
	// else {
		// return window.LyteComponent.replaceWith( outlet, component );
	// }
}

_lyteUiUtils.registeredCustomElements =  _lyteUiUtils.registeredCustomElements || {};

_lyteUiUtils.mergeObjects = function( oldObj, newObj ) {
	var result = {};

	for( var key in newObj ) {
		result[ key ] = newObj[ key ];
	}

	for( var key in oldObj ) {
		if( !( key in newObj ) ) {
			result[ key ] = false;
		}
	}

	return result;
}

_lyteUiUtils.setAttribute = function( element, newAria, oldAria ){
	var attributeList = _lyteUiUtils.mergeObjects( oldAria, newAria );

	for( var attribute in attributeList ) {
		if( attributeList[ attribute ] === false ) {
			element.removeAttribute( attribute )
		}
		else {
			element.setAttribute( attribute, attributeList[ attribute ] );
		}
	}
}

_lyteUiUtils.getZIndex = function(){
	var zIndex = 1060;
	var globalStack = _lyteUiUtils.popupStack.globalStack
	if(globalStack && globalStack.length>1){
		var prevZ = $L(globalStack[globalStack.length-2].childElement).find('.lytePopupZI')
		zIndex = parseInt(window.getComputedStyle(prevZ[0]).zIndex) + 2
	}
	return zIndex;
}

_lyteUiUtils.updateAria = function( element, key, value, prop ){
	var tagName = element.tagName.toLowerCase(),
	mapping = {
		/* Given util function should be defined in component. All the modifications should be done inside defined util*/
		// input : "updateAria"
		"radiobutton-group": "updateAriaArray"
	},
	tag = tagName.replace( /^lyte\-/, '' ),
	mapped = mapping[ tag ];

	if( mapped ){

		element[ mapped ](  key, value );

	} else if( element.ltProp ) {
		var string_property = { // string property
			breadcrumb : "ariaValue",
			step : "ariaValue"
		},
		object_property = {
			/*Name of the property to be updated if its object. Default value will be ariaAttributes*/
		},
		string_value = string_property[ tag ];

		if( string_value ){
			return element.ltProp( string_value, key );
		}

		objectutils( element.ltProp(  prop || object_property[ tag ] || "ariaAttributes" ) || {}, value != void 0 ? 'add' : 'delete', key, value );
	} else {
		$L( element ).attr( key, value );
	}
}


_lyteUiUtils.trapFocus = function( evt, node ){
    var focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), *[contenteditable]';
    var parent = node || window.LytePopup.components[window.LytePopup.components.length-1].actualModalDiv;

    // get list of focusable items
    var focusableItems;
    focusableItems = $L(parent.querySelectorAll(focusableElementsString)).filter(function(ind, item){ return $L(item).is(':visible') && (item.tabIndex != -1) && !(item.disabled) });

    if(focusableItems.length == 0){
        return;
    }
    if(node){
        if(focusableItems.length > 1 && (focusableItems[0].classList.contains('lyteModalClose') || focusableItems[0].classList.contains('lytePopoverClose'))){
            focusableItems[1].focus();
        }
        else{
            focusableItems[0].focus();
        }
        return;
    }

    // get currently focused item
    var focusedItem = document.activeElement;

    if(!(parent.contains(focusedItem))){
        // LytePopup.initializeFocus(parent);

        //Initialize Focus
        if(parent.classList.contains('lyteModal') || parent.classList.contains('lytePopover')){
            _lyteUiUtils.trapFocus(null, parent);
        }
        else if(parent.classList.contains('alertPopup')){
            var buttons = parent._callee.ltProp('buttons');
            for(var i = 0; i<buttons.length; i++){
                if(buttons[i].type == "accept"){
                    parent.querySelectorAll('button')[i].focus();
                    break;;
                }
            }
        }
        return;
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
            focusableItems.get(numberOfFocusableItems - 1).focus();
            evt.preventDefault();
        }

    } else {
        //forward tab
        // if focused on the last item and user preses tab, go to the first focusable item
        if (focusedItemIndex == numberOfFocusableItems - 1) {
            focusableItems.get(0).focus();
            evt.preventDefault();
        }
    }
}

_lyteUiUtils.getBrowser = function(){
	//Check if browser is IE11
    if (window.navigator.userAgent.search("rv:11") >= 0) {
        return "ie";
    }
    //Check if browser is Edge
    if (window.navigator.userAgent.search("Edge") >= 0) {
        return "edge";
    }
    //Check if browser is Chrome || Opera
    else if (window.navigator.userAgent.search("Chrome") >= 0) {
        return "chrome";
    }
    //Check if browser is Firefox
    else if (window.navigator.userAgent.search("Firefox") >= 0) {
        return "firefox";
    }
    //Check if browser is Safari
    else if (window.navigator.userAgent.search("Safari") >= 0 && window.navigator.userAgent.search("Chrome") < 0) {
        return "safari";
    }
};

_lyteUiUtils.isNegativeScroll = function() {

    if( this._negativeScrollChrome != undefined ){
        return this._negativeScrollChrome;
    }

    var element =
    document.body.appendChild( $L( "<div style='position: absolute; left: 0; top: 0; overflow: hidden; width: 10px;height: 1px;'><div style='width: 20px; height: 1px;'></div></div>" ).get( 0 ) ),
    newChrome;

    element.scrollLeft = -5;
    newChrome = element.scrollLeft < 0;
    document.body.removeChild( element );
    this._negativeScrollChrome = newChrome;
    return newChrome;
}

_lyteUiUtils.getCorrectNumberCode = function( code ){
    if( code >= 96 && code <= 105 ){
        return code - 48;
    }
    return code;
}

_lyteUiUtils.capitalize = function( str ){
	return ( str || '' ).replace( /^./, function( match ){
		    return match.toUpperCase();
	});
}

_lyteUiUtils.lyteUiFileSize = function( curr, def, dgt ){
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], idx = 0;
	if( def ) {
		idx = Math.max( idx, sizes.indexOf( def ) );
	} else {
		idx = Math.floor( Math.log( curr ) / Math.log( 1000 ) )
	}
	if( idx == 0 && curr == 1 ){
		return "1 Byte";
	}
	return ( parseInt( curr / Math.pow( 1000 , idx ) * Math.pow( 10, dgt ) ) / Math.pow( 10, dgt ) ) + ' ' + sizes[ idx ];

};

// Accessibility
_lyteUiUtils.reduceAnimation = function(){
    $L('body').addClass('lyteUiCompReduceAnim');
}

_lyteUiUtils.enableAnimation = function(){
    $L('body').removeClass('lyteUiCompReduceAnim')
}

_lyteUiUtils.dateFilterValue = function( startValue , endValue , selected , format ) {
	let moment = $L.moment() , 
		inf = Infinity ,
		input = "" ,
		isValid = !!selected ,
		fns = {};

	switch( selected ){
		case 'is' : 
		case 'is_not' : {
			moment = $L.moment( new Date( startValue ) )
			input = "{{start}}";
		}
		case 'today' : {
			fns.end = [ { name : "endOf", args : [ 'day' ] } ];
			fns.start = [ { name : "startOf", args : [ 'day' ] } ];
		}
		break;
		case 'till_yesterday' : {
			fns.end = [ 
				{ name : "startOf", args : [ 'day' ] },
				{ name : "subtract", args : [ 1, 'milliseconds' ] } 
			];
		}
		break;
		case 'yesterday' : {
			fns.end = [ 
				{ name : "startOf", args : [ 'day' ] },
				{ name : "subtract", args : [ 1, 'milliseconds' ] } 
			];

			fns.start = [ { name : "startOf", args : [ 'day' ] } ];

		}
		break;
		case 'tomorrow' : {
			fns.start = [ 
				{ name : "endOf", args : [ 'day' ] },
				{ name : "add", args : [ 1, 'milliseconds' ] } 
			];

			fns.end = [ { name : "endOf", args : [ 'day' ] } ];
		}
		break;
		case 'next_7_days' : {
			fns.start = [ 
				{ name : "endOf", args : [ 'day' ] },
				{ name : "add", args : [ 1, 'milliseconds' ] } 
			];

			fns.end = [ { name : "add", args : [ 7, 'day' ] } ];
		}
		break;
		case 'this_week' : {
			fns.start = [ 
				{ name : "startOf", args : [ 'week' ] }
			];
			
			fns.end = [ { name : "endOf", args : [ 'week' ] } ];
		}
		break;
		case 'this_month' : {
			fns.start = [ 
				{ name : "startOf", args : [ 'month' ] }
			];
			
			fns.end = [ { name : "endOf", args : [ 'month' ] } ];
		}
		break;
		case 'last_week' : {
			fns.end = [ 
				{ name : "startOf", args : [ 'week' ] },
				{ name : "subtract", args : [ 1, 'milliseconds' ] } 
			];
			
			fns.start = [ { name : "startOf", args : [ 'week' ] } ];
		}
		break;
		case 'last_month' : {
			fns.end = [ 
				{ name : "startOf", args : [ 'month' ] },
				{ name : "subtract", args : [ 1, 'milliseconds' ] } 
			];
			
			fns.start = [ { name : "startOf", args : [ 'month' ] } ];
		}
		break;
		case 'less_than' : {
			moment = $L.moment( new Date( startValue ) )
			fns.end = [ { name : "subtract", args : [ 1, 'milliseconds' ] } ];
			startValue = -inf;

			input = "< {{start}}";
		}
		break;
		case 'greater_than' : {
			moment = $L.moment( new Date( startValue ) )
			fns.end = [ { name : "add", args : [ 1, 'seconds' ] } ];
			endValue = inf;
			input = "> {{start}}";
		}
		case 'less_than_or_equal' : {
			endValue = startValue;
			startValue = -inf;
			input = "<= {{start}}";
		}
		break;
		case 'greater_than_or_equal' : {
			endValue = inf;
			input = " >= {{start}}";
		}
		break;
		case 'between' : 
		case 'not_between' : {
			if( !( isValid = ( startValue != -inf && endValue != inf ) ) ){
				moment = $L.moment( new Date( 'invalid' ) );
			}
			input = "{{start}} < && {{end}} >";
		}
		break;
	}

	if( !moment.validate() ){
		startValue = startValue == -inf ? -inf : startValue;
		endValue = endValue == inf ? inf : endValue;
		isValid = false;
	} else {
		for( var key in fns ){
			var __value = fns[ key ],
			__length = __value.length,
			final;

			for( var i = 0; i < __length; i++ ){
				var __cur = __value[ i ];
				 moment[ __cur.name ].apply( moment, __cur.args );
			}

			final = moment.format();

			if( key == 'start' ){
				startValue = final;
			} else {
				endValue = final;
			}

			input = input.replace( '{{' + key + "}}", moment.format( format ) );
		}
	}

	return { start: startValue, end: endValue , isValid : isValid , input : input };

};

_lyteUiUtils.updateI18n = function( key, value ){
	window._lyteUiComponentsLocale[ key ] = value;
};

LyteUiComponentComponentRegistry.registerHelper("lyteUiReturnOnlyKey", lyteUiReturnOnlyKey );
LyteUiComponentComponentRegistry.registerHelper("lyteUiReturnOnlyValue",lyteUiReturnOnlyValue);

LyteUiComponentComponentRegistry.registerHelper( "lyteUiGetLinearIndex", function( obj, rowIndex, columnIndex ) {
	return obj[ rowIndex * 4 + columnIndex ];
} );

/**
 * Helper to return url when flag is true
 * @param {string} url - The url to return
 * @param {boolean} flag - True returns the URL , false returns an empty string
 *
 */

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiSetURL', function( url, flag ) {

	if( flag ) {
		return url;
	} else {
		return '';
	}

} );


/**
 * Helper to check if an entire row in the calendar is empty or not
 * @param {object} vector - an array of objects where each object contains a particular date
 *
 */

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiCheckEmpty', function( vector ) {
	return vector && vector[ 0 ].emptyBlock && vector[ 6 ].emptyBlock;
} );

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiDisableCalendarNav', function( viewDate, dir ) {
	var viewYear = viewDate.getFullYear(),
	viewMonth = viewDate.getMonth(),
	isYY = this.$node.component.isYYFormat(),
	isHavingTimezone = this.$node.component.isHavingTimezone,
	currentYear = isHavingTimezone ? Number( $L.moment().format( 'YYYY' ) ) : new Date().getFullYear(),
	max, bounds;

	if( isYY ) {
		max = isHavingTimezone ? $L.moment() : { uL: 19, lL: 80 };
		bounds = { minYear: currentYear - max.lL, maxYear: currentYear + max.uL };
	}
	else {
		bounds = { minYear: 1900, maxYear: 2100 };
	}

	if( ( dir === 'previous' && viewYear === bounds.minYear && viewMonth === 0 ) || ( dir === 'next' && viewYear === bounds.maxYear && viewMonth === 11 ) ) {
		return 'lyteCalDisableNav';
	}
} );


LyteUiComponentComponentRegistry.registerHelper("lyteUiI18n", lyteUiI18n);

LyteUiComponentComponentRegistry.registerHelper( "lyteUiI18nWithArgs", function() {
	var keyName = arguments[ 0 ] || '',
	argumentsArray = Array.from( arguments ), val, dynamicArguments;

	argumentsArray.shift();

	dynamicArguments = argumentsArray;

	val = window._lyteUiComponentsLocale[ keyName ] || '';

	dynamicArguments.forEach( function( argument, index ) {
		var i18nPlaceholder = '$' + index;

		val = val.replace( i18nPlaceholder, argument );
	} );

	return val;
} );

LyteUiComponentComponentRegistry.registerHelper("lyteUiOptGroupCheck", lyteUiOptGroupCheck );
LyteUiComponentComponentRegistry.registerHelper("lyteUiCheckForType",function(item,ltPropUserValue,ltPropSystemValue,section){
	if(section){
		var count = 0;
		var tcount = 0;
		for(var key in item){
			tcount++;
			if(key == ltPropUserValue){
				count++;
			}
			if(key == ltPropSystemValue){
				count++;
			}
		}
		if(count == 2 || tcount != 1){
			return false;
		}
		else{
			return true
		}
	}
	else{
		if(typeof item == "object"){
			return true
		}
		else{
			return false
		}
	}
});
LyteUiComponentComponentRegistry.registerHelper("lyteListBoxIndex" , function(ind,parentInd){
// Created by suren to use in lyte-listbox
	if(parentInd || parentInd === 0){
		return parentInd +" "+ ind;
	}
	return ind;

});
LyteUiComponentComponentRegistry.registerHelper("lyteListBoxParentIndex" , function(th,data,name){
// Created by suren to use in lyte-listbox
	if(data[name]){
		return data[name];
	}
	return '';

});
LyteUiComponentComponentRegistry.registerHelper('lyteListBoxChildIndexId' , function(ind){
	return ('lyteLBLeftChildWrap_' + ind);
})

LyteUiComponentComponentRegistry.registerHelper('lyteListBoxRequiredClassHelper' , function(val , reqVal , minReq , type,side , allowSort){
	if(val[reqVal] && side === "left"){
		return 'lyteLBMandateItem';
	}
	var parStr = "lyteLBMandateParent"
	var childStr = "lyteLBMandateItem"
	if(!allowSort){
		parStr += " lyteListBoxRequiredParent"
		childStr += " lyteListBoxRequiredItem"
	}
	if(val[reqVal] && !minReq){
		if(type === 'par'){
			return parStr;
		} else {
			return childStr
		}
	} else {
		return ''
	}
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiChildPadding", function(treeIcon) {

	if ( treeIcon === 'Arrow' ) {
		return "padding-left:20px;";
	} else if (treeIcon === 'Plus') {
		return "padding-left:25px;";
	} else {
		return "padding-left:27px;";
	}
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiHaveChildren", function(treeData,key) {

	if ( treeData[key] && treeData[key].length > 0 ) {

		return true;
	}
	return false;
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiIsObject", lyteUiIsObject);
LyteUiComponentComponentRegistry.registerHelper("lyteUiIsArray", function(obj) {

	if ( Object.prototype.toString.call(obj) === "[object Array]") {
		return true;
	} else {
		return false;
	}
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiGiveProper',function(full,val){
	var returnval = []
	for(var i=0;i<full.length;i++){
		if(full[i].menu == val){
			returnval.push(full[i])
		}
	}
	return returnval
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiAddClassModal',function(className,show,drag){
	var resp = className;
	if(drag){
		resp += " draggable";
	}
	if(show){
		resp += " "+className+"Show";
	}
	return resp;
});


LyteUiComponentComponentRegistry.registerHelper('lyteUiAddShowClass',function(a,b,c){		//Used in alert and colorbox thumbnail
	if(a === true){
		return b+" "+c;
	}
	return b;
});


LyteUiComponentComponentRegistry.registerHelper('lyteUiCatwise',function(a,b){
    if(a==b[this.$node.get('ltPropCategory')]){
        return true
    }
      else {
        return false
    }
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiCheckClassForDate',function(val){
	if(!val){
		return false;
	}
	if(val.indexOf('lyteCalGray') != -1){
		return true
	}
	return false
});


LyteUiComponentComponentRegistry.registerHelper( 'lyteUiConcat', lyteUiConcat );


LyteUiComponentComponentRegistry.registerHelper('lyteUiConcatTypeClass',function(a,b,c){	//Used in Alert
	if(a!==""){
		return a+b+" "+c;
	}
	return c;
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiGetContainerClass',function(setselect,classval){
	var toRet=''
	if(!classval){
		classval = ''
	}
    if(setselect==true){
    	toRet = 'lyteDropdownContainer tick-selection ' + classval
    }
    else{
    	toRet = 'lyteDropdownContainer ' + classval
    }
    return toRet

});

LyteUiComponentComponentRegistry.registerHelper('lyteUiGetDropdownClass',function(arg1){
	if(arg1 && arg1.toString().toLowerCase()  == "true"){
		return 'lyteDropdownElement1 lyteDropdown-disabled'
	}
	else{
		return 'lyteDropdownElement1'
	}
});


LyteUiComponentComponentRegistry.registerHelper('lyteUiIfEquals',function(a,b){	//Used in alert,messagebox,progressbar,rating
	return a === b;
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiLabelCheck',function(a,b){
	if(a==b){
		return true;
	}
	else {
		return false
	}
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiObjectCheck',function(a){
    if(typeof a==='string'){
        return true;
    }
    else {
        return false
    }
});

// Lyte.Component.registerHelper('lyteUiHeaderCheck',function(value){
// 	if(value)
// 		{
// 			return true;
// 		}
// 	else
// 		{
// 		return false;
// 		}
// });

LyteUiComponentComponentRegistry.registerHelper('lyteUiSetWH',function(radius){	//Used in progressbar
	return parseInt(radius) * 2;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiSetRadius',function(radius,stroke){	//Used in progressbar
	return parseInt(radius)-parseInt(stroke)/2;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiSetDashArray',function(radius,stroke){		//Used in progressbar
	var r = parseInt(radius)-parseInt(stroke)/2;
	return  2 * 3.14159 * r;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiSetOffset',function(radius,stroke,value){	//Used in progressbar
	var r = parseInt(radius)-parseInt(stroke)/2;
	var strokeDash =  2 * 3.14159 * r;
	return strokeDash * (1 - parseInt(value)/100);
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiTextTransform',function(radius){	//Used in progressbar
	return 'translate(0,-'+parseInt(radius) * 2+'px)';
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiMakeSortable',function(elementId){
	console.log(elementId);
	document.getElementById(elementId).classList.add('sortable');
	return true;
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiCheckTabPosition",function(position){
	if(position.pos === "bottom"){
		return false;
	}
	else{
		return true;
	}
});

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiGetValue', lyteUiGetValue );

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiReturnValueBy', lyteUiReturnValueBy );


LyteUiComponentComponentRegistry.registerHelper('lyteUiIsEmptyArray',function(obj){	//Used in alert
     return obj.length == 0;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiRgbToHex",function(item){	//Used in colorpicker
	var hexValue = "#";
	if(/rgba/.test(item)){
		var valArray = item.substring(5,item.length-1).split(",");
		for(var i=0;i<3;i++){
			var val = parseInt(valArray[i]).toString(16).toUpperCase();
			if(val.length < 2){
				val = "0"+val;
			}
			hexValue += val;
		}
		var alpha = Math.round(parseFloat(valArray[3]) * 255);
		hexValue += (alpha + 0x10000).toString(16).substr(-2).toUpperCase();
	}
	else if(/rgb/.test(item)){
		var valArray = item.substring(4,item.length-1).split(",");
		for(var i=0;i<3;i++){
			var val = parseInt(valArray[i]).toString(16).toUpperCase();
			if(val.length < 2){
				val = "0"+val;
			}
			hexValue += val;
		}
	}
	return hexValue;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiCPInsertBreak",function(index){	//Used in colorpicker
	if((index + 1)%10 == 0){
		return true;
	}
	return false;
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiCheckInRange",function(start,end,current,form){
	var comp = this.$node.component;

	start = start || '';
	end = end || '';

	if(start === '' && end === ''){
		return true;
	}
	else if(start !== '' && end === ''){
		var startDate = comp.stringToDate( start, form )
		var currentDate = comp.stringToDate( current, form )
		if(currentDate >= startDate){
			return true
		}
	}
	else if(start !== '' && end !== ''){
		var startDate = comp.stringToDate( start, form )
		var endDate = comp.stringToDate( end, form )
		var currentDate = comp.stringToDate( current, form )
		if(currentDate >= startDate && currentDate <= endDate){
			return true
		}
	}
	else {
		var endDate = comp.stringToDate( end, form )
		var currentDate = comp.stringToDate( current, form )
		if(currentDate <= endDate){
			return true
		}
	}
	return false
});

LyteUiComponentComponentRegistry.registerHelper( "lyteUiDisabledDates", function( calendarDateObj, disabledDates ) {
	var curDate = calendarDateObj.val || '';

	disabledDates = disabledDates || [];

	return !!~disabledDates.indexOf( curDate );
} );

LyteUiComponentComponentRegistry.registerHelper("lyteUiIsEmptyObject",function(item){		//Used in dropdown,popover
	for(var key in item) {
        if(item.hasOwnProperty(key)){
            return false;
        }
    }
    return true;
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiCheckDisabled",function(list,value){
	for(var i = 0; i<list.length; i++){
		if(value === list[i]){
			return "true";
		}
	}
    return "false";
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeLevelHelp",function(varr,index){
	if(varr !== ""){
		var level = varr + " " + index++;
		var arr = level.split(' ')
		return arr.length-1;
	}
	return 0;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeLevelVariableHelp",function(varr,index,vari){
	var str = "--"+vari+":";
	var def = 0;
	if(varr !== ""){
		var level = varr + " " + index++;
		var arr = level.split(' ')
		return str + (arr.length-1).toString()
	}
	return (str+def.toString());
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeMaxLevelHelp" , function(varr , index , maxLevel){
	var level = varr + " " + index++;
	var arr = level.split(' ')
	if(arr.length <= maxLevel){
		return true;
	}
	return false;
})

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeMaxLevelUpdate" , function(varr , index , maxLevel , ignore){
	var level = varr + " " + index++;
	var arr = level.split(' ')
	if(arr.length == maxLevel && ignore){
		maxLevel+=35
		return maxLevel;
	}
	return maxLevel;
})

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeClassHelp",function(state,col,open,close,wrapopen,wrapclose){
	if((state === "open")||!col){
		return open+" "+wrapopen;
	} else {
		return close+" "+wrapclose;
	}
});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeMaxChild" , function(varr,index,maxLevel){
	var level = varr + " " + index++;
	var arr = level.split(' ')
	if(arr.length-1 >= maxLevel){
		return "lyteTreeMaxedChild";
	}
	return '';
});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeTypeHelp" , function(ltPropSortable , ltPropAllowExternalImport){
	if(ltPropSortable && ltPropAllowExternalImport){
		return "withExternal"
	} else if(ltPropSortable){
		return "onlyInternal"
	} else {
		return "nonSortable"
	}
});
LyteUiComponentComponentRegistry.registerHelper("lyteTreeClassStateHelp",function(item){
	if((!item.defaultState)||(item.defaultState === "open")){
		return "lyteTreeOpened";
	} else if(item.defaultState === "close"){
		return "lyteTreeClosed";
	}
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeIndexHelp",function(varr,index){
	return (varr + " " + index++).trim() ;
});
// LyteUiComponentComponentRegistry.registerHelper("lyteTreeAriaTabIndexHelp" , function(varr , index){
// 	var taIn = (varr + " " + index++).trim()
// 	if((taIn.length === 1) && (taIn === '0')){
// 		return 0;
// 	}
// 	return -1;
// })
LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeHasChildHelp",function(val,children){
	var col = val.collapsed
	if(!val[children] || val[children].length < 1){
		col = true;
	}
	if(val.hasChild && col){
		return 'lyteTreeHasChild'
	}
	return "";
});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeAriaTabIndexHelp" , function(varr , index){
	var taIn = (varr + " " + index++).trim()
	if((taIn.length === 1) && (taIn === '0')){
		return "0";
	}
	return "-1";
})

LyteUiComponentComponentRegistry.registerHelper("lyteUiTreeChildHelp",function(val,className,child){

	if(((val[child] === undefined)||(val[child].length === 0)) && !val.hasChild){
		return className + " lyteTreeLastChild";
	}

	return '';

});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeAriaRole",function(val,child){

	if(((val[child] === undefined)||(val[child].length === 0)) && !val.hasChild){
		return 'treeitem';
	}

	return 'group';

});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeDataType" , function(elem){
	if(typeof elem === "object" && Array.isArray(elem)){
		return 'array'
	}
	return typeof(elem);
});

LyteUiComponentComponentRegistry.registerHelper("lyteTreeGetArrayLength" , function(val){
	return val.length
});

LyteUiComponentComponentRegistry.registerHelper("lyteHTreeTopVline" , function(index , data){
	if(index === 0){
		return 'lyteHTreeVerticalConnectorHidden';
	}
	return '';
});

LyteUiComponentComponentRegistry.registerHelper("lyteHTreeBottomVline" , function(index , data){
	if(index === data.length-1){
		return 'lyteHTreeVerticalConnectorHidden';
	}
	return '';
});


LyteUiComponentComponentRegistry.registerHelper( 'stringify', stringify );

LyteUiComponentComponentRegistry.registerHelper("lyteUiConcatAlertClass",function(val,Aclass){		//Used in alert
	return (val == "center" ? "lyteAlertCenterContent" : "") +" "+Aclass;
});

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiSetIndexString', function( index, total ) {	//Used in colorbox
	return (index+1)+" of "+total;
} );

LyteUiComponentComponentRegistry.registerHelper("lyteUiRTL",function(){
	return _lyteUiUtils.getRTL();
});
// LyteComponent.registerHelper("lyteIsIos",function(){
// 	return _lyteUiUtils.isIos();
// });


LyteUiComponentComponentRegistry.registerHelper("lyteIsIos",function(){
	return _lyteUiUtils.isIos;
});

LyteUiComponentComponentRegistry.registerHelper("lyteIsAndroid",function(){
	return _lyteUiUtils.isAndroid;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiGetMonthOrYear",function(header, cond){
	header = header || '';

	if(cond == "M"){
		return header.split(" ")[0];
	}
	else{
		return header.split(" ")[1];
	}
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiDisplayOrHide",function(color){
	if(color == "rgba(0, 0, 0, 0)"){
		return "lyteColorPicker__colorpan lyteColorPicker__hide";
	}
	else{
		return "lyteColorPicker__colorpan";
	}
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiMsgBoxConcatClass',function(a,b,c,d){	//Used in messagebox
	if(b!==""){
		return a+" "+b+c+" "+d;
	}
	return a+" "+d;
});

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiFileSize', lyteUiFileSize );

LyteUiComponentComponentRegistry.registerHelper('lyteUiAddClassRating',function(node,wrapper,readOnly){		//Used in rating\
	var resp = "";
	if(node.className != "{{dummy}}"){
		resp = node.className;
	}
	if(wrapper){
		resp += " " + wrapper;
	}
	if(readOnly){
		if(resp.indexOf("lyteRatingReadOnly") == -1){
			resp += " lyteRatingReadOnly";
		}
		// return "lyteRatingReadOnly";
	}
	else{
		if(resp.indexOf("lyteRatingReadOnly") != -1){
			resp = resp.replace("lyteRatingReadOnly","");
		}
	}
	return resp;
});


LyteUiComponentComponentRegistry.registerHelper('lyteUiGetArrayValueByIndex',function(array,index){	//Used in rating
	return array[index%array.length];
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiIfEqualsAny',function(){	//Used in rating
	var value = arguments[0];
	for(window.i = 1; window.i < arguments.length; window.i++){
		if(value == arguments[window.i]){
			return true;
		}
	}
	return false;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiGetNextArrayValueByIndex',function(array,index){ //used in drawer
	return array[index+1];
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiArrayLastIndex',function(array){ //used in drawer
 	return array.length-1;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiGetViewBox',function(type){ //used in rating
 	if(type === "heart"){
 		return "1.5 0.5 20 20";
 	}
 	if(type === "star"){
 		return "5.5 2.5 23 23";
 	}
 	return "0 0 21 21";
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiGetFillOrStroke',function(type,color,stroke){ //used in rating
 	if(type === "heart" || type === "star"){
 		return "; fill:"+color+";";
 	}
 	if(type === "lineStar" || type === "lineHeart"){
 		return "; fill:transparent"+";"+"; stroke:"+ (stroke ? stroke : color) +";";
 	}
 	return "; stroke:"+ (stroke ? stroke : color) +";";
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiCheckHalfRatingSvg',function(halfRating,precision){ //used in rating
 	if(halfRating && precision > 0 && precision < 1){
 		return true;
 	}
 	return false;
});
LyteUiComponentComponentRegistry.registerHelper('lyteUiProgressbarLabel',function(label,percentage,showPercentage){ //used in progressbar
 	if(label){
 		return label;
 	}
 	return (percentage + (showPercentage ? "%" : ""));
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiGetStackValue',function(stack,index,prop){
	return index < stack.length && stack[index][prop];
});

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiAttribute', function( value, aria ){
	if( aria ){
		return value ? value : false;
	}
	return false
} )

LyteUiComponentComponentRegistry.registerHelper('lyteUiAddPE', function(val){	//used to add pointer events none for no colors
	if(val === 'noColor'){
		return 'lyteColorPicker__pe'
	}
	return "";
});

LyteUiComponentComponentRegistry.registerHelper('lyteUiClockPairNumber', function(val) {
    if(val.length == 1) {
        val = (0 + val);
    }
    return val;
})

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiDateRPHeaderClass', function( value ){
	if( value != "dropdown" ){
		return "lyteDateRPMonthHeader lyteDateRPStringHeader" ;
	}
	return "lyteDateRPMonthHeader";
} );

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiSetAlphaLabel', function( value ){
	if( value ){
		return value ;
	}
	return _lyteUiUtils.i18n("Alpha");
} );
//lyte-layout
//lyte-layout-row
LyteUiComponentComponentRegistry.registerHelper( "lyteUiRowLength" , function( col_div ){
	var sum = this.$node.getData('sum');
	col_div = parseInt(col_div ,10);
	this.$node.setData('sum' , sum+col_div)
	return (col_div  && col_div < 12 && col_div > 0 && sum <= 12);

});

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiImageFile', lyteUiImageFile);

LyteUiComponentComponentRegistry.registerHelper( 'lyteUiIsInArray', function( item, selected, sysValue ) {

	selected = selected || [];

	for( var i = 0; i < selected.length; i++ ) {
		if( selected[ i ][ sysValue ] === item[ sysValue ] ) {
			return true;
		}
	}

	return false;
} );

LyteUiComponentComponentRegistry.registerHelper('lyteUiCapitalizeName', lyteUiCapitalizeName);

LyteUiComponentComponentRegistry.registerHelper("lyteUiGetMultiDropId",function( ){

	if(window._lyteUiUtils && window._lyteUiUtils.multiDropGlobe && window._lyteUiUtils.multiDropGlobe.ind ){
		return 'lyteMultiDropButton'+window._lyteUiUtils.multiDropGlobe.ind
	}
	else{
		return 'lyteMultiDropButton0';
	}
});

//scheduler Helper
LyteUiComponentComponentRegistry.registerHelper("lyteUiSchedulerBusinessHour",function( businessHour, curr_time ){
	var timeStart = new Date("01/01/2007 " + businessHour[0]);
	var timeEnd = new Date("01/01/2007 " + businessHour[1]);
	curr_time = new Date("01/01/2007 " + curr_time.dataset.time);
	var curr = ((curr_time.getHours() * 60) + curr_time.getMinutes());
	if( ( ( curr - ((timeStart.getHours() * 60) + timeStart.getMinutes())) >= 0 )&& ( (((timeEnd.getHours() * 60) + timeEnd.getMinutes()) - curr) >= 0 ) ){
		return 'lyteSchedulerBusinessHour';
	}
})

LyteUiComponentComponentRegistry.registerHelper("lyteUiSchedulerTimeFormat",function( time, min ){
	var hour  = parseInt(time);
	var format = time.split(hour)[1];
	format = format.toUpperCase();
	min = min ? min : '00';
	hour = ('0' + hour).slice(-2);
	time = hour + ':' + min + ' ' + format;
	return time;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiSchedulerChecktime",function( time, event ){
	
	var format = this.$node.getData('ltPropFormat');
	var startDate = $L.moment(event.start, format);
	var start_hour  = startDate.get('hours');
	var time_format = start_hour > 12 ? 'pm' : 'am';
	start_hour = time_format === 'am' ? start_hour+'am' : (start_hour-12)+'pm';
	if(start_hour == time){
		return true;
	}
	return false;
});

LyteUiComponentComponentRegistry.registerHelper("lyteUiSchedulerGetDate",function( date, event ){
	return date.format('DD-MM-YYYY');
});
LyteUiComponentComponentRegistry.registerHelper("lyteUiSchedulerMonthshortForm",function( monthindex ){
	var month = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Spet','Oct','Nov','Dec'];
	return month[monthindex];
});
LyteUiComponentComponentRegistry.registerHelper('lyteTourShowIconHelper' , function(type){
	if(type === 'callout'){
		return true
	}
	return false
});