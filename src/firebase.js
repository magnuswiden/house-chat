
/* eslint-disable */
import firebase from 'firebase';
const config = {
    apiKey: "AIzaSyDoNc08lfj0ka9-DHjj51-7vpnGPKaMsiE",
    authDomain: "dev-chat-48a93.firebaseapp.com",
    databaseURL: "https://dev-chat-48a93.firebaseio.com",
    projectId: "dev-chat-48a93",
    storageBucket: "dev-chat-48a93.appspot.com",
    messagingSenderId: "907068104648"
};

firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;