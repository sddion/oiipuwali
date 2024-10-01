import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupons } from '../utils/couponFetcher';
import { setCoupons, applyCoupon } from '../redux/CartReducer';

const Coupon = ({ navigation }) => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const dispatch = useDispatch();
  const coupons = useSelector(state => state.cart.coupons);

  useEffect(() => {
    const loadCoupons = async () => {
      const fetchedCoupons = await fetchCoupons();
      dispatch(setCoupons(fetchedCoupons));
    };
    loadCoupons();
  }, [dispatch]);

  const renderCouponItem = ({ item }) => (
    <TouchableOpacity style={styles.couponItem} onPress={() => setSelectedCoupon(item)}>
      <View style={styles.logoContainer}>
        <Ionicons name={item.logo} size={24} color="#f27e18" />
      </View>
      <View style={styles.couponDetails}>
        <Text style={styles.companyName}>{item.company}</Text>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
      <TouchableOpacity style={styles.redeemButton} onPress={() => dispatch(applyCoupon(item))}>
        <Text style={styles.redeemButtonText}>REDEEM</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={coupons}
        renderItem={renderCouponItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.couponList}
      />
      <Modal
        visible={selectedCoupon !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCoupon(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedCoupon(null)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            {selectedCoupon && (
              <>
                <View style={styles.modalLogoContainer}>
                  <Ionicons name={selectedCoupon.logo} size={48} color="#f27e18" />
                </View>
                <Text style={styles.modalCompanyName}>{selectedCoupon.company}</Text>
                <Text style={styles.modalDiscount}>{selectedCoupon.discount}</Text>
                <Text style={styles.modalDescription}>
                  {selectedCoupon.description}
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton}>
                    <Ionicons name="mail" size={24} color="#f27e18" />
                    <Text style={styles.modalButtonText}>MAIL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.redeemButton]}>
                    <Text style={styles.redeemButtonText}>REDEEM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton}>
                    <Ionicons name="share-social" size={24} color="#f27e18" />
                    <Text style={styles.modalButtonText}>SHARE</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    top:40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  couponList: {
    padding: 16,
  },
  couponItem: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponDetails: {
    flex: 1,
    marginLeft: 16,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  discountText: {
    fontSize: 14,
    color: '#f27e18',
  },
  redeemButton: {
    backgroundColor: '#f27e18',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  redeemButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalLogoContainer: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCompanyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalDiscount: {
    fontSize: 20,
    color: '#f27e18',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    alignItems: 'center',
  },
  modalButtonText: {
    marginTop: 4,
    color: '#f27e18',
  },
});

export default Coupon;