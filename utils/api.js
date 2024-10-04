import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function for error handling
const handleApiError = (error, customMessage) => {
  console.error(customMessage, error);
  if (error.response) {
    throw error.response.data;
  } else if (error.request) {
    throw new Error('No response received from the server');
  } else {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/create-order', orderData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error creating order:');
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.post('/update-order-status', { orderId, status });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error updating order status:');
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error getting order details:');
  }
};

export const getDeliveryPersonLocation = async (deliveryPersonId) => {
  try {
    const response = await api.get(`/delivery-person-location?id=${deliveryPersonId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error getting delivery person location:');
  }
};