( function(){
	var __utils = window._lyteUiUtils;

	if( __utils ){

		var __nav = window.navigator,
		user_agent = __nav.userAgent,
		is_mac = /Macintosh/i.test( user_agent ),
		ctrl_key = ( is_mac ? 'meta' : 'ctrl' ) + 'Key',
		__timeout,
		keyup_tolerance = 100,
		keydown_interval = 20;

		function is_copy( evt ){
			var key = evt.key;

			if( /^(c|x)$/i.test( key ) ){
				return evt[ ctrl_key ];
			}
			return false;
		};

		function html2str( __str ){
			var elem = document.createElement( "div" ),
			str = "",
			fn = function( arr ){
			    arr.forEach( function( item ){
			        var tag = item.tagName,
			        nodes = Array.from( item.childNodes || [] );

			        if( nodes.length ){
			            fn( nodes ); 
			        }

			        if( /^(div|dt|dd|detail|summary|length|fieldset|footer|header|main|blockquote|p|caption-div|h[1-6]|hr|td|th|hr|img|video|br)$/i.test( tag ) ){
			            str += "\n";
			        } else if( !tag ){
			            str += item.nodeValue;
			        }
			    });
			};

			elem.innerHTML = __str;

			fn( Array.from( elem.childNodes ) )

			return str;
		};

		function copy2clip( html, cb, failure ){
		    try{
		        __nav.permissions.query( { name: "clipboard-write" } ).then( function( result ){
		            if( /^(granted|prompt)$/i.test( result.state ) ){

		                var clip_item = new window.ClipboardItem( ( function(){
		                    var obj = {},
		                    type1 = "text/html",
		                    type2 = "text/plain";

		                    obj[ type1 ] = new window.Blob( [ html ], { type : type1 } );
		                    obj[ type2 ] = new window.Blob( [ html2str( html ) ], { type : type2 } );

		                    return obj;
		                }() ) );

		                __nav.clipboard.write( [ clip_item ] ).then( function(){
		                    cb && cb.apply( this, arguments ); 
		                }, function(){
		                    failure && failure.apply( this, arguments );
		                });
		            } else {
		                failure && failure.call( this, result );
		            }
		        }).catch( function( err ){
		        	__timeout = void 0;
		        	__utils.copyFrmEvt( html, void 0, void 0, cb, failure, true );
		        });
		    } catch( e ){
		        failure && failure.call( this, e );
		    }
		};

		__utils.html2str = html2str;

		__utils.copy2clip = copy2clip;

	 	__utils.copyFrmEvt = function( html, evt, wrapper, cb, failure, force ){

	 		if( evt && !is_copy( evt ) ){
	 			return;
	 		}

	 		if( __timeout != void 0 ){
	 			return;
	 		}

	 		__timeout = setTimeout( function(){
	 			__timeout = void 0;
	 		}, keydown_interval );

	 		if( force || window._lyteUiUtils.getBrowser() == 'firefox' ){
	 			var elem = document.createElement( 'div' ),
	 			__style = elem.style;

		 		elem.contentEditable = true;

		 		wrapper = wrapper || document.body;

		 		elem.tabindex = 0;
		 		elem.innerHTML = html;

		 		__style.position = "absolute";
		 		__style.opacity = '0';
		 		__style.top = "0";
		 		__style.left = "0";

		 		wrapper.appendChild( elem );

		 		elem.focus({
					preventScroll : true
				});

		 		var __selection = window.getSelection(),
		 		new_range = document.createRange();

		 		new_range.selectNodeContents( elem );

		 		__selection.removeAllRanges();
		 		__selection.addRange( new_range );

		 		if( !evt ){
		 			document.execCommand( 'copy' );
		 		}

		 		setTimeout( function(){
		 			elem.remove();
		 			cb && cb();
		 		}, keyup_tolerance );
	 		} else {
	 			copy2clip( html, cb, failure );
	 		}

	 		return true;
		}
	}
})();