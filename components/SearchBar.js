import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { Feather } from "@expo/vector-icons";
import SearchResults from "./SearchResults";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchPress = () => {
    setIsSearchActive(true);
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleSearchPress}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#E23946" style={styles.searchIcon} />
          <TextInput
            placeholder="Search restaurants..."
            style={styles.input}
            value={searchQuery}
            editable={false}
          />
        </View>
      </TouchableWithoutFeedback>
      <Modal
        visible={isSearchActive}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseSearch}
      >
        <SearchResults 
          initialQuery={searchQuery}
          onClose={handleCloseSearch}
          onChangeText={setSearchQuery}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "93%",
    alignSelf: "center",
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});

export default SearchBar;