import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabase';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationContext } from '../context/LocationContext';
import { useDispatch } from 'react-redux';
import { addSavedAddress } from '../redux/UserReducer';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const LocationScreen = ({ route, navigation }) => {
  const { editAddress } = route.params || {};
  const { userLocation, setUserLocation } = useContext(LocationContext);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState(editAddress?.address || '');
  const [houseNumber, setHouseNumber] = useState(editAddress?.house_number || '');
  const [floor, setFloor] = useState(editAddress?.floor || '');
  const [howToReach, setHowToReach] = useState(editAddress?.how_to_reach || '');
  const [locationType, setLocationType] = useState(editAddress?.location_type || 'Home');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCurrentLocation();
    const keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    return () => {
      keyboardWillShowSub.remove();
      keyboardWillHideSub.remove();
    };
  }, []);


  const keyboardWillShow = (event) => {
    Animated.timing(slideAnimation, {
      duration: event.duration,
      toValue: -event.endCoordinates.height,
      useNativeDriver: true,
    }).start();
  };


  const keyboardWillHide = (event) => {
    Animated.timing(slideAnimation, {
      duration: event.duration,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
    setLoading(false);
  };


  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setUserLocation({ latitude, longitude });

    // Fetch the address details from Google Maps API
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      setAddress(data.results[0].formatted_address);
    }
  };


  const handleConfirmLocation = () => {
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    if (!address || !houseNumber) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const newAddress = {
        id: editAddress ? editAddress.id : Date.now().toString(),
        address,
        house_number: houseNumber,
        floor,
        how_to_reach: howToReach,
        location_type: locationType,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };

      const { data, error } = await supabase
        .from('users')
        .select('saved_addresses')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      let savedAddresses = data.saved_addresses || [];
      if (!Array.isArray(savedAddresses)) {
        savedAddresses = [];
      }

      if (editAddress) {
        // Update existing address
        const index = savedAddresses.findIndex(addr => addr.id === editAddress.id);
        if (index !== -1) {
          savedAddresses[index] = newAddress;
        }
      } else {
        // Add new address
        if (savedAddresses.length >= 3) {
          Alert.alert('Limit Reached', 'You can only save up to 3 addresses. Please delete an existing address to add a new one.');
          return;
        }
        savedAddresses.push(newAddress);
        dispatch(addSavedAddress(newAddress));
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ saved_addresses: savedAddresses })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert('Success', `Address ${editAddress ? 'updated' : 'saved'} successfully`);
      navigation.navigate('SavedAddresses');
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'There was an issue saving your address. Please try again.');
    }
  };

  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude || 0,
            longitude: userLocation?.longitude || 0,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
          customMapStyle={mapStyle}
        >
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              }}
              description={address || 'Selected Location'}
            >
              <View style={styles.markerContainer}>
                <LinearGradient
                  colors={['#FF6347', '#FF8C00']}
                  style={styles.markerIcon}
                >
                  <Ionicons name="location" size={24} color="#FFF" />
                </LinearGradient>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <Animated.View 
        style={[
          styles.formWrapper,
          { transform: [{ translateY: slideAnimation }] }
        ]}
      >
        {!showAddressForm ? (
          <View style={styles.locationConfirmation}>
            <Text style={styles.locationTitle}>Select your location</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
              <LinearGradient
                colors={['#FF6347', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.addressForm}>
            <Text style={styles.formTitle}>Enter address details</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={24} color="#FF6347" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="home" size={24} color="#FF6347" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="House no. / Flat no / Building"
                value={houseNumber}
                onChangeText={setHouseNumber}
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="layers" size={24} color="#FF6347" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Floor (optional)"
                value={floor}
                onChangeText={setFloor}
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="directions" size={24} color="#FF6347" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="How to reach (optional)"
                value={howToReach}
                onChangeText={setHowToReach}
                placeholderTextColor="#666"
              />
            </View>
            <Text style={styles.tagText}>Tags</Text>
            <View style={styles.tagContainer}>
              {['Home', 'Work', 'Office', 'Other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.tagButton, locationType === type && styles.activeTagButton]}
                  onPress={() => setLocationType(type)}
                >
                  <Text style={[styles.tagButtonText, locationType === type && styles.activeTagButtonText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <LinearGradient
                colors={['#FF6347', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: height * 0.62,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerIcon: {
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF6347',
    transform: [{ rotate: '180deg' }],
  },
  formWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationConfirmation: {
    alignItems: 'center',
  },
  addressForm: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#F3F4F6',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  tagText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  tagButton: {
    borderWidth: 1,
    borderColor: '#FF6347',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  activeTagButton: {
    backgroundColor: '#FF6347',
  },
  tagButtonText: {
    fontSize: 14,
    color: '#FF6347',
  },
  activeTagButtonText: {
    color: '#fff',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 20,
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default LocationScreen;