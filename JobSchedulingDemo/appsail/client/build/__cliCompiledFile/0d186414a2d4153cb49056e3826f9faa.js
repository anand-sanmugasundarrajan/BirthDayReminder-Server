import { _defineProperty, includeMixins } from "@slyte/core/src/lyte-utils";
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
    },

    "LyteTableSortableMixin": function() {
        return LyteTableSortableMixin;
    },

    "LyteTableUtilsMixin": function() {
        return LyteTableUtilsMixin;
    }
});

import { LyteTableUtilsMixin } from "/node_modules/@zoho/lyte-ui-component/mixins/lyte-table-utils.js"
import { LyteTableSortableMixin } from "/node_modules/@zoho/lyte-ui-component/mixins/lyte-table-sortable.js"
import { prop } from "/node_modules/@slyte/core/index.js";
import { Component, LyteUiComponentComponentRegistry } from "/node_modules/@zoho/lyte-ui-component/components/component.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

import "/node_modules/@zoho/lyte-ui-component/plugins/lyte-scrollbar.js";

class LyteTableComponent extends includeMixins([LyteTableUtilsMixin, LyteTableSortableMixin], Component) {
    constructor() {
        super();
    }

    init() {
        var uA = window.navigator.userAgent,
        cb = "beforeRender",
        __this = this,
        $node = __this.$node,
        __window = window,
        add = "addEventListener",
        ns = '_tableResize';
        
        __this._dir = window._lyteUiUtils.getRTL();
        __this.isIE11Lyte = /rv:11/ig.test( uA );
        __this.isEdgeLyte = /Edge/ig.test( uA );
        __this._browser = __this.isIE11Lyte || __this.isEdgeLyte || uA.match( 'Safari' );

        /**
         * @method beforeRender
         * @version 1.0.1
         */

        __this.getMethods( cb ) && __this.executeMethod( cb, $node );

        /**
         * @utility scrollTable
         * @version 1.0.4
         */

        $node.scrollTable = function( x, y ){
            var scrollElem = ( __this.scrollDiv = __this.scrollDiv || $node.querySelector( 'div.lyteTableScroll' ) ),
            undef = void 0,
            evt = new Event( 'scroll', { bubbles: true } );

            if( x != undef ){
                scrollElem.scrollLeft = x;
            }

            if( y != undef ){
                scrollElem.scrollTop = y;
            }

            evt._byFunc = true;
            scrollElem.dispatchEvent( evt );

            if( !__this.__from_collapse ){
                __this.update_collapse( true );
            }
        }
        /**
         * @utility updateCollapse
         * @version 3.92.0
         */
        $node.updateCollapse = __this.update_collapse.bind( __this );

        if( !__window[ ns ] ){
            __window[ ns ] = true;

            var fn = window.resizeTable;

            __window[ add ]( 'resize', fn, true );
            __window[ add ]( 'orientationchange', fn, true );
        }

        /**
         * @utility toggleRows
         * @version 1.0.3
         */

         $node.toggleRows = function( val ){
            var name = val ? 'remove' : "add",
            __tags = this.ltProp('tags');

            Array.from( this.querySelectorAll( __tags.tbody + ' ' + __tags.tr + '.lytePreventInfiniteScroll' ) ).forEach( function( item ){
                item.classList[ name ]( 'lyteHidden' );
            });
         }

    }

    rtlfunc(lft, bcr, ww) {
        if( this._dir && lft != 'top' && lft != 'clientY' ){
            if( bcr ){
                if( lft == 'right' ){
                    return ww - bcr.left;
                } else if( lft == 'clientX' ){
                    return ww - bcr[ lft ];
                }
                return ww - bcr.right;
            } else if( lft == 'left' ){
                return 'right';
            } else if( lft == "right" ){
                return "left";
            }
        }
        return bcr ? bcr[ lft ] : lft;
    }

    didDestroy() {
        var __this = this,
        __data = __this.data,
        scrolldiv = __this.scrollDiv,
        $node = __this.$node,
        _window = window,
        iso = __this._intersectionObs;

        if( _window._tableResize && document.body.getElementsByTagName( 'lyte-table' ).length == 0 ){
            var rel = "removeEventListener";

            _window[ rel ]( 'resize', window.resizeTable, true );
            _window[ rel ]( 'orientationchange', window.resizeTable, true );

            delete _window._tableResize;
        }

        if( __data.ltPropNavigation ){
           window._lyteUiUtils.tableNavigation( $node.getElementsByTagName( __data.ltPropTags.table )[ 0 ], 'unbind' );
        }

        $L.fastdom.clear( this.__collpse_fdom );
        delete this.__collpse_fdom;

        if( iso ){
            __this._setmeasure && $L.fastdom.clear( __this._setmeasure );
            iso.disconnect();

            delete __this.reset;
            delete __this._intersectionObs;
            delete __this._intersections;
        }

        !__data.ltPropPreventScrollbar && scrolldiv && $L( scrolldiv ).removeScroll();

        delete __this.scrollDiv; delete __this._dummy; delete __this._dummy1; delete __this.resizeComponent; delete __this.targetElem; delete __this._dummyTr;
        delete $node.setValue; delete $node.scrollTable;
    }

    didConnect() {
        var __data = this.data,
        ltPropInfiniteScroll = __data.ltPropInfiniteScroll, 
        secData = __data.secondaryData,
        // ltPropResize = __data.ltPropResize,
        $node = this.$node,
        __tags = __data.ltPropTags;

        // if( __data.ltPropYield && (ltPropResize.vertical || ltPropResize.horizontal)) {
        //     this.resizeComponentAppend();
        // }
        try {
            var scrollDiv = $node.querySelector('div.lyteTableScroll');
            // scrollDiv._overlay = scrollDiv.getElementsByTagName( 'lyte-overlaydiv' )[ 0 ];
            this.scrollDiv = scrollDiv;
            scrollDiv.comp = this;
            scrollDiv._infiniteScroll = ltPropInfiniteScroll;
            if ( !__data.ltPropPreventScrollbar && $L.prototype.scroll ) {
                $L(scrollDiv).scroll( __data.ltPropScrollbarOption);
                var scrollbar = $node.querySelector('.lyteScrollContainer.lyteScrollContainerY');
                var header = $node.getElementsByTagName( __tags.th )[ 0 ], hgt;
                $L.fastdom.measure(function () {
                    var fg = this._dir;
                    // while applying scroll plugin vertical scrollbar needs some offset for enabling the virtual of only body part is scrolling. If it is zero we have to set height of the header as offset
                    if (header && scrollbar && scrollbar.offsetTop == 0) {
                        hgt = header.getBoundingClientRect().height;
                        $L.fastdom.mutate(function () {
                            scrollbar.style.top = hgt + 'px';
                            if (fg) {
                                $node.classList.add('lyteRTL')
                            }
                        }.bind(this))
                    }
                    $L.fastdom.mutate(function () {
                        __data.ltPropDualResize && $node.classList.add('lyteDualResize')
                        if (this.getMethods('afterRender')) {
                            this.executeMethod('afterRender', this.$node);
                        }
                    }.bind(this))
                }.bind(this))
            } else {
                if (this.getMethods('afterRender')) {
                    /**
                     * @method afterRender
                     * @version 1.0.1
                     */
                    this.executeMethod('afterRender', this.$node);
                }
            }
        } catch (err) {
        }
        if (ltPropInfiniteScroll) {
            $node.classList.add('infinitescroll')
            /**
             * @utility setValue
             * @version 1.0.2
             */
            $node.setValue = function (ret) {
                if (this._stopScroll) {
                    this.appendAddData1.call(this, ret)
                }
            }.bind(this)

            /**
             * @utility removeRow
             * @version 2.2.17
             */

            $node.removeRow = function (row) {
                this.removeRow(row);
            }.bind(this);

            /**
             * @utility scrollToRecord
             * @version 2.2.19
             */

            $node.scrollToRecord = this.scrollToRecord.bind(this);

            /**
             * @utility insertRow
             * @version 2.2.19
             */

            $node.insertRow = this.insertRow.bind(this);
        }

        if( __data.ltPropNavigation ){
            window._lyteUiUtils.tableNavigation( $node.getElementsByTagName( __tags.table )[ 0 ] );
        }
    }

    // width calculation for positioning
    columnWidth(fixedColumn, i, j) {

        var width = 0;
        j = j || 0;

        for( ; j < i; j++ ){
            width += fixedColumn[ j ].property.width;
        }

        return width;
    }

    heightCalc(rows, upper, hgtLimit) {
        var hgt = 0, j = upper;
        for( ; j > 0; j-- ){
            hgt += rows[ j ];
            if( hgtLimit < hgt ){
                break;
            }
        }
        return [ hgt, j ];
    }

    topElem(elem) {
        var __final;

        if( this.isIE11Lyte || this.isEdgeLyte ){
            __final = elem.getElementsByTagName( this.data.ltPropTags.td )[ 0 ];
        } else {
            __final = elem;
        }
        return __final ? __final.getBoundingClientRect() : {};
    }

    cellSet(elem, value) {
        var __elem;
        if( this.isIE11Lyte || this.isEdgeLyte ){
            __elem = Array.from( elem.getElementsByTagName( this.data.ltPropTags.td ) );
        } else {
           __elem = [ elem ];
        }

        if( value ){
            __elem.forEach( function( item ){
                item.style.transform = value;
            });
        }
        return __elem[ 0 ].style.transform;
    }

    scrollTable(event, obj) {
        // fastdom has been removed here due to delay causes error in calculation of data in ie edge safari
        var b = event.yScroll, 
        __tags = this.data.ltPropTags,
        ltPropData = this.getData('ltPropData'), 
        ltPropContent = this.getData('ltPropContent'), 
        scrollDiv = this.scrollDiv, 
        divClientRect = obj.tbodyClient, 
        tableClient = obj.$nodeClient, 
        table = this.$node.querySelector( __tags.table ),
        head = this.$node.getElementsByTagName( __tags.th )[ 0 ], 
        neglected = obj.neglected, 
        compNeg = obj.compNeg;
        head = head ? (head.property ? head.property.height : head.getBoundingClientRect().height) : 0;
        var topElem = obj.topElem, 
        top1 = obj.topElemClient;

        if (table.style.height.indexOf('px') == -1) {
            table.style.height = divClientRect.height + 'px';
            this._rowHgt = parseInt(top1.height * 10) / 10;
            this._step = parseInt((divClientRect.height - this._rowHgt * neglected.length) * 10) / 10;
        }
        if( !this._dummy ){
            this.createDummy( obj.tbody );
        }
        if (b == undefined && !scrollDiv.classList.contains('eventBinded')) {
            var prevScroll = parseFloat(this._dummy.style.transform.match(/[\d|.]+/ig)[0]),
                currScroll = scrollDiv.scrollTop
            if (currScroll > prevScroll) {
                b = 1
            } else {
                b = -1
            }
        }

        var __boundary = this._boundary,
        __dummy = this._dummy.style,
        __dummy1 = ( this._dummy1 || {} ).style,
        __rowHgt = this._rowHgt;

        if (b > 0) {
            if (parseFloat(tableClient.top + head) >= parseFloat(top1.bottom)) {
                if( __boundary.bottom <= ltPropContent.length - 2 ) {
                    var diff = Math.max(parseInt((tableClient.top + head - top1.bottom) / __rowHgt ), 1);
                    if( __boundary.bottom + diff > ltPropContent.length - 1) {
                        diff = ltPropContent.length - 1 - __boundary.bottom
                    }
                    for (var i = 0; i < diff; i++) {
                        __boundary.bottom += 1;
                        if (i >= diff - ltPropData.length) {
                            set(ltPropData[this._top], { body: ltPropContent[__boundary.bottom], index: __boundary.bottom })
                            topElem.dataOrder = __boundary.bottom;
                        }
                        __boundary.top = __boundary.bottom - ltPropData.length + 1;
                        if (this.cellSet(topElem)) {
                            this.regex(topElem)
                        } else {
                            this.cellSet(topElem, "translateY(" + (this._step) + 'px)')
                        }
                        __dummy.transform = 'translateY(' + (parseFloat( __dummy.transform.match(/[\d|.]+/ig)[0]) + __rowHgt ) + 'px)'
                        __dummy.height = Math.max(parseFloat( __dummy.height) - __rowHgt, 0) + 'px';
                        if (this._browser) {
                            __dummy1.transform = 'translateY(' + (parseFloat( __dummy1.transform.match(/[\d|.]+/ig)[0]) + __rowHgt ) + 'px)'
                        }
                        this._bottom = this._top;
                        this._top = (this._top + 1) % ltPropData.length;
                        if ( __boundary.bottom >= ltPropContent.length) {
                            __boundary.bottom = ltPropContent.length - 1;
                            this._top = (this._top + 1) % ltPropData.length;
                            break
                        }
                        topElem = this.nthoftype.call(this, obj.tbody, this._top + compNeg.length, true)
                    }
                } else {
                    this.scrollEndMethod1();
                }
            }

        } else if (b < 0) {
            var bottmElem = obj.bottmElem, bottom = obj.bottmElemClient;
            if (tableClient.bottom <= bottom.top) {
                var mat = this.cellSet(bottmElem).match(/[\d|.]+/ig);
                if (!mat || (mat && mat[0] == '0')) {
                    return
                }
                var diff = parseInt(Math.max(parseFloat((bottom.top - tableClient.bottom) / __rowHgt ), 0)),
                    minDiff = Math.max(diff - 1 - this._boundary.top, 0)
                for (var i = diff - 1; i >= 0 && diff != 0; i--) {
                    if ( __boundary.top == 0) {
                        break;
                    }
                    __boundary.top -= 1;
                    if (i <= ltPropData.length - 1 + minDiff) {
                        set(ltPropData[this._bottom], { body: ltPropContent[ __boundary.top], index: __boundary.top })
                        bottmElem.dataOrder = __boundary.top;
                    }
                    __boundary.bottom = __boundary.top + ltPropData.length - 1;
                    if (this.cellSet(bottmElem)) {
                        this.regex(bottmElem, true)
                    }
                    __dummy.height = (parseFloat( __dummy.height) + __rowHgt ) + 'px';
                    __dummy.transform = 'translateY(' + (parseFloat( __dummy.transform.match(/[\d|.]+/ig)[0]) - __rowHgt ) + 'px)'
                    if (this._browser) {
                        __dummy1.transform = 'translateY(' + (parseFloat( __dummy1.transform.match(/[\d|.]+/ig)[0]) - __rowHgt ) + 'px)'
                    }
                    this._top = this._bottom;
                    this._bottom = (ltPropData.length + this._bottom - 1) % ltPropData.length;
                    if (__boundary.top == -1) {
                        __boundary.top = 0;
                        __boundary.bottom = __boundary.top + ltPropData.length - 1;
                        break
                    }
                    bottmElem = this.nthoftype.call(this, obj.tbody, this._bottom + compNeg.length, true)
                }
            }
        }
    }

    createDummy(tbody) {
        var dummy = document.createElement( this.data.ltPropTags.tr );
        dummy.classList.add('dummy');
        tbody.appendChild(dummy)
        dummy.setAttribute('style', 'transform:translateY(0px);height:0px')
        this._dummy = dummy;
        if (this._browser) {
            var dummy1 = document.createElement('div');
            dummy1.classList.add('dummy');
            this.scrollDiv.appendChild(dummy1)
            dummy1.setAttribute('style', 'transform:translateY(0px);height:5px')
            this._dummy1 = dummy1;
        }
    }

    regex(elem, flag) {
        if( this.isIE11Lyte || this.isEdgeLyte ){
            var cells = elem.getElementsByTagName( this.data.ltPropTags.td ),
            __length = cells.length;

            for( var i = 0; i < __length; i++ ){
                this.regex1( cells[ i ], flag );
            }
        } else {
            this.regex1( elem, flag );
        }
    }

    regex1(elem, flag) {
        var __style = elem.style,
        __transform = __style.transform,
        rgx = /[\d|.]+/ig,
        __step = this._step;

        if( flag ) {
            __style.transform = __transform.replace( rgx, function( arg ) { return Math.max( parseFloat( arg ) - __step, 0 ).toFixed( 3 ) });
        } else {
            __style.transform = __transform.replace( rgx, function( arg ) { return ( parseFloat( arg ) + __step ).toFixed( 3 ) });
        }
    }

    scrollEndMethod1() {
        if( this._stopScroll ) {
            return
        }
        this._stopScroll = true;
        if (this.getMethods('scrollEnd')) {
            /**
             * @method scrollEnd
             * @version 1.0.0
             */
            this.appendAddData1(this.executeMethod('scrollEnd'))
        }
    }

    appendAddData1(ret) {
        if (ret) {
            if (ret.then) {
                Promise.resolve(ret).then(function (arg) {
                    if (arg) {
                        this.apd1.call(this, arg);
                    }
                }.bind(this), function () {
                    console.log( 'error at scroll end promise' );
                }.bind(this));
            } else {
                this.apd1.call(this, ret)
            }
        }
    }

    apd1(ret) {
        var __data = this.data,
        ltPropContent = __data.ltPropContent, 
        ltPropData = __data.ltPropData,
        La = this.$addon.arrayUtils;

        this._prevent = true
        if( ret.constructor == Array ){
            La( ltPropContent, 'concat', ret );
        } else if( ret.constructor == Object ) {
            La( ltPropContent, 'push', ret );
        }
        delete this._prevent;
        delete this._stopScroll;
    }

    nthoftype(tbody, index, fg) {
        var arr = [],
        rows = tbody.getElementsByTagName( this.data.ltPropTags.tr );

        if( fg ){
            return rows[ index ];
        }

        var __length = rows.length;

        for( var i = 0; i < __length; i++ ) {
            var __cur = rows[ i ];
            if( !__cur.classList.contains('dummy')) {
                arr.push( this.get_children( __cur )[ index ] );
            }
        }
        return arr;
    }

    scroll(event) {

        // cant use fastdom because of jerk in ie edge safari browser
        var component = this.comp,
            // headerList =component.$node.querySelectorAll( 'lyte-th' ),
            // scrollleft and top are required for process like fixing columns and infinite scroll. If scroll is dispatched by plugin event object contains these properties or it is calculated
        obj = this._wheelObj || { bcr: {} };

        if( component.__ignore_scroll && component.__allow_scroll !== true ){
            return;
        }

        this._scrollLeft = obj.scrollLeft != undefined ? obj.scrollLeft : this.scrollLeft;
        this._scrollTop = obj.scrollTop != undefined ? obj.scrollTop : this.scrollTop;
        
        var direction = this._direction,
        __is_not_sticky = !component.data.ltPropStickyTable;

        __is_not_sticky && component.scrollCheck.call(this, event, obj);

        if (this._scrollLeft == 0 && direction != 'rtl' && component.getData('ltPropInfiniteScroll')) {
            var ary = component.getData('columns');
            component.$addon.arrayUtils(ary, 'remove', 0, ary.length);
            
            if( __is_not_sticky ){
                var fixedd = this.getElementsByClassName( 'lyteTableFixed' ),
                __length = fixedd.length;

                for( var i = 0; i < __length; i++ ) {
                    var __cur = fixedd[ i ];

                    __cur.style.left = '0px';
                    __cur.classList.remove('lyteTableFixed');
                }
            }
        }
        if (component.data.ltPropInfiniteScroll) {
            component.scrollTable.call(component, event, obj)
        }
        delete this._scrollLeft; delete this._scrollTop;
    }

    // fixed column checks and removals
    scrollCheck(event, obj) {
        var component = this.parentElement.component,
        __tags = component.data.ltPropTags,
        table = this.getElementsByTagName( __tags.table )[0], scrollDiv = this,
            scrollTop = this._scrollTop, scrollLeft = this._scrollLeft,
            scrollDir = component.getData('ltPropScroll'),
            direction = this._direction,
            tbody = table.getElementsByTagName( __tags.tbody )[0],
            thead = this.getElementsByTagName( __tags.thead )[0],
            ths = [],
            headerList = [],
            fixedColumn = [];

        if (thead) {
            ths = thead.getElementsByTagName( __tags.th );
        }

        if ((scrollTop != this.prevScollTop || event._byFunc) && scrollDir.vertical) {
            var colsNos = ths;
            if (colsNos.length) {
                for (var i = 0; i < colsNos.length; i++) {
                    colsNos[i].classList.add('tableRowFixed')
                    // colsNos[i].style.top = (scrollTop) + 'px';
                    component.transform(true, colsNos[i], scrollTop)
                }
                if (!scrollTop) {
                    for (var i = 0; i < colsNos.length; i++) {
                        colsNos[i].classList.remove('tableRowFixed');
                    }
                }
            }
        }
        // for horizontal scroll    
        if ((scrollLeft != this.prevScollLeft || event._byFunc) && scrollDir.horizontal) {
            var columns = component.data.columns, head = [];
            if (thead) {
                var headRows = Array.apply(Array, thead.getElementsByTagName( __tags.tr )),
                    headRowCopy = Array.apply(Array, thead.getElementsByClassName('lyteRowCopy'));
                head = headRows.concat(headRowCopy);
            }

            var ltPropFixedColumnClass = component.data.ltPropFixedColumnClass || '';
            if (head.length) {
                headerList = head[0].getElementsByTagName( __tags.th );
                for (var n = 0; n < headerList.length; n++) {
                    headerList[n].classList.contains('lyteFixedColumn') && fixedColumn.push(headerList[n]);
                }
            }
            // fastdom removed due to jerk in ie edge chrome browser
            for (var i = columns.length; i < fixedColumn.length; i++) {
                if (((fixedColumn[i].property.right + component.columnWidth.call(component, fixedColumn, i) > (obj.scrollDivClient.right)) && direction == 'rtl') || ((fixedColumn[i].property.left < (obj.scrollDivClient.left + component.columnWidth.call(component, fixedColumn, i))) && direction != 'rtl')) {
                    var width = fixedColumn[i].property.width
                    var order = fixedColumn[i].order
                    if (order + 1 < headerList.length) {
                        !fixedColumn[i].classList.contains('lyteTableFixed') && fixedColumn[i].classList.add('lyteTableFixed')
                        columns.push(fixedColumn[i])
                        for (var zz = 1; zz < head.length; zz++) {
                            var colex = head[zz].getElementsByTagName( __tags.th )[order];
                            colex && !colex.classList.contains('lyteTableFixed') && colex.classList.add('lyteTableFixed')
                        }
                        var colls = /*component.isIE11Lyte ? */component.nthoftype.call(component, tbody, order) /*: this.querySelectorAll( 'lyte-tbody lyte-td:nth-of-type(' + (order + 1) + ')' )*/
                        for (var k = 0; k < colls.length; k++) {
                            !colls[k].classList.contains('lyteTableFixed') && colls[k].classList.add('lyteTableFixed')
                            if (ltPropFixedColumnClass) {
                                colls[k].classList.add(ltPropFixedColumnClass)
                            }
                        }
                    }
                }
            }
            for (var n = columns.length - 1; n >= 0; n--) {
                var j = columns.length - 1;
                if ((scrollLeft == 0 && !(window.chrome && direction == 'rtl')) || ((((parseFloat((headerList[columns[j].order + 1].property.right + columns[j].property.width + component.columnWidth.call(component, columns, columns.length - 1)).toFixed(2)) <= parseFloat(obj.scrollDivClient.right.toFixed(2))) || (headerList[columns[j].order + 1].property.right + 2 < columns[j].property.left)) && direction == 'rtl') || ((headerList[columns[j].order + 1].property.left >= (obj.scrollDivClient.left + columns[j].property.width + component.columnWidth.call(component, columns, columns.length - 1))) && (columns[j].property.left >= (obj.scrollDivClient.left + component.columnWidth.call(component, fixedColumn, columns.length - 1))) && direction != 'rtl'))) {
                    // var innerElem = headerList[columns[j].order].querySelector( 'lyte-th-data' );
                    headerList[columns[j].order].classList.contains('lyteTableFixed') && headerList[columns[j].order].classList.remove('lyteTableFixed');
                    if (ltPropFixedColumnClass) {
                        headerList[columns[j].order].classList.remove(ltPropFixedColumnClass)
                    }
                    // columns[j].style.removeProperty('left');
                    component.transform(false, columns[j], 0)
                    for (var zz = 0; zz < head.length; zz++) {
                        var colex = head[zz].getElementsByTagName( __tags.th )[columns[j].order];
                        if (colex) {
                            colex.classList.contains('lyteTableFixed') && colex.classList.remove('lyteTableFixed');
                            // colex.style.removeProperty('left');
                            component.transform(false, colex, 0)

                        }
                    }
                    var currCols = /*component.isIE11Lyte ?*/ component.nthoftype.call(component, tbody, columns[j].order) /*: this.querySelectorAll( 'lyte-tbody lyte-td:nth-of-type(' + (columns[j].order + 1) + ')' )*/;
                    for (var z = 0; z < currCols.length; z++) {
                        // currCols[z].style.removeProperty('left');
                        component.transform(false, currCols[z], 0)
                        currCols[z].classList.contains('lyteTableFixed') && currCols[z].classList.remove('lyteTableFixed')
                        if (ltPropFixedColumnClass) {
                            currCols[z].classList.remove(ltPropFixedColumnClass)
                        }
                    }
                    component.$addon.arrayUtils(columns, 'removeAt', j)
                }
                else {
                    break;
                }
            }
            for (var j = 0; j < columns.length; j++) {
                //positioning on scroll
                var left, cells = /*component.isIE11Lyte ? */component.nthoftype.call(component, tbody, columns[j].order) /*: this.querySelectorAll( 'lyte-tbody lyte-td:nth-of-type(' + (columns[j].order + 1) + ')' )*/,
                    uA = window.navigator.userAgent.toLowerCase();
                if (j == 0) {
                    if (direction == 'rtl') {
                        if (uA.indexOf('firefox') != -1 || (uA.indexOf('safari') != -1 && (window._lyteUiUtils.isNegativeScroll() || (!(uA.indexOf('chrome') != -1) && !(uA.indexOf('chromium') != -1))))) {
                            left = scrollLeft + (component.columnWidth.call(component, headerList, columns[j].order, 0))
                        }
                        else if (uA.indexOf('edge') != -1 || uA.indexOf('trident') != -1 || uA.indexOf('msie') != -1) {
                            left = -scrollLeft + (component.columnWidth.call(component, headerList, columns[j].order, 0))
                        }
                        else {
                            left = scrollLeft - 1 - (obj.scrollWidth) + obj.scrollDivClient.width + (component.columnWidth.call(component, headerList, columns[j].order, 0))
                        }
                    }
                    else {
                        left = scrollLeft - (component.columnWidth.call(component, headerList, columns[j].order, 0))
                    }
                }
                else {
                    if (direction == 'rtl') {
                        if (uA.indexOf('firefox') != -1 || (uA.indexOf('safari') != -1 && (window._lyteUiUtils.isNegativeScroll() || (!(uA.indexOf('chrome') != -1) && !(uA.indexOf('chromium') != -1))))) {
                            left = /*parseInt(columns[j - 1].style.left)*/ component.transform(!1, columns[j - 1]) + component.columnWidth.call(component, headerList, columns[j].order, columns[j - 1].order + 1)
                        }
                        else {
                            left = /*parseInt(columns[j - 1].style.left)*/ component.transform(!1, columns[j - 1]) + component.columnWidth.call(component, headerList, columns[j].order, columns[j - 1].order + 1);
                        }
                    }
                    else {
                        left = component.transform(!1, columns[j - 1]) /*parseInt(columns[j - 1].style.left)*/ - component.columnWidth.call(component, headerList, columns[j].order, columns[j - 1].order + 1)
                    }
                }
                for (var x = 0; x < cells.length; x++) {
                    !cells[x].classList.contains('lyteTableFixed') && cells[x].classList.add('lyteTableFixed');
                    //cells[x].style.left = left + 'px';
                    component.transform(false, cells[x], left)
                }
                // columns[j].style.left = left + 'px';
                component.transform(false, columns[j], left)
                for (var zz = 0; zz < head.length; zz++) {
                    var colex = head[zz].getElementsByTagName( __tags.th )[columns[j].order];
                    if (colex) {
                        !colex.classList.contains('lyteTableFixed') && colex.classList.add('lyteTableFixed');
                        // colex.style.left = left + 'px';
                        component.transform(false, colex, left)
                    }
                }
            }
        }
        this.prevScollLeft = scrollLeft;
        this.prevScollTop = scrollTop;
    }

    transform(flag, elem, value) {
        var transform = (elem.style.transform || 'translateX(0px) translateY(0px)'),
            transX = parseFloat(/translateX\((.+)/.exec(transform)[1]),
            transY = parseFloat(/translateY\((.+)/.exec(transform)[1]);

        if (value != undefined) {
            if (!flag) {
                elem.style.transform = "translateY(" + transY + 'px) ' + 'translateX(' + value + 'px)';
            } else {
                elem.style.transform = "translateY(" + value + 'px) ' + 'translateX(' + transX + 'px)';
            }
        } else {
            return parseFloat(flag ? transY : transX);
        }
    }

    borderChange() {
        if (this.data.ltPropBorder) {
            this.$node.classList.add('border');
        }
        else {
            this.$node.classList.remove('border');
        }
    }

    widthObs() {
        this.$node.querySelector( this.data.ltPropTags.table ).style.width = this.data.ltPropWidth;
    }

    heightObs() {
        this.$node.querySelector( this.data.ltPropTags.table ).style.height = this.data.ltPropHeight;
    }

    sortable() {
        var row = this.$node.getElementsByTagName( this.data.ltPropTags.thead )[ 0 ];
        if( row ){
            var ns = "remove";

            if( this.data.ltPropColumnSortable ){
                this.colSort = this.sortableColumns.bind( this );
                ns = "add";
            }

            if( ns ){
                var rel = ns + "EventListener",
                fn = this.colSort;

                row[ rel ]( "mousedown", fn );
                row[ rel ]( "touchstart", fn );
                row.parentNode.classList[ ns ]( 'sortableTable' );
            }
        }
    }

    composePath(event) {
        var arr = [], 
        __target = event.target,
        node = __target.correspondingElement || __target;
        while( node && node.tagName != 'HTML' ){
            arr.push( node );
            node = node.parentNode;
        }
        return arr;
    }

    sortableColumns(event) {
        var __tags = this.data.ltPropTags,
        target = this.closestFind.call(this, event.path ? event.path : this.composePath.call(this, event), __tags.th + ':not(.lyteTableFixed)');
        if (target && this.$node.contains(target)) {
            var ret, isTch = event.type == "touchstart";
            if (this.getMethods('onBeforeSelect')) {
                /**
                 * @method onBeforeSelect
                 * @version 1.0.3
                 */
                ret = this.executeMethod('onBeforeSelect', target, event, this.$node)
            }
            if (ret != false) {
                var evt = isTch ? event.touches[0] : event
                this._ww = window.innerWidth;
                this.mousemove = this.sortableMouseMove.bind(this);
                this.offLeft = this.rtlfunc.call(this, 'clientX', evt, this._ww) - this.rtlfunc.call(this, 'left', target.getBoundingClientRect(), this._ww);
                this.colHead = target;
                this._thisBccr = this.$node.getBoundingClientRect()
                target.classList.add('lyteStickyTableColumnSortSelect')
                document.documentElement.addEventListener(isTch ? "touchmove" : 'mousemove', this.mousemove);
                this.mouseup = this.sortableMouseup.bind(this);
                document.documentElement.addEventListener(isTch ? "touchend" : 'mouseup', this.mouseup);
                this.flag = true;
                event.preventDefault();
                if (this.getMethods('onSelect')) {
                    /**
                     * @method onSelect
                     * @version 1.0.3
                     */
                    this.executeMethod('onSelect', target, event, this.$node)
                }
            }
        }
    }

    horiScroll(dummyDiv, ww) {
        var lt = this.rtlfunc.call(this, 'left'), IE = this.isIE11Lyte || this.isEdgeLyte,
            isEvt, check1, check2;
        if (/mousemove|touchmove/i.test(dummyDiv.type)) {
            isEvt = true;
        }
        if (isEvt) {
            if (this._reqId) {
                return;
            }

            var __bcr = this.__bcr;

            check1 = this.rtlfunc( 'clientX', dummyDiv, ww ) > Math.min( this.rtlfunc( 'right', __bcr, ww), ww - 2 );
            check2 = this.rtlfunc( 'clientX', dummyDiv, ww ) <= Math.max( 0, this.rtlfunc('left', __bcr, window.innerWidth ) );
        } else {
            check1 = (parseFloat(dummyDiv.style[lt]) - this._xxoff + parseFloat(dummyDiv.style.width)) >= this.rtlfunc('right', this._thisBccr, ww) - 1;
            check2 = (parseFloat(dummyDiv.style[lt]) - this._xxoff + parseFloat(dummyDiv.style.width)) >= this.rtlfunc('right', this._thisBccr, ww) - 1;
        }

        if (check1) {
            this.scrollDiv.scrollLeft += 2 * (this._dir ? (-1 * (IE ? -1 : 1)) : 1)
            if (isEvt) {
                var __value = 2 * ( this._dir ? -1 : 1 );
                this.__clientX -= __value;

                if( this.data.ltPropFixResizeCursor ){
                    this.__trans_value += __value
                }
            }
            this._reqId = window.requestAnimationFrame(function () {
                delete this._reqId;
                this.horiScroll(dummyDiv, ww)
            }.bind(this))
        } else if (check2) {
            if (isEvt) {
                var __value =  2 * ( this._dir ? -1 : 1 );
                this.__clientX += __value;
                
                if( this.data.ltPropFixResizeCursor ){
                    this.__trans_value -= __value
                }
            }
            this.scrollDiv.scrollLeft -= 2 * (this._dir ? (-1 * (IE ? -1 : 1)) : 1)
            this._reqId = window.requestAnimationFrame(function () {
                delete this._reqId;
                this.horiScroll(dummyDiv, ww);
            }.bind(this))
        } else {
            window.cancelAnimationFrame(this._reqId);
            delete this._prevent;
        }
    }

    sortableMouseMove(event) {
        var isTch = event.type == "touchmove", evt = event;
        if (isTch && evt.touches.length != 1) {
            return
        } else if (isTch) {
            evt = evt.touches[0]
        }
        if (this.flag && this._timeout == undefined) {
            var target = this.colHead, xscroll;
            var clientRect = target.getBoundingClientRect();
            var div = document.createElement('div');
            div.classList.add('lyteTableSortHelper');
            div.innerText = this.colHead.innerText;
            this._xxoff = xscroll = (window.pageXOffset || document.documentElement.scrollLeft) * (this._dir ? -1 : 1);
            var yscroll = window.pageYOffset || document.documentElement.scrollTop
            div.style.height = clientRect.height + 'px';
            div.style.width = clientRect.width + 'px';
            div.style[this.rtlfunc.call(this, 'left')] = (xscroll + this.rtlfunc.call(this, 'left', clientRect, this._ww)) + 'px';
            div.style.top = (yscroll + clientRect.top) + 'px';
            this._timeout = setTimeout(function () {
                window._lyteUiUtils.appendChild( document.body, div );
                this.flag = false;
            }.bind(this), 100)
        }
        var dummyDiv = document.querySelector('div.lyteTableSortHelper')
        if (dummyDiv) {
            var lft = this._dir ? "right" : "left", ww = window.innerWidth;
            var newLeft = Math.max(Math.min((this.rtlfunc.call(this, 'clientX', evt, this._ww) - this.offLeft), this.rtlfunc.call(this, 'right', this._thisBccr, this._ww) - parseFloat(dummyDiv.style.width)), this.rtlfunc.call(this, 'left', this._thisBccr, this._ww));
            // if( ( newLeft > parseFloat( dummyDiv.style[ lft ] - this._xxoff ) ) || ( newLeft < parseFloat( dummyDiv.style[ lft ] ) - this._xxoff ) ){
            if ((parseFloat(newLeft) > this.rtlfunc('left', this._thisBccr, ww)) && ((parseFloat(newLeft) + parseFloat(dummyDiv.style.width)) < this.rtlfunc('right', this._thisBccr, ww))) {
                window.cancelAnimationFrame(this._reqId);
                delete this._prevent; delete this._scrollDir
            }
            if (this._prevent) {
                return
            }
            dummyDiv.style[lft] = (newLeft + this._xxoff) + 'px';
            this._prevent = true
            this.horiScroll(dummyDiv, ww)
            if (this.getMethods('onDrag')) {
                /**
                 * @method onDrag
                 * @version 1.0.3
                 */
                this.executeMethod('onDrag', this.colHead, dummyDiv, event, this.$node)
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    sortableMouseup(event) {
        if (!this.flag) {
            var __tags = this.data.ltPropTags,
            isTch = event.type == "touchend", dummyDiv = document.getElementsByClassName('lyteTableSortHelper')[0], clientRect = dummyDiv.getBoundingClientRect(), x = clientRect.left + clientRect.width / 2 + 2, y = clientRect.top + clientRect.height / 2,
                adjCol = this.closestFind.call(this, document.elementsFromPoint ? document.elementsFromPoint(x, y) : this.elementsFromPointCal.call(this, x, y), __tags.th + ':not(.lyteTableFixed)'),
                tbody = this.$node.getElementsByTagName( __tags.tbody )[0];
            if (adjCol != this.colHead && adjCol) {
                var Heads = this.colHead.parentElement.getElementsByTagName( __tags.th ),
                    colOrder = Array.prototype.indexOf.call(Heads, this.colHead),
                    adjOrder = Array.prototype.indexOf.call(Heads, adjCol),
                    ltPropHeader = this.data.ltPropHeader, ret;
                if (this.getMethods('onBeforeDrop')) {
                    /**
                     * @method onBeforeDrop
                     * @version 1.0.3
                     */
                    ret = this.executeMethod('onBeforeDrop', this.colHead, adjCol, colOrder, adjOrder, ltPropHeader, event, this.$node)
                }
                if (ret != false) {
                    if (!ltPropHeader.length) {
                        window._lyteUiUtils.insertBefore(adjOrder > colOrder ? adjCol.nextElementSibling : adjCol, this.colHead);
                        var colGrp = /*this.isIE11Lyte ? */this.nthoftype.call(this, tbody, colOrder) /*: this.$node.querySelectorAll( 'lyte-tbody lyte-td:nth-of-type(' + ( colOrder + 1) +')' )*/;
                        var AdjColGrp = /*this.isIE11Lyte ?*/ this.nthoftype.call(this, tbody, adjOrder) /*: this.$node.querySelectorAll( 'lyte-tbody lyte-td:nth-of-type(' + ( adjOrder + 1) +')' )*/;
                        for (var i = 0; i < colGrp.length; i++) {
                            window._lyteUiUtils.insertBefore(adjOrder > colOrder ? AdjColGrp[i].nextElementSibling : AdjColGrp[i], colGrp[i]);
                        }
                    }
                    else {
                        var flag = adjOrder > colOrder ? true : false;
                        var temp = this.$addon.arrayUtils(ltPropHeader, 'removeAt', colOrder), newOrder = Array.prototype.indexOf.call(adjCol.parentElement.getElementsByTagName( __tags.th ), adjCol);
                        this.$addon.arrayUtils(ltPropHeader, 'insertAt', colOrder < adjOrder ? (newOrder + 1) : newOrder, temp);
                        var newCol = adjCol.parentElement.getElementsByTagName( __tags.th, adjCol.parentElement)[colOrder < adjOrder ? (newOrder + 1) : newOrder];
                        if (adjCol.classList.contains('tableRowFixed')) {
                            newCol.classList.add('tableRowFixed');
                            newCol.style.top = adjCol.style.top;
                        }
                    }
                    if (this.getMethods('onDrop')) {
                        /**
                         * @method onDrop
                         * @version 1.0.3
                         */
                        this.executeMethod('onDrop', this.colHead, adjCol, colOrder, adjOrder, ltPropHeader, event, this.$node)
                    }
                }
            } else {
                this.getMethods( 'onRelease' ) && this.executeMethod( 'onRelease', this.colHead, event, this.$node );
            }
            document.body.removeChild(dummyDiv);
        } else {
            clearTimeout(this._timeout)
        }
        document.documentElement.removeEventListener(isTch ? "touchend" : 'mouseup', this.mouseup);
        document.documentElement.removeEventListener(isTch ? "touchmove" : 'mousemove', this.mousemove);
        this.colHead.classList.remove('lyteStickyTableColumnSortSelect')
        window.cancelAnimationFrame(this._reqId)
        delete this.mouseup; delete this._xxoff;
        delete this.mousemove;
        delete this.offLeft;
        delete this.colHead;
        delete this.flag;
        delete this._timeout;
        delete this._thisBccr; delete this._ww;
        delete this._reqId; delete this._prevent; delete this._scrollDir
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }

    elementsFromPointCal(x, y) {
        var arr = [], element = document.elementFromPoint(x, y);
        while (element != document && element != document.documentElement && element != document.body && element != this.$node) {
            element.style.pointerEvents = 'none';
            arr.push(element);
            element = document.elementFromPoint(x, y);
        }
        for (var i = 0; i < arr.length; i++) {
            arr[i].style.pointerEvents = 'initial';
        }
        return arr;
    }

    // resizeComponentAppendObs: function () {
    //     if (this.data.ltPropYield) {
    //         this.resizeComponentAppend.call(this);
    //     }
    // }.observes('ltPropResize', 'ltPropResize.{}'),

    // resizeComponentAppend: function () {
    //     var ltPropResize = this.data.ltPropResize, scrdiv = this.$node.getElementsByTagName('lyte-table-structure')[0],
    //         tRz = scrdiv.getElementsByTagName('lyte-table-resize')[0], vrz = scrdiv.getElementsByTagName('lyte-table-vertical-resize')[0],
    //         hrz = scrdiv.getElementsByTagName('lyte-table-horizontal-resize')[0];
    //     if (ltPropResize.vertical || ltPropResize.horizontal) {
    //         if (!tRz) {
    //             var comp = document.createElement('lyte-table-resize')
    //             scrdiv.appendChild(comp)
    //             comp.addEventListener('mousedown', this.actions.tableResize.bind(this));
    //             comp.addEventListener('touchstart', this.actions.tableResize.bind(this));
    //         }
    //     } else if (tRz) {
    //         scrdiv.removeChild(tRz)
    //     }
    //     if (ltPropResize.vertical) {
    //         if (!vrz) {
    //             var comp = document.createElement('lyte-table-vertical-resize')
    //             scrdiv.appendChild(comp)
    //             comp.addEventListener('mousedown', this.actions.tableResize.bind(this))
    //             comp.addEventListener('touchstart', this.actions.tableResize.bind(this));
    //         }
    //     }
    //     else if (vrz) {
    //         scrdiv.removeChild(vrz)
    //     }
    //     if (ltPropResize.horizontal) {
    //         if (!hrz) {
    //             var comp = document.createElement('lyte-table-horizontal-resize')
    //             scrdiv.appendChild(comp)
    //             comp.addEventListener('mousedown', this.actions.tableResize.bind(this))
    //             comp.addEventListener('touchstart', this.actions.tableResize.bind(this));
    //         }
    //     }
    //     else if (hrz) {
    //         scrdiv.removeChild(hrz)
    //     }
    // },

    data(arg1) {
        
        var default_values = window._lyteUiUtils.getDefault( 'lyte-table' );

        return Object.assign(super.data({
            //user data
            /**
             * @componentProperty {object[]} ltPropContent
             * @version 1.0.0
             * @default []
             */
            ltPropContent: prop("array", { "default": [] }),
            /**
             * @componentProperty {object[]} ltPropHeader
             * @version 1.0.0
             * @default []
             */
            ltPropHeader: prop("array", { "default": [] }),
            /**
             * @componentProperty {string} ltPropId=''
             * @version 1.0.0
             */
            ltPropId: prop("string", { "default": '' }),
            /**
             * @componentProperty {string} ltPropClass=''
             * @version 1.0.0
             */
            ltPropClass: prop("string", { "default": default_values.class || '' }),
            /**
             * @componentProperty {boolean} ltPropBorder=false
             * @version 1.0.0
             */
            ltPropBorder: prop("boolean", { "default": default_values.border || false }),
            /**
             * @componentProperty {string} ltPropHeaderLabelKey=''
             * @version 1.0.0
             */
            ltPropHeaderLabelKey: prop("string", { "default": '' }),
            /**
             * @componentProperty {string} ltPropBodyLabelKey=''
             * @version 1.0.0
             */
            ltPropBodyLabelKey: prop("string", { "default": '' }),
            /**
             * @componentProperty {string} ltPropWidth=100%
             * @version 1.0.0
             */
            ltPropWidth: prop('string', { 'default': default_values.width || '100%' }),
            /**
             * @componentProperty {string} ltPropHeight=100%
             * @version 1.0.0
             */
            ltPropHeight: prop('string', { 'default': default_values.height || '100%' }),
            /**
             * @typedef {object} tableResize
             * @property {boolean} horizontal
             * @property {boolean} vertical
             */

            /**
             * @componentProperty {tableResize} ltPropResize
             * @version 1.0.0
             * @default {}
             */
            ltPropResize: prop('object', { 'default': default_values.resize || {} }),
            /**
             * @componentProperty {string} ltPropFixedColumnClass=''
             * @version 1.0.0
             */
            ltPropFixedColumnClass: prop('string', { 'default': default_values.fixedColumnClass || '' }),
            /**
             * @componentProperty {boolean} ltPropYield=false
             * @version 1.0.0
             */
            ltPropYield: prop('boolean', { 'default': default_values.yield || false }),
            /**
             * @typedef {object} tableScroll
             * @property {boolean} horizontal=true
             * @property {boolean} vertical=true
             */
            /**
             * @componentProperty {tableScroll} ltPropScroll
             * @default {"horizontal":true,"vertical":true}
             */
            ltPropScroll: prop('object', { 'default': default_values.scroll || { horizontal: true, vertical: true } }),
            /**
             * @componentProperty {boolean} ltPropColumnSortable=false
             * @version 1.0.0
             */
            ltPropColumnSortable: prop('boolean', { 'default': default_values.columnSortable || false }),
            /**
             * @typedef {object} tableScrollbar
             * @property {left | right} verticalPosition=left
             * @property {top | bottom} horizontalPosition=bottom
             * @property {string} containerClass
             * @property {string} handlerClass
             * @property {string} horizontalContainerClass
             * @property {string} horizontalHandlerClass
             * @property {string} verticalContainerClass
             * @property {string} verticalHandlerClass
             * @property {boolean} preventVertical
             * @property {boolean} preventHorizontal
             * @property {number} keyStep=30
             * @property {hover | always | scroll} showOn=scroll
             * @property {number} wheelSpeed=1
             * @property {boolean} preventOnEnd=true
             * @property {object} offset={"x":0,"y":0}
             * @property {boolean} nested
             * @property {number} max=Infinity
             * @property {number} min=-Infinity
             */
            /**
             * @componentProperty {tableScrollbar} ltPropScrollbarOption
             * @version 1.0.0
             * @default {}
             */
            ltPropScrollbarOption: prop('object', { 'default': default_values.scrollbarOption || {} }),
            /**
             * @componentProperty {boolean} ltPropDualResize=false
             * @version 1.0.5
             */
            ltPropDualResize: prop('boolean', { default: default_values.dualResize || false }),

            // scroll table test data
            /**
             * @experimental ltPropData
             */
            ltPropData: prop("array", { "default": [] }),
            /**
             * @componentProperty {boolean} ltPropInfiniteScroll=false
             * @version 1.0.0
             */
            ltPropInfiniteScroll: prop('boolean', { 'default': default_values.infiniteScroll || false }),
            /**
             * @componentProperty {string} ltPropCellHeight=20px
             * @version 1.0.2
             */
            ltPropCellHeight: prop('string', { default: default_values.cellHeight || '20px' }),
            /**
             * @componentProperty {number} ltPropContentLength
             * @version 1.0.2
             */
            ltPropContentLength: prop('number', { default_values : default_values.contentLength || void 0 }),
            /**
             * @componentProperty {boolean} ltPropPreventScrollbar=false
             * @version 1.0.0
             */
            ltPropPreventScrollbar: prop('boolean', { default: default_values.preventScrollbar || false }),

            /**
             * @componentProperty {string} ltPropRole=""
             * @version 3.45.0
             */

            ltPropRole : prop( 'string', { default : default_values.role || "" } ),

            // sticky table props
            /**
             * @componentProperty {boolean} ltPropStickyTable=false
             * @version 3.53.0
             */
            ltPropStickyTable : prop( 'boolean', { default : default_values.stickyTable || false } ),
            /**
             * @componentProperty {number} ltPropScrollStep=2
             * @version 3.53.0
             */
            ltPropScrollStep : prop( 'number', { default : default_values.scrollStep || 2 } ),
            /**
             * @componentProperty {boolean} ltPropPreventTableModify=true
             * @version 3.53.0
             */
            ltPropPreventTableModify : prop( 'boolean', { default : default_values.preventTableModify == false ? false : true } ),
            /**
             * @componentProperty {string} ltPropSortDummyColumClass=""
             * @version 3.53.0
             */
            ltPropSortDummyColumClass : prop( 'string', { default : default_values.sortDummyColumnClass || "" } ),

            /**
             * @componentProperty {boolean} ltPropNavigation=false
             * @version 3.51.2
             */
            ltPropNavigation : prop( 'boolean', { default : default_values.navigation || false } ),

            /**
             * @componentProperty {boolean} ltPropReset=false
             * @version 3.53.0
             */

            ltPropReset : prop( 'boolean', { default : false } ),
            /**
             * @typedef {object} tableTags
             * @property {string} table="lyte-table-structure"
             * @property {string} thead="lyte-thead"
             * @property {string} tbody="lyte-tbody"
             * @property {string} tr="lyte-tr"
             * @property {string} td="lyte-td"
             * @property {string} th="lyte-th"
             */

            /**
             * @componentProperty {tableTags} ltPropTags
             * @version 3.91.0 
             */

            ltPropTags : prop( 'object', { default : default_values.tags || { table : "lyte-table-structure", thead : "lyte-thead", tbody : "lyte-tbody", td : "lyte-td", th : "lyte-th", tr : "lyte-tr" } } ),

            ltPropSortable : prop( 'boolean' , { default : default_values.sortable || false }),

            ltPropContainment : prop('string' , { default : default_values.containment || '' }),

            lyteUnbound: prop('boolean', { default: false }),

            ltPropFromListview : prop('boolean' , {default : false} ),

            /**
             * @componentProperty {boolean} ltPropFixResizeCursor=false
             * @version 3.95.0
             */

            ltPropFixResizeCursor : prop( 'boolean', { default : default_values.fixResizeCursor || false } ),

            // system data
            columns: prop('array', { 'default': [] }),
            nonFixedColumn: prop('array', { 'default': [] }),
            minWidth1: prop('string', { 'default': '' }),
            minWidth2: prop('string', { 'default': '' }),
            secondaryData: prop('array', { 'default': [] }),
            boundary: prop('object', { 'default': {} }),
            rowHeights: prop('array', { 'default': [] }),
            fromListView : prop( 'boolean', { default : false } )
        }), arg1);
    }

    resize_fun(evt) {
        var isTch = evt.type == "touchstart",
        __evt = evt,
        touches = evt.touches;

        if( isTch ){
            if( touches.length > 1 ){
                return;
            }
            __evt = touches[ 0 ];
        }

        evt.preventDefault();

        var __this = this,
        __bcr = __this.__bcr,
        __elem = __this.__elem,
        x_inc = ( __this.__clientX - ( __this.__clientX = __evt.clientX ) ) * ( __this._dir ? -1 : 1 ),
        y_inc = __this.__clientY - ( __this.__clientY = __evt.clientY ),
        original_x_inc = x_inc,
        __min1 = __this.__min1,
        __min2 = __this.__min2,
        __max1 = __this.__max1,
        __max2 = __this.__max2,
        __width = parseFloat( __elem.style.width ),
        new_width = __width - x_inc,
        new_height,
        __next = __elem.nextElementSibling,
        new_width2,
        cb = "onResizeMove",
        table = __this.__table,
        __resize = __this.data.ltPropResize,
        __dir = __this.__dir,
        is_hgt_modify = /vert|both/i.test( __dir || '' ),
        $node = $L( __this.$node );

        if( __dir ){
            if( !__resize.horizontal ){
                x_inc = 0;
            }

            if( !__resize.vertical ){
                y_inc = 0;
            }
        }

        if( __max1 && new_width > __max1 ){
            x_inc = __max1 - __width;
        } else if( __min1 && new_width < __min1 ){
            x_inc = __width - __min1;
        }

        if( !is_hgt_modify && __min2 != void 0 ){
            var __width2 = parseFloat( __next.style.width ),

            new_width2 = __width2 + x_inc;

            if( __max2 && new_width2 > __max2 ){
                x_inc = __width2 - __max2;
            } else if( __min2 && new_width2 < __min2 ){
                x_inc = __min2 - __width2;
            }

            new_width2 = __width2 + x_inc;
        } else {
            __next = void 0;
        }

        if( is_hgt_modify ){
            var __height = parseFloat( __elem.style.height );
            new_height = __height - y_inc;

            if( __max2 && new_height > __max2 ){
                y_inc = __max1 - __height;
            } else if( __min2 && new_height < __min2 ){
                y_inc = __height - __min2;
            }

            new_height = __height - y_inc;
        }

        if( original_x_inc && __this.data.ltPropFixResizeCursor && /lyte-th/i.test( __elem.tagName ) ){
            var __diff = original_x_inc - x_inc,
            trans_value = __this.__trans_value;

            if( __diff ){
                __this.__trans_value += __diff;
            } else if( trans_value ) {
                if( ( trans_value > 0 && x_inc < 0 ) || ( trans_value < 0 &&  x_inc > 0 ) ){
                    if( __next ){
                        new_width2 -= x_inc;
                    }

                    if( Math.abs( trans_value ) < Math.abs( x_inc ) ){
                        x_inc += trans_value;
                        __this.__trans_value = 0;
                    } else {
                        __this.__trans_value += x_inc;
                        x_inc = 0;
                    }
                }
            }
        }

        new_width = __width - x_inc;

        if( table ){
           $L( table ).css( 'width', ( parseFloat( table.style.width ) - x_inc ) + 'px' );

        } 

        $L( __elem ).css( 'width', new_width + 'px' );
        __next && $L( __next ).css( 'width', new_width2 + 'px' );

        if( __dir ){
            var ret = $node.css( 'maxWidth', new_width + 'px' );
            if( new_height ){
                ret.css( 'maxHeight', new_height + 'px' );
                $L( __elem ).css( 'height', new_height + 'px' );
            }
        }

        window.cancelAnimationFrame( __this._reqId );
        delete __this._reqId;

        __this.horiScroll( evt, __this.__ww );

        __this.data.ltPropStickyTable && __this._setLeftForInterSection();

        __this.getMethods( cb ) && __this.executeMethod( cb, __elem, evt, __this.$node );
    }

    resize_up(evt) {
        var isTch = evt.touches,
        __doc = document,
        __fn = 'removeEventListener',
        cb = 'onResizeEnd',
        __elem = this.__elem;

        __doc[ __fn ]( isTch ? 'touchmove' : 'mousemove', this.__mmove, true );
        __doc[ __fn ]( isTch ? 'touchend' : 'mouseup', this.__mup, true );

        [ '__dir', '__ww', '__min2', '__min1', '__max1', '__max2', '__clientX', '__clientY', '__elem', '__bcr', '__table' ].forEach( function( item ){
            delete this[ item ];
        }.bind( this ) );

        $L( this.$node ).removeClass( 'resizing lyteTableResizing' );
        $L( __elem ).removeClass( 'resizeSelect lyteTableResizeSelect' );

        this.clearfdm();

        /**
         * @method onResizeEnd
         * @version 1.0.3
         */

        this.getMethods( cb ) && this.executeMethod( cb, __elem, this.$node, evt );
    }

    static actions(arg1) {
        return Object.assign(super.actions({

            tableResize : function( evt, from ){
                var isTch = evt.type == "touchstart",
                __evt = evt,
                touches = evt.touches;

                if( isTch ){
                    if( touches.length > 1 ){
                        return
                    }
                    __evt = touches[ 0 ];
                }

                var  __this = this,
                __data = __this.data,
                __tags = __data.ltPropTags,
                table = __this.$node.getElementsByTagName( __tags.table )[ 0 ],
                __elem = from ? table : evt.target.parentNode,
                cb = "onBeforeResizeSelect";

                if( __this.getMethods( cb ) && __this.executeMethod( cb, __elem, evt, __this.$node ) == false ){
                    return;
                }

                var tag = __elem.tagName,
                is_dual = __data.ltPropDualResize,
                fastdom = $L.fastdom,
                __maxwidth = table.style.maxWidth,
                __minWidth = table.style.minWidth,
                __maxheight = table.style.maxHeight,
                __layout = table.style.tableLayout,
                $table = $L( table ),
                __width = __elem.offsetWidth,
                is_cell = tag.toLowerCase() == __tags.th,
                nextelem = is_cell ? __elem.nextElementSibling : void 0,
                __next_width = nextelem ? nextelem.offsetWidth : 0,
                table_width = table.offsetWidth,
                scroll_elem = __this.scrollDiv,
                sL = scroll_elem.scrollLeft,
                is_vert = /vert|both/i.test( from || '' ),
                table_height = is_vert ? ( table.offsetHeight + 'px' ): table.style.height,
                $$node = $L( __this.$node ),
                table_style = window.getComputedStyle( table ),
                is_fixed = table_style.tableLayout == "fixed",
                read_value = table_style.getPropertyValue( 'max-width' ),
                max_width_read = is_cell || (  /px/i.test( read_value ) ? parseFloat( read_value ) : Infinity );

                __this.__ignore_scroll = true;

                __this.__bcr = __this.$node.getBoundingClientRect();
                __this.__ww = window.innerWidth;
                __this.__dir = from;

                __this.__trans_value = 0;

                if( is_cell && /%|px/i.test( table_style.minWidth ) ){
                    var __arr = [];

                    Array.from( __this.get_children( __elem.parentNode ) ).forEach( function( item ){
                        __arr.push({
                            node : item,
                            width : item.style.width || ( item.offsetWidth + 'px' )
                        });
                    });

                    __arr.forEach( function( item ){
                        item.node.style.width = item.width;
                    });
                }

                $table.css( {
                    maxWidth :  '0px',
                    tableLayout : "auto",
                    minWidth : "auto"
                });

                if( is_vert ){
                    $table.css( 'maxHeight', '0px' );
                }

                $$node.addClass( 'lyteTableInitialResize' );

                __this.__fd1 = fastdom.measure( function(){
                    var __style = window.getComputedStyle( __elem ),
                    actual_min = parseFloat( __style.getPropertyValue( 'min-width' ) ),
                    minWidth1 = Math.min( __width, Math.max( __elem.offsetWidth, actual_min ) ),
                    maxWidth1 = is_cell ? parseFloat( __style.getPropertyValue( 'max-width' ) ) : max_width_read,
                    minWidth2,
                    maxWidth2;

                    if( minWidth1 == 0 ){
                        minWidth1 = 50;
                    }

                    if( is_cell && is_fixed ){
                        minWidth1 = Math.min( minWidth1, actual_min );
                    }

                    if( maxWidth1 < minWidth1 ){
                        maxWidth1 = minWidth1;
                    }

                    if( is_cell ){
                        if( !is_dual ){
                            if( nextelem ){
                                var next_style = window.getComputedStyle( nextelem ),
                                actual_min_next = parseFloat( next_style.getPropertyValue( 'min-width' ) );

                                minWidth2 = Math.min( __next_width, Math.max( nextelem.offsetWidth, actual_min_next ) );
                                maxWidth2 = parseFloat( next_style.getPropertyValue( 'max-width' ) );

                                if( minWidth2 == 0 ){
                                    minWidth2 = 50;
                                }

                                if( is_fixed ){
                                    minWidth2 = Math.min( minWidth2, actual_min_next );
                                }

                                if( maxWidth2 < minWidth2 ){
                                    maxWidth2 = minWidth2;
                                }
                            }
                        } else {
                            __this.__table = table;
                        }
                    } else if( is_vert ){
                        maxWidth2 = parseFloat( __style.getPropertyValue( 'max-height' ) );
                        minWidth2 = parseFloat( __style.getPropertyValue( 'min-height' ) );
                    }

                    __this.__fd2 = fastdom.mutate( function(){
                        __this.__min1 = minWidth1;
                        __this.__min2 = minWidth2;
                        __this.__max1 = maxWidth1;
                        __this.__max2 = maxWidth2;

                        __this.__clientX = __evt.clientX;
                        __this.__clientY = __evt.clientY;

                        __this.__elem = __elem;

                        $table.css( {
                            maxWidth : __maxwidth,
                            width : table_width + 'px',
                            maxHeight : __maxheight,
                            height : table_height,
                            tableLayout : __layout,
                            minWidth : __minWidth
                        });

                        $L( __elem ).addClass( 'resizeSelect lyteTableResizeSelect' ).css( 'width', __width + 'px' );
                        nextelem && $L( nextelem ).css( 'width', __next_width + 'px' );

                        delete __this.__ignore_scroll;
                        scroll_elem.scrollLeft = sL;

                        var __doc = document,
                        __fn = "addEventListener";

                        __doc[ __fn ]( isTch ? 'touchmove' : "mousemove", __this.__mmove = __this.resize_fun.bind( __this ), true );
                        __doc[ __fn ]( isTch ? 'touchend' : "mouseup", __this.__mup = __this.resize_up.bind( __this ), true );

                        $$node.addClass( 'resizing lyteTableResizing' ).removeClass( 'lyteTableInitialResize' );

                        __this.getMethods( cb = "onResizeSelect" ) && __this.executeMethod( cb, __elem, evt, __this.$node );
                    });
                });


                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
            },

            rowMouseDown : function( evt ){
                if( this.data.ltPropSortable && (evt.button == 0 || (evt.touches && evt.touches.length==1) ) ){      
                        this.rowMouseDown( evt );
                }
            }
            
        }), arg1);
    }

    clearfdm() {
        var __fastdom = $L.fastdom;

        [ '__fd1', '__fd2' ].forEach( function( item ){
            var __cur = this[ item ];

            if( __cur ){
                __fastdom.clear( __cur );
                delete this[ item ];
            }
        }.bind( this ) );
    }

    arrayFrom(nodeList) {
        if (Array.from) {
            return Array.from(nodeList)
        }
        return Array.apply(Array, nodeList);
    }

    closestFind(path, query) {
        var elements = this.arrayFrom.call(this, document.querySelectorAll(query));
        for (var i = 0; i < path.length; i++) {
            if (Array.prototype.indexOf.call(elements, path[i]) != -1) {
                return path[i];
            }
        }
        return null;
    }

    findDomIndex(order) {
        var data = this.data.ltPropData;
        for (var i = 0; i < data.length; i++) {
            if (data[i].index == order) {
                return i;
            }
        }
        return -1;
    }

    insertRow(index, insertData) {
        var boundary = this._boundary,
            top = boundary.top,
            bottom = boundary.bottom,
            content = this.data.ltPropContent,
            data = this.data.ltPropData,
            _contentLength = this.data.ltPropContentLength;

        this._prevent = true;

        this.$addon.arrayUtils(content, 'insertAt', index, insertData);

        if (index <= bottom) {
            var start = Math.max(top, index);

            for (var i = start; i <= bottom; i++) {
                var domIndex = this.findDomIndex(i);
                this.$component.set(data[domIndex], { index: data[domIndex].index, body: content[i] });
            }
        }

        if( this.data.ltPropContentLength > content.length || this.data.ltPropContentLength > data.length ) {
            var _length = data.length;

            this.$addon.arrayUtils( data, 'push', {
                index : _length,
                body : content[ _length ],
                checked : false
            });

            boundary.bottom++;
            this._bottom++;

            if( this._rowHgt ){
                this._step = this._rowHgt * data.length;
            }
        }

        delete this._prevent;
    }

    removeRow(dataIndex) {
        var tags = this.data.ltPropTags,
        rows = this.arrayFrom($L( tags.tbody + ' ' + tags.tr + ':not(.dummy)', this.$node));

        if (dataIndex.constructor != Number) {
            dataIndex = dataIndex.dataOrder || rows.indexOf(dataIndex);
        }

        var domIndex = this.findDomIndex(dataIndex),
            boundary = this._boundary,
            top = boundary.top,
            bottom = boundary.bottom,
            content = this.data.ltPropContent,
            data = this.data.ltPropData,
            removed = false;

        this._prevent = true;

        if (domIndex != -1) {
            if (bottom == content.length - 1) {
                for (var i = dataIndex; i <= bottom; i++) {
                    var cIndex = (domIndex + (i - dataIndex) + data.length) % data.length;
                    if (i + 1 == content.length) {
                        this.regex(rows[cIndex], true);

                        if ( this._dummy ) {
                            var _style = this._dummy.style;
                            _style.transform = 'translateY(' + ( parseFloat( _style.transform.match( /[\d|.]+/ig)[ 0 ] ) - this._rowHgt ) + 'px)';
                            
                            if ( this._dummy1 ) {
                                var _style1 = this._dummy1.style;
                                _style1.transform = 'translateY(' + ( parseFloat( _style1.transform.match( /[\d|.]+/ig)[ 0 ] ) - this._rowHgt ) + 'px)';
                            }
                        }
                        if( content[ top - 1 ] ){
                            set(data[cIndex], { index: data[cIndex].index, body: content[top - 1] });
                            rows[ cIndex ].dataOrder = top - 1;
                        }
                    } else {
                        set(data[cIndex], { index: data[cIndex].index, body: content[i + 1] });
                        rows[cIndex].dataOrder--;
                    }
                }
                if( content.length - 1 == data.length - 1 ){
                    this.$addon.arrayUtils( data , 'pop' );
                    removed = true;
                }else if( boundary.top >= dataIndex){
                    boundary.top--;
                } 
                if(this._top != 0){
                    this._top = (this._top -1 + data.length) % data.length;
                }
                this._bottom = (this._bottom - 1 + data.length) % data.length;
                boundary.bottom--;
                boundary.top!=0 && boundary.top--;
 
            } else {
                for (var i = dataIndex; i <= bottom; i++) {
                    var cIndex = (domIndex + (i - dataIndex) + data.length) % data.length;
                    set(data[cIndex], { index: data[cIndex].index, body: content[i + 1] });
                }
                if (this._dummy) {
                    var _style = this._dummy.style;
                    _style.height = Math.max( 0, parseFloat( _style.height ) - this._rowHgt ) + 'px';
                }
            }
            this.$addon.arrayUtils(content, 'removeAt', dataIndex);
        } else {
            this.$addon.arrayUtils(content, 'removeAt', dataIndex);
            if (dataIndex < top) {

                for (var i = top; i <= bottom; i++) {
                    var cIndex = (this._top + i - top + rows.length) % rows.length;
                    set(data[cIndex], { index: data[cIndex].index, body: content[i == content.length ? (top - 1) : i] });
                    if (i == bottom) {
                        this.regex(rows[cIndex], true);
                        this._bottom = (this._bottom - 1 + data.length) % data.length;
                        this._top = (this._top - 1 + data.length) % data.length;
                    }
                }

                boundary.bottom--;
                boundary.top--;

                var _style = this._dummy.style;
                _style.transform = 'translateY(' + Math.max( 0, ( parseFloat( _style.transform.match(/[\d|.]+/ig)[ 0 ] ) - this._rowHgt ) ) + 'px)';
                if (this._dummy1) {

                    var _style1 = this._dummy1.style;
                    _style1.transform = 'translateY(' + Math.max( 0, ( parseFloat( _style1.transform.match( /[\d|.]+/ig )[ 0 ] ) - this._rowHgt ) ) + 'px)';
                }

            } else if (dataIndex > bottom) {
                if (this._dummy) {
                    this._dummy.style.height = Math.max(0, parseFloat(this._dummy.style.height) - this._rowHgt) + 'px';
                }
            }

            if( content.length < this.data.ltPropContentLength && !removed ){
                    Lyte.arrayUtils( data, 'pop' );
            }
        }

        delete this._prevent;
    }

    scrollToRecord(rowIndex, isImmediate, scrollTop) {
        var content = this.data.ltPropContent,
            contentLength = content.length;

        if (rowIndex == undefined || rowIndex < 0 || rowIndex >= contentLength) {
            return;
        }

        if (!this._rowHgt) {
            this.$node.scrollTable();
        }

        $L.fastdom.clear(this._scrollToRecord);

        isImmediate ? this.processScrollToRecord( rowIndex , scrollTop ) : this._scrollToRecord = $L.fastdom.measure(this.processScrollToRecord.bind(this, rowIndex));

        // this.processScrollToRecord( rowIndex );
    }

    processScrollToRecord(rowIndex, _scrollTop) {
        var boundary = this._boundary,
        top = boundary.top,
        bottom = boundary.bottom,
        content = this.data.ltPropContent,
        data = this.data.ltPropData,
        contentLength = data.length,
        __length = content.length,
        step = this._step,
        rowHeight = this._rowHgt,
        scrollDiv = this.scrollDiv,
        offsetHeight = scrollDiv.offsetHeight,
        scrollHeight = scrollDiv.scrollHeight,
        scrollTop = scrollDiv.scrollTop,
        possible_per_view = Math.floor( offsetHeight / rowHeight ),
        scrollPosition = Math.max(0, Math.min(rowIndex, __length - Math.min( contentLength, possible_per_view ) ) ),
        newScrollTop = scrollPosition * rowHeight,
        scrollToSet,
        __tags = this.data.ltPropTags;

        if( content.length <= contentLength ){
            scrollToSet = Math.max( 0, Math.min( scrollHeight - offsetHeight, rowIndex * rowHeight ) );
        } else if( bottom - possible_per_view >= rowIndex ) {
            scrollToSet = newScrollTop;
        } else {
            if (scrollPosition != rowIndex) {
                newScrollTop += (step - offsetHeight);
                var thead = $L( __tags.thead, this.$node).get(0);
                if (thead) {
                    newScrollTop += thead.offsetHeight;
                }
            }

            var scrollHeight = scrollDiv.scrollHeight,
            maxScrollTop = scrollHeight - offsetHeight,
            diff = step - offsetHeight,
            rows = this.arrayFrom($L( __tags.tbody + ' ' + __tags.tr + ':not(.dummy)', this.$node)),
            fact = Math.floor(scrollPosition / contentLength),
            newscrollPosition = scrollPosition % contentLength;

            for (var i = 0; i < contentLength; i++) {
                var cIndex = scrollPosition + i,
                domIndex = cIndex % contentLength,
                dom = rows[ domIndex ],
                iteration = fact /*+ (i < newscrollPosition ? 1 : 0)*/;

                if( cIndex >= __length ){
                    if( scrollPosition % contentLength < domIndex ){
                        iteration--;
                    }
                    cIndex -= contentLength;
                } else {
                    if( scrollPosition % contentLength > domIndex ){
                        iteration++;
                    }
                }

                set(data[domIndex], { index: cIndex, body: content[cIndex] });

                this.cellSet(dom, "translateY(0px)")
                for (var j = 0; j < iteration; j++) {
                    this.regex(dom);
                }
            }

            if( !this._dummy ){
                this.createDummy( this.$node.querySelector( __tags.tbody ) );
            }

            var boundary_top = Math.min( scrollPosition, __length - contentLength );

            this._dummy.style.transform = 'translateY(' + ( boundary_top * rowHeight ) + 'px)';
            if (this._dummy1) {
                this._dummy1.style.transform = 'translateY(' + ( boundary_top * rowHeight) + 'px)';
            }
            scrollToSet = newScrollTop;
            boundary.top = boundary_top;
            boundary.bottom = boundary_top + contentLength - 1;
            this._top = boundary_top % contentLength;
            this._bottom = ( boundary_top + contentLength - 1) % contentLength;
        }

        var scrollFn = function (  ) {
            scrollDiv.querySelector( 'lyte-table-structure' ).style.height = ( contentLength * rowHeight ) + 'px';
            scrollDiv.scrollTop = scrollToSet;
        }
        if( _scrollTop != void 0 ){
            scrollToSet = _scrollTop;
            scrollFn();
        }else{
            window.requestAnimationFrame( scrollFn );
        }
        
    }

    calculateRowHeight() {
        let tbody = this.$node.getElementsByTagName( this.data.ltPropTags.tbody );
        let tr = tbody[0].children[0];
        let rowHeight = tr && tr.getBoundingClientRect().height;

        return this._rowHgt = rowHeight;
    }

    update_aria(cell) {
        var row = cell.parentNode,
        index = this.get_children( row ).indexOf( cell ),
        table = row.parentNode.parentNode,
        sA = "setAttribute",
        role = "role",
        __tags = this.data.ltPropTags;

        table[ sA ]( role, this.data.ltPropRole );
        
        Array.from( this.get_children( table ) ).forEach( function( item ){

            if( /^div$/i.test( item.tagName || "" ) ){
                return;
            }

            item[ sA ]( role, "rowgroup" );

            var name = item.tagName.toLowerCase() == __tags.thead ? 'columnheader' : 'cell';

            Array.from( this.get_children( item ) ).forEach( function( row ){
                row[ sA ]( role, 'row' );

                var __cell = this.get_children( row )[ index ];

                if( __cell ){
                    __cell[ sA ]( role, name );
                }
            }.bind( this ) );
        }.bind( this ) );
    }

    get_children(__elem) {
        var elems = __elem.length != void 0 ? Array.from( __elem ) : [ __elem ],
        ret = [];

        elems.forEach( function( item ){
            Array.from( item.children ).forEach( function( __item ){
                if( !/template/i.test( __item.tagName ) ){
                    ret.push( __item );
                }
            });
        });

        return ret;
    }

    get_nth_cell(row, index) {
        var children = this.get_children( row ),
        __len = children.length,
        __count = 0;

        if( this.data.ltPropFromListview ){
            return children[ index ];
        }
        for( var i = 0; i < __len; i++ ){
            var __cell = children[ i ];
            if( __count == index ){
                return __cell;
            } else if( __count > index ){
                break;
            }

            __count += ( __cell.colSpan || 1 );
        }
    }

    update_collapse(frm_update) {
        if( this.__from_collapse ){
            return;
        }
        var cells = Array.from( this.$node.getElementsByClassName( 'lyteHeaderCellCollapsed' ) );
        cells.forEach( function( item ){
            this.toggle_column( item, true, frm_update );
        });
    }

    toggle_column(__cell, to_collapse, frm_update) {
        var __index = Array.from( __cell.parentNode.children ).indexOf( __cell ),
        header_cls = "lyteHeaderCellCollapsed",
        body_cls = "lyteCellCollapsed",
        tbody = this.$node.getElementsByTagName( this.data.ltPropTags.tbody ),
        rows = this.get_children( tbody ),
        __is_sticky = this.data.ltPropStickyTable;

        __cell.classList[ to_collapse ? 'add' : "remove" ]( header_cls );

        rows.forEach( function( item, index ){
            var __elem = this.get_nth_cell( item, __index );

            if( __elem ){
                if( !index ){
                    if( to_collapse ){
                        __elem.rowSpan = rows.length;
                    } else {
                        __elem.rowSpan = 1;
                    }
                    __elem.classList[ to_collapse ? "add" : "remove" ]( "lyteCollapseFirstCell" );
                }

                __elem.classList[ to_collapse ? "add" : "remove" ]( body_cls );
            }
        }.bind( this ) );

        if( !this.__from_collapse && !frm_update && ( __is_sticky || __cell.classList.contains( 'lyteTableFixed' ) ) ){
            $L.fastdom.clear( this.__collpse_fdom );
            this.__from_collapse = true;
            this.__collpse_fdom = $L.fastdom.measure( function(){
                delete this.__collpse_fdom;
                this.$node[ __is_sticky ? "reset" : "scrollTable" ]();
                delete this.__from_collapse;
            }.bind( this ) );
        }
    }

    collapse_column(__cell) {
        this.toggle_column( __cell, true );
    }

    expand_column(__cell) {
        this.toggle_column( __cell );
    }

    static observers(arg1) {
        return Object.assign(super.observers({
            initProcess1 : function( arg ){
                var __this = this,
                __data = __this.data,
                is_reset = arg && arg.item == "ltPropReset";

                if( __this._prevent ){
                    return
                }

                if( is_reset && arg.newValue == false ){
                    return;
                }

                if( __data.ltPropInfiniteScroll ){
                    var table = __this.$node.getElementsByTagName( __data.ltPropTags.table )[ 0 ],
                    content = __data.ltPropContent || [],
                    __length = content.length,
                    len = Math.min( __data.ltPropContentLength || __length, __length ),
                    data = [];

                    if( __length == 0 && !arg ){
                        return;
                    }

                    if( table ){
                        table.style.height = "auto";
                    }

                    for( var i = 0; i < len; i++ ){
                        data[ i ] = {
                            body : content[ i ],
                            checked : false,
                            index : i
                        };
                    }

                    if( __data.fromListView ){
                        var act_data = __data.ltPropData,
                        arr_util = this.$addon.arrayUtils,
                        obj_util = this.$addon.objectUtils;

                        data.forEach( function( item, index ){
                            var __cur = act_data[ index ];

                            if( __cur ){
                                obj_util( __cur, 'add', 'body', item.body );
                                obj_util( __cur, 'add', 'index', item.index );
                                obj_util( __cur, 'add', 'checked', item.checked );
                            }else {
                                arr_util( act_data, 'insertAt', item.index, item );
                            }
                        });

                        arr_util( act_data, 'splice', data.length, act_data.length - data.length );

                    } else {
                        this.setData( 'ltPropData', data );
                    }

                    var __dummy = __this._dummy,
                    __dummy1 = __this._dummy1,
                    __scrolldiv = __this.scrollDiv,
                    __translate = "translateY(0px)";

                    delete __this._stopScroll;

                    if( arg ){
                        __dummy && $L( __dummy ).css({
                            height : 0,
                            transform : __translate
                        });

                        __dummy1 && $L( __dummy1 ).css( 'transform', __translate );

                        __scrolldiv.scrollTop = 0;
                        __scrolldiv.scrollLeft = 0;
                    }

                    __this._boundary = {
                        top : __this._top = 0,
                        bottom : __this._bottom = Math.max( len - 1, 0 )
                    };
                }

                if( is_reset ){
                    this.setData( arg.item, false );
                }
            }.observes( 'ltPropContent.[]', 'ltPropReset' ).on( 'init' ),

            // border 

            borderChangeObs: function () {
                this.borderChange.call(this);
            }.observes('ltPropBorder').on('didConnect'),

            widthObsObs: function () {
                this.widthObs.call(this);
            }.observes('ltPropWidth').on('didConnect'),

            heightObsObs: function () {
                this.heightObs.call(this);
            }.observes('ltPropHeight').on('didConnect'),

            sortableObs: function () {
                !this.data.ltPropStickyTable && this.sortable();
            }.observes('ltPropColumnSortable').on('didConnect')
        }), arg1);
    }

    includes() {
        return [LyteTableUtilsMixin, LyteTableSortableMixin];
    }

    _() {
        _;
    }
}

LyteTableComponent._template = "<template tag-name=\"lyte-table\"> <div class=\"lyteTableScroll\" onmousedown=\"{{action('rowMouseDown',event)}}\" ontouchstart=\"{{action('rowMouseDown',event)}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropSortable,'&amp;&amp;',ltPropInfiniteScroll)}}\" is=\"case\" lc-id=\"lc_id_0\"> <div class=\"lyteTableSortablePlaceholder lyteTableSortablePlaceholderHidden\"></div> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropYield,'==',false)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-table-structure id=\"{{ltPropId}}\" class=\"{{ltPropClass}}\" role=\"{{ltPropRole}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropHeaderLabelKey}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-colgroup> <template items=\"{{ltPropHeader}}\" item=\"list\" index=\"indexVal\" is=\"for\" _new=\"true\"> <lyte-col></lyte-col> </template> </lyte-colgroup> <lyte-thead role=\"rowgroup\"> <lyte-tr role=\"row\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropHeader.length}}\" is=\"case\" lc-id=\"lc_id_0\"><template items=\"{{ltPropHeader}}\" item=\"list\" index=\"indexVal\" is=\"for\" _new=\"true\"> <lyte-th id=\"{{list.id}}\" class=\"{{list.class}}\" index=\"{{indexVal}}\" resize=\"{{list.resize}}\" fixed=\"{{list.fixed}}\" icon=\"{{list.icon}}\" role=\"columnheader\"> {{unescape(list[ltPropHeaderLabelKey])}} </lyte-th> </template> </template></template> </lyte-tr> </lyte-thead> </template></template> <lyte-tbody role=\"rowgroup\" class=\"{{if(ltPropSortable,'lyteTableWithSortableRow')}}\"> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropInfiniteScroll}}\" is=\"case\" lc-id=\"lc_id_0\"> <template is=\"for\" items=\"{{ltPropData}}\" item=\"list\" index=\"indexVal\"> <lyte-tr id=\"{{list.body.id}}\" class=\"{{list.body.class}}\" role=\"row\" aria-rowindex=\"{{list.index}}\"> <template is=\"for\" items=\"{{ltPropHeader}}\" item=\"header\" index=\"index\"> <lyte-td role=\"cell\" aria-colindex=\"{{index}}\"> <div style=\"height: {{ltPropCellHeight}}\"> {{unescape(lyteUiGetValue(list.body,header[ltPropBodyLabelKey]))}} </div> </lyte-td> </template> </lyte-tr> </template> </template><template default=\"\"> <template is=\"for\" items=\"{{ltPropContent}}\" item=\"list\" index=\"indexVal\"> <lyte-tr id=\"{{list.id}}\" class=\"{{list.class}}\" role=\"row\"> <template is=\"for\" items=\"{{ltPropHeader}}\" item=\"header\" index=\"index\"> <lyte-td role=\"cell\" aria-colindex=\"{{index}}\">{{unescape(lyteUiGetValue(list,header[ltPropBodyLabelKey]))}}</lyte-td> </template> </lyte-tr> </template> </template></template> </lyte-tbody> </lyte-table-structure> </template><template case=\"{{ltPropInfiniteScroll}}\" is=\"case\" lc-id=\"lc_id_1\"> <lyte-yield yield-name=\"yield\" lt-prop-data=\"{{ltPropData}}\"></lyte-yield> </template><template default=\"\"> <lyte-yield yield-name=\"yield\"></lyte-yield> </template></template> </div> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{expHandlers(ltPropResize.vertical,'||',ltPropResize.horizontal)}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-table-resize ontouchstart=\"{{action('tableResize',event,'both')}}\" onmousedown=\"{{action('tableResize',event,'both')}}\"></lyte-table-resize> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropResize.vertical}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-table-vertical-resize ontouchstart=\"{{action('tableResize',event,'vert')}}\" onmousedown=\"{{action('tableResize',event,'vert')}}\"></lyte-table-vertical-resize> </template></template> <template is=\"switch\" l-c=\"true\" _new=\"true\"><template case=\"{{ltPropResize.horizontal}}\" is=\"case\" lc-id=\"lc_id_0\"> <lyte-table-horizontal-resize ontouchstart=\"{{action('tableResize',event,'hori')}}\" onmousedown=\"{{action('tableResize',event,'hori')}}\"></lyte-table-horizontal-resize> </template></template> </template></template> </template>";;
LyteTableComponent._dynamicNodes = [{"t":"a","p":[1]},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{}},"hd":true,"co":["lc_id_0"],"in":2,"sibl":[1]},{"t":"s","p":[1,3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"s","p":[1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1,1],"cn":"lc_id_0"},{"t":"f","p":[1,1],"dN":[{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":4,"sibl":[3],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"s","p":[3,1,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[0],"cn":"lc_id_0"},{"t":"f","p":[0],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,1]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[3,1],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[3],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[4,3,2,1,0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":3,"sibl":[2],"cn":"lc_id_0"},{"t":"a","p":[1,3],"cn":"lc_id_0"},{"t":"s","p":[1,3,1],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"f","p":[1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"f","p":[1,1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1],"a":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'height: '","ltPropCellHeight"]}}}},{"t":"tX","p":[1,1,1]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[1,0],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{"dN":[{"t":"a","p":[1],"cn":"default"},{"t":"f","p":[1],"dN":[{"t":"a","p":[1]},{"t":"a","p":[1,1]},{"t":"f","p":[1,1],"dN":[{"t":"a","p":[1]},{"t":"tX","p":[1,0]},{"t":"cD","p":[1],"in":0}],"dc":[0],"hc":true,"trans":true,"in":1,"sibl":[0]},{"t":"cD","p":[1],"in":0}],"dc":[1,0],"hc":true,"trans":true,"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"cD","p":[1,3],"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true},"lc_id_1":{"dN":[{"t":"a","p":[1],"cn":"lc_id_1"},{"t":"i","p":[1],"in":0,"cn":"lc_id_1"}],"cdp":{"t":"a","p":[1]},"dcn":true}},"d":{"dN":[{"t":"i","p":[1],"in":0,"cn":"default"}]},"dc":{"lc_id_0":{"dc":[3,2,1,0],"hc":true,"trans":true},"lc_id_1":{"dc":[0],"hc":true,"trans":true},"default":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0","lc_id_1"],"hc":true,"trans":true,"in":1,"sibl":[0]},{"t":"s","p":[3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":2,"sibl":[1],"cn":"lc_id_0"},{"t":"s","p":[3],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":1,"sibl":[0],"cn":"lc_id_0"},{"t":"s","p":[5],"c":{"lc_id_0":{"dN":[{"t":"a","p":[1],"cn":"lc_id_0"},{"t":"cD","p":[1],"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0,"cn":"lc_id_0"}],"cdp":{"t":"a","p":[0]},"dcn":true}},"d":{},"dc":{"lc_id_0":{"dc":[2,1,0],"hc":true,"trans":true}},"hd":true,"co":["lc_id_0"],"hc":true,"trans":true,"in":0},{"type":"dc","trans":true,"hc":true,"p":[1,0]}];;

LyteTableComponent._observedAttributes = [
    "ltPropContent",
    "ltPropHeader",
    "ltPropId",
    "ltPropClass",
    "ltPropBorder",
    "ltPropHeaderLabelKey",
    "ltPropBodyLabelKey",
    "ltPropWidth",
    "ltPropHeight",
    "ltPropResize",
    "ltPropFixedColumnClass",
    "ltPropYield",
    "ltPropScroll",
    "ltPropColumnSortable",
    "ltPropScrollbarOption",
    "ltPropDualResize",
    "ltPropData",
    "ltPropInfiniteScroll",
    "ltPropCellHeight",
    "ltPropContentLength",
    "ltPropPreventScrollbar",
    "ltPropRole",
    "ltPropStickyTable",
    "ltPropScrollStep",
    "ltPropPreventTableModify",
    "ltPropSortDummyColumClass",
    "ltPropNavigation",
    "ltPropReset",
    "ltPropTags",
    "ltPropSortable",
    "ltPropContainment",
    "lyteUnbound",
    "ltPropFromListview",
    "ltPropFixResizeCursor",
    "columns",
    "nonFixedColumn",
    "minWidth1",
    "minWidth2",
    "secondaryData",
    "boundary",
    "rowHeights",
    "fromListView"
];

if (!window._lyteUiUtils.registeredCustomElements['lyte-th']) {
    window._lyteUiUtils.registeredCustomElements['lyte-th'] = true;

    /**
     * @customElement lyte-th,lyte-td
     */
    class LyteThCustomElements extends LyteUiComponentComponentRegistry.CustomElements {
        lookups() {
            return [{
                component: LyteUiComponentComponentRegistry
            }];
        }

        constructor() {
            super();
        }

        static get observedAttributes() {
            return [ 'fixed', 'resize', 'icon', 'sticky-position', "collapse" ];
        }

        getTable() {
            var lyteNode = this.$node;
            var query = "lyte-table";
            return (lyteNode.__table || (lyteNode.__table = lyteNode.closest ? lyteNode.closest( query ) : $L( lyteNode ).closest( query ).get( 0 )));
        }

        getSticky() {
            var lyteNode = this;
            var __sticky = lyteNode.__is_sticky;
            return __sticky == void 0 ? ( lyteNode.__is_sticky = lyteNode.getTable().ltProp( 'stickyTable' ) ) : __sticky;
        }

        connectedCallback() {
            var lyteNode = this;
            var table = lyteNode.getTable(),
            $node = lyteNode.$node;

            if( table && table.ltProp( 'role' ) && table.ltProp( 'yield' ) ){
                table.component.update_aria( $node );
            }

            if( $node.parentNode.previousElementSibling ){
                lyteNode.$node.classList.add( "lyteTableSecondaryHeader" );
            }
        }

        attributeChangedCallback(attr, oldVal, newVal) {
            var lyteNode = this.$node;

            var $node = $L( lyteNode );

            switch (attr) {
                case 'fixed': {
                    var is_enable = newVal == "enable";

                    $node[ ( is_enable ? 'add' : "remove" ) + 'Class' ]( 'lyteFixedColumn' );
                    if( this.getSticky() ){
                        lyteNode.__table.component.checkIntersection.call( lyteNode, is_enable );
                    }
                }
                    break;
                case 'resize': {
                    var ns = 'lyte-tablehead-resize';
                    if( newVal == "enable" ){
                        var thead = document.createElement( ns ),
                        __add = "addEventListener",
                        fn = this.resize;

                        thead[__add]('mousedown', fn);
                        thead[__add]('touchstart', fn);

                        lyteNode.appendChild( thead );
                    } else {
                        var thead = lyteNode.getElementsByTagName( ns )[ 0 ];
                        if( thead ){
                            lyteNode.removeChild( thead );
                        }
                    }
                }
                break;
                case 'icon' : {
                    $node[ ( newVal == "disable" ? 'add' : "remove" ) + 'Class' ]( 'lytePreventIcon' );
                }
                break;
                case 'sticky-position' : {
                    if( $node.attr( 'fixed' ) == "enable" && this.getSticky() ){
                        var is_enable = newVal == "right",
                        __table = lyteNode.__table.component,
                        fn = is_enable ? 'add' : "remove",
                        __class = 'lyteTableRightFixed';

                        if( !is_enable && !$node.hasClass( __class ) ){
                            return;
                        }   

                        __table.stickyFunction( lyteNode, false, fn + 'Class', __class );
                        __table.checkIntersection.call( lyteNode, is_enable, true );
                    }
                }
                break;
                case 'collapse' : {
                    var __table = this.getTable();

                    if( __table ){
                        if( newVal == "true" ){
                            __table.component.collapse_column( lyteNode );
                        } else if( oldVal == "true" ){
                            __table.component.expand_column( lyteNode );
                        }
                    }
                }
                break;
            }
        }

        resize(event) {
            var lyteNode = this;
            if (lyteNode.parentNode.classList.contains('lyteTableFixed')) {
                return;
            }
            var table = $L(event.target).closest('lyte-table')[0];
            table.component.getActions("tableResize").call(table.component, event);
        }

        disconnectedCallback() {
            var lyteNode = this.$node;
            if( lyteNode.__is_sticky ){
                lyteNode.__table.component.disconnectedCallback.call( lyteNode );
            }
            delete lyteNode.__table;
        }

        _() {
            _;
        }
    }

    LyteThCustomElements.options = {clone : {allCallbacks : false}};

    LyteThCustomElements.register("lyte-th");

    window.resizeTable = function(evt) {
        if (evt && evt.type == 'resize' && _lyteUiUtils.isMobile) {
            return;
        }

        var fn = function( item ){
            var __elem = item.component.scrollDiv,
            $elem = $L( __elem );
            __elem && $elem.resetScrollbar && $elem.resetScrollbar();
        },
        is_orient = evt && evt.type == "orientationchange";

        Array.from(document.body.getElementsByTagName('lyte-table')).forEach(function (item) {
            if (is_orient) {
                setTimeout(fn.bind(this, item), 500);
            } else {
                fn(item);
            }
        });
    };
}


/**
 * @syntax nonYielded
 *   <lyte-table  lt-prop-content='[{"cityName" : "Agra","serialNo" : "1"},{"cityName" : "Mysore", "serialNo" : "2"}]' lt-prop-header='[{"data" : "From", "bodyData" : "cityName"},{"data" : "No", "bodyData" : "serialNo"}]' lt-prop-header-label-key='data' lt-prop-body-label-key='bodyData' >
 *   </lyte-table>
 */

/**
 * @syntax yielded
 * <lyte-table lt-prop-yield="true">
 *      <template is="registerYield" yield-name="yield">
 *          <lyte-table-structure>
 *             <lyte-thead>
 *                <lyte-tr>
 *                   <lyte-th>From</lyte-th>
 *                   <lyte-th>No</lyte-th>
 *                   <lyte-th>Name</lyte-th>
 *                </lyte-tr>
 *             </lyte-thead>
 *             <lyte-tbody>
 *                <lyte-tr>
 *                   <lyte-td>Agra</lyte-td>
 *                   <lyte-td>1</lyte-td>
 *                   <lyte-td>Tajmahal</lyte-td>
 *                </lyte-tr>
 *                <lyte-tr>
 *                   <lyte-td>Mysore</lyte-td>
 *                   <lyte-td>2</lyte-td>
 *                   <lyte-td>Mysorepalace</lyte-td>
 *                </lyte-tr>
 *             </lyte-tbody>
 *          </lyte-table-structure>
 *      </template>
 *  </lyte-table>
 */

/**
 * @syntax Infinite scroll
 * @attribute ltPropYield=true
 * @attribute ltPropInfiniteScroll=true
 *  <lyte-table style = 'height: 350px;' lt-prop-infinite-scroll = true lt-prop-yield = true lt-prop-content = {{contentJSON}} scroll-end = {{method('someMethod')}}>
 *   <template is = 'registerYield' yield-name = 'yield'>
 *       <lyte-table-structure>
 *           <lyte-thead>
 *               <lyte-tr>
*                  <lyte-th> From </lyte-th>
*                  <lyte-th> No </lyte-th>
*                  <lyte-th> Name </lyte-th>
 *              </lyte-tr>
 *           </lyte-thead>
 *           <lyte-tbody>
 *             <lyte-tr>
 *               <lyte-td> Agra </lyte-td>
 *               <lyte-td> 1 </lyte-td>
 *               <lyte-td> Taj Mahal </lyte-td>
 *             </lyte-tr>
 *              <lyte-tr>
 *               <lyte-td> Mysore </lyte-td>
 *               <lyte-td> 2 </lyte-td>
 *               <lyte-td> Mysore palace </lyte-td>
 *             </lyte-tr>
 *           </lyte-tbody>
 *       </lyte-table-structure>
 *   </template>
 *  </lyte-table>
 */
export { LyteTableComponent };

LyteTableComponent.register("lyte-table", {
    hash: "LyteTableComponent_12",
    refHash: "C_lyte-ui-component_@zoho/lyte-ui-component_2"
});
 
