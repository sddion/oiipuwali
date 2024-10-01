import {
  FlatList, SafeAreaView, ActivityIndicator, StyleSheet, View, Text, Pressable, Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  MaterialCommunityIcons, MaterialIcons, AntDesign, Entypo,
} from "@expo/vector-icons";
import { supabase } from '../supabase';
import RestaurantHead from "../components/RestaurantHead";
import DishCategory from "../components/DishCategory";
import MenuSearch from "../components/MenuSearch";
import DishInfo from "../components/DishInfo";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../redux/CartReducer';



// DishInfo modal buttons
const AddItemBtns = (props) => {
  const dispatch = useDispatch();
  const {
    id,
    price,
    closeDishInfo,
  } = props;
  const [thisQuantity, setThisQuantity] = useState(1);

  const addToOrder = () => {
    dispatch(addToCart({ 
      id, 
      price, 
      quantity: thisQuantity, 
      dishName: state.dishInfo.dishName, 
      dishImage: state.dishInfo.dishImage 
    }));
    closeDishInfo();
  };

  const addFoodItem = () => {
    if (thisQuantity >= 10) return;
    setThisQuantity((prev) => prev + 1);
  };

  const deleteFoodItem = () => {
    if (thisQuantity <= 1) return;
    setThisQuantity((prev) => prev - 1);
  };

  return (
    <Pressable style={styles.addItemBtnContainer}>
      <View style={styles.quantityContainer}>
        {/* add */}
        <Pressable style={styles.quantityBtn} onPress={deleteFoodItem}>
          <Entypo name="minus" size={18} color="#E23946" />
        </Pressable>
        {/* quantity */}
        <Text style={styles.quantity}>{thisQuantity}</Text>
        {/* remove */}
        <Pressable style={styles.quantityBtn} onPress={addFoodItem}>
          <Entypo name="plus" size={18} color="#E23946" />
        </Pressable>
      </View>

      {/* price calc */}
      <Pressable style={styles.priceBtn} onPress={addToOrder}>
        <Text style={styles.priceBtnText}>
          Add item ₹{price * thisQuantity}
        </Text>
      </Pressable>
    </Pressable>
  );
};

// bill component
const ShowTotalBillAmount = ({ totalOrderItems, totalOrderAmount, navigation, restaurantName, cartItems }) => {
  return (
    <View
      style={{
        width: "100%",
        marginTop: "auto",
        backgroundColor: "#fff",
        padding: 15,
      }}
    >
      <Pressable style={styles.totalBillContainer}>
        <View style={styles.totalAmountContainer}>
          {/* total items */}
          <Text style={styles.totalItems}>
            {totalOrderItems} {totalOrderItems === 1 ? "item" : "items"}
          </Text>
          {/* total amount */}
          <Text style={styles.totalAmount}>
            ₹{totalOrderAmount} <Text style={{ fontSize: 9 }}>plus taxes</Text>
          </Text>
        </View>
        {/* next */}
        <Pressable 
          onPress={() => navigation.navigate('Cart', { 
            restaurantName: restaurantName,
            cartItems: cartItems
          })}
        >
          <View style={styles.nextContainer}>
            <Text style={styles.nextText}>next</Text>
            <MaterialIcons name="arrow-right" size={24} color="#fff" />
          </View>
        </Pressable>
      </Pressable>
    </View>
  );
};

const RestaurantScreen = ({ route, navigation }) => {
  const cart = useSelector((state) => state.cart.cart);
  const { restaurantId } = route.params || {};
  const [state, setState] = useState({
    restaurant: null,
    isDishModalOpen: false,
    dishInfo: {},
    totalOrderItems: 0,
    totalOrderAmount: 0,
    restaurantMenu: [],
    categories: [],
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setState(prev => ({ ...prev, error: 'Restaurant ID is undefined' }));
        setLoading(false);
        return;
      }

      try {
        const [restaurantResponse, categoriesResponse, menuResponse] = await Promise.all([
          supabase.from('restaurantdata').select('*').eq('id', restaurantId).single(),
          supabase.from("categories").select("*"),
          supabase.from("restaurantmenu").select(`*, dishes(*)`)
        ]);

        if (restaurantResponse.error) throw restaurantResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;
        if (menuResponse.error) throw menuResponse.error;

        const groupedMenu = categoriesResponse.data.map(category => ({
          ...category,
          dishes: menuResponse.data
            .filter(item => item.categoryid === category.id)
            .map(item => item.dishes)
            .flat()
        }));

        setState(prev => ({
          ...prev,
          restaurant: restaurantResponse.data,
          categories: categoriesResponse.data,
          restaurantMenu: groupedMenu
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        setState(prev => ({ ...prev, error: 'Error fetching data' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={{ width: 50 }}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </Pressable>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MenuSearch />
          <Pressable
            style={{
              backgroundColor: "#fff",
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              marginLeft: 10,
              borderWidth: 0.1,
              borderColor: "gray",
            }}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color="black"
            />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const closeDishInfo = () => {
    setState(prev => ({ ...prev, isDishModalOpen: false }));
  };

  const totalOrderItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalOrderAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{state.error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { opacity: state.isDishModalOpen ? 0.2 : 1 }]}>
      <FlatList
        data={state.restaurantMenu}
        renderItem={({ item }) => (
          <DishCategory
            key={item.id}
            categoryName={item.categoryname}
            dishes={item.dishes}
            setIsDishModalOpen={(value) => setState(prev => ({ ...prev, isDishModalOpen: value }))}
            setDishInfo={(info) => setState(prev => ({ ...prev, dishInfo: info }))}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <RestaurantHead
            restaurantId={restaurantId}
            restaurant={state.restaurant}
            cuisines={state.restaurant.cuisines}
            duration={state.restaurant.duration}
            distance={state.restaurant.distance}
            rating={state.restaurant.rating}
          />
        }
      />
      <Modal
        visible={state.isDishModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDishInfo}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable style={styles.closeBtn} onPress={closeDishInfo}>
            <AntDesign name="close" size={20} color="#fff" />
          </Pressable>
          <View style={styles.dishModal}>
            <DishInfo
              dishName={state.dishInfo.dishName}
              dishImage={state.dishInfo.dishImage}
              isBestSeller={state.dishInfo.isBestSeller}
              rating={state.dishInfo.rating}
              reviews={state.dishInfo.reviews}
            />
            <AddItemBtns
              id={state.dishInfo.id}
              price={state.dishInfo.price}
              quantity={state.dishInfo.quantity}
              closeDishInfo={closeDishInfo}
              dishName={state.dishInfo.dishName}
              dishImage={state.dishInfo.dishImage}
            />
          </View>
        </View>
      </Modal>
       
      {totalOrderItems > 0 && (
        <ShowTotalBillAmount
          totalOrderItems={totalOrderItems}
          totalOrderAmount={totalOrderAmount}
          navigation={navigation}
          restaurantName={state.restaurant ? state.restaurant.restaurantname : 'Restaurant'}
          cartItems={cart}
        />
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },
  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
    width: 40,
    height: 40,
    borderRadius: 25,
    alignSelf: "center",
  },
  dishModal: {
    backgroundColor: "#F4F6FB",
    height: 500,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  addItemBtnContainer: {
    backgroundColor: "#fff",
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF6F7",
    width: "30%",
    borderRadius: 10,
    justifyContent: "space-between",
    borderWidth: 0.5,
    borderColor: "#E23946",
  },
  quantityBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 15,
  },
  quantity: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  priceBtn: {
    width: "65%",
    backgroundColor: "#E23946",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  priceBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  menuCategoryName: {
    flex: 1,
    fontSize: 15,
    color: "#585858",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  menuCategoryPrice: {
    fontSize: 15,
    color: "#585858",
    fontWeight: "500",
  },
  // total bill amount styles
  totalBillContainer: {
    backgroundColor: "#E23946",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalAmountContainer: {
    flex: 1,
  },
  totalItems: {
    color: "#fff",
    fontSize: 10,
    textTransform: "uppercase",
  },
  totalAmount: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 7,
  },
  nextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 15,
    textTransform: "capitalize",
    fontWeight: "500",
  },
});


export default RestaurantScreen;