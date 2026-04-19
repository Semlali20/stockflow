// src/pages/sales/DeliveryNoteFormPage.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Package, Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { salesService } from '@/services/sales.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Customer, Warehouse, Location, Inventory, Item, Category } from '@/types';

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
  // ── Master data ──────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [lines, setLines] = useState<DeliveryLine[]>([]);

  // ── Add-item panel state (manual mode) ──────────────────────────
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addItemId, setAddItemId] = useState('');
  const [fetchedAvailableQty, setFetchedAvailableQty] = useState<number | null>(null);
  const [loadingAvailableQty, setLoadingAvailableQty] = useState(false);

  // ── Searchable dropdown state ────────────────────────────────────
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const warehouseDropdownRef = useRef<HTMLDivElement>(null);

  const [locationSearch, setLocationSearch] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // ── UI flags ─────────────────────────────────────────────────────
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isManualMode] = useState(true);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) setCustomerDropdownOpen(false);
      if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(e.target as Node)) setWarehouseDropdownOpen(false);
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) setLocationDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {/* ── Basic Info ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{t('quoteForm.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 1 — Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('sales.deliveryNotes.customer')} *
              </label>
              <div ref={customerDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { if (!loadingCustomers) { setCustomerDropdownOpen(o => !o); setCustomerSearch(''); } }}
                  disabled={loadingCustomers}
                  className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingCustomers ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={customerId ? '' : 'text-gray-400'}>
                    {loadingCustomers ? 'Loading...' : customerId ? (customers.find(c => c.id === customerId)?.name ?? t('sales.quotes.selectCustomer')) : t('sales.quotes.selectCustomer')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${customerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {customerDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input autoFocus type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                          placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                      {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                        <li key={c.id} onClick={() => { setCustomerId(c.id); setCustomerName(c.name); setCustomerDropdownOpen(false); }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${customerId === c.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                          {c.name}
                        </li>
                      ))}
                      {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 2 — Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quoteForm.warehouse')}
              </label>
              <div ref={warehouseDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { if (!loadingWarehouses) { setWarehouseDropdownOpen(o => !o); setWarehouseSearch(''); } }}
                  disabled={loadingWarehouses}
                  className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingWarehouses ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={warehouseId ? '' : 'text-gray-400'}>
                    {loadingWarehouses ? 'Loading...' : warehouseId ? (warehouses.find(w => w.id === warehouseId)?.name ?? t('quoteForm.selectWarehouse')) : t('quoteForm.selectWarehouse')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${warehouseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {warehouseDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input autoFocus type="text" value={warehouseSearch} onChange={e => setWarehouseSearch(e.target.value)}
                          placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                      {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase())).map(w => (
                        <li key={w.id} onClick={() => { handleWarehouseChange(w.id); setWarehouseDropdownOpen(false); }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${warehouseId === w.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                          {w.name}
                        </li>
                      ))}
                      {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3 — Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div ref={locationDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => { if (warehouseId && !loadingLocations) { setLocationDropdownOpen(o => !o); setLocationSearch(''); } }}
                  disabled={!warehouseId || loadingLocations}
                  className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${(!warehouseId || loadingLocations) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={locationId ? '' : 'text-gray-400'}>
                    {loadingLocations ? 'Loading...' : !warehouseId ? 'Select Location' : locationId
                      ? (() => { const loc = locations.find(l => l.id === locationId); return loc ? `${loc.name}${loc.code ? ` (${loc.code})` : ''}` : t('common.allLocations'); })()
                      : t('common.allLocations')}
                  </span>
                  <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input autoFocus type="text" value={locationSearch} onChange={e => setLocationSearch(e.target.value)}
                          placeholder="Search..." className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                      <li onClick={() => { handleLocationChange(''); setLocationDropdownOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${!locationId ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                        {t('common.allLocations')}
                      </li>
                      {locations
                        .filter(l => `${l.name} ${l.code || ''}`.toLowerCase().includes(locationSearch.toLowerCase()))
                        .map(l => (
                          <li key={l.id} onClick={() => { handleLocationChange(l.id); setLocationDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${locationId === l.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                            {l.name}{l.code ? ` (${l.code})` : ''}
                          </li>
                        ))}
                      {locations.filter(l => `${l.name} ${l.code || ''}`.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && locationSearch && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
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
            <h2 className="text-lg font-semibold mb-4">{t('sales.deliveryNotes.summary')}</h2>
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
