
import { h, Component } from 'preact';
import firebase, { auth, provider } from '../../firebase.js';
import MDReactComponent from 'markdown-react-js';
import Gathering from './Gathering';
import Giphy from './Giphy';
import HomeController from './HomeController';
import style from './style';

class Home extends Component {
	constructor() {
		super();
		this.tableRef = 'items';
		this.controller = new HomeController( firebase.database(), auth, this.tableRef );
		this.state = {
			message: '',
			items: [],
			user: null,
			permissionGranted: false,
			onlineUsers: []
		}
		this.handleChange = this.handleChange.bind( this );
		this.handleKeyPress = this.handleKeyPress.bind( this );
		this.handleSubmit = this.handleSubmit.bind( this );
		this.login = this.login.bind( this );
		this.logout = this.logout.bind( this );
		this.sendNotification = this.sendNotification.bind( this );
		this.enableNotifications = this.enableNotifications.bind( this );
		this.calleth = this.calleth.bind( this );
		this.onlineUsersChange = this.onlineUsersChange.bind( this );
		this.populateList = this.populateList.bind( this );
		this.handleUpdates = this.handleUpdates.bind( this );
		this.giphyCallback = this.giphyCallback.bind( this );
		this.gathering = new Gathering( firebase.database(), 'HouseChat' );
		this.giphy = new Giphy( 'dFdXCqbmwFoODXbxsUEyY021fKsOynVW' );
	}

	componentDidMount() {
		auth.onAuthStateChanged( ( user ) => {
			if ( user ) {
				this.gathering.join( user.uid, user.displayName );
				this.setState( { user } );
			}
		} );
		this.gathering.onUpdated( this.onlineUsersChange );

		// watch for changes and give us only the latest chat message
		this.controller.onUpdates( this.handleUpdates );

		// load all chat messages on page load ONCE.
		this.controller.loadAllMessages( this.populateList );


	}

	_normalizeData( currentWeather ) {
		// Take only what our app needs and nothing more.
		const { t, w, p } = currentWeather;

		return {
			temperature: t,
			windspeed: w,
			pressure: p
		};
	}

	handleChange( e ) {
		this.setState( {
			[ e.target.name ]: e.target.value
		} );
	}
	handleKeyPress( e ) {
		const code = ( e.keyCode ? e.keyCode : e.which );
		if ( code === 13 ) {
			if ( !e.shiftKey ) {
				this.setState( {
					[ e.target.name ]: e.target.value
				} );
				this.handleSubmit( e );
			}
		}
	}
	handleSubmit( e ) {
		e.preventDefault();

		// check for /giphy pattern in message 
		let message = this.state.message.split( '/giphy ' );
		if ( message.length > 1 ) {
			this.giphy.random( message[ 1 ] )
				.then( this.giphyCallback )
				.catch( console.error );
		} else {
			this.postToDatabase();
		}


	}

	postToDatabase() {

		const itemsRef = firebase.database().ref( this.tableRef );
		let date = new Date();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let _time = hours + ':' + minutes;
		const item = {
			title: this.state.message,
			user: {
				name: this.state.user.displayName || this.state.user.email,
				photo: this.state.user.photoURL,
				uid: this.state.user.uid
			},
			time: _time

		}
		itemsRef.push( item );

		this.setState( {
			message: ''
		} );
		let formEl = document.getElementById( 'message' );
		formEl.value = '';
		setTimeout( function () {
			let elem = document.getElementById( 'dataHolder' );
			elem.scrollTop = elem.scrollHeight;
		}, 250 );
	}

	giphyCallback( response ) {
		if ( typeof response.data.type != 'undefined' ) {
			let message = this.state.message.split( '/giphy ' );
			let gif = response.data.image_url;
			this.setState( {
				message: '`/giphy ' + message[ 1 ] + '`' + '\n![' + message[ 1 ] + '](' + gif + ')'
			} );
			this.postToDatabase();
		} else {
			this.postToDatabase();
		}
	}

	login() {
		auth.signInWithPopup( provider )
			.then( ( result ) => {
				const user = result.user;
				this.gathering.join( user.uid, user.displayName );
				this.setState( {
					user
				} );
			} )
			.catch( console.error );
	}
	logout() {
		this.gathering.leave();
		auth.signOut()
			.then( () => {
				this.setState( {
					user: null
				} );
			} )
			.catch( console.error );
	}

	populateList( items ) {
		console.log( 'populate' );
		let chatMessages = [];
		for ( let item in items ) {
			chatMessages.push( {
				id: item,
				title: items[ item ].title,
				user: items[ item ].user,
				time: items[ item ].time
			} );
		}
		this.setState( {
			items: chatMessages
		} );
		setTimeout( function () {
			let elem = document.getElementById( 'dataHolder' );
			elem.scrollTop = elem.scrollHeight;
		}, 150 );
	}

	handleUpdates( items ) {
		console.log( 'update' );
		if ( this.state.items.length > 0 ) { // prevents this listener to trigger on page load
			let newMessage = [];
			for ( let item in items ) {
				newMessage.push( {
					id: item,
					title: items[ item ].title,
					user: items[ item ].user,
					time: items[ item ].time
				} );
			}
			const latestMessage = newMessage[ 0 ];
			if ( latestMessage.user.uid != this.state.user.uid ) {
				this.sendNotification( latestMessage )
			}
			let joined = this.state.items.concat( latestMessage );
			this.setState( { items: joined } )
			setTimeout( function () {
				let elem = document.getElementById( 'dataHolder' );
				elem.scrollTop = elem.scrollHeight;
			}, 150 );
		}
	}

	onlineUsersChange( count, user ) {
		let newOnlineUsers = [];
		for ( let item in user ) {
			newOnlineUsers.push( {
				id: item,
				name: user[ item ]
			} );
		}

		this.setState( {
			onlineUsers: newOnlineUsers
		} );
	}
	calleth() {
		this.setState( {
			permissionGranted: true
		} )
	}
	enableNotifications( callback ) {
		if ( !( 'Notification' in window ) ) {
			alert( 'This browser does not support desktop notification' );
		}
		else if ( Notification.permission !== 'denied' ) {
			Notification.requestPermission( function ( permission ) {
				callback();
			} );
		}
	}
	sendNotification( message ) {
		// Let's check whether notification permissions have already been granted
		if ( ( 'Notification' in window ) && Notification.permission === 'granted' ) {
			// If it's okay let's create a notification
			var notification = new Notification(
				'New message',
				{
					body: message.user.name + ': ' + message.title,
					icon: message.user.photo
				}
			)
		}
	}

	render() {
		const { logoutTest } = this.controller;
		return (
			<article className={style.home}>
				{this.state.user &&
					<div className="user-meta">
						<p className="author-meta"><img className="round" src={this.state.user.photoURL} width="30" height="30" /> <span>{this.state.user.displayName || this.state.user.email} <a href="#" onClick={this.logout}>Log Out</a></span></p>
						{( 'Notification' in window ) && ( Notification.permission === 'granted' || this.state.permissionGranted ) ?
							<span>Notification is ON</span>
							:
							<span><a href="#" onClick={() => this.enableNotifications( this.calleth )}>Notify</a> me when new messages is posted.</span>
						}
					</div>
				}
				{this.state.onlineUsers.length > 0 &&
					<div className="onlineUsers">
						Online users:
						{this.state.onlineUsers.map( ( item ) => {
							return (
								<p key={item.id}>{item.name}</p>
							)
						} )}
					</div>
				}
				<header>
					<div className='wrapper'>
						<h1>House Chat</h1>
					</div>
				</header>

				<section id="dataHolder" className='display-items'>
					<ul>
						{this.state.items.map( ( item ) => {
							return (
								<li key={item.id}>
									<div class="avatar">
										<img src={item.user.photo} width="36" height="36" />
									</div>
									<p>
										<span className="author">{item.user.name}</span> <time>{item.time}</time><br />
										{item.title.split( '\n' ).map( ( item, key ) => {
											return <span key={key}><MDReactComponent text={item} /></span>
										} )}

									</p>
								</li>
							)
						} )}
					</ul>
				</section>
				<section className='add-item'>

					<form onSubmit={this.handleSubmit}>
						{this.state.user ?
							<div>
								<p><textarea name="message" id="message" placeholder="Your /giphy message (markdown also works)" onKeyPress={this.handleKeyPress} onChange={this.handleChange} /></p>
								<button>Submit</button>
							</div>
							:
							<p className="alert-box">
								You must be logged in to write a message in the <em>House Chat</em>.<br />
								Please <a href="#" onClick={this.login}>Log In</a> with your Google account.
							</p>
						}
					</form>


				</section>

			</article>
		);
	}
}
export default Home;

