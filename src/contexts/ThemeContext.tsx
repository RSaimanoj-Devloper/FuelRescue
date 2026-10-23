import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { DICTIONARY, Translations } from '../utils/i18n';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  lowBatteryMode: boolean;
  toggleLowBatteryMode: () => void;
  lowNetworkMode: boolean;
  toggleLowNetworkMode: () => void;
  batteryLevel: number | null;
  batteryCharging: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fuelrescue_theme') as 'dark' | 'light') || 'dark';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('fuelrescue_lang') as LanguageCode) || 'en';
  });

  const [lowBatteryMode, setLowBatteryMode] = useState<boolean>(() => {
    return localStorage.getItem('fuelrescue_low_battery') === 'true';
  });

  const [lowNetworkMode, setLowNetworkMode] = useState<boolean>(() => {
    return localStorage.getItem('fuelrescue_low_network') === 'true';
  });

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  const [batteryAlertShown, setBatteryAlertShown] = useState<boolean>(false);

  // Automatic battery level monitor: ONLY switch when battery level is less than 20%
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const checkBattery = () => {
          const levelPct = Math.round(battery.level * 100);
          setBatteryLevel(levelPct);
          setBatteryCharging(Boolean(battery.charging));

          // ONLY switch when user's battery level is less than 20%
          if (battery.level < 0.20 && !battery.charging) {
            setLowBatteryMode(true);
            localStorage.setItem('fuelrescue_low_battery', 'true');
            setBatteryAlertShown(true);
          } else if (battery.level >= 0.20 && batteryAlertShown) {
            setBatteryAlertShown(false);
          }
        };

        checkBattery();
        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);

        return () => {
          battery.removeEventListener('levelchange', checkBattery);
          battery.removeEventListener('chargingchange', checkBattery);
        };
      }).catch(() => {});
    }
  }, [batteryAlertShown]);

  useEffect(() => {
    localStorage.setItem('fuelrescue_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('fuelrescue_lang', lang);
  };

  const toggleLowBatteryMode = () => {
    setLowBatteryMode((prev) => {
      const next = !prev;
      localStorage.setItem('fuelrescue_low_battery', String(next));
      return next;
    });
  };

  const toggleLowNetworkMode = () => {
    setLowNetworkMode((prev) => {
      const next = !prev;
      localStorage.setItem('fuelrescue_low_network', String(next));
      return next;
    });
  };

  const t = DICTIONARY[language] || DICTIONARY.en;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        lowBatteryMode,
        toggleLowBatteryMode,
        lowNetworkMode,
        toggleLowNetworkMode,
        batteryLevel,
        batteryCharging
      }}
    >
      <div className={`${lowBatteryMode ? 'contrast-125' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
