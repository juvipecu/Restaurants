import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input, Button, Icon } from 'react-native-elements'
import { size } from 'lodash'

import { reauthenticate, updatePassword } from '../../utils/actions'

export default function ChangePasswordForm(props) {
    const { setShowModal, toastRef } = props

    const [newPassword, setNewPassword] = useState(null)
    const [currentPassword, setCurrentPassword] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [errorNewPassword, setErrorNewPassword] = useState(null)
    const [errorCurrentPassword, setErrorCurrentPassword] = useState(null)
    const [errorConfirmPassword, setErrorConfirmPassword] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        const resultReauthenticate = await reauthenticate(currentPassword)
        if (!resultReauthenticate.statusResponse) {
            setLoading(false)        
            setErrorCurrentPassword("Contraseña incorrecta.")
            return
        }

        const resultUpdatePassword = await updatePassword(newPassword)
        setLoading(false)        
        if (!resultUpdatePassword.statusResponse) {
            setErrorNewPassword("Hubo un problema cambiando la contraseña.")
            return
        }

        toastRef.current.show("Se ha actualizado la contraseña.", 3000)
        setShowModal(false)
    }

    const validateForm = () => {
        setErrorCurrentPassword(null)
        setErrorNewPassword(null)
        setErrorConfirmPassword(null)
        let isValid = true
        
        if(size(currentPassword) < 6) {
            setErrorCurrentPassword("Debes de ingresar una contraseña de al menos 6 carácteres.")
            isValid = false
        }

        if(size(newPassword) < 6) {
            setErrorNewPassword("Debes de ingresar una nueva contraseña de al menos 6 carácteres.")
            isValid = false
        }

        if(size(confirmPassword) < 6) {
            setErrorConfirmPassword("Debes de ingresar una confirmación de al menos 6 carácteres.")
            isValid = false
        }

        if(newPassword !== confirmPassword) {
            setErrorNewPassword("La nueva contraseña y la confirmación, no son iguales.")
            setErrorConfirmPassword("La nueva contraseña y la confirmación, no son iguales.")
            isValid = false
        }

        if(newPassword === currentPassword) {
            setErrorNewPassword("Debes ingresar una contraseña diferente a la actual.")
            isValid = false
        }

        return isValid
    }

    return (
        <View style={styles.view}>
            <Input
                placeholder="Ingresa tu contraseña actual..."
                containerStyle={styles.input}
                password={true}
                secureTextEntry={!showPassword}
                onChange={e => setCurrentPassword(e.nativeEvent.text)}
                defaultValue={currentPassword}
                errorMessage={errorCurrentPassword}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={ showPassword ? "eye-off-outline": "eye-outline" }
                        iconStyle={{ color: "#c2c2c2" }}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Input
                placeholder="Ingresa una nueva contraseña..."
                containerStyle={styles.input}
                password={true}
                secureTextEntry={!showPassword}
                onChange={e => setNewPassword(e.nativeEvent.text)}
                defaultValue={newPassword}
                errorMessage={errorNewPassword}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={ showPassword ? "eye-off-outline": "eye-outline" }
                        iconStyle={{ color: "#c2c2c2" }}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Input
                placeholder="Ingresa la confirmación para la nueva contraseña..."
                containerStyle={styles.input}
                password={true}
                secureTextEntry={!showPassword}
                onChange={e => setConfirmPassword(e.nativeEvent.text)}
                defaultValue={confirmPassword}
                errorMessage={errorConfirmPassword}
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
                title="Cambiar Contaseña"
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
