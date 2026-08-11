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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Employees List": true // Open by default if we want, or handle dynamically
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    // Check if session is active
    const session = localStorage.getItem("admin_session");
    if (!session) {
      toast.error("Please login to access the dashboard.");
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    toast.success("Logged out successfully.");
    router.push("/auth/login");
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
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/tsu-logo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <span className="font-bold text-sm leading-tight text-gray-900">
              Taraba State <br /> Verification Portal
            </span>
          </Link>
          <button 
            className="ml-auto text-gray-400 hover:text-gray-600 md:hidden"
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
              <div key={item.name} className="space-y-1">
                {item.href ? (
                  <Link 
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                      pathname === item.href 
                        ? "bg-[#EDF7F2] text-green-800 font-medium" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-green-700" : "text-gray-400 group-hover:text-gray-600"}`} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </Link>
                ) : (
                  <button 
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive 
                        ? "bg-[#EDF7F2] text-green-800 font-medium" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${isActive ? "text-green-700" : "text-gray-400 group-hover:text-gray-600"}`} />
                      <span className="text-base">{item.name}</span>
                    </div>
                    {hasSubmenu && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? "rotate-180" : ""} ${isActive ? "text-green-700" : "text-gray-400"}`} />
                    )}
                  </button>
                )}

                {/* Submenu Items */}
                {hasSubmenu && isMenuOpen && item.subItems && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-4 py-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === subItem.href
                            ? "bg-[#EDF7F2] text-green-800 font-medium"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group"
          >
            <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg mr-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Image 
              src="/images/tsu-logo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="object-contain md:hidden"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {pathname === "/admin/dashboard" && "Dashboard"}
                {pathname === "/admin/employees" && "Employee"}
                {pathname === "/admin/files" && "File Manager"}
                {pathname === "/admin/roles" && "Roles"}
                {pathname === "/admin/permissions" && "Permissions"}
              </h1>
              <p className="text-xs text-gray-500">Taraba State Verification Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <div className="relative">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                2
              </span>
            </div>
            <div className="relative">
              <div 
                className="flex items-center gap-3 ml-2 border-l border-gray-100 pl-6 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="h-9 w-9 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold text-sm">
                  AU
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-semibold text-gray-900 leading-tight">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 ml-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              
              {/* Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900">info@tarabastate.gov</p>
                  </div>
                  <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    My Profile
                  </Link>
                  <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
