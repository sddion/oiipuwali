import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Feather, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '../redux/CartReducer';

const Dish = (props) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const {
    id,
    dishName,
    dishImage,
    isBestSeller,
    rating,
    reviews,
    price,
    about,
    setIsDishModalOpen,
    setDishInfo,
    restaurantId,
    restaurantName
  } = props;

  const cartItem = cart.find(item => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const openDishModal = () => {
    setIsDishModalOpen(true);
    setDishInfo({
      id,
      dishName,
      dishImage,
      isBestSeller,
      rating,
      reviews,
      price,
      quantity,
    });
  };

  const addItem = () => {
    if (id && dishName && price && dishImage && restaurantId && restaurantName) {
      dispatch(addToCart({
        restaurant: { id: restaurantId, name: restaurantName },
        item: { 
          id, 
          dishName, 
          price: parseFloat(price),
          dishImage,
          quantity: 1
        }
      }));
    } else {
      console.error('Missing required properties for adding to cart', { id, dishName, price, dishImage, restaurantId, restaurantName });
    }
  };

  const deleteItem = () => {
    dispatch(removeFromCart({ id }));
  };

  return (
    <Pressable style={styles.container} onPress={openDishModal}>
      <View style={styles.dishInfo}>
        <View style={styles.veg}>
          <MaterialCommunityIcons
            name="square-rounded"
            size={20}
            color="#259547"
          />
          {isBestSeller && (
            <View style={styles.bestSellerContainer}>
              <Text style={styles.bestSellerText}>bestseller</Text>
            </View>
          )}
        </View>
        <Text style={styles.dishName}>{dishName}</Text>
        <View style={styles.ratingAndReviews}>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((item, index) => (
              <Entypo
                key={index}
                name={item <= rating ? "star" : "star-outlined"}
                size={14}
                color={item <= rating ? "#F5C033" : "lightgray"}
              />
            ))}
          </View>
          <Text style={styles.reviews}>{reviews} reviews</Text>
        </View>
        <Text style={styles.dishPrice}>₹{price}</Text>
        <Text style={styles.aboutDish} numberOfLines={3}>
          {about}
        </Text>
      </View>
      <View style={styles.dishImageContainer}>
        <Image
          source={{ uri: dishImage }}
          style={styles.dishImage}
        />
        {quantity === 0 ? (
          <Pressable style={styles.btnContainer} onPress={addItem}>
            <Text style={styles.btnText}>add</Text>
            <Feather
              name="plus"
              size={13}
              color="#f27e18"
              style={{ position: "absolute", right: 3, top: 3 }}
            />
          </Pressable>
        ) : (
          <View style={styles.quantityContainer}>
            <Pressable style={styles.quantityBtn} onPress={deleteItem}>
              <Entypo name="minus" size={16} color="#fff" />
            </Pressable>
            <Text style={styles.quantity}>{quantity}</Text>
            <Pressable style={styles.quantityBtn} onPress={addItem}>
              <Entypo name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default Dish;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
    borderStyle: "dashed",
  },
  dishInfo: {
    width: "60%",
  },
  veg: {
    flexDirection: "row",
    alignItems: "center",
  },
  bestSellerContainer: {
    backgroundColor: "#E96938",
    alignItems: "center",
    justifyContent: "center",
    height: 15,
    width: 50,
    borderRadius: 5,
    marginLeft: 4,
  },
  bestSellerText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  dishName: {
    fontSize: 15,
    fontWeight: "500",
    textTransform: "capitalize",
    marginTop: 5,
  },
  ratingAndReviews: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    backgroundColor: "#FEFAEC",
    borderRadius: 5,
    padding: 2,
  },
  reviews: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: "400",
  },
  dishPrice: {
    fontSize: 12,
    marginTop: 10,
    fontWeight: "500",
  },
  aboutDish: {
    fontSize: 11,
    fontWeight: "400",
    color: "gray",
    marginTop: 10,
    paddingRight: 17,
  },
  dishImageContainer: {
    width: "40%",
  },
  dishImage: {
    width: 145,
    height: 145,
    borderRadius: 20,
    resizeMode: "cover",
  },
  btnContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF6F7",
    justifyContent: "center",
    paddingVertical: 8,
    width: 115,
    position: "absolute",
    bottom: -6,
    left: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f27e18",
  },
  btnText: {
    color: "#f27e18",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 17,
    textAlign: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292725",
    width: 115,
    borderRadius: 8,
    justifyContent: "space-between",
    position: "absolute",
    bottom: -6,
    left: 15,
  },
  quantityBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  quantity: {
    color: "#f27e18",
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 10,
  },
});
