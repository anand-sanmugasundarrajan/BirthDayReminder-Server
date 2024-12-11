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
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

/**
 * Tooltip is a component used to show information related to an element
 * @component lyte-tooltip
 * @version 1.0.0
 */

/*
  todo =>  // If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus (onBlur). If the tooltip is invoked with mouseIn, then it is dismissed with on mouseOut.

  tooltip animation support

  , re using created tooltip span
*/

class LyteTooltipComponent extends Component {
  constructor() {
    super();
  }

  init() {

    if( this.getMethods( 'beforeRender' ) ){
            /**
             * @method beforeRender
             * @version 1.0.1
             */
            this.executeMethod( 'beforeRender', this.$node );
        }
  }

  rtlfunc(lft, bcr, ww) {
    if( this._dir && lft != 'top' && lft != 'clientY' ) {
      if( bcr ) {
        if( lft == 'right' ) {
          return ww - bcr.left;
        } else if( lft == 'clientX' ) {
          return ww - bcr.clientX;
        }
        return ww - bcr.right;
      } else if( lft == 'left' ) {
        return 'right';
      } else if( lft == 'right' ) {
        return 'left';
      }
    }
    return bcr ? bcr[ lft ] : lft;
  }

  data(arg1) {

    var default_values = window._lyteUiUtils.getDefault( 'lyte-tooltip' );

    return Object.assign(super.data({
      //user data
      /**
       * @componentProperty {string} ltPropId=''
       * @version 1.0.0
       */
      ltPropId : prop('string', {default : default_values.id || '' }),
      /**
       * @componentProperty {string} ltPropClass=''
       * @version 1.0.0
       */
      ltPropClass : prop('string', {default : default_values.class || '' }),
      /**
       * @componentProperty {boolean} ltPropKeepAlive=false
       * @version 1.0.0
       */
      ltPropKeepAlive : prop('boolean', {default : default_values.keepAlive || false }),
      ltPropKeepAlive : prop("boolean", {default : default_values.keepAlive || false }),

      /**
       * @typedef {object} tooltipConfig
       * @property {left | right | top | bottom | topright | bottomright | topleft | bottomleft | followcursor} position
       * @property {box | callout} appearance=callout
       * @property {number} margin=0
       * @maxValue 20
       * @property {number} showdelay=0
       * @property {number} hidedelay=0
       * @property {number} maxdisplaytime=5000
       * @property {boolean} keeptooltip=false
       * @property {boolean} hideOnClick=true
       */

      /**
       * @componentProperty {tooltipConfig} ltPropTooltipConfig
       * @default {}
       * @version 2.2.20
       */
      ltPropTooltipConfig : prop( 'object', { default : default_values.tooltipConfig || {} } ),

      /**
       * @componentProperty {string} ltPropIgnoreClass="lyteTooltipIgnore"
       * @version 3.28.2
       **/

      ltPropIgnoreClass : prop( 'string', { default : default_values.ignoreClass || "lyteTooltipIgnore" } ),

      /**
       * @componentProperty {boolean} ltPropAria=false
       * @version 3.45.0
       **/

       ltPropAria : prop( 'boolean', { default : default_values.aria || false } ),

      // system data

      tooltips : prop( 'object', { default : {} } )
    }), arg1);
  }

  focusev(evt) {

    var fastdom = $L.fastdom;

    fastdom.mutate( function(){
        this.$node.trigger( evt.type == "focus" ? evt.target : document.body );
    }.bind( this ) );
  }

  didConnect() {

      this._dir = window._lyteUiUtils.getRTL();

      var tooltips = Array.from( document.body.getElementsByTagName( 'lyte-tooltip' ) );

      tooltips.forEach( function( item ){
        if( item != this.$node ){
           document.body.removeChild( item );
        }
      }.bind( this ) );

      this._mousemove = this.mousemove.bind( this );  
      this._mousedown = this.mousedown.bind( this );
      this._mouseup = this.mouseup.bind( this );
      this._keydown = this.keydown.bind( this );
      this._toolscroll = this.tooltipScroll.bind( this );

      document.addEventListener( 'mousemove', this._mousemove, true ); 
      window.addEventListener('scroll', this._toolscroll , true); 
      document.addEventListener( 'keydown', this._keydown, true);
      document.addEventListener( 'mousedown', this._mousedown, true );
      document.addEventListener( 'touchstart', this._mousedown );

      if( this.data.ltPropAria ){
         this.bind_aria();
      }

      if( this.getMethods( 'afterRender' ) ) {
            /**
             * @method afterRender
             * @version 1.0.1
             */
          this.executeMethod('afterRender', this.$node);
      }
      /**
       * @utility trigger
       * @version 3.2.0
       */
      this.$node.trigger = function( node ){
        this.mousemove( { target : node || document.body } );
      }.bind( this )

  }

  bind_aria() {
         this._focusev = this.focusev.bind( this );

         [ 'focus', 'blur' ].forEach( function( item ){
            document.addEventListener( item, this._focusev, true );
         }.bind( this ) );
  }

  remove_aria() {
      [ 'focus', 'blur' ].forEach( function( item ){
         document.removeEventListener( item, this._focusev, true );
      }.bind( this ) );
  }

  tooltipScroll(event) {
    var vis =  this.data.tooltips;

     for( var i in vis ){
        vis[ i ].classList.add( 'lyteTooltipHidden' );
     }
  }

  mousedown(evt) {
      this._mousedownFlag = true;
      var target = evt.target.correspondingElement || evt.target,
      $target = $L( target ),
      isTch = /touch/i.test( evt.type );

      if( ( isTch && evt.touches.length > 1 ) ){
          return;
      }

      if( $target.hasClass( 'lyteSliderHandler' ) ){
         delete this.prevTooltipNode;
         this._slider = true;   
      } 

      if( $target.hasClass( 'lyteTooltip' ) ){
         var act_node = target.nodeName1;
         this.hover_process( act_node );
         this.closeAllTooltip( act_node, true );
      } else {
         this.closeAllTooltip( void 0, true );
      }

      if( target.closest( '[draggable=""],[draggable="true"]' ) ){
         delete this._mousedownFlag;
         this.__dragging = true;
      } else {
        delete this.__dragging;
         document.addEventListener( isTch ? 'touchend' : 'mouseup', this._mouseup, true );
      }
  }

  mouseup(evt) {
      delete this._mousedownFlag;
      document.removeEventListener( evt.type, this._mouseup, true );

      if( this._slider ){
         delete this._slider;
         var target = evt.target.correspondingElement || evt.target;

         if( $L( target ).hasClass( 'lyteSliderHandler' ) ){
            this.mousemove( { target : target } );
         }
      }
  }

  keydown(evt) {
     delete  this.prevTooltipNode;
     this.closeAllTooltip();
  }

  tooltipOpenCallback(arg1, arg2) {
      if( arg1.onTooltipShow ) {
          arg1.onTooltipShow.apply(this, arguments)     
      }
      if(this.getMethods( 'onTooltipShow' ) ) {
          /**
           * @method onTooltipShow
           * @version 1.0.2
           */
          this.executeMethod( 'onTooltipShow', arg1, arg2, arg1.tooltip );
      }
  }

  tooltipCloseCallback(arg1) {
      if( arg1.onTooltipHide ) {
          arg1.onTooltipHide.apply(this, arguments)     
      }
     if(this.getMethods( 'onTooltipHide' ) ) {
          /**
           * @method onTooltipHide
           * @version 1.0.2
           */
          this.executeMethod( 'onTooltipHide', arg1 );
      }
  }

  didDestroy() {

        var rel = "removeEventListener",
        doc = document;

        window[ rel ]('scroll', this._toolscroll , true);
        doc[ rel ]('mousemove', this._mousemove, true);
        doc[ rel ]('mousedown', this._mousedown, true);
        doc[ rel ]('touchstart', this._mousedown);
        doc[ rel ]( 'keydown', this._keydown, true );

        if( this.data.ltPropAria ){
           this.remove_aria();
        }
        
        var exsttools = this.data.tooltips;

        for( var i in exsttools ){
          var current = exsttools[ i ];

           delete current.nodeName1.tooltipSpan;
           delete current.nodeName1.tooltip;
           if( current.parentNode ){
            doc.body.removeChild( current );
          }
        }
        delete this.$node.trigger; 

        [ '_toolscroll', '_mousedown', '_keydown', '_mousemove', '_focusev', '__reuse' ].forEach( function( item ){
           delete this[ item ];
        }.bind( this ) );

        this.data.tooltips = []; 
        this.data.tooltips = {};
  }

  propertySetting(nodeName1) {
      var config = nodeName1.getAttribute( 'lt-prop-tooltip-config' ) || '{}',
      __config = nodeName1.tooltip.config;

      // if( config ){
          var config = JSON.parse( config );
          for( var key in config ){
              __config[ key ] = config[ key ];
          }
      // }
  }

  createTooltip(event, span, flag) {
      if( flag ){
         this.followcursor( event, span );
      } else {
         this.nonFollowcursor( event, span );
      }
      if( !this.getData( 'ltPropKeepAlive' ) ){
        var tooltip = span.nodeName1.tooltip;
        if( ( tooltip.config.keeptooltip != true && tooltip.config.keeptooltip != 'true' ) ) {
            tooltip.maxdisp = setTimeout( this.removeTooltip.bind( this, span ) , tooltip.config.maxdisplaytime );
        }
      }
  }

  followcursor(event, span) {
    // here tooltip changes its position on every mousemov. so fastdom can't  be used here
      if( document.body.contains( span ) ){
            // span.innerText = span.nodeName1.tooltip.title; 
            if( !span._callbackHandled ) {
                this.tooltipOpenCallback( span.nodeName1, span );
                span._callbackHandled = true;
            }     
            if( span.classList.contains( 'lyteTooltipHidden' ) ){
              span.classList.remove( 'lyteTooltipHidden' );
              $L.fastdom.measure( this._followcursor.bind( this, event,span ) );
            } else {
              this._followcursor( event, span );
            }
        }
  }

  _followcursor(evt, span) {
      if( !this.data.tooltips[ span._random ] ){
        return;
      }
      var bcr = span.getBoundingClientRect(),
      nodeBcr = span.nodeName1.getBoundingClientRect(),
      scrollLeft = ( window.pageXOffset || document.documentElement.scrollLeft ) * ( this._dir ? -1 : 1 ),
      scrollTop = window.pageYOffset || document.documentElement.scrollTop,
      iW = window.innerWidth,
      iH = window.innerHeight,
      margin = Math.min( 20, parseInt( span.nodeName1.tooltip.config.margin ) ),
      leftToSet = this.rtlfunc.call( this, 'clientX', evt, iW ),
      topToSet = ( evt.clientY + scrollTop + 5 + margin ),
      topCheck;

      if( leftToSet + bcr.width > iW ){
        if( leftToSet - bcr.width > 0 ){
           leftToSet = leftToSet - bcr.width;
        } else {
          var midFrmRgt = iW - ( this.rtlfunc( 'left', nodeBcr, iW ) + nodeBcr.width / 2 ),
          midFrmLeft = iW - midFrmRgt;

          if( midFrmRgt > bcr.width / 2 && midFrmLeft > bcr.width / 2 ){
              leftToSet = midFrmLeft - bcr.width * 0.5;
          } else {
             leftToSet = Math.max( 0, iW - bcr.width );
          }
          topCheck = true;
        }
      }

      span.style[ this.rtlfunc.call( this, 'left' ) ] = ( leftToSet + scrollLeft ) +'px';
      span.style.top = topToSet + 'px';
      if( topCheck ){
         $L.fastdom.measure( function(){
            if( !this.data.tooltips[ span._random ] ){
              return;
            }
            bcr = span.getBoundingClientRect();
            if( bcr.bottom > iH ){
               if( evt.clientY > (  iH - evt.clientY ) ){
                  span.style.top = ( evt.clientY - bcr.height - margin - 5 + scrollTop ) + 'px'
               }
            }
         }.bind( this ) )
      }
  }

  createsupp(span) {
     var inn = document.createElement( 'span' );
     inn.classList.add( 'lyteTooltipInnerSpan' );
     span.classList.add( 'lyteInnerToolAdded' );
     return span.appendChild( inn );
  }

  rightalign(
    innWidth,
    xscroll,
    newLeft,
    spanClientRect,
    span,
    prevent,
    event,
    lt,
    cls1,
    cls2,
    ddct,
    divWidth,
    appearance
  ) {
      if( ( innWidth + xscroll ) < ( newLeft + spanClientRect.width ) )
             {
               span.classList.remove( cls1 );
               if( !prevent ){
                  this.nonFollowcursor( event, span, cls2 , true );
                }
               return true
            }
        else{
            if( newLeft < xscroll ){
               if( appearance ){
                  var inn = this.createsupp( span );
                  inn.style[ lt ] = divWidth * .75 - ( ddct ) + 'px';
               }
               span.style[ lt ] = 0;
            } else{
              span.style[ lt ] = newLeft + 'px';
            }
        }
  }

  refresh(evt, span) {
    var tooltip = span.nodeName1.tooltip,
    config = tooltip.config;

    span.textContent = tooltip.title = span.nodeName1.getAttribute( 'lt-prop-title' );

    this.clear_time( tooltip );

    this.createTooltip( evt, span );
  }

  clear_time(tooltip, arr) {
    ( arr || [ 'maxdisp', 'settime', 'bodyTimeout' ] ).forEach( function( item ){
         clearTimeout( tooltip[ item ] );
         delete tooltip[ item ];
    });
  }

  nonFollowcursor(event, span, position, prevent) {
        var appearance = span.nodeName1.tooltip.config.appearance == "callout", dum;
        span.classList.remove( 'lyteTooltipHidden' );
        position = position || span.nodeName1.tooltip.config.position || ( /focus/i.test( ( event.type || 'focus' ) ) ? 'bottom' : "" );
        dum = position || "bottom";
        if( appearance ){
          span.classList.add( "lyte" + dum[ 0 ].toUpperCase() + dum.slice( 1 ) )
        }
        if( !span._callbackHandled ) {
                this.tooltipOpenCallback( span.nodeName1, span );
                span._callbackHandled = true;
            } 
         $L.fastdom.measure(function(){
              // calculating page off set 
            if(  !( span.nodeName1 || {} ).tooltip ){
              return;
            }
            var xscroll = ( window.pageXOffset || document.documentElement.scrollLeft ) * ( this._dir ? -1 : 1 );
            var yscroll = window.pageYOffset || document.documentElement.scrollTop, innWidth = window.innerWidth,  innHeight= window.innerHeight;  
            var spanClientRect = span.getBoundingClientRect();
            var nodeClientRect = span.nodeName1.getBoundingClientRect();
            var left = this.rtlfunc( 'left', nodeClientRect, innWidth ) + xscroll;
            var topPos = nodeClientRect.top + yscroll;
            var __config = span.nodeName1.tooltip.config,
            margin = Math.min( parseInt( __config.margin ), 20 );
            var toolwid = span.offsetWidth,
            tool_hgt = span.offsetHeight;
            var divWidth = nodeClientRect.width;
            var wid = nodeClientRect.height;
            var lt = this.rtlfunc( 'left' ),
            sty = window.getComputedStyle( span ),
            isContentBox = /content-box/.test( sty.boxSizing ),
            padLeft = isContentBox ? parseFloat( sty.paddingLeft ) : 0,
            padRight = isContentBox ? parseFloat( sty.paddingRight ) : 0,
            padTop = isContentBox ? parseFloat( sty.paddingTop ) : 0,
            padBottom = isContentBox ? parseFloat( sty.paddingBottom ) : 0,
            ddct, calloutstyle,
            $span = $L( span );
            if( appearance ) {
                calloutstyle = window.getComputedStyle( span, ':before' );
                ddct = parseFloat( calloutstyle.getPropertyValue( 'width' ) ) / 2 * 1.414;
                if( isNaN( ddct ) || !ddct ) {
                    ddct = parseFloat( window.getComputedStyle( span, position == "left" ? ":before" : ":after" ).getPropertyValue( 'border-left-width' ) )
                }
            } else {
                ddct = 0;
            }
            switch(position.toLowerCase())
              {
                case 'right' :
                 {
                    left += ddct;
                    var newLeft = left + divWidth + margin;
                    span.style.top=( topPos + wid / 2 - tool_hgt / 2 )+'px';
                    if( ( innWidth + xscroll ) < ( newLeft + spanClientRect.width ))
                      {
                         if( !prevent ){
                            if( innWidth - ( left + divWidth - xscroll - ddct ) < ( left - ddct - xscroll ) ){
                                span.classList.remove('lyteRight');
                                this.nonFollowcursor.call( this, event, span,'left', true );
                                break;
                            }
                        }
                        span.style[ lt ] = newLeft + 'px';
                        span.style.width = ( innWidth - newLeft - padLeft - padRight ) + 'px';
                        // span.style.top = this.calculateHeight( spanClientRect, textWid, span, padTop, padBottom ) + 'px';
                        $L.fastdom.mutate( function(){
                          $L.fastdom.measure( function(){
                              span.style.top = ( topPos + wid / 2 - span.offsetHeight / 2 ) + 'px';
                          })
                        })
                      }
                    else{
                      span.style[ lt ] = newLeft + 'px';
                    }
                    break; 
                 }
                 case 'left' :
                   {
                      left -= ddct;
                      var newLeft = left - margin - toolwid;
                      span.style.top=( topPos + wid / 2 - tool_hgt / 2 ) + 'px';
                      if( newLeft < xscroll )
                        {
                           if( !prevent ){
                               if( left + ddct - xscroll < innWidth - ( left + ddct - xscroll + divWidth ) ){
                                 span.classList.remove('lyteLeft');
                                 this.nonFollowcursor.call(this,event, span,'right', true);
                                 break;
                               }
                            }
                            span.style[ lt ] = 0 + 'px';
                            span.style.width = ( left - xscroll - padLeft - padRight ) + 'px';
                            // span.style.top = this.calculateHeight( spanClientRect, textWid, span, padTop, padBottom ) + 'px';
                             $L.fastdom.mutate( function(){
                                $L.fastdom.measure( function(){
                                    span.style.top = ( topPos + wid / 2 - span.offsetHeight / 2 ) + 'px';
                                })
                              })
                        }
                      else{
                           span.style[ lt ] = newLeft + 'px';
                      }  
                      break;  
                   }
                case 'bottom' :
                  {
                    topPos += ddct;
                    var newTop = ( topPos + wid + margin ), newLeft = left + divWidth / 2 - toolwid / 2;
                    if( ( yscroll + innHeight ) < ( newTop + tool_hgt ) ) {
                        span.classList.remove('lyteBottom');
                         if( !prevent ){
                            this.nonFollowcursor.call(this,event, span,'top', true);
                            break;
                          }
                    }
                    newLeft = this.horicheck( newLeft, xscroll, innWidth, spanClientRect, span, nodeClientRect, lt, ddct, appearance );
                    span.style[ lt ] = newLeft + 'px';
                    span.style.top = newTop + 'px';     
                    break;  
                  }     
                case 'top' :
                  {
                    topPos -= ddct;
                    var newTop = topPos - margin - tool_hgt, newLeft = left + divWidth / 2 - toolwid / 2;
                    if( newTop < yscroll ) {
                       span.classList.remove('lyteTop');
                        if( !prevent ){
                          this.nonFollowcursor.call(this,event, span,'bottom', true);
                          break;
                        }
                    } 
                    newLeft = this.horicheck( newLeft, xscroll, innWidth, spanClientRect, span, nodeClientRect, lt, ddct, appearance );
                    span.style[ lt ] = newLeft + 'px';
                    // span.style.top = newTop + 'px';   
                    $L.fastdom.mutate( function(){
                          $L.fastdom.measure( function(){
                              span.style.top = ( topPos - margin - span.offsetHeight ) + 'px';
                          })
                        })
                    break;     
                  }
                 case 'bottomright' :
                  {
                    topPos += ddct;
                    var newLeft = left + divWidth * .75 - ( appearance ? parseFloat( calloutstyle[ lt ] ) + ddct : 0.2 * toolwid ),
                    newTop = topPos + wid + margin;
                    if( this.rightalign( innWidth, xscroll, newLeft, spanClientRect, span, prevent, event, lt, 'lyteBottomright', 'bottomleft', ddct, divWidth, appearance ) ){
                       $span.removeClass('lyteBottomright');
                       break;
                    }     
                   if( ( innHeight + yscroll ) < ( newTop + spanClientRect.height ) ) 
                       {
                         $span.removeClass('lyteBottomright');
                         if( prevent ){
                            $span.addClass( 'lyteTopright' ).css( 'top', ( topPos - ddct - tool_hgt - margin ) );
                         } else {
                            this.nonFollowcursor( event, span,'topright', true );
                         }
                         break
                       }
                     else{
                        span.style.top = newTop + 'px';
                     }  
                    break; 
                  }
                case 'topright' :
                  {
                    topPos -= ddct;
                    var newLeft = left + divWidth * .75 - ( appearance ? parseFloat( calloutstyle[ lt ] ) + ddct : 0.2 * toolwid ),
                    newTop = topPos - tool_hgt - margin;
                    
                    if( this.rightalign( innWidth, xscroll, newLeft, spanClientRect, span, prevent, event, lt, 'lyteTopright', 'topleft', ddct, divWidth, appearance ) ){
                       $span.removeClass( 'lyteTopright' );
                       break;
                    } 

                    if( newTop < yscroll ){
                       $span.removeClass( 'lyteTopright' );
                       if( prevent ){
                          $span.addClass( 'lyteBottomright' ).css( 'top', topPos + ( 2 * ddct ) + wid + margin );
                       } else {
                          this.nonFollowcursor( event, span, 'bottomright', true );
                       }
                    } else {
                       $span.css( 'top', newTop );
                    }
                    break;     
                 }
                case 'bottomleft' :
                   {
                     topPos += ddct;
                     var newLeft = left + divWidth *.25 - ( appearance ? parseFloat( calloutstyle[ lt ] ) : 0.8 * toolwid ) + 'px',
                     newTop =(topPos+wid+margin)+'px';
                     if(parseInt(newLeft) < xscroll)
                        {
                            span.classList.remove('lyteBottomleft');
                            if( !prevent ){
                                this.nonFollowcursor.call(this,event, span,'bottomright', true);
                            }
                            break;
                        }
                    else{
                        span.style[ lt ] = newLeft;
                    } 
                    if(( innHeight + yscroll ) < ( parseInt( newTop ) + tool_hgt ) )
                        {
                            $span.removeClass( 'lyteBottomleft' );
                            if( prevent ){
                               $span.addClass( 'lyteTopleft' ).css( 'top', ( topPos - ddct - tool_hgt - margin ) );
                            } else {
                              this.nonFollowcursor( event, span, 'topleft', true );
                            }
                            break
                       }
                     else{
                        span.style.top = newTop;
                     } 
                     break; 
                    }
                 case 'topleft' :
                    {
                        topPos -= ddct;
                        var newLeft = left + divWidth *.25 - ( appearance ? parseFloat( calloutstyle[ lt ] ) : 0.8 * toolwid ) + 'px',
                        newTop = ( topPos - tool_hgt - margin )+'px';
                        
                        if(parseInt(newLeft)< xscroll) {
                            $span.removeClass('lyteTopleft');
                            if( prevent ){
                               $span.addClass('lyteTopright').css( lt, left + divWidth * .75 - ( appearance ? parseFloat( calloutstyle[ lt ] ) + ddct : 0.2 * toolwid ) );
                            } else {
                               this.nonFollowcursor( event, span,'topright', true);
                            }
                            break;
                        } else {
                          span.style[ lt ] = newLeft;
                        } 
                        
                        if( parseInt( newTop ) < yscroll ) {   
                            $span.removeClass( 'lyteTopleft' );
                            
                            if( prevent ){
                                $span.addClass( 'lyteBottomleft' ).css( 'top', topPos + wid + margin + 2 * ddct );
                            } else {
                                this.nonFollowcursor( event, span, 'bottomleft', true );
                            }
                            break;
                         } else {
                            $span.css( 'top', newTop );
                         }
                        break;    
                       }
                default:
                   {
                      var tooltop = ddct;
                      var newLeft = this.rtlfunc.call( this, 'clientX', event, innWidth ) - toolwid / 2 + xscroll;
                      var newTop = topPos + tooltop + wid + margin;
                      if( ( innHeight + yscroll ) < ( newTop + tool_hgt ) ) {
                          span.classList.remove('lyteBottom');
                          if( !prevent ){
                            this.nonFollowcursor.call(this,event, span,'top', true);
                            break;
                          }
                       }
                      newLeft = this.horicheck( newLeft, xscroll, innWidth, spanClientRect, span, nodeClientRect, lt, ddct, appearance );
                      span.style[ lt ] = newLeft + 'px';
                      span.style.top = newTop + 'px';   
                   }
                }
               span.style[ this.rtlfunc( 'right' ) ] = 'auto'; 

               var __startclass = __config.startClass,
               __endClass = __config.endClass,
               __animationClass = __config.animationClass;

               if( __startclass ){
                  var $span = $L( span ).addClass( __startclass );

                  window.requestAnimationFrame( function(){
                    $span.addClass( __animationClass );
                    window.requestAnimationFrame( function(){
                      window.requestAnimationFrame( function(){
                        $span.addClass( __endClass );
                      });
                    });
                  });
               }
          }.bind(this))
    // }.bind(this))
  }

  horicheck(
    newLeft,
    xscroll,
    innWidth,
    spanClientRect,
    span,
    nodeClientRect,
    lt,
    ddct,
    appearance
  ) {
      var flag, flag2
      if( newLeft < xscroll ){
         newLeft = xscroll;
         flag = true
      }else if( innWidth + xscroll < newLeft + spanClientRect.width ) {
          newLeft = innWidth - spanClientRect.width + xscroll;
          flag2 = true;
      }

       if( ( flag || flag2 ) && appearance ){
         var inn = this.createsupp( span ), nodeleft = this.rtlfunc( 'left', nodeClientRect, innWidth ),
         leftVal;
         if( flag ){
            var lft = this.rtlfunc( 'left', nodeClientRect, innWidth );
            inn.style[ lt ] =  ( Math.min( spanClientRect.width, nodeClientRect.width ) + Math.min( lft , 0 ) )/ 2 + Math.max( 0, lft ) + 'px';
         } else {
            var rgt = innWidth - this.rtlfunc( 'right', nodeClientRect, innWidth );
            inn.style[ lt ] = spanClientRect.width - ( Math.max( 0 , rgt ) + ( Math.min( spanClientRect.width, nodeClientRect.width ) + Math.min( rgt, 0 ) ) / 2 ) + 'px';
         }
      }
      return newLeft
  }

  closeAllTooltip(current, frm_down) {

    var tooltips = this.data.tooltips;

    for( var key in tooltips ){
      var item = tooltips[ key ];
      if( item.nodeName1 != current ){
          var tooltip = item.nodeName1.tooltip;

          if( !tooltip ){
             this.removeTooltip( item );
             continue;
          }

          if( frm_down && !tooltip.config.hideOnClick ){
             continue;
          }

          if( tooltip.bodyTimeout == void 0 ){
            tooltip.bodyTimeout = setTimeout( this.removeTooltip.bind( this ), tooltip.config.hidedelay, item );
          }
      }
    }
  }

  removeTooltip(span) {
        if( span.parentNode == document.body ){
            var node = span.nodeName1;
              
            if( !node ){
               return;
            }

            var tooltip = node.tooltip || {},
            config = tooltip.config || {},
            __endClass = config.endClass || "",
            __reuse = config.reuse,
            fn = function(){
                if( __reuse ){
                  var span_style = span.style;

                  span_style.opacity = "0";
                  span_style.pointerEvents = "none";
                } else {
                  document.body.removeChild( span );
                }
                clearTimeout( span.__animetime );

                $L( span ).off( 'transitionend' );
            };

            this.clear_time( tooltip );

            if( this.prevTooltipNode == node ){
               delete this.prevTooltipNode;
            }

            delete node.tooltipSpan;
            delete node.tooltip;
            delete span.nodeName1;

            node.setAttribute( 'aria-expanded', "false" );

             if( __endClass ){
                $L( span ).removeClass( __endClass ).on( 'transitionend', fn );
                span.__animetime = setTimeout( fn, config.maxAnimationLimit );
             } else {
                fn();
             }

            this.tooltipCloseCallback( node );
            delete this.data.tooltips[ span._random ];
        }
  }

  hover_process(node) {
    var tooltip = ( node || {} ).tooltip;
    if( tooltip ){
        this.clear_time( tooltip );
    }
  }

  mousemove(event) {
        if( this._mousedownFlag ) {
          return
        }

        if( this.__dragging ){
            if( event.buttons ){
              return;
            }
            delete this.__dragging;
        }

        var nodeName1 = event.target.correspondingElement || event.target;

        while(nodeName1 && nodeName1.tagName != 'BODY' && nodeName1 != document && nodeName1.tagName != 'HTML' ){
            
            var title = nodeName1.getAttribute ? nodeName1.getAttribute( 'lt-prop-title' ) : "",
            Jnode = $L( nodeName1 );

            if( Jnode.hasClass( 'lyteTooltip' ) ){
              var target_node = nodeName1.nodeName1 || {};
              if( ( ( target_node.tooltip || {} ).config || {} ).hidedelay ){
                this.hover_process( target_node );
                return this.closeAllTooltip( target_node );
              }
            }

            if( Jnode.hasClass( this.data.ltPropIgnoreClass ) ){
                delete this.prevTooltipNode;
                nodeName1 = document.body;
                break;
            }

            if( title ){

                  if( nodeName1.getAttribute( 'title' ) ){
                      nodeName1.removeAttribute( 'title' );
                  }

                  nodeName1.tooltip = nodeName1.tooltip || {};

                  nodeName1.tooltip.config = $L.extend( { reuse : false, position : '', appearance : 'callout', margin : 0, showdelay : 0, hidedelay : 0, maxdisplaytime : 5000, keeptooltip : false, aria : false, hideOnClick : true, startClass : "", endClass : "", animationClass : "", maxAnimationLimit : 2000 }, this.data.ltPropTooltipConfig || {} );
                  nodeName1.tooltip.title = title;

                  this.propertySetting( nodeName1 );

                  var tooltip = nodeName1.tooltip,
                  __config = tooltip.config,
                  is_reuse = __config.reuse;

                  if( this.prevTooltipNode != nodeName1 && ( !tooltip.tooltipSpan || is_reuse ) ){
                      this.prevTooltipNode = nodeName1;
                      var is_exist = this.__reuse,
                      is_really_exist = is_reuse && is_exist,
                      span = is_really_exist ? is_exist : document.createElement( 'span' ),
                      Jobj = $L( span ),
                      toolclass = Jnode.attr( 'lt-prop-tooltip-class' ),
                      ltPropId = __config.id || this.getData( 'ltPropId' ), 
                      ltPropClass = this.getData( 'ltPropClass' ),
                      randomId = Date.now() + 'lytetooltip';

                      if( is_exist ){
                          this.removeTooltip( span );
                      }

                      this.data.tooltips[ randomId ] = span;
                      span._random = randomId;

                      if( !is_exist ){
                        if( is_reuse ){
                           this.__reuse =  span;
                        }
                      } else {
                        Jobj.attr( 'class', 'lyteTooltip' );
                      }

                      if( ltPropId ) {
                         Jobj.attr( 'id', ltPropId );
                      }
                      if( ltPropClass ) {
                         Jobj.addClass( ltPropClass );
                      }  

                      !is_really_exist && Jobj.addClass( 'lyteTooltip lyteTooltipHidden' );
                      if( this._dir ) {
                         Jobj.addClass( 'lyteRTL' );
                      }

                      Jobj.attr( 'style', Jnode.attr( 'lt-prop-tooltip-style' ) || '' );

                      if( !span.style.borderColor ){ 
                          span.style.borderColor = span.style.backgroundColor;
                      }

                      if( tooltip.config.appearance == 'callout' && tooltip.config.position != "followcursor" ) {
                        Jobj.addClass( 'lyteTooltipCallout' );
                        if( !tooltip.config.hideOnClick ){
                          tooltip.refresh = this.refresh.bind( this );
                        }
                      }

                      tooltip.tooltipSpan = span;
                      span.nodeName1 = nodeName1;
                      
                      Jobj.addClass( toolclass || '' );

                      if( tooltip.config.aria ){
                        var __obj = {
                          role : "tooltip",
                          "aria-hidden" : "false"
                        };
                        Jobj.attr( __obj );

                        nodeName1.setAttribute( 'aria-expanded', 'true' );
                      }

                      tooltip.settime = setTimeout( this.createTooltip.bind( this ), tooltip.config.showdelay, event, span, tooltip.config.position == 'followcursor' );
                      span.textContent = tooltip.title; 

                      !is_really_exist && window._lyteUiUtils.appendChild( document.body, span );
                  } else if( tooltip.config.position == 'followcursor' && this.prevTooltipNode == nodeName1 && tooltip.tooltipSpan ){
                      var span = tooltip.tooltipSpan;

                      $L( span ).css({
                         opacity : "",
                         pointerEvents : ""
                      });

                      this.clear_time( tooltip, [ 'maxdisp', 'settime' ] );

                      if( !span._callbackHandled ){
                        tooltip.settime = setTimeout( this.createTooltip.bind( this ), tooltip.config.showdelay, event, span, true );
                      } else {
                        this.followcursor( event, span );
                      }
                  } else if( tooltip.tooltipSpan && tooltip.tooltipSpan.style.display == 'none' ) {
                      
                      $L( tooltip.tooltipSpan ).css({
                         display : "",
                         opacity : "",
                         pointerEvents : ""
                      });

                      this.clear_time( tooltip );
                      
                      tooltip.settime = setTimeout( this.createTooltip.bind( this ),  tooltip.config.showdelay,event,  tooltip.tooltipSpan,  tooltip.config.position == 'followcursor' );
                  } else {
                      this.prevTooltipNode = nodeName1;
                  } 
                  this.closeAllTooltip( nodeName1 );    
                  break;       
                }
              else {
                nodeName1 = nodeName1.parentNode;
              }  
        }
      if(nodeName1 && ( [ 'BODY', 'HTML' ].indexOf( nodeName1.tagName ) != -1 ) && this.prevTooltipNode != nodeName1 ){
          delete this.prevTooltipNode;
          this.closeAllTooltip();
      } 
  }

  static observers(arg1) {
    return Object.assign(super.observers({
      aria_obs : function( arg ){
          if( arg.newValue ){
             this.bind_aria();
          } else {
             this.remove_aria();
          }
      }.observes( 'ltPropAria' )
    }), arg1);
  }

  _() {
    _;
  }
}

LyteTooltipComponent._template = "<template tag-name=\"lyte-tooltip\"> </template>";;
LyteTooltipComponent._dynamicNodes = [];;

LyteTooltipComponent._observedAttributes = [
  "ltPropId",
  "ltPropClass",
  "ltPropKeepAlive",
  "ltPropTooltipConfig",
  "ltPropIgnoreClass",
  "ltPropAria",
  "tooltips"
];

( function(){
   var doc = document,
   __fn = function(){
      var name = 'lyte-tooltip';

      if( !doc.querySelector( name ) ){
          window._lyteUiUtils.appendChild( doc.body, doc.createElement( name ) );
      }
   };

   if( /complete|interactive/i.test( doc.readyState ) ){
      __fn();
   } else {
      doc.addEventListener( 'DOMContentLoaded', __fn );
   }

})();


/**
 * @syntax nonYielded
 * <lyte-tooltip></lyte-tooltip>
 */
export { LyteTooltipComponent };

LyteTooltipComponent.register("lyte-tooltip", {
  hash: "LyteTooltipComponent_11",
  refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});
