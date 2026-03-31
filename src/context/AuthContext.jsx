// This file manages authentication state for the app.
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    signIn as serviceSignIn,
    signUp as serviceSignUp,
    signOut as serviceSignOut,
    getCurrentUser,
} from '../utils/authService.js';

const AuthContext = createContext(null);

// This component provides the auth state to child components.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());

    // This function handles login.
    const login = useCallback(async (email, password) => {
        const result = serviceSignIn(email, password);
        if (result.user) setUser(result.user);
        return result;
    }, []);

    // This function handles register.
    const register = useCallback(async (name, email, password) => {
        const result = serviceSignUp(name, email, password);
        if (result.user) setUser(result.user);
        return result;
    }, []);

    // This function handles logout.
    const logout = useCallback(() => {
        serviceSignOut();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// This hook returns the auth data and actions.
export function useAuth() {
    return useContext(AuthContext);
}
