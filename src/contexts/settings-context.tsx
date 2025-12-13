"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppSettings, defaultSettings } from "@/types/settings";
import { logger } from "@/lib/logger";

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "race-board-settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger les réglages depuis localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        logger.error("Erreur lors du chargement des réglages:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sauvegarder les réglages dans localStorage à chaque modification
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    logger.log("⚙️ Updating settings:", newSettings);
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      logger.log("📝 New settings state:", updated);
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings doit être utilisé dans un SettingsProvider");
  }
  return context;
}
