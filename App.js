import 'expo-dev-client';
import "react-native-gesture-handler";
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from './supabase';
import HomeScreen from "./screens/HomeScreen";
import RestaurantScreen from "./screens/RestaurantScreen";
import LocationScreen from "./screens/LocationScreen";
import LoginScreen from "./screens/LoginScreen";
import CartScreen from "./screens/CartScreen";
import Coupon from "./components/Coupon";
import Users from "./components/Users";
import UserComponent from "./components/UserComponent";
import CheckoutScreen from "./screens/CheckoutScreen";
import { LocationProvider } from './context/LocationContext';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import SavedAddresses from "./components/SavedAddresses";
import DeliveryTrackingScreen from "./screens/deliveryTrackingScreen";
import CategoryItemsScreen from './screens/CategoryItemsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    checkSession();
  }, []);


  return (
    <Provider store={store}>
    <LocationProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName={session ? "Home" : "LoginScreen"}>
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LocationScreen"
            component={LocationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
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
              title: "",
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
            name="Coupon"
            component={Coupon}
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
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
    </Provider>
  );
}
