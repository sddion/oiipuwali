import { supabase } from '../supabase';

export const fetchLocations = async (userId, setUserLocation, setRestaurantLocation, setLoading) => {
  try {

    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurantdata')
      .select('latitude, longitude')
      .limit(1);  
    if (restaurantError) throw restaurantError;
    if (restaurantData && restaurantData.length > 0) {
      setRestaurantLocation(restaurantData[0]);
    } else {
      throw new Error('No restaurant data found');
    }

    // Fetch user location from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('latitude, longitude')
      .eq('id', userId)
      .single();
    if (userError) throw userError;
    setUserLocation(userData);
  } catch (error) {
    console.error('Error fetching locations:', error);
  } finally {
    setLoading(false);
  }
};

export const calculateDeliveryCost = async (userLocation, restaurantLocation, setDeliveryCost, setTotal, subtotal) => {
  if (userLocation && restaurantLocation) {
    const apiKey = 'AIzaSyBZ_jnKn5U_saPuBcYqn8TLZo_VNcsLRn4'; 
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.latitude},${userLocation.longitude}&destinations=${restaurantLocation.latitude},${restaurantLocation.longitude}&mode=driving&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const distanceInMeters = data.rows[0].elements[0].distance.value;
        const distanceInKm = distanceInMeters / 1000;

        // Calculate delivery cost
        const baseCost = 10;
        const costPerKm = 7.5;
        const calculatedCost = baseCost + (distanceInKm * costPerKm);

        const roundedCost = Math.round(calculatedCost);
        setDeliveryCost(roundedCost);
        setTotal(subtotal + roundedCost);
      } else {
        console.error('Error calculating distance:', data.status);
        setDeliveryCost(0);
        setTotal(subtotal);
      }
    } catch (error) {
      console.error('Error fetching distance data:', error);
      setDeliveryCost(0);
      setTotal(subtotal);
    }
  }
};