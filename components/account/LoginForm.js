import React, { useState } from 'react'
import { StyleSheet, View, Platform, Alert } from 'react-native'
import { Input, Icon, Button } from 'react-native-elements'
import { size } from 'lodash'
import { useNavigation } from '@react-navigation/native'
import * as GoogleSignIn from 'expo-google-sign-in'
import * as firebase from 'firebase'

import { validateEmail } from '../../utils/utils'
import { loginWithEmailAndPassword } from '../../utils/actions'
import Loading from '../Loading'

export default function LoginForm() {
    const navigation = useNavigation()

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState(defaultFormValues())
    const [errorEmail, setErrorEmail] = useState("")
    const [errorPassword, setErrorPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const validateData = () => {
        setErrorEmail("")
        setErrorPassword("")
        let valid = true

        if (!validateEmail(formData.email)) {
            setErrorEmail("Debes ingresar un email válido.")
            valid = false
        }

        if (size(formData.password) < 6) {
            setErrorPassword("Debes ingresar una contraseña de al menos 6 carácteres.")
            valid = false
        }

        return valid
    }

    const onSubmit = async () => {
        if (!validateData()) {
            return
        }

        setLoading(true)
        const result = await loginWithEmailAndPassword(formData.email, formData.password)
        setLoading(false)
        if (!result.statusResponse) {
            setErrorEmail(result.error)
            setErrorPassword(result.error)
            return
        }

        navigation.navigate("account")
    }

    const onChange = (e, type) => {
        setFormData({ ...formData, [type] : e.nativeEvent.text })
    }

    async function googleSignInAsync() {
        try {
            await GoogleSignIn.initAsync()
            if (Platform.OS === "android") {
                await GoogleSignIn.askForPlayServicesAsync()
            }
            const { type, user } = await GoogleSignIn.signInAsync()
            if (type === "success") {
                onSignIn(user)
                setLoading(false)
                return true
            } else {
                setLoading(false)
                Alert.alert(JSON.stringify(result))
                return { cancelled: true }
            }
        } catch (error) {
            setLoading(false)
            alert(error.message)
            return { error: true }
        }
    }

    function onSignIn(googleUser) {
        const unsubscribe = firebase
            .auth()
            .onAuthStateChanged(function (firebaseUser) {
                unsubscribe()
                if (!isUserEqual(googleUser, firebaseUser)) {
                    const credential = firebase.auth.GoogleAuthProvider.credential(
                        googleUser.auth.idToken,
                        googleUser.auth.accessToken
                    )
                    setLoading(true);
                    firebase
                        .auth()
                        .signInWithCredential(credential)
                        .then(() => {
                            setLoading(false)
                        })
                        .catch(function (error) {
                            setLoading(false)
                            Alert.alert(error.message)
                        })
                } else {
                    Alert.alert("Usuario ya está logueado")
                }
            });
    }

    function isUserEqual(googleUser, firebaseUser) {
        if (firebaseUser) {
            let providerData = firebaseUser.providerData
            for (let i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    return true
                }
            }
        }
        return false
    }

    return (
        <View style={styles.formContainer}>
            <Input
                placeholder="Ingresa tu email..."
                containerStyle={styles.inputForm}
                onChange={(e) => onChange(e, "email")}
                defaultValue={formData.email}
                errorMessage={errorEmail}
                keyboardType="email-address"
                rightIcon={
                    <Icon
                        type="material-community"
                        name="at"
                        iconStyle={styles.icon}
                    />
                }
            />
            <Input
                placeholder="Ingresa tu contraseña..."
                containerStyle={styles.inputForm}
                password={true}
                secureTextEntry={!showPassword}
                onChange={(e) => onChange(e, "password")}
                defaultValue={formData.password}
                errorMessage={errorPassword}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={ showPassword ? "eye-off-outline": "eye-outline" }
                        iconStyle={styles.icon}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <View style={styles.viewButtons}>
                <Button
                    title="Iniciar Sesión"
                    containerStyle={styles.btnContainer}
                    buttonStyle={styles.btnRegister}
                    onPress={onSubmit}
                />
                <Button
                    buttonStyle={styles.btnGoogle}
                    containerStyle={styles.btnContainer}
                    icon={
                        <Icon
                            name="google"
                            type="material-community"
                            marginRight={10}
                            size={20}
                            color="#FFF"
                        />
                    }
                    title="Iniciar sesión con Google"
                    onPress={googleSignInAsync}
                />
            </View>
            <Loading isVisible={loading} text="Iniciando Sesión..."/>
        </View>
    )
}

const defaultFormValues = () => {
    return { email: "", password: "" }
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30
    }, 
    inputForm: {
        width: "100%"
    },
    btnContainer: {
        marginTop: 10,
        width: "95%",
        alignSelf: "center",
    },
    btnRegister: {
        backgroundColor: "#442484",
    },
    icon: {
        color: "#c1c1c1"
    },
    btnGoogle: {
        backgroundColor: "#EA4335",
    },
    viewButtons: {
        width: "95%"
    }
})
