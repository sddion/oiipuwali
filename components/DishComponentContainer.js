import { StyleSheet, Text, View, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { supabase } from "../supabase";
import DishComponent from "./DishComponent";

const DishComponentContainer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .limit(10);

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryItems', { category });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Eat what makes you happy</Text>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCategoryPress(item)}>
            <DishComponent
              image={item.image}
              dishName={item.name}
            />
          </TouchableOpacity>
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
