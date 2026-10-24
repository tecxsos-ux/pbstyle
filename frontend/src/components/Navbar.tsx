'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen } = useCart();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Kollektionen', href: '/catalog' },
    { name: 'Schmuck', href: '/catalog?category=schmuck' },
    { name: 'Beauty-Tools', href: '/catalog?category=beauty-tools' },
    { name: 'Neuheiten', href: '/catalog?category=neuheiten' },
    { name: 'Markenphilosophie', href: '/brand-story' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-40 glass-nav border-b border-outline-variant/30 transition-colors duration-300">
        <div className="max-w-container-max mx-auto px-4 md:px-12 flex justify-between items-center h-20">
          
          {/* Left section: Hamburger (Mobile) & Brand Logo */}
          <div className="flex items-center gap-6 md:gap-12">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="material-symbols-outlined text-on-surface hover:text-primary transition-colors md:hidden active:scale-95 cursor-pointer"
              aria-label="Menü öffnen"
            >
              menu
            </button>
            <Link 
              href="/" 
              className="font-serif text-2xl md:text-3xl tracking-tighter text-on-surface hover:opacity-85 transition-opacity"
            >
              pbstyle
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-sans text-xs uppercase tracking-widest transition-colors py-1 relative ${
                      isActive 
                        ? 'text-primary font-semibold' 
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-primary animate-fade-in" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right section: Icons (Theme, Cart Bag, Account) */}
          <div className="flex items-center gap-4 md:gap-6">
            <ThemeToggle />

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 relative flex items-center"
              aria-label="Warenkorb öffnen"
            >
              shopping_bag
              {cart.item_count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                  {cart.item_count}
                </span>
              )}
            </button>

            {/* Dashboard / Account */}
            <Link
              href="/dashboard"
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
              aria-label="Mitglieder-Dashboard"
            >
              person
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-80 bg-surface border-r border-outline-variant/30 p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
                  <span className="font-serif text-2xl tracking-tighter text-on-surface">pbstyle</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="material-symbols-outlined text-on-surface hover:text-primary transition-colors"
                  >
                    close
                  </button>
                </div>

                <nav className="flex flex-col gap-5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-sans text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors border-b border-outline-variant/10 pb-2.5"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-sans text-sm uppercase tracking-widest text-on-surface hover:text-primary transition-colors border-b border-outline-variant/10 pb-2.5"
                  >
                    Mitglieder-Dashboard
                  </Link>
                </nav>
              </div>

              <div className="border-t border-outline-variant/20 pt-6 space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant uppercase tracking-widest">Design-Modus</span>
                  <ThemeToggle />
                </div>
                <p className="text-on-surface-variant/60 text-center uppercase tracking-widest pt-2">
                  © 2026 PBSTYLE Atelier
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
