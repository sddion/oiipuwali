import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const AddressItem = ({ address, onEdit, onDelete }) => {
  return (
    <View style={styles.addressItem}>
      <View style={styles.addressInfo}>
        <Ionicons name={address.location_type === 'Home' ? 'home-outline' : 'business-outline'} size={24} color="#000" />
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressType}>{address.location_type}</Text>
          <Text style={styles.addressText}>{address.address}</Text>
        </View>
      </View>
      <View style={styles.addressActions}>
        <TouchableOpacity onPress={() => onEdit(address)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(address)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#f00" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SavedAddressesScreen = () => {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const fetchSavedAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('saved_addresses')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setSavedAddresses(data.saved_addresses || []);
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      Alert.alert('Error', 'Failed to fetch saved addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedAddresses();
    }, [fetchSavedAddresses])
  );

  const handleEditAddress = (address) => {
    navigation.navigate('LocationScreen', { editAddress: address });
  };

  const handleDeleteAddress = async (addressToDelete) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressToDelete.id);
                const { error } = await supabase
                  .from('users')
                  .update({ saved_addresses: updatedAddresses })
                  .eq('id', user.id);

                if (error) throw error;
                setSavedAddresses(updatedAddresses);
                Alert.alert('Success', 'Address deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddNewAddress = () => {
    if (savedAddresses.length >= 3) {
      Alert.alert('Limit Reached', 'You can only save up to 3 addresses. Please delete an existing address to add a new one.');
    } else {
      navigation.navigate('LocationScreen');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedAddresses}
        renderItem={({ item }) => (
          <AddressItem
            address={item}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.title}>Saved Addresses</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No saved addresses. Add a new address to get started.</Text>
        }
        refreshing={isLoading}
        onRefresh={fetchSavedAddresses}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SavedAddressesScreen;