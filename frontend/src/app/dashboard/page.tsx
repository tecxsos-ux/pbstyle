'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Coins,
  History,
  Leaf,
  Lock,
  Settings,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 gap-4">
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze block">
            PBSTYLE Atelier Club
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-foreground">Mitglieder-Dashboard</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/account">
            <Settings className="h-4 w-4" />
            Konto-Einstellungen
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Mitglieds-Status
                </span>
                <h3 className="font-serif text-2xl text-bronze mt-1">
                  {profile?.membership?.tier || 'Titanium Elite'}
                </h3>
              </div>
              <Award className="h-6 w-6 text-bronze" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Höchste Privilegien-Stufe mit Vorabzugang zu limitierten Tresor-Chargen.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tresor-Treuepunkte
                </span>
                <h3 className="font-mono text-2xl font-semibold text-foreground mt-1">
                  {profile?.membership?.points || 1450} Pkt.
                </h3>
              </div>
              <Coins className="h-6 w-6 text-bronze" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Einlösbar für metallurgische Werksveredelungen und personalisierte Lasergravuren.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Nachhaltigkeits-Index
                </span>
                <h3 className="font-serif text-2xl text-foreground mt-1">100% Konform</h3>
              </div>
              <Leaf className="h-6 w-6 text-bronze" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {profile?.membership?.eco_compliance ||
                'Zertifiziert nach ISO 14001 & Schweizer Sekundärmetallurgie.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Ihre Exklusiven Atelier-Vorteile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <Truck className="h-5 w-5 text-bronze" />
            <h4 className="font-semibold uppercase tracking-wider">Schweizer Kurier Express</h4>
            <p className="text-muted-foreground">
              Kostenloser persönlicher Kurierversand für alle Bestellungen innerhalb von 24 Stunden.
            </p>
          </div>
          <div className="space-y-2">
            <Sparkles className="h-5 w-5 text-bronze" />
            <h4 className="font-semibold uppercase tracking-wider">Ultraschall-Werksreinigung</h4>
            <p className="text-muted-foreground">
              Lebenslange jährliche Tiefenreinigung und Politur Ihrer Schmuckstücke im Zürcher Atelier.
            </p>
          </div>
          <div className="space-y-2">
            <Lock className="h-5 w-5 text-bronze" />
            <h4 className="font-semibold uppercase tracking-wider">Tresor Vorab-Zugang</h4>
            <p className="text-muted-foreground">
              48 Stunden vor offiziellem Erscheinen Zugang zu nummerierten Kleinserien.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="font-serif text-2xl">Bestellhistorie & Zertifikate</h3>
          <Button variant="link" asChild>
            <Link href="/catalog">Neues Objekt erwerben</Link>
          </Button>
        </div>

        {profile?.recent_orders && profile.recent_orders.length > 0 ? (
          <div className="space-y-3">
            {profile.recent_orders.map((ord: any) => (
              <Card key={ord.id}>
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-semibold text-bronze text-sm">
                        {ord.order_number}
                      </span>
                      <Badge variant="secondary">{ord.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {new Date(ord.created_at).toLocaleDateString('de-CH')} •{' '}
                      {ord.items?.length || 1} Artikel
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-semibold block">
                      CHF {ord.total_amount?.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Inkl. MWST & Echtheitszertifikat
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center space-y-3">
            <History className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="font-serif text-lg">Noch keine Bestellungen aufgegeben</p>
            <p className="text-xs text-muted-foreground">
              Erwerben Sie Ihr erstes Unikat im Katalog.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
