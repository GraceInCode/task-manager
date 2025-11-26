import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentBoard, setCurrentBoard] = useState(null);

    const login = (newToken) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null)
    };

    return (
        <AppContext.Provider value={{ token, login, logout, currentBoard, setCurrentBoard }}>
            {children}
        </AppContext.Provider>
    )
}