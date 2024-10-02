import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabase';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationContext } from '../context/LocationContext';

const { height } = Dimensions.get('window');

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

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude || 0,
            longitude: userLocation?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              }}
              description={address || 'Selected Location'}
            />
          )}
        </MapView>
      </View>

      <View style={styles.formWrapper}>
        {!showAddressForm ? (
          <View style={styles.locationConfirmation}>
            <Text style={styles.locationTitle}>Select your location</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressForm}>
            <Text style={styles.formTitle}>Enter address details</Text>
            <TextInput
              style={styles.input}
              placeholder="House no. / Flat no / Building"
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Floor (optional)"
              value={floor}
              onChangeText={setFloor}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="How to reach (optional)"
              value={howToReach}
              onChangeText={setHowToReach}
              placeholderTextColor="#666"
            />
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
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 550,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
    alignItems: 'center',
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'flex-start',
    width: '100%',
  },
  tagButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeTagButton: {
    backgroundColor: '#000',
  },
  tagButtonText: {
    fontSize: 16,
    color: '#000',
  },
  activeTagButtonText: {
    color: '#fff',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationScreen;