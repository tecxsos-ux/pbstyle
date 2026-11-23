import asyncio
import datetime
import html
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import Optional
from urllib.parse import quote

from app.core.config import settings


def build_tracking_url(carrier: str, tracking_number: str, custom_url: Optional[str] = None) -> str:
    if custom_url and custom_url.strip():
        return custom_url.strip()
    tn = quote(tracking_number.strip())
    c = (carrier or "").lower()
    if "dhl" in c:
        return f"https://www.dhl.com/ch-de/home/tracking.html?tracking-id={tn}"
    if "ups" in c:
        return f"https://www.ups.com/track?loc=de_CH&tracknum={tn}"
    if "fedex" in c:
        return f"https://www.fedex.com/fedextrack/?trknbr={tn}"
    return f"https://service.post.ch/ekp-web/ui/entry/search/{tn}"


def _wrap_luxury_email(
    preheader: str,
    eyebrow: str,
    headline: str,
    body_html: str,
    cta_label: Optional[str] = None,
    cta_url: Optional[str] = None,
) -> str:
    base_url = settings.FRONTEND_URL.rstrip("/")
    cta_block = ""
    if cta_label and cta_url:
        cta_block = f"""
        <tr>
          <td style="padding: 28px 40px 8px 40px; text-align: center;">
            <a href="{html.escape(cta_url)}" target="_blank"
               style="display: inline-block; background-color: #111214; color: #FAF6EF; text-decoration: none;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                      font-size: 11px; font-weight: 600; letter-spacing: 2.2px; text-transform: uppercase;
                      padding: 15px 34px; border-radius: 4px; border: 1px solid #9A7B56;">
              {html.escape(cta_label)}
            </a>
          </td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(headline)} | PBSTYLE</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F3EF; color:#141518; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    {html.escape(preheader)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F3EF; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px; width:100%; background-color:#FFFFFF; border:1px solid #E4E2DC; border-radius:6px; overflow:hidden;">
          <!-- Obsidian Luxury Header -->
          <tr>
            <td style="background-color:#111214; padding: 30px 40px; text-align:center; border-bottom: 2px solid #9A7B56;">
              <a href="{html.escape(base_url)}" style="text-decoration:none; color:#FAF6EF;">
                <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; letter-spacing: -0.5px; color:#FAF6EF; line-height:1;">
                  pbstyle
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; color:#C9A97C; margin-top: 8px;">
                  ATELIER FÜR INDUSTRIELLE ELEGANZ
                </div>
              </a>
            </td>
          </tr>

          <!-- Eyebrow & Title -->
          <tr>
            <td style="padding: 36px 40px 12px 40px; text-align:center;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color:#9A7B56; margin-bottom: 10px;">
                {html.escape(eyebrow)}
              </div>
              <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; color:#111214; line-height: 1.25;">
                {html.escape(headline)}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 16px 40px 12px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; color:#3F4248;">
              {body_html}
            </td>
          </tr>

          {cta_block}

          <!-- Divider -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <div style="height:1px; background-color:#EAE8E2;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px; text-align:center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.7; color:#7A7E87;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 1.5px; color:#9A7B56; text-transform: uppercase; margin-bottom: 6px;">
                950 PLATIN • TITAN GRADE 5 • CHIRURGENSTAHL 316L
              </div>
              <div>PBSTYLE Schweiz AG • Zürich, Schweiz</div>
              <div>
                Concierge &amp; Support:
                <a href="mailto:info@pbstyle.ch" style="color:#111214; text-decoration:none; font-weight:600;">info@pbstyle.ch</a>
                &nbsp;•&nbsp;
                <a href="{html.escape(base_url)}" style="color:#111214; text-decoration:none;">pbstyle.ch</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_smtp_sync(recipient_email: str, subject: str, html_body: str, text_body: str) -> None:
    if not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP_PASSWORD ist nicht konfiguriert.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.SMTP_FROM_NAME, settings.SMTP_FROM_EMAIL))
    msg["To"] = recipient_email
    msg["Reply-To"] = settings.SMTP_FROM_EMAIL

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())


async def send_email(recipient_email: str, subject: str, html_body: str, text_body: str) -> bool:
    try:
        await asyncio.to_thread(_send_smtp_sync, recipient_email, subject, html_body, text_body)
        return True
    except Exception as exc:
        print(f"[PBSTYLE SMTP ERROR] Failed sending to {recipient_email}: {exc}")
        return False


async def send_welcome_email(recipient_email: str, full_name: str, tier: str = "Platinum Member") -> bool:
    base_url = settings.FRONTEND_URL.rstrip("/")
    safe_name = html.escape(full_name or "Geschätzter Klient")
    safe_tier = html.escape(tier)

    body_html = f"""
    <p style="margin:0 0 16px 0;">Guten Tag {safe_name},</p>
    <p style="margin:0 0 20px 0;">
      herzlich willkommen im <strong>PBSTYLE Atelier Club</strong>. Ihr persönlicher Zugang wurde aktiviert und Sie genießen ab sofort alle Vorteile unserer Schweizer Präzisionsmanufaktur.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#F8F7F4; border:1px solid #E6E3DC; border-radius:4px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px 24px;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#9A7B56; margin-bottom:10px;">
            IHRE ATELIER-PRIVILEGIEN ({safe_tier})
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px; color:#2B2D32;">
            <tr><td style="padding:4px 0;">&#10003;&nbsp;&nbsp;Kostenloser Schweizer Kurierversand ab CHF 150</td></tr>
            <tr><td style="padding:4px 0;">&#10003;&nbsp;&nbsp;Lebenslange Ateliergarantie &amp; jährliche Ultraschallreinigung</td></tr>
            <tr><td style="padding:4px 0;">&#10003;&nbsp;&nbsp;Exklusiver Vorab-Zugang zu limitierten 950-Platin-Chargen</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0 0; font-size:13px; color:#666A73;">
      Bei individuellen Wünschen, Ringgrößen-Beratung oder Maßanfertigungen antworten Sie einfach direkt auf diese E-Mail.
    </p>
    """

    html_content = _wrap_luxury_email(
        preheader="Willkommen im PBSTYLE Atelier Club — Ihr persönlicher Zugang wurde aktiviert.",
        eyebrow="Willkommen im Atelier Club",
        headline="Präzision. Beständigkeit. Willkommen.",
        body_html=body_html,
        cta_label="Kollektion entdecken",
        cta_url=f"{base_url}/catalog",
    )

    text_content = (
        f"Guten Tag {full_name},\n\n"
        f"herzlich willkommen im PBSTYLE Atelier Club ({tier}).\n"
        f"Ihr persönlicher Zugang wurde erfolgreich aktiviert.\n\n"
        f"Kollektion entdecken: {base_url}/catalog\n\n"
        f"PBSTYLE Atelier Zürich | info@pbstyle.ch"
    )

    return await send_email(
        recipient_email=recipient_email,
        subject="Willkommen im PBSTYLE Atelier Club — Ihr persönlicher Zugang",
        html_body=html_content,
        text_body=text_content,
    )


async def send_coupon_email(
    recipient_email: str,
    full_name: str,
    code: str,
    discount_percent: float,
    custom_message: Optional[str] = None,
) -> bool:
    base_url = settings.FRONTEND_URL.rstrip("/")
    safe_name = html.escape(full_name or "Geschätzter Klient")
    clean_code = code.strip().upper()
    pct_display = int(discount_percent) if float(discount_percent).is_integer() else round(discount_percent, 1)

    custom_html = ""
    if custom_message and custom_message.strip():
        custom_html = f"""
        <div style="background-color:#F8F7F4; border-left:3px solid #9A7B56; padding:14px 18px; margin: 18px 0; font-size:13px; color:#2B2D32;">
          {html.escape(custom_message.strip()).replace(chr(10), '<br />')}
        </div>
        """

    body_html = f"""
    <p style="margin:0 0 16px 0;">Guten Tag {safe_name},</p>
    <p style="margin:0 0 20px 0;">
      als Zeichen unserer Wertschätzung freuen wir uns, Ihnen einen persönlichen <strong>PBSTYLE Atelier-Gutschein</strong> überreichen zu dürfen.
    </p>

    {custom_html}

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#111214; border-radius:6px; margin: 24px 0; border: 1px solid #9A7B56;">
      <tr>
        <td style="padding: 26px 28px; text-align:center;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:#C9A97C;">
            EXKLUSIVER PRIVILEG-CODE ({pct_display}% RABATT)
          </div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:26px; font-weight:700; letter-spacing:4px; color:#FAF6EF; margin-top:10px;">
            {html.escape(clean_code)}
          </div>
          <div style="font-size:11px; color:#A3A7B0; margin-top:10px;">
            Einfach im Warenkorb an der Kasse eingeben
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:12px 0 0 0; font-size:13px; color:#666A73;">
      Gültig auf unsere gesamte Kollektion aus massivem 950er Platin, Titan Grade 5 und Chirurgenstahl 316L.
    </p>
    """

    html_content = _wrap_luxury_email(
        preheader=f"Ihr persönlicher PBSTYLE Gutscheincode {clean_code} ({pct_display}% Rabatt).",
        eyebrow="Persönliche Einladung",
        headline=f"{pct_display}% Atelier-Privileg für Sie",
        body_html=body_html,
        cta_label="Jetzt Kollektion entdecken",
        cta_url=f"{base_url}/catalog",
    )

    text_content = (
        f"Guten Tag {full_name},\n\n"
        f"als geschätzter PBSTYLE Klient erhalten Sie Ihren persönlichen Gutscheincode:\n"
        f"Code: {clean_code} ({pct_display}% Rabatt)\n\n"
        + (f"{custom_message.strip()}\n\n" if custom_message and custom_message.strip() else "")
        + f"Jetzt entdecken: {base_url}/catalog\n\n"
        f"PBSTYLE Atelier Zürich | info@pbstyle.ch"
    )

    return await send_email(
        recipient_email=recipient_email,
        subject=f"Ihr persönlicher PBSTYLE Gutschein ({pct_display}% Rabatt): {clean_code}",
        html_body=html_content,
        text_body=text_content,
    )


async def send_order_invoice_email(
    order: object,
    recipient_email: Optional[str] = None,
    subject: Optional[str] = None,
    custom_message: Optional[str] = None,
) -> bool:
    base_url = settings.FRONTEND_URL.rstrip("/")
    to_email = recipient_email or getattr(order, "customer_email")
    customer_name = getattr(order, "customer_name", "Geschätzter Klient")
    order_number = getattr(order, "order_number")
    invoice_number = getattr(order, "invoice_number", None) or f"INV-2026-{order_number.replace('PB-2026-', '')}"
    subtotal = float(getattr(order, "subtotal", 0.0))
    discount_amount = float(getattr(order, "discount_amount", 0.0))
    shipping_cost = float(getattr(order, "shipping_cost", 0.0))
    total_amount = float(getattr(order, "total_amount", 0.0))
    currency = getattr(order, "currency", "CHF")
    payment_method = getattr(order, "payment_method", "Stripe Checkout")
    status_label = getattr(order, "status", "Bestätigt")
    shipping_addr = getattr(order, "shipping_address", {}) or {}
    items = getattr(order, "items", []) or []
    created_at = getattr(order, "created_at", None) or datetime.datetime.utcnow()
    issue_date = created_at.strftime("%d.%m.%Y")

    vat_rate = 8.1
    vat_amount = round(total_amount * (vat_rate / (100.0 + vat_rate)), 2)

    item_rows_html = ""
    item_lines_txt = []
    for it in items:
        title = html.escape(getattr(it, "product_title", "PBSTYLE Objekt"))
        variant = getattr(it, "variant_title", None)
        qty = int(getattr(it, "quantity", 1))
        unit_price = float(getattr(it, "unit_price", 0.0))
        line_total = unit_price * qty
        item_lines_txt.append(f"- {qty}x {getattr(it, 'product_title', '')} ({variant or 'Standard'}): {currency} {line_total:,.2f}")
        item_rows_html += f"""
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #ECEAE4;">
            <div style="font-family: Georgia, serif; font-size: 14px; color:#111214;">{title}</div>
            <div style="font-size: 11px; color:#7A7E87; margin-top:2px;">{html.escape(variant or 'Standard')} &nbsp;•&nbsp; Menge: {qty}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #ECEAE4; text-align:right; font-family:'Courier New', Courier, monospace; font-size:13px; color:#111214; white-space:nowrap;">
            {currency} {line_total:,.2f}
          </td>
        </tr>
        """

    discount_row = ""
    if discount_amount > 0:
        discount_row = f"""
        <tr>
          <td style="padding: 5px 0; font-size:12px; color:#9A7B56;">Rabatt</td>
          <td style="padding: 5px 0; font-size:12px; color:#9A7B56; text-align:right; font-family:'Courier New', Courier, monospace;">- {currency} {discount_amount:,.2f}</td>
        </tr>
        """

    custom_msg_html = ""
    if custom_message:
        formatted_msg = html.escape(custom_message).replace("\n", "<br />")
        custom_msg_html = f"""
        <div style="background-color:#F8F7F4; border-left:3px solid #9A7B56; padding:14px 18px; margin: 0 0 22px 0; font-size:13px; color:#2B2D32;">
          {formatted_msg}
        </div>
        """

    addr_line = f"{html.escape(str(shipping_addr.get('address', '')))}, {html.escape(str(shipping_addr.get('postal_code', '')))} {html.escape(str(shipping_addr.get('city', '')))}, {html.escape(str(shipping_addr.get('country', 'Schweiz')))}"

    body_html = f"""
    <p style="margin:0 0 16px 0;">Guten Tag {html.escape(customer_name)},</p>
    <p style="margin:0 0 20px 0;">
      vielen Dank für Ihre Bestellung bei <strong>PBSTYLE</strong>. Ihre Kreation wird nun in unserem Zürcher Atelier mit höchster Sorgfalt geprüft, verpackt und für den versicherten Versand vorbereitet. Unten finden Sie Ihre offizielle Rechnung.
    </p>

    {custom_msg_html}

    <!-- Meta Strip -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#F8F7F4; border:1px solid #E6E3DC; border-radius:4px; margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px; width:50%; vertical-align:top;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:9px; letter-spacing:1.8px; text-transform:uppercase; color:#7A7E87;">Bestellung / Rechnung</div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:13px; font-weight:700; color:#111214; margin-top:4px;">{html.escape(order_number)}</div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:11px; color:#9A7B56; margin-top:2px;">{html.escape(invoice_number)}</div>
        </td>
        <td style="padding:14px 18px; width:50%; vertical-align:top; text-align:right;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:9px; letter-spacing:1.8px; text-transform:uppercase; color:#7A7E87;">Datum &amp; Status</div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:13px; color:#111214; margin-top:4px;">{issue_date}</div>
          <div style="font-size:11px; font-weight:600; color:#1F7A4D; margin-top:2px;">{html.escape(status_label)}</div>
        </td>
      </tr>
    </table>

    <!-- Itemized Invoice Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
      <tr>
        <th align="left" style="padding: 0 0 8px 0; border-bottom:2px solid #111214; font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#7A7E87;">Position</th>
        <th align="right" style="padding: 0 0 8px 0; border-bottom:2px solid #111214; font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#7A7E87;">Betrag</th>
      </tr>
      {item_rows_html}
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding: 5px 0; font-size:12px; color:#666A73;">Zwischensumme</td>
        <td style="padding: 5px 0; font-size:12px; color:#111214; text-align:right; font-family:'Courier New', Courier, monospace;">{currency} {subtotal:,.2f}</td>
      </tr>
      {discount_row}
      <tr>
        <td style="padding: 5px 0; font-size:12px; color:#666A73;">Schweizer Post Kurierversand</td>
        <td style="padding: 5px 0; font-size:12px; color:#111214; text-align:right; font-family:'Courier New', Courier, monospace;">{"Kostenlos" if shipping_cost == 0 else f"{currency} {shipping_cost:,.2f}"}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size:11px; color:#7A7E87;">Inkl. 8.1% Schweizer MWST</td>
        <td style="padding: 5px 0; font-size:11px; color:#7A7E87; text-align:right; font-family:'Courier New', Courier, monospace;">{currency} {vat_amount:,.2f}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0 0 0; border-top:2px solid #111214; font-size:14px; font-weight:700; color:#111214;">Gesamtbetrag</td>
        <td style="padding: 12px 0 0 0; border-top:2px solid #111214; font-size:18px; font-weight:700; color:#9A7B56; text-align:right; font-family:'Courier New', Courier, monospace;">{currency} {total_amount:,.2f}</td>
      </tr>
    </table>

    <!-- Shipping & Payment -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#F8F7F4; border:1px solid #E6E3DC; border-radius:4px;">
      <tr>
        <td style="padding:16px 18px; font-size:12px; color:#3F4248; line-height:1.6;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:9px; letter-spacing:1.8px; text-transform:uppercase; color:#9A7B56; margin-bottom:4px;">Lieferadresse &amp; Zahlung</div>
          <div><strong>{html.escape(customer_name)}</strong> — {addr_line}</div>
          <div style="color:#7A7E87; margin-top:4px;">Zahlungsart: {html.escape(payment_method)}</div>
        </td>
      </tr>
    </table>
    """

    order_id = getattr(order, "id", None)
    invoice_url = f"{base_url}/api/v1/admin/invoices/{order_id}/html" if order_id else f"{base_url}/dashboard"

    html_content = _wrap_luxury_email(
        preheader=f"Vielen Dank für Ihre Bestellung {order_number} — Rechnung {invoice_number} (CHF {total_amount:,.2f}).",
        eyebrow="Bestellbestätigung & Offizielle Rechnung",
        headline="Vielen Dank für Ihre Bestellung",
        body_html=body_html,
        cta_label="Offizielle Rechnung öffnen",
        cta_url=invoice_url,
    )

    text_content = (
        f"Guten Tag {customer_name},\n\n"
        f"vielen Dank für Ihre Bestellung {order_number} (Rechnung {invoice_number}).\n\n"
        + "\n".join(item_lines_txt)
        + f"\n\nGesamtbetrag (inkl. 8.1% MWST): {currency} {total_amount:,.2f}\n"
        f"Status: {status_label}\n"
        f"Offizielle Rechnung: {invoice_url}\n\n"
        f"PBSTYLE Atelier Zürich | info@pbstyle.ch"
    )

    final_subject = subject or f"Vielen Dank für Ihre Bestellung {order_number} — PBSTYLE Rechnung {invoice_number}"
    return await send_email(
        recipient_email=to_email,
        subject=final_subject,
        html_body=html_content,
        text_body=text_content,
    )


async def send_tracking_email(
    order: object,
    tracking_number: str,
    carrier: str = "Schweizer Post «Pro Clima»",
    tracking_url: Optional[str] = None,
    custom_note: Optional[str] = None,
) -> bool:
    to_email = getattr(order, "customer_email")
    customer_name = getattr(order, "customer_name", "Geschätzter Klient")
    order_number = getattr(order, "order_number")
    shipping_addr = getattr(order, "shipping_address", {}) or {}
    final_url = build_tracking_url(carrier, tracking_number, tracking_url)

    note_html = ""
    if custom_note:
        note_html = f"""
        <div style="background-color:#F8F7F4; border-left:3px solid #9A7B56; padding:14px 18px; margin: 18px 0; font-size:13px; color:#2B2D32;">
          {html.escape(custom_note).replace(chr(10), '<br />')}
        </div>
        """

    addr_line = f"{html.escape(str(shipping_addr.get('address', '')))}, {html.escape(str(shipping_addr.get('postal_code', '')))} {html.escape(str(shipping_addr.get('city', '')))}, {html.escape(str(shipping_addr.get('country', 'Schweiz')))}"

    body_html = f"""
    <p style="margin:0 0 16px 0;">Guten Tag {html.escape(customer_name)},</p>
    <p style="margin:0 0 20px 0;">
      gute Neuigkeiten aus unserem Zürcher Atelier: Ihre Bestellung <strong>{html.escape(order_number)}</strong> wurde soeben versichert übergeben und befindet sich auf dem Weg zu Ihnen.
    </p>

    <!-- Prominent Tracking Box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#111214; border-radius:6px; margin: 22px 0; border: 1px solid #9A7B56;">
      <tr>
        <td style="padding: 24px 28px; text-align:center;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:#C9A97C;">
            SENDUNGSNUMMER ({html.escape(carrier)})
          </div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:20px; font-weight:700; letter-spacing:2px; color:#FAF6EF; margin-top:10px; word-break:break-all;">
            {html.escape(tracking_number)}
          </div>
        </td>
      </tr>
    </table>

    {note_html}

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#F8F7F4; border:1px solid #E6E3DC; border-radius:4px;">
      <tr>
        <td style="padding:16px 18px; font-size:12px; color:#3F4248; line-height:1.6;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:9px; letter-spacing:1.8px; text-transform:uppercase; color:#9A7B56; margin-bottom:4px;">Lieferadresse</div>
          <div><strong>{html.escape(customer_name)}</strong></div>
          <div>{addr_line}</div>
        </td>
      </tr>
    </table>
    """

    html_content = _wrap_luxury_email(
        preheader=f"Ihre PBSTYLE Bestellung {order_number} wurde versendet — Tracking: {tracking_number}",
        eyebrow="Versandbestätigung & Sendungsverfolgung",
        headline="Ihre Bestellung ist unterwegs",
        body_html=body_html,
        cta_label="Sendung jetzt verfolgen",
        cta_url=final_url,
    )

    text_content = (
        f"Guten Tag {customer_name},\n\n"
        f"Ihre PBSTYLE Bestellung {order_number} wurde versendet!\n"
        f"Versanddienstleister: {carrier}\n"
        f"Sendungsnummer: {tracking_number}\n"
        f"Sendungsverfolgung: {final_url}\n\n"
        f"PBSTYLE Atelier Zürich | info@pbstyle.ch"
    )

    return await send_email(
        recipient_email=to_email,
        subject=f"Ihre PBSTYLE Bestellung {order_number} wurde versendet — Tracking {tracking_number}",
        html_body=html_content,
        text_body=text_content,
    )


async def send_refund_email(
    order: object,
    refund_amount: float,
    return_status: str = "Erstattet",
    reason: Optional[str] = None,
    refund_id: Optional[str] = None,
) -> bool:
    base_url = settings.FRONTEND_URL.rstrip("/")
    to_email = getattr(order, "customer_email")
    customer_name = getattr(order, "customer_name", "Geschätzter Klient")
    order_number = getattr(order, "order_number")
    currency = getattr(order, "currency", "CHF")

    reason_html = ""
    if reason and reason.strip():
        reason_html = f"""
        <div style="background-color:#F8F7F4; border-left:3px solid #9A7B56; padding:14px 18px; margin: 18px 0; font-size:13px; color:#2B2D32;">
          {html.escape(reason.strip()).replace(chr(10), '<br />')}
        </div>
        """

    ref_line = f"<div style='font-family:Courier New, monospace; font-size:11px; color:#A3A7B0; margin-top:6px;'>Referenz: {html.escape(refund_id)}</div>" if refund_id else ""

    body_html = f"""
    <p style="margin:0 0 16px 0;">Guten Tag {html.escape(customer_name)},</p>
    <p style="margin:0 0 20px 0;">
      hiermit bestätigen wir die Bearbeitung Ihrer Rückgabe / Rückerstattung für die Bestellung <strong>{html.escape(order_number)}</strong>.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background-color:#111214; border-radius:6px; margin: 22px 0; border: 1px solid #9A7B56;">
      <tr>
        <td style="padding: 24px 28px; text-align:center;">
          <div style="font-family:'Courier New', Courier, monospace; font-size:10px; letter-spacing:2.5px; text-transform:uppercase; color:#C9A97C;">
            RÜCKERSTATTUNGSBETRAG ({html.escape(return_status)})
          </div>
          <div style="font-family:'Courier New', Courier, monospace; font-size:24px; font-weight:700; color:#FAF6EF; margin-top:8px;">
            {currency} {refund_amount:,.2f}
          </div>
          {ref_line}
        </td>
      </tr>
    </table>

    {reason_html}

    <p style="margin:12px 0 0 0; font-size:13px; color:#666A73;">
      Die Gutschrift erfolgt automatisch auf Ihr ursprünglich verwendetes Zahlungsmittel (in der Regel innerhalb von 3–5 Werktagen).
    </p>
    """

    html_content = _wrap_luxury_email(
        preheader=f"Bestätigung Ihrer Rückerstattung ({currency} {refund_amount:,.2f}) für Bestellung {order_number}.",
        eyebrow="Rückgabe & Rückerstattung",
        headline="Ihre Rückerstattung wurde veranlasst",
        body_html=body_html,
        cta_label="Zur PBSTYLE Kollektion",
        cta_url=f"{base_url}/catalog",
    )

    text_content = (
        f"Guten Tag {customer_name},\n\n"
        f"wir bestätigen Ihre Rückgabe / Rückerstattung für Bestellung {order_number}.\n"
        f"Status: {return_status}\n"
        f"Erstattungsbetrag: {currency} {refund_amount:,.2f}\n"
        + (f"Referenz: {refund_id}\n" if refund_id else "")
        + (f"Hinweis: {reason}\n" if reason else "")
        + "\nPBSTYLE Atelier Zürich | info@pbstyle.ch"
    )

    return await send_email(
        recipient_email=to_email,
        subject=f"PBSTYLE Rückerstattung bestätigt ({currency} {refund_amount:,.2f}) — {order_number}",
        html_body=html_content,
        text_body=text_content,
    )
