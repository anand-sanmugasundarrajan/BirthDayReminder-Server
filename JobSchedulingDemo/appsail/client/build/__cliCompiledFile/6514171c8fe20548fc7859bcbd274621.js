( function( cb ){
  if( typeof define == "function" && define.amd ){
		define( [ "@zoho/lyte-dom" ], cb );
	} else {
		cb( window.$L );
	}
})( function( $L ){
    if( $L ){
      function getScope( elem, scope ){
          var data = elem._searchPluginData;
          scope = data.dynamicScope ? data.dynamicScope( elem ) : scope;
          if( data.checkFromParent ){
            scope = elem.parentNode;
          }
          return scope;
      }

     function keyUpBind( event ){
         if([37,13,38,39,40,91,27,16,18].indexOf(event.keyCode) > -1){ 
           return
         }
         var element = this,
         data = element._searchPluginData,
         searchDelay = data.searchDelay;

         clearTimeout(this.timeout); 
         clearTimeout( this._iptime );
         if( searchDelay == void 0 ){
            pressFunc.call( this, event );
         } else {
            this.timeout = setTimeout( pressFunc.bind( this ), searchDelay, event );
         }
      }

      function inputBind( event ){
         clearTimeout( this._iptime );
         this._iptime = setTimeout( pressFunc.bind( this ), 250, event );
      }

      function pressFunc( event ){
          var element = this;
          event = event || {};
          var data = this._searchPluginData,
          ret = findingList.call(this,event),
          searchList = ret[0],
          targetList = ret[1],
          searchComp = ret[2],
          related = ret[ 3 ],
          casesen  = data.caseSensitive,
          minLength = data.minLength ? data.minLength : 0,
          method = data.method ? data.method : 'contains',
          keyCode = event.keyCode || event.which,
          val = fNcase( casesen, element.tagName == 'LYTE-INPUT' ? element.querySelector( 'input,textarea' ).value : element.value, data.trim ),
          visibleList = [], flag, comp = data.component, hiddenList = [],
          hiddenSelector = data.hiddenSelector;

          if( data.diacritic ){
             val = window._lyteUiUtils.convert_diacritics( val );
          }

          if(val.length >= minLength || keyCode == 8 || keyCode == 46 )
            { 
              if(val.length)
                  {
                    for( var i = 0; i < searchList.length; i++ ) { 
                        var str = fNcase( casesen, searchList[i].trim() );
                        if( switchfun( method, val, str ) ) {
                            visibleList.push( searchComp[i] );
                        } else {
                           hiddenList.push( searchComp[ i ] );
                        }   
                    }
                  }
               else
                  {
                    visibleList = Array.apply( Array, searchComp );
                  }   
              if( data.onSearch && data.onSearch( visibleList, event , val ) == false ){
                return;
              }
               for(var i = 0; i < searchList.length; i++)
                   {  
                       var str = fNcase( casesen, searchList[i].trim() ), val = val;
                       additionalHand.call( this, targetList[i], switchfun( method, val, str ) , val )   
                   } 
              if( !/tree|accordion/.test( comp ) ) {
                  for( var i = 0; i < related.length; i++ ) {
                      if( related[ i ].querySelectorAll( data.target || data.search ).length == related[ i ].querySelectorAll( '.lyteSearchHidden' + ( hiddenSelector ? ( ',' + hiddenSelector ) : '' ) ).length ) {
                          related[ i ].classList.add( 'lyteSearchHidden' );
                      } else {
                          related[ i ].classList.remove( 'lyteSearchHidden' );
                      }
                   }
              } else if( comp == 'accordion' ){
                  $L.fastdom.measure( accfilter.bind( this, visibleList, hiddenList, val ) )
              } else if( comp == "tree" ){
                 $L.fastdom.measure( treefilter.bind( this, visibleList, hiddenList, val ) )
              }
          }                 
      }

      function arrayFrom( nodeList ){
          var arrayList = [];
          for(var i = 0; i < nodeList.length; i++)
            {
              arrayList.push(nodeList[i]);
            }
          return arrayList.slice(); 
      }

        function fNcase( bool, value, trim ){
          if( !bool ){
              value = value.toLowerCase();
          }
          if( trim ){
              value = value.trim();
          }
          return value;
        }

        function switchfun( method, val, str ){
          var check;
          switch( method )
            {
              case 'contains' : {
                  check = str.indexOf( val ) >= 0
                  break;    
              }
              case 'startsWith' : {
                    check = str.indexOf( val ) == 0; 
                    break;
              }
              case 'endsWith' : {
                    var ind = str.lastIndexOf( val );
                    if( ind != -1 ){
                      check = ( ind  + val.length ) == str.length;
                    }
                    break;
              }
            }
            return check;
        }

        function hiderecurse( elem ){
          for( var i = elem.length - 1; i >= 0; i-- ) {
              var icon = elem.eq( i );
              if( icon.hasClass( 'lyteIconOpened' ) ){
                  setTimeout( icon.click.bind( icon ) , 20 );
              }
          }
        }

        function searchListFind( nodeName ){
              var searchList = [];
              var target = [];
              for(var i = 0; i < nodeName.childElementCount; i++)
                {
                  while(nodeName.children[i].childElementCount)
                    {
                        window.returnedVal = searchListFind(nodeName.children[i]);
                        searchList = searchList.concat(window.returnedVal[0]);
                        target = target.concat(window.returnedVal[1]);
                        break;
                    }
                  if(!nodeName.children[i].childElementCount) 
                      {
                        searchList.push(nodeName.children[i].textContent);
                        target.push(nodeName.children[i]);
                      }
                }
              return [searchList,target];
        };

        function findingList(){
              var data = this._searchPluginData;
              var scope = getScope( this, typeof data.scope == 'string' ? document.querySelector(data.scope) : data.scope );
              var searchList = [], targetList = [], searchComp = [], related = [];

              if( !scope ){
                  return [ searchList, targetList, searchComp, related ];
              }

              if(data.search)   
                  {
                      searchComp = scope.querySelectorAll( data.search.trim() )
                      var target = data.target ? data.target : data.search;
                      for(var j = 0; j < searchComp.length; j++){
                          var valueToPush = searchComp[ j ].textContent;
                          if( data.diacritic ){
                            valueToPush = window._lyteUiUtils.convert_diacritics( valueToPush );
                          }
                          searchList.push( valueToPush );
                      }
                      targetList = scope.querySelectorAll( target )
                  }
              else
                  {
                      var callSearchList = searchListFind(scope)
                      searchList = callSearchList[0];
                      targetList = callSearchList[1];
                      searchComp = targetList.slice();
                  } 
                if( data.related && ( data.target || data.scope  ) ) {
                    related = scope.querySelectorAll( data.related );
                }
                return [searchList, targetList, searchComp, related];  
        };

        function accfilter ( vis, hid, value ){
              var scope = $L( getScope( this, this._searchPluginData.scope ) )[ 0 ];
              for( var i = 0; i < vis.length; i++ ){
                var close1 = $L( vis[ i ] ).closest( 'lyte-accordion-item', scope )
                for( var j = 0; j < hid.length; j++ ){
                  var close2 = $L( hid[ j ] ).closest( 'lyte-accordion-item', scope )
                  if( close1[ 0 ] == close2[ 0 ] ){
                      hid.splice( j, 1 );
                      j--; continue;
                  }
                }
                if( vis[ i + 1 ] ) {
                  var close2 = $L( vis[ i + 1 ] ).closest( 'lyte-accordion-item', scope );
                  if( close1[ 0 ] == close2[ 0 ] ){
                      vis.splice( i + 1, 1 );
                      i--;
                  }
                }
              }
              // scope[ 0 ].component.getAllHeights();
              $L.fastdom.mutate( function(){
                  for( var i = scope.ltProp( 'exclusive' ) ? ( vis.length - 1 ) : 0; i < vis.length; i++ ){
                    var isclose = false, close = $L( vis[ i ] ).closest( 'lyte-accordion-item' );
                    isclose = !close.hasClass( 'lyteAccordionActive' );
                    if( !value ){
                        isclose = !isclose
                    }
                    if( isclose ){
                        close.click();
                    }
                  }

                  for( var j = 0; j < hid.length; j++ ){
                      var close = $L( hid[ j ] ).closest( 'lyte-accordion-item' )
                      close.hasClass( 'lyteAccordionActive' ) && close.click();
                  }
              })
        }

        function treeinremove ( arr ){
            for( var i = 0; i < arr.length; i++ ){
                if( arr[ i + 1 ] ){
                  var cur = $L( arr[ i ] ).closest( '.lyteTreeBodyDiv' )[ 0 ], next = $L( arr[ i + 1 ] ).closest( '.lyteTreeBodyDiv' )[ 0 ];
                  if( cur.contains( next ) ){
                      arr.splice( i + 1, 1 );
                  } else if(next.contains( cur ) ){
                      arr.splice( i, 1 );
                      i--;
                  }
                }
            }
        }

        function treefilter( vis, hid, value, clear ){
          var scope = $L( getScope( this, this._searchPluginData.scope ) )[ 0 ];
          for( var i = 0; i < vis.length; i++ ){
            var cur = $L( vis[ i ] ).closest( '.lyteTreeBodyDiv' );
            for( var j = 0; j < hid.length; j++ ){
              var hide = $L( hid[ j ] ).closest( '.lyteTreeBodyDiv' ),
              flg = cur[ 0 ].contains( hide[ 0 ] ) || hide[ 0 ].contains( cur[ 0 ] );
              if( flg ){
                  hide.addClass( 'lyteSearchHidden' );
                  hid.splice( j, 1 );
                  j--;
              }
            }
          }
          for( var i = 0; i < vis.length; i++ ){
            removeClse( vis[ i ], scope )
            value.length && scope.ltProp( 'stateAttr', $L( vis[ i ] ).closest( 'lyte-tree-body' ).attr( 'data-value' ) )
          }
          if( value.length ) {
            for( var i = 0; i < hid.length; i++ ){
              $L( hid[ i ] ).closest( '.lyteTreeBodyDiv' ).addClass( 'lyteSearchHidden' )
            }
          } else {
            hiderecurse( $L( 'lyte-yield:not(.noChildClass) lyte-tree-icon', scope ), clear );
          }
        }

        function removeClse( target, scope ){
            var el = $L( target ).closest( '.lyteSearchHidden', scope );
            if( el.length ){
              el.removeClass( 'lyteSearchHidden' );
              removeClse( target, scope );
            }
        }

        function additionalHand( target, check, val ){
            var query = this._searchPluginData, comp = query.component;
            if( check ){
                if( comp == 'dropdown' ){
                  var clo = $L( target ).closest( 'lyte-drop-box' )[ 0 ] 
                  if( clo ) {
                    clo.classList.contains( 'lyteDropdownHidden' ) && ( clo.origindd ? clo.origindd.toggle() : $L( clo ).closest( 'lyte-dropdown' ).get( 0 ).toggle() )
                  }
                } 
              target.classList.remove( 'lyteSearchHidden' );
            } else if( comp != "tree" ) {
              if( target.classList.contains( 'lyteSearchHidden' ) ){
                  return;
              }
              target.classList.add( 'lyteSearchHidden' );
            }
        }

        $L.prototype.search = function( data ){
            data = data ? data : {};
            if(!data.scope)
                {
                    console.error('scope is not given');
                    return;
                }
            // var scope = typeof data.scope == 'string' ? document.body.querySelector( data.scope.trim() ) : data.scope;    
            var element = this[ 0 ]
            var searchList = [], targetList = [], searchComp = [];
            element._searchPluginData = data;

            if( !data.hasOwnProperty( 'searchDelay' ) ){
              data.searchDelay = 100;
            }

            if( data.component == "accordion" ){
              data.related = "lyte-accordion-item";
            } else if( data.component == "tree" ){
              data.related = ".lyteTreeBodyDiv lyte-yield:not(.noChildClass) lyte-tree-icon";
            }

            element.setValueForSearch = element.setValue = function(value){
                var element = this
                value = value != undefined ? value : '';
                element.tagName == 'LYTE-INPUT' ? element.ltProp({'value' : value}) : element.value = value;
                var evt = new Event('keyup');
                evt.which = evt.keyCode = 8;
                element.dispatchEvent(evt);
            }

        element.addEventListener('keyup', keyUpBind ); 

        element.addEventListener( 'input', inputBind);
        element.reset = pressFunc.bind( element );                  
        return this;
      }

      $L.prototype.removeSearch = function(){
          var removeElements = this;

          for( var i = 0; i < removeElements.length; i++ ){
              var current = removeElements[ i ],
              scope, search, related;
              if( !current._searchPluginData ){
                continue;
              }

              delete current.reset; 
              scope = current._searchPluginData.scope;
              search = current._searchPluginData.target || current._searchPluginData.search;
              related = current._searchPluginData.related;
              if( !scope ){
                continue;
              }
              scope = $L( getScope( current, scope ) );
              scope.find( search ).removeClass( 'lyteSearchHidden' );
              related && scope.find( related ).removeClass( 'lyteSearchHidden' );
              delete current._searchPluginData;
              delete current.setValueForSearch; delete current.setValue;

              current.removeEventListener( 'input', inputBind );
              current.removeEventListener( 'keyup', keyUpBind );
          }
          return this;
      }
    }
});
