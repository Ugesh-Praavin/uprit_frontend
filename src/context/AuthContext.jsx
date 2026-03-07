import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages authentication state.
 * Stores JWT token and user info in localStorage.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('uprit_token');
        const storedUser = localStorage.getItem('uprit_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        const data = response.data;
        localStorage.setItem('uprit_token', data.token);
        localStorage.setItem('uprit_user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        return data;
    };

    const register = async (name, email, password, department, year) => {
        const response = await api.post('/api/auth/register', {
            name, email, password, department, year: parseInt(year),
        });
        const data = response.data;
        localStorage.setItem('uprit_token', data.token);
        localStorage.setItem('uprit_user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('uprit_token');
        localStorage.removeItem('uprit_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
