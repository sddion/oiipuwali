import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, FlatList, Image, Modal } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser, loadFavorites } from '../redux/UserReducer';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

const Users = () => {
  const faqData = [
    { 
      question: "How do I place an order?", 
      answer: "To place an order, browse our menu, select items, add them to your cart, and proceed to checkout. Follow the prompts to complete your order."
    },
    { 
      question: "What payment methods do you accept?", 
      answer: "We accept credit/debit cards, UPI, net banking, and cash on delivery in select areas. You can choose your preferred payment method during checkout."
    },
    { 
      question: "How can I track my order?", 
      answer: "Once your order is confirmed, you'll receive a tracking link via SMS and email. Click on the link to monitor your delivery in real-time."
    },
    { 
      question: "What if I need to cancel my order?", 
      answer: "You can cancel your order within 60 secounds of placing it through the app. After that, please contact our customer support for assistance."
    },
    { 
      question: "Do you offer vegetarian/vegan options?", 
      answer: "Yes, we have a variety of vegetarian and vegan options. Look for the (V) symbol next to menu items to identify vegetarian dishes and (VG) for vegan options."
    },
    { 
      question: "How do I report an issue with my order?", 
      answer: "You can report an issue by using the 'Report an Issue' button in your order details or by contacting our 24/7 customer support through the app or website."
    },
    { 
      question: "How can I save my favorite orders?", 
      answer: "After placing an order, you'll have the option to save it as a favorite. You can also find this option in your order history. Click 'Save as Favorite' for quick reordering in the future."
    },
    { 
      question: "Do you cater for large events?", 
      answer: "Yes, we offer catering services for events. Please contact us at least 48 hours in advance to discuss your requirements and place a catering order."
    },
    { 
      question: "How do I become a delivery partner?", 
      answer: "To become a delivery partner, visit our 'Become a Partner' page on our website. You'll find information about requirements and can submit an application to join our delivery team."
    },
  ];


  const [isAccountExpanded, setIsAccountExpanded] = useState(true);
  const [isFAQExpanded, setIsFAQExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState(new Array(faqData.length).fill(false));
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const favorites = useSelector(state => state.user.favorites);

  const dispatch = useDispatch();
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
    dispatch(loadFavorites());
  }, [dispatch]);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchFavoriteRestaurants();
    }
  }, [favorites]);

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

  const fetchFavoriteRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurantdata')
        .select('*')
        .in('id', favorites);
      
      if (error) throw error;
      setFavoriteRestaurants(data);
    } catch (error) {
      console.error('Error fetching favorite restaurants:', error);
    }
  };

  const toggleAccountExpansion = () => {
    setIsAccountExpanded(!isAccountExpanded);
  };

  const toggleFAQExpansion = () => {
    setIsFAQExpanded(!isFAQExpanded);
  };

  const toggleHelpExpansion = () => {
    setIsHelpExpanded(!isHelpExpanded);
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
      
      dispatch(clearUser());

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

  const openWhatsApp = () => {
    const phoneNumber = '7002589958';
    const message = 'Hello, I need assistance with my order.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "WhatsApp is not installed on your device");
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const openEmail = () => {
    const email = 'oiipuwalistore@gmail.com'; 
    const subject = 'Support Request';
    const body = 'Hello,\n\nI need assistance with the following issue:\n\n';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to open email client");
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const openPrivacyPolicy = () => {
    setIsPrivacyPolicyVisible(true);
  };

  const closePrivacyPolicy = () => {
    setIsPrivacyPolicyVisible(false);
  };

  const renderFavoriteRestaurant = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteRestaurantItem}
      onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
    >
      <Image source={{ uri: item.restaurantimage }} style={styles.favoriteRestaurantImage} />
      <Text style={styles.favoriteRestaurantName}>{item.restaurantname}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF6347', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.userName}>{userData?.name || 'Name'}</Text>
            <Text style={styles.userPhone}>{userData?.phone || 'Phone Number'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <MaterialIcons name="edit" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity onPress={toggleAccountExpansion} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="account-circle" size={24} color="#FF6347" />
            <Text style={styles.sectionTitle}>My Account</Text>
            <Ionicons
              name={isAccountExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {isAccountExpanded && (
          <View style={styles.expandedSection}>
            <TouchableOpacity onPress={handleEditAdress} style={styles.option}>
              <Ionicons name="home-outline" size={24} color="#FF6347" />
              <Text style={styles.optionText}>Saved Address</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option}>
              <Ionicons name="settings-outline" size={24} color="#FF6347" />
              <Text style={styles.optionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openPrivacyPolicy} style={styles.option}>
              <Ionicons name="document-text-outline" size={24} color="#FF6347" />
              <Text style={styles.optionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={toggleFAQExpansion} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="question-answer" size={24} color="#FF6347" />
            <Text style={styles.sectionTitle}>FAQ</Text>
            <Ionicons
              name={isFAQExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {isFAQExpanded && (
          <View style={styles.expandedSection}>
            {faqData.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.faqItem}
                onPress={() => {
                  const newExpandedItems = [...expandedItems];
                  newExpandedItems[index] = !newExpandedItems[index];
                  setExpandedItems(newExpandedItems);
                }}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                {expandedItems[index] && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={toggleHelpExpansion} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="help-outline" size={24} color="#FF6347" />
            <Text style={styles.sectionTitle}>Help</Text>
            <Ionicons
              name={isHelpExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {isHelpExpanded && (
          <View style={styles.expandedSection}>
            <TouchableOpacity style={styles.option} onPress={openWhatsApp}>
              <FontAwesome name="whatsapp" size={24} color="#25D366" />
              <Text style={styles.optionText}>WhatsApp Support</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={openEmail}>
              <Ionicons name="mail-outline" size={24} color="#FF6347" />
              <Text style={styles.optionText}>Email Support</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <LinearGradient
            colors={['#FF6347', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>LOGOUT</Text>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {favorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.favoritesTitle}>Your Favorite Restaurants</Text>
            <FlatList
              data={favoriteRestaurants}
              renderItem={renderFavoriteRestaurant}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      <Modal
        visible={isPrivacyPolicyVisible}
        animationType="slide"
        onRequestClose={closePrivacyPolicy}
      >
        <View style={styles.modalContainer}>
          <WebView
            source={{ uri: 'https://www.termsfeed.com/live/b71eb6d0-f4ce-44f1-8f36-5ef81ef66308' }}
            style={styles.webView}
          />
        </View>
      </Modal>
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
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userPhone: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  editButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  expandedSection: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  faqItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  favoritesSection: {
    marginTop: 20,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  favoriteRestaurantItem: {
    marginRight: 15,
    width: 120,
  },
  favoriteRestaurantImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  favoriteRestaurantName: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
});

export default Users;