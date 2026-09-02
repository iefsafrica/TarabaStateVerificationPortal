"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type AppConfigContextType = {
  appName: string;
  appLogo: string;
  isLoading: boolean;
  enableRegistration: boolean;
  enableLogin: boolean;
  refreshConfig: () => Promise<void>;
};

const DEFAULT_APP_NAME = "Taraba State Verification Portal";
const DEFAULT_APP_LOGO = "/images/tsu-logo.png";

const AppConfigContext = createContext<AppConfigContextType>({
  appName: DEFAULT_APP_NAME,
  appLogo: DEFAULT_APP_LOGO,
  isLoading: true,
  enableRegistration: true,
  enableLogin: true,
  refreshConfig: async () => {},
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState<string>(DEFAULT_APP_NAME);
  const [appLogo, setAppLogo] = useState<string>(DEFAULT_APP_LOGO);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enableRegistration, setEnableRegistration] = useState<boolean>(true);
  const [enableLogin, setEnableLogin] = useState<boolean>(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.app_name) setAppName(json.data.app_name);
        if (json.data.app_logo) setAppLogo(json.data.app_logo);
        if (json.data.enable_registration !== undefined) setEnableRegistration(json.data.enable_registration === "true");
        if (json.data.enable_login !== undefined) setEnableLogin(json.data.enable_login === "true");
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
        enableRegistration,
        enableLogin,
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
