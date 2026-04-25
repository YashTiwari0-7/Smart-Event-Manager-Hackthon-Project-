import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getToken, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate auth state from localStorage on mount
    useEffect(() => {
        const storedUser = getCurrentUser();
        const storedToken = getToken();

        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
        }

        setLoading(false);
    }, []);

    const loginSuccess = (userData) => {
        setUser(userData);
        setToken(userData.token);
    };

    const logout = () => {
        logoutService();
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        loginSuccess,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
