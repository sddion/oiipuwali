import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to safely parse JSON
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

// Helper function to safely stringify JSON
const safeJsonStringify = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error stringifying JSON:', error);
    return '';
  }
};

// Async thunk to load user data
export const loadUserData = createAsyncThunk(
  'user/loadUserData',
  async (_, { rejectWithValue }) => {
    try {
      const [favoritesJson, savedAddressesJson] = await Promise.all([
        AsyncStorage.getItem('userFavorites'),
        AsyncStorage.getItem('savedAddresses')
      ]);
      
      return {
        favorites: safeJsonParse(favoritesJson, []),
        savedAddresses: safeJsonParse(savedAddressesJson, [])
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to save user data
export const saveUserData = createAsyncThunk(
  'user/saveUserData',
  async ({ key, data }, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(key, safeJsonStringify(data));
      return { key, data };
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const UserSlice = createSlice({
  name: "user",
  initialState: {
    id: null,
    phone: null,
    favorites: [],
    savedAddresses: [],
    status: 'idle',
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: (state) => {
      state.id = null;
      state.phone = null;
      state.favorites = [];
      state.savedAddresses = [];
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    addFavorite: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    setSavedAddresses: (state, action) => {
      state.savedAddresses = action.payload;
    },
    addSavedAddress: (state, action) => {
      state.savedAddresses.push(action.payload);
    },
    updateSavedAddress: (state, action) => {
      const index = state.savedAddresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.savedAddresses[index] = action.payload;
      }
    },
    removeSavedAddress: (state, action) => {
      state.savedAddresses = state.savedAddresses.filter(addr => addr.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favorites = action.payload.favorites;
        state.savedAddresses = action.payload.savedAddresses;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveUserData.fulfilled, (state, action) => {
        if (action.payload.key === 'userFavorites') {
          state.favorites = action.payload.data;
        } else if (action.payload.key === 'savedAddresses') {
          state.savedAddresses = action.payload.data;
        }
      });
  },
});

export const { 
  setUser, 
  clearUser, 
  setFavorites, 
  addFavorite, 
  removeFavorite, 
  setSavedAddresses, 
  addSavedAddress, 
  updateSavedAddress, 
  removeSavedAddress 
} = UserSlice.actions;

// Thunk to load favorites from AsyncStorage
export const loadFavorites = () => async (dispatch) => {
  try {
    const favoritesJson = await AsyncStorage.getItem('userFavorites');
    if (favoritesJson) {
      const favorites = safeJsonParse(favoritesJson, []);
      dispatch(setFavorites(favorites));
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
};

export default UserSlice.reducer;