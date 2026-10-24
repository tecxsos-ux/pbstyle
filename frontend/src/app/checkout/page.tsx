'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { validateDiscountCodeApi, createOrderApi } from '@/lib/api';
import { Order } from '@/lib/types';

export default function CheckoutPage() {
  const { cart, clearUserCart } = useCart();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Schweiz');
  const [paymentMethod, setPaymentMethod] = useState('Kreditkarte (Geschützt)');

  // Promo code state
  const [promoCode, setPromoCode] = useState('PBSTYLE20');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [isValidatingPromo, setIsValidatingPromo] = useState<boolean>(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    setPromoMessage('');
    try {
      const res = await validateDiscountCodeApi(promoCode);
      if (res.valid) {
        setDiscountPercent(res.discount_percent);
        setPromoMessage(res.message);
      } else {
        setDiscountPercent(0);
        setPromoMessage(res.message);
      }
    } catch (err) {
      setPromoMessage('Gutscheincode konnte nicht validiert werden.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const discountAmount = Math.round(cart.subtotal * (discountPercent / 100) * 100) / 100;
  const shippingCost = cart.subtotal > 150 ? 0 : 15;
  const finalTotal = Math.max(0, cart.subtotal - discountAmount + shippingCost);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      setErrorMessage('Ihr Warenkorb ist leer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const orderPayload = {
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
        payment_method: paymentMethod,
      };

      const orderResult = await createOrderApi(orderPayload);
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">check</span>
        </div>
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Bestellung Erfolgreich
          </span>
          <h1 className="font-serif text-4xl text-on-surface">Vielen Dank für Ihre Bestellung</h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Ihre Reservierung mit der Bestellnummer <span className="font-mono font-semibold text-primary">{completedOrder.order_number}</span> wurde erfasst. Eine Bestätigung wurde an <span className="font-medium text-on-surface">{completedOrder.customer_email}</span> gesendet.
          </p>
        </div>

        <div className="bg-surface-container-low p-6 text-left border border-outline-variant/20 space-y-4 text-xs">
          <div className="flex justify-between border-b border-outline-variant/10 pb-2">
            <span className="text-on-surface-variant uppercase tracking-widest">Gesamtbetrag:</span>
            <span className="font-serif text-base text-primary font-semibold">
              CHF {completedOrder.total_amount.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between border-b border-outline-variant/10 pb-2">
            <span className="text-on-surface-variant uppercase tracking-widest">Lieferadresse:</span>
            <span className="text-right">
              {completedOrder.shipping_address.address}, {completedOrder.shipping_address.postal_code} {completedOrder.shipping_address.city}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant uppercase tracking-widest">Status:</span>
            <span className="text-primary font-medium">{completedOrder.status}</span>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/catalog"
            className="inline-block px-8 py-4 bg-primary text-on-primary text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Weiter einkaufen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-12 py-12">
      <div className="mb-10 space-y-2">
        <span className="font-sans text-xs uppercase tracking-[0.25em] text-primary">
          Sicherer Tresor-Checkout
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-on-surface">Kasse</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="py-20 text-center space-y-6">
          <p className="font-serif text-2xl">Ihr Warenkorb ist derzeit leer.</p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-3.5 bg-primary text-on-primary font-sans text-xs uppercase tracking-widest"
          >
            Zur Kollektion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
          
          {/* Left Column: Customer & Shipping Details */}
          <div className="lg:col-span-7 space-y-10">
            {errorMessage && (
              <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 text-xs uppercase tracking-widest">
                {errorMessage}
              </div>
            )}

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl border-b border-outline-variant/15 pb-2">
                1. Kontaktinformationen
              </h2>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  E-Mail-Adresse für Bestellbestätigung & Sendungsverfolgung
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.ch"
                  className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl border-b border-outline-variant/15 pb-2">
                2. Lieferadresse (Schweiz & International)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                    Vorname
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                    Nachname
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  Straße & Hausnummer
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bahnhofstrasse 10"
                  className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                    Postleitzahl
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="8001"
                    className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                    Stadt / Ort
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Zürich"
                    className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  Land
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/30 p-3 text-xs outline-none focus:border-primary text-on-surface"
                >
                  <option value="Schweiz">Schweiz (Liechtenstein)</option>
                  <option value="Deutschland">Deutschland</option>
                  <option value="Österreich">Österreich</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl border-b border-outline-variant/15 pb-2">
                3. Bezahlung & Verschlüsselung
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'cc', title: 'Kreditkarte (Visa, Mastercard, Amex)', icon: 'credit_card' },
                  { id: 'twint', title: 'TWINT Schweizer Zahlungsapp', icon: 'smartphone' },
                  { id: 'wire', title: 'Banküberweisung / Vorauszahlung', icon: 'account_balance' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === pm.title
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-outline-variant/30 text-on-surface hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === pm.title}
                      onChange={() => setPaymentMethod(pm.title)}
                      className="accent-primary"
                    />
                    <span className="material-symbols-outlined text-[20px]">{pm.icon}</span>
                    <span className="text-xs uppercase tracking-wider">{pm.title}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-5 bg-surface-container-low p-8 border border-outline-variant/20 h-fit space-y-6">
            <h2 className="font-serif text-xl border-b border-outline-variant/15 pb-3">
              Bestellübersicht ({cart.item_count})
            </h2>

            {/* Items list */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-14 h-16 bg-surface flex-shrink-0 overflow-hidden border border-outline-variant/20">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-sm leading-tight text-on-surface">{item.product_title}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.quantity}x • {item.variant_title || 'Standard'}</p>
                  </div>
                  <span className="font-serif text-sm text-primary font-medium">
                    CHF {item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="pt-4 border-t border-outline-variant/15 space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">
                Rabatt- oder Geschenkgutschein (Tipp: PBSTYLE20)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PBSTYLE20"
                  className="flex-1 bg-surface border border-outline-variant/30 p-2.5 text-xs uppercase tracking-widest outline-none focus:border-primary text-on-surface"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo}
                  className="px-4 bg-outline-variant/30 text-on-surface hover:bg-primary hover:text-on-primary transition-colors text-xs uppercase tracking-widest"
                >
                  {isValidatingPromo ? 'Prüfen...' : 'Anwenden'}
                </button>
              </div>
              {promoMessage && (
                <p className={`text-xs ${discountPercent > 0 ? 'text-primary' : 'text-red-500'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="border-t border-outline-variant/15 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Zwischensumme:</span>
                <span>CHF {cart.subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Rabatt ({discountPercent}%):</span>
                  <span>- CHF {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>Schweizer Post Kurier:</span>
                <span>{shippingCost === 0 ? 'Kostenlos' : `CHF ${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-on-surface pt-3 border-t border-outline-variant/15">
                <span>Gesamtbetrag (inkl. MWST):</span>
                <span className="text-primary font-serif text-xl">
                  CHF {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-on-background text-background font-sans text-xs uppercase tracking-widest hover:bg-primary transition-colors shadow-2xl active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>{isSubmitting ? 'Wird übermittelt...' : `Jetzt Bestellen (CHF ${finalTotal.toFixed(2)})`}</span>
            </button>

            <p className="text-[10px] text-center text-on-surface-variant/70 leading-relaxed">
              Durch Klicken auf Jetzt Bestellen stimmen Sie den PBstyle AGB und den Datenschutzbestimmungen zu.
            </p>
          </div>

        </form>
      )}
    </div>
  );
}
