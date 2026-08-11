"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  ChevronLeft
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Employees List", href: "/admin/employees", icon: Users, hasSubmenu: true },
    { name: "File Manager", href: "/admin/files", icon: FolderOpen, hasSubmenu: true },
    { name: "Roles", href: "/admin/roles", icon: Shield },
    { name: "Permissions", href: "/admin/permissions", icon: Key },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
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
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? "bg-[#EDF7F2] text-green-800 font-medium" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${isActive ? "text-green-700" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronDown className={`h-4 w-4 ${isActive ? "text-green-700" : "text-gray-400"}`} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group">
            <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/tsu-logo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="object-contain md:hidden"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
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
            <div className="flex items-center gap-3 ml-2 border-l border-gray-100 pl-6 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-green-700 text-white flex items-center justify-center font-semibold text-sm">
                AU
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-gray-900 leading-tight">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
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
