
class HomeController {

	constructor( databaseReference, auth, tablename ) {
		this.db = databaseReference;
		this.auth = auth;
		this.roomName = tablename;
		this.tableref = this.db.ref( encodeURIComponent( this.roomName ) );
	}

	loadAllMessages( callback ) {
		if ( 'function' == typeof callback ) {
			const ref = this.tableref.limitToLast( 40 )
			ref.once( 'value', function ( snapshot ) {
				callback( snapshot.val() );
			} );
		} else {
			console.error( 'You have to pass a callback function to loadAllMessages(). That function will be called (with user count and hash of users as param) every time the user list changed.' );
		}
	};

	onUpdates( callback ) {
		if ( 'function' == typeof callback ) {
			const ref = this.tableref.limitToLast( 1 )
			ref.on( 'value', function ( snapshot ) {
				callback( snapshot.val() );
			} );
		}
	};
}

export default HomeController;