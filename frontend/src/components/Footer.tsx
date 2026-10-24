'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 pt-20 pb-12 text-on-surface">
      <div className="max-w-container-max mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-outline-variant/10">
          
          {/* Brand Manifesto */}
          <div className="md:col-span-5 space-y-6">
            <span className="font-serif text-3xl tracking-tighter text-on-surface block">pbstyle</span>
            <p className="font-sans text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Wo Schweizer Industriepräzision auf die edle Kunst der Haute Joaillerie trifft. Entwickelt und veredelt in Zürich für den Avantgarde-Kollektor.
            </p>
            <div className="space-y-1 text-xs font-sans text-on-surface-variant/80">
              <p>Bahnhofstrasse 45, 8001 Zürich, Schweiz</p>
              <p className="font-mono text-[11px]">UID: CHE-114.882.901 MWST</p>
            </div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-primary font-sans pt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Zertifizierte Schweizer Metallurgie • ISO 9001</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-on-surface font-semibold">
              Kollektionen
            </h4>
            <ul className="space-y-3 font-sans text-xs uppercase tracking-wider text-on-surface-variant">
              <li>
                <Link href="/catalog" className="hover:text-primary transition-colors">
                  Alle Objekte
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=schmuck" className="hover:text-primary transition-colors">
                  Platin- & Titanschmuck
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=beauty-tools" className="hover:text-primary transition-colors">
                  Präzisions-Beautytools
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="hover:text-primary transition-colors">
                  Markenphilosophie
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Mitglieder-Tresor
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-on-surface font-semibold">
              Exklusiver Tresor-Zugang
            </h4>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Abonnieren Sie unser Journal für Vorab-Mitteilungen über limitierte Platin-Chargen und Neuentwicklungen.
            </p>
            {subscribed ? (
              <div className="p-3 bg-surface border border-primary text-primary text-xs uppercase tracking-widest font-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Vielen Dank für Ihre Registrierung.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex border-b border-outline-variant pb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ihre E-Mail-Adresse"
                  required
                  className="bg-transparent border-none focus:outline-none w-full font-sans text-xs placeholder:text-outline-variant text-on-surface"
                />
                <button 
                  type="submit"
                  className="font-sans text-xs uppercase tracking-widest text-primary hover:opacity-75 transition-opacity pl-2 flex-shrink-0"
                >
                  Abonnieren
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-on-surface-variant/70">
          <p>© 2026 PBSTYLE Atelier für industrielle Eleganz. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap gap-4 md:gap-6 uppercase tracking-widest text-[11px]">
            <Link href="/brand-story" className="hover:text-primary transition-colors">
              Nachhaltigkeit
            </Link>
            <Link href="/brand-story" className="hover:text-primary transition-colors">
              Impressum & AGB
            </Link>
            <Link href="/llms.txt" target="_blank" className="hover:text-primary transition-colors">
              AIO Manifest
            </Link>
            <Link href="/llms-full.txt" target="_blank" className="hover:text-primary transition-colors">
              GIO Factsheet
            </Link>
            <Link href="/admin/login" className="text-primary hover:underline transition-colors font-medium">
              Atelier Portal ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
