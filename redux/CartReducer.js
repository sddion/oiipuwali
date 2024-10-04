import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    restaurant: null,
    coupon: null,
    couponDiscount: 0,
    couponError: null,
    cookingInstructions: '',
    deliveryInstructions: '',
    sendCutlery: true,
  },
  reducers: {
    addToCart: (state, action) => {
      const { restaurant, item } = action.payload;
      
      // Check if restaurant and item are defined
      if (!restaurant || !item) {
        console.error("Invalid payload in addToCart:", action.payload);
        return;
      }

      if (state.restaurant && state.restaurant.id !== restaurant.id) {
        // Clear the cart if adding item from a different restaurant
        state.cart = [];
      }
      state.restaurant = restaurant;

      const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // Ensure all required properties are present
        if (item.id && item.dishName && item.price && item.dishImage) {
          state.cart.push({ 
            id: item.id,
            quantity: 1, 
            price: parseFloat(item.price),
            dishName: item.dishName,
            dishImage: item.dishImage
          });
        } else {
          console.error("Missing required properties in item:", item);
        }
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.id !== action.payload.id);
      if (state.cart.length === 0) {
        state.restaurant = null;
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.cart.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const item = state.cart.find(item => item.id === action.payload.id);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cart = state.cart.filter(cartItem => cartItem.id !== item.id);
        }
      }
      if (state.cart.length === 0) {
        state.restaurant = null;
      }
    },
    clearCart: (state) => {
      state.cart = [];
      state.restaurant = null;
    },
    updateOrderInstructions: (state, action) => {
      const { cookingInstructions, deliveryInstructions } = action.payload;
      if (cookingInstructions !== undefined) state.cookingInstructions = cookingInstructions;
      if (deliveryInstructions !== undefined) state.deliveryInstructions = deliveryInstructions;
    },
    toggleCutlery: (state) => {
      state.sendCutlery = !state.sendCutlery;
    },
    applyCoupon: (state, action) => {
      const couponCode = action.payload;
      const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      let discount = 0;
      let error = null;
      
      switch (couponCode.toUpperCase()) {
        case 'SAVE10':
          if (subtotal >= 100) {
            discount = Math.min(subtotal * 0.1, 50); // 10% off, max 50 rupees
          } else {
            error = 'Minimum order of ₹100 required for SAVE10';
          }
          break;
        case 'FLAT20':
          if (subtotal >= 200) {
            discount = 20; // Flat 20 rupees off
          } else {
            error = 'Minimum order of ₹200 required for FLAT20';
          }
          break;
        case 'SPECIAL25':
          if (subtotal >= 500) {
            discount = Math.min(subtotal * 0.25, 100); // 25% off, max 100 rupees
          } else {
            error = 'Minimum order of ₹500 required for SPECIAL25';
          }
          break;
        default:
          error = 'Invalid coupon code';
      }

      if (discount > 0) {
        state.coupon = couponCode;
        state.couponDiscount = discount;
        state.couponError = null;
      } else {
        state.coupon = null;
        state.couponDiscount = 0;
        state.couponError = error;
      }
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponDiscount = 0;
      state.couponError = null;
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  clearCart, 
  incrementQuantity, 
  decrementQuantity,
  updateOrderInstructions,
  toggleCutlery,
  applyCoupon,
  removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
