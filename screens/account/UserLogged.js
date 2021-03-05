import React, { useRef, useState, useEffect } from 'react'
import Toast from 'react-native-easy-toast'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'

import Loading from '../../components/Loading'
import InfoUser from '../../components/account/InfoUser'
import AccountOptions from '../../components/account/AccountOptions'
import { closeSession, getCurrentUser } from '../../utils/actions'

export default function UserLogged() {
    const toastRef = useRef()
    const navigation = useNavigation()

    const [loading, setLoading] = useState(false)
    const [loadingText, setLoadingText] = useState("")
    const [user, setUser] = useState(null)
    const [reloadUser, setReloadUser] = useState(false)

    useEffect(() => {
        const currentUser = getCurrentUser()
        setUser(currentUser)
        setReloadUser(false)
    }, [reloadUser])

    return (
        <View style={styles.viewUserInfo}>
            {
                user && (
                    <View>
                        <InfoUser 
                            user={user} 
                            setLoading={setLoading}
                            setLoadingText={setLoadingText}
                        />
                        <AccountOptions 
                            user={user} 
                            toastRef={toastRef}
                            setReloadUser={setReloadUser}
                        />
                    </View>
                )
            }
            <Button
                title="Cerrar Sesión"
                buttonStyle={styles.btnCloseSesion}
                titleStyle={styles.btnCloseSesionTitle}
                onPress={() => {
                    closeSession()
                    navigation.navigate("restaurants")
                }}
            />
            <Toast ref={toastRef} position="center" opacity={0.9}/>
            <Loading isVisible={loading} text={loadingText}/>
        </View>
    )
}

const styles = StyleSheet.create({
    viewUserInfo: {
        minHeight: "100%",
        backgroundColor: "#f9f9f9"
    },
    btnCloseSesion: {
        marginTop: 30,
        borderRadius: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#442484",
        borderBottomWidth: 1,
        borderBottomColor: "#442484",
        paddingVertical: 10
    },
    btnCloseSesionTitle: {
        color: "#442484"
    }
})
