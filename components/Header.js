import React, { useContext, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LocationContext } from '../context/LocationContext';
import * as Location from 'expo-location';
import { supabase } from '../supabase';

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
    <View style={styles.container}>
      <TouchableOpacity style={styles.locationContainer} onPress={navigateToLocationScreen}>
        <Ionicons name="location-sharp" size={30} color="#E23946" />
        <View>
          <Text style={styles.locationType}>Your Location</Text>
          <Text style={styles.address}>{address || "Fetching address..."}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Users')}>
        <Image
          source={
            userProfileImage
              ? { uri: userProfileImage }
              : { uri: "https://cdn.pixabay.com/photo/2013/07/13/10/44/man-157699_960_720.png" }
          }
          style={styles.userImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '93%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 10,
  },
  locationType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 12,
    fontWeight: '400',
    color: '#505050',
    marginTop: 2,
  },
  userImage: {
    width: 32,
    height: 32,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});

export default Header;
