import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on load
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ 
                    id: decoded.user_id, 
                    email: decoded.email, 
                    username: decoded.username,
                    firstName: decoded.first_name,
                    lastName: decoded.last_name,
                    role: decoded.role || 'student' 
                });
            } catch (e) {
                console.error("Invalid token found");
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login/', { username: email, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            const decoded = jwtDecode(access);
            setUser({ 
                id: decoded.user_id, 
                email, 
                username: decoded.username,
                firstName: decoded.first_name,
                lastName: decoded.last_name,
                role: decoded.role || 'student' 
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Login failed' };
        }
    };

    const register = async (name, username, email, password, role) => {
        try {
            // Split name into first_name and last_name for Django
            const nameParts = name.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ');

            await api.post('/api/auth/register/', {
                username,
                email,
                password,
                first_name,
                last_name,
                role
            });
            // Automatically login after successful registration
            return await login(email, password);
        } catch (error) {
            // Format specific field errors into a single string
            let errorMsg = 'Registration failed';
            if (error.response?.data) {
                const errors = error.response.data;
                errorMsg = typeof errors === 'string' ? errors : Object.values(errors).flat().join(', ');
            }
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
