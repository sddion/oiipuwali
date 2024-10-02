import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { decrementQuantity, incrementQuantity, applyCoupon } from '../redux/CartReducer';
import { fetchLocations, calculateDeliveryCost } from '../utils/deliveryCostCalculator';

const CartScreen = ({ route }) => {
  const navigation = useNavigation();
  const { restaurantName = 'Restaurant' } = route.params || {};
  const cart = useSelector((state) => state.cart.cart);
  const coupon = useSelector((state) => state.cart.coupon);
  const couponDiscount = useSelector((state) => state.cart.couponDiscount);
  const dispatch = useDispatch();
  const [tip, setTip] = useState(0);
  const [suggestions, setSuggestions] = useState('');
  const [sendCutlery, setSendCutlery] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const user = useSelector((state) => state.user);
  const userId = user ? user.id : null;

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const [subtotal, setSubtotal] = useState(calculateSubtotal());

  useEffect(() => {
    setSubtotal(calculateSubtotal());
  }, [cart, calculateSubtotal]);

  useEffect(() => {
    if (userId) {
      fetchLocations(userId, 
        setUserLocation, 
        setRestaurantLocation, 
        setLoading);
    }
  }, [userId]);


  useEffect(() => {
    if (userLocation && restaurantLocation) {
      calculateDeliveryCost(
        userLocation, 
        restaurantLocation,
        setDeliveryCost, 
        setTotal,
        subtotal);
    }
  }, [userLocation, restaurantLocation, subtotal]);

  const platformFee = 6;
  const gstAndCharges = 28.03;
  const discount = "";

  const totalToPay = subtotal + deliveryCost + platformFee + gstAndCharges + tip - discount - (coupon ? couponDiscount : 0);

  const renderCartItem = (item) => (
    <View key={item.dishid} style={styles.cartItem}>
      {item.dishImage && (
        <Image 
          source={{ uri: item.dishImage }} 
          style={styles.dishImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.dishName}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => dispatch(decrementQuantity(item))}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => dispatch(incrementQuantity(item))}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
    </View>
  );

  const handleTipSelection = (amount) => {
    setTip(amount);
  };

  const handleCutleryToggle = () => {
    setSendCutlery(!sendCutlery);
  };

  const handleApplyCoupon = (selectedCoupon) => {
    dispatch(applyCoupon(selectedCoupon));
  };

  const handlePayment = () => {
    navigation.navigate('Checkout', {
      total: totalToPay,
      subtotal,
      deliveryCost,
      discount,
      coupon,
      restaurantName, 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{restaurantName}</Text>
        </View>

        {cart.map(renderCartItem)}

        <TextInput
          style={styles.suggestionInput}
          placeholder="Write Suggestions to restaurants..."
          placeholderTextColor="#888"
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
          <View style={styles.cutleryOptionText}>
            <Text style={styles.cutleryOptionTitle}>
              {sendCutlery ? "Send cutlery with this order" : "Don't send cutlery with this order"}
            </Text>
            <Text style={styles.cutleryOptionSubtitle}>
              Help us reduce plastic waste
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.applyCoupon} onPress={() => navigation.navigate('Coupon', { onCouponSelect: handleApplyCoupon })}>
          <FontAwesome name="ticket" size={20} color="#888" />
          <Text style={styles.applyCouponText}>
            {coupon ? `Applied: ${coupon.code}` : 'APPLY COUPON'}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>

        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>Say thanks with a Tip!</Text>
          <Text style={styles.tipSubtitle}>How it works</Text>
          <Text style={styles.tipDescription}>
            Day & night, our delivery partners bring your favourite meals. Thank them with a tip.
          </Text>
          <View style={styles.tipOptions}>
            {[20, 30, 50].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tipOption,
                  tip === amount && styles.selectedTipOption,
                  amount === 30 && styles.mostTippedOption,
                ]}
                onPress={() => handleTipSelection(amount)}
              >
                <Text style={[
                  styles.tipOptionText,
                  tip === amount && styles.selectedTipOptionText,
                ]}>₹{amount}</Text>
                {amount === 30 && <Text style={styles.mostTippedText}>Most Tipped</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.tipOption} onPress={() => navigation.navigate('CustomTipScreen', { onTipSelect: setTip })}>
              <Text style={styles.tipOptionText}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.billDetails}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>Item Total</Text>
            <Text style={styles.billItemValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billItem}>
            <Text style={styles.billItemText}>Delivery Fee | {deliveryCost} kms</Text>
            <Text style={styles.billItemValue}>₹{deliveryCost.toFixed(2)}</Text>
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
              <Text style={styles.billItemText}>Coupon Discount ({coupon.code})</Text>
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
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <MaterialCommunityIcons name="cash" size={24} color="white" />
          <Text style={styles.payButtonText}>Pay</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    fontSize: 20,
    color: '#FF6347',
    paddingHorizontal: 8,
  },
  quantity: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionInput: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cutleryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  },
  cutleryOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  cutleryOptionTitle: {
    color: '#FF6347',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cutleryOptionSubtitle: {
    color: '#888',
    marginTop: 4,
  },
  applyCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  },
  applyCouponText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  tipSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipSubtitle: {
    color: '#4A90E2',
    marginTop: 4,
  },
  tipDescription: {
    marginTop: 8,
    color: '#888',
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  tipOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    width: '22%',
  },
  selectedTipOption: {
    borderColor: '#FF6347',
    backgroundColor: '#FFF0ED',
  },
  mostTippedOption: {
    borderColor: '#FF6347',
  },
  tipOptionText: {
    fontSize: 16,
  },
  selectedTipOptionText: {
    color: '#FF6347',
  },
  mostTippedText: {
    color: '#FF6347',
    fontSize: 10,
    marginTop: 4,
  },
  billDetails: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

});


export default CartScreen;