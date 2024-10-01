// redux/UserReducer.js
import { createSlice } from "@reduxjs/toolkit";

export const UserSlice = createSlice({
  name: "user",
  initialState: {
    id: null,
    phone: null,
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => {
      return { id: null, phone: null };
    },
  },
});

export const { setUser, clearUser } = UserSlice.actions;

export default UserSlice.reducer;