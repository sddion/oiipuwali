import 'expo-dev-client';
import "react-native-gesture-handler";
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from './supabase';
import HomeScreen from "./screens/HomeScreen";
import RestaurantScreen from "./screens/RestaurantScreen";
import LocationScreen from "./screens/LocationScreen";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import { LocationProvider } from './context/LocationContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LocationProvider> {}
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
                backgroundColor: "#FFFFFF",
              },
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              title: "",
              headerStyle: {
                backgroundColor: "#FFFFFF",
              },
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}
