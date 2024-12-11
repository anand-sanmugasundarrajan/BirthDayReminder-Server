import { createCustomClass, getClass, _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Mixin": function() {
        return Mixin;
    }
});

import { Mixin } from "/node_modules/@slyte/core/index.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

let LyteTableUtilsMixin = createCustomClass(function(arg1, overrides, LyteTableUtilsMixin) {
    class _LyteTableUtilsMixin extends getClass([Mixin], arg1, LyteTableUtilsMixin) {
        getScrollDiv() {
            return this.$node.getElementsByClassName( 'lyteTableScroll' )[ 0 ];
        }

        registerInterSection(scrollDiv) {
             this._intersectionObs = new window.IntersectionObserver( this.intersection.bind( this ), { threshold : [ 1 ], root : scrollDiv } )
        }

        detectBrowsers() {
            var userAgent = window.navigator.userAgent
            this._isSafari = /safari/ig.test( userAgent );
            this._FF = /firefox/ig.test( userAgent );
            this._chrome = /Chrome/i.test( userAgent ) && /Google Inc/i.test( window.navigator.vendor );
        }

        getHeaderWidths(headerCells) {
            return headerCells.map( function( cell ){
                return cell.getBoundingClientRect().width;
            });
        }

        getTbody() {
            return this._tbody || this.$node.getElementsByTagName( this.data.ltPropTags.tbody );
        }

        getThead() {
            return this.$node.getElementsByTagName( this.data.ltPropTags.thead )[ 0 ];
        }

        getRows() {
            return this.$node.getElementsByTagName( this.data.ltPropTags.tr );
        }

        makeFixedColumn(rows, index, left, value) {

            rows.forEach( function( row ){
                var _$L = $L( row );
                if( !_$L.hasClass( 'dummy' ) ) {
                    $L( this.get_nth_cell( row, index ) ).css( left, value ).addClass( 'lyteFixedColumn' );
                }
            }.bind( this ) );
        }

        observe(intersection) {
            if( !intersection._observed ){
                this._intersectionObs.observe( intersection );
                intersection._observed = true;
            }
        }

        _setLeftForInterSection(reset) {

            var fastdom = $L.fastdom,
            __this = this;


            fastdom.clear( __this._setmeasure );

            __this._setmeasure = fastdom.measure( function(){

                var __tags = __this.data.ltPropTags,
                th_rows = Array.from( __this.$node.querySelectorAll( __tags.thead + ' ' + __tags.tr ) ),
                accumulatedTop = 0;

                th_rows.forEach( function( row, ___index ){
                    var headerCells = __this.get_children( row ),
                    __length = headerCells.length - 1;

                    if( __length + 1 ){
                        var width = __this.getHeaderWidths( headerCells ),
                        top_to_set = accumulatedTop,
                        check_right = true,
                        left = __this.rtlfunc( 'left' );

                        accumulatedTop += row.getBoundingClientRect().height;

                        fastdom.mutate( function(){
                            var tbody = __this.getTbody(),
                            rows = ___index ? [] : __this.get_children( tbody ),
                            intersectionDivs = [],
                            accumulatedWidth = 0,
                            accumulatedLeft = 0,
                            fn = function( cell, index ){
                                var intersection = cell._horizontalIntersectionDiv,
                                __index = check_right ? index : ( __length - index );

                                if( intersection ){
                                    var _hasClass = $L( cell ).hasClass( 'lyteTableRightFixed' );
                                    if( ( check_right && _hasClass ) || ( !check_right && !_hasClass ) ){
                                        intersection = void 0;
                                    }
                                }

                                if( intersection ){
                                    intersectionDivs.push( intersection );
                                    intersection.style[ left ] = accumulatedLeft + 'px';
                                    cell.style[ left ] = accumulatedWidth + 'px';

                                    __this.throwEvent( "intersectionSet", cell, left, accumulatedWidth );

                                    __this.makeFixedColumn( rows, __index, left, accumulatedWidth );

                                    accumulatedWidth += width[ __index ];

                                    __this.observe( intersection );

                                    if( intersection._sticked && reset ){
                                        __this.addFixedClass( cell );
                                    }
                                } else {
                                    accumulatedLeft +=  width[ __index ];
                                }

                                if( ___index ){
                                    cell.style.top = top_to_set + 'px';
                                }
                            };

                            headerCells.forEach( fn );
                            check_right = false;
                            left = __this.rtlfunc( 'right' );
                            accumulatedLeft = 0;
                            accumulatedWidth = 0;

                            headerCells.reverse().forEach( fn );

                             ___index ? void 0 : ( __this._intersections = intersectionDivs );
                        });
                    }
                }); 
            });
        }

        intersection(intersections) {
            
            intersections.forEach( function( intersection ){
                this.singleIntersection( intersection );
            }.bind( this ) );
        }

        singleIntersection(intersection) {
            var cell = intersection.target._cell,
            __this = this,
            ns = intersection.intersectionRatio ? 'processUnfix' : 'processFix';

            __this._fixedWidth = __this._fixedWidth || 0;
            __this._rightFixedWidth = __this._rightFixedWidth || 0;
            __this[ ns ]( cell, intersection );
        }

        common_fn(cell, intersection, __remove) {
            var __this = this;

            __this[ __remove ? 'removeFixedClass' : 'addFixedClass' ]( cell );
            intersection.target._sticked = !__remove;
            __this[ __remove ? 'callUnfix' : "callFix" ]( cell );

            if( cell.parentNode.previousElementSibling ){
                return;
            }

            $L.fastdom.measure( function(){
                var bcr = cell._bcr || cell.getBoundingClientRect(),
                ns = cell.classList.contains( 'lyteTableRightFixed' ) ? '_rightFixedWidth' : "_fixedWidth";

                if( ( __this[ ns ] += ( bcr.width * ( __remove ? -1 : 1 ) ) ) < 0 && __remove ){
                    __this[ ns ] = 0;
                }
            });
        }

        processUnfix(cell, intersection) {
            this.common_fn( cell, intersection, true );
        }

        processFix(cell, intersection) {
            this.common_fn( cell, intersection );
        }

        execute(cb) {
            return this.getMethods( cb ) && this.executeMethod.apply( this, arguments );
        }

        callUnfix(cell) {
            this.execute( 'onUnFix', cell, this.$node );
        }

        callFix(cell) {
            this.execute( 'onFix', cell, this.$node );
        }

        callDrop(selectedCell, next, startIndex, endIndex, header, evt) {
            this.execute( 'onDrop', selectedCell, next, startIndex, endIndex, header, evt, this.$node );
        }

        callRelease(evt, selectedCell) {
           this.execute( 'onRelease', evt, selectedCell, this.$node );
        }

        callOnBeforeSelect(selectedCell, ev, index) {
            return this.execute( 'onBeforeSelect', selectedCell, ev, this.$node, index ) == false;
        }

        callOnSelect(selectedCell, ev, index) {
            return this.execute('onSelect', selectedCell, ev, this.$node, index ) === false;
        }

        stickyFunction(cell, isCss, property, value) {
            var index = this.getIndex( cell ),
            tbody = this.getTbody(),
            rows = cell.parentNode.previousElementSibling ? [] : this.get_children( tbody ),
            fnName = isCss ? 'css' : property,
            fnValue = value;

            if( isCss ){
                fnValue = {};
                fnValue[ property ] = value;
            }

            $L( cell )[ fnName ]( fnValue );

            rows.forEach( row => {
                $L( this.get_nth_cell( row, index ) )[ fnName ]( fnValue );
            });
        }

        removeFixedClass(cell) {
            this.stickyFunction( cell, false, 'removeClass', 'lyteTableFixed' );
        }

        addFixedClass(cell) {
            this.stickyFunction( cell, false, 'addClass', 'lyteTableFixed' );
        }

        removeSticky(cell) {
            var is_right = cell.classList.contains( 'lyteTableRightFixed' );

            this.stickyFunction( cell, true, this.rtlfunc( is_right ? 'right' : 'left' ), '' );
            this.stickyFunction( cell, false, 'removeClass', 'lyteFixedColumn' );
        }

        makeSticky(cell) {
            var __left = this.rtlfunc( 'left' );

            this.stickyFunction( cell, true, __left, cell.style[ __left ] );
        }

        stickyScroll(evt) {
            var __target = evt.target;

            if( __target == this.scrollDiv ){
                var __intersections = this._intersections;

                if( __intersections.length  ){
                    $L.fastdom.measure( function(){
                        var scrollTop = __target.scrollTop;
                        $L.fastdom.mutate( function(){
                           __target.closest( 'lyte-table' ).style.setProperty( '--lyte-table-intersection', scrollTop + 'px' );
                        });
                    });
                }
            }
        }

        sortablemousedown(ev) {
            var evt = ev,
            isTch,
            __target = ev.target;

            if( /lyte-tablehead-resize/i.test( __target.tagName ) || ev.button != 0 ){
                return
            }

            if( /touch/i.test( ev.type ) ){
                if( ev.touches.length > 1 ){
                    return;
                }
                isTch = true;
                evt = ev.touches[ 0 ];
            }
            var target = __target,
            selectedCell = $L( target ).closest( this.data.ltPropTags.th ).get( 0 ),
            index = this.getIndex( selectedCell );

            if( $L( selectedCell ).hasClass( 'lyteTableFixed' ) ){
                return;
            }

            if( this.callOnBeforeSelect( selectedCell, ev, index ) ){
                return;
            }

            this._ww = window.innerWidth;

            // no need to pass this._ww inside rtlfunc. its already available inside it == > here only its available in this. In other places i am passing. So i need to pass here too. Here i am storing because of window dimension wont change during mousemove. So no need to measure that in mousemove
            var clientX = this.rtlfunc( 'clientX', evt, this._ww ),
            offleft = 0,
            tbody = this.getTbody(),
            thead = this.getThead(),
            cells = [],
            rows = this.get_children( tbody ),
            scrollDiv = this.getScrollDiv(),
            scrollTop = scrollDiv.scrollTop;

            this._elem = selectedCell;

            this._originalIndex = index;
            this._sortmousemove = this.sortmousemove.bind( this );
            this._sortmouseup = this.sortmouseup.bind( this );
            this._currentIndex = index;
            this._tbody = tbody;
            this._cells = cells;
            this._affectedIndex = [];

            this._scrolldivBcr = scrollDiv.getBoundingClientRect();
            this._scrollwidth = scrollDiv.scrollWidth;

            this._prevx = clientX;
            this._originalDiv = scrollDiv;
            this._originalDiv._sL = scrollDiv.scrollLeft;

            var headerCells = Array.from( this.get_children( selectedCell.parentNode ) ),
            rowBcr = selectedCell.parentNode.getBoundingClientRect(),
            __dir = this._dir;

            headerCells.forEach( function( cell, index, originalArray ){
                var previousCell = ( originalArray[ index - 1 ] || {} )._bcr,
                cellBcr = cell.getBoundingClientRect(),
                __width = cellBcr.width;

                // Feels like this calculation might not be needed. ===> Actual position( If not sticked ) and sticked positions will be different. here i am calculating Actual position. getBounding will give sticked position

                if( index == 0 ){
                    if( __dir ){
                        var __right = rowBcr.right;
                        cell._bcr = { left : __right - __width, right : __right, width : __width };
                    } else {
                        var __left = rowBcr.left;
                        cell._bcr = { left : __left, right : __left + __width, width : __width };
                    }
                } else {
                    if( __dir ){
                        var __left = previousCell.left;
                        cell._bcr = { left : __left - __width, right : __left, width : __width };
                    } else {
                        var __right = previousCell.right;
                        cell._bcr = { left : __right, right : __right + __width, width : __width };
                    }
                }
            });

            // don't understand this part either ==> converting event client value with respect to right( in rtl )
            
            this._xoffset = clientX - this.rtlfunc( 'right', selectedCell._bcr, this._ww );

            if( !this.data.ltPropPreventTableModify ){
                var height = 0;

                rows.every( function( row ){
                    var cell = this.get_nth_cell( row, index ),
                    cellHeight = cell.getBoundingClientRect().height;
                    height += cellHeight;

                    if( height < scrollTop - rowBcr.height ){
                        return true;
                    }

                     cell._translateX = 0;
                     cells.push( cell );
                     // may this can be this._currentEndIndex ===> its just virtual movement. So i named this as transformed index
                     cell._transformedindex = index;
                     cell.classList.add( 'lyteStickyTableColumnSortSelect' );

                     if( height >= this._scrolldivBcr.height + scrollTop ){
                        return false;
                    }
                    return true;
                }.bind( this ) );

                selectedCell._translateX = offleft;
                cells.push( selectedCell );
                selectedCell._transformedindex = index;
            } else {
                selectedCell._transformedindex = index;
            }

            document.addEventListener( isTch ? 'touchmove' : 'mousemove', this._sortmousemove, true );
            document.addEventListener( isTch ? 'touchend' : 'mouseup', this._sortmouseup, true );
            this.$node.classList.add( 'lyteTableSortSelected' );
            selectedCell.classList.add( 'lyteStickyTableColumnSortSelect' );
            ev.preventDefault();

            this.callOnSelect( selectedCell, ev, index );
        }

        isIncrement(increment, isRightEdge) {
            return increment > 0 || ( increment == 0 && isRightEdge );
        }

        isDecrement(increment, isRightEdge) {
            return increment < 0 || ( increment == 0 && isRightEdge === false );
        }

        getTd(cell, increment, isRightEdge) {
            // what is transformedindex ==> while moving columns are interchanged. here transformed index is virtual new index
            var transindex = cell._transformedindex,
            __index = -1,
            ori_index = this._originalIndex;

            if( this.isIncrement( increment, isRightEdge ) ){
                if( ori_index <= transindex ){
                    __index = transindex + 1;
                } else{
                    __index = transindex;
                }
            } else if( this.isDecrement( increment, isRightEdge ) ) {
                if( ori_index < transindex ){
                    __index = transindex;
                } else {
                    __index = transindex - 1;
                }
            }

            return this.get_nth_cell( cell.parentNode, __index );

        }

        findFromClosest(evt, cell) {
            var __tags = this.data.ltPropTags,
            closestCell = $L( evt.target ).closest( __tags.th + ', ' + __tags.td ).get( 0 );
            if( this.isHeader( closestCell ) ){
                var index = this.getIndex( closestCell );
                closestCell = this.get_nth_cell( cell.parentNode, index );
            }
            return closestCell;
        }

        isHeader(cell) {
            return cell && ( cell.tagName.toLowerCase() == this.data.ltPropTags.td );
        }

        isSortEnabled() {
            return this._elem;
        }

        isMoved() {
            return this._moved;
        }

        getIndex(cell) {
            return Array.from( this.get_children( cell.parentNode ) ).indexOf( cell );
        }

        getClassForFake() {
            return 'lyteTableSortHelper ' + this.data.ltPropSortDummyColumClass;
        }

        createFakeColum(cell) {
            var __doc = document,
            __element = __doc.documentElement,
            originaldiv = __doc.createElement( 'div' ),
            div = $L( originaldiv ),
            cellObj = $L( cell ),
            bcr = cell.getBoundingClientRect(),
            xscroll = __element.scrollLeft,
            yscroll = __element.scrollTop,
            cb = "onFakeColumnCreate";

            cellObj.data( 'sortElement', originaldiv );
            originaldiv._bcr = { left : bcr.left, right : bcr.right, width : bcr.width };
            originaldiv._translateX = bcr.left;
            originaldiv._translateY = bcr.top;

            div.attr( 'style', cellObj.attr( 'style' ) );
            div.text( cell.textContent )
                .addClass( this.getClassForFake() )
                .data( 'relatedElement', cell )
                .css({ 
                        height : bcr.height, 
                        width : bcr.width,
                        left : xscroll * ( this._dir ? -1 : 1 ),
                        top : yscroll,
                        pointerEvents : "none",
                        transform : 'translate(' + originaldiv._translateX + 'px,' + originaldiv._translateY + 'px)'
                    });


            this.getMethods( cb ) && this.executeMethod( cb, originaldiv, cell, this.$node );

            __doc.body.appendChild( originaldiv );
            this._moved = true;
        }

        sortmousemove(ev, allowAtSame, isRightEdge) {
            if( !this.isSortEnabled() ){
                return;
            }

            var evt = ev,
            ww = this._ww,
            // maybe the rtlfunc needs a better name ==> its a old function can't change its name right now
            clientX = this.rtlfunc( 'clientX', evt, ww ),
            left = this.rtlfunc( 'left' ),
            selectedCell = this._elem,
            tbody = this.getTbody(),
            cells = this._cells,

            // don't understand the xoffset == > initial mouse position during mousedown. Increment calculated based on this
            xoffset = this._xoffset,
            preventable = this.data.ltPropPreventTableModify;

            // evt = this.getProperEvent() ==> if touch length is more than one i need to stop the function. if i write this as additional function it again leads to write one more function. Right now i can't write this as a fucntion
            if( /touch/i.test( ev.type ) ){
                if( ev.touches.length > 1 ){
                    return;
                }
                evt = ev.touches[ 0 ];
            }

            if( preventable && !this.isMoved() ){
                return this.createFakeColum( selectedCell );
            }

            if( this._prevx == evt.clientX && !allowAtSame ){
                return;
            }

            window.$selectedCell = $L( selectedCell );

            if( this.getMethods( 'onBeforeDrag' ) && this.executeMethod( 'onBeforeDrag', selectedCell, $selectedCell.data( 'sortElement' ), ev, this.$node, this._originalIndex, selectedCell._transformedindex ) === false ){
                return;
            }

            this._prevx = evt.clientX;

            var fakeCell = $selectedCell.data( 'sortElement' ),
            // won't div._bcr be present? In one type it wont present
            bcr = preventable ? fakeCell._bcr : selectedCell._bcr,
            increment = ( clientX - this.rtlfunc( 'right', bcr, ww ) - xoffset ),
            is_increment = this.isIncrement( increment, isRightEdge ),
            is_decrement = this.isDecrement( increment, isRightEdge ),

            closestCell = preventable ? this.findFromClosest( evt, selectedCell ) : this.getTd( selectedCell, increment, isRightEdge ),

            closestbcr = closestCell ? closestCell._bcr : {},

            newone, closestCellIndex, 

            scrollLeft = this._originalDiv._sL,

            fact = this._dir ? -1 : 1,

            interchangeprevent, 
            offLeft = 0,
            cb = 'onBeforeInterChange',
            __affectedIndex = this._affectedIndex;

            if( selectedCell == closestCell && !fakeCell ){
                closestCell = undefined;
            }

            if( closestCell && this.isSortEnabled() ){
                closestCellIndex = this.getIndex( closestCell );

                if( closestCellIndex != this._originalIndex || preventable ){
                    var allow = false,
                    close_index = closestCell._transformedindex,
                    transindex = !isNaN( close_index ) ? close_index : closestCellIndex,
                    __limit = this.rtlfunc( 'left', closestbcr, ww ) + closestbcr.width * 0.5,
                    __transformedindex = selectedCell._transformedindex;

                    if( fakeCell && selectedCell == closestCell ){
                        transindex = closestCellIndex;
                    } 
                    
                    if( is_increment ) {
                        if( this.rtlfunc( 'right', bcr, ww ) + increment > __limit ){
                            allow = transindex > __transformedindex;
                        }
                    } else if( is_decrement ){
                        if( this.rtlfunc( 'left', bcr, ww ) + increment < __limit ){
                            allow = transindex < __transformedindex;
                            if( allow && ( closestCell._horizontalIntersectionDiv || {} )._sticked ){
                                allow = false;
                            }
                        }
                    }
                    if( allow ){
                        if( !preventable ){
                            newone = __affectedIndex.indexOf( closestCellIndex ) == -1;
                            if( newone ){
                                offLeft = 0;
                                __affectedIndex.push( closestCellIndex );
                            }
                        }
                    } else {
                        closestCell = undefined;
                    }
                }
            } else {
                closestCell = undefined;
            }
            if( closestCell && this.getMethods( cb ) ){
                interchangeprevent = this.executeMethod( cb, ev, selectedCell, closestCell, this.$node ) === false;
                if( interchangeprevent && newone ){
                    this.$addon.arrayUtils( __affectedIndex, 'removeAt', __affectedIndex.indexOf( closestCellIndex ) );
                }
            }

            if( preventable ){
                fakeCell.style.transform = 'translate( ' + ( fakeCell._translateX += ( increment * fact ) ) + 'px,' + fakeCell._translateY + 'px)';
                if( closestCell && !interchangeprevent ){
                    if( closestCell != selectedCell ){
                       var __fact = 0;
                       if( is_decrement ){
                         __fact = -1;
                       } else if( is_increment ){
                         __fact = 1;
                       }
                       selectedCell._transformedindex += __fact;
                    }
                }
            } else {
                cells.forEach( function( cell, indexVal ){
                    cell.style.transform = "translateX(" + ( cell._translateX += ( increment * fact ) ) + "px)";
                    // if( !this.isSortEnabled() ){
                        cell.classList.add( 'lyteStickyTableColumnMoving' );
                    // }
                    if( closestCell && !interchangeprevent ){
                        var newcell = this.get_nth_cell( cell.parentNode, closestCellIndex ),
                        __fact = 0,
                        ___ns = '_transformedindex';

                        if( newone ){
                            newcell.classList.add( 'lyteStickyTableColumnSortAnimate' );
                            newcell._translateX = 0;
                        }
                        newcell.style.transform = "translateX(" + ( newcell._translateX += ( bcr.width * ( this.isIncrement( increment, isRightEdge ) ? -1 : 1 ) * fact ) ) + "px)";

                        if( newcell[ ___ns ] == undefined ){
                            newcell[ ___ns ] = closestCellIndex;
                        }

                        if( is_decrement ){
                            __fact = 1;
                        } else if( is_increment ){
                            __fact = -1;
                        }

                        newcell[ ___ns ] += __fact;
                        cell[ ___ns ] -= __fact
                    }
                }.bind( this ));
            }

            if( fakeCell ){
                var __fakecell = fakeCell._bcr;

                __fakecell.left += ( increment* fact );
                __fakecell.right += ( increment * fact );
            } else {
                var __selected_bcr = selectedCell._bcr;

                __selected_bcr.left += ( increment * fact );
                __selected_bcr.right += ( increment * fact );
                if( closestCell && !interchangeprevent ){
                    var close_bcr = closestCell._bcr;

                    close_bcr.left += ( bcr.width * ( is_increment ? -1 : 1 ) * fact );
                    close_bcr.right += ( bcr.width * ( is_decrement ? -1 : 1 ) * fact );
                }
            }
            this.clearFastdom();

            this.sorthorizontalscroll( { left : bcr.left, width : bcr.width, right :  bcr.right }, scrollLeft, is_increment );

            if( closestCell ){
                this.callInterChange( ev, selectedCell, closestCell );
            }
            this.callDrag( selectedCell, ev );
            this._moved = true;
        }

        callInterChange(ev, selectedCell, closestCell) {
            this.execute( 'onInterChange', ev, selectedCell, closestCell, this.$node );
        }

        callDrag(selectedCell, ev) {
            this.execute( 'onDrag', selectedCell, $L( selectedCell ).data( 'sortElement' ), ev, this.$node, this._originalIndex, selectedCell._transformedindex );
        }

        clearFastdom() {
            var fastdom = $L.fastdom;
            fastdom.clear( this._reqId );
            fastdom.clear( this._measure );
            delete this._measure;
            delete this._reqId;
        }

        sorthorizontalscroll(bcr, scrollLeft, isIncrement) {
            var left = this.rtlfunc( 'left' ),
            ww = this._ww,
            _scrolldivBcr = this._scrolldivBcr,
            _scrollwidth = this._scrollwidth,
            _thisBccr = this._thisBccr,
            _originalDiv = this._originalDiv,
            _FF = this._FF,
            _dir = this._dir,
            _chrome = this._chrome,
            _isSafari = this._isSafari,
            isLeft = !isIncrement && ( this.rtlfunc( 'left', bcr, ww ) < Math.max( this._fixedWidth + this.rtlfunc( 'left', _scrolldivBcr, ww ), 0 ) ),
            isRight = isIncrement && ( ( this.rtlfunc( 'left', bcr, ww ) + bcr.width ) > Math.min( this.rtlfunc( 'right', _scrolldivBcr, ww ), ww ) ),
            selectedCell = this._elem;

            if( _FF && isRight ){
                // is this like checking if currentEndIndex is on the last node? == > firefox behaves weirdly. If we keep moving scrollwidth gradully increases. So if it reaches its end i am returning false

                if( selectedCell._transformedindex == this.get_children( selectedCell.parentNode ).length - 1 ){
                    if( _dir ){
                         // why scrollwidth + scrollleft <= widthofscrolldiv? - Firefox rtl behaviour
                         if( _scrollwidth + window.sL <= _thisBccr.width ){
                            return;
                        }
                    } if( window.sL + _thisBccr.width >= _scrollwidth ){
                        return;
                    }
                }
            }

            var value;

            if( isLeft ){
                value = scrollLeft - this.getCrctScrollValue();
                if( _dir ){
                    if( _chrome ){
                        // why does this Math.min need to be taken ==> In Rtl scrollLeft value will be lower than initial value. Setting Higher value change its scroll width value automatically in rtl
                        value = Math.min( value, _scrollwidth - _scrolldivBcr.width );
                    } else if( _FF || _isSafari ){
                        value = Math.min( value, 0 );
                    }
                } else {
                    value = Math.max( value, 0 );
                }
            } else if( isRight ){
                value = scrollLeft + this.getCrctScrollValue();
                if( _dir ){
                    if( _chrome ){
                        value = Math.max( value, 0 );
                        isRight = value != 0;
                    } else if( _FF || _isSafari ){
                        value = Math.max( value, _scrolldivBcr.width - _scrollwidth );
                        isRight = value != _scrolldivBcr.width - _scrollwidth;
                    } else {
                        value = Math.min( value, _scrollwidth - _scrolldivBcr.width ); 
                        isRight = value != _scrollwidth - _scrolldivBcr.width;
                    }
                } else {
                    value = Math.min( value, _scrollwidth - _scrolldivBcr.width );
                }
            } else {
                this.clearFastdom();
            } 
            if( isLeft || isRight ){
                _originalDiv.scrollLeft = value;
                var headerCells = Array.from( this.get_children( selectedCell.parentNode ) ),
                scrollIncrement = value - scrollLeft

                if( scrollIncrement ){

                    // why (value - sL) === > Updating my reference value without dom measure
                    _originalDiv._sL += scrollIncrement;

                    headerCells.forEach( cell => {
                        cell._bcr.left -= scrollIncrement;
                        cell._bcr.right -= scrollIncrement;
                    });

                    var fastdom = $L.fastdom;

                    this._measure = fastdom.measure( () => {
                        delete this._measure;
                        this._reqId = fastdom.mutate( () => {
                            delete this._reqId;
                            this.sortmousemove( { clientX : this._prevx }, true, isRight );
                        });
                    });
                }
             }
        }

        getCrctScrollValue() {
            return this.data.ltPropScrollStep * ( this._dir ? -1 : 1 );
        }

        swapColumnsInData(header, startIndex, endIndex) {
            var La = this.$addon.arrayUtils,
            current = La( header, 'removeAt', startIndex );
            La( header, 'insertAt', endIndex, current );
        }

        swapColumnsInDom(startIndex, endIndex) {
            this._preventCustomdelete = true;

            var rows = Array.from( this.getRows() );

            rows.forEach( row => {
                this.$component[ startIndex < endIndex ? 'insertAfter' : 'insertBefore' ]( this.get_nth_cell( row, endIndex ), this.get_nth_cell( row, startIndex ) );
            });
            delete this._preventCustomdelete;
        }

        removeEvents(evt) {
            var isTch = /touch/i.test( evt.type ),
            rel = 'removeEventListener',
            __doc = document;

            __doc[ rel ]( isTch ? 'touchmove' : 'mousemove', this._sortmousemove, true );
            __doc[ rel ]( isTch ? 'touchend' : 'mouseup', this._sortmouseup, true );

            delete this._sortmouseup; 
            delete this._sortmousemove; 
        }

        clearVariables() {
            delete this._elem; 
            delete this._xoffset; 
            delete this._originalIndex; 
            delete this._moved;
            delete this._affectedIndex; 
            delete this._tbody;
            delete this._cells; 
            delete this._prevx; 
            delete this._scrolldivBcr; 
            delete this._ww; 
            delete this._scrollwidth;
            delete this._originalDiv;
        }

        sortmouseup(evt) {
            var startIndex = this._originalIndex,
            selectedCell = this._elem,
            endIndex = selectedCell._transformedindex;

            this.resetcells();
            if( this.isSortEnabled() ){
                var failed,
                header = this.getData( 'ltPropHeader' ),
                next = this.get_nth_cell( selectedCell.parentNode, endIndex ),
                cb = "onBeforeDrop",
                failed = this.getMethods( cb ) && this.executeMethod( cb, selectedCell, next, startIndex, endIndex, header, evt ) == false;

                if( !failed && startIndex != endIndex ){
                    if( header.length ){
                        this.swapColumnsInData( header, startIndex, endIndex );
                    } else {
                        this.swapColumnsInDom( startIndex, endIndex );
                    }
                }
                this._setLeftForInterSection();
                !failed && this.callDrop( selectedCell, next, startIndex, endIndex, header, evt )
            } else {
                // Is onRelease a callback which gets fired when the element has not been moved? This sounds like a very special case callback. I want to know more about the use case of this

                // Generally all are adding some class to selected element in mousedown and want to remove the same in mouseup. If its not moved those classes will not be removed( or they have to write that in first mousemove ). In my case too i need to call reset cells. Thats why i here provided one extra callback
                this.callRelease( evt, selectedCell )
            }

            this.removeEvents( evt );
            this.clearFastdom();
            this.clearVariables();

            this.$node.classList.remove( 'lyteTableSortSelected' );
        }

        removeFakeCell(selectedCell) {
            var $node = $L( selectedCell ),
            ns = 'sortElement',
            div = $node.data( ns );
            if( div ){
              div.remove();
              $L( div ).data( 'relatedElement', void 0 );
            }
            $node.data( ns, void 0 );
        }

        resetcells(cells) {
            var affected = this._affectedIndex,
            cells = this._cells,
            selectedCell = this._elem;

            if( this.data.ltPropPreventTableModify ){
                this.removeFakeCell( selectedCell );
                this.resetSingleCell( selectedCell );
            } else {
                cells.forEach( function( cell ){
                    var rowChildren = this.get_children( cell.parentNode );
                    this.resetSingleCell( cell );
                     affected.forEach( function( affIndex ){
                        this.resetSingleCell( rowChildren[ affIndex ] );
                    }.bind( this ) );
                }.bind( this ) );
            }
        }

        resetSingleCell(cell) {                
            cell.style.transform = "";
            cell.classList.remove( 'lyteStickyTableColumnSortSelect', 'lyteStickyTableColumnMoving', 'lyteStickyTableColumnSortAnimate' );
            delete cell._transformedindex;
            delete cell._translateX;
        }

        checkIntersection(arg, ignore_removal) {
            var table = this.__table,
            __this = table.component;

            if( table.ltProp( 'stickyTable' ) && __this.data.ltPropScroll.horizontal ){
                var __elem = this._horizontalIntersectionDiv;
                if( arg && !__elem ){
                    __this.createIntersection.call( this, table );
                } else if( !arg && __elem ){
                    var intersection = __elem;
                    __this.removeIntersection.call( this, intersection, table );
                    __this.removeSticky( this );
                    __this.removeFixedClass( this );

                    if( ignore_removal ){
                        __this.createIntersection.call( this, table );
                    }
                }
            }
        }

        createIntersection(table) {
            var div = $L( document.createElement( 'div' ) ).addClass( 'lyteIntersectionDiv' ).get( 0 );
            table.getElementsByTagName( table.ltProp( 'tags' ).table )[ 0 ].appendChild( div );
            this._horizontalIntersectionDiv = div;
            div._cell = this;
            table.component._setLeftForInterSection();
        }

        disconnectedCallback() {
            var intersection = this._horizontalIntersectionDiv;
            if( intersection ){
                var table = this.__table,
                __this = table.component;

                if( table && __this._preventCustomdelete ){
                    return;
                }
                delete this.__table;
                __this.removeIntersection.call( this, intersection, table );
            }
        }

        removeIntersection(intersection, table) {
            if( table ){
                var ins = table.component._intersectionObs;
                if( ins ){
                    ins.unobserve( intersection );
                }
            }
            intersection.remove();

            delete intersection._cell;
            delete this._horizontalIntersectionDiv;
        }

        static observers(arg1) {
            return Object.assign(super.observers({
                stickyTable : function(){
                    var __this = this,
                    __data = __this.data;

                    if( __data.ltPropStickyTable ){
                        var $node = __this.$node,
                        scroll = __data.ltPropScroll,
                        scrollDiv = __this.getScrollDiv();

                        __this.__mixinAdded = true;
                        $node.classList.add( 'lyteStickyTable' );

                        if( scroll.horizontal ){
                            __this.registerInterSection( scrollDiv );
                            scrollDiv.addEventListener( 'scroll', __this.stickyScroll.bind( __this ), true );
                        }

                       $node.reset = function(){
                            __this._setLeftForInterSection( true );
                            if( !__this.__from_collapse ){
                                __this.update_collapse( true );
                            }
                       }.bind( __this );

                        __this.detectBrowsers();
                    }
                }.on( 'didConnect' ),

                setLeftForInterSection : function(){
                    if( this.data.ltPropStickyTable ){ 
                        this.$node.reset();
                    }
                }.observes( 'ltPropContent.[]', 'ltPropHeader.[]', 'ltPropContent', 'ltPropHeader' ).on( 'didConnect' ),

                bindingEvts : function(){
                   var data = this.data;

                   if( !data.ltPropStickyTable ){
                       return;
                   }

                   var header = this.getThead();
                   if( header ){
                       var fn,
                       ns = "addEventListener";
                       if( data.ltPropColumnSortable ){
                           fn = ( this._sortmousedown = this.sortablemousedown.bind( this ) );
                       } else {
                            if( fn = this._sortmousedown ){
                               ns = "removeEventListener";
                               delete this._sortmousedown;
                           }
                       }
                       if( fn ){
                           header[ ns ]( 'mousedown', fn, true );
                           header[ ns ]( 'touchstart', fn, true );
                       }
                   }

               }.observes( 'ltPropColumnSortable' ).on( 'didConnect' )
            }), arg1);
        }

        _() {
            _;
        }
    }

    return overrides(_LyteTableUtilsMixin);
});

export { LyteTableUtilsMixin };

LyteTableUtilsMixin.register({
    hash: "LyteTableUtilsMixin_4",
    refHash: "@zoho/lyte-ui-component_3"
});