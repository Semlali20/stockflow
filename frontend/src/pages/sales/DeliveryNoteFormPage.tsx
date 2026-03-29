// src/pages/sales/DeliveryNoteFormPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Link, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { salesService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Customer, Warehouse, Location, Inventory, Quote, Item, Category } from '@/types';

interface DeliveryLine {
  itemId: string;
  itemName: string;
  itemSku: string;
  categoryId?: string;
  categoryName?: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  availableQty?: number;
  unitPrice: number;
  discount: number;       // percentage 0-100
  lineTotal: number;
  lotId?: string;
  serialId?: string;
  notes: string;
  isManualRow?: boolean;
}

const computeTotal = (qty: number, unitPrice: number, discount: number) =>
  parseFloat((qty * unitPrice * (1 - discount / 100)).toFixed(2));

export const DeliveryNoteFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── Form fields ─────────────────────────────────────────────────
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [quoteSearch, setQuoteSearch] = useState('');

  // ── Master data ──────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [linkedQuote, setLinkedQuote] = useState<Quote | null>(null);
  const [linkedWarehouseName, setLinkedWarehouseName] = useState('');
  const [linkedLocationName, setLinkedLocationName] = useState('');
  const [lines, setLines] = useState<DeliveryLine[]>([]);

  // ── Add-item panel state (manual mode) ──────────────────────────
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addItemId, setAddItemId] = useState('');
  const [fetchedAvailableQty, setFetchedAvailableQty] = useState<number | null>(null);
  const [loadingAvailableQty, setLoadingAvailableQty] = useState(false);

  // ── UI flags ─────────────────────────────────────────────────────
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isManualMode, setIsManualMode] = useState(true);
  const [useQuote, setUseQuote] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────
  // Only show items that have inventory in the selected location/warehouse
  const inventoryItemIds = new Set(inventoryItems.map(inv => inv.itemId));
  const availableItems = allItems.filter(item => inventoryItemIds.has(item.id));
  const filteredItems = addCategoryId
    ? availableItems.filter(item => item.categoryId === addCategoryId)
    : availableItems;

  // Fetch available qty whenever item or location selection changes
  useEffect(() => {
    if (!addItemId) { setFetchedAvailableQty(null); return; }
    // Use already-loaded inventoryItems if possible (avoids extra request)
    const invRecords = inventoryItems.filter(r => r.itemId === addItemId);
    if (invRecords.length > 0) {
      const total = invRecords.reduce((sum, r) =>
        sum + (r.quantityAvailable ?? r.quantityOnHand ?? 0), 0);
      setFetchedAvailableQty(total);
      return;
    }
    setLoadingAvailableQty(true);
    inventoryService.getInventoriesByItem(addItemId)
      .then((data: any) => {
        const records: any[] = Array.isArray(data) ? data : (data?.content || []);
        const scoped = locationId
          ? records.filter(r => r.locationId === locationId)
          : warehouseId
            ? records.filter(r => r.warehouseId === warehouseId)
            : records;
        const total = scoped.reduce((sum, r) =>
          sum + (r.quantityAvailable ?? r.quantityOnHand ?? 0), 0);
        setFetchedAvailableQty(total);
      })
      .catch(() => setFetchedAvailableQty(null))
      .finally(() => setLoadingAvailableQty(false));
  }, [addItemId, warehouseId, locationId]);

  // ── Initial loads ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingCustomers(true);
    salesService.getCustomers({ size: 1000 })
      .then((res: any) => {
        const data = res.data;
        setCustomers(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false));

    setLoadingWarehouses(true);
    locationService.getWarehouses({ size: 1000 })
      .then((data: any) => setWarehouses(Array.isArray(data) ? data : (data?.content || [])))
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false));

    productService.getCategories({ size: 1000 })
      .then((data: any) => setCategories(Array.isArray(data) ? data : (data?.content || [])))
      .catch(() => setCategories([]));

    productService.getItems({ size: 1000 })
      .then((data: any) => setAllItems(Array.isArray(data) ? data : (data?.content || [])))
      .catch(() => setAllItems([]));
  }, []);

  // Resolve linked-quote warehouse name reactively
  useEffect(() => {
    if (linkedQuote && inventoryItems.length > 0 && !linkedWarehouseName) {
      const wid = inventoryItems[0].warehouseId;
      if (wid) {
        const wh = warehouses.find(w => w.id === wid);
        if (wh) setLinkedWarehouseName(wh.name);
        else locationService.getWarehouseById(wid)
          .then(w => setLinkedWarehouseName(w?.name || ''))
          .catch(() => {});
      }
    }
  }, [inventoryItems]);

  // ── Helpers ──────────────────────────────────────────────────────
  const loadInventoryItems = useCallback(async (wid: string) => {
    if (!wid) { setInventoryItems([]); return; }
    setLoadingItems(true);
    try {
      const data = await inventoryService.getInventoriesByWarehouse(wid);
      setInventoryItems(Array.isArray(data) ? data : (data?.content || []));
    } catch {
      setInventoryItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const loadLocations = useCallback(async (wid: string) => {
    if (!wid) { setLocations([]); return; }
    setLoadingLocations(true);
    try {
      const data = await locationService.getLocationsByWarehouse(wid);
      setLocations(Array.isArray(data) ? data : (data?.content || []));
    } catch {
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const handleWarehouseChange = (wid: string) => {
    setWarehouseId(wid);
    setLocationId('');
    setLocations([]);
    setInventoryItems([]);
    setAddItemId('');
    setAddCategoryId('');
    loadInventoryItems(wid);
    loadLocations(wid);
  };

  const handleLocationChange = async (lid: string) => {
    setLocationId(lid);
    setAddItemId('');
    setAddCategoryId('');
    setFetchedAvailableQty(null);
    if (lid) {
      // Fetch inventory scoped to the selected location
      setLoadingItems(true);
      try {
        const data = await inventoryService.getInventoriesByLocation(lid);
        setInventoryItems(Array.isArray(data) ? data : (data?.content || []));
      } catch {
        setInventoryItems([]);
      } finally {
        setLoadingItems(false);
      }
    } else {
      // "All Locations" selected — reload full warehouse inventory
      loadInventoryItems(warehouseId);
    }
  };

  // ── Quote linking ────────────────────────────────────────────────
  const linkQuote = async () => {
    if (!quoteSearch.trim()) return;
    setLoadingQuote(true);
    try {
      // Search quotes by reference or ID
      const res = await salesService.getQuotes({ size: 200 });
      const data = (res as any).data;
      const all: Quote[] = Array.isArray(data) ? data : (data?.content || []);
      const found = all.find(q =>
        q.reference.toLowerCase().includes(quoteSearch.toLowerCase()) ||
        q.id === quoteSearch
      );
      if (!found) { toast.error(t('deliveryForm.quoteNotFound')); return; }
      if (found.status !== 'ACCEPTED') { toast.error(t('deliveryForm.quoteNotAccepted')); return; }

      // Fetch the full quote (with lines) by ID — the list endpoint doesn't include lines
      const fullRes = await salesService.getQuoteById(found.id);
      const full: Quote = (fullRes as any).data || fullRes;

      setLinkedQuote(full);
      setQuoteId(full.id);
      setCustomerId(full.customerId);
      setCustomerName(full.customerName);

      if (full.inventoryId) {
        setWarehouseId(full.inventoryId);
        loadInventoryItems(full.inventoryId);
        loadLocations(full.inventoryId);
        const local = warehouses.find(w => w.id === full.inventoryId);
        if (local) setLinkedWarehouseName(local.name);
        else locationService.getWarehouseById(full.inventoryId)
          .then(w => setLinkedWarehouseName(w?.name || ''))
          .catch(() => {});
      }

      if (full.locationId) {
        setLocationId(full.locationId);
        locationService.getLocationById(full.locationId)
          .then((loc: any) => setLinkedLocationName(loc?.name || loc?.code || full.locationId))
          .catch(() => setLinkedLocationName(full.locationId));
      }

      const quoteLines = full.lines || [];
      setLines(quoteLines.map(l => ({
        itemId: l.itemId,
        itemName: l.itemName,
        itemSku: l.itemSku || '',
        orderedQuantity: l.quantity,
        deliveredQuantity: l.quantity,
        unitPrice: l.unitPrice || 0,
        discount: l.discountPercent || 0,
        lineTotal: computeTotal(l.quantity, l.unitPrice || 0, l.discountPercent || 0),
        notes: '',
        isManualRow: false,
      })));
      setIsManualMode(false);
      toast.success(t('deliveryForm.quoteLinkSuccess'));
    } catch {
      toast.error(t('deliveryForm.quoteLinkError'));
    } finally {
      setLoadingQuote(false);
    }
  };

  const unlinkQuote = () => {
    setLinkedQuote(null);
    setQuoteId('');
    setQuoteSearch('');
    setWarehouseId('');
    setLocationId('');
    setLocations([]);
    setInventoryItems([]);
    setLinkedWarehouseName('');
    setLinkedLocationName('');
    setLines([]);
    setIsManualMode(true);
  };

  const handleToggleQuote = (enabled: boolean) => {
    setUseQuote(enabled);
    if (!enabled) unlinkQuote();
  };

  // ── Add item row ─────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!addItemId) { toast.error('Please select an item'); return; }
    const already = lines.find(l => l.itemId === addItemId);
    if (already) { toast.error(t('quoteForm.itemAlreadyAdded')); return; }

    const item = allItems.find(i => i.id === addItemId);
    if (!item) return;

    const inv = inventoryItems.find(i => i.itemId === addItemId);
    const catName = item.categoryName
      || categories.find(c => c.id === item.categoryId)?.name
      || '';
    const unitPrice = inv?.unitCost || 0;

    setLines(prev => [...prev, {
      itemId: addItemId,
      itemName: item.name,
      itemSku: item.sku || '',
      categoryId: item.categoryId,
      categoryName: catName,
      orderedQuantity: 1,
      deliveredQuantity: 1,
      availableQty: fetchedAvailableQty ?? inv?.quantityAvailable,
      unitPrice,
      discount: 0,
      lineTotal: computeTotal(1, unitPrice, 0),
      notes: '',
      isManualRow: false,
    }]);

    // Reset add-item panel
    setAddItemId('');
    setAddCategoryId('');
    setFetchedAvailableQty(null);
  };

  const updateLine = (idx: number, field: keyof DeliveryLine, value: any) =>
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (field === 'deliveredQuantity') {
        const max = l.availableQty ?? l.orderedQuantity;
        updated.deliveredQuantity = Math.min(Math.max(0, Number(value)), max || Number(value));
      }
      if (field === 'orderedQuantity') {
        updated.orderedQuantity = Math.max(1, Number(value));
        // also clamp deliveredQty if it exceeds the new orderedQty
        if (updated.deliveredQuantity > updated.orderedQuantity) {
          updated.deliveredQuantity = updated.orderedQuantity;
        }
      }
      if (['deliveredQuantity', 'orderedQuantity', 'unitPrice', 'discount'].includes(field as string)) {
        updated.lineTotal = computeTotal(updated.deliveredQuantity, updated.unitPrice, updated.discount);
      }
      return updated;
    }));

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  // ── Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!customerId) { toast.error(t('quoteForm.selectCustomer')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    setSaving(true);
    try {
      await salesService.createDeliveryNote({
        customerId,
        customerName,
        quoteId: quoteId || undefined,
        inventoryId: warehouseId || undefined,
        locationId: locationId || undefined,
        deliveryDate: deliveryDate || undefined,
        deliveryAddress,
        notes,
        lines: lines.map(l => ({
          itemId: l.itemId || undefined,
          itemName: l.itemName,
          itemSku: l.itemSku,
          orderedQuantity: l.orderedQuantity,
          deliveredQuantity: l.deliveredQuantity,
          lotId: l.lotId,
          serialId: l.serialId,
          notes: l.notes,
        })),
      });

      toast.success(t('sales.deliveryNotes.created'));
      navigate('/sales/delivery-notes');
    } catch {
      toast.error(t('sales.deliveryNotes.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  // ── Summary computations ─────────────────────────────────────────
  const grossSubtotal = lines.reduce((s, l) => s + (l.deliveredQuantity * l.unitPrice), 0);
  const lineDiscountAmount = lines.reduce((s, l) => s + (l.deliveredQuantity * l.unitPrice * l.discount / 100), 0);
  const dnTotal = grossSubtotal - lineDiscountAmount;

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales/delivery-notes')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('deliveryForm.title')}</h1>
            <p className="text-gray-500 text-sm">{t('deliveryForm.subtitle')}</p>
          </div>
        </div>
        <Button icon={<Save size={16} />} onClick={handleSave} loading={saving} disabled={saving}>
          {t('deliveryForm.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left (main content) ── */}
        <div className="lg:col-span-2 space-y-6">
        {/* ── Quote toggle ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link size={18} className="text-gray-500" />
              <div>
                <h2 className="text-base font-semibold text-gray-800">{t('deliveryForm.linkQuote')}</h2>
                <p className="text-xs text-gray-400">{t('deliveryForm.linkHint')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleQuote(!useQuote)}
              className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${useQuote ? 'bg-blue-600' : 'bg-gray-200'}`}
              style={{ width: '52px', height: '28px' }}
              aria-label={t('deliveryForm.linkQuote')}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${useQuote ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {useQuote && (
            <div className="mt-4">
              {linkedQuote ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div>
                    <span className="font-medium text-green-800">{linkedQuote.reference}</span>
                    <span className="text-sm text-green-600 ml-2">— {linkedQuote.customerName}</span>
                    <span className="ml-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {t('deliveryForm.autoLoadedItems', { count: lines.length })}
                    </span>
                  </div>
                  <button onClick={unlinkQuote} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    {t('deliveryForm.unlinkQuote')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={t('deliveryForm.searchQuotePlaceholder')}
                    value={quoteSearch}
                    onChange={e => setQuoteSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && linkQuote()}
                    className="flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={linkQuote}
                    disabled={loadingQuote}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingQuote ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    {t('deliveryForm.linkButton')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Basic Info ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('quoteForm.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 1 — Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.customer')} *
              </label>
              {linkedQuote ? (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                  <span>{customerName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{t('deliveryForm.lockedByQuote')}</span>
                </div>
              ) : (
                <Select
                  value={customerId}
                  onChange={e => {
                    const c = customers.find(c => c.id === e.target.value);
                    setCustomerId(e.target.value);
                    setCustomerName(c?.name || '');
                  }}
                  className="w-full"
                  disabled={loadingCustomers}
                >
                  <option value="">{t('sales.quotes.selectCustomer')}</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              )}
            </div>

            {/* 2 — Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quoteForm.warehouse')}
              </label>
              {linkedQuote ? (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                  <span>{linkedWarehouseName || '—'}</span>
                  <span className="text-xs text-amber-500 ml-auto">{t('deliveryForm.lockedByQuote')}</span>
                </div>
              ) : (
                <Select
                  value={warehouseId}
                  onChange={e => handleWarehouseChange(e.target.value)}
                  className="w-full"
                  disabled={loadingWarehouses}
                >
                  <option value="">{t('quoteForm.selectWarehouse')}</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              )}
            </div>

            {/* 3 — Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              {linkedQuote ? (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                  <span>{linkedLocationName || '—'}</span>
                  <span className="text-xs text-amber-500 ml-auto">{t('deliveryForm.lockedByQuote')}</span>
                </div>
              ) : (
                <Select
                  value={locationId}
                  onChange={e => handleLocationChange(e.target.value)}
                  className="w-full"
                  disabled={!warehouseId || loadingLocations}
                >
                  <option value="">{warehouseId ? (loadingLocations ? 'Loading…' : 'All Locations') : 'Select warehouse first'}</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} {l.code ? `(${l.code})` : ''}</option>)}
                </Select>
              )}
            </div>

            {/* 4 — Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.deliveryDate')}
              </label>
              <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>

            {/* 7 — Delivery Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.deliveryAddress')}
              </label>
              <Input
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder={t('deliveryForm.addressPlaceholder')}
              />
            </div>

            {/* 8 — Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.notes')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

          {/* ── Available Inventory Items (compact table, manual mode only) ── */}
          {isManualMode && warehouseId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package size={18} />
                Available Inventory Items
              </h2>
              {loadingItems ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {(() => {
                        const alreadyAdded = addItemId ? lines.some(l => l.itemId === addItemId) : false;
                        return (
                          <tr className="bg-blue-50">
                            <td className="px-3 py-2 w-40">
                              <Select
                                value={addCategoryId}
                                onChange={e => { setAddCategoryId(e.target.value); setAddItemId(''); setFetchedAvailableQty(null); }}
                                className="w-full text-sm"
                              >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </Select>
                            </td>
                            <td className="px-3 py-2">
                              <Select
                                value={addItemId}
                                onChange={e => setAddItemId(e.target.value)}
                                className="w-full text-sm"
                                disabled={filteredItems.length === 0}
                              >
                                <option value="">Select Item</option>
                                {filteredItems.map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}{item.sku ? ` — ${item.sku}` : ''}
                                  </option>
                                ))}
                              </Select>
                            </td>
                            <td className="px-3 py-2 w-28">
                              {loadingAvailableQty ? (
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                              ) : fetchedAvailableQty !== null ? (
                                <span className={`font-medium ${fetchedAvailableQty <= 0 ? 'text-red-600' : 'text-green-700'}`}>
                                  {fetchedAvailableQty}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {alreadyAdded ? (
                                <span className="text-xs text-green-600 font-medium">Added</span>
                              ) : (
                                <button
                                  onClick={handleAddItem}
                                  disabled={!addItemId}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Plus size={12} /> Add
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Delivery Lines ── */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('deliveryForm.deliveryLines')}</h2>
            {lines.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">
                {isManualMode && !warehouseId
                  ? t('deliveryForm.hintManualOrInventory')
                  : t('quoteForm.noLines')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('deliveryForm.deliveredQty')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.unitPrice')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.quotes.discountPct')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('sales.quotes.lineTotal')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.notes')}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <div className="font-medium">{line.itemName}</div>
                          <div className="text-xs text-gray-400">{line.itemSku}</div>
                          {line.availableQty !== undefined && (
                            <div className="text-xs text-gray-400">Avail: {line.availableQty}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 w-24">
                          <Input
                            type="number"
                            min="0"
                            max={line.availableQty ?? line.orderedQuantity}
                            value={line.deliveredQuantity}
                            onChange={e => updateLine(idx, 'deliveredQuantity', Number(e.target.value))}
                            className="w-20 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 w-28">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))}
                            className="w-24 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={line.discount}
                            onChange={e => updateLine(idx, 'discount', Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-20 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-right">{line.lineTotal.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <Input
                            value={line.notes}
                            onChange={e => updateLine(idx, 'notes', e.target.value)}
                            className="text-sm"
                            placeholder={t('deliveryForm.lineNotesPlaceholder')}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>{/* end lg:col-span-2 */}

        {/* ── Right (summary panel) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Note Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sales.quotes.subtotal')}</span>
                <span className="font-medium">{grossSubtotal.toFixed(2)}</span>
              </div>
              {lineDiscountAmount > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>Line Discounts</span>
                  <span>-{lineDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>{t('sales.quotes.total')}</span>
                <span className="text-blue-600">{dnTotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 text-xs text-gray-400">
                <p>{t('quoteForm.linesCount', { count: lines.length })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>{/* end grid */}
    </div>
  );
};

export default DeliveryNoteFormPage;
