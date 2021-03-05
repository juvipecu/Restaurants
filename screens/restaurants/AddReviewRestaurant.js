import React, { useState, useRef } from 'react'
import Toast from 'react-native-easy-toast'
import { StyleSheet, View } from 'react-native'
import { AirbnbRating, Button, Input } from 'react-native-elements'
import { isEmpty } from 'lodash'

import Loading from '../../components/Loading'
import { addRecordWithOutId, getCurrentUser, getRecordById, updateRecord } from '../../utils/actions'

export default function AddReviewRestaurant(props) {
    const { navigation, route} = props
    const { idRestaurant } = route.params

    const toastRef = useRef()

    const [rating, setRating] = useState(null)
    const [title, setTitle] = useState("")
    const [errorTitle, setErrorTitle] = useState(null)
    const [review, setReview] = useState("")
    const [errorReview, setErrorReview] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const addReview = async() => {
        if (!validForm()) {
            return
        }

        setIsLoading(true)
        const user = getCurrentUser()
        const data = {
            idUser: user.uid,
            avatarUser: user.photoURL,
            idRestaurant: idRestaurant,
            title: title,
            review: review,
            rating: rating,
            createAt: new Date()
        }
        const responseAddReview = await addRecordWithOutId("reviews", data)
        if (!responseAddReview.statusResponse) {
            setIsLoading(false)
            toastRef.current.show("Error al enviar el comentario, intenta más tarde.", 3000)
            return
        }

        const responseGetRestaurant = await getRecordById("restaurants", idRestaurant)
        if (!responseGetRestaurant.statusResponse) {
            setIsLoading(false)
            toastRef.current.show("Error al obtener el restaurante, intenta más tarde.", 3000)
            return
        }

        const restaurant = responseGetRestaurant.document
        const ratingTotal = restaurant.ratingTotal + rating
        const quantityVoting = restaurant.quantityVoting + 1
        const ratingResult = ratingTotal / quantityVoting
        const responseUpdateRestaurant = await updateRecord("restaurants", idRestaurant, {
            ratingTotal,
            quantityVoting,
            rating: ratingResult
        })

        setIsLoading(false)
        if (!responseUpdateRestaurant.statusResponse) {
            toastRef.current.show("Error al actualizar el restaurante, intenta más tarde.", 3000)
            return
        }

        navigation.goBack()
    }

    const validForm = () => {
        setErrorTitle(null)
        setErrorReview(null)
        let isValid = true

        if(!rating) {
            toastRef.current.show("Debes darle una puntuación al restaurante.", 3000)
            isValid = false
        }

        if (isEmpty(title)) {
            setErrorTitle("Debes ingresar un titulo a tu puntuación.")
            isValid = false
        }

        if (isEmpty(review)) {
            setErrorReview("Debes ingresar una descripción a tu puntuación.")
            isValid = false
        }

        return isValid
    }

    return (
        <View style={styles.viewBody}>
            <View style={styles.viewRating}>
                <AirbnbRating
                    count={5}
                    reviews={[ "Malo", "Regular", "Normal", "Muy Bueno", "Excelente" ]}
                    defaultRating={0}
                    size={35}
                    onFinishRating={(value) => setRating(value)}
                />
            </View>
            <View style={styles.formReview}>
                <Input
                    placeholder="Título..."
                    containerStyle={styles.input}
                    onChange={(e) => setTitle(e.nativeEvent.text)}
                    errorMessage={errorTitle}
                />
                <Input
                    placeholder="Comentario..."
                    containerStyle={styles.input}
                    multiline={true}
                    style={styles.textArea}
                    onChange={(e) => setReview(e.nativeEvent.text)}
                    errorMessage={errorReview}
                />
                <Button
                    title="Enviar Comentario"
                    containerStyle={styles.btnContainer}
                    buttonStyle={styles.btn}
                    onPress={addReview}
                />
            </View>
            <Toast ref={toastRef} position="center" opacity={0.9}/>
            <Loading isVisible={isLoading} text="Enviando comentario..."/>
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1
    },
    viewRating: {
        height: 110,
        backgroundColor: "#f2f2f2"
    },
    formReview: {
        flex: 1,
        alignItems: "center",
        margin: 10,
        marginTop: 40
    },
    input: {
        marginBottom: 10
    },
    textArea: {
        height: 150,
        width: "100%",
        padding: 0,
        margin: 0
    },
    btnContainer: {
        flex: 1,
        justifyContent: "flex-end",
        marginTop: 20,
        marginBottom: 10,
        width: "95%"
    },
    btn: {
        backgroundColor: "#442484"
    }
})
