import React from 'react'      
import { createStackNavigator } from '@react-navigation/stack'

import TopRestaurants from '../screens/TopRestaurants'

const Tab = createStackNavigator()

export default function TopRestaurantsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="top-restaurants"
                component={TopRestaurants} 
                options={{title: "Top 5"}}               
            />
        </Stack.Navigator>
    )
}
