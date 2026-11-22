'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Menu,
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
  Truck,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

type AdminTab = 'overview' | 'crm' | 'inventory' | 'invoices' | 'instagram';

function getInitials(name?: string) {
  if (!name) return 'PB';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [inventorySearch, setInventorySearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
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
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any>(null);
  const [dispatchRecipientEmail, setDispatchRecipientEmail] = useState('');
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Tracking Number Dispatch
  const [trackingModalOrder, setTrackingModalOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('Schweizer Post «Pro Clima»');
  const [trackingNote, setTrackingNote] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

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

    Promise.all([loadOverview(), loadCustomers(), loadInventory(), loadInstagramData()]).finally(
      () => setIsInitialLoading(false)
    );
  }, []);

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadOverview(), loadCustomers(), loadInventory(), loadInstagramData()]);
    setIsRefreshing(false);
    showToast('Daten aktualisiert');
  };

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
        showToast(result.message || 'Auf Instagram (@pbstyle.ch) veröffentlicht!');
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
          `Neu im Atelier: ${product.title}\n\nPreis: CHF ${product.base_price}\n\n#pbstyle #swissjewelry #950platin`
        );
      }
    } catch {
      setCustomInstagramCaption(`Neu im Atelier: ${product.title}\n\n#pbstyle #swissjewelry`);
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
        showToast(`"${updated.title}" aktualisiert.`);
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
        showToast(`"${created.title}" angelegt.`);
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

  const openTrackingModal = (order: any) => {
    setTrackingModalOrder(order);
    setTrackingNumber(order.tracking_number || '');
    setTrackingCarrier(order.tracking_carrier || 'Schweizer Post «Pro Clima»');
    setTrackingNote('');
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder || !trackingNumber.trim()) return;
    setIsSavingTracking(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${trackingModalOrder.id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: trackingNumber.trim(),
          tracking_carrier: trackingCarrier,
          custom_note: trackingNote.trim() || null,
          send_email: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Tracking-Nummer gespeichert & per E-Mail versandt.');
        setTrackingModalOrder(null);
        await loadOverview();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Fehler beim Speichern der Tracking-Nummer.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingTracking(false);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (lowStockOnly && item.stock > item.low_stock_threshold) return false;
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase();
        const hay = `${item.title} ${item.material} ${item.sku_prefix}-${item.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [inventory, inventorySearch, lowStockOnly]);

  const filteredInvoices = useMemo(() => {
    return invoicesOrderList.filter((ord) => {
      if (invoiceFilter === 'sent') return Boolean(ord.invoice_sent);
      if (invoiceFilter === 'pending') return !ord.invoice_sent;
      return true;
    });
  }, [invoicesOrderList, invoiceFilter]);

  const navItems: {
    id: AdminTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: number;
    alert?: boolean;
  }[] = [
    { id: 'overview', label: 'Übersicht', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'crm', label: 'Client CRM', shortLabel: 'CRM', icon: Users, badge: overview?.active_clients_count },
    {
      id: 'inventory',
      label: 'Inventar & Lager',
      shortLabel: 'Lager',
      icon: Package,
      badge: overview?.low_stock_items_count > 0 ? overview.low_stock_items_count : undefined,
      alert: overview?.low_stock_items_count > 0,
    },
    {
      id: 'invoices',
      label: 'Rechnungen & Mail',
      shortLabel: 'Belege',
      icon: Receipt,
      badge: invoicesOrderList.length || undefined,
    },
    { id: 'instagram', label: 'Instagram Auto-Post', shortLabel: 'Social', icon: Camera },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    if (tab === 'crm') loadCustomers();
    if (tab === 'inventory') loadInventory();
    if (tab === 'instagram') loadInstagramData();
  };

  const activeNavMeta = navItems.find((n) => n.id === activeTab);

  const SidebarBody = () => (
    <div className="flex flex-col h-full justify-between gap-6">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-2xl tracking-tight text-foreground leading-none">
              pbstyle
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-bronze mt-1">
              Command Center
            </span>
          </Link>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground block mb-2">
            Module
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
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
                      item.alert
                        ? 'bg-destructive text-destructive-foreground'
                        : active
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
        </div>
      </div>

      {/* Bottom Profile & Status */}
      <div className="space-y-4">
        <Card className="bg-background/70">
          <CardContent className="p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-bronze font-semibold">
                Live Status
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
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

        <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-muted/40 border border-border/60">
          <div className="h-9 w-9 rounded-full bg-bronze/15 border border-bronze/40 text-bronze font-mono text-xs font-semibold flex items-center justify-center shrink-0">
            {getInitials(adminUser?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              {adminUser?.full_name || 'Atelier Admin'}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground truncate">
              {adminUser?.role || 'superadmin'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/">
              <Store className="h-3.5 w-3.5" />
              Shop
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-border bg-card/60 p-5 sticky top-0 h-screen flex-col">
        <SidebarBody />
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-14 md:h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Drawer Trigger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2" aria-label="Menü">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-5">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>
                <SidebarBody />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg md:text-xl font-medium truncate">
                  {activeNavMeta?.label}
                </span>
                <Badge variant="bronze" className="hidden sm:inline-flex font-mono">
                  Live
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {activeTab === 'inventory' && (
              <Button
                variant="bronze"
                size="sm"
                onClick={() => setIsNewProductModalOpen(true)}
                className="h-9"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Neues Objekt</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={refreshAll}
              disabled={isRefreshing}
              aria-label="Aktualisieren"
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <ThemeToggle />
          </div>
        </header>

        {/* Workspace Body (extra bottom padding on mobile for bottom tab bar) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto space-y-6">
          {isInitialLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-28 animate-pulse bg-muted/50" />
                ))}
              </div>
              <Card className="h-64 animate-pulse bg-muted/50" />
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Grid: 2x2 on mobile, 4-col on xl */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
                    <Card>
                      <CardContent className="p-4 sm:p-5 space-y-1.5">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-widest">Umsatz</span>
                          <TrendingUp className="h-4 w-4 text-bronze" />
                        </div>
                        <div className="font-mono text-lg sm:text-2xl font-semibold text-foreground truncate">
                          CHF{' '}
                          {overview?.total_revenue_chf?.toLocaleString('de-CH', {
                            minimumFractionDigits: 0,
                          }) || "5'490"}
                        </div>
                        <Badge variant="success" className="font-mono text-[9px]">
                          +18.4%
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 sm:p-5 space-y-1.5">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-widest">Orders</span>
                          <ShoppingBag className="h-4 w-4 text-bronze" />
                        </div>
                        <div className="font-mono text-lg sm:text-2xl font-semibold text-foreground">
                          {overview?.total_orders_count || 0}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Verifiziert
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 sm:p-5 space-y-1.5">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-widest">Klienten</span>
                          <Users className="h-4 w-4 text-bronze" />
                        </div>
                        <div className="font-mono text-lg sm:text-2xl font-semibold text-foreground">
                          {overview?.active_clients_count || 0}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">CRM Aktiv</p>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:border-bronze/50 transition-colors"
                      onClick={() => {
                        setLowStockOnly(true);
                        handleSelectTab('inventory');
                      }}
                    >
                      <CardContent className="p-4 sm:p-5 space-y-1.5">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-widest">Lager</span>
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              overview?.low_stock_items_count > 0
                                ? 'text-destructive'
                                : 'text-bronze'
                            }`}
                          />
                        </div>
                        <div
                          className={`font-mono text-lg sm:text-2xl font-semibold ${
                            overview?.low_stock_items_count > 0
                              ? 'text-destructive'
                              : 'text-foreground'
                          }`}
                        >
                          {overview?.low_stock_items_count || 0} Warn.
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Bestand prüfen →
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Material Distribution */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Umsatz nach Edelmetall</CardTitle>
                      <CardDescription>Verteilung nach Werkstoff-Kategorie</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: '950 Platin (Pt 950)', value: 58 },
                        { name: 'Chirurgenstahl 316L', value: 27 },
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

                  {/* Recent Orders: Mobile Cards + Desktop Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-xl">Letzte Transaktionen</h2>
                      <Button variant="ghost" size="sm" onClick={() => handleSelectTab('invoices')}>
                        Alle ansehen
                      </Button>
                    </div>

                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {overview?.recent_orders?.map((ord: any) => (
                        <Card key={ord.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-semibold text-bronze block">
                                  {ord.order_number}
                                </span>
                                <span className="font-medium text-sm">{ord.customer_name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-sm font-semibold block">
                                  CHF {ord.total_amount?.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="mt-1">
                                  {ord.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              <Button variant="outline" size="sm" asChild className="w-full px-2">
                                <a
                                  href={`/api/v1/admin/invoices/${ord.id}/html`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                  Beleg
                                </a>
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full px-2"
                                onClick={() => openTrackingModal(ord)}
                              >
                                <Truck className="h-3.5 w-3.5 text-bronze" />
                                Track
                              </Button>
                              <Button
                                variant="bronze"
                                size="sm"
                                className="w-full px-2"
                                onClick={() => openDispatchModal(ord)}
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Mail
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <Card className="hidden md:block">
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
                                  <div className="flex flex-col gap-1 items-start">
                                    <Badge variant={ord.tracking_number ? 'success' : 'secondary'}>
                                      {ord.status}
                                    </Badge>
                                    {ord.tracking_number && (
                                      <span className="font-mono text-[10px] text-muted-foreground">
                                        {ord.tracking_number}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openTrackingModal(ord)}
                                  >
                                    <Truck className="h-3.5 w-3.5 text-bronze" />
                                    {ord.tracking_number ? 'Tracking' : '+ Tracking'}
                                  </Button>
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
                </div>
              )}

              {/* 2. CLIENT CRM */}
              {activeTab === 'crm' && (
                <div className="space-y-5">
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') loadCustomers();
                        }}
                        placeholder="Klient, E-Mail oder Stadt suchen..."
                        className="pl-9 text-xs h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={crmTierFilter}
                        onChange={(e) => {
                          setCrmTierFilter(e.target.value);
                          loadCustomers(crmSearch, e.target.value);
                        }}
                        className="flex-1 sm:w-44 h-10 text-xs"
                      >
                        <option value="">Alle VIP-Stufen</option>
                        <option value="Titanium Elite">Titanium Elite</option>
                        <option value="Platinum Member">Platinum Member</option>
                        <option value="Gold Atelier">Gold Atelier</option>
                        <option value="Gast">Gast</option>
                      </Select>
                      <Button className="h-10" onClick={() => loadCustomers()}>
                        Suchen
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Customer Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {customers.map((c) => (
                      <Card key={c.id}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-full bg-bronze/15 border border-bronze/30 text-bronze font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                                {getInitials(c.full_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-serif text-base font-medium truncate">
                                  {c.full_name}
                                </p>
                                <p className="font-mono text-[11px] text-muted-foreground truncate">
                                  {c.email}
                                </p>
                              </div>
                            </div>
                            <Badge variant={c.tier === 'Titanium Elite' ? 'bronze' : 'secondary'}>
                              {c.tier}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                            <span className="text-muted-foreground">
                              {c.city || 'Schweiz'} • {c.orders_count} Orders
                            </span>
                            <span className="font-mono font-semibold text-foreground">
                              CHF {c.total_spent?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedCustomer({ ...c })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Concierge Profil bearbeiten
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <Card className="hidden md:block">
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
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-bronze/15 border border-bronze/30 text-bronze font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                                    {getInitials(c.full_name)}
                                  </div>
                                  <div>
                                    <div className="font-serif text-sm font-medium text-foreground">
                                      {c.full_name}
                                    </div>
                                    {c.company && (
                                      <div className="text-[11px] text-muted-foreground">
                                        {c.company}
                                      </div>
                                    )}
                                  </div>
                                </div>
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
                              <TableCell className="text-right font-mono font-medium">
                                CHF{' '}
                                {c.total_spent?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                {c.orders_count}
                              </TableCell>
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
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Produkt, SKU oder Material filtern..."
                        className="pl-9 text-xs h-10"
                      />
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <Switch checked={lowStockOnly} onCheckedChange={setLowStockOnly} />
                        <span>Nur niedriger Bestand</span>
                      </label>
                    </div>
                  </div>

                  {/* Mobile Inventory Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredInventory.map((item) => {
                      const isLow = item.stock <= item.low_stock_threshold;
                      const margin =
                        item.base_price > 0
                          ? Math.round(((item.base_price - item.cost_price) / item.base_price) * 100)
                          : 0;

                      return (
                        <Card key={item.id}>
                          <CardContent className="p-4 space-y-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-serif text-base font-medium">{item.title}</p>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  {item.sku_prefix}-{String(item.id).padStart(3, '0')} • {item.material}
                                </p>
                              </div>
                              {isLow ? (
                                <Badge variant="destructive">Niedrig</Badge>
                              ) : (
                                <Badge variant="bronze">{margin}% Marge</Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/60">
                              <div className="space-y-0.5">
                                <span className="font-mono text-sm font-semibold block">
                                  CHF {item.base_price.toLocaleString('de-CH')}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  EK: CHF {item.cost_price.toLocaleString('de-CH')}
                                </span>
                              </div>

                              {/* Touch-friendly Stock Stepper */}
                              <div className="inline-flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => handleStockAdjust(item, -1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span
                                  className={`font-mono text-sm font-semibold w-9 text-center ${
                                    isLow ? 'text-destructive' : 'text-foreground'
                                  }`}
                                >
                                  {item.stock}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => handleStockAdjust(item, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleOpenInstagramModal(item)}
                              >
                                <Camera className="h-3.5 w-3.5 text-bronze" />
                                IG Post
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => setEditingItem({ ...item })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Bearbeiten
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <Card className="hidden md:block">
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
                          {filteredInventory.map((item) => {
                            const isLow = item.stock <= item.low_stock_threshold;
                            const margin =
                              item.base_price > 0
                                ? Math.round(
                                    ((item.base_price - item.cost_price) / item.base_price) * 100
                                  )
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
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: `Alle (${invoicesOrderList.length})` },
                      {
                        id: 'sent',
                        label: `Versandt (${invoicesOrderList.filter((o) => o.invoice_sent).length})`,
                      },
                      {
                        id: 'pending',
                        label: `Ausstehend (${invoicesOrderList.filter((o) => !o.invoice_sent).length})`,
                      },
                    ].map((f) => (
                      <Button
                        key={f.id}
                        size="sm"
                        variant={invoiceFilter === f.id ? 'default' : 'outline'}
                        onClick={() => setInvoiceFilter(f.id as any)}
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>

                  {/* Mobile Invoice Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredInvoices.map((ord) => (
                      <Card key={ord.id}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-mono text-xs font-semibold text-bronze block">
                                {ord.invoice_number || `INV-2026-${String(ord.id).padStart(4, '0')}`}
                              </span>
                              <span className="font-medium text-sm block">{ord.customer_name}</span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {ord.customer_email}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-sm font-semibold block">
                                CHF {ord.total_amount?.toLocaleString('de-CH', { minimumFractionDigits: 2 })}
                              </span>
                              {ord.invoice_sent ? (
                                <Badge variant="success" className="mt-1">
                                  Versandt
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="mt-1">
                                  Bereit
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <Button variant="outline" size="sm" asChild className="w-full px-2">
                              <a
                                href={`/api/v1/admin/invoices/${ord.id}/html`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Beleg
                              </a>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full px-2"
                              onClick={() => openTrackingModal(ord)}
                            >
                              <Truck className="h-3.5 w-3.5 text-bronze" />
                              Track
                            </Button>
                            <Button
                              variant="bronze"
                              size="sm"
                              className="w-full px-2"
                              onClick={() => openDispatchModal(ord)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Mail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <Card className="hidden md:block">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rechnungs-Nr.</TableHead>
                            <TableHead>Bestellung</TableHead>
                            <TableHead>Empfänger</TableHead>
                            <TableHead className="text-right">Betrag</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs">
                          {filteredInvoices.map((ord) => (
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
                                CHF{' '}
                                {ord.total_amount?.toLocaleString('de-CH', {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-center">
                                {ord.invoice_sent ? (
                                  <Badge variant="success">Versandt</Badge>
                                ) : (
                                  <Badge variant="warning">Bereit</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openTrackingModal(ord)}
                                >
                                  <Truck className="h-3.5 w-3.5 text-bronze" />
                                  {ord.tracking_number ? 'Tracking' : '+ Tracking'}
                                </Button>
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Auto-Post
                          </span>
                          <Zap className="h-4 w-4 text-bronze" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-serif text-lg">Bei neuem Produkt</p>
                            <p className="text-xs text-muted-foreground">Sofortige Feed-Sync</p>
                          </div>
                          <Switch
                            checked={instagramSettings?.auto_post_enabled ?? true}
                            onCheckedChange={handleToggleAutoPost}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {instagramSettings?.account_username || '@pbstyle.ch'}
                          </span>
                          <Badge variant="success">Verbunden</Badge>
                        </div>
                        <div className="font-mono text-2xl font-semibold">
                          {instagramSettings?.followers_count?.toLocaleString('de-CH') || "24'800"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {instagramPosts.length} veröffentlichte Beiträge
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5 space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold block">
                          Standard Hashtags
                        </span>
                        <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {instagramSettings?.auto_hashtags ||
                            '#pbstyle #swissjewelry #950platin #hautejoaillerie'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <CardContent className="p-4 space-y-2.5 text-xs">
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
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Thumb-First Native App Feel) */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-border bg-card/95 backdrop-blur-md grid grid-cols-5 px-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-bronze' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-3 h-[2px] bg-bronze rounded-b-full" />
              )}
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.alert && (
                  <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Toast (above bottom bar on mobile) */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 rounded-md bg-card text-foreground border border-bronze/40 px-4 py-3 shadow-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-bronze shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* DIALOG 1: CRM PROFILE */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.full_name}</DialogTitle>
            <DialogDescription>Concierge CRM Profil &amp; VIP-Stufe verwalten</DialogDescription>
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
              <DialogFooter className="gap-2">
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
        <DialogContent className="w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{editingItem?.title}</DialogTitle>
            <DialogDescription>Lagerbestand, Preise und Warnschwelle anpassen</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleSaveInventoryItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Bestand</Label>
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
                  <Label>Kosten (CHF)</Label>
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
              <DialogFooter className="gap-2">
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
        <DialogContent className="w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Neues Objekt anlegen</DialogTitle>
            <DialogDescription>Erfasst ein neues Produkt im Katalog.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titel</Label>
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
                <Label>Preis</Label>
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
            <DialogFooter className="gap-2">
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Rechnung {dispatchModalOrder?.invoice_number || dispatchModalOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Offizielle Schweizer Rechnung per E-Mail versenden.
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
                <Label>Persönliche Nachricht</Label>
                <Textarea
                  rows={5}
                  value={dispatchMessage}
                  onChange={(e) => setDispatchMessage(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2">
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
        <DialogContent className="w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Auf Instagram teilen</DialogTitle>
            <DialogDescription>
              Veröffentlicht {instagramModalProduct?.title} auf @pbstyle.ch.
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
              <DialogFooter className="gap-2">
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

      {/* DIALOG 6: ADD TRACKING NUMBER & NOTIFY CLIENT */}
      <Dialog
        open={!!trackingModalOrder}
        onOpenChange={(open) => !open && setTrackingModalOrder(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sendungsverfolgung hinterlegen</DialogTitle>
            <DialogDescription>
              Bestellung {trackingModalOrder?.order_number} ({trackingModalOrder?.customer_email}) — sendet automatisch eine Tracking-E-Mail über info@pbstyle.ch.
            </DialogDescription>
          </DialogHeader>
          {trackingModalOrder && (
            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Versanddienstleister</Label>
                <Select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                >
                  <option value="Schweizer Post «Pro Clima»">Schweizer Post «Pro Clima»</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS Express">UPS Express</option>
                  <option value="FedEx Priority">FedEx Priority</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sendungsnummer (Tracking Number)</Label>
                <Input
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="z.B. 99.00.123456.78901234"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Persönliche Notiz (optional)</Label>
                <Textarea
                  rows={3}
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  placeholder="z.B. Diskrete Hochsicherheitsverpackung, Zustellung morgen vormittags."
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTrackingModalOrder(null)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" variant="bronze" disabled={isSavingTracking}>
                  <Truck className="h-4 w-4" />
                  {isSavingTracking ? 'Wird gesendet...' : 'Speichern & Tracking senden'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
