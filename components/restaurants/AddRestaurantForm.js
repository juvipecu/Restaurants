import React, { useState, useEffect } from 'react'
import CountryPicker from 'react-native-country-picker-modal'
import MapView from "react-native-maps"
import uuid from "random-uuid-v4";
import { StyleSheet, View, Alert, Dimensions, ScrollView } from 'react-native'
import { Icon, Avatar, Image, Input, Button } from 'react-native-elements'
import { map, size, filter, isEmpty } from 'lodash'

import Modal from '../Modal'
import { loadImageFromGallery, getCurrentLocation } from '../../utils/utils'
import { uploadImage, addRecordWithOutId, getCurrentUser } from '../../utils/actions'

const widthScreen = Dimensions.get("window").width;

export default function AddRestaurantForm(props) {
    const { toastRef, setLoading, navigation } = props

    const [formData, setFormData] = useState(defaultFormValues())
    const [errorName, setErrorName] = useState(null)
    const [errorAddress, setErrorAddress] = useState(null)
    const [errorPhone, setErrorPhone] = useState(null)
    const [errorDescription, setErrorDescription] = useState(null)
    const [imagesSelected, setImagesSelected] = useState([]);
    const [isVisibleMap, setIsVisibleMap] = useState(false);
    const [locationRestaurant, setLocationRestaurant] = useState(null);
  
    const addRestaurant = async () => {
        if (!validForm()) {
            return
        }

        setLoading(true)
        const responseUploadImages = await uploadImages()
        const restaurant = {
            name: formData.name,
            address: formData.address,
            description: formData.description,
            phone: `${formData.callingCode}${formData.phone}`,
            location: locationRestaurant,
            images: responseUploadImages,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: getCurrentUser().uid,
        }
        const responseAddDoc = await addRecordWithOutId("restaurants", restaurant)
        setLoading(false)

        if (!responseAddDoc.statusResponse) {
            toastRef.current.show("Error al grabar el restaurante, intentelo más tarde", 3000)
            return
        }

        navigation.navigate("restaurants")
    }

    const validForm = () => {
        clearErrors()
        let isValid = true

        if (isEmpty(formData.name)) {
                setErrorName("Debes ingresar un nombre de restaurante.")
                isValid = false
        }

        if (isEmpty(formData.address)) {
            setErrorAddress("Debes ingresar una dirección del restaurante.")
            isValid = false
        }

        if (size(formData.phone) !== 10) {
            setErrorPhone("Debes ingresar un teléfono del restaurante de 10 dígitos.")
            isValid = false
        }

        if (isEmpty(formData.description)) {
            setErrorDescription("Debes ingresar una descripción del restaurante.")
            isValid = false
        }

        if (!locationRestaurant) {
            toastRef.current.show("Tienes que localizar el restaurnate en el mapa.", 3000);
            isValid = false
        } else if(size(imagesSelected) === 0) {
            toastRef.current.show("Tienes que agregar al menos una imagen del restaurante.", 3000);
            isValid = false
        }

        return isValid
    }

    const clearErrors = () => {
        setErrorAddress(null)
        setErrorDescription(null)
        setErrorName(null)
        setErrorPhone(null)
    }

    const uploadImages = async () => {
        const imagesUrl = []

        await Promise.all(
            map(imagesSelected, async(image) => {
                const response = await uploadImage(image, "restaurants", uuid())
                if (response.statusResponse) {
                    imagesUrl.push(response.url)
                }
            })
        )

        return imagesUrl
    }

    return (
        <ScrollView style={styles.viewContainer}>
            <ImageRestaurant imagenRestaurant={imagesSelected[0]} />
            <FormAdd
                formData={formData}
                setFormData={setFormData}
                errorAddress={errorAddress}
                errorDescription={errorDescription}
                errorName={errorName}
                errorPhone={errorPhone}
                setIsVisibleMap={setIsVisibleMap}
                locationRestaurant={locationRestaurant}
            />
            <UploadImage
                toastRef={toastRef}
                imagesSelected={imagesSelected}
                setImagesSelected={setImagesSelected}
            />
            <Button
                title="Crear Restaurante"
                onPress={addRestaurant}
                buttonStyle={styles.btnAddRestaurant}
            />
            <Map
                isVisibleMap={isVisibleMap}
                setIsVisibleMap={setIsVisibleMap}
                setLocationRestaurant={setLocationRestaurant}
                toastRef={toastRef}
            />
        </ScrollView>
    )
}

function FormAdd(props) {
    const { 
        formData, 
        setFormData, 
        errorAddress,
        errorDescription,
        errorName,
        errorPhone,
        setIsVisibleMap, 
        locationRestaurant 
    } = props

    const onChange = (e, type) => {
        setFormData({ ...formData, [type] : e.nativeEvent.text })
    }

    return (
        <View style={styles.viewForm}>
            <Input
                placeholder="Nombre del restaurante..."
                defaultValue={formData.name}
                onChange={(e) => onChange(e, "name")}
                defaultValue={formData.name}
                errorMessage={errorName}
            />
            <Input
                placeholder="Dirección del restaurante..."
                defaultValue={formData.address}
                onChange={(e) => onChange(e, "address")}
                defaultValue={formData.address}
                errorMessage={errorAddress}
                rightIcon={{
                    type: "material-community",
                    name: "google-maps",
                    color: locationRestaurant ? "#442484" : "#c2c2c2",
                    onPress: () => setIsVisibleMap(true),
                }}
            />
            <View style={styles.phonView}>
                <CountryPicker
                    withFlag
                    withCallingCode
                    withFilter
                    withCallingCodeButton
                    containerStyle={styles.countryPicker}
                    countryCode={formData.country}
                    onSelect={(country) => {
                        setFormData({ 
                            ...formData, 
                            "country": country.cca2, 
                            "callingCode": country.callingCode[0] 
                        })
                    }}
                />
                <Input
                    placeholder="WhatsApp del restaurante..."
                    keyboardType="phone-pad"
                    containerStyle={styles.inputPhone}
                    defaultValue={formData.phone}
                    onChange={(e) => onChange(e, "phone")}
                    defaultValue={formData.phone}
                    errorMessage={errorPhone}
                />
            </View>
            <Input
                placeholder="Descripción del restaurante..."
                multiline
                containerStyle={styles.textArea}
                defaultValue={formData.description}
                onChange={(e) => onChange(e, "description")}
                defaultValue={formData.description}
                errorMessage={errorDescription}
            />
        </View>
    )
}

function UploadImage(props) {
    const { toastRef, imagesSelected, setImagesSelected } = props;
  
    const imageSelect = async () => {
        const response = await loadImageFromGallery([4, 3])
        if (!response.status) {
            toastRef.current.show("No has seleccionado ninguna imagen.", 3000)
            return
        }
        setImagesSelected([...imagesSelected, response.image]);
    }

    const removeImage = (image) => {
        Alert.alert(
            "Eliminar Imagen",
            "¿Estas seguro de que quieres eliminar la imagen?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Sí",
                    onPress: () => {
                        setImagesSelected(
                            filter(imagesSelected, (imageUrl) => imageUrl !== image)
                        )
                    },
                },
            ],
            { cancelable: false }
        )
    }

    return (
        <ScrollView
            horizontal 
            style={styles.viewImages}
        >
            {
                size(imagesSelected) < 10 && (
                    <Icon
                        type="material-community"
                        name="camera"
                        color="#7a7a7a"
                        containerStyle={styles.containerIcon}
                        onPress={imageSelect}
                    />
                )
            }
            {
                map(imagesSelected, (imageRestaurant, index) => (
                    <Avatar
                        key={index}
                        style={styles.miniatureStyle}
                        source={{ uri: imageRestaurant }}
                        onPress={() => removeImage(imageRestaurant)}
                    />
                ))
            }
        </ScrollView>
    )
}

function ImageRestaurant(props) {
    const { imagenRestaurant } = props;
  
    return (
        <View style={styles.viewPhoto}>
            <Image
                source={
                    imagenRestaurant
                        ? { uri: imagenRestaurant }
                        : require("../../assets/no-image.png")
                }
                style={{ width: widthScreen, height: 200 }}
            />
        </View>
    )
}
 
function Map(props) {
    const { isVisibleMap, setIsVisibleMap, setLocationRestaurant, toastRef } = props
    const [location, setLocation] = useState(null);

    useEffect(() => {
        (async() => {
            const response = await getCurrentLocation()
            if (response.status) {
                setLocation(response.location)
            }
        })()
    }, [])

    const confirmLocation = () => {
        setLocationRestaurant(location);
        toastRef.current.show("Localizacion guardada correctamente");
        setIsVisibleMap(false);
    }

    return (
        <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
            <View>
                {
                    location && (
                        <MapView
                            style={styles.mapStyle}
                            initialRegion={location}
                            showsUserLocation={true}
                            onRegionChange={(region) => setLocation(region)}
                        >
                            <MapView.Marker
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                                draggable
                            />
                        </MapView>
                    )
                }
                <View style={styles.viewMapBtn}>
                    <Button
                        title="Guardar Ubicacion"
                        containerStyle={styles.viewMapBtnContainerSave}
                        buttonStyle={styles.viewMapBtnSave}
                        onPress={confirmLocation}
                    />
                    <Button
                        title="Cancelar Ubicacion"
                        containerStyle={styles.viewMapBtnContainerCancel}
                        buttonStyle={styles.viewMapBtnCancel}
                        onPress={() => setIsVisibleMap(false)}
                    />
                </View>
            </View>
        </Modal>
    )
}

const defaultFormValues = () => {
    return { 
        name: "", 
        description: "", 
        phone: "", 
        address: "", 
        country: "CO",
        callingCode: "57" 
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        height: "100%"
    },
    viewForm: {
        marginHorizontal: 10
    },
    textArea: {
        height: 100,
        width: "100%",
    },
    phonView: {
        flexDirection: "row",
        justifyContent: "center",
    },
    inputPhone: {
        width: "80%",
    },
    btnAddRestaurant: {
       margin: 20,
       backgroundColor: "#442484"
    },
    viewImages: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: 30,
    },
    containerIcon: {
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        height: 70,
        width: 70,
        backgroundColor: "#e3e3e3",
    },
    miniatureStyle: {
        width: 70,
        height: 70,
        marginRight: 10,
    },
    viewPhoto: {
        alignItems: "center",
        height: 200,
        marginBottom: 20,
    },
    mapStyle: {
        width: "100%",
        height: 550,
    },
    viewMapBtn: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    viewMapBtnContainerCancel: {
        paddingLeft: 5,
    },
    viewMapBtnCancel: {
        backgroundColor: "#a65273",
    },
    viewMapBtnContainerSave: {
        paddingRight: 5,
    },
    viewMapBtnSave: {
        backgroundColor: "#442484",
    },
})
