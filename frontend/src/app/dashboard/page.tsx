'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-12 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/15 pb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-2">
            PBSTYLE Atelier Club
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-on-surface">
            Mitglieder-Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="px-5 py-2.5 border border-outline-variant/30 text-xs uppercase tracking-widest hover:border-primary transition-colors"
          >
            Konto-Einstellungen
          </Link>
        </div>
      </div>

      {/* Top Cards: Tier & Points & Eco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tier Status */}
        <div className="p-8 bg-surface-container-low border border-outline-variant/20 relative overflow-hidden space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block">
                Mitglieds-Status
              </span>
              <h3 className="font-serif text-2xl text-primary font-semibold mt-1">
                {profile?.membership?.tier || 'Titanium Elite'}
              </h3>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Höchste Schweizer Privilegien-Stufe. Berechtigt zu Vorabzugängen bei limitierten Tresor-Chargen.
          </p>
        </div>

        {/* Loyalty Points */}
        <div className="p-8 bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block">
                Tresor-Treuepunkte
              </span>
              <h3 className="font-serif text-2xl text-on-surface font-semibold mt-1">
                {profile?.membership?.points || 1450} Punkte
              </h3>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">token</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Einlösbar für metallurgische Werksveredelungen und personalisierte Lasergravuren.
          </p>
        </div>

        {/* Eco Standard */}
        <div className="p-8 bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant block">
                Nachhaltigkeits-Index
              </span>
              <h3 className="font-serif text-2xl text-on-surface font-semibold mt-1">
                100% Konform
              </h3>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">eco</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {profile?.membership?.eco_compliance || 'Zertifiziert nach ISO 14001 & Schweizer Sekundärmetallurgie.'}
          </p>
        </div>

      </div>

      {/* Privileges & Benefits */}
      <div className="bg-surface-container-low p-8 border border-outline-variant/20 space-y-6">
        <h3 className="font-serif text-xl border-b border-outline-variant/15 pb-3">
          Ihre Exklusiven Atelier-Vorteile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
            <h4 className="font-semibold uppercase tracking-wider">Schweizer Kurier Express</h4>
            <p className="text-on-surface-variant">Kostenloser persönlicher Kurierversand für alle Bestellungen innerhalb von 24 Stunden.</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary text-2xl">cleaning_services</span>
            <h4 className="font-semibold uppercase tracking-wider">Ultraschall-Werksreinigung</h4>
            <p className="text-on-surface-variant">Lebenslange jährliche Tiefenreinigung und Politur Ihrer Schmuckstücke im Zürcher Atelier.</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary text-2xl">lock</span>
            <h4 className="font-semibold uppercase tracking-wider">Tresor Vorab-Zugang</h4>
            <p className="text-on-surface-variant">48 Stunden vor offiziellem Erscheinen Zugang zu nummerierten Kleinserien.</p>
          </div>
        </div>
      </div>

      {/* Recent Orders History */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4">
          <h3 className="font-serif text-2xl">Bestellhistorie & Tresor-Zertifikate</h3>
          <Link href="/catalog" className="text-xs uppercase tracking-widest text-primary hover:underline">
            Neues Objekt erwerben
          </Link>
        </div>

        {profile?.recent_orders && profile.recent_orders.length > 0 ? (
          <div className="space-y-4">
            {profile.recent_orders.map((ord: any) => (
              <div
                key={ord.id}
                className="p-6 bg-surface-container-low border border-outline-variant/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-primary text-sm">{ord.order_number}</span>
                    <span className="px-2 py-0.5 bg-surface text-on-surface border border-outline-variant/30 uppercase text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-on-surface-variant">
                    {new Date(ord.created_at).toLocaleDateString('de-CH')} • {ord.items?.length || 1} Artikel
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-base text-on-surface font-semibold block">
                    CHF {ord.total_amount?.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/70 uppercase">
                    Inkl. MWST & Echtheitszertifikat
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-container-low border border-outline-variant/15 space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant/60">history</span>
            <p className="font-serif text-lg">Noch keine Bestellungen aufgegeben</p>
            <p className="text-xs text-on-surface-variant">Erwerben Sie Ihr erstes Unikat im Katalog.</p>
          </div>
        )}
      </div>

    </div>
  );
}
