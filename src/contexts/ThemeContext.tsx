import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  ramadanMode: boolean;
  toggleRamadanMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [ramadanMode, setRamadanMode] = useState(() => {
    const saved = localStorage.getItem('ramadanMode');
    return saved === 'true';
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('ramadanMode', ramadanMode.toString());
    
    // Apply Ramadan mode class
    if (ramadanMode) {
      document.documentElement.classList.add('ramadan');
    } else {
      document.documentElement.classList.remove('ramadan');
    }
  }, [ramadanMode]);

  // Check if Ramadan mode should auto-disable
  useEffect(() => {
    const checkRamadanDates = () => {
      const ramadanEndDate = localStorage.getItem('ramadanEndDate');
      if (ramadanEndDate && ramadanMode) {
        const endDate = new Date(ramadanEndDate);
        const today = new Date();
        if (today > endDate) {
          setRamadanMode(false);
          localStorage.removeItem('ramadanEndDate');
        }
      }
    };

    checkRamadanDates();
    // Check daily
    const interval = setInterval(checkRamadanDates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [ramadanMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleRamadanMode = () => {
    setRamadanMode(prev => {
      const newValue = !prev;
      if (newValue) {
        // Set default Ramadan end date (approximately 30 days from start)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        localStorage.setItem('ramadanEndDate', endDate.toISOString());
      } else {
        localStorage.removeItem('ramadanEndDate');
      }
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      ramadanMode, 
      toggleRamadanMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
