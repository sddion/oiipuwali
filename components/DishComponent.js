import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

const DishComponent = ({ image, dishName }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.dishName}>{dishName}</Text>
    </View>
  );
};

export default DishComponent;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
    marginHorizontal: 4,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 40,
  },
  dishName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#303030",
    marginTop: 12,
    textTransform: "capitalize",
  },
});
