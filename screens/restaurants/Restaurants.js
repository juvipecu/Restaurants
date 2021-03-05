import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { useFocusEffect } from "@react-navigation/native"
import { size } from 'lodash'

import Loading from '../../components/Loading'
import ListRestaurants from '../../components/restaurants/ListRestaurants'
import { getCurrentUser } from '../../utils/actions'

import { firebaseApp } from "../../utils/firebase"
import firebase from "firebase/app"
import "firebase/firestore"

const db = firebase.firestore(firebaseApp)

export default function Restaurants(props) {
    const { navigation } = props
    const limitRestaurants = 7;

    const [user, setUser] = useState(null)
    const [restaurants, setRestaurants] = useState([]);
    const [startRestaurant, setStartRestaurant] = useState(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        firebase.auth().onAuthStateChanged((userInfo) => {
            userInfo ? setUser(true) : setUser(false)
        })
    }, [])

    useFocusEffect(
        useCallback(async () => {
            setLoading(true)
            const currentUser = getCurrentUser() 
            currentUser ? setUser(true) : setUser(false)

            const resultRestaurants = [];
            db.collection("restaurants")
                .orderBy("createAt", "desc")
                .limit(limitRestaurants)
                .get()
                .then((response) => {
                    setStartRestaurant(response.docs[response.docs.length - 1])
                    response.forEach((doc) => {
                        const restaurant = doc.data()
                        restaurant.id = doc.id
                        resultRestaurants.push(restaurant)
                    });
                    setRestaurants(resultRestaurants)
                })

            setLoading(false)
        }, [])
    )

    const handleLoadMore = () => {
        if (!startRestaurant) {
            return
        }

        const resultRestaurants = []
        setLoading(true);

        db.collection("restaurants")
            .orderBy("createAt", "desc")
            .startAfter(startRestaurant.data().createAt)
            .limit(limitRestaurants)
            .get()
            .then((response) => {
                if (response.docs.length > 0) {
                    setStartRestaurant(response.docs[response.docs.length - 1])
                } else {
                    setStartRestaurant(null)
                }

                response.forEach((doc) => {
                    const restaurant = doc.data()
                    restaurant.id = doc.id
                    resultRestaurants.push(restaurant)
                });

                setRestaurants([...restaurants, ...resultRestaurants])
            })

        setLoading(false)
    }
        
    if (user === null) {
        return <Loading isVisible={true} text="Cargando..."/>
    }

    return (
        <View style={styles.viewBody}>
            {
                size(restaurants) > 0 ? (
                    <ListRestaurants
                        restaurants={restaurants}
                        navigation={navigation}
                        handleLoadMore={handleLoadMore}
                    />
                ) : (
                    <View style={styles.notFoundView}>
                        <Text style={styles.notFoundText}>No restaurantes configurados.</Text>
                    </View>
                ) 
            }
            {
                user && (
                    <Icon
                        type="material-community"
                        name="plus"
                        color="#442484"
                        reverse
                        containerStyle={styles.btnContainer}
                        onPress={() => navigation.navigate("add-restaurant") }
                    />
                )
            }
            <Loading isVisible={loading} text="Cargando Restaurantes..."/>
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1
    },
    btnContainer: {
        position: "absolute",
        bottom: 10,
        right: 10,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5
    },
    notFoundView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },    
    notFoundText: {
        fontSize: 18,
        fontWeight: "bold"
    }
})
