import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, TextInput, View, FlatList, Text, TouchableOpacity } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Search for restaurants
      const { data: restaurants, error: restaurantError } = await supabase
        .from("restaurantdata")
        .select("id, restaurantname, restaurantdescription")
        .or(`restaurantname.ilike.%${searchQuery}%,restaurantdescription.ilike.%${searchQuery}%`)
        .limit(5);

      if (restaurantError) throw restaurantError;

      setSearchResults(restaurants.map(r => ({ ...r, type: 'restaurant' })));
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (item) => {
    navigation.navigate("Restaurant", { restaurantId: item.id });
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Pressable style={styles.search}>
          <Feather name="search" size={20} color="#E23946" />
        </Pressable>
        <TextInput
          placeholder=" Search Restaurants..."
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable style={styles.mic}>
          <FontAwesome name="microphone" size={18} color="#E23946" />
        </Pressable>
      </View>
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleResultPress(item)}
            >
              <Feather
                name="home"
                size={16}
                color="#E23946"
                style={styles.resultIcon}
              />
              <Text style={styles.resultText}>
                {item.restaurantname}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
        />
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    width: "93%",
    alignSelf: "center",
    zIndex: 1,
  },
  searchInputContainer: {
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 0.3,
    borderColor: "gray",
  },
  search: {},
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  mic: {
    borderLeftWidth: 1,
    borderLeftColor: "gray",
    paddingLeft: 13,
    paddingRight: 5,
  },
  resultsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 200,
    borderWidth: 0.3,
    borderColor: "gray",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    fontSize: 14,
    color: "#333",
  },
});
