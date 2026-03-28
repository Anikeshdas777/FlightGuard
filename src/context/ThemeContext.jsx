import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('fg_theme') || 'blue';
        } catch {
            return 'blue';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('fg_theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
            console.error('Failed to set theme in localStorage', e);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
