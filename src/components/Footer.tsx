export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Taraba State Verification Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
