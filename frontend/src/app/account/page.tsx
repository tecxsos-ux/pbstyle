'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [fullName, setFullName] = useState('Philippe Bernasconi');
  const [email, setEmail] = useState('philippe.bernasconi@pbstyle.ch');
  const [phone, setPhone] = useState('+41 44 211 44 88');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-16 space-y-10 font-sans">
      <div className="border-b border-outline-variant/15 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-2">
          Sicherheit & Stammdaten
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface">
          Konto-Einstellungen
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-primary/10 border border-primary text-primary text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Einstellungen erfolgreich gespeichert.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div>
          <label className="block uppercase tracking-widest text-on-surface-variant mb-1.5 font-semibold">
            Vollständiger Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface"
          />
        </div>

        <div>
          <label className="block uppercase tracking-widest text-on-surface-variant mb-1.5 font-semibold">
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface"
          />
        </div>

        <div>
          <label className="block uppercase tracking-widest text-on-surface-variant mb-1.5 font-semibold">
            Telefonnummer (für Kurierzustellung)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface"
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="submit"
            className="px-8 py-3.5 bg-primary text-on-primary uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
          >
            Änderungen speichern
          </button>
          <Link
            href="/dashboard"
            className="text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}
