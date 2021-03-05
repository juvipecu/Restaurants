import React from 'react'      
import { createStackNavigator } from '@react-navigation/stack'

import Favorites from '../screens/Favorites'

const Tab = createStackNavigator()

export default function FavoritesStack() {
    return (
        <StackNavigator>
            <Stack.Screen
                name="favorites"
                component={Favorites} 
                options={{title: "Favoritos"}}               
            />
        </StackNavigator>        
    )
}
