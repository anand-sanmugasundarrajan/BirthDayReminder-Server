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

import "/node_modules/@zoho/lyte-ui-component/components/helpers/helpers-dev.js";
import { prop } from "/node_modules/@slyte/core/index.js";
import { Component } from "/node_modules/@zoho/lyte-ui-component/components/component.js";

/**
 * Renders a checkbox
 * @component lyte-checkbox
 * @version 1.0.0
 * @utility focus,blur,click
 * @methods onBeforeChecked,onChecked,onChanged,onBeforeUnchecked,onUnchecked
 */

window._lyteCbox = {
	'checkedClass': 'lyteCboxChecked',
	'uncheckedClass': 'lyteCboxUnchecked'
};

class LyteCheckboxComponent extends Component {
    constructor() {
        super();
    }

    data(arg1) {
    	return Object.assign(super.data({
    		/**
			 * @componentProperty {default | primary | secondary | switch | slider} ltPropType=default
			 */

			'ltPropType': prop('string', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-checkbox', 'type', 'default')
			}),

			/**
			 * @componentProperty {string} ltPropId
			 */

			'ltPropId': prop('string', {
				'default': undefined
			}),

			/**
			 * @componentProperty {boolean} ltPropDisabled=false
			 */

			'ltPropDisabled': prop('boolean', {
				'default': false
			}),

			/**
			 * @componentProperty {boolean} ltPropChecked=false
			 */

			'ltPropChecked': prop('boolean', {
				'default': false
			}),

			/**
			 * @componentProperty {string} ltPropLabel
			 */

			'ltPropLabel': prop('string', {
				'default': undefined
			}),

			/**
			 * @componentProperty {string} ltPropName
			 */

			'ltPropName': prop('string', {
				'default': undefined
			}),

			/**
			 * @componentProperty {string} ltPropValue
			 */

			'ltPropValue': prop('string', {
				'default': undefined
			}),

			/**
			 * @componentProperty {boolean} ltPropReadOnly=false
			 */

			'ltPropReadonly': prop('boolean', {
				'default': false
			}),

			/**
			 * @componentProperty {boolean} ltPropFireOnInit=false
			 */

			'ltPropFireOnInit': prop('boolean', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-checkbox', 'fireOnInit', false)
			}),

			/**
			 * @componentProperty {string} ltPropClass
			 */

			'ltPropClass': prop('string', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-checkbox', 'class', '')
			}),

			/**
			 * @componentProperty {string} ltPropLabelClass
			 */

			'ltPropLabelClass': prop('string', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-checkbox', 'labelClass', '')
			}),

			/**
			 * @componentProperty {number} ltPropTabindex=0
			 */

			'ltPropTabindex': prop('number', {
				'default': 0
			}),
			'lyteUnbound': prop('boolean', {
				'default': false
			}),

			/**
			 * @componentProperty {boolean} ltPropYield=false
			 * @version 2.2.8
			 */

			'ltPropYield': prop('boolean', {
				'default': false
			}),

			/**
			 * @componentProperty {object} ltPropAriaCheckbox={}
			 * @version 3.1.0
			 */


			'ltPropAriaCheckbox': prop('object', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-checkbox', 'ariaCheckbox', {})
			}),

			/**
			 * @componentProperty {boolean} ltPropFocus=false
			 * @version 3.2.0
			 */

			'ltPropFocus': prop('boolean', {
				'default': false
			}),

			'ltPropPreventCallbackObservers': prop('boolean', {
				'default': false
			}),

			'ltPropDataTabindex': prop('string', { 'default': "" }),

			'ltPropShowTooltip': prop( 'boolean', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-checkbox', 'showTooltip', false ) } ),

			'ltPropTooltipConfig': prop( 'object', {
				'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-checkbox', 'tooltipConfig', {
					'position': 'bottom',
					'appearance': 'box',
					'margin': 5,
					'keeptooltip': true
				} )

			} ),

			'ltPropTooltipClass': prop( 'string', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-checkbox', 'tooltipClass', '' ) } ),

			'ltPropAria': prop( 'boolean', { 'default': window._lyteUiUtils.resolveDefaultValue( 'lyte-checkbox', 'aria', false ) } ),

			'randomId': prop('string')
		}), arg1);
	}

    didDestroy() {
		delete this.$node.focus;
		delete this.$node.blur;
		delete this.$node.click;
	}

    reduceOpacity() {
		if (this.getData('ltPropDisabled')) {
			this.$node.classList.add('lyteCheckDisabled');
		}
		else {
			this.$node.classList.remove('lyteCheckDisabled');
		}
	}

    setDefaults() {
		var type = this.getData('ltPropType'),
			cls = this.getData('ltPropClass'),
			label = this.getData('ltPropLabelClass');

		if (type === 'switch' ) {
			this.setData('ltPropFinalClass', cls ? cls : this.getDefaultSwitchClass() );
		}
		else if (type === 'default') {
			this.setData('ltPropFinalClass', cls ? cls : 'lyteCheckBoxDefault');
		}
		else if (type === 'primary') {
			this.setData('ltPropFinalClass', cls ? cls : 'lyteCheckBoxPrimary');
		}
		else if (type === 'slider') {
			this.setData('ltPropFinalClass', cls ? cls : 'lyteCheckSlider');
		}

		if (type === 'slider') {
			this.setData('ltPropFinalLabelClass', label ? label : 'lyteCheckSliderText');
		}
		else {
			this.setData('ltPropFinalLabelClass', label ? label : '');
		}
	}

    getDefaultSwitchClass() {
		return 'lyteCheckSwitch' + ( this.getData( 'ltPropAria' ) ? ' lyteCheckboxSwitchWithStateLabel' : '' );
	}

    setTooltip() {
		var showTooltip = this.getData( 'ltPropShowTooltip' ),
		label = this.getData( 'ltPropLabel' ),
		tooltipConfig = this.getData( 'ltPropTooltipConfig' ),
		tooltipClass = this.getData( 'ltPropTooltipClass' ),
		labelElement = this.$node.querySelector( '[lyte-label]' );
		if(showTooltip) {
			this.$node.classList.add( 'lyteCheckboxLabelEllipsis' );
		}
		if( showTooltip && labelElement && labelElement.offsetWidth < labelElement.scrollWidth ) {
			labelElement.setAttribute( 'lt-prop-title', label );
			labelElement.setAttribute( 'lt-prop-tooltip-config', JSON.stringify( tooltipConfig ) );
			labelElement.setAttribute( 'lt-prop-tooltip-class', tooltipClass );
		}
	}

    setRandomId() {
		this.setData('randomId', 'lyte-checkbox-label-' + window._lyteUiUtils.cboxId++);
	}

    focusInput() {
		var input = this.$node.querySelector('input'),
			doesNeedFocus = document.activeElement !== input;

		// Clicking on label doesn't focus checkbox in ff and safari
		if (doesNeedFocus) {
			input.focus();
		}
	}

    didConnect() {
		var that = this, newAria = this.getData('ltPropAriaCheckbox');

		var dataIndex = this.getData('ltPropDataTabindex')
		this.$node.setAttribute('data-tabindex', dataIndex)

		this.reduceOpacity();

		this.$node.click = function () {
			var ev = new Event('click', {
				bubbles: true,
				cancelable: true
			}),
				node = that.$node,
				checked = node.ltProp('checked'),
				disabled = node.ltProp('disabled'),
				readonly = node.ltProp('readonly'),
				unbound = that.getData('lyteUnbound'),
				item = that.$node.querySelector('input');

			if (disabled || readonly) {
				return;
			}

			that.setData('eventCache', ev);
			// that.setData( 'preventRefire', true );

			that.setData('internalChange', true);
			that.clickFn = true;

			if (checked) {
				node.ltProp('checked', false);
			}
			else {
				node.ltProp('checked', true);
			}

			// Unbound checkboxes don't check/uncheck visually on their own because we rely on lt-prop-checked to do it
			// TODO: The input will be checked in onBefore callbacks
			// TODO: This needs to be changed when LN provides the relevant APIs to check if it is unbound
			if (that.$node._fR) {
				that.setData('internalChange', false);
				item.checked = node.ltProp('checked');

				if (item.checked) {
					item.setAttribute('checked', '');
				}
				else {
					item.removeAttribute('checked')
				}
				that.fireCallBacksFunction({}, false);
			}

			that.clickFn = false;
			// that.setData( 'preventRefire', false );
			// that.fireCallBacksFunction( {}, false );
			node.dispatchEvent(ev);
		}

		this.$node.focus = function () {
			var node = that.$node,
				input = node.querySelector('input'),
				disabled = node.ltProp('disabled'),
				readonly = node.ltProp('readonly');

			if (disabled || readonly) {
				return;
			}

			input.focus();
		}

		this.$node.blur = function () {
			var node = that.$node,
				input = node.querySelector('input'),
				disabled = node.ltProp('disabled'),
				readonly = node.ltProp('readonly');

			if (disabled || readonly) {
				return;
			}

			input.blur();
		}

		this.fireCallBacksFunction.call(this, undefined, true);
		this.addAriaValues({}, newAria);
	}

    addAriaValues(oldAria, newAria) {
		var checkbox = this.getCheckboxWidget();

		window._lyteUiUtils.setAttribute(checkbox, newAria, oldAria);
	}

    getCheckboxWidget() {
		return this.$node.querySelector('input');
	}

    fireCallBacksFunction(arg1, onrender) {
		var checked = this.getData('ltPropChecked'),
			foi = this.getData('ltPropFireOnInit'), returnval,
			eventCache = this.getData('eventCache'), shouldBreak;

		// This property is very misleading don't use it for anything
		this.$node.checked = checked ? checked : false;

		if (checked && onrender) {
			if (!foi) {
				return;
			}

			var input = this.$node.querySelector('input');
			if (this.getMethods('onBeforeChecked')) {
				this.executeMethod('onBeforeChecked', input, this, eventCache, 'script');
			}

			if (this.getMethods('onChecked')) {
				this.executeMethod('onChecked', input, this, eventCache, 'script')
			}

			if (this.getMethods('onChanged')) {
				this.executeMethod('onChanged', input, this, eventCache, 'script', this.getData( 'ltPropChecked' ) )
			}
		}
		else if (this.$node.checked && !onrender) {
			var input = this.$node.querySelector('input');

			if (!this.clicked) {
				this.setData('preventRefire', true);

				if (this.getMethods('onBeforeChecked')) {

					this.data.ltPropChecked = false;
					input.checked = false;

					// can return undefined or false
					shouldBreak = this.executeMethod('onBeforeChecked', input, this, eventCache, this.eventType()) === false;

					if (shouldBreak) {
						if (this.isCheckedLbound()) {
							this.setData('handleLbind', true);
						}
						else {

							// I am doing this so that the framework will set the checked attribute
							this.data.ltPropChecked = true;
							this.setData('internalChange', true);
							this.setData('ltPropChecked', false);
						}

						this.setData('preventRefire', false);

						return;
					}
					else {
						this.data.ltPropChecked = true;
						input.checked = true;
					}
				}

				this.setData('preventRefire', false);
			}

			if (this.getMethods('onChecked')) {
				this.executeMethod('onChecked', input, this, eventCache, this.eventType());
			}

			this.toggleClass( _lyteCbox.checkedClass );

			if (this.getMethods('onChanged')) {
				this.executeMethod('onChanged', input, this, eventCache, this.eventType(), this.getData( 'ltPropChecked' ) );
			}

			window._lyteUiUtils.dispatchEvent( 'checkboxchange', this.$node, { originalEvent: eventCache } );
		}
		else if (!this.$node.checked && !onrender) {
			var input = this.$node.querySelector('input');

			if (!this.clicked) {
				this.setData('preventRefire', true);
				// this.setData( 'ltPropChecked', true );

				if (this.getMethods('onBeforeUnchecked')) {

					this.data.ltPropChecked = true;
					input.checked = true;

					shouldBreak = this.executeMethod('onBeforeUnchecked', input, this, eventCache, this.eventType()) === false;

					if (shouldBreak) {
						if (this.isCheckedLbound()) {
							this.setData('handleLbind', true);
						}
						else {
							this.data.ltPropChecked = false;
							this.setData('internalChange', true);
							this.setData('ltPropChecked', true);
						}

						this.setData('preventRefire', false);

						return;
					}
					else {
						this.data.ltPropChecked = false;
						input.checked = false;
					}
				}

				this.setData('preventRefire', false);
			}

			if (this.getMethods('onUnchecked')) {
				this.executeMethod('onUnchecked', input, this, eventCache, this.eventType());
			}

			this.toggleClass( _lyteCbox.uncheckedClass );

			if (this.getMethods('onChanged')) {
				this.executeMethod('onChanged', input, this, eventCache, this.eventType(), this.getData( 'ltPropChecked' ) );
			}

			window._lyteUiUtils.dispatchEvent( 'checkboxchange', this.$node, { originalEvent: eventCache } );
		}

	}

    // class added only when it is checked/unchecked by user. Not added during initial render. Used to handle animations
    toggleClass(cls) {
		var clsToRemove = cls === _lyteCbox.checkedClass ? _lyteCbox.uncheckedClass : _lyteCbox.checkedClass;

		this.$node.classList.remove(clsToRemove);
		this.$node.classList.add(cls);
	}

    eventType() {
		var isClicked = this.clicked || this.clickFn,
			key = this.eveType;

		if (!isClicked) {
			return 'script';
		}

		return key ? key : 'click';
	}

    isCheckedLbound() {
		if (!this.$node._attributeDetails) {
			return false;
		}

		return this.$node._attributeDetails['lt-prop-checked'] ? !!this.$node._attributeDetails['lt-prop-checked'].isLbind : false;
	}

    isNodeDestroyed() {
		return !this.$node;
	}

    fireClick(event) {
		var input, hasClickHandlerFired = this.getData('sendEvent'),
			disabled = this.getData('ltPropDisabled'), clickEvent;

		this.isTimeoutInitiated = false;

		// sendEvent is going to tell us if the click handler was called or not
		/* fireClick will be called twice during 1 user click
		   hasClickHandlerFired will make sure the checkbox's state is only changed once since sendEvent gets reset in the mup function
		   metaOrShift makes sure this gets triggered only when meta or shift key is pressed
		   So change state once only when meta or shift is pressed in firefox but this can still interfer with lyte-state attribute
		   since the attribute doesn't want the click to get triggered. so mup gets triggered -> we change state -> but no click gets fired
		*/
		if (!this.isNodeDestroyed() && !hasClickHandlerFired && !disabled && this.metaOrShiftPressed) {
			input = this.$node.querySelector('input');
			input.checked = !input.checked;

			// This calls the click function
			clickEvent = new Event('click');
			clickEvent.shiftKey = true;
			input.dispatchEvent(clickEvent);
		}
	}

    static actions(arg1) {
        return Object.assign(super.actions({
            preventInputClick: function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            },

            mup: function (event) {
                var readonly = this.getData( 'ltPropReadonly' );

                this.metaOrShiftPressed = event.metaKey || event.shiftKey;
                this.setData('prevented', false);
                this.setData('sendEvent', false);

                var disabled = this.getData('ltPropDisabled'), checked, returnval;

                if (disabled) {
                    return;
                }

                if( readonly ) {
                    event.preventDefault();
                    return ;
                }

                var ele = this.$node.querySelector('input')
                checked = ele.checked
                if (this.getMethods('onBeforeChecked') && !checked) {
                    returnval = this.executeMethod('onBeforeChecked', ele, this, event, 'click') == false ? false : true;
                    if (!returnval) {
                        this.setData('prevented', true);
                        event.preventDefault();
                    }
                }

                else if (this.getMethods('onBeforeUnchecked') && checked) {
                    returnval = this.executeMethod('onBeforeUnchecked', ele, this, event, 'click') == false ? false : true;
                    if (!returnval) {
                        this.setData('prevented', true)
                        event.preventDefault();
                    }
                }
            },

            prevent: function (event) {
                var se = this.getData('sendEvent'),
                    isFireFox = !!~window.navigator.userAgent.indexOf('Firefox'),
                    isTimeoutInitiated = this.isTimeoutInitiated;

                // Two events originate - one from the user click and another from the browser click
                // We only allow the user click event to bubble up not the browser click

                // In the newer versions of the framework 3 events are originating.?
                if (!se) {
                    event.stopPropagation();
                }

                // Insanely hacky solution to fix firefox bug
                // https://bugzilla.mozilla.org/show_bug.cgi?id=559506
                if (isFireFox && !isTimeoutInitiated ) {
                    this.isTimeoutInitiated = true;
                    setTimeout(this.fireClick.bind(this, event), 0);
                }

            },

            checkBoxClicked: function (event) {

                var readonly = this.getData( 'ltPropReadonly' );

                if( readonly ) {
                    return ;
                }

                this.setData('sendEvent', true);
                this.setData('eventCache', event);
                this.clicked = true
                var input;

                this.focusInput();

                if (this.getData('prevented')) {
                    input = this.$node.querySelector('input');
                    this.setData('prevented', false)
                    this.setData('preventRefire', true)
                    if (input.checked) {
                        input.checked = false
                    }
                    else {
                        input.checked = true
                    }

                    this.setData('preventRefire', false)
                    this.clicked = false
                    this.setData('eventCache', {});
                    return;
                }

                if (this.getData('ltPropDisabled')) {
                    this.clicked = false
                    event.preventDefault()
                    this.setData('eventCache', {});
                    return;
                }

                var checked
                var ele = event.target
                checked = ele.checked;

                // this.setData( 'preventRefire', true );
                this.setData('internalChange', true);

                if (!checked) {
                    this.setData('ltPropChecked', false);
                }
                else {
                    this.setData('ltPropChecked', true);
                }

                // this.setData( 'preventRefire', false );
                // TODO: change this when LN gives his API
                if (this.$node._fR) {
                    this.setData('internalChange', false);

                    if (this.getData('ltPropChecked')) {
                        this.$node.querySelector('input').setAttribute('checked', '');
                    }
                    else {
                        this.$node.querySelector('input').removeAttribute('checked');
                    }
                    this.fireCallBacksFunction({}, false);
                }
                // this.fireCallBacksFunction( {}, false );
                this.setData('eventCache', {});
                this.clicked = false
            }
        }), arg1);
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            ariaObserver: function (change) {
                var oldAria = change.oldValue,
                    newAria = change.newValue;

                this.addAriaValues(oldAria, newAria);
            }.observes('ltPropAriaCheckbox'),

            disabledChange: function () {
                this.reduceOpacity();
            }.observes('ltPropDisabled'),

            typeObs: function () {
                this.setDefaults();
                this.setRandomId();
            }.observes('ltPropType', 'ltPropClass', 'ltPropLabelClass').on('init'),

            labelChangedObserver: function() {
                this.setTooltip();
            }.observes( 'ltPropLabel', 'ltPropTooltipClass', 'ltPropShowTooltip', 'ltPropTooltipConfig' ).on( 'didConnect' ),

            fireCallbacks:function( change, onrender ) {
                var shouldPreventScriptChange = this.getData( 'ltPropPreventCallbackObservers' ),
                internalChange = this.getData( 'internalChange' ),
                currentState = this.getData( 'ltPropChecked' ),
                classToAdd = currentState ? _lyteCbox.checkedClass : _lyteCbox.uncheckedClass;

                this.setData('internalChange', false);

                if (this.getData('preventRefire')) {
                    return;
                }

                if (this.getData('preventObs')) {
                    return;
                }

                if( !internalChange && shouldPreventScriptChange ) {
                    this.toggleClass( classToAdd );
                    return ;
                }

                if (this.getData('handleLbind')) {

                    this.setData('preventObs', true);
                    this.setData('internalChange', true);
                    this.setData('ltPropChecked', !this.getData('ltPropChecked'));
                    this.setData('preventObs', false);

                    this.setData('handleLbind', false);
                    return;
                }

                this.fireCallBacksFunction.call(this, change, onrender);
            }.observes('ltPropChecked'),

            focusCheckbox: function () {
                var shouldFocus = this.getData('ltPropFocus');

                if (shouldFocus) {
                    this.$node.focus();
                }

                this.data.ltPropFocus = false;
            }.observes('ltPropFocus').on('didConnect')
        }), arg1);
    }

    _() {
        _;
    }
}

LyteCheckboxComponent._template = "<template tag-name=\"lyte-checkbox\" onkeydown=\"{{action('preventInputClick',event)}}\" onkeyup=\"{{action('preventInputClick',event)}}\"> <template _new=\"true\" value=\"{{ltPropType}}\" is=\"switch\">     <template case=\"default\" is=\"case\"><label class=\"lyteCheckbox lyteDefault\" onmouseup=\"{{action('mup',event)}}\" onclick=\"{{action('prevent',event)}}\"> <input aria-labelledby=\"{{randomId}}\" type=\"checkbox\" id=\"{{ltPropId}}\" name=\"{{ltPropName}}\" value=\"{{ltPropValue}}\" checked=\"{{ltPropChecked}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" disabled=\"{{ltPropDisabled}}\" class=\"\" readonly=\"{{ltPropReadonly}}\" onclick=\"{{action('checkBoxClicked',event)}}\"> <span class=\"{{ltPropFinalClass}}\"> <span class=\"{{ltPropFinalLabelClass}}\" aria-hidden=\"true\" id=\"{{randomId}}\" lyte-label=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"yield\"></lyte-yield> </template><template default=\"\"> {{ltPropLabel}} </template></template> </span> </span> </label></template><template case=\"primary\" is=\"case\"><label class=\"lyteCheckbox lytePrimary\" onmouseup=\"{{action('mup',event)}}\" onclick=\"{{action('prevent',event)}}\"> <input aria-labelledby=\"{{randomId}}\" type=\"checkbox\" id=\"{{ltPropId}}\" name=\"{{ltPropName}}\" value=\"{{ltPropValue}}\" checked=\"{{ltPropChecked}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" disabled=\"{{ltPropDisabled}}\" class=\"\" readonly=\"{{ltPropReadonly}}\" onclick=\"{{action('checkBoxClicked',event)}}\"> <span class=\"{{ltPropFinalClass}}\"> <span class=\"{{ltPropFinalLabelClass}}\" id=\"{{randomId}}\" aria-hidden=\"true\" lyte-label=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"yield\"></lyte-yield> </template><template default=\"\"> {{ltPropLabel}} </template></template> </span> </span> </label></template><template case=\"switch\" is=\"case\"><label class=\"\" onmouseup=\"{{action('mup',event)}}\" onclick=\"{{action('prevent',event)}}\"> <input aria-labelledby=\"{{randomId}}\" type=\"checkbox\" id=\"{{ltPropId}}\" name=\"{{ltPropName}}\" value=\"{{ltPropValue}}\" checked=\"{{ltPropChecked}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" disabled=\"{{ltPropDisabled}}\" class=\"lyteHide on-off-sw\" readonly=\"{{ltPropReadonly}}\" onclick=\"{{action('checkBoxClicked',event)}}\"> <span class=\"{{ltPropFinalClass}}\"> <span class=\"on-btn\"></span> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropAria}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteCheckboxOffStateLabel lyteCheckboxStateLabel\">{{lyteUiI18n('lyte.checkbox.off')}}</span> <span class=\"lyteCheckboxOnStateLabel lyteCheckboxStateLabel\">{{lyteUiI18n('lyte.checkbox.on')}}</span> </template></template> </span> <span class=\"{{ltPropFinalLabelClass}}\" aria-hidden=\"true\" id=\"{{randomId}}\" lyte-label=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"yield\"></lyte-yield> </template><template default=\"\"> {{ltPropLabel}} </template></template> </span> </label></template><template case=\"slider\" is=\"case\"><label class=\"lyteCheckSliderLabel\" onmouseup=\"{{action('mup',event)}}\" onclick=\"{{action('prevent',event)}}\"> <input aria-labelledby=\"{{randomId}}\" type=\"checkbox\" id=\"{{ltPropId}}\" name=\"{{ltPropName}}\" value=\"{{ltPropValue}}\" checked=\"{{ltPropChecked}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" disabled=\"{{ltPropDisabled}}\" class=\"lyteHide\" readonly=\"{{ltPropReadonly}}\" onclick=\"{{action('checkBoxClicked',event)}}\"> <span class=\"{{ltPropFinalClass}}\"> <span class=\"{{ltPropFinalLabelClass}}\" aria-hidden=\"true\" id=\"{{randomId}}\" lyte-label=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropYield}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-yield yield-name=\"yield\"></lyte-yield> </template><template default=\"\"> {{ltPropLabel}} </template></template> </span> </span> </label></template></template> </template>";;
LyteCheckboxComponent._dynamicNodes = [{"t":"a","p":[1]},{"t":"s","p":[1],"c":{"default":{"dN":[{"t":"a","p":[0],"cn":"default"},{"t":"a","p":[0,1],"cn":"default"},{"t":"a","p":[0,3],"cn":"default"},{"t":"a","p":[0,3,1],"cn":"default"},{"t":"s","p":[0,3,1,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"primary":{"dN":[{"t":"a","p":[0],"cn":"primary"},{"t":"a","p":[0,1],"cn":"primary"},{"t":"a","p":[0,3],"cn":"primary"},{"t":"a","p":[0,3,1],"cn":"primary"},{"t":"s","p":[0,3,1,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"primary"}]},"switch":{"dN":[{"t":"a","p":[0],"cn":"switch"},{"t":"a","p":[0,1],"cn":"switch"},{"t":"a","p":[0,3],"cn":"switch"},{"t":"s","p":[0,3,3],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"tX","p":[3,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":1,"sibl":[0],"cn":"switch"},{"t":"a","p":[0,5],"cn":"switch"},{"t":"s","p":[0,5,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"switch"}]},"slider":{"dN":[{"t":"a","p":[0],"cn":"slider"},{"t":"a","p":[0,1],"cn":"slider"},{"t":"a","p":[0,3],"cn":"slider"},{"t":"a","p":[0,3,1],"cn":"slider"},{"t":"s","p":[0,3,1,1],"c":{"lc_id_0":{"dN":[{"t":"i","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"tX","p":[1],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"slider"}]}},"d":{},"dc":{"default":{"dc":[0],"hc":true,"trans":true},"primary":{"dc":[0],"hc":true,"trans":true},"switch":{"dc":[0],"hc":true,"trans":true},"slider":{"dc":[0],"hc":true,"trans":true}},"co":["default","primary","switch","slider"],"hc":true,"trans":true,"in":0},{"type":"dc","trans":true,"hc":true,"p":[0]}];;

LyteCheckboxComponent._observedAttributes = [
    "ltPropType",
    "ltPropId",
    "ltPropDisabled",
    "ltPropChecked",
    "ltPropLabel",
    "ltPropName",
    "ltPropValue",
    "ltPropReadonly",
    "ltPropFireOnInit",
    "ltPropClass",
    "ltPropLabelClass",
    "ltPropTabindex",
    "lyteUnbound",
    "ltPropYield",
    "ltPropAriaCheckbox",
    "ltPropFocus",
    "ltPropPreventCallbackObservers",
    "ltPropDataTabindex",
    "ltPropShowTooltip",
    "ltPropTooltipConfig",
    "ltPropTooltipClass",
    "ltPropAria",
    "randomId"
];

document.addEventListener('keyup', function (event) {
	var keyCode = event.keyCode, node, checked, comp;

	if (keyCode === 32) {

		node = document.activeElement;

		if (node.tagName !== 'INPUT') {
			return;
		}

		while (node.tagName !== 'LYTE-CHECKBOX'
			&& node.tagName !== 'HTML'
		) {
			node = node.parentElement;
		}

		if (node.tagName === 'LYTE-CHECKBOX') {
			// We are calling the checkbox's click because we want all the callbacks to be properly fired.
			// We'll be preventing the default behaviour of the browser in the keyup and keypress events
			node.component.eveType = 'key';
			node.click();
			node.component.eveType = '';
		}
	}
}, true);

/**
 * @syntax nonYielded
 * <lyte-checkbox lt-prop-value="1" lt-prop-label="check me"></lyte-checkbox>
 */

/**
 * @syntax yielded
 * <lyte-checkbox lt-prop-value="1" lt-prop-yield="true">
 *     <template is="registerYield" yield-name="yield">
 *         check me
 *     </template>
 * </lyte-checkbox>
 */

export { LyteCheckboxComponent };

LyteCheckboxComponent.register("lyte-checkbox", {
    hash: "LyteCheckboxComponent_13",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});

