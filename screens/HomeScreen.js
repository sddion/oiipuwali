import React, { useEffect, useState, useContext, useRef } from "react";
import {
  FlatList, Platform, SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Dimensions,
} from "react-native";
import { supabase } from "../supabase";
import SearchBar from "../components/SearchBar";
import Banner from "../components/Banner";
import DishComponentContainer from "../components/DishComponentContainer";
import RestaurantCard from "../components/RestaurantCard";
import Header from "../components/Header";
import { LocationContext } from '../context/LocationContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { userLocation, calculateDistance } = useContext(LocationContext);
  const [restaurantData, setRestaurantData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerInterval = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (bannerInterval.current) {
        clearInterval(bannerInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [userLocation]);

  useEffect(() => {
    if (banners.length > 1) {
      bannerInterval.current = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          (prevIndex + 1) % banners.length
        );
      }, 5000); // Change banner every 5 seconds
    }
    return () => {
      if (bannerInterval.current) {
        clearInterval(bannerInterval.current);
      }
    };
  }, [banners]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("restaurantdata")
        .select("*");
      if (restaurantsError) throw restaurantsError;

      if (userLocation) {
        const nearbyRestaurants = restaurantsData
          .map(restaurant => ({
            ...restaurant,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              restaurant.latitude,
              restaurant.longitude
            )
          }))
          .filter(restaurant => restaurant.distance <= 10)
          .sort((a, b) => a.distance - b.distance);
        setRestaurantData(nearbyRestaurants);
      } else {
        setRestaurantData(restaurantsData);
      }

      const { data: bannersData, error: bannersError } = await supabase
        .from("banners")
        .select("*");
      if (bannersError) throw bannersError;
      setBanners(bannersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderBanner = (banner, index) => {
    const imageSource = banner?.image_url ? { uri: banner.image_url } : null;
    return <Banner key={banner?.id || `default-${index}`} image={imageSource} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
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
            distance={item.distance}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Header />
            <View style={styles.content}>
              <View style={styles.searchBarContainer}>
                <SearchBar />
              </View>
              <View style={styles.bannerContainer}>
                {banners.length > 0 ? (
                  renderBanner(banners[currentBannerIndex], currentBannerIndex)
                ) : (
                  renderBanner(null, 0)
                )}
              </View>
              <DishComponentContainer categories={categories} />
              <LinearGradient
                colors={['#FF6347', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.restaurantCountContainer}
              >
                <Text style={styles.restaurantCardHeading}>
                  {restaurantData.length} restaurants around you
                </Text>
              </LinearGradient>
            </View>
          </>
        }
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  content: {
    width: width,
  },
  searchBarContainer: {
    paddingHorizontal: 15,
    paddingTop: 20, // Add some top padding to move the search bar down
    paddingBottom: 10, // Add some bottom padding for spacing
  },
  bannerContainer: {
    width: width,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8f8f8",
  },
  restaurantCountContainer: {
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  restaurantCardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#FFF',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});

export default HomeScreen;