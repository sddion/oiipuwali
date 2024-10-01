import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

const Users = () => {
  const [isAccountExpanded, setIsAccountExpanded] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const toggleAccountExpansion = () => {
    setIsAccountExpanded(!isAccountExpanded);
  };

  const handleEditPress = () => {
    navigation.navigate('UserComponent', { userData });
  };

  const handleEditAdress = () => {
    navigation.navigate('SavedAddresses', { savedAddresses: userData.saved_addresses });
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any stored user data or tokens here if needed
      // For example: await AsyncStorage.removeItem('userToken');

      // Navigate to the Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: handleLogout,
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.root}>{userData?.name || 'Name'}</Text>
        <Text style={styles.id}>{userData?.phone || 'Phone Number'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Text style={styles.editText}>EDIT</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={toggleAccountExpansion} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <Ionicons
            name={isAccountExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </View>
        <Text style={styles.sectionSubtitle}>Manage Address & Settings</Text>
      </TouchableOpacity>

      {isAccountExpanded && (
        <View>
          <TouchableOpacity  onPress={handleEditAdress}  style={styles.option}>
            <Ionicons name="home-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Saved Address</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="settings-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Help</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>
        <Text style={styles.sectionSubtitle}>FAQs & Links</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  root: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  id: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  editText: {
    color: 'orange',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutText: {
    fontWeight: 'bold',
  },
});

export default Users;