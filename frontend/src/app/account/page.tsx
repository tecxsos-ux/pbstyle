'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-14 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze">
            Sicherheit & Stammdaten
          </span>
          <CardTitle className="text-3xl">Konto-Einstellungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre persönlichen Kontaktdaten für Kurierzustellungen und Atelier-Services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {saved && (
            <div className="p-3.5 rounded-md bg-bronze/10 border border-bronze/30 text-bronze text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Einstellungen erfolgreich gespeichert.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="acc-name">Vollständiger Name</Label>
              <Input
                id="acc-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-email">E-Mail-Adresse</Label>
              <Input
                id="acc-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-phone">Telefonnummer (Kurierzustellung)</Label>
              <Input
                id="acc-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button type="submit" variant="bronze">
              <Save className="h-4 w-4" />
              Änderungen speichern
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
