"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Shield, 
  Key, 
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  Settings
} from "lucide-react";

import { useAppConfig } from "@/components/AppConfigContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { appName, appLogo } = useAppConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Employees List": true // Open by default if we want, or handle dynamically
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const [userProfile, setUserProfile] = useState({
    fullName: "Admin User",
    email: "info@tarabastate.gov",
    role: "Administrator",
    avatar: "",
  });

  const loadUserProfile = () => {
    const saved = localStorage.getItem("admin_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile({
          fullName: parsed.fullName || "Admin User",
          email: parsed.email || "info@tarabastate.gov",
          role: parsed.role || "Administrator",
          avatar: parsed.avatar || "",
        });
      } catch {
        // ignore parse error
      }
    }
  };

  useEffect(() => {
    // Check if session is active
    const session = localStorage.getItem("admin_session");
    if (!session) {
      toast.error("Please login to access the dashboard.");
      router.push("/auth/login");
    }

    loadUserProfile();

    const handleProfileUpdate = () => loadUserProfile();
    window.addEventListener("admin_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("admin_profile_updated", handleProfileUpdate);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    toast.success("Logged out successfully.");
    router.push("/auth/login");
  };

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New employee verification submitted", time: "10m ago", read: false },
    { id: 2, title: "Document verification pending review", time: "1h ago", read: false },
    { id: 3, title: "System permissions updated", time: "1 day ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { 
      name: "Employees List", 
      icon: Users, 
      subItems: [
        { name: "Employee", href: "/admin/employees" }
      ]
    },
    { 
      name: "File Manager", 
      icon: FolderOpen, 
      subItems: [
        { name: "File Manager", href: "/admin/files" },
        { name: "Official Documents", href: "/admin/documents" }
      ]
    },
    { name: "Roles", href: "/admin/roles", icon: Shield },
    { name: "Permissions", href: "/admin/permissions", icon: Key },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image 
              src={appLogo} 
              alt="Logo" 
              width={36} 
              height={36} 
              className="object-contain"
            />
            <span className="font-bold text-base text-gray-900 leading-tight">
              {appName}
            </span>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const hasSubmenu = !!item.subItems;
            const isMenuOpen = openMenus[item.name];
            const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));

            return (
              <div key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive ? "bg-green-50 text-[#00894F]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${isActive ? "text-[#00894F]" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${isMenuOpen ? "transform rotate-180" : ""}`} 
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                      ${isActive ? "bg-green-50 text-[#00894F]" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-[#00894F]" : "text-gray-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isMenuOpen && (
                  <div className="mt-1 ml-9 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            block px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200
                            ${isSubActive ? "bg-green-100/50 text-[#00894F]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                          `}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info at Bottom of Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 text-[#00894F] flex items-center justify-center font-bold text-sm">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">Super Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@taraba.gov.ng</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {pathname === "/admin/dashboard" && "Dashboard"}
                {pathname === "/admin/employees" && "Employee Records"}
                {pathname === "/admin/files" && "File Manager"}
                {pathname === "/admin/documents" && "Official Documents"}
                {pathname === "/admin/roles" && "Roles"}
                {pathname === "/admin/permissions" && "Permissions"}
                {pathname === "/admin/settings" && "Settings"}
                {pathname === "/admin/profile" && "My Profile"}
              </h1>
              <p className="text-xs text-gray-500">{appName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="w-48 focus:w-64 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsDropdownOpen(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
              >
                <Bell className="h-5 w-5" />
              </button>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-fade-in-up">
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-green-700 font-medium hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-green-50/40" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-green-600 shrink-0 mt-1" />}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <div 
                className="flex items-center gap-3 ml-2 border-l border-gray-100 pl-6 cursor-pointer"
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotificationsOpen(false); }}
              >
                {userProfile.avatar ? (
                  /* eslint-disable-next-html-element-warnings, @next/next/no-img-element */
                  <img
                    src={userProfile.avatar}
                    alt="Avatar"
                    className="h-9 w-9 rounded-full object-cover shadow-sm border border-green-700"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold text-sm shadow-sm uppercase">
                    {userProfile.fullName.split(" ").map(n => n[0]).join("").slice(0, 2) || "AU"}
                  </div>
                )}
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-gray-900 leading-tight">{userProfile.fullName}</p>
                  <p className="text-xs text-gray-500">{userProfile.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 ml-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              
              {/* Profile Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs font-medium text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{userProfile.email}</p>
                  </div>
                  <Link 
                    href="/admin/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/admin/settings" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-50 mt-1"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
