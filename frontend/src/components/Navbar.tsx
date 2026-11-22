'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  User,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const leftLinks = [
    { name: 'Kollektion', href: '/catalog' },
    { name: 'Platinschmuck', href: '/catalog?category=schmuck' },
    { name: 'Beauty-Tools', href: '/catalog?category=beauty-tools' },
    { name: 'Atelier', href: '/brand-story' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 transition-all duration-300">
        {/* Swiss Utility Announcement Bar */}
        <div className="bg-primary text-primary-foreground border-b border-border/20">
          <div className="max-w-container-max mx-auto px-4 md:px-10 h-8 flex items-center justify-center sm:justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
            <span>Kostenloser Schweizer Kurierversand ab CHF 150</span>
            <span className="hidden md:inline opacity-80">Toleranz ±0.01 mm</span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <nav
          className={`transition-all duration-300 border-b ${
            scrolled
              ? 'glass-nav border-border/90 shadow-sm h-16'
              : 'bg-background/95 backdrop-blur-md border-border/50 h-[72px]'
          }`}
        >
          <div className="max-w-container-max mx-auto px-4 md:px-10 h-full grid grid-cols-3 items-center">
            {/* Left Zone: Mobile Trigger + Desktop Nav */}
            <div className="flex items-center gap-6">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-foreground -ml-2"
                    aria-label="Menü öffnen"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col justify-between">
                  <div className="space-y-8">
                    <SheetHeader>
                      <SheetTitle className="font-serif text-2xl tracking-tight">
                        pbstyle
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1">
                      {leftLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-3 rounded-md text-xs uppercase tracking-[0.2em] text-foreground hover:bg-accent hover:text-bronze transition-colors"
                        >
                          {link.name}
                        </Link>
                      ))}
                      <Separator className="my-3" />
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-3 rounded-md text-xs uppercase tracking-[0.2em] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2.5"
                      >
                        <User className="h-4 w-4" />
                        Mitglieder-Tresor
                      </Link>
                      <Link
                        href="/admin/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-3 rounded-md text-xs uppercase tracking-[0.2em] text-bronze hover:bg-accent transition-colors flex items-center gap-2.5"
                      >
                        <Shield className="h-4 w-4" />
                        Atelier Admin
                      </Link>
                    </nav>
                  </div>
                  <div className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="uppercase tracking-widest">Darstellung</span>
                      <ThemeToggle />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      © 2026 PBSTYLE Atelier Zürich
                    </p>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden lg:flex items-center gap-7">
                {leftLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-[11px] uppercase tracking-[0.18em] transition-colors py-1 relative group ${
                        isActive
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.name}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-bronze transition-all duration-300 ${
                          isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Center Zone: Luxury House Wordmark */}
            <div className="flex justify-center">
              <Link href="/" className="flex flex-col items-center group">
                <span className="font-serif text-2xl md:text-[28px] leading-none tracking-[-0.02em] text-foreground group-hover:opacity-80 transition-opacity">
                  pbstyle
                </span>
                <span className="hidden sm:block font-mono text-[8px] uppercase tracking-[0.38em] text-muted-foreground mt-1">
                  Atelier Zürich
                </span>
              </Link>
            </div>

            {/* Right Zone: Search, Theme, Account, Vault Cart */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Kollektion durchsuchen"
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
              >
                <Link href="/dashboard" aria-label="Mitglieder-Dashboard">
                  <User className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                aria-label="Warenkorb öffnen"
                className="relative gap-2 px-3 h-9 border-border/80 hover:border-bronze/60 ml-1"
              >
                <ShoppingBag className="h-4 w-4 text-bronze" />
                <span className="hidden sm:inline text-[11px]">Tresor</span>
                {cart.item_count > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-bronze text-bronze-foreground font-mono text-[10px] font-semibold h-4 min-w-[16px] px-1">
                    {cart.item_count}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Command-Style Quick Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kollektion durchsuchen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="space-y-4 pt-1">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suchen nach 950 Platin, Monolith Ring, Pinzette..."
                className="pl-10 h-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['Platin', 'Monolith', 'Pinzette', 'Titan'].map((term) => (
                <Button
                  key={term}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/catalog?search=${encodeURIComponent(term)}`);
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
            <Button type="submit" variant="bronze" className="w-full">
              Ergebnisse anzeigen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
