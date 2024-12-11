import { createCustomClass, getClass, _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "Mixin": function() {
        return Mixin;
    }
});

import { Mixin } from "/node_modules/@slyte/core/index.js";
import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

let LyteTableSortableMixin = createCustomClass(function(arg1, overrides, LyteTableSortableMixin) {
    class _LyteTableSortableMixin extends getClass([Mixin], arg1, LyteTableSortableMixin) {
        rowMouseDown(evt) {
                     
               var _this = this ,
                   tags = _this.data.ltPropTags,
                   tr = evt.target.closest(tags.tr) , 
                   tbody = tr.closest(tags.tbody);
               if( tbody != void 0 ){
                   var table = tbody.closest('lyte-table'),
                       index = Array.from( tr.parentElement.children ).indexOf( tr ),
                       actual_index = index ,
                       cur_index = actual_index  ,
                       data = _this.data.ltPropData , 
                       isFirst = true , 
                       trTransform = tr.style.transform ,
                       content = _this.data.ltPropContent ,
                       boundary = _this._boundary , 
                       isTouch = Boolean(evt.touches),
                       hasContainment = Boolean(_this.data.ltPropContainment) ,
                       containElem = hasContainment ? $L(_this.$node).find(_this.data.ltPropContainment)[0] : undefined,
                       containElemClient = containElem != void 0 ? containElem.getBoundingClientRect() : undefined , 
                       placeholder = $L(this.$node).find( '.lyteTableSortablePlaceholder' ).get(0),
                       outOfBound = false, yRelatedToElement , reachedTop , reachedEnd , diff = void 0;

                   if(tr.parentElement.tagName.toLowerCase() == _this.data.ltPropTags.tbody){
                       if( this.getMethods( 'onRowSelect' ) ){
                           let ret = this.executeMethod( 'onRowSelect' , evt  , data[actual_index].index  , actual_index , _this.$node );
                           if( ret === false ){
                               return;
                           }
                       } 

                       evt.preventDefault();

                       placeholder.classList.remove( 'lyteTableSortablePlaceholderHidden' );
                   
                       var findElement = function ( isPrev , isMouseUp ){
                           if( isMouseUp ){
                               let arr = Array.from(tbody.children);
                               for( let i = 0 ; i < arr.length ; i++ ){
                                   let cur = arr[i];
                                   if( cur.classList.contains('lyteTableRowSorting') ){
                                       return i;
                                   }
                               }
                           }else{
                               let curIndex =_this.data.ltPropData[cur_index].index ,
                                   findIndex = isPrev ? getIndex(  curIndex == 0 ? data.length-1 : curIndex - 1 ) :
                                                        curIndex == data.length-1 ? curIndex == content.length-1 ? undefined : 0 : getIndex(curIndex + 1 ),
                                   arr = Array.from( tbody.children );
                               if(findIndex == undefined){
                                   return;
                               }
                               for( let i = 0, j = 0 ; i < arr.length ; i ++ ){
                                   let cur = arr[i];
                                   if( !(cur.classList.contains('dummy')) ){
                                       if( j == findIndex ){
                                           return arr[i];
                                       }
                                       j++
                                   }
                               }
                           }
                       },
                       makeElementDraggable = function(){
                           var width = []
                           Array.from( tr.children ).forEach( function(td){
                               width.push( window.getComputedStyle(td).width );
                           }); 
                           tr.classList.add('lyteTableRowSorting'); 
                       },
                       getIndex = function( index ){
                           var find = function(obj){
                               return obj.index === index;
                           }
                           return _this.data.ltPropData.findIndex(  find );
                       },
                       checkLimit = function (num){
                           return 0 <= num && num < _this.data.ltPropData.length ;
                       },
                       changePlaceHolder = function( _tr ){
                           placeholder.style.transform = "";
                           if( _tr.style.transform ){
                               placeholder.style.transform = _tr.style.transform;
                           }
                           placeholder.style.top = _tr.offsetTop + "px";
                           placeholder.style.left = _tr.offsetLeft + "px";
                           placeholder.style.width = _tr.offsetWidth + "px";
                           placeholder.style.height = _tr.offsetHeight + "px";
                       };
                   
                       changePlaceHolder( tr );
                       makeElementDraggable();
                   
                       var initialY = isTouch ? evt.touches[0].clientY : evt.clientY;
                            
                       var mouseup = function(event){
                           let currentIndex = findElement( false , true ) ,
                           scrollTop = _this.scrollDiv.scrollTop;
                           evt.preventDefault();

                           placeholder.classList.add( 'lyteTableSortablePlaceholderHidden' );
                       
                               if(_this.getMethods( 'onBeforeRowDrop' )){
                                   var ret = _this.executeMethod( 'onBeforeRowDrop' , event , currentIndex , data[currentIndex].index , _this.$node  );
                               } 

                               if(ret === false){
                                   let removeIndex = cur_index , 
                                       cur_data = Object.assign( {} , data[removeIndex] );

                                   _this.removeRow(data[removeIndex].index);
                                   _this.insertRow(data[actual_index].index , cur_data.body);

                                   if( _this.data.ltPropContent.length - 2 == _this._boundary.bottom ){
                                       _this.scrollToRecord( data[removeIndex].index , true , scrollTop );
                                   }
                               }
                               tr.style.transform = trTransform;
                               tr.classList.remove('lyteTableRowSorting')

                               _this.getMethods( 'onRowDrop' ) && _this.executeMethod( 'onRowDrop' , event , currentIndex , data[currentIndex].index , _this.$node );
                           
                               let elem = tbody.children[getIndex(actual_index)];
                               if(elem){
                                   elem.style.top = ""; elem.style.right = "";
                               }
                           
                           
                           document.removeEventListener( isTouch ? 'touchmove' : 'mousemove', mousemove)
                           document.removeEventListener( isTouch ? 'touchend' : 'mouseup', mouseup);
                       },

                       parseNum = function (number){
                           let match = number.match(/-?\d+(\.\d+)?/);
                           return match ? parseFloat(match[0]) : 0
                       },
                       isInRange = function( tr , y , isUp){
                           let client = tr.getBoundingClientRect() ,
                               topCheck = containElemClient.top < client.top ,
                               bottomCheck = ( client.top + client.height ) < (containElemClient.top + containElemClient.height );

                           if( isUp == void 0 ){ return topCheck && bottomCheck }

                           reachedTop = false; reachedEnd = false;

                           if( !topCheck ) { 
                                reachedTop = true; }
                           else if( !bottomCheck ) { reachedEnd = true; }

                           if( reachedTop ){ 
                               topCheck = !isUp && ( ( containElemClient.top < y ) && ( y < containElemClient.top + containElemClient.height-diff ) ) && diff >= 0;
                           }else if( reachedEnd ){
                               bottomCheck = isUp && ( containElemClient.top < y && y < (containElemClient.top + containElemClient.height ) ) && diff <= 0
                           }
                            return topCheck && bottomCheck 

                       },
                       fixTop = function ( isUp , returnBoundElem , getDiff){
                           var trClient = tr.getBoundingClientRect(),
                               _diff , transformY ,
                               top = _this._top , bottom = _this._bottom , 
                               contentLength = data.length;

                       
                           _diff = isUp ? containElemClient.top - trClient.top : 
                                        (containElemClient.top + containElemClient.height) - (trClient.top + trClient.height);
                           if( getDiff === true ){ 
                               diff = -_diff;
                               return;
                           };
                           transformY = parseNum( tr.style.transform );
                           tr.style.transform = ""; _this.transform( true , tr , transformY + _diff );
                           trClient = tr.getBoundingClientRect();


                           if( !returnBoundElem ) { return; }

                           let reachedEnd = false;

                           for (let i = isUp ? top : bottom ; isUp ? i < (top+contentLength) : (reachedEnd ? i > bottom + 1 : i >= 0) ; isUp ? i++ : i--) {
                               i = isUp ? i%contentLength : i;
                               const element = tbody.children[i] ,
                                     elemClient = element.getBoundingClientRect();

                               if(isUp ? ( elemClient.top >= ( containElemClient.top ) ) : (elemClient.top < (containElemClient.top+containElemClient.height))){
                                   if( isUp ? trClient.top <= elemClient.top : trClient.top >= elemClient.top ){
                                       if(cur_index != i){
                                           return i;
                                       }
                                       return;
                                    }
                               }


                               if( !isUp && i == 0 ){
                                   reachedEnd = true;
                                   i = contentLength;
                               }
                           }
                       
                       }
                   
                       var mousemove = function( event ){
                           isTouch ? null : event.preventDefault();
                           var y = isTouch ? event.touches[0].clientY : event.clientY ;

                           y = (y < 0) ? 0 : y;

                           var isUp = ( initialY > y) , isDown = ( initialY < y ),
                               isRange , targetIndex , 
                               neighbour = isDown ? findElement( false ) : isUp ? (cur_index == 0 && boundary.top == 0) ? undefined : findElement( true ) : undefined ,
                               check = false;
                           
                           
                           
                           if(isUp || isDown) {

                               let _transform = tr.style.transform;
                               tr.style.transform = "translateY(" + (parseNum(tr.style.transform || "") + ( diff != void 0 ? diff : 0 )- (initialY - y)) + "px)";

                               if(hasContainment){
                                   diff = diff != void 0 ? diff - (initialY - y) : void 0;
                                   isRange = isInRange( tr , y , isUp );
                                   if(!isRange && !outOfBound){
                                       fixTop( isUp , false , true );
                                       check = true ;
                                   }
                               }

                               tr.style.transform = _transform;


                              if( isFirst && _this.getMethods('onRowDragStart') ){
                                  _this.executeMethod( 'onRowDragStart' , event , data[cur_index].index , cur_index , _this.$node );
                              }


                          
                              if( hasContainment && isRange){
                                  if(  outOfBound ){
                                      tr.style.transform = "translateY(" + (parseNum(tr.style.transform || "") + ( diff )) + "px)";
                                      diff = void 0;
                                      outOfBound = false;
                                  }else{
                                      tr.style.transform = "translateY(" + (parseNum(tr.style.transform || "") - (initialY - y)) + "px)";
                                      outOfBound = false;
                                  }
                              }else if( hasContainment && !outOfBound) {
                                  outOfBound = true ;
                                  targetIndex = fixTop( isUp , true );
                              }else if(!hasContainment){
                                  tr.style.transform = "translateY(" + (parseNum(tr.style.transform || "") - (initialY - y)) + "px)";
                              }

                              isFirst = false;  
                              var trClient = tr.getBoundingClientRect();

                              if( (neighbour != void 0 && !outOfBound) || (targetIndex != void 0) ){
                                   let isExceeds = targetIndex == void 0 ? isDown ? ( neighbour.getBoundingClientRect().top < trClient.top ) :
                                                   isUp ?   ( neighbour.getBoundingClientRect().top > trClient.top ) : false : false;

                                   if( (neighbour != void 0 && isExceeds) || (targetIndex != void 0)){
                                       let curData = Object.assign( {} , _this.data.ltPropData[cur_index] ) , 
                                           heightDiff = parseNum(tr.style.transform) - parseNum(trTransform) + ( (isDown ? -1 : 1 ) * tr.offsetHeight ) ,
                                           _curIndex = data[cur_index].index, 
                                           hasTarget = targetIndex != void 0;

                                       tr.style.setProperty('transform' , trTransform ) ;
                                       let scrollTop = _this.scrollDiv.scrollTop;

                                       clearTimeout(_this._ignoreTimeout)
                                       _this.__ignore_scroll = true;

                                       let insertIndex = ( targetIndex != void 0 ? data[targetIndex].index : isDown ? _curIndex+1 : _curIndex-1  ),
                                           removeIndex = _curIndex!=void 0 ? _curIndex : cur_index;

                                       _this.removeRow( removeIndex );
                                       _this.insertRow( insertIndex , curData.body );


                                       if( _this.data.ltPropContent.length - 2 == _this._boundary.bottom ){
                                           if( _this._rowHgt == undefined ){
                                               _this.__allow_scroll = true;
                                           }
                                           _this.scrollToRecord( _curIndex, true , scrollTop );
                                           _this.__allow_scroll = false;
                                       }

                                       if( hasTarget ){
                                           tr.classList.remove('lyteTableRowSorting');
                                           tr = tbody.children[targetIndex];

                                           changePlaceHolder( tr );

                                           trTransform = tr.style.transform;
                                           tr.classList.add('lyteTableRowSorting');
                                           fixTop(isUp);
                                           cur_index = targetIndex;
                                       }else{
                                           tr = tbody.children[getIndex(removeIndex)] ; neighbour = tbody.children[getIndex(insertIndex)];

                                           changePlaceHolder( neighbour );

                                           tr.classList.remove('lyteTableRowSorting');
                                           neighbour.classList.add('lyteTableRowSorting');
                                           trTransform = neighbour.style.transform;
                                           cur_index = isDown ? checkLimit( cur_index + 1 ) ? cur_index + 1 : 0 : checkLimit( cur_index - 1 ) ? cur_index - 1 : data.length-1;
                                           neighbour.style.transform = "translateY(" + ( ( isDown ? ( cur_index == 0 ) : ( cur_index == data.length - 1 ) ) ?  (parseNum(neighbour.style.transform) + heightDiff ) : heightDiff + parseNum(trTransform) ) + "px)";
                                           tr = neighbour; 
                                       }


                                       index = isDown ? (index + 1) : (index - 1);

                                       _this._ignoreTimeout = setTimeout(() => {
                                           _this.__ignore_scroll = false;
                                       }, 100);
                                   }

                              }
                           }                   
                       
                        initialY =  y;
                       }
                   
                       document.addEventListener( 'mousemove' , mousemove , evt );
                       document.addEventListener( 'mouseup' , mouseup , evt);

                       document.addEventListener( 'touchmove' , mousemove , false );
                       document.addEventListener( 'touchend' , mouseup , false);
                   }   
               }
     
       }

        _() {
            _;
        }
    }

    return overrides(_LyteTableSortableMixin);
});

export { LyteTableSortableMixin };

LyteTableSortableMixin.register({
    hash: "LyteTableSortableMixin_5",
    refHash: "@zoho/lyte-ui-component_3"
});

