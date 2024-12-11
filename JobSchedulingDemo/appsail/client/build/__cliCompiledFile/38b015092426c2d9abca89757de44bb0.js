( function( cb ){
	if( typeof define == "function" && define.amd ){
		  define( [ "@zoho/lyte-dom" ], cb );
	  } else {
		  cb( window.$L );
	  }
} )( function( $L ){
   if( $L ) {
    var uA = window.navigator.userAgent, 
    isSaf =  { 
        uA : uA, 
        isUbuntu : /ubuntu/ig.test( uA ), 
        isIpad : /ipad/ig.test( uA ), 
        safari : /safari/ig.test( uA ), 
        isIE11Lyte : /rv:11/ig.test( uA ), 
        isEdgeLyte : /Edge/ig.test( uA ), 
        mode : {}, 
        chrome  : !!window.chrome , 
        firefox : /firefox/ig.test( uA ) 
    };

    function appendDiv( className, obj, dir, is_parent ) {
        var div = document.createElement( 'div' ), innerDiv;
        div.className = className;
        div._scrolldiv = this;
        div.style.visibility = 'hidden';
        innerDiv = document.createElement( 'div' );
        innerDiv.classList.add( 'lyteScrollDiv' );
        if( obj.handlerClass ) {
            innerDiv.classList.add( obj.handlerClass );
        }
        if( obj.containerClass ) {
            div.classList.add( obj.containerClass )
        }
        div.appendChild(innerDiv);
        if( dir ) {
            innerDiv._direction = dir;
            if( obj.horizontalContainerClass ){
                div.classList.add( obj.horizontalContainerClass );
            }
            if( obj.horizontalHandlerClass ) {
                innerDiv.classList.add( obj.horizontalHandlerClass );
            }
            this._horiDiv = div;
        } else {
            if( obj.verticalContainerClass  ) {
                div.classList.add( obj.verticalContainerClass );
            }
            if( obj.verticalHandlerClass ){
                innerDiv.classList.add( obj.verticalHandlerClass );
            }
            this._vertDiv = div;
        }

        ( is_parent ? this.parentElement : this ).appendChild( div )
        
        div.addEventListener( 'click', outerDivClick, true );
        innerDiv.addEventListener( 'mousedown', innerDivClick );
        if( !this._infiniteScroll ){        
            innerDiv.addEventListener( 'touchstart', innerDivClick );       
        }
        return div;
    }   

    function set( elem, prop, val ) {
        if( elem.style[ prop ] != val ){
            elem.style[ prop ] = val
        }
    }

    function checkscrollable( evt ){
        evt = evt || { target : this };
        var target = evt.target.correspondingElement || evt.target, ret;

        if( target.closest( '.lyteConnectWrapper.preventWheel' ) ){
            return true;
        }
        
        while( target && target != this ) {
            if( target.classList.contains( 'preventWheel' ) ) {
                ret = true;
                break;
            }
            target = target.parentElement
        }
        return ret
    }

    function check( flag, elem, obj, mode, evt ){
        var fg;
        evt = evt || {};

        window.fn = function( elem ){
            set( elem, 'visibility', 'hidden' );
            elem.classList.remove( 'visible' );
        };

        if( !flag.scroll ) {
            var is_showon_scroll = this._scrollData.showOn == 'scroll';
            if( !( [ 'mouseenter', 'touchstart' ].indexOf( evt.type ) != -1 && is_showon_scroll ) ){
                var from_reset = ( this._enableScroll = !flag.frm_reset ),
                is_event_added = $L( this ).hasClass( "eventBinded" );

                if( elem && ( !is_showon_scroll || !flag.frm_reset ) ) {
                    clearTimeout( elem._entertimeout );
                    clearTimeout( elem._leavetimeout );
                    delete elem._entertimeout; delete elem._leavetimeout;
                    if( !flag.scrollbar ){

                        if( !from_reset && !is_event_added ){
                            return;
                        }

                        if( evt.type == "touchstart" ){
                            elem._entertimeout = setTimeout( set.bind( this, elem, 'visibility', 'visible' ), 150 );
                        } else {
                            set( elem, 'visibility', 'visible' );
                        }
                        elem.classList.add( 'visible' );
                        updatePos.call( this, mode, undefined, {}, obj );
                    } else{
                        window.fn( elem );
                    }
                }
            }
            fg = true
        } else {
            if( elem ) {
               window.fn( elem );
            }
        }
        return fg
    }

    function initialWheel( evt ){
        this.removeEventListener( 'wheel', initialWheel, true )
        if( !this.classList.contains( 'eventBinded' ) ){
            var close_connect = this.closest( "lyte-connect" );
            if( !close_connect ){
                mouseenter.call( this, { type : 'mouseenter' } );
            }
        }
        evt.preventDefault()
    }

    function format_bcr( bcr ){
        var obj = {};
        [ 'x', 'y', 'bottom', 'height', 'top', 'width', 'left', 'right' ].forEach( function( item ){
            obj[ item ] = Math.round( bcr[ item ] );
        });
        return obj;
    }

    function mouseenter( evt, frm_reset ) {
        // console.log( evt.target, evt.type, evt.currentTarget );
        if( this.classList.contains( 'eventBinded' ) && evt != true ){
            return
        }
        if( evt.type == 'mouseenter' && this._prtmseenr ){
            return;
        }
        var flag, 
        obj = { scrollLeft : Math.round( this.scrollLeft ), scrollTop : Math.round( this.scrollTop ), scrollWidth : this.scrollWidth, scrollHeight : this.scrollHeight, bcr : format_bcr( this.getBoundingClientRect() ) },
        scrolldata = this._scrollData;

        this._wheelObj = obj
        if( this.classList.contains( 'lyteTableScroll' ) ){
            forTable.call( this, obj )
        }
        this._direction = window.getComputedStyle(  this ).direction;
        obj.vertbcr = this._vertDiv ?  this._vertDiv.getBoundingClientRect() : {}
        obj.horbcr = this._horiDiv ?  this._horiDiv.getBoundingClientRect() : {}
        flag = check.call( this, fitForScroll.call( this, true, obj, frm_reset ), this._vertDiv, obj, true, evt )
        flag = check.call( this, fitForScroll.call( this, false, obj, frm_reset ), this._horiDiv, obj, false, evt ) || flag
        if( flag && evt ) {
            this._mouseleave = this._mouseleave || mouseleave.bind( scrolldata.appendTo == "parent" ? this.parentElement : this );
            if( evt.type == "touchstart" ) {
               if( evt.touches.length == 1 ){
                    clearTimeout( this._tchtime );
                    document.addEventListener( 'touchcancel', this._mouseleave, true )
                } else {
                    return;
                }
            } else {
                this.addEventListener( 'wheel', wheelEvent, true );
                this.addEventListener('keydown', keydownFunc, true);
                if( this._scrollData.showOn == 'scroll' ){
                    this.addEventListener( 'mousemove', hideScrollbar, true );
                }
            }
            this._allowTouch = true;
            document.addEventListener( 'touchend', this._mouseleave, true )
            this.classList.add( 'eventBinded' )
            this._tabindex = this._tabindex == undefined ? this.tabIndex : this._tabindex;
            if(this.tabIndex == -1){
                this.tabIndex = scrolldata.tabIndex || 0;
            }
        }
    } 

    function keydownFunc( evt ) {
        if( evt.target != this ){
            return
        }

        var key = evt.key,
        elem = this,
        sL =  Math.round( elem.scrollLeft ),
        sT = Math.round( elem.scrollTop ),
        wd = elem.offsetWidth,
        hgt = elem.offsetHeight,
        s_wd = elem.scrollWidth,
        s_hgt = elem.scrollHeight,
        obj = { 
            scrollLeft : sL, 
            scrollTop : sT, 
            scrollWidth : s_wd, 
            scrollHeight : s_hgt, 
            bcr : elem.getBoundingClientRect() 
        },
        step = this._scrollData.keyStep,
        dir = this._direction == 'rtl',
        pos,
        mode,
        __new,
        is_negative = dir && ( !window._lyteUiUtils || window._lyteUiUtils.isNegativeScroll() ),
        meta = evt.metaKey || evt.ctrlKey;

        switch( key ){
            case "ArrowLeft" : {
                mode = false;

                if( meta ){
                    if( dir ){
                        if( is_negative ){
                            __new = wd - s_wd;
                        } else {
                            __new = s_wd - wd;
                        }
                    } else {
                        __new = 0;
                    }
                } else {
                    if( dir && is_negative ){
                        dir = false;
                    }
                    __new = sL - step * ( dir ? -1 : 1 );
                }
            }
            break;
            case "ArrowRight" : {
                mode = false;
                
                if( meta ){
                    if( dir ){
                        if( is_negative ){
                            __new = 0;
                        } else {
                            __new = wd - s_wd;
                        }
                    } else {
                        __new = s_wd - wd;
                    }
                } else {
                    if( dir && is_negative ){
                        dir = false;
                    }
                    __new = sL + step * ( dir ? -1 : 1 );
                }
            }
            break;
            case "ArrowDown" : {
                __new = Math.min( sT + step, s_hgt - hgt );
                mode = true;
            }
            break;
            case "ArrowUp" : {
                __new = Math.max( 0, sT - step );
                mode = true;
            }
            break;
            case "PageDown" : {
                __new = Math.min( sT + hgt, s_hgt - hgt );
                mode = true;
            }
            break;
            case "PageUp" : {
                __new = Math.max( sT - hgt, 0 );
                mode = true;
            }
            break;
            case "Home" : {
                __new = 0;
                mode = true;
            }
            break;
            case "End" : {
                __new = s_hgt - hgt;
                mode = true;
            }
            break;
        }

        if( mode != void 0 && shouldPrevent.call( elem, obj, mode, __new - ( mode ? sT : sL ) ) ){
            elem[ mode ? 'scrollTop' : 'scrollLeft' ] = __new;
            scroll.call( elem, evt )
            evt.preventDefault();
        }
    }

    function mouseleave( evt ){
        evt = evt || {};
        if( ( evt.relatedTarget && this.contains( evt.relatedTarget ) ) || document._scrollmouseup ){
            return
        }
        if( evt.type == 'touchend' ) {     
            var tar = evt.target.correspondingElement || evt.target;        
            if( tar && tar.classList.contains( 'lyteScrollContainer' ) ) {      
                return;     
            }       
        }
        var bars = $L( this ).children( '.lyteScrollContainer' ), scrlDiv = this._scrolldiv || this;
        if( bars.length ) {
            for(  var i = 0; i < bars.length; i++ ) {
                var __cur_bar = bars[ i ];

                clearTimeout( __cur_bar._entertimeout );
                clearTimeout( __cur_bar._leavetimeout );
                delete __cur_bar._entertimeout;
                delete __cur_bar._leavetimeout;

                __cur_bar.classList.remove( 'visible' )
                if( evt.type == 'touchend' ){
                    __cur_bar._leavetimeout = setTimeout( set.bind( this, __cur_bar, 'visibility', 'hidden'), 150 )
                } else {
                    __cur_bar.style.visibility = 'hidden';
                }
            }
            if( evt.type == 'mouseleave' ) {
                scrlDiv.removeEventListener('wheel', wheelEvent, true);
                scrlDiv.removeEventListener('keydown', keydownFunc, true);
                scrlDiv.removeEventListener( 'mousemove', hideScrollbar, true );
                scrlDiv.addEventListener( 'wheel', initialWheel, true );
            } else if( evt.type == 'touchend' || evt.type == "touchcancel" ) {
                scrlDiv._prtmseenr = true;
                scrlDiv._tchtime = setTimeout( function(){
                    delete scrlDiv._prtmseenr;
                }, 500 )
                document.removeEventListener( 'touchcancel', scrlDiv._mouseleave, true )
            }
            if( evt.type ){
                document.removeEventListener( 'touchend', scrlDiv._mouseleave, true )
                delete scrlDiv._allowTouch;
                scrlDiv.classList.remove( 'eventBinded' );
                // scrlDiv.tabIndex = this._scrolldiv._tabindex;
                // delete scrlDiv._tabindex;
                 delete scrlDiv._wheelObj;
                delete scrlDiv._prevPosY; delete scrlDiv._mouseleave;
                delete scrlDiv._prevPosX; delete scrlDiv._wheelEvt;
            }
            delete scrlDiv._enableScroll;
        }
    }

    function outerDivClick( evt ) {
        if( !this.classList.contains( 'visible' ) ){
            return
        }
        var isTch = evt.type == "touchmove";       
        if( isTch ) {       
            if( evt.touches.length > 1 ){       
                return;     
            } else {        
                evt.preventDefault();       
                evt = evt.touches[ 0 ]      
            }       
        }       
        var elem = this._scrolldiv, mode, inn = this.children[ 0 ], outBcr = this.getBoundingClientRect(), inBcr = inn.getBoundingClientRect(),
        obj = { scrollLeft : Math.round( elem.scrollLeft ), scrollTop : Math.round( elem.scrollTop ), scrollWidth : elem.scrollWidth, scrollHeight : elem.scrollHeight, bcr : elem.getBoundingClientRect() },
        hgt = 'width', top1 = 'left', sT = 'scrollLeft', sH = 'scrollWidth', bt = 'right', cY = 'clientX';
        if( this.classList.contains( 'lyteTableScroll' ) && !obj.$nodeClient ){
            forTable.call( this, obj )
        }
        obj.vertbcr = this._vertDiv ?  this._vertDiv.getBoundingClientRect() : {}
        obj.horbcr = this._vertDiv ?  this._horiDiv.getBoundingClientRect() : {}
        if(!inn._direction){
            mode = true;
            hgt = 'height', top1 = 'top', sT = 'scrollTop', sH = 'scrollHeight', bt = 'bottom', cY = 'clientY';
        }
        var scramt = evt.type != 'click' ? ( evt[ cY ] - ( this.prev || evt[ cY ] ) ) : ( evt[ cY ] - ( inBcr[ top1 ] + inBcr[ hgt ] / 2 ) ), newsL;
        newsL = ( scramt / ( obj.bcr[ hgt ] + obj.bcr[ top1 ] - outBcr[ top1 ] ) * obj[ sH ] )
        elem[ sT ] += ( newsL ) ;
        scroll.call( elem, evt );
        this.prev = evt[ cY ];
    }

    function innerDivClick( evt ) {
       var isTch = evt.type == "touchstart",
       __parentNode = this.parentNode,
       __document = document,
       ael = 'addEventListener';

        __document[ ael ]( isTch ? 'touchmove' : 'mousemove', __document._scrollmousemove = outerDivClick.bind( __parentNode ), true );
        __document[ ael ]( isTch ? 'touchend' : 'mouseup', __document._scrollmouseup = mouseup.bind( __parentNode ), true );

        evt.preventDefault();
        evt.stopPropagation();
    }

    function mouseup( evt ) {
        var isTch = evt.type == "touchend",
        __document = document,
        rel = "removeEventListener",
        scroll_elem = this._scrolldiv || this,
        target = evt.target,
        scrolldata = scroll_elem._scrollData;

        __document[ rel ]( isTch ? 'touchmove' : 'mousemove', __document._scrollmousemove, true );
        __document[ rel ]( isTch ? 'touchend' : 'mouseup', __document._scrollmouseup, true );

        delete __document._scrollmousemove;
        delete __document._scrollmouseup; 
        delete this.prev;

        if( !scroll_elem.contains( target.correspondingElement || target ) && scrolldata.showOn != 'always' ){
            mouseleave.call( scrolldata.appendTo == "parent" ? scroll_elem.parentNode : scroll_elem , { type : 'mouseleave' } );
        }
    }

    function mousedown( evt ) {

        var scrolldata = this._scrollData,
        __document = document;

        if( __document._scrollmouseup ) {
            return
        }
        __document.addEventListener( 'mouseup', __document._scrollmouseup = mouseup.bind( scrolldata.appendTo == "parent" ? this.parentElement : this ), true )
    }

    function fitForScroll( mode, obj, frm_reset ) {
        var sL = 'scrollTop', sW = 'scrollHeight', wd = 'height', elem = mode ? this._vertDiv : this._horiDiv,
        scrolldata = this._scrollData,
        margin = scrolldata.scrollYMarginOffset;

        if( !mode ) {
            sL = 'scrollLeft', sW = 'scrollWidth', wd = 'width';
            margin = scrolldata.scrollXMarginOffset;
        }
        if( obj[ sL ] + obj.bcr[ wd ] >= obj[ sW ] && obj[ sL ] == 0 ){
            if( elem && elem.classList.contains( 'visible' ) ) {
                check.call( this, { scroll : true, scrollbar : true }, elem )
            }
            return {
                scroll : true,
                scrollbar : true,
                frm_reset : frm_reset
            }
        }

        return{
            scroll : false,
            scrollbar : ( obj[ sW ] - obj.bcr[ wd ] ) <= margin,
            frm_reset : frm_reset
        }
    }

    function wheelEvent( evt ){
         if( checkscrollable.call( this, evt ) ) {
                return
            }
        if( evt.type == 'touchmove' ) { 
            if( this._allowTouch && evt.touches.length == 1 ) {
                var curr = evt.touches[ 0 ];
                wheelEvent1.call( this, evt, [ (this._prevPosX || curr.clientX ) - curr.clientX,  ( this._prevPosY || curr.clientY ) - curr.clientY ] )
                this._prevPosY = curr.clientY;
                this._prevPosX = curr.clientX;
            }
        } else {   
            wheelEvent1.call( this, evt )
        }
    }

    function shouldPrevent( obj, mode, val ){
        var sL = 'scrollTop', sW = 'scrollHeight', wd = 'height', elem = mode ? this._vertDiv : this._horiDiv;
        if( !mode ) {
            sL = 'scrollLeft';
            sW = 'scrollWidth';
            wd = 'width';
        }

        if( mode ){
            if( ( val > 0 && Math.round( obj[ sL ] + obj.bcr[ wd ] ) >= obj[ sW ] ) || ( val < 0 && obj[ sL ] == 0 ) ){
                return false
            }
        } else {
            if( ( val > 0 && Math.round( obj[ sL ] + obj.bcr[ wd ] ) >= obj[ sW ] ) || ( val < 0 && Math.round( -obj[ sL ] + obj.bcr[ wd ] ) >= obj[ sW ] ) ){
                return false
            } else if( !mode && isSaf.firefox && this._direction == 'rtl' && ( val < 0 && obj[ sL ] == 0 ) ){
                return true
            } else if( ( val < 0 && obj[ sL ] == 0 ) && !( val < 0 && isSaf.safari && this._direction == 'rtl' && obj[ sL ] == 0 ) ){
                return false;
            }
        }
        return true
    }

    function getWheel( evt ) {
        var data = this._scrollData, min = data.min, max = data.max,
        fact1 = data.wheelSpeed, fact = fact1, uA = isSaf.uA.toLowerCase(), inf = this._infiniteScroll, ie = isSaf.isIE11Lyte;
        if( ( uA.indexOf('edge') != -1 || (( uA.indexOf('trident') != -1 || uA.indexOf('msie') != -1)) ) && this._direction == 'rtl' ){
            fact1 *= -1
        }
        // if( evt.shiftKey ) {
        //     fact1 *= -1; fact *= -1; 
        // }
        var x, 
        y, 
        delta = evt.deltaMode && evt.deltaMode == 1,
        __deltaX = evt.deltaX,
        __deltaY = evt.deltaY;

        if( evt.shiftKey ){
            var __temp = __deltaX;
            __deltaX = __deltaY;
            __deltaY = __temp;
        }

        if( __deltaX > 0 ) {
            x = Math.max( delta ? ( __deltaX * 6 ) :  __deltaX, (inf ? 0 : 4 ) )
        } else if( __deltaX < 0 ) {
            x = Math.min( inf ? 0 : -4, delta ? ( __deltaX * 6 ) : __deltaX )
        }
        if( __deltaY > 0 ) {
            y = Math.min( max, Math.max( delta ? ( __deltaY * 6 ) : __deltaY, inf ? 0 : 4 ), ie ? 20 : Infinity );
        } else if( __deltaY < 0 ) {
            y = Math.max( min, Math.min( inf ? 0 : -4, delta ? ( __deltaY * 6 ) : __deltaY ), ie ? -20 : -Infinity );
        }
        return [ x * fact1, y * fact ]
    }

    function nestedScroll( evt, ret ){  
        var target = evt.target;
        while( target != this ) {
            var sT = Math.round( target.scrollTop ),
            sH = target.scrollHeight,
            oH = target.offsetHeight,
            compsty = window.getComputedStyle( target ),
            isMatch = ( /scroll|auto/i.test( compsty.overflowY ) || ( target.classList.contains( 'lyteScrollBar' ) && /hidden/i.test( compsty.overflowY  ) ) );


            if( oH < sH  ){
                if( ret ){
                    if( oH + sT < sH && isMatch ){
                        return true;
                    }
                } else {
                    if( sT && isMatch ){
                        return true;
                    }
                }
            }
            target = target.parentNode;
        }
    }

    function wheelEvent1( evt, tch ) {            
        var ret = tch || getWheel.call( this, evt );
        var a = ret[ 0 ] || 0, 
        b = ret[ 1 ] || 0, 
        mode = false, 
        obj = this._wheelObj || {} , 
        fit, 
        stpre, 
        isTable = this.classList.contains( 'lyteTableScroll' ),
        __deltaX = evt.deltaX,
        __deltaY = evt.deltaY,
        scrolldata = this._scrollData;

        if( evt.shiftKey ){
            var __temp = __deltaX;
            __deltaX = __deltaY;
            __deltaY = __temp;
        }

        if( Math.abs( tch ? a : ( __deltaX || 0 ) ) <= Math.abs( tch ? b : ( __deltaY || 0 ) ) ) {
            mode = true
        }
        if( scrolldata.nested && mode && nestedScroll.call( this, evt, b > 0 ) ){
            return;
        }

        if( scrolldata.showOn == 'scroll' ){
            if( !this._enableScroll ){
                mouseenter.call( this, true )
                evt.preventDefault();
                return
            }
            clearTimeout( this._scrollplugin )  
            this._scrollplugin = setTimeout(mouseleave.bind( scrolldata.appendTo == "parent" ? this.parentElement : this, {} ), scrolldata.tOut )
        }

        if( this._scrollEnd ) {
            obj= { scrollLeft : Math.round( this.scrollLeft ), scrollTop : Math.round( this.scrollTop ), scrollWidth : this.scrollWidth, scrollHeight : this.scrollHeight, bcr : format_bcr( this.getBoundingClientRect() ) };
            this._wheelObj = obj
            if( this.classList.contains( 'lyteTableScroll' ) ){
                forTable.call( this, obj )
            }
        }
        if( this._wheelObj ){
            fit = fitForScroll.call( this, mode, obj );
            if(( fit.scroll && mode /*&& b > 0*/ && (  !this._vertDiv || ( this._vertDiv && !this._vertDiv.classList.contains( 'visible' ) ) ) ) || ( fit.scroll && !mode /*&& a < 0*/ && ( !this._horiDiv || ( this._horiDiv && !this._horiDiv.classList.contains( 'visible' ) ) ) ) ){
                return
            }
            stpre = shouldPrevent.call( this, obj, mode, mode ? b : a ); 


            var is_inf = this._infiniteScroll,
            is_stopped = is_inf ? this.comp._stopScroll : false;

            if( ( is_inf && b > 0 ) || stpre ){
                 evt.preventDefault();
                if( !stpre && isTable && mode ) {
                    this.comp.scrollTable.call( this.comp, { yScroll : b }, this._wheelObj )
                }
            } else{
                if( scrolldata.preventOnEnd ){
                    evt.preventDefault();
                }
                return
            }
        }
        if( mode ) {
            if( isSaf.isIE11Lyte ) {
                if( this._wheelObj ){
                    this._wheelObj.scrollTop = Math.max( Math.min( this._wheelObj.scrollTop + b, this._wheelObj.scrollHeight - this._wheelObj.bcr.height ), 0 )
                    if(  isTable ) {
                        evt.yScroll = b;
                        this.comp.scroll.call( this, evt )
                    }
                    this.scrollTop += b;
                } 
            } else if( !isSaf.isIE11Lyte ) {
                this.scrollTop += b;
            }
        } else {
             if( isSaf.isIE11Lyte ) {
                if( this._wheelObj ) {
                    this._wheelObj.scrollLeft = Math.max( Math.min( this._wheelObj.scrollLeft + a, this._wheelObj.scrollWidth - this._wheelObj.bcr.width ), 0 )
                    if(  isTable ) {
                        evt.xScroll = a;
                        this.comp.scroll.call( this, evt )
                    }
                    this.scrollLeft += a;
                }
            } else {
               this.scrollLeft += a; 
            }
         }   
        if( isSaf.safari || isSaf.isIE11Lyte || isSaf.isIpad ) {
                this._alive = true;
                clearTimeout( this._alivetime )
                this._alivetime = setTimeout( function(){
                   delete this._alive; delete this._alivetime; 
                }.bind( this ), 16 )
            this._scrollFun.call( this, evt )
        }


        // if( this.comp ){
        //     clearTimeout( this._overlay.time );
        //     !this._overlay.classList.contains( 'lytescrolling' ) && this._overlay.classList.add( 'lytescrolling' );
        //     this._overlay.time = setTimeout( function(){
        //         this._overlay.classList.remove( 'lytescrolling' );
        //         delete this._overlay.time;
        //     }.bind( this ), 250 ) 
        // }
    }

    function scroll( evt ) {
        var a, b, issafIE = isSaf.isIE11Lyte || isSaf.safari || isSaf.isIpad, isIe = isSaf.isIE11Lyte ;
        if( issafIE && evt && evt.type == 'scroll' && ( this._alive && !evt._byFunc ) ) {
            trigEvt.call( this, isSaf.mode.a, isSaf.mode.b, this._wheelObj || { bcr : {} }, evt )
        } else{
            var obj= { scrollLeft : Math.round( this.scrollLeft ), scrollTop : Math.round( this.scrollTop ), scrollWidth : this.scrollWidth, scrollHeight : this.scrollHeight, bcr : this.getBoundingClientRect() };
            this._wheelObj = obj
            if( this.classList.contains( 'lyteTableScroll' ) ){
                forTable.call( this, obj )
            }
            if( this.prevScrlLeft != obj.scrollLeft ) {
                a = obj.scrollLeft - ( this.prevScrlLeft || 0 );
                b = 0;
                updatePos.call( this, false, a , evt, obj )
            } 
            if( this.prevScrlTop!= obj.scrollTop ) {
                b = obj.scrollTop - ( this.prevScrlTop || 0 );
                a = 0;
                updatePos.call( this, true, b , evt, obj )
            }
            isSaf.mode.b = b; isSaf.mode.a = a;
            if( !isIe || ( issafIE && ( !this._alive || evt._byFunc ) ) ) {
               if(  this.classList.contains( 'lyteTableScroll' ) ) {
                    this.comp.scroll.call( this, evt )
                }
            }
        }
    }

     function hideScrollbar( evt ) {
        clearTimeout( this._scrollplugin );  
        this._scrollplugin = setTimeout( mouseleave.bind( this._scrollData.appendTo == "parent" ? this.parentElement : this ), 500 );
    }

    function forTable( obj ) {
        var component =  this.comp, headerList = component.$node.getElementsByTagName( 'lyte-th' )
        if( this._infiniteScroll ){
            obj.$nodeClient = this.parentElement.getBoundingClientRect();
            var dummy =  this.getElementsByClassName( 'lytePreventInfiniteScroll' );
            obj.neglected = [];
            for( var m = 0; m < dummy.length; m++ ) {
                if( /*isVisible( dummy[ m ] )*/ !dummy[ m ].classList.contains( 'lyteHidden' ) ) {
                    obj.neglected.push( dummy[ m ] );
                }
            }

            obj.compNeg = dummy;
            if( this.comp._top != undefined ) {
                obj.topElem = [];
                var body = this.getElementsByTagName( 'lyte-tbody' )[ 0 ],
                another = body.getElementsByTagName( 'lyte-tr' );
                for( var n = 0; n < another.length; n++ ) {
                    if( !another[ n ].classList.contains( 'dummy' ) ) {
                        obj.topElem.push( another[ n ] );
                    }
                }
                obj.topElem = obj.topElem[ this.comp._top + obj.compNeg.length ]
                obj.topElemClient = obj.topElem ? this.comp.topElem( obj.topElem ) : {};
                obj.bottmElem = body.querySelector( 'lyte-tr:nth-of-type(' + ( ( this.comp._bottom + 1 + obj.compNeg.length ) ) + ')' );
                obj.bottmElemClient = obj.bottmElem ? this.comp.topElem( obj.bottmElem ) : {}
                obj.tbody = body
                obj.tbodyClient = obj.tbody ? obj.tbody.getBoundingClientRect() : {};
            }
        }
        obj.scrollDivClient = obj.bcr;
        for(var k = 0; k < headerList.length; k++)
            {
                headerList[k].property = headerList[k].getBoundingClientRect();
                headerList[k].order = k
            }
        obj.calculated = true;  
    }

    function trigEvt( a, b, obj, evt ) {
        delete this._scrollEnd; 

        var offset = this._scrollData.offset,
        __direction = this._direction == "rtl";

        if( ( ( Math.ceil( obj.scrollLeft + obj.bcr.width + offset.x ) >= obj.scrollWidth ) && !( __direction && isSaf.chrome ) ) || ( ( isSaf.firefox || isSaf.safari ) && __direction && ( Math.ceil( -obj.scrollLeft + obj.bcr.width + offset.x ) >= obj.scrollWidth ) ) || ( __direction && isSaf.chrome &&  obj.scrollLeft == offset.x ) ) {
            evt.horiScrollEnd = true;
        }
        if( Math.ceil( obj.scrollTop + obj.bcr.height + offset.y ) >= obj.scrollHeight ) {
            this._scrollEnd = evt.vertScrollEnd = true;
        }
        evt.yScroll = b; evt.xScroll = a;
        evt._byPlugin = true;
        this._wheelObj = obj;
    }

    function updatePos( mode, a, evt, obj ){
        var __this = this,
        __vert = __this._vertDiv,
        __hori = __this._horiDiv;

        if( parseInt( Math.abs( a ) ) == 0 || ( mode && !__vert ) ||( !mode && !__hori ) ){
            return;
        }

        var __out = mode ? __vert : __hori,
        rail_bcr = obj[ ( mode ? 'vert' : 'hori' ) + 'bcr' ] || __out.getBoundingClientRect(),
        __inn = __out.children[ 0 ],
        sL = "scrollTop",
        sW = "scrollHeight",
        wd = "height",
        lt = "top",
        direction = __this._direction == "rtl",
        btm = "bottom",
        __scrolldata = __this._scrollData,
        __bcr = obj.bcr,
        is_container = __scrolldata.appendTo != "parent",
        top_offset = mode ? ( __scrolldata.topOffset || 0 ) : 0;

        if( is_container ){
            rail_bcr = __bcr;
        }

        if( !mode ){
            sL = "scrollLeft";
            sW = "scrollWidth";
            wd = "width";
            lt = "left";
        }

        var __width = __bcr[ wd ],
        rail_bcr_lt = rail_bcr[ lt ],
        __rt = ( __width - ( rail_bcr_lt + top_offset - __bcr[ lt ] ) ) / obj[ sW ],
        trt = obj[ sL ] / obj[ sW ],
        mL = __scrolldata.minLength,
        minLength = mL ? ( mL != "auto" ? mL : 0 ) : 0.1 * __width,
        __final;

        set( __inn, wd, Math.max( __rt * __width, minLength ).toFixed( 3 ) + 'px' );

        if( direction && __inn._direction ){
            if( ( isSaf.safari && (  window._lyteUiUtils.isNegativeScroll() || !window.chrome ) ) || isSaf.firefox ) {
                __final =  ( ( obj[ sL ] / obj[ sW ] * 100 )  * obj.bcr[ wd ] / parseFloat( Math.max( __rt * __width, minLength ).toFixed( 3 ) ) );;
            } else {
                __final =  ( ( -( obj[ sW ] - __width - obj[ sL ] ) / obj[ sW ] * 100 ) * __width / parseFloat( Math.max( __rt * __width, minLength ).toFixed( 3 ) ) );
            }
            __final = 'translateX(' + __final + '%)';
        } else {
            __final = ( mode ? 'translateY' : 'translateX' ) + '(' + trt * ( __width - ( rail_bcr_lt - __bcr[ lt ] ) - ( Math.max( 0, minLength - __rt * __width ) ) ) + 'px)';
        }

        set( __inn, 'transform', __final );

        if( is_container ){
            set( __out, wd, __width + 'px' );

            var __other_elem = mode ? __hori : __vert,
            __to_set = 'translate' + '(' + obj.scrollLeft + 'px,' + obj.scrollTop + 'px)';

            set( __other_elem, 'transform', __to_set );
            set( __out, 'transform', __to_set );
        }

        __this.prevScrlLeft = obj.scrollLeft; 
        __this.prevScrlTop = obj.scrollTop;

        if( evt.type ){
            trigEvt.call( __this, mode ? 0 : a, mode ? a : 0, obj, evt );
        }
    }

    function removeScroll(){
        var elements = this;
        for( var i = 0; i < elements.length; i++ ) {
            var elem = elements[ i ], wrap = elem.parentElement;
            if( !wrap ){
                continue;
            }

            var scrolldata = elem._scrollData;

            if( scrolldata ) {

                if( scrolldata.appendTo != "parent" ){
                    wrap = elem;
                }

                delete elem._scrollData;
            }
            var scrollDivs = wrap.querySelectorAll( 'div.lyteScrollContainer' );
            for(var k = 0; k < scrollDivs.length; k++){
                if( scrollDivs[k].parentElement == wrap ) {
                    delete scrollDivs[ k ]._entertimeout;
                    delete scrollDivs[ k ]._leavetimeout;
                    wrap.removeChild(scrollDivs[k]);
                }
            }
            elem.classList.remove( 'lyteScrollBar', 'eventBinded' );
            elem.removeEventListener( 'mouseenter', mouseenter, true );
            elem.removeEventListener( 'wheel', initialWheel, true );
            elem.removeEventListener( 'touchstart', mouseenter, true )
            wrap.removeEventListener( 'mouseleave', mouseleave, true );
            elem.removeEventListener( 'mousedown', mousedown );
            elem.removeEventListener( 'touchmove', wheelEvent, { passive : false } )
            elem.removeEventListener( 'scroll', scroll, true );
            clearTimeout( elem._tchtime );
            if( elem._mouseleave ){
                document.removeEventListener( 'touchcancel', elem._mouseleave, true );
                document.removeEventListener( 'touchend', elem._mouseleave, true );
            }
            delete elem._wheelObj; delete elem._vertDiv; delete elem._horiDiv;
            delete elem._scrollFun; delete elem._alivetime; delete elem._alive; delete elem._wheelObj;
            delete elem.resetScrollbar; delete wrap._scrolldiv; delete elem._tchtime;
            delete elem._allowTouch;
            elem.classList.remove( 'eventBinded' );
            elem.tabIndex = elem._tabindex;
            delete elem._tabindex; delete elem._wheelObj;
            delete elem._prevPosY; delete elem._mouseleave;
            delete elem._prevPosX; delete elem._wheelEvt;
        }
        return this;
    }

    function destroy(){
        $L( '.lyteScrollBar' ).scroll( 'destroy' );
        window.removeEventListener('scroll', globalscroll, true ); 
        return this; 
    }

    function reset(){
        var elements = this;
        for( var i = 0; i < elements.length; i++ ){
            var __elems = elements[ i ],
            data = __elems._scrollData;

            if( data ){
                if( data.appendTo != "parent" ){
                    var obj = {
                        transform : "",
                        width : "",
                        height : ""
                    };
                    
                    $L( __elems._horiDiv ).css( obj );
                    $L( __elems._vertDiv ).css( obj );
                }
               __elems.resetScrollbar( true, true );
            }
        }
        return this;
    }

    $L.prototype.removeScroll = function(){
        // console.warn( 'removeScroll deprecated. Use scroll("destroy") instead' );
        return removeScroll.call( this );
    }

    $L.prototype.scroll = function( obj ) {
        if( obj && obj.constructor == String ){
            if( obj == "destroy" ){
                return removeScroll.call( this );
            } else if( obj == "destroyScroll" ){
                destroy.call( this );
            } else if( obj == "reset" ){
                reset.call( this );
            }
            return;
        }

        var fn = function( obj, name, _default ){
            var value = obj[ name ];
            if( value == void 0 ){
                value = _default;
            }
            obj[ name ] = value;
        };

        obj = obj || {};
        obj.showOn = obj.showOn || 'hover';
        obj.keyStep = obj.keyStep || 30;
        obj.wheelSpeed = obj.wheelSpeed || 1;
        // its a major change. to ensure same behaviour of normal scroll and to overcome issue in browser zoomed state changed this to false
        fn( obj, 'preventOnEnd', false );
        obj.offset = obj.offset || { x : 0, y : 0 };
        obj.tOut = obj.scrollTimeout || 500;
        obj.nested = obj.nested || false;
        obj.min = obj.min || -Infinity;
        obj.max = obj.max || Infinity;

        obj.appendTo = obj.appendTo || "parent";

        fn( obj, 'scrollYMarginOffset', 5 );
        fn( obj, 'scrollXMarginOffset', 5 );
        if( obj.preventXScroll ){
            obj.preventHorizontal = true; 
        }
        if( obj.preventYScroll ){
            obj.preventVertical = true;
        }
        var elements = this,
        is_parent = obj.appendTo == "parent";

        for( var i = 0; i < elements.length; i++ ) {
            var elem =  elements[ i ], vertDiv, horiDiv, wrp = elem.parentElement;
            is_parent && set( wrp, 'position', 'relative' );
            if( elem._scrollData ) {
                $L( elem ).removeScroll()
            }
            elem.resetScrollbar = mouseenter.bind( elements[ i ] );
            is_parent && ( wrp._scrolldiv = elem );
            elem._scrollData = obj;
            if( !obj.preventVertical ) {
                vertDiv = appendDiv.call( elem, 'lyteScrollContainer lyteScrollContainerY', obj, void 0, is_parent );
                if(obj.verticalPosition == 'left'){
                    vertDiv.classList.add('left');
                }
            }
            if( !obj.preventHorizontal ) {
                vertDiv = appendDiv.call( elem, 'lyteScrollContainer lyteScrollContainerX', obj, true, is_parent );
                if(obj.horizontalPosition == 'top'){
                    vertDiv.classList.add('top');
                }
            }
            if(isSaf.firefox ){
                elem.scrollLeft = 0;
                elem.scrollTop = 0;
            } 
            elem.addEventListener( 'mouseenter', mouseenter, true )
            elem.addEventListener( 'touchstart', mouseenter, true )
            elem.addEventListener( 'touchmove', wheelEvent, { passive : false } )
            elem.addEventListener( 'mousedown', mousedown );
            elem.addEventListener( 'wheel', initialWheel, true );
            
            if( obj.showOn != 'always' ){
                ( is_parent ? wrp : elem ).addEventListener( 'mouseleave', mouseleave, true )
            } else {
                setTimeout( mouseenter.bind( elem ), 100, {} )
            }

            elem.classList.add( 'lyteScrollBar' )
            elem._scrollFun = scroll;
        }
      return this;
    }

    $L.prototype.destroyLyteScroll = function(){
        // console.warn( 'destroyLyteScroll deprecated. Use scroll("destroyScroll") instead' );
        return destroy.call( this );  
    }

    $L.prototype.resetScrollbar = function(){
        // console.warn( 'resetScrollbar deprecated. Use scroll("reset") instead' );
        return reset.call( this );
    }

    function globalscroll( evt ){
        var el = evt.target.correspondingElement || evt.target;
        if( el != document && el != document.body && el._scrollFun ) {
            el._scrollFun.call( el, evt );
        }
        if( evt._byFunc ) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
    }
    window.addEventListener('scroll', globalscroll, true ); 
   }
} );