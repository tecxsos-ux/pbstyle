'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, phone: phone || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Registrierung fehlgeschlagen.');
      }
      setFeedback(
        data.message ||
          `Willkommen im PBSTYLE Atelier Club! Eine Willkommens-E-Mail wurde an ${email} gesendet.`
      );
      setFullName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Verbindungsfehler.');
    } finally {
      setIsSubmitting(false);
    }
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
            PBSTYLE Atelier Club
          </span>
          <CardTitle className="text-3xl">Registrierung &amp; Konto</CardTitle>
          <CardDescription>
            Registrieren Sie sich für den PBSTYLE Atelier Club und erhalten Sie sofort Ihre persönliche Willkommens-E-Mail mit allen Mitglieder-Privilegien.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback && (
            <div className="p-4 rounded-md bg-bronze/10 border border-bronze/30 text-foreground text-xs flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-bronze shrink-0 mt-0.5" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="acc-name">Vollständiger Name</Label>
              <Input
                id="acc-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vor- und Nachname"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-email">E-Mail-Adresse</Label>
              <Input
                id="acc-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.ch"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-phone">Telefonnummer (optional, für Kurierzustellung)</Label>
              <Input
                id="acc-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41 79 000 00 00"
              />
            </div>

            <Button type="submit" variant="bronze" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Mail className="h-4 w-4" />
                  Wird registriert...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Kostenlos registrieren
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
