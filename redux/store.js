import { configureStore } from "@reduxjs/toolkit";
import CartReducer from "./CartReducer";
import UserReducer from "./UserReducer";

export const store = configureStore({
  reducer: {
    cart: CartReducer,
    user: UserReducer,
  },
});
