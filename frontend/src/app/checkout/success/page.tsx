'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { verifyStripeSessionApi, StripeVerifyResponse } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearUserCart } = useCart();

  const [result, setResult] = useState<StripeVerifyResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sessionId) {
      setError('Keine Stripe-Zahlungsreferenz gefunden.');
      setLoading(false);
      return;
    }

    verifyStripeSessionApi(sessionId)
      .then((data) => {
        setResult(data);
        if (data.paid) {
          clearUserCart();
        }
      })
      .catch((err) => setError(err.message || 'Fehler bei der Zahlungsverifizierung.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 text-bronze animate-spin mx-auto" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Verifiziere Stripe-Zahlung...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <Card className="p-8 text-center space-y-5">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h1 className="font-serif text-2xl">Verifizierung fehlgeschlagen</h1>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/checkout">Zurück zur Kasse</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const { order } = result;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardContent className="p-8 md:p-10 text-center space-y-7">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" className="font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              Stripe Zahlung Bestätigt
            </Badge>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Vielen Dank für Ihre Bestellung
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Ihre Bestellung{' '}
              <span className="font-mono font-semibold text-foreground">{order.order_number}</span>{' '}
              wurde erfolgreich bezahlt. Eine Bestätigung wurde an{' '}
              <span className="font-medium text-foreground">{order.customer_email}</span> gesendet.
            </p>
          </div>

          <div className="rounded-md bg-muted/40 border border-border p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bestellnummer</span>
              <span className="font-mono font-semibold text-bronze">{order.order_number}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bezahlter Betrag</span>
              <span className="font-mono font-semibold text-foreground">
                CHF {order.total_amount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="success">{order.status}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lieferadresse</span>
              <span className="text-right">
                {order.shipping_address.address}, {order.shipping_address.postal_code}{' '}
                {order.shipping_address.city}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button variant="bronze" size="lg" asChild>
              <Link href="/catalog">
                Weiter einkaufen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/dashboard">Zum Mitglieder-Tresor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Lade Bestätigung...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
