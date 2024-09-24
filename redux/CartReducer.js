import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    cookingInstructions: "",
    deliveryInstructions: "",
    sendCutlery: true,
  },
  reducers: {
    addToCart: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item.id === action.payload.id
      );

      if (itemPresent) {
        itemPresent.quantity++;
      } else {
        state.cart.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      const removeItem = state.cart.filter(
        (item) => item.id !== action.payload.id
      );
      state.cart = removeItem;
    },
    incrementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (itemPresent) {
        itemPresent.quantity++;
      }
    },
    decrementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (itemPresent) {
        if (itemPresent.quantity === 1) {
          const removeItem = state.cart.filter(
            (item) => item.id !== action.payload.id
          );
          state.cart = removeItem;
        } else {
          itemPresent.quantity--;
        }
      }
    },
    cleanCart: (state) => {
      state.cart = [];
    },
    updateOrderInstructions: (state, action) => {
      const { cookingInstructions, deliveryInstructions } = action.payload;
      if (cookingInstructions !== undefined) state.cookingInstructions = cookingInstructions;
      if (deliveryInstructions !== undefined) state.deliveryInstructions = deliveryInstructions;
    },
    toggleCutlery: (state) => {
      state.sendCutlery = !state.sendCutlery;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  cleanCart,
  updateOrderInstructions,
  toggleCutlery,
} = CartSlice.actions;

export default CartSlice.reducer;
