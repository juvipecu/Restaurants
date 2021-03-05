import { firebaseApp } from './firebase'
import { Alert } from 'react-native'
import * as firebase from 'firebase'
import * as Notifications from 'expo-notifications'
import 'firebase/firestore'
import Constants from 'expo-constants'

import { fileToBlob } from './utils'

const db = firebase.firestore(firebaseApp)

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
})

export const isUserLogged = () => {
    let isLogged = false
    firebase.auth().onAuthStateChanged((user) => {
        user !== null && (isLogged = true)
    })
    return isLogged
}

export const registerUser = async(email, password) =>
{
    const result = { statusResponse: false, error: null }
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
        result.statusResponse = true
    } catch {
        result.error = "Este correo ya ha sido registrado."
    }
    return result
}

export const getCurrentUser = () => {
    return firebase.auth().currentUser
}

export const closeSession = () => {
    firebase.auth().signOut()
}

export const loginWithEmailAndPassword = async (email, password) => {
    const result = { statusResponse: false, error: null }
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password)
        result.statusResponse = true
    } catch {
        result.error = "Usuario o contraseña no válidos."
    }
    return result
}

export const sendEmailResetPassword = async (email) => {
    const result = { statusResponse: false, error: null }
    try {
        await firebase.auth().sendPasswordResetEmail(email)
        result.statusResponse = true
    } catch(error) {
        result.error = error
    }
    return result
}

export const uploadImage = async (image, path, name) => {
    const result = { statusResponse: false, error: null, url: null }
    const ref = firebase.storage().ref(path).child(name)
    const blob = await fileToBlob(image)
    await ref.put(blob)

    try {
        const url = await firebase.storage().ref(`${path}/${name}`).getDownloadURL()
        result.statusResponse = true
        result.url = url
    } catch (error) {
        result.error = error    
    }

    return result
}

export const updateProfile = async (data) => {
    const result = { statusResponse: false, error: null }
 
    try {
        await firebase.auth().currentUser.updateProfile(data)
        result.statusResponse = true    
    } catch (error) {
        result.error = error    
    }

    return result
}

export const reauthenticate = async(password) => {
    const result = { statusResponse: false, error: null }
    const user = getCurrentUser()    
    const credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
    )

    try {
        await user.reauthenticateWithCredential(credentials)
        result.statusResponse = true
    } catch (error) {
        result.error = error
    }

    return result
}

export const updateEmail = async (email) => {
    const result = { statusResponse: false, error: null }
 
    try {
        await firebase.auth().currentUser.updateEmail(email)
        result.statusResponse = true    
    } catch (error) {
        result.error = error    
    }

    return result
}

export const updatePassword = async (newPassword) => {
    const result = { statusResponse: false, error: null }
 
    try {
        await firebase.auth().currentUser.updatePassword(newPassword)
        result.statusResponse = true    
    } catch (error) {
        result.error = error    
    }

    return result
}

export const addRecordWithOutId = async (collection, data) => {
    const result = { error: "", statusResponse: true }
    await db
        .collection(collection)
        .add(data)
        .then(() => result.statusResponse = true)
        .catch((error) => result.error = error)

    return result
}

export const addRecordWithId = async (collection, doc, data) => {
    const result = { error: "", statusResponse: true }
    await db
        .collection(collection)
        .doc(doc)
        .set(data, { merge: true })
        .then(() => result.statusResponse = true)
        .catch((error) => result.error = error)

    return result
}

export const getRecordById = async (collection, id) => {
    let response = { statusResponse: false, document: null, error: null };
  
    try {
        const result = await db.collection(collection).doc(id).get()
        const document = result.data()
        document.id = result.id
        response.document = document
        response.statusResponse = true
    } catch (error) {
        response.error = error
    }
  
    return response;
}
  

export const updateRecord = async (collection, id, data) => {
    let response = { statusResponse: false, error: null };
  
    try {
        await db.collection(collection).doc(id).update(data)
        response.statusResponse = true
    } catch (error) {
        response.error = error
    }
  
    return response;
}

export const getRestaurantReviews = async(id) => {
    let response = { statusResponse: false, error: null, reviews: [] };
  
    try {
        const result = await db.collection("reviews")
            .where("idRestaurant", "==", id)
            .get()
        result.forEach(doc => {
            const review = doc.data()
            review.id = doc.id
            response.reviews.push(review)
        })    
        response.statusResponse = true
    } catch (error) {
        response.error = error
    }
  
    return response;
}

export const getIsFavorite = async(idRestaurant) => {
    let response = { statusResponse: false, error: null, isFavorite: false };
  
    try {
        const result = await db.collection("favorites")
            .where("idRestaurant", "==", idRestaurant)
            .where("idUser", "==", getCurrentUser().uid)
            .get()
        response.isFavorite = result.docs.length > 0
        response.statusResponse = true
        
    } catch (error) {
        response.error = error
    }
  
    return response;
}

export const removeFromFavorite = async(idRestaurant) => {
    let response = { statusResponse: false, error: null };
  
    try {
        const result = await db.collection("favorites")
            .where("idRestaurant", "==", idRestaurant)
            .where("idUser", "==", getCurrentUser().uid)
            .get()
        result.forEach(async(doc) => {
            const favoriteId = doc.id
            await db.collection("favorites").doc(favoriteId).delete()
        })
        response.statusResponse = true

    } catch (error) {
        response.error = error
    }
  
    return response;
}

export const getToken = async () => {
    if (!Constants.isDevice) {
        Alert.alert("Debes utilizar un dispositivo físico para poder utilizar las notificaciones.")
        return
    } 

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }

    if (finalStatus !== "granted") {
        Alert.alert("Debes dar permiso para acceder a las notificaciones.")
        return
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        })
    }

    return token
}

export const startNotifications = (notificationListener, responseListener) => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log(notification)
    })
  
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response)
    })
  
    return () => {
        Notifications.removeNotificationSubscription(notificationListener)
        Notifications.removeNotificationSubscription(responseListener)
    }
}

export const sendPushNotification = async (message) => {
    let response = false
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }).then(() => response = true)
    return response
}

export const setNotificationMessage = (token, title, body, data) => {
    const message = {
        to: token,
        sound: "default",
        title: title,
        body: body,
        data: data
    }

    return message
}

