import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';

// Définition des couleurs
const lightTheme = {
  dark: false,
  bg: '#f9fafb',        // Fond clair
  card: '#ffffff',      // Carte blanche
  text: '#1f2937',      // Texte noir
  subText: '#6b7280',   // Texte gris
  border: '#e5e7eb',    // Bordure
};

const darkTheme = {
  dark: true,
  bg: '#111827',        // Fond très sombre (presque noir)
  card: '#1f2937',      // Carte gris foncé
  text: '#f9fafb',      // Texte blanc
  subText: '#9ca3af',   // Texte gris clair
  border: '#374151',    // Bordure sombre
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Par défaut, on regarde si le téléphone est déjà en mode sombre
  const systemScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  // Fonction pour changer de mode
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);