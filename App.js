import 'expo-dev-client';
import "react-native-gesture-handler";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from './supabase';
import { loadUserData } from './redux/UserReducer';
import HomeScreen from "./screens/HomeScreen";
import RestaurantScreen from "./screens/RestaurantScreen";
import LocationScreen from "./screens/LocationScreen";
import LoginScreen from "./screens/LoginScreen";
import CartScreen from "./screens/CartScreen";
import DeliveryTrackingScreen from "./screens/deliveryTrackingScreen";
import CategoryItemsScreen from './screens/CategoryItemsScreen';
import CheckoutScreen from "./screens/CheckoutScreen";
import Users from "./components/Users";
import SavedAddresses from "./components/SavedAddresses";
import UserComponent from "./components/UserComponent";
import { LocationProvider } from './context/LocationContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const [session, setSession] = useState(null);
  const dispatch = store.dispatch;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        dispatch(loadUserData());
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        dispatch(loadUserData());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack.Navigator initialRouteName={session ? "Home" : "LoginScreen"}>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LocationScreen"
        component={LocationScreen}
        options={{
          title: "Location",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
  
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "",
          headerShown: false,
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Users"
        component={Users}
        options={{
          title: "",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="UserComponent"
        component={UserComponent}
        options={{
          title: " Edit Profile",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddresses}
        options={{
          title: "Saved Addresses",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="DeliveryTracking"
        component={DeliveryTrackingScreen}
        options={{
          title: "",
          headerShown: false,
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="CategoryItems"
        component={CategoryItemsScreen}
        options={{
          title: "Search By Categories",
          headerStyle: {
            backgroundColor: "#F4F6FB",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <LocationProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </LocationProvider>
    </Provider>
  );
}
