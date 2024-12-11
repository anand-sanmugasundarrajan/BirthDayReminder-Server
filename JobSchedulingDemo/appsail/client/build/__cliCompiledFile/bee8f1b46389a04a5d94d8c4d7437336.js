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
 * Renders a button
 * @component lyte-button
 * @version 1.0.0
 * @utility click, focus, blur
 * @dependencies lyte-shortcut
 * 		/plugins/lyte-shortcut.js
 */

class LyteButtonComponent extends Component {
    constructor() {
        super();
    }

    data(arg1) {
		return Object.assign(super.data({

			/**
			 * @componentProperty {string} ltPropName
			 */

			'ltPropName': prop( 'string', {
				'default': undefined
			} ),


			/**
			 * @componentProperty {boolean} ltPropDisabled=false
			 */

			'ltPropDisabled': prop( 'boolean', {
				'default': false
			} ),

			/**
			 * @componentProperty {boolean} ltPropAutoFocus=false
			 */

			'ltPropAutofocus': prop( 'boolean', {
				'default': false
			} ),

			/**
			 * @componentProperty {default | primary | secondary | success | failure} ltPropAppearance=default
			 */

			'ltPropAppearance': prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'appearance', 'default' )
			} ),

			/**
			 * @componentProperty {string} ltPropId
			 */

			'ltPropId': prop( 'string', {
				'default': undefined
			} ),

			/**
			 * @componentProperty {button | submit | reset} ltPropType=button
			 */

			'ltPropType': prop( 'string', {
				'default': 'button'
			} ),

			/**
			 * @componentProperty {string} ltPropValue
			 */

			'ltPropValue': prop( 'string', {
				'default': undefined
			} ),

			/**
			 * @componentProperty {string} ltPropTabindex
			 */

			'ltPropTabindex': prop( 'string', {
				'default': undefined
			} ),

			/**
			 * @componentProperty {string} ltPropStyle
			 */

			'ltPropStyle': prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'style', undefined )
			} ),

			/**
			 * @componentProperty {extra-small | small | medium | large} ltPropSize=default
			 */

			'ltPropSize': prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'size', 'default' )
			} ),
			/**
			 * @componentProperty {colorString} ltPropBackgroundColor
			 */

			'ltPropBackgroundColor': prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'backgroundColor', undefined )
			} ),
			/**
			 * @componentProperty {colorString} ltPropColor
			 */

			'ltPropColor': prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'color', undefined )
			} ),

			/**
			 * @componentProperty {string} lyteShortcut
			 */

			'lyteShortcut': prop( 'string', {
				'default': ''
			} ),

			/**
			 * @componentProperty {string} ltPropClass
			 */

			'ltPropClass':prop( 'string', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'class', '' )
			} ),
			/**
			 * @componentProperty {string} ltPropClass
			 */

			'lyteUnbound': prop( 'boolean', {
				'default': false
			} ),

			/**
			 * @componentProperty {object} ltPropAriaButton={}
			 * @version 3.1.0
			 */

			'ltPropAriaButton': prop('object', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-button', 'ariaButton', {} )
			} ),

			/**
			 * @componentProperty {string} ltPropText
			 */

			'ltPropText': prop( 'string', {
				'default': ''
			}),
			/**
			 * @componentProperty {string} ltPropDataTabindex
			 */
			'ltPropDataTabindex': prop('string', { 'default': null }),
			'randomId': prop('string')
		}), arg1);
	}

    init() {
		this.pushValue();
	}

    registerFunction(fn) {
		var that = this;
		this.$node[ fn ] = function() {
			var node = that.$node,
			button = node.querySelector( 'button' ),
			disabled = node.ltProp( 'disabled' );

			if( disabled ) {
				return ;
			}

			button[ fn ]();
		}
	}

    didConnect() {
		var fns = [ 'click', 'focus', 'blur' ], i = 0,
		oldAria = {}, newAria = this.getData( 'ltPropAriaButton' );

		for( ; i < fns.length; i++ ) {
			this.registerFunction( fns[ i ] );
		}

		this.addAriaValues( oldAria, newAria );
	}

    addAriaValues(oldAria, newAria) {
		var button = this.getButtonWidget();

		window._lyteUiUtils.setAttribute( button, newAria, oldAria );
	}

    getButtonWidget() {
		return this.$node.querySelector( 'button' );
	}

    didDestroy() {
		var val;

		delete this.$node.focus;
		delete this.$node.blur;
		delete this.$node.click;

		try {
			val = JSON.parse( this.getData('lyteShortcut') );
		}
		catch( err ) {
			return ;
		}

		if( Array.isArray( val ) ) {
			val.forEach( function( shortcutConfig ) {
				if( shortcutConfig.key ) {
					window.shortcut.push( {
						newKey: undefined,
						type: undefined,
						wait: undefined,
						oldKey: shortcutConfig.key
					} );
				}
			} );
		}
		else {
			window.shortcut.push( {
				newKey: undefined,
				type: undefined,
				wait: undefined,
				oldKey: val.key
			} );
		}
	}

    pushValue(oldValue) {
		var key = this.getData( 'lyteShortcut' ),
		node = this.$node,
		// oldValue can be an array as well. Need to handle that
		oldObj = JSON.parse( oldValue || '{}' ),
		oldKey = oldObj.key;

		if(!key){
			return
		}
		window.newObj = JSON.parse( key );
		if(Array.isArray(newObj)){
			newObj.forEach(function(item){
				if(item.key){
					window.shortcut.push( {
						newKey : item.key,
						type : item.type,
						wait : item.wait,
						// Need to unregister shortcut for array case
						oldKey:undefined,
						value:node
					} );
				}
			})
		}
		else{
			if(newObj.key){
				window.shortcut.push( {
					newKey : newObj.key,
					type : newObj.type,
					wait : newObj.wait,
					oldKey: oldKey,
					value:node
				} );
			}
			else {
				window.shortcut.push( {
					newKey: undefined,
					type: undefined,
					wait: undefined,
					oldKey: oldKey
				} );
			}
		}
	}

    static actions(arg1) {
        return Object.assign(super.actions({
            check: function( event ) {
                var button = this.$node.querySelector( 'button' )
                if( button.disabled ) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }), arg1);
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            ariaObserver: function( change ) {
                var oldAria = change.oldValue,
                newAria = change.newValue;

                this.addAriaValues( oldAria, newAria );
            }.observes( 'ltPropAriaButton' ),

            shortcutChanged: function( changeObj ) {
                this.pushValue( changeObj.oldValue );
            }.observes( 'lyteShortcut' ),

            changeClass: function() {
                var cls = this.getData('ltPropClass'), tempStyle = '',
                tempClass = 'lyte-button' + ( cls ? ' ' + cls : '' ),
                app = this.getData( 'ltPropAppearance' ), size = this.getData( 'ltPropSize' ),
                color = this.getData( 'ltPropColor' ), bg = this.getData( 'ltPropBackgroundColor' );
                size = size ? size.toLowerCase() : '';
                app = app ? app : 'default';

                if( bg ) {
                    tempClass = tempClass + ' lyteBackgroundColorBtn';
                }
                else if( color ) {
                    tempClass = tempClass + ' lyteColorBtn';
                }
                else if( app.indexOf( 'default' ) !== -1 ) {
                    tempClass = tempClass + ' lyteDefaultBtn';
                }
                else if( app.indexOf( 'primary' ) !== -1 ) {
                    tempClass = tempClass + ' lytePrimaryBtn';
                }
                else if( app.indexOf( 'secondary' ) !== -1 ) {
                    tempClass = tempClass + ' lyteSecondary';
                }

                if( app.indexOf( 'success' ) !== -1 ) {
                    tempClass = tempClass + ' lyteSuccess';
                }
                else if( app.indexOf( 'failure' ) !== -1 ) {
                    tempClass = tempClass + ' lyteFailure';
                }

                if( size === 'extra-small' ) {
                    tempClass = tempClass + ' lyteExsm';
                }
                else if( size === 'small' ) {
                    tempClass = tempClass + ' lyteSm';
                }
                else if( size === 'large' ) {
                    tempClass = tempClass + ' lyteLg';
                }

                if( color ) {
                    if( !bg ) {
                        // Adding bg-color #fff because androids render a grayish button.
                        tempStyle = tempStyle + 'background-color: #fff; color:' + color + ';border-color:' + color + ';';
                    }
                    else {
                        tempStyle = tempStyle + 'background-color:' + bg + ';border-color:' + bg + ';color:' + color + ';';
                    }
                }
                else if( bg ) {
                    tempStyle = tempStyle + 'background-color:' + bg + ";border-color:" + bg + ";color:white;";
                }

                if( this.getData( 'ltPropStyle' ) ) {
                    tempStyle = tempStyle + this.getData( 'ltPropStyle' );
                }

                this.setData( 'finalStyle', tempStyle );
                this.setData( 'finalClass', tempClass );
            }.observes(
                'ltPropClass',
                'ltPropBackgroundColor',
                'ltPropColor',
                'ltPropStyle',
                'ltPropSize',
                'ltPropAppearance'
            ).on( 'init' )
        }), arg1);
    }

    _() {
        _;
    }
}

LyteButtonComponent._template = "<template tag-name=\"lyte-button\" onclick=\"{{action('check',event)}}\" onmousedown=\"{{action('check',event)}}\"> <button type=\"{{ltPropType}}\" class=\"{{finalClass}}\" value=\"{{ltPropValue}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" id=\"{{ltPropId}}\" name=\"{{ltPropName}}\" autofocus=\"{{ltPropAutofocus}}\" disabled=\"{{ltPropDisabled}}\" style=\"{{finalStyle}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropText}}\" is=\"case\" lc-id=\"lc_id_0\"> {{ltPropText}} </template><template default=\"\"> <lyte-yield yield-name=\"text\"></lyte-yield> </template></template> </button> </template>";;
LyteButtonComponent._dynamicNodes = [{"t":"a","p":[1],"a":{"style":{"name":"style","dynamicValue":"finalStyle"},"t":{"name":"type","dynamicValue":"ltPropType"}}},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"i","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0},{"type":"dc","trans":true,"hc":true,"p":[0]}];;

LyteButtonComponent._observedAttributes = [
    "ltPropName",
    "ltPropDisabled",
    "ltPropAutofocus",
    "ltPropAppearance",
    "ltPropId",
    "ltPropType",
    "ltPropValue",
    "ltPropTabindex",
    "ltPropStyle",
    "ltPropSize",
    "ltPropBackgroundColor",
    "ltPropColor",
    "lyteShortcut",
    "ltPropClass",
    "lyteUnbound",
    "ltPropAriaButton",
    "ltPropText",
    "ltPropDataTabindex",
    "randomId"
];

/**
 * @syntax yielded
 * <lyte-button>
 *     <template is="registerYield" yield-name="text">
 *         click me
 *     </template>
 * </lyte-button>
 */

/**
 * @syntax staticBuilder
 * <lyte-button lt-prop-text="click me"></lyte-button>
 */

export { LyteButtonComponent };

LyteButtonComponent.register("lyte-button", {
    hash: "LyteButtonComponent_7",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});
