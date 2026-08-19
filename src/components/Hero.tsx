"use client";

import Link from 'next/link';
import Image from 'next/image';
import TypewriterText from './TypewriterText';
import { useAppConfig } from './AppConfigContext';

export default function Hero() {
  const { appName, appLogo } = useAppConfig();

  return (
    <section className="relative w-full bg-gradient-to-b from-green-50 to-white py-24 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col space-y-6 text-center lg:text-left min-h-[300px] justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground min-h-[140px] sm:min-h-[120px] lg:min-h-[180px]">
              <TypewriterText text={appName} delay={100} />
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground opacity-0 animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
              A centralized platform for staff registration, identity verification, and secure staff record management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '1.7s' }}>
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-foreground bg-primary rounded-md shadow hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 duration-200">
                Register Now
              </Link>
              <Link href="/track" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-medium text-foreground bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 duration-200">
                Track Application
              </Link>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-md lg:max-w-full opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="animate-float">
              <Image 
                src={appLogo} 
                alt="Application Logo" 
                width={600} 
                height={400} 
                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-in-out" 
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
