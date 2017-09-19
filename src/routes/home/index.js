/* eslint-disable */
import { h, Component } from 'preact';
import firebase, { auth, provider } from '../../firebase.js';
import moment from 'moment';
import style from './style';

class Home extends Component {
	constructor() {
		super();
		this.state = {
			message: '',
			username: '',
			items: [],
			user: null
		}
		this.handleChange = this.handleChange.bind( this );
		this.handleSubmit = this.handleSubmit.bind( this );
		this.login = this.login.bind( this );
		this.logout = this.logout.bind( this );
	}

	handleChange( e ) {
		this.setState( {
			[ e.target.name ]: e.target.value
		} );
	}
	handleSubmit( e ) {
		e.preventDefault();
		const itemsRef = firebase.database().ref( 'items' );
		let _time = moment().format( 'HH:mm' ).toString();
		const item = {
			title: this.state.message,
			user: {
				name: this.state.user.displayName || this.state.user.email,
				photo: this.state.user.photoURL
			},
			time: _time

		}
		itemsRef.push( item );
		setTimeout( function () {
			let elem = document.getElementById( 'dataHolder' );
			elem.scrollTop = elem.scrollHeight;
		}, 50 );
		this.setState( {
			message: '',
			username: ''
		} );
	}
	login() {
		auth.signInWithPopup( provider )
			.then( ( result ) => {
				const user = result.user;
				this.setState( {
					user
				} );
			} );
	}
	logout() {
		auth.signOut()
			.then( () => {
				this.setState( {
					user: null
				} );
			} );
	}
	componentDidMount() {
		auth.onAuthStateChanged( ( user ) => {
			if ( user ) {
				this.setState( { user } );
			}
		} );
		const itemsRef = firebase.database().ref( 'items' );
		itemsRef.on( 'value', ( snapshot ) => {
			let items = snapshot.val();
			let newState = [];
			for ( let item in items ) {
				newState.push( {
					id: item,
					title: items[ item ].title,
					user: items[ item ].user,
					time: items[ item ].time
				} );
			}
			setTimeout( function () {
				let elem = document.getElementById( 'dataHolder' );
				elem.scrollTop = elem.scrollHeight;
			}, 50 );
			this.setState( {
				items: newState
			} );
		} );
	}
	removeItem( itemId ) {
		const itemRef = firebase.database().ref( `/items/${itemId}` );
		itemRef.remove();
	}

	render() {

		return (
			<article className={style.home}>
				{this.state.user &&
					<div className="user-meta">
						Logged in as {this.state.user.displayName || this.state.user.email} <a href="#" onClick={this.logout}>Log Out</a>
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
										{item.title}
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
								<p><textarea name="message" placeholder="Write your Message" onChange={this.handleChange} value={this.state.message} /></p>
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

