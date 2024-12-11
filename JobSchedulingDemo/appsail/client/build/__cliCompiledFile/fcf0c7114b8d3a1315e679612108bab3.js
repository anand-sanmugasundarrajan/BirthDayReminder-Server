import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "prop": function() {
        return prop;
    },

    "Component": function() {
        return Component;
    }
});

import { prop } from "/node_modules/@slyte/core/index.js";
import { Component } from "/node_modules/@zoho/lyte-ui-component/components/component.js";

/**
 * This component is used to append a dom anywhere in the document
 * @component lyte-wormhole
 * @version 2.2.6
 * @methods onBeforeAppend,onAppend
 */


class LyteWormholeComponent extends Component {
    constructor() {
        super();
    }

    data(arg1) {
		return Object.assign(super.data({
			/**
			 * @componentProperty {string} ltPropQuery
			 * @version 2.2.6
			 */
			'ltPropQuery' : prop( 'string' ),

			'ltPropAppendOnCreation': prop( 'boolean', { 'default': true } ),

			'ltPropAppend': prop( 'boolean', { 'default': false } ),

			'ltPropShow' : prop('boolean' , {	'default' : false }),

			'ltPropFocusOnClose':  prop('boolean' , {	'default' : false }),

			'stackMap': prop('object',{ default: {
				'LYTE-MODAL': 'modalStack',
				'LYTE-BETA-MODAL': 'betaModalStack',
				'LYTE-BETA-POPOVER': 'betaPopoverStack',
				'LYTE-POPOVER': 'popoverStack',
				'LYTE-MESSAGEBOX': 'messageboxStack',
				'LYTE-ALERT': 'alertStack',
				'LYTE-COLORBOX': 'colorboxStack'
			}})
		}), arg1);
	}

    didDestroy() {
		var utilObj = this.createUtilObj(this);
		this.handleRemovalFromStack( utilObj );

		this.parent = null;
		if( window._lyteUiUtils && 
				window._lyteUiUtils.popupStack && 
					window._lyteUiUtils.popupStack.globalStack && 
						window._lyteUiUtils.popupStack.globalStack.length <= 0 ){
						
			window._lyteUiUtils.popupStack=null;
		}
	}

    appendContent() {
		var ret, 
		outlet = this.data.ltPropQuery ? document.querySelector( this.data.ltPropQuery ) : document.body;

		if( !outlet ) {
			console.error( 'Provide valid outlet to append' );
			return;
		}

		if( this.getMethods( 'onBeforeAppend' ) && this.executeMethod( 'onBeforeAppend', this.$node, outlet ) == false ) {
			return;
		}
		this.parent = this.$node.parentElement;
		window._lyteUiUtils.appendChild( outlet, this.$node );
		this.appended = true;

		if( this.getMethods( 'onAppend' ) ) {
			this.executeMethod( 'onAppend', this.$node, outlet )
		}
	}

    bringContentBack() {
		window._lyteUiUtils.appendChild( this.parent, this.$node );
	}

    createUtilObj(wormhole) {
		var utilObj={};

		if(wormhole.parent){
			utilObj.parentElement=wormhole.parent;
		} else {
			utilObj.parentElement=wormhole.$node.parentElement;
		}
		utilObj.focusedElement=document.activeElement;
		utilObj.childElement = wormhole.$node;

		return utilObj;
	}

    popUtilObj(utilObj, stackName, wormhole) {
        var lyteSelf = this;
        if( !utilObj || !window._lyteUiUtils || !window._lyteUiUtils.popupStack || !window._lyteUiUtils.popupStack[stackName]){
			return;
		}

        if( window._lyteUiUtils.popupStack[stackName].length>=1){
			window._lyteUiUtils.popupStack[stackName].forEach(function(ele,ind){
					if(ele.parentElement==utilObj.parentElement){
						lyteSelf.$addon.arrayUtils( window._lyteUiUtils.popupStack[stackName], 'removeAt' , ind , 1 );
						return;
					}
			}.bind(wormhole));
		}
    }

    handleInsertionIntoStack(utilObj) {

			if( !utilObj || !utilObj.parentElement || !utilObj.parentElement.tagName ){
				return;
			}
			var tagName = utilObj.parentElement.tagName;
			var stackName = this.getData('stackMap')[tagName];

			this.$addon.arrayUtils( window._lyteUiUtils.popupStack.globalStack, 'push', utilObj);

			if( stackName ){
				this.$addon.arrayUtils( window._lyteUiUtils.popupStack[stackName], 'push', utilObj);
			}
	}

    handleRemovalFromStack(utilObj) {
        var lyteSelf = this;

        if( !window._lyteUiUtils || !window._lyteUiUtils.popupStack || !window._lyteUiUtils.popupStack.globalStack ){
			return;
		}
        if( !utilObj || !utilObj.parentElement || !utilObj.parentElement.tagName ){
			return;
		}

        var tagName = utilObj.parentElement.tagName;
        var stackName = this.getData('stackMap')[tagName];
        var lastActiveElement;

        if(window._lyteUiUtils.popupStack.globalStack.length >= 1){

			if( stackName ){
				this.popUtilObj( utilObj, stackName, this );
			}

			var focusElement, changeFocus=true;
			window._lyteUiUtils.popupStack.globalStack.forEach(function(ele,ind){
				if(ele.parentElement==utilObj.parentElement){
					if(ind<window._lyteUiUtils.popupStack.globalStack.length-1){
						changeFocus=false;
						window._lyteUiUtils.popupStack.globalStack[ind+1].focusedElement =	_lyteUiUtils.popupStack.globalStack[ind].focusedElement;
					}
					focusElement = lyteSelf.$addon.arrayUtils( window._lyteUiUtils.popupStack.globalStack , 'removeAt' , ind , 1 );
					return;
				}
			}.bind(this));

			if(focusElement && focusElement[0]){
				lastActiveElement= focusElement[0].focusedElement;
			}
			if(changeFocus && lastActiveElement && this.getData('ltPropFocusOnClose')){
					lastActiveElement.focus();	
			}
		}
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            initFunc: function() {

                if(!window._lyteUiUtils.popupStack){
                    window._lyteUiUtils.popupStack = {
                        globalStack:[],
                        modalStack:[],
                        betaModalStack:[],
                        betaPopoverStack:[],
                        popoverStack:[],
                        alertStack:[],
                        messageboxStack:[],
                        colorboxStack:[]
                    };
                }

                var utilObj = this.createUtilObj(this);

                if(this.$node.getData('ltPropShow')){
                    this.handleInsertionIntoStack( utilObj );
                }
                else {
                    this.handleRemovalFromStack( utilObj );
                }

            }.observes( 'ltPropQuery','ltPropShow' ).on('init'),

            didConnectFunc :function(){
                var appendOnCreation = this.getData( 'ltPropAppendOnCreation' );

                if( !appendOnCreation ) {
                    return ;
                }

                // this.appendContent();
                this.$node.ltProp( 'append', true );
            }.observes( 'ltPropQuery' ).on( 'didConnect' ),

            appendObserver: function() {
                var append = this.getData( 'ltPropAppend' );

                if( append ) {
                    this.appendContent();
                }
                else {
                    this.bringContentBack();
                }
            }.observes( 'ltPropAppend' )
        }), arg1);
    }

    _() {
        _;
    }
}

LyteWormholeComponent._template = "<template tag-name=\"lyte-wormhole\"> <lyte-yield yield-name=\"lyte-content\"></lyte-yield> </template>";;
LyteWormholeComponent._dynamicNodes = [{"t":"i","p":[1],"in":0},{"type":"dc","trans":true,"hc":true,"p":[0]}];;

LyteWormholeComponent._observedAttributes = [
    "ltPropQuery",
    "ltPropAppendOnCreation",
    "ltPropAppend",
    "ltPropShow",
    "ltPropFocusOnClose",
    "stackMap"
];

/**
 * @syntax yielded
 * <lyte-wormhole>
 * 	  <template is = "registerYield" yield-name = "lyte-content">
 * 		 Some wormhole content
 *	  </template>
 * </lyte-wormhole>
 */

export { LyteWormholeComponent };

LyteWormholeComponent.register("lyte-wormhole", {
    hash: "LyteWormholeComponent_6",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});