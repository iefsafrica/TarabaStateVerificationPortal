"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type AppConfigContextType = {
  appName: string;
  appLogo: string;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
};

const DEFAULT_APP_NAME = "Taraba State Verification Portal";
const DEFAULT_APP_LOGO = "/images/tsu-logo.png";

const AppConfigContext = createContext<AppConfigContextType>({
  appName: DEFAULT_APP_NAME,
  appLogo: DEFAULT_APP_LOGO,
  isLoading: true,
  refreshConfig: async () => {},
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState<string>(DEFAULT_APP_NAME);
  const [appLogo, setAppLogo] = useState<string>(DEFAULT_APP_LOGO);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.app_name) setAppName(json.data.app_name);
        if (json.data.app_logo) setAppLogo(json.data.app_logo);
      }
    } catch (err) {
      console.error("Failed to load app config settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <AppConfigContext.Provider
      value={{
        appName,
        appLogo,
        isLoading,
        refreshConfig: fetchConfig,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
