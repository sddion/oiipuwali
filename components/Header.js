import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LocationContext } from '../context/LocationContext';
import * as Location from 'expo-location';
import { supabase } from '../supabase';
import { LinearGradient } from 'expo-linear-gradient';

const Header = () => {
  const navigation = useNavigation();
  const { userLocation } = useContext(LocationContext);
  const [address, setAddress] = useState('');
  const [userProfileImage, setUserProfileImage] = useState(null);

  useEffect(() => {
    if (userLocation) {
      reverseGeocode(userLocation.latitude, userLocation.longitude);
    }
    fetchUserProfileImage();
  }, [userLocation]);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response.length > 0) {
        const { street, city, region } = response[0];
        const addressParts = [street, city, region].filter(Boolean);
        setAddress(addressParts.length > 0 ? addressParts.join(', ') : '');
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };

  const fetchUserProfileImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('profile_image')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data && data.profile_image) {
          setUserProfileImage(data.profile_image);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile image:', error);
    }
  };

  const navigateToLocationScreen = () => {
    navigation.navigate('LocationScreen');
  };

  return (
    <LinearGradient
      colors={['#FF6347', '#FF8C00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <TouchableOpacity style={styles.locationContainer} onPress={navigateToLocationScreen}>
        <View style={styles.iconContainer}>
          <Ionicons name="location-sharp" size={24} color="#FFF" />
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.locationType}>Your Location</Text>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
            {address || "Fetching address..."}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Users')} style={styles.profileContainer}>
        <Image
          source={
            userProfileImage
              ? { uri: userProfileImage }
              : { uri: "https://cdn.pixabay.com/photo/2013/07/13/10/44/man-157699_960_720.png" }
          }
          style={styles.userImage}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 38,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  addressContainer: {
    flex: 1,
  },
  locationType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  address: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  profileContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 2,
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'cover',
  },
});

export default Header;
