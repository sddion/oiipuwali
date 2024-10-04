import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { supabase } from "../supabase";

const RestaurantHead = ({ restaurantId, restaurant, distance }) => {
  const [localRestaurant, setLocalRestaurant] = useState(restaurant);

  useEffect(() => {
    if (!localRestaurant) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurantdata")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (error) throw error;
      setLocalRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
    }
  };

  const formatDistance = (dist) => {
    if (dist === null || dist === undefined) return 'N/A';
    if (dist < 1) {
      // If less than 1 km, show in meters
      return `${Math.round(dist * 1000)} m away`;
    }
    // If 1 km or more, show in km with one decimal place
    return `${dist.toFixed(1)} km away`;
  };

  if (!localRestaurant) {
    return null; // or a loading indicator
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.restaurantDetails}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.restaurantname}</Text>
          <Text style={styles.cuisine}>
            {restaurant.restaurantdescription}
          </Text>
          <View style={styles.locationContainer}>
            <Text style={styles.location}>{restaurant.restaurantaddress}</Text>
            <FontAwesome name="sort-down" size={14} style={styles.rightIcon} />
          </View>
          <View style={styles.timerContainer}>
            <Image
              source={require("../assets/images/time.png")}
              style={styles.timerImage}
            />
            <Text style={styles.duration}>30 min</Text>
            <Text
              style={{ fontSize: 13, paddingHorizontal: 7, color: "lightgray" }}
            >
              |
            </Text>
            <Text style={styles.distance}>{formatDistance(distance)}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingTopContainer}>
            <Text style={styles.rating}>{restaurant.restaurantrating}</Text>
            <FontAwesome
              name="star"
              size={13}
              color="#fff"
              style={{ marginLeft: 3 }}
            />
          </View>
          <View style={styles.reviewsContainer}>
            <Text style={styles.totalReviews}>{restaurant.restaurantreviews}</Text>
            <Text style={styles.reviews}>reviews</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "93%",
    backgroundColor: "#fff",
    borderRadius: 20,
    alignSelf: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  restaurantDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "600",
  },
  cuisine: {
    fontSize: 11,
    marginTop: 3,
    color: "#202020",
    fontWeight: "400",
    textTransform: "capitalize",
  },
  locationContainer: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  location: {
    color: "#606060",
    fontSize: 11,
    fontWeight: "300",
    textTransform: "capitalize",
  },
  rightIcon: {
    marginLeft: 5,
    color: "#E23946",
  },
  timerContainer: {
    flexDirection: "row",
    marginTop: 3,
    alignItems: "center",
  },
  timerImage: {
    width: 13,
    height: 13,
  },
  duration: {
    fontSize: 11,
    marginLeft: 3,
    fontWeight: "500",
  },
  distance: {
    fontSize: 11,
    fontWeight: "500",
  },
  ratingContainer: {
    height: 70,
    width: 65,
    borderRadius: 10,
    borderWidth: 0.2,
    borderColor: "#787878",
  },
  ratingTopContainer: {
    backgroundColor: "#259547",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: "50%",
  },
  rating: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  reviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 3,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  totalReviews: {
    fontSize: 12,
  },
  reviews: {
    fontSize: 9,
    textTransform: "capitalize",
    color: "#606060",
  },
});

export default RestaurantHead;