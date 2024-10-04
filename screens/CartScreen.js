import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { decrementQuantity, incrementQuantity, applyCoupon, removeCoupon } from '../redux/CartReducer';
import { calculateDeliveryCost } from '../utils/deliveryCost';
import { calculateDistance } from '../utils/distance';
import { LinearGradient } from 'expo-linear-gradient';


const CartScreen = ({ route }) => {
  const navigation = useNavigation();
  const { restaurantName = 'Restaurant', restaurantId, deliveryCost: initialDeliveryCost } = route.params || {};
  const cart = useSelector((state) => state.cart.cart);
  const coupon = useSelector((state) => state.cart.coupon);
  const couponDiscount = useSelector((state) => state.cart.couponDiscount);
  const couponError = useSelector((state) => state.cart.couponError);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [sendCutlery, setSendCutlery] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(initialDeliveryCost || 0);
  const [subtotal, setSubtotal] = useState(0);
  const [distance, setDistance] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);


  useEffect(() => {
    const newSubtotal = calculateSubtotal();
    setSubtotal(newSubtotal);
  }, [cart, calculateSubtotal]);

  useEffect(() => {
    const getLocationsAndDeliveryCost = async () => {
      if (user.id && restaurantId) {
        try {
          console.log('Fetching locations...');

          const locationsData = await fetchLocations(user.id, restaurantId);
          console.log('Locations data:', locationsData);

          setUserLocation(locationsData.userLocation);
          setRestaurantLocation(locationsData.restaurantLocation);

          // Calculate distance
          const calculatedDistance = calculateDistance(
            locationsData.userLocation,
            locationsData.restaurantLocation
          );
          setDistance(calculatedDistance);

          // Use the initial delivery cost if available, otherwise calculate
          const cost = initialDeliveryCost || calculateDeliveryCost(calculatedDistance);
          setDeliveryCost(cost);

          console.log('Delivery cost:', cost);
          console.log('Distance:', calculatedDistance);
        } catch (error) {
          console.error('Error fetching locations:', error);
          setDeliveryCost(initialDeliveryCost || 0);
          setDistance(0);
        }
      }
    };

    getLocationsAndDeliveryCost();
  }, [user.id, restaurantId, initialDeliveryCost]);


  const platformFee = 6;
  const gstAndCharges = 28.03;
  const discount = "";

  const totalToPay = subtotal + deliveryCost + platformFee + gstAndCharges + tip - discount - (coupon ? couponDiscount : 0);

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.dishImage }} style={styles.dishImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.dishName}</Text>
        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(decrementQuantity(item))}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(incrementQuantity(item))}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleTipSelection = (amount) => {
    if (amount === 'custom') {
      setTip(parseFloat(customTip) || 0);
    } else {
      setTip(amount);
      setCustomTip('');
    }
  };

  const handleCustomTipChange = (value) => {
    setCustomTip(value);
    if (value) {
      setTip(parseFloat(value) || 0);
    } else {
      setTip(0);
    }
  };

  const handleCutleryToggle = () => {
    setSendCutlery(!sendCutlery);
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      dispatch(applyCoupon(couponCode.trim()));
      if (!couponError) {
        setIsCouponExpanded(false);
      }
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode('');
  };

  const handleCheckout = () => {
    if (!cart.length) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    console.log('Navigating to Checkout screen');
    navigation.navigate('Checkout', {
      total: totalToPay,
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      cart: cart,
      deliveryCost: deliveryCost,
      userAddress: user.address
    });
  };

  const tipOptions = [20, 30, 50];

  const renderTipOption = (amount) => (
    <TouchableOpacity
      key={`tip-${amount}`}
      style={[styles.tipOption, tip === amount && styles.selectedTipOption]}
      onPress={() => handleTipSelection(amount)}
    >
      <Text style={[styles.tipOptionText, tip === amount && styles.selectedTipOptionText]}>₹{amount}</Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#FF6347', '#FF8C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{restaurantName}</Text>
        </LinearGradient>

        <View style={styles.cartItemsContainer}>
          {cart.map((item) => renderCartItem(item))}
        </View>

        <TextInput
          style={styles.suggestionInput}
          placeholder="Write suggestions to restaurant..."
          value={suggestions}
          onChangeText={setSuggestions}
          multiline
        />

        <TouchableOpacity style={styles.cutleryOption} onPress={handleCutleryToggle}>
          <MaterialIcons
            name={sendCutlery ? "check-box" : "check-box-outline-blank"}
            size={24}
            color="#FF6347"
          />
          <Text style={styles.cutleryOptionTitle}>
            {sendCutlery ? "Send cutlery" : "Don't send cutlery"}
          </Text>
        </TouchableOpacity>

        <View style={styles.couponSection}>
          <TouchableOpacity
            style={styles.couponHeader}
            onPress={() => setIsCouponExpanded(!isCouponExpanded)}
          >
            <FontAwesome name="ticket" size={20} color="#FF6347" />
            <Text style={styles.couponHeaderText}>
              {coupon ? `Applied: ${coupon}` : 'APPLY COUPON'}
            </Text>
            <Ionicons
              name={isCouponExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#FF6347"
            />
          </TouchableOpacity>
          {isCouponExpanded && (
            <View style={styles.couponExpanded}>
              <TextInput
                style={styles.couponInput}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter coupon code"
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.applyCouponButton}
                onPress={handleApplyCoupon}
              >
                <Text style={styles.applyCouponButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
          {couponError && (
            <Text style={styles.couponErrorText}>{couponError}</Text>
          )}
          {coupon && (
            <TouchableOpacity
              style={styles.removeCouponButton}
              onPress={handleRemoveCoupon}
            >
              <Text style={styles.removeCouponButtonText}>Remove Coupon</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>Tip your delivery partner</Text>
          <View style={styles.tipOptionsContainer}>
            {tipOptions.map(renderTipOption)}
            <TextInput
              style={[styles.tipOption, styles.customTipInput]}
              placeholder="Custom"
              keyboardType="numeric"
              value={customTip}
              onChangeText={handleCustomTipChange}
            />
          </View>
        </View>

        <View style={styles.billDetails}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>Item Total</Text>
            <Text style={styles.billItemValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>
              Delivery Fee {distance > 0 ? `| ${distance.toFixed(2)} km` : ''}
            </Text>
            <Text style={styles.billItemValue}>
              {deliveryCost > 0 ? `₹${deliveryCost.toFixed(2)}` : ''}
            </Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>Platform fee</Text>
            <Text style={styles.billItemValue}>₹{platformFee.toFixed(2)}</Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>GST and Restaurant Charges</Text>
            <Text style={styles.billItemValue}>₹{gstAndCharges.toFixed(2)}</Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>Delivery Tip</Text>
            <Text style={styles.billItemValue}>₹{tip.toFixed(2)}</Text>
          </View>
          {coupon && (
            <View style={styles.billItem}>
              <Text style={styles.billItemText}>Discount ({coupon.code})</Text>
              <Text style={[styles.billItemValue, styles.discountText]}>-₹{couponDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.billItem, styles.totalItem]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalValue}>₹{totalToPay.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>To Pay</Text>
          <Text style={styles.totalAmount}>₹{totalToPay.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payButtonGradient}
          >
            <MaterialCommunityIcons name="cash" size={24} color="white" />
            <Text style={styles.payButtonText}>Pay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  cartItemsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF6347',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: '#FF6347',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 14,
    paddingHorizontal: 10,
  },
  suggestionInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    margin: 10,
    fontSize: 14,
  },
  cutleryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  cutleryOptionTitle: {
    marginLeft: 10,
    fontSize: 14,
  },
  couponSection: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponHeaderText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  couponExpanded: {
    flexDirection: 'row',
    marginTop: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 10,
  },
  applyCouponButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
  },
  applyCouponButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeCouponButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
  },
  removeCouponButtonText: {
    color: '#FF6347',
  },
  tipSection: {
    backgroundColor: 'white',
    padding: 12,
    margin: 10,
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tipOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedTipOption: {
    borderColor: '#FF6347',
    backgroundColor: '#FFF0ED',
  },
  tipOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTipOptionText: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  customTipInput: {
    textAlign: 'center',
    fontSize: 14,
  },
  billDetails: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billItemText: {
    fontSize: 14,
    color: '#333',
  },
  billItemValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  footer: {
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  payButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  couponErrorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CartScreen;