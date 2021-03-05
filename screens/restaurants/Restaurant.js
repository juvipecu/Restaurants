import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Alert, StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native'
import { Rating, ListItem, Icon, Input, Button } from 'react-native-elements'
import { isEmpty, map, size } from 'lodash'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-easy-toast'

import { firebaseApp } from '../../utils/firebase'
import firebase from 'firebase/app'
import 'firebase/firestore'

import Loading from '../../components/Loading'
import Map from '../../components/Map'
import CarouselImages from '../../components/CarouselImages'
import ListReviews from '../../components/restaurants/ListReview'
import { 
    addRecordWithOutId, 
    getCurrentUser, 
    getIsFavorite, 
    getRecordById, 
    removeFromFavorite, 
    sendPushNotification,
    setNotificationMessage 
} from '../../utils/actions'
import { formatPhone, callNumber, sendWhatsApp, sendEmail } from '../../utils/utils'
import Modal from '../../components/Modal'

const screeenWidth = Dimensions.get("window").width
const db = firebase.firestore(firebaseApp)

export default function Restaurant(props) {
    const { navigation, route } = props
    const { id, name } = route.params
    const toastRef = useRef()

    const [restaurant, setRestaurant] = useState(null)
    const [activeSlide, setActiveSlide] = useState(0)
    const [isFavorite, setIsFavorite] = useState(false)
    const [userLogged, setUserLogged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingText, setLoadingText] = useState(null)
    const [currentUser, setcurrentUser] = useState(null)
    const [modalNotification, setModalNotification] = useState(false)

    navigation.setOptions({ title: name })

    firebase.auth().onAuthStateChanged((user) => {
        user ? setUserLogged(true) : setUserLogged(false)
        setcurrentUser(user)
    })
    
    useFocusEffect(
        useCallback(() => {
            (async () => {
                const response = await getRecordById("restaurants", id)
                if (response.statusResponse) {
                    setRestaurant(response.document)
                } else {
                    setRestaurant({})
                    Alert.alert("Ocurrio un problema cargando el restautante, intente más tarde.")
                }
            })()
        }, [])
    )

    useEffect(() => {
        (async() => {
            if (userLogged && restaurant) {
                const response = await getIsFavorite(restaurant.id)
                response.statusResponse && setIsFavorite(response.isFavorite)
            }
        })()
    }, [userLogged, restaurant])

    if(!restaurant) return <Loading isVisble={true} text="Cargando..."/>

    const addFavorite = async() => {
        if (!userLogged) {
            toastRef.current.show("Para agregar a favoritos tienes que estar logeado.", 3000)
            return
        }

        setLoadingText("Adicionando a favoritos...")
        setLoading(true)
        const response = await addRecordWithOutId("favorites", {
            idUser: getCurrentUser().uid,
            idRestaurant: restaurant.id            
        })
        setLoading(false)

        if (response.statusResponse) {
            setIsFavorite(true)
            toastRef.current.show("Restaurante añadido a favoritos.", 3000)
        } else {
            toastRef.current.show("No se pudo agregar el restaurante a favoritos.", 3000)
        }
    }

    const removeFavorite = async () => {
        setLoadingText("Eliminando de favoritos...")
        setLoading(true)
        const response = await removeFromFavorite(restaurant.id)
        setLoading(false)

        if (response.statusResponse) {
            setIsFavorite(false)
            toastRef.current.show("Restaurante eliminado de favoritos.", 3000)
        } else {
            toastRef.current.show("No se pudo eliminar el restaurante de favoritos.", 3000)
        }
    }

    return (
        <ScrollView style={styles.viewBody}>
            <View style={styles.viewFavorite}>
                <Icon
                    type="material-community"
                    name={ isFavorite ? "heart" : "heart-outline"} 
                    onPress={ isFavorite ? removeFavorite : addFavorite }
                    color={ isFavorite ? "#f00" : "#442484" }
                    size={35}
                    underlayColor="transparent"
                />
            </View>
            <CarouselImages
                images={restaurant.images}
                height={250}
                width={screeenWidth}
                activeSlide={activeSlide}
                setActiveSlide={setActiveSlide}
            />
            <TitleRestaurant
                name={restaurant.name}
                description={restaurant.description}
                rating={restaurant.rating}
            />
            <RestaurantInfo
                name={restaurant.name}
                location={restaurant.location}
                address={restaurant.address}
                phone={restaurant.phone}
                email="jzuluaga55@gmail.com"
                currentUser={currentUser}
                setModalNotification={setModalNotification}
            />
            <ListReviews
                navigation={navigation}
                idRestaurant={restaurant.id}
            />
            <Toast ref={toastRef} position="center" opacity={0.9} />
            <Loading isVisible={loading} text={loadingText}/>
            <SendMessage
                modalNotification={modalNotification}
                setModalNotification={setModalNotification}
                setLoading={setLoading}
                setLoadingText={setLoadingText}
                restaurant={restaurant}
            />
        </ScrollView>
    )
}

function TitleRestaurant(props) {
    const { name, description, rating } = props

    return (
        <View style={styles.viewRestaurantTitle}>
            <View style={styles.viewRestaurantContainer}>
                <Text style={styles.nameRestaurant}>{name}</Text>
                <Rating 
                    style={styles.rating}
                    imageSize={20}
                    readonly
                    startingValue={parseFloat(rating)}
                />
            </View>
            <Text style={styles.descriptionRestaurant}>{description}</Text>
        </View>
    )
}

function RestaurantInfo(props) {
    const { 
        location, 
        name, 
        address,
        phone, 
        email, 
        currentUser, 
        setModalNotification 
    } = props
    
    const listInfo = [
        {
            text: address,
            iconName: "map-marker",
            iconRight: "message-text-outline",
            iconRigthColor: "#25D366",
            actionLeft: "callPhone",
            actionRight: "sendMessage",
            type: "address"
        },
        {
            text: formatPhone(phone),
            iconName: "phone",
            iconRight: "whatsapp",
            iconRigthColor: "#25D366",
            actionLeft: "callPhone",
            actionRight: "sendWhatsApp",
            type: "phone"
        },
        {
            text: email,
            iconName: "at",
            type: "email"
        }
    ]

    const actionLeft = (type) => {
        if (type === "phone") {
            callNumber(phone)
        } else if (type === "email") {
            if (currentUser) {
                sendEmail(email, "Interesado", `Soy ${getCurrentUser().displayName}, estoy interesado en...`)
            } else {
                sendEmail(email, "Interesado", `Estoy interesado en...`)
            }   
        }
    }

    const actionRight = (type) => {
        if (type === "address") {
            setModalNotification(true)
        } else if(type === "phone") {
            if (currentUser) {
                sendWhatsApp(phone, `Soy ${getCurrentUser().displayName}, estoy interesado en...`)
            } else {
                sendWhatsApp(phone, `Estoy interesado en...`)
            }   
        }
    }

    return (
        <View style={styles.viewRestaurantInfo}>
            <Text style={styles.restaurantInfoTitle}>
                Información sobre el restaurante
            </Text>
            <Map
                location={location}
                name={name}
                height={100}
            />
            { 
                map(listInfo, (item, index) => (
                    <ListItem 
                        key={index}
                        style={styles.containerListItem}
                    >
                        <Icon
                            type="material-community"
                            name={item.iconName}
                            color="#442484"
                            onPress={() => actionLeft(item.type)}
                        />
                        <ListItem.Content>
                            <ListItem.Title>{item.text}</ListItem.Title>
                        </ListItem.Content>

                        {
                            item.iconRight && (
                                <Icon
                                    type="material-community"
                                    name={item.iconRight}
                                    color={item.iconRigthColor}
                                    onPress={() => actionRight(item.type)}
                                />
                            )
                        }
                    </ListItem>
                ))
            }
        </View>
    )
}

function SendMessage (props) {
    const { 
        modalNotification, 
        setModalNotification, 
        setLoading, 
        setLoadingText, 
        restaurant 
    } = props

    const [title, setTitle] = useState(null)
    const [message, setMessage] = useState(null)
    const [errorTitle, setErrorTitle] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    const sendNotification = async() => {
        if (!ValidForm()) {
            return
        }

        setLoadingText("Enviando notificación...")
        setLoading(true)

        let tokens = []
        const userName = getCurrentUser().displayName ? getCurrentUser().displayName : "Anónimo"
        const theMessage = `${message}, del restaurante ${restaurant.name}`

        db.collection("favorites")
            .where("idRestaurant", "==", restaurant.id)
            .get()
            .then((response) => {
                const idUsersArray = []
                response.forEach((doc) => {
                    idUsersArray.push(doc.data().idUser)
                })
                getDataUser(idUsersArray)
                    .then((response) => {
                        response.forEach((doc) => {
                            const user = doc.data() 
                            tokens.push(user.token)
                        })
                        sendNotifications(tokens, userName, theMessage)
                        .then(() => {
                            setTitle(null)
                            setMessage(null)
                            setLoading(false)
                            setModalNotification(false)
                        })
                        .catch(() => {
                            setLoading(false)
                            Alert.alert("Ocurrió un eror enviando las notificaciones.")
                        })
                }) 
            })
    } 

    const getDataUser = (idUsersArray) => {
        const arrayUsers = []
        idUsersArray.forEach((idUser) => {
            const result = db.collection("users").doc(idUser).get()
            arrayUsers.push(result)
        })
        return Promise.all(arrayUsers)
    }

    const sendNotifications = (tokens, userName, theMessage) => {
        const results = []
        tokens.forEach((token) => {
            const messageNotification = setNotificationMessage(
                token, 
                `${userName} dijo: ${title}`,
                theMessage,
                { data: theMessage }
            )
            const result = sendPushNotification(messageNotification)
            results.push(result)
        })
        return Promise.all(results)
    }

    const ValidForm = () => {
        setErrorTitle(null)
        setErrorMessage(null)
        let isValid = true

        if (isEmpty(title)) {
            setErrorTitle("Debes ingresar un titulo del mensaje.")
            isValid = false
        }

        if (isEmpty(message)) {
            setErrorMessage("Debes ingresar un mensaje.")
            isValid = false
        }

        return isValid
    }

    return (
        <Modal 
            isVisible={modalNotification} 
            setIsVisible={setModalNotification}
        >
            <View style={styles.modalContainer}>
                <Text style={styles.textModal}>
                    Envíale un mensaje a los amantes de {restaurant.name}
                </Text>
                <Input
                    placeholder="Título mensaje..."
                    onChangeText={(text) => setTitle(text)}
                    value={title}
                    errorMessage={errorTitle}
                />
                <Input
                    placeholder="Mensaje..."
                    multiline
                    inputStyle={styles.textArea}
                    onChangeText={(text) => setMessage(text)}
                    value={message}
                    errorMessage={errorMessage}
                />
                <Button
                    title="Enviar Mensaje"
                    buttonStyle={styles.btnSend}
                    containerStyle={styles.btnSendContainer}
                    onPress={sendNotification}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: "#fff"
    },
    viewRestaurantTitle: {
        padding: 15
    },
    viewRestaurantContainer: {
        flexDirection: "row"
    },
    descriptionRestaurant: {
        marginTop: 5,
        color: "gray",
        textAlign: "justify"
    },
    rating: {
        position: "absolute",
        right: 0
    },
    viewRestaurantInfo: {
        margin: 15,
        marginTop: 25,
    },
    restaurantInfoTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15
    },
    containerListItem: {
        borderBottomColor: "#a376c7",
        borderBottomWidth: 1
    },
    viewFavorite: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 100,
        padding: 5,
        paddingLeft: 15
    },
    textArea: {
        height: 50,
        paddingHorizontal: 10 
    },
    btnSend : {
        backgroundColor: "#442484"
    },
    btnSendContainer: {
        width: "95%"
    },
    textModal: { 
        color: "#000", 
        fontSize: 16, 
        fontWeight: "bold" 
    },
    modalContainer: {
        justifyContent: "center",
        alignItems: "center"
    }
 })
