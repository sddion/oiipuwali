
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { cleanCart } from '../redux/CartReducer';
// import { initiateRazorpayPayment } from './RazorpayCheckout';

const calculateDeliveryCost = (distanceInKm) => {
  const baseCost = 10; 
  const additionalCostPerKm = 7.5; 

  if (distanceInKm <= 1) {
    return baseCost;
  } else {
    const additionalDistance = distanceInKm - 1;
    return baseCost + (additionalDistance * additionalCostPerKm);
  }
};

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { subtotal, cookingInstructions, deliveryInstructions, sendCutlery } = { ...route.params, ...useSelector((state) => state.cart) };
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocation] = useState({
    latitude: 12.9716, // Example coordinates
    longitude: 77.5946,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);

      // Calculate distance and delivery cost
      if (location.coords) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          restaurantLocation.latitude,
          restaurantLocation.longitude
        );
        const cost = calculateDeliveryCost(distance);
        setDeliveryCost(cost);
      }
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const total = subtotal + deliveryCost;

  const handlePayment = async (method) => {
    const orderDetails = {
      items: cart,
      cookingInstructions,
      deliveryInstructions,
      sendCutlery,
    };

    if (method === 'razorpay') {
      await initiateRazorpayPayment(total, {
        orderId: 'ORDER_' + Date.now(),
        userEmail: 'user@example.com',
        userPhone: '1234567890',
        userName: 'John Doe',
      });
    } else if (method === 'cod') {
      Alert.alert('Order Placed', 'Your order has been placed successfully. Please pay on delivery.');
      dispatch(cleanCart());
      navigation.navigate('OrderConfirmation');
      return;
    }

    // Send orderDetails to Supabase backend
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderDetails);
      
      if (error) throw error;
      
      // Navigate to order confirmation screen
      navigation.navigate('OrderConfirmation', { orderId: data.id });
    } catch (error) {
      console.error('Error saving order:', error);
      Alert.alert('Error', 'There was an issue processing your order.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {userLocation && (
        <MapView
          provider={PROVIDER_GOOGLE} 
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          />
          <Marker
            coordinate={restaurantLocation}
            title="Restaurant"
            description="Restaurant location"
            pinColor="red"
          />
        </MapView>
      )}

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Fee</Text>
          <Text style={styles.value}>₹{deliveryCost.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => handlePayment('razorpay')}
        >
          <Ionicons name="card-outline" size={24} color="white" />
          <Text style={styles.paymentButtonText}>Pay with Razorpay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentButton, styles.codButton]}
          onPress={() => handlePayment('cod')}
        >
          <Ionicons name="cash-outline" size={24} color="white" />
          <Text style={styles.paymentButtonText}>Cash on Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  map: {
    height: 200,
    marginVertical: 16,
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  paymentOptions: {
    padding: 16,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  codButton: {
    backgroundColor: '#4CAF50',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CheckoutScreen;
