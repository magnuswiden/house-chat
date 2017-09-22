/* eslint-disable */

class Gathering {
    constructor( databaseReference, roomName ) {
        this.db = databaseReference;
        this.roomName = roomName || 'globe';

        this.room = this.db.ref( "gatherings/" + encodeURIComponent( this.roomName ) );
        this.myName = '';
        this.user = null;
    }

    join( uid, displayName ) {

        if ( this.user ) {
            //console.error( 'Already joined.' );
            return false;
        }

        this.myName = displayName || 'Anonymous';
        this.user = uid ? this.room.child( uid ) : this.room.push();

        // Add user to presence list when online.
        var self = this;
        var presenceRef = this.db.ref( ".info/connected" );
        presenceRef.on( "value", function ( snap ) {
            if ( snap.val() ) {
                self.user.onDisconnect().remove();
                self.user.set( self.myName );
            }
        } );

        return this.myName;
    };

    leave() {
        this.user.remove();
        this.myName = '';
    };

    over() {
        this.room.remove();
    };

    onUpdated( callback ) {
        if ( 'function' == typeof callback ) {
            this.room.on( "value", function ( snap ) {
                callback( snap.numChildren(), snap.val() );
            } );
        } else {
            console.error( 'You have to pass a callback function to onUpdated(). That function will be called (with user count and hash of users as param) every time the user list changed.' );
        }
    };

}
export default Gathering;
