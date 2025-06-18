/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, database } from '../firebase/firebase';
import { ref, set, get } from 'firebase/database';

// Admin email - only this email will be allowed to login
const ADMIN_EMAIL = "admin@techinf.com";

// Async thunk for Firebase login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            // Check if email is admin email
            if (email !== ADMIN_EMAIL) {
                throw new Error('Access denied. Admins only.');
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            return {
                uid: user.uid,
                email: user.email,
                token: await user.getIdToken(),
                isAdmin: true
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for creating admin user (one-time setup)
export const createAdminUser = createAsyncThunk(
    'auth/createAdminUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            if (email !== ADMIN_EMAIL) {
                throw new Error('Only admin email can be registered.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save admin data to Realtime Database
            await set(ref(database, `admins/${user.uid}`), {
                email: user.email,
                isAdmin: true,
                createdAt: new Date().toISOString()
            });

            return {
                uid: user.uid,
                email: user.email,
                token: await user.getIdToken(),
                isAdmin: true
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    uid: localStorage.getItem('uid') || null,
    token: localStorage.getItem('token') || null,
    email: localStorage.getItem('email') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true' || false,
    isLoggedIn: !!localStorage.getItem('token'),
    isLogin: true,
    isLoading: false,
    error: null,
    isLoginModalOpen: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Keep your existing reducers for compatibility
        login(state, action) {
            state.token = action.payload.token;
            state.email = action.payload.email;
            state.isLoggedIn = true;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('email', action.payload.email);
        },
        logout(state) {
            state.token = null;
            state.email = null;
            state.uid = null;
            state.isAdmin = false;
            state.isLoggedIn = false;
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('uid');
            localStorage.removeItem('isAdmin');
        },
        toggleMode(state) {
            state.isLogin = !state.isLogin;
            state.error = null;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        openLoginModal(state) {
            state.isLoginModalOpen = true;
        },
        closeLoginModal(state) {
            state.isLoginModalOpen = false;
        },
        clearError(state) {
            state.error = null;
        },
        // For handling Firebase auth state changes
        setAuthState(state, action) {
            if (action.payload) {
                state.uid = action.payload.uid;
                state.email = action.payload.email;
                state.token = action.payload.token;
                state.isAdmin = action.payload.isAdmin;
                state.isLoggedIn = true;

                // Update localStorage
                localStorage.setItem('uid', action.payload.uid);
                localStorage.setItem('email', action.payload.email);
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('isAdmin', action.payload.isAdmin);
            } else {
                state.uid = null;
                state.email = null;
                state.token = null;
                state.isAdmin = false;
                state.isLoggedIn = false;

                // Clear localStorage
                localStorage.removeItem('uid');
                localStorage.removeItem('email');
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.uid = action.payload.uid;
                state.email = action.payload.email;
                state.token = action.payload.token;
                state.isAdmin = action.payload.isAdmin;
                state.isLoggedIn = true;
                state.isLoginModalOpen = false;

                // Update localStorage
                localStorage.setItem('uid', action.payload.uid);
                localStorage.setItem('email', action.payload.email);
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('isAdmin', action.payload.isAdmin);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create admin cases
            .addCase(createAdminUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createAdminUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.uid = action.payload.uid;
                state.email = action.payload.email;
                state.token = action.payload.token;
                state.isAdmin = action.payload.isAdmin;
                state.isLoggedIn = true;
                state.isLoginModalOpen = false;

                // Update localStorage
                localStorage.setItem('uid', action.payload.uid);
                localStorage.setItem('email', action.payload.email);
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('isAdmin', action.payload.isAdmin);
            })
            .addCase(createAdminUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Logout cases
            .addCase(logoutUser.fulfilled, (state) => {
                state.uid = null;
                state.email = null;
                state.token = null;
                state.isAdmin = false;
                state.isLoggedIn = false;
                state.isLoading = false;

                // Clear localStorage
                localStorage.removeItem('uid');
                localStorage.removeItem('email');
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
            });
    }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
