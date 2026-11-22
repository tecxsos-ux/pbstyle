'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ExternalLink,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Minus,
  Package,
  Pencil,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

type AdminTab = 'overview' | 'crm' | 'inventory' | 'invoices' | 'instagram';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [toast, setToast] = useState<string>('');

  // Overview
  const [overview, setOverview] = useState<any>(null);

  // CRM
  const [customers, setCustomers] = useState<any[]>([]);
  const [crmSearch, setCrmSearch] = useState('');
  const [crmTierFilter, setCrmTierFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Inventory
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

  // Invoices
  const [invoicesOrderList, setInvoicesOrderList] = useState<any[]>([]);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any>(null);
  const [dispatchRecipientEmail, setDispatchRecipientEmail] = useState('');
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Instagram
  const [instagramSettings, setInstagramSettings] = useState<any>(null);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [isInstagramPublishing, setIsInstagramPublishing] = useState<boolean>(false);
  const [instagramModalProduct, setInstagramModalProduct] = useState<any>(null);
  const [customInstagramCaption, setCustomInstagramCaption] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('pbstyle_admin_token');
    const storedUser = localStorage.getItem('pbstyle_admin_user');
    if (!storedToken) {
      router.push('/admin/login');
      return;
    }
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch {}
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

  const loadCustomers = async (searchOverride?: string, tierOverride?: string) => {
    try {
      const query = new URLSearchParams();
      const s = searchOverride !== undefined ? searchOverride : crmSearch;
      const t = tierOverride !== undefined ? tierOverride : crmTierFilter;
      if (s) query.append('search', s);
      if (t) query.append('tier', t);
      const res = await fetch(`/api/v1/admin/crm/customers?${query.toString()}`);
      if (res.ok) setCustomers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await fetch('/api/v1/admin/inventory/products');
      if (res.ok) setInventory(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadInstagramData = async () => {
    try {
      const [settingsRes, postsRes] = await Promise.all([
        fetch('/api/v1/instagram/settings'),
        fetch('/api/v1/instagram/posts'),
      ]);
      if (settingsRes.ok) setInstagramSettings(await settingsRes.json());
      if (postsRes.ok) setInstagramPosts(await postsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAutoPost = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/v1/instagram/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto_post_enabled: enabled }),
      });
      if (res.ok) {
        setInstagramSettings(await res.json());
        showToast(`Instagram Auto-Post ${enabled ? 'aktiviert' : 'deaktiviert'}.`);
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
        body: JSON.stringify({ custom_caption: customCaption }),
      });
      if (res.ok) {
        const result = await res.json();
        showToast(result.message || 'Erfolgreich auf Instagram (@pbstyle.ch) veröffentlicht!');
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
        setCustomInstagramCaption(
          `Neu im Zürcher Atelier: ${product.title}\n\nPreis: CHF ${product.base_price}\n\n#pbstyle #swissjewelry #950platin`
        );
      }
    } catch {
      setCustomInstagramCaption(`Neu im Zürcher Atelier: ${product.title}\n\n#pbstyle #swissjewelry`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pbstyle_admin_token');
    localStorage.removeItem('pbstyle_admin_user');
    router.push('/admin/login');
  };

  const handleStockAdjust = async (product: any, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch(`/api/v1/admin/inventory/products/${product.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          status: editingItem.status,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setEditingItem(null);
        showToast(`Objekt "${updated.title}" aktualisiert.`);
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          status: 'Aktiv',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setInventory([created, ...inventory]);
        setIsNewProductModalOpen(false);
        setNewProdTitle('');
        setNewProdHandle('');
        setNewProdDesc('');
        showToast(`Neues Objekt "${created.title}" angelegt & auf Instagram synchronisiert.`);
        loadOverview();
        loadInstagramData();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          loyalty_points: selectedCustomer.loyalty_points,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedCustomer(null);
        showToast(`Klientenprofil "${updated.full_name}" gespeichert.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openDispatchModal = (order: any) => {
    setDispatchModalOrder(order);
    setDispatchRecipientEmail(order.customer_email);
    setDispatchSubject(`Ihre offizielle PBSTYLE Rechnung & Zertifikat (${order.order_number})`);
    setDispatchMessage(
      `Sehr geehrte Damen und Herren,\n\nanbei erhalten Sie Ihre offizielle PBSTYLE Rechnung mit ausgewiesener Schweizer Mehrwertsteuer sowie Ihr nummeriertes Ursprungszertifikat.\n\nMit vorzüglicher Hochachtung,\nPBSTYLE Atelier Zürich`
    );
  };

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
          custom_message: dispatchMessage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Rechnung erfolgreich versandt.');
        setDispatchModalOrder(null);
        loadOverview();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatching(false);
    }
  };

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
    { id: 'crm', label: 'Client CRM', icon: Users, badge: overview?.active_clients_count },
    {
      id: 'inventory',
      label: 'Inventar & Lager',
      icon: Package,
      badge: overview?.low_stock_items_count > 0 ? overview.low_stock_items_count : undefined,
    },
    { id: 'invoices', label: 'Rechnungen & Mail', icon: Receipt, badge: invoicesOrderList.length || undefined },
    { id: 'instagram', label: 'Instagram Auto-Post', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-2xl tracking-tight text-foreground">
            pbstyle
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <Badge variant="bronze" className="hidden sm:inline-flex">
            Command Center
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-xs font-medium text-foreground">
              {adminUser?.full_name || 'Philippe Bernasconi'}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-bronze">
              {adminUser?.role || 'superadmin'}
            </span>
          </div>

          <ThemeToggle />

          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Abmelden</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/50 p-3 md:p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <span className="hidden md:block px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Atelier Module
            </span>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === 'crm') loadCustomers();
                      if (item.id === 'inventory') loadInventory();
                      if (item.id === 'instagram') loadInstagramData();
                    }}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm ${
                          active
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Status Card */}
          <Card className="hidden md:block mt-6 bg-background/60">
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-bronze font-semibold">
                  Systemstatus
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <Separator />
              <div className="flex justify-between text-muted-foreground">
                <span>Lager-Warnungen</span>
                <span
                  className={`font-mono font-semibold ${
                    overview?.low_stock_items_count > 0 ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {overview?.low_stock_items_count || 0}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Aktive VIPs</span>
                <span className="font-mono font-semibold text-foreground">
                  {overview?.active_clients_count || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-5 md:p-8 lg:p-10 space-y-8 overflow-y-auto max-w-[1400px]">
          {/* Toast Banner */}
          {toast && (
            <div className="p-3.5 rounded-md bg-bronze/10 border border-bronze/40 text-foreground text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-bronze shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
                  Performance & Kennzahlen
                </span>
                <h1 className="font-serif text-3xl text-foreground">Atelier-Übersicht</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-[11px] uppercase tracking-widest">Gesamtumsatz</span>
                      <TrendingUp className="h-4 w-4 text-bronze" />
                    </div>
                    <div className="font-mono text-2xl font-semibold text-foreground">
                      CHF{' '}
                      {overview?.total_revenue_chf?.toLocaleString('de-CH', {
                        minimumFractionDigits: 2,
                      }) || "5'490.00"}
                    </div>
                    <Badge variant="success" className="font-mono">
                      +18.4% ggü. Vormonat
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-[11px] uppercase tracking-widest">Bestellungen</span>
                      <ShoppingBag className="h-4 w-4 text-bronze" />
                    </div>
                    <div className="font-mono text-2xl font-semibold text-foreground">
                      {overview?.total_orders_count || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Mit Schweizer Zertifikat
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-[11px] uppercase tracking-widest">Aktive Klienten</span>
                      <Users className="h-4 w-4 text-bronze" />
                    </div>
                    <div className="font-mono text-2xl font-semibold text-foreground">
                      {overview?.active_clients_count || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Verifizierte Sammler</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-[11px] uppercase tracking-widest">Lager-Warnungen</span>
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          overview?.low_stock_items_count > 0 ? 'text-destructive' : 'text-bronze'
                        }`}
                      />
                    </div>
                    <div
                      className={`font-mono text-2xl font-semibold ${
                        overview?.low_stock_items_count > 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {overview?.low_stock_items_count || 0} Objekte
                    </div>
                    <p className="text-[11px] text-muted-foreground">Unter Mindestbestand</p>
                  </CardContent>
                </Card>
              </div>

              {/* Material Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Umsatzverteilung nach Werkstoff</CardTitle>
                  <CardDescription>Anteil am Gesamtvolumen nach Edelmetall-Kategorie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: '950 Platin (Pt 950)', value: 58 },
                    { name: 'Chirurgenstahl 316L (V4A)', value: 27 },
                    { name: 'Titan Grade 5 (Ti-6Al-4V)', value: 15 },
                  ].map((m) => (
                    <div key={m.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-mono text-bronze font-semibold">{m.value}%</span>
                      </div>
                      <Progress value={m.value} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Letzte Transaktionen</CardTitle>
                    <CardDescription>Aktuelle Bestellungen & Rechnungsstatus</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('invoices')}>
                    Alle Rechnungen
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bestellnr.</TableHead>
                        <TableHead>Klient</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {overview?.recent_orders?.map((ord: any) => (
                        <TableRow key={ord.id}>
                          <TableCell className="font-mono font-semibold text-bronze">
                            {ord.order_number}
                          </TableCell>
                          <TableCell className="font-medium">{ord.customer_name}</TableCell>
                          <TableCell className="font-mono">
                            CHF {ord.total_amount?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{ord.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`/api/v1/admin/invoices/${ord.id}/html`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Rechnung
                              </a>
                            </Button>
                            <Button
                              variant="bronze"
                              size="sm"
                              onClick={() => openDispatchModal(ord)}
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Senden
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. CRM */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
                    Klienten-Beziehungsmanagement
                  </span>
                  <h1 className="font-serif text-3xl">Client CRM</h1>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loadCustomers();
                      }}
                      placeholder="Name, E-Mail oder Stadt..."
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                  <Select
                    value={crmTierFilter}
                    onChange={(e) => {
                      setCrmTierFilter(e.target.value);
                      loadCustomers(crmSearch, e.target.value);
                    }}
                    className="w-40 h-9 text-xs"
                  >
                    <option value="">Alle Stufen</option>
                    <option value="Titanium Elite">Titanium Elite</option>
                    <option value="Platinum Member">Platinum Member</option>
                    <option value="Gold Atelier">Gold Atelier</option>
                    <option value="Gast">Gast</option>
                  </Select>
                  <Button size="sm" className="h-9" onClick={() => loadCustomers()}>
                    Suchen
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Klient & Unternehmen</TableHead>
                        <TableHead>Kontakt & Ort</TableHead>
                        <TableHead>Mitgliedsstufe</TableHead>
                        <TableHead className="text-right">Umsatz</TableHead>
                        <TableHead className="text-center">Bestellungen</TableHead>
                        <TableHead className="text-right">Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-serif text-sm font-medium text-foreground">
                              {c.full_name}
                            </div>
                            {c.company && (
                              <div className="text-[11px] text-muted-foreground">{c.company}</div>
                            )}
                          </TableCell>
                          <TableCell className="space-y-0.5">
                            <div className="font-mono text-muted-foreground">{c.email}</div>
                            <div className="text-[11px]">
                              {c.phone || '+41 --'} • {c.city || 'Schweiz'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.tier === 'Titanium Elite' ? 'bronze' : 'secondary'}>
                              {c.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-foreground">
                            CHF {c.total_spent?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center font-mono">{c.orders_count}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCustomer({ ...c })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Profil
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 3. INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
                    Lagerverwaltung & Chargenkontrolle
                  </span>
                  <h1 className="font-serif text-3xl">Inventar Management</h1>
                </div>
                <Button variant="bronze" onClick={() => setIsNewProductModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Neues Objekt anlegen
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Objekt & SKU</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-center">Bestand</TableHead>
                        <TableHead className="text-right">Verkaufspreis</TableHead>
                        <TableHead className="text-right">Kosten</TableHead>
                        <TableHead className="text-center">Marge</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {inventory.map((item) => {
                        const isLow = item.stock <= item.low_stock_threshold;
                        const margin =
                          item.base_price > 0
                            ? Math.round(((item.base_price - item.cost_price) / item.base_price) * 100)
                            : 0;

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-serif text-sm font-medium">{item.title}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {item.sku_prefix}-{String(item.id).padStart(3, '0')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.material}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleStockAdjust(item, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span
                                  className={`font-mono text-sm font-semibold w-8 text-center ${
                                    isLow ? 'text-destructive' : 'text-foreground'
                                  }`}
                                >
                                  {item.stock}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleStockAdjust(item, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              {isLow && (
                                <div className="mt-1">
                                  <Badge variant="destructive">Niedrig</Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              CHF {item.base_price.toLocaleString('de-CH')}
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              CHF {item.cost_price.toLocaleString('de-CH')}
                            </TableCell>
                            <TableCell className="text-center font-mono font-semibold text-bronze">
                              {margin}%
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenInstagramModal(item)}
                                >
                                  <Camera className="h-3.5 w-3.5 text-bronze" />
                                  Post
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setEditingItem({ ...item })}
                                >
                                  Bearbeiten
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 4. INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
                  Offizielle Schweizer Abrechnungen & Zertifikate
                </span>
                <h1 className="font-serif text-3xl">Rechnungen & E-Mail-Versand</h1>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rechnungs-Nr.</TableHead>
                        <TableHead>Bestellung</TableHead>
                        <TableHead>Empfänger</TableHead>
                        <TableHead className="text-right">Betrag (inkl. MWST)</TableHead>
                        <TableHead className="text-center">Versandstatus</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {invoicesOrderList.map((ord) => (
                        <TableRow key={ord.id}>
                          <TableCell className="font-mono font-semibold text-bronze">
                            {ord.invoice_number || `INV-2026-${String(ord.id).padStart(4, '0')}`}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {ord.order_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ord.customer_name}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {ord.customer_email}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            CHF {ord.total_amount?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center">
                            {ord.invoice_sent ? (
                              <Badge variant="success">Versandt</Badge>
                            ) : (
                              <Badge variant="warning">Bereit</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`/api/v1/admin/invoices/${ord.id}/html`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Ansehen
                              </a>
                            </Button>
                            <Button
                              variant="bronze"
                              size="sm"
                              onClick={() => openDispatchModal(ord)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Per Mail senden
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 5. INSTAGRAM */}
          {activeTab === 'instagram' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bronze block mb-1">
                    Meta Graph API v19.0 • Social Dispatcher
                  </span>
                  <h1 className="font-serif text-3xl">Instagram Connector & Auto-Post</h1>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge variant="success" className="font-mono py-1 px-3">
                    {instagramSettings?.account_username || '@pbstyle.ch'} • Verbunden
                  </Badge>
                  <Button variant="outline" size="icon" onClick={loadInstagramData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Auto-Post
                      </span>
                      <Zap className="h-4 w-4 text-bronze" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-serif text-lg">Bei neuem Produkt</p>
                        <p className="text-xs text-muted-foreground">Sofortige Feed-Synchronisation</p>
                      </div>
                      <Switch
                        checked={instagramSettings?.auto_post_enabled ?? true}
                        onCheckedChange={handleToggleAutoPost}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Abonnenten
                      </span>
                      <Camera className="h-4 w-4 text-bronze" />
                    </div>
                    <div className="font-mono text-2xl font-semibold">
                      {instagramSettings?.followers_count?.toLocaleString('de-CH') || "24'800"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {instagramPosts.length} veröffentlichte Atelier-Beiträge
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold block">
                      Standard Hashtags
                    </span>
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {instagramSettings?.auto_hashtags || '#pbstyle #swissjewelry #950platin #hautejoaillerie'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Posts Grid */}
              <div className="space-y-4">
                <h2 className="font-serif text-2xl">Veröffentlichte Beiträge</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {instagramPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden group flex flex-col justify-between">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.product_title || 'Instagram Post'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2.5 right-2.5 bg-background/85 backdrop-blur-md"
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-serif text-sm font-medium line-clamp-1">
                            {post.product_title || 'Atelier Neuheit'}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                            {new Date(post.created_at).toLocaleDateString('de-CH')}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-3 whitespace-pre-line">
                          {post.caption}
                        </p>
                        <Separator />
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="flex items-center gap-3 font-mono text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-bronze" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-bronze" />
                              {post.comments_count}
                            </span>
                          </span>
                          <a
                            href={post.permalink || 'https://instagram.com/pbstyle.ch'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-bronze hover:underline inline-flex items-center gap-1"
                          >
                            Öffnen
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DIALOG 1: CRM PROFILE */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.full_name}</DialogTitle>
            <DialogDescription>Concierge CRM Profil & VIP-Stufe verwalten</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Klienten-Name</Label>
                  <Input
                    value={selectedCustomer.full_name}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefonnummer</Label>
                  <Input
                    value={selectedCustomer.phone || ''}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Unternehmen</Label>
                  <Input
                    value={selectedCustomer.company || ''}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, company: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>VIP-Stufe</Label>
                  <Select
                    value={selectedCustomer.tier}
                    onChange={(e) =>
                      setSelectedCustomer({ ...selectedCustomer, tier: e.target.value })
                    }
                  >
                    <option value="Titanium Elite">Titanium Elite</option>
                    <option value="Platinum Member">Platinum Member</option>
                    <option value="Gold Atelier">Gold Atelier</option>
                    <option value="Gast">Gast</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Concierge-Notizen</Label>
                <Textarea
                  rows={4}
                  value={selectedCustomer.crm_notes || ''}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, crm_notes: e.target.value })
                  }
                  placeholder="Ringgrößen, Gravurwünsche, Präferenzen..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Abbrechen
                </Button>
                <Button type="submit" variant="bronze">
                  Speichern
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT INVENTORY */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.title}</DialogTitle>
            <DialogDescription>Lagerbestand, Preise und Warnschwelle anpassen</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleSaveInventoryItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lagerbestand</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingItem.stock}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, stock: Number(e.target.value) })
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Warnschwelle</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingItem.low_stock_threshold}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        low_stock_threshold: Number(e.target.value),
                      })
                    }
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Verkaufspreis (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingItem.base_price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, base_price: Number(e.target.value) })
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gestehungskosten (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingItem.cost_price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, cost_price: Number(e.target.value) })
                    }
                    className="font-mono"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Abbrechen
                </Button>
                <Button type="submit" variant="bronze">
                  Aktualisieren
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: CREATE NEW PRODUCT */}
      <Dialog open={isNewProductModalOpen} onOpenChange={setIsNewProductModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Objekt anlegen</DialogTitle>
            <DialogDescription>
              Erfasst ein neues Produkt im Katalog und synchronisiert optional mit Instagram.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titel des Objekts</Label>
              <Input
                required
                value={newProdTitle}
                onChange={(e) => {
                  setNewProdTitle(e.target.value);
                  setNewProdHandle(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="z.B. Chronos Platin Cuff"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Kategorie</Label>
                <Select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(Number(e.target.value))}
                >
                  <option value={1}>Schmuck</option>
                  <option value={2}>Beauty-Tools</option>
                  <option value={3}>Neuheiten</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Material</Label>
                <Select
                  value={newProdMaterial}
                  onChange={(e) => setNewProdMaterial(e.target.value)}
                >
                  <option value="platinum">950 Platin</option>
                  <option value="brushed steel">Chirurgenstahl 316L</option>
                  <option value="titanium">Titan Grade 5</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Preis (CHF)</Label>
                <Input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kosten</Label>
                <Input
                  type="number"
                  value={newProdCost}
                  onChange={(e) => setNewProdCost(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bestand</Label>
                <Input
                  type="number"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Beschreibung</Label>
              <Textarea
                rows={3}
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Metallurgische Eigenschaften & Haptik..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewProductModalOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" variant="bronze">
                Objekt erstellen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: SEND INVOICE */}
      <Dialog
        open={!!dispatchModalOrder}
        onOpenChange={(open) => !open && setDispatchModalOrder(null)}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Rechnung {dispatchModalOrder?.invoice_number || dispatchModalOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Offizielle Schweizer Rechnung mit QR-Referenz per E-Mail versenden.
            </DialogDescription>
          </DialogHeader>
          {dispatchModalOrder && (
            <form onSubmit={handleSendInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Empfänger E-Mail</Label>
                <Input
                  type="email"
                  required
                  value={dispatchRecipientEmail}
                  onChange={(e) => setDispatchRecipientEmail(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Betreff</Label>
                <Input
                  required
                  value={dispatchSubject}
                  onChange={(e) => setDispatchSubject(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Persönliche Concierge-Nachricht</Label>
                <Textarea
                  rows={5}
                  value={dispatchMessage}
                  onChange={(e) => setDispatchMessage(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDispatchModalOrder(null)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" variant="bronze" disabled={isDispatching}>
                  <Send className="h-3.5 w-3.5" />
                  {isDispatching ? 'Wird gesendet...' : 'Rechnung senden'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: INSTAGRAM PUBLISH */}
      <Dialog
        open={!!instagramModalProduct}
        onOpenChange={(open) => !open && setInstagramModalProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auf Instagram teilen</DialogTitle>
            <DialogDescription>
              Veröffentlicht {instagramModalProduct?.title} direkt auf @pbstyle.ch.
            </DialogDescription>
          </DialogHeader>
          {instagramModalProduct && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Beitrags-Text (Caption)</Label>
                <Textarea
                  rows={6}
                  value={customInstagramCaption}
                  onChange={(e) => setCustomInstagramCaption(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInstagramModalProduct(null)}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="bronze"
                  disabled={isInstagramPublishing}
                  onClick={() =>
                    handleManualInstagramPublish(instagramModalProduct.id, customInstagramCaption)
                  }
                >
                  <Camera className="h-4 w-4" />
                  {isInstagramPublishing ? 'Veröffentliche...' : 'Jetzt veröffentlichen'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
