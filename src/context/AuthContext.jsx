import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    signIn as serviceSignIn,
    signUp as serviceSignUp,
    signOut as serviceSignOut,
    getCurrentUser,
} from '../utils/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());

    const login = useCallback(async (email, password) => {
        const result = serviceSignIn(email, password);
        if (result.user) setUser(result.user);
        return result;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const result = serviceSignUp(name, email, password);
        if (result.user) setUser(result.user);
        return result;
    }, []);

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

export function useAuth() {
    return useContext(AuthContext);
}
