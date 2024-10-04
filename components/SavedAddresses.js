import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setSavedAddresses } from '../redux/UserReducer';
import { LinearGradient } from 'expo-linear-gradient';

const AddressItem = ({ address, onEdit, onDelete }) => {
  return (
    <View style={styles.addressItem}>
      <View style={styles.addressInfo}>
        <LinearGradient
          colors={['#FF6347', '#FF8C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.iconContainer}
        >
          <Ionicons 
            name={address.location_type === 'Home' ? 'home' : 'business'} 
            size={24} 
            color="#FFF" 
          />
        </LinearGradient>
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressType}>{address.location_type}</Text>
          <Text style={styles.addressText}>{address.address}</Text>
        </View>
      </View>
      <View style={styles.addressActions}>
        <TouchableOpacity onPress={() => onEdit(address)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={22} color="#FF6347" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(address)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={22} color="#E23946" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SavedAddressesScreen = () => {
  const dispatch = useDispatch();
  const savedAddresses = useSelector(state => state.user.savedAddresses);
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
        const addresses = data.saved_addresses || [];
        dispatch(setSavedAddresses(addresses));
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      Alert.alert('Error', 'Failed to fetch saved addresses');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

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
                dispatch(setSavedAddresses(updatedAddresses));
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF6347', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.title}>Saved Addresses</Text>
      </LinearGradient>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Text style={styles.emptySubtext}>Add a new address to get started</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchSavedAddresses}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
});

export default SavedAddressesScreen;