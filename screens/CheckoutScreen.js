import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../redux/CartReducer';
import { Alert } from 'react-native';
import { createOrder } from '../utils/orderUtils';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentOption = ({ icon, title, subtitle, onPress, addNew }) => (
  <TouchableOpacity style={styles.paymentOption} onPress={onPress}>
    <View style={styles.iconContainer}>
      {addNew ? (
        <LinearGradient
          colors={['#FF6347', '#FF8C00']}
          style={styles.addNewIcon}
        >
          <Ionicons name="add" size={20} color="white" />
        </LinearGradient>
      ) : (
        icon
      )}
    </View>
    <View style={styles.paymentTextContainer}>
      <Text style={[styles.paymentTitle, addNew && { color: '#FF6347' }]}>{title}</Text>
      <Text style={styles.paymentSubtitle}>{subtitle}</Text>
    </View>
    {!addNew && <Ionicons name="chevron-forward" size={20} color="#666" />}
  </TouchableOpacity>
);

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { total, restaurantId, restaurantName, cart, deliveryCost, userAddress } = route.params;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handlePayment = async (method) => {
    try {
      console.log('Starting order creation process');

      const orderData = {
        user_id: user.id,
        restaurant_id: restaurantId,
        items: cart,
        total_amount: total,
        delivery_address: userAddress,
        payment_method: method,
        delivery_cost: deliveryCost
      };

      console.log('Order data:', orderData);

      const createdOrder = await createOrder(orderData);

      console.log('Created order:', createdOrder);

      // Update order with payment information
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_method: method,
          status: method === 'COD' ? 'pending' : 'paid'
        })
        .eq('id', createdOrder.id)
        .select()
        .single();

      if (error) throw error;

      // Clear the cart
      dispatch(clearCart());

      // Navigate to the delivery tracking screen
      navigation.navigate('DeliveryTracking', {
        orderId: createdOrder.id,
        restaurantName: restaurantName,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF6347', '#FF8C00']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.summaryText}>Total: ₹{total}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Payment Options</Text>

        <PaymentOption
          icon={<Image source={require('../assets/upi.png')} style={styles.paymentIcon} />}
          title="Pay by any UPI App"
          addNew={true}
          subtitle="You need to have a registered UPI ID"
          onPress={() => handlePayment('UPI')}
        />

        <PaymentOption
          icon={<MaterialIcons name="credit-card" size={32} color="#FF6347" />}
          title="Credit & Debit Cards"
          addNew={true}
          subtitle="Save and Pay via Cards."
          onPress={() => handlePayment('Card')}
        />

        <Text style={styles.sectionTitle}>More Payment Options</Text>

        <TouchableOpacity style={styles.alternativeButton} onPress={() => handlePayment('COD')}>
          <LinearGradient
            colors={['#FF6347', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.alternativeButtonGradient}
          >
            <Text style={styles.alternativeButtonText}>Cash on Delivery</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.alternativeButton} onPress={() => handlePayment('Takeaway')}>
          <LinearGradient
            colors={['#FF6347', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.alternativeButtonGradient}
          >
            <Text style={styles.alternativeButtonText}>Takeaway</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 18,
    color: 'white',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  paymentOption: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  addNewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentIcon: {
    width: 32,
    height: 32,
  },
  alternativeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  alternativeButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  alternativeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CheckoutScreen;