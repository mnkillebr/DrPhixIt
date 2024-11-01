import { createContext  } from "react";

export interface SettingsContextType {
  settings: {
    vibration: boolean;
    audio: boolean;
    dataSource: string;
    volume: number;
    sound: string;
  };
  setSettings: (newSettings: Partial<SettingsContextType['settings']>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
export const SettingsConsumer = SettingsContext.Consumer
export const SettingsProvider = SettingsContext.Provider