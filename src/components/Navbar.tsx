import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/tsu-logo.png" alt="TSU Logo" width={40} height={40} className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg text-primary hidden sm:block">Taraba State Verification Portal</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
          <Link href="/#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="/auth/login" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm">
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
