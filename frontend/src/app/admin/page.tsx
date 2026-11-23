'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ExternalLink,
  FolderPlus,
  Heart,
  ImagePlus,
  LayoutDashboard,
  Loader2,
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
  RotateCcw,
  Search,
  Send,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  Users,
  X,
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

  // Coupon Dispatch to Selected Clients
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponSelectedClientIds, setCouponSelectedClientIds] = useState<number[]>([]);
  const [couponCode, setCouponCode] = useState('PBSTYLE15');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(15);
  const [couponMessage, setCouponMessage] = useState('');
  const [isSendingCoupon, setIsSendingCoupon] = useState(false);

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
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // Categories & Subcategories
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

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

  // Return & Refund
  const [refundModalOrder, setRefundModalOrder] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReturnStatus, setRefundReturnStatus] = useState<string>('Erstattet');
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundRestock, setRefundRestock] = useState<boolean>(true);
  const [isRefunding, setIsRefunding] = useState<boolean>(false);

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

    Promise.all([
      loadOverview(),
      loadCustomers(),
      loadInventory(),
      loadCategories(),
      loadInstagramData(),
    ]).finally(() => setIsInitialLoading(false));
  }, []);

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadOverview(),
      loadCustomers(),
      loadInventory(),
      loadCategories(),
      loadInstagramData(),
    ]);
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

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/v1/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !data.some((c: any) => c.id === newProdCategory)) {
          setNewProdCategory(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeletingProduct(true);
    try {
      const res = await fetch(`/api/v1/admin/inventory/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setInventory((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        setDeletingProduct(null);
        showToast(data.message || 'Produkt gelöscht.');
        loadOverview();
        loadCategories();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Produkt konnte nicht gelöscht werden.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) return;
    setIsSavingCategory(true);
    try {
      const res = await fetch('/api/v1/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCatTitle.trim(),
          parent_id: newCatParentId ? Number(newCatParentId) : null,
          description: newCatDesc.trim() || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        setNewCatTitle('');
        setNewCatParentId('');
        setNewCatDesc('');
        showToast(
          created.parent_title
            ? `Unterkategorie "${created.title}" unter "${created.parent_title}" erstellt.`
            : `Kategorie "${created.title}" erstellt.`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Kategorie konnte nicht erstellt werden.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    try {
      const res = await fetch(`/api/v1/admin/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        showToast(data.message || 'Kategorie gelöscht.');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || 'Kategorie enthält noch Produkte.');
      }
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

  const handleUploadProductPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/v1/admin/uploads/product-image', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrls.push(data.url);
        } else {
          const err = await res.json().catch(() => ({}));
          showToast(err.detail || 'Foto-Upload fehlgeschlagen.');
        }
      }
      if (uploadedUrls.length > 0) {
        setNewProdImages((prev) => [...prev, ...uploadedUrls]);
        showToast(
          uploadedUrls.length === 1
            ? 'Produktfoto erfolgreich hochgeladen.'
            : `${uploadedUrls.length} Produktfotos erfolgreich hochgeladen.`
        );
      }
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Hochladen der Fotos.');
    } finally {
      setIsUploadingPhoto(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
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
          image_url: newProdImages[0] || null,
          image_urls: newProdImages,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setInventory([created, ...inventory]);
        setIsNewProductModalOpen(false);
        setNewProdTitle('');
        setNewProdHandle('');
        setNewProdDesc('');
        setNewProdImages([]);
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

  const openCouponModal = (preselectedClientIds?: number[]) => {
    setCouponSelectedClientIds(
      preselectedClientIds && preselectedClientIds.length > 0
        ? preselectedClientIds
        : customers.map((c) => c.id)
    );
    setCouponMessage('');
    setIsCouponModalOpen(true);
  };

  const toggleCouponClient = (id: number) => {
    setCouponSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSendCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponSelectedClientIds.length === 0) {
      showToast('Bitte mindestens einen Klienten auswählen.');
      return;
    }
    setIsSendingCoupon(true);
    try {
      const res = await fetch('/api/v1/admin/coupons/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_ids: couponSelectedClientIds,
          code: couponCode.trim().toUpperCase(),
          discount_percent: Number(couponDiscountPercent),
          custom_message: couponMessage.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || 'Gutschein erfolgreich versandt.');
        setIsCouponModalOpen(false);
      } else {
        showToast(data.detail || 'Gutschein konnte nicht versandt werden.');
      }
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Versenden des Gutscheins.');
    } finally {
      setIsSendingCoupon(false);
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

  const openRefundModal = (order: any) => {
    setRefundModalOrder(order);
    setRefundAmount(Number(order.total_amount || 0));
    setRefundReturnStatus('Erstattet');
    setRefundReason('');
    setRefundRestock(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder || refundAmount <= 0) return;
    setIsRefunding(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${refundModalOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refund_amount: Number(refundAmount),
          return_status: refundReturnStatus,
          reason: refundReason.trim() || null,
          restock_items: refundRestock,
          send_email: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(data.message || 'Rückgabe & Rückerstattung erfolgreich verarbeitet.');
        setRefundModalOrder(null);
        await Promise.all([loadOverview(), loadInventory()]);
      } else {
        showToast(data.detail || 'Rückerstattung fehlgeschlagen.');
      }
    } catch (e) {
      console.error(e);
      showToast('Fehler bei der Rückerstattung.');
    } finally {
      setIsRefunding(false);
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
            {activeTab === 'crm' && (
              <Button
                variant="bronze"
                size="sm"
                onClick={() => openCouponModal()}
                className="h-9"
              >
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Gutschein senden</span>
              </Button>
            )}
            {activeTab === 'inventory' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadCategories();
                    setIsCategoryModalOpen(true);
                  }}
                  className="h-9"
                >
                  <FolderPlus className="h-4 w-4 text-bronze" />
                  <span className="hidden sm:inline">Kategorien</span>
                </Button>
                <Button
                  variant="bronze"
                  size="sm"
                  onClick={() => {
                    loadCategories();
                    setIsNewProductModalOpen(true);
                  }}
                  className="h-9"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Neues Objekt</span>
                </Button>
              </>
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => openRefundModal(ord)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Refund
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    onClick={() => openRefundModal(ord)}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Refund
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

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="bronze"
                              size="sm"
                              className="w-full"
                              onClick={() => openCouponModal([c.id])}
                            >
                              <Tag className="h-3.5 w-3.5" />
                              Gutschein
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setSelectedCustomer({ ...c })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Profil
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
                              <TableCell className="text-right space-x-2">
                                <Button
                                  variant="bronze"
                                  size="sm"
                                  onClick={() => openCouponModal([c.id])}
                                >
                                  <Tag className="h-3.5 w-3.5" />
                                  Gutschein
                                </Button>
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

                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full px-2"
                                onClick={() => handleOpenInstagramModal(item)}
                              >
                                <Camera className="h-3.5 w-3.5 text-bronze" />
                                IG
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full px-2"
                                onClick={() => setEditingItem({ ...item })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full px-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                                onClick={() => setDeletingProduct(item)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Löschen
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
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                                      onClick={() => setDeletingProduct(item)}
                                      aria-label="Produkt löschen"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => openRefundModal(ord)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Refund
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                  onClick={() => openRefundModal(ord)}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Refund
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Kategorie / Unterkategorie</Label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[11px] text-bronze hover:underline font-medium"
                >
                  + Neu anlegen
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(categories.length > 0
                  ? categories
                  : [
                      { id: 1, title: 'Schmuck', parent_title: null },
                      { id: 2, title: 'Beauty-Tools', parent_title: null },
                      { id: 3, title: 'Neuheiten', parent_title: null },
                    ]
                ).map((cat) => {
                  const selected = newProdCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewProdCategory(cat.id)}
                      className={`min-h-[42px] px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all flex flex-col items-center justify-center text-center ${
                        selected
                          ? 'border-bronze bg-bronze/15 text-foreground shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-bronze/50 hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-1 max-w-full">
                        {selected && <CheckCircle2 className="h-3 w-3 text-bronze shrink-0" />}
                        <span className="truncate">{cat.title}</span>
                      </span>
                      {cat.parent_title && (
                        <span className="text-[9px] text-muted-foreground truncate max-w-full">
                          ↳ {cat.parent_title}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Material</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'platinum', label: '950 Platin' },
                  { value: 'brushed steel', label: 'Stahl 316L' },
                  { value: 'titanium', label: 'Titan Gr. 5' },
                ].map((mat) => {
                  const selected = newProdMaterial === mat.value;
                  return (
                    <button
                      key={mat.value}
                      type="button"
                      onClick={() => setNewProdMaterial(mat.value)}
                      className={`h-10 px-2.5 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        selected
                          ? 'border-bronze bg-bronze/15 text-foreground shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-bronze/50 hover:text-foreground'
                      }`}
                    >
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-bronze shrink-0" />}
                      <span className="truncate">{mat.label}</span>
                    </button>
                  );
                })}
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
            <div className="space-y-2.5">
              <Label>Produktfotos (Kamera oder Mediathek)</Label>

              {/* Hidden native mobile camera & photo gallery inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleUploadProductPhotos(e.target.files)}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUploadProductPhotos(e.target.files)}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingPhoto}
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-11 border-dashed border-bronze/50 hover:border-bronze"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin text-bronze" />
                  ) : (
                    <Camera className="h-4 w-4 text-bronze" />
                  )}
                  <span>Kamera</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingPhoto}
                  onClick={() => galleryInputRef.current?.click()}
                  className="h-11 border-dashed border-border hover:border-bronze"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin text-bronze" />
                  ) : (
                    <ImagePlus className="h-4 w-4 text-bronze" />
                  )}
                  <span>Foto hochladen</span>
                </Button>
              </div>

              {newProdImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {newProdImages.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="relative aspect-square rounded-md overflow-hidden border border-border bg-muted group"
                    >
                      <img
                        src={url}
                        alt={`Produktfoto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-background/90 text-foreground font-mono text-[9px] uppercase px-1.5 py-0.5 rounded">
                          Hauptbild
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setNewProdImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        aria-label="Foto entfernen"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

      {/* DIALOG 7: DELETE PRODUCT CONFIRMATION */}
      <Dialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Produkt löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie <strong>{deletingProduct?.title}</strong> wirklich dauerhaft aus dem Katalog entfernen? Bestehende Bestellungen und Rechnungen bleiben erhalten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              disabled={isDeletingProduct}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isDeletingProduct}
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingProduct ? 'Wird gelöscht...' : 'Endgültig löschen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 8: CATEGORIES & SUBCATEGORIES MANAGER */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kategorien &amp; Unterkategorien</DialogTitle>
            <DialogDescription>
              Erstellen Sie Hauptkategorien oder ordnen Sie eine Unterkategorie zu.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name der Kategorie / Unterkategorie</Label>
              <Input
                required
                value={newCatTitle}
                onChange={(e) => setNewCatTitle(e.target.value)}
                placeholder="z.B. Platinringe oder Pinzetten"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Übergeordnete Kategorie (optional für Unterkategorie)</Label>
              <Select
                value={newCatParentId}
                onChange={(e) => setNewCatParentId(e.target.value)}
              >
                <option value="">Keine — als Hauptkategorie anlegen</option>
                {categories
                  .filter((c) => !c.parent_id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Unterkategorie von: {c.title}
                    </option>
                  ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Kurzbeschreibung (optional)</Label>
              <Input
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Kurze Beschreibung für den Katalog..."
              />
            </div>

            <Button type="submit" variant="bronze" className="w-full" disabled={isSavingCategory}>
              <FolderPlus className="h-4 w-4" />
              {isSavingCategory
                ? 'Wird gespeichert...'
                : newCatParentId
                ? 'Unterkategorie erstellen'
                : 'Hauptkategorie erstellen'}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <Label>Vorhandene Kategorien ({categories.length})</Label>
            <div className="space-y-1.5 pt-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border bg-muted/30 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-foreground flex items-center gap-1.5">
                      {cat.parent_title && (
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {cat.parent_title} ↳
                        </span>
                      )}
                      <span className="truncate">{cat.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      /{cat.handle} • {cat.products_count} Produkte
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDeleteCategory(cat.id)}
                    aria-label="Kategorie löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 9: SEND COUPON CODE TO SELECTED CLIENTS */}
      <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gutschein an Klienten senden</DialogTitle>
            <DialogDescription>
              Wählen Sie die gewünschten Klienten aus — der Code wird automatisch aktiviert und über info@pbstyle.ch versandt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendCoupon} className="space-y-4">
            {/* Client Multi-Select List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Empfänger ({couponSelectedClientIds.length} / {customers.length})
                </Label>
                <div className="flex gap-3 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCouponSelectedClientIds(customers.map((c) => c.id))}
                    className="text-bronze hover:underline"
                  >
                    Alle
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponSelectedClientIds([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Keine
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border/60 bg-muted/20">
                {customers.map((c) => {
                  const checked = couponSelectedClientIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCouponClient(c.id)}
                      className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left text-xs transition-colors ${
                        checked ? 'bg-bronze/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{c.full_name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">
                          {c.email}
                        </div>
                      </div>
                      <span
                        className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${
                          checked
                            ? 'border-bronze bg-bronze text-bronze-foreground'
                            : 'border-input bg-background'
                        }`}
                      >
                        {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coupon Code & Discount % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Gutscheincode</Label>
                <Input
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="z.B. VIP15"
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rabatt (%)</Label>
                <div className="flex gap-1.5">
                  {[10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCouponDiscountPercent(pct)}
                      className={`flex-1 h-10 rounded-md border font-mono text-xs font-medium transition-colors ${
                        couponDiscountPercent === pct
                          ? 'border-bronze bg-bronze/15 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-bronze/50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Persönliche Nachricht (optional)</Label>
              <Textarea
                rows={3}
                value={couponMessage}
                onChange={(e) => setCouponMessage(e.target.value)}
                placeholder="z.B. Exklusiv für unsere VIP-Sammler zur neuen Edition 2026."
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCouponModalOpen(false)}
              >
                Abbrechen
              </Button>
                <Button
                type="submit"
                variant="bronze"
                disabled={isSendingCoupon || couponSelectedClientIds.length === 0}
              >
                <Send className="h-4 w-4" />
                {isSendingCoupon
                  ? 'Wird gesendet...'
                  : `Gutschein senden (${couponSelectedClientIds.length})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 10: ORDER RETURN & REFUND */}
      <Dialog
        open={!!refundModalOrder}
        onOpenChange={(open) => !open && setRefundModalOrder(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rückgabe &amp; Rückerstattung</DialogTitle>
            <DialogDescription>
              Bestellung {refundModalOrder?.order_number} ({refundModalOrder?.customer_name}) — erstattet bei Stripe-Zahlung direkt über die Stripe API und sendet eine Bestätigung via info@pbstyle.ch.
            </DialogDescription>
          </DialogHeader>
          {refundModalOrder && (
            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Erstattungsbetrag (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.50"
                    max={refundModalOrder.total_amount}
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Max: CHF {Number(refundModalOrder.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label>Rückgabestatus</Label>
                  <Select
                    value={refundReturnStatus}
                    onChange={(e) => setRefundReturnStatus(e.target.value)}
                  >
                    <option value="Erstattet">Erstattet (Vollständig)</option>
                    <option value="Teilerstattung">Teilerstattung</option>
                    <option value="Rückgabe erhalten">Rückgabe erhalten</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Grund / Notiz für den Klienten (optional)</Label>
                <Textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="z.B. Ringgröße passt nicht — Rücksendung erhalten und Betrag erstattet."
                />
              </div>

              <label className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30 cursor-pointer text-xs">
                <span>Artikel automatisch wieder ins Lager einbuchen</span>
                <Switch checked={refundRestock} onCheckedChange={setRefundRestock} />
              </label>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefundModalOrder(null)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" variant="destructive" disabled={isRefunding}>
                  <RotateCcw className="h-4 w-4" />
                  {isRefunding
                    ? 'Wird erstattet...'
                    : `CHF ${Number(refundAmount || 0).toFixed(2)} erstatten`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
