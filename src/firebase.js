
/* eslint-disable */
import firebase from 'firebase';
const config = {
    apiKey: "AIzaSyDtlZVDvlhFGV6X5pwHlRGP7YsnHxI9MzI",
    authDomain: "house-chat.firebaseapp.com",
    databaseURL: "https://house-chat.firebaseio.com",
    projectId: "house-chat",
    storageBucket: "",
    messagingSenderId: "1000632795558"
};
firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;