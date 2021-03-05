import React, { useState, useEffect } from 'react'
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native'
import { SearchBar, ListItem, Icon, Image } from 'react-native-elements'
import { FireSQL } from 'firesql'
import firebase from "firebase/app"
import { isEmpty, size } from 'lodash'

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" })

export default function Search(props) {
    const { navigation } = props
    const [search, setSearch] = useState("")
    const [restaurants, setRestaurants] = useState([])

    useEffect(() => {
        if (isEmpty(search)) {
            setRestaurants([])
        } else {
            fireSQL.query(`SELECT * FROM restaurants WHERE name LIKE '${search}%'`)
                .then((response) => {
                setRestaurants(response)
            })
        }
    }, [search])

    return(
        <View>
            <SearchBar
                placeholder="Busca tu restaurante..."
                onChangeText={(e) => setSearch(e)}
                containerStyle={styles.searchBar}
                value={search}
            />
            { 
                size(restaurants) > 0 ? (
                    <FlatList
                        data={restaurants}
                        renderItem={(restaurant) => 
                            <Restaurant 
                                restaurant={restaurant} 
                                navigation={navigation}
                            />
                        }
                        keyExtractor={(item, index) => index.toString()}
                    />
                ) : (
                    isEmpty(search) ? (
                        <Text style={styles.noFound}>
                            Ingrese como comienze el nombre del restaurante.
                        </Text>
                    ) : (
                        <Text style={styles.noFound}>
                            No hay restaurantes que su nombre comienze con su criterio de búsqueda.
                        </Text>
                    )
                )
            }
        </View>
    )
}

function Restaurant(props) {
    const { restaurant, navigation } = props
    const { id, name, images } = restaurant.item

    return (
        <ListItem 
            style={styles.menuItem}
            onPress={() => navigation.navigate("restaurants", { 
                screen: "restaurant", 
                params: { id, name }
            })}
        >
            <Image
                resizeMode="cover"
                PlaceholderContent={<ActivityIndicator color="fff" />}
                source={
                    images[0]
                        ? { uri: images[0] }
                        : require("../assets/no-image.png")
                }
                style={styles.imageRestaurant}
            />
            <ListItem.Content>
                <ListItem.Title>{name}</ListItem.Title>
            </ListItem.Content>
            <Icon type="material-community" name="chevron-right"/>
        </ListItem>
    )
}

const styles = StyleSheet.create({
    searchBar: {
        marginBottom: 20
    },
    imageRestaurant: {
        width: 90,
        height: 90,
    },
    noFound: {
        alignSelf: "center", 
        width: "90%"    
    }
})