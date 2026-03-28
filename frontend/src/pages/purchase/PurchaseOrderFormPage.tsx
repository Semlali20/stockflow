// src/pages/purchase/PurchaseOrderFormPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { purchaseService } from '@/services/purchase.service';
import { inventoryService } from '@/services/inventory.service';
import { locationService } from '@/services/location.service';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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

  const handleSave = async () => {
    if (!supplierId) { toast.error(t('purchaseForm.selectSupplier')); return; }
    if (lines.length === 0) { toast.error(t('quoteForm.addItems')); return; }
    if (lines.some(l => !l.itemId || !l.itemName)) {
      toast.error(t('purchaseForm.fillAllItems'));
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
        const inventoryUpdates = lines.map(l =>
          inventoryService.adjustInventory({
            itemId: l.itemId,
            locationId: selectedLocationId,
            quantityChange: l.orderedQuantity,
            reason: `Purchase order from supplier: ${supplierName || supplierId}`,
          }).catch(err => {
            console.warn(`Failed to update inventory for item ${l.itemName}:`, err);
          })
        );
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
                <Select
                  value={supplierId}
                  onChange={e => {
                    setSupplierId(e.target.value);
                    const s = suppliers.find(s => s.id === e.target.value);
                    setSupplierName(s?.name || '');
                  }}
                  className="w-full"
                  disabled={loadingSuppliers}
                >
                  <option value="">{t('purchaseForm.selectSupplier')}</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('purchase.orders.expectedDelivery')}</label>
                <Input type="date" value={expectedDeliveryDate} onChange={e => setExpectedDeliveryDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quoteForm.warehouse')}</label>
                <Select
                  value={inventoryId}
                  onChange={e => setInventoryId(e.target.value)}
                  className="w-full"
                  disabled={loadingWarehouses}
                >
                  <option value="">{t('quoteForm.selectWarehouse')}</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Select
                  value={selectedLocationId}
                  onChange={e => handleLocationChange(e.target.value)}
                  className="w-full"
                  disabled={loadingLocations}
                >
                  <option value="">Select a location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.code}</option>
                  ))}
                </Select>
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

          {/* Location Inventory */}
          {selectedLocationId && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                Items at {locations.find(l => l.id === selectedLocationId)?.code || 'selected location'}
              </h2>
              {loadingLocationInventory ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : locationInventory.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">No items at this location</p>
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
                                <button
                                  onClick={() => addFromLowStock(inv)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Add to order"
                                >
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

          {/* Order Lines */}
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
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.item')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseForm.orderedQty')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('quoteForm.unitPrice')}</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('purchaseForm.lineTotal')}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line, idx) => {
                      const filteredItems = line.categoryId
                        ? allItems.filter((it: any) => it.categoryId === line.categoryId)
                        : allItems;
                      return (
                      <tr key={idx}>
                        {/* Category */}
                        <td className="px-3 py-2 w-40">
                          <select
                            value={line.categoryId}
                            onChange={e => updateLine(idx, 'categoryId', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All</option>
                            {categories.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </td>
                        {/* Item */}
                        <td className="px-3 py-2">
                          <select
                            value={line.itemId}
                            onChange={e => {
                              const item = allItems.find((it: any) => it.id === e.target.value) as any;
                              setLines(prev => prev.map((l, i) => i !== idx ? l : {
                                ...l,
                                itemId: item?.id || '',
                                itemName: item?.name || '',
                                itemSku: item?.sku || '',
                                unitPrice: item?.unitCost || l.unitPrice,
                                totalPrice: l.orderedQuantity * (item?.unitCost || l.unitPrice),
                              }));
                            }}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select item</option>
                            {filteredItems.map((it: any) => (
                              <option key={it.id} value={it.id}>{it.name}</option>
                            ))}
                          </select>
                          {line.currentStock !== undefined && (
                            <div className="text-xs text-orange-600 mt-1">
                              {t('purchaseForm.currentStock')}: {line.currentStock}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 w-24">
                          <Input
                            type="number"
                            min="1"
                            value={line.orderedQuantity}
                            onChange={e => updateLine(idx, 'orderedQuantity', Number(e.target.value))}
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
                        <td className="px-3 py-2 font-medium text-right">{line.totalPrice.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => removeLine(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1 space-y-6">
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
    </div>
  );
};

export default PurchaseOrderFormPage;
