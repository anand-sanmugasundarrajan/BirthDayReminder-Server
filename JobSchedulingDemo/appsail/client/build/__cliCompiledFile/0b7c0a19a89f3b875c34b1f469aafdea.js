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

import { prop } from "/node_modules/@slyte/core/index.js";
import { Component, LyteUiComponentComponentRegistry } from "/node_modules/@zoho/lyte-ui-component/components/component.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js"
/**
 * Renders a Carousel
 * @component lyte-carousel
 * @version  3.0.0
 * @methods onBeforePrev,onBeforeNext,onAfterNext,onAfterPrev
 * @utility moveSlideByIndex,reset,getActiveSlideIndex
 */
class LyteCarouselComponent extends Component {
    constructor() {
        super();
    }

    data(arg1) {
		return Object.assign(super.data({
			/** 
			 * @componentProperty {boolean} ltPropAutoPlay
			 * @version 3.0.0
			 * @default false
			 */
			ltPropAutoPlay : prop( 'boolean', {
			 'default' :  window._lyteUiUtils.resolveDefaultValue( 'lyte-carousel', 'autoPlay', false )
			  }),
			/** 
			 * @componentProperty {slide | fade} ltPropEffect
			 * @version 3.0.0
			 * @default slide
			 */
			ltPropEffect : prop( 'string', { 
			 'default' :  window._lyteUiUtils.resolveDefaultValue( 'lyte-carousel', 'effect', 'slide' ) 
			}),
			/** 
			 * @componentProperty {number} ltPropActiveIndex
			 * @version 3.0.0
			 * @default 0
			 */

			ltPropActiveIndex : prop( 'number', {
			 'default' : 0
			}),
			/** 
			 * @componentProperty {boolean} ltPropMoreRecords
			 * @version 3.0.0
			 * @default false
			 */
			ltPropMoreRecords : prop( 'boolean', {
			 'default' : false
			}),
			/** 
			 * @componentProperty {number} ltPropRecords
			 * @version 3.0.0
			 */
			ltPropRecords : prop( 'number', {
			 'default' : undefined
			}),
			/** 
			 * @componentProperty {number} ltPropAutoPlayDuration
			 * @version 3.0.0
			 * @default 3000
			 */
			ltPropAutoPlayDuration : prop('number',{
			'default' :  window._lyteUiUtils.resolveDefaultValue( 'lyte-carousel', 'autoPlayDuration', 3000 )
			}),
			/** 
			 * @componentProperty {boolean} ltPropAutoPlayPause
			 * @version 3.0.0
			 * @default false
			 */
			ltPropAutoPlayPause : prop( 'boolean', {
			 'default' :  window._lyteUiUtils.resolveDefaultValue( 'lyte-carousel', 'autoPlayPause', false )
			}),
			/** 
			 * @componentProperty {array} ltPropData
			 * @version 3.0.0
			 * @default []
             *
			 */
			ltPropData : prop( 'array', {
			 'default' : []
			}),
			/**
			 * @componentProperty {boolean} ltPropAria
			 * @version 3.1.0
			 * @default true
			 */
			ltPropAria : prop( 'boolean', {
				'default':true
			}),
			/**
			 * @componentProperty {object} ltPropAriaAttributes
			 * @version 3.1.0
			 * @default {}
			 */
			ltPropAriaAttributes : prop( 'object', { 
				'default': {}
			}),
			/**
			 * @componentProperty {horizontal | vertical} ltPropOrientation
			 * @version 3.82.0
			 * @default "horizontal"
			 */
			ltPropOrientation : prop( 'string', { 
				'default': "horizontal"
			}),
			/**
			 * @componentProperty {string} ltPropTabIndex
			 * @version 3.82.0
			 * @default 0
			 */
			ltPropTabIndex : prop( 'string', {
				'default' : '3'
			}),
			ltPropDataTabIndex : prop( 'number', {
				'default' : 1
			}),
			ltPropArrowKey : prop( 'boolean',{
				default : false
			}),
			coordinates : prop( 'object',{
				'default': {}
			}),
			currentActiveIndex : prop( 'number', {
			 'default' : 0
			}),
			prev : prop( 'boolean',{
				'default' : false
			}),
			'start': prop( 'number' )

		}), arg1);		
	}

    didConnect() {
		var carouselContent = this.$node.querySelector('lyte-carousel-content');
		var activeIndex = this.getData( 'ltPropActiveIndex' );

		if(this.getData('ltPropAria') && carouselContent){
			carouselContent.setAttribute('aria-live', this.getData('ltPropAutoPlay') ? 'off' : 'polite') 
		}
		if( activeIndex ) {
			this.setData( 'currentActiveIndex', activeIndex )
		}
		if( this.getData( 'ltPropRecords' ) >= 1 ) {
			this.setActiveItem()
		}
		// if( this.getData( 'ltPropRecords' ) > 1 ) {
			this.setMethod();
		// }
		this.$node.moveSlideByIndex = function(index){
			var activeIndex = this.getData( 'currentActiveIndex' ),
			itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ),
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ activeIndex +'"] ' );
			if( activeIndex >= 0 && activeIndex < itemList.length ){
				itemList[activeIndex].classList.remove('lyteActive')
				itemList[activeIndex].setAttribute('tabindex', -1)
				itemList[activeIndex].setAttribute('data-tabindex', -1)
				itemList[activeIndex].setAttribute('aria-hidden', false)
				if(indicatorList) {
					indicatorList.classList.remove('lyteActive')
					indicatorList.setAttribute('tabindex',-1)
					indicatorList.setAttribute('data-tabindex',-1)

				}
			}
			clearTimeout( this._nextTimeout )
			clearTimeout( this._nextFadeTimeout )
			this.setData( 'currentActiveIndex', index )
			this.setActiveItem()
		}.bind( this ) 
		this.$node.reset = function(){
			setTimeout( function() {
				var activeIndex = this.getData( 'currentActiveIndex' ),
				itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ),
			 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ activeIndex +'"] ' );
				if( activeIndex >= 0 && activeIndex < itemList.length ){
					itemList[activeIndex].classList.remove('lyteActive')
					itemList[activeIndex].setAttribute('tabindex',-1)
					itemList[activeIndex].setAttribute('data-tabindex',-1)
					itemList[activeIndex].setAttribute('aria-hidden', false)

					if(indicatorList) {
						indicatorList.classList.remove('lyteActive')
						indicatorList.setAttribute('tabindex',-1)
						indicatorList.setAttribute('data-tabindex',-1)

					}
				}
				clearTimeout( this._nextTimeout )
				clearTimeout( this._nextFadeTimeout )
				this.setData( 'currentActiveIndex',this.getData( 'ltPropActiveIndex' ) )
				this.setActiveItem()

				this.setMethod();
			}.bind( this ) )
		}.bind( this ) 
		this.$node.getActiveSlideIndex =function(){
			return this.getData('currentActiveIndex')
		}.bind(this)
		this.$node.focus =function(){
			document.addEventListener('keyup', this._keyupEvents)
		}.bind(this)
		if( this.getData('ltPropEffect') === "swipe" ){
			this._carouselTochStart = this.carouselTouchStart.bind(this,carouselContent)
			carouselContent.addEventListener( 'touchstart', this._carouselTochStart)
		}
		if(this.getData('ltPropArrowKey')){
			this._carouselClick = this.carouselClick.bind(this)
			document.addEventListener('click', this._carouselClick)
		}
		this._keyupEvents = this.keyupEvents.bind(this)

	}

    carouselClick(event) {
		const target = event.target
		if(target === this.$node || this.$node.contains(target)){
			document.addEventListener('keyup', this._keyupEvents)
		} else{
			document.removeEventListener('keyup', this._keyupEvents)
		}
	}

    keyupEvents(event) {
		const key = (event.keyCode || event.which)
		const effect  = this.getData('ltPropEffect').toLowerCase()
		if(key == 37){
			if(effect !== 'fade'){
				this.prevClick(event)
			} else{
				this.prevFadeClick(event)
			}
		} else if(key == 39){
			if(effect !== 'fade'){
				this.nextClick(event)
			} else{
				this.nextFadeClick(event)
			}
		}
	}

    didDestroy() {
		if(this.getData('ltPropArrowKey')){
			document.removeEventListener('click', this._carouselClick)
		}
		clearInterval( this._autoId )
		delete this._autoId
	}

    carouselTouchStart(carouselContent, event) {
		this.setData( 'prev', false );

		if( event.touches.length > 1 ) {
				this.setData( 'prev', true );

				return ;
		}

		var touch = event.targetTouches[ 0 ],
		cords = {
				x: touch.clientX,
				y: touch.clientY
		}
		this.setData('coordinates',cords)
		window.start = new Date().getTime();
		this.setData('start', start)
		this._carouselTouchEnd = this.carouselTouchEnd.bind(this,carouselContent)
		// carouselContent.addEventListener('touchmove',this._carouselTouchMove )
		carouselContent.addEventListener('touchend',this._carouselTouchEnd)
	}

    carouselTouchMove(carouselContent, event) {
		event.preventDefault()
	}

    carouselTouchEnd(carouselContent, event) {
		var prev = this.getData( 'prev' );

			// prev will be false only when you do a single finger swipe
			// Multi finger swipes return out of execution
			if( prev ) {
				return ;
			}

			var start = this.getData( 'coordinates' ),
			x = start.x, y = start.y,
			touch = event.changedTouches[ 0 ],
			diffX = x - touch.clientX
			window.diffY = y - touch.clientY
			window.parent = this.$node.querySelector( 'lyte-carousel-content' ),
			window.rect = parent.getBoundingClientRect(),
			window.width = rect.width,
			window.height = rect.height,
			window.xTolerance = width * 0.2,
			window.yTolerance = height * 0.15,
			window.begin = this.getData('start'),
			window.delay = (new Date().getTime()) - begin;
			var orientation = this.getData("ltPropOrientation");
				if (!orientation || orientation === "horizontal" || orientation !== "vertical") {
					if (delay < 1000 && Math.abs(diffX) > 150) {
						if (diffX < 0) {
							this.prevClick();
						}
						else if (diffX > 0) {
							this.nextClick();
						}
					}
				}
				else if (orientation && orientation === "vertical") { 
					if (delay < 1000 && Math.abs(diffY) > 120) {
						if (diffY < 0) {
							this.prevClick();
						}
						else if (diffY > 0) {
							this.nextClick();
						}
					}
				}
	}

    getCarouselWidget() {
		return this.$node.querySelector( '.lyteCarouselWrapper' );
	}
    checkRecordCountEqualsOne(){
		if( this.getData('ltPropRecords') <= 1 ){
			return true
		}
		return false
	}

    setMethod() {
		if(this.getData('ltPropRecords') > 1 || (this.getData('ltPropData') && this.getData('ltPropData').length >1) || this.getData('ltPropMoreRecords')){
		
		var prev =this.$node.getElementsByTagName( 'lyte-carousel-prev' )[ 0 ],
			next = this.$node.getElementsByTagName( 'lyte-carousel-next' )[ 0 ],
			indicator = this.$node.getElementsByTagName( 'lyte-carousel-indicator' )[ 0 ];
			if( this.getData( 'ltPropEffect' ).toLowerCase() ==  "fade" ) {
				this.$node.classList.add( 'lyteFade' )
				if( prev && this.getData('ltPropRecords') > 1 ) {
					this._prevFadeClick = this.prevFadeClick.bind( this )
					prev.addEventListener( 'click', this._prevFadeClick )
				}
				if( next && !this._nextFadeClick ) {
					this._nextFadeClick = this.nextFadeClick.bind( this )
					next.addEventListener( 'click', this._nextFadeClick )
				}
				if( indicator && this.getData('ltPropRecords') > 1 ) {
					this._indicatorFadeClick = this.indicatorFadeClick.bind( this )
					indicator.addEventListener( 'click', this._indicatorFadeClick )
				}
				this._zeroOpacityTransition = this.zeroOpacityTransition.bind( this )
			}
			else{
				this.$node.classList.add( 'lyteScroll' )
				if( prev && this.getData('ltPropRecords') > 1 ) {
					this._prevClick = this.prevClick.bind( this )
					prev.addEventListener( 'click', this._prevClick )
				}
				if( next && !this._nextClick) {
					this._nextClick = this.nextClick.bind( this )
					next.addEventListener( 'click', this._nextClick )
				}
				if( indicator && this.getData('ltPropRecords') > 1 ) {
					this._indicatorClick = this.indicatorClick.bind( this );
					indicator.addEventListener( 'click', this._indicatorClick )
				}
				this._removePrevClass = this.removePrevClass.bind( this )
				this._removeNextClass = this.removeNextClass.bind( this )
			}
		}
	}
    clearTimeoutAndInterval(){
		clearInterval( this._autoId )
		delete this._autoId
		clearTimeout( this._timeOut1)
		delete this._timeOut1
	}

    carouselContentFocus() {
		var carouselWrapper = this.$node.querySelector( '.lyteCarouselWrapper' );
		var carouselContent = this.$node.querySelector('lyte-carousel-content')
		carouselContent.setAttribute('aria-live','polite')
		this.clearTimeoutAndInterval()

		this._carouselContentFocusOut = this.carouselContentFocusOut.bind( this, carouselWrapper, carouselContent )
		carouselWrapper.addEventListener( 'mouseleave',  this._carouselContentFocusOut)
	}

    carouselContentFocusOut(carouselWrapper, carouselContent) {
		carouselContent.setAttribute('aria-live','off')

		carouselWrapper.removeEventListener( 'mouseleave', this._carouselContentFocusOut )
		if(this.getData('ltPropAutoPlay'))	{
			this.autoPlayFunc();
		}
			
	}

    setActiveItem() {
		var activeIndex = this.getData( 'currentActiveIndex' ),
			itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ),
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ activeIndex +'"] ' );
			if( activeIndex >= 0 && activeIndex < itemList.length ){
				itemList[activeIndex].setAttribute('tabindex', this.getData('ltPropTabIndex'))
				itemList[activeIndex].setAttribute('data-tabindex', this.getData('ltPropDataTabIndex'))

				itemList[ activeIndex ].classList.add( 'lyteActive' );
				itemList[activeIndex].setAttribute('aria-hidden', true)

				if( indicatorList ) {
					indicatorList.setAttribute('data-tabindex', this.getData('ltPropDataTabIndex'))
					indicatorList.setAttribute('tabindex', this.getData('ltPropTabIndex'))

					indicatorList.classList.add( 'lyteActive' ) ;
				}
	
			}
	}

    prevClick(event, index) {
		if( this._prevTrans ) {
			// event.preventDefault();
			// event.stopPropagation();
			console.log('return')

			return;
		}
		else{
			if( this._autoId ) {
				clearInterval( this._autoId )
				this._autoId = false;
			}
			this._prevTrans=true

			var records = this.getData( 'ltPropRecords' ),
		 	currentActive = this.getData( 'currentActiveIndex' ),
		 	itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
			 indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="' +currentActive+ '"] ' );
			 window.res=true;
			if( this.getMethods( 'onBeforePrev' ) ){
				res = this.executeMethod( 'onBeforePrev' , event , this , currentActive ,records);
				delete this._prevTrans

			}
			if(res !== false){
				if( currentActive >= 1 ){
					this.previous( currentActive, index || currentActive-1, itemList, indicatorList, event )
				}
				else if(currentActive==0){
					this.previous( currentActive, index || records-1, itemList, indicatorList, event )
	
				}
			}
			if( this.getData( 'ltPropAutoPlay' )  ) {
				setTimeout( function() {
					this.autoPlayFunc();
				}.bind( this ), 100 )
			}
		}
	}

    nextClick(event, index) {
		var records = this.getData( 'ltPropRecords' ),
		 	currentActive = this.getData( 'currentActiveIndex' ),
		 	res=true,that = this,index;
		if( this._nextTrans) {
			// event.preventDefault();
			// event.stopPropagation();
				return;			
		}
		else{
			
			this.clearTimeoutAndInterval()
			if( this.getMethods( 'onBeforeNext' ) ){
						res = this.executeMethod( 'onBeforeNext' , event , this , currentActive ,records);
						records = this.getData( 'ltPropRecords' )
			}
			if(this.getData( 'ltPropRecords' ) <= 1){
				return
			}
			let itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ currentActive +'"] ' )
			if(res && res.then  ) {
				res.then( function( arg ) {
					if( currentActive >= 0 &&  currentActive < that.getData( 'ltPropRecords' ) ) {
						if( currentActive < that.getData( 'ltPropRecords' ) - 1 ) {
							that.next( currentActive, index || currentActive+1, itemList, indicatorList, event )

						}
						else if( currentActive == that.getData( 'ltPropRecords' ) - 1 ) {
							that.next( currentActive, index || 0, itemList, indicatorList, event )
						}
					}
					if( that.getData('ltPropAutoPlay')  ) {
							that.autoPlayFunc();
					}
					
				}).catch( function( err ) {
					console.error( err );
				} );
			}
			else if( res !== false ) {
				if( currentActive >= 0 && currentActive < records-1 ) {
					this.next( currentActive, index || currentActive+1, itemList, indicatorList, event )
							
				}
				else if( currentActive == records-1 ) {
					this.next( currentActive, index || 0, itemList, indicatorList, event )
				}
				if( this.getData( 'ltPropAutoPlay' )  ) {
					setTimeout( function() {
						this.autoPlayFunc();
					}.bind( this ), 100 )
				}
			}
		}
			
	}

    next(currentActive, nextIndex, itemList, indicatorList, event) {
		debugger
		var res = true, records = this.getData('ltPropRecords')

		this._nextTrans = true
			var duration = parseFloat( window.getComputedStyle( itemList[ currentActive ] ).transitionDuration )
				duration = ( duration * 1000 ) +200
			setTimeout( function() {
					
					if( this._nextTrans ) {
						var itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ),
						indicatorList = this.$node.getElementsByTagName( 'lyte-carousel-indicator-item' ),
						activeItemList = this.$node.querySelectorAll( 'lyte-carousel-item.lyteActive' )
						for( var i=0 ; i<itemList.length; ++i ) {
							if( $L(itemList[ i ] ).hasClass( 'lyteActivePrev' ) ) {
								itemList[ i ].classList.remove( 'lyteActivePrev' )
							}
						}
						if( activeItemList.length > 1 ) {
							for( var i=0 ; i < itemList.length; ++i ) {
								if( i != this.getData( 'ltPropActiveIndex' ) && $L( itemList[ i ] ).hasClass( 'lyteActive' ) ) {
									itemList[ i ].setAttribute('tabindex',-1)

									itemList[ i ].classList.remove( 'lyteActive' )
									itemList[i].setAttribute('aria-hidden', false)

									indicatorList[i].setAttribute('tabindex',-1)

									indicatorList[ i ].classList.remove( 'lyteActive' )

								}
							}
						}
						delete this._nextTrans
					}
			}.bind( this ), duration )
	
			itemList[ nextIndex].classList.add( 'lyteActiveNext' ) 
			this._nextTimeout = setTimeout( function() {
				if( this._nextTrans ) {
					itemList[ currentActive ].addEventListener( 'transitionend', this._removePrevClass )
					itemList[ currentActive ].classList.add( 'lyteActivePrev' ) 
					itemList[ currentActive ].setAttribute('tabindex',-1)

					itemList[ currentActive ].classList.remove( 'lyteActive' ) 
					itemList[currentActive].setAttribute('aria-hidden', false)

					if( indicatorList ) {
						indicatorList.setAttribute('tabindex',-1)

						indicatorList.classList.remove( 'lyteActive' )
 
					}
					itemList[ nextIndex].classList.remove( 'lyteActiveNext' ) 
					// this.setData( 'ltPropActiveIndex',	nextIndex ) ;
					this.setData( 'currentActiveIndex', nextIndex ) ;
					if( this.getMethods( 'onAfterNext' ) ){
						this.executeMethod( 'onAfterNext' , event , this , nextIndex ) ;
					}
				}
			}.bind( this ), 100 )
		
		
	}

    previous(currentActive, prevIndex, itemList, indicatorList, event) {
		var res = true, records = this.getData('ltPropRecords')
		

			this._prevTrans=true

			itemList[ prevIndex ].classList.add( 'lyteActivePrev' ) 
			setTimeout( function() {
				itemList[ currentActive ].addEventListener( 'transitionend', this._removeNextClass )
				itemList[ currentActive ].classList.add( 'lyteActiveNext' ) 
				itemList[ currentActive ].setAttribute('tabindex',-1)

				itemList[ currentActive ].classList.remove( 'lyteActive' ) 
				itemList[ currentActive ].setAttribute('aria-hidden', false)
				this.setData( 'currentActiveIndex', prevIndex )
				console.log(itemList[ prevIndex ].classList)
				setTimeout(function(){
					itemList[ prevIndex ].classList.remove('lyteActivePrev') 
				},10)
				if( indicatorList ) {
					indicatorList.setAttribute('tabindex',-1)

					indicatorList.classList.remove( 'lyteActive' ) 

				}
				// this.setData( 'ltPropActiveIndex', prevIndex )
				if( this.getMethods( 'onAfterPrev' ) ){
					this.executeMethod( 'onAfterPrev' , event , this , prevIndex ) 
				}
			}.bind( this ) )
		
	}

    removePrevClass(event) {
		
			// if(currentActive-1>=0){
				event.currentTarget.classList.remove( 'lyteActivePrev' ) 
				event.currentTarget.removeEventListener( 'transitionend', this._removePrevClass )

			// }

			delete this._nextTrans 
	}

    removeNextClass(event) {
		

		event.currentTarget.classList.remove('lyteActiveNext') ;
		event.currentTarget.removeEventListener('transitionend',this.removeNextClass);
		
		delete this._prevTrans 
	}

    autoPlayFunc() {
		if(this._autoId){
			clearInterval(this._autoId)
			this._autoId = false
		}
		var duration = this.getData('ltPropAutoPlayDuration')
		if(duration ){
			this._autoId=setInterval(function(){
				var effect = this.getData('ltPropEffect') ?  this.getData('ltPropEffect') :'';
				if( effect.toLowerCase() == "fade" && !this._nextFadeTrans ){
					this.nextFadeClick();
				}
				else if( effect.toLowerCase() !== "fade" &&!this._nextTrans ){
					this.nextClick();
				}
			}.bind(this),duration);
		}
	}

    indicatorClick(event) {
		if( this.checkRecordCountEqualsOne() ){
			return
		}
		var index, e = event.target,
		target= $L(e).closest('lyte-carousel-indicator-item')[ 0 ];
		if( target && target.tagName.toLowerCase() == 'lyte-carousel-indicator-item' ){
			index = target.getAttribute('data-value');
			var currentActive = this.getData( 'currentActiveIndex' ),
		 	itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ currentActive +'"] ' ),
			res=true,that = this;

			if( index < currentActive ){
				this.prevClick( event, index );
			}
			else if(index > currentActive ){
				this.nextClick( event, index );

			}
		}
	}

    prevFadeClick(event, index) {
		if( this._prevFadeTrans ) {
			// event.preventDefault()
			// event.stopPropagation()
			return;
		}
		else{
			if( this._autoId ) {
				clearInterval( this._autoId )
				this._autoId = false;
			}
			var records = this.getData( 'ltPropRecords' ),
		 	currentActive = this.getData( 'currentActiveIndex' ),
		 	itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
			indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="' +currentActive+ '"] ' ),
			res=true;
			if( this.getMethods( 'onBeforePrev' ) ){
				res = this.executeMethod( 'onBeforePrev' , event , this , currentActive ,records );
			}
			if(res !== false){
				if( currentActive >= 1 ){
					this.previousFade( currentActive, index || currentActive-1, itemList, indicatorList, event )
				}
				else if( currentActive==0 ) {
					this.previousFade( currentActive, index || records-1, itemList, indicatorList, event )
	
				}
			}
			if( this.getData( 'ltPropAutoPlay' )  ) {
				setTimeout( function() {
					this.autoPlayFunc();
				}.bind( this ), 100 )
			}
		}
	}

    previousFade(currentActive, prevIndex, itemList, indicatorList, event) {
		this._prevFadeTrans=true

		setTimeout( function() {
			itemList[ prevIndex ].addEventListener( 'transitionend', this._zeroOpacityTransition )
			itemList[ currentActive ].classList.remove( 'lyteActive' ) ;
			itemList[ currentActive ].setAttribute('tabindex',-1)
			itemList[ currentActive ].setAttribute('data-tabindex',-1)

			itemList[ currentActive ].setAttribute('aria-hidden', false)

			itemList[ prevIndex ].classList.add('lyteActive') ;
			itemList[ prevIndex ].setAttribute('tabindex', this.getData('ltPropTabIndex'))
			itemList[ prevIndex ].setAttribute('data-tabindex', this.getData('ltPropDataTabIndex'))

			itemList[ prevIndex ].setAttribute('aria-hidden', true)

			if( indicatorList ) {
				indicatorList.classList.remove( 'lyteActive' ) ;
				indicatorList.setAttribute('tabindex',-1)
				indicatorList.setAttribute('data-tabindex',-1)

			}
			this.setData( 'currentActiveIndex', prevIndex );
			if( this.getMethods( 'onAfterPrev' ) ){
				this.executeMethod( 'onAfterPrev' , event , this , prevIndex ) 
			}
		}.bind( this ) )
}

    zeroOpacityTransition(event) {
		event.currentTarget.removeEventListener( 'transitionend', this._zeroOpacityTransition )
		
		delete this._prevFadeTrans ;
		delete this._nextFadeTrans ;
	}

    nextFadeClick(event, index) {
		
		var records = this.getData( 'ltPropRecords' ),
		 	currentActive = this.getData( 'currentActiveIndex' ),
		 	res=true,that = this,index;
		if( this._nextTrans ) {
				// event.preventDefault();
				// event.stopPropagation();
				return;			
		}
		else{

			this.clearTimeoutAndInterval()
			if( this.getMethods( 'onBeforeNext' ) ){
						res = this.executeMethod( 'onBeforeNext' , event , this , currentActive ,records );
						records = this.getData( 'ltPropRecords' )
			}
			if(this.getData( 'ltPropRecords' ) <= 1){
				return
			}
			let itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ currentActive +'"] ' )
			if( res && res.then) {
				res.then(function( arg ) {
					if( currentActive >= 0 &&  currentActive < that.getData( 'ltPropRecords' ) ) {
						if( currentActive < that.getData( 'ltPropRecords' )-1 ) {
							that.nextFade( currentActive, index || currentActive+1, itemList, indicatorList, event )

						}
						else if( currentActive == that.getData( 'ltPropRecords' ) - 1 ) {
							that.nextFade( currentActive,index || 0, itemList, indicatorList, event )
						}
					}
					if( that.getData( 'ltPropAutoPlay' ) ) {
						// setTimeout(function(){
							that.autoPlayFunc();
						// }.bind(that),100)
					}
				} ).catch( function( err ) {
					console.error( err );
				} );
			}
			else if( res !== false ) {
				if( currentActive >= 0 && currentActive < records-1 ){
					this.nextFade( currentActive, index || currentActive+1, itemList, indicatorList, event )
							
				}
				else if( currentActive == records-1 ) {
					this.nextFade( currentActive, index || 0, itemList, indicatorList, event )
				}
				if( this.getData( 'ltPropAutoPlay' ) ) {
					setTimeout( function() {
						this.autoPlayFunc();
					}.bind( this ),100 )
				}
			}
		}
		
	}

    nextFade(currentActive, nextIndex, itemList, indicatorList, event) {
		this._nextFadeTrans = true
		var duration = parseFloat( window.getComputedStyle( itemList[ currentActive ] ).transitionDuration )
			duration = ( duration * 1000 ) +20
			
		setTimeout( function() {
				if( this._nextFadeTrans ) {
					delete this._nextFadeTrans
				}
		}.bind( this ), duration )

		this._nextFadeTimeout = setTimeout( function() {
			itemList[ currentActive ].addEventListener( 'transitionend', this._zeroOpacityTransition)
			itemList[ currentActive ].classList.remove( 'lyteActive' ) ;
			itemList[ currentActive ].setAttribute('tabindex',-1)
			itemList[ currentActive ].setAttribute('data-tabindex',-1)
			itemList[ currentActive ].setAttribute('aria-hidden', false)

			if( indicatorList ) {
				indicatorList.classList.remove( 'lyteActive' ) ;
				indicatorList.setAttribute('tabindex',-1)
				indicatorList.setAttribute('data-tabindex',-1)

			}
			this.setData( 'currentActiveIndex', nextIndex ) ;
			if( this.getMethods( 'onAfterNext' ) ){
				this.executeMethod( 'onAfterNext' , event , this , nextIndex ) 
			}
		}.bind( this ), 100 )
	}

    indicatorFadeClick(event) {
		var index, e = event.target,
		target= $L( e ).closest( 'lyte-carousel-indicator-item' )[ 0 ];

	
		if( target && target.tagName.toLowerCase() == 'lyte-carousel-indicator-item' ) {
			index = target.getAttribute( 'data-value' );
			var currentActive = this.getData( 'currentActiveIndex' ),
		 	itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ) ,
		 	indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ currentActive +'"] ' ),
			res=true,that = this;

			if( index < currentActive ){
				this.prevFadeClick( event, index );
			}
			else if(index > currentActive ){
				this.nextFadeClick( event , index);

			}
		}
	}

    static observers(arg1) {
        return Object.assign(super.observers({
            setOrientation: function () { 
                var orientation = this.getData("ltPropOrientation");
                if (orientation && orientation === "vertical") {
                    this.$node.classList.add('lyteCarouselVertical');
                }
                else if (orientation && orientation === "horizontal") {
                    this.$node.classList.remove('lyteCarouselVertical');
                }
            }.observes("ltPropOrientation").on("didConnect"),

            ariaObserver: function( change ) {
                if(this.getData('ltPropAria')){
                    window._lyteUiUtils.setAttribute( this.getCarouselWidget(), this.getData( 'ltPropAriaAttributes' ) || {}, {} );

                }

            }.observes( 'ltPropAriaAttributes' ).on( 'didConnect' ),

            dataObs : function() {
                setTimeout( function() {
                        clearTimeout( this._nextTimeout )
                        clearTimeout( this._nextFadeTimeout )
                        this.setData( 'currentActiveIndex',this.getData( 'ltPropActiveIndex' ) )
                        this.setActiveItem()
                        this.setMethod();
                }.bind( this ) )
            }.observes( 'ltPropData' ),

            currentActiveObs : function() {
                // this.checkButton();
                this.setActiveItem();
                
                
            }.observes( 'currentActiveIndex' ),
			recordObs : function(obj) {
                // this.checkButton();
                if(obj.oldValue === 1 && obj.newValue > 1 ){
					this.setMethod()
				}
                
            }.observes( 'ltPropRecords' ),
            activeIndexObs : function() {
                // this.checkButton();
                var activeIndex = this.getData( 'currentActiveIndex' ),
                    itemList = this.$node.getElementsByTagName( 'lyte-carousel-item' ),
                    indicatorList= this.$node.querySelector( ' lyte-carousel-indicator-item[data-value="'+ activeIndex +'"] ' );
                if( activeIndex >= 0 && activeIndex < itemList.length ){
                    itemList[activeIndex].setAttribute('tabindex',-1)
                    itemList[activeIndex].setAttribute('data-tabindex',-1)

                    itemList[activeIndex].classList.remove('lyteActive')
                    itemList[activeIndex].setAttribute('aria-hidden', false)

                    if(indicatorList) {
                        indicatorList.setAttribute('tabindex',-1)
                        indicatorList.setAttribute('data-tabindex',-1)
                        indicatorList.classList.remove('lyteActive')

                    }
                    this.setData( 'currentActiveIndex', this.getData( 'ltPropActiveIndex' ) )
                }
                
            }.observes( 'ltPropActiveIndex' ),

            autoPlayPauseObs : function() {
                var carouselContent = this.$node.querySelector( '.lyteCarouselWrapper' );
                this._carouselContentFocus= this.carouselContentFocus.bind(this)
                if( this.getData( 'ltPropAutoPlayPause' ) && this.getData( 'ltPropAutoPlayDuration' ) ) {
                    if( carouselContent ) {
                        carouselContent.addEventListener( 'mouseenter', this._carouselContentFocus )
                    }
                }
                else{
                    if( carouselContent ) {
                        carouselContent.removeEventListener( 'mouseenter', this._carouselContentFocus )
                    }
                }
            }.observes( 'ltPropAutoPlayPause' ).on( 'didConnect' ),

            autoPlayObs : function() {
                if( !this.getData( 'ltPropAutoPlay' ) && this._autoId ) {
                    clearInterval( this._autoId );
                    this._autoId = false
                }
                if(this.getData( 'ltPropAutoPlay' ) && (this.getData('ltPropRecords') > 1 || this.getData('ltPropMoreRecords'))) {
                    this.autoPlayFunc();
                }
            }.observes( 'ltPropAutoPlay' ).on( 'didConnect' )
        }), arg1);
    }

    _() {
        _;
    }
}

LyteCarouselComponent._template = "<template tag-name=\"lyte-carousel\"> <div class=\"lyteCarouselWrapper\"> <lyte-yield yield-name=\"carouselBoxYield\"></lyte-yield> </div> </template>";;
LyteCarouselComponent._dynamicNodes = [{"t":"i","p":[1,1],"in":0},{"type":"dc","trans":true,"hc":true,"p":[0]}];;

LyteCarouselComponent._observedAttributes = [
    "ltPropAutoPlay",
    "ltPropEffect",
    "ltPropActiveIndex",
    "ltPropMoreRecords",
    "ltPropRecords",
    "ltPropAutoPlayDuration",
    "ltPropAutoPlayPause",
    "ltPropData",
    "ltPropAria",
    "ltPropAriaAttributes",
    "ltPropOrientation",
    "ltPropTabIndex",
    "ltPropDataTabIndex",
    "ltPropArrowKey",
    "coordinates",
    "currentActiveIndex",
    "prev",
    "start"
];

if( !window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-item' ] ) {
    window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-item' ] = true;

    class LyteCarouselItemCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return [ ];
        }

        connectedCallback() {
            var lyteNode = this.$node;

            lyteNode.setAttribute( 'aria-hidden', false );

            if( !lyteNode.hasAttribute( 'tabindex' ) ) {
				lyteNode.setAttribute( 'tabindex', '-1' );
				lyteNode.setAttribute( 'data-tabindex', '-1' );

			}
        }

        _() {
            _;
        }
    }

    LyteCarouselItemCustomElements.options = {clone : {allCallbacks : false}};

    LyteCarouselItemCustomElements.register("lyte-carousel-item");
}
if( !window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-next' ] ) {
    window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-next' ] = true;

    class LyteCarouselNextCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return [ ];
        }

        connectedCallback() {
            var lyteNode = this.$node;

            lyteNode.setAttribute( 'aria-role', 'button' );
        }

        _() {
            _;
        }
    }

    LyteCarouselNextCustomElements.options = {clone : {allCallbacks : false}};

    LyteCarouselNextCustomElements.register("lyte-carousel-next");
}
if( !window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-prev' ] ) {
    window._lyteUiUtils.registeredCustomElements[ 'lyte-carousel-prev' ] = true;

    class LyteCarouselPrevCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return [ ];
        }

        connectedCallback() {
            var lyteNode = this.$node;

            lyteNode.setAttribute( 'aria-role', 'button' );
        }

        _() {
            _;
        }
    }

    LyteCarouselPrevCustomElements.options = {clone : {allCallbacks : false}};

    LyteCarouselPrevCustomElements.register("lyte-carousel-prev");
}
/**
 * 
 * @syntax yielded 
 *	<lyte-carousel>
 *	<template is="registerYield" yield-name="carouselBoxYield">
 *       <lyte-carousel-prev> </lyte-carousel-prev>
 *       <lyte-carousel-content>
 *          <lyte-carousel-item> Content 1 </lyte-carousel-item>
 *          <lyte-carousel-item> Content 2 </lyte-carousel-item>
 *       </lyte-carousel-content>
 *       <lyte-carousel-indicator>
 *           <lyte-indicator-item data-value="0"> 1 </lyte-indicator-item>
 *           <lyte-indicator-item data-value="1"> 2 </lyte-indicator-item>
 *       </lyte-carousel-indicator>
 *      <lyte-carousel-next> </lyte-carousel-next>
 *   </template>
 *	</lyte-carousel> 
 */
export { LyteCarouselComponent };

LyteCarouselComponent.register("lyte-carousel", {
    hash: "LyteCarouselComponent_14",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});
