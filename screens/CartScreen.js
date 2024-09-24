import React, { useEffect, useState } from 'react';
import {
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Modal,
  TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather, Entypo, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { decrementQuantity, incrementQuantity, removeFromCart, updateOrderInstructions } from '../redux/CartReducer';

const CartScreen = () => {
  const navigation = useNavigation();
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const [subtotal, setSubtotal] = useState(0);
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [sendCutlery, setSendCutlery] = useState(true);

  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(newSubtotal);
  }, [cart]);

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => dispatch(decrementQuantity(item))}>
            <Ionicons name="remove-circle-outline" size={24} color="#FF9800" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => dispatch(incrementQuantity(item))}>
            <Ionicons name="add-circle-outline" size={24} color="#FF9800" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => dispatch(removeFromCart(item))} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const handleAddMoreItems = () => {
    navigation.navigate('Menu');
  };

  const handleCookingInstructions = () => {
    setModalType('cooking');
    setIsModalVisible(true);
  };

  const handleDeliveryInstructions = () => {
    setModalType('delivery');
    setIsModalVisible(true);
  };

  const handleToggleCutlery = () => {
    setSendCutlery(!sendCutlery);
  };

  const handleSaveInstructions = () => {
    if (modalType === 'cooking') {
      dispatch(updateOrderInstructions({ cookingInstructions }));
    } else if (modalType === 'delivery') {
      dispatch(updateOrderInstructions({ deliveryInstructions }));
    }
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View cart</Text>
      </View>
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
      />
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={handleAddMoreItems}>
          <View style={styles.optionContent}>
            <Feather name="plus-circle" size={24} color="black" />
            <Text style={styles.optionText}>Add more Items</Text>
          </View>
          <AntDesign name="right" size={20} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleCookingInstructions}>
          <View style={styles.optionContent}>
            <Entypo name="new-message" size={24} color="black" />
            <Text style={styles.optionText}>Add cooking instructions</Text>
          </View>
          <AntDesign name="right" size={20} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleDeliveryInstructions}>
          <View style={styles.optionContent}>
            <Ionicons name="md-information-circle-outline" size={24} color="black" />
            <Text style={styles.optionText}>Add delivery instructions</Text>
          </View>
          <AntDesign name="right" size={20} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleToggleCutlery}>
          <View style={styles.optionContent}>
            <MaterialCommunityIcons name="food-fork-drink" size={24} color="black" />
            <Text style={styles.optionText}>{sendCutlery ? "Don't send cutlery with this order" : "Send cutlery with this order"}</Text>
          </View>
          <AntDesign name={sendCutlery ? "checksquare" : "closesquare"} size={20} color={sendCutlery ? "#4CAF50" : "#F44336"} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.subtotalContainer}>
          <Text style={styles.subtotalText}>Subtotal</Text>
          <Text style={styles.subtotalAmount}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout', { 
            subtotal,
            cookingInstructions,
            deliveryInstructions,
            sendCutlery
          })}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'cooking' ? 'Cooking Instructions' : 'Delivery Instructions'}
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              value={modalType === 'cooking' ? cookingInstructions : deliveryInstructions}
              onChangeText={modalType === 'cooking' ? setCookingInstructions : setDeliveryInstructions}
              placeholder={`Enter ${modalType} instructions...`}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveInstructions}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: 'red',
  },
  optionsContainer: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  checkoutButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
  },
  modalButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;