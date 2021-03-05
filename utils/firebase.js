import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCwBxcsa4VJgYi-Y_hB5Kzx5aWLpqqfXDc",
    authDomain: "restaurants-96412.firebaseapp.com",
    projectId: "restaurants-96412",
    storageBucket: "restaurants-96412.appspot.com",
    messagingSenderId: "928032301481",
    appId: "1:928032301481:web:77148dda3cb1d1be4b24b8",
    measurementId: "G-E129RJ330P"
  }
    
export const firebaseApp = firebase.initializeApp(firebaseConfig)
