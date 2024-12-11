import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "prop": function() {
        return prop;
    },

    "Component": function() {
        return Component;
    },

    "LyteUiComponentComponentRegistry": function() {
        return LyteUiComponentComponentRegistry;
    }
});

import "/node_modules/@zoho/lyte-ui-component/components/helpers/helpers-dev.js";
import { prop } from "/node_modules/@slyte/core/index.js";
import { Component, LyteUiComponentComponentRegistry } from "/node_modules/@zoho/lyte-ui-component/components/component.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";
import "/node_modules/@zoho/lyte-ui-component/plugins/lyte-search.js";

window._lyteDropdownItemId = 0;
window._lyteDropdownBodyId = 0;

/**
 * Renders a dropdown
 * @component lyte-dropdown
 * @version 1.0.0
 * @utility toggle,resetPosition,open,close
 * @methods onShow,onBeforeShow,onScroll,onPositionChanged,onChange,beforeSelect,onHide,onBeforeHide,onAdd,onBeforeAdd,onRemove,onBeforeRemove,onOptionSelected
 * @dependencies lyte-tooltip
 */

// _preventSetCSS has external depedency - pk - dateselect

class LyteDropdownComponent extends Component {
    constructor() {
        super();
    }

    init() {
		var type = this.getData('ltPropType'),
			sel = this.getData('ltPropSelected');
		this._close = this.closeDrop1.bind(this);

		this._transEnd = this.tranEnd.bind(this);

		if (this.getData('ltPropPreventParentScroll')) {
			this.setData('ltPropFreeze', false);
		}

		if (!this.freezeLayerCreated()) {
			this.createFreezeLayer();
		}

		this.$node.getItem = function( val ) {
			var component = this.component,
			box = this.getDropBox(),
			body = component.getDropBody( box );

			return component.getItem( component.getAllItems( body ), val );
		}

		this.$node.resetPosition = function () {
			var comp = this.component,
				shouldUseSave = comp.getData('ltPropFixPositionOnOpen');

			comp.setCss(false, shouldUseSave);
		}

		// Create toggle function
		this.$node.toggle = function (event, type) {
			var val = event ? event : undefined;
			if (this.component.getData('ltPropDisabled') || this.component.getData('ltPropReadOnly')) {
				return;
			}

			this.component.showHide(val, type, true);
		}

		this.$node.getDropBox = function () {
			var component = this.component;

			return component.getDropBox();
		}

		this.$node.open = function () {
			var component = this.component,
				isOpen = component.getData('ltPropIsOpen');

			if (!isOpen) {
				this.toggle();
			}
		}

		this.$node.close = function () {
			var component = this.component,
				isOpen = this.getData('ltPropIsOpen');

			if (isOpen) {
				this.toggle();
			}

		}

		this.$node.getInitialSelected = function (options) {
			var component = this.component;

			component.setInitialSelected(options);

			return component.getData('ltPropSelected');
		}

		this.$node.getDisplayValue = function () {
			var component = this.component,
				link = component.childComp,
				body = component.getDropBody(link),
				sel = component.getData('ltPropSelected'),
				node;

			if (sel) {
				// node = body.querySelector( '[data-value="' + window._lyteUiUtils.escape( sel ) + '"]' );
				node = component.getItem(component.getAllItems(body), sel);

				if (node) {
					return node.textContent.trim();
				}
			}

			return '';
		}

		this.$node.closeError = function () {
			var component = this.component,
				link = component.childComp,
				drophead = component.getData('drophead'),
				body = component.getDropBody(link),
				nodes = body.querySelectorAll('lyte-drop-item:not(.lyteDropdownActive):not(.lyteSearchHidden)');

			if (nodes.length !== 0) {
				component.closeError(link, drophead);
			}
		}

		this.$node.updateBoxAria = function (key, value) {
			var component = this.component,
				box = component.getDropBox();

			box.setAttribute(key, value);
		}

		this.$node.updateButtonAria = function (key, value) {
			var component = this.component,
				button = component.getAriaButton();

			button.setAttribute(key, value);
		}

		this.$node.updateBodyAria = function (key, value) {
			var component = this.component,
				body = component.getDropBody(component.childComp);

			body.setAttribute(key, value);
		}

		this.$node.setValue = function (value) {
			var component = this.component,
				input = component.getSearchBox();

			if (input && input.setValue) {
				input.setValue(value);
			}
		}

		this.$node.showNoResults = function() {
			var box = this.getDropBox(),
			errorDiv = box.querySelector( '.lyteDropdownNoResult' );

			if( errorDiv ) {
				errorDiv.style.display = 'block';
			}
		}

		this.$node.hideNoResults = function() {
			var box = this.getDropBox(),
			errorDiv = box.querySelector( '.lyteDropdownNoResult' );

			if( errorDiv ) {
				errorDiv.style.display = 'none';
			}
		}

		this.$node.scrollToSelected = function() {
			var component = this.component;

			component.scrollSel();
		}

		this.$node.resetSelected = function() {
			var component = this.component,
			selected = component.getData( 'ltPropSelected' );

			component.setData( 'ltPropSelected', '' );
			component.setData( 'ltPropSelected', selected );
		}


		if (type.indexOf('multiple') !== -1
			|| type.indexOf('multisearch') !== -1
		) {
			this.setData('multiple', true);

			if (!sel) {
				this.setData('ltPropSelected', '[]');
			}

			if (type.indexOf('multisearch') !== -1) {
				this.setData('search', true);
			}

			this.setIterator();
		}
	}

    freezeLayerCreated() {
		return document.getElementById( 'lytedropdownfreezelayer' );
	}

    createFreezeLayer() {
		var freezeLayer;

		freezeLayer = document.createElement('div');
		freezeLayer.setAttribute('id', 'lytedropdownfreezelayer');
		freezeLayer.style.display = 'none';
		freezeLayer.style.opacity = '0.01';
		freezeLayer.style.background = '#fff';

		if( window._lyteUiUtils.appendLocation === 'first' ) {
			document.body.insertBefore( freezeLayer, document.body.children[ 0 ] );
		}
		else {
			document.body.appendChild( freezeLayer );
		}
	}

    getSearchBox() {
		return this.$node.querySelector('.lyteDropdownTextField');
	}

    setIterator() {
		var userValue = this.getData('ltPropUserValue'),
			sysValue = this.getData('ltPropSystemValue');

		this.setData('userValue', userValue ? userValue : 'display');
		this.setData('sysValue', sysValue ? sysValue : 'value');
	}

    didDestroy() {
		var body = this.childComp,
			mut = this.$node.mutobserver,
			freeze = this.getData('ltPropFreeze'),
			scrollsToPrevent = this.getData('ltPropPreventScroll'),
			type = this.getData( 'ltPropType' ),
			tab = this.getElementWithTabIndex();

		window.clearTimeout(this.timeoutIdForOpen);
		window.clearTimeout(this.timeoutIdForClose);
		window.clearTimeout( this.scrollEndId );

		this.popOutOfGlobalStack( this.$node );

		if (body) {

			// If a dropdown is getting destroyed when it is open, then we hide the freeze layer set because of it
			if (!body.classList.contains('lyteDropdownHidden')
				&& freeze
				&& scrollsToPrevent === 'all'
			) {
				document.getElementById('lytedropdownfreezelayer').style.display = 'none';
			}

			if (!body.classList.contains('lyteDropdownHidden') && document.body) {
				document.body.classList.remove('lyteBodyWrapper');
			}

			delete body.origindd;
			body.remove();
		}

		if (mut) {
			mut.disconnect()
		}

		this.disableParentListeners();

		// Flush autoClosed when the autoClosed dropdown is getting destroyed
		if (window._lyteDropdown.autoClosed === this.$node) {
			window._lyteDropdown.autoClosed = null;
		}

		if (window._lyteDropdown.lastDropdownWithAPromise === this.$node) {
			window._lyteDropdown.lastDropdownWithAPromise = null;
		}

		if( type === 'multisearch' && tab ) {
			$L( tab ).removeSearch();
		}

		delete this.childComp;
		delete this.$node.toggle;
		delete this.$node.element;

		this.$node.mutobserver = null;

		window.clearTimeout(this._FFBodyScrollOnRemove);
		window.clearTimeout(this._FFBodyScrollOnAdd);
	}

    disableParentListeners() {
		var that = this;

		if (this.scrollableParents) {
			this.scrollableParents.off('scroll', this.resetScroll);
			this.scrollableParents.off( 'wheel', this.preventDefaultBehaviour );
			this.scrollableParents.off( 'touchmove', this.preventDefaultBehaviour );
		}

		this.scrollableParents = undefined;

		if (this.lyteScrollBarParents) {

			this.lyteScrollBarParents.each(function (index, item) {

				if (item) {
					item.removeEventListener('touchmove', that.disableLyteScrollBar, true);
					item.removeEventListener('wheel', that.disableLyteScrollBar, true);
				}

			});

			this.lyteScrollBarParents = undefined;
		}

	}

    prerequisites() {
		// Not putting inside fastdom because it causes a jitter
		if (this.data.ltPropAnimate) {
			this._hgtRemoval = true
			// body.style.height = '';
		}
		this.setCss(false, true);
		this.openSlideAnimate();

		if (this.getData('call')) {
			this.childComp.removeAttribute('lyte-hidden');
		}

		this.pushIntoGlobalStack( this.$node );

		this.fireOnShow();

		if (this.shouldFocusFirstFocusableElement()) {
			this.focusFirstFocusableElement();
		}

		this.setData('call', null);
	}

    pushIntoGlobalStack(node) {
		if( window._lyteUiUtils.popupStack && window._lyteUiUtils.popupStack.globalStack ) {
			if( this.alreadyPushed( node ) ) {
				this.popOutOfGlobalStack( node );
			}

			window._lyteUiUtils.popupStack.globalStack.push( {
				childElement: this.getDropBox(),
				focusedElement: document.activeElement,
				parentElement: node
			} );
		}
	}

    alreadyPushed(node) {
		return !!~this.findIndex( node );
	}

    popOutOfGlobalStack(node) {
		if( window._lyteUiUtils.popupStack && window._lyteUiUtils.popupStack.globalStack ) {
			var items = window._lyteUiUtils.popupStack.globalStack;

			var index = this.findIndex( node );

			if( !!~index ) {
				items.splice( index, 1 );
			}
		}
	}

    findIndex(node) {
		var items = window._lyteUiUtils.popupStack.globalStack;

		for( var i = 0; i < items.length; i++ ) {
			if( items[ i ].parentElement === node ) {
				return i;
			}
		}

		return -1;
	}

    shouldFocusFirstFocusableElement() {
		return this.getData('ltPropAllowFocusableElements');
	}

    focusFirstFocusableElement() {
		var element = this.getFirstFocusableElement();

		if (element) {
			element.focus();
		}

	}

    getFirstFocusableElement() {
		var box = this.$node.getDropBox();

		return box.querySelector(window._lyteDropdown.focusableElementsSelector);
	}

    fireOnShow() {
		var ev;

		if (this.getData('call') && this.getMethods('onShow')) {
			ev = this.getData('call');
			ev = ev === true ? undefined : ev;
			this.executeMethod('onShow', ev, this);
		}

		window._lyteUiUtils.dispatchEvent('lytedropdownshow', this.$node);
	}

    // Do a dfs to find the types of dropdown
    getChildren(childs) {
		var head = this.getData('drophead'),
			body = this.getData('dropbody'),
			tag, i = 0, drop = this.$node;

		if (head === 'yield' && body === 'yield') {
			return;
		}

		for (; i < childs.length; i++) {

			tag = childs[i].tagName;
			if (tag === 'LYTE-DROPDOWN'
				|| tag === 'TEMPLATE'
			) {
				continue;
			}

			if (tag === 'LYTE-DROP-BOX') {
				this.setData('dropbody', 'yield');
				drop.querySelector('lyte-drop-box').classList.add('lyteDropdownHidden');
			}
			else if (tag === 'LYTE-DROP-BUTTON') {
				this.setData('drophead', 'yield');
				window._lyteUiUtils.appendChild(drop.querySelector('.lyteDummyEventContainer'), drop.querySelector('lyte-drop-button'))
				i--;
			}
			else {
				this.getChildren(childs[i].children);
			}
		}
	}

    setBoxClass(oldValue) {
		var cls = this.getData('ltPropBoxClass'),
			box = this.childComp || this.$node.querySelector('lyte-drop-box'),
			body = this.getData('dropbody');

		if (body === 'noyield') {
			if (oldValue) {
				$L(box).removeClass(oldValue);
			}

			if (cls) {
				$L(box).addClass(cls);
			}
		}

	}

    setButtonClass(oldValue) {
		var cls = this.getData('ltPropButtonClass'),
			button = this.$node.querySelector('lyte-drop-button');

		if (oldValue) {
			$L(button).removeClass(oldValue);
		}

		if (cls) {
			$L(button).addClass(cls);
		}
	}

    setIconClass() {
		var multiple = this.getData('multiple'),
			dropButton = this.getDropButton(),
			drophead = this.getData('drophead');

		if (!multiple) {
			return;
		}

		if (drophead === 'yield') {
			return;
		}

		if (this.hasIconClassChanged()) {
			dropButton.classList.add('ltDropdownIconNodePresent');
			this.setData('shouldDisplayIcon', true);
		}
		else {
			dropButton.classList.remove('ltDropdownIconNodePresent');
			this.setData('shouldDisplayIcon', false);
		}
	}

    getDropButton() {
		return this.$node.querySelector('lyte-drop-button');
	}

    getActiveElement() {
		var query = this.getData('ltPropActiveElement'), result;

		if (query) {
			result = this.$node.querySelector(query) || this.$node.getDropBox().querySelector(query);
		}

		result = result || this.getAriaButton();

		return result;
	}

    getAriaButton() {
		return this.$node.querySelector('[role="combobox"]');
	}

    hasIconClassChanged() {
		var iconCls = this.getData('ltPropIconClass');

		return iconCls && iconCls !== 'dropdown';
	}

    didConnect() {
		var selList = this.getData('ltPropSelectedList') || [];

		this.determineYieldContents();
		this.setClassAttributes();
		this.calculateSelected = selList.length > 0;
		this.bindEvents();
		this.addCallout();
		this.setSelectedDuringRender();
		this.toggleButtonInteractivity();
		this.toggleDropdownClass();
		// Bad way to trigger an observer
		this.setData('preventDisp', true);
		this.setData('changeItToInvoke', this.getData('changeItToInvoke') + 1);
		this.setData('preventDisp', false);
		this.setSelectedFromList(true);
		this.toggleDropdown();
		this.attachErrorDiv();
		this.showNoResultDiv();
		this.fireAfterRender();
	}

    fireAfterRender() {
		if( this.getMethods( 'onAfterRender' ) ) {
			this.executeMethod( 'onAfterRender', this.$node );
		}
	}

    attachErrorDiv() {
		var errorDiv = this.createErrorDiv(),
		body = this.getDropBody( this.getDropBox() );

		if( errorDiv ) {
			body.appendChild( errorDiv );
		}
	}

    toggleDropdown() {
		var show = this.getData( 'ltPropShow' ),
		drop = this.$node, tab = this.getElementWithTabIndex();

		if ( show ) {
			this.setData( 'ltPropShow', false );
			drop.toggle();

			$L.fastdom.measure( function() {
				tab.focus();
				var pos = drop.getBoundingClientRect();

				// This doesn't work exactly it can be behind a overflow'd div and still not be visible.
				if (pos.left < 0
					|| pos.top < 0
				) {
					drop.scrollIntoView();
				}
			} );
		}
	}

    toggleButtonInteractivity() {
		var tab = this.getElementWithTabIndex(),
		disabled = this.getData( 'ltPropDisabled' ),
		dataTabIndex = this.getData( 'ltPropDataTabindex' ),
		tabIndex = this.getData( 'ltPropTabindex' );

		if (disabled) {
			this.disableClickableItem(tab);
			tab.setAttribute('tabindex', -1);
			tab.setAttribute('data-tabindex', "");
		}
		else {
			this.enableClickableItem(tab);
			tab.setAttribute('tabindex', tabIndex);
			tab.setAttribute('data-tabindex', dataTabIndex);
		}
	}

    bindEvents() {
		var hover = this.getData( 'ltPropHover' ),
		box = this.getDropBox(),
		body = this.getDropBody( box ),
		type = this.getData( 'ltPropType' ),
		tab;

		if( type === 'multisearch' ) {
			tab = this.getElementWithTabIndex();
			tab && tab.addEventListener( 'keyup', this.fireCheckKey.bind( this ) );
		}

		box.addEventListener('click', function (event) {
			this.processElements(event);
		}.bind(this));

		if (hover) {
			box.addEventListener('mouseout', function (event) {
				this.closeIt(event);
			}.bind(this));
		}

		body.addEventListener('scroll', function (event) {
			this.callOnScroll(event, this);
		}.bind(this));

		box.addEventListener( 'mousemove', this.highlightDropItemsOnHover.bind( this ) );
	}

    determineYieldContents() {
		var dropdownYield = this.$node.querySelector( 'lyte-yield' ),
		head, body;

		this.determine( dropdownYield );

		head = this.getData('drophead');
		body = this.getData('dropbody');

		if (head !== 'yield') {
			this.setData('drophead', head = 'noyield');
		}

		if (body !== 'yield') {
			this.setData('dropbody', body = 'noyield');
		}
	}

    setSelectedDuringRender() {
		var placeholder = this.getData('ltPropPlaceholder'),
		selected = this.getData('ltPropSelected'),
		options = this.getData('ltPropOptions') || [],
		body = this.getData( 'dropbody' ),
		type = this.getData( 'ltPropType' );

		this.setData('preventDisp', true);

		//We need to set the first value in the dropdown as the selected one
		if ( !placeholder && !selected && type !== 'multiple' && type !== 'multisearch' ) {
			if( options.length > 0 ) {
				this.setSelectedFromOptions();
			}
			else if( body === 'yield' ) {
				this.setSelectedFromYield();
			}
			
		}

		this.setData('preventDisp', false);
	}

    setSelectedFromOptions(options) {
		var options = options || this.getData('ltPropOptions') || [],
		firstElement = options[ 0 ],
		flag = false,
		value;

		if (firstElement.constructor == Object) {
			if (Object.keys(firstElement).length == 1) {
				value = firstElement[Object.keys(firstElement)[0]];
				if (value.constructor == Array) {
					flag = true
				}
			}
		}

		
		if (flag) {
			if (Object.prototype.toString.call(value[0]) === '[object Object]') {
				this.setData('ltPropSelected', value[0][this.getData('ltPropSystemValue')]);
			}
			else {
				this.setData('ltPropSelected', value[0]);
			}
		}
		else {
			if (Object.prototype.toString.call(firstElement) === '[object Object]') {
				this.setData('ltPropSelected', firstElement[this.getData('ltPropSystemValue')]);
			}
			else {
				this.setData('ltPropSelected', firstElement);
			}

		}
	}

    setSelectedFromYield() {
		var node = this.getFirstEnabledItem();

		if (node) {
			node.setAttribute('selected', true);
		}
	}

    highlightDropItemsOnHover(event) {
		var cur = event.target,
			curTar = event.currentTarget,
			prev = curTar.querySelector('.lyteDropdownSelection'),

			// This overrides everything
			preventNavigation = this.getData( 'ltPropPreventNavigation' );

		if( preventNavigation ) {
			return ;
		}

		cur = window._lyteDropdown.traverse(cur, ['LYTE-DROP-ITEM']);

		if (this.hasMousePositionNotChanged(event) || cur === prev) {
			return;
		}

		// This will make sure that it is removed for disabled items which have pointer-events:none
		if (prev) {
			prev.classList.remove('lyteDropdownSelection');
		}

		if (!cur || cur.tagName !== 'LYTE-DROP-ITEM') {
			return;
		}

		if (cur.getAttribute('disabled') === 'true') {
			return;
		}

		if (cur) {
			cur.classList.add('lyteDropdownSelection');
			this.getActiveElement().setAttribute('aria-activedescendant', cur.getAttribute('id'));
		}

	}

    createErrorDiv() {
		var isErrorDivYield = this.getData( 'ltPropNoResultYield' ),
		noResultText = this.getData('ltPropNoResult'),
		errorDiv;

		if( !isErrorDivYield ) {
			errorDiv = document.createElement( 'div' );
			errorDiv.setAttribute('class', 'lyteDropdownNoResult');
			errorDiv.textContent = noResultText;
			errorDiv.style.display = 'none';
		}
		
		return errorDiv;
	}

    processElements(event) {
		var elm = event.target,
			mul = this.getData('multiple'),
			search = this.getData('search');

		if (search) {
			this.focusInput();
		}

		elm = window._lyteDropdown.traverse(elm, ['HTML', 'LYTE-DROP-ITEM']);

		if (!elm || elm.tagName === 'HTML') {               //Clicking on header should not call selection code
			return;
		}

		if (elm.getAttribute('disabled') === 'true') {
			return;
		}

		if ( !mul ) {
			this.selectItem( event, elm );
		}
		else {
			this.addItem( event, elm );
		}
	}

    addItem(event, elm) {
		var numberOfItemsGettingAdded = 1, src, ret,
		oldSelected = this.getData('ltPropSelected'),
		that = this;

		if ( this.beforeAddPromiseActive ) {
			return;
		}

		if ( this.checkLimit( numberOfItemsGettingAdded ) ) {
			return;
		}

		src = elm.getAttribute('data-value');

		if (this.getMethods('onBeforeAdd')) {
			ret = this.beforeAdd(event, elm, src);
		}

		if (this.isPromise(ret)) {
			this.beforeAddPromiseActive = true;

			ret.then(function () {
				that.selectItemOfMultiSelect(event, elm, oldSelected);
				that.beforeAddPromiseActive = false;
			}).catch(function (err) {
				console.error(err);
				that.beforeAddPromiseActive = false;
			});
		}
		else {
			if (ret) {
				return;
			}

			this.selectItemOfMultiSelect(event, elm, oldSelected);
		}
	}

    selectItem(event, elm) {
		var link = this.childComp, freeze = this.getData( 'ltPropFreeze' ),
		oldSelected = this.getData( 'ltPropSelected' );

		if ( !this.beforeSelect( event, elm ) ) {
			return;
		}

		this.setData( 'ltPropSelected', elm.getAttribute('data-value') );
		this.optCall(event, this.getData('ltPropSelected'), elm);
		this.fireOnChange(oldSelected, event, elm);

		if ( this.beforeHide( link, event, freeze ) ) {
			return;
		}

		this.closeDrop(link, event, freeze);
	}

    isPromise(obj) {
		return typeof obj === 'object';
	}

    selectItemOfMultiSelect(event, elm, oldSelected) {
		var link = this.childComp,
			elements = link.querySelectorAll('lyte-drop-item'),
			src = elm.getAttribute('data-value'),
			head = this.getData('drophead'),
			type = this.getData('ltPropType'),
			search = this.getData('search'),
			input = this.$node.querySelector('lyte-search') || this.$node.querySelector('input');;

		if (search && input.setValue && !this.isInputEmpty(input)) {
			input.setValue('');
		}

		this.setHighlight(elements, elm);

		this.setData('prev', true);
		elm.setAttribute('selected', 'true');
		this.setData('prev', false);

		elm.classList.add('lyteDropdownActive');

		this.hideGroup(elm);

		// check this things position in code now.
		if (this.getMethods('onAdd')) {
			this.executeMethod('onAdd', event, src, this.getData('ltPropSelected'), this, elm);
		}

		this.showError(link, type, head);

		this.fixBoxPosition();
		this.fireOnChange(oldSelected, event, elm);
	}

    setClassAttributes() {
		this.setBoxClass();
		this.setButtonClass();
		this.setIconClass();
		this.setClassForRemoveIcon();
	}

    setClassForRemoveIcon() {
		var shouldUseRemoveIcon = this.getData('ltPropShowRemoveIcon') && this.getData('ltPropSelected');

		if (shouldUseRemoveIcon) {
			this.$node.classList.add('lyteDropdownWithDeselectIcon');
		}
		else {
			this.$node.classList.remove('lyteDropdownWithDeselectIcon');
		}
	}

    addCallout() {
		var span, box = this.getDropBox();

		span = document.createElement('span');
		span.setAttribute('class', 'lyteArrow');
		box.insertBefore(span, box.children[0]);
	}

    addTabIndexForYieldedMultisearch() {
		var type = this.getData('ltPropType'),
			drophead = this.getData('drophead'),
			tabIndexElement = this.$node.querySelector('input'),
			index = this.getData('ltPropTabindex'),
			dataIndex = this.getData('ltPropDataTabindex'),
			isDisabled = this.getData('ltPropDisabled');

		if (tabIndexElement && drophead === 'yield' && type === 'multisearch' && !isDisabled) {
			tabIndexElement.setAttribute('tabindex', index);
			tabIndexElement.setAttribute('data-tabindex', dataIndex);
		}
	}

    getElementWithTabIndex() {
		return this.$node.querySelector('[tabindex]') || this.$node.querySelector('input');
	}

    getFirstEnabledItem() {
		var body = this.getDropBody(this.childComp),
			items = body.querySelectorAll('lyte-drop-item'),
			disabledList = this.getData('ltPropDisabledList') || [];

		for (var i = 0; i < items.length; i++) {
			if (!~disabledList.indexOf(items[i].getAttribute('data-value'))) {
				return items[i];
			}
		}
	}

    hasMousePositionNotChanged(event) {
		var curClientX = event.clientX,
			curClientY = event.clientY,
			prevClientX = this.prevClientX,
			prevClientY = this.prevClientY;

		this.prevClientX = curClientX;
		this.prevClientY = curClientY;

		if (prevClientX === curClientX && prevClientY === curClientY) {
			return true;
		}

		return false;
	}

    tranEnd(evt) {
		var box = this.childComp,
			isAnimate = this.getData('ltPropAnimate'),
			body = this.data.ltPropAnimateBox ? box : this.getDropBody(box);

		window.clearTimeout(this.timeoutIdForOpen)

		if (isAnimate) {
			body.style.height = 'auto';
		}

		box.classList.remove('lyteAnimate', 'lyteDropBoxAnimate');
		box.removeEventListener('transitionend', this._transEnd)
		delete this._prevent;
		delete this._preventSetcss;
		delete this._preventMutObs;

		// Hidden method
		if (this.getMethods('onAnimationEnd')) {
			this.executeMethod('onAnimationEnd', evt, this);
		}

		var isFF = this.isFF(),
			isOpen = this.getData('ltPropIsOpen');

		if (!isOpen) {
			return;
		}

		if (isFF && this.isBodyScrollable()) {
			this.addProperScrollbar();
		}
		else if (isFF && !this.isBodyScrollable()) {
			this.removeScrollbar();
		}
	}

    openSlideAnimate() {
		if (this.getData('ltPropAnimate')) {
			if (this._preventSetcss) {
				return
			}

			if (this._preventAnimate) {
				return;
			}

			this._preventAnimate = true;
			this._preventSetcss = true
			this._preventMutObs = true
			var box = this.childComp ? this.childComp : this.$node.querySelector('lyte-drop-box'),
				isBoxAnimate = this.data.ltPropAnimateBox,
				elem = isBoxAnimate ? box : this.getDropBody(this.childComp);
			this._oriStyle = elem.style.height;
			// animation starts from zero
			elem.style.height = 0;
			// for invert animation
			if (['up', 'upLeft', 'upRight'].indexOf(this.getData('pos')) != -1) {
				box.style.top = parseInt(box.style.top) + this._hgt + 'px';
			}

			box.classList.add('lyteAnimate');
			if (isBoxAnimate) {
				box.classList.add('lyteDropBoxAnimate');
			}
			// setTimeout( function(){
			// animation class added
			// box.classList.add( 'lyteAnimate' );
			setTimeout(function () {
				// invert anime starts
				if (['up', 'upLeft', 'upRight'].indexOf(this.getData('pos')) != -1) {
					box.style.top = parseInt(box.style.top) - this._hgt + 'px';
				}
				// height animate starts
				elem.style.height = this._hgt + 'px';
				setTimeout(function () {
					box.addEventListener('transitionend', this._transEnd);

					if (!this._hgt) {
						this.tranEnd.call(this, {})
					}
					else {
						var time = this.getTransitionTime(box);

						// A fail safe incase transitionend doesn't fire
						this.timeoutIdForOpen = setTimeout(this._transEnd, time);
					}
				}.bind(this), 20)
			}.bind(this), 20)
			// }.bind(this), 20)
		}
	}

    getTransitionTime(box) {
		var tolerance = 100,
			duration = window.getComputedStyle(box).transitionDuration,
			res = tolerance;

		if (!!~duration.indexOf('ms')) {
			res += parseInt(duration);
		}
		else {
			// seconds
			res += parseFloat(duration) * 1000;
		}

		return res;
	}

    /**
	 * This is going to determine the structure of the dropdown whether it is a single or dropdown within dropdown
	 * @param {HTMLElement} yd - The yield of the dropdown
	 *
	 */

    determine(yd) {
		var children = yd.children,
			head, box, drop = this.$node, dummy, other;

		other = drop.querySelector('lyte-dropdown');
		if (other) {
			this.getChildren(children);
		}
		else {
			box = yd.querySelector('lyte-drop-box');
			head = yd.querySelector('lyte-drop-button');

			if (head) {
				dummy = drop.querySelector('.lyteDummyEventContainer');
				this.setData('drophead', 'yield');
				window._lyteUiUtils.appendChild(dummy, head);
			}

			if (box) {
				this.setData('dropbody', 'yield');
				box.classList.add('lyteDropdownHidden')
			}
		}
	}

    /**
	 * This is going to add a class to the drop-box for multiselects
	 *
	 */

    addClass() {
		var link = this.childComp;

		link.classList.add('lyteMultiSelectDropdown');
	}

    closeDrop(link, event, freeze, isScroll) {
		window._lyteDropdown.autoClosed = null;
		this.setData('ltPropIsOpen', false);

		if (this._prevent) {
			return
		}
		if (this.getData('ltPropAnimate') && !isScroll) {
			var isBoxAnimate = this.data.ltPropAnimateBox;
			this._prevent = true;
			this._preventSetcss = true;
			this._arguments = arguments;
			this.childComp.classList.add('lyteAnimate');
			if (isBoxAnimate) {
				this.childComp.classList.add('lyteDropBoxAnimate');
			}
			setTimeout(function () {
				var box = this.childComp ? this.childComp : this.$node.querySelector('lyte-drop-box'),
					elem = isBoxAnimate ? box : this.getDropBody(this.childComp);

				elem.style.height = this._hgt + 'px';

				setTimeout(function () {
					// var box = this.childComp ? this.childComp : this.$node.querySelector('lyte-drop-box'),
					// elem = isBoxAnimate ? box : this.getDropBody( this.childComp );

					// height set to zero for hide animation
					elem.style.height = 0;
					// invert animation
					if (['up', 'upLeft', 'upRight'].indexOf(this.getData('pos')) != -1) {
						box.style.top = parseInt(box.style.top) + this._hgt + 'px';
					}

					this._animationStarted = true;
					this._elem = elem;
					this._box = box;
					elem.addEventListener('transitionend', this._close);

					if (!this._hgt) {
						this.closeDrop1.call(this)
					}
					else {
						// A fail safe incase transitionend doesn't fire
						var time = this.getTransitionTime(elem);

						this.timeoutIdForClose = setTimeout(this._close, time);
					}

				}.bind(this), 20);

			}.bind(this), 20)
		} else {
			this.closeDrop1(link, event, freeze)
		}
	}

    closeDrop1(link, event, freeze) {
		var bt = this.$node.querySelector('lyte-drop-button'),
			pos = this.getData('pos'), cls, mul = this.getData('multiple'), body,
			box = this.getDropBox(),
			scrollsToPrevent = this.getData('ltPropPreventScroll'),
			preventParentScroll = this.getData('ltPropPreventParentScroll');

		window.clearTimeout(this.timeoutIdForClose);

		if (this._arguments) {
			link = this._arguments[0], event = this._arguments[1], freeze = this._arguments[2]
			this._elem.style.height = this._oriStyle;
			//animate class removal
			this._box.classList.remove('lyteAnimate', 'lyteDropBoxAnimate');
			this._elem.removeEventListener('transitionend', this._close)
			delete this._hgt; delete this._oriStyle; delete this._arguments; delete this._elem; delete this._box;
		}

		if (mul) {
			body = this.getDropBody(link);
			body.scrollTop = 0;
		}

		link.classList.add('lyteDropdownHidden');
		var freezeLayer = document.querySelector('#lytedropdownfreezelayer')
		if (freeze && freezeLayer && scrollsToPrevent === 'all') {
			document.querySelector('#lytedropdownfreezelayer').style.display = 'none'
		}

		link.style.left = '';
		link.style.top = '';
		link.style.bottom = '';
		link.style.right = '';

		if (freeze || preventParentScroll) {
			document.body.classList.remove('lyteBodyWrapper');
		}

		this.disableParentListeners();

		cls = this.removeClass(bt.classList, pos, 'lyteDropButton', true);

		if (cls) {
			bt.classList.remove(cls);
		}

		this.popOutOfGlobalStack( this.$node );

		if (this.getMethods('onHide')) {
			this.executeMethod('onHide', event, this);
		}

		this.focusButton();

		// This if statement is a bad fix. Added so that the dropdown doesn't throw an error when it is destroyed in on-option-selected and box is empty
		if (box) {
			var posClsToRemove = this.removeClass(box.classList, pos, 'lyteDropdown', true);
		}

		if (posClsToRemove) {
			box.classList.remove(posClsToRemove);
		}

		this.setData('pos', '');
		this.setData('secondaryPosition', '');
		this.setData('savedPositions', {});

		delete this._prevent; delete this._preventSetcss;
		delete this._preventAnimate;
		delete this._animationStarted;
	}

    focusButton() {
		var isSearch = this.getData('search'),
			activeElement = document.activeElement,
			focusOnClose = this.getData('ltPropFocusOnClose');

		/* Not sure about multisearchs */
		if (focusOnClose && !isSearch && !this.isFocusable(activeElement)) {
			this.preventScroll = true;
			this.setData('ltPropFocus', true);
			this.preventScroll = false;
		}
	}

    isFocusable(element) {
		var tabIndex;

		element = $L(element);

		if (!window._lyteDropdown.isVisible(element.get(0)) || element.is(":disabled")) {
			return false;
		}

		tabIndex = element.attr("tabindex");
		tabIndex = isNaN(tabIndex) ? -1 : tabIndex;
		return element.is("button, input, select, textarea, a[href], area[href], iframe") || tabIndex > -1;
	}

    callOnScroll(event) {
		var comp = this;

		if (this.getMethods('onScroll')) {
			this.executeMethod('onScroll', event, this);
		}

		if( this.hasScrollEndReached( event ) && this.movingDownward( event ) ) {
			window.clearTimeout( this.scrollEndId );

			this.scrollEndId = setTimeout( function() {
				comp.fireScrollEnd( event );
			}, 50 ); 
		}
	}

    movingDownward(event) {
		var scrollingContainer = event.target,
		scrollTop = scrollingContainer.scrollTop,
		previousScrollTop = this.previousScrollTop || 0;

		this.previousScrollTop = scrollTop;

		return scrollTop - previousScrollTop > 0;
	}

    hasScrollEndReached(event) {
		var scrollingContainer = event.target,
		scrollTop = scrollingContainer.scrollTop,
		height = scrollingContainer.offsetHeight,
		scrollHeight = scrollingContainer.scrollHeight,
		tolerance = 5;

		return height + scrollTop >= ( scrollHeight - tolerance );
	}

    fireScrollEnd(event) {
		if( this.getMethods( 'onScrollEnd' ) ) {
			this.executeMethod( 'onScrollEnd', event );
		}
	}

    addDisabledClass(elements) {
		var i = 0, ele;
		for (; i < elements.length; i++) {
			ele = elements[i];
			if (ele.getAttribute('disabled') == 'true') {
				ele.classList.add('lyteDropdown-disabled');
			}
			else if (ele.classList.contains('lyteDropdown-disabled')) {
				ele.classList.remove('lyteDropdown-disabled');
			}
		}
	}

    showNoResultDiv() {
		var show = this.getData('ltPropShowEmptyMessage'),
			link = this.childComp,
			body = this.getDropBody(link),
			items = body.querySelectorAll('lyte-drop-item'),
			nores = body.querySelector('.lyteDropdownNoResult'),
			multiple = this.getData('multiple');

		if (!nores) {
			return;
		}

		if (show && !multiple) {
			if (items.length === 0) {
				nores.style.display = 'block';
			}
			else {
				nores.style.display = 'none';
			}

		}
		else if (!show && !multiple) {
			nores.style.display = 'none';
		}
	}

    /**
	 * The method is going to specify the class that needs to be removed from the classList
	 * ( Might be buggy when lt-prop-position is changed as it only removes opposites)
	 * @param {classList} arr - The classlist under question
	 * @param {string} pos - The current position of the dropdown
	 * @param {string} prefix - A prefix that is appended to the pos attribute to determine the class
	 * @param {boolean} ignore - Tells whether we must search for the opposites
	 * @param {string} suffix - A suffix added to the end of the class
	 *
	 */


    removeClass(arr, pos, prefix, ignore, suffix) {
		if (!pos) {
			return '';
		}

		suffix = suffix || '';

		var negate = {
			'up': 'Down',
			'down': 'Up',
			'left': 'Right',
			'right': 'Left'
		}, i = 0, len = arr.length,

			ngcls = prefix
				+ (ignore ?
					pos[0].toUpperCase() + pos.substring(1)
					: negate[pos]) + suffix;

		for (; i < len; i++) {
			if (arr[i] === ngcls) {
				return ngcls;
			}
		}

		return '';
	}

    /*
		Calculate left of dropdown container when it has to come below/above the select element when it exceeds window.innerWidth and there is space to the right
	*/
    setLeftExceedForDown(element, container, bcr, width, xscroll) {
		var scrolledLeft = -xscroll,
			elementBCR = this.getButton().getBoundingClientRect(),
			elementLeft = elementBCR.left,
			elementWidth = elementBCR.width,
			elementRight = elementBCR.right,
			total = scrolledLeft + (window.innerWidth - elementRight);

		return total
	}

    /*
		Calculate left of dropdown container when it has to come below/above the select element when it doesn't exceed window.innerWidth
	*/
    alignBoxToButtonLeft(element, bcr, xscroll) {
		var scrolledLeft = xscroll,
			elementBCR = this.getButton().getBoundingClientRect(),
			elementLeft = elementBCR.left,
			total = scrolledLeft + elementLeft;

		return total
	}

    /*
		Calculate top of dropdown container when it has to come above the select element
	*/
    setTopAboveForDown(element, container, bcr, containerbcr, yscroll) {
		var scrolledHeight = -yscroll,
			elementBCR = bcr,
			elementTop = elementBCR.top,
			containerBCR = containerbcr,
			containerHeight = containerBCR.height,
			total = scrolledHeight + (window.innerHeight - elementTop);

		if (this._animationStarted) {
			return scrolledHeight + (window.innerHeight - elementTop);
		}

		return total
	}

    /*
		Calculate top of dropdown container when it has to come below the select element
	*/
    alignBoxTopToButtonBottom(element, bcr, yscroll) {
		var scrolledHeight = yscroll,
			elementBCR = bcr,
			elementTop = elementBCR.top,
			elementHeight = elementBCR.height,
			total = scrolledHeight + elementTop + elementHeight;

		return total
	}

    /*
		Calculate left of dropdown container when it has to come to right of the select element
	*/
    setLeftForRight(element, bcr, xscroll) {
		var scrolledWidth = xscroll,
			elementBCR = bcr,
			elementLeft = elementBCR.left,
			elementWidth = elementBCR.width,
			total = scrolledWidth + elementLeft + elementWidth;

		return total
	}

    /*
		Calculate right of dropdown container when it has to come to left of the select element of right dropdown
	*/
    setRightForRight(element, container, bcr, width, xscroll) {
		var scrolledWidth = -xscroll,
			elementBCR = bcr,
			elementLeft = elementBCR.left,
			total = scrolledWidth + (window.innerWidth - elementLeft);

		return total
	}

    /*
		Calculate top of dropdown container when it has to come to right of dropdown and there is space below
	*/
    setTopForRight(element, bcr, yscroll) {
		var scrolledHeight = yscroll,
			elementBCR = bcr,
			elementTop = elementBCR.top,
			total = scrolledHeight + elementTop;

		return total
	}

    /*
		Calculate top of dropdown container when it has to come to right of dropdown and there is no space below
	*/
    setTopForRightAbove(element, container, bcr, elembcr, yscroll) {
		var scrolledHeight = -yscroll,
			elementBCR = bcr,
			elementTop = elementBCR.top,
			elementHeight = elementBCR.height,
			elementBottom = elementBCR.bottom,
			containerBCR = elembcr,
			containerHeight = containerBCR.height,
			total = scrolledHeight + (window.innerHeight - elementBottom);

		if (this._animationStarted) {
			return scrolledHeight + (window.innerHeight - elementBottom);
		}

		return total
	}

    /**
		Remove wrong arrow and append proper arrow
		@param string correct - the correct class
	*/
    setCorrectClass(cls) {
		var arrow = this.childComp.querySelector('.lyteArrow'),
			list = arrow.classList, i = 0;
		for (; i < list.length; i++) {
			if (list[i] == 'lyteArrow' || list[i] == cls) {
				continue;
			}
			else {
				arrow.classList.remove(list[i]);
				i--;
			}
		}

		arrow.classList.add(cls);
		arrow.classList.add('lyteArrowIcon');
	}

    /**
	 * This going to check if a class has been toggled
	 * @param {MutationRecord} rec - The mutation record
	 * @param {String} cls - The class that needs to be checked
	 *
	 */
    hasClassToggled(rec, cls) {
		var old = rec.oldValue ? rec.oldValue.trim().split(" ") : [],
			node = rec.target,
			olen = old.length,
			nlen = node.classList.length;

		if (((!!~old.indexOf(cls)
			&& !node.classList.contains(cls))
			|| (!~old.indexOf(cls)
				&& node.classList.contains(cls)
			))

			// Only 1 class changed
			&& Math.abs(olen - nlen) === 1
		) {
			return true;
		}

		return false;
	}

    /**
	 * The adjust width is going to adjust the width of the dropdown's body that is going to open
	 * @param {Element} body - The lyte-drop-box
	 * @param {Number} pwidth - The width of the parent Element
	 * @param {Number} bwidth - The width of the body Element
	 *
	 */

    adjustWidth(body, pwidth, bwidth) {
		var boxButtonWidth = this.getData('ltPropBoxButtonWidth'), newWidth;

		if (boxButtonWidth === 'min-button') {
			this.setData('widthAdjusted', 1);

			if (bwidth > pwidth) {
				this.setData('widthAdjusted', 2);
			}

			body.style.minWidth = pwidth + 'px';
		}
		else if (boxButtonWidth === 'auto') {
			this.setData('widthAdjusted', 1);
			body.style.width = 'auto';
			newWidth = body.getBoundingClientRect().width;

			if (newWidth > pwidth) {
				this.setData('widthAdjusted', 2);
			}
		}
		else {
			this.setData('widthAdjusted', 1);
			body.style.width = pwidth + 'px';
			body.style.minWidth = pwidth + 'px';
		}

		return body.getBoundingClientRect().width;

	}

    getFocusableElements() {
		var dropdown = this.$node,
			box = dropdown.getDropBox();

		return box.querySelectorAll(window._lyteDropdown.focusableElementsSelector);
	}

    /**
	 * This is going to return the proper drop-body tag of the dropdown - ( dropdown inside dropdown )
	 * @param {Element} box - The lyte-drop-box of the dropdown
	 *
	 */

    getDropBody(link) {
		var all;

		if (link) {
			all = link.querySelectorAll('lyte-drop-body');
		}
		else {
			all = this.$node.querySelectorAll('lyte-drop-body');
		}

		return all[all.length - 1];
	}

    /**
	 * This is going to remove the previous highlighted element and set a new highlighted element
	 * @param {Element} node - The element to be toggled -> should not be undefined
	 * @param {Element} body - The lyte-drop-body
	 *
	 */

    toggleCurrent(node) {
		var cls = 'lyteDropdownSelection',
			box = this.getDropBox(),
			prev = box && box.querySelector('.' + cls);

		if (prev) {
			prev.classList.remove(cls);
		}

		node.classList.add(cls);
		this.getActiveElement().setAttribute('aria-activedescendant', node.getAttribute('id'));
	}

    /**
	 * This is going to scroll the drop-body to the element above the selected element
	 * This function is also going to highlight the selected value
	 * Note this doesn't work when they are making a request and trying to set the data
	 *
	 */

    scrollSel() {

		var sel = this.getData('ltPropSelected'),
			link = this.childComp,
			body = this.getDropBody(link),
			tmp, highlightedElement,
			all_elems = this.getAllItems(body),
			node = tmp = this.getItem(all_elems, sel) /*body.querySelector( '[data-value="' + window._lyteUiUtils.escape( sel ) + '"]' )*/;

		// Not for multiselects
		if (this.getData('multiple')) {
			// tmp = body.querySelector( 'lyte-drop-item:not(.lyteDropdownActive):not(.lyteSearchHidden)' );
			tmp = all_elems.filter(function (item) {
				return !item.classList.contains('lyteDropdownActive') && !item.classList.contains('lyteSearchHidden');
			})[0];

			if (tmp && !tmp.classList.contains('lyteDropdown-disabled')) {
				this.toggleCurrent(tmp);
			}

			return;
		}

		if ((sel || '').length === 0) {
			body.scrollTop = 0;
		}

		while (node
			&& (node = node.previousElementSibling)
		) {
			if ((node.tagName === 'LYTE-DROP-ITEM'
				|| node.tagName === 'LYTE-DROP-LABEL')
				&& window._lyteDropdown.isVisible(node)
			) {
				break;
			}
		}

		// Scroll to original node if no visible node is found
		node = node ? node : tmp;

		// If we now have a node set the scrollTop
		if (node) {
			body.scrollTop = this.isFirstItem( node ) ? 0 : node.offsetTop;
		}
		else {
			body.scrollTop = 0;
		}

		if (tmp && !tmp.classList.contains('lyteDropdown-disabled')) {
			this.toggleCurrent(tmp);
		}
		else {
			highlightedElement = body.querySelector('.lyteDropdownSelection');

			if (highlightedElement) {
				highlightedElement.classList.remove('lyteDropdownSelection');
			}
		}
	}

    isFirstItem(node) {
		var parent = node.parentElement;

		return parent && parent.firstElementChild === node;
	}

    /**
	 * This is going to clone the object
	 * @param {Object} obj - the object to be clone
	 *
	 */

    clone(obj) {
		var clone = {};

		for (var key in obj) {
			clone[key] = obj[key];
		}

		return clone;
	}

    isFF() {
		var ua = window.navigator.userAgent;

		return !!~ua.indexOf('Firefox');
	}

    isBodyScrollable() {
		var link = this.childComp,
			body = this.getDropBody(link);

		return body.scrollHeight > body.offsetHeight;
	}

    addProperScrollbar() {
		var link = this.childComp,
			body = this.getDropBody(link);

		if (!body.classList.contains('lyteDropdownFFScroll')) {
			body.classList.add('lyteDropdownFFScroll');
		}

		if (body.classList.contains('lyteDropdownFFZeroScroll')) {
			body.classList.remove('lyteDropdownFFZeroScroll');
		}
	}

    removeScrollbar() {
		var link = this.childComp,
			body = this.getDropBody(link);

		if (!body.classList.contains('lyteDropdownFFZeroScroll')) {
			body.classList.add('lyteDropdownFFZeroScroll');
		}

		if (body.classList.contains('lyteDropdownFFScroll')) {
			body.classList.remove('lyteDropdownFFScroll');
		}
	}

    getButton() {
		return this.$node.element || this.$node.querySelector('lyte-drop-button');
	}

    /* 
		Disallow arrow key navigation(and enter) when there can be multiple focusable elements on the box
		and the current focused element is not the active element. Also I guess activeElement can be empty and then have a value during its lifetime
		We are adding the ltPropPreventNavigation here because this function can prevent the navigation of arrow keys
	*/
    shouldNavigate() {
		var activeElement = this.getData('ltPropActiveElement'),
			currentActiveElement = document.activeElement,
			allowFocusableElements = this.getData('ltPropAllowFocusableElements'),

			// This overrides everything
			preventNavigation = this.getData( 'ltPropPreventNavigation' );

		if( preventNavigation ) {
			return false;
		}

		if (!allowFocusableElements || !activeElement) {
			return true;
		}

		return currentActiveElement.matches(activeElement);
	}

    setVerticalCalloutPosition(width, offsets, doesBoxAndButtonLeftAlign) {
		var link = this.childComp,
		arrow = link.querySelector( '.lyteArrow' ),
		aWidth, tempMarginLeft, tempNum, tempDenom, tempPer;

		aWidth = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
		aWidth = parseFloat(aWidth ? aWidth : '0px');
		tempMarginLeft = window.getComputedStyle(arrow, ':before').marginLeft;
		tempMarginLeft = Math.abs(parseFloat(tempMarginLeft ? tempMarginLeft : '0px'));

		if( doesBoxAndButtonLeftAlign ) {
			tempNum = offsets.width / 2 - aWidth + tempMarginLeft; // We removed arrow.offsetWidth because it was giving width as 0 px
		} else {
			tempNum = width - (offsets.width / 2) - aWidth + tempMarginLeft; // We removed arrow.offsetWidth because it was giving width as 0 px
		}
		
		tempDenom = width / 100;
		tempPer = tempNum / tempDenom;

		arrow.style.left = tempPer + '%';
	}

    setHorizontalCalloutPosition(drop, offsets, doesBoxAndButtonTopAlign) {
		var link = this.childComp,
		arrow = link.querySelector( '.lyteArrow' ),
		aHeight, tempMarginTop, tempNum, tempDenom, tempPer;

		aHeight = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
		aHeight = parseFloat(aHeight ? aHeight : '0px');
		tempMarginTop = window.getComputedStyle(arrow, ':before').marginTop;
		tempMarginTop = Math.abs(parseFloat(tempMarginTop ? tempMarginTop : '0px'));

		if( doesBoxAndButtonTopAlign ) {
			tempNum = ((offsets.height / 2) - aHeight + tempMarginTop) * 100;
		} 
		else {
			tempNum = (drop.height - offsets.height / 2 - aHeight + tempMarginTop) * 100;
		}

		tempDenom = drop.height;
		tempPer = tempNum / tempDenom;
		arrow.style.top = tempPer + '%';
	}

    clearPositionValues() {
		var link = this.childComp;

		link.style.left = '';
		link.style.top = '';
		link.style.bottom = '';
		link.style.right = '';
	}

    setPositionFlags(primaryPosition, secondaryPosition) {
		this.setData( 'pos', primaryPosition );
		this.setData( 'secondaryPosition', secondaryPosition );
	}

    exceedsBottomBoundary(preferredPosition, offsets, drop, scopeBoundary) {
		if( preferredPosition !== 'right' && preferredPosition !== 'left' ) {
			return offsets.top + offsets.height + drop.height > scopeBoundary.bottom;
		}

		return offsets.top + drop.height > scopeBoundary.bottom;
		
	}

    exceedsTopBoundary(offsets, drop, scopeBoundary) {
		return offsets.top - drop.height < scopeBoundary.top;
	}

    findPrimaryVerticalPosition(preferredPosition, offsets, drop, scopeBoundary) {
		if( preferredPosition === 'down' ) {
			if( this.exceedsBottomBoundary( preferredPosition, offsets, drop, scopeBoundary ) && !this.exceedsTopBoundary( offsets, drop, scopeBoundary ) ) {
				return false
			}
			
			return true;
		}

		if( preferredPosition === 'up' ) {
			if( this.exceedsTopBoundary( offsets, drop, scopeBoundary ) && !this.exceedsBottomBoundary( preferredPosition, offsets, drop, scopeBoundary ) ) {
				return false;
			}
			
			return true;
		}
	}

    findSecondaryVerticalPosition(preferredPosition, offsets, drop, scopeBoundary) {
		if ( this.exceedsBottomBoundary( preferredPosition, offsets, drop, scopeBoundary ) ) {
			return false;
		}
		
		return true;
	}

    /**
	 * Set the CSS for your dropdown
	 * refer commit ID 583ee6ccbeaa6b3729178bf9df0139032b016d19 and previous for the previous stable setCSS function.
	 * commit ID 583ee6ccbeaa6b3729178bf9df0139032b016d19 also gives a better understanding about the hard coded values in this function.
	 */
    setCss(onlyScroll, useSave) {
		var link = this.childComp,

			// An indication that the dropdown has been opened recently and this setcss is called for the open
			isOpen = this.getData('call');

		if (!useSave) {
			this.setData('savedPositions', {});
		}

		if (!link
			|| link.classList.contains('lyteDropdownHidden')
		) {
			return;
		}

		this.clearPositionValues();
		// Get properties
		var callout = this.getData('ltPropCallout');


		// Get button
		var body = link,
			custom = this.$node.element,
			par = custom ? custom : this.$node.querySelector('lyte-drop-button');

		// Get Geometric propotions
		var save = this.getData('savedPositions'),
			drop = this.clone(body.getBoundingClientRect()),
			bodybcr = this.getDropBody(body).getBoundingClientRect(),
			x = window.pageXOffset || document.documentElement.scrollLeft,
			y = window.pageYOffset || document.documentElement.scrollTop,
			height = body.offsetHeight,
			width = body.offsetWidth,
			arrow = link.querySelector('.lyteArrow'),
			position = this.getData('ltPropPosition'),
			offsets = par.getBoundingClientRect(),
			isFF = this.isFF(),
			scopeBoundary = this.getScopeBoundary();

		if (this.data.ltPropAnimate) {
			this._hgt = this.data.ltPropAnimateBox ? drop.height : bodybcr.height;
			// this.getDropBody( body ).style.height = ( this._hgt ) + 'px';
		}


		// Adjusting width of the body is a one time thing. Atleast that is what we think.
		// Till the smoke clears around this issue we are going to hang on to onlyScroll
		// onlyScroll will probably be deprecated
		if (isOpen) {

			// Hack to prevent the mutation observer from getting fired
			// MutationObserver fired when i added a class attribute to the drop-item.
			// We have cases where it should fire when we add a class to the drop-item
			this._preventClass = true;
			this.scrollSel();

			if (!onlyScroll) {

				// Reset width for later usage
				width = this.adjustWidth(body, offsets.width, width);
				drop.width = width;

				// Set width of span.lyteArrow if there is no callout
				if (!callout) {
					arrow.style.width = offsets.width + 'px';
				}
			}
		}

		// Adding the not check here because it was causing the mutobserver to fire infinitely when resize occured.
		// When resized the dropdown would add the lyteDropBodyCallout again and this keeps happening over and over again.
		if (callout && !body.classList.contains('lyteDropBodyCallout')) {
			body.classList.add('lyteDropBodyCallout')
		}

		if (isFF && this.isBodyScrollable()) {
			this.addProperScrollbar();
		}
		else if (isFF && !this.isBodyScrollable()) {
			this.removeScrollbar();
		}

		// Intialize flags
		var downPos,
			rightPos,
			topPos,
			leftPos,
			rtl = window._lyteUiUtils.getRTL();


		// temp stores
		var tempLeft,
			aHeight,
			aWidth;

		if (position === 'down') {
			downPos = this.findPrimaryVerticalPosition( 'down', offsets, drop, scopeBoundary );

			rightPos = 0;

			// rightPos - 1 -> rtl or no space to the right -> align left
			// rightPos - 2 -> ltr or space available to the right -> align right
			// rightPos - 0/3 -> align to the right if ltr or to the left if rtl
			tempLeft = offsets.left;
			if (tempLeft + offsets.width - width > scopeBoundary.left) {
				rightPos = 1;
			}

			if (offsets.left + width <= scopeBoundary.right) {
				rightPos += 2;
			}

			if (rtl) {
				rightPos = !!(!(rightPos & 1 || !rightPos));
			}
			else {
				rightPos = !!(rightPos & 2 || !rightPos);
			}

			if (useSave && !window._lyteDropdown.isEmpty(save)) {
				rightPos = save.rightPos;
				downPos = save.downPos;
			}
			else if (useSave) {
				save.rightPos = rightPos;
				save.downPos = downPos;

				this.setData('savedPositions', save);
			}

			if (downPos) {
				if (callout) {
					this.setCorrectClass('lyteArrowTop');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aHeight = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					body.style.top = this.alignBoxTopToButtonBottom(par, offsets, y) + parseFloat(aHeight ? aHeight : '0px') + 'px';
				}
				else {
					body.style.top = this.alignBoxTopToButtonBottom(par, offsets, y) + 'px';
				}



			}
			else {

				if (callout) {
					this.setCorrectClass('lyteArrowBottom');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aHeight = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					body.style.bottom = this.setTopAboveForDown(par, body, offsets, drop, y) + parseFloat(aHeight ? aHeight : '0px') + 'px';
				}
				else {
					body.style.bottom = this.setTopAboveForDown(par, body, offsets, drop, y) + 'px';
				}


			}

			if (rightPos) {
				if (callout) {
					this.setVerticalCalloutPosition( width, offsets, true );
				}

				body.style.left = this.alignBoxToButtonLeft(par, offsets, x) + 'px';
			}
			else {
				if (callout) {
					this.setVerticalCalloutPosition( width, offsets, false );
				}

				body.style.right = this.setLeftExceedForDown(par, body, offsets, width, x) + 'px'
			}

			this.setPositionFlags( downPos ? 'down' : 'up', rightPos ? 'right' : 'left' );

		}
		else if (position === 'right') {
			rightPos = 0;
			if (offsets.left - drop.width > scopeBoundary.left) {
				rightPos = 1;

			}
			if (offsets.left + offsets.width + drop.width < scopeBoundary.right) {
				rightPos += 2;
			}

			if (rtl) {
				rightPos = !!(!(rightPos & 1 || !rightPos));
			}
			else {
				rightPos = !!(rightPos & 2 || !rightPos);
			}

			downPos = this.findSecondaryVerticalPosition( 'right', offsets, drop, scopeBoundary );

			if (useSave && !window._lyteDropdown.isEmpty(save)) {
				rightPos = save.rightPos;
				downPos = save.downPos;
			}
			else if (useSave) {
				save.rightPos = rightPos;
				save.downPos = downPos;

				this.setData('savedPositions', save);
			}

			if (rightPos) {

				if (callout) {
					this.setCorrectClass('lyteArrowLeft');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aWidth = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aWidth = parseFloat(aWidth ? aWidth : '0px');
					body.style.left = this.setLeftForRight(par, offsets, x) + aWidth + 'px'
				}
				else {
					body.style.left = this.setLeftForRight(par, offsets, x) + 'px'
				}
			}
			else {

				if (callout) {
					this.setCorrectClass('lyteArrowRight');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aWidth = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aWidth = parseFloat(aWidth ? aWidth : '0px');
					body.style.right = this.setRightForRight(par, body, offsets, width, x) + aWidth + 'px';
				}
				else {
					body.style.right = this.setRightForRight(par, body, offsets, width, x) + 'px';
				}
			}

			if (downPos) {
				if (callout) {
					this.setHorizontalCalloutPosition( drop, offsets, true );
				}

				body.style.top = this.setTopForRight(par, offsets, y) + 'px'
			}
			else {
				if (callout) {
					this.setHorizontalCalloutPosition( drop, offsets, false );
				}

				body.style.bottom = this.setTopForRightAbove(par, body, offsets, drop, y) + 'px'
			}

			this.setPositionFlags( rightPos ? 'right' : 'left', downPos ? 'down' : 'up' );

		}
		else if (position === 'up') {
			topPos = this.findPrimaryVerticalPosition( 'up', offsets, drop, scopeBoundary );

			rightPos = 0
			if (offsets.left + offsets.width - width > scopeBoundary.left) {
				rightPos = 1;
			}
			if (offsets.left + width <= scopeBoundary.right) {
				rightPos += 2;
			}

			if (rtl) {
				rightPos = !!(!(rightPos & 1 || !rightPos));
			}
			else {
				rightPos = !!(rightPos & 2 || !rightPos);
			}

			if (useSave && !window._lyteDropdown.isEmpty(save)) {
				rightPos = save.rightPos;
				topPos = save.topPos;
			}
			else if (useSave) {
				save.rightPos = rightPos;
				save.topPos = topPos;

				this.setData('savedPositions', save);
			}

			if (topPos) {

				if (callout) {
					this.setCorrectClass('lyteArrowBottom');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aHeight = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aHeight = parseFloat(aHeight ? aHeight : '0px');
					body.style.bottom = this.setTopAboveForDown(par, body, offsets, drop, y) + aHeight + 'px';
				}
				else {
					body.style.bottom = this.setTopAboveForDown(par, body, offsets, drop, y) + 'px';
				}
			}
			else {

				if (callout) {
					this.setCorrectClass('lyteArrowTop');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aHeight = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aHeight = parseFloat(aHeight ? aHeight : '0px');
					body.style.top = this.alignBoxTopToButtonBottom(par, offsets, y) + aHeight + 'px';
				}
				else {
					body.style.top = this.alignBoxTopToButtonBottom(par, offsets, y) + 'px'
				}
			}
			if (rightPos) {
				if (callout) {
					this.setVerticalCalloutPosition( width, offsets, true );
				}

				body.style.left = this.alignBoxToButtonLeft(par, offsets, x) + 'px';
			}
			else {
				if (callout) {
					this.setVerticalCalloutPosition( width, offsets, false );
				}

				body.style.right = this.setLeftExceedForDown(par, body, offsets, width, x) + 'px';
			}

			this.setPositionFlags( topPos ? 'up' : 'down', rightPos ? 'right' : 'left' );

		}
		else if (position === 'left') {
			leftPos = 0;

			if (offsets.left + offsets.width + width < scopeBoundary.right) {
				leftPos = 1;
			}
			if (offsets.left - width > scopeBoundary.left) {
				leftPos += 2;
			}

			if (rtl) {
				leftPos = !!(!(leftPos & 1 || !leftPos));
			}
			else {
				leftPos = !!(leftPos & 2 || !leftPos);
			}

			downPos = this.findSecondaryVerticalPosition( 'left', offsets, drop, scopeBoundary );

			if (useSave && !window._lyteDropdown.isEmpty(save)) {
				leftPos = save.leftPos;
				downPos = save.downPos;
			}
			else if (useSave) {
				save.leftPos = leftPos;
				save.downPos = downPos;

				this.setData('savedPositions', save);
			}

			if (leftPos) {

				if (callout) {
					this.setCorrectClass('lyteArrowRight');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aWidth = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aWidth = parseFloat(aWidth ? aWidth : '0px');
					body.style.right = this.setRightForRight(par, body, offsets, width, x) + aWidth + 'px';
				}
				else {
					body.style.right = this.setRightForRight(par, body, offsets, width, x) + 'px';
				}
			}
			else {

				if (callout) {
					this.setCorrectClass('lyteArrowLeft');

					// layout thrashing happens here
					// Removing layout thrashing causes a jitter
					aWidth = window.getComputedStyle(arrow, ':before').getPropertyValue('border-left-width');
					aWidth = parseFloat(aWidth ? aWidth : '0px');
					body.style.left = this.setLeftForRight(par, offsets, x) + aWidth + 'px';
				}
				else {
					body.style.left = this.setLeftForRight(par, offsets, x) + 'px';
				}
			}

			if (downPos) {
				if (callout) {
					this.setHorizontalCalloutPosition( drop, offsets, true );
				}

				body.style.top = this.setTopForRight(par, offsets, y) + 'px';
			}
			else {
				if (callout) {
					this.setHorizontalCalloutPosition( drop, offsets, false );
				}

				body.style.bottom = this.setTopForRightAbove(par, body, offsets, drop, y) + 'px';
			}

			this.setPositionFlags( leftPos ? 'left' : 'right', downPos ? 'down' : 'up' );

		}

		body.__height = height;
	}

    getScopeBoundary() {
		var scope = this.getData('ltPropScope'),
			element,
			res = {
				left: 0,
				top: 0,
				right: window.innerWidth,
				bottom: window.innerHeight
			}, boundingRects;

		if (scope !== 'window') {
			element = $L(this.$node).closest(scope).get(0);

			if (element) {
				boundingRects = element.getBoundingClientRect();

				return {
					left: Math.max(0, boundingRects.left),
					top: Math.max(0, boundingRects.top),
					right: Math.min(window.innerWidth, boundingRects.right),
					bottom: Math.min(window.innerHeight, boundingRects.bottom)
				};
			}
		}

		return res;
	}

    setFreezeLayer() {
		var node = document.getElementById('lytedropdownfreezelayer'),
			scrollsToPrevent = this.getData('ltPropPreventScroll');

		if (scrollsToPrevent === 'all') {
			node.style.display = 'block';
			node.classList.add('lyteDropdownZIndex');
		}

		document.body.classList.add('lyteBodyWrapper');
	}

    isInView(element) {
		var body = this.getDropBody(this.childComp),
			containerScrollTop = body.scrollTop,
			containerHeight = body.offsetHeight,
			elementTop = element.offsetTop,
			elementHeight = element.offsetHeight;

		return elementTop >= containerScrollTop && elementTop + elementHeight <= containerScrollTop + containerHeight;
	}

    moveIntoView(element) {
		var body = this.getDropBody(this.childComp),
			containerScrollTop = body.scrollTop,
			elementTop = element.offsetTop;

		if (elementTop <= containerScrollTop) {
			this.moveDown(element);
		}
		else {
			this.moveUp(element);
		}
	}

    moveDown(element) {
		var body = this.getDropBody(this.childComp);

		body.scrollTop = this.isFirstItem( element ) ? 0 : element.offsetTop;
	}

    moveUp(element) {
		var body = this.getDropBody(this.childComp);

		body.scrollTop = element.offsetTop + element.offsetHeight - body.offsetHeight
	}

    scrollIntoView(element, move) {
		var parent = this.getDropBody(this.childComp),
			offsetTop = element.offsetTop,
			scrollT = parent.scrollTop,
			height = parent.getBoundingClientRect().height,
			elementHeight = element.getBoundingClientRect().height;

		if (!parent.contains(element)) {
			// There can be elements inside lyte-drop-footer. So we only scroll to elements inside the body
			return;
		}

		if (!this.isInView(element)) {
			this.moveIntoView(element);
		}
	}

    open() {
		var that = this, link,
			type = this.getData('ltPropType'),
			head = this.getData('drophead'),
			mul = this.getData('multiple'),
			freeze = this.getData('ltPropFreeze'),
			hover = this.getData('ltPropHover');

		link = this.childComp = this.$node.querySelector('lyte-drop-box');

		this.closeError(link, head);
		this.hideNodes();

		if (
			type === 'multisearch'
			&& head !== 'yield'
		) {
			$L(this.$node.querySelector('.lyteDropdownTextField')).search({
				scope: link,
				trim: this.getData( 'ltPropTrimSearchText' ),
				searchDelay: undefined,
				hiddenSelector: ".lyteDropdownActive",
				search: 'lyte-drop-item',
				related: 'lyte-drop-group',
				onSearch: function (res, event, value) {
					var i = 0, lk = that.childComp,
						body = that.getDropBody(lk),
						div = body.querySelector('.lyteDropdownNoResult'),
						text = that.getData('ltPropNoResult'), ret;

					if (that.getMethods('onSearch')) {
						ret = that.executeMethod('onSearch', res, event, value, that);
					}

					if (ret === false) {
						return ret;
					}

					body.scrollTop = 0;

					for (; i < res.length; i++) {
						if (!res[i].classList.contains('lyteDropdownActive')) {
							if (div) {
								div.style.display = 'none';
							}

							that.toggleCurrent(res[i], body);

							return;
						}
					}

					if (div.style.display !== 'none') {
						return;
					}

					if (text) {
						div.style.display = 'block';
					}
				}
			});
		}

		link.origindd = this.$node;
		window._lyteUiUtils.appendChild(document.body, link);
		link.classList.remove('lyteDropdownHidden');

		this.preventParentScroll();

		if (freeze && !mul && !hover) {
			this.setFreezeLayer()
		}

	}

    preventParentScroll() {

		if (!this.getData('ltPropPreventParentScroll')) {
			return;
		}

		var parents = $L(this.$node).parents(), scrollableParents, lyteScrollBarParents, that = this;

		scrollableParents = parents.filter(this.isScrollable);
		lyteScrollBarParents = parents.filter(this.isLyteScrollBar);

		lyteScrollBarParents = lyteScrollBarParents.map(function (index, item) {
			return item.parentNode;
		});

		scrollableParents.each(function (index, item) {
			$L(item).data('lyte-scrollTop', item.scrollTop);
			$L(item).data('lyte-scrollLeft', item.scrollLeft);
		});

		this.scrollableParents = scrollableParents;
		this.lyteScrollBarParents = lyteScrollBarParents;

		this.scrollableParents.on('scroll', this.resetScroll);
		this.scrollableParents.on( 'wheel', this.preventDefaultBehaviour );
		this.scrollableParents.on( 'touchmove', this.preventDefaultBehaviour );


		this.lyteScrollBarParents.each(function (index, item) {
			if (item) {
				item.addEventListener('touchmove', that.disableLyteScrollBar, true);
				item.addEventListener('wheel', that.disableLyteScrollBar, true);
			}
		});

		document.body.classList.add('lyteBodyWrapper');
	}

    disableLyteScrollBar(event) {
		event.stopPropagation();
	}

    isScrollable(index, item) {
		var overflowY = $L(item).css('overflow-y'),
			overflowX = $L(item).css('overflow-x');

		if ((item.clientWidth < item.scrollWidth && (overflowX === 'auto' || overflowX === 'scroll')) || (item.clientHeight < item.scrollHeight && (overflowY === 'auto' || overflowY === 'scroll'))) {
			return true;
		}

		return false;
	}

    isLyteScrollBar(index, item) {
		return item.classList.contains('lyteScrollBar');
	}

    resetScroll() {
		var scrollTop = $L(this).data('lyte-scrollTop'),
			scrollLeft = $L(this).data('lyte-scrollLeft');

		this.scrollTop = scrollTop;
		this.scrollLeft = scrollLeft;
	}

    preventDefaultBehaviour(event) {
		event.preventDefault();
	}

    hideNodes() {
		var link = this.childComp, selected, i = 0, item,
			mul = this.getData('multiple'),
			type = this.getData('ltPropType'),
			head = this.getData('drophead'),
			sel = this.getData('ltPropSelected');

		// Hide the filtered items in the dropdown list
		if (mul && sel && sel.length > 2) {
			if (!link) {
				return;
			}

			try {
				selected = JSON.parse(this.getData('ltPropSelected') || '[]');
			}
			catch (err) {
				console.error('Unable to parse ltPropSelected', err);
				return;
			}

			// Hide new selected values

			var all_elems = this.getAllItems(link);

			for (; i < selected.length; i++) {
				item = this.getItem(all_elems, selected[i]);
				// item = link.querySelector('[data-value="'+ window._lyteUiUtils.escape( selected[ i ] ) +'"]');
				if (item) {
					item.classList.add('lyteDropdownActive');
					this.hideGroup(item);
					this.setData('preventSel', true);
					item.setAttribute('selected', true);
					this.setData('preventSel', false);
				}
			}
		}

		this.showError(link, type, head);
	}

    showNodes(change) {
		var i = 0, j, olen, elm, res,
			link = this.childComp,
			body = this.getDropBody(link),
			mul = this.getData('multiple'),
			type = this.getData('ltPropType'),
			head = this.getData('drophead'),
			all = this.getData('ltPropSelectedList') || [],
			sysValue = this.getData('sysValue'),
			nv = change.newValue,
			ov = change.oldValue;

		if (!mul) {
			return;
		}

		// if link doesn't make sense here: TODO
		if (link) {
			res = body.querySelector('.lyteDropdownNoResult');
		}

		try {
			// Convert to string for obvious reasons
			nv = JSON.parse(nv || '[]').map(function (val) {
				return '' + val;
			});

			// Convert to string for obvious reasons
			ov = JSON.parse(ov || '[]').map(function (val) {
				return '' + val;
			});
		}
		catch (err) {
			console.error('Unable to parse ltPropSelected', err);
			return;
		}

		olen = ov.length;

		var all_elems = this.getAllItems(link);

		for (; i < olen; i++) {
			if (nv.indexOf(ov[i]) === -1) {
				if (link) {
					// elm = link.querySelector( '[data-value="' + window._lyteUiUtils.escape( ov[ i ] ) + '"]' );
					elm = this.getItem(all_elems, ov[i]);

					// show items in dropbox
					if (elm) {
						elm.classList.remove('lyteDropdownActive');
						this.showGroup(elm);
						this.setData('preventSel', true);
						elm.removeAttribute('selected');
						this.setData('preventSel', false);

					}
				}


				// remove items from head
				this.setData('preventSelListObs', true);

				for (j = 0; j < all.length; j++) {
					if (('' + all[j][sysValue]) === ov[i]) {
						this.$addon.arrayUtils(all, 'removeAt', j, 1);
						break;
					}
				}

				this.setData('preventSelListObs', false);

				// May need to add a check to see if the dropdown is open
				if (res
					&& ((type === 'multisearch' && head !== 'yield')
						|| type === 'multiple')
				) {
					res.style.display = 'none';
				}
			}
		}
	}

    toggleDropdownClass() {
		var node = this.$node,
			sel = this.getData('ltPropSelected') || '[]',
			isMultiple = this.getData('multiple');

		if (!isMultiple) {
			return;
		}

		sel = JSON.parse(sel);

		if (sel.length > 0) {
			node.classList.remove('lyteDropNoOptSelected')
		}
		else {
			node.classList.add('lyteDropNoOptSelected');
		}
	}

    first() {
		var type = this.getData('ltPropType');

		this.setData('ltPropShow', true);
		this.setData('ltPropIsOpen', true);
		this.open();

		if (type === 'multisearch') {
			this.focusInput();
		}

		this.setBoxStyles();
	}

    subsequent(link, freeze, mul, hover) {
		var type = this.getData('ltPropType'),
			head = this.getData('drophead');

		this.setData('ltPropIsOpen', true);
		link.classList.remove('lyteDropdownHidden');

		this.preventParentScroll();

		if (freeze && !mul && !hover) {
			this.setFreezeLayer()
		}

		if (type === 'multisearch') {
			this.focusInput();
		}

		this.closeError(link, head);
		this.showError(link, type, head);

		this.setBoxStyles();
	}

    setBoxStyles() {
		var manual = this.getData('ltPropSetPos'),
			dropbox = this.getDropBox();

		if (manual
			|| !dropbox || dropbox.classList.contains('lyteDropdownHidden')
		) {
			return;
		}

		this.prerequisites();
	}

    /**
	 * This invokes the beforeShow method but with a twist
	 * You can now return promises which open the dropdown only when they are resolved
	 * @param {Event} event - The event
	 * @param {boolean} fromTg - Whether it is from the toggle function
	 *
	 *
	 */

    beforeShow(event, fromTg, first) {
		var res, that = this, link = this.getDropBox(),
			freeze = this.getData('ltPropFreeze'),
			mul = this.getData('multiple'),
			hover = this.getData('ltPropHover');

		res = this.executeMethod('onBeforeShow', event, this);

		if (res && res.then) {

			window._lyteDropdown.lastDropdownWithAPromise = this.$node;
			this.setData('blockShowHide', true);

			res
				.then(function (arg) {
					that.setData('blockShowHide', false);

					if (that.isNotLastDropdownWithPromise()) {
						return;
					}

					that.setData('call', fromTg ? true : event);

					if (first) {
						that.first();
					}
					else {
						that.subsequent(link, freeze, mul, hover);
					}
				})
				.catch(function (err) {
					that.setData('blockShowHide', false);
					link.removeAttribute('lyte-hidden');
					console.error(err);
				});
		}
		else if (res !== false) {
			that.setData('call', fromTg ? true : event);
			if (first) {
				that.first();
			}
			else {
				that.subsequent(link, freeze, mul, hover);
			}
		}
		else if (res === false) {
			link.removeAttribute('lyte-hidden');
		}
	}

    // Don't change this fn name because thangagiri/anantha(in lyte-tags) is using it to get the dropbox in one of his components.
    getDropBox() {
		var box = this.childComp;

		if (!box) {
			box = this.$node.querySelector('lyte-drop-box');
		}

		return box;
	}

    isNotLastDropdownWithPromise() {
		var lastDropdown = window._lyteDropdown.lastDropdownWithAPromise;

		return this.$node !== lastDropdown;
	}

    /**
	 * Show the error div when one of the elements get removed
	 * @param link - the drop box
	 * @param head -  the dropdown's head
	 *
	 */

    closeError(link, head) {
		var body = this.getDropBody(link),
			result = body.querySelector('.lyteDropdownNoResult'),
			type = this.getData('ltPropType');

		if (
			result
			&& ((head !== 'yield' && type === 'multisearch')
				|| (type === 'multiple'))

		) {
			result.style.display = 'none';
		}
	}

    /**
	 * Check if the number of selected items has crossed the limit
	 * @param {Number} extra - The extra items to be added to the selected list
	 * @returns {Boolean} - true if it does
	 *
	 */

    checkLimit(extra) {
		var type = this.getData('ltPropType'),
			max = this.getData('ltPropMaxCount'),
			sel = this.getData('ltPropSelected'),
			arr, count;

		if (type !== 'multiple'
			&& type !== 'multisearch'
		) {
			return;
		}

		arr = JSON.parse(sel || '[]'),
			count = arr.length + extra;

		if (max > 0 && count > max) {
			return true;
		}
	}

    /**
	 * Find the data-values of nodes that are going to be removed
	 * @param {sel} - The current selected
	 * @param {Array} nodes - An array of HTMLElements that are going to be removed
	 * @return {Object} - Object containing two keys => removed representing the nodes that are getting removed and selected which represents the current selected
	 *
	 */

    findMarked(sel, nodes) {
		var i, ind, removed = [],
			len = nodes.length;

		try {
			sel = JSON.parse(sel || '[]').map(function (val) {
				return '' + val;
			});
		}
		catch (er) {
			console.error('Unable to parse ltPropSelected', er);
		}

		// Unfortunately sortable can change the order of selected values
		for (i = 0; i < len; i++) {
			ind = sel.indexOf(nodes[i].getAttribute('data-value'));
			removed = removed.concat(sel.splice(ind, 1));
		}

		return {
			removed: removed,
			selected: sel
		};
	}

    /**
	 * Remove the marked values
	 * @param sel - The current selected
	 * @param nodes - nodes that are going to be removed
	 * @param head - whether the content was yielded or not
	 *
	 */

    removeMarked(sel, nodes, head, link) {
		var len = nodes.length,
			i, j, all = this.getData('ltPropSelectedList') || [],
			sysValue = this.getData('sysValue'),
			body, node;

		this.setData('preventSelListObs', true);

		for (i = 0; i < len; i++) {
			for (j = 0; j < all.length; j++) {
				if (('' + all[j][sysValue]) == nodes[i].getAttribute('data-value')) {
					this.$addon.arrayUtils(all, 'removeAt', j);
					break;
				}
			}
		}

		this.setData('preventSelListObs', false);

		body = this.getDropBody(link);

		var all_elems = this.getAllItems(body);

		for (i = 0; i < nodes.length; i++) {
			// node = body.querySelector( '[data-value="'+ window._lyteUiUtils.escape( nodes[ i ].getAttribute( 'data-value' ) ) +'"]' );
			node = this.getItem(all_elems, nodes[i].getAttribute('data-value'));
			if (node) {
				node.classList.remove('lyteDropdownActive');
				node.classList.remove('lyteSearchHidden');
				this.showGroup(node);
				node.removeAttribute('selected');
			}
		}

		this.fixSearchResults();

		this.setData('prev', true);
		this.setData('ltPropSelected', JSON.stringify(sel));
		this.setData('prev', false);

	}

    fixSearchResults() {
		var input = this.$node.querySelector('lyte-search') || this.$node.querySelector('input');

		if (input && input.setValue) {
			input.setValue(input.value || '');
		}
	}

    removeAll(event) {
		var drop = this.$node,
			link = this.childComp,
			head = this.getData('drophead'),
			button = drop.querySelector('lyte-drop-button'),
			nodes = button.querySelectorAll('.lyteDropMark'),
			oldSelected = this.getData('ltPropSelected'),
			sel = this.getData('ltPropSelected'),
			proper, changeObj, ret;

		if (this.getData('ltPropReadOnly')) {
			return;
		}

		changeObj = this.findMarked(sel, nodes);

		proper = this.getData('isKeyDown') ? 'keydown' : 'click';

		// Intentionally sending false because we are already passing in an array
		ret = this.beforeRemove(event, changeObj.removed, proper, nodes);

		if (ret) {
			// Don't know why exactly this is here
			// event.stopPropagation();
			return;
		}

		this.removeMarked(changeObj.selected, nodes, head, link);

		this.closeError(link, head);

		if (this.getMethods('onRemove')) {
			this.executeMethod('onRemove', event, changeObj.removed, this.getData('ltPropSelected'), this, proper, nodes);
		}

		this.fixBoxPosition();

		this.fireOnChange(oldSelected, event, nodes);

		// Don't know why exactly this is here
		// event.stopPropagation();
	}

    /**
	 * Returns true when current clicked node and previous selected node( only 1 ) are same or one of the previous selected nodes is behind. Else returns false
	 *
	 * @param cur - currently selected node
	 */

    relativePosition(cur, prev) {
		var iterator = cur;

		// When the current selected element and the previous selected element is the same
		if (prev.length === 1 && prev[0] === cur) {
			return true;
		}

		// Loop through previous elements to check if it is present
		while ((iterator = iterator.previousElementSibling)) {
			if (iterator.getAttribute('lyte-last')) {
				return true;
			}
		}

		return false;
	}

    shade(node) {
		var front, iterator,
			// There can be dropdowns within dropdown - this guarantees the first button is selected
			present = this.$node
				.querySelector('lyte-drop-button')
				.querySelectorAll('.lyteDropMark');

		// Don't process when a there are more than 1 selected items and the user clicks on one of the selected items
		if (present.length > 1 && node.classList.contains('lyteDropMark')) {
			return;
		}

		iterator = (present.length === 0 || this.relativePosition(node, present)) ? 'previousElementSibling' :
			'nextElementSibling';

		do {
			node.classList.add('lyteDropMark');
		} while ((node = node[iterator])
			&& !node.getAttribute('lyte-last'));
	}

    fireCheckKey() {
		var node = this.$node;

		node.component.checkKey(window.event);
	}

    fireOnChange(oldValue, event, item) {
		var newValue = this.getData('ltPropSelected');

		if (this.hasValueChanged(oldValue) && this.getMethods('onChange')) {
			this.executeMethod('onChange', event, newValue, this, item);
		}
	}

    hasValueChanged(oldValue) {
		var newValue = this.getData('ltPropSelected'),
			isMultiSelects = this.getData('multiple');

		if (isMultiSelects) {
			oldValue = this.stringifyALS(oldValue);
			newValue = this.stringifyALS(newValue);

			// differently ordered selected values are considered different.
			return oldValue !== newValue;
		}
		else {
			return oldValue !== newValue;
		}
	}

    stringifyALS(arrayLikeString) {
		arrayLikeString = arrayLikeString || '[]';

		arrayLikeString = JSON.parse(arrayLikeString).map(function (item) {
			return '' + item;
		});

		return JSON.stringify(arrayLikeString);
	}

    mark(node, shift, single) {



		// When shift is pressed
		if (shift) {
			window._lyteDropdown.unmark(this);
			this.shade(node);
		}
		// When command or control is pressed
		else if (single) {
			window._lyteDropdown.unmark(this);
			node.classList.add('lyteDropMark');
		}
		// When none of the modifier keys are pressed
		else {
			window._lyteDropdown.unmark();
			node.classList.add('lyteDropMark');
		}

		this.setLast(node);
	}

    beforeSelect(event, item) {
		var selected = this.getData('ltPropSelected'), ret = true,
			value = item.getAttribute('data-value');

		if (this.getMethods('beforeSelect')) {
			ret = this.executeMethod('beforeSelect', event, selected, this, item, value);
			ret = ret === false ? false : true;
		}

		return ret;
	}

    /**
	 * This function is going to focus the input in the dropdown when
	 * an item is selected from the multiselect list
	 * an item is removed from the selected list
	 *
	 */

    focusInput() {
		var inp;

		// People have search inside the drop-box in multisearch
		if (!window._lyteUiUtils.isMobile) {
			$L.fastdom.measure(function () {

				if (!this.$node) {
					return;
				}

				var inp = this.$node.querySelector('input');

				if (inp) {
					inp.focus();
				}
			}, this);
		}
		else {
			inp = this.$node.querySelector('input');

			if (inp) {
				inp.focus();
			}
		}
	}

    /**
	 * This is going to show the no result div
	 * @param {Element} link - The drop-box element
	 * @param {String} type - The dropdown type
	 * @param {String} head - Whether the head is an yield or not
	 *
	 */

    showError(link, type, head) {
		var body = this.getDropBody(link),
			nodes = body.querySelectorAll('lyte-drop-item:not(.lyteDropdownActive):not(.lyteSearchHidden)'),
			res, text = this.getData('ltPropNoResult');

		if (
			text
			&& nodes.length === 0
			&& (res = body.querySelector('.lyteDropdownNoResult'))
			&& ((type === 'multisearch' && head !== 'yield') || (type === 'multiple'))
		) {
			res.style.display = 'block';
		}
	}

    /**
	 * This is going to decide whether to remove or to not remove the current item from the multiselect
	 * @param {Event} event - The event object
	 * @param {String/Array} src - An array or the single data-value getting removed
	 * @param {String} proper - The event which triggered the remove function
	 * @param {Element/Array} node - An array or the single item getting removed
	 * @returns {Boolean} - true to prevent it from getting removed
	 *
	 */

    beforeRemove(event, src, proper, node) {
		var ret;

		if (this.getMethods('onBeforeRemove')) {
			ret = this.executeMethod('onBeforeRemove', event, src, this.getData('ltPropSelected'), this, proper, node);

			ret = ret != false ? false : true;
		}

		return ret;
	}

    /**
	 * This invokes a method which is going to decide whether to add the item into the multiselect or not
	 * @param {Event} event - The event object
	 * @param {Element} elm - The element that was selected
	 * @param {String} src - Its data-value
	 * @returns {Boolean/Object} - returning prevents the element from being selected
	 *
	 */

    beforeAdd(event, elm, src) {
		var preventAddition;

		if (this.getMethods('onBeforeAdd')) {
			preventAddition = this.executeMethod('onBeforeAdd', event, src, this.getData('ltPropSelected'), this, elm);
		}

		if (this.isPromise(preventAddition)) {
			return preventAddition;
		}

		preventAddition = preventAddition != false ? false : true;

		return preventAddition;
	}

    /**
	 * This is going to invoke the beforeHide callback and tell us whether the dropbody should be hidden or not
	 * @param {Event} event - The invoked event object
	 *
	 *
	 */

    beforeHide(link, event, freeze) {
		var res = false;

		if (this.getMethods('onBeforeHide')) {
			res = this.executeMethod('onBeforeHide', event, this);
			if (res && res.then) {
				res
					.then(function () {
						this.closeDrop(link, event, freeze);
					}.bind(this, link, event, freeze))
					.catch(function (err) {
						console.error(err);
					});

				return true;
			}
			res = res != false ? false : true;
		}

		return res;
	}

    // Hidden Method
    beforeScrollClose(event) {
		if (this.getMethods('onBeforeScrollClose')) {
			this.executeMethod('onBeforeScrollClose', event);
		}
	}

    // Hidden Method
    beforeScrollOpen(event) {
		if (this.getMethods('onBeforeScrollOpen')) {
			this.executeMethod('onBeforeScrollOpen', event);
		}
	}

    /**
	 * This is going to set the highlight element of the dropdown
	 * @param {NodeList} elems - All the lyte-drop-items to be traversed
	 * @param {Element} node - Current selected drop-item
	 *
	 */

    setHighlight(elems, node) {
		var i = 0, j, k;

		for (; i < elems.length; i++) {
			if (elems[i].classList.contains('lyteDropdownSelection')) {
				break;
			}
		}

		if (elems[i] && elems[i] === node) {

			k = j = i;
			i = window._lyteDropdown.find(elems, i + 1, true);



			if (i != elems.length) {
				elems[i].classList.add('lyteDropdownSelection');
				this.getActiveElement().setAttribute('aria-activedescendant', elems[i].getAttribute('id'));
			}
			else {
				j = window._lyteDropdown.find(elems, j - 1, false);

				if (j != -1) {
					elems[j].classList.add('lyteDropdownSelection');
					this.getActiveElement().setAttribute('aria-activedescendant', elems[j].getAttribute('id'));
				}
			}

			elems[k].classList.remove('lyteDropdownSelection');
		}

	}

    /**
	 * Sets the current node as the last selected node
	 * so that subsequent selections can proceed from this node ( Also removes the previous last)
	 *
	 * @param node - the node which is going to be the last node that is getting set
	 */

    setLast(node) {
		var prev = document.querySelector('[lyte-last="true"]');

		if (prev) {
			prev.removeAttribute('lyte-last');
		}

		node.setAttribute('lyte-last', true);
	}

    /**
	 * This is going to invoke the onOptionSelected callback
	 * @param {Event} event - The event object
	 * @param {string} sel - The current selected value
	 * @param {Element} elm - The lyte-drop-item that was selected
	 *
	 */

    optCall(event, sel, elm) {
		if (this.getMethods('onOptionSelected')) {
			this.executeMethod('onOptionSelected', event, sel, this, elm);
		}
	}

    /**
	 * Function to set the first value as lt-prop-selected
	 *
	 */

    setInitialSelected(options) {
		this.setSelectedFromOptions( options );
	}

    setSelectedList() {
		var sel = this.getData('ltPropSelected'),
			selected, selectedList;

		if (!sel) {
			return;
		}

		try {
			selected = JSON.parse(sel || '[]').map(function (val) {
				return '' + val;
			});
		}
		catch (err) {
			console.error('Could not parse ltPropSelected', err);
			return;
		}

		this.buildList(selected);
	}

    buildList(selected) {
		this.setData('preventSelListObs', true);

		for (var i = 0; i < selected.length; i++) {
			if (this.isPresentInList(selected[i])) {
				continue;
			}

			if (this.isOptionsGiven()) {
				this.buildWithOptions(selected[i]);
			}
			else {
				this.buildManually(selected[i]);
			}
		}

		this.setData('preventSelListObs', false);
	}

    isPresentInList(sel) {
		var list = this.getData('ltPropSelectedList') || [],
			sysValue = this.getData('sysValue');

		for (var i = 0; i < list.length; i++) {
			if (('' + list[i][sysValue]) === sel) {
				return true;
			}
		}

		return false;
	}

    isOptionsGiven() {
		var userValue = this.getData('ltPropUserValue'),
			sysValue = this.getData('ltPropSystemValue')

		return userValue || sysValue;
	}

    buildWithOptions(selected) {
		var options = this.getData('ltPropOptions') || [],
			sysValue = this.getData('sysValue'), selectedObj, i = 0;

		while (i < options.length && !selectedObj) {
			if (this.isOptGroup(options[i])) {
				selectedObj = this.getSelectedFromGroup(options[i], selected);
			}
			else if (('' + options[i][sysValue]) === selected) {
				// TODO: Check if same object needs to be pushed or a cloned object needs to be pushed.
				selectedObj = options[i];
			}

			i++;
		}

		if (selectedObj) {
			this.$addon.arrayUtils(this.getData('ltPropSelectedList'), 'push', selectedObj);
		}
	}

    isOptGroup(option) {
		var keys = Object.keys(option),
			length = keys.length;

		return keys.length === 1 && Array.isArray(option[keys[0]]);
	}

    getSelectedFromGroup(group, selected) {
		var key = Object.keys(group)[0],
			sysValue = this.getData('sysValue');

		group = group[key] || [];

		for (var i = 0; i < group.length; i++) {
			if (('' + group[i][sysValue]) === selected) {
				return group[i];
			}
		}
	}

    buildManually(selected) {
		var link = this.childComp,
			parent = link ? link : this.$node.querySelector('lyte-drop-box'),
			element = this.getItem(this.getAllItems(parent), selected),
			// element = parent.querySelector( '[data-value="' + window._lyteUiUtils.escape( selected ) + '"]' ),
			obj = {
				value: selected,
				display: (element || {}).textContent
			};

		if (!obj.display) {
			return;
		}

		this.$addon.arrayUtils(this.getData('ltPropSelectedList'), 'push', obj);
	}

    disableClickableItem(tab) {
		var type = this.getData('ltPropType');

		if (type === 'multisearch') {
			tab = this.getClickableItem(tab);
		}

		if (tab && tab.classList) {
			tab.classList.add('lyteDropdown-disabled');
		}

		this.$node.classList.add('lyteDropdownDisabled');
	}

    enableClickableItem(tab) {
		var type = this.getData('ltPropType');

		if (type === 'multisearch') {
			tab = this.getClickableItem(tab);
		}

		if (tab && tab.classList) {
			tab.classList.remove('lyteDropdown-disabled');
		}

		this.$node.classList.remove('lyteDropdownDisabled');
	}

    getClickableItem(tab) {
		var head = this.getData('drophead');

		if (head === 'noyield') {
			return window._lyteDropdown.traverse(tab, ['HTML', 'LYTE-DROP-BUTTON']);
		}
		else {
			return this.$node.querySelector('.lyteDummyEventContainer');
		}


	}

    hideGroup(item) {
		var group = $L(item).parent(), visibleItems;

		if (!group.get(0) || group.get(0).tagName !== 'LYTE-DROP-GROUP') {
			return;
		}

		visibleItems = this.getVisibleItems(group);

		if (visibleItems.length === 0) {
			group.addClass('lyteDropdownHideGroup');
		}
	}

    showGroup(item) {
		var group = $L(item).parent(), visibleItems;

		if (!group.get(0) || group.get(0).tagName !== 'LYTE-DROP-GROUP') {
			return;
		}

		visibleItems = this.getVisibleItems(group);

		if (visibleItems.length > 0) {
			group.removeClass('lyteDropdownHideGroup');
		}
	}

    getVisibleItems(group) {
		return group.find('lyte-drop-item:not(.lyteDropdownActive):not(.lyteSearchHidden)');
	}

    setSelectedFromList(isDidConnect) {
		var isMultiple = this.getData('multiple'),
			list, selected, sysValue = this.getData('sysValue'),
			selstr = this.getData('ltPropSelected');

		if (!isMultiple) {
			return;
		}

		list = this.getData('ltPropSelectedList') || [];

		if (isDidConnect
			&& !this.calculateSelected
		) {
			return;
		}

		selected = [];

		for (var i = 0; i < list.length; i++) {
			selected.push('' + list[i][sysValue]);
		}

		this.prevSelectedList = true;
		this.setData('ltPropSelected', JSON.stringify(selected));
		this.prevSelectedList = false;
		this.toggleDropdownClass();
	}

    executeKeyNavigationCallback(item) {
		// Hiding this for now because we don't know it will be useful for anyone outside UI components
		if (this.getMethods('onKeyNavigation')) {
			this.executeMethod('onKeyNavigation', this, item);
		}
	}

    isInputEmpty(input) {
		if (input.tagName === 'LYTE-SEARCH') {
			input = input.querySelector('input');
		}

		if (input && input.value === '') {
			return true;
		}

		return false;
	}

    fixBoxPosition() {
		var shouldUseSave = this.getData('ltPropFixPositionOnOpen');

		this.setCss(true, shouldUseSave);
	}

    showHide(event, eventtype, fromTg) {
		var link = this.childComp,
			freeze = this.getData('ltPropFreeze'),
			mul = this.getData('multiple'),
			type = this.getData('ltPropType'),
			hover = this.getData('ltPropHover'),
			rm = this.getData('ltPropRemoveMultiple'),
			show = this.getData('ltPropShow'), res, cur,
			blockShowHide = this.getData('blockShowHide'),
			isReadOnly = this.getData('ltPropReadOnly'),
			isDisabled = this.getData('ltPropDisabled');

		if (isReadOnly || isDisabled) {
			return;
		}

		if (blockShowHide) {
			return;
		}

		/* Doesn't matter if the onBeforeOpen returns false
		 * trying to open another dropdown when autoClosed is set will flush it
		 * showHide is called from toggle as well
		 */

		window._lyteDropdown.autoClosed = null;

		// Exists to remove multiple selected values from a multiselect using either the meta key or the control key
		if (rm && event && mul) {
			cur = event.target;
			while (cur && cur.tagName !== 'LYTE-DROPDOWN' && !cur.getAttribute('data-value')) {
				cur = cur.parentNode;
			}

			// Node with data-value is clicked so you need to process it
			if (cur && cur.getAttribute('data-value')) {
				this.mark(cur, event.shiftKey, event.ctrlKey || event.metaKey);
				return;
			}
			// The node with data-value is not clicked so this is going to unmark everything
			else {
				_lyteDropdown.unmark();
			}
		}
		// When you click another dropdown whose rm is false
		else {
			_lyteDropdown.unmark();
		}

		// For some unknow reason the dropdown closes when you hover over the select box to prevent this we are doing this and same for the opposite
		if (eventtype == 'enter') {
			if (
				link
				&& !link.classList.contains('lyteDropdownHidden')
			) {
				return;
			}

			this.$node.querySelector('[tabindex]').focus()
		}

		if (eventtype == 'leave') {
			if (
				link
				&& link.classList.contains('lyteDropdownHidden')
			) {
				return;
			}
		}

		this.showNoResultDiv();

		if (!show) {
			if (!link) {
				this.childComp = this.$node.querySelector('lyte-drop-box');
			}

			if (this.childComp) {
				this.childComp.setAttribute('lyte-hidden', '');
			}

			window._lyteUiUtils.dispatchEvent('beforeshow', this.$node, { originalEvent: event });

			if (this.getMethods('onBeforeShow')) {
				this.beforeShow(event, fromTg, true);
			}
			else {
				this.setData('call', fromTg ? true : event);
				this.first();
			}

			if (mul) {
				this.addClass();
			}
		}
		else if (link && link.classList.contains('lyteDropdownHidden')) {
			link.setAttribute('lyte-hidden', '');

			window._lyteUiUtils.dispatchEvent('beforeshow', this.$node, { originalEvent: event });

			if (this.getMethods('onBeforeShow')) {
				this.beforeShow(event, fromTg, false);
			}
			else {
				this.setData('call', fromTg ? true : event);
				this.subsequent(link, freeze, mul, hover);
			}
		}
		else if (link && (fromTg || !mul)) {
			if (this.beforeHide.call(this, link, event, freeze)) {
				return;
			}

			this.closeDrop(link, event, freeze);
		}
		else if (link && type === 'multisearch') {
			this.focusInput();
		}
	}

    checkKey(event) {
		var type = this.getData('ltPropType');
		if (event.keyCode == 9) {
			this.$node.component.showHide(event, event.type);

			if (type == 'multisearch') {
				this.focusInput();
			}
		}
	}

    closeIt(event) {
		var mx = event.clientX,
			my = event.clientY,
			dp = this.$node.querySelector('lyte-drop-button'),
			dpt = dp.getBoundingClientRect().top,
			dph = dp.getBoundingClientRect().height,
			dpl = dp.getBoundingClientRect().left,
			dpw = dp.getBoundingClientRect().width,
			dc = this.childComp,
			dct = dc.getBoundingClientRect().top,
			dch = dc.getBoundingClientRect().height,
			dcl = dc.getBoundingClientRect().left,
			dcw = dc.getBoundingClientRect().width;

		if ((mx > Math.floor(dpl)
			&& mx < Math.floor(dpl + dpw)
			&& my > Math.floor(dpt)
			&& my < Math.floor(dpt + dph))
			|| (mx > Math.floor(dcl)
				&& mx < Math.floor(dcl + dcw)
				&& my > Math.floor(dct)
				&& my < Math.floor(dct + dch)
			)
		) {
			return;
		}

		this.$node.toggle(event, "leave")
	}

    closeFun(event) {
		var link = this.childComp,
			head = this.getData('drophead'),
			rm = this.getData('ltPropRemoveMultiple'),
			oldSelected = this.getData('ltPropSelected'),
			node = event.target, src, sel = this.getData('ltPropSelected'), i = 0,
			res = [], body, end, proper, hide, ret, changeObj;

		while (
			!node.getAttribute('data-value')
			&& node
		) {
			node = node.parentElement
		}

		if (!node) {
			return;
		}

		src = node.getAttribute('data-value')

		proper = this.getData('isKeyDown') ? 'keydown' : 'click';

		ret = this.beforeRemove(event, rm ? [src] : src, proper, rm ? [node] : node);

		if (ret) {
			// Don't know why this is here
			// event.stopPropagation();
			return;
		}

		// This is for inbuilt error display
		this.closeError(link, head);

		changeObj = this.findMarked(sel, [node]);

		this.removeMarked(changeObj.selected, [node], head, link);

		if (this.getMethods('onRemove')) {
			// Return an array of removed values in case of removeMultiple
			// else return a singular value
			this.executeMethod('onRemove', event, rm ? [src] : src, this.getData('ltPropSelected'), this, proper, rm ? [node] : node);
		}

		this.fixBoxPosition();

		this.fireOnChange(oldSelected, event, rm ? [node] : node);

		// Don't know why this is here
		// event.stopPropagation();

	}

    data(arg1) {
		return Object.assign(super.data({
			'shouldDisplayIcon': prop('boolean', { 'default': false }),
			'changeItToInvoke': prop("number", { "default": 1 }),
			'dummy1': prop("boolean", { "default": true }),
			'dummy2': prop("boolean", { "default": false }),
			'savedPositions': prop('object', { 'default': {} }),

			/**
			 * @componentProperty {boolean} ltPropRemoveMultiple
			 * @default false
			 * @version 1.0.2
			 *
			 */

			'ltPropRemoveMultiple': prop('boolean', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'removeMultiple', false) }),
			'ltPropYield': prop("boolean", { "default": false }),

			/**
			 * @componentProperty {default|multiple|multisearch} ltPropType
			 * @default default
			 */

			'ltPropType': prop("string", { "default": 'default' }),

			/**
			 * @componentProperty {number} ltPropTabindex
			 * @default 0
			 */

			'ltPropTabindex': prop("number", { "default": 0 }),

			/**
			 * @componentProperty {boolean} ltPropShow
			 * @default false
			 *
			 */

			'ltPropShow': prop("boolean", { "default": false }),

			/**
			 * @componentProperty {boolean} ltPropFreeze
			 * @default true
			 *
			 */

			'ltPropFreeze': prop("boolean", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'freeze', true) }),

			/**
			 * @componentProperty {array} ltPropOptions
			 * @default []
			 */

			'ltPropOptions': prop("array", { "default": [] }),

			/**
			 * @componentProperty {string} ltPropUserValue
			 */

			'ltPropUserValue': prop("string", { "default": undefined }),

			/**
			 * @componentProperty {string} ltPropSystemValue
			 */

			'ltPropSystemValue': prop("string", { "default": undefined }),

			/**
			 * @componentProperty {up|down|left|right} ltPropPosition
			 * @default down
			 */

			'ltPropPosition': prop("string", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'position', 'down') }),

			/**
			 * @componentProperty {string} ltPropIconClass
			 * @default dropdown
			 */

			'ltPropIconClass': prop("string", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'iconClass', 'dropdown') }),

			/**
			 * @componentProperty {string} ltPropSelected
			 * @default ''
			 */

			'ltPropSelected': prop("string", { "default": '' }),

			/**
			 * @componentProperty {boolean} ltPropCallout
			 * @default false
			 *
			 */

			'ltPropCallout': prop("boolean", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'callout', false) }),

			/**
			 * @componentProperty {string} ltPropPlaceholder
			 * @version 1.0.4
			 */

			'ltPropPlaceholder': prop("string", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'placeholder', '') }),

			/**
			 * @componentProperty {boolean} ltPropDisabled
			 * @default false
			 *
			 */

			'ltPropDisabled': prop("boolean", { "default": false }),

			/**
			 * @componentProperty {boolean} ltPropHover
			 * @default false
			 *
			 */

			'ltPropHover': prop("boolean", { "default": false }),

			/**
			 * @componentProperty {string} ltPropNoResult
			 * @default No Results Found
			 * @version 2.0.0
			 */

			'ltPropNoResult': prop("string", { "default": window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'noResult', window._lyteUiUtils.i18n('no.results.found')) }),

			/**
			 * @componentProperty {number} ltPropMaxCount
			 * @default 0
			 * @version 2.1.0
			 */

			'ltPropMaxCount': prop('number', { 'default': 0 }),

			'ltPropInputClass': prop("string", { "default": 'lyteSearch' }),

			/**
			 * @typedef {object} boundary
			 * @property {number} left
			 * @property {number} right
			 * @property {number} top
			 * @property {number} bottom
			 */
			/**
			 * @componentProperty {boundary} ltPropBoundary
			 * @default {}
			 */

			'ltPropBoundary': prop("object", { "default": {} }),
			'pos': prop("string", { "default": '' }),
			'secondaryPosition': prop("string", { "default": '' }),
			'firePos': prop("number", { "default": 1 }),
			'ltPropAjaxRequest': prop("object", { "default": {} }),
			'firstRequest': prop("boolean", { "default": true }),
			'userValue': prop('string'),
			'sysValue': prop('string'),

			/**
			 * @componentProperty {string} ltPropDisplayValue
			 * @version 1.0.1
			 */

			'ltPropDisplayValue': prop("string", { "default": "", hideAttr: true }),

			/**
			 * @componentProperty {array} ltPropDisabledList
			 * @version 1.0.3
			 * @default []
			 */

			'ltPropDisabledList': prop('array', { "default": [] }),

			/**
			 * @componentProperty {boolean} ltPropAnimate
			 * @default false
			 *
			 */

			ltPropAnimate: prop('boolean', { default: window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'animate', false) }),
			'ltPropSetPos': prop('boolean', { 'default': false }),


			/**
			 * @componentProperty {tooltipConfig} ltPropTooltip
		 * @default { "position" : "bottom", "appearance" : "box","margin" : 5, "keeptooltip" : true}
			 * @version 2.0.0
			 * @component lyte-tooltip ltPropTooltipConfig
			 */

			'ltPropTooltip': prop('object', {
				'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'tooltip', {
					'position': 'bottom',
					'appearance': 'box',
					'margin': 5,
					'keeptooltip': true
				})

			}),
			// 'ltPropContainerClass':Lyte.attr("string",{"default":''}),
			// 'ltPropSlide':Lyte.attr("boolean",{"default": false}),

			/**
			 * @componentProperty {string} ltPropBoxClass
			 * @version 2.2.8
			 */

			'ltPropBoxClass': prop('string', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'boxClass', '') }),

			/**
			 * @componentProperty {boolean} ltPropIsOpen
			 * @default false
			 *
			 * @version 2.2.8
			 */

			'ltPropIsOpen': prop('boolean', { 'default': false }),

			'ltPropFocus': prop('boolean', { 'default': false }),

			/**
			 * @componentProperty {boolean} ltPropFixPositionOnOpen
			 * @default false
			 *
			 * @version 2.2.12
			 */

			'ltPropFixPositionOnOpen': prop('boolean', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'fixPositionOnOpen', false) }),

			'ltPropForcePlaceholder': prop('boolean', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'forcePlaceholder', false) }),

			'ltPropShowEmptyMessage': prop('boolean', { 'default': false }),

			'ltPropBoxButtonWidth': prop('string', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'boxButtonWidth', 'min-button') }),

			'ltPropPreventScroll': prop('string', { 'default': 'all' }),

			'ltPropScope': prop('string', { 'default': 'window' }),

			ltPropAnimateBox: prop('boolean', { default: window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'animateBox', false) }),

			'ltPropTooltipClass': prop('string', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'tooltipClass', '') }),

			'ltPropDisplayList': prop('array', { 'default': [] }),

			'ltPropSelectedList': prop('array', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'selectedList', []) }),

			'ltPropItemSearchType': prop('string', { 'default': 'contains' }),	//@options contains, startsWith

			'ltPropFocusOnClose': prop('boolean', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'focusOnClose', true) }),

			'ltPropButtonClass': prop('string', { 'default': window._lyteUiUtils.resolveDefaultValue('lyte-dropdown', 'buttonClass', '') }),

			'ltPropDisableItemTooltip': prop('boolean', { 'default': false }),

			'ltPropPreventParentScroll': prop('boolean', { 'default': false }),

			'ltPropShowRemoveIcon': prop('boolean', { 'default': false }),

			'ltPropAriaButton': prop('object', { 'default': {}, watch: true }),

			// Keeping this property hidden for now because we don't know if we need it.
			'ltPropAriaBox': prop('object', { 'default': {}, watch: true }),

			'ltPropAriaBody': prop('object', { 'default': {}, watch: true }),

			'ltPropReadOnly': prop('boolean', { 'default': false }),

			// The element that should receive focus when the dropdown is opened. It can be in the button or the body
			'ltPropActiveElement': prop('string', { 'default': '' }),

			// This is used to allow focusable elements in the body and focustrap them. Also this will be hidden
			'ltPropAllowFocusableElements': prop('boolean', { 'default': false }),
			'ltPropDataTabindex': prop('string', { 'default': "" }),

			/* This is a special property that is used to handle a stupid case(territory dropdown in list view) where they have submenus inside dropdown.
			They have submenus inside dropdown which needs to be opened and navigated through the keyboard. So we prevent our arrow key navigations
			This property should not be revealed to the outside world */
			'ltPropPreventNavigation': prop( 'boolean', { 'default': false } ),

			'ltPropTrimSearchText': prop( 'boolean', { 'default': true } ),

			// Experimental for now
			'ltPropNoResultYield': prop( 'boolean', { 'default': false } )

		}), arg1);
	}

    getAllItems(link, __arr) {
		var arr = __arr || [],
			__nodes = link ? link.children : [],
			__len = __nodes.length;

		for (var i = 0; i < __len; i++) {
			var __cur_item = __nodes[i];

			if (/lyte-drop-item/i.test(__cur_item.tagName || "")) {
				arr.push(__cur_item);
			} else {
				this.getAllItems(__cur_item, arr);
			}

		}

		return arr;
	}

    getItem(list, value) {
		var __len = list.length,
			conv = value;

		for (var i = 0; i < __len; i++) {
			var cur = list[i];

			if (cur.getAttribute('data-value') == conv) {
				return cur;
			}
		}

		return null;
	}

    static actions(arg1) {
        return Object.assign(super.actions({
            addFocusClass: function (event) {
                this.getDropButton().classList.add('lyteMultiSearchDropButtonFocused');
            },

            removeFocusClass: function (event) {
                this.getDropButton().classList.remove('lyteMultiSearchDropButtonFocused');
            },

            toolTipConfig: function (button, propName) {
                var width = button.offsetWidth,
                    scrollWidth = button.scrollWidth,
                    config = this.getData('ltPropTooltip');

                propName = propName || 'showToolTip';

                this.setData(propName, (width < scrollWidth) && !window._lyteDropdown.isEmpty(config));
            },

            preventDefault: function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                }
            },

            closeIt: function (event) {
                this.closeIt(event);
            },

            processElements: function (event) {
                this.processElements(event)
            },

            closeFun: function (event) {
                this.closeFun(event);
            },

            checkKey: function (event) {
                this.checkKey(event);
            },

            showHide: function ( event, eventtype, fromTg ) {
                this.showHide( event, eventtype, fromTg );
            }
        }), arg1);
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            iconClassChanged: function () {
                this.setIconClass();
            }.observes('ltPropIconClass'),

            setClassForRemoveIconObs: function () {
                this.setClassForRemoveIcon();
            }.observes('ltPropShowRemoveIcon', 'ltPropSelected'),

            addDataTabindex: function () {
                var drophead = this.getData('drophead'),
                    isDisabled = this.getData('ltPropDisabled'),
                    dataIndex = this.getData('ltPropDataTabindex'),
                    tabIndexElement = this.$node.querySelector('input');
                if (tabIndexElement && drophead === 'yield' && !isDisabled) {
                    tabIndexElement.setAttribute('data-tabindex', dataIndex);
                }
            }.observes('ltPropDataTabIndex'),

            addTabIndex: function () {
                this.addTabIndexForYieldedMultisearch();
            }.observes('ltPropTabindex'),

            changeBoxClass: function (change) {
                var oldValue = change.oldValue;

                this.setBoxClass(oldValue);

            }.observes('ltPropBoxClass'),

            changeButtonClass: function (change) {
                var oldValue = change.oldValue;

                this.setButtonClass(oldValue);

            }.observes('ltPropButtonClass'),

            noResultChanged: function () {
                var link = this.childComp,
                    type = this.getData('ltPropType'),
                    head = this.getData('drophead'),
                    body = this.getDropBody(link),
                    nores = body.querySelector('.lyteDropdownNoResult'),
                    text = this.getData('ltPropNoResult'),
                    link = this.childComp;

                nores.textContent = text;

                if (!text) {
                    nores.style.display = 'none';
                }

                // Hide the no result div if text is empty
                if (link) {
                    this.showError(link, type, head);
                }

            }.observes('ltPropNoResult'),

            // TODO: Fix this
            onChangeInDisabledList: function () {
                var elements = this.childComp ? this.childComp.querySelectorAll('lyte-drop-item') : this.$node.querySelectorAll('lyte-drop-item'),
                    isItemDisabled;

                for (var i = 0; i < elements.length; i++) {
                    isItemDisabled = this.$component.registeredHelpers.lyteUiCheckDisabled(this.getData('ltPropDisabledList') || [], elements[i].dataset.value);

                    if (isItemDisabled === 'true') {
                        elements[i].classList.remove('lyteDropdownSelection');
                        elements[i].setAttribute('disabled', isItemDisabled);
                    }

                    if (isItemDisabled === 'false' && elements[i].hasAttribute('disabled')) {
                        elements[i].removeAttribute('disabled');
                    }
                }
                this.addDisabledClass(elements);

            }.observes('ltPropDisabledList.[]', 'ltPropOptions.[]' ).on('didConnect'),

            /**
             * Fires the position callback and adds and removes classes for the drop-box according to the direction
             *
             */

            firePosCallBack: function () {
                var pos = this.getData('pos'),
                    needCv = this.getData('widthAdjusted');

                if (pos !== '') {
                    // Fast dom removed here because it is causing a bug in ie
                    // $L.fastdom.mutate( function() {
                    var body = this.childComp,
                        bt = this.$node.querySelector('lyte-drop-button'),
                        ngcls = this.removeClass(body.classList, pos, 'lyteDropdown');

                    /* Removing and adding class of the lyte-drop-box */

                    if (ngcls) {
                        this._preventClass = true;
                        body.classList.remove(ngcls);
                    }

                    body.classList.add('lyteDropdown' + pos[0].toUpperCase() + pos.substring(1));

                    /* End */

                    /* Removing and adding class of lyte-drop-button */

                    ngcls = this.removeClass(bt.classList, pos, 'lyteDropButton');

                    if (ngcls) {
                        this._preventClass = true;
                        bt.classList.remove(ngcls);
                    }

                    bt.classList.add('lyteDropButton' + pos[0].toUpperCase() + pos.substring(1));

                    /* End */

                    if (needCv === 2) {
                        body.classList.add('lyteDropdownCurve');
                    }

                    if (this.getMethods('onPositionChanged')) {
                        this.executeMethod('onPositionChanged', pos, this);
                    }
                    // }, this );

                }

            }.observes(
                'pos',
                'firePos'
            ),

            secondaryPositionObserver: function () {
                var pos = this.getData('secondaryPosition') || '';

                if (pos !== '') {
                    var box = this.childComp,
                        classToRemove = this.removeClass(box.classList, pos, 'lyteDropbox', false, 'AlignToButton');

                    if (classToRemove) {
                        box.classList.remove(classToRemove);
                    }

                    this._preventClass = true;  // This preventClass will take care of the classToRemove mut observer fire
                    box.classList.add('lyteDropbox' + pos[0].toUpperCase() + pos.substring(1) + 'AlignToButton');
                }
            }.observes('secondaryPosition'),

            selObs: function (change) {
                var old = change.oldValue;

                if (this.getData('prev')) {
                    return;
                }

                // TODO:
                // When limit crosses we reset the ltPropSelected which causes the other lt-prop-selected to fire
                // That observer fires twice overall but doesn't change the state of the dropdown but we need to cutdown
                // the processing
                if (this.checkLimit(0)) {
                    this.setData('prev', true);
                    this.setData('ltPropSelected', old);
                    this.setData('prev', false);

                    return;
                }

                this.hideNodes();
                this.showNodes(change);
            }.observes('ltPropSelected'),

            /**
             * Function to set an initial value to the dropdown when lt-prop-options is pushed later
             * into the dropdown. When lt-prop-options is empty and new items are pushed in
             * @param change - Old value and new values
             *
             */

            contentChange: function (change) {
                var oldValue = change.oldValue,
                    newValue = change.newValue,
                    sel = this.getData('ltPropSelected'),
                    ph = this.getData('ltPropPlaceholder'),
                    disp = this.getData('ltPropDisplayValue'),
                    body = this.getData('dropbody') === 'yield',

                    // Old value of lt-prop-options should be empty and the new value should be filled
                    initial = (
                        (oldValue && oldValue.length === 0)
                        || !oldValue
                    ) && newValue && newValue.length > 0;

                if (initial && !sel && !ph && !body) {
                    this.setInitialSelected();
                }

                this.showNoResultDiv();
            }.observes('ltPropOptions'),

            // This is going to only process the child nodes
            hideOptionsBasedOnSelected: function () {
                // This is for multiselect
                var link = this.childComp,
                    head = this.getData('drophead'),
                    multiple = this.getData('multiple'),
                    type = this.getData('ltPropType');

                if (link && multiple) {
                    this.hideNodes();

                    // close error will always close the error
                    this.closeError(link, head);

                    // So there is no error div showing now and show error will decide to show it or not based on the displayed items
                    this.showError(link, type, head);
                }
            }.observes('ltPropOptions'),

            selChange: function () {
                var mul = this.getData('multiple'),
                    head = this.getData('drophead'),
                    link = this.childComp,
                    sel = this.getData('ltPropSelected'),
                    disp = this.getData('ltPropDisplayValue'),
                    preventDisp = this.getData('preventDisp'),
                    sels, parent = link ? link : this.$node.querySelector('lyte-drop-box'),
                    body = this.getDropBody(parent),
                    node, i = 0;

                if (this.prevSelectedList) {
                    return;
                }

                if (
                    mul
                ) {
                    this.setSelectedList();
                }
                else if (!mul) {
                    var all_elems = this.getAllItems(parent);

                    // node = parent.querySelector( '[data-value="' + window._lyteUiUtils.escape( sel ) + '"]' );
                    node = this.getItem(all_elems, sel);

                    if (node) {
                        this.toggleCurrent(node);
                    }

                    // Don't remove previous selected=true attribute when it is a multiselect should only remove it when the element is removed from the selected list.
                    sels = parent.querySelectorAll('[selected]');

                    for (; i < sels.length; i++) {
                        if (sels[i].getAttribute('data-value') != sel) {
                            sels[i].removeAttribute('selected');
                        }
                    }

                    if (head !== 'yield') {
                        if (node) {
                            var innerText = node.textContent;

                            if ((disp && !preventDisp) || !disp) {

                                // don't really need the or over here but w.e
                                this.setData('ltPropDisplayValue', (innerText || '').trim());
                            }
                        }
                        else if (!sel && !preventDisp) {
                            this.setData('ltPropDisplayValue', '');
                        }
                    }

                }

                // To set selected to true to the ltPropSelected node
                if (node) {
                    node.setAttribute('selected', 'true');
                }

                this.toggleDropdownClass();

            }.observes(
                'ltPropOptions',
                'ltPropSelected',
                'changeItToInvoke'
            ),

            tabIndexChange: function () {
                this.toggleButtonInteractivity();
            }.observes('ltPropDisabled'),

            focusDropdown: function () {
                var focusableElement = this.getElementWithTabIndex(),
                    shouldFocus = this.getData('ltPropFocus'),
                    isSearch = this.getData('search');

                if (shouldFocus) {
                    if (!isSearch && focusableElement) {
                        focusableElement.focus( { preventScroll: this.preventScroll } );
                    }
                    else if (isSearch) {
                        this.$node.open();
                    }
                }

                this.data.ltPropFocus = false;
            }.observes('ltPropFocus').on('didConnect'),

            showHideEmptyMessage: function () {
                this.showNoResultDiv();
            }.observes('ltPropShowEmptyMessage'),

            setSelectedFromListObs: function () {
                if (this.getData('preventSelListObs')) {
                    return;
                }

                this.setSelectedFromList();
            }.observes('ltPropSelectedList.[]'),

            ariaObserver: function () {
                // TODO: Need to fix the setAttribute oldAria argument passed here
                window._lyteUiUtils.setAttribute(this.getDropBox(), this.getData('ltPropAriaBox') || {}, {});
                window._lyteUiUtils.setAttribute(this.getDropBody(this.childComp), this.getData('ltPropAriaBody') || {}, {});
                window._lyteUiUtils.setAttribute(this.getAriaButton(), this.getData('ltPropAriaButton') || {}, {});
            }.observes('ltPropAriaButton', 'ltPropAriaButton.{}', 'ltPropAriaBox', 'ltPropAriaBox.{}', 'ltPropAriaBody', 'ltPropAriaBody.{}' ).on('didConnect')
        }), arg1);
    }

    _() {
        _;
    }
}

LyteDropdownComponent._template = "<template tag-name=\"lyte-dropdown\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropHover,'==',true)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(multiple,'==',true)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(search,'==',true)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==','noyield')}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-button role=\"combobox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\" aria-haspopup=\"listbox\"> <div class=\"lyteMultiselect\"> <ul class=\"lyteMultipleSelect\"> <template items=\"{{ltPropSelectedList}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"> <li data-value=\"{{lyteUiReturnValueBy(item,sysValue)}}\"> <span class=\"lyteDropdownVisible\" onmouseenter=\"{{action('toolTipConfig',this,'selToolTip')}}\" lt-prop-title=\"{{if(selToolTip,lyteUiReturnValueBy(item,userValue),'')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\">{{lyteUiReturnValueBy(item,userValue)}}</span> <lyte-drop-remove class=\"lyteCloseIcon\"></lyte-drop-remove> </li> </template> <li class=\"lyteMultiselectInput\"> <input disabled=\"{{ltPropDisabled}}\" readonly=\"{{ltPropReadOnly}}\" onkeydown=\"{{action('preventDefault',event)}}\" type=\"text\" placeholder=\"{{ltPropPlaceholder}}\" class=\"lyteDropdownTextField\" autocomplete=\"off\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" onclick=\"{{action('showHide',event)}}\" onfocus=\"{{action('addFocusClass',event)}}\" onblur=\"{{action('removeFocusClass',event)}}\"> </li> </ul> </div> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{shouldDisplayIcon}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </template></template> </lyte-drop-button> </template><template default=\"\"> </template></template> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <div class=\"lyteDummyEventContainer\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\" onclick=\"{{action('showHide',event)}}\" onkeyup=\"{{action('checkKey',event)}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\"> <lyte-drop-button> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(ltPropSelectedList.length,'==',0),'&amp;&amp;',expHandlers(ltPropForcePlaceholder,'!'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteDropPlaceholderMultiple\">{{ltPropPlaceholder}}</span> </template></template> <ul class=\"lyteMultipleSelect\"> <template items=\"{{ltPropSelectedList}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"> <li data-value=\"{{lyteUiReturnValueBy(item,sysValue)}}\"> <span class=\"lyteDropdownVisible\" onmouseenter=\"{{action('toolTipConfig',this,'selToolTip')}}\" lt-prop-title=\"{{if(selToolTip,lyteUiReturnValueBy(item,userValue),'')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\">{{lyteUiReturnValueBy(item,userValue)}}</span> <lyte-drop-remove class=\"lyteCloseIcon\"></lyte-drop-remove> </li> </template> </ul> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropForcePlaceholder}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteDropPlaceholderMultiple\">{{ltPropPlaceholder}}</span> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{shouldDisplayIcon}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </template></template> </lyte-drop-button> </div> </template><template default=\"\"> </template></template> </template></template> </template><template default=\"\"> <div onmouseenter=\"{{action('showHide',event,'enter')}}\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\" onmouseleave=\"{{action('closeIt',event)}}\" class=\"lyteDummyEventContainer\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" style=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-button> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropDisplayValue}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteMarginRight lyteDropdownLabel\" onmouseenter=\"{{action('toolTipConfig',this,'showToolTip')}}\" lt-prop-title=\"{{if(showToolTip,ltPropDisplayValue,'')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\">{{ltPropDisplayValue}}</span> </template><template case=\"{{expHandlers(expHandlers(ltPropSelected,'!'),'&amp;&amp;',expHandlers(ltPropDisplayValue,'!'))}}\" is=\"case\" lc-id=\"lc_id_1\"> <span class=\"lyteDropPlaceholderNormal\">{{ltPropPlaceholder}}</span> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropSelected,'&amp;&amp;',ltPropShowRemoveIcon)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-remove class=\"lyteDropdownDeselectIcon\"></lyte-drop-remove> </template></template> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </lyte-drop-button> </template><template case=\"{{expHandlers(drophead,'==',&quot;yield&quot;)}}\" is=\"case\" lc-id=\"lc_id_1\"> </template></template> </div> </template></template> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(multiple,'==',true)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(search,'==',true)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==','noyield')}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-button onclick=\"{{action('showHide',event)}}\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\"> <div class=\"lyteMultiselect\"> <ul class=\"lyteMultipleSelect\"> <template items=\"{{ltPropSelectedList}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"> <li data-value=\"{{lyteUiReturnValueBy(item,sysValue)}}\"> <span class=\"lyteDropdownVisible\" onmouseenter=\"{{action('toolTipConfig',this,'selToolTip')}}\" lt-prop-title=\"{{if(selToolTip,lyteUiReturnValueBy(item,userValue),'')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\">{{lyteUiReturnValueBy(item,userValue)}}</span> <lyte-drop-remove class=\"lyteCloseIcon\"></lyte-drop-remove> </li> </template> <li class=\"lyteMultiselectInput\"> <input disabled=\"{{ltPropDisabled}}\" readonly=\"{{ltPropReadOnly}}\" onkeydown=\"{{action('preventDefault',event)}}\" type=\"text\" placeholder=\"{{ltPropPlaceholder}}\" class=\"lyteDropdownTextField\" autocomplete=\"off\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" onfocus=\"{{action('addFocusClass',event)}}\" onblur=\"{{action('removeFocusClass',event)}}\"> </li> </ul> </div> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{shouldDisplayIcon}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </template></template> </lyte-drop-button> </template><template default=\"\"> <div class=\"lyteDummyEventContainer\" style=\"\" onclick=\"{{action('showHide',event)}}\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\"> </div> </template></template> </template><template default=\"\"> <div class=\"lyteDummyEventContainer\" onclick=\"{{action('showHide',event)}}\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-button> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(expHandlers(ltPropSelectedList.length,'==',0),'&amp;&amp;',expHandlers(ltPropForcePlaceholder,'!'))}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteDropPlaceholderMultiple\">{{ltPropPlaceholder}}</span> </template></template> <ul class=\"lyteMultipleSelect\"> <template items=\"{{ltPropSelectedList}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"> <li data-value=\"{{lyteUiReturnValueBy(item,sysValue)}}\"> <span class=\"lyteDropdownVisible\" onmouseenter=\"{{action('toolTipConfig',this,'selToolTip')}}\" lt-prop-title=\"{{if(selToolTip,lyteUiReturnValueBy(item,userValue),'')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\">{{lyteUiReturnValueBy(item,userValue)}}</span> <lyte-drop-remove class=\"lyteCloseIcon\"></lyte-drop-remove> </li> </template> </ul> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropForcePlaceholder}}\" is=\"case\" lc-id=\"lc_id_0\"> <span class=\"lyteDropPlaceholderMultiple\">{{ltPropPlaceholder}}</span> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{shouldDisplayIcon}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </template></template> </lyte-drop-button> </template><template default=\"\"> </template></template> </div> </template></template> </template><template default=\"\"> <div onclick=\"{{action('showHide',event)}}\" class=\"lyteDummyEventContainer\" tabindex=\"{{ltPropTabindex}}\" data-tabindex=\"{{ltPropDataTabindex}}\" style=\"\" role=\"combobox\" aria-haspopup=\"listbox\" aria-expanded=\"{{if(ltPropIsOpen,'true','false')}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(drophead,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-button> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropDisplayValue}}\" is=\"case\" lc-id=\"lc_id_0\"> <span onmouseenter=\"{{action('toolTipConfig',this,'showToolTip')}}\" lt-prop-tooltip-config=\"{{ltPropTooltip}}\" lt-prop-tooltip-class=\"{{ltPropTooltipClass}}\" lt-prop-title=\"{{if(showToolTip,ltPropDisplayValue,'')}}\" class=\"lyteMarginRight lyteDropdownLabel\">{{ltPropDisplayValue}}</span> </template><template case=\"{{expHandlers(expHandlers(ltPropSelected,'!'),'&amp;&amp;',expHandlers(ltPropDisplayValue,'!'))}}\" is=\"case\" lc-id=\"lc_id_1\"> <span class=\"lyteDropPlaceholderNormal\">{{ltPropPlaceholder}}</span> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropSelected,'&amp;&amp;',ltPropShowRemoveIcon)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-remove class=\"lyteDropdownDeselectIcon\"></lyte-drop-remove> </template></template> <lyte-icon class=\"{{ltPropIconClass}}\"></lyte-icon> </lyte-drop-button> </template><template case=\"{{expHandlers(drophead,'==',&quot;yield&quot;)}}\" is=\"case\" lc-id=\"lc_id_1\"> </template></template> </div> </template></template> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropHover,'==',false)}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(dropbody,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-box class=\"lyteDropdownHidden\"> <lyte-drop-body> <template items=\"{{ltPropOptions}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"><template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiOptGroupCheck(item)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-group> <lyte-drop-label>{{lyteUiReturnOnlyKey(item)}}</lyte-drop-label> <template items=\"{{lyteUiReturnValueBy(item,lyteUiReturnOnlyKey(item))}}\" item=\"subitem\" index=\"indexval\" is=\"for\" _new=\"true\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiIsObject(subitem)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-item data-value=\"{{subitem[ltPropSystemValue]}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,subitem[ltPropSystemValue])}}\">{{subitem[ltPropUserValue]}}</lyte-drop-item> </template><template default=\"\"> <lyte-drop-item data-value=\"{{subitem}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,subitem)}}\">{{subitem}}</lyte-drop-item> </template></template> </template> </lyte-drop-group> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiIsObject(item)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-item data-value=\"{{item[ltPropSystemValue]}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,item[ltPropSystemValue])}}\">{{item[ltPropUserValue]}}</lyte-drop-item> </template><template default=\"\"> <lyte-drop-item data-value=\"{{item}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,item)}}\">{{item}}</lyte-drop-item> </template></template> </template></template> </template> </lyte-drop-body> </lyte-drop-box> </template><template default=\"\"> </template></template> <div class=\"lyteLoadMsg\" style=\"display:none;\">Loading</div> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(dropbody,'==',&quot;noyield&quot;)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-box class=\"lyteDropdownHidden\"> <lyte-drop-body> <template items=\"{{ltPropOptions}}\" item=\"item\" index=\"indexVal\" is=\"for\" _new=\"true\"><template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiOptGroupCheck(item)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-group> <lyte-drop-label>lyteUiReturnOnlyKey(item)</lyte-drop-label> <template items=\"{{lyteUiReturnValueBy(item,lyteReturnOnlyKey(item))}}\" item=\"subitem\" index=\"indexval\" is=\"for\" _new=\"true\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiIsObject(subitem)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-item data-value=\"{{subitem[ltPropSystemValue]}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,subitem[ltPropSystemValue])}}\">{{subitem[ltPropUserValue]}}</lyte-drop-item> </template><template default=\"\"> <lyte-drop-item data-value=\"{{subitem}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,subitem)}}\">{{subitem}}</lyte-drop-item> </template></template> </template> </lyte-drop-group> </template><template default=\"\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{lyteUiIsObject(item)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-drop-item data-value=\"{{item[ltPropSystemValue]}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,item[ltPropSystemValue])}}\">{{item[ltPropUserValue]}}</lyte-drop-item> </template><template default=\"\"> <lyte-drop-item data-value=\"{{item}}\" disabled=\"{{lyteUiCheckDisabled(ltPropDisabledList,item)}}\">{{item}}</lyte-drop-item> </template></template> </template></template> </template> </lyte-drop-body> </lyte-drop-box> </template><template default=\"\"> </template></template> <div class=\"lyteLoadMsg\" style=\"display:none;\">Loading</div> </template></template> <lyte-yield yield-name=\"yield\" style=\"display: none;\" lyte-options=\"{{ltPropOptions}}\"></lyte-yield> </template>";;
LyteDropdownComponent._dynamicNodes = [{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"a","p":[1,1,1,1],"cn":"lc_id_0"},{"t":"f","p":[1,1,1,1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"tX","p":[1,1,0]},{"t":"cD","p":[1,3],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,1,1,3,1],"cn":"lc_id_0"},{"t":"s","p":[1,3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"s","p":[1,1,1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":4,"sibl":[3],"cn":"lc_id_0"},{"t":"a","p":[1,1,3,1],"cn":"lc_id_0"},{"t":"f","p":[1,1,3,1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"tX","p":[1,1,0]},{"t":"cD","p":[1,3],"in":0}],"dc":[0],"hc":true,"trans":true,"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"s","p":[1,1,5],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"s","p":[1,1,7],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1,1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{"dc":[3,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"s","p":[1,3],"c":{"lc_id_0":{"dN":[{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,5],"cn":"lc_id_0"},{"t":"cD","p":[1,5],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"a","p":[1,1,1,1],"cn":"lc_id_0"},{"t":"f","p":[1,1,1,1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"tX","p":[1,1,0]},{"t":"cD","p":[1,3],"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,1,1,3,1],"cn":"lc_id_0"},{"t":"s","p":[1,3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"}]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":4,"sibl":[3],"cn":"lc_id_0"},{"t":"a","p":[1,3,1],"cn":"lc_id_0"},{"t":"f","p":[1,3,1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"tX","p":[1,1,0]},{"t":"cD","p":[1,3],"in":0}],"dc":[0],"hc":true,"trans":true,"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"s","p":[1,5],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"s","p":[1,7],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{"dc":[3,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"tX","p":[1,0],"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"s","p":[1,3],"c":{"lc_id_0":{"dN":[{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,5],"cn":"lc_id_0"},{"t":"cD","p":[1,5],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"lc_id_1":{}},"hd":true,"co":["lc_id_0","lc_id_1"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1]},{"t":"s","p":[3],"c":{"lc_id_0":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1,1,1],"cn":"lc_id_0"},{"t":"f","p":[1,1,1],"dN":[{"t":"s","p":[0],"c":{"lc_id_0":{"dN":[{"t":"tX","p":[1,1,0],"cn":"lc_id_0"},{"t":"cD","p":[1,1],"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,3],"cn":"lc_id_0"},{"t":"f","p":[1,3],"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0}],"dc":[0],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[1,1],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1,1,1],"cn":"lc_id_0"},{"t":"f","p":[1,1,1],"dN":[{"t":"s","p":[0],"c":{"lc_id_0":{"dN":[{"t":"cD","p":[1,1],"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"a","p":[1,3],"cn":"lc_id_0"},{"t":"f","p":[1,3],"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0}],"dc":[0],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"s","p":[1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"tX","p":[1,0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"tX","p":[1,0],"cn":"default"},{"t":"cD","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0}],"dc":[0],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[1,1],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[]},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true},"default":{}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0]},{"t":"a","p":[5]},{"t":"i","p":[5],"in":0},{"type":"dc","trans":true,"hc":true,"p":[2,1,0]}];;

LyteDropdownComponent._observedAttributes = [
    "shouldDisplayIcon",
    "changeItToInvoke",
    "dummy1",
    "dummy2",
    "savedPositions",
    "ltPropRemoveMultiple",
    "ltPropYield",
    "ltPropType",
    "ltPropTabindex",
    "ltPropShow",
    "ltPropFreeze",
    "ltPropOptions",
    "ltPropUserValue",
    "ltPropSystemValue",
    "ltPropPosition",
    "ltPropIconClass",
    "ltPropSelected",
    "ltPropCallout",
    "ltPropPlaceholder",
    "ltPropDisabled",
    "ltPropHover",
    "ltPropNoResult",
    "ltPropMaxCount",
    "ltPropInputClass",
    "ltPropBoundary",
    "pos",
    "secondaryPosition",
    "firePos",
    "ltPropAjaxRequest",
    "firstRequest",
    "userValue",
    "sysValue",
    "ltPropDisplayValue",
    "ltPropDisabledList",
    "ltPropAnimate",
    "ltPropSetPos",
    "ltPropTooltip",
    "ltPropBoxClass",
    "ltPropIsOpen",
    "ltPropFocus",
    "ltPropFixPositionOnOpen",
    "ltPropForcePlaceholder",
    "ltPropShowEmptyMessage",
    "ltPropBoxButtonWidth",
    "ltPropPreventScroll",
    "ltPropScope",
    "ltPropAnimateBox",
    "ltPropTooltipClass",
    "ltPropDisplayList",
    "ltPropSelectedList",
    "ltPropItemSearchType",
    "ltPropFocusOnClose",
    "ltPropButtonClass",
    "ltPropDisableItemTooltip",
    "ltPropPreventParentScroll",
    "ltPropShowRemoveIcon",
    "ltPropAriaButton",
    "ltPropAriaBox",
    "ltPropAriaBody",
    "ltPropReadOnly",
    "ltPropActiveElement",
    "ltPropAllowFocusableElements",
    "ltPropDataTabindex",
    "ltPropPreventNavigation",
    "ltPropTrimSearchText",
    "ltPropNoResultYield"
];

window.addEventListener('scroll', function (event) {
	$L.fastdom.measure(function () {
		var elm = window._lyteDropdown.getVisibleDropbox(),
			tempele = elm,
			isAnimate,
			cur = event.target, shouldUseSave,
			drop, component, boundary, offsets, link, bounds;

		if (!elm) {
			window._lyteDropdown.openAutoClosedDropdown(cur, event);
			return;
		}

		// if( cur.nodeName == "#document" ) {     //This probably happens because scrollIntoView is used to focus the dropdown which is open at the start so the event.target is #document(CODE HELP)
		// 	return ;
		// }

		while (cur != document && cur.tagName !== 'LYTE-DROP-BOX' && cur.tagName !== 'HTML') {
			cur = cur.parentElement;
		}

		if (cur.tagName === 'LYTE-DROP-BOX') {
			return;
		}

		drop = elm.origindd;

		// People could just render the lyte-drop-box without any dropdown and that guy is scrolling
		if (!drop) {
			window._lyteDropdown.openAutoClosedDropdown(cur, event);
			return;
		}

		component = drop.component;
		link = component.childComp;


		// Dropdowns crossing their boundaries are closed automatically
		bounds = window._lyteDropdown.buildBounds(component);
		offsets = drop.getBoundingClientRect();

		if ((offsets.top < bounds.top
			|| offsets.left < bounds.left
			|| offsets.right > bounds.right
			|| offsets.bottom > bounds.bottom)
		) {

			component.beforeScrollClose(event);
			if (component.beforeHide.call(component, link, event, component.getData('ltPropFreeze'))) {
				return;
			}

			component.closeDrop.call(component, link, event, component.getData('ltPropFreeze'), true);
			isAnimate = component.getData('ltPropAnimate');

			/* While closeDrop does set autoClosed to null
			 * This sets it to its proper value thereby making the dropdown properly close/open when
			 * it either moves out or comes into bounds
			 */


			if (!isAnimate) {
				window._lyteDropdown.autoClosed = drop;
			}

		}

		// Set CSS of the dropdown on scrolling
		if (!drop.component._preventSetcss) {
			shouldUseSave = drop.component.getData('ltPropFixPositionOnOpen');

			drop.component.setCss(true, shouldUseSave);
		}
	});
}, true);

document.addEventListener('click', function (event) {
	var ele = event.target,
		target = event.target,
		cur, all, i = 0, j = 0, type,
		open, temp, component, res, freeze, link, drp, item, active, container, head, input;

	// Performing an user action such as click whether it is on the same dropdown
	// or another dropdown or anywhere will flush autoClosed
	// Browser defined scrollbars don't trigger a click but lyte-scrollbar does
	if (!window._lyteDropdown.isScrollBar(target)) {
		window._lyteDropdown.autoClosed = null;
	}

	ele = window._lyteDropdown.traverse(ele, ['LYTE-DROPDOWN', 'HTML', 'LYTE-DROP-BOX', 'LYTE-DROP-REMOVE']);

	if (window._lyteDropdown.focusOut) {

		// If container is html, then the click event in the dropdown will close it.
		window._lyteDropdown.preventClose = ele && ele.tagName !== 'HTML' ? true : false;
	}

	// return when there is no element
	if (!ele) {
		return;
	}

	if (ele.tagName == 'HTML') {

		window._lyteDropdown.unmark();
		open = document.querySelectorAll('lyte-drop-box:not(.lyteDropdownHidden)');

		for (; j < open.length; j++) {
			temp = open[j];
			if (temp) {
				component = temp.origindd.component;

				if (component.beforeHide.call(component, temp, event, component.getData('ltPropFreeze'))) {
					continue;
				}

				freeze = document.getElementById('lytedropdownfreezelayer');
				component.closeDrop.call(component, temp, event, freeze);
			}
		}

		active = document.activeElement;

		// Looks like activeElements can be undefined - LOL IE
		if (active && active.tagName === 'INPUT' && (container = window._lyteDropdown.traverse(active, ['LYTE-DROPDOWN']))) {
			active.blur();
		}
	}
	else if (ele.tagName === 'LYTE-DROPDOWN') {
		cur = ele;
		all = document.querySelectorAll('lyte-drop-box:not(.lyteDropdownHidden)')
		for (; i < all.length; i++) {
			if (all[i].origindd == cur) {
				continue;
			}
			else {
				drp = all[i].origindd;
				component = drp.component;
				window._lyteDropdown.unmark();

				if (component.beforeHide.call(component, component.childComp, event, component.getData('ltPropFreeze'))) {
					continue;
				}

				component.closeDrop.call(component, component.childComp, event, component.getData('ltPropFreeze'));
			}
		}
	}
	else if (ele.tagName === 'LYTE-DROP-REMOVE') {
		drp = ele;
		while (drp.tagName != 'LYTE-DROPDOWN') {
			if (drp.getAttribute('data-value')) {
				item = drp;
			}
			drp = drp.parentElement;
		}

		type = drp.ltProp('type');
		head = drp.component.getData('drophead');

		window._lyteDropdown.closeOtherDropdowns(drp);

		if (drp.ltProp('readOnly')) {
			return;
		}

		if (type === 'default') {
			drp.ltProp('selected', '');
		}
		else {
			if (type === 'multisearch') {
				drp.component.focusInput();
				input = drp.querySelector('lyte-search') || drp.querySelector('input');

				if (input && input.setValue) {
					input.setValue('');
				}
			}

			if (item.classList.contains('lyteDropMark')) {
				drp.component.removeAll(event);
			}
			else {
				window._lyteDropdown.unmark();
				drp.component.closeFun(event);
			}
		}

	}
}, true);

if (window._lyteUiUtils.isIos) {
	document.addEventListener('focusout', function (event) {
		// need to check for multiple dropdown
		var target = event.target,
			open, drop, comp, freeze;

		// test for normal input in dom
		if ((drop = window._lyteDropdown.traverse(target, 'LYTE-DROPDOWN'))
			&& event.target.tagName === 'INPUT'
		) {
			comp = drop.component;
			open = comp.childComp;
			freeze = comp.getData('ltPropFreeze');

			window._lyteDropdown.focusOut = true;

			setTimeout(function () {

				if (_lyteDropdown.preventClose) {
					_lyteDropdown.preventClose = _lyteDropdown.focusOut = false;
					return;
				}

				if (open
					&& !open.classList.contains('lyteDropdownHidden')
				) {
					if (comp.beforeHide(open, event, freeze)) {
						return;
					}

					comp.closeDrop(open, event, freeze);
				}

				_lyteDropdown.focusOut = false;
			}, 0);
		}
	}, true);
}

document.addEventListener('keydown', function (event) {  //This is to take care of the tabbing problems in a dropdown and traversing(CODE HELP)
	var kc = event.keyCode,
		active, acomp, abutton, anodes, activeDrop,
		open = document.querySelector('lyte-drop-box:not(.lyteDropdownHidden)'),
		type, res, drp, component, src, last, l = 0, cur, elem, elems, i = 0, j, all, k, curActive;


	if (window._lyteDropdown.openFocusedDropdown(kc)) {
		return;
	}

	if (kc === 32 || kc === 40) {
		curActive = activeDrop = document.activeElement;
		activeDrop = window._lyteDropdown.traverse(activeDrop, ['LYTE-DROPDOWN', 'HTML']);

		// active elements can be null - LOL IE
		if (activeDrop) {
			if (activeDrop.tagName === 'LYTE-DROPDOWN' && curActive.tagName !== 'INPUT' && curActive.tagName !== 'TEXTAREA') {
				event.preventDefault();
			}

			if (activeDrop.tagName === 'LYTE-DROPDOWN'
				&& !activeDrop.ltProp( 'isOpen' )
			) {
				activeDrop.component.showHide(event, event.type);

				// End this here
				return;
			}
		}
	}

	// UP, DOWN, ENTER
	if (
		(
			kc == 38
			|| kc == 40
			|| kc == 13
		)
		&& open
	) {

		if (kc == 38
			|| kc == 40
		) {
			event.preventDefault()
		}

		// Get the current highlighted element
		drp = open.origindd;
		component = drp.component;
		type = component.getData('ltPropType');
		open = component.getDropBox();
		cur = open.querySelector('.lyteDropdownSelection');

		var shouldNavigate = component.shouldNavigate();

		if (!shouldNavigate) {
			return;
		}

		// No current Highlighted Element or the current highlighted element is hidden
		// It just sets the first visible element as highlighted and returns
		// Only for multiselects
		if (
			!cur
			|| (cur && !window._lyteDropdown.isVisible(cur))
		) {

			// This one is a yikes
			elems = open.querySelectorAll('lyte-drop-item:not(.lyteSearchHidden):not(.lyteDropdownActive)') //wrong

			for (; i < elems.length; i++) {
				if (window._lyteDropdown.isVisible(elems[i])
					&& elems[i].getAttribute('disabled') !== "true"
				) {
					elem = elems[i];
					break;
				}
			}

			if (cur) {
				cur.classList.remove('lyteDropdownSelection');
			}

			if (elem) {
				elem.classList.add('lyteDropdownSelection');
				component.getActiveElement().setAttribute('aria-activedescendant', elem.getAttribute('id'));
				return;
			}
		}

		kc = event.keyCode;
		elems = open.querySelectorAll('lyte-drop-item');
		for (i = 0; i < elems.length; i++) {
			if (elems[i].classList.contains('lyteDropdownSelection')) {
				break;
			}
		}

		// A highlighted element was present and enter is pressed
		if (kc == 13) {
			if (component.getData('multiple')) {
				if (!elems[i]) {
					return;
				}

				elems[i].click();
			}
			else {

				// Just a safety check.
				// lyteDropdownSelection is most likely present
				if (elems[i]) {
					elems[i].click();
				}
			}
		}
		// Key up was pressed
		else if (
			kc == 38
			&& i != 0
		) {
			j = i;
			i = window._lyteDropdown.find(elems, i - 1, false);

			if (i != -1) {
				component.scrollIntoView(elems[i], 'up');
				elems[j].classList.remove('lyteDropdownSelection');
				elems[i].classList.add('lyteDropdownSelection');
				component.getActiveElement().setAttribute('aria-activedescendant', elems[i].getAttribute('id'));
				component.executeKeyNavigationCallback(elems[i]);
			}
		}

		// Key down was pressed
		else if (
			kc == 40
			&& i != elems.length - 1
		) {
			j = i;
			i = window._lyteDropdown.find(elems, i + 1, true);

			if (i < elems.length) {  // Added this because it was breaking in CRM
				component.scrollIntoView(elems[i], 'down');
				elems[j].classList.remove('lyteDropdownSelection');
				elems[i].classList.add('lyteDropdownSelection');
				component.getActiveElement().setAttribute('aria-activedescendant', elems[i].getAttribute('id'));
				component.executeKeyNavigationCallback(elems[i]);
			}
		}

	}

	// Backspace was pressed
	else if (kc === 8) {
		active = window._lyteDropdown.getActive();

		if (active) {
			acomp = active.component;
			abutton = active.querySelector('lyte-drop-button');
			anodes = abutton.querySelector('.lyteDropMark');
		}

		drp = window._lyteDropdown.getDropdownWithFocusedInput();

		if (!drp) {
			return;
		}

		component = drp && drp.component;
		type = component && component.getData('ltPropType');

		if (anodes) {
			event.preventDefault();
			acomp.setData('isKeyDown', true);
			acomp.removeAll(event);
			acomp.setData('isKeyDown', false);
		}
		else if (drp && type === 'multisearch' && window._lyteDropdown.isInput(event)) {
			last = drp.querySelectorAll('lyte-drop-remove')
			if (last.length > 0) {
				drp.component.setData('isKeyDown', true);
				last[last.length - 1].click();
				drp.component.setData('isKeyDown', false);
			}
		}
	}


	else if (
		kc === 27
		|| kc === 9
	) {
		// Escape
		// Close the current opened dropdown
		if (open) {

			open = window._lyteDropdown.traverse(open, ['LYTE-DROP-BOX']);

			if (!open) {
				return;
			}

			component = open.origindd.component;

			if (kc === 9 && window._lyteDropdown.shouldTrapFocus(component)) {
				window._lyteDropdown.loopIfBoundaryElements(component, event);
			}
			else {
				if (component.beforeHide.call(component, component.childComp, event, component.getData('ltPropFreeze'))) {
					return;
				}

				// open.classList.add('lyteDropdownHidden')
				component.closeDrop.call(component, component.childComp, event, component.getData('ltPropFreeze'));
			}
		}
	}
});

document.addEventListener('keypress', function (event) { //It searches the dropdown items matching the pressed charactes when the dropdown is open
	var kc = event.which || event.keyCode, i = 0, children, pos,
		open = document.querySelectorAll('lyte-drop-box:not(.lyteDropdownHidden)'), drp, searchMethod;

	var isMatchFound = function (itemValue, searchKey, method) {
		if (method === 'contains') {
			if (itemValue.trim().toLowerCase().indexOf(searchKey.toLowerCase()) != -1) {
				return true;
			}
		}
		else if (method === 'startsWith') {
			if (itemValue.trim().substring(0, searchKey.length).toLowerCase() === searchKey.toLowerCase()) {
				return true;
			}
		}

		return false;
	};

	if (
		open.length > 0
		&& ((kc >= 65 && kc <= 90)
			|| (kc >= 97 && kc <= 122)
			|| (kc >= 48 && kc <= 57))
	) {
		window._lyteDropdown.pressedCharacter = _lyteDropdown.pressedCharacter ? _lyteDropdown.pressedCharacter += String.fromCharCode(kc) : String.fromCharCode(kc);
		if (_lyteDropdown.checkDDtimeoutId) {
			clearTimeout(_lyteDropdown.checkDDtimeoutId);
		}

		_lyteDropdown.checkDDtimeoutId = setTimeout(function () {
			_lyteDropdown.pressedCharacter = null;
		}, 500);

		// activeElements can be null - LOL IE
		drp = (document.activeElement || {}).parentElement;
		drp = (drp || {}).tagName == "LYTE-DROPDOWN" ? drp : null;
		if (open.length > 0 && drp) {
			for (var i = 0; i < open.length; i++) {
				// breaking change
				if (open[i].origindd == drp) {
					break;
				}
			}

			open = open[i];
			drp = open.origindd;
			children = open.querySelectorAll('lyte-drop-item');
			searchMethod = drp.getData('ltPropItemSearchType');

			if (
				_lyteDropdown.cachePreviousVal.char
				&& _lyteDropdown.cachePreviousVal.char == _lyteDropdown.pressedCharacter
				&& (_lyteDropdown.cachePreviousVal.pos + 1) < children.length
				&& isMatchFound(children[_lyteDropdown.cachePreviousVal.pos + 1].textContent, _lyteDropdown.pressedCharacter, searchMethod)/* children[ _lyteDropdown.cachePreviousVal.pos + 1 ].textContent.trim().substring( 0, _lyteDropdown.pressedCharacter.length ).toLowerCase() === _lyteDropdown.pressedCharacter.toLowerCase()*/
			) {
				pos = _lyteDropdown.cachePreviousVal.pos + 1;
			}
			else {
				for (i = 0; i < children.length; i++) {
					if (isMatchFound(children[i].textContent, _lyteDropdown.pressedCharacter, searchMethod) /*children[ i ].textContent.trim().substring( 0, _lyteDropdown.pressedCharacter.length ).toLowerCase() === _lyteDropdown.pressedCharacter.toLowerCase()*/) {
						pos = i;
						break;
					}
				}
			}

			if (pos != undefined) {
				var selected = open.querySelectorAll('.lyteDropdownSelection');
				for (var j = 0; j < selected.length; j++) {
					selected[j].classList.remove('lyteDropdownSelection');
				}
				children[pos].classList.add('lyteDropdownSelection');
				drp.component.getActiveElement().setAttribute('aria-activedescendant', children[pos].getAttribute('id'));
				var scrollDiv = open.querySelector('lyte-drop-body');

				if (scrollDiv.contains(children[pos])) {
					// footers can have lyte-drop-items. So no scrolling there.
					scrollDiv.scrollTop += parseInt(children[pos].getBoundingClientRect().top - scrollDiv.getBoundingClientRect().top);
				}

			}

			_lyteDropdown.cachePreviousVal.char = _lyteDropdown.pressedCharacter;
			_lyteDropdown.cachePreviousVal.pos = pos;
		}

	}

});

if (!window._lyteUiUtils.isMobile) {
	window.addEventListener('resize', function (event) {
		delete this._hgt;

		// Resizing is counted as an user action which flushes the autoClosed property
		window._lyteDropdown.autoClosed = null;

		var open = document.querySelector('lyte-drop-box:not(.lyteDropdownHidden)'),
			shouldUseSave;

		if (open && !open.origindd.component._preventSetcss) {
			shouldUseSave = open.origindd.component.getData('ltPropFixPositionOnOpen');

			open.origindd.component.setCss(true, shouldUseSave);
		}
	});
}

if (!window._lyteUiUtils.registeredCustomElements['lyte-drop-body']) {
    window._lyteUiUtils.registeredCustomElements['lyte-drop-body'] = true;

    /**
	   * @customElement lyte-drop-box
	   */

    class LyteDropBodyCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return [];
        }

        connectedCallback() {
            var lyteNode = this.$node;

            if (!lyteNode._attributesSet) {
				var cur = window._lyteDropdown.traverse(lyteNode, ['LYTE-DROPDOWN', 'BODY']), dropdown, component, ariaButton;

				if (cur.tagName === 'BODY') {
					cur = lyteNode.origindd;
				}

				if (!cur || cur.tagName !== 'LYTE-DROPDOWN') {
					return;
				}

				dropdown = cur;
				component = dropdown.component;

				// if( component.getData( 'ltPropType' ) === 'multisearch' || component.getData( 'ltPropType' ) === 'multiple' ) {
				// 	this.setAttribute( 'aria-multiselectable', 'true' );
				// }
				// else {
				// 	this.setAttribute( 'aria-multiselectable', 'false' );
				// }
				lyteNode._attributesSet = true;

				lyteNode.setAttribute('role', 'listbox');
				if (!lyteNode.getAttribute('id')) {
					lyteNode.setAttribute('id', 'Lyte_Drop_Body_' + window._lyteDropdownBodyId++);
				}

				ariaButton = component.getAriaButton();

				if (ariaButton) {
					ariaButton.setAttribute('aria-controls', lyteNode.getAttribute('id'));
				}

			}
        }

        _() {
            _;
        }
    }

    LyteDropBodyCustomElements.options = {clone : {allCallbacks : false}};

    LyteDropBodyCustomElements.register("lyte-drop-body");
}

if (!window._lyteUiUtils.registeredCustomElements['lyte-drop-item']) {
    window._lyteUiUtils.registeredCustomElements['lyte-drop-item'] = true;

    /**
	 * @customElement lyte-drop-item
	 */

    class LyteDropItemCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return ['selected'];
        }

        connectedCallback() {
            var lyteNode = this.$node;


            if (!lyteNode._eventRegistered) {

				lyteNode._eventRegistered = true;

				lyteNode.setAttribute('aria-selected', 'false');
				lyteNode.setAttribute('role', 'option');

				if (!lyteNode.getAttribute('id')) {
					lyteNode.setAttribute('id', 'Lyte_Drop_Item_' + window._lyteDropdownItemId++);
				}

				// this.setAttribute( 'tabindex', '-1' );


				lyteNode.addEventListener('mouseenter', function () {
					var title = lyteNode.getAttribute('data-title'),
						showCustomTooltip = lyteNode.getAttribute( 'data-custom-tooltip' ),
						width = lyteNode.offsetWidth,
						scrollWidth = lyteNode.scrollWidth,
						component = window._lyteDropdown.getDropdownFromItem(lyteNode), tooltipConfig, cls, showToolTip;

					if (!component) {
						return;
					}

					if (component.getData('ltPropDisableItemTooltip') || showCustomTooltip === "true" ) {
						return;
					}

					tooltipConfig = component.getData('ltPropTooltip');
					cls = component.getData('ltPropTooltipClass');

					title = title || lyteNode.innerText.trim();

					showToolTip = (width < scrollWidth && !window._lyteDropdown.isEmpty(tooltipConfig));
					lyteNode.setAttribute('lt-prop-title', showToolTip ? title : '');

					if (showToolTip) {
						lyteNode.setAttribute('lt-prop-tooltip-config', JSON.stringify(tooltipConfig));
						lyteNode.setAttribute('lt-prop-tooltip-class', cls);
					}

				});
			}

            var component = window._lyteDropdown.getDropdownFromItem(lyteNode);
            lyteNode._dropdownComponent = component;

            window.clearTimeout(component._FFBodyScrollOnAdd);

            component._FFBodyScrollOnAdd = window.setTimeout(function () {
				var isFF = component.isFF(),
					isOpen = component.getData('ltPropIsOpen');

				if (!isOpen) {
					return;
				}

				if (isFF && component.isBodyScrollable()) {
					component.addProperScrollbar();
				}
			}, 0);
        }

        disconnectedCallback() {
            var lyteNode = this.$node;
            var component = lyteNode._dropdownComponent;

            if (!component) {
				return;
			}

            window.clearTimeout(component._FFBodyScrollOnRemove);

            component._FFBodyScrollOnRemove = window.setTimeout(function () {
				var isFF = component.isFF(),
					isOpen = component.getData('ltPropIsOpen');

				if (!isOpen) {
					return;
				}

				if (isFF && !component.isBodyScrollable()) {
					component.removeScrollbar();
				}
			}, 0);
        }

        attributeChangedCallback(attr, oldValue, newValue, namespace) {
            var lyteNode = this.$node;
            var cur = lyteNode, drp, component, type, sel, res,
				src = lyteNode.getAttribute('data-value'),
				attributeChanged;

            if (oldValue === null && newValue !== null || oldValue !== null && newValue === null) {
				attributeChanged = true;
			}

            if (!attributeChanged) {
				return;
			}

            if (attr == 'selected') {
				if (lyteNode.hasAttribute('selected')) {

					lyteNode.setAttribute('aria-selected', 'true');

					cur = window._lyteDropdown.traverse(cur, ['LYTE-DROP-BOX', 'BODY']);

					if (!cur || cur.tagName == 'BODY') {
						return;
					}

					drp = cur.origindd;
					if (!drp) {
						cur = window._lyteDropdown.traverse(cur, ['LYTE-DROPDOWN', 'BODY']);
						drp = cur;
					}

					component = drp.component;

					if (!component) {
						return;
					}

					if (component.getData('preventSel')) {
						return;
					}

					type = component.getData('ltPropType');

					if (type == 'multiple'
						|| type == 'multisearch'
					) {
						sel = component.getData('ltPropSelected');
						if ((sel && sel.length == 2) || !sel) {
							sel = JSON.stringify([src]);
							// not setting prev to true here
							component.setData('ltPropSelected', sel);
						}
						else {
							res = JSON.parse(sel);
							res.push(src);
							// not setting prev to true here
							component.setData('ltPropSelected', JSON.stringify(res));
						}
					}
					else {
						component.setData('ltPropSelected', src);
					}
				}
				else {
					lyteNode.setAttribute('aria-selected', 'false');
				}
			}
        }

        _() {
            _;
        }
    }

    LyteDropItemCustomElements.options = {clone : {allCallbacks : false}};

    LyteDropItemCustomElements.register('lyte-drop-item');
}



window._lyteDropdown = {
	// When multiple dropdowns have multiple callbacks returning a promise, store the last dropdown
	lastDropdownWithAPromise: null,

	// Whether the dropdown should not be closed when the input is focused out
	preventClose: false,

	// Current dropdown that was autoClosed
	autoClosed: null,

	// Whether a focus happened
	focusOut: false,

	focusableElementsSelector: 'input:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"]), textarea:not(:disabled), select:not(:disabled), a',

	shouldTrapFocus: function (comp) {
		var dropdown = comp.$node,
			box = dropdown.getDropBox(),
			focusableElements = comp.getFocusableElements(),
			shouldTrapFocus = comp.getData('ltPropAllowFocusableElements') && focusableElements.length > 1;

		return shouldTrapFocus;
	},

	loopIfBoundaryElements: function (comp, event) {
		var focusableElements = comp.getFocusableElements(),
			length = focusableElements.length,
			dropdown = comp.$node,
			activeElement = document.activeElement;

		if (event.shiftKey && focusableElements[0] === activeElement) {
			event.preventDefault();
			focusableElements[length - 1].focus();
		}

		if (!event.shiftKey && focusableElements[length - 1] === activeElement) {
			event.preventDefault();
			focusableElements[0].focus();
		}

	},

	closeOtherDropdowns: function (currentDropdown) {
		var openDropdowns = window._lyteUiUtils.getVisibleDropdowns() || [];

		for (var i = 0; i < openDropdowns.length; i++) {
			if (openDropdowns[i] !== currentDropdown) {
				openDropdowns[i].close();
			}
		}
	},

	openFocusedDropdown: function (keyCode) {
		var dropdown = window._lyteDropdown.getDropdownWithFocusedInput(),
			type, BACKSPACE = 8;

		if (keyCode == 27 || keyCode == 9 || !dropdown) {
			return;
		}

		type = (dropdown.ltProp('type') || '').toLowerCase();

		if (type === 'multisearch' && !dropdown.ltProp('isOpen')) {
			dropdown.open();

			if (keyCode === BACKSPACE) {
				return false;
			}

			return true;
		}
	},

	getDropdownFromItem: function (cur) {
		cur = window._lyteDropdown.traverse(cur, ['LYTE-DROP-BOX', 'BODY']);

		if (!cur || cur.tagName == 'BODY') {
			return;
		}

		var drp = cur.origindd;

		if (!drp) {
			cur = window._lyteDropdown.traverse(cur, ['LYTE-DROPDOWN', 'BODY']);
			drp = cur;
		}

		var component = drp.component;

		return component;
	},

	getDropdownWithFocusedInput: function () {
		var activeElement = document.activeElement, dropdown;

		if (activeElement
			&& activeElement.nodeName.toLowerCase() === 'input'
		) {
			dropdown = window._lyteDropdown.traverse(activeElement, ['HTML', 'LYTE-DROPDOWN']);
		}

		if (dropdown && dropdown.nodeName.toLowerCase() === 'lyte-dropdown') {
			return dropdown;
		}

	},

	/**
	 * Gets the current visible dropbox from the body
	 * This was added to fix a performance problem in CRM - kural's subform feature
	 *
	 *
	 */

	getVisibleDropbox: function () {
		var childs = (document.body || {}).children || [],
			i = 0;

		for (; i < childs.length; i++) {
			if (
				childs[i].tagName === 'LYTE-DROP-BOX'
				&& window._lyteDropdown.isVisible(childs[i])
			) {
				return childs[i];
			}
		}
	},

	/**
	 * Check if the element is a scrollbar
	 * @param {HTMLElement} element - the clicked element
	 *
	 */

	isScrollBar: function (element) {
		return element
			&& (element.classList.contains('lyteScrollContainer') || element.classList.contains('lyteScrollDiv'));
	},

	/**
	 * Checks if the dropdown is within the visible bounds
	 * @param {Object} visibleBound - The visible bound of the scrollable element
	 * @param {Object} dropBound - The dropdown's boundaries
	 *
	 */

	isInBounds: function (visibleBound, dropBound) {
		return visibleBound.top < dropBound.top
			&& visibleBound.bottom > dropBound.bottom
			&& visibleBound.left < dropBound.left
			&& visibleBound.right > dropBound.right;
	},

	/**
	 * This is going to construct the visible bound of the scrolling container
	 * @param {object} - getBoundingClientRect of the element
	 * @param {boolean} - If it is a boolean or not
	 * @param {HTMLElement} - The current scrollable div
	 *
	 */

	buildVisibleBounds: function (rect, isDoc, cur) {
		var top = isDoc ? 0 : Math.max(rect.top, 0),
			left = isDoc ? 0 : Math.max(rect.left, 0),
			right = isDoc ? window.innerWidth : Math.min(window.innerWidth, rect.left + cur.offsetWidth),
			bottom = isDoc ? window.innerHeight : Math.min(window.innerHeight, rect.top + cur.offsetHeight);

		return {
			top: top,
			left: left,
			right: right,
			bottom: bottom
		};
	},

	/**
	 * This is used to find the current auto closed dropdown
	 * @param {HTMLElement} cur - The cur scrolled element
	 *
	 */

	openAutoClosedDropdown: function (cur, event) {
		var isDocument = cur === document,
			scrollRect, visibleBound,
			drop = window._lyteDropdown.autoClosed, comp, link;

		if (!drop) {
			return;
		}

		scrollRect = isDocument ? {} : cur.getBoundingClientRect();
		visibleBound = window._lyteDropdown.buildVisibleBounds(scrollRect, isDocument, cur)

		comp = drop.component,
			link = comp.childComp;

		if (drop
			&& cur.contains(drop)
			&& window._lyteDropdown.isInBounds(visibleBound, drop.getBoundingClientRect())

			// safety
			&& link.classList.contains('lyteDropdownHidden')
		) {
			comp.beforeScrollOpen(event);
			drop.toggle();
			window._lyteDropdown.autoClosed = null;
		}
	},

	/**
	 * This is used to determine whether an object is empty or not
	 * @param {Object} obj - The object to be checked
	 *
	 */

	isEmpty: function (obj) {
		for (var key in obj) {
			return false;
		}

		return true;
	},

	/**
	 * This is going to build the boundary parameter for a particular dropdown instance
	 * @param {Component} comp - The lyte-dropdown component object
	 *
	 */

	buildBounds: function (comp) {
		var bound = comp.getData('ltPropBoundary') || {},
			scope = comp.getData('ltPropScope'), parent, boundingRects;

		if (scope !== 'window') {
			parent = $L(comp.$node).closest(scope).get(0);

			if (parent) {
				boundingRects = parent.getBoundingClientRect();

				return {
					left: Math.max(0, boundingRects.left),
					top: Math.max(0, boundingRects.top),
					right: Math.min(window.innerWidth, boundingRects.right),
					bottom: Math.min(window.innerHeight, boundingRects.bottom)
				};
			}
		}

		return {
			left: bound.left || 0,
			right: bound.right || window.innerWidth,
			top: bound.top || 0,
			bottom: bound.bottom || window.innerHeight
		}
	},

	/**
	 * This is going to traverse up the dom to check if the required tagNames are present
	 * @param {Element} node - The element whose parents need to be traversed
	 * @param {Array} arr - The set of tag names to check against
	 *
	 */

	traverse: function (node, arr) {
		while (node && !~arr.indexOf(node.tagName)) {
			node = node.parentNode;
		}

		return node;
	},

	/**
	 * Find the next/previous element which is visible
	 * @param {NodeList} elems - The set of all elements to test against
	 * @param {integer} i - index from which we need to search
	 * @param {boolean} forward - whether to move forward or backward
	 *
	 *
	 */

	find: function (elems, i, forward) {
		var inc = forward ? 1 : -1,
			len = elems.length;

		for (
			;
			forward ?
				i < len
				: i > -1;

			i = i + inc
		) {
			if (window._lyteDropdown.isVisible(elems[i])
				&& elems[i].getAttribute('disabled') !== "true"
			) {
				return i;
			}
		}

		return forward ? len : -1;
	},

	/**
	 * This is going to check if the element is visible or not
	 * @param {Element} item - The item to check against
	 *
	 */

	isVisible: function (item) {
		return !!(item.offsetWidth || item.offsetHeight || item.getClientRects().length);
	},

	/**
	 * Checks if the current target is an input within the dropdown and with no value
	 * @param event - the keydown event
	 *
	 */

	// Initialize variables
	pressedCharacter: null,

	checkDDtimeoutId: null,

	cachePreviousVal: {},

	isInput: function (event) {
		// There maybe a case when a dropdown might be opened on pressing on an input with toggle. When backspace is pressed
		// on that input the global event handler for keydown might misbehave by trying to remove the last item
		// Fix is to check if the input is present inside the open dropdown
		var open = event.target;

		open = window._lyteDropdown.traverse(open, ['LYTE-DROPDOWN']);

		if (open
			&& event.target.tagName === 'INPUT'
			&& event.target.type === 'text'
			&& !event.target.value
		) {
			return true;
		}

		return false;
	},

	/**
	 * Unmark all nodes except the current components nodes
	 *
	 */

	unmark: function (comp) {
		var nodes = document.querySelectorAll('.lyteDropMark'),
			i = 0, len = nodes.length, par;

		for (; i < len; i++) {
			// This is stupid. Change it later.
			//nodes[ i ].classList.remove( 'lyteDropMark' );
			par = comp ? window._lyteDropdown.findParent(nodes[i]) : undefined;
			par && par == comp.$node ? undefined : nodes[i].classList.remove('lyteDropMark');
		}
	},

	findParent: function (node) {
		node = window._lyteDropdown.traverse(node, ['LYTE-DROPDOWN'])

		return node;
	},

	getActive: function () {
		var node = document.querySelector('.lyteDropMark');

		return window._lyteDropdown.findParent(node);
	}
}

if (!window._lyteUiUtils.registeredCustomElements['lyte-drop-group']) {
    window._lyteUiUtils.registeredCustomElements['lyte-drop-group'] = true;

    /**
	 * @customElement lyte-drop-group
	 */

    class LyteDropGroupCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return ['label'];
        }

        attributeChangedCallback(attr, oldValue, newValue, namespace) {
            var lyteNode = this.$node;
            var node, value;

            if (attr == 'label') {
				node = lyteNode.querySelector('lyte-drop-label');
				value = lyteNode.getAttribute('label');
				if (node) {
					node.textContent = value;
				}
				else {
					node = document.createElement('lyte-drop-label');
					node.textContent = value;
					lyteNode.insertBefore(node, lyteNode.children[0]);
				}
			}
        }

        _() {
            _;
        }
    }

    LyteDropGroupCustomElements.options = {clone : {allCallbacks : false}};

    LyteDropGroupCustomElements.register("lyte-drop-group");
}

/**
 * @syntax nonYielded
 * <lyte-dropdown lt-prop-options='[{"name": "Option 1", "value": "1"}, {"name": "Option 2", "value": "2"}]' lt-prop-user-value="name" lt-prop-system-value="value"></lyte-dropdown>
 */

/**
 * @syntax yielded
 * <lyte-dropdown>
 *     <template is="registerYield" yield-name="yield">
 *         <lyte-drop-button>
 *             Option 1
 *         </lyte-drop-button>
 *         <lyte-drop-box>
 *             <lyte-drop-body>
 *                 <lyte-drop-item data-value="1">Option 1</lyte-drop-item>
 *                 <lyte-drop-item data-value="2">Option 2</lyte-drop-item>
 *             </lyte-drop-body>
 *         </lyte-drop-box>
 *      </template>
 * </lyte-dropdown>
 */

/**
 * @syntax
 * @attribute ltPropType=multiple
 * <lyte-dropdown lt-prop-selected='["1"]' lt-prop-type="multiple">
 *     <template is="registerYield" yield-name="yield">
 *         <lyte-drop-box>
 *             <lyte-drop-body>
 *                 <lyte-drop-item data-value="1">Option 1</lyte-drop-item>
 *                 <lyte-drop-item data-value="2">Option 2</lyte-drop-item>
 *             </lyte-drop-body>
 *         </lyte-drop-box>
 *      </template>
 * </lyte-dropdown>
 */

/**
 * @syntax
 * @attribute ltPropType=multisearch
 * <lyte-dropdown lt-prop-selected='["1"]' lt-prop-type="multisearch">
 *     <template is="registerYield" yield-name="yield">
 *         <lyte-drop-box class="bodyContainer">
 *             <lyte-drop-body>
 *                 <lyte-drop-item data-value="1">Option 1</lyte-drop-item>
 *                 <lyte-drop-item data-value="2">Option 2</lyte-drop-item>
 *             </lyte-drop-body>
 *         </lyte-drop-box>
 *      </template>
 * </lyte-dropdown>
 */




export { LyteDropdownComponent };




LyteDropdownComponent.register("lyte-dropdown", {
    hash: "LyteDropdownComponent_9",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});




