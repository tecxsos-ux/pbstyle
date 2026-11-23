'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  Smartphone,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import {
  validateDiscountCodeApi,
  createOrderApi,
  createPaymentIntentApi,
  confirmPaymentIntentApi,
} from '@/lib/api';
import { Order } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function InAppPaymentForm({
  amountChf,
  orderNumber,
  onSuccess,
  onBack,
}: {
  amountChf: number;
  orderNumber: string;
  onSuccess: (order: Order) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setPayError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPayError(error.message || 'Zahlung konnte nicht abgeschlossen werden.');
      setIsPaying(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const verified = await confirmPaymentIntentApi(paymentIntent.id);
        onSuccess(verified.order);
      } catch (err: any) {
        setPayError(err.message || 'Zahlung erfolgreich, aber Bestätigung fehlgeschlagen.');
        setIsPaying(false);
      }
    } else {
      setPayError('Zahlung wird noch verarbeitet. Bitte prüfen Sie Ihre E-Mail.');
      setIsPaying(false);
    }
  };

  return (
    <Card className="border-bronze/40 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
              Bestellung {orderNumber}
            </span>
            <CardTitle className="mt-1">Sichere In-App Zahlung</CardTitle>
            <CardDescription>
              Bezahlen Sie direkt hier mit Kreditkarte, Apple Pay, Google Pay oder TWINT — ohne Weiterleitung.
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConfirm} className="space-y-6">
          {payError && (
            <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-xs">
              {payError}
            </div>
          )}

          <div className="p-4 rounded-md border border-border bg-background">
            <PaymentElement
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          <Button
            type="submit"
            variant="bronze"
            size="lg"
            className="w-full"
            disabled={!stripe || isPaying}
          >
            {isPaying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Zahlung wird verarbeitet...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                CHF {amountChf.toLocaleString('de-CH', { minimumFractionDigits: 2 })} jetzt bezahlen
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CheckoutContent() {
  const { cart, clearUserCart } = useCart();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Schweiz');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'twint' | 'wire'>('card');

  // Embedded Stripe PaymentIntent state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>('');
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    setPromoMessage('');
    try {
      const res = await validateDiscountCodeApi(promoCode);
      setDiscountPercent(res.valid ? res.discount_percent : 0);
      setPromoMessage(res.message);
    } catch {
      setPromoMessage('Gutscheincode konnte nicht validiert werden.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const discountAmount = Math.round(cart.subtotal * (discountPercent / 100) * 100) / 100;
  const shippingCost = cart.subtotal > 150 ? 0 : 15;
  const finalTotal = Math.max(0, cart.subtotal - discountAmount + shippingCost);

  const handleContinueOrOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      setErrorMessage('Ihr Warenkorb ist leer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      session_id: cart.session_id,
      customer_email: email,
      customer_name: `${firstName} ${lastName}`,
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address,
        city,
        postal_code: postalCode,
        country,
      },
      promo_code: discountPercent > 0 ? promoCode : null,
      payment_method:
        paymentMethod === 'card'
          ? 'Karte / Apple Pay (In-App)'
          : paymentMethod === 'twint'
          ? 'TWINT Schweizer Zahlungsapp'
          : 'Banküberweisung / QR-Rechnung',
    };

    try {
      if (paymentMethod === 'card') {
        const pi = await createPaymentIntentApi(payload);
        setClientSecret(pi.client_secret);
        setPendingOrderNumber(pi.order_number);
        setPendingAmount(pi.amount_chf);
        setIsSubmitting(false);
        return;
      }

      // Direct in-app TWINT / Banküberweisung order creation + instant invoice email
      const orderResult = await createOrderApi(payload);
      setCompletedOrder(orderResult);
      await clearUserCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Abschluss der Bestellung.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <Card className="p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <Badge variant="success">Bestellung Bestätigt</Badge>
            <h1 className="font-serif text-3xl text-foreground">Vielen Dank für Ihre Bestellung</h1>
            <p className="text-xs text-muted-foreground">
              Bestellnummer{' '}
              <span className="font-mono font-semibold text-foreground">
                {completedOrder.order_number}
              </span>{' '}
              und Ihre offizielle Rechnung wurden an{' '}
              <span className="font-medium text-foreground">{completedOrder.customer_email}</span>{' '}
              gesendet.
            </p>
          </div>

          <div className="rounded-md bg-muted/40 border border-border p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gesamtbetrag</span>
              <span className="font-mono font-semibold text-bronze">
                CHF {completedOrder.total_amount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zahlungsmethode</span>
              <span className="text-right font-medium">{completedOrder.payment_method}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lieferadresse</span>
              <span className="text-right">
                {completedOrder.shipping_address.address},{' '}
                {completedOrder.shipping_address.postal_code} {completedOrder.shipping_address.city}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary">{completedOrder.status}</Badge>
            </div>
          </div>

          <Button asChild size="lg" variant="bronze">
            <Link href="/catalog">Weiter einkaufen</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-10 py-12 space-y-8">
      <div className="space-y-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze block">
          Sicherer Tresor-Checkout
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-foreground">Kasse</h1>
      </div>

      {cart.items.length === 0 ? (
        <Card className="p-16 text-center space-y-5">
          <p className="font-serif text-2xl">Ihr Warenkorb ist derzeit leer.</p>
          <Button variant="bronze" asChild>
            <Link href="/catalog">Zur Kollektion</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: 'de',
                  appearance: {
                    theme: isDark ? 'night' : 'stripe',
                    variables: {
                      colorPrimary: '#9A7B56',
                      borderRadius: '6px',
                      fontFamily: 'Hanken Grotesk, system-ui, sans-serif',
                    },
                  },
                }}
              >
                <InAppPaymentForm
                  amountChf={pendingAmount}
                  orderNumber={pendingOrderNumber}
                  onBack={() => setClientSecret('')}
                  onSuccess={async (order) => {
                    setCompletedOrder(order);
                    setClientSecret('');
                    await clearUserCart();
                  }}
                />
              </Elements>
            ) : (
              <form onSubmit={handleContinueOrOrder} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-md bg-destructive/10 border border-destructive/40 text-destructive text-xs">
                    {errorMessage}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>1. Kontaktinformationen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="checkout-email">E-Mail-Adresse</Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.ch"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Lieferadresse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="first-name">Vorname</Label>
                        <Input
                          id="first-name"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="last-name">Nachname</Label>
                        <Input
                          id="last-name"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Straße &amp; Hausnummer</Label>
                      <Input
                        id="address"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Bahnhofstrasse 10"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="postal">Postleitzahl</Label>
                        <Input
                          id="postal"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="8001"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="city">Stadt / Ort</Label>
                        <Input
                          id="city"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Zürich"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Land</Label>
                      <Select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      >
                        <option value="Schweiz">Schweiz (Liechtenstein)</option>
                        <option value="Deutschland">Deutschland</option>
                        <option value="Österreich">Österreich</option>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. Zahlungsmethode (Direkt in der App)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-md border cursor-pointer transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-bronze bg-bronze/10 text-foreground'
                          : 'border-border hover:border-bronze/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-0.5 accent-[hsl(var(--bronze))]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-bronze" />
                            Kreditkarte, Apple Pay &amp; Google Pay (In-App)
                          </span>
                          <Badge variant="bronze">Empfohlen</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Direkte, verschlüsselte Kartenzahlung auf pbstyle.ch ohne Weiterleitung.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-md border cursor-pointer transition-colors ${
                        paymentMethod === 'twint'
                          ? 'border-bronze bg-bronze/10 text-foreground'
                          : 'border-border hover:border-bronze/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'twint'}
                        onChange={() => setPaymentMethod('twint')}
                        className="mt-0.5 accent-[hsl(var(--bronze))]"
                      />
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-semibold flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-bronze" />
                          TWINT Schweizer Zahlungsapp
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Schnelle Schweizer Zahlung mit sofortiger Bestätigung &amp; Rechnung per E-Mail.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-md border cursor-pointer transition-colors ${
                        paymentMethod === 'wire'
                          ? 'border-bronze bg-bronze/10 text-foreground'
                          : 'border-border hover:border-bronze/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'wire'}
                        onChange={() => setPaymentMethod('wire')}
                        className="mt-0.5 accent-[hsl(var(--bronze))]"
                      />
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-semibold flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-bronze" />
                          Banküberweisung / Schweizer QR-Rechnung
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Sofortige Reservierung mit offizieller Rechnung per E-Mail.
                        </p>
                      </div>
                    </label>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" variant="bronze" className="w-full" disabled={isSubmitting}>
                  <Lock className="h-4 w-4" />
                  {isSubmitting
                    ? 'Wird vorbereitet...'
                    : paymentMethod === 'card'
                    ? `Weiter zur Kartenzahlung (CHF ${finalTotal.toFixed(2)})`
                    : `Jetzt verbindlich bestellen (CHF ${finalTotal.toFixed(2)})`}
                </Button>
              </form>
            )}
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5">
            <Card className="sticky top-28">
              <CardHeader>
                <CardTitle>Bestellübersicht ({cart.item_count})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3.5 items-center">
                      <div className="w-14 h-16 rounded-md bg-muted border border-border overflow-hidden shrink-0">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-foreground truncate">
                          {item.product_title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.quantity}x • {item.variant_title || 'Standard'}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-medium">
                        CHF {item.total_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promo-code" className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-bronze" />
                    Gutscheincode
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Code eingeben"
                      className="font-mono uppercase text-xs"
                      disabled={!!clientSecret}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo || !!clientSecret}
                    >
                      {isValidatingPromo ? '...' : 'Anwenden'}
                    </Button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`text-xs ${
                        discountPercent > 0 ? 'text-bronze' : 'text-destructive'
                      }`}
                    >
                      {promoMessage}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Zwischensumme</span>
                    <span className="font-mono">CHF {cart.subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-bronze font-medium">
                      <span>Rabatt ({discountPercent}%)</span>
                      <span className="font-mono">- CHF {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Schweizer Post Kurier</span>
                    <span className="font-mono">
                      {shippingCost === 0 ? 'Kostenlos' : `CHF ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-baseline text-sm font-semibold">
                    <span>Gesamtbetrag (inkl. MWST)</span>
                    <span className="font-mono text-lg text-bronze">
                      CHF {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Lade Kasse...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
