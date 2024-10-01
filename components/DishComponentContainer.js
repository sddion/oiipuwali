import { StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import DishComponent from "./DishComponent";

const DishComponentContainer = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .limit(10);

      if (error) throw error;
      setDishes(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Eat what makes you happy</Text>
      <FlatList
        data={dishes}
        renderItem={({ item }) => (
          <DishComponent
            image={item.dishimage}
            dishName={item.dishname}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dishesContainer}
      />
    </View>
  );
};

export default DishComponentContainer;

const styles = StyleSheet.create({
  container: {
    width: "93%",
    alignSelf: "center",
    paddingTop: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dishes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
