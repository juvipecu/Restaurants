import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input, Icon, Button } from 'react-native-elements'
import { size } from 'lodash'
import { useNavigation } from '@react-navigation/native'

import { validateEmail } from '../../utils/utils'
import { addRecordWithId, getCurrentUser, getToken, registerUser } from '../../utils/actions'
import Loading from '../Loading'

export default function RegisterForm() {
    const navigation = useNavigation()

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState(defaultFormValues())
    const [errorEmail, setErrorEmail] = useState("")
    const [errorPassword, setErrorPassword] = useState("")
    const [errorConfirm, setErrorConfirm] = useState("")
    const [loading, setLoading] = useState(false)

    const validateData = () => {
        setErrorConfirm("")
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

        if (size(formData.confirm) < 6) {
            setErrorConfirm("Debes ingresar una confirmación de contraseña de al menos 6 carácteres.")
            valid = false
        } 

        if (formData.password !== formData.confirm) {
            setErrorPassword("La contraseña y la confirmación no son iguales.")
            setErrorConfirm("La contraseña y la confirmación no son iguales.")
            valid = false
        }

        return valid
    }

    const onSubmit = async () => {
        if (!validateData()) {
            return
        }

        setLoading(true)
        const result = await registerUser(formData.email, formData.password)
        if (!result.statusResponse) {
            setLoading(false)
            setErrorEmail(result.error)
            return
        }

        const token = await getToken()
        const resultUsers = await addRecordWithId("users", getCurrentUser().uid, { token })
        if (!resultUsers.statusResponse) {
            setLoading(false)
            setErrorEmail(result.error)
            return
        }

        setLoading(false)
        navigation.navigate("account")
    }

    const onChange = (e, type) => {
        setFormData({ ...formData, [type] : e.nativeEvent.text })
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
            <Input
                placeholder="Confirma tu contraseña..."
                containerStyle={styles.inputForm}
                password={true}
                secureTextEntry={!showPassword}
                onChange={(e) => onChange(e, "confirm")}
                defaultValue={formData.confirm}
                errorMessage={errorConfirm}
                rightIcon={
                    <Icon
                        type="material-community"
                        name={ showPassword ? "eye-off-outline": "eye-outline" }
                        iconStyle={styles.icon}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Button
                title="Registrar Nuevo Usuario"
                containerStyle={styles.btnContainerRegister}
                buttonStyle={styles.btnRegister}
                onPress={onSubmit}
            />
            <Loading isVisible={loading} text="Creando cuenta..."/>
        </View>
    )
}

const defaultFormValues = () => {
    return { email: "", password: "", confirm: "" }
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
    btnContainerRegister: {
        marginTop: 20,
        width: "95%",
        alignSelf: "center",
    },
    btnRegister: {
        backgroundColor: "#442484"
    },
    icon: {
        color: "#c1c1c1"
    }
})
