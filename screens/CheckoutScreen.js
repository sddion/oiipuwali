import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import {  useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { cleanCart } from '../redux/CartReducer';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { fetchLocations, calculateDeliveryCost } from '../utils/deliveryCostCalculator';

const PaymentOption = ({ icon, title, subtitle, onPress, addNew }) => (
  <TouchableOpacity style={styles.paymentOption} onPress={onPress}>
    <View style={styles.iconContainer}>
      {addNew ? (
        <View style={styles.addNewIcon}>
          <Ionicons name="add" size={20} color="white" />
        </View>
      ) : (
        icon
      )}
    </View>
    <View style={styles.paymentTextContainer}>
      <Text style={[styles.paymentTitle, addNew && { color: 'orange' }]}>{title}</Text>
      <Text style={styles.paymentSubtitle}>{subtitle}</Text>
    </View>
    {!addNew && <Ionicons name="chevron-forward" size={20} color="gray" />}
  </TouchableOpacity>
);

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { total, subtotal, deliveryCost, restaurantName } = route.params;
  const [finalTotal, setFinalTotal] = useState(total);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations(setUserLocation, setRestaurantLocation, setLoading);
  }, []);

  useEffect(() => {
    calculateDeliveryCost(userLocation, restaurantLocation, setFinalTotal, subtotal);
  }, [userLocation, restaurantLocation, subtotal]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handlePayment = async (method) => {
    if (method === 'UPI' || method === 'Card' || method === 'Wallet' || method === 'Netbanking') {
      const options = {
        key: 'XUvOXquP4miLxhWsNX1BkwD1',
        amount: finalTotal * 100,
        currency: 'INR',
        name: restaurantName,
        description: 'Food Order Payment',
        handler: function (response) {
          alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
          dispatch(cleanCart());
          navigation.navigate('OrderConfirmation');
          navigation.navigate('DeliveryTracking', {
            orderId: response.razorpay_payment_id, // Use the actual order ID here
            restaurantName: restaurantName,
            deliveryPersonId: orderData.delivery_person_id // You need to get this from the order data
          });
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#F37254'
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } else if (method === 'COD') {
      // Handle Cash on Delivery
      alert('Cash on Delivery selected');
      dispatch(cleanCart());
      navigation.navigate('OrderConfirmation');
    } else if (method === 'Takeaway') {
      // Handle Takeaway
      alert('Takeaway selected');
      dispatch(cleanCart());
      navigation.navigate('OrderConfirmation');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" style={styles.backIcon} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Payment Options</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Subtotal: ₹{subtotal} • Delivery: ₹{deliveryCost} • Total: ₹{finalTotal}</Text>
        </View>

        {userLocation && restaurantLocation && (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker coordinate={userLocation} />
              <Marker
                coordinate={{ latitude: restaurantLocation.latitude, longitude: restaurantLocation.longitude }}
                pinColor="red"
              />
            </MapView>
          </View>
        )}

        <PaymentOption
          icon={<Image source={require('../assets/icon.png')} style={styles.paymentIcon} />}
          title="Pay by any UPI App"
          addNew={true}
          subtitle="You need to have a registered UPI ID"
          onPress={() => handlePayment('UPI')}
        />

        <PaymentOption
          icon={<MaterialIcons name="credit-card" size={32} color="gray" />}
          title="Credit & Debit Cards"
          addNew={true}
          subtitle="Save and Pay via Cards."
          onPress={() => handlePayment('Card')}
        />

        <Text style={styles.moreOptionsTitle}>More Payment Options</Text>

        <PaymentOption
          icon={<FontAwesome name="money" size={32} color="gray" />}
          title="Wallets"
          subtitle="PhonePe, Amazon Pay & more"
          onPress={() => handlePayment('Wallet')}
        />

        <PaymentOption
          icon={<MaterialIcons name="account-balance" size={32} color="gray" />}
          title="Netbanking"
          subtitle="Select from a list of banks"
          onPress={() => handlePayment('Netbanking')}
        />

        <View style={styles.codContainer}>
          <TouchableOpacity style={styles.codButton} onPress={() => handlePayment('COD')}>
            <Text style={styles.codButtonText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.takeawayContainer}>
          <TouchableOpacity style={styles.takeawayButton} onPress={() => handlePayment('Takeaway')}>
            <Text style={styles.takeawayButtonText}>Takeaway</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  summary: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: 'gray',
  },
  mapContainer: {
    height: 160,
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  paymentOption: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  addNewIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'orange',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    color: 'black',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: 'gray',
  },
  moreOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codContainer: {
    marginTop: 16,
  },
  codTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codButton: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  codButtonText: {
    fontSize: 16,
    color: 'black',
  },
  takeawayContainer: {
    marginTop: 16,
  },
  takeawayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  takeawayButton: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  takeawayButtonText: {
    fontSize: 16,
    color: 'black',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 16,
  },
});

export default CheckoutScreen;