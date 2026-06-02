import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const unsub = settingsService.subscribe(setSettings);
    return unsub;
  }, []);

  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
