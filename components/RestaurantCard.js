import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, removeFavorite } from '../redux/UserReducer';

const RestaurantCard = (props) => {
  const {
    id,
    restaurantimage,
    restaurantname,
    restaurantrating,
    restaurantreviews,
    restaurantaddress,
    restaurantcontact,
    restaurantdescription,
    distance,
  } = props;

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.user.favorites);
  const isFavorite = favorites.includes(id);

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(id));
    } else {
      dispatch(addFavorite(id));
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        navigation.navigate("Restaurant", {
          restaurantId: id,
          restaurantname,
          restaurantaddress,
          restaurantrating,
          restaurantcontact,
          restaurantdescription,
          distance,
        })
      }
    >
      <Image
        source={{
          uri: restaurantimage,
        }}
        style={styles.image}
      />

      {/* like */}
      <Pressable style={styles.likeContainer} onPress={toggleFavorite}>
        <Feather 
          name="heart" 
          size={20} 
          color={isFavorite ? "#FC7D86" : "#ffffff"} 
          style={isFavorite ? styles.filledHeart : styles.outlinedHeart}
        />
      </Pressable>

      {/* rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>{restaurantrating}</Text>
        <FontAwesome name="star" size={10} color="#fff" />
      </View>

      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantDetails}>
          {/* restaurant name */}
          <Text style={styles.restaurantName}>{restaurantname}</Text>
        </View>
        <View style={styles.cuisineDetails}>
          <Text style={styles.cuisine}>{restaurantaddress}</Text>
          <Text style={styles.distance}>{distance ? `${distance.toFixed(1)} km` : 'N/A'}</Text>
        </View>

        {/* hr */}
        <View
          style={{ height: 0.1, backgroundColor: "gray", marginVertical: 10 }}
        />

        {/* total number of reviews */}
        <View style={styles.totalOrder}>
          <View style={styles.trendingIconContainer}>
            <Ionicons name="trending-up" size={9} color="#fff" />
          </View>
          <Text style={styles.orderPlaced}>
            {restaurantreviews} reviews | {restaurantdescription}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default RestaurantCard;

const styles = StyleSheet.create({
  container: {
    width: "93%",
    backgroundColor: "#fff",
    alignSelf: "center",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      height: 5,
      width: 5,
    },
    shadowOpacity: 0.1,
    elevation: 4,
    marginVertical: 13,
  },
  likeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  filledHeart: {
    // No additional styles needed for filled heart
  },
  outlinedHeart: {
    opacity: 0.7,
  },
  image: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#259547",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    position: "absolute",
    top: 190,
    right: 10,
  },
  rating: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    marginRight: 4,
  },
  restaurantInfo: {
    padding: 10,
  },
  restaurantDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  cuisineDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },
  cuisine: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
    color: "#484848",
  },
  bill: {
    fontSize: 11,
    fontWeight: "500",
    color: "#484848",
  },
  totalOrder: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingIconContainer: {
    width: 17,
    height: 17,
    backgroundColor: "#707FBD",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  orderPlaced: {
    fontSize: 9,
    marginLeft: 7,
    color: "#505050",
    fontWeight: "500",
  },
  distance: {
    fontSize: 11,
    fontWeight: '500',
    color: '#484848',
  },
});