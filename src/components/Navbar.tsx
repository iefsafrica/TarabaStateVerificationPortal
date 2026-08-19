"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutDashboard, LogOut } from "lucide-react";

import { useAppConfig } from "@/components/AppConfigContext";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { appName, appLogo } = useAppConfig();

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    setIsLoggedIn(!!session);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setIsLoggedIn(false);
    toast.success("Logged out successfully.");
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src={appLogo} alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg text-primary hidden sm:block">{appName}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
          <Link href="/#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Features</Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
