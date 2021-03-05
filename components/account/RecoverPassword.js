import React, { useState } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import { Input, Icon, Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'

import { validateEmail } from '../../utils/utils'
import Loading from '../Loading'
import { sendEmailResetPassword } from '../../utils/actions'

export default function RecoverPassword() {
    const navigation = useNavigation()

    const [email, setEmail] = useState("")
    const [errorEmail, setErrorEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const validateData = () => {
        setErrorEmail("")
        let valid = true

        if (!validateEmail(email)) {
            setErrorEmail("Debes ingresar un email válido.")
            valid = false
        }
        return valid
    }

    const onSubmit = async () => {
        if (!validateData()) {
            return
        }

        setLoading(true)
        const result = await sendEmailResetPassword(email)
        setLoading(false)

        if (!result.statusResponse) {
            Alert.alert(
                "Error", 
                "Este correo no está relacionado a ningún usuario."
            )
            return
        }

        Alert.alert(
            "Confirmación", 
            "Se le ha enviado un email con las instrucciones para recuperar la contraseña."
        )
        
        navigation.navigate("account", { screen: "login" })
    }

    return (
        <View style={styles.formContainer}>
            <Input
                placeholder="Ingresa tu email..."
                containerStyle={styles.inputForm}
                onChange={(e) => setEmail(e.nativeEvent.text)}
                defaultValue={email}
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
            <Button
                title="Recuperar Contraseña"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btnRegister}
                onPress={onSubmit}
            />
            <Loading isVisible={loading} text="Recuperando contraseña..."/>
        </View>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
    }, 
    inputForm: {
        width: "90%"
    },
    btnContainer: {
        marginTop: 20,
        width: "85%",
        alignSelf: "center",
    },
    btnRegister: {
        backgroundColor: "#442484"
    },
    icon: {
        color: "#c1c1c1"
    }
})
