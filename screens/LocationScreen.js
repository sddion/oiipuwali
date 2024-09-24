import React, { useState, useEffect, useContext } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { Octicons } from "@expo/vector-icons";
import { supabase } from "../supabase";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { LocationContext } from '../context/LocationContext'; 

const GOOGLE_MAPS_API_KEY = 'AAIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4'; 

const LocationScreen = ({ route, navigation }) => {
  const { uid } = route?.params || {};
  const { userLocation, setUserLocation } = useContext(LocationContext); // Get userLocation and setUserLocation from context
  const [locationPermission, setLocationPermission] = useState(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeValid, setPincodeValid] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted' && !userLocation) {
        await getCurrentLocation();
      }
    })();
  }, [userLocation]);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude }); // Update userLocation in context
      await reverseGeocode(latitude, longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to fetch your location. Please enter it manually.");
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        setAddress(result.formatted_address);

        // Extract pincode
        const pincodeComponent = result.address_components.find(
          component => component.types.includes("postal_code")
        );
        if (pincodeComponent) {
          setPincode(pincodeComponent.long_name);
          validatePincode(pincodeComponent.long_name);
        }
      }
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
    }
  };

  const validatePincode = (code) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    const isValid = pincodeRegex.test(code);
    setPincodeValid(isValid);
    return isValid;
  };

  const saveUserDetails = async () => {
    if (!name || !address || !pincode) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (!pincodeValid) {
      Alert.alert("Error", "Please enter a valid 6-digit Indian pincode.");
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .upsert({ 
          user_id: uid, 
          name, 
          address, 
          pincode, 
          landmark,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude
        });

      if (error) throw error;
      
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Error saving user details:", error);
      Alert.alert("Error", "There was an issue saving your details.");
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setUserLocation({ latitude, longitude }); // Update userLocation in context
    await reverseGeocode(latitude, longitude);
  };

  if (locationPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting location permission...</Text>
      </View>
    );
  }

  if (locationPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Location permission is required to use this app.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Octicons name="location" size={24} color="#7C3AED" />
        <Text style={styles.headerText}>Set Your Location</Text>
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
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          />
        </MapView>
      )}

      <View style={styles.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          style={styles.input}
        />
        <GooglePlacesAutocomplete
          placeholder='Search for address'
          onPress={(data, details = null) => {
            setAddress(data.description);
            setUserLocation({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            });
            // Extract pincode from address components
            const pincodeComponent = details.address_components.find(
              component => component.types.includes("postal_code")
            );
            if (pincodeComponent) {
              setPincode(pincodeComponent.long_name);
              validatePincode(pincodeComponent.long_name);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:in',
          }}
          styles={{
            textInputContainer: styles.autocompleteContainer,
            textInput: styles.autocompleteInput,
          }}
        />
        <TextInput
          value={landmark}
          onChangeText={setLandmark}
          placeholder="Landmark (optional)"
          style={styles.input}
        />
        <TextInput
          value={pincode}
          onChangeText={(text) => {
            setPincode(text);
            validatePincode(text);
          }}
          placeholder="Pincode"
          keyboardType="numeric"
          style={[styles.input, !pincodeValid && styles.invalidInput]}
        />
        {!pincodeValid && (
          <Text style={styles.errorText}>Please enter a valid 6-digit Indian pincode</Text>
        )}
        <TouchableOpacity onPress={saveUserDetails} style={styles.button}>
          <Text style={styles.buttonText}>Save Location</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7C3AED",
    marginLeft: 10,
  },
  map: {
    height: 200,
    marginVertical: 10,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#F3F4F6",
  },
  invalidInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  autocompleteContainer: {
    marginBottom: 15,
  },
  autocompleteInput: {
    fontSize: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
});

export default LocationScreen;
