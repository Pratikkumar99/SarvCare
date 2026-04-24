import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    useEffect(() => {
        // Apply theme to document
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const theme = {
        isDarkMode,
        toggleTheme,
        colors: {
            // Light theme colors
            light: {
                primary: '#2563eb',      // Blue 600
                primaryDark: '#1d4ed8',  // Blue 700
                primaryLight: '#3b82f6', // Blue 500
                secondary: '#64748b',    // Slate 500
                background: '#ffffff',     // White
                surface: '#f8fafc',      // Slate 50
                border: '#e2e8f0',      // Slate 200
                text: '#1e293b',       // Slate 800
                textSecondary: '#64748b', // Slate 500
                success: '#10b981',     // Emerald 500
                warning: '#f59e0b',     // Amber 500
                error: '#ef4444',       // Red 500
                shadow: 'rgba(0, 0, 0, 0.1)'
            },
            // Dark theme colors
            dark: {
                primary: '#3b82f6',      // Blue 500
                primaryDark: '#2563eb',  // Blue 600
                primaryLight: '#60a5fa', // Blue 400
                secondary: '#94a3b8',    // Slate 400
                background: '#0f172a',   // Slate 900
                surface: '#1e293b',     // Slate 800
                border: '#334155',       // Slate 700
                text: '#f1f5f9',       // Slate 100
                textSecondary: '#cbd5e1', // Slate 300
                success: '#34d399',     // Emerald 400
                warning: '#fbbf24',     // Amber 400
                error: '#f87171',       // Red 400
                shadow: 'rgba(0, 0, 0, 0.3)'
            }
        }
    };

    const currentTheme = isDarkMode ? theme.colors.dark : theme.colors.light;

    return (
        <ThemeContext.Provider value={{ theme, currentTheme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
