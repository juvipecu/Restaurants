import React, { useState, useRef, useCallback } from 'react'
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Image, Icon, Button } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native'
import Toast from 'react-native-easy-toast'

import { firebaseApp } from '../utils/firebase'
import firebase from 'firebase/app'
import 'firebase/firestore'

import Loading from '../components/Loading'
import { removeFromFavorite } from '../utils/actions'

const db = firebase.firestore(firebaseApp)

export default function Favorites(props) {
    const { navigation } = props
    const toastRef = useRef()
    const [restaurants, setRestaurants] = useState(null)
    const [userLogged, setUserLogged] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [reloadData, setReloadData] = useState(false)

    firebase.auth().onAuthStateChanged((user) => {
        user ? setUserLogged(true) : setUserLogged(false)
    })

    useFocusEffect(
        useCallback(() => {
            if (userLogged) {
                const idUser = firebase.auth().currentUser.uid
                db.collection("favorites")
                    .where("idUser", "==", idUser)
                    .get()
                    .then((response) => {
                        const idRestaurantsArray = []
                        response.forEach((doc) => {
                            idRestaurantsArray.push(doc.data().idRestaurant)
                        })
                        getDataRestaurant(idRestaurantsArray).then((response) => {
                            const restaurants = []
                            response.forEach((doc) => {
                                const resturant = doc.data()
                                resturant.id = doc.id
                                restaurants.push(resturant)
                            })
                            setRestaurants(restaurants)
                        }) 
                    })
            }
            setReloadData(false)
        }, [userLogged, reloadData])
    )

    const getDataRestaurant = (idRestaurantsArray) => {
        const arrayRestaurants = []
        idRestaurantsArray.forEach((idRestaurant) => {
            const result = db.collection("restaurants").doc(idRestaurant).get()
            arrayRestaurants.push(result)
        })
        return Promise.all(arrayRestaurants)
    }

    if (!userLogged) {
        return <UserNoLogged navigation={navigation}/>
    }

    if (!restaurants) {
        return <Loading isVisible={true} text="Cargando Restaurantes..."/>
    } else if(restaurants?.length === 0) {
        return <NotFoundRestaurants/>
    }

    return (
        <View style={styles.viewBody}>
            {
                restaurants ? (
                    <FlatList
                        data={restaurants}
                        renderItem={(restaurant) => (
                        <Resturant 
                            restaurant={restaurant} 
                            setIsLoading={setIsLoading} 
                            toastRef={toastRef}
                            navigation={navigation}
                            setReloadData={setReloadData}
                        />
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                ) : (
                    <View style={styles.loaderRestaurant}>
                        <ActivityIndicator size="large"/>
                        <Text style={{ textAlign: "center" }}>Cargando Restaurantes..</Text>
                    </View>
                )
            }
            <Toast ref={toastRef} position="center" opacity={0.9}/>
            <Loading text="Eliminando restaurante..." isVisible={isLoading}/>
        </View>
    )
}

function NotFoundRestaurants() {
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Icon type="material-community" name="alert-outline" size={50}/>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Aún no tienes restaurantes favoritos</Text>
        </View>
    )    
}

function UserNoLogged(props) {
    const { navigation } = props

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Icon type="material-community" name="alert-outline" size={50}/>
            <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
                Necesitas estar logueado para ver los favoritos
            </Text>
            <Button 
                title="Ir al Login" 
                containerStyle={{ marginTop: 20, width: "80%"}}
                buttonStyle={{ backgroundColor: "#442484" }}
                onPress={() => navigation.navigate("account", { screen: "login" })}
            />
        </View>
    )
}

function Resturant(props) {
    const { restaurant, setIsLoading, toastRef, navigation, setReloadData } = props
    const { id, name, images } = restaurant.item

    const confirmRemoveFavorite = () => {
        Alert.alert(
            "Eliminar restaurante de favoritos",
            "¿Está seguro de que quieres borrar el restaurante de favoritos?",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Sí",
                    onPress: removeFavorite
                }
            ],
            { cancelable: false }
        )
    }

    const removeFavorite = async () => {
        setIsLoading(true)
        const response = await removeFromFavorite(id)
        if (response.statusResponse) {
            setReloadData(true)
            setIsLoading(false)
            toastRef.current.show("Restaurante eliminado de favoritos.", 3000)
        } else {
            setIsLoading(false)
            toastRef.current.show("Error al eliminar el restaurante de favoritos.", 3000)
        }
    }

    return(
        <View style={styles.restaurant}>
            <TouchableOpacity 
                onPress={() => 
                    navigation.navigate("restaurants", { 
                        screen: "restaurant", 
                        params: { id }
                    }
                )}
            >
                <Image
                    resizeMode="cover"
                    style={styles.image}
                    PlaceholderContent={<ActivityIndicator color="#fff"/>}
                    source={
                        images[0]
                        ? { uri: images[0] }
                        : require("../assets/no-image.png")
                    }
                />
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <Icon
                        type="material-community"
                        name="heart"
                        color="#f00"
                        containerStyle={styles.favorite}
                        onPress={confirmRemoveFavorite}
                        underlayColor="transparent"
                    />
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1,
        backgroundColor: "#f2f2f2"
    }, 
    loaderRestaurant: {
        marginTop: 10,
        marginBottom: 10
    },
    restaurant: {
        margin: 10
    },
    image: {
        width: "100%",
        height: 180
    },
    info: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10,
        paddingTop: 10,
        marginTop: -30,
        backgroundColor: "#fff"
    },
    name: {
        fontWeight: "bold",
        fontSize: 20
    },
    favorite: {
        marginTop: -35,
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 100
    }
})
