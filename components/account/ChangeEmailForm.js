import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input, Button, Icon } from 'react-native-elements'
import { size } from 'lodash'

import { reauthenticate, updateEmail } from '../../utils/actions'
import { validateEmail } from '../../utils/utils'

export default function ChangeEmailForm(props) {
    const { email, setShowModal, toastRef, setReloadUser } = props

    const [newEmail, setNewEmail] = useState(email)
    const [password, setPassword] = useState(null)
    const [errorEmail, setErrorEmail] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [errorPassword, setErrorPassword] = useState(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        const resultReauthenticate = await reauthenticate(password)
        if (!resultReauthenticate.statusResponse) {
            setLoading(false)        
            setErrorPassword("Contraseña incorrecta.")
            return
        }

        const resultUpdateEmail = await updateEmail(newEmail)
        setLoading(false)        
        if (!resultUpdateEmail.statusResponse) {
            setErrorEmail("No se puede cambiar por este correo. Ya está siendo usado.")
            return
        }

        setReloadUser(true)
        toastRef.current.show("Se ha actualizado el email.", 3000)
        setShowModal(false)
    }

    const validateForm = () => {
        setErrorEmail(null)
        setErrorPassword(null)
        let isValid = true
        
        if(!validateEmail(newEmail)) {
            setErrorEmail("Debes de ingresar un email válido.")
            isValid = false
        }
        
        if(email === newEmail) {
            setErrorEmail("Debes de ingresar un email diferente al anterior.")
            isValid = false
        }

        if(size(password) < 6) {
            setErrorPassword("Debes de ingresar un password de al menos 6 carácteres.")
            isValid = false
        }

        return isValid
    }

    return (
        <View style={styles.view}>
            <Input
                placeholder="Ingresa email..."
                containerStyle={styles.input}
                defaultValue={email}
                keyboardType="email-address"
                rightIcon={{
                    type: "material-community",
                    name: "at",
                    color: "#c2c2c2"
                }}
                onChange={e => setNewEmail(e.nativeEvent.text)}
                errorMessage={errorEmail}
            />
            <Input
                placeholder="Ingresa tu contraseña..."
                containerStyle={styles.input}
                password={true}
                secureTextEntry={!showPassword}
                onChange={e => setPassword(e.nativeEvent.text)}
                defaultValue={password}
                errorMessage={errorPassword}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={ showPassword ? "eye-off-outline": "eye-outline" }
                        iconStyle={{ color: "#c2c2c2" }}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Button
                title="Cambiar Email"
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btn}
                onPress={onSubmit}
                loading={loading}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        alignItems: "center",
        paddingVertical: 10
    },
    input: {
        marginBottom: 10
    },
    btnContainer: {
        width: "95%"
    },
    btn: {
        backgroundColor: "#442484"
    }
})
