// src/pages/purchase/PurchaseOrderFormPage.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, AlertTriangle, Search, ChevronDown, XCircle, BarChart2, TrendingUp, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { purchaseService } from '@/services/purchase.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ItemSearchCombobox } from '@/components/ui/ItemSearchCombobox';
import type { Supplier, Warehouse, Inventory, Location, Item, Category } from '@/types';

interface POLine {
  categoryId: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  orderedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
  currentStock?: number;
}

export const PurchaseOrderFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form fields
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [inventoryId, setInventoryId] = useState('');

  // Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);
  const [locationInventory, setLocationInventory] = useState<Inventory[]>([]);
  const [lines, setLines] = useState<POLine[]>([]);

  // Searchable dropdown state
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const warehouseDropdownRef = useRef<HTMLDivElement>(null);

  const [locationSearch, setLocationSearch] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // UI state
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingLocationInventory, setLoadingLocationInventory] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [itemNamesMap, setItemNamesMap] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [capacityWarningOpen, setCapacityWarningOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target as Node)) setSupplierDropdownOpen(false);
      if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(e.target as Node)) setWarehouseDropdownOpen(false);
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) setLocationDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLoadingSuppliers(true);
    purchaseService.getSuppliers({ size: 1000 })
      .then((res: any) => {
        const data = res.data;
        setSuppliers(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setSuppliers([]))
      .finally(() => setLoadingSuppliers(false));

    setLoadingWarehouses(true);
    locationService.getWarehouses({ size: 1000 })
      .then((data: any) => {
        setWarehouses(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false));

    setLoadingLocations(true);
    locationService.getLocations({ size: 1000 })
      .then((data: any) => {
        setLocations(Array.isArray(data) ? data : (data?.content || []));
      })
      .catch(() => setLocations([]))
      .finally(() => setLoadingLocations(false));

    productService.getCategories({ size: 1000 })
      .then((data: any) => setCategories(Array.isArray(data) ? data : (data?.content || [])))
      .catch(() => setCategories([]));

    productService.getItems({ size: 1000 })
      .then((data: any) => setAllItems(Array.isArray(data) ? data : (data?.content || [])))
      .catch(() => setAllItems([]));
  }, []);

  const loadLowStock = useCallback(async (threshold: number) => {
    setLoadingLowStock(true);
    try {
      const [data, itemsData] = await Promise.all([
        inventoryService.getLowStockItems(threshold),
        productService.getItems({ size: 1000 }).catch(() => ({ content: [] })),
      ]);
      const items: any[] = Array.isArray(itemsData) ? itemsData : ((itemsData as any)?.content || []);
      const map = new Map<string, string>();
      items.forEach((item: any) => { if (item?.id) map.set(item.id, item.name || item.sku || item.id); });
      setItemNamesMap(map);
      setLowStockItems(Array.isArray(data) ? data : (data?.content || []));
    } catch {
      setLowStockItems([]);
    } finally {
      setLoadingLowStock(false);
    }
  }, []);

  useEffect(() => {
    loadLowStock(lowStockThreshold);
  }, [loadLowStock, lowStockThreshold]);

  const handleLocationChange = async (locationId: string) => {
    setSelectedLocationId(locationId);
    if (!locationId) { setLocationInventory([]); return; }
    setLoadingLocationInventory(true);
    try {
      const data = await inventoryService.getInventoriesByLocation(locationId);
      setLocationInventory(Array.isArray(data) ? data : (data?.content || []));
    } catch {
      setLocationInventory([]);
    } finally {
      setLoadingLocationInventory(false);
    }
  };

  const addFromLowStock = (inv: Inventory) => {
    const already = lines.find(l => l.itemId === inv.itemId);
    if (already) { toast.error(t('quoteForm.itemAlreadyAdded')); return; }
    const availableQty = inv.quantityAvailable ?? (inv as any).quantityOnHand ?? 0;
    const suggestedQty = Math.max(1, lowStockThreshold - availableQty + 5);
    setLines(prev => [...prev, {
      categoryId: (inv as any).categoryId || '',
      itemId: inv.itemId,
      itemName: itemNamesMap.get(inv.itemId) || (inv as any).itemName || inv.item?.name || inv.itemId,
      itemSku: (inv as any).itemSku || inv.item?.sku || '',
      orderedQuantity: suggestedQty,
      unitPrice: inv.unitCost || 0,
      totalPrice: suggestedQty * (inv.unitCost || 0),
      notes: '',
      currentStock: inv.quantityAvailable,
    }]);
  };

  const addEmptyLine = () => {
    setLines(prev => [...prev, {
      categoryId: '',
      itemId: '',
      itemName: '',
      itemSku: '',
      orderedQuantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      notes: '',
    }]);
  };

  const updateLine = (idx: number, field: keyof POLine, value: any) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      const rawQty = field === 'orderedQuantity' ? Number(value) : Number(updated.orderedQuantity);
      const rawPrice = field === 'unitPrice' ? Number(value) : Number(updated.unitPrice);
      const qty = Number.isNaN(rawQty) ? 0 : rawQty;
      const price = Number.isNaN(rawPrice) ? 0 : rawPrice;
      updated.totalPrice = qty * price;
      return updated;
    }));
  };

  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx));

  const totalAmount = lines.reduce((s, l) => s + l.totalPrice, 0);

  // ── Capacity tracking ────────────────────────────────────────────
  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const parseCapacity = (cap: any): number | null => {
    if (cap === null || cap === undefined || cap === '') return null;
    if (typeof cap === 'number') return cap;
    const match = String(cap).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };
  const locationCapacity = selectedLocation ? parseCapacity((selectedLocation as any).capacity) : null;
  const currentLocationQty = locationInventory.reduce(
    (sum, inv) => sum + (inv.quantityAvailable ?? (inv as any).quantityOnHand ?? 0), 0
  );
  const totalOrderedQty = lines.reduce((sum, l) => sum + (l.orderedQuantity || 0), 0);
  const projectedQty = currentLocationQty + totalOrderedQty;
  const capacityExceeded = locationCapacity !== null && projectedQty > locationCapacity;
  const capacityPct = locationCapacity ? Math.min(100, (projectedQty / locationCapacity) * 100) : 0;

  const handleSave = async (force = false) => {
    if (!supplierId) { toast.error(t('purchaseForm.selectSupplier')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    if (lines.some(l => !l.itemId || !l.itemName)) {
      toast.error(t('purchaseForm.fillAllItems'));
      return;
    }
    if (!force && selectedLocationId && locationCapacity !== null && capacityExceeded) {
      setCapacityWarningOpen(true);
      return;
    }
    setSaving(true);
    try {
      await purchaseService.createPurchaseOrder({
        supplierId,
        supplierName,
        inventoryId,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes,
        lines: lines.map(l => ({
          itemId: l.itemId,
          itemName: l.itemName,
          itemSku: l.itemSku,
          orderedQuantity: l.orderedQuantity,
          unitPrice: l.unitPrice,
          notes: l.notes,
        })),
      });

      // Update inventory for each line if a location is selected
      if (selectedLocationId) {
        const inventoryUpdates = lines.map(async l => {
          try {
            await inventoryService.adjustInventory({
              itemId: l.itemId,
              locationId: selectedLocationId,
              quantityChange: l.orderedQuantity,
              reason: `Purchase order from supplier: ${supplierName || supplierId}`,
            });
            // Update unitCost if a price was specified
            if (l.unitPrice > 0) {
              const record = await inventoryService.getInventoryByItemAndLocation(l.itemId, selectedLocationId);
              if (record?.id) {
                await inventoryService.updateInventory(record.id, { unitCost: l.unitPrice });
              }
            }
          } catch (err) {
            console.warn(`Failed to update inventory for item ${l.itemName}:`, err);
          }
        });
        await Promise.all(inventoryUpdates);
        toast.success(`Purchase created & inventory updated (+${lines.reduce((s, l) => s + l.orderedQuantity, 0)} units across ${lines.length} item(s))`);
      } else {
        toast.success(t('purchase.orders.created'));
      }

      navigate('/purchase/orders');
    } catch {
      toast.error(t('purchase.orders.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchase/orders')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('purchaseForm.title')}</h1>
            <p className="text-gray-500 text-sm">{t('purchaseForm.subtitle')}</p>
          </div>
        </div>
        <Button icon={<Save size={16} />} onClick={handleSave} loading={saving} disabled={saving}>
          {t('purchaseForm.saveOrder')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.basicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('purchase.orders.supplier')} *</label>
                <div ref={supplierDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { if (!loadingSuppliers) { setSupplierDropdownOpen(o => !o); setSupplierSearch(''); } }}
                    disabled={loadingSuppliers}
                    className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingSuppliers ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={supplierId ? '' : 'text-gray-400'}>
                      {loadingSuppliers ? t('purchase.loading') : supplierId ? (suppliers.find(s => s.id === supplierId)?.name ?? t('purchaseForm.selectSupplier')) : t('purchaseForm.selectSupplier')}
                    </span>
                    <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${supplierDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {supplierDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input autoFocus type="text" value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)}
                            placeholder={t('purchase.search')} className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                        </div>
                      </div>
                      <ul className="max-h-52 overflow-y-auto py-1">
                        {suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase())).map(s => (
                          <li key={s.id} onClick={() => { setSupplierId(s.id); setSupplierName(s.name); setSupplierDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${supplierId === s.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                            {s.name}
                          </li>
                        ))}
                        {suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase())).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('purchase.noResults')}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('purchase.orders.expectedDelivery')}</label>
                <Input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quoteForm.warehouse')}</label>
                <div ref={warehouseDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { if (!loadingWarehouses) { setWarehouseDropdownOpen(o => !o); setWarehouseSearch(''); } }}
                    disabled={loadingWarehouses}
                    className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingWarehouses ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={inventoryId ? '' : 'text-gray-400'}>
                      {loadingWarehouses ? t('purchase.loading') : inventoryId ? (warehouses.find(w => w.id === inventoryId)?.name ?? t('quoteForm.selectWarehouse')) : t('quoteForm.selectWarehouse')}
                    </span>
                    <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${warehouseDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {warehouseDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input autoFocus type="text" value={warehouseSearch} onChange={e => setWarehouseSearch(e.target.value)}
                            placeholder={t('purchase.search')} className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                        </div>
                      </div>
                      <ul className="max-h-52 overflow-y-auto py-1">
                        {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase())).map(w => (
                          <li key={w.id} onClick={() => { setInventoryId(w.id); setWarehouseDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${inventoryId === w.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                            {w.name}
                          </li>
                        ))}
                        {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearch.toLowerCase())).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('purchase.noResults')}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.location')}</label>
                <div ref={locationDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => { if (!loadingLocations) { setLocationDropdownOpen(o => !o); setLocationSearch(''); } }}
                    disabled={loadingLocations}
                    className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loadingLocations ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className={selectedLocationId ? '' : 'text-gray-400'}>
                      {loadingLocations ? t('purchase.loading') : selectedLocationId ? (locations.find(l => l.id === selectedLocationId)?.code ?? t('common.selectLocation')) : t('common.selectLocation')}
                    </span>
                    <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {locationDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input autoFocus type="text" value={locationSearch} onChange={e => setLocationSearch(e.target.value)}
                            placeholder={t('purchase.search')} className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                        </div>
                      </div>
                      <ul className="max-h-52 overflow-y-auto py-1">
                        {locations.filter(l => l.code.toLowerCase().includes(locationSearch.toLowerCase())).map(loc => (
                          <li key={loc.id} onClick={() => { handleLocationChange(loc.id); setLocationDropdownOpen(false); }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${selectedLocationId === loc.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'}`}>
                            {loc.code}
                          </li>
                        ))}
                        {locations.filter(l => l.code.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-400 text-center">{t('purchase.noResults')}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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

          {/* ── Items at location card ── */}
          {selectedLocationId && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base font-semibold">
                  {t('purchase.itemsAtLocation')}: {locations.find(l => l.id === selectedLocationId)?.code || ''}
                </h2>
              </div>
              {loadingLocationInventory ? (
                <div className="flex justify-center py-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                </div>
              ) : locationInventory.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-2">No items at this location</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {locationInventory.map(inv => {
                        const isAdded = lines.some(l => l.itemId === inv.itemId);
                        const name = itemNamesMap.get(inv.itemId) || (inv as any).itemName || inv.item?.name || inv.itemId;
                        return (
                          <tr key={inv.id} className={isAdded ? 'bg-green-50' : ''}>
                            <td className="px-3 py-2 font-medium text-gray-800">{name}</td>
                            <td className="px-3 py-2 text-gray-600">{inv.quantityAvailable ?? inv.quantityOnHand}</td>
                            <td className="px-3 py-2 text-gray-400">{inv.uom || '—'}</td>
                            <td className="px-3 py-2">
                              {isAdded ? (
                                <span className="text-xs text-green-600 font-medium">Added</span>
                              ) : (
                                <button onClick={() => addFromLowStock(inv)} className="text-blue-600 hover:text-blue-800" title="Add to order">
                                  <Plus size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Order Lines card ── */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t('purchaseForm.orderLines')}</h2>
              <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={addEmptyLine}>
                {t('purchaseForm.addLine')}
              </Button>
            </div>
            {lines.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">{t('quoteForm.noLines')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: '130px' }} />
                    <col />
                    <col style={{ width: '95px' }} />
                    <col style={{ width: '115px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '36px' }} />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('purchase.table.category', 'Category')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('purchase.table.qty', 'Qty')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('purchase.table.unitPrice', 'Unit Price')}</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('purchase.table.total', 'Total')}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <select
                            value={line.categoryId}
                            onChange={e => updateLine(idx, 'categoryId', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">{t('common.all', 'All')}</option>
                            {categories.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 min-w-0">
                          <ItemSearchCombobox
                            items={allItems.map((it: any) => ({
                              ...it,
                              categoryName: categories.find((c: any) => c.id === it.categoryId)?.name,
                            }))}
                            value={line.itemId}
                            categoryFilter={line.categoryId || undefined}
                            onChange={item => {
                              setLines(prev => prev.map((l, i) => i !== idx ? l : {
                                ...l,
                                itemId: item?.id || '',
                                itemName: item?.name || '',
                                itemSku: item?.sku || '',
                                unitPrice: item?.unitCost || l.unitPrice,
                                totalPrice: l.orderedQuantity * (item?.unitCost || l.unitPrice),
                              }));
                            }}
                            placeholder="Search item…"
                          />
                          {line.currentStock !== undefined && (
                            <div className="text-xs text-orange-600 mt-1">
                              {t('purchaseForm.currentStock')}: {line.currentStock}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={line.orderedQuantity}
                            onChange={e => updateLine(idx, 'orderedQuantity', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2 font-semibold text-right whitespace-nowrap tabular-nums text-gray-800">
                          {line.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-center">
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
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Capacity Indicator */}
          {selectedLocationId && locationCapacity !== null && (
            <div className={`rounded-lg shadow p-4 border-2 ${capacityExceeded ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle size={15} className={capacityExceeded ? 'text-red-500' : 'text-gray-400'} />
                {t('purchase.capacity.title')}
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>{t('purchase.capacity.currentStock')}</span>
                  <span className="font-medium">{currentLocationQty}</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>{t('purchase.capacity.thisOrder')}</span>
                  <span className="font-medium">+{totalOrderedQty}</span>
                </div>
                <div className={`flex justify-between font-bold ${capacityExceeded ? 'text-red-600' : 'text-gray-800'}`}>
                  <span>{t('purchase.capacity.projectedTotal')}</span>
                  <span>{projectedQty} / {locationCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${capacityExceeded ? 'bg-red-500' : capacityPct > 80 ? 'bg-orange-400' : 'bg-green-500'}`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                {capacityExceeded && (
                  <p className="text-red-600 font-medium text-center pt-1">
                    Exceeds capacity by {projectedQty - locationCapacity} units!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{t('quoteForm.summary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('purchaseForm.totalLines')}</span>
                <span className="font-medium">{lines.length}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>{t('purchase.orders.totalAmount')}</span>
                <span className="text-blue-600">{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Suggestions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" />
                {t('purchaseForm.lowStockSuggestions')}
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{t('purchaseForm.threshold')}:</span>
                <Input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-16 text-xs py-1"
                />
              </div>
            </div>
            {loadingLowStock ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">{t('purchaseForm.noLowStockItems')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lowStockItems.map(inv => {
                  const isAdded = lines.some(l => l.itemId === inv.itemId);
                  return (
                    <div key={inv.id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${isAdded ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                      <div>
                        <div className="font-medium text-gray-800">{itemNamesMap.get(inv.itemId) || (inv as any).itemName || inv.item?.name || inv.itemId}</div>
                        <div className="text-orange-700">{t('purchaseForm.availQty')}: {inv.quantityAvailable}</div>
                      </div>
                      {isAdded ? (
                        <span className="text-green-600 font-medium">{t('quoteForm.added')}</span>
                      ) : (
                        <button
                          onClick={() => addFromLowStock(inv)}
                          className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                          title={t('purchaseForm.addToOrder')}
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Capacity Warning Modal ── */}
      {capacityWarningOpen && locationCapacity !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(7,5,17,0.72)', backdropFilter: 'blur(8px)' }}
          onClick={() => setCapacityWarningOpen(false)}
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 32px 80px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ height: 4, background: 'linear-gradient(90deg, #EF4444, #F97316, #EF4444)' }} />
            <div className="bg-white p-6">
              {/* header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)' }}>
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Capacity Limit Exceeded</h3>
                  <p className="text-sm text-gray-500 mt-0.5">This order cannot be saved as it exceeds the location's maximum capacity.</p>
                </div>
                <button
                  onClick={() => setCapacityWarningOpen(false)}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
                  <div className="flex justify-center mb-1"><Package size={14} className="text-gray-400" /></div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('purchase.capacity.currentStock')}</p>
                  <p className="text-2xl font-extrabold text-gray-800 tabular-nums">{currentLocationQty}</p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
                  <div className="flex justify-center mb-1"><TrendingUp size={14} className="text-blue-400" /></div>
                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">{t('purchase.capacity.thisOrder')}</p>
                  <p className="text-2xl font-extrabold text-blue-700 tabular-nums">+{totalOrderedQty}</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                  <div className="flex justify-center mb-1"><BarChart2 size={14} className="text-red-400" /></div>
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">{t('purchase.capacity.projectedTotal')}</p>
                  <p className="text-2xl font-extrabold text-red-600 tabular-nums">{projectedQty}</p>
                </div>
              </div>

              {/* progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Capacity usage</span>
                  <span className="font-semibold text-red-600">{Math.round((projectedQty / locationCapacity) * 100)}% of {locationCapacity} units limit</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (projectedQty / locationCapacity) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-red-600 font-semibold mt-2 text-center">
                  Exceeds limit by {projectedQty - locationCapacity} unit{projectedQty - locationCapacity !== 1 ? 's' : ''}
                </p>
              </div>

              {/* actions */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCapacityWarningOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Review Order
                </button>
                <button
                  onClick={async () => {
                    setCapacityWarningOpen(false);
                    await handleSave(true);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                >
                  Save Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderFormPage;
