"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, Info, Copy } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link href="/">
            <Image 
              src="/images/tsu-logo.png" 
              alt="Taraba State University Logo" 
              width={80} 
              height={80} 
              className="object-contain hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
            Sign in to your account
          </h2>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <form className="p-6 sm:p-8 space-y-6 relative" onSubmit={(e) => e.preventDefault()}>
            
            {/* Toggle Demo Credentials */}
            <button 
              className="absolute -top-10 right-0 text-xs text-gray-500 hover:text-gray-700 bg-transparent h-9 px-3 rounded-md focus:outline-none transition-colors hidden sm:block" 
              type="button"
              onClick={() => setShowDemo(!showDemo)}
            >
              {showDemo ? "Hide demo credentials" : "Show demo credentials"}
            </button>

            {/* Demo Credentials Box */}
            <div className={`overflow-hidden transition-all duration-300 ${showDemo ? 'max-h-60 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Demo Credentials
                  </h3>
                  <button className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded transition-colors" type="button">
                    Auto-fill
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-blue-700"><span className="font-medium">Username:</span> admin</div>
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors" type="button" title="Copy username">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-blue-700"><span className="font-medium">Password:</span> admin123</div>
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors" type="button" title="Copy password">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">These credentials are for demonstration purposes only.</p>
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Username
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="username" 
                  className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  placeholder="Enter your username" 
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  placeholder="Enter your password" 
                  required 
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col gap-4">
              <button 
                type="submit" 
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Protected by Federal Government of Nigeria security protocols
              </p>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
