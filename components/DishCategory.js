import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Dish from "./Dish";
import { MaterialIcons } from "@expo/vector-icons";

const DishCategory = ({
  categoryName,
  dishes,
  setIsDishModalOpen,
  setDishInfo,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.expandContainer} onPress={toggleExpand}>
        <Text style={styles.dishCategory}>
          {categoryName} ({dishes.length})
        </Text>
        <MaterialIcons
          name={isExpanded ? "arrow-drop-up" : "arrow-drop-down"}
          size={30}
          color="black"
        />
      </Pressable>

      {isExpanded &&
        dishes.map((item) => (
          <Dish
            key={item.id}
            id={item.id}
            dishName={item.dishname}
            dishImage={item.dishimage}
            isBestSeller={item.isbestseller}
            rating={item.rating}
            reviews={item.reviews}
            price={item.price}
            about={item.about}
            setIsDishModalOpen={setIsDishModalOpen}
            setDishInfo={setDishInfo}
          />
        ))}
    </View>
  );
};

export default DishCategory;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    marginVertical: 7,
  },
  expandContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  dishCategory: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
    borderLeftWidth: 3,
    borderLeftColor: "#E94657",
    paddingLeft: 13,
  },
});
