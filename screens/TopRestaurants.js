import React, { useState, useCallback } from 'react'
import { View  } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { firebaseApp } from '../utils/firebase'
import firebase from 'firebase/app'
import 'firebase/firestore'

import ListTopRestaurants from '../components/ranking/ListTopRestaurants'

const db = firebase.firestore(firebaseApp)

export default function TopRestaurants(props) {
    const { navigation } = props
    const [restaurants, setRestaurants] = useState([])

    useFocusEffect (
        useCallback(() => {
            db.collection("restaurants")
            .orderBy("rating", "desc")
            .limit(5)
            .get()
            .then((response) => {
                const restaurantArray = []
                response.forEach((doc) => {
                    const data = doc.data()
                    data.id = doc.id
                    restaurantArray.push(data)
                })
                setRestaurants(restaurantArray)
            })
        }, [])
    )

    return (
        <View>
            <ListTopRestaurants 
                restaurants={restaurants} 
                navigation={navigation}
            />
        </View>
    )
}