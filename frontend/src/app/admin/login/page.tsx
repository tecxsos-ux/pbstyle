'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@pbstyle.ch');
  const [password, setPassword] = useState('PBstyle2026!Admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Anmeldung fehlgeschlagen.');
      }

      const tokenData = await res.json();
      localStorage.setItem('pbstyle_admin_token', tokenData.access_token);
      localStorage.setItem('pbstyle_admin_user', JSON.stringify(tokenData.user));
      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verbindungsfehler zum Admin-Server.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCreds = () => {
    setEmail('admin@pbstyle.ch');
    setPassword('PBstyle2026!Admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-background font-sans">
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 p-8 md:p-10 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="font-serif text-3xl tracking-tighter text-on-surface inline-block">
            pbstyle
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary block">
            Atelier Command Center • Zürich
          </span>
          <h1 className="font-serif text-2xl text-on-surface pt-2">Admin-Anmeldung</h1>
          <p className="text-xs text-on-surface-variant">
            Zugang zu CRM, Inventar & Rechnungsverwaltung.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs uppercase tracking-widest text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-xs">
          <div>
            <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
              Admin E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pbstyle.ch"
              className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div>
            <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
              Passwort
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-on-background text-background uppercase tracking-[0.2em] font-semibold hover:bg-primary transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">lock_open</span>
            <span>{isLoading ? 'Wird geprüft...' : 'Anmelden'}</span>
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 bg-surface border border-outline-variant/20 rounded-none text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary uppercase tracking-widest text-[10px]">
              Vorkonfiguriertes Admin-Konto
            </span>
            <button
              onClick={fillDemoCreds}
              className="text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-primary underline"
            >
              Einfügen
            </button>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            E-Mail: <span className="font-mono text-on-surface">admin@pbstyle.ch</span><br />
            Passwort: <span className="font-mono text-on-surface">PBstyle2026!Admin</span>
          </p>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-on-surface-variant hover:text-primary uppercase tracking-widest">
            ← Zurück zum Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
