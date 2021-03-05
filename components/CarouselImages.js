import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Image } from 'react-native-elements'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { size } from 'lodash'

export default function CarouselImages(props) {
    const { images, height, width, activeSlide, setActiveSlide } = props

    const renderItem = ({ item }) => {
        return <Image 
            style={{ width, height}}
            PlaceholderContent={<ActivityIndicator color="#fff"/>}
            source={{ uri: item }}
        />
    }

    return (
        <View>
            <Carousel
                layout={"default"}
                data={images}
                sliderWidth={width}
                itemWidth={width}
                renderItem={renderItem}
                onSnapToItem={(index) => setActiveSlide(index)}
            />
            <MyPagination data={images} activeslide={activeSlide} />
        </View>
    )
}

function MyPagination(props) {
    const { data, activeslide } = props

    return (
        <Pagination
            dotsLength={size(data)}
            activeDotIndex={activeslide}
            containerStyle={styles.containerPagination}
            dotStyle={styles.dotActive}
            inactiveDotStyle={styles.dotInactive}
            inactiveDotOpacity={0.6}
            inactiveDotScale={0.6}
        />
    )
}
  
const styles = StyleSheet.create({
    containerPagination : {
        backgroundColor: "transparent",
        zIndex: 1,
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
    },
    dotActive : {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginHorizontal: 2,
        backgroundColor: "#442484",
    },
    dotInactive: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginHorizontal: 2,
        backgroundColor: "#fff",
    }
})
