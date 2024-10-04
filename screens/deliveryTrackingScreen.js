import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../supabase';
import { useSelector } from 'react-redux';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import { getOrderDetails, getDeliveryPersonLocation } from '../utils/api';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


const DeliveryTrackingScreen = ({ route }) => {
  const { orderId, restaurantName } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryPersonLocation, setDeliveryPersonLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const [orderStatus, setOrderStatus] = useState(1);

  useEffect(() => {
    fetchOrderDetails();
    fetchLocationsAndRoute();
    fetchDeliveryPersonDetails();
    const locationUpdateInterval = setInterval(updateDeliveryPersonLocation, 10000);
  
    return () => clearInterval(locationUpdateInterval);
  }, []);


  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getOrderStatus?orderId=${orderId}`);
        const data = await response.json();
        setOrderStatus(data.status);
      } catch (error) {
        console.error('Error fetching order status:', error);
      }
    };

    fetchOrderStatus();
    const statusInterval = setInterval(fetchOrderStatus, 30000); 

    return () => clearInterval(statusInterval);
  }, [orderId]);

  const fetchLocationsAndRoute = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
  
      const { coords } = await Location.getCurrentPositionAsync({});
      setUserLocation(coords);
  
      const orderResponse = await fetch(`${API_BASE_URL}/order/${orderId}`);
      const orderData = await orderResponse.json();
  
      const restaurantResponse = await fetch(`${API_BASE_URL}/restaurant/${orderData.restaurant_id}`);
      const restaurantData = await restaurantResponse.json();
  
      const restaurantLocation = {
        latitude: restaurantData.latitude,
        longitude: restaurantData.longitude,
      };
  
      await fetchRouteAndTime(coords, restaurantLocation);
      await sendOrderDetailsToDeliveryBoy(orderData.delivery_person_id, coords, restaurantLocation);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations and route:', error);
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const orderData = await getOrderDetails(orderId);
      setRestaurantId(orderData.restaurant_id);
      setDeliveryPersonId(orderData.delivery_person_id);
      // Handle other order details...
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };
  
  const fetchDeliveryPersonDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_persons')
        .select('*')
        .eq('id', route.params.deliveryPersonId)
        .single();

      if (error) throw error;
      setDeliveryPerson(data);
    } catch (error) {
      console.error('Error fetching delivery person details:', error);
    }
  };

  const updateDeliveryPersonLocation = async () => {
    try {
      const { location } = await getDeliveryPersonLocation(deliveryPersonId);
      setDeliveryPersonLocation(location);
    } catch (error) {
      console.error('Error updating delivery person location:', error);
      // Handle error
    }
  };

  const fetchRouteAndTime = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(points);
        setEstimatedTime(route.legs[0].duration.text);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let shift = 0, result = 0;

      do {
        const b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result & 0x20);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        const b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result & 0x20);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }

    return poly;
  };

  const sendOrderDetailsToDeliveryBoy = async (deliveryPersonId, userLocation, restaurantLocation) => {
    try {
      const orderDetails = {
        orderId,
        userLocation,
        restaurantLocation,
        restaurantName,
        userAddress: user.address,
      };

      await axios.post(`${API_BASE_URL}/sendOrderDetails`, {
        deliveryPersonId,
        orderDetails,
      });
    } catch (error) {
      console.error('Error sending order details to delivery boy:', error);
    }
  };

  const handleCall = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/initiateCall`, {
        from: user.phoneNumber,
        to: deliveryPerson.phoneNumber,
      });
      console.log('Call initiated:', response.data);
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const ProgressBar = ({ status }) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressLine} />
        <View style={[styles.progressDot, styles.dotPreparing, status >= 1 && styles.activeDot]}>
          <Text style={styles.progressText}>Preparing Food</Text>
        </View>
        <View style={[styles.progressDot, styles.dotOnTheWay, status >= 2 && styles.activeDot]}>
          <Text style={styles.progressText}>Order is on the way</Text>
        </View>
        <View style={[styles.progressDot, styles.dotDelivered, status === 3 && styles.activeDot]}>
          <Text style={styles.progressText}>Order Delivered</Text>
        </View>
      </View>
    );
  };

  if (loading || !userLocation || !deliveryPersonLocation) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../assets/animate/loading.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
      >
        <Marker coordinate={userLocation} />
        <Marker coordinate={deliveryPersonLocation} />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF6347"
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.addressBar}>
        <Ionicons name="location" size={24} color="#FF6347" />
        <Text style={styles.addressText}>{user.address || 'Address not available'}</Text>
        <Text style={styles.estimatedTime}>{estimatedTime}</Text>
      </View>

      <View style={styles.infoCard}>
        <Image 
          source={{ uri: deliveryPerson?.image || 'https://via.placeholder.com/50' }} 
          style={styles.avatar} 
        />
        <View style={styles.infoText}>
          <Text style={styles.name}>{deliveryPerson?.name || 'Delivery Person'}</Text>
          <Text style={styles.restaurant}>{restaurantName}</Text>
        </View>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color="#FFA500" />
          <Text style={styles.ratingText}>{deliveryPerson?.rating || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={handleCall}
          disabled={!deliveryPerson?.phoneNumber}
        >
          <Text style={styles.buttonText}>
            {deliveryPerson?.phoneNumber ? 'Call' : 'No Phone Number'}
          </Text>
        </TouchableOpacity>
      </View>

      <ProgressBar status={orderStatus} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  addressBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginLeft: 10,
    flex: 1,
  },
  estimatedTime: {
    fontWeight: 'bold',
  },
  infoCard: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  restaurant: {
    color: '#888',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    padding: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  messageButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  progressBarContainer: {
    position: 'absolute',
    left: 20,
    bottom: 100,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressLine: {
    position: 'absolute',
    left: 9,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: '#ddd',
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    backgroundColor: '#FF6347',
  },
  progressText: {
    position: 'absolute',
    left: 30,
    color: '#333',
    fontSize: 12,
  },
  dotPreparing: {
    top: 0,
  },
  dotOnTheWay: {
    top: '50%',
    marginTop: -10,
  },
  dotDelivered: {
    bottom: 0,
  },
});

export default DeliveryTrackingScreen;