import $L from "/node_modules/@zoho/lyte-dom/modules/lyte-dom-utils.js";

( function(){

	function __index( elem ){
		return Array.from( elem.parentNode.children ).indexOf( elem );
	}

	function __previous_cell( elem, count ){
		/*
		 * returns previous row
		 */
		var parentNode = 'parentNode',
		previousElementSibling = 'previousElementSibling',
		prev = elem[ parentNode ][ previousElementSibling ];
		if( prev ){
			return $L( prev.children ).get( -count );
		}

		/*
		 * returns from children of thead
		 */

		var thead = elem[ parentNode ][ parentNode ][ previousElementSibling ];
		if( thead ){
			return $L( thead.children ).eq( -1 ).children().get( -count );
		}
	}

	function __next_cell( elem, count ){
		/*
		 * returns next row
		 */
		var parentNode = 'parentNode',
		nextElementSibling = 'nextElementSibling',
		next = elem[ parentNode ][ nextElementSibling ];
		if( next ){
			return next.children[ count ];
		}

		/*
		 * returns from children of tbody
		 */

		var tbody = elem[ parentNode ][ parentNode ][ nextElementSibling ];
		if( tbody ){
			return $L( tbody.children ).eq( 0 ).children().get( count );
		}
	}

	function moveHori( cell, count ){
		var index = __index( cell ),
		new_index = index + count,
		__children = cell.parentNode.children,
		diff = new_index - index;

		if( diff == 0 ){
			return;
		}
 
		if( diff > 0 ){
			/*
			 * right, bottom, end navigation
			 */
			var __length = __children.length;
			if( __length > new_index ){
				return __children[ new_index ];
			} else {
				return __next_cell( cell, new_index - __length );
			}
		} else {
			/*
			 * left, top, home navigation
			 */
			 if( new_index < 0 ){
			 	return __previous_cell( cell, -new_index );
			 } else {
			 	return __children[ new_index ];
			 }
		}
	}

	function ret_grp( cell, count ){
		var parentNode = 'parentNode';
		return $L( cell[ parentNode ][ parentNode ][ parentNode ].children ).eq( count ).children().eq( count ).children().get( count );
	}

	function home( cell, ctrl ){
		if( ctrl ){
			return ret_grp( cell, 0 );
		}
		return moveHori( cell, - __index( cell ) );
	}

	function end( cell, ctrl ){
		if( ctrl ){
			return ret_grp( cell, -1 );
		}
		return moveHori( cell, cell.parentNode.children.length - __index( cell ) - 1 );
	}

	function moveVert( cell, count ){
		return moveHori( cell, count * cell.parentNode.children.length );
	}

	function keyEvent( evt ){
		var target = evt.target,
		origin = evt.currentTarget;

		if( /^lyte\-t(d|h)$/i.test( target.tagName ) ||  /^lyte-exptable\-t(d|h)$/i.test( target.tagName ) ){
			var key = evt.key,
			 fn,
			 __count,
			 options = $L( origin ).data( 'tableNavigation' ),
			 before_nav = options.beforeNavigation,
			 after_nav = options.afterNavigation,
			 ret;

			 /*
			  * If target is in fixed part you can return original table cell here. navigation will happen in original table
			  */
			  
			 before_nav && ( ret = before_nav.call( origin, target, evt ) );

			 if( ret != void 0 ){
			 	if( ret == false ){
				  return;
				} else if( ret.nodeType == 1 ){
				  target = ret;
				}
			 }

			 switch( key ){
			 	case "ArrowLeft" : {
			 		fn = moveHori;
			 		__count = -1;
			 	}	
			 	break;
			 	case "ArrowRight" : {
			 		fn = moveHori;
			 		__count = 1;
			 	}	
			 	break;
			 	case 'ArrowDown' : {
			 		fn = moveVert;
			 		__count = 1;
			 	}
			 	break;
			 	case 'ArrowUp' : {
			 		fn = moveVert;
			 		__count = -1;
			 	}
			 	break;
			 	case "Home" : {
			 		fn = home;
			 		__count = evt.metaKey || evt.ctrlKey;
			 	}
			 	break;
			 	case 'End' : {
			 		fn = end;
			 		__count = evt.metaKey || evt.ctrlKey;
			 	}
			 	break;
			 }


			if( fn && ( ret = fn( target, __count ) ) ){
				/*
				 * If particular column is fixed you can return fixed column here. fixed column will be focused
				 */
				after_nav && ( ret = after_nav.call( origin, ret, evt ) || ret );

				ret.focus();
				evt.preventDefault();
			}
		}
	}

	window._lyteUiUtils.tableNavigation = function( table, option ){
		var ns = "add",
		$node = $L( table ),
		data_ns = 'tableNavigation';

		if( option == "unbind" ){
			ns = "remove";
			$node.removeData( data_ns );
		}  else {
			$node.data( data_ns, option || {} );
		}

		table[ ns + 'EventListener' ]( 'keydown', keyEvent, true );
	}

})();