import { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const login = async (username, password) => {
        const response = await loginUser(username, password);
        const { token: newToken, ...userData } = response;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    };

    const register = async (username, email, password) => {
        const response = await registerUser(username, email, password);
        const { token: newToken, ...userData } = response;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
