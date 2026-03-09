import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check localStorage on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('user_id');

        if (storedToken && storedUserId) {
            setToken(storedToken);
            setUserId(storedUserId);
        }
        setLoading(false);
    }, []);

    const login = (newToken, newUserId) => {
        setToken(newToken);
        setUserId(newUserId);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user_id', newUserId);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
    };

    const value = {
        token,
        userId,
        login,
        logout,
        isAuthenticated: !!token,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
