import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
        await reverseGeocode(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      reverseGeocode(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);
  

  const reverseGeocode = async (latitude, longitude) => {
    const apiKey = 'AIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4';
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Return updated context value to include address
  return (
    <LocationContext.Provider value={{ userLocation, setUserLocation, address, setAddress, calculateDistance }}>
      {children}
    </LocationContext.Provider>
  );
};