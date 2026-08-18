import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  school: null,
  loading: false,
  error: null,
  // Only trust token if not explicitly logged out this session
  isAuthenticated: !!localStorage.getItem('accessToken') && !sessionStorage.getItem('loggedOut'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setSchool: (state, action) => {
      state.school = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.school = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Mark session as logged out so forward-navigation history can't reuse stale tokens
      sessionStorage.setItem('loggedOut', '1');
    },
  },
});

export const { setUser, setSchool, setLoading, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
