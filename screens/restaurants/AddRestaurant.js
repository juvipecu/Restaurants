import React, { useState, useRef } from 'react'
import Toast from 'react-native-easy-toast'
import { StyleSheet, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import Loading from '../../components/Loading'
import AddRestaurantForm from '../../components/restaurants/AddRestaurantForm'

export default function AddRestaurant(props) {
    const { navigation } = props
    const toastRef = useRef()

    const [loading, setLoading] = useState(false)

    return (
        <KeyboardAwareScrollView>
            <AddRestaurantForm 
                toastRef={toastRef} 
                setLoading={setLoading} 
                navigation={navigation}
            />
            <Loading isVisible={loading} text="Creando Restaurante..."/>
            <Toast ref={toastRef} position="center" opacity={0.9}/>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({})
