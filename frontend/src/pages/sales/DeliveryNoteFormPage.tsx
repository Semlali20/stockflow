// src/pages/sales/DeliveryNoteFormPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Link, PackagePlus } from 'lucide-react';
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
  const [lines, setLines] = useState<DeliveryLine[]>([]);

  // ── Add-item panel state (manual mode) ──────────────────────────
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addItemId, setAddItemId] = useState('');
  const [addQty, setAddQty] = useState<number>(1);
  const [addUnitPrice, setAddUnitPrice] = useState<number>(0);
  const [addDiscount, setAddDiscount] = useState<number>(0);
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
  const filteredItems = addCategoryId
    ? allItems.filter(item => item.categoryId === addCategoryId)
    : allItems;

  // Fetch available qty whenever item selection changes
  useEffect(() => {
    if (!addItemId) { setFetchedAvailableQty(null); return; }
    setLoadingAvailableQty(true);
    inventoryService.getInventoriesByItem(addItemId)
      .then((data: any) => {
        const records: any[] = Array.isArray(data) ? data : (data?.content || []);
        // Filter by selected warehouse if one is chosen
        const scoped = warehouseId
          ? records.filter(r => r.warehouseId === warehouseId)
          : records;
        const total = scoped.reduce((sum, r) =>
          sum + (r.quantityAvailable ?? r.quantityOnHand ?? 0), 0);
        setFetchedAvailableQty(total);
      })
      .catch(() => setFetchedAvailableQty(null))
      .finally(() => setLoadingAvailableQty(false));
  }, [addItemId, warehouseId]);

  const addLineTotal = computeTotal(addQty, addUnitPrice, addDiscount);

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

  // ── Quote linking ────────────────────────────────────────────────
  const linkQuote = async () => {
    if (!quoteSearch.trim()) return;
    setLoadingQuote(true);
    try {
      const res = await salesService.getQuotes({ size: 200 });
      const data = (res as any).data;
      const all: Quote[] = Array.isArray(data) ? data : (data?.content || []);
      const found = all.find(q =>
        q.reference.toLowerCase().includes(quoteSearch.toLowerCase()) ||
        q.id === quoteSearch
      );
      if (!found) { toast.error(t('deliveryForm.quoteNotFound')); return; }
      if (found.status !== 'ACCEPTED') { toast.error(t('deliveryForm.quoteNotAccepted')); return; }

      setLinkedQuote(found);
      setQuoteId(found.id);
      setCustomerId(found.customerId);
      setCustomerName(found.customerName);

      if (found.inventoryId) {
        setWarehouseId(found.inventoryId);
        loadInventoryItems(found.inventoryId);
        loadLocations(found.inventoryId);
        const local = warehouses.find(w => w.id === found.inventoryId);
        if (local) setLinkedWarehouseName(local.name);
      }

      setLines(found.lines.map(l => ({
        itemId: l.itemId,
        itemName: l.itemName,
        itemSku: l.itemSku || '',
        orderedQuantity: l.quantity,
        deliveredQuantity: l.quantity,
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

    setLines(prev => [...prev, {
      itemId: addItemId,
      itemName: item.name,
      itemSku: item.sku || '',
      categoryId: item.categoryId,
      categoryName: catName,
      orderedQuantity: addQty,
      deliveredQuantity: addQty,
      availableQty: fetchedAvailableQty ?? inv?.quantityAvailable,
      unitPrice: addUnitPrice,
      discount: addDiscount,
      lineTotal: computeTotal(addQty, addUnitPrice, addDiscount),
      notes: '',
      isManualRow: false,
    }]);

    // Reset add-item panel
    setAddItemId('');
    setAddCategoryId('');
    setAddQty(1);
    setAddUnitPrice(0);
    setAddDiscount(0);
    setFetchedAvailableQty(null);
  };

  const updateLine = (idx: number, field: keyof DeliveryLine, value: any) =>
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (['deliveredQuantity', 'unitPrice', 'discount'].includes(field as string)) {
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
          itemId: l.isManualRow ? undefined : l.itemId,
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

      <div className="space-y-6">
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
                  <Button variant="outline" onClick={linkQuote} loading={loadingQuote}>
                    {t('deliveryForm.linkButton')}
                  </Button>
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
              <Select
                value={locationId}
                onChange={e => setLocationId(e.target.value)}
                className="w-full"
                disabled={!warehouseId || loadingLocations}
              >
                <option value="">{warehouseId ? (loadingLocations ? 'Loading…' : 'Select location') : 'Select warehouse first'}</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} {l.code ? `(${l.code})` : ''}</option>)}
              </Select>
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

        {/* ── Add Item panel (manual mode + warehouse selected) ─── */}
        {isManualMode && warehouseId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <PackagePlus size={17} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Add Item</h2>
            </div>

            <div className="p-6">
              {loadingItems ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Row 1 — Item selection */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Category */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Category
                      </label>
                      <Select
                        value={addCategoryId}
                        onChange={e => { setAddCategoryId(e.target.value); setAddItemId(''); setFetchedAvailableQty(null); }}
                        className="w-full"
                      >
                        <option value="">All categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </Select>
                    </div>

                    {/* Item */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Item
                      </label>
                      <Select
                        value={addItemId}
                        onChange={e => setAddItemId(e.target.value)}
                        className="w-full"
                        disabled={filteredItems.length === 0}
                      >
                        <option value="">Select an item…</option>
                        {filteredItems.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}{item.sku ? ` — ${item.sku}` : ''}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Available Qty — live badge */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Stock Available
                      </label>
                      <div className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 border text-sm font-bold ${
                        !addItemId || loadingAvailableQty
                          ? 'bg-gray-50 border-gray-200 text-gray-400'
                          : fetchedAvailableQty === null
                            ? 'bg-gray-50 border-gray-200 text-gray-400'
                            : fetchedAvailableQty <= 0
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        {!addItemId ? (
                          <span className="text-gray-300">—</span>
                        ) : loadingAvailableQty ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                        ) : fetchedAvailableQty === null ? (
                          '—'
                        ) : fetchedAvailableQty <= 0 ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                            Out of stock
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                            {fetchedAvailableQty} units
                          </>
                        )}
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={addQty}
                        onChange={e => setAddQty(Math.max(1, Number(e.target.value)))}
                        className="w-full"
                        disabled={!addItemId}
                      />
                    </div>
                  </div>

                  {/* Row 2 — Pricing + action */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-1 border-t border-gray-100">
                    {/* Unit Price */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Unit Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={addUnitPrice}
                          onChange={e => setAddUnitPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-7"
                          disabled={!addItemId}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Discount
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={addDiscount}
                          onChange={e => setAddDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full pr-7"
                          disabled={!addItemId}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Line Total
                      </label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-md">
                        <span className="text-gray-400 text-sm mr-1">$</span>
                        <span className="font-bold text-gray-800 text-sm">{addLineTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="md:col-span-1" />

                    {/* Add button */}
                    <div className="md:col-span-3 flex justify-end">
                      <Button
                        icon={<Plus size={15} />}
                        onClick={handleAddItem}
                        disabled={!addItemId}
                        className="w-full md:w-auto"
                      >
                        Add to Lines
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Delivery Lines ──────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('deliveryForm.deliveryLines')}</h2>

          {lines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-1">{t('quoteForm.noLines')}</p>
              {isManualMode && (
                <p className="text-xs text-gray-400">
                  {warehouseId
                    ? 'Select a category and item above, then click Add'
                    : t('deliveryForm.hintManualOrInventory')}
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avail.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('deliveryForm.orderedQty')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('deliveryForm.deliveredQty')}</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disc. %</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('common.notes')}</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      {/* Category */}
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {line.categoryName || '—'}
                      </td>

                      {/* Item */}
                      <td className="px-3 py-2">
                        <div className="font-medium">{line.itemName}</div>
                        <div className="text-xs text-gray-400">{line.itemSku}</div>
                      </td>

                      {/* Available qty */}
                      <td className="px-3 py-2">
                        {line.availableQty !== undefined ? (
                          <span className={`text-xs font-semibold ${line.availableQty <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {line.availableQty}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Ordered qty */}
                      <td className="px-3 py-2 w-24">
                        <Input
                          type="number"
                          min="1"
                          value={line.orderedQuantity}
                          onChange={e => updateLine(idx, 'orderedQuantity', Number(e.target.value))}
                          className="w-20 text-sm"
                          disabled={!!linkedQuote}
                        />
                      </td>

                      {/* Delivered qty */}
                      <td className="px-3 py-2 w-24">
                        <Input
                          type="number"
                          min="0"
                          max={line.orderedQuantity}
                          value={line.deliveredQuantity}
                          onChange={e => updateLine(idx, 'deliveredQuantity', Number(e.target.value))}
                          className="w-20 text-sm"
                        />
                      </td>

                      {/* Unit Price */}
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

                      {/* Discount % */}
                      <td className="px-3 py-2 w-24">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discount}
                          onChange={e => updateLine(idx, 'discount', Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-20 text-sm"
                        />
                      </td>

                      {/* Line Total */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{line.lineTotal.toFixed(2)}</span>
                      </td>

                      {/* Notes */}
                      <td className="px-3 py-2">
                        <Input
                          value={line.notes}
                          onChange={e => updateLine(idx, 'notes', e.target.value)}
                          className="text-sm"
                          placeholder={t('deliveryForm.lineNotesPlaceholder')}
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-2">
                        {isManualMode && (
                          <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {lines.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={7} className="px-3 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Grand Total
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="text-base font-bold text-gray-900">
                          ${lines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2)}
                        </span>
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteFormPage;
