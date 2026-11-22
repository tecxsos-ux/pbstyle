'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LockOpen, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-container-max w-full mx-auto flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Storefront
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      {/* Centered Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <Card className="shadow-xl border-border/80">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto h-11 w-11 rounded-lg bg-bronze/15 border border-bronze/30 flex items-center justify-center text-bronze">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Badge variant="bronze">Atelier Command Center</Badge>
              <CardTitle className="text-3xl pt-1">pbstyle Admin</CardTitle>
              <CardDescription>
                Zugang zu CRM, Inventar, Rechnungen &amp; Instagram Auto-Post.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-xs text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Admin E-Mail</Label>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pbstyle.ch"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Passwort</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                <LockOpen className="h-4 w-4" />
                {isLoading ? 'Wird geprüft...' : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-[11px] text-muted-foreground font-mono">
        PBSTYLE Schweiz AG
      </p>
    </div>
  );
}
