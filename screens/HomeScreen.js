import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import DishComponentContainer from "../components/DishComponentContainer";
import RestaurantCard from "../components/RestaurantCard";
import Header from "../components/Header";


const HomeScreen = () => {
  const [restaurantData, setRestaurantData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Fetch restaurant data from Supabase
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("restaurantdata")
        .select("*");
      if (restaurantsError) throw restaurantsError;
      setRestaurantData(restaurantsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={restaurantData}
        renderItem={({ item }) => (
          <RestaurantCard
            id={item.id}
            restaurantimage={item.restaurantimage}
            restaurantname={item.restaurantname}
            restaurantaddress={item.restaurantaddress}
            restaurantcontact={item.restaurantcontact}
            restaurantrating={item.restaurantrating}
            restaurantreviews={item.restaurantreviews}
            restaurantdescription={item.restaurantdescription}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Header />
            <SearchBar />
            <Banner image={require("../assets/images/banner_1.jpg")} />
            <Banner image={require("../assets/images/banner_2.jpg")} />
            <DishComponentContainer categories={categories} />
            <Text style={styles.restaurantCardHeading}>
              {restaurantData.length} restaurants around you
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Platform.OS === "android" ? 50 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantCardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
    marginTop: 12,
    marginBottom: 2,
  },
});

export default HomeScreen;
