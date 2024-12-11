/* 
 * only for global events ( Ex. scroll, resize, orientationchange, click )
 * dont bind mousedown, mousemove, mouseup, mouseover kind of events 
 */

;( function(){

	var order_of_callback = {
		click : [ "menu", "dropdown", "input", "datetimeinput", "popover", "modal" ],
		scroll : [ "modal", "popover", "menu", "dropdown", "input", "datetimeinput" ],
		resize : [ "modal", "popover", "menu", "dropdown", "input", "datetimeinput" ]
	};

	function get_new_order( callback_order, components ){
		for( var key in components ){
			if( callback_order.indexOf( key ) + 1 ){
				continue;
			}
			callback_order.push( key );
		}

		return callback_order;
	}

	function common_callback( evt ){
		var type = evt.type,
		dom = evt.currentTarget,
		components = dom._lyteUi_evts[ type ] || {},
		callback_order = get_new_order( order_of_callback[ type ] || [], components );

		callback_order.every( function( name ){
			var handlers = components[ name ] || [],
			ret;
			
			handlers.every( function( item ){
				
				try{
					ret = item.call( this, evt );
				} catch( e ){
					console.error( e );
				}

				return ret != false;
			});

			return ret != false;
		});
	}

	window._lyteUiUtils.addEvent = function( dom, name, callback, ns ){

		var reg_evt = dom._lyteUi_evts;
		
		if( !reg_evt ){
			reg_evt = dom._lyteUi_evts = {};
		}

		var components = reg_evt[ name ];

		if( !components ){
			components = reg_evt[ name ] = {};
			dom.addEventListener( name, common_callback, true );
		}

		ns = ns || "others";

		var handlers = components[ ns ];

		if( !handlers ){
			handlers = components[ ns ] = [];
		}

		handlers.push( callback );
	}

	_lyteUiUtils.removeEvent = function( dom, name, callback, ns ){

		var reg_evt = dom._lyteUi_evts || {},
		components = reg_evt[ name ] || {},
		handlers = components[ ns || 'others' ] || [],
		index = handlers.indexOf( callback );

		if( index + 1 ){
			handlers.splice( index, 1 );
		}
	}

})();