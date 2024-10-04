import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const CategoryItemsScreen = ({ route }) => {
  const { category } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCategoryItems();
  }, []);

  const fetchCategoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          restaurantmenu (
            restaurantid,
            restaurantdata (
              id,
              restaurantname
            )
          )
        `)
        .eq('categoryid', category.id);

      if (error) throw error;
      setItems(data);
    } catch (error) {
      console.error('Error fetching category items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('Restaurant', {
      restaurantId: item.restaurantmenu[0]?.restaurantdata.id,
      selectedDishId: item.dishid
    });
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      restaurant: { 
        id: item.restaurantmenu[0]?.restaurantdata.id,
        name: item.restaurantmenu[0]?.restaurantdata.restaurantname
      },
      item: {
        id: item.dishid,
        dishName: item.dishname,
        price: item.price,
        quantity: 1,
        dishImage: item.dishimage
      }
    }));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <Image source={{ uri: item.dishimage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.dishname}</Text>
        <Text style={styles.restaurantName}>
          {item.restaurantmenu[0]?.restaurantdata.restaurantname}
        </Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
        <Ionicons name="add-circle" size={24} color="#FF6347" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{category.name}</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.dishid.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryItemsScreen;