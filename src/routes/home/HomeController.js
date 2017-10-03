
class HomeController {

	constructor( databaseReference, auth ) {
		this.db = databaseReference;
		this.auth = auth;
	}
	
	logoutTest() {
		console.log( 'logout' );
		//this.gathering.leave();
		// auth.signOut()
		// 	.then( () => {
		// 		this.setState( {
		// 			user: null
		// 		} );
		// 	} )
		// 	.catch( console.log );
	}
}

export default HomeController;