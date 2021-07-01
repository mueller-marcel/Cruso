import firebase from 'firebase';
import 'firebase/firestore';

/**
 * Initialize the config for firebase
 */
const firebaseConfig = {
    apiKey: "api_key",
    authDomain: "domain",
    projectId: "project_id",
    storageBucket: "storage_bucket",
    messagingSenderId: "messaging_sender_id",
    appId: "api_id"
};

/**
 * Define a class for the initialization of firebase and the provide a property for
 * the firestore
 */
export default class Firebase {
    static db;

    static init() {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        Firebase.db = firebase.firestore();
    }
}