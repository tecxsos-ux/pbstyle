'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: email.split('@')[0] }),
      });
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border pt-16 pb-10 text-foreground">
      <div className="max-w-container-max mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl tracking-tight text-foreground">pbstyle</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze">
                Atelier Zürich
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Wo Schweizer Industriepräzision auf die Kunst der Haute Joaillerie trifft. Massives 950er Platin, Raumfahrttitan Grade 5 und Chirurgenstahl 316L.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <p>Bahnhofstrasse 45, 8001 Zürich, Schweiz</p>
              <p>UID: CHE-114.882.901 MWST</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-foreground font-semibold">
              Kollektionen
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Alle Objekte
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=schmuck" className="hover:text-foreground transition-colors">
                  Platin- & Titanschmuck
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=beauty-tools" className="hover:text-foreground transition-colors">
                  Präzisions-Beautytools
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="hover:text-foreground transition-colors">
                  Markenphilosophie
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Mitglieder-Tresor
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-foreground font-semibold">
              Exklusiver Tresor-Zugang
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Erhalten Sie Vorab-Mitteilungen über limitierte Platin-Chargen und neue Atelier-Editionen.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-md bg-bronze/10 border border-bronze/30 text-bronze text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Vielen Dank für Ihre Registrierung.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.ch"
                  required
                  className="text-xs"
                />
                <Button type="submit" variant="default" size="sm" className="h-10 px-4 shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Anmelden</span>
                </Button>
              </form>
            )}
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 PBSTYLE Atelier für industrielle Eleganz. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-widest">
            <Link href="/brand-story" className="hover:text-foreground transition-colors">
              Nachhaltigkeit
            </Link>
            <Link href="/brand-story" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link
              href="/admin/login"
              className="text-bronze hover:underline font-medium inline-flex items-center gap-1"
            >
              Atelier Admin
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
