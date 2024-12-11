function lyteUiGetValue( object, key ) {
    return object[ key ];
}

function lyteUiReturnValueBy(content,key){
	if(key || key == 0){
		return content[key]
	}
	else{
		return content
	}
}

function lyteUiConcat() {	
	var resp = '';
	var argLength = arguments.length;
	for( var i=0; i<argLength; i++ ) {
		if( arguments[ i ] != undefined ) {
			resp += arguments[ i ];
		}
	}
	return resp;
}

function lyteUiI18n(key,componentName){
	return _lyteUiUtils.i18n(key,componentName);
}

function lyteUiImageFile( file ){
	if(file.src && file.fileType === "image" ) {
		return true;
	}
	return false;
}

function lyteUiCapitalizeName(name){
	return _lyteUiUtils.capitalize(name);
}

function lyteUiFileSize( curr, def, dgt ){
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], idx = 0;
	if( def ) {
		idx = Math.max( idx, sizes.indexOf( def ) );
	} else {
		idx = Math.floor( Math.log( curr ) / Math.log( 1000 ) )
	}
	if( idx == 0 && curr == 1 ){
		return "1 Byte";
	}
	return ( parseInt( curr / Math.pow( 1000 , idx ) * Math.pow( 10, dgt ) ) / Math.pow( 10, dgt ) ) + ' ' + sizes[ idx ];

}

function lyteUiOptGroupCheck(content){
	if(content.constructor == Object)
		{
		  if(Object.keys(content).length == 1)
			  {
				  var value = content[Object.keys(content)[0]]
				  if(value.constructor == Object || value.constructor == Array)
				  {
					  return true
				  }
			   }
		}
	return false
}

function lyteUiIsObject(obj) {

	if ( Object.prototype.toString.call(obj) === "[object Object]" ) {
		return true;
	} else {
		return false;
	}
}

function lyteUiReturnOnlyKey( item ) {
    var lyteSelf = this;
    var objectkeys = Object.keys(item)
    if(objectkeys)
		{
			return objectkeys[0]
		}
	else
		{
			return false
		}
}

function lyteUiReturnOnlyValue( item ) {
	var objectkeys = Object.keys(item)
	return item[objectkeys[0]]
}

function stringify( obj ){
	return JSON.stringify( obj );
}

export {
	lyteUiGetValue, lyteUiReturnValueBy, lyteUiConcat, lyteUiI18n, lyteUiImageFile, lyteUiCapitalizeName,
	lyteUiFileSize, lyteUiOptGroupCheck, lyteUiIsObject, lyteUiReturnOnlyKey, lyteUiReturnOnlyValue, stringify
};