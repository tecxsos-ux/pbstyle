'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'inventory' | 'invoices' | 'instagram'>('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  // Overview data
  const [overview, setOverview] = useState<any>(null);

  // CRM data
  const [customers, setCustomers] = useState<any[]>([]);
  const [crmSearch, setCrmSearch] = useState('');
  const [crmTierFilter, setCrmTierFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [crmSuccessMessage, setCrmSuccessMessage] = useState('');

  // Inventory data
  const [inventory, setInventory] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdHandle, setNewProdHandle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1200);
  const [newProdCost, setNewProdCost] = useState(450);
  const [newProdStock, setNewProdStock] = useState(8);
  const [newProdMaterial, setNewProdMaterial] = useState('platinum');
  const [newProdCategory, setNewProdCategory] = useState(1);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [inventorySuccessMessage, setInventorySuccessMessage] = useState('');

  // Invoices & Mail dispatch
  const [invoicesOrderList, setInvoicesOrderList] = useState<any[]>([]);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any>(null);
  const [dispatchRecipientEmail, setDispatchRecipientEmail] = useState('');
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState('');

  // Instagram Connector data
  const [instagramSettings, setInstagramSettings] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [isInstagramPublishing, setIsInstagramPublishing] = useState<boolean>(false);
  const [instagramModalProduct, setInstagramModalProduct] = useState<any>(null);
  const [customInstagramCaption, setCustomInstagramCaption] = useState<string>('');
  const [instagramSuccessToast, setInstagramSuccessToast] = useState<string>('');

  // Auth check & load data
  useEffect(() => {
    const storedToken = localStorage.getItem('pbstyle_admin_token');
    const storedUser = localStorage.getItem('pbstyle_admin_user');
    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    setToken(storedToken);
    if (storedUser) {
      try { setAdminUser(JSON.parse(storedUser)); } catch (e) {}
    }

    loadOverview();
    loadCustomers();
    loadInventory();
    loadInstagramData();
  }, []);

  const loadOverview = async () => {
    try {
      const res = await fetch('/api/v1/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
        setInvoicesOrderList(data.recent_orders || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomers = async () => {
    try {
      const query = new URLSearchParams();
      if (crmSearch) query.append('search', crmSearch);
      if (crmTierFilter) query.append('tier', crmTierFilter);
      const res = await fetch(`/api/v1/admin/crm/customers?${query.toString()}`);
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await fetch('/api/v1/admin/inventory/products');
      if (res.ok) {
        setInventory(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadInstagramData = async () => {
    try {
      const [settingsRes, postsRes] = await Promise.all([
        fetch('/api/v1/instagram/settings'),
        fetch('/api/v1/instagram/posts')
      ]);
      if (settingsRes.ok) setInstagramSettings(await settingsRes.json());
      if (postsRes.ok) setInstagramPosts(await postsRes.json());
    } catch (e) {
      console.error('Failed to load instagram data', e);
    }
  };

  const handleToggleAutoPost = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/v1/instagram/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_post_enabled: enabled })
      });
      if (res.ok) {
        const updated = await res.json();
        setInstagramSettings(updated);
        setInstagramSuccessToast(`Instagram Auto-Post wurde ${enabled ? 'aktiviert' : 'deaktiviert'}.`);
        setTimeout(() => setInstagramSuccessToast(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualInstagramPublish = async (productId: number, customCaption?: string) => {
    setIsInstagramPublishing(true);
    try {
      const res = await fetch(`/api/v1/instagram/publish/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_caption: customCaption })
      });
      if (res.ok) {
        const result = await res.json();
        setInstagramSuccessToast(result.message || 'Erfolgreich auf Instagram (@pbstyle.ch) veröffentlicht!');
        setTimeout(() => setInstagramSuccessToast(''), 4500);
        setInstagramModalProduct(null);
        await loadInstagramData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInstagramPublishing(false);
    }
  };

  const handleOpenInstagramModal = async (product: any) => {
    setInstagramModalProduct(product);
    try {
      const res = await fetch(`/api/v1/instagram/preview/${product.id}`, { method: 'POST' });
      if (res.ok) {
        const preview = await res.json();
        setCustomInstagramCaption(preview.caption);
      } else {
        setCustomInstagramCaption(`✨ Neu im Zürcher Atelier: ${product.title}\n\nPreis: CHF ${product.base_price}\n\n#pbstyle #swissjewelry #950platin`);
      }
    } catch (e) {
      setCustomInstagramCaption(`✨ Neu im Zürcher Atelier: ${product.title}\n\n#pbstyle #swissjewelry`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pbstyle_admin_token');
    localStorage.removeItem('pbstyle_admin_user');
    router.push('/admin/login');
  };

  // Quick stock adjust
  const handleStockAdjust = async (product: any, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch(`/api/v1/admin/inventory/products/${product.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory(prev => prev.map(p => p.id === updated.id ? updated : p));
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save edited inventory item
  const handleSaveInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/v1/admin/inventory/products/${editingItem.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: editingItem.stock,
          low_stock_threshold: editingItem.low_stock_threshold,
          base_price: editingItem.base_price,
          cost_price: editingItem.cost_price,
          status: editingItem.status
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditingItem(null);
        setInventorySuccessMessage(`Objekt "${updated.title}" erfolgreich aktualisiert.`);
        setTimeout(() => setInventorySuccessMessage(''), 3000);
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProdTitle,
          handle: newProdHandle.toLowerCase().trim().replace(/\s+/g, '-'),
          subtitle: `${newProdMaterial} Atelier Edition`,
          description: newProdDesc || 'Präzisionsgefertigtes Objekt aus der Zürcher Manufaktur.',
          category_id: Number(newProdCategory),
          material: newProdMaterial,
          base_price: Number(newProdPrice),
          cost_price: Number(newProdCost),
          stock: Number(newProdStock),
          low_stock_threshold: 5,
          sku_prefix: 'PB',
          status: 'Aktiv'
        })
      });
      if (res.ok) {
        const created = await res.json();
        setInventory([created, ...inventory]);
        setIsNewProductModalOpen(false);
        setNewProdTitle('');
        setNewProdHandle('');
        setNewProdDesc('');
        setInventorySuccessMessage(`Neues Objekt "${created.title}" zum Katalog hinzugefügt & automatisch auf Instagram (@pbstyle.ch) gepostet! ✨`);
        setTimeout(() => setInventorySuccessMessage(''), 5000);
        loadOverview();
        loadInstagramData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save CRM Customer edits
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const res = await fetch(`/api/v1/admin/crm/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: selectedCustomer.full_name,
          phone: selectedCustomer.phone,
          company: selectedCustomer.company,
          tier: selectedCustomer.tier,
          status: selectedCustomer.status,
          crm_notes: selectedCustomer.crm_notes,
          loyalty_points: selectedCustomer.loyalty_points
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelectedCustomer(null);
        setCrmSuccessMessage(`Klientenprofil für "${updated.full_name}" erfolgreich gespeichert.`);
        setTimeout(() => setCrmSuccessMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Invoice Dispatch Modal
  const openDispatchModal = (order: any) => {
    setDispatchModalOrder(order);
    setDispatchRecipientEmail(order.customer_email);
    setDispatchSubject(`Ihre offizielle PBSTYLE Rechnung & Schweizer Zertifikat (${order.order_number})`);
    setDispatchMessage(`Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie Ihre offizielle PBSTYLE Rechnung mit ausgewiesener Schweizer Mehrwertsteuer sowie Ihr nummeriertes Ursprungszertifikat.\n\nMit vorzüglicher Hochachtung,\nPBSTYLE Atelier Zürich`);
  };

  // Send Invoice by Mail
  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    setIsDispatching(true);

    try {
      const res = await fetch(`/api/v1/admin/invoices/${dispatchModalOrder.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: dispatchModalOrder.id,
          recipient_email: dispatchRecipientEmail,
          subject: dispatchSubject,
          custom_message: dispatchMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchSuccessToast(data.message);
        setTimeout(() => setDispatchSuccessToast(''), 4500);
        setDispatchModalOrder(null);
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans flex flex-col">
      
      {/* Admin Top Navigation Bar */}
      <header className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl tracking-tighter text-on-surface">
            pbstyle
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-primary/10 border border-primary text-primary font-mono text-[10px] uppercase tracking-widest">
            Atelier Command Center
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-medium text-on-surface">{adminUser?.full_name || 'Philippe Bernasconi'}</span>
            <span className="text-[10px] text-primary uppercase tracking-widest">{adminUser?.role || 'superadmin'}</span>
          </div>

          <Link
            href="/"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Storefront</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Abmelden</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-surface border-r border-outline-variant/20 p-4 md:p-6 flex-shrink-0 space-y-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/70 block mb-3 font-semibold">
              Verwaltungsmodule
            </span>
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-primary text-on-primary font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Übersicht</span>
              </button>

              <button
                onClick={() => { setActiveTab('crm'); loadCustomers(); }}
                className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
                  activeTab === 'crm'
                    ? 'bg-primary text-on-primary font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">groups</span>
                <span>Client CRM</span>
              </button>

              <button
                onClick={() => { setActiveTab('inventory'); loadInventory(); }}
                className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
                  activeTab === 'inventory'
                    ? 'bg-primary text-on-primary font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span>Inventar & Lager</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-primary text-on-primary font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Rechnungen & Mail</span>
              </button>

              <button
                onClick={() => { setActiveTab('instagram'); loadInstagramData(); }}
                className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest flex items-center gap-3 transition-colors ${
                  activeTab === 'instagram'
                    ? 'bg-primary text-on-primary font-semibold shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>Instagram Auto-Post</span>
              </button>
            </nav>
          </div>

          {/* Quick Stats sidebar widget */}
          <div className="hidden md:block p-4 bg-surface-container-low border border-outline-variant/15 text-xs space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Atelier Status</span>
            <div className="flex justify-between text-on-surface-variant">
              <span>Lagerbestand Warnungen:</span>
              <span className={`font-mono font-bold ${overview?.low_stock_items_count > 0 ? 'text-red-500' : 'text-primary'}`}>
                {overview?.low_stock_items_count || 0}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Registrierte VIPs:</span>
              <span className="font-mono font-bold text-on-surface">{overview?.active_clients_count || 4}</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
          
          {/* Global Notification Toasts */}
          {dispatchSuccessToast && (
            <div className="p-4 bg-primary text-on-primary text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl animate-fade-in border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
              <span>{dispatchSuccessToast}</span>
            </div>
          )}

          {inventorySuccessMessage && (
            <div className="p-4 bg-primary text-on-primary text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{inventorySuccessMessage}</span>
            </div>
          )}

          {crmSuccessMessage && (
            <div className="p-4 bg-primary text-on-primary text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{crmSuccessMessage}</span>
            </div>
          )}

          {instagramSuccessToast && (
            <div className="p-4 bg-primary text-on-primary text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl animate-fade-in border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>{instagramSuccessToast}</span>
            </div>
          )}

          {/* 1. TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-1">
                  Performance & Kennzahlen
                </span>
                <h2 className="font-serif text-3xl text-on-surface">Atelier-Übersicht</h2>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Gesamtumsatz</span>
                  <div className="font-serif text-3xl text-primary font-semibold">
                    CHF {overview?.total_revenue_chf?.toLocaleString('de-CH', { minimumFractionDigits: 2 }) || '5\'490.00'}
                  </div>
                  <span className="text-[10px] text-primary flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +18.4% ggü. Vormonat
                  </span>
                </div>

                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Abgeschlossene Bestellungen</span>
                  <div className="font-serif text-3xl text-on-surface font-semibold">
                    {overview?.total_orders_count || 2}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">Alle mit Schweizer Zertifikat</span>
                </div>

                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Aktive Klienten (CRM)</span>
                  <div className="font-serif text-3xl text-on-surface font-semibold">
                    {overview?.active_clients_count || 4}
                  </div>
                  <span className="text-[10px] text-primary font-mono">100% verifizierte Sammler</span>
                </div>

                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Lager-Warnungen</span>
                  <div className={`font-serif text-3xl font-semibold ${overview?.low_stock_items_count > 0 ? 'text-red-500' : 'text-primary'}`}>
                    {overview?.low_stock_items_count || 0} Objekte
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">Bestand unter Mindestgrenze (5)</span>
                </div>
              </div>

              {/* Material share */}
              <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-4">
                <h3 className="font-serif text-lg">Umsatzverteilung nach Edelmetall</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>950 Platin (Pt 950)</span>
                      <span className="font-mono font-semibold text-primary">58%</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-2">
                      <div className="bg-[#E8B898] h-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Chirurgenstahl 316L (V4A)</span>
                      <span className="font-mono font-semibold text-primary">27%</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-2">
                      <div className="bg-[#B07D62] h-full" style={{ width: '27%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Titan Grade 5 (Ti-6Al-4V)</span>
                      <span className="font-mono font-semibold text-primary">15%</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-2">
                      <div className="bg-[#8B5A45] h-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders quick actions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl">Letzte Transaktionen & Rechnungen</h3>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="text-xs uppercase tracking-widest text-primary hover:underline"
                  >
                    Alle Rechnungen ansehen →
                  </button>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-on-surface-variant">
                      <tr>
                        <th className="p-4">Bestellnummer</th>
                        <th className="p-4">Klient</th>
                        <th className="p-4">Betrag</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {overview?.recent_orders?.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4 font-mono font-semibold text-primary">{ord.order_number}</td>
                          <td className="p-4">{ord.customer_name}</td>
                          <td className="p-4 font-serif text-sm">CHF {ord.total_amount?.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 border border-outline-variant/30 text-[10px] uppercase">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <a
                              href={`/api/v1/admin/invoices/${ord.id}/html`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-surface border border-outline-variant/30 hover:border-primary text-xs uppercase tracking-wider inline-block"
                            >
                              Rechnung
                            </a>
                            <button
                              onClick={() => openDispatchModal(ord)}
                              className="px-3 py-1 bg-primary text-on-primary text-xs uppercase tracking-wider inline-block hover:opacity-90"
                            >
                              Per Mail senden
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. TAB: CLIENT CRM MANAGEMENT */}
          {activeTab === 'crm' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-1">
                    Klienten-Beziehungsmanagement
                  </span>
                  <h2 className="font-serif text-3xl text-on-surface">Client CRM</h2>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') loadCustomers(); }}
                    placeholder="Klient oder Stadt suchen..."
                    className="bg-surface border border-outline-variant/30 p-2.5 text-xs outline-none focus:border-primary text-on-surface w-full sm:w-64"
                  />
                  <button
                    onClick={loadCustomers}
                    className="px-4 py-2.5 bg-primary text-on-primary text-xs uppercase tracking-widest hover:opacity-90"
                  >
                    Suchen
                  </button>
                </div>
              </div>

              {/* Customer CRM Table */}
              <div className="bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <tr>
                      <th className="p-4">Klient & Unternehmen</th>
                      <th className="p-4">Kontakt & Wohnort</th>
                      <th className="p-4">Mitglieds-Tier</th>
                      <th className="p-4 text-right">Umsatz (CHF)</th>
                      <th className="p-4 text-center">Bestellungen</th>
                      <th className="p-4 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4">
                          <div className="font-serif text-sm font-semibold">{c.full_name}</div>
                          {c.company && <div className="text-[11px] text-on-surface-variant">{c.company}</div>}
                        </td>
                        <td className="p-4 space-y-0.5">
                          <div className="font-mono text-on-surface-variant">{c.email}</div>
                          <div className="text-[11px]">{c.phone || '+41 --'} • {c.city || 'Schweiz'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest border ${
                            c.tier === 'Titanium Elite'
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-surface border-outline-variant/30 text-on-surface'
                          }`}>
                            {c.tier}
                          </span>
                        </td>
                        <td className="p-4 text-right font-serif text-sm text-primary font-medium">
                          CHF {c.total_spent?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center font-mono">
                          {c.orders_count}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-3 py-1.5 bg-surface border border-outline-variant/30 hover:border-primary text-xs uppercase tracking-wider"
                          >
                            Concierge Profil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. TAB: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-1">
                    Lagerverwaltung & Chargenkontrolle
                  </span>
                  <h2 className="font-serif text-3xl text-on-surface">Inventar Management</h2>
                </div>
                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="px-6 py-3 bg-primary text-on-primary text-xs uppercase tracking-widest font-sans hover:opacity-90 flex items-center gap-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Neues Objekt anlegen</span>
                </button>
              </div>

              {/* Inventory Table */}
              <div className="bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <tr>
                      <th className="p-4">Objekt & SKU</th>
                      <th className="p-4">Material</th>
                      <th className="p-4 text-center">Aktueller Bestand</th>
                      <th className="p-4 text-right">Verkaufspreis</th>
                      <th className="p-4 text-right">Gestehungskosten</th>
                      <th className="p-4 text-center">Marge</th>
                      <th className="p-4 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {inventory.map((item) => {
                      const isLow = item.stock <= item.low_stock_threshold;
                      const margin = item.base_price > 0 
                        ? Math.round(((item.base_price - item.cost_price) / item.base_price) * 100) 
                        : 0;

                      return (
                        <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4">
                            <div className="font-serif text-sm font-semibold">{item.title}</div>
                            <div className="text-[10px] font-mono text-on-surface-variant">
                              SKU: {item.sku_prefix}-{String(item.id).padStart(3, '0')}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="uppercase text-[10px] tracking-wider text-on-surface-variant">
                              {item.material}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleStockAdjust(item, -1)}
                                className="w-6 h-6 border border-outline-variant/30 hover:border-primary flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className={`font-mono text-sm px-2 font-bold ${isLow ? 'text-red-500' : 'text-primary'}`}>
                                {item.stock}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(item, 1)}
                                className="w-6 h-6 border border-outline-variant/30 hover:border-primary flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                            {isLow && (
                              <span className="text-[9px] uppercase tracking-widest text-red-500 block mt-1 font-semibold">
                                Niedriger Bestand
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-serif text-sm">
                            CHF {item.base_price.toLocaleString('de-CH')}
                          </td>
                          <td className="p-4 text-right font-mono text-on-surface-variant">
                            CHF {item.cost_price.toLocaleString('de-CH')}
                          </td>
                          <td className="p-4 text-center font-mono font-semibold text-primary">
                            {margin}%
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenInstagramModal(item)}
                                title="Auf Instagram (@pbstyle.ch) teilen"
                                className="px-2.5 py-1.5 bg-primary/10 border border-primary/30 hover:bg-primary hover:text-on-primary text-primary text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                <span>Post</span>
                              </button>
                              <button
                                onClick={() => setEditingItem({ ...item })}
                                className="px-3 py-1.5 bg-surface border border-outline-variant/30 hover:border-primary text-xs uppercase tracking-wider"
                              >
                                Bearbeiten
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TAB: INVOICES & SEND BY MAIL */}
          {activeTab === 'invoices' && (
            <div className="space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-1">
                  Offizielle Schweizer Abrechnungen & Zertifikate
                </span>
                <h2 className="font-serif text-3xl text-on-surface">Rechnungen & E-Mail-Versand</h2>
              </div>

              {/* Invoices List */}
              <div className="bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <tr>
                      <th className="p-4">Rechnungs-Nr.</th>
                      <th className="p-4">Bestellung</th>
                      <th className="p-4">Empfänger</th>
                      <th className="p-4 text-right">Betrag (inkl. MWST)</th>
                      <th className="p-4 text-center">Status Mail</th>
                      <th className="p-4 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {invoicesOrderList.map((ord) => (
                      <tr key={ord.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4 font-mono font-semibold text-primary">
                          {ord.invoice_number || `INV-2026-${String(ord.id).padStart(4, '0')}`}
                        </td>
                        <td className="p-4 font-mono text-on-surface-variant">
                          {ord.order_number}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-on-surface">{ord.customer_name}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant">{ord.customer_email}</div>
                        </td>
                        <td className="p-4 text-right font-serif text-sm">
                          CHF {ord.total_amount?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          {ord.invoice_sent ? (
                            <span className="px-2.5 py-0.5 bg-primary/10 border border-primary text-primary text-[10px] uppercase tracking-wider font-semibold">
                              Versandt ✓
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500 text-yellow-600 text-[10px] uppercase tracking-wider">
                              Bereit zum Versand
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <a
                            href={`/api/v1/admin/invoices/${ord.id}/html`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-surface border border-outline-variant/30 hover:border-primary text-xs uppercase tracking-wider inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">print</span>
                            <span>Ansehen</span>
                          </a>
                          <button
                            onClick={() => openDispatchModal(ord)}
                            className="px-3 py-1.5 bg-primary text-on-primary text-xs uppercase tracking-wider hover:opacity-90 inline-flex items-center gap-1 shadow-md"
                          >
                            <span className="material-symbols-outlined text-[14px]">send</span>
                            <span>Per Mail senden</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. TAB: INSTAGRAM CONNECTOR & AUTO-POST */}
          {activeTab === 'instagram' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/15 pb-6">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-primary block mb-1">
                    Meta Graph API v19.0 • Haute Joaillerie Social Dispatcher
                  </span>
                  <h2 className="font-serif text-3xl text-on-surface">Instagram Connector & Auto-Post</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 text-xs text-primary font-mono">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span>{instagramSettings?.account_username || '@pbstyle.ch'} (Verbunden)</span>
                  </div>
                  <button
                    onClick={() => loadInstagramData()}
                    className="p-2 border border-outline-variant/30 hover:border-primary text-on-surface-variant hover:text-primary transition-colors"
                    title="Aktualisieren"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
              </div>

              {/* Automation Control Panel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Auto-Post Toggle */}
                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                      Auto-Post Automatisierung
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-serif font-semibold block text-on-surface">
                        Bei neuem Produkt
                      </span>
                      <p className="text-[11px] text-on-surface-variant">
                        Automatische Veröffentlichung im Feed
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={instagramSettings?.auto_post_enabled ?? true}
                        onChange={(e) => handleToggleAutoPost(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                    <span>Status: {instagramSettings?.auto_post_enabled ? 'Aktiviert (Sofort-Post)' : 'Pausiert'}</span>
                  </div>
                </div>

                {/* Card 2: Account Insights */}
                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                      Instagram Business Profil
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">photo_camera</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-2xl text-on-surface font-light block">
                      {instagramSettings?.followers_count?.toLocaleString('de-CH') || '24\'800'}
                    </span>
                    <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
                      Verifizierte Abonnenten
                    </span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10 flex justify-between text-[11px] font-mono text-on-surface-variant">
                    <span>Beiträge im Atelier:</span>
                    <span className="text-primary font-bold">{instagramPosts.length} veröffentlicht</span>
                  </div>
                </div>

                {/* Card 3: Hashtag & Brand Tags */}
                <div className="p-6 bg-surface-container-low border border-outline-variant/20 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                      Standard Hashtags
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">tag</span>
                  </div>
                  <p className="text-xs font-mono text-on-surface-variant line-clamp-2 leading-relaxed">
                    {instagramSettings?.auto_hashtags || '#pbstyle #swissjewelry #950platin #hautejoaillerie'}
                  </p>
                  <div className="pt-2 border-t border-outline-variant/10 text-[10px] text-on-surface-variant flex items-center justify-between">
                    <span>Toleranz-Ausweisung:</span>
                    <span className="text-primary font-mono font-semibold">±0.01 mm</span>
                  </div>
                </div>
              </div>

              {/* Live Instagram Luxury Feed Grid */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                      Feed-Vorschau ({instagramSettings?.account_username || '@pbstyle.ch'})
                    </span>
                    <h3 className="font-serif text-2xl text-on-surface">Veröffentlichte Atelier-Beiträge</h3>
                  </div>
                  <span className="text-xs text-on-surface-variant font-sans">
                    Echtzeit-Synchronisiert mit Meta Graph API
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {instagramPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-surface-container-low border border-outline-variant/20 overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-colors shadow-lg"
                    >
                      {/* Media Image */}
                      <div className="relative aspect-square bg-surface overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.product_title || 'Instagram Post'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white rounded">
                          {post.status === 'published' ? 'Veröffentlicht ✓' : post.status}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-mono">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">favorite</span>
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            {post.comments_count}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4 space-y-3 font-sans text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-serif text-sm font-semibold text-on-surface line-clamp-1">
                            {post.product_title || 'Atelier Neuheit'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {new Date(post.created_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed whitespace-pre-line">
                          {post.caption}
                        </p>
                        <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center text-[10px]">
                          <span className="font-mono text-on-surface-variant/70">ID: {post.instagram_media_id?.slice(0, 12)}...</span>
                          <a
                            href={post.permalink || `https://www.instagram.com/pbstyle.ch`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline font-semibold flex items-center gap-0.5 uppercase tracking-wider"
                          >
                            <span>Öffnen</span>
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Post History Table */}
              <div className="space-y-4 pt-6">
                <h4 className="font-serif text-xl text-on-surface">Auto-Post Protokoll & Historie</h4>
                <div className="bg-surface-container-low border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-surface border-b border-outline-variant/20 text-[10px] uppercase tracking-widest text-on-surface-variant">
                      <tr>
                        <th className="p-4">Post-ID</th>
                        <th className="p-4">Produkt</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Interaktionen</th>
                        <th className="p-4">Datum & Uhrzeit</th>
                        <th className="p-4 text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {instagramPosts.map((p) => (
                        <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                          <td className="p-4 font-mono font-semibold text-primary">{p.instagram_media_id}</td>
                          <td className="p-4 font-medium text-on-surface">{p.product_title || 'Unikat'}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-primary/10 border border-primary text-primary text-[10px] uppercase tracking-wider font-semibold">
                              {p.status} ✓
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-on-surface-variant">
                            ❤️ {p.likes_count} • 💬 {p.comments_count}
                          </td>
                          <td className="p-4 font-mono text-on-surface-variant text-[11px]">
                            {new Date(p.created_at).toLocaleString('de-CH')}
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href={p.permalink || 'https://instagram.com/pbstyle.ch'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-surface border border-outline-variant/30 hover:border-primary text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                            >
                              <span>Beitrag</span>
                              <span className="material-symbols-outlined text-[13px]">north_east</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: CONCIERGE CRM PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-surface border border-outline-variant/30 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                  Concierge CRM Profil
                </span>
                <h3 className="font-serif text-2xl">{selectedCustomer.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-primary"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Klienten-Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.full_name}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, full_name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Telefonnummer
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.phone || ''}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Unternehmen / Kanzlei
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.company || ''}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, company: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    VIP-Mitgliedsstufe
                  </label>
                  <select
                    value={selectedCustomer.tier}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, tier: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  >
                    <option value="Titanium Elite">Titanium Elite</option>
                    <option value="Platinum Member">Platinum Member</option>
                    <option value="Gold Atelier">Gold Atelier</option>
                    <option value="Gast">Gast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Concierge-Notizen & Individuelle Präferenzen
                </label>
                <textarea
                  rows={4}
                  value={selectedCustomer.crm_notes || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, crm_notes: e.target.value })}
                  placeholder="Ringgrößen, bevorzugte Platingravuren, Übergabewünsche..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/15">
                <div className="text-on-surface-variant">
                  Gesamtumsatz: <span className="font-serif font-bold text-primary">CHF {selectedCustomer.total_spent?.toLocaleString('de-CH')}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="px-4 py-2 border border-outline-variant/30 uppercase tracking-widest text-xs"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-on-primary uppercase tracking-widest text-xs font-semibold shadow-md"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT INVENTORY ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-outline-variant/30 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                  Lagerbestand anpassen
                </span>
                <h3 className="font-serif text-2xl">{editingItem.title}</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="material-symbols-outlined">
                close
              </button>
            </div>

            <form onSubmit={handleSaveInventoryItem} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Aktueller Lagerbestand (Stück)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.stock}
                    onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Warnschwelle (Mindestbestand)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.low_stock_threshold}
                    onChange={(e) => setEditingItem({ ...editingItem, low_stock_threshold: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Verkaufspreis (CHF)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.base_price}
                    onChange={(e) => setEditingItem({ ...editingItem, base_price: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Gestehungskosten (CHF)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.cost_price}
                    onChange={(e) => setEditingItem({ ...editingItem, cost_price: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-outline-variant/30 uppercase tracking-widest text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary uppercase tracking-widest text-xs font-semibold shadow-md"
                >
                  Aktualisieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW PRODUCT */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-outline-variant/30 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                  Neues Meisterwerk erfassen
                </span>
                <h3 className="font-serif text-2xl">Objekt im Katalog anlegen</h3>
              </div>
              <button onClick={() => setIsNewProductModalOpen(false)} className="material-symbols-outlined">
                close
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Titel des Objekts
                </label>
                <input
                  type="text"
                  required
                  value={newProdTitle}
                  onChange={(e) => {
                    setNewProdTitle(e.target.value);
                    setNewProdHandle(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="z.B. Chronos Platin Cuff"
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Kategorie
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  >
                    <option value={1}>Schmuck (1)</option>
                    <option value={2}>Beauty-Tools (2)</option>
                    <option value={3}>Neuheiten (3)</option>
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Edelmetall / Material
                  </label>
                  <select
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                  >
                    <option value="platinum">950 Platin</option>
                    <option value="brushed steel">Chirurgenstahl 316L</option>
                    <option value="titanium">Titan Grade 5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Preis (CHF)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Kosten (CHF)
                  </label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                    Anfangsbestand
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Beschreibung
                </label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Metallurgische Eigenschaften, Haptik, Schweizer Ursprung..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/30 uppercase tracking-widest text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary uppercase tracking-widest text-xs font-semibold shadow-md"
                >
                  Objekt erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND INVOICE BY MAIL DISPATCH MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-outline-variant/30 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                  Rechnungsversand per E-Mail
                </span>
                <h3 className="font-serif text-2xl">
                  Rechnung {dispatchModalOrder.invoice_number || dispatchModalOrder.order_number}
                </h3>
              </div>
              <button onClick={() => setDispatchModalOrder(null)} className="material-symbols-outlined">
                close
              </button>
            </div>

            <form onSubmit={handleSendInvoice} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Empfänger E-Mail
                </label>
                <input
                  type="email"
                  required
                  value={dispatchRecipientEmail}
                  onChange={(e) => setDispatchRecipientEmail(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Betreff
                </label>
                <input
                  type="text"
                  required
                  value={dispatchSubject}
                  onChange={(e) => setDispatchSubject(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block uppercase tracking-widest text-on-surface-variant mb-1 font-semibold">
                  Persönliche Concierge-Nachricht
                </label>
                <textarea
                  rows={5}
                  value={dispatchMessage}
                  onChange={(e) => setDispatchMessage(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface leading-relaxed"
                />
              </div>

              <div className="p-3 bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>Enthält: <strong>Offizielles Schweizer PDF/HTML Rechnungsdokument</strong></span>
                <a
                  href={`/api/v1/admin/invoices/${dispatchModalOrder.id}/html`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline uppercase tracking-wider text-[10px]"
                >
                  Vorschau öffnen ↗
                </a>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 border border-outline-variant/30 uppercase tracking-widest text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-6 py-2.5 bg-primary text-on-primary uppercase tracking-widest text-xs font-semibold shadow-lg hover:opacity-90 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isDispatching ? 'Wird gesendet...' : 'Rechnung Jetzt Versenden'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: INSTAGRAM POST COMPOSER */}
      {instagramModalProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-surface border border-outline-variant/30 p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary block">
                  Meta Graph API v19.0 Publisher
                </span>
                <h3 className="font-serif text-2xl">Auf @pbstyle.ch veröffentlichen</h3>
              </div>
              <button
                onClick={() => setInstagramModalProduct(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-primary"
              >
                close
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Product preview card */}
              <div className="flex items-center gap-4 p-4 bg-surface-container-low border border-outline-variant/20">
                <div className="w-16 h-16 bg-surface-container-high border border-outline-variant/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {instagramModalProduct.images?.[0]?.url ? (
                    <img
                      src={instagramModalProduct.images[0].url}
                      alt={instagramModalProduct.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-primary text-2xl">diamond</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-semibold truncate text-on-surface">
                    {instagramModalProduct.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">
                    {instagramModalProduct.subtitle || 'Atelier Edition'}
                  </p>
                  <span className="text-xs font-mono text-primary font-bold">
                    CHF {instagramModalProduct.base_price?.toLocaleString('de-CH')}
                  </span>
                </div>
                <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] uppercase tracking-widest">
                  ±0.01 mm Zertifikat
                </span>
              </div>

              {/* Caption Editor */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block uppercase tracking-widest text-on-surface-variant font-semibold">
                    Instagram Bildunterschrift (Caption & Hashtags)
                  </label>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    {customInstagramCaption.length} Zeichen
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={customInstagramCaption}
                  onChange={(e) => setCustomInstagramCaption(e.target.value)}
                  placeholder="Caption für den Feed-Post eingeben..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 p-3 outline-none focus:border-primary text-on-surface leading-relaxed font-sans text-xs"
                />
              </div>

              <div className="p-3 bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span>Zielkanal: <strong>Instagram Feed (@pbstyle.ch)</strong></span>
                </div>
                <span className="text-[10px] font-mono text-primary">Graph API Container</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setInstagramModalProduct(null)}
                  className="px-4 py-2 border border-outline-variant/30 uppercase tracking-widest text-xs"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  disabled={isInstagramPublishing}
                  onClick={() => handleManualInstagramPublish(instagramModalProduct.id, customInstagramCaption)}
                  className="px-6 py-2.5 bg-primary text-on-primary uppercase tracking-widest text-xs font-semibold shadow-lg hover:opacity-90 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isInstagramPublishing ? 'hourglass_top' : 'photo_camera'}
                  </span>
                  <span>{isInstagramPublishing ? 'Wird veröffentlicht...' : 'Jetzt auf Instagram Posten'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
