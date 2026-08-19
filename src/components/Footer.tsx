"use client";

import { useAppConfig } from "./AppConfigContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { appName } = useAppConfig();

  return (
    <footer className="w-full bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} {appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
