import { createContext, useState, useContext } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token') || null);

    const login = async (username, password, rememberMe = true) => {
        const response = await loginUser(username, password);
        const { token: newToken, ...userData } = response;

        setToken(newToken);
        setUser(userData);

        if (rememberMe) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } else {
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        return userData;
    };

    const register = async (username, email, password, rememberMe = true) => {
        const response = await registerUser(username, email, password);
        const { token: newToken, ...userData } = response;

        setToken(newToken);
        setUser(userData);

        if (rememberMe) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } else {
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        return userData;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
