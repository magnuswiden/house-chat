
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

	post( postdata, callback ) {
		if ( 'function' == typeof callback ) {
			const itemsRef = this.tableref;
			let date = new Date();
			let hours = date.getHours();
			let minutes = date.getMinutes() < 10 ? '0' : '' + date.getMinutes();
			let _time = hours + ':' + minutes;
			const item = {
				title: postdata.message,
				user: {
					name: postdata.user.displayName || postdata.user.email,
					photo: postdata.user.photoURL,
					uid: postdata.user.uid
				},
				time: _time

			}
			itemsRef.push( item );
			callback();
		}
	};
}

export default HomeController;