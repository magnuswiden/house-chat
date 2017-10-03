
class Giphy {

	constructor( apiKey ) {
		this.apiKey = apiKey;
		this.url = 'https://api.giphy.com/v1/gifs/';
		this.endpoints = {
			translate: 'translate'
		}
	}

	handleError( _res ) {
		return _res.ok ? _res : Promise.reject( _res.statusText );
	}

	handleContentType( _response ) {
		const contentType = _response.headers.get( 'content-type' );

		if ( contentType && contentType.includes( 'application/json' ) ) {
			return _response.json();
		}

		return Promise.reject( 'Oops, we haven\'t got JSON!' );
	}

	translate( translateString ) {
		// https://api.giphy.com/v1/gifs/translate?api_key=dFdXCqbmwFoODXbxsUEyY021fKsOynVW&s=fruit
		return window.fetch( this.url + this.endpoints.translate + '?api_key=' + this.apiKey + '&s=' + translateString, {
			method: 'GET',
			headers: new Headers( {
				'Accept': 'application/json'
			} )
		} )
			.then( this.handleError )
			.then( this.handleContentType )
			.catch( error => { throw new Error( error ) } )
	}
}

export default Giphy;