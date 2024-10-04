// components/SearchResults.js
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const SearchResults = ({ initialQuery, onClose, onChangeText }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data: restaurants, error } = await supabase
        .from("restaurantdata")
        .select("id, restaurantname, restaurantimage, restaurantdescription")
        .or(`restaurantname.ilike.%${searchQuery}%,restaurantdescription.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(restaurants);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (item) => {
    navigation.navigate("Restaurant", { restaurantId: item.id });
    onClose();
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Feather name="search" size={20} color="#E23946" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search restaurants..."
          autoFocus
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E23946" style={styles.loader} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleResultPress(item)}
            >
              <Image 
                source={{ uri: item.restaurantimage }} 
                style={styles.restaurantImage} 
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.restaurantname}</Text>
                <Text style={styles.restaurantDescription} numberOfLines={1}>
                  {item.restaurantdescription}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? "No results found" : "Start typing to search"}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    margin: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  loader: {
    marginTop: 20,
  },
});

export default SearchResults;